export default class Frame {
  constructor({ width, height, color }) {
    this.width = width;
    this.height = height;
    this.color = color || '#4397AC';
  }

  draw(context) {
    context.save();
    context.strokeRect(0, 0, this.width, this.height);
    context.restore();
  }
}
