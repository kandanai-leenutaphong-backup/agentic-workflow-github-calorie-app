'use strict';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Validate and normalise a new entry payload. Returns { value } or { error }. */
function validateEntry(body, foods) {
  if (!body || typeof body !== 'object') return { error: 'Body must be a JSON object' };
  const food = foods.find((f) => f.name.toLowerCase() === String(body.food || '').toLowerCase());
  if (!food) return { error: 'Unknown food' };
  const grams = Number(body.grams);
  if (!Number.isFinite(grams) || grams <= 0 || grams > 5000) {
    return { error: 'grams must be a number between 1 and 5000' };
  }
  const date = body.date || new Date().toISOString().slice(0, 10);
  if (!DATE_RE.test(date)) return { error: 'date must be YYYY-MM-DD' };
  return { value: { food, grams, date } };
}

module.exports = { validateEntry };
