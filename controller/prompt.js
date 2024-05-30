/**
 * Function to generate a fitness plan prompt based on user inputs.
 * The function takes the current date and user parameters to create a detailed fitness plan in JSON format.
 *
 * @param {number} time - Bitmask representing workout days of the week (0-6 for Sunday-Saturday).
 * @param {string} fitnessLevel - User's fitness level (e.g., beginner, intermediate, advanced).
 * @param {number} weight - User's weight.
 * @param {string} goal - User's fitness goal (e.g., lose weight, build muscle).
 * @return {string} - A prompt string describing the fitness plan with workout days, fitness level, weight, and goal, formatted in JSON.
 */
export function generatePrompt(time, fitnessLevel, weight, goal) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    // Interpret the 'time' parameter to determine workout days
    const workoutDays = [];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (let i = 0; i < 7; i++) {
        if (time & (1 << i)) { // Check each bit in the 'time' bitmask
            workoutDays.push(days[i]);
        }
    }
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);

    return `{
      "start_date": "${currentYear}-${currentMonth}-${currentDay}",
      "end_date": "${currentYear}-${currentMonth}-${daysInMonth}",
      "parameters": {
        "workout_days": ${JSON.stringify(workoutDays)},
        "fitness_level": "${fitnessLevel}",
        "weight": ${weight},
        "goal": "${goal}"
      },
      "instructions": "Create a fitness plan in JSON formatted array, where each object represents a workout session 
      that includes the name of the workout, the duration in minutes, the start date in the format 'YYYY-MM-DD'. For 
      example, if workouts are scheduled for Monday and Wednesday, and the first Monday of this month falls on the 
      ${currentDay}, the JSON should look like this: [
      {"title": "Push-Ups", "time": 30, "Reps": 10, "Sets": 3, "start": "${currentYear}-${currentMonth}-${currentDay}"}, 
      {"title": "Squats", "time": 45, "Reps": 10, "Sets": 3, "start": "${currentYear}-${currentMonth}-${currentDay + 2}"}
      ]. 
      The response should be strictly an array of JSON objects, with no additional text or unnecessary symbols. The time
      format should be YYYY-MM-DD. MAKE SURE THE MONTH IS 2 DIGITS PLEASE. I also need the exercises to be specific and
      not just "Cardio" or "Strength". If there are multiple exercises for the same day, they should be separated with
      separate titles, times, starts, etc. Use your judgment based on the given information to provide the best
      workout plan."
    }`;

    return `Create a fitness plan for the current month, starting from today (${currentDay}-${currentMonth}-${currentYear}) until the end of the month (${daysInMonth}-${currentMonth}-${currentYear}). This plan should be based on the following parameters:
    Workout Days: ${workoutDays}
    Fitness Level: ${fitnessLevel}
    Weight: ${weight}
    Goal: ${goal}
    The plan should be a JSON formatted array, where each object represents a workout session that includes:
    - The name of the workout
    - The duration of the workout in minutes
    - The start date in the format 'day-month-year', adjusted for the days you have chosen to workout.
  
  For example, if workouts are scheduled for Monday and Wednesday, and the first Monday of this month falls on the ${currentDay}, the JSON should look like this:
      
       [
        { "title": "Push-Ups", "time": 30, "Reps": 10, "Sets:" 3, "start": "${currentYear}-${currentMonth}-${currentDay}" },
        { "title": "Squats", "time": 45, "Reps": 10, "Sets:" 3, "start": "${currentYear}-${currentMonth}-${currentDay + 2}" }  // Assuming today is Monday and the day after next is Wednesday
      ]
  
  Each JSON object corresponds to a specific workout session. The response should strictly be an array of JSON objects, with no additional text or unnecessary symbols. The time format should be YYYY-MM-DD. MAKE SURE THE MONTH IS 2 DIGITS PLEASE, RESPONSE ONLY WITH THE ARRAY PLEASE. I also need the exercises to be specific and not just "Cardio" or "Strength.
  If i have multiple exercises for the same day I want them seperated with sepearte titles, time, start ect. Remember to carefully go over the parameters to give a proper detailed workout plan. Multiple workouts are allowed per day, use your judgement based on the given information to give the best workout plan.`

}