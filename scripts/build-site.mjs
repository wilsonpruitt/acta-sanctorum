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
const SITE_BASE_URL = 'https://actasanctorum.org';

// Open Corpus reading-layer contract (~/open-corpus/PLAN.md item 5): schema.org
// CreativeWork JSON-LD for a saint entry. `relPath` is the page's path relative
// to SITE_DIR, e.g. "february/day-02/some-saint.html".
function saintJsonLd(saint, relPath, dayNum) {
  const month = relPath.split('/')[0];
  const monthTitle = month.charAt(0).toUpperCase() + month.slice(1);
  const canonical = `${SITE_BASE_URL}/${relPath}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': canonical,
    url: canonical,
    name: saint.displayName,
    translator: { '@type': 'Organization', name: 'Wroot Press' },
    publisher: { '@type': 'Organization', name: 'Wroot Press', url: 'https://wrootpress.com' },
    inLanguage: ['en', 'la'],
    isBasedOn: { '@type': 'Book', name: `Acta Sanctorum, ${monthTitle} ${dayNum}` },
    isPartOf: { '@type': 'Collection', '@id': `${SITE_BASE_URL}/${month}/` },
    license: `${SITE_BASE_URL}/rights.html`,
  };
}

// Plain-text and JSON siblings (reading-layer contract item 7): a saint
// page's canonical is <relPath ending .html>; its siblings are the literal
// files with .txt/.json in place of .html next to it.
function writeSaintSiblings(saint, relPath, dayNum) {
  const month = relPath.split('/')[0];
  const monthTitle = month.charAt(0).toUpperCase() + month.slice(1);
  const canonical = `${SITE_BASE_URL}/${relPath}`;
  const combinedBody = saint.parts
    .map(p => p.body.replace(/<!--.*?-->\n*/g, ''))
    .join('\n\n');
  const { bodyText } = extractFootnotes(combinedBody);

  const header = [
    saint.displayName,
    `Acta Sanctorum, ${monthTitle} ${dayNum}`,
    'Source text: Public Domain. English translation/apparatus/encoding: CC BY-NC 4.0, Wroot Press.',
    canonical,
    '-'.repeat(40),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(SITE_DIR, relPath.replace(/\.html$/, '.txt')), header + '\n' + bodyText.trim() + '\n');

  const record = {
    id: saint.slug,
    url: canonical,
    site: 'acta-sanctorum',
    collection: `${month}/day-${String(dayNum).padStart(2, '0')}`,
    title: saint.displayName,
    languages: ['en'],
    source_edition: `Acta Sanctorum, ${monthTitle} ${dayNum}`,
    source_text: null,
    english: bodyText,
    license_source: 'Public Domain Mark 1.0',
    license_translation: 'CC BY-NC 4.0',
    license_apparatus: 'CC BY-NC 4.0',
    generated: new Date().toISOString().slice(0, 10),
  };
  fs.writeFileSync(path.join(SITE_DIR, relPath.replace(/\.html$/, '.json')), JSON.stringify(record, null, 2) + '\n');
}
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
  name = name.replace(/\s*\([^)]*\)/g, '');              // drop parenthetical variants: "Gudula (Gudrun)" → "Gudula"
  name = name.replace(/ und Gefährten$/, ' and Companions');
  name = name.replace(/ die Ältere$/, ' the Elder');
  name = name.replace(/ der Ältere$/, ' the Elder');
  name = name.replace(/ der Große$/, ' the Great');
  name = name.replace(/ der Grosse$/, ' the Great');
  name = name.replace(/ der Bekenner$/, ' the Confessor');
  name = name.replace(/ von /g, ' of ');
  name = name.replace(/ van /g, ' of ');                  // Dutch "van"
  name = name.replace(/ und /g, ' and ');                 // general "und"
  name = name.replace(/ der /g, ' the ');                 // general "der"
  name = name.replace(/Gefährten/g, 'Companions');
  name = name.replace(/Konstantinopel/g, 'Constantinople');
  name = name.replace(/\bTheben\b/g, 'Thebes');
  name = name.replace(/\bSyracus\b/g, 'Syracuse');
  name = name.replace(/\bRom\b/g, 'Rome');
  name = name.replace(/Märtyrer/g, 'Martyrs');
  name = name.replace(/Mönche/g, 'Monks');
  name = name.replace(/Soldaten/g, 'Soldiers');
  return name.replace(/\s+/g, ' ').trim();
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

/** Extract footnotes (lines starting with "a." "b." etc.) and return {html, footnotes}
 *
 * Handles three source conventions:
 *   1. Period form    — `a. Text`  (feb, jan-vol2, most of mar)
 *   2. Bracketed form — `[a] Text` (most of apr)
 *   3. No-period form — `a Text`   (apr, jan-vol1, some of mar)
 *
 * Period and bracketed forms are unambiguous and accepted anywhere.
 * No-period form risks false positives on wrapped body paragraphs that happen
 * to start with the English article "a" or pronoun "i", so it is only
 * accepted when:
 *   - inside a NOTES section (after a `NOTES` header, until a CHAPTER/§/[N]
 *     section boundary), OR
 *   - the chunk has ≥2 distinct no-period candidate letters (cluster rule), OR
 *   - the letter is not 'a' or 'i' (safe letters), OR
 *   - for 'a'/'i' singletons, the following word starts with a capital letter.
 */
function extractFootnotes(text) {
  const lines = text.split('\n');
  const footnotes = [];
  const bodyLines = [];

  const periodForm = /^([a-o])\.\s+(.+)$/;
  const bracketForm = /^\[([a-o])\]\s+(.+)$/;
  const noPeriodForm = /^([a-o])\s+(.+)$/;
  const notesHeader = /^(NOTES|ANNOTATIONS)\.?$/i;
  // Lines that close the NOTES scope. Covers the common headers that appear
  // after notes blocks across the corpus: CHAPTER, APPENDIX, PROLOGUE,
  // HISTORY OF…, PRELIMINARY…, PART, BOOK, §, and numbered paragraphs like
  // `[12]`. We also accept any ALL-CAPS heading-like line (≥4 chars, contains
  // a space or period) as a generic fallback — loose boundaries are safer
  // than leaving NOTES scope open across body text.
  const sectionBoundary =
    /^(CHAPTER\b|APPENDIX\b|PROLOGUE\b|EPILOGUE\b|PART\b|BOOK\b|§|\[\d+\]|[A-Z][A-Z0-9 .,'\-]{3,}\.?$)/;

  // Pre-scan: count distinct no-period letters to decide cluster mode.
  const noPeriodLetters = new Set();
  for (const line of lines) {
    const t = line.trim();
    if (periodForm.test(t) || bracketForm.test(t)) continue;
    const m = t.match(noPeriodForm);
    if (m && m[2].length > 20) noPeriodLetters.add(m[1]);
  }
  const inCluster = noPeriodLetters.size >= 2;

  let inNotesScope = false;
  // Accumulator for a multi-paragraph bracketed def: apr translations often
  // wrap a single note's text across several blank-separated paragraphs.
  // When in NOTES scope, every line that isn't a new def or section boundary
  // is folded into the current def.
  let currentDef = null;
  const flushCurrentDef = () => {
    if (currentDef) {
      footnotes.push(currentDef);
      currentDef = null;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (notesHeader.test(trimmed)) {
      flushCurrentDef();
      inNotesScope = true;
      bodyLines.push(line);
      continue;
    }

    // Section boundaries close the NOTES scope.
    if (inNotesScope && sectionBoundary.test(trimmed)) {
      flushCurrentDef();
      inNotesScope = false;
    }

    // Period form — always accepted
    const mP = trimmed.match(periodForm);
    if (mP && mP[2].length > 20) {
      flushCurrentDef();
      footnotes.push({ letter: mP[1], text: mP[2] });
      continue;
    }

    // Bracketed form — always accepted (unambiguous: paragraph markers use digits).
    // In NOTES scope, accept even very short first lines since continuation
    // paragraphs will fill in the rest.
    const mB = trimmed.match(bracketForm);
    if (mB && (mB[2].length > 20 || inNotesScope)) {
      flushCurrentDef();
      currentDef = { letter: mB[1], text: mB[2] };
      continue;
    }
    // Also accept bare `[letter]` with no trailing text in NOTES scope
    // (e.g. ursmar `[k]` on its own line).
    const mBempty = trimmed.match(/^\[([a-o])\]\s*$/);
    if (mBempty && inNotesScope) {
      flushCurrentDef();
      currentDef = { letter: mBempty[1], text: '' };
      continue;
    }

    // No-period form — gated by context to avoid body-paragraph false positives
    const mN = trimmed.match(noPeriodForm);
    if (mN && mN[2].length > 20) {
      const letter = mN[1];
      const rest = mN[2];
      const safeLetter = letter !== 'a' && letter !== 'i';
      const startsWithCapital = /^[A-Z]/.test(rest);
      if (inNotesScope || inCluster || safeLetter || startsWithCapital) {
        flushCurrentDef();
        footnotes.push({ letter, text: rest });
        continue;
      }
    }

    // Continuation line for the current bracketed def
    if (currentDef && inNotesScope) {
      if (trimmed.length > 0) {
        currentDef.text = currentDef.text
          ? `${currentDef.text} ${trimmed}`
          : trimmed;
      }
      continue;
    }

    bodyLines.push(line);
  }
  flushCurrentDef();

  return { bodyText: bodyLines.join('\n'), footnotes };
}

/** Link inline footnote markers `[a]`, `[b]`, … to their definitions and
 *  append a notes block. Only links letters that have a corresponding
 *  footnote definition, so orphan markers render as plain text rather than
 *  broken links.
 *
 *  The bracketed `[letter]` convention is the only inline marker format
 *  preserved across translations; bare single letters are ambiguous with
 *  English words (article "a", pronoun "i") and are intentionally not linked.
 *  Paragraph markers like `[1]` use digits so they don't collide.
 */
function linkFootnoteRefs(html, footnotes) {
  return appendFootnoteBlock(linkInlineBracketRefs(html, footnotes, ''), footnotes, '');
}

/** Link footnotes with a unique suffix to avoid ID collisions across chunks */
function linkFootnoteRefsWithSuffix(html, footnotes, suffix) {
  return appendFootnoteBlock(linkInlineBracketRefs(html, footnotes, suffix), footnotes, suffix);
}

// Files with multiple NOTES sections reuse letters (e.g. zeno has three `a`
// definitions). Pair inline refs to defs in reading order using per-letter
// occurrence counts, so the Nth `[a]` ref links to the Nth `a` def.
function linkInlineBracketRefs(html, footnotes, suffix) {
  if (footnotes.length === 0) return html;
  const defCountsByLetter = {};
  for (const fn of footnotes) {
    defCountsByLetter[fn.letter] = (defCountsByLetter[fn.letter] || 0) + 1;
  }
  const refCounts = {};
  return html.replace(/\[([a-o])\]/g, (match, letter) => {
    if (!defCountsByLetter[letter]) return match;
    const n = (refCounts[letter] = (refCounts[letter] || 0) + 1);
    if (n > defCountsByLetter[letter]) return match; // orphan inline ref
    const occ = n > 1 ? `-${n}` : '';
    const refId = `fnref-${letter}${suffix}${occ}`;
    const fnId = `fn-${letter}${suffix}${occ}`;
    return `<sup class="fn-ref" id="${refId}"><a href="#${fnId}">${letter}</a></sup>`;
  });
}

function appendFootnoteBlock(html, footnotes, suffix) {
  if (footnotes.length === 0) return html;
  let fnHtml = '<div class="footnotes"><h4>Notes</h4>';
  const letterCounts = {};
  for (const fn of footnotes) {
    const n = (letterCounts[fn.letter] = (letterCounts[fn.letter] || 0) + 1);
    const occ = n > 1 ? `-${n}` : '';
    const fnId = `fn-${fn.letter}${suffix}${occ}`;
    const refId = `fnref-${fn.letter}${suffix}${occ}`;
    fnHtml += `<div class="footnote" id="${fnId}"><span class="fn-num"><a href="#${refId}" style="color: var(--rubric); text-decoration: none;">${fn.letter}.</a></span> ${escapeHtml(fn.text)}</div>`;
  }
  fnHtml += '</div>';
  return html + fnHtml;
}

/** Render a saint's full article.
 *
 *  Parts are concatenated *before* footnote extraction so inline refs in one
 *  part can resolve to definitions in a later part (chunk boundaries in the
 *  scrape sometimes split a notes section — the body ends up in chunk N and
 *  the `NOTES.` block in chunk N+1). Per-letter occurrence counting in
 *  appendFootnoteBlock/linkInlineBracketRefs keeps duplicate letters from
 *  multiple NOTES sections unique.
 */
function renderSaintArticle(saint) {
  const combinedBody = saint.parts
    .map(p => p.body.replace(/<!--.*?-->\n*/g, ''))
    .join('\n\n');
  const { bodyText, footnotes } = extractFootnotes(combinedBody);
  let articleHtml = mdToHtml(bodyText);
  if (footnotes.length > 0) {
    articleHtml = linkFootnoteRefsWithSuffix(articleHtml, footnotes, '');
  }
  return articleHtml;
}

/** Render a facing-column verse block: original (left) beside translation (right). */
function renderVerseCols(latinLines, englishLines) {
  const trimEdges = (arr) => {
    let a = arr.slice();
    while (a.length && a[0].trim() === '') a.shift();
    while (a.length && a[a.length - 1].trim() === '') a.pop();
    return a;
  };
  const col = (lines, label, langClass) => {
    let out = `<div class="verse-col ${langClass}"><div class="verse-col-label">${label}</div>`;
    for (const raw of trimEdges(lines)) {
      const t = raw.trim();
      out += t === ''
        ? '<div class="verse-gap"></div>'
        : `<div class="verse-line">${escapeHtml(t)}</div>`;
    }
    return out + '</div>';
  };
  return `<div class="verse-cols">${col(latinLines, 'Latin', 'verse-latin')}${col(englishLines, 'English', 'verse-english')}</div>\n`;
}

/** Convert markdown-ish text to simple HTML */
function mdToHtml(text) {
  const lines = text.split('\n');
  let html = '';
  let inParagraph = false;
  let verseMode = null; // null | 'latin' | 'english'
  let verseLatin = [];
  let verseEnglish = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Facing-column verse block: "::: versecols" … "|||" … ":::"
    if (verseMode === null && trimmed === '::: versecols') {
      if (inParagraph) { html += '</p>\n'; inParagraph = false; }
      verseMode = 'latin'; verseLatin = []; verseEnglish = [];
      continue;
    }
    if (verseMode !== null) {
      if (trimmed === '|||') { verseMode = 'english'; continue; }
      if (trimmed === ':::') {
        html += renderVerseCols(verseLatin, verseEnglish);
        verseMode = null;
        continue;
      }
      (verseMode === 'latin' ? verseLatin : verseEnglish).push(line);
      continue;
    }

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

const EXPORT_LINKS = '<div class="export-links"><a href="javascript:print()">Save as PDF</a></div>';

function htmlPage({ title, cssPath, breadcrumb, body, prevLink, nextLink, canonicalPath, jsonLd }) {
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
  ${canonicalPath ? `<link rel="canonical" href="${SITE_BASE_URL}/${canonicalPath}">\n  ` : ''}<link rel="icon" href="${cssPath.replace('style.css', '')}favicon.svg" type="image/svg+xml">
  ${FONT_LINKS}
  <link rel="stylesheet" href="${cssPath}">
  <link rel="stylesheet" href="${cssPath.replace('style.css', '')}pagefind/pagefind-ui.css">
  ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n  ` : ''}<script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
  <div class="page">
    <header class="site-header">
      <a href="${cssPath.replace('style.css', '')}index.html">Acta Sanctorum</a>
      <a class="header-support" href="#support">Support</a>
    </header>
    ${breadcrumb ? `<nav class="breadcrumb">${breadcrumb}</nav>` : ''}
    ${body}
    <nav class="page-nav">
      ${prev}
      ${next}
    </nav>
    <section class="site-feedback">
      <h2>Feedback</h2>
      <p>Noticed an error, have a suggestion, or want to share a thought? Let me know.</p>
      <form action="https://formspree.io/f/mwvwdjpz" method="POST">
        <label>
          <span>Your email (optional)</span>
          <input type="email" name="email" placeholder="you@example.com">
        </label>
        <label>
          <span>Message</span>
          <textarea name="message" rows="4" required></textarea>
        </label>
        <input type="hidden" name="_page" value="${escapeHtml(title)}">
        <button type="submit">Send</button>
      </form>
    </section>
    <section class="site-support" id="support">
      <h2>Support the Translation</h2>
      <p>The Acta Sanctorum has never been available in English. This site is translating all of it: January through July are done, August is underway, and the calendar runs to November&nbsp;10, where the Bollandists stopped in 1940. The scholarship pipeline is built; what remains is a compute bill. Contributions go directly to translating more of the calendar.</p>
      <div class="support-tiers">
        <a href="https://buy.stripe.com/6oUcN4fPfb5cfQS6Lh4gg06" target="_blank" rel="noopener">$10 &mdash; a feast day</a>
        <a href="https://buy.stripe.com/fZu14mdH74GObAC4D94gg07" target="_blank" rel="noopener">$300 &mdash; a month</a>
        <a href="https://buy.stripe.com/cNi5kC8mN2yG5ce6Lh4gg0b" target="_blank" rel="noopener">$10/mo &mdash; patron</a>
      </div>
      <p class="support-fine">The Acta was a funded enterprise for three centuries; the translation runs the same way. Everything here is free and stays free whether you give or not. Wroot Press is a small independent press &mdash; an imprint of Wroot Labs LLC, not a charity. Contributions aren't tax-deductible; they buy compute.</p>
    </section>
    <footer class="site-footer">
      Latin source: <a href="https://www.heiligenlexikon.de/ActaSanctorum/" target="_blank">Heiligenlexikon.de</a><br>
      English translation by Wilson Pruitt
      <span class="footer-rights">The Latin is public domain. The English translation, notes, and structured text are &copy; 2026 Wilson Pruitt, licensed <a href="${cssPath.replace('style.css', '')}rights.html">CC BY-NC 4.0</a> &mdash; free to share and build on, not to sell. <a href="${cssPath.replace('style.css', '')}rights.html">Commercial use, ask.</a></span>
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

/** Collect saints from split files (Vol II and February onward).
 *
 *  Files that share a slug (because the saint's sections were split across
 *  non-contiguous chunks) are merged into one saint with multiple parts in
 *  file order, so the renderer can concatenate them. Without this, the
 *  last file silently overwrote the earlier one.
 */
function collectSplitSaints(baseDir, dayStart, dayEnd) {
  const days = [];

  for (let d = dayStart; d <= dayEnd; d++) {
    const dp = String(d).padStart(2, '0');
    const saintsDir = path.join(TRANS_DIR, baseDir, `day-${dp}`, 'saints');

    if (!fs.existsSync(saintsDir)) continue;

    const files = fs.readdirSync(saintsDir).filter(f => f.endsWith('.md') && !f.includes('preamble')).sort();
    if (files.length === 0) continue;

    const saintsBySlug = new Map();
    const slugOrder = [];
    for (const file of files) {
      const content = fs.readFileSync(path.join(saintsDir, file), 'utf-8');
      const { meta, body } = parseFrontmatter(content, file);
      const displayName = meta.saint || 'Unknown';
      const slug = meta.slug || slugify(displayName);

      if (saintsBySlug.has(slug)) {
        const existing = saintsBySlug.get(slug);
        existing.parts.push({ file, meta, body });
        existing.totalWords += body.split(/\s+/).length;
      } else {
        saintsBySlug.set(slug, {
          name: displayName,
          displayName,
          slug,
          day: d,
          parts: [{ file, meta, body }],
          totalWords: body.split(/\s+/).length,
          sourceUrl: null,
        });
        slugOrder.push(slug);
      }
    }

    const saints = slugOrder.map(s => saintsBySlug.get(s));
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

// Hand-maintained files (~/open-corpus/PLAN.md's flagged first step for this
// site): site/ is gitignored, so these used to have no history. They now
// live in the tracked site-static/ and are copied in on every build.
const SITE_STATIC = path.join(ROOT, 'site-static');
function copySiteStatic() {
  fs.mkdirSync(SITE_DIR, { recursive: true });
  for (const f of fs.readdirSync(SITE_STATIC)) {
    fs.copyFileSync(path.join(SITE_STATIC, f), path.join(SITE_DIR, f));
  }
}

function buildSite() {
  copySiteStatic();
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
  const aprDays = collectSplitSaints('apr', 1, 30);
  const mayDays = collectSplitSaints('may', 1, 31);
  const junDays = collectSplitSaints('jun', 1, 30);
  const julDays = collectSplitSaints('jul', 1, 31);
  const augDays = collectSplitSaints('aug', 1, 31);
  const sepDays = collectSplitSaints('sep', 1, 30); // September has 30 days
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
  const aprSaints = aprDays.reduce((s, d) => s + d.saintCount, 0);
  const aprDayCount = aprDays.length;
  const maySaints = mayDays.reduce((s, d) => s + d.saintCount, 0);
  const mayDayCount = mayDays.length;
  const junSaints = junDays.reduce((s, d) => s + d.saintCount, 0);
  const junDayCount = junDays.length;
  const julSaints = julDays.reduce((s, d) => s + d.saintCount, 0);
  const julDayCount = julDays.length;
  const augSaints = augDays.reduce((s, d) => s + d.saintCount, 0);
  const augDayCount = augDays.length;
  const sepSaints = sepDays.reduce((s, d) => s + d.saintCount, 0);
  const sepDayCount = sepDays.length;
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
        presents ${totalSaints + febSaints + marSaints + aprSaints + maySaints + junSaints + julSaints + augSaints + sepSaints} saint entries across January through ${sepSaints > 0 ? 'September' : (augSaints > 0 ? 'August' : (julSaints > 0 ? 'July' : (junSaints > 0 ? 'June' : (maySaints > 0 ? 'May' : (aprSaints > 0 ? 'April' : 'March')))))},
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
        ${aprSaints > 0
          ? `<div class="month-link">
          <a href="april/index.html">Aprilis &middot; April</a>
          <span class="vol-count">${aprSaints} entries</span>
        </div>`
          : `<div class="month-link disabled">Aprilis <span class="vol-count">in progress</span></div>`}
        ${maySaints > 0
          ? `<div class="month-link">
          <a href="may/index.html">Maius &middot; May</a>
          <span class="vol-count">${maySaints} entries</span>
        </div>`
          : `<div class="month-link disabled">Maius <span class="vol-count">forthcoming</span></div>`}
        ${junSaints > 0
          ? `<div class="month-link">
          <a href="june/index.html">Iunius &middot; June</a>
          <span class="vol-count">${junSaints} entries</span>
        </div>`
          : `<div class="month-link disabled">Iunius <span class="vol-count">forthcoming</span></div>`}
        ${julSaints > 0
          ? `<div class="month-link">
          <a href="july/index.html">Iulius &middot; July</a>
          <span class="vol-count">${julSaints} entries${julDayCount < 31 ? ' (in progress)' : ''}</span>
        </div>`
          : `<div class="month-link disabled">Iulius <span class="vol-count">forthcoming</span></div>`}
        ${augSaints > 0
          ? `<div class="month-link">
          <a href="august/index.html">Augustus &middot; August</a>
          <span class="vol-count">${augSaints} entries${augDayCount < 31 ? ' (in progress)' : ''}</span>
        </div>`
          : `<div class="month-link disabled">Augustus <span class="vol-count">forthcoming</span></div>`}
        ${sepSaints > 0
          ? `<div class="month-link">
          <a href="september/index.html">September</a>
          <span class="vol-count">${sepSaints} entries${sepDayCount < 30 ? ' (in progress)' : ''}</span>
        </div>`
          : `<div class="month-link disabled">September <span class="vol-count">forthcoming</span></div>`}
        <div class="month-link disabled">October <span class="vol-count">forthcoming</span></div>
        <div class="month-link disabled">November <span class="vol-count">forthcoming</span></div>
        <div class="month-link disabled">December <span class="vol-count">&mdash;</span></div>
      </div>
      <div class="search-container">
        <div id="search"></div>
      </div>
      <div style="max-width: 540px; margin: 3rem auto 0; padding: 1.6rem 2rem; background: var(--parchment-deep); border: 1px solid var(--rule); text-align: center;">
        <div style="font-family: var(--font-ui); font-size: 0.62rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ink-faint);">Now Available</div>
        <div style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 400; color: var(--rubric); margin: 0.5rem 0 0.4rem;">A Daily Devotional</div>
        <div style="font-family: var(--font-body); font-size: 0.9rem; color: var(--ink-light); line-height: 1.5;">One saint for each day of the year, drawn from these texts &mdash; published as a paperback.</div>
        <a href="https://www.amazon.com/dp/B0H6KPXHVY" style="display: inline-block; margin-top: 1rem; font-family: var(--font-ui); font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--rubric); text-decoration: none; border-bottom: 1px solid var(--rubric);">View on Amazon &rarr;</a>
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

      const articleHtml = renderSaintArticle(saint);

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
        ${EXPORT_LINKS}
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
        const articleHtml = renderSaintArticle(saint);
        const genre = guessGenre(saint);

        const saintBody = `
          <div class="saint-header">
            <h1>${escapeHtml(saint.displayName)}</h1>
            <div class="feast-date">${day.day} February &middot; ${genre}</div>
            <div class="section-rule"></div>
          </div>
          ${EXPORT_LINKS}
          <article class="article">${articleHtml}</article>`;

        const prevSaint = si > 0 ? day.saints[si - 1] : null;
        const nextSaint = si < day.saints.length - 1 ? day.saints[si + 1] : null;

        fs.writeFileSync(path.join(dayDir, `${saint.slug}.html`), htmlPage({
          title: saint.displayName,
          cssPath: '../../style.css',
          canonicalPath: `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`,
          jsonLd: saintJsonLd(saint, `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`, day.day),
          breadcrumb: `<a href="../../index.html">Home</a><span class="sep">&rsaquo;</span><a href="../index.html">February</a><span class="sep">&rsaquo;</span><a href="index.html">${day.day} Feb</a><span class="sep">&rsaquo;</span> ${escapeHtml(saint.displayName)}`,
          body: saintBody,
          prevLink: prevSaint ? { href: `${prevSaint.slug}.html`, label: prevSaint.displayName }
            : { href: 'index.html', label: `${day.day} February` },
          nextLink: nextSaint ? { href: `${nextSaint.slug}.html`, label: nextSaint.displayName }
            : (nextDay ? { href: `../day-${String(nextDay.day).padStart(2, '0')}/index.html`, label: `${nextDay.day} February` } : null),
        }));
        writeSaintSiblings(saint, `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`, day.day);
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
        nextLink: aprDays.length > 0 ? { href: '../april/index.html', label: 'April' } : null,
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
        const articleHtml = renderSaintArticle(saint);
        const genre = guessGenre(saint);

        const saintBody = `
          <div class="saint-header">
            <h1>${escapeHtml(saint.displayName)}</h1>
            <div class="feast-date">${day.day} March &middot; ${genre}</div>
            <div class="section-rule"></div>
          </div>
          ${EXPORT_LINKS}
          <article class="article">${articleHtml}</article>`;

        const prevSaint = si > 0 ? day.saints[si - 1] : null;
        const nextSaint = si < day.saints.length - 1 ? day.saints[si + 1] : null;

        fs.writeFileSync(path.join(dayDir, `${saint.slug}.html`), htmlPage({
          title: saint.displayName,
          cssPath: '../../style.css',
          canonicalPath: `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`,
          jsonLd: saintJsonLd(saint, `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`, day.day),
          breadcrumb: `<a href="../../index.html">Home</a><span class="sep">&rsaquo;</span><a href="../index.html">March</a><span class="sep">&rsaquo;</span><a href="index.html">${day.day} Mar</a><span class="sep">&rsaquo;</span> ${escapeHtml(saint.displayName)}`,
          body: saintBody,
          prevLink: prevSaint ? { href: `${prevSaint.slug}.html`, label: prevSaint.displayName }
            : { href: 'index.html', label: `${day.day} March` },
          nextLink: nextSaint ? { href: `${nextSaint.slug}.html`, label: nextSaint.displayName }
            : (nextDay ? { href: `../day-${String(nextDay.day).padStart(2, '0')}/index.html`, label: `${nextDay.day} March` } : null),
        }));
        writeSaintSiblings(saint, `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`, day.day);
      }
    }
  }

  // ── April Pages ──
  if (aprDays.length > 0) {
    const APRIL_DATES = [
      'Kalendis Aprilis', 'IV Non. Apr.', 'III Non. Apr.', 'Prid. Non. Apr.',
      'Nonis Aprilis', 'VIII Id. Apr.', 'VII Id. Apr.', 'VI Id. Apr.',
      'V Id. Apr.', 'IV Id. Apr.', 'III Id. Apr.', 'Prid. Id. Apr.',
      'Idibus Aprilis', 'XVIII Kal. Mai.', 'XVII Kal. Mai.', 'XVI Kal. Mai.',
      'XV Kal. Mai.', 'XIV Kal. Mai.', 'XIII Kal. Mai.', 'XII Kal. Mai.',
      'XI Kal. Mai.', 'X Kal. Mai.', 'IX Kal. Mai.', 'VIII Kal. Mai.',
      'VII Kal. Mai.', 'VI Kal. Mai.', 'V Kal. Mai.', 'IV Kal. Mai.',
      'III Kal. Mai.', 'Prid. Kal. Mai.'
    ];

    // April index
    let aprBody = `
      <div class="section-header">
        <h1>Aprilis</h1>
        <div class="subtitle">April &middot; Days 1&ndash;${aprDayCount} &middot; ${aprSaints} entries${aprDayCount < 30 ? ' (in progress)' : ''}</div>
        <div class="section-rule"></div>
      </div>
      <div class="day-grid">`;

    for (const day of aprDays) {
      const dp = String(day.day).padStart(2, '0');
      const romanDate = APRIL_DATES[day.day - 1] || '';
      const topSaints = day.saints.slice(0, 5).map(s => s.displayName).join(', ');
      const more = day.saintCount > 5 ? ` + ${day.saintCount - 5} more` : '';
      aprBody += `
        <div class="day-card">
          <h3><a href="day-${dp}/index.html">${day.day} April</a></h3>
          <div class="saint-preview">${romanDate} &middot; ${day.saintCount} entries: ${escapeHtml(topSaints)}${more}</div>
        </div>`;
    }
    aprBody += '</div>';

    fs.mkdirSync(path.join(SITE_DIR, 'april'), { recursive: true });
    fs.writeFileSync(
      path.join(SITE_DIR, 'april/index.html'),
      htmlPage({
        title: 'April',
        cssPath: '../style.css',
        breadcrumb: '<a href="../index.html">Home</a><span class="sep">&rsaquo;</span> April',
        body: aprBody,
        prevLink: { href: '../march/index.html', label: 'March' },
        nextLink: mayDays.length > 0 ? { href: '../may/index.html', label: 'May' } : null,
      })
    );

    // April day + saint pages (same structure as January/February/March)
    for (let di = 0; di < aprDays.length; di++) {
      const day = aprDays[di];
      const dp = String(day.day).padStart(2, '0');
      const dayDir = path.join(SITE_DIR, 'april', `day-${dp}`);
      fs.mkdirSync(dayDir, { recursive: true });

      let dayBody = `
        <div class="day-header">
          <h2>${day.day} April</h2>
          <div class="day-date">${APRIL_DATES[day.day - 1] || ''} &middot; ${day.saintCount} entries</div>
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

      const prevDay = di > 0 ? aprDays[di - 1] : null;
      const nextDay = di < aprDays.length - 1 ? aprDays[di + 1] : null;

      fs.writeFileSync(path.join(dayDir, 'index.html'), htmlPage({
        title: `${day.day} April`,
        cssPath: '../../style.css',
        breadcrumb: `<a href="../../index.html">Home</a><span class="sep">&rsaquo;</span><a href="../index.html">April</a><span class="sep">&rsaquo;</span> ${day.day} April`,
        body: dayBody,
        prevLink: prevDay
          ? { href: `../day-${String(prevDay.day).padStart(2, '0')}/index.html`, label: `${prevDay.day} April` }
          : { href: '../index.html', label: 'April' },
        nextLink: nextDay
          ? { href: `../day-${String(nextDay.day).padStart(2, '0')}/index.html`, label: `${nextDay.day} April` }
          : null,
      }));

      // Saint pages
      for (let si = 0; si < day.saints.length; si++) {
        const saint = day.saints[si];
        const articleHtml = renderSaintArticle(saint);
        const genre = guessGenre(saint);

        const saintBody = `
          <div class="saint-header">
            <h1>${escapeHtml(saint.displayName)}</h1>
            <div class="feast-date">${day.day} April &middot; ${genre}</div>
            <div class="section-rule"></div>
          </div>
          ${EXPORT_LINKS}
          <article class="article">${articleHtml}</article>`;

        const prevSaint = si > 0 ? day.saints[si - 1] : null;
        const nextSaint = si < day.saints.length - 1 ? day.saints[si + 1] : null;

        fs.writeFileSync(path.join(dayDir, `${saint.slug}.html`), htmlPage({
          title: saint.displayName,
          cssPath: '../../style.css',
          canonicalPath: `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`,
          jsonLd: saintJsonLd(saint, `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`, day.day),
          breadcrumb: `<a href="../../index.html">Home</a><span class="sep">&rsaquo;</span><a href="../index.html">April</a><span class="sep">&rsaquo;</span><a href="index.html">${day.day} Apr</a><span class="sep">&rsaquo;</span> ${escapeHtml(saint.displayName)}`,
          body: saintBody,
          prevLink: prevSaint ? { href: `${prevSaint.slug}.html`, label: prevSaint.displayName }
            : { href: 'index.html', label: `${day.day} April` },
          nextLink: nextSaint ? { href: `${nextSaint.slug}.html`, label: nextSaint.displayName }
            : (nextDay ? { href: `../day-${String(nextDay.day).padStart(2, '0')}/index.html`, label: `${nextDay.day} April` } : null),
        }));
        writeSaintSiblings(saint, `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`, day.day);
      }
    }
  }

  // ── May Pages ──
  if (mayDays.length > 0) {
    const MAY_DATES = [
      'Kalendis Maii', 'VI Non. Mai.', 'V Non. Mai.', 'IV Non. Mai.',
      'III Non. Mai.', 'Prid. Non. Mai.', 'Nonis Maii', 'VIII Id. Mai.',
      'VII Id. Mai.', 'VI Id. Mai.', 'V Id. Mai.', 'IV Id. Mai.',
      'III Id. Mai.', 'Prid. Id. Mai.', 'Idibus Maii', 'XVII Kal. Iun.',
      'XVI Kal. Iun.', 'XV Kal. Iun.', 'XIV Kal. Iun.', 'XIII Kal. Iun.',
      'XII Kal. Iun.', 'XI Kal. Iun.', 'X Kal. Iun.', 'IX Kal. Iun.',
      'VIII Kal. Iun.', 'VII Kal. Iun.', 'VI Kal. Iun.', 'V Kal. Iun.',
      'IV Kal. Iun.', 'III Kal. Iun.', 'Prid. Kal. Iun.'
    ];

    // May index
    let mayBody = `
      <div class="section-header">
        <h1>Maius</h1>
        <div class="subtitle">May &middot; Days 1&ndash;${mayDayCount} &middot; ${maySaints} entries${mayDayCount < 31 ? ' (in progress)' : ''}</div>
        <div class="section-rule"></div>
      </div>
      <div class="day-grid">`;

    for (const day of mayDays) {
      const dp = String(day.day).padStart(2, '0');
      const romanDate = MAY_DATES[day.day - 1] || '';
      const topSaints = day.saints.slice(0, 5).map(s => s.displayName).join(', ');
      const more = day.saintCount > 5 ? ` + ${day.saintCount - 5} more` : '';
      mayBody += `
        <div class="day-card">
          <h3><a href="day-${dp}/index.html">${day.day} May</a></h3>
          <div class="saint-preview">${romanDate} &middot; ${day.saintCount} entries: ${escapeHtml(topSaints)}${more}</div>
        </div>`;
    }
    mayBody += '</div>';

    fs.mkdirSync(path.join(SITE_DIR, 'may'), { recursive: true });
    fs.writeFileSync(
      path.join(SITE_DIR, 'may/index.html'),
      htmlPage({
        title: 'May',
        cssPath: '../style.css',
        breadcrumb: '<a href="../index.html">Home</a><span class="sep">&rsaquo;</span> May',
        body: mayBody,
        prevLink: { href: '../april/index.html', label: 'April' },
        nextLink: junDays.length > 0 ? { href: '../june/index.html', label: 'June' } : null,
      })
    );

    // May day + saint pages (same structure as January/February/March/April)
    for (let di = 0; di < mayDays.length; di++) {
      const day = mayDays[di];
      const dp = String(day.day).padStart(2, '0');
      const dayDir = path.join(SITE_DIR, 'may', `day-${dp}`);
      fs.mkdirSync(dayDir, { recursive: true });

      let dayBody = `
        <div class="day-header">
          <h2>${day.day} May</h2>
          <div class="day-date">${MAY_DATES[day.day - 1] || ''} &middot; ${day.saintCount} entries</div>
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

      const prevDay = di > 0 ? mayDays[di - 1] : null;
      const nextDay = di < mayDays.length - 1 ? mayDays[di + 1] : null;

      fs.writeFileSync(path.join(dayDir, 'index.html'), htmlPage({
        title: `${day.day} May`,
        cssPath: '../../style.css',
        breadcrumb: `<a href="../../index.html">Home</a><span class="sep">&rsaquo;</span><a href="../index.html">May</a><span class="sep">&rsaquo;</span> ${day.day} May`,
        body: dayBody,
        prevLink: prevDay
          ? { href: `../day-${String(prevDay.day).padStart(2, '0')}/index.html`, label: `${prevDay.day} May` }
          : { href: '../index.html', label: 'May' },
        nextLink: nextDay
          ? { href: `../day-${String(nextDay.day).padStart(2, '0')}/index.html`, label: `${nextDay.day} May` }
          : null,
      }));

      // Saint pages
      for (let si = 0; si < day.saints.length; si++) {
        const saint = day.saints[si];
        const articleHtml = renderSaintArticle(saint);
        const genre = guessGenre(saint);

        const saintBody = `
          <div class="saint-header">
            <h1>${escapeHtml(saint.displayName)}</h1>
            <div class="feast-date">${day.day} May &middot; ${genre}</div>
            <div class="section-rule"></div>
          </div>
          ${EXPORT_LINKS}
          <article class="article">${articleHtml}</article>`;

        const prevSaint = si > 0 ? day.saints[si - 1] : null;
        const nextSaint = si < day.saints.length - 1 ? day.saints[si + 1] : null;

        fs.writeFileSync(path.join(dayDir, `${saint.slug}.html`), htmlPage({
          title: saint.displayName,
          cssPath: '../../style.css',
          canonicalPath: `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`,
          jsonLd: saintJsonLd(saint, `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`, day.day),
          breadcrumb: `<a href="../../index.html">Home</a><span class="sep">&rsaquo;</span><a href="../index.html">May</a><span class="sep">&rsaquo;</span><a href="index.html">${day.day} May</a><span class="sep">&rsaquo;</span> ${escapeHtml(saint.displayName)}`,
          body: saintBody,
          prevLink: prevSaint ? { href: `${prevSaint.slug}.html`, label: prevSaint.displayName }
            : { href: 'index.html', label: `${day.day} May` },
          nextLink: nextSaint ? { href: `${nextSaint.slug}.html`, label: nextSaint.displayName }
            : (nextDay ? { href: `../day-${String(nextDay.day).padStart(2, '0')}/index.html`, label: `${nextDay.day} May` } : null),
        }));
        writeSaintSiblings(saint, `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`, day.day);
      }
    }
  }

  // ── June Pages ──
  if (junDays.length > 0) {
    const JUNE_DATES = [
      'Kalendis Iunii', 'IV Non. Iun.', 'III Non. Iun.', 'Prid. Non. Iun.',
      'Nonis Iunii', 'VIII Id. Iun.', 'VII Id. Iun.', 'VI Id. Iun.',
      'V Id. Iun.', 'IV Id. Iun.', 'III Id. Iun.', 'Prid. Id. Iun.',
      'Idibus Iunii', 'XVIII Kal. Iul.', 'XVII Kal. Iul.', 'XVI Kal. Iul.',
      'XV Kal. Iul.', 'XIV Kal. Iul.', 'XIII Kal. Iul.', 'XII Kal. Iul.',
      'XI Kal. Iul.', 'X Kal. Iul.', 'IX Kal. Iul.', 'VIII Kal. Iul.',
      'VII Kal. Iul.', 'VI Kal. Iul.', 'V Kal. Iul.', 'IV Kal. Iul.',
      'III Kal. Iul.', 'Prid. Kal. Iul.'
    ];

    // June index
    let junBody = `
      <div class="section-header">
        <h1>Iunius</h1>
        <div class="subtitle">June &middot; Days 1&ndash;${junDayCount} &middot; ${junSaints} entries${junDayCount < 30 ? ' (in progress)' : ''}</div>
        <div class="section-rule"></div>
      </div>
      <div class="day-grid">`;

    for (const day of junDays) {
      const dp = String(day.day).padStart(2, '0');
      const romanDate = JUNE_DATES[day.day - 1] || '';
      const topSaints = day.saints.slice(0, 5).map(s => s.displayName).join(', ');
      const more = day.saintCount > 5 ? ` + ${day.saintCount - 5} more` : '';
      junBody += `
        <div class="day-card">
          <h3><a href="day-${dp}/index.html">${day.day} June</a></h3>
          <div class="saint-preview">${romanDate} &middot; ${day.saintCount} entries: ${escapeHtml(topSaints)}${more}</div>
        </div>`;
    }
    junBody += '</div>';

    fs.mkdirSync(path.join(SITE_DIR, 'june'), { recursive: true });
    fs.writeFileSync(
      path.join(SITE_DIR, 'june/index.html'),
      htmlPage({
        title: 'June',
        cssPath: '../style.css',
        breadcrumb: '<a href="../index.html">Home</a><span class="sep">&rsaquo;</span> June',
        body: junBody,
        prevLink: { href: '../may/index.html', label: 'May' },
        nextLink: julDays.length > 0 ? { href: '../july/index.html', label: 'July' } : null,
      })
    );

    // June day + saint pages (same structure as January/February/March/April/May)
    for (let di = 0; di < junDays.length; di++) {
      const day = junDays[di];
      const dp = String(day.day).padStart(2, '0');
      const dayDir = path.join(SITE_DIR, 'june', `day-${dp}`);
      fs.mkdirSync(dayDir, { recursive: true });

      let dayBody = `
        <div class="day-header">
          <h2>${day.day} June</h2>
          <div class="day-date">${JUNE_DATES[day.day - 1] || ''} &middot; ${day.saintCount} entries</div>
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

      const prevDay = di > 0 ? junDays[di - 1] : null;
      const nextDay = di < junDays.length - 1 ? junDays[di + 1] : null;

      fs.writeFileSync(path.join(dayDir, 'index.html'), htmlPage({
        title: `${day.day} June`,
        cssPath: '../../style.css',
        breadcrumb: `<a href="../../index.html">Home</a><span class="sep">&rsaquo;</span><a href="../index.html">June</a><span class="sep">&rsaquo;</span> ${day.day} June`,
        body: dayBody,
        prevLink: prevDay
          ? { href: `../day-${String(prevDay.day).padStart(2, '0')}/index.html`, label: `${prevDay.day} June` }
          : { href: '../index.html', label: 'June' },
        nextLink: nextDay
          ? { href: `../day-${String(nextDay.day).padStart(2, '0')}/index.html`, label: `${nextDay.day} June` }
          : null,
      }));

      for (let si = 0; si < day.saints.length; si++) {
        const saint = day.saints[si];
        const articleHtml = renderSaintArticle(saint);
        const genre = guessGenre(saint);

        const saintBody = `
          <div class="saint-header">
            <h1>${escapeHtml(saint.displayName)}</h1>
            <div class="feast-date">${day.day} June &middot; ${genre}</div>
            <div class="section-rule"></div>
          </div>
          ${EXPORT_LINKS}
          <article class="article">${articleHtml}</article>`;

        const prevSaint = si > 0 ? day.saints[si - 1] : null;
        const nextSaint = si < day.saints.length - 1 ? day.saints[si + 1] : null;

        fs.writeFileSync(path.join(dayDir, `${saint.slug}.html`), htmlPage({
          title: saint.displayName,
          cssPath: '../../style.css',
          canonicalPath: `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`,
          jsonLd: saintJsonLd(saint, `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`, day.day),
          breadcrumb: `<a href="../../index.html">Home</a><span class="sep">&rsaquo;</span><a href="../index.html">June</a><span class="sep">&rsaquo;</span><a href="index.html">${day.day} June</a><span class="sep">&rsaquo;</span> ${escapeHtml(saint.displayName)}`,
          body: saintBody,
          prevLink: prevSaint ? { href: `${prevSaint.slug}.html`, label: prevSaint.displayName }
            : { href: 'index.html', label: `${day.day} June` },
          nextLink: nextSaint ? { href: `${nextSaint.slug}.html`, label: nextSaint.displayName }
            : (nextDay ? { href: `../day-${String(nextDay.day).padStart(2, '0')}/index.html`, label: `${nextDay.day} June` } : null),
        }));
        writeSaintSiblings(saint, `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`, day.day);
      }
    }
  }

  // ── July Pages ──
  if (julDays.length > 0) {
    const JULY_DATES = [
      'Kalendis Iulii', 'VI Non. Iul.', 'V Non. Iul.', 'IV Non. Iul.',
      'III Non. Iul.', 'Prid. Non. Iul.', 'Nonis Iulii', 'VIII Id. Iul.',
      'VII Id. Iul.', 'VI Id. Iul.', 'V Id. Iul.', 'IV Id. Iul.',
      'III Id. Iul.', 'Prid. Id. Iul.', 'Idibus Iulii', 'XVII Kal. Aug.',
      'XVI Kal. Aug.', 'XV Kal. Aug.', 'XIV Kal. Aug.', 'XIII Kal. Aug.',
      'XII Kal. Aug.', 'XI Kal. Aug.', 'X Kal. Aug.', 'IX Kal. Aug.',
      'VIII Kal. Aug.', 'VII Kal. Aug.', 'VI Kal. Aug.', 'V Kal. Aug.',
      'IV Kal. Aug.', 'III Kal. Aug.', 'Prid. Kal. Aug.'
    ];

    // July index
    let julBody = `
      <div class="section-header">
        <h1>Iulius</h1>
        <div class="subtitle">July &middot; Days 1&ndash;${julDayCount} &middot; ${julSaints} entries${julDayCount < 31 ? ' (in progress)' : ''}</div>
        <div class="section-rule"></div>
      </div>
      <div class="day-grid">`;

    for (const day of julDays) {
      const dp = String(day.day).padStart(2, '0');
      const romanDate = JULY_DATES[day.day - 1] || '';
      const topSaints = day.saints.slice(0, 5).map(s => s.displayName).join(', ');
      const more = day.saintCount > 5 ? ` + ${day.saintCount - 5} more` : '';
      julBody += `
        <div class="day-card">
          <h3><a href="day-${dp}/index.html">${day.day} July</a></h3>
          <div class="saint-preview">${romanDate} &middot; ${day.saintCount} entries: ${escapeHtml(topSaints)}${more}</div>
        </div>`;
    }
    julBody += '</div>';

    fs.mkdirSync(path.join(SITE_DIR, 'july'), { recursive: true });
    fs.writeFileSync(
      path.join(SITE_DIR, 'july/index.html'),
      htmlPage({
        title: 'July',
        cssPath: '../style.css',
        breadcrumb: '<a href="../index.html">Home</a><span class="sep">&rsaquo;</span> July',
        body: julBody,
        prevLink: { href: '../june/index.html', label: 'June' },
        nextLink: augDays.length > 0 ? { href: '../august/index.html', label: 'August' } : null,
      })
    );

    // July day + saint pages (same structure as January/February/March/April/May/June)
    for (let di = 0; di < julDays.length; di++) {
      const day = julDays[di];
      const dp = String(day.day).padStart(2, '0');
      const dayDir = path.join(SITE_DIR, 'july', `day-${dp}`);
      fs.mkdirSync(dayDir, { recursive: true });

      let dayBody = `
        <div class="day-header">
          <h2>${day.day} July</h2>
          <div class="day-date">${JULY_DATES[day.day - 1] || ''} &middot; ${day.saintCount} entries</div>
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

      const prevDay = di > 0 ? julDays[di - 1] : null;
      const nextDay = di < julDays.length - 1 ? julDays[di + 1] : null;

      fs.writeFileSync(path.join(dayDir, 'index.html'), htmlPage({
        title: `${day.day} July`,
        cssPath: '../../style.css',
        breadcrumb: `<a href="../../index.html">Home</a><span class="sep">&rsaquo;</span><a href="../index.html">July</a><span class="sep">&rsaquo;</span> ${day.day} July`,
        body: dayBody,
        prevLink: prevDay
          ? { href: `../day-${String(prevDay.day).padStart(2, '0')}/index.html`, label: `${prevDay.day} July` }
          : { href: '../index.html', label: 'July' },
        nextLink: nextDay
          ? { href: `../day-${String(nextDay.day).padStart(2, '0')}/index.html`, label: `${nextDay.day} July` }
          : null,
      }));

      for (let si = 0; si < day.saints.length; si++) {
        const saint = day.saints[si];
        const articleHtml = renderSaintArticle(saint);
        const genre = guessGenre(saint);

        const saintBody = `
          <div class="saint-header">
            <h1>${escapeHtml(saint.displayName)}</h1>
            <div class="feast-date">${day.day} July &middot; ${genre}</div>
            <div class="section-rule"></div>
          </div>
          ${EXPORT_LINKS}
          <article class="article">${articleHtml}</article>`;

        const prevSaint = si > 0 ? day.saints[si - 1] : null;
        const nextSaint = si < day.saints.length - 1 ? day.saints[si + 1] : null;

        fs.writeFileSync(path.join(dayDir, `${saint.slug}.html`), htmlPage({
          title: saint.displayName,
          cssPath: '../../style.css',
          canonicalPath: `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`,
          jsonLd: saintJsonLd(saint, `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`, day.day),
          breadcrumb: `<a href="../../index.html">Home</a><span class="sep">&rsaquo;</span><a href="../index.html">July</a><span class="sep">&rsaquo;</span><a href="index.html">${day.day} July</a><span class="sep">&rsaquo;</span> ${escapeHtml(saint.displayName)}`,
          body: saintBody,
          prevLink: prevSaint ? { href: `${prevSaint.slug}.html`, label: prevSaint.displayName }
            : { href: 'index.html', label: `${day.day} July` },
          nextLink: nextSaint ? { href: `${nextSaint.slug}.html`, label: nextSaint.displayName }
            : (nextDay ? { href: `../day-${String(nextDay.day).padStart(2, '0')}/index.html`, label: `${nextDay.day} July` } : null),
        }));
        writeSaintSiblings(saint, `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`, day.day);
      }
    }
  }

  // ── August Pages ──
  if (augDays.length > 0) {
    const AUGUST_DATES = [
      'Kalendis Augusti', 'IV Non. Aug.', 'III Non. Aug.', 'Prid. Non. Aug.',
      'Nonis Augusti', 'VIII Id. Aug.', 'VII Id. Aug.', 'VI Id. Aug.',
      'V Id. Aug.', 'IV Id. Aug.', 'III Id. Aug.', 'Prid. Id. Aug.',
      'Idibus Augusti', 'XIX Kal. Sep.', 'XVIII Kal. Sep.', 'XVII Kal. Sep.',
      'XVI Kal. Sep.', 'XV Kal. Sep.', 'XIV Kal. Sep.', 'XIII Kal. Sep.',
      'XII Kal. Sep.', 'XI Kal. Sep.', 'X Kal. Sep.', 'IX Kal. Sep.',
      'VIII Kal. Sep.', 'VII Kal. Sep.', 'VI Kal. Sep.', 'V Kal. Sep.',
      'IV Kal. Sep.', 'III Kal. Sep.', 'Prid. Kal. Sep.'
    ];

    // August index
    const augPartial = augDayCount < 31;
    const augSubtitle = augPartial
      ? `August &middot; ${augDayCount} of 31 days &middot; ${augSaints} entries (in progress)`
      : `August &middot; Days 1&ndash;31 &middot; ${augSaints} entries`;
    const augNotice = augPartial
      ? `
      <div class="month-notice">
        <p><strong>August is being published as it is translated.</strong> ${augDayCount} of its 31 days are complete and appear below; the rest are still in progress. Days that are not yet listed have not been translated, not omitted.</p>
        <p>Because the entries for a month are re-divided once that month is whole, a few August pages may move to different addresses when the remaining days are finished. Text already published here will not be withdrawn.</p>
      </div>`
      : '';
    let augBody = `
      <div class="section-header">
        <h1>Augustus</h1>
        <div class="subtitle">${augSubtitle}</div>
        <div class="section-rule"></div>
      </div>${augNotice}
      <div class="day-grid">`;

    for (const day of augDays) {
      const dp = String(day.day).padStart(2, '0');
      const romanDate = AUGUST_DATES[day.day - 1] || '';
      const topSaints = day.saints.slice(0, 5).map(s => s.displayName).join(', ');
      const more = day.saintCount > 5 ? ` + ${day.saintCount - 5} more` : '';
      augBody += `
        <div class="day-card">
          <h3><a href="day-${dp}/index.html">${day.day} August</a></h3>
          <div class="saint-preview">${romanDate} &middot; ${day.saintCount} entries: ${escapeHtml(topSaints)}${more}</div>
        </div>`;
    }
    augBody += '</div>';

    fs.mkdirSync(path.join(SITE_DIR, 'august'), { recursive: true });
    fs.writeFileSync(
      path.join(SITE_DIR, 'august/index.html'),
      htmlPage({
        title: 'August',
        cssPath: '../style.css',
        breadcrumb: '<a href="../index.html">Home</a><span class="sep">&rsaquo;</span> August',
        body: augBody,
        prevLink: { href: '../july/index.html', label: 'July' },
        nextLink: sepDays.length > 0 ? { href: '../september/index.html', label: 'September' } : null,
      })
    );

    // August day + saint pages (same structure as January–July)
    for (let di = 0; di < augDays.length; di++) {
      const day = augDays[di];
      const dp = String(day.day).padStart(2, '0');
      const dayDir = path.join(SITE_DIR, 'august', `day-${dp}`);
      fs.mkdirSync(dayDir, { recursive: true });

      let dayBody = `
        <div class="day-header">
          <h2>${day.day} August</h2>
          <div class="day-date">${AUGUST_DATES[day.day - 1] || ''} &middot; ${day.saintCount} entries</div>
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

      const prevDay = di > 0 ? augDays[di - 1] : null;
      const nextDay = di < augDays.length - 1 ? augDays[di + 1] : null;

      fs.writeFileSync(path.join(dayDir, 'index.html'), htmlPage({
        title: `${day.day} August`,
        cssPath: '../../style.css',
        breadcrumb: `<a href="../../index.html">Home</a><span class="sep">&rsaquo;</span><a href="../index.html">August</a><span class="sep">&rsaquo;</span> ${day.day} August`,
        body: dayBody,
        prevLink: prevDay
          ? { href: `../day-${String(prevDay.day).padStart(2, '0')}/index.html`, label: `${prevDay.day} August` }
          : { href: '../index.html', label: 'August' },
        nextLink: nextDay
          ? { href: `../day-${String(nextDay.day).padStart(2, '0')}/index.html`, label: `${nextDay.day} August` }
          : null,
      }));

      for (let si = 0; si < day.saints.length; si++) {
        const saint = day.saints[si];
        const articleHtml = renderSaintArticle(saint);
        const genre = guessGenre(saint);

        const saintBody = `
          <div class="saint-header">
            <h1>${escapeHtml(saint.displayName)}</h1>
            <div class="feast-date">${day.day} August &middot; ${genre}</div>
            <div class="section-rule"></div>
          </div>
          ${EXPORT_LINKS}
          <article class="article">${articleHtml}</article>`;

        const prevSaint = si > 0 ? day.saints[si - 1] : null;
        const nextSaint = si < day.saints.length - 1 ? day.saints[si + 1] : null;

        fs.writeFileSync(path.join(dayDir, `${saint.slug}.html`), htmlPage({
          title: saint.displayName,
          cssPath: '../../style.css',
          canonicalPath: `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`,
          jsonLd: saintJsonLd(saint, `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`, day.day),
          breadcrumb: `<a href="../../index.html">Home</a><span class="sep">&rsaquo;</span><a href="../index.html">August</a><span class="sep">&rsaquo;</span><a href="index.html">${day.day} August</a><span class="sep">&rsaquo;</span> ${escapeHtml(saint.displayName)}`,
          body: saintBody,
          prevLink: prevSaint ? { href: `${prevSaint.slug}.html`, label: prevSaint.displayName }
            : { href: 'index.html', label: `${day.day} August` },
          nextLink: nextSaint ? { href: `${nextSaint.slug}.html`, label: nextSaint.displayName }
            : (nextDay ? { href: `../day-${String(nextDay.day).padStart(2, '0')}/index.html`, label: `${nextDay.day} August` } : null),
        }));
        writeSaintSiblings(saint, `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`, day.day);
      }
    }
  }

  if (sepDays.length > 0) {
    const SEPTEMBER_DATES = [
      'Kalendis Septembris', 'IV Non. Sep.', 'III Non. Sep.', 'Prid. Non. Sep.',
      'Nonis Septembris', 'VIII Id. Sep.', 'VII Id. Sep.', 'VI Id. Sep.',
      'V Id. Sep.', 'IV Id. Sep.', 'III Id. Sep.', 'Prid. Id. Sep.',
      'Idibus Septembris', 'XVIII Kal. Oct.', 'XVII Kal. Oct.', 'XVI Kal. Oct.',
      'XV Kal. Oct.', 'XIV Kal. Oct.', 'XIII Kal. Oct.', 'XII Kal. Oct.',
      'XI Kal. Oct.', 'X Kal. Oct.', 'IX Kal. Oct.', 'VIII Kal. Oct.',
      'VII Kal. Oct.', 'VI Kal. Oct.', 'V Kal. Oct.', 'IV Kal. Oct.',
      'III Kal. Oct.', 'Prid. Kal. Oct.'
    ];

    // September index
    const sepPartial = sepDayCount < 30;
    const sepSubtitle = sepPartial
      ? `September &middot; ${sepDayCount} of 30 days &middot; ${sepSaints} entries (in progress)`
      : `September &middot; Days 1&ndash;30 &middot; ${sepSaints} entries`;
    const sepNotice = sepPartial
      ? `
      <div class="month-notice">
        <p><strong>September is being published as it is translated.</strong> ${sepDayCount} of its 30 days are complete and appear below; the rest are still in progress. Days that are not yet listed have not been translated, not omitted.</p>
        <p>Because the entries for a month are re-divided once that month is whole, a few September pages may move to different addresses when the remaining days are finished. Text already published here will not be withdrawn.</p>
      </div>`
      : '';
    let sepBody = `
      <div class="section-header">
        <h1>September</h1>
        <div class="subtitle">${sepSubtitle}</div>
        <div class="section-rule"></div>
      </div>${sepNotice}
      <div class="day-grid">`;

    for (const day of sepDays) {
      const dp = String(day.day).padStart(2, '0');
      const romanDate = SEPTEMBER_DATES[day.day - 1] || '';
      const topSaints = day.saints.slice(0, 5).map(s => s.displayName).join(', ');
      const more = day.saintCount > 5 ? ` + ${day.saintCount - 5} more` : '';
      sepBody += `
        <div class="day-card">
          <h3><a href="day-${dp}/index.html">${day.day} September</a></h3>
          <div class="saint-preview">${romanDate} &middot; ${day.saintCount} entries: ${escapeHtml(topSaints)}${more}</div>
        </div>`;
    }
    sepBody += '</div>';

    fs.mkdirSync(path.join(SITE_DIR, 'september'), { recursive: true });
    fs.writeFileSync(
      path.join(SITE_DIR, 'september/index.html'),
      htmlPage({
        title: 'September',
        cssPath: '../style.css',
        breadcrumb: '<a href="../index.html">Home</a><span class="sep">&rsaquo;</span> September',
        body: sepBody,
        prevLink: { href: '../august/index.html', label: 'August' },
        nextLink: null,
      })
    );

    // September day + saint pages (same structure as January–August)
    for (let di = 0; di < sepDays.length; di++) {
      const day = sepDays[di];
      const dp = String(day.day).padStart(2, '0');
      const dayDir = path.join(SITE_DIR, 'september', `day-${dp}`);
      fs.mkdirSync(dayDir, { recursive: true });

      let dayBody = `
        <div class="day-header">
          <h2>${day.day} September</h2>
          <div class="day-date">${SEPTEMBER_DATES[day.day - 1] || ''} &middot; ${day.saintCount} entries</div>
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

      const prevDay = di > 0 ? sepDays[di - 1] : null;
      const nextDay = di < sepDays.length - 1 ? sepDays[di + 1] : null;

      fs.writeFileSync(path.join(dayDir, 'index.html'), htmlPage({
        title: `${day.day} September`,
        cssPath: '../../style.css',
        breadcrumb: `<a href="../../index.html">Home</a><span class="sep">&rsaquo;</span><a href="../index.html">September</a><span class="sep">&rsaquo;</span> ${day.day} September`,
        body: dayBody,
        prevLink: prevDay
          ? { href: `../day-${String(prevDay.day).padStart(2, '0')}/index.html`, label: `${prevDay.day} September` }
          : { href: '../index.html', label: 'September' },
        nextLink: nextDay
          ? { href: `../day-${String(nextDay.day).padStart(2, '0')}/index.html`, label: `${nextDay.day} September` }
          : null,
      }));

      for (let si = 0; si < day.saints.length; si++) {
        const saint = day.saints[si];
        const articleHtml = renderSaintArticle(saint);
        const genre = guessGenre(saint);

        const saintBody = `
          <div class="saint-header">
            <h1>${escapeHtml(saint.displayName)}</h1>
            <div class="feast-date">${day.day} September &middot; ${genre}</div>
            <div class="section-rule"></div>
          </div>
          ${EXPORT_LINKS}
          <article class="article">${articleHtml}</article>`;

        const prevSaint = si > 0 ? day.saints[si - 1] : null;
        const nextSaint = si < day.saints.length - 1 ? day.saints[si + 1] : null;

        fs.writeFileSync(path.join(dayDir, `${saint.slug}.html`), htmlPage({
          title: saint.displayName,
          cssPath: '../../style.css',
          canonicalPath: `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`,
          jsonLd: saintJsonLd(saint, `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`, day.day),
          breadcrumb: `<a href="../../index.html">Home</a><span class="sep">&rsaquo;</span><a href="../index.html">September</a><span class="sep">&rsaquo;</span><a href="index.html">${day.day} September</a><span class="sep">&rsaquo;</span> ${escapeHtml(saint.displayName)}`,
          body: saintBody,
          prevLink: prevSaint ? { href: `${prevSaint.slug}.html`, label: prevSaint.displayName }
            : { href: 'index.html', label: `${day.day} September` },
          nextLink: nextSaint ? { href: `${nextSaint.slug}.html`, label: nextSaint.displayName }
            : (nextDay ? { href: `../day-${String(nextDay.day).padStart(2, '0')}/index.html`, label: `${nextDay.day} September` } : null),
        }));
        writeSaintSiblings(saint, `${path.relative(SITE_DIR, dayDir).split(path.sep).join('/')}/${saint.slug}.html`, day.day);
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
  // Add April saints
  for (const day of aprDays) {
    const dp = String(day.day).padStart(2, '0');
    for (const saint of day.saints) {
      allSaints.push({
        displayName: saint.displayName,
        day: day.day,
        month: 'april',
        slug: saint.slug,
        dayPad: dp,
        genre: guessGenre(saint),
        words: saint.totalWords || 0,
      });
    }
  }
  // Add May saints
  for (const day of mayDays) {
    const dp = String(day.day).padStart(2, '0');
    for (const saint of day.saints) {
      allSaints.push({
        displayName: saint.displayName,
        day: day.day,
        month: 'may',
        slug: saint.slug,
        dayPad: dp,
        genre: guessGenre(saint),
        words: saint.totalWords || 0,
      });
    }
  }
  // Add June saints
  for (const day of junDays) {
    const dp = String(day.day).padStart(2, '0');
    for (const saint of day.saints) {
      allSaints.push({
        displayName: saint.displayName,
        day: day.day,
        month: 'june',
        slug: saint.slug,
        dayPad: dp,
        genre: guessGenre(saint),
        words: saint.totalWords || 0,
      });
    }
  }
  // Add July saints
  for (const day of julDays) {
    const dp = String(day.day).padStart(2, '0');
    for (const saint of day.saints) {
      allSaints.push({
        displayName: saint.displayName,
        day: day.day,
        month: 'july',
        slug: saint.slug,
        dayPad: dp,
        genre: guessGenre(saint),
        words: saint.totalWords || 0,
      });
    }
  }
  // Add August saints
  for (const day of augDays) {
    const dp = String(day.day).padStart(2, '0');
    for (const saint of day.saints) {
      allSaints.push({
        displayName: saint.displayName,
        day: day.day,
        month: 'august',
        slug: saint.slug,
        dayPad: dp,
        genre: guessGenre(saint),
        words: saint.totalWords || 0,
      });
    }
  }
  // Add September saints
  for (const day of sepDays) {
    const dp = String(day.day).padStart(2, '0');
    for (const saint of day.saints) {
      allSaints.push({
        displayName: saint.displayName,
        day: day.day,
        month: 'september',
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
      <div class="subtitle">${allSaints.length} entries &middot; January&ndash;${sepDays.length > 0 ? 'September' : (augDays.length > 0 ? 'August' : (julDays.length > 0 ? 'July' : (junDays.length > 0 ? 'June' : (mayDays.length > 0 ? 'May' : (aprDays.length > 0 ? 'April' : 'March')))))}</div>
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
    const monthLabel = saint.month === 'september' ? 'Sep' : (saint.month === 'august' ? 'Aug' : (saint.month === 'july' ? 'Jul' : (saint.month === 'june' ? 'Jun' : (saint.month === 'may' ? 'May' : (saint.month === 'april' ? 'Apr' : (saint.month === 'march' ? 'Mar' : (saint.month === 'february' ? 'Feb' : 'Jan')))))));
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
