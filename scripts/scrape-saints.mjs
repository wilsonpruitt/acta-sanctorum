/**
 * scrape-saints.mjs — Scrape individual saint entries from heiligenlexikon.de
 *
 * 1. Fetches each day page (1.Januar.html through 31.Januar.html)
 * 2. Extracts all saint entry links (/ASJanuar/...)
 * 3. Fetches each saint page and extracts Latin text
 * 4. Saves to src/latin/jan-vol1/saints/ (days 1-15) or jan-vol2/saints/ (days 16-31)
 * 5. Writes a manifest for tracking
 *
 * Usage: node scripts/scrape-saints.mjs [--start N] [--end N] [--resume]
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { load } from 'cheerio';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BASE_URL = 'https://www.heiligenlexikon.de';
const DELAY_MS = 2000; // polite delay between requests
const MANIFEST_PATH = join(ROOT, 'src/data/jan-saints-manifest.json');

// Parse CLI args
const args = process.argv.slice(2);
const startDay = parseInt(args.find((_, i, a) => a[i - 1] === '--start') || '1');
const endDay = parseInt(args.find((_, i, a) => a[i - 1] === '--end') || '31');
const resume = args.includes('--resume');

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

function extractSaintLinks(html, dayUrl) {
  const $ = load(html);
  const links = [];

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.includes('ASJanuar/')) {
      const fullUrl = href.startsWith('http')
        ? href
        : new URL(href, dayUrl).href;
      const name = $(el).text().trim();
      if (name && !links.some(l => l.url === fullUrl)) {
        links.push({ name, url: fullUrl });
      }
    }
  });

  return links;
}

function extractLatinText(html) {
  const $ = load(html);

  // Remove nav, header, footer, scripts, styles
  $('nav, header, footer, .navigation, .menu, script, style, .kopf, .fuss').remove();

  // Try to find main content area
  const content = $('#inhalt, .inhalt, #content, .content, #main, article').first();
  const container = content.length ? content : $('body');

  // Extract paragraphs with structure
  const paragraphs = [];
  container.find('p, h1, h2, h3, h4, h5, h6, blockquote, li, pre, td').each((_, el) => {
    const tag = $(el).prop('tagName').toLowerCase();
    const text = $(el).text().trim();
    if (!text) return;
    // Skip very short nav-like text
    if (text.length < 3 && !tag.startsWith('h')) return;

    if (tag.startsWith('h')) {
      paragraphs.push(`\n${'#'.repeat(parseInt(tag[1]))} ${text}\n`);
    } else if (tag === 'blockquote') {
      paragraphs.push(`> ${text}`);
    } else if (tag === 'li') {
      paragraphs.push(`- ${text}`);
    } else if (tag === 'pre') {
      paragraphs.push(`\`\`\`\n${text}\n\`\`\``);
    } else {
      paragraphs.push(text);
    }
  });

  if (paragraphs.length === 0) {
    return container.text().trim();
  }

  return paragraphs.join('\n\n');
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[äæ]/g, 'ae').replace(/[öœ]/g, 'oe').replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

async function main() {
  // Load or create manifest
  let manifest;
  if (resume && existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf-8'));
    console.log(`Resuming from manifest with ${manifest.days.length} days tracked.`);
  } else {
    manifest = { days: [], saints: [], stats: { totalDays: 0, totalSaints: 0, scraped: 0 } };
  }

  for (let day = startDay; day <= endDay; day++) {
    const vol = day <= 15 ? 'jan-vol1' : 'jan-vol2';
    const dayDir = join(ROOT, 'src/latin', vol, 'saints', `day-${String(day).padStart(2, '0')}`);
    await mkdir(dayDir, { recursive: true });

    // Check if day already done
    const existingDay = manifest.days.find(d => d.day === day);
    if (existingDay && existingDay.status === 'done') {
      console.log(`  Day ${day}: already done (${existingDay.saintCount} saints), skipping.`);
      continue;
    }

    const dayUrl = `${BASE_URL}/ActaSanctorum/${day}.Januar.html`;
    console.log(`\n=== Day ${day} (${vol}) ===`);
    console.log(`  Fetching day page: ${dayUrl}`);

    let dayHtml;
    try {
      dayHtml = await fetchPage(dayUrl);
    } catch (err) {
      console.error(`  FAILED to fetch day ${day}: ${err.message}`);
      manifest.days.push({ day, vol, status: 'error', error: err.message });
      await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
      await sleep(DELAY_MS);
      continue;
    }

    // Save raw day page
    await writeFile(join(dayDir, `_day-${day}-index.html`), dayHtml);

    // Extract day page Latin text (the list of saints for that day)
    const dayText = extractLatinText(dayHtml);
    await writeFile(join(dayDir, `_day-${day}-index.md`), `---\nday: ${day}\nvolume: ${vol}\ntype: day-index\n---\n\n${dayText}\n`);

    // Extract saint links
    const saintLinks = extractSaintLinks(dayHtml, dayUrl);
    console.log(`  Found ${saintLinks.length} saint entries.`);

    const dayEntry = { day, vol, status: 'in-progress', saintCount: saintLinks.length, saints: [] };
    // Remove old entry if resuming
    manifest.days = manifest.days.filter(d => d.day !== day);
    manifest.days.push(dayEntry);

    await sleep(DELAY_MS);

    // Fetch each saint page
    for (let i = 0; i < saintLinks.length; i++) {
      const saint = saintLinks[i];
      const slug = slugify(saint.name);
      const filename = `${String(i + 1).padStart(2, '0')}-${slug}`;

      // Check if already scraped
      const existing = manifest.saints.find(s => s.url === saint.url);
      if (existing && existing.status === 'done') {
        console.log(`    [${i + 1}/${saintLinks.length}] ${saint.name} — already done, skipping.`);
        dayEntry.saints.push({ name: saint.name, url: saint.url, filename, status: 'done' });
        continue;
      }

      console.log(`    [${i + 1}/${saintLinks.length}] ${saint.name}...`);

      try {
        const saintHtml = await fetchPage(saint.url);
        const saintText = extractLatinText(saintHtml);
        const wordCount = saintText.split(/\s+/).length;

        // Save raw HTML
        await writeFile(join(dayDir, `${filename}.raw.html`), saintHtml);

        // Save extracted text
        const md = `---\nday: ${day}\nvolume: ${vol}\nname: "${saint.name}"\nurl: ${saint.url}\nwords: ${wordCount}\nscraped: ${new Date().toISOString()}\nstatus: scraped\n---\n\n${saintText}\n`;
        await writeFile(join(dayDir, `${filename}.md`), md);

        const saintEntry = { name: saint.name, url: saint.url, filename, words: wordCount, status: 'done' };
        dayEntry.saints.push(saintEntry);
        manifest.saints = manifest.saints.filter(s => s.url !== saint.url);
        manifest.saints.push(saintEntry);
        manifest.stats.scraped++;

        console.log(`      Saved: ${filename}.md (${wordCount} words)`);
      } catch (err) {
        console.error(`      FAILED: ${err.message}`);
        dayEntry.saints.push({ name: saint.name, url: saint.url, filename, status: 'error', error: err.message });
      }

      await sleep(DELAY_MS);
    }

    dayEntry.status = 'done';
    manifest.stats.totalDays++;
    manifest.stats.totalSaints += saintLinks.length;

    // Save manifest after each day
    await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`  Day ${day} complete: ${saintLinks.length} saints saved.`);
  }

  // Final manifest save
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`\n=== DONE ===`);
  console.log(`Days: ${manifest.stats.totalDays}`);
  console.log(`Saints: ${manifest.stats.totalSaints}`);
  console.log(`Scraped: ${manifest.stats.scraped}`);
  console.log(`Manifest: ${MANIFEST_PATH}`);
}

main().catch(err => {
  console.error('Scrape failed:', err);
  process.exit(1);
});
