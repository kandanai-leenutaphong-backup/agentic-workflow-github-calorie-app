'use strict';

const fs = require('node:fs');
const path = require('node:path');

const DATA_DIR = process.env.CALORIE_DATA_DIR || path.join(__dirname, '..', 'data');

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }
}

const loadFoods = () => readJson('foods.json', []);
const loadEntries = () => readJson('entries.json', []);

function saveEntries(entries) {
  fs.writeFileSync(path.join(DATA_DIR, 'entries.json'), JSON.stringify(entries, null, 2));
}

module.exports = { loadFoods, loadEntries, saveEntries };
