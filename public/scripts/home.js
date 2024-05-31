document.addEventListener('DOMContentLoaded', function () {
    fetch("/exercisesList")
        .then(response => response.json())
        .then(exercisesListJSON => {
            const exercisesList = document.getElementById('exercisesList');
            const exercises = exercisesListJSON.exercises.map(event => {
                let startDate = new Date(event.start);
                startDate.setDate(startDate.getDate() + 3);

                let endDate = null;
                if (event.end) {
                    endDate = new Date(event.end);
                    endDate.setDate(endDate.getDate() + 3);
                }

                return {
                    ...event,
                    start: startDate.toISOString().substring(0, 10),
                    end: endDate ? endDate.toISOString().substring(0, 10) : null,
                };
            });

            /**
             * Function to get day name from day code
             *
             * @param {string} dayCode day code
             * @return {*} day name
             */
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

            /**
             * Function to filter exercises by day
             *
             * @param {string} dayCode day code
             * @return {*} filtered exercises
             */
            function filterExercisesByDay(dayCode) {
                const today = new Date();
                const selectedDayName = getDayName(dayCode);

                return exercises.filter(exercise => {
                    const exerciseDate = new Date(exercise.start);
                    const exerciseDayName = exerciseDate.toLocaleDateString('en-US', {weekday: 'long'});
                    return exerciseDayName === selectedDayName;
                });
            }

            /**
             * Function to display exercises
             *
             * @param {string} dayCode day code
             */
            function displayExercises(dayCode) {
                const filteredExercises = filterExercisesByDay(dayCode);
                exercisesList.innerHTML = '';

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

            const todayDayCode = new Date().toLocaleDateString('en-US', {weekday: 'short'}).toLowerCase();
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
