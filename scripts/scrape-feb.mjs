/**
 * scrape-feb.mjs — Scrape February (all 3 volumes) from heiligenlexikon.de
 * Usage: node scripts/scrape-feb.mjs [--start N] [--end N]
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { load } from 'cheerio';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BASE_URL = 'https://www.heiligenlexikon.de/ActaSanctorum';
const DELAY_MS = 2000;

const args = process.argv.slice(2);
const startDay = parseInt(args.find((_, i, a) => a[i - 1] === '--start') || '1');
const endDay = parseInt(args.find((_, i, a) => a[i - 1] === '--end') || '29');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
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

async function main() {
  const outDir = join(ROOT, 'src/latin/feb');
  await mkdir(outDir, { recursive: true });

  // Scrape intros for all 3 Feb volumes
  for (const vol of ['I', 'II', 'III']) {
    const url = `${BASE_URL}/Einleitung_Februar_${vol}.html`;
    console.log(`Fetching Feb Vol ${vol} Introduction...`);
    try {
      const html = await fetchPage(url);
      const text = extractText(html);
      await writeFile(join(outDir, `einleitung-feb-${vol.toLowerCase()}.txt`), text, 'utf-8');
      console.log(`  ${text.split(/\s+/).length} words`);
    } catch (e) { console.error(`  Error: ${e.message}`); }
    await sleep(DELAY_MS);
  }

  let totalWords = 0;
  for (let day = startDay; day <= endDay; day++) {
    const url = `${BASE_URL}/${day}.Februar.html`;
    console.log(`\nFetching Feb ${day}...`);
    try {
      const html = await fetchPage(url);
      const text = extractText(html);
      const words = text.split(/\s+/).length;
      totalWords += words;
      const dp = String(day).padStart(2, '0');
      const dayDir = join(outDir, `day-${dp}`);
      await mkdir(dayDir, { recursive: true });
      await writeFile(join(dayDir, `day-${dp}-full.txt`), text, 'utf-8');
      console.log(`  Feb ${day}: ${words} words`);
    } catch (e) { console.error(`  Error on Feb ${day}: ${e.message}`); }
    await sleep(DELAY_MS);
  }
  console.log(`\n=== Done === Total: ${totalWords} words`);
}

main().catch(e => { console.error(e); process.exit(1); });
