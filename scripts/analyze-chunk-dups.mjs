#!/usr/bin/env node
/**
 * analyze-chunk-dups.mjs
 *
 * For each day directory, finds numbered paragraphs that are byte-identical
 * duplicates (the "duplicate chunk" translation artifact) and classifies each
 * chunk file:
 *   FULL-REDUNDANT  – every numbered paragraph in it duplicates an earlier one
 *                     (chunk can be deleted wholesale)
 *   PARTIAL         – some duplicate, some unique paragraphs (needs trimming)
 *   clean           – no duplicate paragraphs
 *
 * Usage: node scripts/analyze-chunk-dups.mjs [month]
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = new URL('../src/translations/', import.meta.url).pathname;
const monthFilter = process.argv[2] || null;

const norm = (s) => s.replace(/^\[\d+\]\s*/, '').replace(/\[[^\]]*\]/g, ' ')
  .toLowerCase().replace(/[^a-z]/g, '');

async function* dayDirs(dir) {
  for (const name of await readdir(dir)) {
    const full = join(dir, name);
    if (!(await stat(full)).isDirectory()) continue;
    if (name === 'saints') continue;
    // a day dir holds NNNN-*.md chunk files directly
    const entries = await readdir(full);
    if (entries.some((e) => /^\d{4}-.*\.md$/.test(e))) yield full;
    else yield* dayDirs(full);
  }
}

const report = [];
for await (const dayDir of dayDirs(ROOT)) {
  if (monthFilter && !dayDir.includes(`/${monthFilter}/`)) continue;
  const files = (await readdir(dayDir)).filter((f) => /^\d{4}-.*\.md$/.test(f)).sort();
  const seen = new Map();          // normText -> first {file}
  const perFile = new Map();       // file -> {dup, uniq, paras}
  for (const f of files) {
    const content = await readFile(join(dayDir, f), 'utf8');
    let dup = 0, uniq = 0, paras = 0;
    for (const line of content.split('\n')) {
      if (!/^\[\d+\]\s/.test(line)) continue;
      paras++;
      const key = norm(line);
      if (key.length < 40) { uniq++; continue; }   // ignore tiny paras
      if (seen.has(key)) dup++; else { seen.set(key, f); uniq++; }
    }
    perFile.set(f, { dup, uniq, paras });
  }
  const flagged = [...perFile.entries()].filter(([, v]) => v.dup > 0);
  if (!flagged.length) continue;
  const rel = dayDir.replace(ROOT, '');
  for (const [f, v] of flagged) {
    const cls = v.uniq === 0 || v.dup >= v.paras ? 'FULL-REDUNDANT' : 'PARTIAL';
    report.push({ day: rel, file: f, ...v, cls });
  }
}

report.sort((a, b) => a.day.localeCompare(b.day) || a.file.localeCompare(b.file));
let full = 0, partial = 0;
for (const r of report) {
  if (r.cls === 'FULL-REDUNDANT') full++; else partial++;
  console.log(`${r.cls.padEnd(15)} ${r.day}/${r.file}  (dup ${r.dup}/${r.paras})`);
}
console.log(`\n${report.length} chunk(s) flagged: ${full} FULL-REDUNDANT, ${partial} PARTIAL across ${new Set(report.map(r=>r.day)).size} day(s).`);
