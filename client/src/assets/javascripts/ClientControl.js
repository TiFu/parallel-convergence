
let OverwolfPlugin = require('overwolfplugin.js');

let plgSimpleIo = null;
let plgClientControl = null;

function loadSimpleIo(callback) {
    if (plgSimpleIo == null) {
        plgSimpleIo  = new OverwolfPlugin("simple-io-plugin", true);
        plgSimpleIo.initialize(function(status) {
            if (status == false) {
                console.log("Plugin not loaded");
                plgSimpleIo = null;
                callback(false);
                return;
            } else {
                console.log("Plugin loaded");
                callback(true);
                return;
            }
        });
    }
}

function loadClientControl(callback) {
    if (plgClientControl == null) {
        plgClientControl  = new OverwolfPlugin("LeagueCoachingHelperPlugin", true);
        plgClientControl.initialize(function(status) {
            if (status === false) {
                console.log("client control plugin not loaded");
                plgClientControl = null;
                callback(false);
                return;
            } else {
                console.log("client control plugin loaded");
                callback(plgClientControl);
                return;
            }
        });
    }
}

function initialize(callback)   {

    /* var fireCallbackError = function(errorMessage){
        console.log("initialize error: " + errorMessage);
        callback({
            status:"error",
            errorMessage:errorMessage,
        });
    };

    loadSimpleIo(function(state) {
        if (state) {
            overwolf.games.getRunningGameInfo(function(gameInfo) {
                try {
                    if (gameInfo == null || parseInt(gameInfo.id / 10) != 5426) {
                        fireCallbackError("Not in game");
                        return;
                    }

                    var latestAirClientVersion = "0";
                    var gamePath = gameInfo.executionPath;
                    var gameRoot = gamePath.substring(0, gamePath.indexOf("RADS"));
                    var commandLine = gameInfo.commandLine;

                    if (typeof(commandLine) === "undefined") {
                        fireCallbackError("Something went wrong");
                        return;
                    }

                    if (!commandLine.includes('.rofl')) {
                        fireCallbackError("Client is not replaying a match");
                        return;
                    }
                
                    let logDir = gameRoot + "/Logs/Game - R3d Logs/";

                    plgSimpleIo.get().getLatestFileInDirectory(logDir + "*.txt", function(status, filename) {
                        if (status) {
                            plgSimpleIo.get().getTextFile(logDir + filename, false, function(status, data)   {
                                if(status)  {
                                    let pattern = /ALWAYS| ReplayClient: Started new chunk.  ChunkID: \d+  chunk start time: [0-9.]+  SimulationTime:[0-9.]+ TotalReplayTime:([0-9]+)\.[0-9]+ size:[0-9]+/ig;

                                    let matches = pattern.exec(data);

                                    if(matches == null) {
                                        console.log("could not find game time in log file!");
                                        fireCallbackError("could not find game time in log file!");
                                        return;
                                    }   else    {
                                        let timeAsStr = matches[1]
                                        let timeAsInt = parseInt(timeAsStr)
                                        console.log("got game time of " + timeAsStr + ", as int: " + timeAsInt);

                                        callback({status:null});
                                        return;
                                    }
                                    
                                }   else {
                                    fireCallbackError("failed to open log file \"" + filename + "\"! " + status + " " + data);
                                    return;
                                }
                            })
                        } else {
                            fireCallbackError("Couldn't find latest log file");
                            return;
                        }
                    });
                

                } catch(err) {
                    console.log("Failed to use plugin");
                    callback("Failed to use plugin");
                    return
                }
            });
        } else {
            console.log("Plugin failed to initialize");
            callback("Failed to use plugin");
            return
        }
    }); */

    loadClientControl(function(client)  {
        if(client)  {
            client.get().Initialize(function(error) {
                if(error === null) {
                    let count = 0;
                    client.get().GameStateChanged.addListener(function(gameState) {
                        if((count = (count + 1) % 100) === 0)  {
                            console.log("game state updated: (" + gameState.CameraLocation.X + ", " + gameState.CameraLocation.Y + ")")
                        }
                    })

                    callback();
                    return;
                }   else    {
                    console.log("error initializing client control! " + error);
                    callback("error initializing client control! " + error);
                    return;
                }
            })
        }   else    {
            console.log("client load failed!!")
            callback("client load failed!!")
            return;
        }
    })
}

function setGameState(packedGameState, callback)    {
    plgClientControl.get().SetState(packedGameState, callback);
}

function onGameStateChanged(eventHandler) {
    plgClientControl.get().GameStateChanged.addListener(eventHandler)
}

module.exports =  {
    initialize: initialize,
    setGameState: setGameState,
    onGameStateChanged: onGameStateChanged,
}
