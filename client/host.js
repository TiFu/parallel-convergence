const functions = require("./firebase");
const sleep = require("sleep");

functions.firebase.auth().signInAnonymously().catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(error)
    // ...
}).then(() => functions.createSession("11233")).then((roomId) => {
    console.log("RoomId: " + roomId);
    sleep.sleep(3);
    for (let i = 0; i < 5; i++) {
        functions.draw("test", roomId)
    }
})