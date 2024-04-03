export function uniform(a, b) {
  if (!(a < b)) {
    throw new Error(`invalid range: [ ${a}, ${b} ]`);
  }
  return a + Math.random() * (b - a);
}
