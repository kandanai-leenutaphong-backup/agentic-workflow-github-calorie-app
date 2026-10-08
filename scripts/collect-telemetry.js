'use strict';

// Boots the app, drives synthetic traffic (a stand-in for real users in one "prod"
// environment), then writes the /api/metrics snapshot to telemetry/<env>.json.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const env = process.env.TELEMETRY_ENV || 'prod-1';
const requests = Number(process.env.TELEMETRY_REQUESTS || 60);

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'calorie-telemetry-'));
fs.copyFileSync(path.join(__dirname, '..', 'data', 'foods.json'), path.join(dir, 'foods.json'));
process.env.CALORIE_DATA_DIR = dir;

const { createServer } = require('../src/app');

async function main() {
  const server = createServer().listen(0);
  const base = `http://localhost:${server.address().port}`;
  const json = { 'Content-Type': 'application/json' };
  const foods = await (await fetch(`${base}/api/foods`)).json();
  const date = new Date().toISOString().slice(0, 10);

  for (let i = 0; i < requests; i++) {
    const food = foods[i % foods.length].name;
    // Roughly 1 in 6 requests is invalid, as real users make typos.
    const grams = i % 6 === 0 ? -1 : 50 + (i % 10) * 25;
    await fetch(`${base}/api/entries`, { method: 'POST', headers: json, body: JSON.stringify({ food, grams, date }) });
    await fetch(`${base}/api/entries?date=${date}`);
  }

  const metrics = await (await fetch(`${base}/api/metrics`)).json();
  server.close();

  const out = path.join(__dirname, '..', 'telemetry');
  fs.mkdirSync(out, { recursive: true });
  const snapshot = { environment: env, collectedAt: new Date().toISOString(), ...metrics };
  fs.writeFileSync(path.join(out, `${env}.json`), JSON.stringify(snapshot, null, 2));
  console.log(JSON.stringify(snapshot, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
