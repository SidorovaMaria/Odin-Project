function reverseString(string) {
  if (typeof string !== "string") {
    throw new Error("Provide a string");
  }
  return string.split("").reverse().join("");
  // Check if the input is a string
}

module.exports = reverseString;
