import React from "react"

import DrawableCanvas from "components/drawable-canvas"
import {
  addUndoStep,
  undoLast,
  draw,
  firebase,
  joinSession,
  registerDrawListeners,
} from "firebase/firebase"


// TODO: Make this not hardcoded
const gameId = 11233

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = { initialDrawing: "", canvases: {} }
  }
  componentDidMount() {
    firebase.auth().signInAnonymously()
      .catch(error => {
        console.log(error)
      })
      .then(() => {
        joinSession(gameId)
          .then(ids => {
            this.roomId = ids.roomId
            this.userId = ids.userId
            registerDrawListeners(
              this.roomId, this.handleRoomEvent, () => console.log("SAD"))
          })
      })
  }

  handleRoomEvent = data => {
    if (!data.val()) {
      this.setState({ canvases: {} })
    }
    else {
      let canvases = data.val()
      this.setState({ canvases })
    }
  }

  handleDrawingChanged = newDrawingData => {
    if (this.roomId) {
      draw(newDrawingData, this.roomId, this.userId)
    }
  }

  handleMouseUp = newDrawingData => {
    addUndoStep(newDrawingData, this.roomId, this.userId)
  }

  clearCanvas = e => {
    let { canvases } = this.state
    canvases[this.userId] = ""
    this.setState({ canvases }, () => {
      this.handleDrawingChanged("")
    })
  }

  undo = e => {
    undoLast(this.roomId, this.userId)
  }

  formatButtons() {
    return (
      <div style={{ position: "absolute", zIndex: "2" }}>
        <button onClick={this.clearCanvas}>Clear</button>
        <button onClick={this.undo}>Undo</button>
      </div>
    )
  }

  formatOtherCanvases() {
    let { canvases } = this.state

    let otherCanvases = []

    Object.keys(canvases).filter(key => key !== this.userId).forEach(key => {
      otherCanvases.push(
        <DrawableCanvas
          key={key}
          initialDrawing={canvases[key]}
          isDrawable={false}
        />
      )
    })

    return otherCanvases
  }

  render() {
    let { canvases } = this.state

    let myCanvas = this.userId ?
      <DrawableCanvas
        initialDrawing={canvases[this.userId] || ""}
        onDrawingChanged={this.handleDrawingChanged}
        onMouseUp={this.handleMouseUp}
        isDrawable={true}
        canvasStyle={{ zIndex: "1" }}
      /> :
      null

    return (
      <div className="app">
        {this.formatButtons()}
        {myCanvas}
        {this.formatOtherCanvases()}
      </div>
    )
  }
}
