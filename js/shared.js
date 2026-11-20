/* Icons used throughout the app */

const icons = {

    dumbbell: `

        <path d="m6.5 6.5 11 11"/>

        <path d="m21 21-1-1 M3 3l1 1"/>

        <path d="m18 22 4-4 M2 6l4-4"/>

        <path d="m3 10 7-7 M14 21l7-7"/>

    `,



    "calendar-check": `

        <rect x="3" y="4" width="18" height="18" rx="2"/>

        <path d="M8 2v4 M16 2v4 M3 10h18"/>

        <path d="m9 16 2 2 4-4"/>

    `,



    "heart-pulse": `

        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7

        l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21

        l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z"/>

        <path d="M3.5 12H8l2-3 3 6 2-3h5"/>

    `,



    layers: `

        <path d="m12 2 9 5-9 5-9-5 9-5Z"/>

        <path d="m3 12 9 5 9-5"/>

        <path d="m3 17 9 5 9-5"/>

    `,



    chart: `

        <path d="M3 3v18h18"/>

        <rect x="7" y="12" width="3" height="6"/>

        <rect x="12" y="8" width="3" height="10"/>

        <rect x="17" y="5" width="3" height="13"/>

    `,



    calendar: `

        <rect x="3" y="4" width="18" height="18" rx="2"/>

        <path d="M8 2v4 M16 2v4 M3 10h18"/>

        <path d="M7 14h3 M14 14h3 M7 18h3"/>

    `,



    "chevron-right": `

        <path d="m9 18 6-6-6-6"/>

    `,



    home: `

        <path d="m3 10 9-7 9 7"/>

        <path d="M5 9v12h14V9"/>

        <path d="M9 21v-7h6v7"/>

    `,



    user: `

        <circle cx="12" cy="8" r="4"/>

        <path d="M4 21c0-4.5 3.6-7 8-7s8 2.5 8 7"/>

    `

};



/* Finds the icon names in HTML and displays them */

function loadIcons() {

    document.querySelectorAll("[data-icon]").forEach(element => {

        const iconName = element.dataset.icon;



        if (icons[iconName]) {

            element.innerHTML = `

                <svg viewBox="0 0 24 24"

                     fill="none"

                     stroke="currentColor"

                     stroke-width="2"

                     stroke-linecap="round"

                     stroke-linejoin="round"

                     aria-hidden="true">

                    ${icons[iconName]}

                </svg>

            `;

        }

    });

}



/* Save the energy level selected during check-in */

function saveEnergyLevel(energy) {

    const validOptions = ["great", "fine", "tired", "unwell"];



    if (validOptions.includes(energy)) {

        localStorage.setItem("liftlab_energy", energy);

    }

}



/* Get the saved energy level on another page */

function getEnergyLevel() {

    return localStorage.getItem("liftlab_energy");

}



/* Other pages can use these functions too */

window.LiftLab = {

    saveEnergyLevel,

    getEnergyLevel,

    loadIcons

};



/* Load the icons when the page is ready */

document.addEventListener("DOMContentLoaded", loadIcons);