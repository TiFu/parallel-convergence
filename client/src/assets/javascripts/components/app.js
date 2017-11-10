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
const gameId = 11236

export default class App extends React.Component {
  constructor(props) {
    super(props)

	this.state = { initialDrawing: "", canvases: {}, drawingTool: DrawingTool.FREE, lineWidth: 4, timers: [] }

	overwolf.windows.onMessageReceived.addListener((message)=> {
		(function() {
			eval(message.content);
		}).call(this);
	});

	overwolf.windows.obtainDeclaredWindow("controls",()=>{
		overwolf.windows.restore("controls",(result)=> {
			console.log("Opened controls window");
		});
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
                          ClientControl.setGameState(state.val())
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

  changeLineWidth = width => {
    console.log("New line width: " + width)
    this.setState({lineWidth:width})
  }

  addTimerEvent = (timerName, duration) => {
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

  switchColor = color => {
    this.setState({brushColor:color});
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
        {myCanvas}
        {this.formatOtherCanvases()}
        <div style={{"position": "absolute", "left": 854, "marginRight": "20px", "textAlign": "right"}}>
          {timerHtml}
          </div>
      </div>
    )
  }
}
