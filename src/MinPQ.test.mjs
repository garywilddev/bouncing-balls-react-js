import MinPQ from "./MinPQ";

function compare(a, b) {
  if (a == null) {
    return -1;
  }
  if (b == null) {
    return 1;
  }

  return a.t - b.t;
}
const pq = MinPQ(compare);

pq.insert({ t: 4.5 });
pq.insert({ t: 2.5 });
pq.insert({ t: 0.5 });
pq.insert({ t: 1.5 });
pq.insert({ t: 3.5 });

console.log(pq.delMin());
console.log(pq.delMin());
console.log(pq.delMin());
console.log(pq.delMin());
console.log(pq.delMin());
console.log(pq.delMin());
console.log(pq.delMin());
console.log(pq.delMin());
console.log(pq.delMin());
console.log(pq.delMin());
console.log(pq.delMin());
