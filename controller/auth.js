import bcrypt from "bcrypt";
import { User } from "../model/user.js";
import crypto from "crypto";
import path from "path";
import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";
import Joi from "joi";

const schemaSignin = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().max(20).required(),
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
  email: Joi.string().email(),
  password: Joi.string().max(20).required(),
});

/**
 * Function to find a user in the database by username.
 *
 * @param {string} username - username of the user
 * @return {Promise<User|null>} A promise that resolves to the user document if found, or null if not found.
 */
export async function findByUsername(username) {
  return await User.findOne({ username });
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
export async function register(req, res) {
  const saltRounds = 10;
  const { username, firstName, lastName, email, birthday, password } = req.body;

  const validationResult = schemaSignin.validate({
    username,
    firstName,
    lastName,
    email,
    birthday,
    password,
  });

  if (validationResult.error) {
    return res.status(400).render("validationError", {
      error: validationResult.error.details[0].message,
      link: "signup",
      linkImage: "images/validation-error.jpg",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).render("validationError", {
        error: "User already exists with this email.",
        link: "signup",
        linkImage: "validation-error.jpg",
      });
    }

    bcrypt
      .hash(password, saltRounds)
      .then((hashedPassword) => {
        req.session.userData = {
          username,
          firstName,
          lastName,
          email,
          password: hashedPassword,
          birthday,
        };
        res.redirect("/additional-info");
      })
      .catch((error) => {
        console.error("Error hashing password:", error);
        res.status(500).send("Internal Server Error");
      });
  } catch (error) {
    console.error(error, "error");
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Function to add additional user information.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function AdditionalUserInfo(req, res) {

  const { weight, height, time, goal, fitnessLevel } = req.body;

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
    username,
    firstName,
    lastName,
    email,
    birthday,
    password: hashedPassword,
  } = req.session.userData;

  req.session.userData = {
    ...req.session.userData,
    weight,
    height,
    time,
    goal,
    fitnessLevel,
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

  try {
    await newUser.save();
    res.redirect("/process");
  } catch (error) {
    console.error("Error saving new user:", error);
    res.status(500).send("Internal Server Error");
  }
}
