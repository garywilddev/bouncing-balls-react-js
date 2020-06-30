export default class Particle {
  constructor(args) {
    this.rx = args.rx;
    this.ry = args.ry;
    this.vx = args.vx;
    this.vy = args.vy;
    this.radius = args.radius;
    this.mass = args.mass;
    this.count = 0;
    this.color = args.color || "#4397AC";
  }

  destroy() {
    this.delete = true;
  }

  move(dt) {
    this.rx = this.rx + this.vx * dt;
    this.ry = this.ry + this.vy * dt;
  }

  count() {
    return this.count;
  }

  timeToHit(that) {
    if (this === that) {
      return Infinity;
    }
    const dx = that.rx - this.rx;
    const dy = that.ry - this.ry;
    const dvx = that.vx - this.vx;
    const dvy = that.vy - this.vy;
    const dvdr = dx * dvx + dy * dvy;
    if (dvdr > 0) {
      return Infinity;
    }
    const dvdv = dvx * dvx + dvy * dvy;
    if (dvdv === 0) {
      return Infinity;
    }
    const drdr = dx * dx + dy * dy;
    const sigma = this.radius + that.radius;
    const d = dvdr * dvdr - dvdv * (drdr - sigma * sigma);

    if (d < 0) {
      return Infinity;
    }
    return -(dvdr + Math.sqrt(d)) / dvdv;
  }

  timeToHitVWall() {
    if (this.vx < 0) {
      return (this.radius - this.rx) / this.vx;
    } else if (this.vx > 0) {
      return (1.0 - this.radius - this.rx) / this.vx;
    }

    return Infinity;
  }

  timeToHitHWall() {
    if (this.vy < 0) {
      return (this.radius - this.ry) / this.vy;
    } else if (this.vy > 0) {
      return (1.0 - this.radius - this.ry) / this.vy;
    }

    return Infinity;
  }

  bounceOff(that) {
    const dx = that.rx - this.rx;
    const dy = that.ry - this.ry;
    const dvx = that.vx - this.vx;
    const dvy = that.vy - this.vy;
    const dvdr = dx * dvx + dy * dvy;
    const sigma = this.radius + that.radius;
    const J =
      (2 * this.mass * that.mass * dvdr) / ((this.mass + that.mass) * sigma);
    const Jx = (J * dx) / sigma;
    const Jy = (J * dy) / sigma;

    this.vx = this.vx + Jx / this.mass;
    this.vy = this.vy + Jy / this.mass;
    that.vx = that.vx - Jx / that.mass;
    that.vy = that.vy - Jy / that.mass;
    this.count = this.count + 1;
    that.count = that.count + 1;
  }

  bounceOffVWall() {
    this.vx = -this.vx;
    this.count = this.count + 1;
  }

  bounceOffHWall() {
    this.vy = -this.vy;
    this.count = this.count + 1;
  }

  draw(state) {
    const { width, height, context } = state;
    context.save();
    context.translate(width * this.rx, height * this.ry);
    context.fillStyle = this.color;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, -width * this.radius);
    context.arc(0, 0, width * this.radius, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
    context.restore();
  }
}
