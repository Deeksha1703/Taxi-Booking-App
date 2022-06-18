/* add.js file that contains the following functions-
mapInit,pickNDropPoints,pickNDropCallBack,addAdditionalAddresses,additionalCallBack,addLiveLocation_Additional,additionalSuccess,
innerHTML_Refresher,markerPopUpSetter,cancelAdditionalAddresses,reverseCoding,saveBooking2
*/
"use strict";

// in itialising variables
let pickUpFlag = false;
newBooking.fromData(storageDataRetrieval(INDIVIDUAL_DATA_KEY));
let additionalAddresses = [];
let additionalPoints = [];
let longitudes = [];
let latitudes = [];
let overflowInnerHTML = [];
let map = null;

// || Initialising the addresses coordinates (i.e. longitudes and latitudes). ||
//~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.
longitudes.push(newBooking.pickUpPoint[0]);
latitudes.push(newBooking.pickUpPoint[1]);


if (additionalPoints.length != 0) {
    for (let j = 0; j < additionalPoints.length; j++) {
        longitudes.push(additionalPoints[j][0]);
        latitudes.push(additionalPoints[j][1]);
    }
}


longitudes.push(newBooking.finalPoint[0]);
latitudes.push(newBooking.finalPoint[1]);
//...................................................................................


/* Description: 
mapInit function without parameters
It is responsible for initialising a map onto the main.html page
*/
function mapInit(firstView) {
    mapboxgl.accessToken = MAPBOX_TOKEN;
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11'
    });

    if (firstView) {
        map.on(`load`, function () {
            map.addSource('route',
                {
                    'type': 'geojson',
                    'data': {
                        'type': 'Feature',
                        'properties':
                        {

                        },
                        'geometry':
                        {
                            'type': 'LineString',
                            'coordinates': [newBooking.pickUpPoint, newBooking.finalPoint]
                        }
                    }
                });

            //add layer to the map
            map.addLayer(
                {
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
        });

    }


}


//...................................................................................
mapInit(true);




// || Following functions initialize the pick up points and drop off points ||
//~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.

/* Description:
pickNDropPoints function with 2 parameters- callBack and placeCoordinates
Function to display pickup and drop off points on the map
*/
function pickNDropPoints(callBack, placeCoordinates) {
    let reverseData =
    {
        key: GEO_CODING_TOKEN,
        q: `${placeCoordinates[1]}+${placeCoordinates[0]}`,
        pretty: "1",
        countrycode: "my",
        jsonp: callBack
    };
    webServiceRequest(URL, reverseData);
}

/* Description:
pickNDropCallBack function with 1 parameters- data
Function to set up markers and specify colours of the markers
*/
function pickNDropCallBack(data) {
    let longitude = data.results[0].geometry.lng;
    let latitude = data.results[0].geometry.lat;
    let placeCoordinates = [longitude, latitude];
    let colourCode = "";
    let address = "";
    if (!pickUpFlag) {
        colourCode = "#030327" //Dark army blue colour signify pickup point.
        pickUpFlag = true;
        address = data.results[0].formatted;
    }

    else {
        colourCode = "#e30b0b" //Red colour signify dropoff point.
        address = data.results[0].formatted;
        pickUpFlag = false;
    }

    let marker = new mapboxgl.Marker(
        {
            "color": colourCode,
        })
    marker.setLngLat(placeCoordinates);
    marker.addTo(map);

    let popup = new mapboxgl.Popup({ offset: 45 });
    popup.setHTML(address);
    marker.setPopup(popup);
    marker.addTo(map);
}

//....................................................................................................



// || Following functions add the additional addresses from the button. ||
//~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.

/* Description:
addAdditionalAddresses function without any parameters
This function allows to user to add additional addresses
*/
function addAdditionalAddresses() {
    let additionalData = document.getElementById("additionalAddressInput").value;
    if (additionalData.length == 0) {
        alert("Please enter an address.");
        return
    }
    let forwardData =
    {
        key: GEO_CODING_TOKEN,
        q: additionalData,
        pretty: "1",
        countrycode: "my",
        jsonp: "additionalCallBack"
    };
    webServiceRequest(URL, forwardData);

}

/* Description:
additionalCallBack function with 1 parameter- data
function that gets the latitude and longitude of additional stops sets the markers 
*/
function additionalCallBack(data) {
    let longitude = data.results[0].geometry.lng;
    let latitude = data.results[0].geometry.lat;
    let placeCoordinates = [longitude, latitude];
    let placeNames = data.results[0].formatted
    additionalAddresses.push(placeNames);
    additionalPoints.push(placeCoordinates);

    longitudes = [newBooking.pickUpPoint[0]];
    latitudes = [newBooking.pickUpPoint[1]];



    for (let j = 0; j < additionalPoints.length; j++) {
        longitudes.push(additionalPoints[j][0]);
        latitudes.push(additionalPoints[j][1]);
    }

    longitudes.push(newBooking.finalPoint[0]);
    latitudes.push(newBooking.finalPoint[1]);

    markerPopUpSetter(additionalAddresses, additionalPoints);
    innerHTML_Refresher(additionalAddresses);
}

//....................................................................................................

// || Functions for adding live additional point ||
//~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.

/* Description:
addLiveLocation function without any parameters
This function retrieve the user's current location
*/
function addLiveLocation_Additional() {
    navigator.geolocation.getCurrentPosition(additionalSuccess);
}

/* Description:
additionalSuccess function with 1 parameter- pos
reverse gecoding for additional stops
*/
function additionalSuccess(pos) {
    let lat = pos.coords.latitude;
    let lng = pos.coords.longitude;
    reverseCoding(lng, lat, "additionalCallBack");
}


/* Description:
innerHTML_Refresher function with 1 parameters- places
This function initialises/refreshes the inner HTML of the overflow selection
*/
function innerHTML_Refresher(places) {
    let selections = "";
    for (let i = 0; i < places.length; i++) {
        selections += `<option onclick="cancelAdditionalAddresses(${i})">${places[i]}</option>\n`;
    }
    let innerHTML_MDL =
        `
    <div class="mdl-grid">
            <div class="mdl-cell mdl-cell--4-col mdl-cell--6-col-tablet">
                <div class="addStops">
                    <table style="margin: auto;">
                        <tr>
                            <td>
                                <select size="8">\n<pre>${selections}</pre>                                </select>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById("pointsDisplay").innerHTML = innerHTML_MDL
}
//....................................................................................................


/* Description:
markerPopUpSetter function with 2 parameters- places and coor
This function sets up markers with popups on it respectively
*/
function markerPopUpSetter(places, coor) {
    mapInit(false);

    pickNDropPoints("pickNDropCallBack", newBooking.pickUpPoint);
    pickNDropPoints("pickNDropCallBack", newBooking.finalPoint);
    let routeCoor = [];

    for (let i = 0; i < places.length; i++) {
        if (places.length != 0) {
            routeCoor.push(coor[i]);
        }
        let pickUpMarker = new mapboxgl.Marker(
            {
                "color": "#e024be", //Pinkish-purple colour signify additional stop point or points.
            })
        pickUpMarker.setLngLat(coor[i]);
        pickUpMarker.addTo(map);

        let pickUpPopup = new mapboxgl.Popup({ offset: 45 });
        pickUpPopup.setHTML(places[i]);
        pickUpMarker.setPopup(pickUpPopup);
        pickUpMarker.addTo(map);
    }
    routeCoor.unshift(newBooking.pickUpPoint);
    routeCoor.push(newBooking.finalPoint);

    map.on(`load`, function () {
        map.addSource('route',
            {
                'type': 'geojson',
                'data':
                {
                    'type': 'Feature',
                    'properties':
                    {

                    },
                    'geometry':
                    {
                        'type': 'LineString',
                        'coordinates': routeCoor
                    }
                }
            });

        //add layer to the map
        map.addLayer(
            {
                'id': 'route',
                'type': 'line',
                'source': 'route',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint':
                {
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
//....................................................................................................



// || Following functions cancel addresses that's triggered by the buttons. ||

/* Description:
cancelAdditionalAddresses function with 1 parameter- removeIndex
This function cancels addresses that's triggered by the buttons
*/
function cancelAdditionalAddresses(removeIndex) {
    additionalAddresses.splice(removeIndex, 1);
    additionalPoints.splice(removeIndex, 1);

    markerPopUpSetter(additionalAddresses, additionalPoints);
    innerHTML_Refresher(additionalAddresses)
}
//....................................................................................................


/* Description:
reverseCoding function with 2 parameters- places and coor
Reverse geocoding: getting the name of a place from its coordinates
*/
function reverseCoding(lng, lat, callBack) {
    let reverse_data =
    {
        key: GEO_CODING_TOKEN,
        q: `${lat},${lng}`,
        pretty: "1",
        countrycode: "my",
        jsonp: callBack
    };
    webServiceRequest(URL, reverse_data);
}

pickNDropPoints("pickNDropCallBack", newBooking.pickUpPoint);
pickNDropPoints("pickNDropCallBack", newBooking.finalPoint);


/* Description:
saveBooking2 function without any parameters
It is responsible for saving the individual booking into the local storage
*/
function saveBooking2() {
    let addConfirmation = confirm("Are you sure you'd like to stick with your choices of additional addresses?");
    if (addConfirmation) {
        newBooking.addPoint = additionalPoints;
        newBooking.addName = additionalAddresses;

        updateStorage(INDIVIDUAL_DATA_KEY, newBooking);
        window.location = "taxiType.html";
    }
}