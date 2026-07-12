// Usage: node scripts/chunk-month.mjs <slug>
// Mirrors chunk-may.mjs but parameterised. Reads src/latin/<slug>/day-NN/day-NN-full.txt
// and emits src/latin/<slug>/day-NN/chunks/NNNN-<slug>-day-NN.md.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TARGET_WORDS = 1500;

const slug = process.argv[2];
if (!slug) { console.error('Usage: node scripts/chunk-month.mjs <slug>'); process.exit(1); }

async function chunkDay(day) {
  const dp = String(day).padStart(2, '0');
  const srcPath = join(ROOT, `src/latin/${slug}/day-${dp}/day-${dp}-full.txt`);
  const chunkDir = join(ROOT, `src/latin/${slug}/day-${dp}/chunks`);
  if (!existsSync(srcPath)) { console.log(`${slug} ${day}: skipped`); return 0; }
  await mkdir(chunkDir, { recursive: true });
  const text = await readFile(srcPath, 'utf-8');
  const lines = text.split(/\n/).filter(l => l.trim());
  const chunks = [];
  let current = [], currentWords = 0;
  for (const line of lines) {
    const pw = line.split(/\s+/).length;
    if (currentWords + pw > TARGET_WORDS && current.length > 0) {
      chunks.push(current.join('\n\n'));
      current = [line]; currentWords = pw;
    } else {
      current.push(line); currentWords += pw;
    }
  }
  if (current.length > 0) chunks.push(current.join('\n\n'));
  for (let i = 0; i < chunks.length; i++) {
    const num = String(i).padStart(4, '0');
    await writeFile(join(chunkDir, `${num}-${slug}-day-${dp}.md`), chunks[i], 'utf-8');
  }
  console.log(`${slug} ${dp}: ${chunks.length} chunks (${text.split(/\s+/).length} words)`);
  return chunks.length;
}

let total = 0;
for (let d = 1; d <= 31; d++) total += await chunkDay(d);
console.log(`\nTotal: ${total} chunks`);
