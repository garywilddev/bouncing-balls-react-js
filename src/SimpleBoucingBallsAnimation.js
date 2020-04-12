import React from "react";
import CanvasComponent from "./CanvasComponent";

const n = 100;
const radius = 0.03;
const width = 1;
const height = 1;

function uniform(a, b) {
  if (!(a < b)) {
    throw new Error(`invalid range: [ ${a}, ${b} ]`);
  }
  return a + Math.random() * (b - a);
}

class SimpleBoucingBallsAnimation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      balls: [...Array(n)].map((val, index) => ({
        index,
        r: radius,
        rx: uniform(radius, width - radius),
        ry: uniform(radius, height - radius),
        vx: uniform(-0.005, 0.005),
        vy: uniform(-0.005, 0.005)
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
    if (rx + vx * dt < r || rx + vx * dt > width - r) {
      _vx = -vx;
    }
    if (ry + vy * dt < r || ry + vy * dt > height - r) {
      _vy = -vy;
    }
    _rx = rx + vx * dt;
    _ry = ry + vy * dt;

    return { rx: _rx, ry: _ry, vx: _vx, vy: _vy };
  }

  render() {
    return (
      <CanvasComponent width={600} height={600} balls={this.state.balls} />
    );
  }
}

export default SimpleBoucingBallsAnimation;
