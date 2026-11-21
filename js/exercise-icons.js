/* exercise-icons.js - Theo
   Stick figures so people can see what each exercise looks like.

   How to use it (load after shared.js):
   element.innerHTML = LiftLab.exerciseIcon("Bench Press");
   Exercises we don't have a drawing for get a general figure.
*/

(function () {

    // Little drawing helpers. Every icon is drawn on a 48 x 48 grid.
    const head = (x, y) =>
        `<circle cx="${x}" cy="${y}" r="3.6" fill="currentColor" stroke="none"/>`;

    // thick lines for the body
    const body = (...lines) =>
        lines.map(points => `<polyline points="${points}" stroke-width="3.2"/>`).join("");

    // thin lines for benches, machines and cables
    const gear = (...lines) =>
        lines.map(points => `<polyline points="${points}" stroke-width="2"/>`).join("");

    const floor = y =>
        `<line x1="3" y1="${y}" x2="45" y2="${y}" stroke-width="1.5" opacity="0.35"/>`;

    const block = (x, y, w, h) =>
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="currentColor" stroke="none"/>`;

    const barbell = (cx, y, half = 10) =>
        gear(`${cx - half},${y} ${cx + half},${y}`) +
        block(cx - half - 1.5, y - 4, 3, 8) +
        block(cx + half - 1.5, y - 4, 3, 8);

    const dumbbell = (cx, y, upright = false) => upright
        ? gear(`${cx},${y - 3.5} ${cx},${y + 3.5}`) +
          block(cx - 2.5, y - 4.7, 5, 2.4) + block(cx - 2.5, y + 2.3, 5, 2.4)
        : gear(`${cx - 3.5},${y} ${cx + 3.5},${y}`) +
          block(cx - 4.7, y - 2.5, 2.4, 5) + block(cx + 2.3, y - 2.5, 2.4, 5);

    // weight plate
    const plate = (cx, cy) =>
        `<circle cx="${cx}" cy="${cy}" r="4.5" stroke-width="2"/>` +
        `<circle cx="${cx}" cy="${cy}" r="1.2" fill="currentColor" stroke="none"/>`;

    // standing person from the front
    const standingFront = () =>
        head(24, 10) + body("24,14 24,29", "18,42 24,29 30,42") + floor(43);

    // standing person from the side
    const standingSide = x =>
        head(x, 9.5) + body(`${x},13.5 ${x},28`, `${x - 4},42 ${x},28 ${x + 4},42`) + floor(43);


    const ICONS = {

        /* Chest */
        "Bench Press":
            gear("6,32 38,32", "10,32 10,41", "34,32 34,41") +
            head(9, 27.5) +
            body("13,29 28,29 37,26 39,41", "17,29 17,15") +
            barbell(17, 14) + floor(42),

        "Dumbbell Press":
            gear("6,32 38,32", "10,32 10,41", "34,32 34,41") +
            head(9, 27.5) +
            body("13,29 28,29 37,26 39,41", "17,29 17,16") +
            dumbbell(17, 14) + floor(42),

        "Push-Ups":
            head(38.5, 22) +
            body("6,39 33,25", "33,25 34,40") + floor(41),

        "Machine Chest Press":
            gear("11,12 11,34 24,34", "17,34 17,41", "31,14 31,24", "31,19 40,19", "40,6 40,41") +
            head(15.5, 11) +
            body("14.5,15 15,33 27,33 28,41", "15,19 30,19") + floor(42),

        /* Back */
        "Dumbbell Row":
            head(37.8, 14.4) +
            body("14,42 18,25 23,42", "18,25 33,17", "31,18 25,23 28,29") +
            dumbbell(28, 31) + floor(43),

        "Bent-Over Row":
            head(37.8, 14.4) +
            body("14,42 18,25 23,42", "18,25 33,17", "31,18 31,28") +
            plate(31, 33) + floor(43),

        "Lat Pulldown":
            gear("24,2 24,8", "8,8 40,8", "14,34 34,34") +
            head(24, 15) +
            body("24,19 24,32", "11,8 12,20 20,21 28,21 36,20 37,8", "20,32 18,43", "28,32 30,43"),

        "Seated Cable Row":
            gear("5,35 20,35", "43,8 43,42", "21,24 43,24", "21,21 21,27", "36,29 36,40") +
            head(14.5, 13.5) +
            body("14,18 14,33 25,29 35,35", "14,20 9,25 20,24") + floor(42),

        /* Shoulders */
        "Shoulder Press":
            standingFront() +
            body("15,6 15,16 33,16 33,6") +
            dumbbell(15, 5) + dumbbell(33, 5),

        "Lateral Raise":
            standingFront() +
            body("9,17 39,17") +
            dumbbell(7, 17, true) + dumbbell(41, 17, true),

        "Front Raise":
            standingSide(20) +
            body("20,16 36,16") +
            dumbbell(38, 16, true),

        "Upright Row":
            standingFront() +
            body("21,21 13,13 20,17 28,17 35,13 27,21") +
            barbell(24, 21, 11),

        /* Biceps */
        "Bicep Curl":
            standingSide(21) +
            body("21,15 22,24 30,17") +
            dumbbell(31.5, 16),

        "Hammer Curl":
            standingSide(21) +
            body("21,15 22,24 30,17") +
            dumbbell(31, 15, true),

        "Cable Curl":
            standingSide(19) +
            body("19,15 20,24 28,17") +
            gear("27,15 30,19", "29,17 37,40") +
            `<circle cx="37" cy="40.5" r="2" stroke-width="2"/>`,

        /* Triceps */
        "Tricep Pushdown":
            gear("38,3 38,43", "31,5 38,5", "31,5 28,29", "25,29 31,29") +
            standingSide(18) +
            body("18,15 19,23 28,29"),

        "Tricep Dips":
            gear("3,26 15,26", "5,26 5,41", "13,26 13,41") +
            head(20.5, 14.3) +
            body("14,26 20,19", "20,19 20,35 31,33 33,41") + floor(42),

        "Overhead Extension":
            head(24, 14) +
            body("24,18 24,31", "18,43 24,31 30,43", "24,6 17,8 20,20 28,20 31,8 24,6") +
            dumbbell(24, 4) + floor(44),

        /* Legs */
        "Squats":
            head(25.2, 9.5) +
            body("16,28 23,14", "22,16 35,17", "16,28 28,29 26,42 31,42") + floor(43),

        "Lunges":
            head(22, 8) +
            body("22,12 22,26", "22,14 25,24", "22,26 32,28 32,42", "22,26 16,39 7,42") + floor(43),

        "Leg Press":
            gear("5,20 11,38 23,38", "17,38 17,42", "33,13 38,31") +
            head(7.5, 17.2) +
            body("9,22 13,35 23,23 35,22", "10,25 15,32") + floor(43),

        "Glute Bridge":
            head(5, 38) +
            body("9,39.5 31,25 36,41", "9,39.5 19,41") + floor(42.5),

        /* Core */
        "Plank":
            head(37.2, 27.2) +
            body("5,38 32,29", "32,29 32,39 40,39") + floor(40.5),

        "Side Plank":
            head(34.6, 21) +
            body("6,40 30,24", "30,24 30,40", "30,24 31,8") + floor(41.5),

        "Mountain Climbers":
            head(38, 19.7) +
            body("20,28 33,22", "33,22 34,41", "20,28 5,40", "20,28 28,32 24,40") + floor(42)
    };

    // used when there's no drawing for an exercise
    const GENERAL =
        standingFront() +
        body("24,16 15,27", "24,16 33,27") +
        dumbbell(14, 29, true) + dumbbell(34, 29, true);


    // gives back the <svg> for an exercise name
    function exerciseIcon(name) {
        const drawing = ICONS[name] || GENERAL;

        return `
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                ${drawing}
            </svg>
        `;
    }

    window.LiftLab = window.LiftLab || {};
    window.LiftLab.exerciseIcon = exerciseIcon;
    window.LiftLab.exerciseIconNames = Object.keys(ICONS);

})();
