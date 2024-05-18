import bcrypt from "bcrypt";
import {User} from "../model/user.js";
import Joi from "joi";

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

    time: Joi.number()
        .valid(0, 1, 2, 3, 4, 5, 6) // Enumerating valid options for 'time'
        .required(),

    goal: Joi.string()
        .min(3) // Minimum length of the goal text
        .max(200) // Maximum length
        .required(),

    fitnessLevel: Joi.string()
        .valid("beginner", "intermediate", "advanced") // Enumerating valid options for 'fitnessLevel'
        .required(),
});

const schemaLogin = Joi.object({
    email: Joi.string().email(), password: Joi.string().max(20).required(),
});

/**
 * Function to find a user in the database by username.
 *
 * @param {string} username - username of the user
 * @return {Promise<User|null>} A promise that resolves to the user document if found, or null if not found.
 */
export const findByUsername = (username) => User.findOne({ username });

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
export function register(req, res) {
    return new Promise((resolve, reject) => {
        const saltRounds = 10;
        const {username, firstName, lastName, email, birthday, password} = req.body;

        const validationResult = schemaSignin.validate({
            username, firstName, lastName, email, birthday, password,
        });

        if (validationResult.error) {
            return res.status(400).render("validationError", {
                error: validationResult.error.details[0].message, link: "signup", linkImage: "images/validation-error.jpg",
            });
        }

        User.findOne({email}).then(existingUser => {
            if (existingUser) {
                return res.status(409).render("validationError", {
                    error: "User already exists with this email.", link: "signup", linkImage: "validation-error.jpg",
                });
            }

            bcrypt.hash(password, saltRounds).then(hashedPassword => {
                req.session.userData = {
                    username, firstName, lastName, email, password: hashedPassword, birthday,
                };
                res.redirect("/additional-info");
                resolve();
            }).catch(error => {
                console.error("Error hashing password:", error);
                res.status(500).send("Internal Server Error");
                reject(error);
            });

        }).catch(error => {
            console.error("Error:", error);
            res.status(500).send("Internal Server Error");
            reject(error);
        });
    });
}

/**
 * Function to add additional user information.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @return {Promise<void>} A promise that resolves when the additional information is successfully saved.
 */
export function AdditionalUserInfo(req, res) {
    return new Promise((resolve, reject) => {
        if (!req.session.userData) return res.redirect("/login");

        const {weight, height, time, goal, fitnessLevel} = req.body;
        const validationResult2 = schemaInfo.validate({
            weight, height, time, goal, fitnessLevel
        });

        if (validationResult2.error) {
            return res.status(400).render("validationError", {
                error: validationResult2.error.details[0].message,
                link: "additional-info",
                linkImage: "images/validation-error.jpg",
            });
        }

        const {
            username, firstName, lastName, email, birthday, password: hashedPassword,
        } = req.session.userData;

        req.session.userData = {
            ...req.session.userData, weight, height, time, goal, fitnessLevel,
        };

        const newUser = new User({
            username,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            birthday,
            weight,
            height,
            fitnessLevel,
            time,
            goal,
        });

        newUser.save().then(() => {
            res.redirect("/process");
            resolve();
        }).catch(error => {
            console.error("Error saving new user:", error);
            req.session.destroy();
            res.status(500).send("Internal Server Error");
            reject(error);
        });
    });
}
