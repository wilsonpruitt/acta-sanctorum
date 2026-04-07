/**
 * devotional-picks.mjs — Generate a CSV of one saint per day for a devotional book
 *
 * For Jan-Mar: picks from existing translated data
 * For Apr-Dec: scrapes saint lists from heiligenlexikon.de/ActaSanctorum
 *
 * Output: devotional/saints-picks.csv
 */

import fs from 'fs';
import path from 'path';
import { load } from 'cheerio';

const ROOT = path.resolve(import.meta.dirname, '..');
const SITE_DIR = path.join(ROOT, 'site');
const TRANS_DIR = path.join(ROOT, 'src/translations');
const OUT_DIR = path.join(ROOT, 'devotional');
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

// ── Notable saints to prefer (recognizable names for a devotional audience) ──
const PREFERRED = [
  // Universal calendar / well-known
  'genoveva', 'genevieve', 'basil', 'gregory', 'anthony', 'agnes', 'francis',
  'thomas aquinas', 'thomas', 'paul', 'peter', 'john', 'brigid', 'agatha',
  'scholastica', 'valentine', 'patrick', 'joseph', 'benedict', 'annunciation',
  'gabriel', 'joachim', 'eudocia', 'perpetua', 'felicity', 'colette',
  'edward', 'ansgar', 'blaise', 'dorothea', 'apollonia', 'cyril', 'methodius',
  'matthias', 'casimir', 'cuthbert', 'ambrose', 'catherine', 'francesca',
  'dominic', 'clare', 'augustine', 'fabian', 'sebastian', 'timothy',
  'polycarp', 'athanasius', 'hildegard', 'ignatius', 'maurus',
  'marcellus', 'prisca', 'wulfstan', 'adalhard',
  'euthymius', 'simeon', 'ephrem', 'jerome', 'martin', 'lawrence',
  'cecilia', 'andrew', 'stephen', 'lucy', 'nicholas', 'mary magdalene',
  'michael', 'raphael', 'barnabas', 'bartholomew', 'matthew', 'mark', 'luke',
  'philip', 'james', 'simon', 'jude', 'matilda', 'oldegar',
  'gregory the great', 'photina', 'joseph of arimathea',
];

function preferenceScore(name) {
  const lower = name.toLowerCase();
  for (let i = 0; i < PREFERRED.length; i++) {
    if (lower.includes(PREFERRED[i])) return 1000 - i; // higher = better
  }
  // Prefer saints with longer entries (more material to summarize)
  return 0;
}

// ── Jan/Feb: pick from site saint pages ──
function pickFromSite(monthDir, monthName, dayCount) {
  const picks = [];
  for (let d = 1; d <= dayCount; d++) {
    const dp = String(d).padStart(2, '0');
    const dayDir = path.join(SITE_DIR, monthDir, `day-${dp}`);
    if (!fs.existsSync(dayDir)) { picks.push({ day: d, month: monthName, saint: '???', note: 'no data' }); continue; }

    const files = fs.readdirSync(dayDir).filter(f => f.endsWith('.html') && f !== 'index.html');
    if (files.length === 0) { picks.push({ day: d, month: monthName, saint: '???', note: 'empty' }); continue; }

    // Score each saint
    let best = null;
    let bestScore = -1;
    for (const file of files) {
      const slug = file.replace('.html', '');
      const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const score = preferenceScore(name);
      // Also factor in file size as proxy for entry length
      const stat = fs.statSync(path.join(dayDir, file));
      const sizeScore = Math.min(stat.size / 10000, 5); // up to 5 bonus points for large entries
      const total = score + sizeScore;
      if (total > bestScore) {
        bestScore = total;
        best = { slug, name, size: stat.size };
      }
    }

    picks.push({
      day: d,
      month: monthName,
      saint: best.name,
      note: `${files.length} options, ${Math.round(best.size / 1024)}kb`,
    });
  }
  return picks;
}

// ── March: pick from chunk content ──
function pickFromMarch() {
  const picks = [];
  for (let d = 1; d <= 31; d++) {
    const dp = String(d).padStart(2, '0');
    const dayDir = path.join(TRANS_DIR, 'mar', `day-${dp}`);
    if (!fs.existsSync(dayDir)) { picks.push({ day: d, month: 'March', saint: '???', note: 'no data' }); continue; }

    // Read chunk 0000 to get the saint list
    const chunk0 = path.join(dayDir, `0000-mar-day-${dp}.md`);
    if (!fs.existsSync(chunk0)) { picks.push({ day: d, month: 'March', saint: '???', note: 'no chunk 0' }); continue; }

    const text = fs.readFileSync(chunk0, 'utf-8');
    const lines = text.split('\n');

    // Extract saint/blessed names
    const saints = [];
    for (const line of lines) {
      const t = line.trim();
      if ((t.startsWith('Saint ') || t.startsWith('Blessed ') || t.startsWith('The Holy') || t.startsWith('Holy ')) && t.length > 10 && t.length < 250) {
        saints.push(t.replace(/[.,;:]$/, '').trim());
      }
    }

    // Also scan for CONCERNING headings deeper in the chunks
    const allFiles = fs.readdirSync(dayDir).filter(f => f.endsWith('.md')).sort();
    const headings = [];
    for (const file of allFiles.slice(0, 5)) { // just first few chunks for speed
      const content = fs.readFileSync(path.join(dayDir, file), 'utf-8');
      for (const line of content.split('\n')) {
        const t = line.trim();
        if (/^(CONCERNING|ON) (ST\.|STS\.|SAINT|BLESSED|THE HOLY)/i.test(t)) {
          headings.push(t);
        }
      }
    }

    // Pick the best
    const allCandidates = [...saints, ...headings];
    let best = saints[0] || headings[0] || '???';
    let bestScore = -1;
    for (const c of allCandidates) {
      const score = preferenceScore(c);
      if (score > bestScore) { bestScore = score; best = c; }
    }

    // Clean up the name
    best = best
      .replace(/^(Saint|Blessed|Holy|The Holy)\s+/i, 'St. ')
      .replace(/^(CONCERNING|ON)\s+(ST\.|STS\.|SAINT|BLESSED|THE HOLY)\s+/i, 'St. ')
      .replace(/,\s*(Martyr|Bishop|Confessor|Virgin|Abbot|Pope|Deacon|Presbyter|Archbishop).*$/i, '')
      .trim();

    picks.push({
      day: d,
      month: 'March',
      saint: best,
      note: `${saints.length} listed, ${allFiles.length} chunks`,
    });
  }
  return picks;
}

// ── Apr-Dec: scrape from Heiligenlexikon ──
const GERMAN_MONTHS = {
  4: 'April', 5: 'Mai', 6: 'Juni', 7: 'Juli',
  8: 'August', 9: 'September', 10: 'Oktober', 11: 'November', 12: 'Dezember',
};
const ENGLISH_MONTHS = {
  4: 'April', 5: 'May', 6: 'June', 7: 'July',
  8: 'August', 9: 'September', 10: 'October', 11: 'November', 12: 'December',
};
const DAYS_IN_MONTH = {
  4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31,
};

// ── Latin ablative → nominative approximate mapping ──
const LATIN_TO_ENGLISH = {
  'ctesiphonte': 'Ctesiphon', 'venantio': 'Venantius', 'melitone': 'Meliton',
  'prvdentio': 'Prudentius', 'macario': 'Macarius', 'ingeniana': 'Ingeniana',
  'victore': 'Victor', 'stephano': 'Stephen', 'basilide': 'Basilides',
  'gerontio': 'Gerontius', 'walarico': 'Walaricus', 'hugone': 'Hugh',
  'gilberto': 'Gilbert', 'francisco': 'Francis', 'antonio': 'Anthony',
  'ambrosio': 'Ambrose', 'augustino': 'Augustine', 'benedicto': 'Benedict',
  'bernardo': 'Bernard', 'gregorio': 'Gregory', 'ioanne': 'John',
  'joanne': 'John', 'jacobo': 'James', 'josepho': 'Joseph',
  'nicolao': 'Nicholas', 'petro': 'Peter', 'paulo': 'Paul',
  'marco': 'Mark', 'luca': 'Luke', 'matthaeo': 'Matthew',
  'simone': 'Simon', 'thoma': 'Thomas', 'andrea': 'Andrew',
  'philippo': 'Philip', 'bartholomaeo': 'Bartholomew',
  'laurentio': 'Lawrence', 'martino': 'Martin', 'patricio': 'Patrick',
  'georgio': 'George', 'michaele': 'Michael', 'raphaele': 'Raphael',
  'gabriele': 'Gabriel', 'hieronymo': 'Jerome', 'dominico': 'Dominic',
  'ignatio': 'Ignatius', 'catharina': 'Catherine', 'agnes': 'Agnes',
  'maria': 'Mary', 'brigida': 'Brigid', 'clara': 'Clare',
  'dorothea': 'Dorothy', 'caecilia': 'Cecilia', 'lucia': 'Lucy',
  'agatha': 'Agatha', 'apollonia': 'Apollonia', 'perpetua': 'Perpetua',
  'felicitate': 'Felicity', 'scholastica': 'Scholastica',
  'matilde': 'Matilda', 'hedwige': 'Hedwig', 'theresia': 'Teresa',
  'cunegunde': 'Cunegund', 'radegunde': 'Radegund',
  'hilario': 'Hilary', 'athanasio': 'Athanasius', 'basilio': 'Basil',
  'chrysostomo': 'Chrysostom', 'leone': 'Leo', 'pio': 'Pius',
  'clemente': 'Clement', 'cornelio': 'Cornelius', 'cypriano': 'Cyprian',
  'fabiano': 'Fabian', 'sebastiano': 'Sebastian', 'valentino': 'Valentine',
  'blasio': 'Blaise', 'cyrillo': 'Cyril', 'methodio': 'Methodius',
  'casimiro': 'Casimir', 'cuthberto': 'Cuthbert', 'edwardo': 'Edward',
  'euthymio': 'Euthymius', 'alexandro': 'Alexander',
};

function latinToEnglish(raw) {
  const lower = raw.toLowerCase().replace(/[,.\s]+$/, '').trim();
  if (LATIN_TO_ENGLISH[lower]) return LATIN_TO_ENGLISH[lower];

  // Simple heuristic: strip common Latin endings
  let name = raw.replace(/[,.\s]+$/, '').trim();
  // Title case
  name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  // Common ablative → nominative
  name = name.replace(/one$/, 'o').replace(/io$/, 'ius').replace(/nte$/, 'ns');
  return name;
}

/** Extract saint names from Latin text of a Heiligenlexikon page */
function extractSaintNames(html) {
  const $ = load(html);
  const allText = $('body').text();
  const saints = [];

  // "DE S." and "DE SS." headings mark the major saint entries
  const dePattern = /DE\s+S[S]?\.\s+([A-Z][A-Z\s,]+?)(?:\.\s|\.\n|,\s+(?:EPISC|MART|CONF|VIRG|ABB|PRESB|DIAC|APOST|PAPA|MONACHO|EREMITA))/g;
  let m;
  while ((m = dePattern.exec(allText)) !== null) {
    const raw = m[1].trim().split(/[,\s]+/)[0]; // first word = name
    const english = latinToEnglish(raw);
    if (english.length > 2) saints.push(english);
  }

  // Fallback: broader DE S. pattern if nothing found
  if (saints.length === 0) {
    const fallback = /DE\s+S[S]?\.\s+([A-Z][A-Z]+)/g;
    while ((m = fallback.exec(allText)) !== null) {
      const raw = m[1];
      const english = latinToEnglish(raw);
      if (english.length > 2) saints.push(english);
    }
  }

  // Also try "DE B." for Blessed
  const bPattern = /DE\s+B\.\s+([A-Z][A-Z\s,]+?)(?:\.\s|\.\n|,\s+(?:EPISC|MART|CONF|VIRG|ABB))/g;
  while ((m = bPattern.exec(allText)) !== null) {
    const raw = m[1].trim().split(/[,\s]+/)[0];
    const english = 'Bl. ' + latinToEnglish(raw);
    if (english.length > 5) saints.push(english);
  }

  return [...new Set(saints)];
}

async function scrapeMonth(monthNum) {
  const germanMonth = GERMAN_MONTHS[monthNum];
  const englishMonth = ENGLISH_MONTHS[monthNum];
  const dayCount = DAYS_IN_MONTH[monthNum];
  const picks = [];

  for (let d = 1; d <= dayCount; d++) {
    const url = `${BASE_URL}/${d}.${germanMonth}.html`;
    console.log(`  Fetching ${englishMonth} ${d}...`);

    try {
      const html = await fetchPage(url);
      const saints = extractSaintNames(html);

      // Pick the best one using preference scoring
      let best = saints[0] || '???';
      let bestScore = -1;
      for (const name of saints) {
        const score = preferenceScore(name);
        if (score > bestScore) { bestScore = score; best = name; }
      }

      picks.push({
        day: d,
        month: englishMonth,
        saint: best,
        note: `${saints.length} saints on page`,
      });
    } catch (e) {
      console.error(`  Error ${englishMonth} ${d}: ${e.message}`);
      picks.push({
        day: d,
        month: englishMonth,
        saint: '???',
        note: `error: ${e.message}`,
      });
    }

    await sleep(DELAY_MS);
  }

  return picks;
}

// ── Main ──
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const allPicks = [];

  // January
  console.log('Picking January saints...');
  allPicks.push(...pickFromSite('january', 'January', 31));

  // February
  console.log('Picking February saints...');
  allPicks.push(...pickFromSite('february', 'February', 29));

  // March
  console.log('Picking March saints...');
  allPicks.push(...pickFromMarch());

  // April - December
  for (let m = 4; m <= 12; m++) {
    console.log(`Scraping ${ENGLISH_MONTHS[m]}...`);
    allPicks.push(...await scrapeMonth(m));
  }

  // Write CSV
  const csv = ['Month,Day,Saint,Notes'];
  for (const p of allPicks) {
    const saint = p.saint.replace(/"/g, '""');
    const note = (p.note || '').replace(/"/g, '""');
    csv.push(`${p.month},${p.day},"${saint}","${note}"`);
  }

  const csvPath = path.join(OUT_DIR, 'saints-picks.csv');
  fs.writeFileSync(csvPath, csv.join('\n'), 'utf-8');
  console.log(`\nWrote ${allPicks.length} entries to ${csvPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
