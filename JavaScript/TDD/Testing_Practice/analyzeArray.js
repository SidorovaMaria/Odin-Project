function analyzeArray(arr) {
  if (arr.length === 0) return null;
  const sum = arr.reduce((prev, curr) => prev + curr, 0);
  const average = sum / arr.length;
  const max = arr.reduce((prev, curr) => (prev > curr ? prev : curr));
  const min = arr.reduce((prev, curr) => (prev < curr ? prev : curr));
  return {
    average: average,
    min: min,
    max: max,
    length: arr.length,
  };
}
module.exports = analyzeArray;
