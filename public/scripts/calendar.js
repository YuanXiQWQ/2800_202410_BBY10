document.addEventListener('DOMContentLoaded', function () {
    fetch("/exercisesList")
        .then(response => response.json())
        .then(exercisesListJSON => {
            let adjustedEvents;
            try {
                adjustedEvents = exercisesListJSON?.exercises.map(event => {
                    console.log(exercisesListJSON.exercises);
                    let startDate = new Date(event.start);
                    if (isNaN(startDate)) {
                        console.error(`Invalid start date: ${event.start}`);
                        return null;
                    }
                    startDate.setDate(startDate.getDate() + 2);

                    let endDate = null;
                    if (event.end) {
                        endDate = new Date(event.end);
                        if (isNaN(endDate)) {
                            console.error(`Invalid end date: ${event.end}`);
                            return null;
                        }
                        endDate.setDate(endDate.getDate() + 2);
                    }

                    return {
                        ...event,
                        start: startDate.toISOString().substring(0, 10),
                        end: endDate ? endDate.toISOString().substring(0, 10) : null,
                    };
                }).filter(event => event !== null);
            } catch (error) {
                console.error('Error during map operation:', error);
            }

            console.log('Adjusted Events:', adjustedEvents);

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
        }).catch(err => {
        console.error('Error during fetch or processing:', err);
    });
});
