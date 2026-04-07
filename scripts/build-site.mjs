/**
 * build-site.mjs — Generate static HTML site from Acta Sanctorum translations
 *
 * Usage: node scripts/build-site.mjs
 *
 * Reads markdown translations from src/translations/
 * Generates static HTML pages to site/
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const TRANS_DIR = path.join(ROOT, 'src/translations');
const SITE_DIR = path.join(ROOT, 'site');
const MANIFEST = path.join(ROOT, 'src/data/jan-saints-manifest.json');

// ── Name Cleanup ──
// The source site (heiligenlexikon.de) uses German titles. Map to English.
const NAME_FIXES = {
  'Aldus.html': 'Aldus',
  '30 Soldaten': '30 Soldiers',
  '40 Soldaten': '40 Soldiers',
  '43 Mönche von Raithu': '43 Monks of Raithu',
  '8 Märtyrer von Nicäa': '8 Martyrs of Nicaea',
};

function cleanDisplayName(raw) {
  let name = raw.replace(/^Acta Sanctorum:\s*/i, '').trim();
  if (NAME_FIXES[name]) return NAME_FIXES[name];
  // German → English common patterns
  name = name.replace(/ und Gefährten$/, ' and Companions');
  name = name.replace(/ die Ältere$/, ' the Elder');
  name = name.replace(/ der Ältere$/, ' the Elder');
  name = name.replace(/ der Große$/, ' the Great');
  name = name.replace(/ der Grosse$/, ' the Great');
  name = name.replace(/ der Bekenner$/, ' the Confessor');
  name = name.replace(/ von /g, ' of ');
  name = name.replace(/Märtyrer/g, 'Martyrs');
  name = name.replace(/Mönche/g, 'Monks');
  name = name.replace(/Soldaten/g, 'Soldiers');
  return name;
}

// ── Helpers ──

function parseFrontmatter(content, filename) {
  // Strip leading HTML comments (<!-- Source: ... -->)
  const cleaned = content.replace(/^<!--[\s\S]*?-->\n*/g, '');
  const match = cleaned.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    // No frontmatter — infer saint name from filename
    // e.g. 0021-acta-sanctorum-theodoulus-und-gefaehrten-02.md
    const meta = inferMetaFromFilename(filename);
    // Strip <!-- Source: --> comments from body
    const body = content.replace(/<!--.*?-->\n?/g, '');
    return { meta, body };
  }
  const meta = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*(.+)$/);
    if (m) meta[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
  }
  return { meta, body: match[2] };
}

/** Infer saint name and part number from filename */
function inferMetaFromFilename(filename) {
  // 0021-acta-sanctorum-theodoulus-und-gefaehrten-02.md
  const base = filename.replace(/\.md$/, '');
  const m = base.match(/^(\d+)-acta-sanctorum-(.+?)(?:-(\d+))?$/);
  if (!m) return {};

  const slug = m[2];
  const partNum = m[3] ? parseInt(m[3], 10) : 1;

  // Convert slug back to a readable name
  // theodoulus-und-gefaehrten → Theodoulus und Gefährten
  const name = 'Acta Sanctorum: ' + slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/ Und /g, ' und ')
    .replace(/ Von /g, ' von ')
    .replace(/ Der /g, ' der ')
    .replace(/ Die /g, ' die ')
    .replace(/ Vom /g, ' vom ')
    .replace(/Gefaehrten/g, 'Gefährten')
    .replace(/Aegypter/g, 'Ägypter')
    .replace(/Aeltere/g, 'Ältere')
    .replace(/Moenche/g, 'Mönche')
    .replace(/Maertyrer/g, 'Märtyrer');

  return {
    saint: name,
    part: String(partNum),
    status: 'translated',
  };
}

function slugify(name) {
  return name
    .replace(/^Acta Sanctorum:\s*/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Detect if a line is a section heading (LIFE, CHAPTER, BY author, etc.) */
function isSectionHeading(line) {
  // Must not be too long (headings are short) and not start with [section marker]
  if (line.length > 200 || line.length < 3) return false;
  if (line.startsWith('[') || line.startsWith('(')) return false;

  // Known heading starters (all caps)
  const headingPatterns = [
    /^LIFE\b/, /^VITA\b/, /^PASSIO\b/, /^ACTS?\.?$/,
    /^ANOTHER LIFE\b/, /^ANOTHER VITA\b/,
    /^MIRACLES?\b/, /^MIRACULA\b/,
    /^TRANSLATION\b/, /^TRANSLATIO\b/,
    /^BOOK [IVX\d]/, /^LIBER [IVX\d]/,
    /^CHAPTER [IVX\d]/, /^CAPUT [IVX\d]/,
    /^PREFACE\b/, /^PROLOGUE\b/, /^EPILOGUE\b/,
    /^BY [A-Z]/, /^FROM [A-Z]/,
    /^APPENDIX\b/, /^SUPPLEMENT\b/,
    /^FRAGMENT\b/, /^EPITAPH\b/,
    /^PRIVILEGE\b/, /^BULL\b/,
    /^BHL Number:/,
    /^FIRST LIFE\b/, /^SECOND LIFE\b/, /^THIRD LIFE\b/,
    /^ALIA VITA\b/, /^ANOTHER\b/,
  ];

  for (const pat of headingPatterns) {
    if (pat.test(line)) return true;
  }

  // Also detect fully uppercase lines (min 4 chars, >70% uppercase letters)
  const letters = line.replace(/[^a-zA-Z]/g, '');
  if (letters.length >= 4) {
    const upperCount = (line.match(/[A-Z]/g) || []).length;
    if (upperCount / letters.length > 0.7 && line.length < 120) return true;
  }

  return false;
}

/** Extract footnotes (lines starting with "a." "b." etc.) and return {html, footnotes} */
function extractFootnotes(text) {
  const lines = text.split('\n');
  const footnotes = [];
  const bodyLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Match footnote definitions: lines starting with a single letter followed by a period and space
    const fnMatch = trimmed.match(/^([a-o])\.\s+(.+)$/);
    if (fnMatch && fnMatch[2].length > 20) {
      footnotes.push({ letter: fnMatch[1], text: fnMatch[2] });
    } else {
      bodyLines.push(line);
    }
  }

  return { bodyText: bodyLines.join('\n'), footnotes };
}

/** Link inline footnote markers (single letters a-o preceded by space) to their definitions */
function linkFootnoteRefs(html, footnotes) {
  if (footnotes.length === 0) return html;

  const letters = new Set(footnotes.map(f => f.letter));

  // Replace inline references: " a " or " a," or " a;" etc. — single letter surrounded by word boundary
  for (const letter of letters) {
    // Match the letter when preceded by whitespace and followed by whitespace or punctuation
    // Be careful not to match normal words
    const regex = new RegExp(`(\\s)${letter}(\\s|,|;|\\.|:)`, 'g');
    html = html.replace(regex, `$1<sup class="fn-ref" id="fnref-${letter}"><a href="#fn-${letter}">${letter}</a></sup>$2`);
  }

  // Build footnote section
  let fnHtml = '<div class="footnotes"><h4>Notes</h4>';
  for (const fn of footnotes) {
    fnHtml += `<div class="footnote" id="fn-${fn.letter}"><span class="fn-num"><a href="#fnref-${fn.letter}" style="color: var(--rubric); text-decoration: none;">${fn.letter}.</a></span> ${escapeHtml(fn.text)}</div>`;
  }
  fnHtml += '</div>';

  return html + fnHtml;
}

/** Link footnotes with a unique suffix to avoid ID collisions across chunks */
function linkFootnoteRefsWithSuffix(html, footnotes, suffix) {
  if (footnotes.length === 0) return html;

  const letters = new Set(footnotes.map(f => f.letter));

  for (const letter of letters) {
    const regex = new RegExp(`(\\s)${letter}(\\s|,|;|\\.|:)`, 'g');
    html = html.replace(regex, `$1<sup class="fn-ref" id="fnref-${letter}${suffix}"><a href="#fn-${letter}${suffix}">${letter}</a></sup>$2`);
  }

  let fnHtml = '<div class="footnotes"><h4>Notes</h4>';
  for (const fn of footnotes) {
    fnHtml += `<div class="footnote" id="fn-${fn.letter}${suffix}"><span class="fn-num"><a href="#fnref-${fn.letter}${suffix}" style="color: var(--rubric); text-decoration: none;">${fn.letter}.</a></span> ${escapeHtml(fn.text)}</div>`;
  }
  fnHtml += '</div>';

  return html + fnHtml;
}

/** Convert markdown-ish text to simple HTML */
function mdToHtml(text) {
  const lines = text.split('\n');
  let html = '';
  let inParagraph = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip the repeated header lines that appear in every chunk
    if (trimmed === 'Acta Sanctorum of the Bollandists') continue;
    if (trimmed.startsWith('Introduction, January')) continue;
    if (trimmed.match(/^\s*Volume January/)) continue;
    if (trimmed.match(/^\s*Appendix January/)) continue;

    // Headings (markdown)
    if (trimmed.startsWith('## ')) {
      if (inParagraph) { html += '</p>\n'; inParagraph = false; }
      html += `<h2>${escapeHtml(trimmed.slice(3))}</h2>\n`;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      if (inParagraph) { html += '</p>\n'; inParagraph = false; }
      html += `<h3>${escapeHtml(trimmed.slice(4))}</h3>\n`;
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      if (inParagraph) { html += '</p>\n'; inParagraph = false; }
      html += `<h4>${escapeHtml(trimmed.slice(5))}</h4>\n`;
      continue;
    }

    // Standalone marginal notes in brackets like [Commentary] or [His death.]
    // Render them as floating margin notes INSIDE the next paragraph
    if (trimmed.match(/^\[.+\]$/) && trimmed.length < 120) {
      // If we're in a paragraph, insert inline; otherwise buffer for next paragraph
      const noteHtml = `<span class="margin-note">${escapeHtml(trimmed.slice(1, -1))}</span>`;
      if (inParagraph) {
        html += noteHtml + '\n';
      } else {
        // Will be prepended to the next paragraph
        html += noteHtml + '\n';
      }
      continue;
    }

    // Detect section headings: lines that are ALL CAPS or start with known heading patterns
    // e.g. "LIFE", "CHAPTER I.", "ANOTHER LIFE OF...", "BY LOTSALD THE MONK.", "BOOK II."
    if (isSectionHeading(trimmed)) {
      if (inParagraph) { html += '</p>\n'; inParagraph = false; }
      html += `<h3>${escapeHtml(trimmed)}</h3>\n`;
      continue;
    }

    // Empty line = paragraph break
    if (trimmed === '') {
      if (inParagraph) { html += '</p>\n'; inParagraph = false; }
      continue;
    }

    // Section markers like [1], [2], §1, § 1
    let processed = escapeHtml(trimmed);
    processed = processed.replace(
      /\[(\d+)\]/g,
      '<span class="section-marker">[$1]</span>'
    );
    processed = processed.replace(
      /§\s*(\d+)/g,
      '<span class="section-marker">§$1</span>'
    );

    // Inline marginal notes [text in brackets mid-paragraph]
    processed = processed.replace(
      /\[([^\]]{4,80})\]/g,
      (match, inner) => {
        // Skip section markers already handled
        if (inner.match(/^\d+$/)) return match;
        return `<span class="margin-note">${inner}</span>`;
      }
    );

    // Bold
    processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');

    if (!inParagraph) {
      html += '<p>';
      inParagraph = true;
    } else {
      html += ' ';
    }
    html += processed + '\n';
  }

  if (inParagraph) html += '</p>\n';
  return html;
}

// ── Page Templates ──

const FONT_LINKS = `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Source+Sans+3:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap" rel="stylesheet">`;

function htmlPage({ title, cssPath, breadcrumb, body, prevLink, nextLink }) {
  const prev = prevLink
    ? `<a href="${prevLink.href}">&larr; Previous<span class="nav-label">${escapeHtml(prevLink.label)}</span></a>`
    : '<span></span>';
  const next = nextLink
    ? `<a class="next" href="${nextLink.href}">Next &rarr;<span class="nav-label">${escapeHtml(nextLink.label)}</span></a>`
    : '<span></span>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(title)} — English translation of the Acta Sanctorum, the Bollandist collection of hagiographic texts.">
  <title>${escapeHtml(title)} — Acta Sanctorum</title>
  <link rel="icon" href="${cssPath.replace('style.css', '')}favicon.svg" type="image/svg+xml">
  ${FONT_LINKS}
  <link rel="stylesheet" href="${cssPath}">
  <link rel="stylesheet" href="${cssPath.replace('style.css', '')}pagefind/pagefind-ui.css">
</head>
<body>
  <div class="page">
    <header class="site-header">
      <a href="${cssPath.replace('style.css', '')}index.html">Acta Sanctorum</a>
    </header>
    ${breadcrumb ? `<nav class="breadcrumb">${breadcrumb}</nav>` : ''}
    ${body}
    <nav class="page-nav">
      ${prev}
      ${next}
    </nav>
    <footer class="site-footer">
      Latin source: <a href="https://www.heiligenlexikon.de/ActaSanctorum/" target="_blank">Heiligenlexikon.de</a><br>
      English translation by Wilson Pruitt
    </footer>
  </div>
  <script src="${cssPath.replace('style.css', '')}pagefind/pagefind-ui.js"></script>
  <script>
    const el = document.getElementById('search');
    if (el) new PagefindUI({ element: el, showSubResults: true, showImages: false });
  </script>
</body>
</html>`;
}

// ── Collect Data ──

function collectSaints() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf-8'));
  const days = [];

  for (const dayInfo of manifest.days) {
    const dayNum = dayInfo.day;
    const dp = String(dayNum).padStart(2, '0');
    const transDir = path.join(TRANS_DIR, 'jan-vol1/saints', `day-${dp}`);

    if (!fs.existsSync(transDir)) continue;

    const files = fs.readdirSync(transDir)
      .filter(f => f.endsWith('.md'))
      .sort();

    // Group chunks by saint name
    const saintMap = new Map();
    for (const file of files) {
      const content = fs.readFileSync(path.join(transDir, file), 'utf-8');
      const { meta, body } = parseFrontmatter(content, file);
      const saintName = meta.saint || 'Unknown';

      if (!saintMap.has(saintName)) {
        saintMap.set(saintName, {
          name: saintName,
          displayName: cleanDisplayName(saintName),
          slug: slugify(cleanDisplayName(saintName)),
          day: dayNum,
          parts: [],
          totalWords: 0,
        });
      }

      const saint = saintMap.get(saintName);
      saint.displayName = cleanDisplayName(saintName);
      saint.slug = slugify(saint.displayName);
      saint.parts.push({ file, meta, body });
      saint.totalWords += parseInt(meta.words || '0', 10);
    }

    // Find source URLs from manifest
    const saintUrlMap = {};
    if (dayInfo.saints) {
      for (const s of dayInfo.saints) {
        saintUrlMap[s.name] = s.url;
      }
    }

    const saints = [];
    for (const saint of saintMap.values()) {
      saint.parts.sort((a, b) => a.file.localeCompare(b.file));
      saint.sourceUrl = saintUrlMap[saint.name] || null;
      saints.push(saint);
    }

    days.push({
      day: dayNum,
      saints,
      saintCount: saints.length,
    });
  }

  return days.filter(d => d.saints.length > 0);
}

/** Collect March days from raw chunk files (no saint splitting) */
function collectMarDays() {
  const days = [];
  const marDir = path.join(TRANS_DIR, 'mar');
  if (!fs.existsSync(marDir)) return days;

  for (let d = 1; d <= 31; d++) {
    const dp = String(d).padStart(2, '0');
    const dayDir = path.join(marDir, `day-${dp}`);
    if (!fs.existsSync(dayDir)) continue;

    const files = fs.readdirSync(dayDir)
      .filter(f => f.endsWith('.md') && f.match(/^\d{4}-mar-day-\d{2}\.md$/))
      .sort();
    if (files.length === 0) continue;

    // Assemble all chunks into a single entry per day
    const parts = [];
    let totalWords = 0;
    for (const file of files) {
      const content = fs.readFileSync(path.join(dayDir, file), 'utf-8');
      const { meta, body } = parseFrontmatter(content, file);
      parts.push({ file, meta, body });
      totalWords += body.split(/\s+/).length;
    }

    // Use "March Day N" as single entry
    days.push({
      day: d,
      saints: [{
        name: `March ${d}`,
        displayName: `${d} March — Complete Text`,
        slug: 'complete',
        day: d,
        parts,
        totalWords,
        sourceUrl: null,
      }],
      saintCount: 1,
      chunkCount: files.length,
      totalWords,
    });
  }

  return days;
}

/** Collect saints from split files (Vol II and February) */
function collectSplitSaints(baseDir, dayStart, dayEnd) {
  const days = [];

  for (let d = dayStart; d <= dayEnd; d++) {
    const dp = String(d).padStart(2, '0');
    const saintsDir = path.join(TRANS_DIR, baseDir, `day-${dp}`, 'saints');

    if (!fs.existsSync(saintsDir)) continue;

    const files = fs.readdirSync(saintsDir).filter(f => f.endsWith('.md') && !f.includes('preamble')).sort();
    if (files.length === 0) continue;

    const saints = [];
    for (const file of files) {
      const content = fs.readFileSync(path.join(saintsDir, file), 'utf-8');
      const { meta, body } = parseFrontmatter(content, file);
      const displayName = meta.saint || 'Unknown';
      const slug = meta.slug || slugify(displayName);

      saints.push({
        name: displayName,
        displayName,
        slug,
        day: d,
        parts: [{ file, meta, body }],
        totalWords: body.split(/\s+/).length,
        sourceUrl: null,
      });
    }

    if (saints.length > 0) {
      days.push({ day: d, saints, saintCount: saints.length });
    }
  }

  return days;
}

// ── Load Headnotes ──

function loadHeadnotes() {
  const headnotes = {};
  const dataDir = path.join(ROOT, 'src/data');
  if (!fs.existsSync(dataDir)) return headnotes;

  for (const file of fs.readdirSync(dataDir)) {
    if (!file.startsWith('headnotes-') || !file.endsWith('.json')) continue;
    try {
      const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));
      Object.assign(headnotes, data);
    } catch (e) {
      console.warn(`Warning: could not parse ${file}: ${e.message}`);
    }
  }
  return headnotes;
}

/** Find the headnote key for a saint */
function headnoteKey(dayNum, saint) {
  const dp = String(dayNum).padStart(2, '0');
  // The key format is "day-NN/acta-sanctorum-slug" derived from the first file's name
  const firstFile = saint.parts[0]?.file || '';
  // Strip chunk number and .md: 0005-acta-sanctorum-caspar-01.md → acta-sanctorum-caspar
  const match = firstFile.match(/^\d+-(.+?)(?:-\d+)?\.md$/);
  if (match) return `day-${dp}/${match[1]}`;
  return `day-${dp}/${saint.slug}`;
}

// ── Paris Edition Page Numbers ──

function loadParisPages() {
  const pagesFile = path.join(ROOT, 'src/data/paris-pages.json');
  if (!fs.existsSync(pagesFile)) return {};
  const data = JSON.parse(fs.readFileSync(pagesFile, 'utf-8'));
  const lookup = {};
  for (const vol of Object.values(data)) {
    if (!vol.days) continue;
    for (const [dayKey, page] of Object.entries(vol.days)) {
      if (page !== null) {
        lookup[dayKey] = { page, label: vol.label, archiveId: vol.archive_id };
      }
    }
  }
  return lookup;
}

function citationHtml(dayNum, parisPages) {
  const dp = String(dayNum).padStart(2, '0');
  const info = parisPages[`day-${dp}`];
  if (!info) return '';
  const archiveUrl = `https://archive.org/details/${info.archiveId}/page/${info.page}/mode/2up`;
  return `<div class="source-ref" style="text-align:center; margin-bottom: 1.5rem;">
    Citation: <em>AASS</em>, ${info.label}, p. ${info.page} &middot;
    <a href="${archiveUrl}" target="_blank">View in Paris edition</a>
  </div>`;
}

// ── Build Pages ──

function buildSite() {
  const days = collectSaints(); // Jan Vol I (days 1-15)
  // Try manual translations first, fall back to original scrape
  let janV2Days = collectSplitSaints('jan-vol2', 16, 31);
  // Also check manual saint splits (day-NN-manual/saints/)
  for (let d = 16; d <= 31; d++) {
    const dp = String(d).padStart(2, '0');
    const manualSaintsDir = path.join(TRANS_DIR, 'jan-vol2', `day-${dp}-manual`, 'saints');
    if (fs.existsSync(manualSaintsDir)) {
      const files = fs.readdirSync(manualSaintsDir).filter(f => f.endsWith('.md') && !f.includes('preamble')).sort();
      if (files.length > 0) {
        // Replace any existing entry for this day
        janV2Days = janV2Days.filter(day => day.day !== d);
        const saints = [];
        for (const file of files) {
          const content = fs.readFileSync(path.join(manualSaintsDir, file), 'utf-8');
          const { meta, body } = parseFrontmatter(content, file);
          const displayName = meta.saint || 'Unknown';
          const slug = meta.slug || slugify(displayName);
          saints.push({ name: displayName, displayName, slug, day: d, parts: [{ file, meta, body }], totalWords: body.split(/\s+/).length, sourceUrl: null });
        }
        if (saints.length > 0) janV2Days.push({ day: d, saints, saintCount: saints.length });
      }
    }
  }
  janV2Days.sort((a, b) => a.day - b.day);
  const febDays = collectSplitSaints('feb', 1, 29);
  const marDays = collectSplitSaints('mar', 1, 31);
  const headnotes = loadHeadnotes();
  const parisPages = loadParisPages();

  // Merge Jan Vol I + Vol II for a complete January
  const allJanDays = [...days, ...janV2Days];

  // Create directory structure
  for (const day of allJanDays) {
    const dp = String(day.day).padStart(2, '0');
    fs.mkdirSync(path.join(SITE_DIR, 'january', `day-${dp}`), { recursive: true });
  }

  // ── Landing Page ──
  const totalSaints = allJanDays.reduce((s, d) => s + d.saintCount, 0);
  const totalDays = allJanDays.length;
  const febSaints = febDays.reduce((s, d) => s + d.saintCount, 0);
  const febDayCount = febDays.length;
  const marSaints = marDays.reduce((s, d) => s + d.saintCount, 0);
  const marDayCount = marDays.length;
  const landingBody = `
    <div class="landing">
      <div class="landing-ornament">&#10022; &#10022; &#10022;</div>
      <h1>
        Acta Sanctorum
        <em>Quotquot toto orbe coluntur</em>
      </h1>
      <div class="landing-rule"></div>
      <div class="landing-meta">
        Originally compiled by Ioannes Bollandus, S.J. &amp; Godefridus Henschenius, S.J.<br>
        Antwerp &middot; 1643&ndash;1940 &middot; 68 Volumes
      </div>
      <div class="landing-description">
        A new English translation of the <em>Acta Sanctorum</em>, the monumental Bollandist
        collection of hagiographic texts arranged by liturgical feast day. This edition
        presents ${totalSaints + febSaints} saint entries across January, February, and March,
        translated from the Latin text digitized by the &Ouml;kumenisches Heiligenlexikon.
      </div>
      <div class="month-grid">
        <h3>Volumes</h3>
        <div class="month-link">
          <a href="january/index.html">Ianuarius &middot; January</a>
          <span class="vol-count">${totalSaints} entries</span>
        </div>
        <div class="month-link">
          <a href="february/index.html">Februarius &middot; February</a>
          <span class="vol-count">${febSaints > 0 ? febSaints + ' entries' : 'in progress'}</span>
        </div>
        <div class="month-link">
          <a href="march/index.html">Martius &middot; March</a>
          <span class="vol-count">${marSaints > 0 ? marSaints + ' entries' : 'in progress'}</span>
        </div>
        <div class="month-link disabled">Aprilis <span class="vol-count">forthcoming</span></div>
        <div class="month-link disabled">Maius <span class="vol-count">forthcoming</span></div>
        <div class="month-link disabled">Iunius <span class="vol-count">forthcoming</span></div>
        <div class="month-link disabled">Iulius <span class="vol-count">forthcoming</span></div>
        <div class="month-link disabled">Augustus <span class="vol-count">forthcoming</span></div>
        <div class="month-link disabled">September <span class="vol-count">forthcoming</span></div>
        <div class="month-link disabled">October <span class="vol-count">forthcoming</span></div>
        <div class="month-link disabled">November <span class="vol-count">forthcoming</span></div>
        <div class="month-link disabled">December <span class="vol-count">&mdash;</span></div>
      </div>
      <div class="search-container">
        <div id="search"></div>
      </div>
      <div style="text-align:center; margin-top: 2.5rem;">
        <a href="about.html" style="font-family: var(--font-ui); font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-faint); text-decoration: none; border-bottom: 1px dotted var(--rule);">About this translation</a>
        &nbsp;&middot;&nbsp;
        <a href="index-saints.html" style="font-family: var(--font-ui); font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-faint); text-decoration: none; border-bottom: 1px dotted var(--rule);">Index of Saints</a>
      </div>
    </div>`;

  fs.writeFileSync(
    path.join(SITE_DIR, 'index.html'),
    htmlPage({
      title: 'Acta Sanctorum — English Translation',
      cssPath: 'style.css',
      breadcrumb: null,
      body: landingBody,
      prevLink: null,
      nextLink: { href: 'january/index.html', label: 'January' },
    })
  );

  // ── January Index ──
  let janBody = `
    <div class="section-header">
      <h1>Ianuarius</h1>
      <div class="subtitle">January &middot; Days 1&ndash;${allJanDays.length > 15 ? '31' : '15'}</div>
      <div class="section-rule"></div>
    </div>
    <div class="day-grid">`;

  const JANUARY_DATES = [
    'Kalendis Ianuarii', 'IV Non. Ian.', 'III Non. Ian.', 'Prid. Non. Ian.',
    'Nonis Ianuarii', 'VIII Id. Ian.', 'VII Id. Ian.', 'VI Id. Ian.',
    'V Id. Ian.', 'IV Id. Ian.', 'III Id. Ian.', 'Prid. Id. Ian.',
    'Idibus Ianuarii', 'XIX Kal. Feb.', 'XVIII Kal. Feb.',
    'XVII Kal. Feb.', 'XVI Kal. Feb.', 'XV Kal. Feb.', 'XIV Kal. Feb.',
    'XIII Kal. Feb.', 'XII Kal. Feb.', 'XI Kal. Feb.', 'X Kal. Feb.',
    'IX Kal. Feb.', 'VIII Kal. Feb.', 'VII Kal. Feb.', 'VI Kal. Feb.',
    'V Kal. Feb.', 'IV Kal. Feb.', 'III Kal. Feb.', 'Prid. Kal. Feb.'
  ];

  for (const day of allJanDays) {
    const dp = String(day.day).padStart(2, '0');
    const romanDate = JANUARY_DATES[day.day - 1] || '';
    const topSaints = day.saints.slice(0, 5).map(s => s.displayName).join(', ');
    const more = day.saintCount > 5 ? ` + ${day.saintCount - 5} more` : '';

    janBody += `
      <div class="day-card">
        <h3><a href="day-${dp}/index.html">${day.day} January</a></h3>
        <div class="saint-preview">${romanDate} &middot; ${day.saintCount} entries: ${escapeHtml(topSaints)}${more}</div>
      </div>`;
  }

  janBody += '</div>';

  fs.writeFileSync(
    path.join(SITE_DIR, 'january/index.html'),
    htmlPage({
      title: 'January',
      cssPath: '../style.css',
      breadcrumb: '<a href="../index.html">Home</a><span class="sep">&rsaquo;</span> January',
      body: janBody,
      prevLink: { href: '../index.html', label: 'Home' },
      nextLink: days.length > 0
        ? { href: `day-${String(days[0].day).padStart(2, '0')}/index.html`, label: `${days[0].day} January` }
        : null,
    })
  );

  // ── Day Pages & Saint Pages (January) ──
  for (let di = 0; di < allJanDays.length; di++) {
    const day = allJanDays[di];
    const dp = String(day.day).padStart(2, '0');
    const dayDir = path.join(SITE_DIR, 'january', `day-${dp}`);

    // Day index
    let dayBody = `
      <div class="day-header">
        <h2>${day.day} January</h2>
        <div class="day-date">${JANUARY_DATES[day.day - 1] || ''} &middot; ${day.saintCount} entries</div>
        <div class="section-rule"></div>
      </div>
      ${citationHtml(day.day, parisPages)}
      <ul class="saint-list">`;

    for (const saint of day.saints) {
      const genre = guessGenre(saint);
      dayBody += `
        <li>
          <a href="${saint.slug}.html">${escapeHtml(saint.displayName)}</a>
          ${genreTagHtml(genre)}
        </li>`;
    }

    dayBody += '</ul>';

    const prevDay = di > 0 ? allJanDays[di - 1] : null;
    const nextDay = di < allJanDays.length - 1 ? allJanDays[di + 1] : null;

    fs.writeFileSync(
      path.join(dayDir, 'index.html'),
      htmlPage({
        title: `${day.day} January`,
        cssPath: '../../style.css',
        breadcrumb: `<a href="../../index.html">Home</a><span class="sep">&rsaquo;</span><a href="../index.html">January</a><span class="sep">&rsaquo;</span> ${day.day} January`,
        body: dayBody,
        prevLink: prevDay
          ? { href: `../day-${String(prevDay.day).padStart(2, '0')}/index.html`, label: `${prevDay.day} January` }
          : { href: '../index.html', label: 'January' },
        nextLink: nextDay
          ? { href: `../day-${String(nextDay.day).padStart(2, '0')}/index.html`, label: `${nextDay.day} January` }
          : null,
      })
    );

    // Saint pages
    for (let si = 0; si < day.saints.length; si++) {
      const saint = day.saints[si];

      // Assemble all chunks — render footnotes per-chunk to avoid letter collisions
      let articleHtml = '';
      let fnCounter = 0;
      for (const part of saint.parts) {
        const cleanBody = part.body.replace(/<!--.*?-->\n?/g, '');
        const { bodyText, footnotes } = extractFootnotes(cleanBody);
        let chunkHtml = mdToHtml(bodyText);
        if (footnotes.length > 0) {
          // Use a unique suffix per chunk to avoid ID collisions
          const suffix = fnCounter > 0 ? `-${fnCounter}` : '';
          chunkHtml = linkFootnoteRefsWithSuffix(chunkHtml, footnotes, suffix);
          fnCounter++;
        }
        articleHtml += chunkHtml;
      }

      const genre = guessGenre(saint);
      const sourceLink = saint.sourceUrl
        ? `<div class="source-ref">Latin source: <a href="${saint.sourceUrl}" target="_blank">Heiligenlexikon</a></div>`
        : '';

      const hnKey = headnoteKey(day.day, saint);
      const hn = headnotes[hnKey];
      const headnoteHtml = hn && hn.summary
        ? `<div class="headnote">
            ${escapeHtml(hn.summary)}
            ${hn.century ? `<span class="bhl">${escapeHtml(hn.century)}</span>` : ''}
            ${hn.bhl ? `<span class="bhl">BHL ${escapeHtml(hn.bhl)}</span>` : ''}
          </div>`
        : '';
      const displayGenre = hn && hn.genre ? hn.genre : genre;

      const saintBody = `
        <div class="saint-header">
          <h1>${escapeHtml(saint.displayName)}</h1>
          <div class="feast-date">${day.day} January &middot; ${displayGenre}</div>
          <div class="section-rule"></div>
        </div>
        ${sourceLink}
        ${headnoteHtml}
        <article class="article">
          ${articleHtml}
        </article>`;

      const prevSaint = si > 0 ? day.saints[si - 1] : null;
      const nextSaint = si < day.saints.length - 1 ? day.saints[si + 1] : null;

      fs.writeFileSync(
        path.join(dayDir, `${saint.slug}.html`),
        htmlPage({
          title: saint.displayName,
          cssPath: '../../style.css',
          breadcrumb: `<a href="../../index.html">Home</a><span class="sep">&rsaquo;</span><a href="../index.html">January</a><span class="sep">&rsaquo;</span><a href="index.html">${day.day} Jan</a><span class="sep">&rsaquo;</span> ${escapeHtml(saint.displayName)}`,
          body: saintBody,
          prevLink: prevSaint
            ? { href: `${prevSaint.slug}.html`, label: prevSaint.displayName }
            : { href: 'index.html', label: `${day.day} January` },
          nextLink: nextSaint
            ? { href: `${nextSaint.slug}.html`, label: nextSaint.displayName }
            : (nextDay
              ? { href: `../day-${String(nextDay.day).padStart(2, '0')}/index.html`, label: `${nextDay.day} January` }
              : null),
        })
      );
    }
  }

  // ── Alphabetical Index of Saints ──
  // ── February Pages ──
  if (febDays.length > 0) {
    const FEBRUARY_DATES = [
      'Kalendis Februarii', 'IV Non. Feb.', 'III Non. Feb.', 'Prid. Non. Feb.',
      'Nonis Februarii', 'VIII Id. Feb.', 'VII Id. Feb.', 'VI Id. Feb.',
      'V Id. Feb.', 'IV Id. Feb.', 'III Id. Feb.', 'Prid. Id. Feb.',
      'Idibus Februarii', 'XVI Kal. Mar.', 'XV Kal. Mar.', 'XIV Kal. Mar.',
      'XIII Kal. Mar.', 'XII Kal. Mar.', 'XI Kal. Mar.', 'X Kal. Mar.',
      'IX Kal. Mar.', 'VIII Kal. Mar.', 'VII Kal. Mar.', 'VI Kal. Mar.',
      'V Kal. Mar.', 'IV Kal. Mar.', 'III Kal. Mar.', 'Prid. Kal. Mar.', 'Bis. VI Kal. Mar.'
    ];

    // February index
    let febBody = `
      <div class="section-header">
        <h1>Februarius</h1>
        <div class="subtitle">February &middot; Days 1&ndash;29 &middot; ${febSaints} entries (in progress)</div>
        <div class="section-rule"></div>
      </div>
      <div class="day-grid">`;

    for (const day of febDays) {
      const dp = String(day.day).padStart(2, '0');
      const romanDate = FEBRUARY_DATES[day.day - 1] || '';
      const topSaints = day.saints.slice(0, 5).map(s => s.displayName).join(', ');
      const more = day.saintCount > 5 ? ` + ${day.saintCount - 5} more` : '';
      febBody += `
        <div class="day-card">
          <h3><a href="day-${dp}/index.html">${day.day} February</a></h3>
          <div class="saint-preview">${romanDate} &middot; ${day.saintCount} entries: ${escapeHtml(topSaints)}${more}</div>
        </div>`;
    }
    febBody += '</div>';

    fs.mkdirSync(path.join(SITE_DIR, 'february'), { recursive: true });
    fs.writeFileSync(
      path.join(SITE_DIR, 'february/index.html'),
      htmlPage({
        title: 'February',
        cssPath: '../style.css',
        breadcrumb: '<a href="../index.html">Home</a><span class="sep">&rsaquo;</span> February',
        body: febBody,
        prevLink: { href: '../january/index.html', label: 'January' },
        nextLink: marDays.length > 0 ? { href: '../march/index.html', label: 'March' } : null,
      })
    );

    // February day + saint pages (reuse same logic as January)
    for (let di = 0; di < febDays.length; di++) {
      const day = febDays[di];
      const dp = String(day.day).padStart(2, '0');
      const dayDir = path.join(SITE_DIR, 'february', `day-${dp}`);
      fs.mkdirSync(dayDir, { recursive: true });

      let dayBody = `
        <div class="day-header">
          <h2>${day.day} February</h2>
          <div class="day-date">${FEBRUARY_DATES[day.day - 1] || ''} &middot; ${day.saintCount} entries</div>
          <div class="section-rule"></div>
        </div>
        <ul class="saint-list">`;

      for (const saint of day.saints) {
        const genre = guessGenre(saint);
        dayBody += `
          <li>
            <a href="${saint.slug}.html">${escapeHtml(saint.displayName)}</a>
            ${genreTagHtml(genre)}
          </li>`;
      }
      dayBody += '</ul>';

      const prevDay = di > 0 ? febDays[di - 1] : null;
      const nextDay = di < febDays.length - 1 ? febDays[di + 1] : null;

      fs.writeFileSync(path.join(dayDir, 'index.html'), htmlPage({
        title: `${day.day} February`,
        cssPath: '../../style.css',
        breadcrumb: `<a href="../../index.html">Home</a><span class="sep">&rsaquo;</span><a href="../index.html">February</a><span class="sep">&rsaquo;</span> ${day.day} February`,
        body: dayBody,
        prevLink: prevDay
          ? { href: `../day-${String(prevDay.day).padStart(2, '0')}/index.html`, label: `${prevDay.day} February` }
          : { href: '../index.html', label: 'February' },
        nextLink: nextDay
          ? { href: `../day-${String(nextDay.day).padStart(2, '0')}/index.html`, label: `${nextDay.day} February` }
          : null,
      }));

      // Saint pages
      for (let si = 0; si < day.saints.length; si++) {
        const saint = day.saints[si];
        const { bodyText, footnotes } = extractFootnotes(saint.parts[0]?.body || '');
        let articleHtml = mdToHtml(bodyText);
        articleHtml = linkFootnoteRefs(articleHtml, footnotes);
        const genre = guessGenre(saint);

        const saintBody = `
          <div class="saint-header">
            <h1>${escapeHtml(saint.displayName)}</h1>
            <div class="feast-date">${day.day} February &middot; ${genre}</div>
            <div class="section-rule"></div>
          </div>
          <article class="article">${articleHtml}</article>`;

        const prevSaint = si > 0 ? day.saints[si - 1] : null;
        const nextSaint = si < day.saints.length - 1 ? day.saints[si + 1] : null;

        fs.writeFileSync(path.join(dayDir, `${saint.slug}.html`), htmlPage({
          title: saint.displayName,
          cssPath: '../../style.css',
          breadcrumb: `<a href="../../index.html">Home</a><span class="sep">&rsaquo;</span><a href="../index.html">February</a><span class="sep">&rsaquo;</span><a href="index.html">${day.day} Feb</a><span class="sep">&rsaquo;</span> ${escapeHtml(saint.displayName)}`,
          body: saintBody,
          prevLink: prevSaint ? { href: `${prevSaint.slug}.html`, label: prevSaint.displayName }
            : { href: 'index.html', label: `${day.day} February` },
          nextLink: nextSaint ? { href: `${nextSaint.slug}.html`, label: nextSaint.displayName }
            : (nextDay ? { href: `../day-${String(nextDay.day).padStart(2, '0')}/index.html`, label: `${nextDay.day} February` } : null),
        }));
      }
    }
  }

  // ── March Pages ──
  if (marDays.length > 0) {
    const MARCH_DATES = [
      'Kalendis Martiis', 'VI Non. Mar.', 'V Non. Mar.', 'IV Non. Mar.',
      'III Non. Mar.', 'Prid. Non. Mar.', 'Nonis Martiis', 'VIII Id. Mar.',
      'VII Id. Mar.', 'VI Id. Mar.', 'V Id. Mar.', 'IV Id. Mar.',
      'III Id. Mar.', 'Prid. Id. Mar.', 'Idibus Martiis', 'XVII Kal. Apr.',
      'XVI Kal. Apr.', 'XV Kal. Apr.', 'XIV Kal. Apr.', 'XIII Kal. Apr.',
      'XII Kal. Apr.', 'XI Kal. Apr.', 'X Kal. Apr.', 'IX Kal. Apr.',
      'VIII Kal. Apr.', 'VII Kal. Apr.', 'VI Kal. Apr.', 'V Kal. Apr.',
      'IV Kal. Apr.', 'III Kal. Apr.', 'Prid. Kal. Apr.'
    ];

    // March index
    let marBody = `
      <div class="section-header">
        <h1>Martius</h1>
        <div class="subtitle">March &middot; Days 1&ndash;${marDayCount} &middot; ${marSaints} entries</div>
        <div class="section-rule"></div>
      </div>
      <div class="day-grid">`;

    for (const day of marDays) {
      const dp = String(day.day).padStart(2, '0');
      const romanDate = MARCH_DATES[day.day - 1] || '';
      const topSaints = day.saints.slice(0, 5).map(s => s.displayName).join(', ');
      const more = day.saintCount > 5 ? ` + ${day.saintCount - 5} more` : '';
      marBody += `
        <div class="day-card">
          <h3><a href="day-${dp}/index.html">${day.day} March</a></h3>
          <div class="saint-preview">${romanDate} &middot; ${day.saintCount} entries: ${escapeHtml(topSaints)}${more}</div>
        </div>`;
    }
    marBody += '</div>';

    fs.mkdirSync(path.join(SITE_DIR, 'march'), { recursive: true });
    fs.writeFileSync(
      path.join(SITE_DIR, 'march/index.html'),
      htmlPage({
        title: 'March',
        cssPath: '../style.css',
        breadcrumb: '<a href="../index.html">Home</a><span class="sep">&rsaquo;</span> March',
        body: marBody,
        prevLink: { href: '../february/index.html', label: 'February' },
        nextLink: null,
      })
    );

    // March day + saint pages (same structure as January/February)
    for (let di = 0; di < marDays.length; di++) {
      const day = marDays[di];
      const dp = String(day.day).padStart(2, '0');
      const dayDir = path.join(SITE_DIR, 'march', `day-${dp}`);
      fs.mkdirSync(dayDir, { recursive: true });

      let dayBody = `
        <div class="day-header">
          <h2>${day.day} March</h2>
          <div class="day-date">${MARCH_DATES[day.day - 1] || ''} &middot; ${day.saintCount} entries</div>
          <div class="section-rule"></div>
        </div>
        <ul class="saint-list">`;

      for (const saint of day.saints) {
        const genre = guessGenre(saint);
        dayBody += `
          <li>
            <a href="${saint.slug}.html">${escapeHtml(saint.displayName)}</a>
            ${genreTagHtml(genre)}
          </li>`;
      }
      dayBody += '</ul>';

      const prevDay = di > 0 ? marDays[di - 1] : null;
      const nextDay = di < marDays.length - 1 ? marDays[di + 1] : null;

      fs.writeFileSync(path.join(dayDir, 'index.html'), htmlPage({
        title: `${day.day} March`,
        cssPath: '../../style.css',
        breadcrumb: `<a href="../../index.html">Home</a><span class="sep">&rsaquo;</span><a href="../index.html">March</a><span class="sep">&rsaquo;</span> ${day.day} March`,
        body: dayBody,
        prevLink: prevDay
          ? { href: `../day-${String(prevDay.day).padStart(2, '0')}/index.html`, label: `${prevDay.day} March` }
          : { href: '../index.html', label: 'March' },
        nextLink: nextDay
          ? { href: `../day-${String(nextDay.day).padStart(2, '0')}/index.html`, label: `${nextDay.day} March` }
          : null,
      }));

      // Saint pages
      for (let si = 0; si < day.saints.length; si++) {
        const saint = day.saints[si];
        const { bodyText, footnotes } = extractFootnotes(saint.parts[0]?.body || '');
        let articleHtml = mdToHtml(bodyText);
        articleHtml = linkFootnoteRefs(articleHtml, footnotes);
        const genre = guessGenre(saint);

        const saintBody = `
          <div class="saint-header">
            <h1>${escapeHtml(saint.displayName)}</h1>
            <div class="feast-date">${day.day} March &middot; ${genre}</div>
            <div class="section-rule"></div>
          </div>
          <article class="article">${articleHtml}</article>`;

        const prevSaint = si > 0 ? day.saints[si - 1] : null;
        const nextSaint = si < day.saints.length - 1 ? day.saints[si + 1] : null;

        fs.writeFileSync(path.join(dayDir, `${saint.slug}.html`), htmlPage({
          title: saint.displayName,
          cssPath: '../../style.css',
          breadcrumb: `<a href="../../index.html">Home</a><span class="sep">&rsaquo;</span><a href="../index.html">March</a><span class="sep">&rsaquo;</span><a href="index.html">${day.day} Mar</a><span class="sep">&rsaquo;</span> ${escapeHtml(saint.displayName)}`,
          body: saintBody,
          prevLink: prevSaint ? { href: `${prevSaint.slug}.html`, label: prevSaint.displayName }
            : { href: 'index.html', label: `${day.day} March` },
          nextLink: nextSaint ? { href: `${nextSaint.slug}.html`, label: nextSaint.displayName }
            : (nextDay ? { href: `../day-${String(nextDay.day).padStart(2, '0')}/index.html`, label: `${nextDay.day} March` } : null),
        }));
      }
    }
  }

  // ── Alphabetical Index of Saints ──
  const allSaints = [];
  // Add January saints
  for (const day of allJanDays) {
    const dp = String(day.day).padStart(2, '0');
    for (const saint of day.saints) {
      allSaints.push({
        displayName: saint.displayName,
        day: day.day,
        month: 'january',
        slug: saint.slug,
        dayPad: dp,
        genre: guessGenre(saint),
        words: saint.totalWords || 0,
      });
    }
  }
  // Add February saints
  for (const day of febDays) {
    const dp = String(day.day).padStart(2, '0');
    for (const saint of day.saints) {
      allSaints.push({
        displayName: saint.displayName,
        day: day.day,
        month: 'february',
        slug: saint.slug,
        dayPad: dp,
        genre: guessGenre(saint),
        words: saint.totalWords || 0,
      });
    }
  }
  // Add March saints
  for (const day of marDays) {
    const dp = String(day.day).padStart(2, '0');
    for (const saint of day.saints) {
      allSaints.push({
        displayName: saint.displayName,
        day: day.day,
        month: 'march',
        slug: saint.slug,
        dayPad: dp,
        genre: guessGenre(saint),
        words: saint.totalWords || 0,
      });
    }
  }
  allSaints.sort((a, b) => {
    // Sort numbers to end, then alphabetically
    const aNum = a.displayName.match(/^\d/);
    const bNum = b.displayName.match(/^\d/);
    if (aNum && !bNum) return 1;
    if (!aNum && bNum) return -1;
    return a.displayName.localeCompare(b.displayName, 'en', { sensitivity: 'base' });
  });

  let currentLetter = '';
  let indexBody = `
    <div class="section-header">
      <h1>Index of Saints</h1>
      <div class="subtitle">${allSaints.length} entries &middot; January, February &amp; March</div>
      <div class="section-rule"></div>
    </div>
    <div style="text-align:center; margin-bottom: 2rem; font-family: var(--font-ui); font-size: 0.72rem; letter-spacing: 0.15em;">`;

  // Letter jump links
  const letters = [...new Set(allSaints.map(s => {
    const first = s.displayName[0].toUpperCase();
    return first.match(/[A-Z]/) ? first : '#';
  }))];
  for (const letter of letters) {
    indexBody += `<a href="#letter-${letter}" style="color: var(--rubric); text-decoration: none; margin: 0 0.3em;">${letter}</a> `;
  }
  indexBody += '</div>';

  for (const saint of allSaints) {
    const firstChar = saint.displayName[0].toUpperCase();
    const letter = firstChar.match(/[A-Z]/) ? firstChar : '#';
    if (letter !== currentLetter) {
      currentLetter = letter;
      indexBody += `<h3 id="letter-${letter}" style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 600; color: var(--rubric); margin: 2rem 0 0.5rem; padding-bottom: 0.3rem; border-bottom: 1px solid var(--rule);">${letter}</h3>`;
    }
    const monthLabel = saint.month === 'march' ? 'Mar' : (saint.month === 'february' ? 'Feb' : 'Jan');
    const monthPath = saint.month || 'january';
    const wordLabel = saint.words > 1000 ? `${Math.round(saint.words / 1000)}k` : (saint.words > 0 ? `${saint.words}` : '');
    indexBody += `<div style="padding: 0.3rem 0; display: flex; justify-content: space-between; align-items: baseline;">
      <a href="${monthPath}/day-${saint.dayPad}/${saint.slug}.html" style="font-family: var(--font-body); color: var(--ink); text-decoration: none;">${escapeHtml(saint.displayName)}</a>
      <span style="font-family: var(--font-ui); font-size: 0.6rem; color: var(--ink-faint); letter-spacing: 0.08em; white-space: nowrap; margin-left: 1rem;">${saint.day} ${monthLabel} &middot; ${saint.genre}${wordLabel ? ' &middot; ' + wordLabel + ' words' : ''}</span>
    </div>`;
  }

  fs.writeFileSync(
    path.join(SITE_DIR, 'index-saints.html'),
    htmlPage({
      title: 'Index of Saints',
      cssPath: 'style.css',
      breadcrumb: '<a href="index.html">Home</a><span class="sep">&rsaquo;</span> Index of Saints',
      body: indexBody,
      prevLink: { href: 'index.html', label: 'Home' },
      nextLink: { href: 'january/index.html', label: 'January' },
    })
  );

  // Summary
  let totalPages = 1 + 1 + 1; // landing + january index + saints index
  for (const day of days) {
    totalPages += 1 + day.saintCount; // day index + saint pages
  }
  console.log(`Built ${totalPages} pages (${totalSaints} saint entries across ${totalDays} days)`);
}

const GENRE_TOOLTIPS = {
  commentary: 'The Bollandists\u2019 own introduction, annotations, and critical discussion of sources.',
  vita: 'A biographical account of a saint\u2019s life, ranging from near-contemporary records to later compilations.',
  passio: 'An account of a martyr\u2019s suffering and death. Early passiones based on court records are among the most historically reliable hagiographic documents.',
  miracula: 'A collection of miracles attributed to a saint, usually organized around a shrine.',
  translatio: 'An account of the transfer of a saint\u2019s relics from one location to another.',
};

/** Guess genre from text content */
function guessGenre(saint) {
  const firstBody = saint.parts[0]?.body?.toLowerCase() || '';
  if (firstBody.includes('commentary') || firstBody.includes('[commentary]')) return 'commentary';
  if (firstBody.includes('passio') || firstBody.includes('martyrdom')) return 'passio';
  if (firstBody.includes('translatio') || firstBody.includes('translation of')) return 'translatio';
  if (firstBody.includes('miracul')) return 'miracula';
  if (firstBody.includes('vita') || firstBody.includes('life of')) return 'vita';
  return 'vita';
}

function genreTagHtml(genre) {
  const tooltip = GENRE_TOOLTIPS[genre] || '';
  return `<span class="genre-tag" tabindex="0" data-tooltip="${escapeHtml(tooltip)}">${genre}</span>`;
}

buildSite();
