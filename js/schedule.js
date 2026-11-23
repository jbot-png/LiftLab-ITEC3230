const confirmData = {
    date: "0",
    time: "1:00am",
    workout: "Upper Body"
}

document.addEventListener("DOMContentLoaded", function () {
    const nav = document.getElementsByClassName("schedule-nav");
    const days = document.getElementsByClassName("dayDetail");
    const availDays = document.getElementsByClassName("availibility");
    const currentDate = document.getElementsByClassName("activeDay");
    const saveChange = document.getElementById("save-schedule");
    const dateDisplay = document.getElementById("date-display");
    const timeDisplay = document.getElementById("time-display");


/* Show the selected workout on the reschedule page */
const selectedWorkout = document.querySelector(".workoutSelect .action-copy strong");

if (selectedWorkout) {
    const workoutName = localStorage.getItem("change_workout");

    if (workoutName) {
        selectedWorkout.textContent = workoutName;
    }
}

/* Show the workout name on the confirmation page */
const confirmedWorkout = document.getElementById("workout-display");

if (confirmedWorkout) {
    const workoutName = localStorage.getItem("change_workout");

    if (workoutName) {
        confirmedWorkout.textContent = workoutName;
    }
}



    // Show any saved workout date changes on the calendar
    showSavedReschedule();

    /* Update the weekly cards using the saved workout dates */
    updateWeekSchedule();



    // Buttons for schedule display type
    if (nav.length != 0) {
        const navButtons = nav[0].children;

        for (x = 0; x < navButtons.length; x++) {
            const button = navButtons[x];

            button.addEventListener("click", function () {
                switchDisplay(button.textContent);
            })
        }
    }

    // Buttons for seeing the details of a specific day
    for (x = 0; x < days.length; x++) {
        const eachDay = days[x].children;

        for (x = 0; x < eachDay.length; x++) {
            const select = eachDay[x];

            eachDay[x].addEventListener('click', function () {
                showReschedule(select, currentDate[1]);
            })
        }
    }

    // Buttons for changing the scheduled date
    for (x = 0; x < availDays.length; x++) {
        const day = availDays[x].children;

        for (x = 0; x < day.length; x++) {
            const select = day[x];

            day[x].addEventListener('click', function () {
                selectDate(select, currentDate[0]);
            })
        }
    }

    // Button to confirm reschedule
    if (saveChange != null) {
        saveChange.addEventListener('click', function () {
            saveSchedule();
        })
    }

    // Updates confirmation content
    if (dateDisplay != null) {
        const newDate = localStorage.getItem("change_date");
        dateDisplay.innerHTML = "Nov " + newDate;

        const newTime = localStorage.getItem("change_time");
        timeDisplay.innerHTML = newTime;
    }

})

/* Changes the schedule display between week and month format */
function switchDisplay(type) {
    if (type === "Week") {
        const select = document.getElementById("week");
        const deselect = document.getElementById("month");

        select.classList.add('select');
        select.classList.remove('deselect');

        deselect.classList.add('deselect');
        deselect.classList.remove('select');

        document.getElementById("weekDetail").style.setProperty('display', 'flex');
        document.getElementById("monthDetail").style.setProperty('display', 'none');
    } else {
        const select = document.getElementById("month");
        const deselect = document.getElementById("week");

        select.classList.add('select');
        select.classList.remove('deselect');

        deselect.classList.add('deselect');
        deselect.classList.remove('select');

        document.getElementById("weekDetail").style.setProperty('display', 'none');
        document.getElementById("monthDetail").style.setProperty('display', 'block');
    }
}

/* Open the reschedule page with the selected workout date */
function showReschedule(select, activeDay) {
    const selectedDay = parseInt(select.textContent, 10);
    const currentDay = parseInt(activeDay.textContent, 10);

    // Past workouts take the user to their progress
    if (selectedDay < currentDay) {
        window.location.href = "progress.html";
    }
    else {
        // Find the workout selected on the calendar
        const date = "2026-11-" + String(selectedDay).padStart(2, "0");
        const card = document.querySelector(
            `#weekDetail [data-date="${date}"]`
        );

        const name = card?.querySelector(".action-copy strong")?.textContent.trim();

        // Save the workout name for the reschedule page
        localStorage.removeItem("change_workout");

        if (name && name !== "No Workout Scheduled") {
            localStorage.setItem("change_workout", name);
        }

        window.location.href = "reschedule.html?from=" + selectedDay;
    }

}

function selectDate(select, activeDay) {
    const status = select.querySelector('span');

    if (parseInt(select.textContent) <= parseInt(activeDay.textContent)) {
        document.getElementById("dateError").style.setProperty('display', 'flex');
    } else if (status.classList.contains("workoutScheduled")) {
        document.getElementById("dateError").style.setProperty('display', 'flex');
    } else {
        document.getElementById("dateError").style.setProperty('display', 'none');

        if (document.getElementById("selected") != null) {
            document.getElementById("selected").removeAttribute("id");
        }
        select.id = "selected";
    }
}


/* Save the new workout date and time */
function saveSchedule() {
    const errorMes = document.getElementsByClassName("error")[0];
    const selectedDate = document.getElementById("selected");

    // Make sure the user selected a date
    if (selectedDate == null) {
        errorMes.style.display = "block";
        return;
    }

    // Get the original workout date from the URL
    const params = new URLSearchParams(window.location.search);
    const originalDay = Number(params.get("from"));

    // Make sure we know which workout is being moved
    if (!Number.isInteger(originalDay) || originalDay < 1 || originalDay > 31) {
        errorMes.textContent = "Please select a workout from the schedule first.";
        errorMes.style.display = "block";
        return;
    }

    errorMes.style.display = "none";

    const newDay = parseInt(selectedDate.textContent, 10);
    const newTime = document.getElementById("time").value;

    // Save the dates and time for the schedule and confirmation page
    localStorage.setItem("change_from", originalDay);
    localStorage.setItem("change_date", newDay);
    localStorage.setItem("change_time", newTime);

    window.location.href = "confirm.html";
}


/* Update the calendar after a workout is rescheduled */
function showSavedReschedule() {

    const calendar = document.querySelector(".days.dayDetail") ||
        document.querySelector(".days.availibility");


    // Only run this on the workout schedule calendar
    if (!calendar) return;

    const oldDay = Number(localStorage.getItem("change_from"));
    const newDay = Number(localStorage.getItem("change_date"));

    // Check that both dates were saved properly
    if (!Number.isInteger(oldDay) || !Number.isInteger(newDay) ||
        oldDay < 1 || oldDay > 30 ||
        newDay < 1 || newDay > 30) {
        return;
    }

    const days = Array.from(calendar.querySelectorAll("li"));

    // Find the original date and the new date
    const oldDate = days.find(day => parseInt(day.textContent, 10) === oldDay);
    const newDate = days.find(day => parseInt(day.textContent, 10) === newDay);

    if (!oldDate || !newDate || oldDate === newDate) return;

    const oldIcon = oldDate.querySelector("span");
    const newIcon = newDate.querySelector("span");

    if (!oldIcon || !newIcon) return;

    // Remove the workout icon from its original date
    oldIcon.classList.remove("workoutScheduled");
    oldIcon.classList.add("noWorkout");

    // Show the workout icon on the new date
    newIcon.classList.remove("noWorkout");
    newIcon.classList.add("workoutScheduled");
}


/* Update the weekly cards when a workout is moved */
function updateWeekSchedule() {
    const week = document.getElementById("weekDetail");

    // Only run this on the main schedule page
    if (!week) return;

    const oldDay = localStorage.getItem("change_from");
    const newDay = localStorage.getItem("change_date");

    if (!oldDay || !newDay || oldDay === newDay) return;

    // Find the original and new workout cards
    const oldDate = "2026-11-" + oldDay.padStart(2, "0");
    const newDate = "2026-11-" + newDay.padStart(2, "0");

    const oldCard = week.querySelector(`[data-date="${oldDate}"]`);
    const newCard = week.querySelector(`[data-date="${newDate}"]`);

    if (!oldCard || !newCard) return;

    const oldName = oldCard.querySelector(".action-copy strong");
    const oldDuration = oldCard.querySelector(".action-copy small");
    const newName = newCard.querySelector(".action-copy strong");
    const newDuration = newCard.querySelector(".action-copy small");

    if (!oldName || !oldDuration || !newName || !newDuration) return;

    // Keep the original workout information
    const workoutName = oldName.textContent;
    const workoutDuration = oldDuration.textContent;

    // Remove the workout from its old day
    oldName.textContent = "No Workout Scheduled";
    oldDuration.textContent = "";

    // Show the workout on its new day
    newName.textContent = workoutName;
    newDuration.textContent = workoutDuration;

    // Pass the new date if the workout is moved again
    newCard.href = "reschedule.html?from=" + newDay;
}


/* Get the workout date changes saved in the browser */
function getScheduleMoves() {
    const saved = localStorage.getItem("liftlab_schedule_moves");

    // Read the saved changes if we already have a history
    if (saved !== null) {
        try {
            const moves = JSON.parse(saved);
            return Array.isArray(moves) ? moves : [];
        } catch (error) {
            return [];
        }
    }

    // Keep the first reschedule we already saved before this change
    const oldDay = Number(localStorage.getItem("change_from"));
    const newDay = Number(localStorage.getItem("change_date"));

    if (oldDay >= 1 && oldDay <= 30 &&
        newDay >= 1 && newDay <= 30 &&
        oldDay !== newDay) {
        return [{
            from: oldDay,
            to: newDay
        }];
    }

    return [];
}

