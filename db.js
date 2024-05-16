import mongoose from "mongoose"
import dotenv from "dotenv";

dotenv.config();

const config = {
    user: process.env.MONGODB_USER,
    pass: process.env.MONGODB_PASSWORD,
    host: process.env.MONGODB_HOST,
    db: process.env.MONGODB_DATABASE,
    option: process.env.MONGODB_OPTION
}
export const mongoUri = `mongodb+srv://${config.user}:${config.pass}@${config.host}/${config.db}?${config.option}`

export default async function connectDB() {
    mongoose.connect(mongoUri)
        .then(() => console.log("Successfully connected to MongoDB at", config.db))
        .catch(err => {
            console.log("Error connecting to MongoDB:", err);
            process.exit(1)
        });
}

