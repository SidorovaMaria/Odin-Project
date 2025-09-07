## String & Array Utilities — Tested with Jest

A small collection of pure JavaScript utilities (plus a simple Calculator class) implemented with a Test-Driven Development (TDD) approach and fully covered by Jest unit tests.

## Features

- `capitalize(string)`: Capitalizes the first letter of a string.
- `reverseString(string)`: Reverses a given string.
- `caesarCipher(string, shift)`: Applies a Caesar cipher to a string with a specified shift.
- `analyzeArray(array)`: Analyzes an array of numbers and returns its average, minimum, maximum, and length.
- `Calculator` class: Provides methods for basic arithmetic operations (add, subtract, multiply, divide).

## Folder Structure

```.
├─ capitalize.js              # capitalize function
├─ capitalize.test.js         # capitalize function tests
├─ reverseString.js           # reverseString function
├─ reverseString.test.js      # reverseString function tests
├─ calculator.js              # Calculator class
├─ calculator.test.js         # Calculator class tests
├─ caesarCipher.js            # caesarCipher function
├─ caesarCipher.test.js       # caesarCipher function tests
├─ analyzeArray.js            # analyzeArray function
├─ analyzeArray.test.js       # analyzeArray function tests
└─ package.json
```

# Installation

```bash
npm init -y
npm i --save-dev jest
```

Run tests with:

```bash
npm test
```

## Reference and Complexity

`capitalize(input: string): string`
Returns the input string with the first letter capitalized.

- Edge cases: `''` => `''`; non-string input throws an error.
- Errors: non-string input → `Error("Provide a string")`
- Complexity: O(n) time / O(n) space.

`reverseString(input: string): string`
Returns a reversed string.

- Uses code-point aware iteration `([...str])` to better handle surrogate pairs.
- Errors: non-string input → `Error("Provide a string")`
- Complexity: O(n) time / O(n) space.

`class Calculator`
` add(a, b): number``subtract(a, b): number  ` `divide(a, b): number` `multiply(a, b): number`

- Validation: both args must be finite numbers.
- Division by zero throws `Error("Can't divide by 0")`
- Errors: invalid args → `Error("Provide numbers")`
- Complexity: O(1) time / O(1) space per method.

`caesarCipher(input: string, shift: number): string`
Shifts alphabetic characters by shift within [a..z] and [A..Z].

- Wraparound: `xyz, 3 → abc`
- Case preserved: `HeLLo, 3 → KhOOr`
- Non-letters unchanged: `Hello, World!, 3 → Khoor, Zruog!`
- Negative/large shifts normalized via modulo 26.
- Errors: non-string input or non-integer shift → clear error.
- Complexity: O(n) time / O(n) space.

`analyzeArray(nums: number[]): { average, min, max, length }`
Analyzes an array of numbers and returns its average, minimum, maximum, and length.
