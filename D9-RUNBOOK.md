# D9 — the volume APPENDIX pages were never scraped

**Read this first. It is self-contained; you should not need the session that wrote it.**

Written 2026-08-30. Companion to `CORPUS-DEFECTS.md` (entry D9) and `RESUME-sep.md`.

---

## The finding in one paragraph

Every Acta volume on heiligenlexikon.de has an **`Anhang_<Month>_<Vol>.html`** page — the volume's
appendix. **Our scrapers never fetched any of them except January vol. 2's.** On several volumes that
page holds *full saint treatises* that exist nowhere else in the corpus. This was found while
resolving the standing "day-19 Januarius" warning: his acts are not missing because the split step
dropped them, and not because the Bollandists omitted them — **they are on the source site, on a page
no scraper of ours has ever visited.**

## How it was established (so you can re-check rather than trust me)

1. `src/latin/sep/day-19/day-19-full.txt` carries 14 `DE S.`/`DE SS.` headers, none of them
   Januarius, and ends cleanly on Lucia de Monte plus the `September VI: 20. September` boundary.
   Nothing was truncated. Day 19 is **complete as scraped** at 60 chunks.
2. `einleitung-sep-vi.txt` has him in the volume synopsis and `INDEX SANCTORUM` (p. 761 ff., the
   §-by-§ outline running past p. 801) — but that file is front matter and index only, no bodies.
3. The day index page `https://www.heiligenlexikon.de/ActaSanctorum/19.September.html` lists
   `S. Januarius episc. M. Puteolis in Campania Felice` with the Bollandists' own note *"Acta
   imprimenda circa finem tomi"* — and **gives it no hyperlink.** The only links on that page are
   `Einleitung_September_VI.html` and `Anhang_September_VI.html`.
4. `Anhang_September_VI.html` **is the treatise** — `De SS. Januario Episc., Sosio, Festo et Proculo
   Diaconis, Desiderio Lectore, Eutyche vel Eutychete et Acutio Martyribus Puteolis in Campania
   Felice`, with Commentarius Prævius in nine sections, multiple Acta, Translationes, and the
   Naples-vs-Beneventum controversy. Roughly 50+ printed pages.
5. **It is not only September.** `Anhang_August_VI.html` holds **nine** full treatises —
   `DE BEATO HILDEGARO, EPISCOPO COLONIENSI` · `DE S. FAMIANO CONF. ORDINIS CISTERCIENSIS` ·
   `DE SS. FIRMO ET RUSTICO MM.` · `DE S. FEDLIMIDO CONF. PONT. IN HIBERNIA` · `DE S. RUFINO EPISCOPO
   MART.` (extensive) · `DE S. FAGNANO EPISC. ET CONF. IN HIBERNIA` · `DE S. ADUINO, FORTASSE EP.,
   CONF.` · `DE S. AGONE EPISC. PICTAVIENSI` · `DE B. BURCHARDO PRESBYTERO BEINWILÆ IN HELVETIA`.
   **August is a completed, DEPLOYED month.** It is missing nine articles and the live site does not
   say so.

## ⚠️ The content type VARIES by volume — do not assume

`Anhang_September_I.html` is **not** treatises. It is an `INDEX HISTORICUS`, an alphabetical index of
persons with page references, ~40 printed pages. Useful, but a different kind of object entirely.

**So the sweep must classify every Anhang page before deciding what to do with it.** At least three
kinds are known to exist:
- **treatises** (sep VI, aug VI) — real missing articles, the reason this defect matters;
- **index** (sep I) — an `INDEX HISTORICUS`; arguably not wanted at all, certainly not as saint pages;
- **notes/annotata** — January vol. 2's local `anhang.txt` is 181 lines of lettered footnotes with
  **zero** `DE ` headers, so this kind exists too.

## Why our scrapers miss it

`scripts/scrape-index-day.mjs` walks **day index pages** (`${BASE}/${day}.${german}.html`) and
follows only links matching `/${asDir}/` (e.g. `/ASSeptember/`). The Anhang link is volume-level
navigation, not an article link, so it is never followed.

⚠️ **And there is a second, sharper trap.** The scraper's chrome filter is

```js
const CHROME = /^(Heiligenlexikon|Einleitung |Band |Anhang |Unterstützung f|…)/i;
```

`Anhang ` is treated as **page chrome and stripped**. That is correct when the word appears as a
navigation label on a day page. It is wrong on the Anhang page itself, where the volume title line
is exactly that. **If you point the existing extractor at an Anhang page without changing this, you
will silently lose the page's own heading matter.** Do not reuse `extractArticle` unmodified.

## Scale — unknown, and that is step 1

Volumes present locally, by `einleitung-*` count: oct 13 · sep 8 · jul 7 · jun 7 · may 7 · aug 6 ·
apr 3 · feb 3 · mar 3 · nov 3 · jan 2. **~62 volumes**, so ~62 candidate Anhang pages. If treatise-
bearing appendices are common rather than rare, the corpus could be missing well over a hundred
articles. **Nobody has counted. Do not quote a number until step 1 is done.**

---

## The work

### Step 1 — enumerate and classify (do this first, it is cheap and it sizes everything else)

For each month/volume, fetch `https://www.heiligenlexikon.de/ActaSanctorum/Anhang_<German>_<Vol>.html`
(e.g. `Anhang_September_VI.html`; volume is an uppercase Roman numeral) and record:

- HTTP status — some volumes may have no Anhang at all;
- the count of `^DE [A-Z]` headings (**use `^DE [A-Z]`, not `DE S.`** — see the header-sweep note in
  `RESUME-sep.md`; `DE AFRICANIS MARTYRIBUS…` and `DE BEATO…` both escape narrower patterns);
- classification: **treatises** / **index** / **notes** / **empty**;
- rough length.

Write the result to `D9-INVENTORY.json` and stop there for a checkpoint. **Rate-limit to the existing
`DELAY_MS = 2000`** — the scrapers have always been polite to this site and there is no reason to
stop being so.

### Step 2 — scrape the treatise-bearing ones

Write `scripts/scrape-anhang.mjs` rather than bending `scrape-index-day.mjs`. It must:
- fetch one Anhang page and emit `src/latin/<mon>/anhang-<mon>-<vol>.txt`, matching the shape of the
  existing `day-NN-full.txt` files (that is what `chunk-month.mjs` expects);
- **not** strip a leading `Anhang ` line as chrome (see the trap above) — handle the page's own title
  explicitly;
- keep every other chrome rule, including the German furniture block, unchanged.

Note the precedent: `src/latin/jan-vol2/anhang.txt` and `anhang-manual.txt` already exist, so the
naming and the pipeline have a working example to copy.

### Step 3 — chunk and translate

Chunk with the same tooling as a day. Translate with `PROMPT-sep.md` (or the month's own frozen
prompt) **unchanged in its conventions** — these are ordinary Bollandist articles and need no special
rules. Verify with `check-day.mjs` plus the evaluated `extractSaintName` pass, and check the
`headers → slugs` parity ratio (see `RESUME-sep.md`).

### Step 4 — placement, which is a real design question, not a detail

An appendix treatise is **not attached to a calendar day** in the source; it sits at the end of a
volume. But every one of these saints has a feast day inside that volume's day range, and the site is
organised by day. September volume ranges are in `MAP-sep.md` (vol VI = days 19–24, so Januarius
lands on **day 19**, his feast).

⬜ **Decide before building:** distribute each appendix treatise to its proper day (Januarius → day
19), or give volumes an appendix section of their own? Distributing matches how a reader looks a
saint up and is almost certainly right, but it means a day's chunk numbering gains files from a
different scrape — **use the D8 letter-suffix trick (`0059a-…`) so nothing downstream is renumbered.**

---

## ⬜ Open for Wilson

1. **Scope.** September only (unblocks the month), or the corpus-wide sweep? September alone is one
   treatise; the sweep is potentially a hundred-plus articles across eight deployed months.
2. **Deployed months are affected.** August is live and missing nine articles. Options: fix quietly
   in the next deploy · disclose on the *What Is Known to Be Wrong* page · both. **The house pattern
   is disclosure**, per the Bonaventure/Acta methodology pages.
3. **The `INDEX HISTORICUS` appendices** (sep I kind) — translate, or skip as apparatus? They are
   indexes of persons with page references to a printed pagination the site does not reproduce, so
   their value here is doubtful.
4. **Does September wait for this?** Current answer, unless changed: **no.** Day 19 is complete as
   scraped at 60 chunks and September can be called done without Januarius; the deploy is already
   held for September's completion for unrelated reasons.

## What is NOT true (corrections to the earlier record)

- ~~"The treatise is unavailable at any price"~~ — it is one HTTP GET away.
- ~~"D9 is a September problem"~~ — August VI alone has nine treatises, and ~62 volumes are unchecked.
- ~~"Day 19 may be structurally incomplete because our split dropped him"~~ — the split is innocent;
  day 19 is complete as scraped.
