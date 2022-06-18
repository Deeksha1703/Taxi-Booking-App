/* shared.js file that contains the Booking and BookingList classes
It contains the following functions-
setFareAndDistance,addBooking,removeBooking,bookingsSorter,updateStorage,haversineFormula,checkLocalStorage,webServiceRequest,
storageDataRetrieval
*/

"use strict";
// Tokens for geocoding and mapbox to access web service
const GEO_CODING_TOKEN = 'f5a52f739e594ce0b1e777918371a269';
const MAPBOX_TOKEN = 'pk.eyJ1Ijoia2lkZDA5MjEiLCJhIjoiY2tvZnMyODhnMG94ejMxdHJwc2V4bHQ5NiJ9.DA11YyvD6M3wZaxSdcDIMg'
const URL = 'https://api.opencagedata.com/geocode/v1/json';

//Classes keys
const APP_DATA_KEY = "pristineCabAppData";
const INDIVIDUAL_DATA_KEY = "bookingData";

//Keys for random data
const BOOKING_CONTENT_KEY = "bookingContent";
const TAXI_AVAILABILITY_KEY = "taxiAvailability";
const BOOKING_NAME_CODE_KEY = "bookingMadeNameCodeNumber";

let taxiList = [
    { "rego": "VOV-887", "type": "Car", "available": true },
    { "rego": "OZS-293", "type": "Van", "available": false },
    { "rego": "WRE-188", "type": "SUV", "available": true },
    { "rego": "FWZ-490", "type": "Car", "available": true },
    { "rego": "NYE-874", "type": "SUV", "available": true },
    { "rego": "TES-277", "type": "Car", "available": false },
    { "rego": "GSP-874", "type": "SUV", "available": false },
    { "rego": "UAH-328", "type": "Minibus", "available": true },
    { "rego": "RJQ-001", "type": "SUV", "available": false },
    { "rego": "AGD-793", "type": "Minibus", "available": false }
];

//Classes...
// Booking Class
class Booking 
{
    constructor(bookingIndex, pickUpPoint, pickUpName, finalPoint, finalName, startDate, startTime, addPoint, addName, distance, taxiType, taxiRego, fare, prevTaxi, prevDecisionIndex) 
    {
        this._bookingIndex = bookingIndex;
        this._pickUpPoint = pickUpPoint;
        this._pickUpName = pickUpName;
        this._finalPoint = finalPoint;
        this._finalName = finalName;
        this._startDate = startDate;
        this._startTime = startTime;
        this._addPoint = addPoint;
        this._addName = addName;
        this._distance = distance;
        this._taxiType = taxiType;
        this._taxiRego = taxiRego;
        this._fare = fare;
        this._prevTaxi = prevTaxi;
        this._prevDecisionIndex = prevDecisionIndex;
    }

    // Accessors

    get bookingIndex() 
    {
        return this._bookingIndex;
    }

    get startDate() 
    {
        return this._startDate;
    }

    get startTime() 
    {
        return this._startTime;
    }

    get pickUpPoint() 
    {
        return this._pickUpPoint;
    }

    get pickUpName() 
    {
        return this._pickUpName;
    }

    get finalPoint() 
    {
        return this._finalPoint;
    }

    get finalName() 
    {
        return this._finalName;
    }

    get distance() 
    {
        return this._distance;
    }

    get taxiType() 
    {
        return this._taxiType;
    }

    get taxiRego() 
    {
        return this._taxiRego;
    }

    get fare() 
    {
        return this._fare;
    }

    get addPoint()
    {
        return this._addPoint
    }

    get addName()
    {
        return this._addName
    }

    get prevTaxi()
    {
        return this._prevTaxi
    }

    get prevDecisionIndex()
    {
        return this._prevDecisionIndex
    }

    // Mutators

    set bookingIndex(bookingIndexChoice) 
    {
        this._bookingIndex = bookingIndexChoice;
    }

    set startDate(dateChoice) 
    {
        this._startDate = dateChoice;
    }

    set startTime(timeChoice) 
    {
        this._startTime = timeChoice;
    }

    set pickUpPoint(pickUpPointChoice) 
    {
        this._pickUpPoint = pickUpPointChoice;
    }

    set pickUpName(pickUpNameChoice) 
    {
        this._pickUpName = pickUpNameChoice;
    }

    set finalPoint(finalPointChoice) 
    {
        this._finalPoint = finalPointChoice;
    }

    set finalName(finalNameChoice) 
    {
        this._finalName = finalNameChoice;
    }

    set taxiType(taxiTypeChoice) 
    {
        this._taxiType = taxiTypeChoice;
    }

    set taxiRego(taxiRegoChoice) 
    {
        this._taxiRego = taxiRegoChoice;
    }

    set addPoint(addPointChoice) 
    {
        this._addPoint = addPointChoice;
    }

    set addName(addNameChoice) 
    {
        this._addName = addNameChoice;
    }

    set prevTaxi(prevTaxiChoice)
    {
        this._prevTaxi = prevTaxiChoice;
    }

    set prevDecisionIndex(prevDecisionIndexChoice)
    {
        this._prevDecisionIndex = prevDecisionIndexChoice;
    }

    /* Description:
    setFareAndDistance function with 5 parameters longitude,latitude,taxiType,advancedBooking and startTime
    This function returns the fare and total distance per trip by calling the haversineFormula function
    */
    setFareAndDistance(longitude, latitude, taxiType, advancedBooking, startTime) 
    {
        const FLAGRATE = 3.0; //RM3.00
        const FARERATE = 0.10 / 0.115; //Distance based fare rate: RM0.10 / 0.115km
        let advancedBookingFare = 0;
        let midnightSurcharge = 1;
        let additionalLevy_Vehicles = 0;
        let totalDistance = 0
        // for loop to iterate through the longitude array to calculate the total distance 
        for (let i = 0; i < longitude.length - 1; i++) 
        {
            totalDistance += (haversineFormula(longitude[i], longitude[i + 1], latitude[i], latitude[i + 1]));
        }

        if (advancedBooking == true) 
        {
            advancedBookingFare = 2.00; //Additional RM2.00 fee
        }

        if ((startTime >= 0) && (startTime <= 6)) 
        {
            midnightSurcharge = 1.50; //Surcharge of 50 per cent between midnight and 6AM
        }

        if (taxiType == "SUV") 
        {
            additionalLevy_Vehicles = 5;
        }
        else if (taxiType == "Van") 
        {
            additionalLevy_Vehicles = 10;
        }
        else if (taxiType == "Minibus") 
        {
            additionalLevy_Vehicles = 15;
        }

        // formula to calculate the fare for each trip
        let totalFare = ((FARERATE * totalDistance) + FLAGRATE + advancedBookingFare + additionalLevy_Vehicles) * midnightSurcharge;

        this._distance = totalDistance;
        this._fare = totalFare;
    }


    // Methods

    // fromData method of Booking class with 1 parameter dataObject
    fromData(dataObject) 
    {
        // set attributes accordingly
        this._bookingIndex = dataObject._bookingIndex;
        this._pickUpPoint = dataObject._pickUpPoint;
        this._pickUpName = dataObject._pickUpName;
        this._finalPoint = dataObject._finalPoint;
        this._finalName = dataObject._finalName;
        this._startDate = dataObject._startDate;
        this._startTime = dataObject._startTime;
        this._addPoint = dataObject._addPoint;
        this._addName = dataObject._addName;
        this._distance = dataObject._distance;
        this._taxiType = dataObject._taxiType;
        this._taxiRego = dataObject._taxiRego;
        this._fare = dataObject._fare;
    }
}

// BookingList Class

class BookingList 
{
    constructor() 
    {
        this._bookingHistory = [];
    }

    get bookingHistory()
    {
        return this._bookingHistory;
    }

    addBooking(bookingIndex, pickUpPoint, pickUpName, finalPoint, finalName, startDate, startTime, addPoint, addName, distance, taxiType, taxiRego, fare, prevTaxi, prevDecisionIndex) 
    {
        let order = new Booking(bookingIndex, pickUpPoint, pickUpName, finalPoint, finalName, startDate, startTime, addPoint, addName, distance, taxiType, taxiRego, fare, prevTaxi, prevDecisionIndex);
        this._bookingHistory.push(order);
    }

    /* Description:
    removeBooking method with 1 parameter index 
    Checks if booking index history is equal to booking that we want to remove
    */
    removeBooking(index) 
    {
        for(let i = 0; i < this._bookingHistory.length;i++)
        {
            if ((this._bookingHistory[i].bookingIndex) == index)
            {
                this._bookingHistory.splice(i, 1);
                return;
            }
        }
        
    }

    /* Description:
    bookingsSorter method without parameters
    This function is responsible for iterating through the bookingHistory array and sorts the bookings based on the date of booking
    */
    bookingsSorter()
    {
        let taxiBookingList = [];
        for (let i = 0;i < this._bookingHistory.length;i++)
        {
            taxiBookingList.push(this._bookingHistory[i]);
        }
    
        for (let j = 0; j < taxiBookingList.length - 1; j++)
        {
            let minIndex = j;
            for (let k = j + 1; k < taxiBookingList.length; k++)
            {
                let dateCondition = (new Date (taxiBookingList[k].startDate)) < (new Date (taxiBookingList[minIndex].startDate));
                if (dateCondition)
                {
                    minIndex = k;
                }
            }
            if (minIndex !== j)
            {
                let temp = taxiBookingList[j];
                taxiBookingList[j] = taxiBookingList[minIndex];
                taxiBookingList[minIndex] = temp;
            }
        }
        return taxiBookingList
    }

     /* Description:
    fromData method of BookingList class with 1 parameter dataObject
    */
    fromData(dataObject) {
        let bookingListData = dataObject._bookingHistory;
        for (let i = 0; i < bookingListData.length; i++) //Loops through outer array. (queue)
        {
            let bookingNew = new Booking;
            bookingNew.fromData(bookingListData[i]);
            this._bookingHistory.push(bookingNew);
        }
    }
}

//~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.
//
//Functions...

function haversineFormula(lat1, lat2, lon1, lon2) 
{
    const R = 6371; // km
    const latRadian_1 = lat1 * Math.PI / 180; // latitude, longitude in radians
    const latRadian_2 = lat2 * Math.PI / 180;
    const deltaLatRadian = (lat2 - lat1) * Math.PI / 180;
    const deltaLonRadian = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaLatRadian / 2) * Math.sin(deltaLatRadian / 2) +
        Math.cos(latRadian_1) * Math.cos(latRadian_2) *
        Math.sin(deltaLonRadian / 2) * Math.sin(deltaLonRadian / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    let d = R * c; // in km

    return d;
}

/*Description:
checkLocal storage function with 1 parameter key
This function checks if data exists in local storage
*/
function checkLocalStorage(key) 
{
    let keyValue = storageDataRetrieval(key);
    if (keyValue == null || typeof keyValue == "undefined" || keyValue == "") //If data doesn't exist, return false.
    {
        return false;
    }
    else 
    {
        return true; //Otherwise, returns true.
    }
}

/*Description:
This function, updateStorage(), updates data into localStorage.
The parameters required are the key and the respective data that will be uploaded to local storage together.
*/
function updateStorage(key, data) 
{
    let dataStringify = JSON.stringify(data); //Makes object into a string as local storage only contains string value contents.
    localStorage.setItem(key, dataStringify);

}


/*Description:
This function, storageDataRetrieval(), retrieves / gets data from localStorage while determining if data should be parsed back into an object type.
The parameter required is the key of the data the user wishes to retrieve.
*/
function storageDataRetrieval(key) 
{
    let retrievedData = localStorage.getItem(key);
    try 
    {
        retrievedData = JSON.parse(retrievedData); //If this raises an error, it will catch it in the following catch section.
    }

    catch (error) 
    {
        console.error(error);
    }

    finally 
    {
        return retrievedData; //No matter if error was raised or not, it returns the retrieved data in an object type.
    }
}

/*Description:
webServiceRequest function with 2 parameters- url and data
This function checks if any data exists in local storage for the APP_DATA_KEY
subsequently performs specific action. (i.e. set up a data with default values.) 
*/

//Creates a URL with a callback in it (that perofrms certain function).
function webServiceRequest(url, data) 
{
    // Build URL parameters from data object.
    let params = "";
    // For each key in data object...
    for (let key in data) {
        if (data.hasOwnProperty(key)) 
        {
            if (params.length == 0) 
            {
                // First parameter starts with '?'
                params += "?";
            }
            else 
            {
                // Subsequent parameter separated by '&'
                params += "&";
            }

            let encodedKey = encodeURIComponent(key);
            let encodedValue = encodeURIComponent(data[key]);

            params += encodedKey + "=" + encodedValue;
        }
    }
    let script = document.createElement('script');
    script.src = url + params;
    document.body.appendChild(script);
}

let newBooking = new Booking;
let newBookingList = new BookingList;
if (checkLocalStorage(APP_DATA_KEY)) 
{
    newBookingList.fromData(storageDataRetrieval(APP_DATA_KEY));
}

if (!checkLocalStorage(TAXI_AVAILABILITY_KEY)) 
{
    updateStorage(TAXI_AVAILABILITY_KEY, taxiList)
}

if (!checkLocalStorage(BOOKING_NAME_CODE_KEY)) 
{
    updateStorage(BOOKING_NAME_CODE_KEY, 1)
}

/* homeRedirect function with no parameters
This function redirects the user to the mainPage.html
*/
function homeRedirect()
{
    window.location = "index.html";
}

/* bookingsRedirect function with no parameters
This function redirects the user to the view.html page
*/
function bookingsRedirect()
{
    window.location = "view.html";
}
