import React from "react";
import MinPQ from "./MinPriorityQueue";
import Particle from "./Particle";
import Frame from "./Frame";
import Event from "./Event";

const n = 10;
const radius = 0.01;
const HZ = 0.5;
const simulationTime = 10000;

function uniform(a, b) {
  if (!(a < b)) {
    throw new Error(`invalid range: [ ${a}, ${b} ]`);
  }
  return a + Math.random() * (b - a);
}

export default class ColissionSystem extends React.Component {
  constructor() {
    super();
    this.state = {
      width: 600,
      height: 600,
      context: null
    };
    this.pq = null;
    this.t = null;
    this.frame = null;
    this.particles = [];
    this.raf = null;
  }

  componentDidMount() {
    const context = this.refs.canvas.getContext("2d");
    this.setState({ context: context });
    this.init(simulationTime);
    this.raf = requestAnimationFrame(() => {
      this.simulate(simulationTime);
    });
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.raf);
  }

  init(limit) {
    debugger;
    const { width, height } = this.state;
    this.t = 0;
    this.pq = new MinPQ();
    this.frame = new Frame({ width, height });
    /*this.particles = [
      new Particle({
        index: 0,
        radius,
        mass: 0.5,
        rx: 1.0 / 2,
        ry: 0,
        vx: 0,
        vy: 0.002
      }),
      new Particle({
        index: 1,
        radius,
        mass: 0.5,
        rx: 1.0 / 2,
        ry: 1.0,
        vx: 0,
        vy: -0.002
      })
    ];*/
    this.particles = [...Array(n)].map(
      (val, index) =>
        new Particle({
          index,
          radius,
          mass: 0.5,
          rx: uniform(radius, 1.0 - radius),
          ry: uniform(radius, 1.0 - radius),
          vx: uniform(-0.001, 0.001),
          vy: uniform(-0.001, 0.001)
        })
    );
    this.particles.forEach(particle => {
      this.predict(particle, limit);
    });
    this.pq.insert(new Event({ t: 0, a: null, b: null })); // redraw event
  }

  predict(a, limit) {
    if (a == null) {
      return;
    }

    this.particles.forEach(b => {
      const tP = this.t + a.timeToHit(b);
      if (tP < limit) {
        this.pq.insert(
          new Event({
            t: tP,
            a,
            b
          })
        );
      }
    });

    const tVW = this.t + a.timeToHitVWall();
    if (tVW < limit) {
      this.pq.insert(
        new Event({
          t: tVW,
          a,
          b: null
        })
      );
    }

    const tHW = this.t + a.timeToHitHWall();
    if (tHW < limit) {
      this.pq.insert(
        new Event({
          t: tHW,
          a: null,
          b: a
        })
      );
    }
  }

  redraw(limit) {
    const { context, width, height } = this.state;
    context.clearRect(0, 0, width, height);
    this.frame.draw(this.state);
    this.particles.forEach(particle => particle.draw(this.state));
    if (this.t < limit) {
      this.pq.insert(new Event({ t: this.t + 1.0 / HZ, a: null, b: null }));
    }
  }

  simulate(limit) {
    /*console.log(
      "size: ",
      pq.current.size(),
      "; content: ",
      pq.current.toString(e => ({
        time: e.t,
        isValid: isValid(e),
        a: e.particles[0],
        b: e.particles[1]
      }))
    );*/
    const event = this.pq.delMin();
    //console.log(JSON.stringify(event));
    if (event) {
      if (event.isValid()) {
        const a = event.a;
        const b = event.b;

        this.particles.forEach(particle => particle.move(event.t - this.t));

        this.t = event.t;

        if (a != null && b != null) {
          a.bounceOff(b);
        } else if (a != null && b == null) {
          a.bounceOffVWall();
        } else if (a == null && b != null) {
          b.bounceOffHWall();
        } else if (a == null && b == null) {
          this.redraw(limit);
        }

        this.predict(a, limit);
        this.predict(b, limit);
      }
    }
    this.raf = requestAnimationFrame(() => {
      this.simulate(limit);
    });
  }

  render() {
    const { width, height } = this.state;
    return <canvas ref="canvas" width={width} height={height} />;
  }
}
