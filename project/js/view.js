/* view.js file that contains the following functions-
 bookingCategorization,viewDetailedBooking_Future,deleteBooking_Future,viewDetailedBooking_Commenced and deleteBooking_Commenced
*/
"use strict"
newBookingList = new BookingList;
newBookingList.fromData(storageDataRetrieval(APP_DATA_KEY));

// initialising variables
let taxiAvailability = storageDataRetrieval(TAXI_AVAILABILITY_KEY);
let taxiBookingList = newBookingList.bookingsSorter();
let taxiSeparationIndex = 0;
let futureBookingData = [];
let pastBookingData = [];
let commencedBookingData = [];

/* Description: 
bookingCategorization function without any parameters
This function is responsible for updating data of past present and future bookings into the view.html page
*/
function bookingsCategorization() 
{
    let taxiSeparationFoundFlag = false;
    let taxiSeparationLoopIndex = 0;

    while ((taxiSeparationFoundFlag == false) && (taxiSeparationLoopIndex < taxiBookingList.length)) 
    {
        let startDate = (new Date(taxiBookingList[taxiSeparationLoopIndex].startDate)).getDate();
        let CurrentDate = (new Date()).getDate();
        let taxiSeparationFoundFlag = (startDate > CurrentDate);
        if (taxiSeparationFoundFlag == true) 
        {
            taxiSeparationIndex = taxiSeparationLoopIndex;
        }

        else
        {
            taxiSeparationLoopIndex += 1;
        }
    }

    if (taxiSeparationFoundFlag == true) {
    
        futureBookingData = taxiBookingList.slice(taxiSeparationIndex, (taxiBookingList.length));
        let pastAndCommencedBookingData = taxiBookingList.slice(0, (taxiSeparationIndex));
        for (let j = 0;j < pastAndCommencedBookingData.length;j++)
        {
            if((new Date(pastAndCommencedBookingData[j].startDate)).getDate() == (new Date()).getDate())
            {
                commencedBookingData.push(pastAndCommencedBookingData[j]);
            }
            else
            {
                pastBookingData.push(pastAndCommencedBookingData[j]);
            }
        }
        
        
    }

    else 
    {
        let pastAndCommencedBookingData = taxiBookingList;
        for (let j = 0;j < pastAndCommencedBookingData.length;j++)
        {
            console.log((new Date(pastAndCommencedBookingData[j].startDate)))
            console.log(new Date())
            if((new Date(pastAndCommencedBookingData[j].startDate)).getDate() == (new Date()).getDate())
            {
                commencedBookingData.push(pastAndCommencedBookingData[j]);
            }
            else
            {
                pastBookingData.push(pastAndCommencedBookingData[j]);
            }
        }
    }

    if (futureBookingData.length != 0) 
    {
        let futureBookingSelections = "";
        for (let i = 0; i < futureBookingData.length; i++) 
        {
            futureBookingSelections += `
            <div class="mdl-grid">
            <div class="mdl-cell mdl-cell--4-col">
                <div class="mdl-list__item-primary-content">
                    <div class="taxiDetails">
                        <p>Booking name: Booking${futureBookingData[i].bookingIndex}</p>
                        <p>Date and Time: ${futureBookingData[i].startDate}||${futureBookingData[i].startTime}</p>
                    </div>
                </div>
                <div style="margin-right: 50%;">
                    <span class="mdl-list__item-secondary-content">
                        <span style="color: palevioletred; size: 100ch;" onclick="viewDetailedBooking_Future(${futureBookingData[i].bookingIndex})"><i
                                class="material-icons">info</i></span>
                    </span>


                    <span class="mdl-list__item-secondary-content">
                        <span style="color: palevioletred;" onclick="deleteBooking_Future(${futureBookingData[i].bookingIndex})"><i
                                class="material-icons">delete</i></span>
                    </span>
                </div>
            </div>
        </div>
        <hr>

            `;
        }
        document.getElementById("futureBookingSummary").innerHTML = futureBookingSelections;
    }

    if (pastBookingData.length != 0) 
    {
        let pastBookingSelections = "";
        for (let i = 0; i < pastBookingData.length; i++) 
        {
            pastBookingSelections += `
            <div class="mdl-grid">
            <div class="mdl-cell mdl-cell--4-col">
                <div class="mdl-list__item-primary-content">
                    <div class="taxiDetails">
                        <p>Booking name: Booking${pastBookingData[i].bookingIndex}</p>
                        <p>Date and Time: ${pastBookingData[i].startDate}||${pastBookingData[i].startTime}</p>
                    </div>
                </div>
                <div style="margin-right: 50%;">
                    <span class="mdl-list__item-secondary-content">
                        <span style="color: palevioletred; size: 100ch;" onclick="viewDetailedBooking_Past(${pastBookingData[i].bookingIndex})"><i
                                class="material-icons">info</i></span>
                    </span>


                    <span class="mdl-list__item-secondary-content">
                        <span style="color: palevioletred;" onclick="deleteBooking_Past(${pastBookingData[i].bookingIndex})"><i
                                class="material-icons">delete</i></span>
                    </span>
                </div>
            </div>
        </div>

            `;
        }
        document.getElementById("pastBookingSummary").innerHTML = pastBookingSelections;
    }

    if (commencedBookingData.length != 0) 
    {
        let commencedBookingSelections = "";
        for (let i = 0; i < commencedBookingData.length; i++) 
        {
            commencedBookingSelections += `
            <div class="mdl-grid">
            <div class="mdl-cell mdl-cell--4-col">
                <div class="mdl-list__item-primary-content">
                    <div class="taxiDetails">
                        <p>Booking name: Booking${commencedBookingData[i].bookingIndex}</p>
                        <p>Date and Time: ${commencedBookingData[i].startDate}||${commencedBookingData[i].startTime}</p>
                    </div>
                </div>
                <div style="margin-right: 50%;">
                    <span class="mdl-list__item-secondary-content">
                        <span style="color: palevioletred; size: 100ch;" onclick="viewDetailedBooking_Commenced(${commencedBookingData[i].bookingIndex})"><i
                                class="material-icons">info</i></span>
                    </span>


                    <span class="mdl-list__item-secondary-content">
                        <span style="color: palevioletred;" onclick="deleteBooking_Commenced(${commencedBookingData[i].bookingIndex})"><i
                                class="material-icons">delete</i></span>
                    </span>
                </div>
            </div>
        </div>
        <hr>

            `;
        }
        document.getElementById("commencedBookingSummary").innerHTML = commencedBookingSelections;
    }
}

bookingsCategorization();

/* Description: 
viewDetailedBooking_Future function with 1 parameter-content
It is responsible for updating the future booking into the local storage and redirects the user to the detailedBooking.html page
*/
function viewDetailedBooking_Future(content)
{
    localStorage.setItem(BOOKING_CONTENT_KEY,content);
    window.location = "detailedBooking.html"; //Directs user to detailedBooking.html page.
}

/* Description: 
deleteBooking_Future function with 1 parameter- index
It is responsible for confirming with the user if they want to cancel the future booking. It then removes the booking at the
current index and then updates the local storage
*/
function deleteBooking_Future(index)
{
    let remove = confirm("Are you sure you want to delete this booking?");
    if (remove == true) //If user confirms.
    {
        newBookingList.removeBooking(index);
        updateStorage(APP_DATA_KEY,newBookingList);
        window.location = "view.html";
    }
}

/* Description: 
viewDetailBooking_Commenced function with 1 parameter- content
It updates the local storage with the commenced booking and redirects the user to the detailedBooking.html page
*/
function viewDetailedBooking_Commenced(content)
{
    localStorage.setItem(BOOKING_CONTENT_KEY,content);
    window.location = "detailedBooking.html"; //Directs user to detailedBooking.html page.
}

/* Description: 
deleteBooking_Commenced function with 1 parameter- index
It is responsible for confirming with the user if they want to cancel the commenced booking. It then removes the booking at the
current index and then updates the local storage
storage and redirects the user to the view.html page
*/
function deleteBooking_Commenced(index)
{
    let remove = confirm("Are you sure you want to delete this booking?");
    if (remove == true) //If user confirms.
    {
        newBookingList.removeBooking(index);
        updateStorage(APP_DATA_KEY,newBookingList);
        window.location = "view.html";
    }
}

/* Description: 
viewDetailBooking_Past function with 1 parameter- content
It updates the local storage with the past bookings and redirects the user to the detailedBooking.html page
*/
function viewDetailedBooking_Past(content)
{
    localStorage.setItem(BOOKING_CONTENT_KEY,content);
    window.location = "detailedBooking.html"; //Directs user to detailedBooking.html page.
}

/* Description: 
deleteBooking_Past function with 1 parameter- index
It is responsible for confirming with the user if they want to delete any past bookings. It then removes the booking at the
current index and then updates the local storage
storage and redirects the user to the view.html page
*/
function deleteBooking_Past(index)
{
    let remove = confirm("Are you sure you want to delete this booking?");
    if (remove == true) //If user confirms.
    {
        newBookingList.removeBooking(index);
        updateStorage(APP_DATA_KEY,newBookingList);
        window.location = "view.html";
    }
}
