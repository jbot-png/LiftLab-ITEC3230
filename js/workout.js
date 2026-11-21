/* workout.js - Theo (Part 3)
   Used by customize.html, workout.html and summary.html.
   Each page has data-page on the body so we know which setup function to run.

   localStorage keys:
   liftlab_workout         Omar's recommended workout (we only read this)
   liftlab_custom_workout  the workout after the user customizes it
   liftlab_progress        checked exercises + start time during a workout
   liftlab_last_session    the workout that was just finished (summary page)
   liftlab_history         all saved workouts (Emily's progress page can read this)
   liftlab_workout_status  "in-progress" or "completed"

   Omar: save the workout like this, using exercise names from EXERCISE_LIBRARY
   { name: "Upper Body", duration: 45,
     exercises: [ { name: "Bench Press", muscle: "chest", sets: 3, reps: 10 } ] }
*/

const KEYS = {
    recommended: "liftlab_workout",
    custom: "liftlab_custom_workout",
    progress: "liftlab_progress",
    lastSession: "liftlab_last_session",
    history: "liftlab_history",
    status: "liftlab_workout_status"
};

// Exercises the user can swap between (each one has a picture in exercise-icons.js)
const EXERCISE_LIBRARY = {
    chest: { unit: "reps", options: ["Bench Press", "Dumbbell Press", "Push-Ups", "Machine Chest Press"] },
    back: { unit: "reps", options: ["Dumbbell Row", "Bent-Over Row", "Lat Pulldown", "Seated Cable Row"] },
    shoulders: { unit: "reps", options: ["Shoulder Press", "Lateral Raise", "Front Raise", "Upright Row"] },
    biceps: { unit: "reps", options: ["Bicep Curl", "Hammer Curl", "Cable Curl"] },
    triceps: { unit: "reps", options: ["Tricep Pushdown", "Tricep Dips", "Overhead Extension"] },
    legs: { unit: "reps", options: ["Squats", "Lunges", "Leg Press", "Glute Bridge"] },
    core: { unit: "sec", options: ["Plank", "Side Plank", "Mountain Climbers"] }
};

// Used when Omar's page hasn't saved a workout yet, so we can still test
const SAMPLE_WORKOUT = {
    name: "Upper Body",
    duration: 45,
    exercises: [
        { name: "Bench Press", muscle: "chest", sets: 3, reps: 10 },
        { name: "Shoulder Press", muscle: "shoulders", sets: 3, reps: 12 },
        { name: "Dumbbell Row", muscle: "back", sets: 3, reps: 10 },
        { name: "Bicep Curl", muscle: "biceps", sets: 3, reps: 12 },
        { name: "Tricep Pushdown", muscle: "triceps", sets: 3, reps: 12 }
    ]
};

// Min and max for the + / - buttons
const LIMITS = {
    sets: { min: 1, max: 10, step: 1 },
    reps: { min: 1, max: 30, step: 1 },
    sec: { min: 10, max: 120, step: 5 }
};

// A few extra icons for our pages (shared.js draws them when the page loads)
icons.check = `<path d="M20 6 9 17l-5-5"/>`;
icons.swap = `<path d="M7 4 3 8l4 4"/><path d="M3 8h14"/><path d="m17 20 4-4-4-4"/><path d="M21 16H7"/>`;
icons["chevron-left"] = `<path d="m15 18-6-6 6-6"/>`;


// ===== helper functions =====

function load(key) {
    return JSON.parse(localStorage.getItem(key));
}

function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function limit(value, range) {
    return Math.min(range.max, Math.max(range.min, value));
}

function getIcon(name) {
    return LiftLab.exerciseIcon(name);
}

function findMuscle(exerciseName) {
    for (const muscle in EXERCISE_LIBRARY) {
        if (EXERCISE_LIBRARY[muscle].options.includes(exerciseName)) {
            return muscle;
        }
    }
    return null;
}

function describe(exercise) {
    return exercise.sets + " x " + exercise.reps + " " + exercise.unit;
}

// "Dumbbell Press" -> "DB Press" so it fits on the summary
function shortName(name) {
    return name.replace("Dumbbell", "DB");
}

// Fills in anything missing (unit, original name) so the pages can rely on it
function cleanWorkout(workout) {
    if (!workout || !workout.exercises || workout.exercises.length === 0) {
        return null;
    }

    const exercises = workout.exercises.map(function (ex) {
        const original = ex.original || ex.name;
        const muscle = findMuscle(original);
        const unit = muscle ? EXERCISE_LIBRARY[muscle].unit : "reps";

        return {
            name: ex.name,
            original: original,
            muscle: muscle,
            unit: unit,
            sets: limit(ex.sets || 3, LIMITS.sets),
            reps: limit(ex.reps || 10, LIMITS[unit])
        };
    });

    return {
        name: workout.name || "Today's Workout",
        duration: workout.duration || 45,
        exercises: exercises
    };
}

function getRecommendedWorkout() {
    return cleanWorkout(load(KEYS.recommended)) || cleanWorkout(SAMPLE_WORKOUT);
}

// Use the customized workout only if it came from the current recommendation
function getWorkout() {
    const custom = load(KEYS.custom);
    const recommended = getRecommendedWorkout();

    if (custom && custom.basedOn === recommended.name) {
        return cleanWorkout(custom);
    }
    return recommended;
}

function saveCustomWorkout(workout) {
    workout.basedOn = getRecommendedWorkout().name;
    save(KEYS.custom, workout);
}

// Did the user change anything from the recommendation?
function wasCustomized(workout) {
    const recommended = getRecommendedWorkout();

    return workout.exercises.some(function (ex, i) {
        const start = recommended.exercises[i];
        return ex.name !== start.name || ex.sets !== start.sets || ex.reps !== start.reps;
    });
}

function startProgress(workout) {
    const progress = {
        startedAt: Date.now(),
        completed: workout.exercises.map(function () { return false; })
    };
    save(KEYS.progress, progress);
    localStorage.setItem(KEYS.status, "in-progress");
    return progress;
}


// ===== customize.html =====

function setUpCustomize() {
    const workout = getWorkout();
    let current = 0;

    const position = document.getElementById("exercise-position");
    const prevBtn = document.getElementById("prev-exercise");
    const nextBtn = document.getElementById("next-exercise");
    const currentIcon = document.getElementById("current-icon");
    const currentName = document.getElementById("current-name");
    const replacedNote = document.getElementById("replaced-note");
    const originalName = document.getElementById("original-name");
    const undoBtn = document.getElementById("undo-replace");
    const repsLabel = document.getElementById("reps-label");
    const hint = document.getElementById("limit-hint");
    const options = document.getElementById("replace-options");
    const status = document.getElementById("customize-status");

    function getRange(field, exercise) {
        return field === "sets" ? LIMITS.sets : LIMITS[exercise.unit];
    }

    // The green card at the top
    function showCard() {
        const ex = workout.exercises[current];
        const repsWord = ex.unit === "sec" ? "Seconds" : "Reps";

        currentIcon.innerHTML = getIcon(ex.name);
        currentName.textContent = ex.name;
        replacedNote.hidden = ex.name === ex.original;
        originalName.textContent = ex.original;

        repsLabel.textContent = repsWord;
        hint.textContent = "Sets " + LIMITS.sets.min + "-" + LIMITS.sets.max +
            " | " + repsWord + " " + LIMITS[ex.unit].min + "-" + LIMITS[ex.unit].max;

        ["sets", "reps"].forEach(function (field) {
            const range = getRange(field, ex);
            document.getElementById(field + "-value").textContent = ex[field];
            document.getElementById(field + "-minus").disabled = ex[field] <= range.min;
            document.getElementById(field + "-plus").disabled = ex[field] >= range.max;
        });
    }

    // The "Replace With" list
    function showOptions() {
        const ex = workout.exercises[current];
        const group = EXERCISE_LIBRARY[ex.muscle];
        let html = "";

        if (group) {
            group.options.forEach(function (name) {
                if (name === ex.original) return;

                html += `
                    <label class="replace-option">
                        <span class="exercise-icon">${getIcon(name)}</span>
                        <span class="replace-name">${name}</span>
                        <input type="radio" name="replacement" value="${name}"
                               ${name === ex.name ? "checked" : ""}>
                    </label>
                `;
            });
        }

        options.innerHTML = html;
    }

    function showPage() {
        position.textContent = workout.name + " - Exercise " + (current + 1) +
            " of " + workout.exercises.length;
        prevBtn.disabled = current === 0;
        nextBtn.disabled = current === workout.exercises.length - 1;
        status.textContent = "";
        showCard();
        showOptions();
    }

    prevBtn.addEventListener("click", function () {
        current--;
        showPage();
    });

    nextBtn.addEventListener("click", function () {
        current++;
        showPage();
    });

    // User picked a different exercise
    options.addEventListener("change", function (event) {
        const ex = workout.exercises[current];
        ex.name = event.target.value;
        saveCustomWorkout(workout);
        showCard();
        status.textContent = "Replaced " + ex.original + " with " + ex.name + ".";
    });

    undoBtn.addEventListener("click", function () {
        const ex = workout.exercises[current];
        ex.name = ex.original;
        saveCustomWorkout(workout);
        showCard();
        showOptions();
        status.textContent = "Back to " + ex.original + ".";
        currentName.focus();
    });

    // + and - buttons for sets and reps
    document.querySelectorAll(".stepper-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            const ex = workout.exercises[current];
            const field = button.dataset.field;
            const range = getRange(field, ex);

            ex[field] = limit(ex[field] + Number(button.dataset.change) * range.step, range);
            saveCustomWorkout(workout);
            showCard();
        });
    });

    document.getElementById("save-changes").addEventListener("click", function () {
        saveCustomWorkout(workout);
        startProgress(workout);
        window.location.href = "workout.html";
    });

    showPage();
}


// ===== workout.html =====

function setUpWorkout() {
    const workout = getWorkout();
    let progress = load(KEYS.progress);

    // No saved progress for this workout, so start a new one
    if (!progress || progress.completed.length !== workout.exercises.length) {
        progress = startProgress(workout);
    }

    const subtitle = document.getElementById("workout-subtitle");
    const count = document.getElementById("workout-count");
    const percent = document.getElementById("progress-percent");
    const track = document.getElementById("progress-track");
    const fill = document.getElementById("progress-fill");
    const list = document.getElementById("checklist");
    const finishBtn = document.getElementById("finish-workout");
    const warning = document.getElementById("finish-warning");
    const warningText = document.getElementById("finish-warning-text");

    subtitle.textContent = wasCustomized(workout) ? workout.name + " (customized)" : workout.name;

    let html = "";
    workout.exercises.forEach(function (ex, i) {
        html += `
            <li>
                <label class="check-item">
                    <input type="checkbox" data-index="${i}" ${progress.completed[i] ? "checked" : ""}>
                    <span class="check-box" aria-hidden="true"><span data-icon="check"></span></span>
                    <span class="exercise-icon">${getIcon(ex.name)}</span>
                    <span class="check-text">
                        <strong>${ex.name}</strong>
                        <small>${describe(ex)}</small>
                    </span>
                </label>
            </li>
        `;
    });
    list.innerHTML = html;

    function countDone() {
        return progress.completed.filter(function (done) { return done; }).length;
    }

    function updateProgress() {
        const done = countDone();
        const total = progress.completed.length;
        const pct = Math.round(done / total * 100);

        count.textContent = done + " of " + total + " done";
        percent.textContent = pct + "%";
        fill.style.width = pct + "%";
        track.setAttribute("aria-valuenow", pct);
    }

    list.addEventListener("change", function (event) {
        progress.completed[event.target.dataset.index] = event.target.checked;
        save(KEYS.progress, progress);
        warning.hidden = true;
        updateProgress();
    });

    // Save the finished workout and go to the summary
    function finish() {
        const now = Date.now();
        const exercises = [];
        const changes = [];
        let setsDone = 0;

        workout.exercises.forEach(function (ex, i) {
            exercises.push({
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                unit: ex.unit,
                completed: progress.completed[i]
            });

            if (progress.completed[i]) setsDone += ex.sets;
            if (ex.name !== ex.original) changes.push({ from: ex.original, to: ex.name });
        });

        save(KEYS.lastSession, {
            id: "workout-" + now,
            name: workout.name,
            date: new Date(now).toISOString(),
            durationMinutes: Math.max(1, Math.round((now - progress.startedAt) / 60000)),
            energy: LiftLab.getEnergyLevel(),
            exercisesCompleted: countDone(),
            exercisesTotal: exercises.length,
            setsCompleted: setsDone,
            changes: changes,
            exercises: exercises,
            saved: false
        });

        localStorage.removeItem(KEYS.progress);
        window.location.href = "summary.html";
    }

    finishBtn.addEventListener("click", function () {
        const left = progress.completed.length - countDone();

        if (left === 0) {
            finish();
            return;
        }

        // Some exercises aren't checked yet, so ask first
        warningText.textContent = "You still have " + left +
            (left === 1 ? " exercise" : " exercises") + " left. Finish anyway?";
        warning.hidden = false;
    });

    document.getElementById("keep-going").addEventListener("click", function () {
        warning.hidden = true;
    });

    document.getElementById("finish-anyway").addEventListener("click", finish);

    LiftLab.loadIcons();
    updateProgress();
}


// ===== summary.html =====

function setUpSummary() {
    const session = load(KEYS.lastSession);

    // Nothing to show if the user hasn't finished a workout
    if (!session) {
        document.getElementById("summary-content").hidden = true;
        document.getElementById("summary-empty").hidden = false;
        return;
    }

    const date = new Date(session.date).toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric"
    });

    document.getElementById("summary-subtitle").textContent = session.name + " - " + date;
    document.getElementById("stat-exercises").textContent =
        session.exercisesCompleted + " / " + session.exercisesTotal;
    document.getElementById("stat-time").textContent = session.durationMinutes + " min";
    document.getElementById("stat-sets").textContent = session.setsCompleted;

    let changedHTML = "None";
    if (session.changes.length > 0) {
        changedHTML = session.changes.map(function (c) {
            return "<span>" + shortName(c.from) + " &rarr; " + shortName(c.to) + "</span>";
        }).join("");
    }
    document.getElementById("stat-changed").innerHTML = changedHTML;

    const saveBtn = document.getElementById("save-workout");
    const viewProgressBtn = document.getElementById("view-progress");
    const confirmation = document.getElementById("save-confirmation");

    function showSaved() {
        saveBtn.hidden = true;
        viewProgressBtn.hidden = false;
        confirmation.hidden = false;
    }

    saveBtn.addEventListener("click", function () {
        const history = load(KEYS.history) || [];

        // Don't add the same workout twice
        const alreadySaved = history.some(function (entry) { return entry.id === session.id; });
        if (!alreadySaved) {
            history.push(session);
            save(KEYS.history, history);
        }

        session.saved = true;
        save(KEYS.lastSession, session);
        localStorage.setItem(KEYS.status, "completed");
        localStorage.removeItem(KEYS.custom);

        showSaved();
        confirmation.focus();
    });

    if (session.saved) {
        showSaved();
    }
}


// ===== start the right page =====

document.addEventListener("DOMContentLoaded", function () {
    const page = document.body.dataset.page;

    if (page === "customize") setUpCustomize();
    if (page === "workout") setUpWorkout();
    if (page === "summary") setUpSummary();
});
