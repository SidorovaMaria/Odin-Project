// calculator.test.js
const Calculator = require("./calculator");

describe("Calculator", () => {
  let calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe("add", () => {
    test("adds numbers", () => {
      expect(calculator.add(2, 2)).toBe(4);
      expect(calculator.add(4, 10)).toBe(14);
    });

    test("throws on non-numbers", () => {
      expect(() => calculator.add("2", "ad")).toThrow(/Provide numbers/);
      expect(() => calculator.add("2", 2)).toThrow(/Provide numbers/);
    });
  });

  describe("subtract", () => {
    test("subtracts numbers", () => {
      expect(calculator.subtract(10, 2)).toBe(8);
      expect(calculator.subtract(4, 10)).toBe(-6);
    });

    test("throws on non-numbers", () => {
      expect(() => calculator.subtract("2", "ad")).toThrow(/Provide numbers/);
      expect(() => calculator.subtract("2", 2)).toThrow(/Provide numbers/);
    });
  });

  describe("divide", () => {
    test("divides numbers", () => {
      expect(calculator.divide(10, 2)).toBe(5);
      expect(calculator.divide(4, 2)).toBe(2);
    });

    test("throws on non-numbers", () => {
      expect(() => calculator.divide("2", "ad")).toThrow(/Provide numbers/);
      expect(() => calculator.divide("2", 2)).toThrow(/Provide numbers/);
    });

    test("throws on division by zero", () => {
      expect(() => calculator.divide(4, 0)).toThrow(/Can't divide by 0/);
    });
  });

  describe("multiply", () => {
    test("multiplies numbers", () => {
      expect(calculator.multiply(10, 2)).toBe(20);
      expect(calculator.multiply(4, 2)).toBe(8);
    });

    test("throws on non-numbers", () => {
      expect(() => calculator.multiply("2", "ad")).toThrow(/Provide numbers/);
      expect(() => calculator.multiply("2", 2)).toThrow(/Provide numbers/);
    });
  });
});
