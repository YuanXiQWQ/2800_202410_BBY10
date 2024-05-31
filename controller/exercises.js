import {exercises} from "../model/exercises.js";
import {User} from "../model/User.js";

/**
 * Function to get the user's ID from the database.
 *
 * @param {string} username - The username of the user
 * @return {Promise<*>} - The user's ID
 */
async function getUserId(username) {
    const user = await User.findOne({username}).select("_id");
    return user?._id;
}

/**
 * Function to get the user's exercise plan from the database
 * and make sure the start and end dates are formatted correctly.
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @return {Promise<Object>} - The user's exercise plan
 */
export async function getListOfExercises(req, res) {
    const userid = await getUserId(req.session.userData.username);
    const data = await exercises.findOne({user: userid});

    return {
        ...data?._doc,
        exercises: data?.exercises.map((ele) => ({
            ...ele, start: formatDate(ele?.start), end: formatDate(ele?.end),
        })),
    };
}

/**
 * Function to format a date in the format YYYY-MM-DD.
 *
 * @param  {string} date - The date to be formatted from the database
 * @return {string} - The formatted date
 */
function formatDate(date) {
    let d = new Date(date), month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(), year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
}
