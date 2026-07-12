// Usage: node scripts/scrape-index-day.mjs <slug> <german> <day> [asDir]
//   slug    short month name (e.g. jun)
//   german  German month name in heiligenlexikon URLs (e.g. Juni)
//   day     day number (e.g. 1)
//   asDir   article subdir on heiligenlexikon (default: AS<german>, e.g. ASJuni)
//
// WHY THIS EXISTS: For most days, the day-index page <day>.<german>.html on
// heiligenlexikon.de contains the FULL inline Acta text, so scrape-month.mjs
// captures everything. But the FIRST day(s) of a volume (June 1 & 2) are
// "index-only": the day page is just the martyrology name-list + praetermissi
// notes, and the actual vitae/passiones/commentary live on separate linked
// article pages under /<asDir>/*.html. scrape-month.mjs only fetches the day
// page, so those days came out as tiny 2-chunk stubs. This script fixes such a
// day by (1) keeping the cleaned name-list as the header and (2) following the
// article links and appending each article's body + lettered footnotes.
//
// Output: overwrites src/latin/<slug>/day-NN/day-NN-full.txt. Re-chunk after
// with: node scripts/chunk-month.mjs <slug>  (or chunk just this day).

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BASE = 'https://www.heiligenlexikon.de/ActaSanctorum';
const HOST = 'https://www.heiligenlexikon.de';
const DELAY_MS = 2000;

const [slug, german, dayArg, asDirArg] = process.argv.slice(2);
if (!slug || !german || !dayArg) {
  console.error('Usage: node scripts/scrape-index-day.mjs <slug> <german> <day> [asDir]');
  process.exit(1);
}
const day = Number(dayArg);
const dp = String(day).padStart(2, '0');
const asDir = asDirArg || `AS${german}`;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

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

// German site chrome / navigation that must never reach the Latin source.
const CHROME = /^(Heiligenlexikon|Einleitung |Band |Anhang |Unterstützung f|Seite zum Ausdruck|Im Heiligenlexikon suchen|Impressum|Empfehlung|Fragen\?|Kommentar|Unser Reise-Blog|Reisen zu den Orten|Suche)/i;
const CHROME_SUB = /(Reise-Blog|USB-Stick|Datenschutz|Ökumenisch|unsere FAQ)/i;
const isChrome = (t) => CHROME.test(t) || CHROME_SUB.test(t);

// Pull the content paragraphs (body + lettered footnotes) from an article page,
// in document order, one normalised line per <p>, dropping chrome and the
// repeated "Acta Sanctorum der Bollandisten" page header.
function extractArticle(html) {
  const $ = load(html);
  const out = [];
  $('p').each((_, el) => {
    let t = $(el).text().replace(/\s+/g, ' ').trim();
    if (!t || t.length < 3) return;
    if (t === 'Acta Sanctorum der Bollandisten') return;
    if (isChrome(t)) return;
    out.push(t);
  });
  return out.join('\n\n');
}

// Build the day header (martyrology name-list + praetermissi notes) from the
// index page itself. Deriving it from the live page — rather than from the
// existing day-NN-full.txt — keeps re-runs idempotent (re-running never doubles
// content by treating prior output as the header).
function extractHeader(indexHtml) {
  return extractArticle(indexHtml);
}

async function main() {
  const indexUrl = `${BASE}/${day}.${german}.html`;
  console.log(`Fetching index ${indexUrl} ...`);
  const indexHtml = await fetchPage(indexUrl);
  const $ = load(indexHtml);

  // Collect links to the per-saint article pages, in document order, deduped.
  const links = [];
  const seen = new Set();
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (!new RegExp(`/${asDir}/`).test(href)) return;
    const file = href.split('/').pop();
    const url = `${HOST}/${asDir}/${file}`;
    if (seen.has(url)) return;
    seen.add(url);
    links.push({ url, text: $(el).text().trim() });
  });
  console.log(`Found ${links.length} article links under /${asDir}/`);

  const parts = [];
  const header = extractHeader(indexHtml);
  if (header) parts.push(header);

  let ok = 0, fail = 0;
  for (const { url, text } of links) {
    await sleep(DELAY_MS);
    try {
      const html = await fetchPage(url);
      const body = extractArticle(html);
      const words = body.split(/\s+/).filter(Boolean).length;
      if (words < 20) { console.log(`  SHORT (${words}w) ${text} <${url}>`); }
      // Inject a saint-boundary header so split-saints.mjs can later carve this
      // day into per-saint entries. Concatenated article pages have no inline
      // "DE S." headers (unlike the normal day pages), so without this the day
      // splits into 0 saints. "DE S. <name>" is recognised by isSaintBoundary()
      // and renders to "On/Concerning St. <name>" after translation.
      const name = text.replace(/^Acta Sanctorum:\s*/i, '').trim();
      parts.push(`DE S. ${name}\n\n${body}`);
      ok++;
      console.log(`  + ${text}: ${words} words`);
    } catch (e) {
      fail++;
      console.error(`  ! ${text} <${url}>: ${e.message}`);
    }
  }

  const full = parts.join('\n\n');
  const outPath = join(ROOT, `src/latin/${slug}/day-${dp}/day-${dp}-full.txt`);
  await writeFile(outPath, full, 'utf-8');
  console.log(`\nWrote ${outPath}: ${full.split(/\s+/).filter(Boolean).length} words (${ok} articles, ${fail} failed)`);
}

main().catch(e => { console.error(e); process.exit(1); });
