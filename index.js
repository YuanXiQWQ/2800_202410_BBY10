import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import {GridFSBucket} from "mongodb";
import multer from "multer";
import mongoose from "mongoose";
import path from "path";
import {fileURLToPath} from "url";
import connectDB, {gfs, mongoUri} from "./db.js";
import {
    register, findByUsername, AdditionalUserInfo, ensureAuthenticated
} from "./controller/auth.js";
import {
    changePassword, postUserAvatar, postPersonalInformation, updateWorkoutSettings, deleteAccount,
} from "./controller/profile.js";
import {forgetPassword, resetPassword} from "./controller/password.js";
import {sendInformation} from "./controller/chatgptIntegration.js";
import {getListOfExercises} from "./controller/exercises.js";
import {authValidation, sessionValidation} from "./middleware/authorization.js";
import {logIn} from './controller/login.js';
import {User} from "./model/User.js";

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

app.use(session({
    secret: process.env.NODE_SESSION_SECRET, resave: false, saveUninitialized: false, store: MongoStore.create({
        mongoUrl: mongoUri,
    }),
}));

const storage = multer.memoryStorage();
const upload = multer({storage});

/**
 * Render before login
 */
app.get("/", authValidation, (req, res) => {
    res.render("index");
});

app.get("/signup", authValidation, (req, res) => {
    res.render("signup");
});

app.post('/submitUser', upload.none(), async (req, res) => {
    try {
        await register(req, res);
    } catch (err) {
        console.error('Internal Server Error by:', err);
        if (!res.headersSent) {
            res.status(500).json({success: false, message: 'Internal Server Error'});
        }
    }
});

app.get('/verify-email', async (req, res) => {
    const {token} = req.query;

    try {
        const user = await User.findOne({verificationToken: token});

        if (!user) {
            return res.status(400).render('validationError', {
                error: 'Invalid verification token.',
                link: 'signup',
                linkImage: 'images/validation-error.jpg',
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        req.session.userData = user;
        res.redirect('/additional-info');
    } catch (error) {
        console.error("Error verifying email:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/additional-info", (req, res) => {
    if (!req.session.userData || !req.session.userData.isVerified) return res.redirect("/signup");
    res.render("additional-info");
});

app.post("/submitAdditionalInfo", (req, res) => {
    AdditionalUserInfo(req, res).catch(err => {
        console.error('Error submitting additional info:', err);
        if (!res.headersSent) {
            res.status(500).json({success: false, message: 'Internal Server Error'});
        }
    });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/logging-in", logIn);

app.get("/forget-password", (req, res) => {
    res.render("forgetPassword");
});

app.post("/forget-password", forgetPassword);

app.get("/reset-password", (req, res) => {
    const token = req.query.token;
    if (!token) return res.status(400).send("Invalid or expired token.");
    res.render("resetPassword", {token});
});

app.post("/reset-password", resetPassword);

/**
 * Render after login
 */
app.get("/profile", ensureAuthenticated, (req, res) => {
    res.render("profile", {userData: req.session.userData});
});

app.get("/editUserAvatar", ensureAuthenticated, sessionValidation, (req, res) => {
    res.render("editUserAvatar", {userData: req.session.userData});
});

app.post("/postUserAvatar", ensureAuthenticated, sessionValidation, upload.single("avatar"), postUserAvatar);

app.get("/avatar/:filename", ensureAuthenticated, sessionValidation, (req, res) => {
    const bucket = new GridFSBucket(mongoose.connection.db, {bucketName: "uploads"});
    gfs.files.findOne({filename: req.params.filename})
        .then(file => {
            if (!file) return res.status(404).send("File not found");
            bucket.openDownloadStream(file._id).pipe(res);
        })
        .catch(err => {
            console.log("Internal Server Error by: " + err)
            res.status(500).send("Internal Server Error");
        });
});

app.get("/changePassword", ensureAuthenticated, (req, res) => {
    res.render("changePassword");
});

app.post("/postPassword", ensureAuthenticated, changePassword);

app.get("/personalInformation", ensureAuthenticated, sessionValidation, (req, res) => {
    findByUsername(req.session.userData.username)
        .then((user) => {
            if (!user) {
                return res.status(404).send("User not found");
            }
            res.render("personalInformation", {userData: user});
        })
        .catch(err => {
            console.log("Internal Server Error by: " + err)
            res.status(500).send("Internal Server Error");
        });
});

app.post("/postPersonalInformation", ensureAuthenticated, sessionValidation, postPersonalInformation);

app.get("/workoutSettings", ensureAuthenticated, sessionValidation, (req, res) => {
    findByUsername(req.session.userData.username)
        .then((user) => {
            if (!user) {
                return res.status(404).send("User not found");
            }
            res.render("workoutSettings", {userData: user});
        })
        .catch(err => {
            console.log("Internal Server Error by: " + err)
            res.status(500).send("Internal Server Error");
        });
});

app.post("/postWorkoutSettings", ensureAuthenticated, sessionValidation, updateWorkoutSettings);

app.get("/deleteAccount", ensureAuthenticated, (req, res) => {
    res.render("deleteAccount", {userData: req.session.userData});
});

app.post("/postDeletingAccount", ensureAuthenticated, deleteAccount);

app.get("/process", ensureAuthenticated, sessionValidation, (req, res) => {
    res.render("loading");
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});

app.get("/exercises", ensureAuthenticated, sessionValidation, (req, res) => {
    getListOfExercises(req, res)
        .catch(err => {
            console.log("Internal Server Error by: " + err)
            res.status(500).send("Internal Server Error");
        });
});

app.get("/process-info", ensureAuthenticated, sessionValidation, (req, res) => {
    sendInformation(req, res)
        .catch(err => {
            console.log("Internal Server Error by: " + err)
            res.status(500).send("Internal Server Error");
        });
});

app.get("/logout", ensureAuthenticated, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Failed to logout");
        }
        res.redirect("/");
    });
});
