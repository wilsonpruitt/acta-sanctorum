# Acta August translation run log (2026-07-24) — SESSION END

> **CLOSED 2026-07-28:** the translation-methodology section is written and live on
> `site/about.html`. The brief it was built from — **`NOTES-methodology-page.md`** at the
> repo root — is kept as the record of what the page must contain. Note that the page
> cites this run's numbers (804 sections, 7-of-7 clean completions, the five reverted
> day-02/03 headers), so material changes here may want reflecting there.

## Status: 1,285 / 2,912 chunks (44.1%), 20 days complete
(The pre-2026-08-01 log said "13 days complete" for 804 chunks; its own table listed only 12 and
the chunk sum confirms 12. Corrected here — the day counts, not the chunk counts, were off.)
Verified: 0 gaps, 0 footer leaks, 0 stray test files, frontmatter valid on all 1,033 files.

| day | chunks | headers | | day | chunks | headers |
|---|---|---|---|---|---|---|
| 01 | 59 | 24 | | 09 | 50 | 16 |
| 02 | 52 | 13 | | 10 | 74 | 16 |
| 03 | 67 | 13 | | 11 | 54 | 11 |
| 04 | 213 | 18 | | 12 | 42 | 15 |
| 05 | 72 | 19 | | 13 | 85 | 14 |
| 06 | 35 | 10 | | 14 | 32 | 13 |
| 07 | 85 | 16 | | 15 | 36 | 7 |
| 08 | 43 | 14 | | 22 | 34 | 14 |

## REMAINING — 11 days, 1,627 chunks
18=106, 20=233, 21=50, 23=107, 24=71, 25=451, 26=155, 27=81, 28=217, 30=61, 31=95
Monsters needing shards: 25=451 (~7 agents), 20=233 (~3), 28=217 (~3), 26=155 (~2), 23=107, 18=106.
Only 21=50, 30=61, 24=71, 27=81, 31=95 still fit whole-day ownership; everything else shards.

## ROUND 2026-08-03 — days 16, 17, 19, 29 (252 chunks, 3 Opus agents, 3 clean completions)
Running total 13 agents, 13 clean completions, zero self-throttle.
Verified: 0 gaps, 0 footer leaks, 0 same-day header collisions, 0 fatal header forms, frontmatter
valid on all 252. EN:Latin ratio 1.438-1.476 across the four days (corpus norm ~1.46).
**The header fix WORKED.** This round's prompt added: "keep the identifying NAMES on the header
line itself, before any comma — the splitter reads the header line only and cuts at the first
comma." Agents complied unprompted-by-followup (day-19 folded a ten-name martyr list up; day-16
recast `DE SS. MARTYRIBUS ALEXANDRINIS ORIONE…` so the pre-comma name stays distinguishable).
Zero collisions needed hand-fixing, vs 4 last round. KEEP THIS CLAUSE IN THE PROMPT.
⚠️ Do NOT infer agent effort from reported token counts: the day-16 agent reported 109K tokens for
90 chunks where comparable days reported 830-980K. Its EN:Latin ratio is 1.476, dead normal, and
all 90 files are full length. Telemetry artifact, not truncation. (Cf. [[feedback_haiku-agent-telemetry-gate]].)

## ROUND 2026-08-01 — days 10, 13, 15, 22 (229 chunks, 3 Opus agents, 3 clean completions)
Envelope held again: 74 / 85 / 70 chunks per agent, 833K–956K tokens, ~75–88 min each.
Running total 10 agents, 10 clean completions, zero self-throttle.
August confirms the RESUME prediction: nearly EVERY header in these days arrived as spelled-out
`DE SANCTIS/DE SANCTO/DE S./DE B.` and had to be normalized to `ON ST./ON SS./ON BL./ON THE HOLY`.
Agents did this correctly when told; ~45 headers normalized across the four days.

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
- aug/day-22/0006-0007 — Anthusa Acts: the Greek column falls in 0006 and its facing Latin in
  0007, so paragraphs 1-7 legitimately appear twice across the chunk boundary. Source parallel,
  NOT a translation overlap.

## BARE `ON THE HOLY MARTYRS` HEADERS — investigated 2026-08-01, NOT a defect
When agents normalize a Hieronymian martyr-class header to a bare `ON THE HOLY MARTYRS` with the
identifying names on a following subtitle line, several such entries in one day slug identically.
I first read this as the mega-merge defect class. It is NOT. Two mechanisms are in play and both
are working as designed:
1. `extractSaintName` cuts at the first comma (line ~126) so `MARTYRS, GREAT IN NUMBER` → "Martyrs".
   That comma cut is LOAD-BEARING corpus-wide (`JULIANA, VIRGIN OF NICOMEDIA` → "Juliana") —
   do NOT "fix" it; changing it would re-slug every deployed month.
2. These Hieronymian notices run 150-160 words each, so the deliberate `<200-word` absorb rule
   folds them into the preceding entry. That rule exists to prevent fragment pages.
Result in aug/day-10: three short martyr classes share `0003-martyrs-crescentio.md` (481 words
total). That is correct behavior, not a mis-merge. The real defect was 27k-line files swallowing
unrelated MAJOR saints; nothing of that kind here.
Cosmetic change kept: the name-lists in aug/day-10/0029 were folded up onto their header lines
(corpus-majority form) — better display names, no functional effect.
NOTE for any future audit: 22 days across apr-jul also carry 2-3 bare `ON THE HOLY MARTYRS`
headers in the same day (apr 07/08/10/13/15/16/28, may 02/03/04/10/12/15/18, jun 23,
jul 03/11/12/23/25/27/31). Assume the same benign absorb behavior unless a specific page shows a
SUBSTANTIAL entry buried in another. Not investigated further, not a known defect.

Watch at build time (harmless but unusual):
- aug/day-14/0031 and aug/day-15/0035 — frontmatter-only. Their LATIN source is 100% German
  footer, so there was genuinely nothing to translate. Files kept so the 1:1 gap check stays clean.
- aug/day-10 and aug/day-13 — SYSTEMATIC scrape defect: the first paragraph after every `§`
  section head has lost its bracketed number (day-10 Lawrence commentary is missing [11] [22]
  [32] [44] [54] [64] [77] [90] [100] [107] [118], the Amadeus Acts [13] [27] [39] [63] [72]
  [88] [109] [134] [143] [150]; day-13 the same at [12] [21] [26] [38] and through Radegund /
  Maximus / Cassian). Numbering is otherwise continuous. Same class as `column [ ]` — a scrape
  artifact, not a translation error. Not worth retrofitting.
- aug/day-10/0019 — three footnote letters (s, t, u) absent in the Latin though the note bodies
  are present; agent supplied them where the a-z sequence was unambiguous and REPORTED it, same
  judgment call as day-06/0011. Not a silent repair.
- aug/day-13/0007 — mangled whitespace glyphs around `Locus + sigilli`, rendered as indentation.

Source self-contradictions left as printed (the Bollandists flag most themselves):
- day-10: Ado's annotation f puts Lawrence under Aurelian where the commentary argues Valerian;
  the 165 Soldiers header says Aurelian, §2 concludes Valerian, §6 reverts to Aurelian; Nicholas V
  twice called "Nicholas the Fourth"; a 1482/1483 clash in the Amadeus miracles.
- day-13: `id tempus` vs `id opus` for the same quoted sentence (0078 vs 0080); Druthmar's
  translation dated both 1100 and 1086 in the Corvey Annals.
- day-15: St. Arnulf's death given as XIII Kal. Sept. in the Acts, corrected to XVIII Kal. Sept.
  in the Bollandists' own note k; Book III advertises a ch. 19 with no text (their note i) and
  carries bare chapter numerals VI, VII, IX, XI, XII with no content under them; the bell-tower
  miracle dated MXCI in the Acts, MLXXXI in Sigebert.
- day-22: the commentary says "concerning the emperor Trajan" where the Acts it just quoted name
  Aurelian; 0013 has an intrusive-looking `non` with its footnote definition displaced into the
  next chunk; the Porto martyr-lists differ irreconcilably between Martyrologies.
- aug/day-07 is 61% one saint: chunks 0033-0084 = St. Cajetan of Thiene.
- aug/day-12/0039-0040 — §§56-69 are one long Bollandist editorial bracket (miracles absent from
  their MS, supplied from Böddeken/Corsendonk/Surius). Brackets preserved intentionally.

Verified NOT a problem (checked 2026-08-03, don't re-investigate):
- aug/day-16/0038 `ON THE FRONT OF THE ALTAR` / `ON THE BACK OF THE ALTAR` (Hyacinth's tablet
  inscriptions) — the day-16 agent flagged these as possible false splits. Tested against the real
  `isSaintBoundary()`: both return FALSE. `THE FRONT`/`THE BACK` are not in the HONORIFIC list
  (only `THE HOLY`/`THE BLESSED`). Same for `ON THE 13TH DAY OF AUGUST` in day-13.

New convention application (2026-08-03): the empty-bracket `[ ]` device, previously used only for
citation numerals dropped by the scrape, was extended by the day-17 agent to an IMPOSSIBLE source
reading — `die LX Februarii` (a 60th of February) → `the [ ] day of February`. Correct instinct:
mark the lacuna, never guess the numeral. Reuse this for other nonsensical numerals.

Cosmetic, no action (corpus-wide scrape artifact):
- Citations that lost their numeral render `column [ ]` / `page [ ]`. day-05 used `column —`
  instead (that one agent ran before the convention was pinned); not worth retrofitting.
- day-14/0016 paragraph numbering jumps [18]→[20]; original to the print.
- Source self-contradictions left as printed (Ursicius 500 vs 700 soldiers; Marcellus 500 vs
  fifty sheep) — the Bollandists flag these themselves.
- day-06/0011 — agent restored a dropped footnote letter `k.` where the a–z sequence was
  unambiguous; reported rather than done silently.
