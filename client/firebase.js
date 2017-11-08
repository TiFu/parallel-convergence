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


function joinSession(gameId, roomEventCallback) {
    let roomId; 
    return database.ref("/sessions/" + gameId).once("value").then((snapshot) => {
        roomId = snapshot.val();
        console.log("Creating room");
        return database.ref("/rooms/" + roomId);
    }).then(() => {
        console.log("Registered event callback");
        database.ref("/rooms/" + roomId).on("value", roomEventCallback)
    });
}

function createSession(gameId) {
    const roomId =  makeid(15)
    const ref =  database.ref("/sessions").child(gameId).set(roomId)
    .then((roomId) => {
        console.log("RoomId: " + roomId);
    })
    return ref.then(() => {
        console.log("Created session " + gameId);
        return roomId;
    })
}

function draw(str, roomId) {
    return database.ref("/room/" + roomId).push().set(str)
}

module.exports =  {
    firebase: firebase,
    createSession: createSession,
    joinSession: joinSession,
    draw: draw
}