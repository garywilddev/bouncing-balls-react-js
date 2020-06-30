export default class MinPriorityQueue {
  constructor(args) {
    this.pq = [];
    this.N = 0;
    if (args) {
      this.compare = args.compare;
    }
  }

  greater(i, j) {
    if (this.compare == null) {
      return this.pq[i].compareTo(this.pq[j]) > 0;
    } else {
      return this.compare(this.pq[i], this.pq[j]) > 0;
    }
  }

  swap(i, j) {
    const tmp = this.pq[i];
    this.pq[i] = this.pq[j];
    this.pq[j] = tmp;
  }

  swim(k) {
    let i = k;
    while (i > 1 && this.greater(Math.floor(i / 2), i)) {
      this.swap(i, Math.floor(i / 2));
      i = Math.floor(i / 2);
    }
  }

  sink(k) {
    let i = k;
    while (2 * i <= this.N) {
      let j = 2 * i;
      if (j < this.N && this.greater(j, j + 1)) {
        j = j + 1;
      }
      if (!this.greater(i, j)) {
        break;
      }
      this.swap(i, j);
      i = j;
    }
  }

  resize(n) {
    const temp = new Array(n);
    this.pq.forEach((el, index) => {
      temp[index] = el;
    });
    this.pq = temp;
  }

  insert(x) {
    if (this.N === this.pq.length + 1) {
      this.resize(2 * this.pq.length);
    }
    this.N = this.N + 1;
    this.pq[this.N] = x;
    this.swim(this.N);
  }

  delMin() {
    const min = this.pq[1];
    this.swap(1, this.N);
    this.N = this.N - 1;
    this.sink(1);
    this.pq[this.N + 1] = undefined;
    if (this.N > 0 && this.N === (this.pq.length - 1) / 4) {
      this.resize(this.pq.length / 2);
    }
    return min;
  }

  size() {
    return this.N;
  }

  toString(printElm) {
    return this.pq.slice(1, this.N + 1).map(printElm);
  }
}
