const authorisation = process.env.OPENAI_API_AUTHORISATION;
const UserAgent = process.env.OPENAI_USER_AGENT;
const link = process.env.OPENAI_API_LINK;

/**
 * Sends a message to ChatGPT and returns the response.
 *
 * @param {string} messageToSend - The message to send to ChatGPT.
 * @return {Promise<Object>} - The response from ChatGPT, parsed as a JSON object.
 * @throws {Error} - If there is an error communicating with ChatGPT.
 */
export async function sendMessageToChatGPT(messageToSend) {
    let header = new Headers();
    header.append("Authorization", authorisation);
    header.append("User-Agent", UserAgent);
    header.append("Content-Type", "application/json");

    let apiRequest = JSON.stringify({
        "model": "gpt-3.5-turbo",
        "messages": [{
            "role": "user",
            "content": messageToSend,
            "language": "en"
        }],
        "max_tokens": 500,
        "temperature": 0.7,
        "top_p": 1,
        "frequency_penalty": 0,
        "presence_penalty": 0
    });

    let httpPost = {
        method: 'POST',
        headers: header,
        body: apiRequest,
        redirect: 'follow'
    };

    try {
        const response = await fetch(link, httpPost);
        const result = await response.json();
        const message = result.choices[0].message.content;
        console.log("ChatGPT: " + message);

        // Try at most 3 times to parse the message as JSON
        let parsedMessage;
        let success = false;
        for (let i = 0; i < 3; i++) {
            try {
                parsedMessage = JSON.parse(message);
                success = true;
                break;
            } catch (parseError) {
                console.error(`Attempt ${i + 1} to parse message failed:`, parseError);
            }
        }
        if (!success) {
            console.error(`Failed to parse message after 3 attempts: ${message}`);
        }
        return parsedMessage;
    } catch (error) {
        console.error('Error communicating with ChatGPT:', error);
        throw error;
    }
}
