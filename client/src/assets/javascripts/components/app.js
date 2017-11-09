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
    this.setState({ initialDrawing: data.val() })
  }

  handleDrawingChanged = newDrawingData => {
    if (this.roomId) {
      draw(newDrawingData, this.roomId)
    }
  }

  render() {
    let { initialDrawing } = this.state
    return (
      <div className="app">
        <DrawableCanvas
          initialDrawing={initialDrawing}
          onDrawingChanged={this.handleDrawingChanged}
        />
      </div>
    )
  }
}
