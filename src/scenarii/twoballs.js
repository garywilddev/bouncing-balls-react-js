const scenario = {
  description:
    '2 particles on top and bottom of the frame with opposite vy speed',
  parameters: ['radius'],
  getParticles: ({ radius }) => [
    {
      index: 0,
      radius,
      mass: 0.5,
      rx: 1.0 / 2,
      ry: radius,
      vx: 0,
      vy: 0.01,
    },
    {
      index: 1,
      radius,
      mass: 0.5,
      rx: 1.0 / 2,
      ry: 1.0 - radius,
      vx: 0,
      vy: -0.01,
    },
  ],
};
export default scenario;
