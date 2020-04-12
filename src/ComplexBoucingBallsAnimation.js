import React from "react";
import CanvasComponent from "./CanvasComponent";
import MinPQ from "./MinPQ";

const n = 30;
const radius = 0.05;
const width = 1;
const height = 1;
const HZ = 0.5;
const limit = 10000;

function uniform(a, b) {
  if (!(a < b)) {
    throw new Error(`invalid range: [ ${a}, ${b} ]`);
  }
  return a + Math.random() * (b - a);
}

class ComplexBoucingBallsAnimation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      particles: []
    };
    this.init = this.init.bind(this);
    this.predict = this.predict.bind(this);
    this.simulate = this.simulate.bind(this);
  }

  componentDidMount() {
    this.t = 0;
    this.pq = MinPQ(function compare(
      { t: t1, count: count1 },
      { t: t2, count: count2 }
    ) {
      const delta = 10 ^ -3;
      if (Math.abs(t1 - t2) < delta) {
        return count1 && count2 ? count1 - count2 : count1 || count2;
      }

      return t1 - t2;
    });
    this.init();
    requestAnimationFrame(this.simulate);
  }

  isValid({ countA, countB, particles: [a, b] }) {
    if (a != null && countA !== this.particles[a.index].count) {
      return false;
    } else if (b != null && countB !== this.particles[b.index].count) {
      return false;
    }
    return true;
  }

  timeToHit(
    { r: r1, rx: rx1, ry: ry1, vx: vx1, vy: vy1 },
    { r: r2, rx: rx2, ry: ry2, vx: vx2, vy: vy2 }
  ) {
    if (rx1 === rx2 && ry1 === ry2 && vx1 === vx2 && vy1 === vy2) {
      return Infinity;
    }
    const dx = rx2 - rx1;
    const dy = ry2 - ry1;
    const dvx = vx2 - vx1;
    const dvy = vy2 - vy1;
    const dvdr = dx * dvx + dy * dvy;
    if (dvdr > 0) {
      return Infinity;
    }
    const dvdv = dvx * dvx + dvy * dvy;
    if (dvdv === 0) {
      return Infinity;
    }
    const drdr = dx * dx + dy * dy;
    const sigma = r1 + r2;
    const d = dvdr * dvdr - dvdv * (drdr - sigma * sigma);

    if (d < 0) {
      return Infinity;
    }
    return -(dvdr + Math.sqrt(d)) / dvdv;
  }

  timeToHitVWall({ r, rx, vx }) {
    if (vx < 0) {
      return (r - rx) / vx;
    } else if (vx > 0) {
      return (width - r - rx) / vx;
    }

    return Infinity;
  }

  timeToHitHWall({ r, ry, vy }) {
    if (vy < 0) {
      return (r - ry) / vy;
    } else if (vy > 0) {
      return (height - r - ry) / vy;
    }

    return Infinity;
  }

  bounceOff(
    { m: m1, r: r1, rx: rx1, ry: ry1, vx: vx1, vy: vy1, count: count1 },
    { m: m2, r: r2, rx: rx2, ry: ry2, vx: vx2, vy: vy2, count: count2 }
  ) {
    //debugger;
    const dx = rx2 - rx1;
    const dy = ry2 - ry1;
    const dvx = vx2 - vx1;
    const dvy = vy2 - vy1;
    const dvdr = dx * dvx + dy * dvy;
    const sigma = r1 + r2;
    const J = (2 * m1 * m2 * dvdr) / ((m1 + m2) * sigma);
    const Jx = (J * dx) / sigma;
    const Jy = (J * dy) / sigma;

    const _vx1 = vx1 + Jx / m1;
    const _vy1 = vy1 + Jy / m1;
    const _vx2 = vx2 - Jx / m2;
    const _vy2 = vy2 - Jy / m2;
    return [
      { vx: _vx1, vy: _vy1, count: count1 + 1 },
      { vx: _vx2, vy: _vy2, count: count2 + 1 }
    ];
  }

  bounceOffVWall({ vx, count }) {
    return { vx: -vx, count: count + 1 };
  }

  bounceOffHWall({ vy, count }) {
    return { vy: -vy, count: count + 1 };
  }

  move({ rx, ry, vx, vy }, dt) {
    const _rx = rx + vx * dt;
    const _ry = ry + vy * dt;

    return { rx: _rx, ry: _ry };
  }

  predict(a) {
    if (a == null) {
      return;
    }

    this.particles.forEach(b => {
      const t = this.t + this.timeToHit(a, b);
      if (t <= limit) {
        this.pq.insert({
          t,
          countA: a.count,
          countB: b.count,
          particles: [a, b]
        });
      }
    });

    const tVW = this.t + this.timeToHitVWall(a);
    if (tVW < limit) {
      this.pq.insert({
        t: tVW,
        countA: a.count,
        particles: [a, null]
      });
    }

    const tHW = this.t + this.timeToHitHWall(a);
    if (tHW < limit) {
      this.pq.insert({
        t: tHW,
        countB: a.count,
        particles: [null, a]
      });
    }
  }

  init() {
    /*this.particles = [
      {
        index: 0,
        r: radius,
        m: 0.5,
        rx: width / 2,
        ry: 0,
        vx: 0,
        vy: 0.002,
        count: 0
      },
      {
        index: 1,
        r: radius,
        m: 0.5,
        rx: width / 2,
        ry: height,
        vx: 0,
        vy: -0.002,
        count: 0
      }
    ];*/
    this.particles = [...Array(n)].map((val, index) => ({
      index,
      r: radius,
      m: 0.5,
      rx: uniform(radius, width - radius),
      ry: uniform(radius, height - radius),
      vx: uniform(-0.005, 0.005),
      vy: uniform(-0.005, 0.005),
      count: 0
    }));
    this.particles.forEach(particle => {
      this.predict(particle);
    });
    this.pq.insert({ t: 0, particles: [null, null] });
  }

  simulate() {
    /*console.log(
      "size: ",
      this.pq.size(),
      "; content: ",
      this.pq.toString(e => ({
        time: e.t,
        isValid: this.isValid(e),
        a: e.particles[0],
        b: e.particles[1]
      }))
    );*/
    const event = this.pq.delMin();
    //console.log(JSON.stringify(event));
    if (event) {
      if (this.isValid(event)) {
        const {
          t: eventTime,
          particles: [a, b]
        } = event;

        this.particles = this.particles.map(particle => ({
          ...particle,
          ...this.move(particle, eventTime - this.t)
        }));

        this.t = eventTime;

        if (a != null && b != null) {
          //debugger;
          const oldA = this.particles[a.index];
          const oldB = this.particles[b.index];
          const [_a, _b] = this.bounceOff(oldA, oldB);
          this.particles.splice(a.index, 1, {
            ...oldA,
            ..._a
          });
          this.particles.splice(b.index, 1, {
            ...oldB,
            ..._b
          });
        } else if (a != null && b == null) {
          const oldA = this.particles[a.index];
          const _a = this.bounceOffVWall(oldA);
          this.particles.splice(a.index, 1, { ...oldA, ..._a });
        } else if (a == null && b != null) {
          const oldB = this.particles[b.index];
          const _b = this.bounceOffHWall(oldB);
          this.particles.splice(b.index, 1, { ...oldB, ..._b });
        } else if (a == null && b == null) {
          this.pq.insert({ t: this.t + 1 / HZ, particles: [null, null] });
          this.setState({ particles: this.particles });
          setTimeout(() => {
            this.rAF = requestAnimationFrame(this.simulate);
          }, 20);
          return;
        }

        if (a != null) {
          this.predict(this.particles[a.index]);
        }
        if (b != null) {
          this.predict(this.particles[b.index]);
        }
      }
    }
    this.rAF = requestAnimationFrame(this.simulate);
  }

  componentWillUnmount() {
    this.t = 0;
    cancelAnimationFrame(this.rAF);
  }

  render() {
    return (
      <CanvasComponent width={600} height={600} balls={this.state.particles} />
    );
  }
}

export default ComplexBoucingBallsAnimation;
