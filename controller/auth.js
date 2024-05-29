import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import schedule from "node-schedule";
import crypto from "node:crypto";
import {google} from "googleapis";
import dotenv from "dotenv";
import {User} from "../model/User.js";
import Joi from "joi";
import fs from 'fs';

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
    weight: Joi.number().positive().required(), height: Joi.number().positive().required(), time: Joi.array()
        .items(Joi.number().valid(0, 1, 2, 3, 4, 5, 6).required())
        .unique()
        .min(1)
        .required(), goal: Joi.string().min(3).max(200).required(), fitnessLevel: Joi.string()
        .valid("beginner", "intermediate", "advanced")
        .required(),
});

const schemaLogin = Joi.object({
    email: Joi.string().email(), password: Joi.string().max(20).required(),
});

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])[A-Za-z0-9@#*_]{5,25}$/;
const passwordInvalidMessage = "Password must be 5-25 characters long, including at least 1 letter and 1 number. Only @#*_ are allowed as special characters.";

/**
 * Schedule a job to delete unverified users older than 24 hours.
 */
schedule.scheduleJob("0 0 * * *", async () => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    try {
        const unverifiedUsers = await User.find({
            isVerified: false, createdAt: {$lt: twentyFourHoursAgo},
        });

        const usernames = unverifiedUsers.map((user) => user.username);
        const deleteResult = await User.deleteMany({
            isVerified: false, createdAt: {$lt: twentyFourHoursAgo},
        });

        console.log(`Unverified users cleanup completed. Deleted ${deleteResult.deletedCount} users.`);
        console.log(`Deleted usernames: ${usernames.join(", ")}`);
    } catch (error) {
        console.error("Error during unverified users cleanup:", error);
    }
});

const appUrl = process.env.NODE_ENV === "development" ? process.env.APP_URL_LOCAL : process.env.APP_URL_PRODUCTION;

const oauth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.CLIENT_URL);

oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
});

/**
 * Function to refresh the access token.
 *
 * @return {Promise<string>} The refreshed access token.
 */
const getAccessToken = async () => {
    try {
        const {token, res} = await oauth2Client.getAccessToken();

        if (res.data.refresh_token) {
            process.env.REFRESH_TOKEN = res.data.refresh_token;
            fs.writeFileSync('.env', `\nREFRESH_TOKEN=${res.data.refresh_token}`, {flag: 'a'});
        }

        return token;
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.error('Refresh token is invalid or has expired, please reauthorize the application.');
        } else {
            console.error('An error occurred while refreshing the access token:', error);
        }
    }
};

/**
 * Function to create a nodemailer transporter.
 *
 * @return {Promise<Mail>} The nodemailer transporter.
 */
export const createTransporter = async () => {
    const accessToken = await getAccessToken();

    return nodemailer.createTransport({
        service: "gmail", auth: {
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

export const findByEmail = (email) => User.findOne({email});

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
 * Validates the user data, hashes the password, and sends a verification email.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @return {Promise<void>} A promise that resolves when the registration is complete.
 */
export async function register(req, res) {
    const saltRounds = 10;
    const {username, firstName, lastName, email, birthday, password} = req.body;

    const validationResult = schemaSignin.validate({
        username, firstName, lastName, email, birthday, password,
    });

    if (validationResult.error) {
        return res.status(400).json({
            success: false, message: validationResult.error.details[0].message,
        });
    }

    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            success: false, message: passwordInvalidMessage,
        });
    }

    try {
        const existingUser = await User.findOne({email});

        if (existingUser) {
            return res.status(409).json({
                success: false, message: "User already exists with this email.",
            });
        }

        const existingUsername = await User.findOne({username});
        if (existingUsername) {
            return res.status(409).json({
                success: false, message: "User already exists with this username.",
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
            from: process.env.EMAIL, to: email, subject: "Email Verification", text: `Please verify your email by clicking the following link: 
            ${appUrl}/verify-email?token=${verificationToken}`,
        };

        await transporter.sendMail(mailOptions);

        return res
            .status(200)
            .json({success: true, message: "Verification email sent"});
    } catch (error) {
        console.error("Error:", error);
        return res
            .status(500)
            .json({success: false, message: "Internal Server Error"});
    }
}

/**
 * Function to add additional user information.
 * Updates the user's weight, height, time, goal, and fitness level.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @return {Promise<void>} A promise that resolves when the additional information is successfully saved.
 */
export function AdditionalUserInfo(req, res) {
    return new Promise(async (resolve, reject) => {
        if (!req.session.userData) return res.redirect("/login");

        const {weight, height, time, goal, fitnessLevel} = req.body;
        const arrayTime = time.split(",").map(Number);
        console.log(arrayTime);
        const validationResult2 = schemaInfo.validate({
            weight, height, time: arrayTime, goal, fitnessLevel: fitnessLevel.toLowerCase(),
        });

        if (validationResult2.error) {
            console.log(validationResult2.error);

            return res.status(400).render("validationError", {
                error: validationResult2.error.details[0].message,
                link: "additional-info",
                linkImage: "images/validation-error.jpg",
            });
        }

        const {
            username, firstName, lastName, email, birthday, password: hashedPassword,
        } = req.session.userData;

        try {
            console.log("333333333");

            const user = await User.findOne({username});
            if (!user) {
                console.log("444444444444");

                return res.status(404).json({
                    success: false, message: "User not found.",
                });
            }

            user.weight = weight;
            user.height = height;
            user.time = arrayTime;
            user.goal = goal;
            user.fitnessLevel = fitnessLevel;
            console.log("555555555555");

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
