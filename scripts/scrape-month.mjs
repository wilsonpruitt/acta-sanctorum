// Usage: node scripts/scrape-month.mjs <slug> <german> <vols>
//   slug   short month name used in src/latin/<slug>/      (e.g. jun)
//   german German name used in heiligenlexikon URLs        (e.g. Juni)
//   vols   max introduction-volume count to probe          (e.g. 7)
//
// Mirrors scrape-may.mjs but parameterised. Errors are logged and skipped so
// missing intro volumes (later Bollandist months are short a tome) don't halt
// the run.

import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BASE_URL = 'https://www.heiligenlexikon.de/ActaSanctorum';
const DELAY_MS = 2000;

const [slug, german, volsArg] = process.argv.slice(2);
if (!slug || !german) {
  console.error('Usage: node scripts/scrape-month.mjs <slug> <german> [vols]');
  process.exit(1);
}
const MAX_VOLS = Number(volsArg ?? 8);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function extractText(html) {
  const $ = load(html);
  const idParas = [];
  $('p[id]').each((_, el) => {
    const id = $(el).attr('id');
    if (id && /^PA\d+$/.test(id)) { const t = $(el).text().trim(); if (t) idParas.push(t); }
  });
  if (idParas.length > 0) return idParas.join('\n\n');
  const paragraphs = [];
  let found = false;
  $('p').each((_, el) => {
    const t = $(el).text().trim();
    if (!t || t.length < 3) return;
    if (t.startsWith('Ökumenisches') || t.includes('cookie') || t.includes('JavaScript')) return;
    if (!found && (t.match(/[A-Z]{3,}/) || t.match(/\b(SANCTORVM|Sanctorum|sancti|beati)\b/i))) found = true;
    if (found) paragraphs.push(t);
  });
  return paragraphs.join('\n\n');
}

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII'];

async function main() {
  const outDir = join(ROOT, 'src/latin', slug);
  await mkdir(outDir, { recursive: true });

  for (const vol of ROMAN.slice(0, MAX_VOLS)) {
    const url = `${BASE_URL}/Einleitung_${german}_${vol}.html`;
    console.log(`Fetching ${german} Vol ${vol} Introduction...`);
    try {
      const html = await fetchPage(url);
      const text = extractText(html);
      if (text.split(/\s+/).filter(Boolean).length < 50) {
        console.log(`  empty/short, skip`);
      } else {
        await writeFile(join(outDir, `einleitung-${slug}-${vol.toLowerCase()}.txt`), text, 'utf-8');
        console.log(`  ${text.split(/\s+/).length} words`);
      }
    } catch (e) { console.error(`  Error: ${e.message}`); }
    await sleep(DELAY_MS);
  }

  let totalWords = 0;
  for (let day = 1; day <= 31; day++) {
    const url = `${BASE_URL}/${day}.${german}.html`;
    console.log(`Fetching ${german} ${day}...`);
    try {
      const html = await fetchPage(url);
      const text = extractText(html);
      const words = text.split(/\s+/).length;
      totalWords += words;
      const dp = String(day).padStart(2, '0');
      const dayDir = join(outDir, `day-${dp}`);
      await mkdir(dayDir, { recursive: true });
      await writeFile(join(dayDir, `day-${dp}-full.txt`), text, 'utf-8');
      console.log(`  ${german} ${day}: ${words} words`);
    } catch (e) { console.error(`  Error on ${german} ${day}: ${e.message}`); }
    await sleep(DELAY_MS);
  }
  console.log(`\n=== Done ${german} === Total: ${totalWords} words`);
}

main().catch(e => { console.error(e); process.exit(1); });
