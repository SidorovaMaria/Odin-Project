const analyzeArray = require("./analyzeArray");

describe("Analyze function", () => {
  const analyze = analyzeArray;
  test("should return correct average, min, max and length", () => {
    const result = analyze([1, 2, 3, 4, 5]);
    expect(result).toEqual({
      average: 3,
      min: 1,
      max: 5,
      length: 5,
    });
  });
  test("should handle negative numbers", () => {
    const result = analyze([-10, -5, 0, 5, 10]);
    expect(result).toEqual({
      average: 0,
      min: -10,
      max: 10,
      length: 5,
    });
  });
  test("should handle single element array", () => {
    const result = analyze([42]);
    expect(result).toEqual({
      average: 42,
      min: 42,
      max: 42,
      length: 1,
    });
  });
  test("should handle empty array", () => {
    const result = analyze([]);
    expect(result).toBeNull();
  });
});
