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
    promises = []
    for (let i =0; i < 15; i++) {
        let prom = functions.addUndoStep("rrrrrr", roomId, userId);        
        promises.push(prom)
    }
    return Promise.all(promises)
}).catch((err) => {
    console.log(err)
})