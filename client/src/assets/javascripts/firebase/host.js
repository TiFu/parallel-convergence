const functions = require("./firebase");
const sleep = require("sleep");

let roomId;
let userId;
functions.firebase.auth().signInAnonymously().catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(error)
    // ...
}).then(() => functions.createSession("11236")).then((data) => {
    roomId = data["roomId"]
    userId = data["userId"]
    return functions.draw("test", roomId, userId)
}).then(() => {
    return functions.addUndoStep("blabla", roomId, userId)
}).then(() => {
    return functions.addUndoStep("rrrrrr", roomId, userId);
}).then(() => {
    sleep.sleep(5);
    return functions.undoLast(roomId, userId);
}).then((undone) => {
    console.log(undone);
    return functions.undoLast(roomId, userId);
}).then((undone) => {
    console.log(undone);
    return functions.undoLast(roomId, userId);
}).then((undone) => {
    console.log(undone)
}).catch((err) => {
    console.log(err)
})