import {sendMessageToChatGPT} from "../model/ChatGPT.js";
import {generatePrompt} from "./prompt.js";
import {exercises} from "../model/exercises.js";
import {User} from "../model/User.js";
import moment from "moment";

/**
 * Asynchronous function to retrieve a user's ID based on their username.
 *
 * @param {string} username - The username of the user.
 * @return {Promise<string|null>} - The ID of the user, or null if not found.
 */
async function getUserId(username) {
    const user = await User.findOne({username}).select("_id");
    return user?._id;
}

/**
 * Function to save or update a user's exercise plan in the database.
 *
 * @param {string} userId - The ID of the user.
 * @param {Object} exercise - The exercise plan to be saved or updated.
 */
function saveExercises(userId, exercise) {
    exercises.findOneAndUpdate(
        {user: userId},
        {exercises: exercise},
        {new: true, upsert: true})
        .then(result => {
            console.log("Exercise saved or updated successfully:", result);
        })
        .catch(err => {
            console.error("Error during save or update operation:", err);
        });
}

/**
 * The Main asynchronous function to process the request, generate a workout plan, and save it to the database.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
export async function sendInformation(req, res) {
    const user = req.session.userData;
    const {time, fitnessLevel, height, weight, goal} = user;
    let {startDate, endDate} = user;
    const userId = await getUserId(user?.username);
    let gptResponse = {};

    // If undefined or null, set as today and after 7 days.
    startDate = startDate ? startDate : moment().format('YYYY-MM-DD');
    endDate = endDate ? endDate : moment().add(7, 'days').format('YYYY-MM-DD');

    try {
        gptResponse = await sendMessageToChatGPT(generatePrompt(time, fitnessLevel, height, weight, goal, startDate, endDate));
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({success: false, message: "Internal Server Error" + err});
    }

    await saveExercises(userId, gptResponse);
    req.session.userData = {...req.session.userData, id: userId};
    res.status(200).send("success")
}
