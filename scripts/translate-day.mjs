/**
 * translate-day.mjs — Chunk + prepare a day's saint entries for agent translation
 *
 * Usage: node scripts/translate-day.mjs --day N
 *
 * 1. Runs chunk-saints.mjs for the day
 * 2. Writes a summary of what needs translating
 *
 * The actual translation is done by Claude agents reading chunks and writing translations.
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const args = process.argv.slice(2);
const day = parseInt(args.find((_, i, a) => a[i - 1] === '--day') || '0');

if (!day) {
  console.error('Usage: node scripts/translate-day.mjs --day N');
  process.exit(1);
}

const vol = day <= 15 ? 'jan-vol1' : 'jan-vol2';
const dayPad = String(day).padStart(2, '0');
const CHUNKS_DIR = join(ROOT, 'src/latin', vol, 'saints', `day-${dayPad}`, 'chunks');
const TRANS_DIR = join(ROOT, 'src/translations', vol, 'saints', `day-${dayPad}`);
const MANIFEST = join(ROOT, 'src/data', `jan-saints-day-${dayPad}-chunks.json`);

async function main() {
  // Step 1: chunk
  console.log(`=== Day ${day}: Chunking ===`);
  execFileSync('node', [join(ROOT, 'scripts/chunk-saints.mjs'), '--day', String(day)], { stdio: 'inherit' });

  // Step 2: read manifest
  const manifest = JSON.parse(await readFile(MANIFEST, 'utf-8'));
  await mkdir(TRANS_DIR, { recursive: true });

  // Step 3: summary
  const totalWords = manifest.reduce((s, c) => s + c.words, 0);
  const saints = [...new Set(manifest.map(c => c.saint))];

  console.log(`\n=== Day ${day} Ready for Translation ===`);
  console.log(`Saints: ${saints.length}`);
  console.log(`Chunks: ${manifest.length}`);
  console.log(`Total words: ${totalWords.toLocaleString()}`);
  console.log(`Source: ${CHUNKS_DIR}`);
  console.log(`Target: ${TRANS_DIR}`);
  console.log(`\nSaints:`);
  for (const saint of saints) {
    const saintChunks = manifest.filter(c => c.saint === saint);
    const saintWords = saintChunks.reduce((s, c) => s + c.words, 0);
    console.log(`  ${saint}: ${saintChunks.length} chunks, ${saintWords.toLocaleString()} words`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
