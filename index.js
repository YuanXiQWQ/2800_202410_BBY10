import {register, login, changePassword} from './controller/auth.js';
import MongoStore from "connect-mongo";
import session from "express-session";
import {fileURLToPath} from 'url';
import connectDB from "./db.js";
import express from "express";
import {dirname} from 'path';
import bcrypt from 'bcrypt';
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
app.use("/styles", express.static(path.resolve(__dirname, "./public/styles")));
app.use("/images", express.static(path.resolve(__dirname + "./views/images")));

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

    var user_name = req.body.user_name;
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email = req.body.email;

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




// function isValidSession(req) {
//   if (req.session.authenticated) {
//       return true;
//   }
//   return false;
// }

// function sessionValidation(req,res,next) {
//   if (isValidSession(req)) {
//       next();
//   }
//   else {
//       res.redirect('/login');
//   }
// }


// function isAdmin(req) {
//   if (req.session.user_type == 'admin') {
//       return true;
//   }
//   return false;
// }

// function adminAuthorization(req, res, next) {
//   if (!isAdmin(req)) {
//       res.status(403);
//       res.render("errorMessage", {error: "Not Authorized"});
//       return;
//   }
//   else {
//       next();
//   }
// }


app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
