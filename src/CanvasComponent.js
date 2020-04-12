import React from "react";

class CanvasComponent extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
  }

  resetCanvas(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#4397AC";
  }

  drawFrame(ctx, width, height) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.lineTo(width, height);
    ctx.lineTo(width, 0);
    ctx.lineTo(0, 0);
    ctx.stroke();
  }

  drawBalls(ctx, balls, width, height) {
    balls.forEach(({ rx, ry, r }) => {
      ctx.beginPath();
      ctx.arc(rx * width, ry * height, r * width, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  componentWillUpdate() {
    const { balls } = this.props;
    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    this.resetCanvas(ctx, width, height);
    this.drawFrame(ctx, width, height);
    this.drawBalls(ctx, balls, width, height);
  }

  render() {
    const { width, height } = this.props;
    return <canvas width={width} height={height} ref={this.canvasRef} />;
  }
}
export default CanvasComponent;
