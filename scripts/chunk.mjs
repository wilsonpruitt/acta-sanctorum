/**
 * chunk.mjs — Split the raw Latin text into section-level markdown files
 *
 * Splits at CAPVT and § boundaries, producing one .md file per section.
 * Output: src/latin/jan-vol1/chunks/
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const INPUT = join(ROOT, 'src/latin/jan-vol1/einleitung.txt');
const CHUNKS_DIR = join(ROOT, 'src/latin/jan-vol1/chunks');
const MANIFEST = join(ROOT, 'src/data/jan-vol1-chunks.json');

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[æ]/g, 'ae')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

async function main() {
  const raw = await readFile(INPUT, 'utf-8');
  const lines = raw.split('\n');
  await mkdir(CHUNKS_DIR, { recursive: true });

  // Patterns that start a new chunk
  const sectionPattern = /^(§\.?\s*[IVX0-9]+|CAPVT\s+[A-Z]+|DE ACTIS SANCTORVM|EPILOGVS|INDEX\s)/;
  // Single-letter headings in the index (A., B., C., etc.)
  const indexLetterPattern = /^[A-Z]\.$/;

  const chunks = [];
  let current = null;

  // Everything before the first section marker is "front-matter"
  let frontLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (sectionPattern.test(trimmed) || indexLetterPattern.test(trimmed)) {
      // Save previous chunk
      if (current) {
        chunks.push(current);
      } else if (frontLines.length > 0) {
        // Save front matter as chunk 0
        chunks.push({
          index: 0,
          heading: 'Front Matter (Title, Dedication, Approvals)',
          lines: frontLines,
        });
      }

      current = {
        index: chunks.length + (current ? 0 : 1),
        heading: line.trim(),
        lines: [line],
      };
    } else if (current) {
      current.lines.push(line);
    } else {
      frontLines.push(line);
    }
  }

  // Don't forget the last chunk
  if (current) chunks.push(current);

  // Write each chunk
  const manifest = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const padded = String(i).padStart(2, '0');
    const slug = slugify(chunk.heading);
    const filename = `${padded}-${slug}.md`;
    const content = chunk.lines.join('\n').trim();
    const wordCount = content.split(/\s+/).length;

    const md = `---
chunk: ${i}
heading: "${chunk.heading.replace(/"/g, '\\"')}"
words: ${wordCount}
status: pending
---

${content}
`;

    await writeFile(join(CHUNKS_DIR, filename), md);
    manifest.push({
      chunk: i,
      filename,
      heading: chunk.heading,
      words: wordCount,
      status: 'pending',
    });

    console.log(`  [${padded}] ${filename} (${wordCount} words)`);
  }

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`\nDone. ${chunks.length} chunks written to ${CHUNKS_DIR}`);
  console.log(`Manifest: ${MANIFEST}`);
}

main().catch(err => {
  console.error('Chunk failed:', err);
  process.exit(1);
});
