# Acta August translation run log (2026-07-24) — SESSION END

> **Unrelated open item (2026-07-28):** `site/about.html` has **no translation methodology
> section at all** — the weakest of the three corpus projects on this. Brief, model page,
> and Wilson's own argument for it: **`NOTES-methodology-page.md`** at the repo root.

## Status: 804 / 2,912 chunks (27.6%), 13 days complete, 182 saint headers
Verified: 0 gaps, 0 footer leaks, 0 stray test files, frontmatter valid on all 804 files.

| day | chunks | headers | | day | chunks | headers |
|---|---|---|---|---|---|---|
| 01 | 59 | 24 | | 08 | 43 | 14 |
| 02 | 52 | 13 | | 09 | 50 | 16 |
| 03 | 67 | 13 | | 11 | 54 | 11 |
| 04 | 213 | 18 | | 12 | 42 | 15 |
| 05 | 72 | 19 | | 14 | 32 | 13 |
| 06 | 35 | 10 | | | | |
| 07 | 85 | 16 | | | | |

## REMAINING — 18 days, 2,108 chunks
10=74, 13=85, 15=36, 16=90, 17=61, 18=106, 19=74, 20=233, 21=50, 22=34,
23=107, 24=71, 25=451, 26=155, 27=81, 28=217, 29=27, 30=61, 31=95
Monsters needing shards: 25=451 (~7 agents), 20=233 (~3), 28=217 (~3), 26=155 (~2), 23=107, 18=106.

## NOT DONE ON PURPOSE (do NOT do these until the month is WHOLE)
- `split-saints.mjs --all-aug` — partial split creates saint pages a later re-split re-slugs
- `build-site.mjs`, about.html refresh, pagefind, deploy — all wait for a complete August
- Wilson's stop instruction 2026-07-24: no new agent runs launched after the last three landed

## PROVEN METHOD THIS RUN (reuse for the remaining days + Sep-Nov)
- Opus agents, 3 concurrent (8GB cap). One agent = one or two COMPLETE days where the total
  fits; shard only days too big for one agent. Whole-day ownership makes gap-check trivial.
- Envelope: 71-96 chunks per agent all completed at full fidelity. Token burn 790K-995K per
  agent for 71-96 chunks; runtime ~70-90 min (the 96-chunk one took ~2.4h incl. a stall).
- Prompt = July frozen template + anti-self-throttle preamble naming the past failure pattern
  verbatim. ZERO self-throttle failures this run (7 agents, 7 completions).
- STALL CONFIRMED BENIGN AGAIN: the day-11/12 agent went 42 min with no disk writes, no
  notification, then resumed and finished. Do NOT relaunch on silence. Only a terminal
  status=failed justifies a gap-fill relaunch.

## Header rules — CORRECTED 2026-07-24 (I got this wrong mid-session)
`isSaintBoundary()` honorifics are (ST.|STS.|S.|SS.|SAINT|SAINTS|B.|BB.|BL.|BLESSED|VEN.|
VENERABLE|THE HOLY|THE BLESSED) after `^ON ` or `^CONCERNING `, plus `^DE SS?. `.
=> `ON BLESSED X` and `ON THE HOLY MARTYRS X` ARE detected. They are NOT defects.
   333 files across deployed Jan-Jul use `ON BLESSED`; that is the corpus-majority form.
   I edited 5 Aug day-02/03 headers on the wrong premise and REVERTED them (snapshot at
   ~/acta-snapshots/aug-blessed-fix-20260724/, files restored, verified identical).
=> The form that genuinely needs normalizing is spelled-out `DE SANCTIS …` / `DE SANCTO …` /
   `DE BEATO …` — NOT covered by `^DE SS?. `, so an un-normalized line WOULD be missed.
   August uses these much more than Jan-Jul did. Agents handled them correctly once told.
=> Actually-fatal forms (May day-22 family): `OF SAINT X`, `OF S. X`, `CONCERNING BLESSED X`,
   or any lowercase opening keyword/honorific.

## ANOMALIES TO REVISIT AFTER THE MONTH IS BUILT
Run `node scripts/scan-duplicate-translations.mjs` at month end.

Known-source duplications (expect `dedupeBlocks()` in split-saints to absorb these):
- aug/day-04/0069 — para [360] (Ghent Beguinage charter, 1227) appears twice verbatim in the LATIN
- aug/day-04/0141 — paras [944]-[945] appear twice; 2nd copy truncates at "Fecit quoque"

EXPECTED scanner FALSE POSITIVES — do NOT "fix" (legitimate Greek + facing-Latin parallel texts,
same class as the known leontius 0.34 hit):
- aug/day-08/0010, 0012 — Acts of St. Myron, Acts of St. Marinus
- aug/day-09/0019-0027 and aug/day-14/0002-0009 — long Greek Acts w/ Bollandist facing Latin
- aug/day-12/0004-0005 — Greek compendium of Anicetus/Photius + facing Latin

Watch at build time (harmless but unusual):
- aug/day-14/0031 — frontmatter-only, 60 bytes. Its LATIN source is 100% German footer, so there
  was genuinely nothing to translate. File kept so the 1:1 gap check stays clean.
- aug/day-07 is 61% one saint: chunks 0033-0084 = St. Cajetan of Thiene.
- aug/day-12/0039-0040 — §§56-69 are one long Bollandist editorial bracket (miracles absent from
  their MS, supplied from Böddeken/Corsendonk/Surius). Brackets preserved intentionally.

Cosmetic, no action (corpus-wide scrape artifact):
- Citations that lost their numeral render `column [ ]` / `page [ ]`. day-05 used `column —`
  instead (that one agent ran before the convention was pinned); not worth retrofitting.
- day-14/0016 paragraph numbering jumps [18]→[20]; original to the print.
- Source self-contradictions left as printed (Ursicius 500 vs 700 soldiers; Marcellus 500 vs
  fifty sheep) — the Bollandists flag these themselves.
- day-06/0011 — agent restored a dropped footnote letter `k.` where the a–z sequence was
  unambiguous; reported rather than done silently.
