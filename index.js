import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import { GridFSBucket } from "mongodb";
import multer from "multer";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import connectDB, { gfs, mongoUri } from "./db.js";
import {
    register,
    findByUsername,
    AdditionalUserInfo,
} from "./controller/auth.js";
import {
    changePassword,
    postUserAvatar,
    postPersonalInformation,
    updateWorkoutSettings, deleteAccount,
} from "./controller/profile.js";
import { sendInformation } from "./controller/chatgptIntegration.js";
import { getListOfExercises } from "./controller/exercises.js";
import { authValidation, sessionValidation } from "./middleware/authorization.js";

import {logIn} from './controller/login.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(__dirname + "/public"));

app.use(express.urlencoded({extended: true}));

app.use(
    session({
        secret: process.env.NODE_SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: mongoUri,
        }),
    })
);

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get("/", authValidation, (req, res) => {
    res.render("index");
});

app.get("/signup", authValidation, (req, res) => {
    res.render("signup");
});


app.post('/submitUser', async (req, res) => {
    try {
        await register(req, res);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/additional-info", (req, res) => {
    res.render("additional-info");
});

app.post("/submitAdditionalInfo", (req, res) => {
    AdditionalUserInfo(req, res).catch((err) =>
        res.status(400).send("Invalid input: " + err)
    );
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/logging-in", logIn);

app.get("/profile", (req, res) => {
    const userData = req.session.userData;
    res.render("profile", {userData: userData});
});

app.get("/editUserAvatar", sessionValidation, (req, res) => {
    res.render("editUserAvatar", { userData: req.session.userData });
});

app.post(
    "/postUserAvatar",
    sessionValidation,
    upload.single("avatar"),
    postUserAvatar
);

app.get("/avatar/:filename", sessionValidation, async (req, res) => {
    try {
        const bucket = new GridFSBucket(mongoose.connection.db, {
            bucketName: "uploads",
        });
        const file = await gfs.files.findOne({ filename: req.params.filename });
        if (!file) {
            return res.status(404).send("File not found");
        }

        const readstream = bucket.openDownloadStream(file._id);
        readstream.pipe(res);
    } catch (error) {
        console.error("Error retrieving avatar:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/changePassword", (req, res) => {
    res.render("changePassword");
});

app.post("/postPassword", changePassword);

app.get("/personalInformation", sessionValidation, async (req, res) => {
    try {
        const user = await findByUsername(req.session.userData.username);
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.render("personalInformation", { userData: user });
    } catch (error) {
        console.error("Error retrieving user information:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post(
    "/postPersonalInformation",
    sessionValidation,
    postPersonalInformation
);

app.get("/workoutSettings", sessionValidation, async (req, res) => {
    try {
        const user = await findByUsername(req.session.userData.username);
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.render("workoutSettings", sessionValidation, { userData: user });
    } catch (error) {
        console.error("Error retrieving user information:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/postWorkoutSettings", sessionValidation, async (req, res) => {
    try {
        await updateWorkoutSettings(req, res);
    } catch (error) {
        console.error("Error updating workout settings:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/deleteAccount", (req, res) => {
    const userData = req.session.userData;
    res.render("deleteAccount", {userData: userData})
});

app.post("/postDeletingAccount", deleteAccount);

app.get("/process", sessionValidation, async (req, res) => {
    res.render("loading");
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});

app.get("/exercises", sessionValidation, (req, res) => {
    getListOfExercises(req, res);
});

app.get("/process-info", sessionValidation, (req, res) => {
    sendInformation(req, res);
});

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Failed to logout");
        }
        res.redirect("/");
    });
});