
/* detailedBooking.js file is responsible for displaying user  the booking details.
functions in this file are: mapInit,markerPopUpSetter, routing , back and changeTaxi.
*/

"use strict";
// initialising new booking list
newBookingList = new BookingList;
newBookingList.fromData(storageDataRetrieval(APP_DATA_KEY));
let map = null;
let index = storageDataRetrieval(BOOKING_CONTENT_KEY);
let summaryData = null;

let addresses = []; // initialising the adress array
let longitudes = [];//initialise longitudes
let latitudes = [];//initialise latitudes
let coordinateArray = []; // initialising coordinate array


// To find the specific data the user want to display
for (let i = 0; i < newBookingList.bookingHistory.length; i++) {
    if ((newBookingList.bookingHistory[i].bookingIndex) == index) {
        summaryData = newBookingList.bookingHistory[i]
    }
}

// || Initialising the addresses names. ||
//~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.
addresses.push(summaryData.pickUpName);
for (let i = 0; i < summaryData.addName.length; i++) {
    addresses.push(summaryData.addName[i]);
}
addresses.push(summaryData.finalName);
//...................................................................................


// || Initialising the addresses coordinates (i.e. longitudes and latitudes). ||
//~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.
longitudes.push(summaryData.pickUpPoint[0]);
latitudes.push(summaryData.pickUpPoint[1]);

for (let j = 0; j < summaryData.addPoint.length; j++) {
    longitudes.push(summaryData.addPoint[j][0]);
    latitudes.push(summaryData.addPoint[j][1]);
}

longitudes.push(summaryData.finalPoint[0]);
latitudes.push(summaryData.finalPoint[1]);

coordinateArray.push(summaryData.pickUpPoint);
for (let k = 0; k < summaryData.addPoint.length; k++) {

    coordinateArray.push(summaryData.addPoint[k]);
}
coordinateArray.push(summaryData.finalPoint);
//...................................................................................


/* Description:
mapInit function without any parameters
It is responsible for Initialising the map
*/
function mapInit() {
    mapboxgl.accessToken = MAPBOX_TOKEN;
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11'
    });
}
//...................................................................................


/* Description:
markerPopUpSetter function without any parameters 
It sis responsible for initialising markers on the map
*/
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

        if (i == (longitudes.length - 1)) {
            map.flyTo({
                center: [longitudes[i], latitudes[i]]
            });
        }
    }

    map.on(`load`, function () {
        map.addSource('route', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': coordinateArray
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
markerPopUpSetter();//sets markers and popups

//initialise empty string of additional stops if there are more additional stops
//using this for loop these stops can be desplayed.
let additionalStops = "";
// for loop to walk through the loop
for (let j = 0; j < summaryData.addName.length; j++) {
    additionalStops += `<p>${j + 1}.) ${summaryData.addName[j]}</p>`
}

let routeSummaryDisplay = `
<p>Name: Booking ${summaryData.bookingIndex}</p>


<p>Date: ${summaryData.startDate} || ${summaryData.startTime}</p> 


<p>Pickup:${summaryData.pickUpName}</p>


<p>Additional Stops:</p> ${additionalStops}


<p>Number of stops: ${summaryData.addName.length}</p>


<p>Taxi type: ${summaryData.taxiType}</p>


<p>Taxi license plate: ${summaryData.taxiRego}</p>


<p>Total distance: ${summaryData.distance.toFixed(2)}km</p>


<p>Total fare: RM${summaryData.fare.toFixed(2)}</p>
`;


//to display root summery
document.getElementById("routeSummary").innerHTML = routeSummaryDisplay;

/* Description:
back function without any parameters
This function redirects the user to view.html
*/
function back() {
    window.location = "view.html";
}
/* changeTaxi function without any parameters
This unction redirects the user to the changeTaxi.html page
*/
function changeTaxi() {
    window.location = "changeTaxi.html";
}

