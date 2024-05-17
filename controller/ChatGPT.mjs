/**
 * Just a practice of using the API; maybe you guys can use it as a reference? I don't think our
 * project will need this. Just for example.
 */

import readline from 'node:readline';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Free API key
 *
 * @type {string} The API key
 *
 * @see https://chatanywhere.apifox.cn/
 * You might need Google translator; if you are using Microsoft Edge,
 * right-click and find "translate"; for other browsers, add Google
 * Translator plugin.
 * TODO: Delete this in final version
 */
const key = "sk-YsyYChLSPXi3Y2sdQLApDDU0TbI7cCnuBewOZUGyYAod5uhr";

/**
 * This is the conversation history, send this to ChatGPT so that it can
 * continue the conversation but not start a new one.
 * @type {*[]} The whole conversation history
 */
let conversationHistory = [];

/**
 * Gets the user question from input and sends it to ChatGPT
 */
export function askQuestion(question) {
    rl.question("User: ", (answer) => {
        if (answer.toLowerCase().trim() === "exit") {
            rl.close();
        } else {
            sendMessageToChatGPT(question).catch(e => console.error(e));
        }
    });
}

/**
 * Sends the message to ChatGPT
 * @param messageToSend The message to send
 * @return {Promise<void>}
 */
export async function sendMessageToChatGPT(messageToSend) {
    // From API Doc
    let header = new Headers();
    header.append("Authorization", "Bearer " + key);
    header.append("User-Agent", "Apifox/1.0.0 (https://apifox.com)");
    header.append("Content-Type", "application/json");

    // Put user's message in conversation history
    conversationHistory.push({
        "role": "user",
        "content": messageToSend
    });

    let apiRequest = JSON.stringify({
        "model": "gpt-3.5-turbo",
        "messages": conversationHistory
    });

    /**
     * A standard request to OpenAI's API is an HTTP POST request in the following format:
     * {
     *   "model": "gpt-3.5-turbo",          // model name
     *   "prompt": "Once upon a time,",     // the prompt
     *   "temperature": 0.7,                // the degree of creativity, the larger, the more
     *                                      // creative(or more crazy)
     *   "max_tokens": 100,                 // the maximum number of tokens to generate
     *   "api_key": "YOUR_API_KEY"          // API key
     *   "stop": ["STOP TOKEN"]             // when the model generates this token, it will stop
     *
     *   // Following are using in chat interface
     *   "messages": [{
     *      "role": "user",                 // the role of the message sender
     *      "content": "YOUR MESSAGE"       // the content of the message
     *      "language": "en"                // the language of the message
     *   }]
     * }
     * @type {{redirect: string, headers: *, method: string, body: string}}
     */
    let httpPost = {
        method: 'POST',
        headers: header,
        body: apiRequest,
        redirect: 'follow'
    };

    fetch("https://api.chatanywhere.tech/v1/chat/completions", httpPost)
        .then(response => response.json())
        .then(data => {
            console.log("ChatGPT: " + data.choices[0].message.content);
            // Add response to conversation history
            conversationHistory.push({
                "role": "system",
                "content": data.choices[0].message.content
            });
            // Run again
            askQuestion();
        })
        .catch(e => console.error(e));
}

