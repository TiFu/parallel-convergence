"use strict"

import React from "react"
import ReactDOM from "react-dom"
import PropTypes from "prop-types"

const DrawingTool = {
  OVAL: "OVAL",
  FREE: "FREE",
  ARROW: "ARROW"
};

Object.freeze(DrawingTool);

const propTypes = {
  canvasWidth: PropTypes.number,
  canvasHeight: PropTypes.number,
  brushColor: PropTypes.string,
  lineWidth: PropTypes.number,
  canvasStyle: PropTypes.shape({
    backgroundColor: PropTypes.string,
    cursor: PropTypes.string
  }),
  drawingTool: PropTypes.string,
  onDrawingChanged: PropTypes.func,
  initialDrawing: PropTypes.string.isRequired,
  isDrawable: PropTypes.bool.isRequired,
}

const defaultProps = {
  canvasWidth: 854,
  canvasHeight: 480,
  brushColor: '#000000',
  lineWidth: 4,
  drawingTool: DrawingTool.FREE,
  canvasStyle: {
    backgroundColor: "transparent",
    cursor: "pointer"
  },
}

class DrawableCanvas extends React.Component {
  constructor(props) {
    super(props)
    console.log("Tool: ", props)
    this.state = {
      canvas: null,
      context: null,
      drawContext: null,
      drawing: false,
      hasDrawing: false,
      lastX: 0,
      lastY: 0,
      lastEllipse: null,
      lastArrow: null,
    }
  }

  componentDidMount(){
    let canvas = this.refs.displayCanvas
    let { initialDrawing } = this.props

    canvas.width  = this.props.canvasWidth
    canvas.height = this.props.canvasHeight
    let ctx = canvas.getContext('2d')

    let displayCtx = null
    if (this.props.isDrawable) {
      this.refs.drawCanvas.width = this.props.canvasWidth
      this.refs.drawCanvas.height = this.props.canvasHeight
      console.log("Setting context of draw canvas")
      displayCtx = this.refs.drawCanvas.getContext("2d")
      console.log("CTX null: " + displayCtx == null)
    }
    this.setState({
      canvas: canvas,
      drawContext: displayCtx,
      context: ctx
    }, () => {
      if (initialDrawing) {
        this.drawImageOnCanvas(initialDrawing)
      }
    })
  }

  drawImageOnCanvas(drawingUrl, withClear) {
    let drawImage = drawingUrl => {
      let img = new Image;
      img.onload = () => {
        this.state.context.drawImage(img, 0, 0)
      }
      img.src = drawingUrl
      this.setState({ hasDrawing: true })
    }

    if (withClear) {
      this.resetCanvas(this.state.context, drawImage.bind(null, drawingUrl))
    }
    else {
      drawImage(drawingUrl)
    }
  }

  componentWillReceiveProps = nextProps => {
    let { canvas } = this.state
    let { initialDrawing } = this.props

    console.log("Next Props: ", nextProps)

    if (
      initialDrawing !== nextProps.initialDrawing &&
      canvas.toDataURL() !== nextProps.initialDrawing &&
      canvas
    ) {
      if (!nextProps.initialDrawing) {
        this.resetCanvas(this.state.context)
        if (this.props.isDrawable)
          this.resetCanvas(this.state.drawContext)
      }
      else {
        console.log(canvas.toDataURL().length)
        console.log(nextProps.initialDrawing.length)
        if (canvas.toDataURL().length > nextProps.initialDrawing.length) {
          let withClear = true
          this.drawImageOnCanvas(nextProps.initialDrawing, withClear)
        }
        else {
          this.drawImageOnCanvas(nextProps.initialDrawing)
        }
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    let { hasDrawing, lastX, lastY, lastEllipse, lastArrow } = this.state
    if (this.state.hasDrawing &&
        (prevState.lastX !== lastX ||
         prevState.lastY !== lastY ||
         prevState.lastEllipse !== lastEllipse ||
         prevState.lastArrow !== lastArrow)
    ) {
      this.props.onDrawingChanged(this.saveDrawing())
    }
  }

  saveDrawing = () => {
    if (this.state.hasDrawing) {
      return this.state.canvas.toDataURL()
    }
    else {
      return null
    }
  }

  handleOnMouseDown = e => {
    let rect = this.state.canvas.getBoundingClientRect()
    this.state.context.beginPath()

    this.setState({
      lastX: e.clientX - rect.left,
      lastY: e.clientY - rect.top
    })

    if (this.props.isDrawable) {
      this.setState({ drawing: true })
    }
  }

  handleOnMouseMove = e => {
    if(this.state.drawing){
      let rect = this.state.canvas.getBoundingClientRect()
      let lastX = this.state.lastX
      let lastY = this.state.lastY
      let currentX
      let currentY

      currentX = e.clientX - rect.left
      currentY = e.clientY - rect.top
      console.log("mouse moved with drawing tool " + this.props.drawingTool)
      if (this.props.drawingTool == DrawingTool.FREE) {
        console.log("Mouse move free")
        this.draw(lastX, lastY, currentX, currentY)
        this.setState({
          lastX: currentX,
          lastY: currentY
        })
      } else if (this.props.drawingTool == DrawingTool.OVAL) {
        console.log("move oval")
        if (this.props.isDrawable) {
          console.log("DRAWING OVAL ON DRAW CANVAS")
          this.resetCanvas(this.state.drawContext)
          this.state.drawContext.beginPath()
          this.drawOval(this.state.lastX, this.state.lastY, currentX, currentY, this.state.drawContext)
        }
      } else if (this.props.drawingTool == DrawingTool.ARROW) {
        console.log("move oval")
        if (this.props.isDrawable) {
          console.log("DRAWING arrow ON DRAW CANVAS")
          this.resetCanvas(this.state.drawContext)
          this.state.drawContext.beginPath()
          this.drawArrow(this.state.lastX, this.state.lastY, currentX, currentY, this.state.drawContext)
        }        
      }
    }
  }

  handleOnMouseUp = e =>{
    let { lastX, lastY } = this.state
    if (this.state.drawing) {
      let rect = this.state.canvas.getBoundingClientRect()
      let currentX = e.clientX - rect.left
      let currentY = e.clientY - rect.top
      if (this.props.drawingTool == DrawingTool.OVAL) {
        console.log("mouse move cycle")
        this.resetCanvas(this.state.drawContext)
        this.drawOval(lastX, lastY, currentX, currentY, this.state.context)
        this.setState({ lastEllipse: { lastX, lastY, currentX, currentY }})
      } else if (this.props.drawingTool == DrawingTool.ARROW) {
        console.log("draw arrow up")
        this.resetCanvas(this.state.drawContext)
        this.drawArrow(lastX, lastY, currentX, currentY, this.state.context)
        this.setState({ lastArrow: { lastX, lastY, currentX, currentY }})        
      }
      this.props.onMouseUp(this.saveDrawing())
    }
    this.setState({ drawing: false })
  }

  drawArrow(lX, lY, cX, cY, ctx) {
    let actuallyDrawArrow = () => {
      this.setDrawingSettings(ctx)
      var headlen = 3 * ctx.lineWidth;   // length of head in pixels
      var angle = Math.atan2(cY-lY,cX-lX);
      let dirX = cX - lX
      let dirY = cY - lY
      console.log(dirX)
      console.log(dirY)
      let length = Math.sqrt(dirX * dirX + dirY * dirY)
      dirX /= length
      dirY /= length
      let perpX = dirY
      let perpY = -dirX
  
      ctx.moveTo(lX, lY);
      ctx.lineTo(cX, cY);
      ctx.lineTo(cX+2*perpX, cY+2*perpY)
      ctx.lineTo(cX +2* dirX, cY + 2*dirY)
      ctx.lineTo(cX-2*perpX, cY-2*perpY)    
      ctx.lineTo(cX, cY)
      ctx.fill();
      ctx.stroke();
    }

    if (!this.state.hasDrawing) {
      this.setState({hasDrawing: true}, actuallyDrawArrow)
    } else {
      actuallyDrawArrow()
    }
  }

  drawOval(lX, lY, cX, cY, ctx) {
    let actuallyDrawOval = () => {
      this.setDrawingSettings(ctx)
      let radX = -(lX - cX) / 2
      let radY = -(lY - cY) / 2
      let centerX = Math.abs(lX + radX)
      let centerY = Math.abs(lY + radY)
      radX = Math.abs(radX)
      radY = Math.abs(radY)
      ctx.ellipse(centerX, centerY, radX, radY, 0, 0, 2 * Math.PI)
      ctx.stroke();
    }
    if (!this.state.hasDrawing) {
      this.setState({hasDrawing: true}, actuallyDrawOval)
    }
    else {
      actuallyDrawOval()
    }
  }

  setDrawingSettings(ctx) {
    ctx.strokeStyle = this.props.brushColor
    ctx.lineWidth = this.props.lineWidth
    console.log("Set line width: " + this.props.lineWidth)
  }
  draw(lX, lY, cX, cY){
    if (!this.state.hasDrawing) {
      this.setState({hasDrawing: true})
    }
    this.setDrawingSettings(this.state.context)
    this.state.context.moveTo(lX,lY)
    this.state.context.lineTo(cX,cY)
    this.state.context.stroke()
  }

  resetCanvas(context, callback){
    let width = context.canvas.width
    let height = context.canvas.height
    context.clearRect(0, 0, width, height)
    if (context === this.state.context) {
      this.setState({ hasDrawing: false }, callback)      
    }
  }

  getDefaultStyle(){
    return {
      cursor: "pointer",
      position: "absolute",
      zIndex: "0",
    }
  }

  canvasStyle(){
    let defaults =  this.getDefaultStyle()
    let custom = this.props.canvasStyle
    return Object.assign({}, defaults, custom)
  }

  render() {
    let drawCanvas = null
    if (this.props.isDrawable) {
      drawCanvas = <canvas ref="drawCanvas"
      style={this.canvasStyle()}
      onMouseDown={this.handleOnMouseDown} 
      onTouchStart={this.handleOnMouseDown}
      onMouseMove={this.handleOnMouseMove}
      onTouchMove={this.handleOnMouseMove}
      onMouseUp={this.handleOnMouseUp}
      onTouchEnd={this.handleOnMouseUp}
      className="drawable-canvas display"
    />

    }
    return (
      <div>
        {drawCanvas}
      <canvas
        ref="displayCanvas"
        style={this.canvasStyle()}
        onMouseDown={this.handleOnMouseDown} 
        onTouchStart={this.handleOnMouseDown}
        onMouseMove={this.handleOnMouseMove}
        onTouchMove={this.handleOnMouseMove}
        onMouseUp={this.handleOnMouseUp}
        onTouchEnd={this.handleOnMouseUp}
        className="drawable-canvas"
      />
      </div>
    )
  }
}

DrawableCanvas.propTypes = propTypes
DrawableCanvas.defaultProps = defaultProps

module.exports = {
  DrawableCanvas: DrawableCanvas,
  DrawingTool: DrawingTool
}
