import { useEffect, useRef, useState } from 'react';
import MinPQ from './MinPriorityQueue';
import Particle from './Particle';
import Frame from './Frame';
import Event from './Event';

// Simulation time units advanced per second of wall-clock time.
const SIM_SPEED = 30;
// Cap on the wall-clock time handled by one frame (e.g. after a tab switch),
// so the simulation never jumps ahead.
const MAX_FRAME_SECONDS = 0.1;
// Safety net against runaway event cascades: never process more than this
// many events in one animation frame.
const MAX_EVENTS_PER_FRAME = 100000;
const simulationTime = 1000;
const WIDTH = 600;
const HEIGHT = 600;

function loadScenario({
  scenario,
  particlesNb,
  radius: inputRadius,
  color: inputColor,
}) {
  const particles = scenario.getParticles({
    particlesNb,
    radius: inputRadius,
    color: inputColor,
  });
  return particles.map(
    ({ index, rx, ry, vx, vy, radius, mass, color }, idx) =>
      new Particle({
        index: index || idx,
        rx,
        ry,
        vx,
        vy,
        radius,
        mass,
        color,
      }),
  );
}

export default function CollisionSystem({
  radius = 0.01,
  particlesNb = 30,
  scenario,
  debug = false,
}) {
  const [isRunning, setIsRunning] = useState(false);

  const canvas = useRef();
  const pq = useRef(null);
  const t = useRef(0);
  const frame = useRef(null);
  const particles = useRef([]);
  const raf = useRef(null);
  const lastTimestamp = useRef(null);
  const context = useRef(null);
  // The rAF loop keeps calling the closure from the render where Start was
  // clicked, so read `debug` through a ref to pick up toggles mid-run.
  const debugRef = useRef(debug);
  debugRef.current = debug;

  function init(limit) {
    t.current = 0;
    pq.current = new MinPQ();
    frame.current = new Frame({ width: WIDTH, height: HEIGHT });
    particles.current = loadScenario({ scenario, particlesNb, radius });
    particles.current.forEach((particle) => predict(particle, limit));
    redraw();
  }

  function predict(a, limit) {
    if (a == null) {
      return;
    }

    for (const b of particles.current) {
      const tP = t.current + a.timeToHit(b);
      if (tP < limit) {
        pq.current.insert(new Event({ t: tP, a, b }));
      }
    }

    const tVW = t.current + a.timeToHitVWall();
    if (tVW < limit) {
      pq.current.insert(new Event({ t: tVW, a, b: null }));
    }

    const tHW = t.current + a.timeToHitHWall();
    if (tHW < limit) {
      pq.current.insert(new Event({ t: tHW, a: null, b: a }));
    }
  }

  function moveAll(dt) {
    if (dt <= 0) {
      return;
    }
    for (const particle of particles.current) {
      particle.move(dt);
    }
  }

  function redraw() {
    const ctx = context.current;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    frame.current.draw(ctx);

    for (const particle of particles.current) {
      const x = WIDTH * particle.rx;
      const y = HEIGHT * particle.ry;
      const r = WIDTH * particle.radius;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fill();
      if (debugRef.current) {
        ctx.fillStyle = 'black';
        ctx.fillText(particle.index, x - r, y + r);
      }
    }
  }

  // Process every collision due up to `target`, then move all particles to
  // `target`. One call per animation frame, so each frame shows the exact
  // physical state at that instant, however many collisions happened.
  function advanceTo(target, limit) {
    let processed = 0;
    while (!pq.current.isEmpty() && pq.current.min().t <= target) {
      if (++processed > MAX_EVENTS_PER_FRAME) {
        // Too much work for one frame: stop here and let the next frame
        // carry on from the last processed event instead of freezing the tab.
        return;
      }
      const event = pq.current.delMin();
      if (!event.isValid()) {
        continue;
      }

      const { a, b } = event;
      moveAll(event.t - t.current);
      t.current = event.t;

      if (a != null && b != null) {
        a.bounceOff(b);
      } else if (a != null) {
        a.bounceOffVWall();
      } else if (b != null) {
        b.bounceOffHWall();
      }

      predict(a, limit);
      predict(b, limit);
    }

    moveAll(target - t.current);
    t.current = target;
  }

  function step(timestamp, limit) {
    const elapsed =
      lastTimestamp.current == null
        ? 0
        : Math.min((timestamp - lastTimestamp.current) / 1000, MAX_FRAME_SECONDS);
    lastTimestamp.current = timestamp;

    advanceTo(Math.min(t.current + elapsed * SIM_SPEED, limit), limit);
    redraw();

    if (t.current >= limit) {
      reset();
      return;
    }
    raf.current = requestAnimationFrame((ts) => step(ts, limit));
  }

  function reset() {
    cancelAnimationFrame(raf.current);
    init(simulationTime);
    setIsRunning(false);
  }

  function start() {
    lastTimestamp.current = null;
    raf.current = requestAnimationFrame((ts) => step(ts, simulationTime));
    setIsRunning(true);
  }

  function pause() {
    cancelAnimationFrame(raf.current);
    setIsRunning(false);
  }

  useEffect(() => {
    context.current = canvas.current.getContext('2d');
    reset();

    return () => {
      cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario, particlesNb]);

  // Repaint when debug is toggled while paused.
  useEffect(() => {
    if (!isRunning && context.current && frame.current) {
      redraw();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debug]);

  return (
    <div>
      <div>
        {isRunning ? (
          <button onClick={pause}>Pause</button>
        ) : (
          <button onClick={start}>Start</button>
        )}
        <button onClick={reset}>Reset</button>
      </div>
      <canvas ref={canvas} width={WIDTH} height={HEIGHT} />
    </div>
  );
}
