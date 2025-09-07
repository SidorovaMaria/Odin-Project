describe("Caesar Cipher", () => {
  let caesarCipher;

  beforeEach(() => {
    caesarCipher = require("./caesarCipher");
  });

  test("shifts letters correctly", () => {
    expect(caesarCipher("abc", 1)).toBe("bcd");
    expect(caesarCipher("xyz", 2)).toBe("zab");
    expect(caesarCipher("Hello, World!", 3)).toBe("Khoor, Zruog!");
  });

  test("handles negative shifts", () => {
    expect(caesarCipher("bcd", -1)).toBe("abc");
    expect(caesarCipher("zab", -2)).toBe("xyz");
    expect(caesarCipher("Khoor, Zruog!", -3)).toBe("Hello, World!");
  });

  test("wraps around the alphabet", () => {
    expect(caesarCipher("Zebra", 1)).toBe("Afcsb");
    expect(caesarCipher("Apple", 25)).toBe("Zookd");
  });

  test("preserves case and non-alphabetic characters", () => {
    expect(caesarCipher("Hello, World!", 5)).toBe("Mjqqt, Btwqi!");
    expect(caesarCipher("1234!@#$", 10)).toBe("1234!@#$");
  });

  test("throws error on invalid input", () => {
    expect(() => caesarCipher(123, 1)).toThrow("Invalid input");
    expect(() => caesarCipher("abc", "a")).toThrow("Invalid input");
    expect(() => caesarCipher(null, 1)).toThrow("Invalid input");
  });
});
