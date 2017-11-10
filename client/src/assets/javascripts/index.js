import React from "react"
import ReactDOM from "react-dom"
import $ from "jquery"

import App from "components/app"

require("../css/index.styl")
import 'react-select/dist/react-select.css'


ReactDOM.render(<App/>, $("#container")[0])
