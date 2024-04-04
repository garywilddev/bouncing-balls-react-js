export default class Frame {
  constructor({ width, height, color }) {
    this.width = width;
    this.height = height;
    this.color = color || '#4397AC';
  }

  draw(context) {
    context.save();
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(0, this.height);
    context.lineTo(this.width, this.height);
    context.lineTo(this.width, 0);
    context.lineTo(0, 0);
    context.stroke();
    context.restore();
  }
}
