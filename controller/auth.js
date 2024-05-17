import bcrypt from "bcrypt";
import { User } from "../model/user.js";

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
export function register(req, res) {
  const saltRounds = 10;

  const { username, firstName, lastName, email, birthday, password } = req.body;
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
}

/**
 * Function to add additional user information.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function AdditionalUserInfo(req, res) {
  const { weight, height, time, goal, fitnessLevel } = req.body;
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
    res.redirect("/profile");
  } catch (error) {
    console.error("Error saving new user:", error);
    res.status(500).send("Internal Server Error");
  }
}

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
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await validatePassword(user, oldPassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Old password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
}

/**
 * Function to log in a user.
 */
export function login() {
  // TODO
}

/**
 * Function to update the user's personal information.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function postPersonalInformation(req, res) {
  const { name, email, birthday, height, weight } = req.body;

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.name = name;
    user.email = email;
    user.birthday = birthday;
    user.height = height;
    user.weight = weight;

    await user.save();

    req.session.userData = {
      ...req.session.userData,
      name,
      email,
      birthday,
      height,
      weight,
    };

    res
      .status(200)
      .json({
        success: true,
        message: "Personal information updated successfully",
      });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
}
