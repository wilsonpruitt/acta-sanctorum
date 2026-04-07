import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { load } from 'cheerio';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BASE_URL = 'https://www.heiligenlexikon.de/ActaSanctorum';
const DELAY_MS = 2000;

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

async function main() {
  const outDir = join(ROOT, 'src/latin/mar');
  await mkdir(outDir, { recursive: true });

  // Scrape intros
  for (const vol of ['I', 'II', 'III']) {
    const url = `${BASE_URL}/Einleitung_Maerz_${vol}.html`;
    console.log(`Fetching Mar Vol ${vol} Introduction...`);
    try {
      const html = await fetchPage(url);
      const text = extractText(html);
      await writeFile(join(outDir, `einleitung-mar-${vol.toLowerCase()}.txt`), text, 'utf-8');
      console.log(`  ${text.split(/\s+/).length} words`);
    } catch (e) { console.error(`  Error: ${e.message}`); }
    await sleep(DELAY_MS);
  }

  let totalWords = 0;
  for (let day = 1; day <= 31; day++) {
    const url = `${BASE_URL}/${day}.Maerz.html`;
    console.log(`Fetching Mar ${day}...`);
    try {
      const html = await fetchPage(url);
      const text = extractText(html);
      const words = text.split(/\s+/).length;
      totalWords += words;
      const dp = String(day).padStart(2, '0');
      const dayDir = join(outDir, `day-${dp}`);
      await mkdir(dayDir, { recursive: true });
      await writeFile(join(dayDir, `day-${dp}-full.txt`), text, 'utf-8');
      console.log(`  Mar ${day}: ${words} words`);
    } catch (e) { console.error(`  Error on Mar ${day}: ${e.message}`); }
    await sleep(DELAY_MS);
  }
  console.log(`\n=== Done === Total: ${totalWords} words`);
}

main().catch(e => { console.error(e); process.exit(1); });
