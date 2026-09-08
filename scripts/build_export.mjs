#!/usr/bin/env node
// Bulk export (~/open-corpus/PLAN.md item 8, Appendix E). Aggregates the
// per-saint .json siblings that build-site.mjs's writeSaintSiblings()
// already writes (site/<month>/day-NN/<slug>.json) — so the export can
// never drift from what each saint page itself serves.
// Run scripts/build-site.mjs BEFORE this, then scripts/upload_export_r2.sh
// to publish. Uploading is outward-facing — Wilson's OK first, same as a
// deploy.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import zlib from 'node:zlib';

const ROOT = path.resolve(import.meta.dirname, '..');
const SITE_DIR = path.join(ROOT, 'site');
const EXPORT = path.join(ROOT, 'export');
const today = new Date().toISOString().slice(0, 10);

function findSiblingJson() {
  const out = [];
  for (const month of fs.readdirSync(SITE_DIR)) {
    const monthDir = path.join(SITE_DIR, month);
    if (!fs.statSync(monthDir).isDirectory()) continue;
    for (const day of fs.readdirSync(monthDir)) {
      const dayDir = path.join(monthDir, day);
      if (!fs.statSync(dayDir).isDirectory()) continue;
      for (const f of fs.readdirSync(dayDir)) {
        if (f.endsWith('.json')) out.push(path.join(dayDir, f));
      }
    }
  }
  return out;
}

function main() {
  fs.mkdirSync(EXPORT, { recursive: true });
  const txtDir = path.join(EXPORT, 'txt');
  fs.mkdirSync(txtDir, { recursive: true });

  const files = findSiblingJson();
  const lines = [];
  let totalWords = 0;

  for (const f of files) {
    const record = JSON.parse(fs.readFileSync(f, 'utf8'));
    lines.push(JSON.stringify(record));
    totalWords += (record.english || '').split(/\s+/).filter(Boolean).length;
    const txtSibling = f.replace(/\.json$/, '.txt');
    if (fs.existsSync(txtSibling)) {
      const flatName = `${record.collection.replace(/\//g, '_')}_${record.id}.txt`;
      fs.copyFileSync(txtSibling, path.join(txtDir, flatName));
    }
  }

  const worksPath = path.join(EXPORT, `acta-sanctorum-${today}.jsonl.gz`);
  fs.writeFileSync(worksPath, zlib.gzipSync(lines.join('\n') + '\n'));

  const txtArchive = path.join(EXPORT, `acta-sanctorum-txt-${today}.tar.gz`);
  execFileSync('tar', ['-czf', txtArchive, '-C', EXPORT, 'txt']);
  fs.rmSync(txtDir, { recursive: true, force: true });

  const readme = `# Acta Sanctorum — bulk export

Generated ${today}. ${files.length} saint entries, ~${totalWords.toLocaleString('en-US')} words of English.

## Files

- \`acta-sanctorum-${today}.jsonl.gz\` — one JSON object per saint entry,
  full English text inline in the \`english\` field, source-edition
  citation (month + day), languages, license fields. \`source_text\` is
  null: the Latin is not yet stored per-entry in this pipeline.
- \`acta-sanctorum-txt-${today}.tar.gz\` — plain-text mirror of each entry
  as \`txt/<month>_day-NN_<slug>.txt\` (English only, headered).

## License

**The source text.** The Latin Acta Sanctorum, and the Paris edition
reprints used here, are public domain.

**The English translation, apparatus, and encoding** are
[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/),
attribution "Wilson Pruitt (Wroot Press)". Full terms:
https://actasanctorum.org/rights.html — including the explicit
machine-learning-use permission (§3a of LICENSE), which covers commercial
model training.

Inbound credit: Latin digitized by the Ökumenisches Heiligenlexikon
(heiligenlexikon.de).

## Hosting

Served from the shared Cloudflare R2 bucket \`wroot-corpus-export\`
(prefix \`acta-sanctorum/\`), not baked into any deploy — see
\`~/open-corpus/PLAN.md\` item 8.
`;
  fs.writeFileSync(path.join(EXPORT, 'README.md'), readme);

  const manifest = {
    generated: today,
    works: files.length,
    words: totalWords,
    files: [
      { name: path.basename(worksPath), description: 'One JSON object per saint entry, full text inline.', size_bytes: fs.statSync(worksPath).size },
      { name: path.basename(txtArchive), description: 'Plain-text mirror of each entry.', size_bytes: fs.statSync(txtArchive).size },
      { name: 'README.md', description: 'Schema, license, and changelog.', size_bytes: fs.statSync(path.join(EXPORT, 'README.md')).size },
    ],
  };
  fs.writeFileSync(path.join(EXPORT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  console.log(`Wrote ${files.length} saint entries, ~${totalWords.toLocaleString('en-US')} words.`);
  for (const f of manifest.files) console.log(`  ${f.name}  (${f.size_bytes.toLocaleString('en-US')} bytes)`);
  console.log('Run scripts/upload_export_r2.sh to publish these to R2.');
}

main();
