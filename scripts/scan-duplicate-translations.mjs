#!/usr/bin/env node
/**
 * scan-duplicate-translations.mjs
 *
 * Detects the "double-translation" artifact discovered on the June 29
 * "Princes of the Apostles" page, where the SAME numbered paragraph was
 * translated twice (a bare run, then a margin-noted run) and both copies
 * were kept — bloating the page.
 *
 * Heuristic: within a single merged saint entry, find paragraph numbers
 * ([N]) that occur 2+ times AND whose occurrences are textually very
 * similar (same content, different wording). High similarity = probable
 * duplicate translation. Low similarity = a legitimately distinct source
 * that happens to restart numbering (e.g. a Vita followed by a Passio),
 * which we do NOT flag.
 *
 * Usage:
 *   node scripts/scan-duplicate-translations.mjs            # scan all months
 *   node scripts/scan-duplicate-translations.mjs jun        # one month
 *   node scripts/scan-duplicate-translations.mjs --threshold 0.35
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = new URL('../src/translations/', import.meta.url).pathname;
const args = process.argv.slice(2);
let threshold = 0.30;
const ti = args.indexOf('--threshold');
if (ti !== -1) { threshold = parseFloat(args[ti + 1]); args.splice(ti, 2); }
const monthFilter = args.find((a) => !a.startsWith('--')) || null;

// Normalize a paragraph for comparison: drop the leading [N], strip inline
// [margin notes] / [scripture refs], lowercase, keep word tokens only.
function normalize(text) {
  return text
    .replace(/^\s*\[\d+\]\s*/, '')
    .replace(/\[[^\]]*\]/g, ' ')      // inline bracketed glosses
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);     // drop tiny stopword-ish tokens
}

// Jaccard similarity over word-bigram shingles (order-sensitive enough to
// catch same-passage re-translations, robust to small wording changes).
function shingles(words) {
  const s = new Set();
  for (let i = 0; i < words.length - 1; i++) s.add(words[i] + ' ' + words[i + 1]);
  return s;
}
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

async function* walk(dir) {
  for (const name of await readdir(dir)) {
    const full = join(dir, name);
    const st = await stat(full);
    if (st.isDirectory()) yield* walk(full);
    else if (name.endsWith('.md')) yield full;
  }
}

// Pull numbered paragraphs out of a saint file.
function parseParagraphs(content) {
  const paras = [];
  for (const line of content.split('\n')) {
    const m = line.match(/^\[(\d+)\]\s/);
    if (m) paras.push({ num: Number(m[1]), text: line });
  }
  return paras;
}

const findings = [];

for await (const file of walk(ROOT)) {
  if (!file.includes('/saints/')) continue;        // merged saint entries only
  if (monthFilter && !file.includes(`/${monthFilter}/`)) continue;
  const content = await readFile(file, 'utf8');
  const paras = parseParagraphs(content);
  if (paras.length < 4) continue;

  // group occurrences by paragraph number
  const byNum = new Map();
  for (const p of paras) {
    if (!byNum.has(p.num)) byNum.set(p.num, []);
    byNum.get(p.num).push(p);
  }

  const dupNums = [];
  let maxSim = 0;
  for (const [num, occ] of byNum) {
    if (occ.length < 2) continue;
    // compare each pair; keep best similarity
    let best = 0;
    for (let i = 0; i < occ.length; i++)
      for (let j = i + 1; j < occ.length; j++) {
        const sim = jaccard(shingles(normalize(occ[i].text)), shingles(normalize(occ[j].text)));
        best = Math.max(best, sim);
      }
    if (best >= threshold) { dupNums.push({ num, sim: best }); maxSim = Math.max(maxSim, best); }
  }

  if (dupNums.length) {
    findings.push({
      file: file.replace(ROOT, ''),
      count: dupNums.length,
      maxSim,
      nums: dupNums.sort((a, b) => a.num - b.num).map((d) => d.num),
    });
  }
}

findings.sort((a, b) => b.count - a.count || b.maxSim - a.maxSim);

if (!findings.length) {
  console.log(`No duplicate-translation patterns found (threshold ${threshold}).`);
} else {
  console.log(`Probable duplicate-translation pages (threshold ${threshold}):\n`);
  for (const f of findings) {
    console.log(`  ${f.file}`);
    console.log(`      ${f.count} repeated paragraph number(s), best similarity ${f.maxSim.toFixed(2)}`);
    console.log(`      paragraphs: ${f.nums.join(', ')}`);
  }
  console.log(`\n${findings.length} page(s) flagged for review.`);
}
