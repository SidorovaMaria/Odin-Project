const reverse = require("./reverseString");

test("Shoud return String reversed", () => {
  expect(reverse("Str")).toBe("rtS");
  expect(reverse("Maria")).toBe("airaM");
  expect(reverse("Kayak")).toBe("kayaK");
  expect(reverse("I am")).toBe("ma I");
});
