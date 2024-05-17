import {askQuestion} from '../controller/ChatGPT.mjs'
export function sendInformation(req, res) {
    res.render("loading");
    askQuestion();
}