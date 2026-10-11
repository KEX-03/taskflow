
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getQueryString,
  escapeRegex,
  parsePositiveInt,
} = require('../src/utils/query');

// Tests for getQueryString
test('getQueryString trims a normal string', () => {
  assert.equal(getQueryString(' hello '), 'hello');
});

test('getQueryString uses the first array item', () => {
  assert.equal(getQueryString(['first', 'second']), 'first');
});

test('getQueryString returns undefined for an object', () => {
  assert.equal(getQueryString({ key: 'value' }), undefined);
});

test('getQueryString returns undefined for undefined', () => {
  assert.equal(getQueryString(undefined), undefined);
});

// Tests for escapeRegex
test('escapeRegex escapes special characters', () => {
  const input = '.*()[]?';
  assert.equal(escapeRegex(input), String.raw`\.\*\(\)\[\]\?`);
});

test('escapeRegex matches the original text literally', () => {
  const input = 'file.txt';
  const regex = new RegExp(escapeRegex(input));

  assert.equal(regex.test('file.txt'), true);
  assert.equal(regex.test('fileXtxt'), false);
});

// Tests for parsePositiveInt
test('parsePositiveInt parses a valid number', () => {
  assert.equal(
    parsePositiveInt('25', { fallback: 10 }),
    25
  );
});

test('parsePositiveInt returns fallback for non-numeric text', () => {
  assert.equal(
    parsePositiveInt('abc', { fallback: 10 }),
    10
  );
});

test('parsePositiveInt clamps values below min', () => {
  assert.equal(
    parsePositiveInt('0', { fallback: 10, min: 1, max: 100 }),
    1
  );
});

test('parsePositiveInt clamps values above max', () => {
  assert.equal(
    parsePositiveInt('150', { fallback: 10, min: 1, max: 100 }),
    100
  );
});
