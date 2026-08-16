#!/usr/bin/env node
// check-day.mjs — verification + gap report for one translated day.
//
//   node scripts/check-day.mjs sep day-09          # full verify
//   node scripts/check-day.mjs sep day-11 --gaps   # gap list only (resume planning)
//   node scripts/check-day.mjs sep --all           # every started day in the month
//
// Written 2026-08-15 during the September run, after doing this by hand seven times.
//
// WHY THIS EXISTS — two hard-won rules it enforces mechanically:
//
//  1. NEVER relaunch an agent on its original range after a failure. Partial work
//     flushes to disk cleanly, and re-translating banked chunks is the mechanism
//     behind this corpus's ~65 duplicate-translation pages. Run --gaps and relaunch
//     ONLY the missing numbers.
//  2. NEVER check saint headers by grepping. A grep sees three different header
//     strings and reports "no collision" — true and useless. The defect is what
//     extractSaintName() *returns*, so this evaluates the real function out of
//     split-saints.mjs rather than reimplementing it.
//
// A low reported token count is NOT truncation (known telemetry artifact, seen 3x).
// Trust the per-chunk ratio sweep below instead.
//
// ⚠️ BUT THE RATIO SWEEP HAS ITS OWN FALSE POSITIVE: chunks holding a long GREEK
// passage that the scrape broke to one word per line. The Latin file is padded with
// thousands of newlines; the English reflows the same Greek into continuous text, so
// the byte ratio drops to ~0.86–0.89 with nothing whatever missing. Seen on
// sep/day-11 0063, 0070, 0077, 0079, 0080 (Elias Speleotes' Greek Vita).
// Before treating a <0.9 chunk as truncated, compare the LAST LINE of the English
// against the last line of its Latin — if they end at the same words, it is complete.

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LATIN = join(ROOT, 'src/latin');
const TRANS = join(ROOT, 'src/translations');

const FOOTER = /Heiligenlexikon|Impressum|Datenschutz|als USB-Stick|Acta Sanctorum der Bollandisten|Unser Reise-Blog|Seite zum Ausdruck optimiert|unsere FAQs/;

// Slice the real functions out of split-saints.mjs so we evaluate the shipping
// implementation, not a copy that can drift away from it.
function loadSplitterFns() {
  const src = readFileSync(join(ROOT, 'scripts/split-saints.mjs'), 'utf8');
  const grab = (name) => {
    const i = src.indexOf(`function ${name}(`);
    if (i === -1) throw new Error(`check-day: ${name}() not found in split-saints.mjs`);
    let depth = 0;
    for (let k = src.indexOf('{', i); k < src.length; k++) {
      if (src[k] === '{') depth++;
      else if (src[k] === '}' && --depth === 0) return src.slice(i, k + 1);
    }
    throw new Error(`check-day: could not close ${name}()`);
  };
  const body = ['isSaintBoundary', 'extractSaintName', 'slugify'].map(grab).join('\n');
  return new Function(`${body}\nreturn {isSaintBoundary, extractSaintName, slugify};`)();
}

const chunkNums = (dir, suffix) =>
  existsSync(dir)
    ? readdirSync(dir).filter(f => f.endsWith(suffix)).map(f => f.slice(0, 4)).sort()
    : [];

function checkDay(month, day, { gapsOnly = false } = {}) {
  const latinDir = join(LATIN, month, day, 'chunks');
  const transDir = join(TRANS, month, day);
  if (!existsSync(latinDir)) return console.log(`${day}: no Latin source`);

  const suffix = `-${month}-${day}.md`;
  const latin = chunkNums(latinDir, suffix);
  const trans = chunkNums(transDir, suffix);
  const have = new Set(trans);
  const missing = latin.filter(n => !have.has(n));
  const extra = trans.filter(n => !latin.includes(n));

  if (gapsOnly) {
    if (!missing.length) return console.log(`${day}: COMPLETE (${latin.length})`);
    // Collapse to inclusive ranges — this is what goes into a resume prompt.
    const ranges = [];
    for (const n of missing) {
      const last = ranges[ranges.length - 1];
      if (last && Number(n) === Number(last[1]) + 1) last[1] = n;
      else ranges.push([n, n]);
    }
    console.log(`${day}: ${trans.length}/${latin.length} — RELAUNCH ONLY THESE RANGES:`);
    for (const [a, b] of ranges) {
      console.log(`   ${a}–${b}  (${Number(b) - Number(a) + 1} chunks)`);
    }
    return;
  }

  console.log(`\n=== ${month}/${day} ===`);
  console.log(`files            ${trans.length} / ${latin.length}`);
  if (missing.length) console.log(`  ⚠ MISSING       ${missing.length}: ${missing.slice(0, 12).join(' ')}${missing.length > 12 ? ' …' : ''}`);
  if (extra.length) console.log(`  ⚠ EXTRA         ${extra.join(' ')}`);
  if (!trans.length) return;

  // Frontmatter + footer leak + per-chunk length.
  const bad = [], leaked = [], short = [];
  let enTotal = 0, laTotal = 0;
  for (const n of trans) {
    const f = join(transDir, n + suffix);
    const text = readFileSync(f, 'utf8');
    if (!/^status: translated$/m.test(text) ||
        !new RegExp(`^chunk: "${n}"$`, 'm').test(text) ||
        !new RegExp(`^month: ${month}$`, 'm').test(text)) bad.push(n);
    if (FOOTER.test(text)) leaked.push(n);
    if (latin.includes(n)) {
      const la = readFileSync(join(latinDir, n + suffix), 'utf8').length;
      enTotal += text.length; laTotal += la;
      if (la > 400 && text.length / la < 0.9) short.push(`${n}(${(text.length / la).toFixed(2)})`);
    }
  }
  console.log(`frontmatter      ${bad.length ? '⚠ BAD: ' + bad.join(' ') : 'ok'}`);
  console.log(`footer leak      ${leaked.length ? '⚠ LEAKED: ' + leaked.join(' ') : 'none'}`);
  console.log(`EN:LA byte ratio ${(enTotal / laTotal).toFixed(3)}   (healthy ≈ 1.09–1.16 by BYTES;`);
  console.log(`                  the ~1.46 in RESUME-aug.md is a WORD-based measure — different metric)`);
  console.log(`per-chunk <0.9   ${short.length ? '⚠ ' + short.join(' ') : 'none'}`);

  // Saint headers → slugs, by evaluating the real splitter.
  const fns = loadSplitterFns();
  const bySlug = new Map();
  for (const n of trans) {
    for (const line of readFileSync(join(transDir, n + suffix), 'utf8').split('\n')) {
      if (!fns.isSaintBoundary(line)) continue;
      const slug = fns.slugify(fns.extractSaintName(line));
      if (!bySlug.has(slug)) bySlug.set(slug, []);
      bySlug.get(slug).push({ n, line: line.trim() });
    }
  }
  const total = [...bySlug.values()].reduce((a, b) => a + b.length, 0);
  console.log(`headers → slugs  ${total} → ${bySlug.size}`);
  for (const [slug, hits] of bySlug) {
    const forms = new Set(hits.map(h => h.line));
    // Same saint, several section headers, one slug = CORRECT (Matthew, Gerulphus).
    // Different wording reaching one slug is only a problem if they are different saints —
    // which a human must judge, so surface it rather than deciding.
    if (forms.size > 1) {
      console.log(`  ⓘ "${slug}" reached by ${forms.size} header forms — confirm same saint:`);
      for (const f of forms) console.log(`      ${f.slice(0, 100)}`);
    }
    if (slug.length > 60) console.log(`  ⚠ "${slug}" is ${slug.length} chars — use the COLON group form (see PROMPT-sep.md)`);
  }
}

const [month, arg, flag] = process.argv.slice(2);
if (!month) {
  console.error('usage: node scripts/check-day.mjs <month> <day-NN|--all> [--gaps]');
  process.exit(1);
}
const gapsOnly = [arg, flag].includes('--gaps');
const days = arg === '--all' || arg === '--gaps'
  ? readdirSync(join(TRANS, month)).filter(d => d.startsWith('day-')).sort()
  : [arg];
for (const d of days) checkDay(month, d, { gapsOnly });
