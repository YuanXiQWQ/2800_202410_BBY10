import express from "express"
import connectDB from "./db.js";
import path from "path"
import session from "express-session"
import MongoStore from "connect-mongo"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';
//import User from "./model/User.js"; // Import the User model

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const saltRounds = 10;

connectDB();

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
      secret: process.env.NODE_SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
      }),
    })
);


app.get("/", (req, res) => {
  //register();
  //login()
  res.render("index");
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/submitUser', async (req, res) => {


  try {

    const user_name = req.body.user_name
    const first_name = req.body.first_name
    const last_name = req.body.last_name
    const email = req.body.email

    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);


    req.session.userData = {
      user_name: user_name,
      first_name: first_name,
      last_name: last_name,
      email: email,
      password: hashedPassword
    };

    console.log("hi");


    res.redirect('/additional-info');
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).send('Internal Server Error');
  }


});


app.get("/additional-info", (req,res) => {
  res.render("additional-info");
})

app.post("/submitAdditionalInfo", (req, res) => {

  var weight = req.body.weight;
  var height = req.body.height;
  var workoutLevel = req.body.workoutLevel;

  req.session.userData = {
    ...req.session.userData,
    weight: weight,
    height: height,
    workoutLevel: workoutLevel
  }

  res.redirect("/test");
})

//test page after user enters all their info
app.get("/test", (req, res) => {
  // Access user data from the session
  const userData = req.session.userData;

  // Render a view with the user data
  res.render("test", { userData: userData });
  console.log(userData);
});

app.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}`);
});
