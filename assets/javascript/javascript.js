$(document).ready(function () {

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyDwYjQG2MkZ_sQVxXc4rkhBbyDO8DXUZes",
        authDomain: "spaceshipscheduler.firebaseapp.com",
        databaseURL: "https://spaceshipscheduler.firebaseio.com",
        projectId: "spaceshipscheduler",
        storageBucket: "spaceshipscheduler.appspot.com",
        messagingSenderId: "750832104755"
    };

    firebase.initializeApp(config);

    //Declare variables to their HTML counterparts
    var database = firebase.database();
    var submit = $("#submit");
    var clear = $("#clear");
    var table = $("#tableBody");
    var error = $("#error");
    var emptyTimeVar;
    var currentTime = $(".currentTime");
    var confirmDeleteDiv = $("#confirmDeleteDiv");
    var confirmDeleteButton = $("#confirmDeleteButton");
    var exitDelete = $(".exitDelete");
    var deleteText = $("#deleteText");
    var shipKey;

    //Function to show the current time
    function setCurrentTime() {
        currentTime.text(moment().format('dddd, MMMM Do, YYYY [at] h:mm:ss A'));
    }
    //Starts the time function to run every second
    emptyTimeVar = setInterval(setCurrentTime, 1000);

    //Resets the values
    function clearInput() {
        $("#name").val("");
        $("#destination").val("");
        $("#firstTime").val("");
        $("#frequency").val("");
    }

    submit.click(function (event) {
        event.preventDefault();

        //Grabs the input variables values
        var name = $("#name").val().trim();
        var destination = $("#destination").val().trim();
        var firstTime = $("#firstTime").val().trim();
        var frequency = $("#frequency").val().trim();

        //Shows an error if an input is empty.
        if (name === "" || destination === "" || firstTime === "" || frequency === "") {
            error.show();
        }
        else {
            error.hide();
            clearInput();

            //Adds the inputs to Firebase
            database.ref().push({
                name: name,
                destination: destination,
                firstTime: firstTime,
                frequency: frequency
            });
        }
    });

    clear.click(function () {
        event.preventDefault();
        clearInput();
    });

    function refreshData() {

        table.empty();

        //Pulls info from Firebase
        database.ref().on("child_added", function (snapshot) {

            //Creating rows to add to the table
            var newRow = $("<tr class='pFont black'>");
            var shipName = $("<td>").text(snapshot.val().name);
            var shipDest = $("<td>").text(snapshot.val().destination);
            var shipFreq = $("<td>").text("Every " + (snapshot.val().frequency) + " Minutes");
            var deleteShip = $("<td class='btn ml-3 xBtn text-center'>").text("X");
            deleteShip.attr('ship-name', snapshot.val().name);
            deleteShip.attr('key', snapshot.key);

            var frequency = parseInt(snapshot.val().frequency);
            var firstTime = parseInt(snapshot.val().firstTime);
            var currentTime = moment();

            //Using moment to calculate the proper time
            var minutesAway = currentTime.diff(moment.unix(firstTime), "minutes");
            minutesAway = minutesAway % frequency;
            minutesAway = frequency - minutesAway;
            nextArrival = currentTime.add(minutesAway, "m").format("h:mm A");
            var nextTime = $("<td>").text(nextArrival);
            var minsAway = $("<td>").text((minutesAway) + " Minutes Away");

            //Appends all of the items in the row to the table
            newRow.append(shipName);
            newRow.append(shipDest);
            newRow.append(shipFreq);
            newRow.append(nextTime);
            newRow.append(minsAway);
            newRow.append(deleteShip);
            table.append(newRow);

        });
    }

    refreshData();

    $(document).on("click", ".xBtn", function () {
        deleteText.html("Are you sure you want to delete the spaceship " + ($(this).attr('ship-name')) + "? <br> Please only delete if you made this ship.");
        confirmDeleteDiv.show();
        shipKey = ($(this).attr('key'));
    });

    exitDelete.click(function () {
        confirmDeleteDiv.hide();
    });

    confirmDeleteButton.click(function () {
        refreshData();
        database.ref(shipKey).remove();
        confirmDeleteDiv.hide();
    });

});
