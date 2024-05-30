import mongoose from "mongoose";
import dotenv from "dotenv";
import {User} from "./User.js";

dotenv.config();

const exerciseSchema = new mongoose.Schema(
    {
        user: {type: mongoose.Schema.Types.ObjectId, ref: User, required: true},
        exercises: {type: mongoose.Schema.Types.Mixed, required: true}
    },
    {
        timestamps: true,
        collection: "exercises",
        collation: {locale: "en", strength: 2},
    }
);

export const exercises = mongoose.model("exercises", exerciseSchema);
