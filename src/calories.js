'use strict';

// Atwater factors: kcal per gram of each macronutrient.
const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 };

function round1(n) {
  return Math.round(n * 10) / 10;
}

/** Calories implied by the macros (4P + 4C + 9F). */
function kcalFromMacros({ protein = 0, carbs = 0, fat = 0 }) {
  return protein * KCAL_PER_G.protein + carbs * KCAL_PER_G.carbs + fat * KCAL_PER_G.fat;
}

/** Treat a missing/negative/non-numeric fiber value as 0. */
function safeFiber(fiber) {
  return Number.isFinite(fiber) && fiber > 0 ? fiber : 0;
}

/** Scale per-100g nutrition to a portion in grams. */
function scaleToGrams(per100g, grams) {
  const f = grams / 100;
  return {
    kcal: round1(per100g.kcal * f),
    protein: round1(per100g.protein * f),
    carbs: round1(per100g.carbs * f),
    fat: round1(per100g.fat * f),
    fiber: round1(safeFiber(per100g.fiber) * f),
  };
}

/** Sum a list of entries ({kcal, protein, carbs, fat, fiber}) into daily totals. */
function sumTotals(entries) {
  const t = entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.kcal,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
      fiber: acc.fiber + safeFiber(e.fiber),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
  return {
    kcal: round1(t.kcal),
    protein: round1(t.protein),
    carbs: round1(t.carbs),
    fat: round1(t.fat),
    fiber: round1(t.fiber),
  };
}

module.exports = { KCAL_PER_G, kcalFromMacros, scaleToGrams, sumTotals, round1 };
