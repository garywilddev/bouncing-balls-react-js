import React from "react";

class CanvasComponent extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
  }


  componentWillUpdate() {
    // Draws a square in the middle of the canvas rotated
    // around the centre by this.props.angle
    const { balls, angle } = this.props;
    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    ctx.save();
    ctx.beginPath();
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#4397AC";
    balls.forEach(({ rx, ry, radius }) => {
      ctx.beginPath();
      ctx.arc(rx, ry, radius, 0, 2 * Math.PI);
      ctx.fill();
    });
    ctx.restore();
  }

  render() {
    return <canvas width="600" height="600" ref={this.canvasRef} />;
  }
}
export default CanvasComponent;
