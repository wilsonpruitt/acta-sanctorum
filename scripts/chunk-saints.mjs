/**
 * chunk-saints.mjs — Chunk scraped saint entries into translation-sized pieces
 *
 * Usage: node scripts/chunk-saints.mjs --day N [--vol jan-vol1]
 *
 * Reads all .md files from src/latin/{vol}/saints/day-NN/
 * Splits each into ~1500-word chunks at paragraph boundaries
 * Writes to src/latin/{vol}/saints/day-NN/chunks/
 * Updates a manifest at src/data/jan-saints-day-NN-chunks.json
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const args = process.argv.slice(2);
const day = parseInt(args.find((_, i, a) => a[i - 1] === '--day') || '0');
const vol = args.find((_, i, a) => a[i - 1] === '--vol') || (day <= 15 ? 'jan-vol1' : 'jan-vol2');

if (!day) {
  console.error('Usage: node scripts/chunk-saints.mjs --day N');
  process.exit(1);
}

const TARGET_WORDS = 1500;
const MAX_WORDS = 2500;
const dayPad = String(day).padStart(2, '0');
const SAINTS_DIR = join(ROOT, 'src/latin', vol, 'saints', `day-${dayPad}`);
const CHUNKS_DIR = join(SAINTS_DIR, 'chunks');
const MANIFEST = join(ROOT, 'src/data', `jan-saints-day-${dayPad}-chunks.json`);

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[äæ]/g, 'ae').replace(/[öœ]/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

function chunkText(text, saintName) {
  // Split into paragraphs (double newline)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  const chunks = [];
  let current = [];
  let currentWords = 0;

  for (const para of paragraphs) {
    const paraWords = para.trim().split(/\s+/).length;

    // If a single paragraph exceeds MAX, split it by sentences
    if (paraWords > MAX_WORDS) {
      // Flush current
      if (current.length > 0) {
        chunks.push(current.join('\n\n'));
        current = [];
        currentWords = 0;
      }
      // Split long paragraph by sentences
      const sentences = para.split(/(?<=[.!?])\s+/);
      let sentBuf = [];
      let sentWords = 0;
      for (const sent of sentences) {
        const sw = sent.split(/\s+/).length;
        if (sentWords + sw > TARGET_WORDS && sentBuf.length > 0) {
          chunks.push(sentBuf.join(' '));
          sentBuf = [];
          sentWords = 0;
        }
        sentBuf.push(sent);
        sentWords += sw;
      }
      if (sentBuf.length > 0) {
        chunks.push(sentBuf.join(' '));
      }
      continue;
    }

    if (currentWords + paraWords > TARGET_WORDS && current.length > 0) {
      chunks.push(current.join('\n\n'));
      current = [];
      currentWords = 0;
    }

    current.push(para.trim());
    currentWords += paraWords;
  }

  if (current.length > 0) {
    chunks.push(current.join('\n\n'));
  }

  return chunks;
}

async function main() {
  await mkdir(CHUNKS_DIR, { recursive: true });

  const files = (await readdir(SAINTS_DIR))
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .sort();

  console.log(`Day ${day}: ${files.length} saint entries to chunk.`);

  const manifest = [];
  let globalChunkIdx = 0;

  for (const file of files) {
    const raw = await readFile(join(SAINTS_DIR, file), 'utf-8');

    // Extract frontmatter and body
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n\n?([\s\S]*)$/);
    if (!fmMatch) {
      console.log(`  Skipping ${file}: no frontmatter`);
      continue;
    }

    const frontmatter = fmMatch[1];
    const body = fmMatch[2].trim();
    const nameMatch = frontmatter.match(/name:\s*"(.+?)"/);
    const saintName = nameMatch ? nameMatch[1] : file.replace('.md', '');

    if (!body || body.split(/\s+/).length < 20) {
      console.log(`  Skipping ${file}: too short (${body.split(/\s+/).length} words)`);
      continue;
    }

    const chunks = chunkText(body, saintName);
    const saintSlug = slugify(saintName);

    for (let i = 0; i < chunks.length; i++) {
      const chunkContent = chunks[i];
      const wordCount = chunkContent.split(/\s+/).length;
      const chunkFile = `${String(globalChunkIdx).padStart(4, '0')}-${saintSlug}-${String(i + 1).padStart(2, '0')}.md`;

      const md = `---
day: ${day}
saint: "${saintName}"
source: ${file}
chunk: ${globalChunkIdx}
part: ${i + 1}
totalParts: ${chunks.length}
words: ${wordCount}
status: pending
---

${chunkContent}
`;

      await writeFile(join(CHUNKS_DIR, chunkFile), md);
      manifest.push({
        chunk: globalChunkIdx,
        filename: chunkFile,
        saint: saintName,
        source: file,
        part: i + 1,
        totalParts: chunks.length,
        words: wordCount,
        status: 'pending',
      });

      globalChunkIdx++;
    }

    console.log(`  ${saintName}: ${chunks.length} chunk(s) (${body.split(/\s+/).length} words)`);
  }

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`\nDay ${day}: ${globalChunkIdx} total chunks written to ${CHUNKS_DIR}`);
  console.log(`Manifest: ${MANIFEST}`);
}

main().catch(err => {
  console.error('Chunk failed:', err);
  process.exit(1);
});
