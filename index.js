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
    register, findByUsername, AdditionalUserInfo, ensureAuthenticated,
} from "./controller/auth.js";
import {
    changePassword, postUserAvatar, postPersonalInformation, updateWorkoutSettings, deleteAccount, changeLanguage,
} from "./controller/profile.js";
import {forgetPassword, resetPassword} from "./controller/password.js";
import {sendInformation} from "./controller/chatgptIntegration.js";
import {getListOfExercises} from "./controller/exercises.js";
import {authValidation, sessionValidation,} from "./middleware/authorization.js";
import {logIn} from "./controller/login.js";
import {User, TempUser} from "./model/User.js";
import {loadLanguage} from "./middleware/loadLanguage.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(__dirname + "/public"));
app.use("/controller", express.static(path.join(__dirname, "controller")));

app.use(express.urlencoded({extended: true}));

const storage = multer.memoryStorage();
const upload = multer({storage});

app.use(session({
    secret: process.env.NODE_SESSION_SECRET, resave: false, saveUninitialized: false, store: MongoStore.create({
        mongoUrl: mongoUri,
    }),
}));

app.use(loadLanguage);

app.get("/", authValidation, (req, res) => {
    res.render("index", {language: res.locals.language});
});

app.get("/signup", authValidation, (req, res) => {
    res.render("signup", {language: res.locals.language});
});

app.post("/submitUser", upload.none(), async (req, res) => {
    try {
        await register(req, res);
    } catch (err) {
        console.error("Internal Server Error by:", err);
        if (!res.headersSent) {
            res.status(500).json({success: false, message: "Internal Server Error"});
        }
    }
});

app.get("/verify-email", async (req, res) => {
    const {token} = req.query;

    try {
        const tempUser = await TempUser.findOne({verificationToken: token});

        if (!tempUser) {
            return res.status(400).render("validationError", {
                error: "Invalid verification token.",
                link: "signup",
                linkImage: "images/validation-error.jpg",
                language: res.locals.language,
            });
        }

        const newUser = new User({
            username: tempUser.username,
            firstName: tempUser.firstName,
            lastName: tempUser.lastName,
            email: tempUser.email,
            birthday: tempUser.birthday,
            password: tempUser.password,
            isVerified: true
        });

        await newUser.save();
        await TempUser.deleteOne({_id: tempUser._id});

        req.session.userData = newUser;
        res.redirect("/additional-info");
    } catch (error) {
        console.error("Error verifying email:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/additional-info", (req, res) => {
    if (!req.session.userData || !req.session.userData.isVerified) return res.redirect("/signup");
    res.render("additional-info", {language: res.locals.language});
});

app.post("/submitAdditionalInfo", (req, res) => {
    console.log(req?.body);
    AdditionalUserInfo(req, res).catch((err) => {
        console.error("Error submitting additional info:", err);
        if (!res.headersSent) {
            res.status(500).json({success: false, message: "Internal Server Error"});
        }
    });
});

app.get("/calendar", (req, res) => {
    res.render("calendar");
});

app.get("/exercisesList", async (req, res) => {
    try {
        res.json(await getListOfExercises(req, res));
    } catch (err) {
        console.error("Error getting exercises list:", err);
        res.status(500).json({error: "Internal Server Error" + err});
    }
});

app.get("/newExerciseList", ensureAuthenticated, (req, res) => {
    res.render("newExerciseList", {language: res.locals.language});
});

app.post("/submitNewExerciseList", ensureAuthenticated, (req, res) => {
    sendInformation(req, res).then(() => {
        if (!res.headersSent) {
            res.status(200).json({success: true, message: "success"});
        }
    }).catch((err) => {
        console.error("Error submitting new exercise list:", err);
        if (!res.headersSent) {
            res.status(500).json({success: false, message: "Internal Server Error: " + err});
        }
    });
});


app.get("/login", (req, res) => res.render("login", {language: res.locals.language}));

app.post("/logging-in", async (req, res) => {
    try {
        await logIn(req, res);
        if (!res.headersSent) {
            res.redirect("/home");
        }
    } catch (err) {
        console.error("Login error:", err);
        if (!res.headersSent) {
            res.status(500).json({success: false, message: "Internal Server Error"});
        }
    }
});


app.get("/forget-password", (req, res) => res.render("forgetPassword", {language: res.locals.language}));

app.get("/about", (req, res) => res.render("about", {language: res.locals.language}));

app.post("/forget-password", forgetPassword);

app.get("/reset-password", (req, res) => {
    const token = req.query.token;
    if (!token) return res.status(400).send("Invalid or expired token.");
    res.render("resetPassword", {token, language: res.locals.language});
});

app.post("/reset-password", resetPassword);

app.get("/home", ensureAuthenticated, async (req, res) => {
    res.render("home", {userData: req.session.userData, language: res.locals.language});
});

app.get("/profile", ensureAuthenticated, (req, res) => res.render("profile", {userData: req.session.userData}));

app.get("/editUserAvatar", ensureAuthenticated, sessionValidation, (req, res) => res.render("editUserAvatar", {
    userData: req.session.userData, language: res.locals.language,
}));

app.post("/postUserAvatar", ensureAuthenticated, sessionValidation, upload.single("avatar"), postUserAvatar);

app.get("/avatar/:filename", ensureAuthenticated, sessionValidation, (req, res) => {
    const bucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: "uploads",
    });
    gfs.files
        .findOne({filename: req.params.filename})
        .then((file) => {
            if (!file) return res.status(404).send("File not found");
            bucket.openDownloadStream(file._id).pipe(res);
        })
        .catch((err) => {
            console.log("Internal Server Error by: " + err);
            res.status(500).send("Internal Server Error");
        });
});

app.get("/changePassword", ensureAuthenticated, (req, res) => res.render("changePassword", {language: res.locals.language}));

app.post("/postPassword", ensureAuthenticated, changePassword);

app.get("/personalInformation", ensureAuthenticated, sessionValidation, (req, res) => {
    findByUsername(req.session.userData.username)
        .then((user) => {
            if (!user) {
                return res.status(404).send("User not found");
            }
            res.render("personalInformation", {
                userData: user, language: res.locals.language,
            });
        })
        .catch((err) => {
            console.log("Internal Server Error by: " + err);
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
            res.render("workoutSettings", {
                userData: user, language: res.locals.language,
            });
        })
        .catch((err) => {
            console.log("Internal Server Error by: " + err);
            res.status(500).send("Internal Server Error");
        });
});

app.post("/postWorkoutSettings", ensureAuthenticated, sessionValidation, updateWorkoutSettings);

app.get("/deleteAccount", ensureAuthenticated, sessionValidation, (req, res) => {
    findByUsername(req.session.userData.username)
        .then((user) => {
            if (!user) {
                return res.status(404).send("User not found");
            }
            res.render("deleteAccount", {
                userData: user, language: res.locals.language,
            });
        })
        .catch((err) => {
            console.log("Internal Server Error by: " + err);
            res.status(500).send("Internal Server Error");
        });
});

app.post("/postDeletingAccount", ensureAuthenticated, sessionValidation, deleteAccount);

app.get("/changeLanguage", ensureAuthenticated, sessionValidation, (req, res) => res.render("changeLanguage", {language: res.locals.language}));

app.post("/postChangeLanguage", (req, res) => {
    req.session.language = req.body.language;
    changeLanguage(req, res);
});

app.get("/process", ensureAuthenticated, sessionValidation, (req, res) => res.render("loading"));

app.get("/exercises", ensureAuthenticated, (req, res) => {
    res.render("workouts")
});

app.get("/process-info", ensureAuthenticated, sessionValidation, (req, res) => {
    sendInformation(req, res).catch((err) => {
        console.log("Internal Server Error by: " + err);
        res.status(500).send("Internal Server Error");
    });
});

app.post("/sendInformation", ensureAuthenticated, (req, res) => {
    sendInformation(req, res).catch((err) => {
        console.log("Internal Server Error by: " + err);
        res.status(500).send("Internal Server Error");
    });
});

app.get("/train-plank", ensureAuthenticated, (req, res) => {
    res.render("train-plank", {language: res.locals.language})
});


app.get("/train-squat", ensureAuthenticated, (req, res) => {
    res.render("train-squat", {language: res.locals.language})
});

app.get("/workouts", ensureAuthenticated, (req, res) => {
    res.render("workouts", {language: res.locals.language})
});

app.get("/logout", ensureAuthenticated, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Failed to logout");
        }
        res.redirect("/");
    });
});

app.get("*", (req, res) => {
    res.status(404);
    res.render('404', {language: res.locals.language});
})

app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
