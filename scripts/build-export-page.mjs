#!/usr/bin/env node
// Build /export.html — the bulk-export page for actasanctorum.org
// (~/open-corpus/PLAN.md item 8). Reads export/manifest.json (written by
// scripts/build_export.mjs) if present; degrades to a "not yet generated"
// notice so the site still builds before the first export exists.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SITE_DIR = path.join(ROOT, 'site');
const MANIFEST_PATH = path.join(ROOT, 'export/manifest.json');
// PLACEHOLDER until the shared wroot-corpus-export R2 bucket (PLAN.md item
// 8) is actually provisioned and its public dev URL is known — update this
// the same session the bucket is created, before the first export goes live.
export const EXPORT_R2_BASE_URL = 'https://pub-wroot-corpus-export.r2.dev/acta-sanctorum';

const manifest = fs.existsSync(MANIFEST_PATH)
  ? JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'))
  : null;

const filesHtml = manifest
  ? `<p>Generated ${manifest.generated}. ${manifest.works} saint entries, ~${manifest.words.toLocaleString('en-US')} words of English.</p>
<ul>
${(manifest.files || [])
  .map(f => `  <li><a href="${EXPORT_R2_BASE_URL}/${f.name}">${f.name}</a> &mdash; ${f.description} (${(f.size_bytes / 1e6).toFixed(1)} MB)</li>`)
  .join('\n')}
</ul>`
  : `<p><i>The bulk export has not been generated yet.</i> Every saint entry is still readable and machine-fetchable via its own page and .txt/.json siblings (see <a href="rights.html">/rights</a>) &mdash; this page will list a downloadable archive once <code>scripts/build_export.mjs</code> has run.</p>`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bulk Export — Acta Sanctorum</title>
  <meta name="description" content="Download the full text and apparatus of the Acta Sanctorum English translation as structured data.">
  <link rel="canonical" href="https://actasanctorum.org/export.html">
  <link rel="stylesheet" href="style.css">
  <script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
  <div class="page">
    <header class="site-header">
      <a href="index.html">Acta Sanctorum</a>
      <a class="header-support" href="#support">Support</a>
    </header>
    <nav class="breadcrumb">
      <a href="index.html">Home</a><span class="sep">&rsaquo;</span> Bulk Export
    </nav>
    <div class="section-header">
      <h1>Bulk Export</h1>
      <div class="section-rule"></div>
    </div>
    <article class="article" style="max-width: 640px; margin: 0 auto;">
      <p>Every translated saint entry, one JSON record per entry with the full English text inline, source-edition citation (month and day), and license fields. See <a href="rights.html">/rights</a> for the license and the machine-use permission. Every saint page also has plain-text and JSON siblings directly: replace <code>.html</code> with <code>.txt</code> or <code>.json</code> in the URL.</p>
      ${filesHtml}
    </article>
    <footer class="site-footer">
      Latin source: <a href="https://www.heiligenlexikon.de/ActaSanctorum/" target="_blank">Heiligenlexikon.de</a><br>
      English translation by Wilson Pruitt
      <span class="footer-rights">The Latin is public domain. The English translation, notes, and structured text are &copy; 2026 Wilson Pruitt, licensed <a href="rights.html">CC BY-NC 4.0</a> &mdash; free to share and build on, not to sell. <a href="rights.html">Commercial use, ask.</a></span>
    </footer>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(SITE_DIR, 'export.html'), html);
console.log('built site/export.html');
