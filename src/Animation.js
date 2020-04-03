import React from "react";
import CanvasComponent from "./CanvasComponent";

const n = 40;
const radius = 3;
const width = 600;
const height = 600;
class Animation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      balls: [...Array(n)].map((val, index) => ({
        radius,
        rx: radius + Math.random() * (width - radius),
        ry: radius + Math.random() * (height - radius),
        vx: (- ( 1-Math.random()) + Math.random()) * 10,
        vy: (- ( 1-Math.random()) + Math.random()) * 8
      }))
    };
    this.updateAnimationState = this.updateAnimationState.bind(this);
  }

  componentDidMount() {
    this.rAF = requestAnimationFrame(this.updateAnimationState);
  }

  updateAnimationState() {
    const newBalls = this.state.balls.map(ball => this.move(ball, 0.5));
    debugger;
    this.setState({ balls: newBalls });
    this.rAF = requestAnimationFrame(this.updateAnimationState);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.rAF);
  }

  move({ rx, ry, vx, vy }, dt) {
    let _rx,
      _ry,
      _vx = vx,
      _vy = vy;
    if (rx + vx * dt < radius || rx + vx * dt > 600 - radius) {
      _vx = -vx;
    }
    if (ry + vy * dt < radius || ry + vy * dt > 600 - radius) {
      _vy = -vy;
    }
    _rx = rx + vx * dt;
    _ry = ry + vy * dt;
    debugger;

    return { radius, rx: _rx, ry: _ry, vx: _vx, vy: _vy };
  }

  render() {
    return <CanvasComponent balls={this.state.balls} />;
  }
}

export default Animation;
