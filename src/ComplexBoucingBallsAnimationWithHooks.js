import React, { useRef, useEffect, useState } from "react";
import CanvasComponent from "./CanvasComponent";
import MinPQ from "./MinPQ";

const n = 10;
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

function ComplexBoucingBallsAnimation() {
  const particlesRef = useRef([]);
  const rAF = useRef(null);
  const [particles, setParticles] = useState([]);
  const pq = useRef(null);
  const t = useRef(0)

  useEffect(() => {
    t.current = 0
    pq.current = MinPQ(function compare(
      { t: t1, count: count1 },
      { t: t2, count: count2 }
    ) {
      const delta = 10 ^ -3;
      if (Math.abs(t1 - t2) < delta) {
        return count1 && count2 ? count1 - count2 : count1 || count2;
      }

      return t1 - t2;
    });
    init();
    rAF.current = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(rAF.current);
  }, []);

  function isValid({ countA, countB, particles: [a, b] }) {
    if (a != null && countA !== particlesRef.current[a.index].count) {
      return false;
    } else if (b != null && countB !== particlesRef.current[b.index].count) {
      return false;
    }
    return true;
  }

  function timeToHit(
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

  function timeToHitVWall({ r, rx, vx }) {
    if (vx < 0) {
      return (r - rx) / vx;
    } else if (vx > 0) {
      return (width - r - rx) / vx;
    }

    return Infinity;
  }

  function timeToHitHWall({ r, ry, vy }) {
    if (vy < 0) {
      return (r - ry) / vy;
    } else if (vy > 0) {
      return (height - r - ry) / vy;
    }

    return Infinity;
  }

  function bounceOff(
    { m: m1, r: r1, rx: rx1, ry: ry1, vx: vx1, vy: vy1, count: count1 },
    { m: m2, r: r2, rx: rx2, ry: ry2, vx: vx2, vy: vy2, count: count2 }
  ) {
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

  function bounceOffVWall({ vx, count }) {
    return { vx: -vx, count: count + 1 };
  }

  function bounceOffHWall({ vy, count }) {
    return { vy: -vy, count: count + 1 };
  }

  function move({ rx, ry, vx, vy }, dt) {
    const _rx = rx + vx * dt;
    const _ry = ry + vy * dt;

    return { rx: _rx, ry: _ry };
  }

  function predict(a) {
    if (a == null) {
      return;
    }

    particlesRef.current.forEach(b => {
      const tP = t.current + timeToHit(a, b);
      if (tP <= limit) {
        pq.current.insert({
          t: tP,
          countA: a.count,
          countB: b.count,
          particles: [a, b]
        });
      }
    });

    const tVW = t.current + timeToHitVWall(a);
    if (tVW < limit) {
      pq.current.insert({
        t: tVW,
        countA: a.count,
        particles: [a, null]
      });
    }

    const tHW = t.current + timeToHitHWall(a);
    if (tHW < limit) {
      pq.current.insert({
        t: tHW,
        countB: a.count,
        particles: [null, a]
      });
    }
  }

  function init() {
    /*particlesRef.current = [
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
    particlesRef.current = [...Array(n)].map((val, index) => ({
      index,
      r: radius,
      m: 0.5,
      rx: uniform(radius, width - radius),
      ry: uniform(radius, height - radius),
      vx: uniform(-0.005, 0.005),
      vy: uniform(-0.005, 0.005),
      count: 0
    }));
    particlesRef.current.forEach(particle => {
      predict(particle);
    });
    pq.current.insert({ t: 0, particles: [null, null] });
  }

  function simulate() {
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
    const event = pq.current.delMin();
    //console.log(JSON.stringify(event));
    if (event) {
      if (isValid(event)) {
        const {
          t: eventTime,
          particles: [a, b]
        } = event;

        particlesRef.current = particlesRef.current.map(particle => ({
          ...particle,
          ...move(particle, eventTime - t.current)
        }));

        t.current = eventTime;

        if (a != null && b != null) {
          const oldA = particlesRef.current[a.index];
          const oldB = particlesRef.current[b.index];
          const [_a, _b] = bounceOff(oldA, oldB);
          particlesRef.current.splice(a.index, 1, {
            ...oldA,
            ..._a
          });
          particlesRef.current.splice(b.index, 1, {
            ...oldB,
            ..._b
          });
        } else if (a != null && b == null) {
          const oldA = particlesRef.current[a.index];
          const _a = bounceOffVWall(oldA);
          particlesRef.current.splice(a.index, 1, { ...oldA, ..._a });
        } else if (a == null && b != null) {
          const oldB = particlesRef.current[b.index];
          const _b = bounceOffHWall(oldB);
          particlesRef.current.splice(b.index, 1, { ...oldB, ..._b });
        } else if (a == null && b == null) {
          pq.current.insert({ t: eventTime + 1 / HZ, particles: [null, null] });
          setParticles(particlesRef.current)
          setTimeout(() => {
            rAF.current = requestAnimationFrame(simulate);
          }, 20);
          return;
        }

        if (a != null) {
          predict(particlesRef.current[a.index]);
        }
        if (b != null) {
          predict(particlesRef.current[b.index]);
        }
      }
    }
    rAF.current = requestAnimationFrame(simulate);
  }

  return <CanvasComponent width={600} height={600} balls={particles} />;
}

export default ComplexBoucingBallsAnimation;
