class Calculator {
  add(a, b) {
    if (typeof a !== "number" || typeof b !== "number") {
      throw new Error("Provide numbers");
    }
    return a + b;
  }
  subtract(a, b) {
    if (typeof a !== "number" || typeof b !== "number") {
      throw new Error("Provide numbers");
    }
    return a - b;
  }
  divide(a, b) {
    if (typeof a !== "number" || typeof b !== "number") {
      throw new Error("Provide numbers");
    }
    if (b === 0) {
      throw new Error("Can't divide by 0");
    }
    return a / b;
  }
  multiply(a, b) {
    if (typeof a !== "number" || typeof b !== "number") {
      throw new Error("Provide numbers");
    }
    return a * b;
  }
}
module.exports = Calculator;
