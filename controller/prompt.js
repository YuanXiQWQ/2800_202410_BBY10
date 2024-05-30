import moment from 'moment';

/**
 * Function to calculate the dates
 * that meet the criteria specified in the time array between the start date and the end date.
 *
 * @param time - Array of numbers representing the days of the week the user can work out (0-6 for Monday-Sunday).
 * @param startDate - Moment object representing the start date of the fitness plan.
 * @param endDate - Moment object representing the end date of the fitness plan.
 * @return {*[]} - Array of strings representing the dates that meet the criteria.
 */
function calculateWorkoutDays(time, startDate, endDate) {
    let workoutDays = [];
    let currentDate = moment(startDate);

    while (currentDate.isSameOrBefore(endDate)) {
        if (time.includes(currentDate.day())) {
            workoutDays.push(currentDate.format('YYYY-MM-DD'));
        }
        currentDate.add(1, 'days');
    }
    return workoutDays;
}

/**
 * Function to generate a fitness plan prompt based on user inputs.
 *
 * @param {number[]} time - Array of numbers representing the days of the week the user can work out (0-6 for Monday-Sunday).
 * @param {string} fitnessLevel - User's fitness level (e.g., beginner, intermediate, advanced).
 * @param {number} height - User's height in cm.
 * @param {number} weight - User's weight in kg.
 * @param {string} goal - User's fitness goal (e.g., lose weight, build muscle).
 * @param {object} startDate - Moment object representing the start date of the fitness plan.
 * @param {object} endDate - Moment object representing the end date of the fitness plan.
 * @return {string} - A prompt string to be sent to GPT-3.5-turbo for generating the fitness plan.
 */
export function generatePrompt(time, fitnessLevel, height, weight, goal, startDate, endDate) {
    const workoutDays = calculateWorkoutDays(time, startDate, endDate);

    const prompt = `Create a fitness plan only for the following dates:
     ${workoutDays.join(', ')}
    The plan should be based on the following parameters:
        Fitness Level: ${fitnessLevel}
        Height: ${height} cm
        Weight: ${weight} kg
        Goal: ${goal}
    The plan should be a JSON formatted array, where each object represents a workout session including:
        - "title" - (string value) the name of the workout
        - "time" - (numeric value) the duration of the workout in minutes
        - "Reps" - (numeric value) the number of repetitions per set
        - "Sets" - (numeric value) the number of sets
        - "start" - (date value) the start date of the workout in the format 'YYYY-MM-DD'
        - "end" - (date value) the end date of the workout in the format 'YYYY-MM-DD'
    
    Ensure the response meets the following criteria:
    1. The generated fitness plan should schedule activities within the specified dates.
    2. The start and end dates of the plan items can be different, but they must fall within the specified dates. For
    example, if an item takes two days to complete and the workout days are 2024-05-01, 2024-05-03, and 2024-05-04, the
    item can be scheduled as follows:
       - Item 1: start and end on 2024-05-01.
       - Item 2: start and end on 2024-05-03.
       - Item 3: start on 2024-05-03 and end on 2024-05-04.
    3. The fitness content should meet the following:
       - It can be repetitive but should be scientific and reasonable.
       - It should match the user's fitness level, height, and weight.
       - It should meet the user's fitness goals.
    5. For dates outside the specified dates, it is strictly prohibited to generate a JSON object for that day or
    attempt to set it as a rest day or similar.
    
    For example, if the workouts are scheduled for the following dates:
    ["2024-05-01", "2024-05-02", "2024-05-06", "2024-05-08", "2024-05-09", "2024-05-13", "2024-05-15"],
    the fitness level is Beginner, height is 170 cm, weight is 80 kg, and the goal is weight loss, it can be scheduled
    as follows:
    [
        {"title": "Push-Ups", "time": 20, "Reps": 12, "Sets": 3, "start": "2024-05-01", "end": "2024-05-01"},
        {"title": "Squats", "time": 20, "Reps": 15, "Sets": 3, "start": "2024-05-01", "end": "2024-05-02"},
        {"title": "Sit-Ups", "time": 25, "Reps": 15, "Sets": 3, "start": "2024-05-06", "end": "2024-05-06"},
        {"title": "Jump Rope", "time": 30, "Reps": 0, "Sets": 1, "start": "2024-05-08", "end": "2024-05-08"},
        {"title": "Pull-Ups", "time": 15, "Reps": 8, "Sets": 3, "start": "2024-05-08", "end": "2024-05-09"},
        {"title": "Plank", "time": 20, "Reps": 0, "Sets": 3, "start": "2024-05-13", "end": "2024-05-13"},
        {"title": "Jump Rope", "time": 25, "Reps": 20, "Sets": 3, "start": "2024-05-15", "end": "2024-05-15"}
    ]
    
    Ensure the response is a JSON formatted array with no additional text or unnecessary symbols. The dates should be
    within the specified start and end dates and match the selected workout days. Each workout should be specific and
    detailed to meet the user's fitness level, height, weight, and goal.`;

    console.log(prompt);
    return prompt;
}
