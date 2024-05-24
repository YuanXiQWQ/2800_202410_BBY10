import mongoose from "mongoose";
import encrypt from "mongoose-encryption";
import dotenv from "dotenv";
import { User } from "./User.js";

dotenv.config();

const exerciseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
    exercises: {type: mongoose.Schema.Types.Mixed, required: true}
  },
  {
    timestamps: true,
    collection: "exercises",
    collation: { locale: "en", strength: 2 },
  }
);

// exerciseSchema.plugin(encrypt, {
//   encryptionKey: process.env.SOME_32BYTE_BASE64_STRING,
//   signingKey: process.env.SOME_64BYTE_BASE64_STRING,
//   excludeFromEncryption: ['user', 'exercises']
// });

export const exercises = mongoose.model("exercises", exerciseSchema);
