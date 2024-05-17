import bcrypt from 'bcrypt';
import {User} from '../model/user.js';
import crypto from "crypto";
import path from "path";
import {GridFSBucket} from "mongodb";
import mongoose from "mongoose";

/**
 * Function to find a user in the database by username.
 *
 * @param {string} username - username of the user
 * @return {Promise<User|null>} A promise that resolves to the user document if found, or null if not found.
 */
export async function findByUsername(username) {
    return await User.findOne({username});
}

/**
 * Function to validate the user's password.
 *
 * @param {User} user - user document
 * @param {string} password - password to validate
 * @return {Promise<boolean>} A promise that resolves to true if the password is correct, or false if not.
 */
export async function validatePassword(user, password) {
    return await bcrypt.compare(password, user.password);
}

/**
 * Function to register a new user.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export function register(req, res) {
    const saltRounds = 10;

    const {username, firstName, lastName, email, birthday, password} = req.body;
    bcrypt.hash(password, saltRounds)
        .then(hashedPassword => {
            req.session.userData = {
                username,
                firstName,
                lastName,
                email,
                password: hashedPassword,
                birthday
            };
            res.redirect('/additional-info');
        })
        .catch(error => {
            console.error('Error hashing password:', error);
            res.status(500).send('Internal Server Error');
        });
}

/**
 * Function to add additional user information.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function AdditionalUserInfo(req, res) {
    const {weight, height, time, goal, fitnessLevel} = req.body;
    const {username, firstName, lastName, email, birthday, password: hashedPassword} = req.session.userData;

    req.session.userData = {
        ...req.session.userData,
        weight,
        height,
        time,
        goal,
        fitnessLevel
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
        goal
    });

  //console.log(newUser);

    try {
        await newUser.save();
        res.redirect("/profile");
    } catch (error) {
        console.error('Error saving new user:', error);
        res.status(500).send('Internal Server Error');
    }
}
