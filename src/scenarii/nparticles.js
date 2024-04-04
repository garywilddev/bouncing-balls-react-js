import { uniform } from './utils';
const scenario = {
  description:
    'N particles uniformly distributed on the canvas with uniformly distributed initial x and y speeds between -0.010 and 0.010',
  parameters: ['radius', 'particlesNb'],
  getParticles: ({ radius, particlesNb }) =>
    [...Array(particlesNb)].map((val, index) => ({
      index,
      radius,
      mass: 0.5,
      rx: uniform(radius, 1.0 - radius),
      ry: uniform(radius, 1.0 - radius),
      vx: uniform(-0.01, 0.01),
      vy: uniform(-0.01, 0.01),
    })),
};

export default scenario;
