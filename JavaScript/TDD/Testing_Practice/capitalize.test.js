const capitalize = require("./capitalize");
test("capitalizes the first letter of a string", () => {
  expect(capitalize("hello")).toBe("Hello");
  expect(capitalize("world")).toBe("World");
  expect(capitalize("javaScript")).toBe("JavaScript");
  expect(capitalize("")).toBe("");
});
