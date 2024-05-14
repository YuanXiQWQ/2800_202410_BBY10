import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
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
    height: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    goal: {
      type: String,
      required: true,
    },
    time: {
      type: [Number],
      required: true,
      enum: [0, 1, 2, 3, 4, 5, 6],
    },
    birthday: {
      type: Date,
      required: true,
    },
    fitnessLevel: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced"],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("users", userSchema);

module.exports = User;
