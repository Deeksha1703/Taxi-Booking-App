"use strict"
//routeSum.js --> this file is mainly used for most of the code that will run on the route summary page

newBooking.fromData(storageDataRetrieval(INDIVIDUAL_DATA_KEY));
let map = null;

let bookingNameCodeKey = storageDataRetrieval(BOOKING_NAME_CODE_KEY);
let addresses = [];
let longitudes = [];
let latitudes = [];



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
console.log(longitudes);
//...................................................................................

/*Name: mapInit
  Purpose: Initialising the map.
  Parameter(s): - */
function mapInit() {
    mapboxgl.accessToken = MAPBOX_TOKEN;
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11'
    });
}
//...................................................................................

/*Name: markerPopUpSetter
  Purpose: Initialises the markers on the map.
  Parameter(s): - */
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

markerPopUpSetter()

let additionalStopsDisplay = "";
for (let i = 0; i < newBooking.addName.length; i++) {
    if (i == (newBooking.addName.length - 1)) {
        additionalStopsDisplay += `${newBooking.addName[i]}`;
    }

    else {
        additionalStopsDisplay += `${newBooking.addName[i]},`;
    }
}


let routeSummaryDisplay = `
<b>Name: Booking</b> ${bookingNameCodeKey} <br>


<b>Date:</b> ${newBooking.startDate} || ${newBooking.startTime} <br>


<b>Pickup:</b> ${newBooking._pickUpName} <br>


<b>Additional Stops:</b> ${additionalStopsDisplay} <br>


<b>Number of stops:</b> ${newBooking.addName.length} <br>


<b>Taxi type:</b> ${newBooking.taxiType} <br>


<b>Taxi license plate:</b> ${newBooking.taxiRego} <br>


<b>Total distance:</b> ${newBooking.distance.toFixed(2)}km <br>


<b>Total fare:</b> RM${newBooking.fare.toFixed(2)} <br>
`;

document.getElementById("routeSummary").innerHTML = routeSummaryDisplay;

/*Name: saveBooking4
  Purpose: Saves the booking.
  Parameter(s): - */
function saveBooking4() {
    let taxiConfirmation = confirm("Are you sure you'd like to proceed with the booking?");
    if (taxiConfirmation) {
        newBookingList.addBooking(newBooking.bookingIndex, newBooking.pickUpPoint, newBooking.pickUpName, newBooking.finalPoint, newBooking.finalName, newBooking.startDate, newBooking.startTime, newBooking.addPoint, newBooking.addName, newBooking.distance, newBooking.taxiType, newBooking.taxiRego, newBooking.fare, newBooking.prevTaxi, newBooking.prevDecisionIndex);
        
        updateStorage(BOOKING_NAME_CODE_KEY, (bookingNameCodeKey + 1));
        updateStorage(APP_DATA_KEY, newBookingList);
        console.log(storageDataRetrieval(APP_DATA_KEY))
        window.location = "view.html";
    }
}
