/**
 * Function to generate prompt to let GPT generate a fitness plan in JSON format. If you want to
 * change the response of GPT in the future, you can change the prompt here, no need to worry about
 * CalendarAssistant.mjs.
 *
 * @export This prompt is used in sendMessageToGPT() in CalendarAssistant.mjs, I make it as a module
 * so that it can be edited easily.
 *
 * @param startDate {String} the start date of calendar, YYYY/MM/DD.
 * @param endDate {String} the end date of calendar, YYYY/MM/DD.
 * @param fitnessLevel {String} the difficulty of user's schedule.
 * @param weight {number} the weight of user in kilogram.
 * @param goal {String} the goal of user.
 * @param totalTime {number} the total time of user. It should in minutes.
 *
 * @return {String} The prompt to ChatGPT API (GPT-3.5-turbo).
 */
export function generatePrompt(startDate, endDate, fitnessLevel, weight, goal, totalTime) {
    console.log("generatePrompt() run successfully");
    return `Create a fitness plan based on the following parameters:
    Start date: ${startDate}, End date: ${endDate};
        Generate a fitness plan in JSON format that covers each day from the start date to the end date,
        adjusting the content according to the level: "${fitnessLevel}", weight: "${weight}kg", and 
        goal: "${goal}". Include different types of workouts and their durations (with time in minutes) 
        that fit the specified difficulty category. Total fitness time of each day should in total 
        be ${totalTime} minutes.
    For example, if the start date is 2024/5/3, and the end date is 2024/5/5, and the total time is 180, 
    your JSON format should be like this:
    {
      "2024/5/2": [
        { "name": "Training 1", "time": "timeA(<=180)" },
        { "name": "Training 2", "time": "timeB(<=180)" },
        { "name": "...", "time": "..." },
        { "name": "Training n", "time": "timeN(180-timeA-timeB-...)" }
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
    Following this format, if you want to express that on May 2, 2024, there are two workouts: yoga for 
    one hour and pull-ups for 15 minutes, then your value for the key "2024/5/2" should be:
      "2024/5/2": [
        { "name": "Yoga", "time": "60" },
        { "name": "Pull-ups", "time": "15" }
      ]
    and so on. Please note: your response should only contain the JSON itself, without any additional 
    text or unnecessary symbols, e.g., no content like "Okay, I will create a fitness plan" or attempts 
    to enclose JSON within special symbols.`;
}