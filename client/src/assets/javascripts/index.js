import React from "react"
import ReactDOM from "react-dom"
import $ from "jquery"

import App from "components/app"
import Controls from "components/controls"

require("../css/index.styl")

if($("#container")[0]) {
	ReactDOM.render(<App/>, $("#container")[0])
	console.log("loading app");
}

if($("#controls")[0]) {
	ReactDOM.render(<Controls/>, $("#controls")[0])
	console.log("loading controls");
}

