import {generatePrompt} from "../controller/prompt.mjs"
import dotenv from "dotenv"

dotenv.config({path: "../.env"});

const authorisation = process.env.OPENAI_API_AUTHORISATION;
const UserAgent = process.env.OPENAI_USER_AGENT;
const link = process.env.OPENAI_API_LINK;

/**
 * Sends the message to ChatGPT and get the calendar in JSON format
 *
 * @export I export it because this mjs file should be an independent module
 *
 * @param startDate {string} the start date of calendar, YYYY/MM/DD
 * @param endDate {string} the end date of calendar, YYYY/MM/DD
 * @param fitnessLevel {String} the difficulty of user's schedule.
 * @param weight {number} the weight of user in kilogram.
 * @param goal {String} the goal of user.
 * @param totalTime {number} the total time of user; it should in minute.
 *
 * @return {Promise<JSON>} The GPT's response.
 * @throws {Error} If the GPT's response is not in JSON format
 */
export async function generateCalendar(startDate, endDate, fitnessLevel, weight, goal, totalTime) {

    // The API Doc's example code, no need to modify.
    let header = new Headers();
    header.append("Authorization", authorisation);
    header.append("User-Agent", UserAgent);
    header.append("Content-Type", "application/json");

    // This API Key can only use the chat model, but it doesn't really matter.
    let apiRequest = JSON.stringify({
        "model": "gpt-3.5-turbo",
        "messages": [{
            "role": "user",
            "content": generatePrompt(startDate, endDate, fitnessLevel, weight, goal, totalTime),
            "language": "en"
        }
        ],
        "max_tokens": 500,
        "temperature": 0.7,
        "top_p": 1,
        "frequency_penalty": 0,
        "presence_penalty": 0
    });

    try {
        console.log("Send request successfully, Waiting for response...");
        let response = await fetch(link, {
            method: 'POST',
            headers: header,
            body: apiRequest,
            redirect: 'follow'
        });
        let data = await response.json();
        console.log("Get response from GPT");
        return data.choices[0].message.content;
    } catch (e) {
        console.error("Form does not match: " + await response, e);
        throw e;
    }
}

// Usage example:
generateCalendar("2024/5/2", "2024/5/4", "Beginner", 80, "Lose 10 pounds", 60)
    .then(res => console.log(res))
    .catch(e => console.error(e));
