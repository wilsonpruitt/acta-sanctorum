/**
 * parse-propylaeum.mjs — Parse the Propylaeum Decembris supplement
 * to extract saint names for Nov 11 - Dec 31.
 *
 * The file has Roman date headings (III ID. NOV., XVIII KAL. DEC., etc.)
 * followed by numbered elogia [1], [2], [3]...
 * Each elogium is a short Latin martyrology entry.
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const INPUT = path.join(ROOT, 'devotional/nov11-dec31.txt');
const OUTPUT = path.join(ROOT, 'devotional/nov-dec-picks.csv');

// ── Roman date → modern date mapping ──
// November: Kal=1, Non=5, Id=13. December: Kal=1, Non=5, Id=13.
// KAL. DEC. = Dec 1, days before = counted from Dec 1 inclusively
function romanToDate(heading) {
  const h = heading.trim().replace(/\s+/g, ' ');

  // November Ides (Nov 13)
  if (h === 'ID. NOV.') return { month: 'November', day: 13 };
  if (h === 'PRID. ID. NOV.') return { month: 'November', day: 12 };
  const idNovMatch = h.match(/^([IVX]+) ID\. NOV\.$/);
  if (idNovMatch) {
    const n = romanToInt(idNovMatch[1]);
    return { month: 'November', day: 13 - (n - 1) }; // III = Nov 11
  }

  // December Kalends (Dec 1) — days before in November
  if (h === 'KAL. DEC.') return { month: 'December', day: 1 };
  if (h === 'PRID. KAL. DEC.') return { month: 'November', day: 30 };
  const kalDecMatch = h.match(/^([IVX]+) KAL\. DEC\.$/);
  if (kalDecMatch) {
    const n = romanToInt(kalDecMatch[1]);
    // II Kal Dec = Nov 30, III = Nov 29, etc.
    // Formula: Nov day = 32 - n
    return { month: 'November', day: 32 - n };
  }

  // December Nones (Dec 5)
  if (h === 'NON. DEC.') return { month: 'December', day: 5 };
  if (h === 'PRID. NON. DEC.') return { month: 'December', day: 4 };
  const nonDecMatch = h.match(/^([IVX]+) NON\. DEC\.$/);
  if (nonDecMatch) {
    const n = romanToInt(nonDecMatch[1]);
    return { month: 'December', day: 5 - (n - 1) };
  }

  // December Ides (Dec 13)
  if (h === 'ID. DEC.') return { month: 'December', day: 13 };
  if (h === 'PRID. ID. DEC.') return { month: 'December', day: 12 };
  const idDecMatch = h.match(/^([IVX]+) ID\. DEC\.$/);
  if (idDecMatch) {
    const n = romanToInt(idDecMatch[1]);
    return { month: 'December', day: 13 - (n - 1) };
  }

  // January Kalends (Jan 1) — days before in December
  if (h === 'KAL. IAN.') return { month: 'January', day: 1 };
  if (h === 'PRID. KAL. IAN.') return { month: 'December', day: 31 };
  const kalIanMatch = h.match(/^([IVX]+) KAL\. IAN\.$/);
  if (kalIanMatch) {
    const n = romanToInt(kalIanMatch[1]);
    // II Kal Jan = Dec 31, III = Dec 30, etc. Formula: Dec day = 33 - n
    return { month: 'December', day: 33 - n };
  }

  return null;
}

function romanToInt(r) {
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100 };
  let result = 0;
  for (let i = 0; i < r.length; i++) {
    const curr = map[r[i]];
    const next = map[r[i + 1]] || 0;
    result += (curr < next) ? -curr : curr;
  }
  return result;
}

// ── Latin name extraction ──
// Elogium patterns:
// "Turonis in Gallia natalis beati Martini episcopi et confessoris..."
// "Cotyaei in Phrygia insignis passio sancti Mennae Aegyptii militis..."
// "Ravennae sanctorum martyrum Valentini, Feliciani et Victorini..."

const LATIN_NAME_MAP = {
  'martini': 'Martin', 'mennae': 'Menas', 'valentini': 'Valentinus',
  'feliciani': 'Felician', 'victorini': 'Victorinus', 'athenodori': 'Athenodorus',
  'verani': 'Veranus', 'bartholomaei': 'Bartholomew', 'iohannis': 'John',
  'joannis': 'John', 'ioannis': 'John', 'petri': 'Peter', 'pauli': 'Paul',
  'jacobi': 'James', 'iacobi': 'James', 'philippi': 'Philip',
  'nicolai': 'Nicholas', 'ambrosii': 'Ambrose', 'augustini': 'Augustine',
  'benedicti': 'Benedict', 'bernardi': 'Bernard', 'gregorii': 'Gregory',
  'hieronymi': 'Jerome', 'dominici': 'Dominic', 'francisci': 'Francis',
  'ignatii': 'Ignatius', 'antonii': 'Anthony', 'thomae': 'Thomas',
  'andreae': 'Andrew', 'marci': 'Mark', 'matthaei': 'Matthew',
  'lucae': 'Luke', 'simonis': 'Simon', 'stephani': 'Stephen',
  'laurentii': 'Lawrence', 'clementis': 'Clement', 'cypriani': 'Cyprian',
  'athanasii': 'Athanasius', 'basilii': 'Basil', 'leonis': 'Leo',
  'caeciliae': 'Cecilia', 'agnetis': 'Agnes', 'agathae': 'Agatha',
  'luciae': 'Lucy', 'catharinae': 'Catherine', 'mariae': 'Mary',
  'barbarae': 'Barbara', 'apolloniae': 'Apollonia', 'scholasticae': 'Scholastica',
  'helenae': 'Helena', 'cunegundis': 'Cunegund', 'odiliae': 'Odilia',
  'ansberti': 'Ansbert', 'eligii': 'Eligius', 'sabae': 'Sabbas',
  'saturnini': 'Saturninus', 'chrysogoni': 'Chrysogonus', 'columbani': 'Columban',
  'lazari': 'Lazarus', 'damasi': 'Damasus', 'aurelii': 'Aurelius',
  'silvestri': 'Silvester', 'thomae apostoli': 'Thomas the Apostle',
  'stephani protomartyris': 'Stephen the Protomartyr',
  'iohannis evangelistae': 'John the Evangelist',
  'thomae becket': 'Thomas Becket', 'thomae cantuariensis': 'Thomas of Canterbury',
  'eusebii': 'Eusebius', 'silviae': 'Silvia', 'fidei': 'Faith',
  'gertrudis': 'Gertrude', 'edmundi': 'Edmund', 'elisabeth': 'Elizabeth',
  'caeciliae virginis': 'Cecilia', 'cecilia': 'Cecilia',
  'clementis papae': 'Clement (Pope)', 'chrysogoni martyris': 'Chrysogonus',
  'felicitatis': 'Felicity',
};

function latinNameToEnglish(latin) {
  const lower = latin.toLowerCase().trim().replace(/[,.;:]$/, '');
  if (LATIN_NAME_MAP[lower]) return LATIN_NAME_MAP[lower];

  // Strip common genitive endings to guess nominative
  let name = latin.trim().replace(/[,.;:]$/, '');
  name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  // Common Latin genitive → English: -i, -ii, -is, -ae, -orum
  // e.g. "Martini" → "Martin", "Cecilia" stays
  if (name.endsWith('ii')) name = name.slice(0, -2) + 'ius';
  else if (name.endsWith('i') && name.length > 3) name = name.slice(0, -1);
  else if (name.endsWith('is') && name.length > 4) name = name.slice(0, -2) + 'is';
  else if (name.endsWith('ae') && name.length > 3) name = name.slice(0, -2) + 'a';

  return name;
}

function extractSaintFromElogium(text) {
  // Try patterns in order of specificity
  const patterns = [
    // "natalis beati NAME episcopi/confessoris/martyris"
    /natalis\s+beati\s+([A-Z][a-zæœ]+(?:\s+[A-Z][a-zæœ]+)?)/,
    // "passio sancti NAME"
    /passio\s+sancti\s+([A-Z][a-zæœ]+(?:\s+[A-Z][a-zæœ]+)?)/,
    // "sanctorum martyrum NAME, NAME et NAME" — take first
    /sanctorum\s+martyrum\s+([A-Z][a-zæœ]+)/,
    // "depositio sancti NAME"
    /depositio\s+sancti\s+([A-Z][a-zæœ]+(?:\s+[A-Z][a-zæœ]+)?)/,
    // Generic "sancti NAME" or "sanctae NAME"
    /\bsanct[ia]e?\s+([A-Z][a-zæœ]+(?:\s+[A-Z][a-zæœ]+)?)/,
    // "beati NAME" or "beatae NAME"
    /\bbeat[ia]e?\s+([A-Z][a-zæœ]+(?:\s+[A-Z][a-zæœ]+)?)/,
    // "S. NAME" abbreviation
    /\bS\.\s+([A-Z][a-zæœ]+)/,
  ];

  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) return latinNameToEnglish(m[1]);
  }

  return null;
}

// ── Parse the file ──
function parse() {
  const text = fs.readFileSync(INPUT, 'utf-8');
  const lines = text.split('\n');

  const dayMap = new Map(); // key: "Month-Day", value: {saints: [], raw: []}
  let currentDate = null;
  let currentHeading = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Roman date heading?
    const date = romanToDate(trimmed);
    if (date) {
      currentDate = date;
      currentHeading = trimmed;
      const key = `${date.month}-${date.day}`;
      if (!dayMap.has(key)) dayMap.set(key, { saints: [], heading: currentHeading });
      continue;
    }

    // Skip NOVEMBRIS N and DECEMBRIS N section markers (these are commentary sections)
    if (/^(NOVEMBRIS|DECEMBRIS)\s+\d+$/.test(trimmed)) {
      currentDate = null; // exit elogia mode
      continue;
    }

    // In elogia mode, look for [N] entries
    if (currentDate && /^\[\d+\]/.test(trimmed)) {
      const elogium = trimmed.replace(/^\[\d+\]\s*/, '');
      const saint = extractSaintFromElogium(elogium);
      if (saint) {
        const key = `${currentDate.month}-${currentDate.day}`;
        dayMap.get(key).saints.push({ name: saint, elogium: elogium.slice(0, 150) });
      }
    }
  }

  return dayMap;
}

// ── Main ──
function main() {
  const dayMap = parse();

  // Build CSV output for Nov 11 - Dec 31
  const rows = ['Month,Day,Saint,Notes'];
  let found = 0;
  let missing = [];

  // Nov 11-30
  for (let d = 11; d <= 30; d++) {
    const key = `November-${d}`;
    const data = dayMap.get(key);
    if (data && data.saints.length > 0) {
      const saint = data.saints[0].name;
      const note = `${data.saints.length} elogia in Propylaeum`;
      rows.push(`November,${d},"${saint}","${note}"`);
      found++;
    } else {
      rows.push(`November,${d},"???","no data"`);
      missing.push(`Nov ${d}`);
    }
  }

  // Dec 1-31
  for (let d = 1; d <= 31; d++) {
    const key = `December-${d}`;
    const data = dayMap.get(key);
    if (data && data.saints.length > 0) {
      const saint = data.saints[0].name;
      const note = `${data.saints.length} elogia in Propylaeum`;
      rows.push(`December,${d},"${saint}","${note}"`);
      found++;
    } else {
      rows.push(`December,${d},"???","no data"`);
      missing.push(`Dec ${d}`);
    }
  }

  fs.writeFileSync(OUTPUT, rows.join('\n'), 'utf-8');
  console.log(`Wrote ${rows.length - 1} rows to ${OUTPUT}`);
  console.log(`Found: ${found} days with saints`);
  console.log(`Missing: ${missing.length} days (${missing.join(', ')})`);

  // Also print parsed date keys for debugging
  console.log('\nAll parsed dates:');
  const sorted = [...dayMap.keys()].sort();
  for (const k of sorted) {
    const d = dayMap.get(k);
    console.log(`  ${k}: ${d.heading} → ${d.saints.length} saints`);
  }
}

main();
