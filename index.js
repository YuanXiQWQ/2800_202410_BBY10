import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import {GridFSBucket} from "mongodb";
import multer from "multer";
import mongoose from "mongoose";
import path from "path";
import {fileURLToPath} from "url";
import connectDB, {gfs, mongoUri} from "./db.js";
import {register, findByUsername, AdditionalUserInfo} from './controller/auth.js';
import {changePassword, postUserAvatar, postPersonalInformation, updateWorkoutSettings} from './controller/profile.js';
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
<<<<<<< HEAD


=======
>>>>>>> 720700ee475a8066a4944a4cb6f700ad8e942ec7
app.use(express.urlencoded({extended: true}));

app.use(session({
    secret: process.env.NODE_SESSION_SECRET, resave: false, saveUninitialized: false, store: MongoStore.create({
        mongoUrl: mongoUri,
    }),
}));

const storage = multer.memoryStorage();
const upload = multer({storage});

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/signup", (req, res) => {
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
    AdditionalUserInfo(req, res).catch(err => res.status(400).send("Invalid input: " + err));
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/logging-in", logIn);

app.get("/profile", (req, res) => {
    const userData = req.session.userData;
    res.render("profile", {userData: userData});
});

app.get('/editUserAvatar', (req, res) => {
    res.render('editUserAvatar', {userData: req.session.userData});
});

app.post('/postUserAvatar', upload.single('avatar'), postUserAvatar);

app.get('/avatar/:filename', async (req, res) => {
    try {
        const bucket = new GridFSBucket(mongoose.connection.db, {bucketName: 'uploads'});
        const file = await gfs.files.findOne({filename: req.params.filename});
        if (!file) {
            return res.status(404).send('File not found');
        }

        const readstream = bucket.openDownloadStream(file._id);
        readstream.pipe(res);
    } catch (error) {
        console.error('Error retrieving avatar:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/changePassword", (req, res) => {
  res.render("changePassword");
});

app.post('/postPassword', changePassword);

app.get("/personalInformation", async (req, res) => {
    try {
        const user = await findByUsername(req.session.userData.username);
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.render("personalInformation", {userData: user});
    } catch (error) {
        console.error('Error retrieving user information:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/postPersonalInformation', postPersonalInformation);

app.get("/workoutSettings", async (req, res) => {
    try {
        const user = await findByUsername(req.session.userData.username);
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.render("workoutSettings", {userData: user});
    } catch (error) {
        console.error('Error retrieving user information:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post("/postWorkoutSettings", async (req, res) => {
    try {
        await updateWorkoutSettings(req, res);
    } catch (error) {
        console.error('Error updating workout settings:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
