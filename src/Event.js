export default class Event {
  constructor(args) {
    this.t = args.t;
    this.a = args.a;
    this.b = args.b;
    if (args.a != null) {
      this.countA = args.a.count;
    } else {
      this.countA = -1;
    }
    if (args.b != null) {
      this.countB = args.b.count;
    } else {
      this.countB = -1;
    }
  }

  isValid() {
    if (this.a != null && this.countA !== this.a.count) {
      return false;
    } else if (this.b != null && this.countB !== this.b.count) {
      return false;
    }
    return true;
  }

  compareTo(that) {
    const delta = 10 ^ -3;
    if (Math.abs(this.t - that.t) < delta) {
      return 0;
    }

    return this.t - that.t;
  }
}
