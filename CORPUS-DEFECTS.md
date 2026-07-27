# Acta Sanctorum — Corpus Defect Log

**Why this file exists.** Defects in a 33-million-word corpus are found far
more cheaply as a by-product of *working through* the text — preparing a print
volume, reading a dossier closely — than by fanning agents across the whole
corpus hunting for them. Every time a defect surfaces in the course of other
work, log it here instead of launching a cleanup sweep. Fix in batches when
there is a reason to touch that month anyway.

**Do not turn this into a standing agent job.** The list grows on its own.

Status: `OPEN` · `FIXED` · `WONTFIX` · `INVESTIGATING`

---

## D1 — `jan-vol2` duplicate translations (16 `day-NN-manual` directories)

**Status:** OPEN · **Found:** 2026-07-18, preparing the collection pilot
**Severity:** high — affects the live site, and every word count derived from the corpus

`jan-vol2` contains 16 `day-NN-manual` directories holding a **second, complete
translation of the same saints** as the corresponding `day-NN` directory.

Confirmed example:

| File | Words |
|---|---|
| `jan-vol2/day-18/saints/0000-prisca.md` | 7,959 |
| `jan-vol2/day-18-manual/saints/0000-prisca.md` | 8,096 |

Same text, different renderings — "The first inquiry against her" vs
"The first interrogation against her"; "Renewed inquiries" vs "Repeated
interrogations". Structurally near-identical.

**Consequences:**

1. **Word counts keyed on `day-\d+` silently double.** `day-18` and
   `day-18-manual` both match, so aggregates sum both. Prisca reads as 16,055
   words when the real figure is ~8,000. This affects
   `~/wroot-press/acta-imprint/research/acta_wordcounts.csv` and anything
   derived from it for jan-vol2.
2. **The "duplicate Anthony the Great" is this, not a corpus bug.** Two entries
   (90,854 and 87,000 words) flagged during the 2026-07-18 research are the
   `day-17` / `day-17-manual` pairing.
3. **Unresolved: which version is live on actasanctorum.org?** Matters more for
   the site than for print.

**To decide:** which pass is authoritative. On the sample compared, `-manual`
reads as the more careful translation ("interrogation" is closer to the Latin).
The imprint pilots provisionally use `-manual`.

**Affected dirs:** 16 total — enumerate with
`ls -d ~/acta-sanctorum/src/translations/*/day-*-manual`

---

## D2 — Agatha: Metaphrastes Acts missing Chapter III

**Status:** OPEN · **Found:** 2026-07-18, building the Agatha volume
**Severity:** medium — a chapter of text may be missing from the site
**Location:** `feb/day-05/saints/0000-agatha.md`, the "OTHER ACTS by Simeon
Metaphrastes" section (source lines ~687–808)

Chapters run **I, II, IV** — no Chapter III. Check against the Latin chunks for
Feb 5. If a chapter is genuinely missing from the translation, fix at source;
do **not** renumber in the print edition, which would hide the gap on the site.

---

## D3 — Pius V: gappy secondary chapter system

**Status:** OPEN · **Found:** 2026-07-18, building the Pius V volume
**Severity:** low-medium — possibly cosmetic, possibly missing text
**Location:** `may/day-04/saints/0032-pius-the-fifth.md`

The dossier carries two heading systems. The canonical one (`CHAPTER N.` +
synopsis line) is clean and sequential, restarting per Book. The secondary
running-text system (`CHAPTER N`, no period, no synopsis) is **gappy**:
III IV V VII VIII X XI XIV — missing I, II, VI, IX.

Given the known July chunking bug where a numeral was absorbed at a chunk
boundary, a translation defect is plausible. The Latin for May 4 has 97 `CAPUT`
markers but that count is day-wide across all May 4 saints, so it does not
settle it — the Pius V chunks need isolating.

The print edition no longer depends on this (it uses the canonical system
only), so this is a site-side question.

---

## D4 — `apr/day-22/honofria-the-virgin` mega-merge

**Status:** OPEN · **Found:** 2026-07-18, integrity sweep
**Severity:** medium — several saints buried in one entry

The last surviving mega-merge from the pre-2026-06-29 `isSaintBoundary` bug.
Of 308 entries ≥25k words this was the **only** genuine mis-merge, so the
corpus-wide re-split otherwise held. This entry contains at least five foreign
saint headers (Melanius of Troyes, Julian, and others) merged under Honofria.

Re-split this day with the current `split-saints.mjs`.

---

## D5 — Word-count aggregation must not key on `day-\d+` alone

**Status:** OPEN (tooling note) · **Found:** 2026-07-18
**Severity:** low — affects analysis scripts, not the corpus

Any script that derives a day key with `re.search(r'day-\d+', path)` will merge
`day-18` with `day-18-manual` (see D1). Use the full directory name as the key,
or exclude `-manual` explicitly. `acta_wordcounts.csv` in the imprint research
directory carries this defect for jan-vol2 rows.

---

## D6 — Agatha: footnote refs whose definitions fall outside their block

**Status:** OPEN · **Found:** 2026-07-19, converting footnotes for print
**Severity:** low — 3 refs of 114
**Location:** `feb/day-05/saints/0000-agatha.md`, the Acts (paragraphs 8 and 12)

The dossier scopes Bollandist notes as `[Annotations]` blocks of `a. text`
definitions covering the body text that PRECEDES each block. Three inline refs
(`[d]` in Acts ¶8, and two others) have no matching letter in the block that
governs them — the lettering runs on across a block boundary, so the definition
sits in a different block than the marker.

111 of 114 refs bound correctly. The print extractor strips the 3 unmatched
refs (a bare "[d]" reads as a typo on the page) and reports the count. **The
site still shows them raw** — fix the scoping there.

Worth checking whether the same run-on lettering occurs in other dossiers; the
print pipeline will report it per volume as `orphan refs stripped`.

## Fixed

*(nothing yet — move entries here with the date and what was done)*
