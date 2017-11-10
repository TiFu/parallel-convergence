import React from "react"
import Select from "react-select"
import PropTypes from "prop-types"

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

  this.state = {
    initialDrawing: "",
    canvases: {},
    drawingTool: DrawingTool.FREE,
    lineWidth: 4,
    timers: [],
    clickthrough: false,
  }


 

  // Setup window
  overwolf.utils.getSystemInformation((systemInfo) => {
	  for (let monitor of systemInfo.systemInfo.Monitors) {
		  if (monitor.IsMain) {
			overwolf.games.getRunningGameInfo((gameInfo)=>{
			  // TODO use logical width and height?
			  this.windowWidth = gameInfo.width - 4;
			  this.windowHeight = gameInfo.height - 70 - 4;
			  overwolf.windows.getCurrentWindow((result) => {
				  this.windowId = result.window.id;
				  overwolf.windows.changeSize(this.windowId, this.windowWidth, this.windowHeight, () => {});
				  overwolf.windows.changePosition(this.windowId, 2, 2, () => {});
				});
			});
			  break;
		  }
	  }
  });

	overwolf.settings.registerHotKey("toggle_clickthrough", (result) => {
		if (result.status === "success") {
			if (this.state.clickthrough) {
				overwolf.windows.removeWindowStyle(this.windowId, overwolf.windows.enums.WindowStyle.InputPassThrough, (result) => {
					console.log("disabled clickthrough");
					this.myCanvas.setState({isDrawable: true});
				});
			} else {
				overwolf.windows.setWindowStyle(this.windowId, overwolf.windows.enums.WindowStyle.InputPassThrough, (result) => {
					console.log("enabled clickthrough");
					this.myCanvas.setState({isDrawable: false});
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
    console.log("[Undo Step] Added undo step");
    addUndoStep(newDrawingData, this.roomId, this.userId)
  }

  clearCanvas = e => {
    let { canvases } = this.state
    canvases[this.userId] = ""
    this.setState({ canvases }, () => {
      this.handleDrawingChanged("")
      addUndoStep("", this.roomId, this.userId)
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

  changeLineWidth = option => {
    this.setState({ lineWidth: option.value })
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
  
  formatSelector() {
    let options = [
      {value: 2, label: ""},
      {value: 4, label: ""},
      {value: 6, label: ""},
      {value: 8, label: ""},
      {value: 10, label: ""},      
    ]

    let handleMouseDown = (option, onSelect, event) => {
      event.preventDefault()
      event.stopPropagation()
      onSelect(option, event)
    }

    let handleMouseEnter = (option, onFocus, event) => {
      onFocus(option, event)
    }

    let handleMouseMove = (option, isFocused, onFocus, event) => {
      if (isFocused) return
      onFocus(option, event)
    }

    let SelectOption = ({ children, option, onSelect, onFocus, isFocused }) => {
      let style = {}
      switch (option.value) {
        case 2:
          style.fontSize = "12pt"
          break
        case 4:
          style.fontSize = "20pt"
          break
        case 6:
          style.fontSize = "32pt"
          break
        case 8:
          style.fontSize = "56pt"
          break
        case 10:
          style.fontSize = "72pt"
          break
        default:
          throw new Error("Error no case found")
      }
      return (
        <div
          className="select-option"
          style={style}
          onMouseDown={handleMouseDown.bind(null, option, onSelect)}
          onMouseEnter={handleMouseEnter.bind(null, option, onFocus)}
          onMouseMove={handleMouseMove.bind(null, option, isFocused, onFocus)}
        >
          &#8722;
          {children}
        </div>
      )
    }
    SelectOption.propTypes = {
      children: PropTypes.node,
      option: PropTypes.object,
      onSelect: PropTypes.func,
      onFocus: PropTypes.func,
      isFocused: PropTypes.bool,
    }

    let SelectValue = ({ children, value }) => {
      let style = {}
      switch (value.value) {
        case 2:
          style.fontSize = "12pt"
          break
        case 4:
          style.fontSize = "20pt"
          break
        case 6:
          style.fontSize = "32pt"
          break
        case 8:
          style.fontSize = "56pt"
          break
        case 10:
          style.fontSize = "72pt"
          break
        default:
          throw new Error("Invalid value for select value")
      }
      return (
        <div className="select-value" style={style}>&#8722;{children}</div>
      )
    }

    SelectValue.propTypes = {
      children: PropTypes.node,
      value: PropTypes.object,
    }

    return (
      <Select
        value={this.state.lineWidth}
        options={options}
        onChange={this.changeLineWidth}
        optionComponent={SelectOption}
        valueComponent={SelectValue}
      />
    )
  }

  formatButtons() {
    return this.state.clickthrough ? null : (
      <div className="buttons-container">
        <button onClick={this.clearCanvas}>
          <i className="fa fa-lg fa-trash-o" aria-hidden="true"></i>
        </button>
        <button onClick={this.undo}>
          <i className="fa fa-lg fa-undo" aria-hidden="true"></i>
        </button>
        {this.formatSelector()}
        <button onClick={this.selectFree} style={ {marginLeft: "10px"}} >
          <i className="fa fa-lg fa-pencil" aria-hidden="true"></i>
        </button>
        <button onClick={this.selectOval}>
          <i className="fa fa-lg fa-circle-o" aria-hidden="true"></i>
        </button>
        <button onClick={this.selectArrow}>
          <i className="fa fa-lg fa-long-arrow-right" aria-hidden="true"></i>
        </button>
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
          className="timerInput"
        />
        <input
          ref="timerDuration"
          type="text"
          name="timerDuration"
          placeholder="Duration (mm:ss)"
          style={ {marginRight: "5px"}}
          className="timerInput"
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
      let minutes = Math.floor(this.state.timers[key]["time"] / 60)
//      minutes = minutes < 10 ? "0" + minutes : minutes;
      let seconds = this.state.timers[key]["time"] - 60 * minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      timerHtml.push(<div key={key} style={{fontSize: "20pt", color: "#8f9078"}}>{this.state.timers[key]["name"]}: {minutes}:{seconds}</div>)
    }
	console.log("DRAWING TOOL: " + this.state.DrawingTool)
    this.myCanvas = this.userId ?
      <DrawableCanvas
		canvasWidth={this.windowWidth}
		canvasHeight={this.windowHeight}
        initialDrawing={canvases[this.userId] || ""}
        onDrawingChanged={this.handleDrawingChanged}
        lineWidth={this.state.lineWidth}
        onMouseUp={this.handleMouseUp}
        drawingTool={this.state.drawingTool}
        isDrawable={!this.state.clickthrough}
        canvasStyle={{ zIndex: "1" }}
        brushColor={this.state.brushColor}
      /> :
      null

      // TODO: set left to canvasWidth/screenWidth
    return (
      <div className="app">
        {this.formatButtons()}
        {this.myCanvas}
        {this.formatOtherCanvases()}
        <div style={{"position": "absolute", "left": 0, "top": 700, "marginRight": "20px","textAlign": "right"}}>
          <div style={{ background: "linear-gradient(0deg, #0d1f1f, #2a494c)", color: "#8f9078", width: "100%", textAlign: "left"}}>
            <h2 style={{margin: "0px", padding: "5px 5px 5px 5px"}}>Timers</h2>
          </div>
          <div style={{"backgroundColor": "#121315", padding: "0px 5px 0px 5px"}}>
          {timerHtml}
          </div>
          </div>
      </div>
    )
  }
}
