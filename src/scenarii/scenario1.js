const scenario = {
  description:
    "2 particles on top and bottom of the frame with opposite vy speed",
  parameters: ["radius"],
  getParticles: ({ rad }) => [
    {
      index: 0,
      radius: rad,
      mass: 0.5,
      rx: 1.0 / 2,
      ry: rad,
      vx: 0,
      vy: 0.01,
    },
    {
      index: 1,
      radius: rad,
      mass: 0.5,
      rx: 1.0 / 2,
      ry: 1.0 - rad,
      vx: 0,
      vy: -0.01,
    },
  ],
};
export default scenario;
