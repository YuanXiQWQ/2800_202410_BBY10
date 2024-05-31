import bcrypt from 'bcrypt';
import {User} from '../model/User.js';
import crypto from 'crypto';
import path from 'path';
import {GridFSBucket} from 'mongodb';
import mongoose from 'mongoose';
import {findByUsername, validatePassword} from './auth.js';
import fs from "fs";

/**
 * Function to change the user's password.
 * Validates the old password and updates to the new password.
 *
 * @param {Request} req - Express request object containing the old and new passwords in the body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} A promise that resolves when the password is changed
 */
export async function changePassword(req, res) {
    const {oldPassword, newPassword} = req.body;

    try {
        const user = await findByUsername(req.session.userData.username);
        if (!user) {
            return res.status(404).json({success: false, message: res.locals.language.userNotFound});
        }

        const isMatch = await validatePassword(user, oldPassword);
        if (!isMatch) {
            return res.status(400).json({success: false, message: res.locals.language.oldPasswordIncorrect});
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({success: true, message: res.locals.language.passwordChangeSuccess});
    } catch (error) {
        res.status(500).json({success: false, message: res.locals.language.serverError, error});
    }
}

/**
 * Function to update the user's avatar and username.
 * Uploads the new avatar to the server and updates the username.
 *
 * @param {Request} req - Express request object containing the new username and avatar file in the body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} A promise that resolves when the avatar and username are updated
 */
export async function postUserAvatar(req, res) {
    try {
        const {username} = req.body;
        const avatar = req.file;
        const user = await findByUsername(req.session.userData.username);

        if (!user) {
            return res.status(404).json({success: false, message: res.locals.language.userNotFound});
        }

        if (username) {
            const lastUpdated = new Date(req.session.userData.usernameLastUpdated || 0);
            const now = new Date();
            const thirtyDays = 30 * 24 * 60 * 60 * 1000;

            if (now - lastUpdated < thirtyDays) {
                return res.status(404).json({
                    success: false, message: res.locals.language.usernameChangeLimit,
                });
            }

            user.username = username;
            user.usernameLastUpdated = now;
            req.session.userData.username = username;
            req.session.userData.usernameLastUpdated = now;
        }

        if (avatar) {
            const buffer = avatar.buffer;
            const filename = crypto.randomBytes(16).toString('hex') + path.extname(avatar.originalname);
            const bucket = new GridFSBucket(mongoose.connection.db, {bucketName: 'uploads'});
            const uploadStream = bucket.openUploadStream(filename);
            uploadStream.end(buffer);

            uploadStream.on('finish', async () => {
                user.avatar = filename;
                await user.save();
                req.session.userData.avatar = user.avatar;
                res.status(200).json({success: true, message: res.locals.language.updateSuccess});
            });

            uploadStream.on('error', (error) => {
                console.error('Error uploading file:', error);
                res.status(500).send(res.locals.language.internalServerError);
            });
        } else {
            await user.save();
            res.status(200).json({success: true, message: res.locals.language.updateSuccess});
        }
    } catch (error) {
        console.error('Error updating user avatar:', error);
        return res.status(500).json({success: false, message: res.locals.language.internalServerError});
    }
}

/**
 * Function to update the user's personal information.
 * Updates the user's first name, last name, email, birthday, height, and weight.
 *
 * @param {Request} req - Express request object containing the user's personal information in the body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} A promise that resolves when the personal information is updated
 */
export async function postPersonalInformation(req, res) {
    const {firstName, lastName, email, birthday, height, weight} = req.body;

    try {
        const user = await findByUsername(req.session.userData.username);
        if (!user) {
            return res.status(404).json({success: false, message: res.locals.language.userNotFound});
        }

        // Check if email already exists
        if (email && email !== user.email) {
            const emailExists = await User.findOne({email});
            if (emailExists) {
                return res.status(400).json({success: false, message: res.locals.language.emailExists});
            }
        }

        /* Keep "==" and don't change to "===" because somehow it is not a number, and I'm afraid that if
        some time it changes to number for some reason, so just keep that. */
        if (height == 0) {
            return res.status(400).json({success: false, message: res.locals.language.heightDisappearing});
        } else if (height < 0) {
            return res.status(400).json({success: false, message: res.locals.language.heightNegative});
        }

        if (weight == 0) {
            return res.status(400).json({success: false, message: res.locals.language.weightDisappearing});
        } else if (weight < 0) {
            return res.status(400).json({success: false, message: res.locals.language.weightNegative});
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.birthday = birthday || user.birthday;
        user.height = height || user.height;
        user.weight = weight || user.weight;

        await user.save();

        req.session.userData = {
            ...req.session.userData,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            birthday: user.birthday,
            height: user.height,
            weight: user.weight
        };

        res.status(200).json({success: true, message: res.locals.language.personalInfoUpdateSuccess});
    } catch (error) {
        console.error('Error saving personal information:', error);
        res.status(500).json({success: false, message: res.locals.language.serverError, error});
    }
}

/**
 * Function to update the user's workout settings.
 * Updates the user's goal, fitness level, and workout days.
 *
 * @param {Request} req - Express request object containing the user's workout settings in the body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} A promise that resolves when the workout settings are updated
 */
export async function updateWorkoutSettings(req, res) {
    const {goal, fitnessLevel, time} = req.body;

    try {
        const user = await findByUsername(req.session.userData.username);
        if (!user) {
            return res.status(404).json({success: false, message: res.locals.language.userNotFound});
        }

        user.goal = goal || user.goal;
        user.fitnessLevel = fitnessLevel || user.fitnessLevel;
        user.workoutDays = time || user.workoutDays;

        await user.save();

        req.session.userData = {
            ...req.session.userData, goal: user.goal, fitnessLevel: user.fitnessLevel, workoutDays: user.workoutDays
        };

        res.status(200).json({success: true, message: res.locals.language.workoutSettingsUpdateSuccess});
    } catch (error) {
        console.error('Error saving workout settings:', error);
        res.status(500).json({success: false, message: res.locals.language.serverError, error});
    }
}

/**
 * Function to delete the user's account.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} A promise that resolves when the account is deleted
 */
export async function deleteAccount(req, res) {
    try {
        const user = await findByUsername(req.session.userData.username);
        if (!user) {
            return res.status(404).json({success: false, message: res.locals.language.userNotFound});
        }

        req.session.destroy(async err => {
            if (err) {
                return res.status(500).json({success: false, message: res.locals.language.deleteAccountFailed});
            }
            await User.deleteOne({_id: user?._id});

            res.status(200).json({success: true, message: res.locals.language.accountDeletedSuccess});
        });

    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({success: false, message: res.locals.language.internalServerError});
    }
}

/**
 * Function to change the user's language.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @returns {Promise<void>} A promise that resolves when the language is changed
 */
export const changeLanguage = (req, res) => {
    return new Promise((resolve, reject) => {
        const { language } = req.session;

        const languageFilePath = path.join(process.cwd(), 'public', 'languages', `${language}.json`);
        fs.readFile(languageFilePath, 'utf-8', (err, data) => {
            if (err) {
                console.error(`Could not read language file: ${err.message}`);
                reject({ success: false, message: res.locals.language.languageChangeFailed });
            } else {
                req.session.userData.preferredLanguage = language;
                res.locals.language = JSON.parse(data);
                resolve({ success: true, message: res.locals.language.languageChangeSuccess });
            }
        });
    });
};
