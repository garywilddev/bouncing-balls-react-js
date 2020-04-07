// function compare(elm1, elm2)
// return value < 0 if elm1 < elm2
// return value === 0 if elm1 == elm2
// return value > 0 if elm1 > elm2
function MinPQ(compare) {
  let _arr = [];
  let N = 0;

  function greater(i, j) {
    return compare(_arr[i], _arr[j]) > 0;
  }

  function swap(i, j) {
    const tmp = _arr[i];
    _arr[i] = _arr[j];
    _arr[j] = tmp;
  }

  function swim(k) {
    let i = k;
    while (i > 1 && greater(Math.floor(i / 2), i)) {
      swap(i, Math.floor(i / 2));
      i = Math.floor(i / 2);
    }
  }

  function sink(k) {
    let i = k;
    while (2 * i <= N) {
      let j = 2 * i;
      if (j < N && greater(j, j + 1)) {
        j = j + 1;
      }
      if (!greater(i, j)) {
        break;
      }
      swap(i, j);
      i = j;
    }
  }

  function resize(n) {
    const temp = new Array(n);
    _arr.forEach((el, index) => {
      temp[index] = el;
    });
    _arr = temp;
  }

  function insert(x) {
    if (N === _arr.length + 1) {
      resize(2 * _arr.length);
    }
    N = N + 1;
    _arr[N] = x;
    swim(N);
  }

  function delMin() {
    const min = _arr[1];
    swap(1, N);
    N = N - 1;
    sink(1);
    _arr[N + 1] = undefined;
    if (N > 0 && N === (_arr.length - 1) / 4) {
      resize(_arr.length / 2);
    }
    return min;
  }

  function size() {
    return N;
  }

  return {
    insert,
    delMin,
    size
  };
}

export default MinPQ;
