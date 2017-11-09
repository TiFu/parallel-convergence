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
const gameId = 11236

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = { initialDrawing: "", canvases: {}, drawingTool: DrawingTool.FREE, lineWidth: 4  }
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

  changeLineWidth = e => {
    console.log("New line width: " + Number.parseInt(e.target.value))
    this.setState({lineWidth: Number.parseInt(e.target.value)})
  }
  formatButtons() {
    return (
      <div style={{ position: "absolute", zIndex: "2" }}>
        <button onClick={this.clearCanvas}><i className="fa fa-trash-o" aria-hidden="true"></i></button>
        <button onClick={this.undo} ><i className="fa fa-undo" aria-hidden="true"></i></button>
        <select onChange={this.changeLineWidth} style={{"fontFamily": "FontAwesome', Helvetica"}}>
          <option value="2" selected={this.state.lineWidth == 2} style={ {fontSize: "12pt"} }>&#8722;</option>
          <option value="4" selected={this.state.lineWidth == 4} style={ {fontSize: "16pt"} }>&#8722;</option>
          <option value="6" selected={this.state.lineWidth == 6} style={ {fontSize: "20pt"} }>&#8722;</option>
          <option value="8"  selected={this.state.lineWidth == 8} style={ {fontSize: "24pt"} }>&#8722;</option>
          <option value="10"  selected={this.state.lineWidth == 10} style={ {fontSize: "28pt"} }>&#8722;</option>
        </select>
        <button onClick={this.selectFree} style={ {marginLeft: "10px"}} ><i className="fa fa-pencil" aria-hidden="true"></i></button>
        <button onClick={this.selectOval}><i className="fa fa-circle-o" aria-hidden="true"></i></button>
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
        lineWidth={this.state.lineWidth}
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
