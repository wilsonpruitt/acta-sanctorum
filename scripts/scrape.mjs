/**
 * scrape.mjs — Fetch Acta Sanctorum pages from heiligenlexikon.de
 *
 * Reads page URLs from src/data/jan-vol1-pages.json,
 * fetches each page, extracts the Latin text content,
 * and saves raw HTML + extracted text to src/latin/jan-vol1/
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { load } from 'cheerio';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PAGES_FILE = join(ROOT, 'src/data/jan-vol1-pages.json');
const RAW_DIR = join(ROOT, 'src/latin/jan-vol1');
const DELAY_MS = 2000; // be polite to the server

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPage(url) {
  console.log(`  Fetching: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function extractText(html) {
  const $ = load(html);

  // Remove navigation, headers, footers
  $('nav, header, footer, .navigation, .menu, script, style').remove();

  // The main content area — adjust selector based on actual site structure
  // Try common content selectors; fall back to body
  const content = $('#content, .content, #main, .main, article').first();
  const container = content.length ? content : $('body');

  // Get text with paragraph breaks preserved
  const paragraphs = [];
  container.find('p, h1, h2, h3, h4, h5, h6, blockquote, li').each((_, el) => {
    const tag = $(el).prop('tagName').toLowerCase();
    const text = $(el).text().trim();
    if (!text) return;

    if (tag.startsWith('h')) {
      paragraphs.push(`\n${'#'.repeat(parseInt(tag[1]))} ${text}\n`);
    } else if (tag === 'blockquote') {
      paragraphs.push(`> ${text}`);
    } else if (tag === 'li') {
      paragraphs.push(`- ${text}`);
    } else {
      paragraphs.push(text);
    }
  });

  // If no structured elements found, fall back to full text
  if (paragraphs.length === 0) {
    return container.text().trim();
  }

  return paragraphs.join('\n\n');
}

async function main() {
  const pagesData = JSON.parse(await readFile(PAGES_FILE, 'utf-8'));
  await mkdir(RAW_DIR, { recursive: true });

  let fetched = 0;
  for (const page of pagesData.pages) {
    if (page.status === 'scraped') {
      console.log(`  Skipping (already scraped): ${page.id}`);
      continue;
    }

    const html = await fetchPage(page.url);

    // Save raw HTML for reference
    await writeFile(join(RAW_DIR, `${page.id}.raw.html`), html);

    // Extract and save text
    const text = extractText(html);
    const md = `---\nid: ${page.id}\ntitle: "${page.title}"\nsource: ${page.url}\nscraped: ${new Date().toISOString()}\n---\n\n${text}\n`;
    await writeFile(join(RAW_DIR, `${page.id}.md`), md);

    page.status = 'scraped';
    fetched++;

    console.log(`  Saved: ${page.id}.md (${text.length} chars)`);

    if (fetched < pagesData.pages.length) {
      await sleep(DELAY_MS);
    }
  }

  // Update status in pages file
  await writeFile(PAGES_FILE, JSON.stringify(pagesData, null, 2) + '\n');
  console.log(`\nDone. Scraped ${fetched} page(s).`);
}

main().catch(err => {
  console.error('Scrape failed:', err);
  process.exit(1);
});
