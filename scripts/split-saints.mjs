/**
 * split-saints.mjs — Split day-level translations into individual saint entries
 *
 * Detects saint boundaries from "ON ST.", "ON STS.", "ON THE HOLY" headers
 * and splits each day's assembled text into separate saint files.
 *
 * Usage: node scripts/split-saints.mjs --source feb/day-16 [--dry-run]
 *        node scripts/split-saints.mjs --all-feb [--dry-run]
 *        node scripts/split-saints.mjs --all-jan-vol2 [--dry-run]
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
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

/** Detect if a line is a saint entry boundary */
function isSaintBoundary(line) {
  const t = line.trim();
  if (t.length < 10 || t.length > 300) return false;

  // "ON ST. NAME" or "ON STS. NAME" or "ON THE HOLY ..."
  if (/^ON (ST\.|STS\.|SAINT|THE HOLY) /i.test(t)) return true;

  // "CONCERNING ST." / "CONCERNING THE"
  if (/^CONCERNING (ST\.|STS\.|THE HOLY) /i.test(t)) return true;

  // "DE S." or "DE SS." (Latin)
  if (/^DE S[S]?\. /i.test(t)) return true;

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
  name = name.replace(/^(ON |CONCERNING |DE |LIFE OF |ACTS OF |PASSION OF |MARTYRDOM OF |TRANSLATION OF |MIRACLES OF |HISTORY OF )(ST\.|STS\.|SS\.|S\.|SAINT |BLESSED |B\. |THE HOLY |THE MARTYRDOM |THE PASSION |THE TRANSLATION |THE FINDING |THE DISCOVERY |THE )\s*/i, '');
  // Clean up remaining "OF" prefix from patterns like "ACTS OF THE MARTYRDOM OF ST. X"
  name = name.replace(/^(ST\.|STS\.|SAINT |BLESSED |B\. )\s*/i, '');
  // Remove trailing period
  name = name.replace(/\.\s*$/, '');
  // Remove location info after comma (keep first part)
  // e.g. "JULIANA, VIRGIN OF NICOMEDIA AND MARTYR, AT BRUSSELS" → "Juliana"
  // But keep compound names like "FAUSTINIANUS AND IUVENTIA"
  const parts = name.split(',');
  name = parts[0].trim();
  // Title case, preserving Roman numerals
  name = name.split(' ').map(w => {
    if (['AND', 'OF', 'THE', 'AT', 'IN'].includes(w)) return w.toLowerCase();
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
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
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
  }

  console.log(`\nTotal: ${total} saint entries`);
}

main().catch(e => { console.error(e); process.exit(1); });
