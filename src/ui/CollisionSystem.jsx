import { useEffect, useRef, useState } from 'react';
import MinPQ from './MinPriorityQueue';
import Particle from './Particle';
import Frame from './Frame';
import Event from './Event';

const HZ = 1; // number of redraw events per clock tick
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
        vx: vx * 1,
        vy: vy * 1,
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
  const t = useRef(null);
  const frame = useRef(null);
  const particles = useRef([]);
  const raf = useRef(null);
  const context = useRef(null);

  function init(limit) {
    t.current = 0;
    pq.current = new MinPQ();
    frame.current = new Frame({ width: WIDTH, height: HEIGHT });
    particles.current = loadScenario({ scenario, particlesNb, radius });
    particles.current.forEach((particle) => {
      predict(particle, limit);
    });
    pq.current.insert(new Event({ t: 0, a: null, b: null })); // redraw event
    pq.current.isEmpty();

    redraw(limit);
  }

  function predict(a, limit) {
    if (a == null) {
      return;
    }

    particles.current.forEach((b) => {
      const tP = t.current + a.timeToHit(b);
      if (tP < limit) {
        pq.current.insert(
          new Event({
            t: tP,
            a,
            b,
          }),
        );
      }
    });

    const tVW = t.current + a.timeToHitVWall();
    if (tVW < limit) {
      pq.current.insert(
        new Event({
          t: tVW,
          a,
          b: null,
        }),
      );
    }

    const tHW = t.current + a.timeToHitHWall();
    if (tHW < limit) {
      pq.current.insert(
        new Event({
          t: tHW,
          a: null,
          b: a,
        }),
      );
    }
  }

  function drawParticles({ particles, context, width, height }) {
    particles.map((particle) => {
      context.fillStyle = particle.color;
      /*context.lineWidth = 2;
    context.translate(width * particle.rx, height * particle.ry);
    context.beginPath();
    context.moveTo(0, -width * particle.radius);
    context.arc(0, 0, width * particle.radius, 0, 2 * Math.PI);
    context.closePath();*/
      context.beginPath();
      context.ellipse(
        width * particle.rx,
        height * particle.ry,
        particle.radius * width,
        particle.radius * height,
        0,
        0,
        2 * Math.PI,
      );
      context.closePath();
      context.fill();
      if (debug) {
        context.fillStyle = 'black';
        context.fillText(
          particle.index,
          particle.rx - particle.radius,
          particle.ry + particle.radius,
        );
      }
    });
  }

  function redraw(limit) {
    context.current.clearRect(0, 0, WIDTH, HEIGHT);
    frame.current.draw(context.current);
    drawParticles({
      particles: particles.current,
      context: context.current,
      width: WIDTH,
      height: HEIGHT,
    });
    /*particles.current.forEach((particle) =>
      particle.draw({
        width: WIDTH,
        height: HEIGHT,
        context: context.current,
        showIndex: debug,
      }),
    );*/

    if (t.current < limit) {
      /*console.log({ t: t.current, limit });*/
      pq.current.insert(new Event({ t: t.current + 1 / HZ, a: null, b: null }));
    } else {
      reset()
    }
  }

  function reset() {
    cancelAnimationFrame(raf.current);
    init(simulationTime);
    setIsRunning(false);
  }

  function start() {
    raf.current = requestAnimationFrame(() => {
      simulate(simulationTime);
    });
    setIsRunning(true);
  }

  function pause() {
    cancelAnimationFrame(raf.current);
    setIsRunning(false);
  }

  function simulate(limit) {
    /*console.log('simulate');*/
    performance.mark('start');
    // We schedule a new requestAnimationFrame before performing our loop contents. That is not by accident and it is considered best practice
    raf.current = requestAnimationFrame(() => {
      simulate(limit);
    });

    if (debug) {
      /*console.log(
        'size: ',
        pq.current.size(),
        '; content: ',
        pq.current.toString((e) => ({
          time: e.t,
          isValid: e.isValid(),
          a: e.a,
          b: e.b,
        })),
      );*/
    }

    if (!pq.current?.isEmpty()) {
      const event = pq.current.delMin();

      //console.log(JSON.stringify(event));
      if (event?.isValid()) {
        const a = event.a;
        const b = event.b;

        particles.current.forEach((particle) =>
          particle.move(event.t - t.current),
        );

        t.current = event.t;

        if (a != null && b != null) {
          a.bounceOff(b);
        } else if (a != null && b == null) {
          a.bounceOffVWall();
        } else if (a == null && b != null) {
          b.bounceOffHWall();
        } else if (a == null && b == null) {
          redraw(limit);
        }

        predict(a, limit);
        predict(b, limit);
      }
    } else {
      pause();
    }
    performance.measure('simulate', 'start');
  }

  useEffect(() => {
    context.current = canvas.current.getContext('2d');
    reset();

    return () => {
      cancelAnimationFrame(raf.current);
    };
  }, [scenario, particlesNb]);

  function handleStart() {
    start();
  }

  function handlePause() {
    pause();
  }

  function handleReset() {
    reset();
  }

  return (
    <div>
      <div>
        {isRunning ? (
          <button onClick={handlePause}>Pause</button>
        ) : (
          <button onClick={handleStart}>Start</button>
        )}
        <button onClick={handleReset}>Reset</button>
      </div>
      <canvas ref={canvas} width={WIDTH} height={HEIGHT} />
    </div>
  );
}
