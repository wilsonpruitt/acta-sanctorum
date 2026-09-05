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

## D7 — line-broken translations: one paragraph per Latin typographic line

**Status:** ✅ **ALL SEVEN MONTHS REPAIRED 2026-08-29** (feb, mar, apr, may,
jun, jul, aug) · **Found:** 2026-08-29, reported from the live site
**Severity:** high — affects the live site's readability across seven months

The Latin OCR (`src/latin/<mon>/day-NN/day-NN-full.txt`) is line-broken with
single newlines. In the affected files the translator emitted **each Latin
typographic line as its own paragraph**, blank-line separated. The site renders
one `<p>` per line, so the prose reads double-spaced down the page:

```
The Index of the Prefects of the City of Rome,

from the times of Gallienus

and the year of Christ 254, traced
```

Reported case: `actasanctorum.org/june/day-25/martyrs-who-suffered-at-rome.html`
(`jun/day-25/saints/0003`, 439 blocks where there are 55 paragraphs).

**Extent** — files where >30% of body blocks are unterminated single lines:

| month | affected | of |
|---|---|---|
| may | 137 | 672 |
| jun | 128 | 564 |
| apr | 35 | 517 |
| jul | 18 | 586 |
| aug | 16 | 545 |
| mar | 12 | 488 |
| feb | 1 | — |

**May was the worst.** All seven months are now done — see *Outcome* below.

**The fix is mechanical, not a re-translation.** The affected translations are
line-for-line with the Latin, and the Latin *does* retain real paragraph
boundaries as blank lines (2,207 of them in day-25 alone). So
`scripts/rejoin_linebroken.py`:

1. seeds a global offset by proper-name/numeral signature matching;
2. refines with a **banded Needleman-Wunsch alignment** (block ↔ Latin line,
   allowing merged blocks and skipped Latin lines);
3. rejoins each run into one paragraph, breaking where the aligned Latin line is
   followed by a blank.

Step 2 is not optional. A single global offset drifts: on day-25 it swallowed
`[8]`, `[Annotatum]` and `ACTA` into the preceding paragraph even though the
Latin has a blank line before all three. The DP alignment raised that file's
match score from 1.05 to 1.31.

Structural blocks are never absorbed, whatever the Latin's line breaks do:
all-caps headings, saint-list lines ending `(S.)`, bracket-only editorial
labels, and `[N]` section markers. Consecutive blocks of the *same* kind still
merge when the Latin has no break — that is what rejoins a multi-line all-caps
title.

**Safety gate.** The script refuses to write unless the whitespace-normalised
output is identical to the input, so a pass can only change whitespace, never a
word. All 128 June files cleared it. Match scores ran 0.44–2.28 (median 1.18),
averaging 9.2 source lines per paragraph.

⚠ **`src/translations/` is gitignored** (`.gitignore:13`) — these files have no
VCS history and a bulk pass has no undo. **Snapshot the month before running,
not after.** For June the pre-fix state survives only as the already-built HTML,
preserved in `~/acta-snapshots/jun-linebreak-fix-20260829/`.

**Before repairing another month:** tar `src/translations/<mon>` *and*
`site/<month>` first, then run
`python3.11 scripts/rejoin_linebroken.py <files> --write`.

### D7a — the alignment pass leaves residue; a second pass is required

⚠ **`rejoin_linebroken.py` is necessary but NOT sufficient. Do not call a month
done after it runs.** Wilson found the residue by eye on June 24 the same day
the fix shipped: paragraphs still beginning mid-sentence ("…with other glorious"
/ "spirits both Angelic & human existed"). The DP alignment is conservative by
design — wherever it cannot confidently place a block against a Latin line it
leaves the break alone, and those leftovers are exactly the visible artefact.

The second pass is a **purely textual, two-sided** rule that needs no Latin at
all — join a block to the previous one only when **both** hold:

- the previous block ends mid-sentence (last char a letter, `,`, `&`, or `-`);
- the next block begins mid-sentence (leading lowercase letter, `&`, or `,`).

Structural blocks are exempt on both sides (leading `[`/`#`/`*`, or >80% of
letters uppercase). Requiring both sides is what makes it safe: a genuine
paragraph break has a terminated predecessor *or* a capitalised successor, and
almost always both.

Run it over `<mon>/day-*/saints` **only** — the numbered chunk files
(`day-NN/NNNN-<mon>-day-NN.md`) are line-for-line with the Latin *by design* and
must not be touched. On June that distinction is the whole ballgame: 1,140 joins
under `saints/`, versus ~108,700 if the chunk files are swept in.

### D7a outcome — all seven months, 2026-08-29

Measured as **paragraphs that begin mid-sentence**, the artefact a reader sees
(`scripts/count_midsentence.py`):

| month | before | after |
|---|---|---|
| feb | 722 | 276 |
| mar | 7,363 | 427 |
| apr | 31,387 | 251 |
| may | 65,845 | 553 |
| jun | 4,022 | 544 |
| jul | 33,733 | 567 |
| aug | 30,146 | 1,256 |
| **total** | **173,218** | **3,874** |

**97.7% removed.** Every month passed the per-file word-count gate at every
pass — 0 files differing. Live spot-check, apparatus excluded: Gregory VII 0.2%,
Joseph the Hymnographer 0.8%, Ignatius 1.3%, Bernard 3.2%. ⚠ **`jun/day-24`
John the Baptist is the worst page left at 9.8%** and is worth a look.
Deployed 2026-08-29. Snapshots per stage in `~/acta-snapshots/*-saints-pre-*`.

### The rule took four passes to get right — the corrections matter more than the counts

1. **Bracket trap.** Treating any block starting `[` as structural exempted
   every paragraph opening with a `[N]` section marker — which is most of them.
   That is *precisely* the paragraph Wilson screenshotted. Only a block that is
   **entirely** bracketed is structural. Fixing this found 1,948 joins in June
   where the first attempt had found 1,140.
2. **Latin-only character classes** silently exempted every Greek passage, and
   the Acta has a great deal of Greek. `PREV_OPEN`/`NEXT_CONT` now include
   `Ͱ-Ͽἀ-ῼ`.
3. **`;` `:` `…` and digits are not paragraph ends** in this corpus.
4. **All-caps needs a length floor of 3, not 20.** A lone dropped initial (`Ὁ`)
   is 100% uppercase but is an orphaned letter; a short word like `LIFE` or
   `ACTA` is a real heading and must stay exempt.

⚠ **Same-script guard.** Extending to Greek made the rule join Latin prose to a
following Greek block — but the Acta sets quoted Greek as its own paragraph, so
that is a real boundary. `same_script()` compares the scripts at the join point;
it correctly withdrew 44 candidates.

### ⚠ Four measurement errors, all of which read as defects

Every one was caught by *sampling the output*, never by the number itself.
Re-check with these in mind before trusting any figure here:

- **Never use a `cat`-based aggregate word count.** Files lacking a trailing
  newline merge tokens across the boundary, so a pass that adds one reads as
  "+1 word". That produced a false `WORD COUNT CHANGED` alarm on July. Use
  `scripts/verify_wordcount.py`, which compares **per file**.
- **Lettered footnote apparatus** (`a.`, `b.`, `c.`) legitimately opens
  lowercase. Counting it as broken inflated the artefact count ~8×.
- **The affected-file detector** counted headings ending in a comma and
  paragraphs closing with markdown `*italics*`. That invented 55 broken August
  files that were already clean.
- **Floated margin notes are not the paragraph's first words.** Stripping tags
  naively put the note text at the head of the paragraph and reported the live
  site at 17.7% broken when it was 2.5%. Strip `span.margin-note` and
  `span.section-marker` *before* reading a paragraph's opening character.

## D8 — adjacent works merged into one saint file at the split step

**Status:** June 24 fixed · **SURVEYED 2026-08-29: 283 boundaries in 226 files**
across jan-vol2–aug · repair NOT started → **`D8-RUNBOOK.md`**, worklist
`D8-WORKLIST.json` · **Found:** 2026-08-29 by Wilson, reading the live page
**Severity:** high — the merged work is invisible: no index entry, no page, no
word count

`jun/day-24/saints/0000-john.md` (821 KB) carried, appended to the end of John
the Baptist with no boundary of any kind, the whole of *ON THE MANY HOLY MARTYRS
AT ROME THROUGH FALSE CHARGE OF FIRE KILLED. A.D. 64* — a separate work with its
own commentary and its own saint line, *The Many Martyrs under Nero at Rome
(SS.)*. It rendered as a continuation of the Baptist's article.

**This is D4 (`apr/day-22` honofria) recurring — a systematic fault of the split
step, not a one-off.** The survey (`scripts/d8_survey.py`) keys on the decisive
signal, a second ALL-CAPS `ON`/`DE` work heading below the top of a file; **size
is only a hint and is not usable alone** — 139 files are >12× their day's median
and most are legitimately enormous articles (Dominic, Ignatius, Bernard). By
month: aug 49 · jan-vol2 46 · feb 37 · may 34 · jul 32 · jun 31 · apr 27 · mar 27.
The original tell still holds for the June case: John was 821 KB against 65 KB for
the next largest on the day. Size is the cheap detector; it is not proof, since
some articles genuinely are enormous.

**The fix does not need renumbering.** `collectSplitSaints()` in
`scripts/build-site.mjs` reads `saints/` by `readdirSync().sort()` and groups by
frontmatter `slug`. A letter suffix slots a new file into position: `0000a-…`
sorts after `0000-john.md` (`-` 0x2D < `a` 0x61) and before `0001-…`, so
everything downstream keeps its number. Split file:
`0000a-many-martyrs-under-nero-at-rome.md`.

⚠ **Watch the boundary line when cutting.** The heading is preceded by a blank
line; deleting from the blank rather than the heading silently eats the previous
work's last paragraph. Verify by concatenating the two halves back together and
diffing against the pre-split file — the only difference should be whitespace.

## D9 — the volume APPENDIX pages were never scraped (found via sep/day-19 Januarius)

**Status:** ⬜ open — Wilson's call on what to do about it
**Found:** 2026-08-29, resolving the standing "day-19 may be structurally
incomplete at 60 chunks" warning in `RESUME-sep.md`
**Severity:** medium — a headline saint missing, but nothing we did caused it

The warning assumed our split step had dropped Januarius because the Bollandists
print his acts at the **end** of volume VI rather than under 19 September.
**That is not what happened. The treatise was never scraped.**

Evidence:
- `src/latin/sep/day-19/day-19-full.txt` carries **14** `DE S.`/`DE SS.` headers
  (Felix & Constantia, Trophimus, the Egyptian martyrs, Theodore of Verona,
  Eustochius of Tours, Miletus of Trier, John bishop-martyr, Sequanus, Goericus,
  Theodore archbishop, Nicander & co., Pomposa, Arnulph of Gap, Lucia de Monte).
  **No Januarius.** The file ends cleanly on the Lucia article and the
  `September VI: 20. September` day boundary — no truncation.
- `einleitung-sep-vi.txt` **does** carry him: the volume synopsis
  (`Januarius episc., Sosius, Festus & Proculus diac., Desiderius lect., Eutyches
  & Acutius MM. Puteolis in Campania`, p. 761 ff.) and the `INDEX SANCTORUM`
  entries with the full §-by-§ commentary outline running to p. 801+. That file
  is front matter and index **only** — 5,814 lines, no article bodies.
- Nowhere else in `src/latin/sep/` does the body text appear. The one other hit
  for the name (`day-29`, `0146`) is a **different** Januarius, one of the Roman
  soldier-martyrs of 29 September.

**So day-19 is complete as scraped at 60 chunks and September can be called done
without it.**

### ⚠️ ESCALATED 2026-08-30 — this is NOT a September problem, and the text IS available
The treatise is **on the source site**, on `Anhang_September_VI.html`, a page no
scraper of ours has ever visited. The day-19 index page lists Januarius with the
Bollandists' own *"Acta imprimenda circa finem tomi"* and **no hyperlink**; the
only links it carries are to the volume's Einleitung and **Anhang**.

**Every volume has an `Anhang_<Month>_<Vol>.html`, and we have scraped exactly
one of them** (January vol. 2). Several hold full treatises:
`Anhang_August_VI.html` alone carries **nine** — Hildegar, Famianus, Firmus &
Rusticus, Fedlimid, Rufinus, Fagnanus, Aduinus, Ago, Burchard. **August is a
completed, DEPLOYED month, missing nine articles, and the live site does not say
so.** ~62 volumes are unchecked; nobody has counted, so quote no number yet.

⚠️ Content type **varies**: `Anhang_September_I.html` is an `INDEX HISTORICUS`,
not treatises, and jan-vol2's local `anhang.txt` is 181 lines of lettered notes
with zero `DE ` headers. A sweep must classify before acting.

⚠️ **Trap for whoever writes the scraper:** `scrape-index-day.mjs`'s chrome
filter strips any line beginning `Anhang ` — correct on a day page, wrong on the
Anhang page itself, where that is the title. Do not reuse `extractArticle`
unmodified.

⭐ **Full handoff, self-contained: `D9-RUNBOOK.md`** — evidence chain, the
four-step plan (enumerate/classify → scrape → translate → placement), and the
open decisions.

⬜ **For Wilson:** (1) September only, or the corpus-wide sweep? (2) deployed
months are affected — fix quietly, disclose on *What Is Known to Be Wrong*, or
both (the house pattern is disclosure); (3) translate the `INDEX HISTORICUS`
appendices or skip them as apparatus; (4) September does **not** wait on this.

## D10 — oversized page slugs: FIXED, 30 across the corpus

**Status:** ✅ **FIXED 2026-08-29/30** — 6 in September (pre-split), 24 live
**Found:** 2026-08-29, chasing a 110-char slug the day-10 dispatch note caused

The saint page's URL and display name come from the header line, cut at the first
colon (or, failing that, the first comma) by `extractSaintName`. Where that cut
lands late, the slug runs enormous. **Four classes, and only the first is merely
a long URL:**

| Class | Example | Was live? |
|---|---|---|
| Roster needing the COLON form | sep day-06, **198 chars**, 13 names | no |
| Role/place leaked PAST the comma | `michael-of-barga-of-the-order-of-minors-observant-near-lucca-in-tuscany` | yes |
| Work title absorbed into the name | `45-martyrs-at-nicopolis-in-armenia-about-the-year-319-preliminary-commentary` | yes |
| Malformed opener | `and-divinely-inspired-writer-henry-suso-of-the-order-of-preachers` | yes |

⚠ **In classes 2–4 the page's DISPLAY NAME was wrong**, showing an office, a
work title, or a stray conjunction where the saint's name belongs. Henry Suso's
page was named *"and Divinely Inspired Writer Henry Suso of the Order of
Preachers"* — the honorific-stripping regex ate `ON THE HOLY` and left the `AND`.

**Method.** Every collective was taken from the dossier's own Latin subtitle,
never invented — `SYNNADÆ IN PHRYGIA` → Martyrs of Synnada in Phrygia;
`AQUILEIÆ IN ITALIA, ET ROMÆ` → Martyrs of Aquileia and Rome; `ALEXANDRIÆ IN
ÆGYPTO`, `EPISCOPIS IN AFRICA`, `TOMIS IN PONTO`, `MELITINÆ` likewise. Where a
dossier gives no place (aug day-25 Rufina), the comma was placed at the Latin's
own `ET FORTE` break dividing certain names from conjectural, rather than
inventing a location.

**Two traps worth keeping.**
1. **Count slug TOKENS, not names.** Each Bollandist `VEL` variant doubles into
   the slug (`EUPLO VEL EUPLIA`, `CUPSICO VEL CEROCISO`), so "about six names"
   became 110 characters. The Commentarius confirms `undecim omnino fuisse
   Martyres`.
2. **`extractSaintName` SKIPS the comma cut when the name starts with a digit**
   (guarding thousands separators in "16,000 Soldiers"). So jul day-10's
   `45 MARTYRS…` could not be fixed with a comma at all — the trailing matter
   had to move to its own lines.

**Edits were minimal**: a collective plus colon, or a comma, inserted; every
roster name left byte-identical; no translation content rewritten. For the 24
live ones the chunk file, the split file's header, its `saint:`/`slug:`
frontmatter and its filename were all updated together, so a future re-split
reproduces the same result. Verified: **0 oversized slugs corpus-wide, no new
duplicate, and the header yields the stored slug in all 24.**

### Redirects — MAPPED 2026-08-30, not yet deployed
`site/vercel.json` now carries **24 permanent (308) redirects**, old path → new,
in the live URL shape `/<month>/day-NN/<slug>.html`. A tracked master copy is at
**`deploy/vercel.json`** — `site/` is gitignored, so without that copy an
`rm -rf site/` would silently destroy the redirect map along with the other
hand-maintained files. **Add `site/vercel.json` to the hand-maintained list.**

Verified before writing: all 24 old files exist on disk (so all 24 URLs really
are live), **no new slug collides with an existing page**, and no
hand-maintained page (`index.html`, `about.html`, `rights.html`) links to an old
slug. `index-saints.html` holds all 24 old links but is generated
(`build-site.mjs:2307`), so a rebuild refreshes it.

⚠️ **A REBUILD DOES NOT DELETE THE OLD PAGES.** `build-site.mjs` only ever calls
`mkdirSync(..., {recursive:true})` and writes — there is no `rmSync` over
`SITE_DIR`. So after a rebuild the 24 old `.html` files remain, and without the
redirects each saint would answer at **two** URLs, the old one serving content
frozen at today's build forever. The redirects mask this (Vercel evaluates
`redirects` before the filesystem), but the files are still dead weight against
the 15,000-file upload cap that already forces `--archive=tgz`.

### ⏸ DEPLOY HELD UNTIL SEPTEMBER IS COMPLETE — Wilson, 2026-08-30
The slug fixes and their redirects **ride along with the September completion
deploy**. Nothing is built, deleted or deployed until then; the 24 renames exist
only in `src/translations/`, and the live site still serves the old URLs and old
names. This is deliberate — do not "finish" it early.

⚠️ **The mid-month rule is NOT enforced by the build script — only by not
running it.** `build-site.mjs` links September whenever any September saints
exist, labelling it `entries (in progress)` when `sepDayCount < 30` (line 952).
There is no completeness gate. A rebuild today would publish 16 partial
September days as a live, linked month.

⬜ **Deploy plan for when September is whole (14 days / 2,596 chunks remain):**
1. `node scripts/build-site.mjs` — regenerates pages and `index-saints.html`.
2. Delete the 24 stale files (list in `deploy/stale-pages.txt`). ⚠ deletion of
   generated files, cheap to recreate by rebuilding, but not done unasked.
3. Confirm `site/vercel.json` is present (restore from `deploy/vercel.json` if
   `site/` was ever cleared).
4. `cd site && npx vercel --prod --archive=tgz` — ⛔ **protected: Wilson's
   explicit OK.**
5. Spot-check two or three old URLs for a 308 to the new page.

## D11 — duplicate page slugs inside one day: 39 cases, OPEN

**Status:** ⬜ open — found 2026-08-30 while verifying D10, NOT caused by it
**Severity:** unknown until triaged, potentially high

`build-site.mjs` groups split files with `saintsBySlug`, so **two split files
carrying the same slug merge onto ONE page.** That is intended where a saint's
dossier runs to several works (day-07's five Stephen of Die pieces merge
correctly). It is a real defect where two *different* saints share a bare name —
the "half (b)" failure the translation prompt warns about, which put two
different abbesses named Ebba at risk on August day-25.

**39 cases**: jul 8 · apr 6 · may 6 · feb 5 · jan-vol2 5 · jun 4 · mar 3 · aug 2.
Examples: `apr/day-20` has **john** twice and `aug/day-07` has **donatus** three
times; `apr/day-13` and `apr/day-28` each have a page slugged plain **martyrs**.

⚠ **The metadata cannot settle it** — in every case the duplicate files carry
identical `saint:` values too, so telling an intended merge from an unintended
one **requires reading the dossiers**. Not a batch job.

⬜ For Wilson: whether to run a triage pass. Note D10's fix did not touch these,
and none of the 24 renamed pages is among them.

## Fixed

*(nothing yet — move entries here with the date and what was done)*

---

## D11 — HEADERS SILENTLY REJECTED BY THE SPLITTER (found 2026-08-30, Round F)

⚠️⚠️ **`headers → slugs` parity CANNOT detect this.** A header line the translator plainly intended
as a saint entry can fail `isSaintBoundary()` in `scripts/split-saints.mjs` and be dropped in
silence: the saint gets no page, and the text accretes onto the PRECEDING saint. The header count
and the slug count stay self-consistently wrong, so `check-day.mjs` reports perfect health.

**Found by the day-02 agent**, which evaluated the real `isSaintBoundary` per-line instead of
trusting totals, and caught its own `ON THE TEN HOLY MARTYRS:` being rejected before the split ran.
Verified independently against `split-saints.mjs`: `HONORIFIC` must sit IMMEDIATELY after `ON ` /
`CONCERNING `, so any interposed word breaks it.

### Corpus-wide sweep — `scripts/check-header-boundaries.mjs` (new, this session)
Loads the REAL `isSaintBoundary` out of `split-saints.mjs` by source extraction, so the check can
never drift from the splitter it models. Full output: `deploy/header-boundary-report.txt`.

**4,553 header-shaped lines pass. 209 do not.** Split into:

**A. 71 lines that read as intended saint headers.** Dominant failure patterns:
| Pattern | Count | Example |
|---|---|---|
| Quantifier between `THE` and `HOLY` | 20 | `ON THE SEVENTEEN HOLY AFRICAN MARTYRS.` · `ON THE TEN THOUSAND HOLY MARTYRS AT NICOMEDIA` |
| `ON HOLY …` / `ON THE SAINTS …` (no matching honorific) | 16 | `ON THE SAINTS MARTYRS OF MASSYLA` · `ON HOLY MARTYRS` |
| `THE VENERABLE` (only bare `VENERABLE` is in HONORIFIC) | 12 | `ON THE VENERABLE ODA, OF THE PREMONSTRATENSIAN ORDER` |
| feast / translation / relic sub-titles | 15 | `ON THE ELEVATION OF THE BODY OF SAINT AMANDUS,` |
| misc | ~8 | `ON ST RICHARD…` (**no period after ST**) · `ON ANOTHER ST. VENANTIUS, MARTYR,` |

⚠️ **The 15 feast/translation titles are probably CORRECT rejections** — `split-saints.mjs` says in
its own comments that `LIFE OF` / `TRANSLATION OF` / `MIRACLES OF` are sub-sections, not new saints.
So the real damage is **roughly 50–56 lines, not 71.** Do not quote 71 as the defect count.

**B. 138 subtitles/section titles opening with `ON `** — correctly rejected, harmless to the split,
but they violate the standing rule that a subtitle must never begin with `ON `.
Per month: jan-vol2 30 · jul 29 · may 23 · feb 18 · aug 13 · jun 12 · apr 9 · mar 4.

### ⭐⭐ SEPTEMBER IS CLEAN — ZERO in both categories
Every one of the 209 is in a **deployed** month (jan-vol2, feb, mar, apr, may, jun, jul, aug).
September has not a single silent rejection and not a single `ON `-opening subtitle. **The rules
added to `PROMPT-sep.md` this year are what made the difference** — the deployed months predate
them. This is the same shape as D8 and D4: a systematic fault laid down before the rule existed.

### ⬜ FOR WILSON — a live-site decision, NOT a correctness-only one
Fixing these **creates new pages and changes existing URLs** on eight deployed months. That is the
same link-breakage call as the 23 live oversized slugs (D10), and it is his, not the model's.
Nothing has been touched. Options: fix the header lines (new pages appear, some URLs move) · widen
`isSaintBoundary`'s HONORIFIC to admit `THE VENERABLE`, `THE SAINTS`, and a quantifier before
`HOLY` (fixes ~48 without editing any translation, but silently re-splits deployed months on the
next build) · leave and record.
⚠️ **The second option is the tempting one and the most dangerous**: a regex widening changes the
split of every deployed month at once, with no per-case reading.

---

## D12 — the section-opening paragraph numeral is dropped corpus-wide, and the corpus marks it inconsistently

**Found 2026-09-05, Round I, from a day-28 shard disagreement.** Seven of eight day-28 shards
preserved the section-opening paragraph with no numeral (branch ③, "as printed"); shard E wrote
`[ ]` (branch ②, "information gone") in ten places. The agent reported it as an unruled question and
defaulted to the **majority** reading. **The majority was wrong.**

### The measurement settles it — this is the day-25 detector, and Wilson already ruled on that shape
Ruling ② (2026-09-04) established the precise detector: *a numbering sequence that skips exactly one
across a section head*, `[n] … § … [n+2]`, with the numeral confirmed absent in the Latin too, is a
**scrape drop → branch ② → `[ ]`**. Day-28 fires that detector at **96 of 99 section heads**
(81 skip-one, 15 restarts where `[1]` is gone and numbering resumes at `[2]`; 1 contiguous, 2 other).

⭐ **The restarts are the decisive evidence against "the printer just leaves section openings
unnumbered."** If that were the convention, numbering would resume at `[1]` on the *second*
paragraph. It resumes at `[2]` — so `[1]` was assigned to the section-opening paragraph and is
missing from the scrape. Compare, structurally identical:

```
day-25/0005 (Latin)  § II. …  →  [gloss, no numeral]  →  [14]     ← Wilson ruled `[ ]`
day-28/0033 (Latin)  § I.  …  →  [gloss, no numeral]  →  [2]      ← same shape
```

### ⭐ INDEPENDENTLY CORROBORATED THE SAME DAY, BY AN AGENT WITH NO SHARED BRIEF
The day-04 agent — a separate run, a different corpus stretch, never shown day-28's argument —
reported the identical finding unprompted: *"the paragraph number is missing from the first
paragraph of nearly every `§` and `CAPUT` throughout the day… which reads as a scrape artifact
rather than a printed fault."* It also declined to supply `[ ]`, leaving day-04 at 1 marker against
173 dropped numerals.

⚠️ Note the contrast that makes this worth recording: **day-28's seven agreeing shards were one
brief and not evidence; day-04 is a real second witness.** Both reads agree the numeral is *missing
rather than never printed* — the branch-②/③ question — and the measurement agrees with both. What
neither did was act, each treating an already-settled ruling as an open one.

### Scope: September-wide, 96.6%
| | |
|---|---|
| Section heads in September | **1,781** |
| Missing exactly one numeral | **1,721 (96.6%)** |
| `[ ]` markers present in the English (ALL kinds, incl. column lacunae) | **256** |

Every day is affected; the *marking* is what varies, and it varies wildly both between days and
inside them: day-18 has 113, day-17 has 67, day-25 has 31 (the ruling-② repair), day-01 has 25,
day-28 has 10 — and **eighteen days have zero or one**. ⚠️ The 256 figure is an upper bound: it
counts every line-initial `[ ]`, most of which are scraped column numbers, not section openings.

**This is exactly the disorder ruling ② was written to abolish** ("agents on the same day applied
opposite ones… there is now one policy"). The policy was never applied backwards, and 26 of
September's days were translated before or around it.

### ✅ RESOLVED FOR SEPTEMBER — Wilson ruled scope = September, applied 2026-09-05
**1,553 of 1,721 dropped-numeral section openings (90.2%) now carry `[ ]`** — 1,340 inserted this
pass, 123 already present, the rest already covered in their window. Backup taken first at
`~/acta-sanctorum-backup-sep-<ts>/` (3,413 files). All 28 days re-gated afterwards: **still COMPLETE,
still 0 D11 hits, every `headers → slugs` parity unchanged.** September's line-initial `[ ]` count
went 256 → 1,596.

⚠️ **168 openings were deliberately NOT touched and are enumerated in `D12-WORKLIST.json`.**
Nothing was guessed: where the target paragraph could not be identified with certainty, the sweep
skipped rather than inserted.

| Left alone | Why |
|---|---|
| 139 | bare `CAPUT`/`APPENDIX` head with no marginal-gloss anchor — an unnumbered **chapter argument** intervenes and its length varies, so the target must be picked by eye |
| 29 | the section head **straddles a chunk boundary**, so Latin and English head counts differ in that chunk and the ordinal mapping is not trustworthy |

### ⭐⭐ THE TARGET PARAGRAPH IS NOT SIMPLY "THE NEXT ONE" — three shapes, and two of them bite
The first mapping cost two rejected drafts before it was right. Anyone repeating this on Feb–Aug
must handle all three:
1. **`§ N. <summary>`** — the summary sits *inline on the head line*, so the next paragraph is the
   target. ✅ straightforward.
2. **bare `CAPUT N.` / `APPENDIX`** — an **unnumbered chapter argument** follows on its own before
   the first real paragraph. Targeting "the next paragraph" puts the marker on the argument. Worse,
   the English sometimes wraps that argument across *several* paragraphs, so "skip exactly one" also
   fails. The workable anchor is the first following **`[marginal gloss]`** line; where there is
   none, the case goes to the worklist.
3. **A wrapped head** — the English occasionally continues the `§` summary onto a second paragraph.
   Detectable because the continuation starts **lowercase**; 51 were caught this way. A corpus
   paragraph never begins mid-sentence, so a lowercase start means the target is wrong.

⛔ **`[marginal gloss]` is NOT a reliable marker of a paragraph start on its own** — day-28/0033's
opening paragraph is `Bollandus noster ad XVI Januarii… [S. Fausti, de quo ante breviter actum,] quo
in ecclesia…`, with the gloss sitting *mid-paragraph*. The gloss anchor is safe only as a
tie-breaker for shape 2, never as the primary test.

### ⬜ FOR WILSON — the ruling exists; the SCOPE is the open question
Applying branch ② consistently means inserting ~1,700 `[ ]` markers across September, and the same
pattern certainly runs through the eight deployed months. Unlike D10/D11 this changes **no URL and
no page**, only body text, so it is cheap and reversible — but it is ~1,700 mechanical edits and it
is his call whether September ships internally consistent, corpus-consistent, or as-is.

Options: **(a)** apply to September only (makes the shipping month self-consistent, leaves it
differing from Feb–Aug) · **(b)** apply September + backfill the deployed months (one policy
everywhere; a large mechanical pass, no URLs move) · **(c)** leave it and record (the corpus stays
inconsistent within single days, e.g. day-28's ten marked against its eighty-six unmarked) ·
**(d)** reverse the ruling for this shape and strip the 256, treating a missing section-opening
numeral as branch ③.

⚠️ Nothing has been changed. The detector is exact and scriptable, so (a) and (b) are mechanical —
but the numeral itself is **never inferred** under any option; `[ ]` is the whole of the repair.
