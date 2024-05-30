document.addEventListener('DOMContentLoaded', function () {
    fetch("/exercisesList")
        .then(response => response.json())
        .then(exercisesListJSON => {
            const calendarEl = document.getElementById('calendar');
            if (calendarEl) {
                const calendar = new FullCalendar.Calendar(calendarEl, {
                    windowResize: function (arg) {
                    },
                    events: exercisesListJSON?.exercises,
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