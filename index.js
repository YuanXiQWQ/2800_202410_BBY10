import {register, login, changePassword} from './controller/auth.js';
import MongoStore from "connect-mongo";
import session from "express-session";
import {fileURLToPath} from 'url';
import connectDB from "./db.js";
import path from "path"
import session from "express-session"
import MongoStore from "connect-mongo"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import User from "../model/User.js";



const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 3000;

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
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);


app.get("/", (req, res) => {
  register();
  login()
});

app.listen(PORT, () => {
    console.log(`Server started: http://localhost:${PORT}`);
});
