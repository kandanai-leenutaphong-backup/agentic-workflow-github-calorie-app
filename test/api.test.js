'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'calorie-'));
fs.copyFileSync(path.join(__dirname, '..', 'data', 'foods.json'), path.join(dir, 'foods.json'));
process.env.CALORIE_DATA_DIR = dir;

const { createServer } = require('../src/app');

test('add, list and delete an entry', async (t) => {
  const server = createServer().listen(0);
  t.after(() => server.close());
  const base = `http://localhost:${server.address().port}`;
  const json = { 'Content-Type': 'application/json' };

  const bad = await fetch(`${base}/api/entries`, {
    method: 'POST', headers: json, body: JSON.stringify({ food: 'Apple', grams: 0 }),
  });
  assert.equal(bad.status, 400);

  const res = await fetch(`${base}/api/entries`, {
    method: 'POST', headers: json,
    body: JSON.stringify({ food: 'Chicken breast', grams: 200, date: '2025-01-01' }),
  });
  assert.equal(res.status, 201);
  const entry = await res.json();
  assert.equal(entry.kcal, 330);

  const list = await (await fetch(`${base}/api/entries?date=2025-01-01`)).json();
  assert.equal(list.totals.kcal, 330);

  assert.equal((await fetch(`${base}/api/entries/${entry.id}`, { method: 'DELETE' })).status, 204);
});
