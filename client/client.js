let functions = require("./firebase");

functions.firebase.auth().signInAnonymously().catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(error)
    // ...
}).then(() => functions.joinSession("11233", roomEvents));

function roomEvents(snap) {
    console.log("New value: " + snap.val())
}