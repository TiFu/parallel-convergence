const firebase = require("firebase");
const configFile = require("./config.json");

var config = {
    apiKey: configFile["apiKey"],
    authDomain: configFile["authDomain"],
    databaseURL: configFile["databaseUrl"],
};

let _isOwner = false;

function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

firebase.initializeApp(config);
const database = firebase.database();


// returns {roomId: , userId }
function joinSession(gameId) {
    console.log("joining session " + gameId)
    return database.ref("/sessions/" + gameId).once("value").then((snapshot) => {
        var roomId = snapshot.val();

        if(roomId === null) {
            return createSession(gameId);
        }
        console.log("Registered event callback for room " + roomId);
        return roomId;
    }).then(addUserToRoom);
}

function registerDrawListeners(roomId, roomEventCallback, roomEventErrorCallback, timerCallback, timerErrorCallback) {
    database.ref("/rooms/" + roomId).on("value", roomEventCallback, roomEventErrorCallback)
    console.log("Registering listener for " + roomId)
    database.ref("/timers/rooms/" + roomId).on("value", timerCallback, timerErrorCallback)        
}

function addUserToRoom(roomId) {
    const uid = firebase.auth().currentUser.uid
    console.log("User Info", { "roomId": roomId, "canvasId": uid})
    return clearUndo(roomId, uid).then(() => { 
        return { "roomId": roomId, "userId": uid}; 
    });
}

function addTimer(roomId, name, durationInSeconds, ingameTime) {
    console.log("Adding timer " + roomId + ", " + name + " duration: " + durationInSeconds + ", gameTime: " + ingameTime)
    let pushRef = database.ref("/timers/rooms/" + roomId).push()
    const key = pushRef.key;
    return pushRef.set({ name: name, startTime: ingameTime, duration: durationInSeconds})
}

function removeTimer(roomId, key) {
    console.log("Firebase remove timer " + key)
    return database.ref("/timers/rooms/" + roomId + "/" + key).remove();
}

function clearUndo(roomId, userId) {
    return database.ref("/undo/rooms/" + roomId + "/" + userId).remove().then(() => {
        return database.ref("/rooms/" + roomId + "/" + userId).once("value");
    }).then((data) => {
        let val = data.val();
        if (val == null) {
            val = "";
        }
        return addUndoStep(val, roomId, userId);
    })
}
        
// returns {roomId: , userId }
function createSession(gameId) {
    _isOwner = true;
    const roomId =  makeid(15)
    console.log("creating session with ID " + gameId)
    return database.ref("/sessions").child(gameId).set(roomId).then(() => roomId);
}

function draw(str, roomId, userId) {
    return database.ref("/rooms/" + roomId + "/" + userId).set(str).then(() => {})
}

const MAX_UNDO_STEPS = 10;
let undoLowerBound = 0;
let undoUpperBound = 0; // next empty child
function addUndoStep(imageData, roomId, userId) {
  return database.ref("/undo/rooms/" + roomId + "/" + userId)
    .child(undoUpperBound)
    .set(imageData)
    .then(() => {
        undoUpperBound++;
        if (undoUpperBound - undoLowerBound > MAX_UNDO_STEPS) {
          return database.ref("/undo/rooms/" + roomId + "/" + userId)
            .child(undoLowerBound)
            .remove()
            .then(() => {
              undoLowerBound++;
            })
        }
    })
}

function canUndoStep(roomId, userId) {
    return undoLowerBound < undoUpperBound - 1;
}

// returns image data
function undoLast(roomId, userId) {
  // no undo step available
  if (undoLowerBound >= undoUpperBound - 1) {
    return Promise.reject("No undo step available");
  }

  const undoRef = database.ref("/undo/rooms/" + roomId + "/" + userId)
    .child(undoUpperBound - 1)

    return undoRef.remove().then(() => {
      undoUpperBound--;
      return database.ref("/undo/rooms/" + roomId + "/" + userId)
        .child(undoUpperBound - 1)
        .once("value")
    }).then((last) => {
      return database.ref("/rooms/" + roomId + "/" + userId).set(last.val());
    })
}

function registerGameStateListener(roomId, listener, errorListener)    {
    console.log("Registering game state listener for " + roomId)
    database.ref("/gameState/" + roomId).on("value", listener, errorListener)  
}

function publishGameState(roomId, state) {
    console.log("Setting game state to " + state)
    return database.ref("/gameState/" + roomId).set(state);
}

function isOwner()  {
    return _isOwner;
}

module.exports =  {
    firebase: firebase,
    registerDrawListeners: registerDrawListeners,
    createSession: createSession,
    joinSession: joinSession,
    addTimer: addTimer,
    draw: draw,
    removeTimer: removeTimer,
    undoLast: undoLast,
    canUndoStep: canUndoStep,
    addUndoStep: addUndoStep,
    registerGameStateListener: registerGameStateListener,
    publishGameState: publishGameState,
    isOwner: isOwner
}
