# Acta Sanctorum Devotional

Side project within `~/acta-sanctorum/`. One-saint-per-day devotional drawn
from AASS material, exported from Ulysses for a 6×9 trim paperback.

## Status

- **Phase 0 complete (2026-05-12):** all 315 days Jan 1 – Nov 10 curated
  and source-tagged in `saints-picks.csv`. See `picks-review.md` for the
  reasoning trail.
- Voice locked via two sample entries (Jan 3 Genevieve, Jan 17 Anthony) — see
  `samples.md`.
- First-chunk extracts for May–Nov under `first-chunks/` for quick reference.
- Nov 11 – Dec 31 preserved in CSV but out of scope.

## Files

- `saints-picks.csv` — one saint per day, all 366. Jan–Mar from our
  translations; Apr 1 – Nov 10 scraped from Heiligenlexikon; Nov 11 – Dec 31
  parsed from the Propylaeum Decembris supplement. Some names still need
  editorial review before drafting.
- `nov-dec-picks.csv` — working sheet for Nov 11 – Dec 31.
- `nov11-dec31.txt` — pasted Propylaeum supplement source text.
- `samples.md` — canonical voice/format samples. Mirror exactly.
- `first-chunks/{may,jun,jul,aug,sep,oct,nov}/day-NN.md` — chunk 0000 of
  each scaffolded day, copied verbatim from `src/latin/<mo>/day-NN/chunks/`.
- `drafts/{jan…nov}/day-NN.md` — finished devotional entries land here.
  Plain markdown in-repo; pandoc owns the path from here to print.

## Voice / format (locked)

- ~320 words of body text (300–340). Fits 6×9 at 11/14 Garamond with room
  for header + pull-quote.
- Three paragraphs: scene opener → substance → quiet turn toward reader.
- Header: date / saint name / one-line italic epithet with life dates
  (e.g. *Virgin, protectress of the city, c. 422–509*).
- Pull-quote closer (from the saint or a biographer), set as blockquote
  after the body.
- Register: narrative, literary, quiet — closer to Butler's *Lives* than
  *Magnificat*. Never homiletic, never "today, let us ask ourselves…"
- Second person allowed but sparingly and late — one turn near the end.

## Pipeline scripts

In `~/acta-sanctorum/scripts/`:

- `devotional-picks.mjs` — generate one-saint-per-day CSV.
- `parse-propylaeum.mjs` — extract Nov 11 – Dec 31 from supplement.
- `merge-picks.mjs`, `fix-picks.mjs` — post-processing on the CSV.

## Plan (locked 2026-05-12)

Scope: **Jan 1 – Nov 10 (315 days)**. Matches AASS coverage on heiligenlexikon.

Phases:

0. **Curate picks CSV (Jan 1 – Nov 10).** Editorial pass over
   `saints-picks.csv`. Confirm every saint before drafting; the auto-picks
   for Jan–Mar were never reviewed. Cheap and high-leverage.
1. **Phase 1 — Jan–Apr (121 entries).** Source: existing English in
   `src/translations/` + `site/`. Drafting cost is reshape-only. Order:
   Jan → Mar → Feb → Apr. One month per session ≈ 10k words.
2. **Phase 2 — May (31 entries).** Hybrid. Use existing May translations
   where available; for missing days, translate just enough of
   `first-chunks/may/day-NN.md` to support the devotional entry. The
   sliver-translations seed the main May translation pass later.
3. **Phase 3 — Jun – Nov 10 (163 entries). Mode 3b: translate on demand
   from AASS.** Per day: locate the narrative-dense passage in
   `src/latin/<mo>/day-NN/`, translate ~300–500 Latin words, then draft.
   The translations are kept and feed the main site downstream. Cadence:
   roughly one decade (10 days) per session.

All drafts land in `drafts/<mo>/day-NN.md` (plain markdown in-repo). No
Ulysses round-trip; pandoc owns the path from `.md` to print.
