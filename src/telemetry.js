'use strict';

// Minimal in-memory request telemetry, exposed at GET /api/metrics.
const started = Date.now();
const routes = new Map();

function routeKey(method, pathname) {
  const p = pathname.startsWith('/api/entries/') ? '/api/entries/:id' : pathname;
  return `${method} ${p}`;
}

function record(method, pathname, status, ms) {
  const key = routeKey(method, pathname);
  const r = routes.get(key) || { count: 0, errors4xx: 0, errors5xx: 0, durations: [] };
  r.count += 1;
  if (status >= 500) r.errors5xx += 1;
  else if (status >= 400) r.errors4xx += 1;
  r.durations.push(ms);
  if (r.durations.length > 1000) r.durations.shift();
  routes.set(key, r);
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
}

function snapshot() {
  const out = {};
  for (const [key, r] of routes) {
    const d = [...r.durations].sort((a, b) => a - b);
    out[key] = {
      count: r.count,
      errors4xx: r.errors4xx,
      errors5xx: r.errors5xx,
      p50Ms: Math.round(percentile(d, 0.5) * 100) / 100,
      p95Ms: Math.round(percentile(d, 0.95) * 100) / 100,
    };
  }
  return { uptimeSeconds: Math.round((Date.now() - started) / 1000), routes: out };
}

function reset() {
  routes.clear();
}

module.exports = { record, snapshot, reset };
