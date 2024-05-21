import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import schedule from 'node-schedule';
import crypto from "node:crypto";
import {google} from "googleapis";
import dotenv from "dotenv";
import {User} from "../model/User.js";
import Joi from "joi";

dotenv.config();

const OAuth2 = google.auth.OAuth2;

const schemaSignin = Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(5).max(25).required(),
    firstName: Joi.string().alphanum().min(3).max(30).required(),
    lastName: Joi.string().alphanum().min(3).max(30).required(),
    birthday: Joi.date().iso().max("now").required(),
});

const schemaInfo = Joi.object({
    weight: Joi.number().positive().required(),
    height: Joi.number().positive().required(),
    time: Joi.number().valid(0, 1, 2, 3, 4, 5, 6).required(),
    goal: Joi.string().min(3).max(200).required(),
    fitnessLevel: Joi.string().valid("beginner", "intermediate", "advanced").required(),
});

const schemaLogin = Joi.object({
    email: Joi.string().email(),
    password: Joi.string().max(20).required(),
});

/**
 * Schedule a job to delete unverified users older than 24 hours.
 */
schedule.scheduleJob('0 0 * * *', async () => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    try {
        const unverifiedUsers = await User.find({
            isVerified: false,
            createdAt: { $lt: twentyFourHoursAgo }
        });

        const usernames = unverifiedUsers.map(user => user.username);
        const deleteResult = await User.deleteMany({
            isVerified: false,
            createdAt: { $lt: twentyFourHoursAgo }
        });

        console.log(`Unverified users cleanup completed. Deleted ${deleteResult.deletedCount} users.`);
        console.log(`Deleted usernames: ${usernames.join(', ')}`);
    } catch (error) {
        console.error("Error during unverified users cleanup:", error);
    }
});

export const createTransporter = async () => {
    const oauth2Client = new OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN,
    });

    const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
            if (err) {
                reject(err);
            }
            resolve(token);
        });
    });

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: process.env.EMAIL,
            accessToken,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
        },
    });
};

/**
 * Function to find a user in the database by username.
 *
 * @param {string} username - username of the user
 * @return {Promise<User|null>} A promise that resolves to the user document if found, or null if not found.
 */
export const findByUsername = (username) => User.findOne({username});

/**
 * Middleware to ensure the user is authenticated.
 * Redirects to login page if user is not authenticated.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export function ensureAuthenticated(req, res, next) {
    if (!req.session.userData) {
        return res.redirect("/login");
    }
    next();
}

/**
 * Function to validate the user's password.
 *
 * @param {User} user - user document
 * @param {string} password - password to validate
 * @return {Promise<boolean>} A promise that resolves to true if the password is correct, or false if not.
 */
export const validatePassword = (user, password) => bcrypt.compare(password, user.password);

/**
 * Function to register a new user.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @return {Promise<void>} A promise that resolves when the registration is complete.
 */
export async function register(req, res) {
    const saltRounds = 10;
    const {username, firstName, lastName, email, birthday, password} = req.body;

    const validationResult = schemaSignin.validate({
        username,
        firstName,
        lastName,
        email,
        birthday,
        password,
    });

    if (validationResult.error) {
        return res.status(400).json({
            success: false,
            message: validationResult.error.details[0].message,
        });
    }

    try {
        const existingUser = await User.findOne({email});

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this email.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const newUser = new User({
            username,
            firstName,
            lastName,
            email,
            birthday,
            password: hashedPassword,
            verificationToken,
            isVerified: false,
        });

        await newUser.save();

        const transporter = await createTransporter();
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Email Verification",
            text: `Please verify your email by clicking the following link: 
            http://${req.headers.host}/verify-email?token=${verificationToken}`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({success: true, message: "Verification email sent"});
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({success: false, message: "Internal Server Error"});
    }
}

/**
 * Function to add additional user information.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @return {Promise<void>} A promise that resolves when the additional information is successfully saved.
 */
export function AdditionalUserInfo(req, res) {
    return new Promise(async (resolve, reject) => {
        if (!req.session.userData) return res.redirect("/login");

        const {weight, height, time, goal, fitnessLevel} = req.body;
        const validationResult2 = schemaInfo.validate({
            weight,
            height,
            time,
            goal,
            fitnessLevel,
        });

        if (validationResult2.error) {
            return res.status(400).render("validationError", {
                error: validationResult2.error.details[0].message,
                link: "additional-info",
                linkImage: "images/validation-error.jpg",
            });
        }

        const {
            username,
            firstName,
            lastName,
            email,
            birthday,
            password: hashedPassword,
        } = req.session.userData;

        try {
            const user = await User.findOne({username});
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found.",
                });
            }

            user.weight = weight;
            user.height = height;
            user.time = time;
            user.goal = goal;
            user.fitnessLevel = fitnessLevel;

            await user.save();
            req.session.userData = user;
            res.redirect("/process");
            resolve();
        } catch (error) {
            console.error("Error saving additional info:", error);
            req.session.destroy();
            res.status(500).send("Internal Server Error");
            reject(error);
        }
    });
}
