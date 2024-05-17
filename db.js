import Grid from "gridfs-stream";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const config = {
    user: process.env.MONGODB_USER,
    pass: process.env.MONGODB_PASSWORD,
    host: process.env.MONGODB_HOST,
    db: process.env.MONGODB_DATABASE,
    option: process.env.MONGODB_OPTION
};
export const mongoUri = `mongodb+srv://${config.user}:${config.pass}@${config.host}/${config.db}?${config.option}`;

let gfs;

mongoose.connection.once("open", () => {
    gfs = Grid(mongoose.connection.db, mongoose.mongo);
    gfs.collection("uploads");
});

export { gfs };

export default async function connectDB() {
    await mongoose.connect(mongoUri);
    console.log("Successfully connected to MongoDB at", config.db);
}
