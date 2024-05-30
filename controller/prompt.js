export function generatePrompt(
  time,
  fitnessLevel,
  weight,
  goal
) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed, add 1 for human-readable format
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

  return `Create a fitness plan for the current month, starting from today (${currentDay}-${currentMonth}-${currentYear}) until the end of the month (${daysInMonth}-${currentMonth}-${currentYear}). This plan should be based on the following parameters:
    Workout Days: ${workoutDays}
    Fitness Level: "Beginner"
    Weight: "100kg"
    Goal: "losewright"
    The plan should be a JSON formatted array, where each object represents a workout session that includes:
    - The name of the workout
    - The duration of the workout in minutes
    - The start date in the format 'day-month-year', adjusted for the days you have chosen to workout.
  
  For example, if workouts are scheduled for Monday and Wednesday, and the first Monday of this month falls on the ${currentDay}, the JSON should look like this:
      
       [
        { "title": "Push-Ups", "time": 30, "Reps": 10, "Sets:" 3, "start": "${currentYear}-${currentMonth}-${currentDay}" },
        { "title": "Squats", "time": 45, "Reps": 10, "Sets:" 3, "start": "${currentYear}-${currentMonth}-${currentDay+2}" }  // Assuming today is Monday and the day after next is Wednesday
      ]
  
  Each JSON object corresponds to a specific workout session. The response should strictly be an array of JSON objects, with no additional text or unnecessary symbols. The time format should be YYYY-MM-DD. MAKE SURE THE MONTH IS 2 DIGITS PLEASE, RESPONSE ONLY WITH THE ARRAY PLEASE. I also need the exercises to be specific and not just "Cardio" or "Strength.
  If i have multiple exercises for the same day I want them seperated with sepearte titles, time, start ect. Remember to carefully go over the parameters to give a proper detailed workout plan. Multiple workouts are allowed per day, use your judgement based on the given information to give the best workout plan.`
  
}