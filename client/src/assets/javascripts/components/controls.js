import React from "react";

import App from "components/app";
export default class Controls extends React.Component {
    constructor(props) {
        super(props);
        // TODO
        this.state = {};
        console.log("constructed controls");
        overwolf.windows.obtainDeclaredWindow("canvas", () => {
            console.log("obtained canvas");
            overwolf.windows.restore("canvas", result => {
                console.log(result);
                this.canvasWindowId = result.window_id;
            });
        });
    }

    sendMessage(message) {
		console.log(message);
        overwolf.windows.sendMessage(this.canvasWindowId, "TODO: do message IDs need to be unique?", message, (result) => {
            console.log("Send result:", result);
        });
    }

    clearCanvas = () => {
        this.sendMessage("this.clearCanvas()");
    };

    undo = () => {
        this.sendMessage("this.undo()");
    };

    setLineWidth = event => {
        this.state.lineWidth = event.target.value;
        this.sendMessage(`this.changeLineWidth(${event.target.value})`);
    };

    selectOval = () => {
        this.sendMessage("this.selectOval()");
    };
    selectFree = () => {
        this.sendMessage("this.selectFree()");
    };
    selectArrow = () => {
        this.sendMessage("this.selectArrow()");
    };
    switchColor = color => {
        this.sendMessage(`this.switchColor("${color}")`);
        // TODO indicate which color is currently selected
    };

    addTimerEvent = () => {
        let timerName = this.refs.timerName.value;
        let duration = this.refs.timerDuration.value;
        this.sendMessage(`this.addTimerEvent(${timerName}, ${duration})`);
    };

    render() {
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
				style={{marginLeft: "20px"}}
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
			  />
			  <button onClick={this.addTimerEvent}>Add Timer</button>
			</div>
		  )
    }
}
