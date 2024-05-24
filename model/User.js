import mongoose from "mongoose";
import encrypt from "mongoose-encryption";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        firstName: {
            type: String,
            required: false,
        },
        lastName: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        verificationToken: {
            type: String,
            required: false,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        resetPasswordToken: {
            type: String,
            required: false,
        },
        resetPasswordExpires: {
            type: Date,
            required: false,
        },
        height: {
            type: Number,
            required: false,
        },
        weight: {
            type: Number,
            required: false,
        },
        goal: {
            type: String,
            required: false,
        },
        time: {
            type: [Number],
            required: false,
            enum: [0, 1, 2, 3, 4, 5, 6],
        },
        birthday: {
            type: Date,
            required: true,
        },
        fitnessLevel: {
            type: String,
            required: false,
            enum: ["Beginner", "Intermediate", "Advanced"],
        },
        avatar: {
            type: String,
            required: false,
        },
        usernameLastUpdated: {
            type: Date,
            required: false,
        },
    },
    {
        timestamps: true,
        collection: "users",
        collation: {locale: "en", strength: 2},
    }
);

userSchema.plugin(encrypt, {
    encryptionKey: process.env.SOME_32BYTE_BASE64_STRING,
    signingKey: process.env.SOME_64BYTE_BASE64_STRING,
    excludeFromEncryption: ["verificationToken", "resetPasswordToken", "resetPasswordExpires"]
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export {User};
