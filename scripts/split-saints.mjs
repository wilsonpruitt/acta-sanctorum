/**
 * split-saints.mjs — Split day-level translations into individual saint entries
 *
 * Detects saint boundaries from "ON ST.", "ON STS.", "ON THE HOLY" headers
 * and splits each day's assembled text into separate saint files.
 *
 * Usage: node scripts/split-saints.mjs --source feb/day-16 [--dry-run]
 *        node scripts/split-saints.mjs --all-feb [--dry-run]
 *        node scripts/split-saints.mjs --all-jan-vol2 [--dry-run]
 *        node scripts/split-saints.mjs --all-mar [--dry-run]
 *        node scripts/split-saints.mjs --all-apr [--dry-run]
 *        node scripts/split-saints.mjs --all-may [--dry-run]
 *        node scripts/split-saints.mjs --all-jun [--dry-run]
 */

import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TRANS_DIR = join(ROOT, 'src/translations');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const source = args.find((_, i, a) => a[i - 1] === '--source');
const allFeb = args.includes('--all-feb');
const allJanV2 = args.includes('--all-jan-vol2');
const allMar = args.includes('--all-mar');
const allApr = args.includes('--all-apr');
const allMay = args.includes('--all-may');
const allJun = args.includes('--all-jun');
const allJul = args.includes('--all-jul');
const allAug = args.includes('--all-aug');

/**
 * Remove byte-identical duplicate paragraph blocks within a saint's text.
 * Blocks are separated by blank lines; a block is dropped if an earlier block
 * has the same normalized text and that normalized text is >= 80 chars (long
 * enough that a coincidental legitimate repeat is effectively impossible).
 * Keeps the first occurrence. Inline [margin notes] are ignored when comparing.
 */
function dedupeBlocks(text) {
  const blocks = text.split(/\n\s*\n/);
  const seen = new Set();
  const out = [];
  for (const block of blocks) {
    const key = block.replace(/\[[^\]]*\]/g, ' ').toLowerCase().replace(/[^a-z]/g, '');
    if (key.length >= 80 && seen.has(key)) continue; // drop duplicate
    if (key.length >= 80) seen.add(key);
    out.push(block);
  }
  return out.join('\n\n');
}

/** Detect if a line is a saint entry boundary */
function isSaintBoundary(line) {
  const t = line.trim();
  // Lower bound rejects stray short lines. The upper bound is only a sanity
  // ceiling: real entry headers can run long when they enumerate a martyr
  // group inline (e.g. "ON THE HOLY MARTYRS OF GORCUM: NICHOLAS PICHIUS …" —
  // 756 chars, listing all nineteen). The old 300-char cap silently rejected
  // such headers, merging the whole group into the previous saint. False
  // positives are prevented by the anchored, case-sensitive patterns below,
  // not by this length limit.
  if (t.length < 10 || t.length > 2000) return false;

  // The opening keyword ("ON"/"CONCERNING"/"DE") and the honorific must be
  // UPPERCASE — real entry headers read "ON ST. …", "CONCERNING SS. …",
  // "DE S. …". Matching these case-sensitively rejects line-wrapped prose that
  // merely begins with a lowercase "on the holy …" (e.g. "a sermon on the holy
  // Nun-Martyr Theodosia: copied from a Codex Vatican") — the bug the old
  // blanket ALL-CAPS check was guarding against — while still allowing the
  // saint NAME after the honorific to be title-cased. Some months' translators
  // wrote "ON ST. Quintus" rather than the all-caps "ON ST. QUINTUS"; the old
  // check silently dropped every such header, collapsing a whole day into one
  // giant mis-merged entry.

  // Honorific prefixes that open a saint entry. Besides ST./STS./SAINT we must
  // also catch abbreviated "S."/"SS.", Blessed ("B."/"BB."/"BL."/"BLESSED") and
  // Venerable ("VEN."/"VENERABLE") forms — otherwise those entries (e.g.
  // "ON B. ÆMILIANA…", "ON S. PETER CÆLESTINE") are missed and accrete into the
  // previous saint, producing giant mis-merged pages.
  const HONORIFIC = '(ST\\.|STS\\.|S\\.|SS\\.|SAINT|SAINTS|B\\.|BB\\.|BL\\.|BLESSED|VEN\\.|VENERABLE|THE HOLY|THE BLESSED)';

  // "ON ST. NAME" / "ON B. NAME" / "ON THE HOLY ..." etc. (case-sensitive prefix)
  if (new RegExp(`^ON ${HONORIFIC} `).test(t)) return true;

  // "CONCERNING ST." / "CONCERNING THE HOLY" etc.
  if (new RegExp(`^CONCERNING ${HONORIFIC} `).test(t)) return true;

  // "DE S." or "DE SS." (Latin)
  if (/^DE S[S]?\. /.test(t)) return true;

  // NOTE: "LIFE OF", "ACTS OF", "MIRACLES OF", "TRANSLATION OF", "HISTORY OF"
  // are NOT treated as new saint boundaries — they are sub-sections within
  // an existing saint's entry. Only "ON ST." / "CONCERNING" / "DE S." patterns
  // start a new saint entry.

  return false;
}

/** Extract a saint name from a boundary line */
function extractSaintName(line) {
  let name = line.trim();
  // Remove all known prefixes
  name = name.replace(/^(ON |CONCERNING |DE |LIFE OF |ACTS OF |PASSION OF |MARTYRDOM OF |TRANSLATION OF |MIRACLES OF |HISTORY OF )(ST\.|STS\.|SS\.|S\.|SAINT |SAINTS |BLESSED |B\. |BB\. |BL\. |VEN\. |VENERABLE |THE HOLY |THE BLESSED |THE MARTYRDOM |THE PASSION |THE TRANSLATION |THE FINDING |THE DISCOVERY |THE )\s*/i, '');
  // Clean up remaining honorific prefix from patterns like "ACTS OF THE MARTYRDOM OF ST. X"
  name = name.replace(/^(ST\.|STS\.|SS\.|S\.|SAINT |SAINTS |BLESSED |B\. |BB\. |BL\. |VEN\. |VENERABLE )\s*/i, '');
  // Cut author/provenance attribution that runs onto the name without a comma,
  // e.g. "ADALBERT FROM A MONK OF TRIER…" → "ADALBERT", "JUDE THE APOSTLE FROM
  // THE LXXII DISCIPLES" → "JUDE THE APOSTLE".
  name = name.replace(/\s+(FROM|BY|WRITTEN BY|AUTHORE|EX)\s+.*$/i, '');
  // Cut inline group enumerations: a colon or semicolon separates the group
  // name from the list of individuals ("MARTYRS OF GORCUM: NICHOLAS PICHIUS
  // …; HIERONYMUS …" → "Martyrs of Gorcum").
  name = name.split(/[:;]/)[0].trim();
  // Remove trailing period
  name = name.replace(/\.\s*$/, '');
  // Remove location info after comma (keep first part)
  // e.g. "JULIANA, VIRGIN OF NICOMEDIA AND MARTYR, AT BRUSSELS" → "Juliana"
  // But keep compound names like "FAUSTINIANUS AND IUVENTIA".
  // Skip when the name starts with a digit so thousands separators in numbers
  // like "16,000 Soldiers" are not mistaken for a location comma.
  if (!/^\d/.test(name)) {
    const parts = name.split(',');
    name = parts[0].trim();
  }
  // Title case, preserving Roman numerals
  name = name.split(' ').map(w => {
    if (['AND', 'OF', 'THE', 'AT', 'IN', 'OR'].includes(w)) return w.toLowerCase();
    // Keep Roman numerals uppercase
    if (/^[IVXLCDM]+\.?$/.test(w)) return w.replace('.', '');
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(' ');
  // German → English
  name = name.replace(/ von /g, ' of ');
  name = name.replace(/ und /g, ' and ');
  name = name.replace(/ der /g, ' the ');
  name = name.replace(/ die /g, ' the ');
  return name;
}

function slugify(name) {
  const lig = { 'æ': 'ae', 'œ': 'oe', 'ø': 'o', 'ß': 'ss', 'ð': 'd', 'þ': 'th' };
  return name.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')     // strip combining accents (é→e)
    .replace(/[æœøßðþ]/g, (c) => lig[c] || c)              // transliterate ligatures (æ→ae)
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Split a day's translations into saint entries */
async function splitDay(basePath) {
  const transDir = join(TRANS_DIR, basePath);
  if (!existsSync(transDir)) {
    console.log(`  ${basePath}: no translations found, skipping`);
    return 0;
  }

  const files = (await readdir(transDir)).filter(f => f.endsWith('.md')).sort();
  if (files.length === 0) return 0;

  // Read all chunks and assemble
  let fullText = '';
  for (const file of files) {
    const content = await readFile(join(transDir, file), 'utf-8');
    const cleaned = content.replace(/^<!--[\s\S]*?-->\n*/g, '');
    const fmMatch = cleaned.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
    const body = fmMatch ? fmMatch[1] : cleaned;
    fullText += body + '\n\n';
  }

  // Split at saint boundaries
  const lines = fullText.split('\n');
  const saints = [];
  let currentSaint = null;
  let currentLines = [];
  let preambleLines = [];

  for (const line of lines) {
    if (isSaintBoundary(line.trim())) {
      // Save previous saint
      if (currentSaint) {
        saints.push({ name: currentSaint, slug: slugify(currentSaint), text: currentLines.join('\n') });
      } else if (currentLines.some(l => l.trim())) {
        preambleLines = currentLines;
      }
      currentSaint = extractSaintName(line.trim());
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }
  // Save last saint
  if (currentSaint) {
    saints.push({ name: currentSaint, slug: slugify(currentSaint), text: currentLines.join('\n') });
  }

  // Merge consecutive entries with the same saint name
  const merged = [];
  for (const s of saints) {
    const prev = merged.length > 0 ? merged[merged.length - 1] : null;
    if (prev && prev.slug === s.slug) {
      // Same saint — merge text
      prev.text += '\n\n' + s.text;
    } else {
      merged.push(s);
    }
  }

  // Absorb tiny entries (<200 words) into the previous entry
  const final = [];
  for (const s of merged) {
    const words = s.text.split(/\s+/).length;
    const prev = final.length > 0 ? final[final.length - 1] : null;
    if (prev && words < 200) {
      prev.text += '\n\n' + s.text;
    } else {
      final.push(s);
    }
  }

  // Remove byte-identical duplicate paragraph blocks within each saint.
  // Guards against the duplicate-translation artifact (a passage emitted twice
  // by the translation agent, or duplicated during chunk/part merging). Only
  // long blocks (>=80 normalized chars) are deduped, so a commentary [1] and a
  // Life [1] — which differ in wording — are never collapsed; keeps first.
  for (const s of final) s.text = dedupeBlocks(s.text);
  const saints2 = final;

  // Extract day number from basePath
  const dayMatch = basePath.match(/day-(\d+)/);
  const dayNum = dayMatch ? parseInt(dayMatch[1]) : 0;

  if (dryRun) {
    console.log(`  ${basePath}: ${saints2.length} saints found:`);
    for (const s of saints2) {
      const words = s.text.split(/\s+/).length;
      console.log(`    - ${s.name} (${s.slug}) — ${words} words`);
    }
    return saints2.length;
  }

  // Write saint files
  const saintsDir = join(transDir, 'saints');
  await mkdir(saintsDir, { recursive: true });
  // Clear stale saint files first — re-runs can change slugs (e.g. after a
  // re-scrape), and writing by index+slug would otherwise leave orphans behind.
  for (const f of await readdir(saintsDir)) {
    if (f.endsWith('.md')) await rm(join(saintsDir, f));
  }

  for (let i = 0; i < saints2.length; i++) {
    const s = saints2[i];
    const num = String(i).padStart(4, '0');
    const filename = `${num}-${s.slug}.md`;
    const content = `---\nday: ${dayNum}\nsaint: "${s.name}"\nslug: "${s.slug}"\nstatus: translated\n---\n\n${s.text}`;
    await writeFile(join(saintsDir, filename), content, 'utf-8');
  }

  if (preambleLines.some(l => l.trim())) {
    await writeFile(join(saintsDir, '0000-preamble.md'),
      `---\nday: ${dayNum}\nsaint: "Day ${dayNum} Preamble"\nslug: "preamble"\nstatus: translated\n---\n\n${preambleLines.join('\n')}`,
      'utf-8');
  }

  console.log(`  ${basePath}: ${saints2.length} saints split`);
  return saints2.length;
}

async function main() {
  let total = 0;

  if (source) {
    total = await splitDay(source);
  } else if (allFeb) {
    for (let d = 1; d <= 29; d++) {
      const dp = String(d).padStart(2, '0');
      total += await splitDay(`feb/day-${dp}`);
    }
  } else if (allJanV2) {
    for (let d = 16; d <= 31; d++) {
      const dp = String(d).padStart(2, '0');
      total += await splitDay(`jan-vol2/day-${dp}`);
    }
  } else if (allMar) {
    for (let d = 1; d <= 31; d++) {
      const dp = String(d).padStart(2, '0');
      total += await splitDay(`mar/day-${dp}`);
    }
  } else if (allApr) {
    for (let d = 1; d <= 30; d++) {
      const dp = String(d).padStart(2, '0');
      total += await splitDay(`apr/day-${dp}`);
    }
  } else if (allMay) {
    for (let d = 1; d <= 31; d++) {
      const dp = String(d).padStart(2, '0');
      total += await splitDay(`may/day-${dp}`);
    }
  } else if (allJun) {
    for (let d = 1; d <= 30; d++) {
      const dp = String(d).padStart(2, '0');
      total += await splitDay(`jun/day-${dp}`);
    }
  } else if (allJul) {
    // Only split days that actually have translations (July is being filled
    // in chronologically; re-running this after more days land is safe).
    for (let d = 1; d <= 31; d++) {
      const dp = String(d).padStart(2, '0');
      const dir = join(ROOT, 'src', 'translations', 'jul', `day-${dp}`);
      if (!existsSync(dir)) continue;
      const files = (await readdir(dir)).filter(f => /^\d{4}-jul-day-\d{2}\.md$/.test(f));
      if (files.length === 0) continue;
      total += await splitDay(`jul/day-${dp}`);
    }
  } else if (allAug) {
    // Only split days that actually have translations (August is being filled
    // in chronologically; re-running this after more days land is safe).
    for (let d = 1; d <= 31; d++) {
      const dp = String(d).padStart(2, '0');
      const dir = join(ROOT, 'src', 'translations', 'aug', `day-${dp}`);
      if (!existsSync(dir)) continue;
      const files = (await readdir(dir)).filter(f => /^\d{4}-aug-day-\d{2}\.md$/.test(f));
      if (files.length === 0) continue;
      total += await splitDay(`aug/day-${dp}`);
    }
  }

  console.log(`\nTotal: ${total} saint entries`);
}

main().catch(e => { console.error(e); process.exit(1); });
