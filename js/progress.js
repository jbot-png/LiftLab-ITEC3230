
/* Shows the workouts saved during the current week */

document.addEventListener("DOMContentLoaded", function () {
    const chart = document.querySelector(".chart");

    if (!chart) return;

    // Get the workout history saved from the summary page
    let history = [];

    try {
        history = JSON.parse(localStorage.getItem("liftlab_history") || "[]");
        if (!Array.isArray(history)) history = [];
    } catch (error) {
        history = [];
    }

    // Find Monday of the current week
    const today = new Date();
    const monday = new Date(today);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);

    const weekDates = [];
    const weeklyMinutes = [0, 0, 0, 0, 0, 0, 0];

    // Store the dates from Monday to Sunday
    for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        weekDates.push(day.toDateString());
    }

    // Add up the workout minutes for each day
    history.forEach(function (workout) {
        const workoutDate = new Date(workout.date);
        if (isNaN(workoutDate.getTime())) return;

        const dayIndex = weekDates.indexOf(workoutDate.toDateString());

        if (dayIndex !== -1) {
            weeklyMinutes[dayIndex] +=
                Math.max(0, Number(workout.durationMinutes) || 0);
        }
    });

    // Update the bars using the saved workout minutes
    const rows = chart.querySelectorAll(".bar-col");
    const maxMinutes = Math.max(60, ...weeklyMinutes);

    rows.forEach(function (row, index) {
        const bar = row.querySelector(".bar");
        const minutes = weeklyMinutes[index];

        if (!bar) return;

        // Only show a green bar when a workout was completed
        bar.textContent = "";
        bar.style.width = minutes > 0
            ? Math.max(2, (minutes / maxMinutes) * 65) + "%"
            : "0";
        bar.style.paddingRight = "0";

        // Show the actual number of minutes beside each bar
        const timeLabel = document.createElement("span");
        timeLabel.textContent = minutes + " min";
        timeLabel.style.marginLeft = "10px";
        timeLabel.style.fontSize = "13px";
        timeLabel.style.color = "var(--gray)";
        timeLabel.style.whiteSpace = "nowrap";

        row.appendChild(timeLabel);
    });

    chart.setAttribute("aria-label", "Workout minutes completed this week");
});
