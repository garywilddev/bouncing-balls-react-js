import React from "react";
import CanvasComponent from "./CanvasComponent";

const n = 100;
const radius = 3;
const width = 600;
const height = 600;
class SimpleBoucingBallsAnimation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      balls: [...Array(n)].map((val, index) => ({
        index,
        r: radius,
        rx: radius + Math.random() * (width - 2 * radius),
        ry: radius + Math.random() * (height - 2 * radius),
        vx: (-(1 - Math.random()) + Math.random()) * 10,
        vy: (-(1 - Math.random()) + Math.random()) * 8
      }))
    };
    this.updateAnimationState = this.updateAnimationState.bind(this);
  }

  componentDidMount() {
    this.rAF = requestAnimationFrame(this.updateAnimationState);
  }

  updateAnimationState() {
    const newBalls = this.state.balls.map(ball => ({
      ...ball,
      ...this.move(ball, 0.5)
    }));
    this.setState({ balls: newBalls });
    this.rAF = requestAnimationFrame(this.updateAnimationState);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.rAF);
  }

  move({ r, rx, ry, vx, vy }, dt) {
    let _rx,
      _ry,
      _vx = vx,
      _vy = vy;
    if (rx + vx * dt < r || rx + vx * dt > 600 - r) {
      _vx = -vx;
    }
    if (ry + vy * dt < r || ry + vy * dt > 600 - r) {
      _vy = -vy;
    }
    _rx = rx + vx * dt;
    _ry = ry + vy * dt;

    return { rx: _rx, ry: _ry, vx: _vx, vy: _vy };
  }

  render() {
    return <CanvasComponent balls={this.state.balls} />;
  }
}

export default SimpleBoucingBallsAnimation;
