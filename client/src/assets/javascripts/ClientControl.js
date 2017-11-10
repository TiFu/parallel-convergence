
let OverwolfPlugin = require('overwolfplugin.js');

let plgClientControl = null;

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
