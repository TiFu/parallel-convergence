const firebase = require("firebase");
const configFile = require("./config.json");

var config = {
    apiKey: configFile["apiKey"],
    authDomain: configFile["authDomain"],
    databaseURL: configFile["databaseUrl"],
};

function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

console.log(config)

firebase.initializeApp(config);
const database = firebase.database();


function joinSession(gameId, roomEventCallback, roomEventErrorCallback) {
    return database.ref("/sessions/" + gameId).once("value").then((snapshot) => {
        var roomId = snapshot.val();
        console.log("Registered event callback for room " + roomId);
        database.ref("/rooms/" + roomId).on("child_added", roomEventCallback, roomEventErrorCallback)
    });
}

function createSession(gameId) {
    const roomId =  makeid(15)
    const ref =  database.ref("/sessions").child(gameId).set(roomId)
    .then(() => {
        console.log("RoomId: " + roomId);
        return database.ref("/rooms/" + roomId).push().set({ "event": "create", time: (new Date()).toString()})
    })

    return ref.then(() => {
        console.log("Created session " + gameId);
        return roomId;
    })
}

function draw(str, roomId) {
    return database.ref("/rooms/" + roomId).push().set(str).then(() => {
        console.log("Added " + str + " to " + roomId)
    }).catch((err) => {
        console.log(err)
    })
}

module.exports =  {
    firebase: firebase,
    createSession: createSession,
    joinSession: joinSession,
    draw: draw
}