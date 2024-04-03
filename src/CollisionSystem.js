import { useEffect, useRef, useState } from "react";
import MinPQ from "./MinPriorityQueue";
import Particle from "./Particle";
import Frame from "./Frame";
import Event from "./Event";
import scenarii from "./scenarii";

const { defaultScenario } = scenarii;

const HZ = 1; // number of redraw events per clock tick
const simulationTime = 10000;
const WIDTH = 600;
const HEIGHT = 600;

function loadScenario({ scenario, n, rad }) {
  const particles = scenario.getParticles({ n, rad });
  return particles.map(
    ({ index, radius, mass, rx, ry, vx, vy }) =>
      new Particle({
        index,
        radius,
        mass,
        rx,
        ry,
        vx,
        vy,
      })
  );
}

/*const n = 20; // number of particles
const radius = 0.01; // radius of each particle*/
export default function CollisionSystem({
  radius = 0.01,
  n = 30,
  scenario = defaultScenario,
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
    particles.current = loadScenario({ scenario, n, rad: radius });
    particles.current.forEach((particle) => {
      predict(particle, limit);
    });
    pq.current.insert(new Event({ t: 0, a: null, b: null })); // redraw event

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
          })
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
        })
      );
    }

    const tHW = t.current + a.timeToHitHWall();
    if (tHW < limit) {
      pq.current.insert(
        new Event({
          t: tHW,
          a: null,
          b: a,
        })
      );
    }
  }

  function redraw(limit) {
    context.current.clearRect(0, 0, WIDTH, HEIGHT);
    frame.current.draw(context.current);
    particles.current.forEach((particle) =>
      particle.draw({ width: WIDTH, height: HEIGHT, context: context.current })
    );
    if (t.current < limit) {
      pq.current.insert(
        new Event({ t: t.current + 1.0 / HZ, a: null, b: null })
      );
    }
  }

  function simulate(limit) {
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
      if (event.isValid()) {
        const a = event.a;
        const b = event.b;

        particles.current.forEach((particle) =>
          particle.move(event.t - t.current)
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
    }
    raf.current = requestAnimationFrame(() => {
      simulate(limit);
    });
  }

  useEffect(() => {
    context.current = canvas.current.getContext("2d");
    cancelAnimationFrame(raf.current);
    init(simulationTime);
    setIsRunning(false);

    return () => {
      cancelAnimationFrame(raf.current);
    };
  }, [scenario, n]);

  function handleStart() {
    raf.current = requestAnimationFrame(() => {
      simulate(simulationTime);
    });
    setIsRunning(true);
  }

  function handlePause() {
    cancelAnimationFrame(raf.current);
    setIsRunning(false);
  }

  function handleReset() {
    init(simulationTime);
    cancelAnimationFrame(raf.current);
    setIsRunning(false);
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
