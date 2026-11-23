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
    highlightToday();

    // Set up the workout links in Week View
    const weekCards = document.querySelectorAll("#weekDetail .action-row");

    weekCards.forEach(function (card) {
        const workoutName = card.querySelector(".action-copy strong")?.textContent.trim();
        const date = card.getAttribute("data-date");

        // Don't allow empty workout days to be opened
        if (!workoutName || workoutName === "No Workout Scheduled") {
            card.removeAttribute("href");
            card.style.cursor = "default";
            return;
        }

        // Keep completed workouts linked to Progress
        if (card.getAttribute("href") === "progress.html") return;

        if (!date) return;

        // Open the correct workout date
        card.href = "reschedule.html?from=" + Number(date.slice(-2));

        // Remember which workout the user selected
        card.addEventListener("click", function () {
            localStorage.setItem("change_workout", workoutName);
        });
    });




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


/* Open the selected workout from Month View */
function showReschedule(select) {
    const selectedDay = parseInt(select.textContent, 10);
    const workoutIcon = select.querySelector("span");

    // Ignore empty dates or days without workouts
    if (!workoutIcon ||
        !workoutIcon.classList.contains("workoutScheduled") ||
        isNaN(selectedDay)) {
        return;
    }

    // Find the workout in the weekly schedule
    const date = "2026-11-" +
        String(selectedDay).padStart(2, "0");

    const card = document.querySelector(
        `#weekDetail [data-date="${date}"]`
    );

    // Only known workouts can be opened
    if (!card) {
        alert("Workout details are available for the current week only.");
        return;
    }

    // Match workouts already linked to Progress in Week View
    if (card.getAttribute("href") === "progress.html") {
        window.location.href = "progress.html";
        return;
    }


    const workoutName = card.querySelector(
        ".action-copy strong"
    )?.textContent.trim();

    if (!workoutName ||
        workoutName === "No Workout Scheduled") {
        return;
    }

    // Past workouts open Progress instead
    const selectedDate = new Date(2026, 10, selectedDay);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        window.location.href = "progress.html";
        return;
    }

    // Remember the correct workout
    localStorage.setItem("change_workout", workoutName);

    window.location.href =
        "reschedule.html?from=" + selectedDay;
}



/* Check whether a new workout date can be selected */
function selectDate(select, activeDay) {
    const status = select.querySelector("span");
    const error = document.getElementById("dateError");
    const selectedDay = parseInt(select.textContent, 10);

    // Get the date of the workout being moved
    const params = new URLSearchParams(window.location.search);
    const originalDay = Number(params.get("from"));

    // Use today's real date instead of the highlighted demo date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newDate = new Date(2026, 10, selectedDay);

    // Clear any previous selection
    const previousSelection = document.getElementById("selected");
    if (previousSelection) {
        previousSelection.removeAttribute("id");
    }

    if (!status || !error || isNaN(selectedDay)) return;

    // Don't allow past dates, the same date, or occupied dates
    if (newDate <= today ||
        selectedDay === originalDay ||
        status.classList.contains("workoutScheduled")) {

        error.style.display = "flex";
        return;
    }

    // Accept the available date
    error.style.display = "none";
    select.id = "selected";
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


    // Save every workout date change
    const moves = getScheduleMoves();

    moves.push({
        from: originalDay,
        to: newDay
    });

    localStorage.setItem("liftlab_schedule_moves", JSON.stringify(moves));

    // Keep the latest change for the confirmation page
    localStorage.setItem("change_from", originalDay);
    localStorage.setItem("change_date", newDay);
    localStorage.setItem("change_time", newTime);


    window.location.href = "confirm.html";
}



/* Update the calendar using all saved workout date changes */
function showSavedReschedule() {
    const calendar = document.querySelector(".days.dayDetail") ||
        document.querySelector(".days.availibility");

    // Only run this on pages with a calendar
    if (!calendar) return;

    const moves = getScheduleMoves();
    const days = Array.from(calendar.querySelectorAll("li"));

    // Apply each saved date change in order
    moves.forEach(function (move) {
        const oldDay = Number(move.from);
        const newDay = Number(move.to);

        const oldDate = days.find(day =>
            parseInt(day.textContent, 10) === oldDay
        );

        const newDate = days.find(day =>
            parseInt(day.textContent, 10) === newDay
        );

        if (!oldDate || !newDate || oldDate === newDate) return;

        const oldIcon = oldDate.querySelector("span");
        const newIcon = newDate.querySelector("span");

        if (!oldIcon || !newIcon) return;

        // Remove the workout from its previous date
        oldIcon.classList.remove("workoutScheduled");
        oldIcon.classList.add("noWorkout");

        // Show the workout on its new date
        newIcon.classList.remove("noWorkout");
        newIcon.classList.add("workoutScheduled");
    });
}




/* Update the weekly schedule using all saved date changes */
function updateWeekSchedule() {
    const week = document.getElementById("weekDetail");

    // Only run this on the main schedule page
    if (!week) return;

    const moves = getScheduleMoves();

    // Apply each workout move in order
    moves.forEach(function (move) {
        const oldDay = String(move.from).padStart(2, "0");
        const newDay = String(move.to).padStart(2, "0");

        if (oldDay === newDay) return;

        const oldCard = week.querySelector(
            `[data-date="2026-11-${oldDay}"]`
        );

        const newCard = week.querySelector(
            `[data-date="2026-11-${newDay}"]`
        );

        if (!oldCard || !newCard) return;

        const oldName = oldCard.querySelector(".action-copy strong");
        const oldDuration = oldCard.querySelector(".action-copy small");
        const newName = newCard.querySelector(".action-copy strong");
        const newDuration = newCard.querySelector(".action-copy small");

        if (!oldName || !oldDuration || !newName || !newDuration) return;

        // Only move a workout into an empty day
        if (oldName.textContent.trim() === "No Workout Scheduled" ||
            newName.textContent.trim() !== "No Workout Scheduled") {
            return;
        }

        // Remember the workout details before moving them
        const workoutName = oldName.textContent;
        const workoutDuration = oldDuration.textContent;

        // Clear the previous day
        oldName.textContent = "No Workout Scheduled";
        oldDuration.textContent = "";

        // Show the workout on its new day
        newName.textContent = workoutName;
        newDuration.textContent = workoutDuration;

        // Remember the date if this workout is moved again
        newCard.href = "reschedule.html?from=" + Number(move.to);
    });
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


/* Highlight today's date on the schedule */
function highlightToday() {

    // Remove any old date highlights before marking today
    const oldHighlights = document.querySelectorAll(
        "#weekDetail .activeDay, .days .activeDay"
    );

    oldHighlights.forEach(function (day) {
        day.classList.remove("activeDay");
    });

    const today = new Date();

    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    // Highlight today in Week View if it's displayed
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const weekCard = document.querySelector(
        `#weekDetail [data-date="${date}"]`
    );

    if (weekCard) {
        weekCard.classList.add("activeDay");
    }

    // The current prototype calendar displays November 2026
    if (year === 2026 && month === 10) {
        const calendars = document.querySelectorAll(
            ".days.dayDetail, .days.availibility"
        );

        calendars.forEach(function (calendar) {
            const dates = Array.from(calendar.querySelectorAll("li"));

            const todayCell = dates.find(function (cell) {
                return parseInt(cell.textContent, 10) === day;
            });

            if (todayCell) {
                todayCell.classList.add("activeDay");
            }
        });
    }
}


/* Allow users to browse months on both calendar pages */
document.addEventListener("DOMContentLoaded", function () {
    const calendar = document.querySelector(
        ".days.dayDetail, .days.availibility"
    );

    const previousButton = document.querySelector(".month .prev");
    const nextButton = document.querySelector(".month .next");
    const monthLabel = document.querySelector(".month ul li:last-child");

    if (!calendar || !previousButton || !nextButton || !monthLabel) {
        return;
    }

    // Keep the original November calendar and its click events
    const novemberDays = Array.from(calendar.children);

    let displayYear = 2026;
    let displayMonth = 10; // November (January = 0)

    const message = document.createElement("p");
    message.style.textAlign = "center";
    message.style.marginTop = "10px";
    message.style.fontSize = "13px";
    message.style.display = "none";
    calendar.after(message);

    function renderMonth() {
        const date = new Date(displayYear, displayMonth, 1);

        displayYear = date.getFullYear();
        displayMonth = date.getMonth();

        const monthName = date.toLocaleString("en-US", {
            month: "long"
        });

        monthLabel.innerHTML =
            monthName + "<br><span>" + displayYear + "</span>";

        // Restore November with its existing workouts and events
        if (displayYear === 2026 && displayMonth === 10) {
            calendar.replaceChildren(...novemberDays);
            message.style.display = "none";
            return;
        }

        // Display the correct dates for other months
        calendar.replaceChildren();

        const firstDay = new Date(
            displayYear, displayMonth, 1
        ).getDay();

        const daysInMonth = new Date(
            displayYear, displayMonth + 1, 0
        ).getDate();

        // Add empty spaces before the first day
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement("li");
            empty.className = "empty-date";
            calendar.appendChild(empty);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement("li");
            cell.textContent = day;
            calendar.appendChild(cell);
        }

        // This prototype stores its demo workouts in November
        message.textContent =
            "Workout scheduling is available in November 2026 only.";
        message.style.display = "block";
    }

    previousButton.style.cursor = "pointer";
    nextButton.style.cursor = "pointer";

    previousButton.addEventListener("click", function () {
        displayMonth--;
        renderMonth();
    });

    nextButton.addEventListener("click", function () {
        displayMonth++;
        renderMonth();
    });
});



