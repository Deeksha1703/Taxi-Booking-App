"use strict";
/*main.js --> this file is mainly used for most of the functions on the main page and the maps
page.*/

newBooking.finalPoint = "";  //Initialise the final point's coordinate to empty string
newBooking.finalName = ""; //Initialise the final 's coordinate to empty string
newBooking.pickUpPoint = ""; //Initialise the pickup point's coordinate to empty string
newBooking.pickUpName = ""; //Initialise the pickup name's coordinate to empty string
let bookingNameCode = storageDataRetrieval(BOOKING_NAME_CODE_KEY);
let map = null;



/*Name: mapInit
  Purpose: Initialising a map onto the main.html page.
  Parameter(s): pickOrDrop */
function mapInit(pickOrDrop = "") {
    mapboxgl.accessToken = MAPBOX_TOKEN;
    map = new mapboxgl.Map({
        container: 'map',
        center: [101.685621, 3.174829],
        zoom: 16,
        style: 'mapbox://styles/mapbox/streets-v11'
    });



    if (pickOrDrop == "pick") {
        if (newBooking.finalPoint != "") {
            let dropOffMarker = new mapboxgl.Marker({
                "color": "#e30b0b", //Red, drop
                draggable: true
            })
            dropOffMarker.setLngLat(newBooking.finalPoint);
            dropOffMarker.addTo(map);

            let dropOffPopup = new mapboxgl.Popup({ offset: 45 });
            dropOffPopup.setHTML(newBooking.finalName);
            dropOffMarker.setPopup(dropOffPopup);
            dropOffMarker.addTo(map);

            /*Name: onDragEnd
              Purpose: In order to drag the marker on the map and change the point on the map.
              Parameter(s): - */
            function onDragEnd() {
                let lngLat = dropOffMarker.getLngLat();
                reverseCoding(lngLat.lng, lngLat.lat, "changeDropOffCallBack");
                dropOffPopup.setHTML(newBooking.finalName);
                dropOffMarker.setPopup(dropOffPopup);
            }

            dropOffMarker.on('dragend', onDragEnd);
        }
    }

    if (pickOrDrop == "drop") {
        if (newBooking.pickUpPoint != "") {
            let pickUpMarker = new mapboxgl.Marker({
                "color": "#030327",
                draggable: true
            })
            pickUpMarker.setLngLat(newBooking.pickUpPoint);
            pickUpMarker.addTo(map);

            let pickUpPopup = new mapboxgl.Popup({ offset: 45 });
            pickUpPopup.setHTML(newBooking.pickUpName);
            pickUpMarker.setPopup(pickUpPopup);
            pickUpMarker.addTo(map);
            
            /*Name: onDragEnd
              Purpose: In order to drag the marker on the map and change the point on the map.
              Parameter(s): - */
            function onDragEnd() {
                let lngLat = pickUpMarker.getLngLat();
                reverseCoding(lngLat.lng, lngLat.lat, "changePickUpCallBack");
                pickUpPopup.setHTML(newBooking.pickUpName);
                pickUpMarker.setPopup(pickUpPopup);

            }

            pickUpMarker.on('dragend', onDragEnd);
        }
    }
}

mapInit();
//...................................................................................


/*Name: addPickupPoint
  Purpose: Adds a pickup point
  Parameter(s): -*/
function addPickUpPoint() {

    let pickUpData = document.getElementById("pickUpPoint").value;
    if (pickUpData.length == 0) {
        alert("Please select a pick up address.");
        return
    }
    mapInit("pick");
    let forwardData = {
        key: GEO_CODING_TOKEN,
        q: pickUpData,
        pretty: "1",
        countrycode: "my",
        jsonp: "pickUpCallBack"
    };
    webServiceRequest(URL, forwardData);
}

/*Name: pickupCallBack
  Purpose: This function takes the coordinates and turns it into markers on the map for the pickup point
  Parameter(s): data*/
function pickUpCallBack(data) {
    let longitude = data.results[0].geometry.lng;
    let latitude = data.results[0].geometry.lat;
    let placeCoordinates = [longitude, latitude];
    newBooking.pickUpPoint = placeCoordinates;
    newBooking.pickUpName = data.results[0].formatted;

    let pickUpMarker = new mapboxgl.Marker({
        "color": "#030327",
        draggable: true
    })
    pickUpMarker.setLngLat(placeCoordinates);
    pickUpMarker.addTo(map);

    let pickUpPopup = new mapboxgl.Popup({ offset: 45 });
    pickUpPopup.setHTML(data.results[0].formatted);
    pickUpMarker.setPopup(pickUpPopup);
    pickUpMarker.addTo(map);

    if (newBooking.finalPoint == "") {
        map.flyTo({
            center: placeCoordinates,
            zoom: 16
        });
    }
    else {
        let longitudes = [];
        let latitudes = [];

        longitudes.push(newBooking.pickUpPoint[0]);
        latitudes.push(newBooking.pickUpPoint[1]);

        longitudes.push(newBooking.finalPoint[0]);
        latitudes.push(newBooking.finalPoint[1]);
        map.on(`load`, function () {
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
        routing();
    }



     /*Name: onDragEnd
      Purpose: In order to drag the marker on the map and change the point on the map.
      Parameter(s): - */
    function onDragEnd() {
        let lngLat = pickUpMarker.getLngLat();
        reverseCoding(lngLat.lng, lngLat.lat, "changePickUpCallBack");
        pickUpPopup.setHTML(newBooking.pickUpName);
        pickUpMarker.setPopup(pickUpPopup);

    }

    pickUpMarker.on('dragend', onDragEnd);
}

/*Name: changePickupCallBack
  Purpose: When the customer changes the location, it changes the position of the markers on the map
           pickup point
  Parameter(s): data */
function changePickUpCallBack(data) {
    newBooking.pickUpName = data.results[0].formatted;
    newBooking.pickUpPoint = [data.results[0].geometry.lng, data.results[0].geometry.lat];
    if (newBooking.finalPoint == "") {
        map.flyTo({
            center: newBooking.pickUpPoint,
            zoom: 16
        });
    }
    else {
        mapInit("pick");
        let longitudes = [];
        let latitudes = [];

        longitudes.push(newBooking.pickUpPoint[0]);
        latitudes.push(newBooking.pickUpPoint[1]);

        longitudes.push(newBooking.finalPoint[0]);
        latitudes.push(newBooking.finalPoint[1]);
        map.on(`load`, function () {
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
        setTimeout(routing,3000);
        let pickUpMarker = new mapboxgl.Marker({
            "color": "#030327",
            draggable: true
        })
        pickUpMarker.setLngLat(newBooking.pickUpPoint);
        let pickUpPopup = new mapboxgl.Popup({ offset: 45 });
        pickUpPopup.setHTML(newBooking.pickUpName);
        pickUpMarker.setPopup(pickUpPopup);
        pickUpMarker.addTo(map);
    
        function onDragEnd() {
            let lngLat = dropOffMarker.getLngLat();
            reverseCoding(lngLat.lng, lngLat.lat, "changePickUpCallBack");
            pickUpPopup.setHTML(newBooking.pickUpName);
            pickUpMarker.setPopup(pickUpPopup);
        }
    
        pickUpMarker.on('dragend', onDragEnd);
    }

}

//...................................................................................


/*Name: addDropOffPoint
  Purpose: Adds a Drop Off point
  Parameter(s): -*/
function addDropOffPoint() {
    let dropOffData = document.getElementById("dropOffPoint").value;
    if (dropOffData.length == 0) {
        alert("Please select a drop off address.");
        return
    }
    mapInit("drop");

    let forward_data = {
        key: GEO_CODING_TOKEN,
        q: dropOffData,
        pretty: "1",
        countrycode: "my",
        jsonp: "dropOffCallBack"
    };
    webServiceRequest(URL, forward_data)
}

/*Name: dropOffCallBack
  Purpose: This function takes the coordinates and turns it into markers on the map for the Drop Off point
  Parameter(s): data*/
function dropOffCallBack(data) {
    let longitude = data.results[0].geometry.lng;
    let latitude = data.results[0].geometry.lat;
    let placeCoordinates = [longitude, latitude];
    newBooking.finalPoint = placeCoordinates;
    newBooking.finalName = data.results[0].formatted;

    let dropOffMarker = new mapboxgl.Marker({
        "color": "#e30b0b",
        draggable: true
    })
    dropOffMarker.setLngLat(placeCoordinates);
    dropOffMarker.addTo(map);

    let dropOffPopup = new mapboxgl.Popup({ offset: 45 });
    dropOffPopup.setHTML(data.results[0].formatted);
    dropOffMarker.setPopup(dropOffPopup);
    dropOffMarker.addTo(map);

    if (newBooking.pickUpPoint == "") {
        map.flyTo({
            center: placeCoordinates,
            zoom: 16
        });
    }
    else {
        let longitudes = [];
        let latitudes = [];

        longitudes.push(newBooking.pickUpPoint[0]);
        latitudes.push(newBooking.pickUpPoint[1]);

        longitudes.push(newBooking.finalPoint[0]);
        latitudes.push(newBooking.finalPoint[1]);
        map.on(`load`, function () {
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
        routing()
    }


    /*Name: onDragEnd
      Purpose: In order to drag the marker on the map and change the point on the map.
      Parameter(s): - */
    function onDragEnd() {
        let lngLat = dropOffMarker.getLngLat();
        reverseCoding(lngLat.lng, lngLat.lat, "changeDropOffCallBack");
        dropOffPopup.setHTML(newBooking.finalName);
        dropOffMarker.setPopup(dropOffPopup);
    }

    dropOffMarker.on('dragend', onDragEnd);
}

/*Name: changeDropOffCallBack
  Purpose: When the customer changes the location, it changes the position of the markers on the map
           pickup point
  Parameter(s): data */
function changeDropOffCallBack(data) {
    newBooking.finalName = data.results[0].formatted;
    newBooking.finalPoint = [data.results[0].geometry.lng, data.results[0].geometry.lat];
    if (newBooking.pickUpPoint == "") {
        map.flyTo({
            center: newBooking.finalPoint,
            zoom: 16
        });
    }
    else {
        mapInit("drop");
        let longitudes = [];
        let latitudes = [];

        longitudes.push(newBooking.pickUpPoint[0]);
        latitudes.push(newBooking.pickUpPoint[1]);

        longitudes.push(newBooking.finalPoint[0]);
        latitudes.push(newBooking.finalPoint[1]);
        map.on(`load`, function () {
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
    setTimeout(routing,3000);
    let dropOffMarker = new mapboxgl.Marker({
        "color": "#e30b0b",
        draggable: true
    })
    dropOffMarker.setLngLat(newBooking.finalPoint);
    let dropOffPopup = new mapboxgl.Popup({ offset: 45 });
    dropOffPopup.setHTML(newBooking.finalName);
    dropOffMarker.setPopup(dropOffPopup);
    dropOffMarker.addTo(map);
    
    /*Name: onDragEnd
      Purpose: In order to drag the marker on the map and change the point on the map.
      Parameter(s): - */
    function onDragEnd() {
        let lngLat = dropOffMarker.getLngLat();
        reverseCoding(lngLat.lng, lngLat.lat, "changeDropOffCallBack");
        dropOffPopup.setHTML(newBooking.finalName);
        dropOffMarker.setPopup(dropOffPopup);
    }

    dropOffMarker.on('dragend', onDragEnd);
}

//....................................................................................................

/*Name: addLiveLocation_Pick
  Purpose: Function for adding a live pickup point
  Parameter(s): -*/
function addLiveLocation_Pick() {
    mapInit("pick");
    navigator.geolocation.getCurrentPosition(pickUpSuccess);
}

/*Name: pickUpSuccess
  Purpose: Function that runs if the live pick up location is successfully chosen
  Parameter(s): pos*/
function pickUpSuccess(pos) {
    let lat = pos.coords.latitude;
    let lng = pos.coords.longitude;
    let placeCoordinates = [lng, lat];
    newBooking.pickUpPoint = placeCoordinates;
    reverseCoding(lng, lat, "livePickUpCallBack");
}

/*Name: livePickupCallBack
  Purpose: After getting the live location, this function obtains the data, sets the markers and allows it to
           be dragged.
  Parameter(s): data*/
function livePickUpCallBack(data) {
    let pickUpMarker = new mapboxgl.Marker({
        "color": "#030327",
        draggable: true
    })
    newBooking.pickUpName = data.results[0].formatted;
    let longitude = data.results[0].geometry.lng;
    let latitude = data.results[0].geometry.lat;
    pickUpMarker.setLngLat([longitude, latitude]);
    let pickUpPopup = new mapboxgl.Popup({ offset: 45 });
    pickUpPopup.setHTML(data.results[0].formatted);
    pickUpMarker.setPopup(pickUpPopup);
    pickUpMarker.addTo(map);
    if (newBooking.finalPoint == "") {
        map.flyTo({
            center: newBooking.pickUpPoint,
            zoom: 16
        });
    }
    else {
        let longitudes = [];
        let latitudes = [];

        longitudes.push(newBooking.pickUpPoint[0]);
        latitudes.push(newBooking.pickUpPoint[1]);

        longitudes.push(newBooking.finalPoint[0]);
        latitudes.push(newBooking.finalPoint[1]);
        map.on(`load`, function () {
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
        routing();
    }

    /*Name: onDragEnd
      Purpose: In order to drag the marker on the map and change the point on the map.
      Parameter(s): - */
    function onDragEnd() {
        let lngLat = pickUpMarker.getLngLat();
        reverseCoding(lngLat.lng, lngLat.lat, "changePickUpCallBack");
        pickUpPopup.setHTML(newBooking.pickUpName);
        pickUpMarker.setPopup(pickUpPopup);
    }

    pickUpMarker.on('dragend', onDragEnd);
}
//....................................................................................................

/*Name: addLiveLocation_Drop
  Purpose: Function for adding a live dropoff point.
  Parameter(s): -*/
function addLiveLocation_Drop() {
    mapInit("drop");
    navigator.geolocation.getCurrentPosition(dropOffSuccess);
}

/*Name: dropOffSuccess
  Purpose: Function that runs if the live drop off location is successfully chosen.
  Parameter(s): pos*/
function dropOffSuccess(pos) {
    let lat = pos.coords.latitude;
    let lng = pos.coords.longitude;
    let placeCoordinates = [lng, lat];
    newBooking.finalPoint = placeCoordinates;
    reverseCoding(lng, lat, "liveDropOffCallBack");

}

/*Name: livedropOffCallBack
  Purpose: After getting the live location this function obtains the data, sets the markers and allows it to
           be dragged.
  Parameter(s): data*/
function liveDropOffCallBack(data) {
    let dropOffMarker = new mapboxgl.Marker({
        "color": "#e30b0b",
        draggable: true
    })
    newBooking.finalName = data.results[0].formatted;
    let longitude = data.results[0].geometry.lng;
    let latitude = data.results[0].geometry.lat;
    dropOffMarker.setLngLat([longitude, latitude]);
    let dropOffPopup = new mapboxgl.Popup({ offset: 45 });
    dropOffPopup.setHTML(data.results[0].formatted);
    dropOffMarker.setPopup(dropOffPopup);
    dropOffMarker.addTo(map);

    if (newBooking.pickUpPoint == "") {
        map.flyTo({
            center: newBooking.finalPoint,
            zoom: 16
        });
    }
    else {
        let longitudes = [];
        let latitudes = [];

        longitudes.push(newBooking.pickUpPoint[0]);
        latitudes.push(newBooking.pickUpPoint[1]);

        longitudes.push(newBooking.finalPoint[0]);
        latitudes.push(newBooking.finalPoint[1]);
        map.on(`load`, function () {
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

        routing();
    }

    /*Name: onDragEnd
      Purpose: In order to drag the marker on the map and change the point on the map.
      Parameter(s): - */
    function onDragEnd() {
        let lngLat = dropOffMarker.getLngLat();
        reverseCoding(lngLat.lng, lngLat.lat, "changeDropOffCallBack");
        dropOffPopup.setHTML(newBooking.finalName);
        dropOffMarker.setPopup(dropOffPopup);
    }

    dropOffMarker.on('dragend', onDragEnd);
}
//....................................................................................................

/*Name: reverseCoding
  Purpose: Function that gets the name of a place from its coordinates.
  Parameter(s): lng, lat, callBack*/
function reverseCoding(lng, lat, callBack) {
    let reverse_data = {
        key: GEO_CODING_TOKEN,
        q: `${lat},${lng}`,
        pretty: "1",
        countrycode: "my",
        jsonp: callBack
    };
    webServiceRequest(URL, reverse_data);
}

/*Name: routing
  Purpose: Function that checks for the validdity of the pickup and drop-off point and
           if it is valid, it creates a poly-line between the two coordinates.
  Parameter(s): -*/
function routing() {
    if ((newBooking.pickUpPoint != "") && (newBooking.finalPoint != "")) {
        map.addSource('route', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': [newBooking.pickUpPoint, newBooking.finalPoint]
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
    }

}

/*Name: saveBooking1
  Purpose: Function used to save the booking.
  Parameter(s): - */
function saveBooking1() {
    if (document.getElementById("start").value.length == 0) {
        alert("Please select a date of pick up.");
        return
    }

    if (document.getElementById("appt").value.length == 0) {
        alert("Please select a time of pick up.");
        return
    }

    let addressConfirmation = confirm("Are you sure you'd like to stick with your choices of addresses and time?");
    if (addressConfirmation) {
        newBooking.startDate = document.getElementById("start").value;
        newBooking.startTime = document.getElementById("appt").value;
        newBooking.bookingIndex = bookingNameCode;

        updateStorage(INDIVIDUAL_DATA_KEY, newBooking);
        window.location = "add.HTML";
    }
}