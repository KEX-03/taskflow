const test = require("node:test");
const assert = require("node:assert/strict");
const { validatePassword } = require("../src/utils/password");

test("accepts a password that meets all six rules", () => {
  assert.deepEqual(validatePassword("StrongPass123!"), []);
});

test("rejects passwords shorter than 12 characters", () => {
  const errors = validatePassword("Abc123!");
  assert.ok(errors.some((error) => error.includes("12 characters")));
});

test("requires an uppercase letter", () => {
  const errors = validatePassword("strongpassword123!");
  assert.ok(errors.some((error) => error.includes("uppercase")));
});

test("requires a lowercase letter", () => {
  const errors = validatePassword("STRONGPASSWORD123!");
  assert.ok(errors.some((error) => error.includes("lowercase")));
});

test("requires a digit", () => {
  const errors = validatePassword("StrongPassword!");
  assert.ok(errors.some((error) => error.includes("number")));
});

test("requires a special character", () => {
  const errors = validatePassword("StrongPassword123");
  assert.ok(errors.some((error) => error.includes("special character")));
});

test("rejects leading or trailing whitespace", () => {
  assert.ok(validatePassword(" StrongPass123!").some((error) => error.includes("whitespace")));
  assert.ok(validatePassword("StrongPass123! ").some((error) => error.includes("whitespace")));
});

test("accepts the full special-character set", () => {
  for (const character of '!@#$%^&*(),.?":{}|<>') {
    assert.deepEqual(validatePassword(`StrongPass123${character}`), []);
  }
});

test("rejects non-string passwords", () => {
  assert.deepEqual(validatePassword(null), ["Password must be a string."]);
});
