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
    return functions.draw("rrrrr5", roomId, userId)
}).then(() => {
    return functions.addUndoStep("rrrrrr1", roomId, userId);        
}).then(() => {
    return functions.addUndoStep("rrrrrr2", roomId, userId);        
}).then(() => {
    return functions.addUndoStep("rrrrrr3", roomId, userId);        
}).then(() => {
    return functions.addUndoStep("rrrrrr4", roomId, userId);        
}).then(() => {
    return functions.addUndoStep("rrrrrr5", roomId, userId);        
}).then(() => {
    return functions.undoLast(roomId, userId);
}).catch((err) => {
    console.log(err)
})