import { uniform } from './utils';

// Random positions are retried this many times per particle before giving up,
// so an overcrowded box can't loop forever.
const MAX_PLACEMENT_ATTEMPTS = 1000;

// Particles must not start overlapping: the collision prediction assumes they
// are apart, and an overlapping approaching pair yields negative collision
// times that make the simulation loop forever.
function overlapsAny(placed, rx, ry, radius) {
  return placed.some((p) => {
    const dx = p.rx - rx;
    const dy = p.ry - ry;
    const sigma = p.radius + radius;
    return dx * dx + dy * dy < sigma * sigma;
  });
}

const scenario = {
  description:
    'N particles uniformly distributed on the canvas with uniformly distributed initial x and y speeds between -0.010 and 0.010',
  parameters: ['radius', 'particlesNb'],
  getParticles: ({ radius, particlesNb }) => {
    const particles = [];
    for (let index = 0; index < particlesNb; index++) {
      let attempts = 0;
      let rx;
      let ry;
      do {
        if (attempts++ >= MAX_PLACEMENT_ATTEMPTS) {
          // The box is too crowded: return the particles that did fit.
          return particles;
        }
        rx = uniform(radius, 1.0 - radius);
        ry = uniform(radius, 1.0 - radius);
      } while (overlapsAny(particles, rx, ry, radius));

      particles.push({
        index,
        radius,
        mass: 0.5,
        rx,
        ry,
        vx: uniform(-0.01, 0.01),
        vy: uniform(-0.01, 0.01),
      });
    }
    return particles;
  },
};

export default scenario;
