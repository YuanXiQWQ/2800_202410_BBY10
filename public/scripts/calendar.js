document.addEventListener('DOMContentLoaded', function () {
    fetch("/exercisesList")
        .then(response => response.json())
        .then(exercisesListJSON => {
            const adjustedEvents = exercisesListJSON?.exercises.map(event => {
                let startDate = new Date(event.start);
                startDate.setDate(startDate.getDate() + 2);

                let endDate = null;
                if (event.end) {
                    endDate = new Date(event.end);
                    endDate.setDate(endDate.getDate() + 2);
                }

                return {
                    ...event,
                    start: startDate.toISOString().substring(0, 10),
                    end: endDate ? endDate.toISOString().substring(0, 10) : null,
                };
            });

            const calendarEl = document.getElementById('calendar');
            if (calendarEl) {
                const calendar = new FullCalendar.Calendar(calendarEl, {
                    events: adjustedEvents,
                    initialView: 'dayGridMonth',
                    headerToolbar: {
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    },
                });
                calendar.render();
            } else {
                console.error('Calendar element not found');
            }
        }).catch(err => console.error(err));
});
