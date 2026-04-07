import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TARGET_WORDS = 1500;

async function chunkDay(day) {
  const dp = String(day).padStart(2, '0');
  const srcPath = join(ROOT, `src/latin/feb/day-${dp}/day-${dp}-full.txt`);
  const chunkDir = join(ROOT, `src/latin/feb/day-${dp}/chunks`);
  if (!existsSync(srcPath)) { console.log(`Feb ${day}: skipped`); return 0; }
  await mkdir(chunkDir, { recursive: true });
  const text = await readFile(srcPath, 'utf-8');
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
  const chunks = [];
  let current = [], currentWords = 0;
  for (const para of paragraphs) {
    const pw = para.split(/\s+/).length;
    if (currentWords + pw > TARGET_WORDS && current.length > 0) {
      chunks.push(current.join('\n\n'));
      current = [para]; currentWords = pw;
    } else {
      current.push(para); currentWords += pw;
    }
  }
  if (current.length > 0) chunks.push(current.join('\n\n'));
  for (let i = 0; i < chunks.length; i++) {
    const num = String(i).padStart(4, '0');
    await writeFile(join(chunkDir, `${num}-feb-day-${dp}.md`), chunks[i], 'utf-8');
  }
  console.log(`Feb ${dp}: ${chunks.length} chunks (${text.split(/\s+/).length} words)`);
  return chunks.length;
}

let total = 0;
for (let d = 1; d <= 29; d++) total += await chunkDay(d);
console.log(`\nTotal: ${total} chunks`);
