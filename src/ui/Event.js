export default class Event {
  constructor({ t, a, b }) {
    this.t = t;
    this.a = a;
    this.b = b;
    if (a != null) {
      this.countA = a.count;
    } else {
      this.countA = -1;
    }
    if (b != null) {
      this.countB = b.count;
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
