import crypto from "crypto";
import bcrypt from "bcrypt";
import {User} from "../model/User.js";
import {createTransporter} from "./auth.js";

export async function forgetPassword(req, res) {
    const {email} = req.body;
    try {
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({success: false, message: "User not found with this email."});
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.verificationToken = resetToken;
        await user.save();

        const transporter = await createTransporter();
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Password Reset",
            text: `Please reset your password by clicking the following link: 
            http://${req.headers.host}/reset-password?token=${resetToken}`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({success: true, message: "Password reset email sent"});
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({success: false, message: "Internal Server Error"});
    }
}

export async function resetPassword(req, res) {
    const {newPassword} = req.body;
    const {token} = req.query;
    const saltRounds = 10;

    try {
        const user = await User.findOne({verificationToken: token});
        if (!user) {
            return res.status(400).json({success: false, message: "Invalid or expired token."});
        }

        user.password = await bcrypt.hash(newPassword, saltRounds);
        user.verificationToken = undefined;
        await user.save();

        return res.status(200).json({success: true, message: "Password reset successfully"});
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({success: false, message: "Internal Server Error"});
    }
}
