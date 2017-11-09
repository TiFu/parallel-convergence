let functions = require("./firebase");

functions.firebase.auth().signInAnonymously().then(() => {
    functions.addTimer("w8xZXYA8MKl5Zc4", "abc", 30)
})
