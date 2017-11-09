import React from "react"

import {DrawableCanvas, DrawingTool} from "components/drawable-canvas"
import {
  addUndoStep,
  undoLast,
  draw,
  firebase,
  joinSession,
  registerDrawListeners,
} from "firebase/firebase"


// TODO: Make this not hardcoded
const gameId = 11234

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = { initialDrawing: "", canvases: {}, drawingTool: DrawingTool.FREE  }
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

  selectOval = e => {
    this.setState({drawingTool: DrawingTool.OVAL})
  }

  selectFree = e => {
    this.setState({drawingTool: DrawingTool.FREE})
  }

  selectText = e => {
    this.setState({drawingTool: DrawingTool.TEXT})
  }

  formatButtons() {
    return (
      <div style={{ position: "absolute", zIndex: "2" }}>
        <button onClick={this.clearCanvas}><i class="fa fa-trash-o" aria-hidden="true"></i></button>
        <button onClick={this.undo} class="marginl"><i class="fa fa-undo" aria-hidden="true"></i></button>
        <button onClick={this.selectFree}><i class="fa fa-pencil" aria-hidden="true"></i></button>
        <button onClick={this.selectOval}><i class="fa fa-circle-o" aria-hidden="true"></i></button>
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

    console.log("RENDRE: " + this.state.drawingTool)
    let myCanvas = this.userId ?
      <DrawableCanvas
        initialDrawing={canvases[this.userId] || ""}
        onDrawingChanged={this.handleDrawingChanged}
        onMouseUp={this.handleMouseUp}
        drawingTool={this.state.drawingTool}
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
