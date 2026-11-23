const confirmData = {
    date: "0",
    time: "1:00am",
    workout: "Upper Body"
}

document.addEventListener("DOMContentLoaded", function(){
    const nav = document.getElementsByClassName("schedule-nav");
    const days = document.getElementsByClassName("dayDetail");
    const availDays = document.getElementsByClassName("availibility");
    const currentDate = document.getElementsByClassName("activeDay");
    const saveChange = document.getElementById("save-schedule");
    const dateDisplay = document.getElementById("date-display");
    const timeDisplay = document.getElementById("time-display");

    // Buttons for schedule display type
    if(nav.length != 0){
        const navButtons = nav[0].children;

        for (x=0; x < navButtons.length; x++) {
            const button = navButtons[x];

            button.addEventListener("click", function(){
            switchDisplay(button.textContent);
        })
    }
    }

    // Buttons for seeing the details of a specific day
    for (x=0; x < days.length; x++){
        const eachDay = days[x].children;

        for (x=0; x < eachDay.length; x++){
            const select = eachDay[x];

            eachDay[x].addEventListener('click', function(){
                showReschedule(select, currentDate[1]);
            })
        }
    }

    // Buttons for changing the scheduled date
    for (x=0; x < availDays.length; x++){
        const day = availDays[x].children;

        for (x=0; x < day.length; x++){
            const select = day[x];
            
            day[x].addEventListener('click', function(){
                selectDate(select, currentDate[0]);
            })
        }
    }

    // Button to confirm reschedule
    if (saveChange != null){
        saveChange.addEventListener('click', function(){
            saveSchedule();
        })
    }

    // Updates confirmation content
    if (dateDisplay != null){
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

/* Shows the reschedule page based on the date selected */
function showReschedule(select, activeDay){
    if(parseInt(select.textContent) < parseInt(activeDay.textContent)) {
        window.location.href = "progress.html";
    } else {
        //editDay.setProperty('date', select.textContent);
        window.location.href = "reschedule.html";
    }
}

function selectDate(select, activeDay){
    const status = select.querySelector('span');

    if(parseInt(select.textContent) <= parseInt(activeDay.textContent)) {
        document.getElementById("dateError").style.setProperty('display', 'flex');
    } else if(status.classList.contains("workoutScheduled")) {
        document.getElementById("dateError").style.setProperty('display', 'flex');
    } else {
        document.getElementById("dateError").style.setProperty('display', 'none');
        
        if(document.getElementById("selected") != null){
            document.getElementById("selected").removeAttribute("id");
        }
        select.id = "selected";
    }
}

function saveSchedule() {
    const errorMes = document.getElementsByClassName("error")[0];
    if(document.getElementById("selected") == null){
        errorMes.style.setProperty('display', 'block');
        return;
    }
    
    errorMes.style.setProperty('display', 'none');
    const dateSelect = document.getElementById("selected").textContent;

    localStorage.setItem("change_date", dateSelect);
    localStorage.setItem("change_time", document.getElementById("time").value);

    window.location.href = "confirm.html";
}