
/* Handles the Daily Check-In page */

document.addEventListener("DOMContentLoaded", function () {

    // Get the form and error message
    const form = document.getElementById("checkin-form");
    const errorMessage = document.getElementById("checkin-error");

    // Get all four energy options
    const energyOptions = document.querySelectorAll(
        'input[name="energy"]'
    );

    // Hide the error when the user selects an option
    energyOptions.forEach(function (option) {
        option.addEventListener("change", function () {
            errorMessage.hidden = true;
        });
    });

    // Runs when the user clicks Continue
    form.addEventListener("submit", function (event) {

        // Stop the page from refreshing
        event.preventDefault();

        // Find which energy level was selected
        const selectedEnergy = document.querySelector(
            'input[name="energy"]:checked'
        );

        // Show an error if nothing was selected
        if (!selectedEnergy) {
            errorMessage.hidden = false;
            energyOptions[0].focus();
            return;
        }

        // Hide the error after a valid selection
        errorMessage.hidden = true;

        // Save the selection using our shared JavaScript
        LiftLab.saveEnergyLevel(selectedEnergy.value);

        // Move to Omar's Workout Preferences page
        window.location.href = "preferences.html";

    });

});
