/* ChangeTaxi.js file that contains the functions to change taxi, function to change vehicle and 
function to go back to view.html page
*/

"use strict"
//To check availability of a taxi
let taxiAvailability = storageDataRetrieval(TAXI_AVAILABILITY_KEY);
newBookingList = new BookingList;
newBookingList.fromData(storageDataRetrieval(APP_DATA_KEY));
let index = storageDataRetrieval(BOOKING_CONTENT_KEY);
let taxiToBeChanged = null;
let taxiToBeChangedIndex = 0;
let changedFlag = false;
let longitudes = [];//initialise longitudes
let latitudes = [];//initialise latitudes

// To find the specific data the user want to display
for (let i = 0; i < newBookingList.bookingHistory.length; i++) {
    if ((newBookingList.bookingHistory[i].bookingIndex) == index) {
        taxiToBeChanged = newBookingList.bookingHistory[i]
        taxiToBeChangedIndex = i;
    }
}

// || Contains previous data of taxi type chose as well as the index of the vehicle in taxiList.  ||
//~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.
let previousDecisionIndex = taxiToBeChanged.prevDecisionIndex;
let previousTaxi = taxiToBeChanged.prevTaxi;
//...................................................................................



// || Determination of whether the time of current booking is advanced booking or current booking.  ||
//~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.
let startDate = new Date(taxiToBeChanged.startDate);
let currentDate = new Date();


let time = parseInt((taxiToBeChanged.startTime).slice(0, 2));
let currentHour = currentDate.getHours();

let startTimeComparison = 0;
let currentTimeComparison = 0;

let dateCondition = (startDate > currentDate);
let timeCondition = true;

if (time == 0) {
    startTimeComparison = 24;
}

if (currentHour == 0) {
    currentTimeComparison = 24;
}


if (((startDate.getDate - currentDate.getDate) == 1) && (startTimeComparison > currentTimeComparison)) {
    timeCondition = false;
}

let advancedBooking = (dateCondition && timeCondition);

//------------------------------------------------------------------------------------------------


// || Initialising the addresses coordinates (i.e. longitudes and latitudes). ||
//~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.
longitudes.push(taxiToBeChanged.pickUpPoint[0]);
latitudes.push(taxiToBeChanged.pickUpPoint[1]);

for (let j = 0; j < taxiToBeChanged.addPoint.length; j++) {
    longitudes.push(taxiToBeChanged.addPoint[j][0]);
    latitudes.push(taxiToBeChanged.addPoint[j][1]);
}

longitudes.push(taxiToBeChanged.finalPoint[0]);
latitudes.push(taxiToBeChanged.finalPoint[1]);
//...................................................................................



// || Following functions  allow users to choose a vehicle while updating the taxiList||
//~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.
/* Description:
selectCar function without nay parameters
This function checks the availability of the particular taxi type selected  by the user and allows selection if it is available
*/
function selectCar() {
    //Declare the availability of car is false (i.e. Not available)
    let availability = false;
    //Index in the taxiList.
    let taxiIndex = 0;
    while ((availability == false) && (taxiIndex < taxiAvailability.length)) {
        if (taxiAvailability[taxiIndex].type == "Car") {

            //This if-statement basically only processes cars when previous choice of vehicle was made before 
            //(also has to be not a car) and change the taxi acquired to the first car in taxiList 
            if ((taxiAvailability[taxiIndex].available) && (previousDecisionIndex != null) && (previousTaxi != "Car")) {

                availability = true;
                taxiAvailability[taxiIndex].available = false;
                taxiAvailability[previousDecisionIndex].available = true;
                previousDecisionIndex = taxiIndex;
                previousTaxi = "Car";

                taxiToBeChanged.taxiRego = taxiAvailability[taxiIndex].rego;
                taxiToBeChanged.taxiType = taxiAvailability[taxiIndex].type;
                taxiToBeChanged.setFareAndDistance(longitudes, latitudes, "Car", advancedBooking, time);
                changedFlag = true;

                document.getElementById("distanceOutput").innerHTML = `${taxiToBeChanged.distance.toFixed(2)}km`;
                document.getElementById("fareOutput").innerHTML = `RM${taxiToBeChanged.fare.toFixed(2)}`;
            }
            //As for this if-statement, it processes the car as a choice when this is the user first choice
            else if ((previousDecisionIndex == null) && (taxiAvailability[taxiIndex].available)) {
                availability = true;
                taxiAvailability[taxiIndex].available = false;
                previousDecisionIndex = taxiIndex;
                previousTaxi = "Car"

                taxiToBeChanged.taxiRego = taxiAvailability[taxiIndex].rego
                taxiToBeChanged.taxiType = taxiAvailability[taxiIndex].type;
                taxiToBeChanged.setFareAndDistance(longitudes, latitudes, "Car", advancedBooking, time);
                changedFlag = true;

                document.getElementById("distanceOutput").innerHTML = `${taxiToBeChanged.distance.toFixed(2)}km`;
                document.getElementById("fareOutput").innerHTML = `RM${taxiToBeChanged.fare.toFixed(2)}`;;
            }

            //This if-statement will return nothing when user choose car again when previous choice of vehicle is a car as well.
            else if (previousTaxi == "Car") {
                return
            }

            else {
                taxiIndex++;
            }

        }
        else {
            taxiIndex++;
        }
    }
    if (availability == false) {
        alert("Sorry. Sedans are no longer available. Please choose another vehicle of transport.");
        return;
    }

    else {
        alert("Great! You have chosen a Sedan as your vehicle of transport!");
        taxiToBeChanged.prevDecisionIndex = previousDecisionIndex;
        taxiToBeChanged.prevTaxi = previousTaxi;
        return;

    }
}

/* Description:
selectSUV function without any parameters
This function checks if an SUV is available for the user
*/
function selectSUV() {
    //Declare the availability of SUV is false (i.e. Not available)
    let availability = false;
    //Index in the taxiList.
    let taxiIndex = 0;

    while ((availability == false) && (taxiIndex < taxiAvailability.length)) {
        if (taxiAvailability[taxiIndex].type == "SUV") {
            //This if-statement basically only processes SUVs when previous choice of vehicle was made before 
            //(also has to be not a SUV) and change the taxi acquired to the first SUV in taxiList 
            if ((taxiAvailability[taxiIndex].available) && (previousDecisionIndex != null) && (previousTaxi != "SUV")) {
                availability = true;
                taxiAvailability[taxiIndex].available = false;
                taxiAvailability[previousDecisionIndex].available = true;
                previousDecisionIndex = taxiIndex;
                previousTaxi = "SUV";

                taxiToBeChanged.taxiRego = taxiAvailability[taxiIndex].rego
                taxiToBeChanged.taxiType = taxiAvailability[taxiIndex].type;
                taxiToBeChanged.setFareAndDistance(longitudes, latitudes, "SUV", advancedBooking, time);
                changedFlag = true;

                document.getElementById("distanceOutput").innerHTML = `${taxiToBeChanged.distance.toFixed(2)}km`;
                document.getElementById("fareOutput").innerHTML = `RM${taxiToBeChanged.fare.toFixed(2)}`;;
            }
            //As for this if-statement, it processes the SUV as a choice when this is the user first choice
            else if ((previousDecisionIndex == null) && (taxiAvailability[taxiIndex].available)) {
                availability = true;
                taxiAvailability[taxiIndex].available = false;
                previousDecisionIndex = taxiIndex;
                previousTaxi = "SUV";
                changedFlag = true;

                taxiToBeChanged.taxiRego = taxiAvailability[taxiIndex].rego;
                taxiToBeChanged.taxiType = taxiAvailability[taxiIndex].type;
                taxiToBeChanged.setFareAndDistance(longitudes, latitudes, "SUV", advancedBooking, time);

                document.getElementById("distanceOutput").innerHTML = `${taxiToBeChanged.distance.toFixed(2)}km`;
                document.getElementById("fareOutput").innerHTML = `RM${taxiToBeChanged.fare.toFixed(2)}`;
            }
            //This if-statement will return nothing when user choose SUV again when previous choice of vehicle is a SUV as well.
            else if (previousTaxi == "SUV") {
                return
            }

            else {
                taxiIndex++;
            }

        }
        else {
            taxiIndex++;
        }
    }
    if (availability == false) {
        alert("Uh oh. SUVs are no longer available. Sorry and please choose another vehicle of transport.");
        return;
    }

    else {
        alert("Splendid! You have chosen a SUV as your 'Pristine Cab'!");
        taxiToBeChanged.prevDecisionIndex = previousDecisionIndex;
        taxiToBeChanged.prevTaxi = previousTaxi;
        return;

    }
}

/*
selectVan function without any parameters
This function checks if a van is available
*/
function selectVan() {
    //Declare the availability of Van is false (i.e. Not available)
    let availability = false;
    let taxiIndex = 0;

    while ((availability == false) && (taxiIndex < taxiAvailability.length)) {
        if (taxiAvailability[taxiIndex].type == "Van") {
            //This if-statement basically only processes Vans when previous choice of vehicle was made before 
            //(also has to be not a Van) and change the taxi acquired to the first Van in taxiList 
            if ((taxiAvailability[taxiIndex].available) && (previousDecisionIndex != null) && (previousTaxi != "Van")) {
                availability = true;
                taxiAvailability[taxiIndex].available = false;
                taxiAvailability[previousDecisionIndex].available = true;
                previousDecisionIndex = taxiIndex;
                previousTaxi = "Van";

                taxiToBeChanged.taxiRego = taxiAvailability[taxiIndex].rego
                taxiToBeChanged.taxiType = taxiAvailability[taxiIndex].type;
                taxiToBeChanged.setFareAndDistance(longitudes, latitudes, "Van", advancedBooking, time);
                changedFlag = true;

                document.getElementById("distanceOutput").innerHTML = `${taxiToBeChanged.distance.toFixed(2)}km`;
                document.getElementById("fareOutput").innerHTML = `RM${taxiToBeChanged.fare.toFixed(2)}`;
            }
            //As for this if-statement, it processes the Van as a choice when this is the user first choice
            else if ((previousDecisionIndex == null) && (taxiAvailability[taxiIndex].available)) {
                availability = true;
                taxiAvailability[taxiIndex].available = false;
                previousDecisionIndex = taxiIndex;
                previousTaxi = "Van"

                taxiToBeChanged.taxiRego = taxiAvailability[taxiIndex].rego
                taxiToBeChanged.taxiType = taxiAvailability[taxiIndex].type;
                taxiToBeChanged.setFareAndDistance(longitudes, latitudes, "Van", advancedBooking, time);
                changedFlag = true;

                document.getElementById("distanceOutput").innerHTML = `${taxiToBeChanged.distance.toFixed(2)}km`;
                document.getElementById("fareOutput").innerHTML = `RM${taxiToBeChanged.fare.toFixed(2)}`;
            }
            //This if-statement will return nothing when user choose Van again when previous choice of vehicle is a Van as well.
            else if (previousTaxi == "Van") {
                return
            }

            else {
                taxiIndex++;
            }

        }
        else {
            taxiIndex++;
        }
    }
    if (availability == false) {
        alert("Van are no longer available. Sorry and please choose another vehicle of transport.");
        return;
    }

    else {
        alert("You have chosen a Van as your choice of transport!");
        taxiToBeChanged.prevDecisionIndex = previousDecisionIndex;
        taxiToBeChanged.prevTaxi = previousTaxi;
        return;

    }
}

/* Description:
selectMiniBus function that checks if a minibus is available for the user
*/
function selectMiniBus() {
    //Declare the availability of Minibus is false (i.e. Not available)
    let availability = false;
    //Index in the taxiList.
    let taxiIndex = 0;

    while ((availability == false) && (taxiIndex < taxiAvailability.length)) {
        if (taxiAvailability[taxiIndex].type == "Minibus") {
            //This if-statement basically only processes Minibus when previous choice of vehicle was made before 
            //(also has to be not a Minibus) and change the taxi acquired to the first Minibus in taxiList 
            if ((taxiAvailability[taxiIndex].available) && (previousDecisionIndex != null) && (previousTaxi != "Minibus")) {
                availability = true;
                taxiAvailability[taxiIndex].available = false;
                taxiAvailability[previousDecisionIndex].available = true;
                previousDecisionIndex = taxiIndex;
                previousTaxi = "Minibus";

                taxiToBeChanged.taxiRego = taxiAvailability[taxiIndex].rego
                taxiToBeChanged.taxiType = taxiAvailability[taxiIndex].type;
                taxiToBeChanged.setFareAndDistance(longitudes, latitudes, "Minibus", advancedBooking, time);
                changedFlag = true;

                document.getElementById("distanceOutput").innerHTML = `${taxiToBeChanged.distance.toFixed(2)}km`;
                document.getElementById("fareOutput").innerHTML = `RM${taxiToBeChanged.fare.toFixed(2)}`;
            }
            //As for this if-statement, it processes the Minibus as a choice when this is the user first choice
            else if ((previousDecisionIndex == null) && (taxiAvailability[taxiIndex].available)) {
                availability = true;
                taxiAvailability[taxiIndex].available = false;
                previousDecisionIndex = taxiIndex;
                previousTaxi = "Minibus";

                taxiToBeChanged.taxiRego = taxiAvailability[taxiIndex].rego
                taxiToBeChanged.taxiType = taxiAvailability[taxiIndex].type;
                taxiToBeChanged.setFareAndDistance(longitudes, latitudes, "Minibus", advancedBooking, time);
                changedFlag = true;

                document.getElementById("distanceOutput").innerHTML = `${taxiToBeChanged.distance.toFixed(2)}km`;
                document.getElementById("fareOutput").innerHTML = `RM${taxiToBeChanged.fare.toFixed(2)}`;;
            }
            //This if-statement will return nothing when user choose Minibus again when previous choice of vehicle is a Minibus as well.
            else if (previousTaxi == "Minibus") {
                return
            }

            else {
                taxiIndex++;
            }

        }
        else {
            taxiIndex++;
        }
    }
    //if the taxi is not available returning the alart
    if (availability == false) {
        alert("Mini buses are no longer available. Sorry and please choose another vehicle of transport.");
        return;
    }
    //if available returning the alart
    else {
        alert("You have chosen a mini bus as your choice of transport!");
        taxiToBeChanged.prevDecisionIndex = previousDecisionIndex;
        taxiToBeChanged.prevTaxi = previousTaxi;
        return;

    }
}

/* Description: 
changeVehichle function without any parameters
This function allows the user to change the taxi type in the changeTaxi.html page
*/
function changeVehicle() {
    if (!changedFlag) {
        alert("Oops. Seems like you have yet to choose type of taxi. :(")
        return// statement to return if a taxitype is not selected
        //Alart to confirm and save the data
    }
    let taxiConfirmation = confirm("Are you sure you'd like to stick with your choices of addresses and time?");
    if (taxiConfirmation) {
        newBookingList.bookingHistory[taxiToBeChangedIndex] = taxiToBeChanged;
        updateStorage(APP_DATA_KEY, newBookingList);
        updateStorage(TAXI_AVAILABILITY_KEY, taxiAvailability);
        window.location = "view.html";//after saving returning to the routesum page
    }
}

/* Description:
back function without any parameters
This function redirects the user to the view.html page
*/
function back() {
    window.location = "view.html";
}