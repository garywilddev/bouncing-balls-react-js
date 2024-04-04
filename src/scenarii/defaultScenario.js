import { uniform } from "./utils";
const scenario = {
  description:
    "N particles uniformly distributed on the canvas with uniformly distributed initial x and y speeds between -0.010 and 0.010",
  parameters: ["radius", "particlesNb"],
  getParticles: ({ rad, n }) =>
    [...Array(n)].map((val, index) => ({
      index,
      radius: rad,
      mass: 0.5,
      rx: uniform(rad, 1.0 - rad),
      ry: uniform(rad, 1.0 - rad),
      vx: uniform(-0.01, 0.01),
      vy: uniform(-0.01, 0.01),
    })),
};

export default scenario;
