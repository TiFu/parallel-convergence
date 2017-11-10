import React from "react"

import {DrawableCanvas, DrawingTool} from "components/drawable-canvas"
import {
  addUndoStep,
  undoLast,
  addTimer,
  draw,
  firebase,
  joinSession,
  registerDrawListeners,
  registerGameStateListener,
  publishGameState,
  isOwner
} from "firebase/firebase"

let ClientControl = require("ClientControl")

// TODO: Make this not hardcoded
const gameId = 112363666

export default class App extends React.Component {
  constructor(props) {
    super(props)

	this.state = { initialDrawing: "", canvases: {}, drawingTool: DrawingTool.FREE, lineWidth: 4, timers: [], clickthrough: false }
	
	overwolf.windows.getCurrentWindow((result) => {
		this.windowId = result.window.id;
	});

	overwolf.settings.registerHotKey("toggle_clickthrough", (status) =>{
		console.log("hotkey pressed");
		if (status === "success") {
			console.log("hotkey success");
      this.setState({clickthrough: !this.state.clickthrough})
			if(this.state.clickthrough) {
				overwolf.windows.removeWindowStyle(this.windowId, overwolf.windows.enums.WindowStyle.InputPassThrough, () => {
					console.log("disabled clickthrough");
				});
			}else {
				overwolf.windows.setWindowStyle(this.windowId, overwolf.windows.enums.WindowStyle.InputPassThrough, () => {
					console.log("enabled clickthrough");
				});
      }
      this.setState({clickthrough: !this.state.clickthrough})
		}
	});
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
              this.roomId, this.handleRoomEvent, () => console.log("SAD"), this.handleTimerEvent, () => console.log("SAD")
            )
            
            ClientControl.initialize((status) => {
              if (status === undefined) {
                  console.log('successfully initialized client control')
                  if(isOwner()) {
                      console.log("setting up as owner of lobby...")
          
                      ClientControl.onGameStateChanged((state) => {
                          console.log("sending game state to firebase")
                          console.log(state)
                          publishGameState(ids.roomId, state);
                      })
                  }   else{
                      console.log("setting up as client of lobby...")

                      registerGameStateListener(ids.roomId, (state) => {
                        if(state.val()) {
                          console.log("setting game state")
                          console.log(state.val())
                          ClientControl.setGameState(state.val(), (error) => {
                            if(error) {
                              console.log("error setting game state! " + error);
                            }
                          })
                        }
                      })
                  }
              }   else{
                  console.log('failed to initialize! ' + status)
              }
            })
          })
      })
  }

  handleTimerEvent = data => {
    if (!data.val()) {
      console.log("empty timer")
      this.setState({timers: []})
    } else {
      console.log("Timers: ", data.val())
      this.setState({timers: data.val()})
    }
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
      console.log("DRAW NEW DATA")
      draw(newDrawingData, this.roomId, this.userId)
    } else {
      console.log("DRAW NO NEW DATE")
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

/*  selectText = e => {
    this.setState({drawingTool: DrawingTool.TEXT})
  }*/

  selectArrow = e => {
    console.log("SET DRAWING TOOL TO ARROw")
    this.setState({drawingTool: DrawingTool.ARROW})
  }

  changeLineWidth = e => {
    console.log("New line width: " + Number.parseInt(e.target.value))
    this.setState({lineWidth: Number.parseInt(e.target.value)})
  }

  addTimerEvent = e => {
    let timerName = this.refs.timerName.value;
    let duration = this.refs.timerDuration.value
    // try to parse duration
    let splitDuration = duration.split(":")
    let timerDuration = 0
    if (splitDuration.length == 1) {
      timerDuration += Number.parseInt(splitDuration[0])
    } else {
      timerDuration += Number.parseInt(splitDuration[0]) * 60 + Number.parseInt(splitDuration[1]) 
    }

    console.log("Name: " + timerName)
    console.log("Duration: " + timerDuration)
    addTimer(this.roomId, timerName, timerDuration).catch((err) => {
      console.log(err)
    })
  }

  formatButtons() {
    return (
      <div className="buttons-container">
        <button onClick={this.clearCanvas}>
          <i className="fa fa-lg fa-trash-o" aria-hidden="true"></i>
        </button>
        <button onClick={this.undo}>
          <i className="fa fa-lg fa-undo" aria-hidden="true"></i>
        </button>
        <select onChange={this.changeLineWidth} style={{"fontFamily": "FontAwesome', Helvetica"}}>
          <option value="2" selected={this.state.lineWidth == 2} style={ {fontSize: "12pt"} }>&#8722;</option>
          <option value="4" selected={this.state.lineWidth == 4} style={ {fontSize: "16pt"} }>&#8722;</option>
          <option value="6" selected={this.state.lineWidth == 6} style={ {fontSize: "20pt"} }>&#8722;</option>
          <option value="8"  selected={this.state.lineWidth == 8} style={ {fontSize: "24pt"} }>&#8722;</option>
          <option value="10"  selected={this.state.lineWidth == 10} style={ {fontSize: "28pt"} }>&#8722;</option>
        </select>
        <button onClick={this.selectFree} style={ {marginLeft: "10px"}} >
          <i className="fa fa-lg fa-pencil" aria-hidden="true"></i>
        </button>
        <button onClick={this.selectOval}>
          <i className="fa fa-lg fa-circle-o" aria-hidden="true"></i>
        </button>
        <button onClick={this.selectArrow}>
          <i className="fa fa-lg fa-long-arrow-right" aria-hidden="true"></i>
        </button>
        {/* TODO: setup stylesheets instead on inline CSS */}
        <button
          className="colorButton black"
          onClick={this.switchColor.bind(null, "black")}
        />
        <button
          className="colorButton red"
          onClick={this.switchColor.bind(null, "red")}
        />
        <button
          className="colorButton green"
          onClick={this.switchColor.bind(null, "green")}
        />
        <button
          className="colorButton blue"
          onClick={this.switchColor.bind(null, "blue")}
        />
        <input
          style={ {marginLeft: "20px", marginRight: "5px"}}
          ref="timerName"
          type="text"
          name="timerName"
          placeholder="Timer Name"
        />
        <input
          ref="timerDuration"
          type="text"
          name="timerDuration"
          placeholder="Duration (mm:ss)"
          style={ {marginRight: "5px"}}
        />
        <button onClick={this.addTimerEvent}>Add Timer</button>
      </div>
    )
  }

  switchColor = (color, e) => {
    this.setState({ brushColor: color });
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
    let timerHtml = []
    for (let key in this.state.timers) {
      console.log(this.state.timers[key])
      let minutes = Math.floor(this.state.timers[key]["time"] / 60)
//      minutes = minutes < 10 ? "0" + minutes : minutes;
      let seconds = this.state.timers[key]["time"] - 60 * minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      timerHtml.push(<div key={key}>{this.state.timers[key]["name"]}: {minutes}:{seconds}</div>)
    }
    console.log("DRAWING TOOL: " + this.state.DrawingTool)
    let myCanvas = this.userId ?
      <DrawableCanvas
        initialDrawing={canvases[this.userId] || ""}
        onDrawingChanged={this.handleDrawingChanged}
        lineWidth={this.state.lineWidth}
        onMouseUp={this.handleMouseUp}
        drawingTool={this.state.drawingTool}
        isDrawable={true}
        canvasStyle={{ zIndex: "1" }}
        brushColor={this.state.brushColor}
      /> :
      null

      // TODO: set left to canvasWidth/screenWidth
    return (
      <div className="app">
        {this.formatButtons()}
        {myCanvas}
        {this.formatOtherCanvases()}
        <div style={{"position": "absolute", "left": 854, "marginRight": "20px", "textAlign": "right"}}>
          {timerHtml}
          </div>
      </div>
    )
  }
}
