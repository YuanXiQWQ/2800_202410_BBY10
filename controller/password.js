import crypto from "crypto";
import bcrypt from "bcrypt";
import {User} from "../model/User.js";
import {createTransporter} from "./auth.js";

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])[A-Za-z0-9@#*_]{5,25}$/;

/**
 * Function to handle forget password request.
 * Generates a reset token, saves it to the user, and sends an email with the reset link.
 *
 * @param {Request} req - Express request object containing the email in the body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} A promise that resolves when the password reset email is sent
 */
export async function forgetPassword(req, res) {
    const {email} = req.body;
    try {
        const user = await User.findOne({email});
        if (!user) return res.status(400).json({success: false, message: res.locals.language.userNotFoundWithEmail});

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.verificationToken = resetToken;
        const appUrl = process.env.NODE_ENV === 'development' ? process.env.APP_URL_LOCAL : process.env.APP_URL_PRODUCTION;
        const resetLink = `${appUrl}/reset-password?token=${resetToken}`;
        await user.save();

        const transporter = await createTransporter();
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: res.locals.language.passwordResetSubject,
            html: `<p>${res.locals.language.resetPasswordText}:</p>
                   <p><a href="${resetLink}">${resetLink}</a></p>`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({success: true, message: res.locals.language.passwordResetEmailSent});
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({success: false, message: res.locals.language.internalServerError});
    }
}

/**
 * Function to handle password reset.
 * Validates the reset token and updates the user's password.
 *
 * @param {Request} req - Express request object containing the new password in the body and token in the query
 * @param {Response} res - Express response object
 * @returns {Promise<void>} A promise that resolves when the password is reset
 */
export async function resetPassword(req, res) {
    const {newPassword} = req.body;
    const {token} = req.query;

    if (!newPassword || !passwordRegex.test(newPassword)) {
        return res.status(400).json({
            success: false,
            message: res.locals.language.passwordInvalidMessage,
        });
    }

    try {
        const user = await User.findOne({verificationToken: token});
        if (!user) return res.status(400).json({success: false, message: res.locals.language.invalidToken});

        user.password = await bcrypt.hash(newPassword, 10);
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({success: true, message: res.locals.language.passwordResetSuccess});
    } catch (error) {
        res.status(500).json({success: false, message: res.locals.language.serverError, error});
    }
}
