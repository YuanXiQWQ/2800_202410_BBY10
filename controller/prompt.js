export function generatePrompt(
  time,
  fitnessLevel,
  weight,
  goal,

) {
  return `Create a fitness plan based on the following parameters:
    days where 0=Only Monday, 1=Monday and Tuesday... and 6=all days of the week;the days are =${time}
        Generate a fitness plan in JSON format that covers each day from the start date to the end date,
        adjusting the content according to the level: "${fitnessLevel}", weight: "${weight}kg", and 
        goal: "${goal}". Include different types of workouts and their durations (with time in minutes) 
        that fit the specified difficulty category. 
    For example, if the start date is Monday, and the end date is Wednsday, and the total time is 180, 
    your JSON format should be like this:
    {
      "Monday": [
        { "name": "Training 1", "time": "timeA(<=180)" },
        { "name": "Training 2", "time": "timeB(<=180)" },
        { "name": "...", "time": "..." },
        { "name": "Training n", "time": "timeN(180-timeA-timeB-...)" }
      ],
      "Tuesday": [
        { "name": "...", "time": "..." },
        { "name": "...", "time": "..." },
        { "name": "...", "time": "..." }
      ],
      "Wednsday": [
        ...
      ]
    }
    Following this format, if you want to express that on Monday, there are two workouts: yoga for 
    one hour and pull-ups for 15 minutes, then your value for the key "Monday" should be:
      "Monday": [
        { "name": "Yoga", "time": "60" },
        { "name": "Pull-ups", "time": "15" }
      ]
    and so on. Please note: your response should only contain the JSON itself, without any additional 
    text or unnecessary symbols, e.g., no content like "Okay, I will create a fitness plan" or attempts 
    to enclose JSON within special symbols.`;
}
