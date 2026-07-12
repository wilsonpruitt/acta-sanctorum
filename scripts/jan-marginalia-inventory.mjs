/**
 * jan-marginalia-inventory.mjs — list Bollandist bracketed marginal-note
 * headlines present in jan-vol1 Latin chunks but missing from the English
 * translations. Pairs files by leading numeric prefix.
 *
 * Output: scripts/jan-marginalia-inventory.json
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const VOL = process.argv[2] || 'jan-vol1';
const TRANS_DIR = path.join(ROOT, 'src/translations', VOL);
const LATIN_DIR = path.join(ROOT, 'src/latin', VOL, 'chunks');
const OUTPUT = path.join(ROOT, 'scripts/jan-marginalia-inventory.json');

const MARGINALIUM_RE = /\[[A-ZÆŒ][^\[\]\n]{2,120}\]/g;

function prefixOf(name) {
  const m = name.match(/^(\d+)-/);
  return m ? m[1] : null;
}

function indexByPrefix(dir) {
  const out = new Map();
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.md')) continue;
    const p = prefixOf(f);
    if (p) out.set(p, f);
  }
  return out;
}

function stripFrontMatter(text) {
  if (!text.startsWith('---')) return text;
  const end = text.indexOf('\n---', 3);
  if (end < 0) return text;
  return text.slice(end + 4);
}

function extractMarginalia(latin) {
  const body = stripFrontMatter(latin);
  const items = [];
  for (const match of body.matchAll(MARGINALIUM_RE)) {
    const phrase = match[0];
    const idx = match.index;
    const start = Math.max(0, idx - 120);
    const end = Math.min(body.length, idx + phrase.length + 120);
    const context = body.slice(start, end).replace(/\s+/g, ' ').trim();
    items.push({ phrase, latin_context: context, offset: idx });
  }
  return items;
}

function countEnglishMarginalia(english) {
  const body = stripFrontMatter(english);
  return (body.match(MARGINALIUM_RE) || []).length;
}

const englishByPrefix = indexByPrefix(TRANS_DIR);
const latinByPrefix = indexByPrefix(LATIN_DIR);

const chunks = [];
let totalMarginalia = 0;
let chunksNeeding = 0;

for (const [prefix, latinName] of [...latinByPrefix.entries()].sort()) {
  const englishName = englishByPrefix.get(prefix);
  if (!englishName) continue;
  const latinPath = path.join(LATIN_DIR, latinName);
  const englishPath = path.join(TRANS_DIR, englishName);
  const latinText = fs.readFileSync(latinPath, 'utf8');
  const englishText = fs.readFileSync(englishPath, 'utf8');
  const marginalia = extractMarginalia(latinText);
  if (marginalia.length === 0) continue;
  const englishExisting = countEnglishMarginalia(englishText);
  chunks.push({
    prefix,
    english_rel: path.relative(ROOT, englishPath),
    latin_rel: path.relative(ROOT, latinPath),
    latin_marginalia_count: marginalia.length,
    english_marginalia_count: englishExisting,
    marginalia,
  });
  totalMarginalia += marginalia.length;
  if (englishExisting < marginalia.length) chunksNeeding++;
}

const BATCH_TARGET = 40;
const batches = [];
let current = { chunks: [], total: 0 };
for (const ch of chunks) {
  if (current.total + ch.latin_marginalia_count > BATCH_TARGET && current.chunks.length) {
    batches.push(current);
    current = { chunks: [], total: 0 };
  }
  current.chunks.push(ch.prefix);
  current.total += ch.latin_marginalia_count;
}
if (current.chunks.length) batches.push(current);

const out = {
  generated_at: new Date().toISOString(),
  volume: VOL,
  stats: {
    chunks_with_marginalia: chunks.length,
    chunks_needing_work: chunksNeeding,
    total_latin_marginalia: totalMarginalia,
  },
  batches,
  chunks,
};

fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2));
console.log('Inventory written to', path.relative(ROOT, OUTPUT));
console.log(JSON.stringify(out.stats, null, 2));
console.log(`Batches (target ${BATCH_TARGET} marginalia each): ${batches.length}`);
for (const b of batches) console.log(`  [${b.chunks.join(', ')}] -> ${b.total} marginalia`);
