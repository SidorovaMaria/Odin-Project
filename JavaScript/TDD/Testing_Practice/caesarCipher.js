const alphabet = "abcdefghijklmnopqrstuvwxyz";

function caesarCipher(str, shift) {
  if (typeof str !== "string" || typeof shift !== "number") {
    throw new Error("Invalid input");
  }

  return str
    .split("")
    .map((char) => {
      const isUpperCase = char === char.toUpperCase();
      const lowerChar = char.toLowerCase();
      const index = alphabet.indexOf(lowerChar);

      if (index === -1) {
        return char; // Non-alphabetic characters are not changed
      }

      let newIndex = (index + shift) % 26;
      if (newIndex < 0) newIndex += 26; // Handle negative shifts

      const newChar = alphabet[newIndex];
      return isUpperCase ? newChar.toUpperCase() : newChar;
    })
    .join("");
}

module.exports = caesarCipher;
