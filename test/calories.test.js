'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { kcalFromMacros, scaleToGrams, sumTotals } = require('../src/calories');
const { validateEntry } = require('../src/validate');
const foods = require('../data/foods.json');

test('kcalFromMacros uses 4/4/9 Atwater factors', () => {
  assert.equal(kcalFromMacros({ protein: 10, carbs: 10, fat: 10 }), 170);
});

test('scaleToGrams scales per-100g values', () => {
  const r = scaleToGrams({ kcal: 165, protein: 31, carbs: 0, fat: 3.6 }, 200);
  assert.deepEqual(r, { kcal: 330, protein: 62, carbs: 0, fat: 7.2 });
});

test('sumTotals adds entries', () => {
  const t = sumTotals([
    { kcal: 100, protein: 1, carbs: 2, fat: 3 },
    { kcal: 50, protein: 1, carbs: 1, fat: 1 },
  ]);
  assert.deepEqual(t, { kcal: 150, protein: 2, carbs: 3, fat: 4 });
});

test('validateEntry rejects bad grams and unknown food', () => {
  assert.ok(validateEntry({ food: 'Apple', grams: -5 }, foods).error);
  assert.ok(validateEntry({ food: 'Nope', grams: 5 }, foods).error);
  assert.ok(validateEntry({ food: 'apple', grams: 150 }, foods).value);
});

test('seed foods: kcal roughly matches macros', () => {
  for (const f of foods) {
    const diff = Math.abs(kcalFromMacros(f.per100g) - f.per100g.kcal);
    assert.ok(diff <= 25, `${f.name} off by ${diff}`);
  }
});
