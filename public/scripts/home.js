document.addEventListener('DOMContentLoaded', function () {
    fetch("/exercisesList")
        .then(response => response.json())
        .then(exercisesListJSON => {
            const exercisesList = document.getElementById('exercisesList');
            const exercises = exercisesListJSON.exercises;

            function getDayName(dayCode) {
                const dayNames = {
                    mon: 'Monday',
                    tue: 'Tuesday',
                    wed: 'Wednesday',
                    thu: 'Thursday',
                    fri: 'Friday',
                    sat: 'Saturday',
                    sun: 'Sunday'
                };
                return dayNames[dayCode];
            }

            function filterExercisesByDay(dayCode) {
                const today = new Date();
                const selectedDayName = getDayName(dayCode);

                return exercises.filter(exercise => {
                    const exerciseDate = new Date(exercise.start);
                    const exerciseDayName = exerciseDate.toLocaleDateString('en-US', { weekday: 'long' });
                    return exerciseDayName === selectedDayName;
                });
            }

            function displayExercises(dayCode) {
                const filteredExercises = filterExercisesByDay(dayCode);
                exercisesList.innerHTML = ''; // 清空现有的锻炼信息

                if (filteredExercises.length > 0) {
                    filteredExercises.forEach(function (exercise) {
                        const card = document.createElement('div');
                        card.className = 'card';

                        const cardTitle = document.createElement('div');
                        cardTitle.className = 'card-title';
                        cardTitle.textContent = exercise.title;

                        const cardContent = document.createElement('div');
                        cardContent.className = 'card-content';

                        let contentText = `Duration: ${exercise.time} minutes | Date: ${exercise.start}`;
                        if (exercise.Reps && exercise.Sets) {
                            contentText += ` | Reps: ${exercise.Reps} | Sets: ${exercise.Sets}`;
                        }
                        cardContent.textContent = contentText;

                        card.appendChild(cardTitle);
                        card.appendChild(cardContent);

                        exercisesList.appendChild(card);
                    });
                } else {
                    const noPlanMessage = document.createElement('p');
                    noPlanMessage.textContent = 'No workout plan for today';
                    exercisesList.appendChild(noPlanMessage);
                }
            }

            const todayDayCode = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
            displayExercises(todayDayCode);

            const dayLinks = document.querySelectorAll('#days .lang-text');
            dayLinks.forEach(link => {
                link.addEventListener('click', function () {
                    const dayCode = this.getAttribute('data-day');
                    displayExercises(dayCode);
                });
            });
        }).catch(err => console.error(err));
});
