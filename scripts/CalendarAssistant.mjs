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
 * Sends the message to ChatGPT
 *
 * @param startDate the start date of calendar
 * @param endDate the end date of calendar
 * @param difficulty the difficulty of user's schedule
 * TODO: When using this function, there should be fixed options for difficulty settings, or at
 * least add restrictions on the input words for difficulty.
 *
 * @export I export it because this mjs file should be an independent module
 *
 * @return {Promise<any>} The GPT's response in JSON format
 */
export async function sendMessageToGPT(startDate, endDate, difficulty) {

    // The API Doc's example code, no need to modify.
    let header = new Headers();
    header.append("Authorization", "Bearer " + key);
    header.append("User-Agent", "Apifox/1.0.0 (https://apifox.com)");
    header.append("Content-Type", "application/json");

    /**
     * I spend many hours on fixing the prompt, so if you want to modify it, be sure to test it
     * carefully and ensure the stability of the return values before making changes.
     *
     * @type {string} The prompt
     */
    let prompt = `Create a fitness plan based on the following parameters:
Start date: ${startDate}
End date: ${endDate}
Difficulty: ${difficulty}
Generate a fitness plan in JSON format that covers each day from the start date to the end date, adjusting the content according to the difficulty level. Include different types of workouts and their durations (with time in minutes) that fit the specified difficulty category.
For example, if the start date is May 2, 2024, and the end date is May 4, 2024, your JSON format should be like this:
{
  "2024/5/2": [
    { "name": "Training 1", "time": "Duration 1" },
    { "name": "Training 2", "time": "Duration 2" },
    { "name": "...", "time": "..." }
  ],
  "2024/5/3": [
    { "name": "...", "time": "..." },
    { "name": "...", "time": "..." },
    { "name": "...", "time": "..." }
  ],
  "2024/5/4": [
    ...
  ]
}
Following this format, if you want to express that on May 2, 2024, there are two workouts: yoga for one hour and pull-ups for 15 minutes, then your value for the key "2024/5/2" should be:
  "2024/5/2": [
    { "name": "Yoga", "time": "60" },
    { "name": "Pull-ups", "time": "15" }
  ]
and so on. Please note: your response should only contain the JSON itself, without any additional text or unnecessary symbols, e.g., no content like "Okay, I will create a fitness plan" or attempts to enclose JSON within special symbols.`;

    // This API Key can only use the chat model, but it doesn't really matter.
    let apiRequest = JSON.stringify({
        "model": "gpt-3.5-turbo",
        "messages": [{
            "role": "user",
            "content": prompt,
            "language": "en"
        }
        ],
        "max_tokens": 500,
        "temperature": 0.7,
        "top_p": 1,
        "frequency_penalty": 0,
        "presence_penalty": 0
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

    try {
        const response = await fetch("https://api.chatanywhere.tech/v1/chat/completions",
            httpPost);
        const data = await response.json();

        /* The content that we need in GPT's response is under the "data" key, "choices" array,
        and "message" object. */
        return JSON.parse(data.choices[0].message.content);

    } catch (error) {
        console.error('Error communicating with ChatGPT:', error);
    }
}

// Usage example:
sendMessageToGPT("2024/5/2", "2024/5/8", "Normal")
    .then(response => console.log(response))
    .catch(error => console.error(error));
