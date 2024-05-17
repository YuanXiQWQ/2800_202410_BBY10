import bcrypt from 'bcrypt';
import { User } from '../model/user.js';
import crypto from 'crypto';
import path from 'path';
import { GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';
import { findByUsername, validatePassword } from './auth.js';

/**
 * Function to change the user's password.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function changePassword(req, res) {
    const { oldPassword, newPassword } = req.body;

    try {
        const user = await findByUsername(req.session.userData.username);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await validatePassword(user, oldPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Old password is incorrect' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
}

/**
 * Function to update the user's avatar and username.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function postUserAvatar(req, res) {
    try {
        const { username } = req.body;
        const avatar = req.file;
        const user = await findByUsername(req.session.userData.username);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (username) {
            const lastUpdated = new Date(req.session.userData.usernameLastUpdated || 0);
            const now = new Date();
            const thirtyDays = 30 * 24 * 60 * 60 * 1000;

            if (now - lastUpdated < thirtyDays) {
                return res.status(404).json({ success: false, message: 'Username can only be changed once every 30 days.' });
            }

            user.username = username;
            user.usernameLastUpdated = now;
            req.session.userData.username = username;
            req.session.userData.usernameLastUpdated = now;
        }

        if (avatar) {
            const buffer = avatar.buffer;
            const filename = crypto.randomBytes(16).toString('hex') + path.extname(avatar.originalname);
            const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
            const uploadStream = bucket.openUploadStream(filename);
            uploadStream.end(buffer);

            uploadStream.on('finish', async () => {
                user.avatar = filename;
                await user.save();
                req.session.userData.avatar = user.avatar;
                res.status(200).json({ success: true, message: 'Updated successfully' });
            });

            uploadStream.on('error', (error) => {
                console.error('Error uploading file:', error);
                res.status(500).send('Internal Server Error');
            });
        } else {
            await user.save();
            res.status(200).json({ success: true, message: 'Updated successfully' });
        }
    } catch (error) {
        console.error('Error updating user avatar:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

/**
 * Function to update the user's personal information.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function postPersonalInformation(req, res) {
    const { firstName, lastName, email, birthday, height, weight } = req.body;

    try {
        const user = await findByUsername(req.session.userData.username);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if email already exists
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ success: false, message: 'Email already exists' });
            }
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

        res.status(200).json({ success: true, message: 'Personal information updated successfully' });
    } catch (error) {
        console.error('Error saving personal information:', error);
        res.status(500).json({ success: false, message: 'Server error', error });
    }
}

/**
 * Function to update the user's workout settings.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function updateWorkoutSettings(req, res) {
    const { goal, fitnessLevel, time } = req.body;

    try {
        const user = await findByUsername(req.session.userData.username);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.goal = goal || user.goal;
        user.fitnessLevel = fitnessLevel || user.fitnessLevel;
        user.time = time || user.time;

        await user.save();

        req.session.userData = {
            ...req.session.userData,
            goal: user.goal,
            fitnessLevel: user.fitnessLevel,
            time: user.time
        };

        res.status(200).json({ success: true, message: 'Workout settings updated successfully' });
    } catch (error) {
        console.error('Error saving workout settings:', error);
        res.status(500).json({ success: false, message: 'Server error', error });
    }
}
