'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { scaleToGrams, sumTotals } = require('./calories');
const { validateEntry } = require('./validate');
const store = require('./store');
const telemetry = require('./telemetry');

const PUBLIC = path.join(__dirname, '..', 'public');

function send(res, status, body, type = 'application/json') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 1e5) reject(new Error('Body too large'));
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const t0 = process.hrtime.bigint();
    res.on('finish', () => {
      const ms = Number(process.hrtime.bigint() - t0) / 1e6;
      if (url.pathname !== '/api/metrics') telemetry.record(req.method, url.pathname, res.statusCode, ms);
    });
    try {
      if (req.method === 'GET' && url.pathname === '/healthz') {
        return send(res, 200, { status: 'ok' });
      }
      if (req.method === 'GET' && url.pathname === '/api/metrics') {
        return send(res, 200, telemetry.snapshot());
      }
      if (req.method === 'GET' && url.pathname === '/api/foods') {
        return send(res, 200, store.loadFoods());
      }
      if (req.method === 'GET' && url.pathname === '/api/entries') {
        const date = url.searchParams.get('date');
        const entries = store.loadEntries().filter((e) => !date || e.date === date);
        return send(res, 200, { entries, totals: sumTotals(entries) });
      }
      if (req.method === 'POST' && url.pathname === '/api/entries') {
        const { value, error } = validateEntry(await readBody(req), store.loadFoods());
        if (error) return send(res, 400, { error });
        const entry = {
          id: randomUUID(),
          date: value.date,
          food: value.food.name,
          grams: value.grams,
          ...scaleToGrams(value.food.per100g, value.grams),
        };
        store.saveEntries([...store.loadEntries(), entry]);
        return send(res, 201, entry);
      }
      if (req.method === 'DELETE' && url.pathname.startsWith('/api/entries/')) {
        const id = url.pathname.split('/').pop();
        const all = store.loadEntries();
        const rest = all.filter((e) => e.id !== id);
        if (rest.length === all.length) return send(res, 404, { error: 'Not found' });
        store.saveEntries(rest);
        return send(res, 204, '', 'text/plain');
      }
      if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
        return send(res, 200, fs.readFileSync(path.join(PUBLIC, 'index.html')), 'text/html');
      }
      return send(res, 404, { error: 'Not found' });
    } catch (err) {
      return send(res, 400, { error: err.message });
    }
  });
}

module.exports = { createServer };
