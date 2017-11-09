import React from "react"

import DrawableCanvas from "components/drawable-canvas"
import { draw, firebase, joinSession } from "firebase/firebase"


// TODO: Make this not hardcoded
const gameId = 11233

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = { initialDrawing: "" }
  }
  componentDidMount() {
    firebase.auth().signInAnonymously()
      .catch(error => {
        console.log(error)
      })
      .then(() => {
        joinSession(gameId, this.handleRoomEvent, () => console.log("SAD"))
          .then(roomId => {
            this.roomId = roomId
          })
      })
  }

  handleRoomEvent = data => {
    if (!data.val()) {
      this.setState({ initialDrawing: ""})
    }
    else {
      this.setState({ initialDrawing: data.val() })
    }
  }

  handleDrawingChanged = newDrawingData => {
    if (this.roomId) {
      draw(newDrawingData, this.roomId)
    }
  }

  clearCanvas = e => {
    this.setState({ initialDrawing: "" }, () => {
      this.handleDrawingChanged("")
    })
  }

  formatButtons() {
    return (
      <div>
        <button style={{ position: "absolute" }} onClick={this.clearCanvas}>Clear</button>
      </div>
    )
  }

  render() {
    let { initialDrawing } = this.state
    return (
      <div className="app">
        {this.formatButtons()}
        <DrawableCanvas
          initialDrawing={initialDrawing}
          onDrawingChanged={this.handleDrawingChanged}
        />
      </div>
    )
  }
}
