import {
  register,
  login,
  changePassword,
  postPersonalInformation,
  AdditionalUserInfo,
} from "./controller/auth.js";
import MongoStore from "connect-mongo";
import session from "express-session";
import { fileURLToPath } from "url";
import connectDB, { mongoUri } from "./db.js";
import express from "express";
import { dirname } from "path";
import path from "path";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 3000;
const saltRounds = 10;

connectDB();

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

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

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/submitUser", async (req, res) => {
  try {
    await register(req, res);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Internal Server Error");
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

app.get("/profile", async (req, res) => {
  const userData = req.session.userData;
  res.render("profile", { userData: userData });
});

app.get("/personalInformation", (req, res) => {
  res.render("personalInformation");
});

app.post("/postPersonalInformation", postPersonalInformation);

app.get("/workoutSettings", (req, res) => {
  res.render("workoutSettings");
});

app.post("/postWorkoutSettings", (req, res) => {
  res.redirect("/profile");
});

app.get("/changePassword", (req, res) => {
  res.render("changePassword");
});

app.post("/postPassword", changePassword);

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
