/* taxiType.js file that contains the functions to set a taxi, function to change vehicle,
function to go back to view.html page,mapInit and markerPopUpSetter.
*/

"use strict"
// cheking availability of a taxi
let taxiAvailability = storageDataRetrieval(TAXI_AVAILABILITY_KEY);
newBooking.fromData(storageDataRetrieval(INDIVIDUAL_DATA_KEY));
let map = null;// setting map to null


//initializing addresses longitudes and latitudes
let addresses = [];
let longitudes = [];
let latitudes = [];


//Contains previous data of taxi type chose as well as the index of the vehicle in taxiList.
let previousDecisionIndex = null;
let previousTaxi = null;
//...................................................................................



// Determination of whether the time of current booking is advanced booking or current booking. 
let startDate = new Date(newBooking.startDate);
let currentDate = new Date();

/*This js part is to check weather the booking time is between 12.00am to 6.00pm this takes the input as a 
string this part converts string to a number and compare it to check weather it is between 12am-6am*/
let time = parseInt((newBooking.startTime).slice(0, 2)); // hour:minute in 24h format
let currentHour = currentDate.getHours(); // To get current hour

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
    timeCondition = true; // cheking if this is midnight 
}



let advancedBooking = (dateCondition && timeCondition);

//------------------------------------------------------------------------------------------------



// || Initialising the addresses names then the coordinates (i.e. longitudes and latitudes). ||
//~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.
addresses.push(newBooking.pickUpName);
for (let i = 0; i < newBooking.addName.length; i++) {
    addresses.push(newBooking.addName[i]);
}
addresses.push(newBooking.finalName);
//...................................................................................



// || Initialising the addresses coordinates (i.e. longitudes and latitudes). ||
//~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.
longitudes.push(newBooking.pickUpPoint[0]);
latitudes.push(newBooking.pickUpPoint[1]);

for (let j = 0; j < newBooking.addPoint.length; j++) {
    longitudes.push(newBooking.addPoint[j][0]);
    latitudes.push(newBooking.addPoint[j][1]);
}

longitudes.push(newBooking.finalPoint[0]);
latitudes.push(newBooking.finalPoint[1]);
//...................................................................................




// || Initialising a map onto the taxiType.html page. ||
//~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.
function mapInit() {
    mapboxgl.accessToken = MAPBOX_TOKEN;
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11'
    });
}
//...................................................................................



// || Initialising markers onto the map. ||
//~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.
function markerPopUpSetter() {
    mapInit();

    for (let i = 0; i < longitudes.length; i++) {

        let colour = "#030327";

        if ((i > 0) && (i < longitudes.length - 1)) {
            colour = "#e024be";
        }

        if (i == longitudes.length - 1) {
            colour = "#e30b0b";
        }

        let markers = new mapboxgl.Marker({
            "color": colour //Pinkish-purple colour signify additional stop point or points.
        })
        markers.setLngLat([longitudes[i], latitudes[i]]);
        markers.addTo(map);

        let popUps = new mapboxgl.Popup({ offset: 45 });
        popUps.setHTML(addresses[i]);
        markers.setPopup(popUps);
        markers.addTo(map);
    }
    let routeCoor = newBooking.addPoint;
    routeCoor.unshift(newBooking.pickUpPoint);
    routeCoor.push(newBooking.finalPoint);

    map.on(`load`, function () {
        map.addSource('route', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': routeCoor
                }
            }
        });

        //add layer to the map
        map.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#888',
                'line-width': 10
            }
        });

        let maxLng = longitudes[0];
        let minLng = longitudes[0];
        let maxLat = latitudes[0];
        let minLat = latitudes[0];

        for (let i = 0; i < longitudes.length; i++) {
            if (longitudes[i] > maxLng) {
                maxLng = longitudes[i];
            }
            if (latitudes[i] < minLat) {
                minLat = latitudes[i];
            }
            if (longitudes[i] < minLng) {
                minLng = longitudes[i];
            }
            if (latitudes[i] > maxLat) {
                maxLat = latitudes[i];
            }
        }


        map.fitBounds([
            [maxLng, maxLat],
            [minLng, minLat]
        ]);



    })
}
//...................................................................................



// || Following functions  allow users to choose a vehicle while updating the taxiList||
//~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.
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

                newBooking.taxiRego = taxiAvailability[taxiIndex].rego;
                newBooking.taxiType = taxiAvailability[taxiIndex].type;
                newBooking.setFareAndDistance(longitudes, latitudes, "Car", advancedBooking, time);

                document.getElementById("distanceOutput").innerHTML = `${newBooking.distance.toFixed(2)}km`;
                document.getElementById("fareOutput").innerHTML = `RM${newBooking.fare.toFixed(2)}`;
            }
            //As for this if-statement, it processes the car as a choice when this is the user first choice
            else if ((previousDecisionIndex == null) && (taxiAvailability[taxiIndex].available)) {
                availability = true;
                taxiAvailability[taxiIndex].available = false;
                previousDecisionIndex = taxiIndex;
                previousTaxi = "Car"

                newBooking.taxiRego = taxiAvailability[taxiIndex].rego
                newBooking.taxiType = taxiAvailability[taxiIndex].type;
                newBooking.setFareAndDistance(longitudes, latitudes, "Car", advancedBooking, time);

                document.getElementById("distanceOutput").innerHTML = `${newBooking.distance.toFixed(2)}km`;
                document.getElementById("fareOutput").innerHTML = `RM${newBooking.fare.toFixed(2)}`;;
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
        newBooking.prevDecisionIndex = previousDecisionIndex;
        newBooking.prevTaxi = previousTaxi;
        return;

    }
}

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

                newBooking.taxiRego = taxiAvailability[taxiIndex].rego
                newBooking.taxiType = taxiAvailability[taxiIndex].type;
                newBooking.setFareAndDistance(longitudes, latitudes, "SUV", advancedBooking, time);

                document.getElementById("distanceOutput").innerHTML = `${newBooking.distance.toFixed(2)}km`;
                document.getElementById("fareOutput").innerHTML = `RM${newBooking.fare.toFixed(2)}`;;
            }
//As for this if-statement, it processes the SUV as a choice when this is the user first choice
            else if ((previousDecisionIndex == null) && (taxiAvailability[taxiIndex].available)) {
                availability = true;
                taxiAvailability[taxiIndex].available = false;
                previousDecisionIndex = taxiIndex;
                previousTaxi = "SUV";

                newBooking.taxiRego = taxiAvailability[taxiIndex].rego;
                newBooking.taxiType = taxiAvailability[taxiIndex].type;
                newBooking.setFareAndDistance(longitudes, latitudes, "SUV", advancedBooking, time);

                document.getElementById("distanceOutput").innerHTML = `${newBooking.distance.toFixed(2)}km`;
                document.getElementById("fareOutput").innerHTML = `RM${newBooking.fare.toFixed(2)}`;;
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
        newBooking.prevDecisionIndex = previousDecisionIndex;
        newBooking.prevTaxi = previousTaxi;
        return;

    }
}

function selectVan() {
    //Declare the availability of Van is false (i.e. Not available)
    let availability = false;
    //Index in the taxiList.
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

                newBooking.taxiRego = taxiAvailability[taxiIndex].rego
                newBooking.taxiType = taxiAvailability[taxiIndex].type;
                newBooking.setFareAndDistance(longitudes, latitudes, "Van", advancedBooking, time);

                document.getElementById("distanceOutput").innerHTML = `${newBooking.distance.toFixed(2)}km`;
                document.getElementById("fareOutput").innerHTML = `RM${newBooking.fare.toFixed(2)}`;;
            }
//As for this if-statement, it processes the Van as a choice when this is the user first choice
            else if ((previousDecisionIndex == null) && (taxiAvailability[taxiIndex].available)) {
                availability = true;
                taxiAvailability[taxiIndex].available = false;
                previousDecisionIndex = taxiIndex;
                previousTaxi = "Van"

                newBooking.taxiRego = taxiAvailability[taxiIndex].rego
                newBooking.taxiType = taxiAvailability[taxiIndex].type;
                newBooking.setFareAndDistance(longitudes, latitudes, "Van", advancedBooking, time);

                document.getElementById("distanceOutput").innerHTML = `${newBooking.distance.toFixed(2)}km`;
                document.getElementById("fareOutput").innerHTML = `RM${newBooking.fare.toFixed(2)}`;;
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
        newBooking.prevDecisionIndex = previousDecisionIndex;
        newBooking.prevTaxi = previousTaxi;
        return;

    }
}

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

                newBooking.taxiRego = taxiAvailability[taxiIndex].rego
                newBooking.taxiType = taxiAvailability[taxiIndex].type;
                newBooking.setFareAndDistance(longitudes, latitudes, "Minibus", advancedBooking, time);

                document.getElementById("distanceOutput").innerHTML = `${newBooking.distance.toFixed(2)}km`;
                document.getElementById("fareOutput").innerHTML = `RM${newBooking.fare.toFixed(2)}`;;
            }
//As for this if-statement, it processes the Minibus as a choice when this is the user first choice
            else if ((previousDecisionIndex == null) && (taxiAvailability[taxiIndex].available)) {
                availability = true;
                taxiAvailability[taxiIndex].available = false;
                previousDecisionIndex = taxiIndex;
                previousTaxi = "Minibus"


                newBooking.taxiRego = taxiAvailability[taxiIndex].rego
                newBooking.taxiType = taxiAvailability[taxiIndex].type;
                newBooking.setFareAndDistance(longitudes, latitudes, "Minibus", advancedBooking, time);

                document.getElementById("distanceOutput").innerHTML = `${newBooking.distance.toFixed(2)}km`;
                document.getElementById("fareOutput").innerHTML = `RM${newBooking.fare.toFixed(2)}`;;
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

    else {
        alert("You have chosen a mini bus as your choice of transport!");
        newBooking.prevDecisionIndex = previousDecisionIndex;
        newBooking.prevTaxi = previousTaxi;
        return;

    }
}
//This function is to save the booking
function saveBooking3() {
    if ((newBooking.taxiType != "Car") && (newBooking.taxiType != "SUV") && (newBooking.taxiType != "Van") && (newBooking.taxiType != "Minibus")) {
        alert("Oops. Seems like you have yet to choose type of taxi. :(")
        return
    }// statement to return if a taxitype is not selected
    //Alart to confirm and save the data
    let taxiConfirmation = confirm("Are you sure you'd like to stick with your choices of addresses and time?");
    if (taxiConfirmation) {
        updateStorage(INDIVIDUAL_DATA_KEY, newBooking);
        updateStorage(TAXI_AVAILABILITY_KEY, taxiAvailability);
        window.location = "routeSum.HTML"; //after saving returning to the routesum page
    }
}




markerPopUpSetter();
