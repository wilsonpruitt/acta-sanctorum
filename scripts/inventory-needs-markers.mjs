/**
 * inventory-needs-markers.mjs — list chunks that need inline [a] marker insertion
 *
 * Walks English translation files and pairs them with Latin siblings. Flags
 * chunks where:
 *   - English has footnote definitions
 *   - English has NO inline bracketed markers in body yet
 *   - Latin sibling exists and contains bare-letter inline markers (a–o)
 *
 * Output: scripts/marker-inventory.json
 * Usage:  node scripts/inventory-needs-markers.mjs [feb|mar|all]
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const TRANS_DIR = path.join(ROOT, 'src/translations');
const LATIN_DIR = path.join(ROOT, 'src/latin');
const OUTPUT = path.join(ROOT, 'scripts/marker-inventory.json');
const BATCH_SIZE = 20;

function hasFootnoteDefs(text) {
  const lines = text.split('\n');
  const periodForm = /^([a-o])\.\s+(.+)$/;
  const bracketForm = /^\[([a-o])\]\s+(.+)$/;
  for (const line of lines) {
    const t = line.trim();
    const mP = t.match(periodForm);
    if (mP && mP[2].length > 20) return true;
    const mB = t.match(bracketForm);
    if (mB && mB[2].length > 20) return true;
  }
  return false;
}

function countInlineBracketMarkers(text) {
  const lines = text.split('\n');
  let count = 0;
  for (const line of lines) {
    const t = line.trim();
    if (/^\[[a-o]\]/.test(t)) continue;
    const matches = t.match(/\[[a-o]\]/g);
    if (matches) count += matches.length;
  }
  return count;
}

function countLatinInlineMarkers(text) {
  const matches = text.match(/(?:^|[\s,;.:])\s*([a-o])\s+[A-ZÆŒa-zæœ]/gm);
  return matches ? matches.length : 0;
}

function latinMarkerLetters(text) {
  const letters = new Set();
  const re = /(?:^|[\s,;.:])\s([a-o])\s+[A-ZÆŒa-zæœ]/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    letters.add(m[1]);
  }
  return letters;
}

function englishToLatinPath(englishPath) {
  const rel = path.relative(TRANS_DIR, englishPath);
  const parts = rel.split(path.sep);
  if (parts.length !== 3) return null;
  const [month, day, file] = parts;
  return path.join(LATIN_DIR, month, day, 'chunks', file);
}

function walkMdFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMdFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

const arg = process.argv[2] || 'all';
const months = arg === 'all' ? ['feb', 'mar'] : arg.split(',').map((s) => s.trim());

const inventory = [];
const stats = {
  total_english_files: 0,
  has_fn_defs: 0,
  already_has_inline: 0,
  no_latin_sibling: 0,
  latin_has_no_markers: 0,
  needs_markers: 0,
};

for (const month of months) {
  const monthDir = path.join(TRANS_DIR, month);
  const files = walkMdFiles(monthDir);
  for (const englishPath of files) {
    stats.total_english_files++;
    const englishText = fs.readFileSync(englishPath, 'utf8');
    if (!hasFootnoteDefs(englishText)) continue;
    stats.has_fn_defs++;

    if (countInlineBracketMarkers(englishText) > 0) {
      stats.already_has_inline++;
      continue;
    }

    const latinPath = englishToLatinPath(englishPath);
    if (!latinPath || !fs.existsSync(latinPath)) {
      stats.no_latin_sibling++;
      continue;
    }
    const latinText = fs.readFileSync(latinPath, 'utf8');
    const latinMarkerCount = countLatinInlineMarkers(latinText);
    if (latinMarkerCount === 0) {
      stats.latin_has_no_markers++;
      continue;
    }

    stats.needs_markers++;
    const day = path.basename(path.dirname(englishPath));
    inventory.push({
      month,
      day,
      english: path.relative(ROOT, englishPath),
      latin: path.relative(ROOT, latinPath),
      latin_marker_count: latinMarkerCount,
      latin_letters: [...latinMarkerLetters(latinText)].sort(),
    });
  }
}

inventory.sort(
  (a, b) =>
    a.month.localeCompare(b.month) ||
    a.day.localeCompare(b.day) ||
    a.english.localeCompare(b.english)
);

const batches = [];
let current = null;
for (const item of inventory) {
  const groupKey = `${item.month}/${item.day}`;
  if (!current || current.group !== groupKey || current.items.length >= BATCH_SIZE) {
    current = { group: groupKey, items: [] };
    batches.push(current);
  }
  current.items.push(item);
}

const output = {
  generated_at: new Date().toISOString(),
  stats,
  batch_size: BATCH_SIZE,
  batches,
  inventory,
};

fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2));

console.log('Inventory written to', path.relative(ROOT, OUTPUT));
console.log('Stats:');
for (const [k, v] of Object.entries(stats)) console.log(`  ${k}: ${v}`);
console.log(`\nBatches: ${batches.length}`);
const perMonth = {};
for (const item of inventory) {
  perMonth[item.month] = (perMonth[item.month] || 0) + 1;
}
console.log('Per month:');
for (const [m, n] of Object.entries(perMonth)) {
  console.log(`  ${m}: ${n} chunks`);
}
