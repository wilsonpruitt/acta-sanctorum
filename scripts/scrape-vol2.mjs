/**
 * scrape-vol2.mjs — Scrape January Vol II (days 16-31) from heiligenlexikon.de
 *
 * Vol II pages have all text inline on each day page (not separate saint pages).
 * This scraper grabs the full Latin text from each day page plus the Vol II introduction.
 *
 * Usage: node scripts/scrape-vol2.mjs [--start N] [--end N]
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
const startDay = parseInt(args.find((_, i, a) => a[i - 1] === '--start') || '16');
const endDay = parseInt(args.find((_, i, a) => a[i - 1] === '--end') || '31');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

  // Try ID'd paragraphs first (PA0NNNNN pattern)
  const idParas = [];
  $('p[id]').each((_, el) => {
    const id = $(el).attr('id');
    if (id && /^PA\d+$/.test(id)) {
      const text = $(el).text().trim();
      if (text) idParas.push(text);
    }
  });

  if (idParas.length > 0) return idParas.join('\n\n');

  // Fallback: collect all <p> tags, skip navigation/UI paragraphs
  const paragraphs = [];
  let foundContent = false;
  $('p').each((_, el) => {
    const text = $(el).text().trim();
    // Skip empty and very short nav items
    if (!text || text.length < 3) return;
    // Skip known UI text
    if (text.startsWith('Ökumenisches') || text.startsWith('Spiritualität')) return;
    if (text.includes('cookie') || text.includes('JavaScript')) return;
    // Start collecting after we see Latin-looking text
    if (!foundContent && (text.match(/[A-Z]{3,}/) || text.match(/\b(SANCTORVM|Sanctorum|Capvt|sancti|beati)\b/i))) {
      foundContent = true;
    }
    if (foundContent) paragraphs.push(text);
  });

  return paragraphs.join('\n\n');
}

async function main() {
  // Create output directory
  const outDir = join(ROOT, 'src/latin/jan-vol2');
  await mkdir(outDir, { recursive: true });

  // Scrape the Vol II introduction
  console.log('Fetching Vol II Introduction...');
  try {
    const introHtml = await fetchPage(`${BASE_URL}/Einleitung_Januar_II.html`);
    const introText = extractText(introHtml);
    const introPath = join(outDir, 'einleitung.txt');
    await writeFile(introPath, introText, 'utf-8');
    console.log(`  Introduction: ${introText.length} chars, ${introText.split(/\s+/).length} words`);
  } catch (e) {
    console.error(`  Error fetching introduction: ${e.message}`);
  }
  await sleep(DELAY_MS);

  // Scrape the Vol II appendix
  console.log('Fetching Vol II Appendix...');
  try {
    const appHtml = await fetchPage(`${BASE_URL}/Anhang_Januar_II.html`);
    const appText = extractText(appHtml);
    const appPath = join(outDir, 'anhang.txt');
    await writeFile(appPath, appText, 'utf-8');
    console.log(`  Appendix: ${appText.length} chars, ${appText.split(/\s+/).length} words`);
  } catch (e) {
    console.error(`  Error fetching appendix: ${e.message}`);
  }
  await sleep(DELAY_MS);

  // Scrape each day page
  let totalWords = 0;
  for (let day = startDay; day <= endDay; day++) {
    const url = `${BASE_URL}/${day}.Januar.html`;
    console.log(`\nFetching day ${day}...`);

    try {
      const html = await fetchPage(url);
      const text = extractText(html);
      const words = text.split(/\s+/).length;
      totalWords += words;

      const dp = String(day).padStart(2, '0');
      const dayDir = join(outDir, `day-${dp}`);
      await mkdir(dayDir, { recursive: true });

      const outPath = join(dayDir, `day-${dp}-full.txt`);
      await writeFile(outPath, text, 'utf-8');

      console.log(`  Day ${day}: ${text.length} chars, ${words} words`);
    } catch (e) {
      console.error(`  Error on day ${day}: ${e.message}`);
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n=== Done ===`);
  console.log(`Total: ${totalWords} words across days ${startDay}-${endDay}`);
}

main().catch(e => { console.error(e); process.exit(1); });
