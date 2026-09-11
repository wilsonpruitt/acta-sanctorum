# September — running record

Companion to `MAP-sep.md` (pre-dispatch scoping) and `PROMPT-sep.md` (the frozen prompt).
Same shape as `RESUME-aug.md`. Nothing is split, built, or deployed until the month is whole.

---

# ⛔ READ THIS FIRST IF AN AGENT DIED OR THE USAGE LIMIT HIT

**Run this before anything else. Do not skip it, and do not trust the dead agent's report.**

```
node scripts/check-day.mjs sep --gaps
```

It prints, per day, the exact inclusive ranges still missing. **Relaunch ONLY those ranges.**

## Why — this is the single most expensive mistake available here

On 2026-08-09 three August agents returned `status=failed` (weekly limit) with a `result` field
containing only their opening line. It read as *"nothing was written."* **92 chunks were already on
disk.** Relaunching the original ranges would have re-translated all 92 — and re-translation of
already-banked chunks is precisely the mechanism behind this corpus's ~65 duplicate-translation
pages, which are still not fully triaged.

Also verified then, and worth knowing: **every interrupted run's last file ended exactly where its
Latin did.** No in-flight chunk was lost or truncated. A killed agent costs you nothing but its
current chunk.

## The resume recipe (proven twice in August)

1. `node scripts/check-day.mjs sep --gaps` → the ranges.
2. Build the resume prompt from `PROMPT-sep.md` with the gap range as the assignment, **plus**:
   - the exact words the last completed chunk ended on (so the seam meets mid-sentence);
   - the verbatim list of saint headers **already emitted earlier in that day** — paste them into
     the `HEADERS ALREADY EMITTED` block so a continued dossier gets byte-identical pre-comma text;
   - "chunks `0000`–`NNNN` are ALREADY DONE and verified: do not touch them."
3. Dispatch. Then `node scripts/check-day.mjs sep day-NN` for the full verify.

## Do NOT relaunch on silence

An agent going 40+ minutes with no disk writes and no notification is **normal** — confirmed
repeatedly in July and August; one went 42 minutes and then finished all 96 chunks. Only a terminal
`status=failed` justifies a gap-fill. A low reported token count is likewise not truncation (see the
telemetry-artifact note below, now seen three times).

## ⏸ THE SEPTEMBER COMPLETION DEPLOY NOW CARRIES MORE THAN SEPTEMBER
Wilson, 2026-08-30: **hold the full deploy until September is complete.** Riding along with it:
- **30 oversized page slugs fixed** — 6 in September, **24 on the LIVE site** (renamed but not yet
  published), with **24 permanent redirects** mapped in `site/vercel.json` (tracked master copy at
  `deploy/vercel.json`, because `site/` is gitignored). See **D10** in `CORPUS-DEFECTS.md`.
- ⚠️ **A rebuild does NOT delete old pages** (no `rmSync` over `SITE_DIR`), so the 24 stale files
  must be removed at deploy time — list in `deploy/stale-pages.txt`.
- ⚠️ **`build-site.mjs` has NO completeness gate** — it links September whenever any September saints
  exist, labelled `(in progress)` at `sepDayCount < 30`. The mid-month rule holds only because nobody
  runs the build. **Do not run it until day 30 lands.**

## 🚀 PARTIAL DEPLOY — DAYS 01–13 LIVE, 2026-09-11 (Wilson: "Let's just deploy September 1-13")
Wilson changed the Aug 30 hold: days 01–13 ship now, and the whole month deploys when it's done (target 09-13).
- Split **one day at a time** (`--source sep/day-NN`, days 01–13 only): **252 entries**. Every header
  in the chunks also appears in the saint files. Five short entries (<200 words) were folded into the
  entry before them, as designed: 02 timothy + aithalas-and-ammun → maxima · 07 faciolus → gratus · 09 mark-and-his-companions → donatus… · 11 syrus-and-serapion → diodorus….
- Built, then pagefind (4,700 pages) and sitemap (4,700 URLs). Homepage line fixed in `build-site.mjs`
  ("January through August are done, September is underway"). The 24 files in `deploy/stale-pages.txt` were deleted.
- `vercel --prod --archive=tgz` from `site/`. Checked live: September index, day-13, and a day-07 saint page
  return 200; day-14 returns 404; homepage shows "252 entries (in progress)".
- ⚠️ **Don't run `--all-sep` until days 14 and 30 are COMPLETE.** It splits any day that has files, so a partial
  day-14 would go out. Days 01–13 re-split the same way every time (slugs are per day), so a later `--all-sep` is safe.
- ⬜ day-02 slug `6-628-martyrs-of-nicomedia-and-ss-aithalus-and-junius-and-philip-and-theodotus` is **78 chars**
  (ruling ④ of 09-04 put the names back in). It's live at that URL now, so if you recast it, add a redirect.
- day-14 stopped at **321/387** (last file written 09-06 06:09). Not in this record: run `--gaps`, then fill only 0321–0386.

## ✅ ROUND I COMPLETE — 2026-09-05, days 04 + 28 — 535 chunks

**September stands at 3,413 / 4,120 chunks (82.8%), 28 of 30 days.** `check-day.mjs sep --gaps`
returns COMPLETE for all 28 with no gap anywhere. Remaining: **14 (387) + 30 (320) = 707 chunks.**

Wilson approved the burn: **"opus go b"** — explicitly choosing the SPLIT shape over all-four-at-once,
his reason verbatim: *"a would suck up my usage and fail."* Two Opus agents, whole-day ownership,
launched concurrently: **day-04 (294, vol II) · day-28 (241, vol VII).** Estimated **~5.4M tokens**
at the runbook's own rate (~10K/chunk). Both output dirs were EMPTY at dispatch — no prior work.

**⛔ IF THIS SESSION DIED, DO NOT RELAUNCH THESE DAYS FROM 0000.** Run
`node scripts/check-day.mjs sep --gaps` first and gap-fill only the missing ranges.
⚠️ A parent's death does not kill its children — watch the file count until **stable**.

**Round J, NOT yet approved: days 14 (387) + 30 (320) = 707 chunks, ~7.1M tokens.** Wilson approved
Round I only. Ask again before dispatching Round J. On completion of BOTH, September is
**4,120/4,120, 30 of 30** and the month goes whole.

### ✅ DAY-28 COMPLETE — 241/241, verified on disk 2026-09-05
Not taken from the agent's report: `ls | wc -l` = 241, range `0000`–`0240` with **0 missing and 0
duplicate**, `check-day.mjs` and `check-header-boundaries.mjs` re-run independently.

```
files 241/241 · frontmatter ok · footer leak none
EN:LA byte ratio 1.170 · per-chunk <0.9 ⚠ 0012(0.87) · headers → slugs 21 → 21
```
**D11: clean — zero September entries** (the checker's 209 hits are all pre-existing, in the eight
deployed months). All 21 headers byte-identical to the frozen table; all traps held (both Fausti,
both Salomons, both joined dossiers in colon form, one John).

**The 0012 outlier is Greek, verified independently: 7,908 Greek characters in the Latin and the
identical 7,908 in the English** — the Chariton Vita reproduced verbatim per convention 3, with only
the facing Latin column translated. Greek is byte-heavy in UTF-8 and passes through unexpanded, so
it drags the ratio down; the day's high 1.170 overall is the same effect in reverse, the rest of the
day being Greek-free. Not a defect.

The agent **self-sharded into 8**, cutting at dossier boundaries so no mandated string straddled a
seam — the third day-wide self-shard on this project, and the first where the coordinator had a
pre-frozen whole-day table to hand down rather than building one. 34 `[ ]` lacunae (30 of them
scraped `Col.` citation numbers), 1 `[Col. [ ]]` carried through at 0052, 41 ledger lines appended.

## ⚖️⚖️ TWO RULINGS BY WILSON — 2026-09-05. Both applied the same day.

### ① D12 SCOPE = SEPTEMBER. Swept, 1,340 markers inserted.
*"With 1, scope is September."* → **1,553 of 1,721 dropped-numeral section openings now carry `[ ]`
(90.2%)**; September's line-initial `[ ]` count went 256 → 1,596. Backup first
(`~/acta-sanctorum-backup-sep-<ts>/`, 3,413 files); all 28 days re-gated after: **COMPLETE, 0 D11,
every `headers → slugs` parity unchanged.** Feb–Aug deliberately untouched — he scoped it to
September, so the deployed months still differ and that is now a known, recorded state.

**168 openings were skipped on purpose and listed in `D12-WORKLIST.json`** (139 bare-`CAPUT` heads
with no gloss anchor, 29 heads straddling a chunk boundary). Nothing was guessed: where the target
could not be identified with certainty the sweep skipped. Full mechanics in D12.

⭐ **The mapping took three attempts and the first two were wrong in ways every gate would have
missed.** "Insert before the paragraph after the head" is correct only for `§ N. <inline summary>`
heads. Bare `CAPUT`/`APPENDIX` heads have an **unnumbered chapter argument** in between — and the
English sometimes wraps it over several paragraphs, so "skip exactly one" fails too. A third shape,
the wrapped `§` summary, was caught only by noticing 51 targets began **lowercase**. *A paragraph in
this corpus never begins mid-sentence, so a lowercase target is a proof of mis-mapping* — that check
is worth keeping for any future sweep.

### ② THE `Col.` RULE CONFIRMED — swept, and my own pre-sweep call was WRONG
*"With 2, confirm the rule and sweep."* The rule holds: **`Col.` after a volume citation is a
citation** (prose `column [ ]`); **`Col.` interrupting running prose is the edition's column marker**
(`[Col. [ ]]`).

⛔ **But I told Wilson 0265 was "the one clear miscategorization" and it was not.** Reading the sites
properly showed the scrape's mechanism is *glue-to-next-token-and-eat-its-first-letter*, so
`tom. 1 Col.um. 17` is `tom. 1` + marker + `[n]um. 17` — the citation is **num. 17**, and `[Col. [ ]]`
was right all along. Same for `tom. 2 Col.Hic`. **The lesson: classify these from the glued token,
not from the words before `Col.`** — the preceding `tom. N` is a decoy that reads like a citation
locus in exactly the cases where it is not.

Three real fixes, all in day-04: **0114** had a bare untranslated `Col.` left standing as a word
("*Col.* observes this to our purpose") → `[Col. [ ]] He observes…`; **0171** and **0204** used prose
`col.` where the corpus form is `column`. Day-04 now reads 9 `[Col. [ ]]` · 4 `column [ ]` · all
surviving numbers as `column NNN`, with no bare `col.` left.

⭐ **0222 was left as the agent had it, against my first reading.** `Col.tiam` looks like marker +
`[e]tiam`, but the sentence's governing `asserit` at the end demands an accusative-and-infinitive,
so `Coli etiam` ("that St. Rosalia is *venerated* also") is the grammatically forced reading and
there is no marker to preserve. **Grammar outranked the mechanism here** — the one site where it does.

### ✅ DAY-04 COMPLETE — 294/294, verified on disk 2026-09-05
Independently checked, not taken from the report: 294 files, range `0000`–`0293`, **0 missing, 0
duplicate**.

```
files 294/294 · frontmatter ok · footer leak none
EN:LA byte ratio 1.170 · per-chunk <0.9 NONE · headers → slugs 18 → 18
```
**D11: zero sep/day-04 lines.** All 18 headers byte-identical to the frozen table, one occurrence
each, on the mandated chunk. Ratio 1.170 with Greek in only 35 of 294 chunks — the light-Greek
high-and-clean shape, per-chunk span 1.052–1.236 with no fat/thin pair, so no read-batching.

**All six traps held**, including the three Marcelli (the third stayed inside the 0124 group with no
header of his own) and both Naples Candidae separated on the source's own `JUNIORE` contrast alone.
⭐ The **`IN MONTE` → `ON THE MOUNT` D11 trap was live in three shards** — Rosalia is a mountain-cave
dossier — and every instance was recast (`IN NEBO MONTE ARABIÆ` → `AT MOUNT NEBO IN ARABIA`). That
clause has now paid for itself on the first day where the geography made it near-certain to fire.
The agent **self-sharded into 7** at 42 chunks each (the Latin was near-uniform at ~10.6 KB/chunk).
**195 ledger lines** appended — `REPAIRS-sep.md` now holds 240 rows across days 04/27/28.

### ⭐⭐ DAY-04 CORROBORATES D12 INDEPENDENTLY — and this time it IS independent
The day-04 agent, which never saw day-28's shard argument, reported the same finding unprompted:
*"the paragraph number is missing from the first paragraph of nearly every `§` and `CAPUT`
throughout the day… which reads as a scrape artifact rather than a printed fault."* It then did
**not** supply `[ ]`, leaving day-04 at 1 marker against 173 dropped numerals.

⚠️ **This is a genuinely independent confirmation, unlike day-28's seven shards** — a different day,
a different corpus stretch, a separate agent, no shared brief on the question. Two independent reads
now agree the numeral is *missing rather than never printed*, which is the branch-②/③ question, and
the measurement in D12 agrees with both. **What no agent did was act on it**, because each treated a
settled ruling as an open one. D12 stands; the scope is still Wilson's.

### ⬜ OPEN, FOR WILSON — the day-04 `Col.` convention, 15 sites, and the rule that sorts them
The scrape glued every `Col.` to the following token and ate that token's first letter
(`Col.cribit` for `scribit`). Three shards read it three ways: **8 rendered `[Col. [ ]]`** (convention
6's marker form, correctly bracketed — it matches the 87 corpus-wide instances), **3 rendered prose
`column [ ]`**, and ~4 were handled as branch-① repairs or left where the number survived.

⭐ **The Latin sorts them mechanically, and the agents' split was NOT arbitrary — it was one rule
applied inconsistently.** Where `Col.` follows a volume citation it is a *citation* and belongs in
prose; where it interrupts running prose it is the edition's own *column marker* and takes
convention 6's form:

```
0103  apud Labbeum tom. 4 Concil. Col.        CITATION → "column [ ]"     ✅ rendered prose
0265  Ughellus Italiæ sacræ tom. 1 Col.       CITATION → "column [ ]"     ❌ rendered [Col. [ ]]
0268  quem laudatus Ughellus Col.cribit       MARKER   → "[Col. [ ]]"     ✅
0270  idem testificantibus, ac Gianna Col.el  MARKER   → "[Col. [ ]]"     ✅
0271  se pedetentim duci per Giannam Col.d    MARKER   → "[Col. [ ]]"     ✅
```

So **0265 is the one clear miscategorization** (`tom. 1 Col.` is Ughelli's *Italia Sacra* vol. 1,
column N — a citation). ⬜ Wilson: confirm the `tom. N Col.` = citation rule and the 15 sites can be
swept in one pass. Nothing has been changed.

### ⛔⛔ THE DAY-28 SHARD DISAGREEMENT WAS NOT AN UNRULED QUESTION — IT WAS A MEASURABLE FACT, AND THE MAJORITY WAS WRONG
Seven shards preserved the unnumbered section-opening paragraph; shard E wrote `[ ]` in ten places.
The agent framed this as a ruling Wilson owed it and **defaulted to the majority reading**. Running
ruling ②'s own detector settles it against the majority: day-28 skips exactly one numeral at **96 of
99 section heads**, and at restarts numbering resumes at `[2]`, not `[1]` — so the numeral existed
in print and the scrape ate it. **Shard E was right; the other seven under-marked ~86 openings.**

⭐ **The lesson is the one already on file twice** ([[feedback_briefed-agents-are-not-independent]],
[[feedback_two-agents-same-error-suspect-the-prompt]]): **seven shards of one agent agreeing is one
brief, not seven findings.** A shard majority is not evidence, and "most of me did X" is not a
reason to prefer X. The cheap control was a detector Wilson had already specified and nobody ran.

Scope turned out to be September-wide — **1,721 of 1,781 section heads (96.6%)**, against only 256
`[ ]` markers of every kind in all the English. **Recorded as D12 in `CORPUS-DEFECTS.md` with four
options. ⬜ Wilson picks the SCOPE; the ruling itself already exists.** Nothing has been changed.

### ⭐ THE FOUR MONSTERS WERE DELIBERATELY LAST — AND SPLITTING THEM WAS WILSON'S CALL, ON USAGE
The four are 04 (294), 14 (387), 28 (241), 30 (320) = 1,242 chunks. Offered as one round (~12.4M)
or two, at identical total cost, **Wilson took the split for usage-window risk, not price.** The
supporting argument was that day-14 at 387 is nearly double the largest day ever given to one agent
(day-01, 199), and that three August agents had already died to a weekly limit mid-round. Pairing
04+28 also keeps the two heaviest days out of one window and puts the lighter pair first as the
maiden run of the silent-repair ledger.

### ✅ ALL SIX MANDATED SPANS RE-MEASURED BEFORE DISPATCH — all six CORRECT this time
Per the standing rule that *a mandated span is an instruction to OVERWRITE headers, so a too-long
span is more dangerous than no mandate*, every row was re-derived by mapping `^DE [A-Z]` to chunk
numbers rather than trusted from the table. Day-18/day-17's two bad spans have no counterpart here:

| Day | Dossier | Table said | Measured | Verdict |
|-----|---------|-----------|----------|---------|
| 04 | Moses | 0000–0107 (108) | 0000–0107 | ✅ |
| 04 | Rosalia | 0167–0249 (83) | 0167–0249 | ✅ |
| 04 | Rose of Viterbo | 0250–0289 (40) | 0250–0289 | ✅ |
| 28 | Faustus of Riez | 0033–0073 (41) | 0033–0073 | ✅ |
| 28 | Wenceslaus | 0108–0154 (47) | 0108–0154 | ✅ |
| 28 | Bernardino of Feltre | 0173–0240 (68) | 0173–0240 | ✅ |

### ⭐ THE WHOLE HEADER TABLE WAS FROZEN AND MACHINE-VERIFIED BEFORE DISPATCH — 41 headers, not just the mega-dossiers
Round E's lesson (concurrent shards have no report to read, so mandate up front) was applied to
**every dossier on both days, not only those over 40 chunks** — 18 headers on day 04, 21 on day 28
(two chunks, 0004 and 0005, legitimately carry two headers each). Each string was run through the
**real `isSaintBoundary()` and `extractSaintName()` evaluated out of `split-saints.mjs` by source**,
not eyeballed. All 41 return `true`; all 41 display names are distinct. The tables went to the
agents as files, so a self-sharding coordinator can hand them down verbatim.

**This is the first round where the frozen table covers the whole day.** Rationale: D11 rejection is
invisible to every other gate, and the cheap moment to catch it is before a single chunk is written.

### ⭐ FOUR EPITHETS SOURCED FROM THE DOSSIERS' OWN SUBTITLES — the day-01 Vincent-of-Besalú method, now routine
None came from outside knowledge of who the saint was; each has a witness that can be pointed at:
- **day-28/0074's bare `DE S. FAUSTO EPISC.`** → its own subtitle reads `TARBENSI IN NOVEMPOPULANIA`
  → **`ON ST. FAUSTUS OF TARBES`**, against 0033's Faustus of Riez.
- **day-28/0001's seven-name-plus-thirty-soldiers group** → its own subtitle `IN VARIIS ASIÆ MINORIS
  LOCIS` and its own index lines (`Marcus M. in Asia Minore (S.)`) → collective
  **`ON THE HOLY MARTYRS OF ASIA MINOR: …`**.
- **day-04's two Marcelli** → `PROPE CABILONEM IN DUCATU BURGUNDIÆ` → **of Chalon** (0113); `TUNGRIS
  VEL TREVIRIS IN GERMANIA` → **of Tongres** (0122).

⚠️ **The two Candidae are the instructive case: BOTH are `NEAPOLI`, so place cannot separate them.**
The warrant is the source's own `JUNIORE` at 0137, which licenses `THE YOUNGER` and, by its own
contrast, `THE ELDER` at 0108. That is a textual witness, not biography — exactly the branch-①/②
boundary the silent-repair clause draws. Had the source not said *Junior*, the right move was `[ ]`
and a report, not an inferred epithet.

### ⚠️ A THIRD MARCELLUS HIDES INSIDE A GROUP HEADER
Day-04/0124 `DE SS. RUFINO, SILVANO, MARCELLO, GAIANO` carries a Marcellus who is **not** either
dossier Marcellus and must never be given a header of his own. The group form
`ON SS. RUFINUS AND SILVANUS AND MARCELLUS AND GAIANUS, MARTYRS,` keeps him inside the group's
display name. **A `^DE [A-Z]` sweep finds dossier heads; it does not find a name-clash buried in a
companion roster** — that needs reading the roster itself.

### ⛔ THE D11 TRAP THE ASIA MINOR HEADER WAS WRITTEN TO DODGE
The natural English for `ET DE TRIGINTA MILITIBUS` is `ON THE THIRTY HOLY SOLDIERS…`, which
`isSaintBoundary()` **silently rejects** — `THIRTY` sits between `THE` and `HOLY`, the exact shape
that killed day-01/0077's twelve brothers. Rejected, thirty martyrs get no page and every other gate
stays green. The mandated collective avoids it. **This is now the second real instance of the same
defect, both caught pre-split; the shape recurs specifically on numbered groups.**

### Two hedges that are NOT ruling-③ cases — a distinction worth keeping
`DE SANCTA GRATA VIRGINE, UT FERTUR` (04/0139) and `DE S. DODA VIRGINE, ET FORSAN MARTYRE` (28/0005)
both hedge, but they hedge a **status**, not a **name** — unlike day-27's `AC FORTE APHRODISIO`,
where the hedge sat on a person who would otherwise lose his page. Status hedges fall after the
comma and the splitter discards them, so they need no ruling: keep them as printed. Ruling ③ is
about hedged *names* only.

---

## ✅ ROUND H COMPLETE — 2026-09-03/04, days 01, 17, 18 — 562 chunks

Covered by Wilson's Round G+H approval ("Both rounds, Opus, go"). Three Opus agents, whole-day
ownership, launched concurrently: **day-01 (199, vol I) · day-17 (175, vol V) · day-18 (188, vol V).**
Estimated ~5.6M tokens. On completion September reaches **2,878 / 4,120 (69.9%), 26 of 30 days**,
leaving only the four monsters — 04 (294), 14 (387), 28 (241), 30 (320) = 1,242 chunks.

**⛔ IF THIS SESSION DIED, DO NOT RELAUNCH THESE DAYS FROM 0000.** Run
`node scripts/check-day.mjs sep --gaps` first and gap-fill only the missing ranges. None had prior
work. ⚠️ A parent's death does not kill its children — watch the file count until **stable**.

### ✅ SEPTEMBER IS AT 2,878 / 4,120 CHUNKS (69.9%), 26 OF 30 DAYS — 2026-09-04

`check-day.mjs sep --gaps` returns **COMPLETE for every one of the 26 days.** No gaps anywhere.

| Day | Chunks | Vol | check-day.mjs | headers → slugs | D11 |
|-----|--------|-----|---------------|-----------------|-----|
| 01 | 199 | I | files ok · frontmatter ok · no footer leak · no chunk <0.9 · ratio 1.167 | **34 → 34** | 0 |
| 17 | 175 | V | files ok · frontmatter ok · no footer leak · no chunk <0.9 · ratio 1.156 | **17 → 17** | 0 |
| 18 | 188 | V | files ok · frontmatter ok · no footer leak · no chunk <0.9 · ratio 1.133 | **11 → 11** | 0 |

**Days still to do (4): 04 (294), 14 (387), 28 (241), 30 (320) — 1,242 chunks.** The monsters, as planned.

⭐ The day-01 gap-fill closed all three ranges (`0064`, `0122`–`0131`, `0193`–`0198` = 17 chunks) and
resolved the day's two hardest calls with sourced evidence:
- **`DE SANCTIS MARTYRIBUS AFRICANIS` ruled a GENUINE dossier** — it has its own subtitle roster, its
  own source line, its own `[Commentarius]`, **four of its own index lines**, and its own `J. P.`
  byline: the full day-10 Caesarea signature, none of which day-17's `DE CULTU…` sub-section had. The
  four names came from its own subtitle, so no collective had to be invented.
- **The second Vincent** got `OF BESALÚ` from his own subtitle `BISULDUNI IN CATALONIA` (the
  commentary itself glosses `Bisuldunum, vulgari nomine Besalu`), against 0119's Vincent of Dax.
- **The second Priscus** became `ON THE HOLY AFRICAN CONFESSORS OF THE KINGDOM OF NAPLES: …`, the
  collective built only from `AFRICANIS CONFESSORIBUS` + `IN REGNO NEAPOLITANO` in its own subtitle.
⚠️ It also flagged that day-01/0122's index line prints **Amausus** where the mandated header reads
**AMASUS** — mandate kept byte-identical, index line kept as printed, difference on record.

---

## ⚖️⚖️ FOUR RULINGS BY WILSON — 2026-09-04. All applied; nothing left pending on them.

### ① THE SILENT-REPAIR CLAUSE — ruled, written into `PROMPT-sep.md`, ledger created
**A word the scrape mangled, whose correct form is fixed by a witness in the immediate text → CORRECT
IT AND LOG IT.** Numerals, dates, places and names with **no** textual witness → `[ ]` + report.
Anything the source **prints**, however wrong → preserve exactly (convention 4, untouched).

The licence is narrow and deliberately so: *"fixed by the immediate text" means a witness you can point
at* — the same word spelled correctly elsewhere in the dossier, or a grammatical form with one possible
completion. **Not "what it probably was", and not your own knowledge of who the saint was.** The named
failure mode is drifting from branch ① into branch ②: "the text fixes it" quietly becoming "I know what
it should say."

✅ **New file `REPAIRS-sep.md` is the ledger.** A branch-① correction that is not in it **is** a silent
repair. Seeded with the two disclosed day-27 cases (`Jones` → John Mark; `Sec. I.` → `Cent. I.`).
Ordinary OCR noise translated straight to evident sense needs no line. ⬜ Days 04, 14, 28, 30 are the
first bound by it; retro-filling days 01–29 is optional and low value.

### ② DAY-25 IS NO LONGER INTERNALLY SPLIT — repaired under the new clause, 10 chunks
Shard A's silent gaps were closed with `[ ]`, matching shard B's existing form (`[ ] [marginal note] Text`).

⭐ **The repair was NOT done by pattern-matching "paragraphs with no number".** That crude sweep gave 20
candidates, most of them legitimate. The precise detector is **a numbering sequence that skips exactly
one across a section head** — `[n] … § … [n+2]` — which yielded **10**, and each was then checked
against the Latin to confirm the numeral is **absent there too** (`[12] … § II … [14]` in 0005,
`[7] … § II … [9]` in 0013, `[9] … CAPUT II … [11]` in 0044). So it is a **scrape drop**, branch ②, and
`[ ]` is right — not content the agent lost, which would have needed the real number restored.
✅ Residual skip-by-one gaps in shard A: **0**. Distribution now A 20 · B 30. Backup taken before edit.

### ③ DAY-27's `AC FORTE APHRODISIO` — names in the title, hedge in the body
```
was  ON SS. FLORENTINUS AND HILARY AND PERHAPS APHRODISIUS, MARTYRS AMONG THE ÆDUI IN GAUL,
now  ON SS. FLORENTINUS AND HILARY AND APHRODISIUS, MARTYRS AMONG THE ÆDUI IN GAUL,
```
Aphrodisius still gets a findable name; the title stops asserting a scholarly judgement. The hedge
survives verbatim in the body, where the Bollandists themselves put it (3 occurrences in 0016 —
*"why I have joined Aphrodisius to them I shall note below"*, *"I have only doubtfully joined him"*).
`headers → slugs` unchanged at 15 → 15.

### ④ DAY-02/0010 — the `ITEM DE` outlier brought into line with the ruling
```
was  ON THE HOLY 6,628 MARTYRS OF NICOMEDIA: WITH SS. AITHALUS, JUNIUS, PHILIP, AND THEODOTUS, MARTYRS,
now  ON THE HOLY 6,628 MARTYRS OF NICOMEDIA AND SS. AITHALUS AND JUNIUS AND PHILIP AND THEODOTUS: MARTYRS,
```
Aithalus and his three companions are back in the display name. `headers → slugs` unchanged at 22 → 22,
`isSaintBoundary()` verified `true`. **September now has no `ITEM DE` outlier left.**

### ⑤ D11 ON THE EIGHT DEPLOYED MONTHS — DEFERRED, deliberately
~50–56 saints currently get no page across the deployed months. **Wilson's call: defer until September
ships**, then treat it as its own session with per-case reading, one month at a time. `isSaintBoundary`
is **not** to be widened — that fixes ~48 with no translation edits but silently re-splits every
deployed month at once with no per-case reading. Nothing touched.

### ⬜ ONE ITEM CAME BACK TO WILSON — day-26/0037 is NOT the same thing as 0042
The "strip the glosses" ruling was taken on a description that fitted **0042** and not **0037**:
- **0042 — a true editorial insertion inside a quotation**, `In the said church (the cathedral) are many
  bodies of Saints`. ✅ **Stripped**, per the ruling.
- **0037 — NOT an editorial gloss.** It is the **English rendering of a lapidary inscription that is
  transcribed verbatim above it** in epigraphic form (`FFINES FVNDIC APITINIANI / IVRIS SC̄Ē EC̄C̄L̄ R̄ŌM…`),
  followed by `(That is: But four ounces of the estate Eucarpianum…)`. **Stripping it would leave
  untranslated Latin in an English text, which convention 1 forbids.** ⬜ **Left in place pending Wilson.**

⚠️ There is **no house precedent either way**: `(That is:` occurs exactly twice in the whole corpus,
both on day-26, and no deployed month carries verbatim Latin epigraphy at all (`HIC IACET`,
`DEPOSITVS`, `EXPLICIT`, `IVRIS` → 0 files). So this ruling sets the convention for inscriptions
corpus-wide, and it will recur.

### ⛔ THE SESSION USAGE LIMIT KILLED ROUND H MID-RUN — 2026-09-04, ~2am reset
`You've hit your session limit` (HTTP 429) terminated the day-01 parent, the day-17 parent, and
several shards of both. **The protocol paid for itself a FOURTH time.**

- **day-17 came back COMPLETE (175) even though its parent died.** Its orphaned children finished the
  day on their own — the Round-F day-29 pattern exactly. A blind relaunch from 0000 would have
  re-translated all 175 chunks.
- **day-18 was already COMPLETE (188)** and untouched.
- **day-01 stopped at 182/199.** `--gaps` returned three ranges: **`0064` (1) · `0122`–`0131` (10) ·
  `0193`–`0198` (6) = 17 chunks.** Only those were relaunched. File count confirmed **stable** before
  dispatch (a parent's death does not kill its children).

⚠️ The day-17 parent's last words were *"the 0153 section heading I mandated begins with `ON `,
exactly the shape the header rule forbids. Fixing it now."* — **it died mid-fix.** Do not assume a
dying agent's announced repair was applied; check it. It had not been.

### ⭐⭐⭐ A REAL D11 DEFECT WAS CREATED IN SEPTEMBER AND CAUGHT PRE-SPLIT — day-01/0077
**`ON THE TWELVE HOLY BROTHERS: DONATUS AND FELIX AND …` is SILENTLY REJECTED by `isSaintBoundary()`**
— a quantifier (`TWELVE`) sat between `THE` and `HOLY`, which is one of the named D11 classes. The
dossier runs **0077–0091, fifteen chunks**. Rejected, it produces **no page**: twelve martyrs vanish
and their text accretes onto Sixtus and Sinicius (0070–0076), while `check-day.mjs` reports
`headers → slugs` perfectly self-consistently and every other gate stays green.

⚠️ **This overturns "September is clean" as a standing fact.** September was clean because the
`PROMPT-sep.md` rules prevented it — but the rules never named this shape, so day 01 produced one the
first time a large group needed the colon form. **The `PROMPT-sep.md` header rules did not state that
the honorific must sit IMMEDIATELY after `ON `.** That clause now goes in every dispatch.

✅ **FIXED, and the fix is also the more literal rendering.** Latin is `DE SS. DUODECIM FRATRIBUS
MARTYRIBUS,` — *sanctis duodecim fratribus*, "the **holy twelve** brothers". So:

    ON THE TWELVE HOLY BROTHERS: …   → REJECT
    ON THE HOLY TWELVE BROTHERS: …   → PASS   ✅ applied

⭐ **The right fix was the header line, NOT widening `isSaintBoundary()`** — widening is the option
the D11 note calls "the tempting and most dangerous," because it silently re-splits every deployed
month at once with no per-case reading. Nothing in the splitter was touched.

### ✅ TWO FRAGILE `ON `-OPENING SUBTITLES RECAST ON DAY 17
Both were *correctly* rejected by the splitter, so neither was causing a false split — but both
violate `PROMPT-sep.md`'s own rule that a subtitle must never begin with `ON `, and both would become
false splits the moment `isSaintBoundary()` were ever widened. Recast against their own Latin:

| Chunk | Latin | Was | Now |
|---|---|---|---|
| 0096 | `IN MONTE S. RUPERTI JUXTA BINGIUM…` | `ON THE MOUNT OF ST. RUPERT NEAR BINGEN…` | `AT THE MOUNT OF ST. RUPERT NEAR BINGEN…` |
| 0153 | `DE CULTU, RELIQUIIS ET MIRACULIS RECENTIORIBUS.` | `ON THE CULT, THE RELICS, AND…` | `OF THE CULT, THE RELICS, AND…` |

⭐ 0096 is instructive: the Latin is `IN MONTE`, and rendering `IN` as `ON` is what created the
forbidden shape. `PROMPT-sep.md`'s own example is this exact case (`ON MOUNT SCETIS IN LIBYA` →
`IN MOUNT SCETIS OF LIBYA`). **A location line translated naturally will drift into the fatal shape;
the rule has to be checked, not remembered.**

✅ Re-verified after all three edits: `check-header-boundaries.mjs` returns **zero rejections** across
sep/day-01 and sep/day-17, and day-17 still reads 175 files · 17 → 17.

### ✅ DAY 17 LANDED AND VERIFIED — 2026-09-04

| Day | Chunks | Vol | check-day.mjs | headers → slugs | D11 |
|-----|--------|-----|---------------|-----------------|-----|
| 17 | 175 | V | files ok · frontmatter ok · no footer leak · **no chunk <0.9** · ratio 1.156 | **17 → 17** | 0 (after recast) |

✅ The **Lambert colon form held**: `ON ST. LAMBERT AND BB. PETER AND ANDOLETUS: BISHOP OF MAASTRICHT
AND MARTYR,` at 0030, once, byte-identical. ⭐ And the shard-A report **vindicates Wilson's ruling on
the evidence**: Peter and Andoletus are Lambert's kinsmen (`nepotes`), named in six sources, killed
before him in expiation and laid in one shrine with him at Liège — **and their whole dossier sits
inside Lambert's**, so they have no other page in September. A primary-only header would have erased
two martyrs the corpus records nowhere else. The `ETC.` beyond them covers the unnamed rest of
Lambert's household (Anselm's *multi … procul dubio martyres effecti*), whose bodies, the Bollandist
notes, nobody recorded.

✅ Hildegard ended at 0141 as re-measured; **0142 Gandolphus and 0158 Peter Arbués got their own
`ON BL.` headers**, not Hildegard's name. Day heading checked: `XV KAL. OCTOBR.` — correct for 17 Sep.

⭐ **Day-17's best unflagged find:** the 0058 copper epitaph calls Lambert the **"twenty-ninth and
last-but-one bishop of the Tungrians"** — a numbering nowhere reconciled with the succession lists the
same Commentary uses. Also `Act. 8 ℣ 36` for Acts 9:36 (0004), and Simon de Brie given two regnal
numbers in one clause, `Martinus II, by others IV` (0007).

### ✅ DAY 18 LANDED AND VERIFIED — 2026-09-03

| Day | Chunks | Vol | check-day.mjs | headers → slugs | D11 |
|-----|--------|-----|---------------|-----------------|-----|
| 18 | 188 | V | files ok · frontmatter ok · no footer leak · **no chunk <0.9** · ratio 1.133 | **11 → 11** | 0 |

⛔✅ **THE 0142/0143 BOUNDARY HELD — verified independently, not taken on the report's word.**
`THOMAS OF VILLANOVA` occurs at **0023 only**; a scan for it in any chunk numbered ≥0143 returns
**zero**. `JOSEPH OF CUPERTINO` occurs at 0143 only. Exactly 11 `^ON ` lines exist on the day. The
corrected span (0023–0142, re-measured 2026-08-30 and again 2026-09-03) did its job: on the old
`0023–0187` figure, all 45 of Joseph's chunks would have been headed with Thomas's name.

⭐ Day heading checked: `SANCTI, QUI COLUNTUR XIV KAL. OCTOB.` — 18 September **is** the XIV Kalends
of October. Correct, unlike day 25's.

### ⭐⭐ THE CENTRAL `[ ]` RULING WORKED — MEASURED, NOT ASSUMED
Day 18 carries the same day-wide scrape defect day 25 had (the first numbered paragraph after every
`CAPUT`/`§`/document head loses its numeral) — **85 instances, spread across all four shards.** This
is precisely the day that would have shipped internally split.

`[ ]` markers per shard range: **A 0000–0047 = 35 · B 0048–0095 = 34 · C 0096–0142 = 31 · D 0143–0187 = 29.**
Evenly distributed, no shard at zero. Compare **day 25, where one shard wrote 21 and the other wrote 0.**

⭐ **The fix was not the policy's content but WHERE it was decided** — the parent ruled once, centrally,
before sharding, and stated it verbatim in every shard prompt. Keep this for days 04, 14, 28 and 30;
they are bigger and will shard wider.

### ⚠️ A BARE `Col.` GREP OVER-COUNTS `[Col. NNN]` MARKERS BADLY — new, from day 18
The day-18 agent's own pre-dispatch scan flagged **six** chunks as carrying inline `[Col. NNN]` markers.
**Only one did** (0177, `[Col. 01044A]`). The other five (0010, 0021, 0033, 0069, 0144) were ordinary
**citations whose column number the scrape had glued to the next word** — convention-7 `[ ]` lacunae,
not corpus markers. Two of its shards correctly reported the discrepancy against their instructions.
⚠️ **If a future dispatch note lists `[Col.]` chunks from a plain `Col.` grep, expect most to be lacunae**
and say so in the prompt, or shards will be told to preserve something that is not there.

### ⭐ THE `SI19001` STRAY TOKEN IS IN THE LATIN SOURCE — preserved, correctly
It follows the Bollandist index line at **0143, 0157, 0179, 0181** in the Joseph dossier. Confirmed
present in the Latin at exactly those four chunks, so rendering it verbatim is right and deleting it
would have been a silent repair. Almost certainly a scrape/database artefact, but uniform and recorded.

### ⭐ Day-18's most valuable unflagged find: A WRONG YEAR INSIDE A QUOTED PAPAL DECREE
**0156** — Clement XI's dispensation reads `sequuti die XVIII Septembris `**`MDCXLIII`**. Joseph of
Cupertino died in **1663**; the decree is twenty years out. Quoted silently by the Bollandist and
preserved as printed. Six further printed paragraph-numbering corruptions preserved per convention 4
(0012 `[19]` for 29 · 0022 `[n16]` · 0075 `[223]` for 233 · 0078 `[162]` for 262 · 0113 `[127]` for
527 · 0117 `[449]` for 549).

### What Round G's lessons changed in these three prompts
- **The `[ ]` policy is now stated as ONE policy and the parent must fix it centrally before sharding**
  — the day-25/day-29 split-policy defect, blocked at the source rather than repaired afterwards.
- **Each agent is told to check its own `SANCTI, QUI … KAL. … COLUNTUR` line and report a mismatch**
  (17 Sep = XV Kal. Oct., 18 Sep = XIV Kal. Oct., 1 Sep = the Kalends themselves). Day 25's wrong
  heading was rendered faithfully but went **unreported**, which is the failure this closes.
- **Both corrected mandated spans carry the full explanation of what the old figure would have done**,
  so no agent widens a span to cover its own shard boundary: day-18 Thomas ends **0142** (0143 opens
  Joseph of Cupertino), day-17 Hildegard ends **0141** (0142 Gandolphus, 0158 Peter Arbués).
- **Lambert and day-01/0122 carry the new colon-form strings** from Wilson's `ITEM DE` ruling, each
  marked as superseding the old primary-only table row so it cannot be "simplified" back.

### ⛔⛔ DAY 01 IS A DIFFERENT SHAPE FROM THE OTHER TWO — 34 headers across 199 chunks
Its risk is **not** a mega-dossier crossing a seam; it is **name collisions, more than any September day
dispatched so far**. The seven given to the agent, each with the instruction to derive every epithet
from that dossier's OWN Latin and to report which words it used:
1. ⛔⛔ **THREE Ægidii/Giles** — 0168 `DE SANCTO ÆGIDIO ABBATE`, 0180 `ÆGIDIO EREMITIS`, 0182 `DE BEATO
   ÆGIDIO ABBATE`. **0168 and 0182 are identical Latin but for `SANCTO` vs `BEATO`** — `ON ST. GILES,
   ABBOT,` and `ON BL. GILES, ABBOT,` both cut to `Giles` and merge a saint with a blessed. The purest
   form of the August day-25 Ebba defect yet seen.
2. **Two Prisci** (0059 bishop-martyr, 0123 group head) · 3. **Two Vincentii** (0119 bishop, 0122
   presbyter) · 4. **Rosa of Sulci** (0064, `fortasse M.` hedge) · 5. **Firminus the confessor** (0104)
   against day-25's Firminus of Amiens the martyr · 6. **A bare `DE SANCTO LUPO`** (0147, no epithet in
   the header at all) against day-25's Lupus of Lyons, with his **mother** Austregildis a separate
   dossier at 0157 · 7. Doublets `MARTHA VEL MATHANA`, `VICTORIO SEU VICTURIO`, `AUSTREGILDE VEL AGIA`.

⚠️ **Chunk 0122 alone carries FIVE headers**, one of them the `ITEM DE` case, and one of them
`DE SANCTIS MARTYRIBUS AFRICANIS` — which **names no saint** but is likely a real dossier, the mirror of
day-10's `DE AFRICANIS MARTYRIBUS…`. ⬜ The agent was told to read it, rule, and report which way.

⚠️ Five day-01 headers arrive spelled out (`DE SANCTA VERENA`, `DE SANCTO AREALDO`, `DE SANCTO LUPO`,
`DE SANCTO ÆGIDIO`, `DE BEATO ÆGIDIO`) — **a `DE S.` grep would have missed all five.** The widened
`^DE [A-Z]` net keeps paying.

## ✅ ROUND G COMPLETE — 2026-09-03, days 25, 26, 27 — 371 chunks

Wilson approved the burn ("Both rounds, Opus, go"), covering **Round G and Round H together**.
Three Opus agents, whole-day ownership, launched concurrently:
**day-25 (116, vol VII) · day-26 (119, vol VII) · day-27 (136, vol VII).**
Estimated ~3.7M tokens at the runbook's own rate (~10K/chunk, from Round F's 421 chunks ≈ 4.2M).

**⛔ IF THIS SESSION DIED, DO NOT RELAUNCH THESE DAYS FROM 0000.** Run
`node scripts/check-day.mjs sep --gaps` first and gap-fill only the missing ranges — see the recipe
at the top of this file. None of the three had prior work, so a dead agent's day is simply partial.
⚠️ And remember a parent's death does not kill its children (day-29, Round F): watch the file count
until it is **stable** before dispatching anything into one of these days.

**Round H, pre-approved and queued: days 01 (199), 17 (175), 18 (188) = 562 chunks, ~5.6M tokens.**
Dispatch it once G verifies. That takes September to **2,878 / 4,120 (69.9%), 26 of 30 days**,
leaving only the four monsters — 04 (294), 14 (387), 28 (241), 30 (320) = 1,242 chunks.

### ✅ ALL THREE DAYS LANDED AND VERIFIED — 2026-09-03

September now **2,316 / 4,120 chunks (56.2%), 23 of 30 days.**

| Day | Chunks | Vol | check-day.mjs | headers → slugs |
|-----|--------|-----|---------------|-----------------|
| 25 | 116 | VII | files ok · frontmatter ok · no footer leak · ⚠ 0115 (0.21, legitimate) · ratio 1.155 | **18 → 18** |
| 26 | 119 | VII | files ok · frontmatter ok · no footer leak · ⚠ 8 chunks <0.9 (see below) · ratio 1.103 | **11 → 11** |
| 27 | 136 | VII | files ok · frontmatter ok · no footer leak · no chunk <0.9 · ratio 1.152 | **15 → 15** |

**Days still to do (7): 01, 04, 14, 17, 18, 28, 30 — 1,804 chunks.**

⚠️ **day-25/0115's 0.21 ratio is correct, not truncation.** Its entire Latin content is two variant-reading
lines (`* l. ea`, `* l. alicui`) plus the German scrape block, which was correctly deleted. Verified by
reading the chunk, not by trusting the report — this is the convention-2 trap firing exactly where the
prompt says it will (the last chunk of a day is where the furniture block lives).

`check-header-boundaries.mjs` (the **D11** gate) returns **zero rejections** for both days — September
stays clean in both categories, which is what the `PROMPT-sep.md` rules are for.

**Both mandated strings on each day occurred exactly once**, at the dossier opening, byte-identical.
Later chunks of those dossiers correctly carry no header — the expected case, not lost headers.

#### ⭐ Day-26's eight sub-0.9 chunks are the KNOWN Greek false-positive class — CONFIRMED, not assumed
0025, 0031, 0060, 0069, 0070, 0073, 0076, 0083 — all from the **Greek Acts / Confession of Cyprian
of Antioch** and the **Greek Vita of Nilus**. Checked three ways before accepting them:
- **Greek character counts are byte-identical LA vs EN** in all eight (7,120–8,093 chars each), so the
  Greek was reproduced verbatim per convention 3 with nothing dropped.
- **Non-Greek content EXPANDS healthily** in every one — 5→15, 27→50, 129→186, 70→113 tokens.
- **0025 is 100% Greek** — zero non-Greek words in the Latin source at all.

Cause is the one already recorded further down this file: the scrape stores **one word per line**, the
English joins it into paragraphs, so thousands of newline bytes vanish while the Greek passes through
at ratio 1.0. ⚠️ **Do not "repair" one of these.** The gate is right to flag and wrong to convict; the
discriminator is the Greek-character equality, not the byte ratio.

#### ⭐⭐ NEW UNFLAGGED SOURCE ERROR — DAY 25'S OWN DAY-HEADING IS WRONG IN THE PRINTED SOURCE
day-25/0000 reads `SANCTI, QUI VII KAL. SEPTEMB. COLUNTUR.` — but 25 September **is** the VII Kalends
of **October**, and day-25's own body text says `VII Kalends of October` repeatedly (Ado, Peter de
Natalibus). Swept the whole run to confirm it is isolated:

`21 XI KAL. OCTOBR · 22 X · 23 IX · 24 VIII · 25 VII KAL.` **`SEPTEMB.`** `· 26 VI OCTOBRIS · 27 V · 28 IV · 29 III · 30 PRIDIE KAL. OCTOBRIS`

**Day 25 is the only day in the month that says SEPTEMB.** The agent rendered it faithfully (correct
under convention 7 — never silently repair) but **did not report it**, so it would have gone unrecorded.
⭐ Found by checking the translation against the Latin rather than reading the agent's report, which is
the whole argument for the gate pass. ⚠️ It belongs in the imprint's *What Is Known to Be Wrong*.

#### ⚠️⚠️ THE SILENT-REPAIR SPLIT-POLICY DEFECT RECURRED — SECOND TIME, DIFFERENT DAY, SAME SHAPE
Day-25's two shards applied **opposite policies to the same day-wide scrape defect.** The scrape dropped
the bracketed paragraph number from every `§`-opening paragraph. **Shard A left the gap silent; Shard B
wrote `[ ]`** — 21 files (0058, 0059, 0061, 0062, 0069, 0073, 0076, 0078, 0079, 0082, 0085, 0087, 0089,
0091, 0097, 0103, 0105, 0107, 0108, 0109, 0111). So day 25 is internally split, exactly as day 29's 93
chunks were.

⭐ **This is now a two-instance pattern, and it indicts the PROMPT, not the agents** — the
[[feedback_two-agents-same-error-suspect-the-prompt]] lesson in its mirror form. `PROMPT-sep.md`
conventions 4 and 7 genuinely point opposite ways here: 4 says preserve numbering **as printed**
(supports A), 7 says a **missing numeral** gets `[ ]` plus a report (supports B).

✅ **Interim policy applied to Round H, read off convention 7's own text, not invented:** a paragraph
number *present in print but lost to the scrape* is a **missing numeral** → `[ ]`. Convention 4 governs
numbering that IS printed (jumps, repeats, plainly wrong); convention 7 governs numbering that is gone.
Round H prompts mandate `[ ]` **and** require the parent to fix one policy centrally before sharding.
⬜ **Wilson still rules** — day 25's 21 files are a one-pass fix either way, and nothing is deployed.

#### ⬜ Day-27: a clean test case for the SILENT-REPAIR CLAUSE Wilson still owes
`day-27/0002` Latin reads `quo minus idem esse possit Jones` — **`Jones` is a scrape corruption of
`Joannes`**, and chunk 0003 spells `Joannes Marcus` three times in the same argument. The agent
rendered it "John Mark" and **reported it rather than doing it silently**. This splits the two
branches of the proposed clause exactly: *grammar-determined word → correct + list* (it is not a Latin
word and the surrounding text fixes it) vs *name → `[ ]`* (it is a name, and names are bracketed
precisely because that is where invention hides). **Left as translated, pending Wilson.** Decide before
day 30 — the monsters will produce many of these.

Also disclosed, lower stakes: `Sec. I.` (day-27/0000) rendered `Cent. I.` after day-27/0007's
`Sec. I post LXIII` proved it abbreviates *saeculo*, not *sectio*. An abbreviation expansion, not a
numeral repair.

#### ⬜ Day-27: the `AC FORTE` hedge went INTO the display name
0016 emitted `ON SS. FLORENTINUS AND HILARY AND PERHAPS APHRODISIUS, MARTYRS AMONG THE ÆDUI IN GAUL,`
→ display **"Florentinus and Hilary and perhaps Aphrodisius"**. The agent reasoned from Wilson's own
`ITEM DE` rule: Aphrodisius appears nowhere else in September, so a primary-only header erases him,
while asserting him flatly resolves a question the Bollandists deliberately left open (convention 7).
The hedge is carried in the body too (`why I have joined Aphrodisius to them I shall note below`).
⚠️ **"and perhaps" in a page title is a new shape in the corpus** — Wilson to confirm or recast.

#### ⬜ Day-26: two items the agent flagged for a human before deploy
- **Parenthetical English glosses added after the two lapidary inscriptions** (0037, 0042) — an
  addition to the source; convention 1/7 territory. Needs a reading.
- 0030's missing footnote letters `b`/`q` are a **source absence, not an output defect** — recorded so
  a later gate does not re-open it.

#### ✅ The two Eusebii were separated, and from the day's OWN Latin
`ON ST. EUSEBIUS THE POPE,` (0048) vs `ON ST. EUSEBIUS OF BOLOGNA,` (0052). Verified independently:
day-26/0000's roster prints `S. Eusebius Episcopus Conf., Bononiæ in Italia.` and 0052 carries
`Eusebium episcopum Bononiensem`, `Bononiæ item sancti Eusebii`, `S. Eusebium Bononiensem`. The
epithet came from the dossier's own text, not from outside knowledge — the rule the prompt demands.

### Pre-dispatch header sweep (`^DE [A-Z]`, the only correct pattern)
Re-run 2026-09-03 over all six Round G+H days. **Every mandated span in `PROMPT-sep.md` verifies**,
including the two corrected 2026-08-30 rows: day-18 Thomas of Villanova really does end at **0142**
(0143 opens `DE B. JOSEPHO A CUPERTINO`) and day-17 Hildegard at **0141** (0142 Gandolphus, 0158
Peter Arbués). Day-17/0153 `DE CULTU, RELIQUIIS ET MIRACULIS RECENTIORIBUS.` is confirmed a **false
positive** — it sits inside the Gandolphus dossier and carries its own `^APPENDIX` line.

Counts: day-25 **18** headers (0034 carries three) · day-26 **11** (0047 carries two) ·
day-27 **15** (0007, 0063 and 0065 carry two each) · day-01 **34** (0122 carries five, 0157 two,
0180 two) · day-17 **18** (0001, 0005, 0009 carry two or three each) · day-18 **11**.
`^APPENDIX` — day-27/0077 · day-01/0103, 0127, 0157 · day-17/0153 · day-18/0179, 0181. All
sub-sections, never headers; each agent told so. **No header wraps across physical lines** on any of
the six days (checked, not assumed — day-22's Theban Legion header was four lines).

### ⚠️ NAME COLLISION FOUND AT SCOPING — new, was not in the standing trap list
**Day 26 has TWO men named Eusebius, four chunks apart:** 0048 `DE S. EUSEBIO PAPA CONF.` and 0052
`DE S. EUSEBIO EPISCOPO CONF.` Both cut to `Eusebius` and would merge onto one page — the August
day-25 Ebba defect. The agent was told to build each epithet from that dossier's **own** Latin
subtitle and index line, never from outside knowledge, and to report where each came from.

### Slug traps flagged before dispatch, not after
**Day 27 is unusually dense in spelling doublings** — `ZENA ALIAS ZENONE` (0007), `ELEUTHERO AUT
ELEUTHERIO` (0065), `CERAUNIO VEL CERAUNO` (0067) — the day-10 Euplus class, where each variant
doubles into the slug. Day 25 has `AUNARIO SEU AUNACHARIO` (0051) and `BARRO VEL FINBARRO` (0086),
day 26 `THEOCTISTO SEU THEOGNITO` (0003). Two `FORTE` hedges: day-25/0099 `ANTILIA VIRGINE AC FORTE
MARTYRE` and day-27/0016 `AC FORTE APHRODISIO` — ⚠ the second is the Bollandists hedging whether
Aphrodisius belongs to the group at all; **render the hedge, never resolve it** (convention 7).
Large groups pointed at the colon form with a collective from their own Latin subtitle: day-26/0000
Callistratus **+ 49 soldiers**, day-25/0034 Bardomianus/Eucarpus **+ 26**, day-25/0034 the Paul and
Tatta family of six. Day-25/0101 Maria de Cervello is the longest header of the three days.

### Two extra mandated strings issued beyond the `PROMPT-sep.md` table
The table's threshold is ~40 chunks, but a dossier below it still crosses a **self-shard** seam:
- day-27 **Cosmas and Damian, 0031–0062 (32)** → `ON SS. COSMAS AND DAMIAN AND ANTHIMUS AND LEONTIUS AND EUPREPIUS, MARTYRS,`
- day-26 Cyprian and day-26 Nilus and day-27 Elzéar issued from the table unchanged.

⚠️ **Day 25 needed none** (18 headers across 116; longest run 0012→0034, 22 chunks) — but the agent
was still bound by the pre-comma rule, freezing each saint's English form on first emission.

### ✅✅ THE `ITEM DE` / JOINED-DOSSIER RULE — RULED BY WILSON 2026-09-03, NOW IN `PROMPT-sep.md`
**Both parties go into the display name, colon form: every party's NAME before the colon, roles and
places after.** This is the day-05 Romulus/Melitene form made house policy — *keep both, claim
neither wrongly*. A primary-only header relocates or erases a saint who has no other page.

Supersedes two rows of the mandated table:

| Day | Chunks | Mandated header (supersedes the table row) |
|-----|--------|--------------------------------------------|
| 17 | 0030–0089 | `ON ST. LAMBERT AND BB. PETER AND ANDOLETUS: BISHOP OF MAASTRICHT AND MARTYR,` |
| 30 | 0020–0094 | `ON ST. GREGORY THE ILLUMINATOR AND SS. RIPSIME AND GAIANA: BISHOP OF ARMENIA AND CONFESSOR,` |

Also governs day-01/0122 (`DE SS. MARCIANO EP., SISINNIO, AMAUSO: ITEM DE SS. PRIMO AC MATERNO MM.`).

⬜⬜ **NEW REPAIR OWED BEFORE THE SEPTEMBER DEPLOY: Round F's day-02/0010 is now the outlier.**
It reads `ON THE HOLY 6,628 MARTYRS OF NICOMEDIA: WITH SS. AITHALUS, JUNIUS, PHILIP, AND THEODOTUS,
MARTYRS,` — the joined party sits *after* the colon, so Aithalus and his three companions are
dropped from the display name and get no page. Latin: `DE SS. SEX MILLE SEXCENTIS VIGINTI OCTO
MARTYRIBUS NICOMEDIENSIBUS. ITEM DE SS. AITHALA, JUNIO, PHILIPPO, THEODOTO MM.` Pre-split and
pre-deploy, so it is still **free to fix** — it gets more expensive after the split, exactly like
September's six oversized slugs did.

## ✅ ROUND F COMPLETE — 2026-08-30, days 19+20, 02, 29 — 421 chunks

Wilson approved the burn ("opus go"). Three Opus agents, whole-day ownership, launched concurrently:
**day-19 + day-20 (107 chunks, vol VI, one agent) · day-02 (154, vol I) · day-29 (160, vol VIII).**
Estimated ~4.2M tokens at the runbook's own rate (790K–995K per agent for 71–96 chunks).

September now **1,945 / 4,120 chunks (47.2%), 20 of 30 days.** All four days verified:

| Day | Chunks | Vol | check-day.mjs | headers → slugs |
|-----|--------|-----|---------------|-----------------|
| 02 | 154 | I | files ok · frontmatter ok · no footer leak · no chunk <0.9 · ratio 1.158 | **22 → 22** |
| 19 | 60 | VI | ok · ok · none · none · ratio 1.155 | **14 → 14** |
| 20 | 47 | VI | ok · ok · none · none · ratio 1.131 | **10 → 10** |
| 29 | 160 | VIII | ok · ok · none · none · ratio 1.150 | **13 → 13** |

Days still to do (10): **01, 04, 14, 17, 18, 25, 26, 27, 28, 30 — 2,175 chunks.**
04 (294), 14 (387), 28 (241), 30 (320) are the monsters and still stay last.

### ⚠️⚠️⚠️ THE CONTENT FILTER KILLED DAY-29 THREE TIMES — AND THE FIX IS NOT THE ONE IN MEMORY
`API Error: Output blocked by content filtering policy` killed **the day-29 parent agent, then a
fresh 8-chunk gap-fill agent, then the MAIN THREAD.** This is a text translation run with no page
images, so it is NOT the vision/plate case in `reference_vision-plate-content-filter`.

⭐ **The second kill proves it is infrastructure, not the material.** That agent died on its FIRST
token — its whole result was `I'll start by reading the frozen prompt.` It had not read
`PROMPT-sep.md` and not one Latin chunk; there was no day-29 content in its context at all.

⚠️ **`feedback_content-filter-premap` says smaller model Writes do NOT reliably recover, and that
the tactic that holds is routing prose file-to-file via Python so model output carries only line
ranges. THAT ESCAPE DOES NOT EXIST FOR A TRANSLATION** — the English *is* model output. So the
Wesley fix cannot be applied here, and the Péguy fallback (Wikisource clean text) has no Acta
equivalent either.

✅ **WHAT ACTUALLY WORKED — piecewise append, proven on 8 consecutive chunks, zero trips:**
Translate ONE chunk as **3–6 successive small appends** (`cat >> file`), ~2–3 KB each, splitting at
paragraph boundaries and giving any obviously sensitive passage its own append. Chunks 0005–0012
were finished this way in the main thread after three kills — 8/8, no further trips, ratios
1.149–1.188, both seams meeting mid-sentence.
⭐ **This contradicts the premap memory's "chunked writes don't recover" finding for the
TRANSLATION case specifically.** Both can be true: the Wesley case was bulk prose *movement* (where
file-to-file bypasses the model entirely and is strictly better); this is prose *generation*, where
piecewise output is the only lever there is.
⚠️ Do NOT rewrite the prompt, hunt for the offending passage, or switch models — the memory is
right about that much. Re-dispatch once; after ~2 kills on one unit, take it into the main thread
and go piecewise.

### Day-29's four orphaned children finished the day without their parent
The parent died having self-sharded. Its children kept running and took the day from 74 → 153 on
their own; `--gaps` shrank from five ranges (90 chunks) to one (8). **A blind relaunch from 0000
would have re-translated 152 banked chunks.** The protocol paid for itself a third time.
⚠️ File counts kept CLIMBING for ~20 minutes after the parent's failure notification arrived — so
**a parent's death does not mean its children are dead.** Watch the file count until it is stable
before dispatching anything into that day, or two agents will write the same range.

**⛔ IF THIS SESSION DIED, DO NOT RELAUNCH THESE DAYS FROM 0000.** Run
`node scripts/check-day.mjs sep --gaps` first and gap-fill only the missing ranges — see the recipe
at the top of this file. None of these four days had prior work, so a dead agent's day is simply
partial; a blind relaunch re-translates everything already banked.

Days 04 (294), 14 (387), 28 (241) and 30 (320) remain the monsters and still stay last.

### ⭐ THE MAP MISSED A MEGA-DOSSIER — day-02's Stephen of Hungary, 73 chunks
`MAP-sep.md` lists day-02 only as "Antoninus of Apamea." In fact `DE SANCTO STEPHANO PRIMO
HUNGARORUM REGE` opens at 0068 and runs unbroken to 0140 — **73 chunks, 47% of the day** — with the
usual Commentarius/Vitae/Miracula/Translatio/Annotata each carrying its own header. It never got a
frozen string because the mandated table's cutoff sat at 75 chunks and this is 73.

**Added to `PROMPT-sep.md`'s mandated table:** `ON ST. STEPHEN, FIRST KING OF THE HUNGARIANS,`
(day 02, 0068–0140). ⚠️ **The 75-chunk cutoff is the real defect** — a dossier does not stop being
cross-seam at 74. Before dispatching any remaining day, grep it with `^DE [A-Z]` and measure the
gaps; anything above ~40 chunks that will be sharded needs a mandated string. Days 01, 17, 25, 26,
27 have never had this check run against them.

### ⚠️⚠️⚠️ THE CUTOFF DEFECT WAS REAL AND WORSE THAN STEPHEN — 2 WRONG SPANS, 11 MISSING
Ran `^DE [A-Z]` over **every un-dispatched day** and measured each dossier's span to the next
header. `PROMPT-sep.md`'s mandated table is rewritten; threshold lowered from 75 chunks to **~40**.

**Two listed spans were WRONG, and one manufactures the D8 merged-works defect:**
- **Day 18 — Thomas of Villanova was `0023–0187 (165)`. He ends at `0142`.** Chunk **0143 opens
  `DE B. JOSEPHO A CUPERTINO`**, a 45-chunk dossier of his own. On the old figure, every shard past
  0143 would have been *ordered* to head Joseph of Cupertino with Thomas's mandated string. ⭐ **A
  mandated span is an instruction to OVERWRITE headers, so a too-long span is more dangerous than no
  mandate at all** — and the mandate would have made the merge look correct to every gate we run.
- **Day 17 — Hildegard was `0096–0174 (79)`. She ends at `0141`** (0142 Gandolphus, 0158 Peter
  Arbués).

**Eleven dossiers of 40–68 chunks had no mandated string at all**: 28 Bernardino of Feltre (68) ·
17 Lambert (60) · 28 Wenceslaus (47) · 01 Joshua (45) · 18 Joseph of Cupertino (45) · 26 Cyprian &
Justina (44) · 27 Elzéar de Sabran (43) · 26 Nilus (42) · 28 Faustus of Riez (41) · 04 Rosa of
Viterbo (40) — plus 02 Stephen (73). All now in the table, each string derived from that dossier's
**own Latin header and subtitle**. None has been through an agent yet. Day 25 needs none (18
headers, nothing over 40).

⚠️ Note the traps these interlock with: **Rosa of Viterbo** must carry OF VITERBO before the comma
(four distinct Rosa/Rosalia women in the month) and **Faustus of Riez** must carry OF RIEZ (day 28
has a second Faustus starting at 0074, immediately adjacent).

### ⬜ TWO THINGS THE SWEEP OPENED, BOTH NEEDING A RULING BEFORE DAY 30
- **The `ITEM DE …` / `:` joined-dossier shape keeps recurring, and the mandated strings drop the
  second party.** Day-30's Gregory header is `DE S. GREGORIO EPISCOPO ARMENIÆ CONFESSORE: ITEM DE
  SS. VIRGINIBUS RIPSIME, GAIANA ET SOCIIS` — the mandated string keeps Gregory and **silently drops
  Ripsime and Gaiana**. Day-17's Lambert header folds in `ET EA OCCASIONE DE BB. PETRO, ANDOLETO
  ETC.`; day-02's 0010 folds in a second Nicomedian group. Day-05 already set the precedent
  (Romulus/Melitene): **keep both, claim neither wrongly.** Decide before 30 and 17 are dispatched.
- **`^DE [A-Z]` has a false-positive class of its own.** Day-17/0153 is `DE CULTU, RELIQUIIS ET
  MIRACULIS RECENTIORIBUS.` — a sub-section of the Gandolphus dossier naming no saint. The mirror of
  day-10's `DE AFRICANIS MARTYRIBUS…`, which named no saint but WAS a real dossier. **The pattern is
  the right net; a reader still has to sort the catch** — do not automate the promotion.

### Pre-dispatch header sweep (`^DE [A-Z]`, the only correct pattern)
day-19 **14** headers (0012 carries two) · day-20 **10** (0026 and 0027 carry two each) ·
day-02 **22** (0011 carries five; 0010 and 0059 two each) · day-29 **13** (0079 carries two).
`^APPENDIX` in day-19/0021 and day-20/0045 — sub-sections, never headers; both agents told so.
On day-02, four of the 22 (`DE SANCTO …`, `DE B. …`, `DE BB. …`) and on day-29 four `DE B.`
blesseds would have been missed by a `DE S.|DE SS.` pattern. **The widened pattern keeps paying.**

### ⚠️ NAME COLLISIONS FOUND AT SCOPING — not in the standing trap list, now in the prompts
- **day-02 has THREE men named Justus**: 0014 bishop of Lyons (d. in the Egyptian desert), 0021
  `JUSTO SIVE JUSTINO` bishop of Strasbourg in Alsace, 0059 bishop of Clermont. ⭐ The Bollandists
  flag the third themselves — 0059's argument line reads `synonymus ab eodem diversus`.
- **day-02 has TWO Elpidii**: 0022 the abbot, patron of Sant'Elpidio; 0028 `ELPIDIO SEU HELPIDIO`
  bishop and confessor.
- **day-02 has TWO Nicomedian martyr groups** (0010's 6,628 and 0011's), and **0010 carries an
  `ITEM DE …` joining a second dossier onto the first** — the day-05 Romulus/Melitene shape, where a
  blind collective would relocate saints who do not belong together.
- **day-19 has TWO Theodores**: 0010 bishop of Verona, 0029 an archbishop.
Each agent was told to build the distinguishing epithet from that dossier's OWN Latin subtitle and
index line, never from outside knowledge, and to put it BEFORE the comma.

### Slug traps flagged before dispatch, not after
day-29 is the worst day yet seen for the "role/place leaked past the comma" class — 0145's Nicholas
of Forca Palena carries `ORDINIS EREMITARUM S. HIERONYMI CONGREGATIONIS B. PETRI PISANI`, and 0111,
0115, 0098 have the same shape. Plus four `VEL`/`SEU`/`AUT` doublings and two `FORTE` clauses on
0078/0079, which double into the slug (the day-10 Euplus lesson: **count slug TOKENS, not names**).
Both large-group headers on day-29/0078–0079 were pointed at the colon form, with the collective
`MARTYRIBUS ROMANIS` already available in the Latin.

## ✅ ROUND E COMPLETE — 2026-08-29, days 10, 15, 22 — 450 chunks
September now **1,524 / 4,120 chunks (37.0%), 16 of 30 days** (03, 05, 06, 07, 08, 09, 10, 11, 12,
13, 15, 16, 21, 22, 23, 24). Three Opus agents, whole-day ownership, launched concurrently.

| Day | Chunks | Vol | check-day.mjs | headers → slugs |
|-----|--------|-----|---------------|-----------------|
| 10 | 154 | III | files ok · frontmatter ok · no footer leak · no chunk <0.9 · ratio 1.155 | **18 → 18** |
| 15 | 147 | V | files ok · frontmatter ok · no footer leak · no chunk <0.9 · ratio 1.161 | **19 → 19** |
| 22 | 149 | VI | files ok · frontmatter ok · no footer leak · no chunk <0.9 · ratio 1.171 | **13 → 13** |

All three self-sharded (3, 6 and 5 sub-agents), all three froze the header table centrally before
dispatch, all three verified their seams. **Days 15 and 22 needed an index-head revert; day 10 did
not make the mistake at all** despite the same defective prompt clause.

Both self-sharded (6 and 5 sub-agents), both froze the header table centrally before dispatch, both
verified their seams. day-15 repaired two real cross-seam content losses of its own (0089/0090 lost
"is wont to shrink from" and "of our humanity"; 0113/0114 lost that it was the *first* of the nine
days) — **the failure mode a sharded run creates and a serial run cannot.**

### ⭐ THE INDEX-HEAD DEFECT HAS TWO SHAPES — a one-for-one recast would swallow content
Found on day-22, and it matters for any future repair:
- **Shape 1 — header ADDED above an intact index block.** The sentence-case lines are still there
  underneath; the inserted line is pure surplus and is simply deleted. (2 lines on day-22.)
- **Shape 2 — header REPLACED the index line**, and in several cases **collapsed a multi-line block
  into one header**. Restoring meant rebuilding *7* lines for the Theban Legion and 2 each for
  Drosis and Digna/Merita. (14 lines on day-22.)
⚠ **A naive one-for-one recast fixes the header count while silently losing the extra roster lines.**

### ⚠️ AND THE SHARDS DROPPED `(S.)` FROM TWO INDEX BLOCKS
Latin 0009:95–105 prints `Mauritius primicerius M. Agauni in Vallesia (S.)` on all six lines; the
English carried none. Content present in the source and absent from the translation — conventions 1
and 7, not a formatting preference, and `(S.)` vs `(B.)` carries real information. Restored on the
six lines at 0009 and six at 0029. **A day-wide sweep then confirmed 53 Latin marker lines → 53
English, zero per-chunk mismatches**; the drop was confined to those two blocks, and the seventh
line of each (`Alii milites legionis Thebææ`) correctly has no marker because the Latin has none.

### ⬜⬜ OPEN FOR WILSON — OVERSIZED SLUGS, 30 CORPUS-WIDE, 6 STILL IN SEPTEMBER
Scanned every month by evaluating the real `slugify`. **30 slugs run over 60 characters.** Four
distinct classes, and only the first is merely a long URL:

| Class | Example | Deployed? |
|---|---|---|
| Roster that needed the COLON form | sep day-06 — **198 chars**, 13 names | no |
| Role/place leaked PAST the comma | `michael-of-barga-of-the-order-of-minors-observant-near-lucca-in-tuscany` (apr day-30) | **yes** |
| Work title absorbed into the name | `45-martyrs-at-nicopolis-in-armenia-about-the-year-319-preliminary-comm…` (jul day-10) | **yes** |
| Malformed opener | `and-divinely-inspired-writer-henry-suso-…` (jan-vol2 day-25) | **yes** |

⚠ **Classes 2–4 are not cosmetic — the page's DISPLAY NAME is wrong**, showing an office or a work
title where the saint's name belongs.

Per month: aug 10 · sep 6 · mar 6 · apr 3 · jan-vol2 1 · jul 1 · jun 1 · may 1 · feb/oct/nov 0.

### ✅ SEPTEMBER'S SIX ARE FIXED — 2026-08-30, zero oversized slugs left in the month
All six recast to the colon form, **collective sourced from each dossier's own Latin subtitle, never
invented** (the day-10 Caesarea discipline):

| Day/chunk | Latin subtitle | New display name | Slug: was → now |
|---|---|---|---|
| 05/0011 | `IN GRÆCIA` + `MELITINÆ` | Romulus and the Martyrs of Melitene | 64 → 35 |
| 06/0006 | `ALEXANDRIÆ IN ÆGYPTO` | Martyrs of Alexandria in Egypt | **198 → 30** |
| 06/0012 | `EPISCOPIS IN AFRICA` | Bishops of Africa | 74 → 17 |
| 08/0000 | `ALEXANDRIÆ IN ÆGYPTO` | Martyrs of Alexandria in Egypt | 103 → 30 |
| 12/0004 | `ALEXANDRIÆ IN ÆGYPTO` | Martyrs of Alexandria in Egypt | 70 → 30 |
| 13/0001 | `TOMIS IN PONTO, ET ANCYRÆ IN GALATIA` | Martyrs of Tomi and Ancyra | 100 → 26 |

Edits were **minimal — collective + colon inserted, every roster name left byte-identical**; no
translation content was rewritten. `headers → slugs` parity unchanged on all five days (05 19→19 ·
06 17→17 · 08 11→11 · 12 16→16 · 13 17→17).

⚠ **Day-05's was not a pure roster problem.** The Latin is two joined dossiers — `DE SANCTO ROMULO
MARTYRE / IN GRÆCIA,` then `item DE SS. MM. EUDOXIO, ZENONE, MACARIO et MCIV MILITIBUS / MELITINÆ` —
so Romulus is **not** of Melitene. Header reads `ON ST. ROMULUS AND THE MARTYRS OF MELITENE: …`,
keeping both and claiming neither wrongly. A blind "Martyrs of Melitene" would have relocated him.

✅ **`martyrs-of-alexandria-in-egypt` now occurs on days 06, 08 and 12 — verified safe.** Pages build
to `<month>/day-NN/<slug>.html` with day-relative links (`build-site.mjs`), so slugs are **day-scoped**
and the three are distinct URLs. Checked, not assumed.

⬜ **Noticed and deliberately NOT fixed (day-06/0006):** the header ends with an unattached role list
— `…AND CALODOTA, MARTYRS, THE PRESBYTER, THE DEACON, THE LECTOR, THE ACOLYTE, THE SOLDIER, THE
SHIP-MASTER, THE VIRGINS AND THE MARRIED WOMAN,` — where the Latin pairs each office to its name
(`FAUSTO PRESBYTERO, BIBO VEL ABIBO DIACONO, DIONYSIO LECTORE…`). Repairing that is a translation
change, not a slug fix, so it was left alone. All of it falls after the colon and is inert to the
splitter.

**The remaining 23 are LIVE and untouched.**

**September's remaining 6 were FREE to fix** — days 05, 06, 08, 09, 12, 13, all pre-split and
pre-deploy — and get more expensive after the split. **The other 23 are LIVE**, so recasting them
changes existing URLs; that is a link-breakage decision, not a correctness one. ⬜ Wilson rules on
both. Nothing has been touched.

### ⭐ DAY-10'S EUPLUS SLUG — THE `VEL` VARIANTS DOUBLE INTO THE SLUG
The dispatch note said the 0005 Euplus group "has about six names and can take the ordinary comma
form." Wrong: each Bollandist `VEL` variant (`EUPLO VEL EUPLIA`, `CUPSICO VEL CEROCISO`) doubles into
the slug and `ET ALIIS QUINQUE` adds a clause — six names became **110 characters**. The Commentarius
confirms it, reckoning `undecim omnino fuisse Martyres`, and the Bollandists explicitly decline to
choose between the spellings (`nec lubet divinare, utro loco scribantur rectius`), so both variants
had to stay. Recast to `ON THE HOLY MARTYRS OF CAESAREA IN CAPPADOCIA: …` → **33 chars**; the
collective came from the dossier's own subtitle and its seven index lines, not invention.
**Count slug TOKENS, not names.**

## 🔴 ROUND E DISPATCH RECORD — days 10, 15, 22

Three Opus agents, whole-day ownership, launched concurrently: **day-10 (154, vol III) · day-15
(147, vol V) · day-22 (149, vol VI) = 450 chunks.** Wilson approved the burn ("opus go").

**If this session died, do NOT relaunch these three days from 0000.** Run
`node scripts/check-day.mjs sep --gaps` first and gap-fill only the missing ranges — see the
recipe above. The three days had no prior work, so a dead agent's day will simply be partial.

Each agent was given a pre-dispatch header table (grepped from its own Latin, the Round-D lesson)
and mandated header strings for its mega-dossier:
- day-10 → `ON ST. NICHOLAS OF TOLENTINO, OF THE ORDER OF HERMITS OF ST. AUGUSTINE,` (0089–0153, 65 chunks)
- day-15 → `ON ST. CATHERINE FIESCHI ADORNO, WIDOW, OF GENOA,` (0070–0114, 44) and
  `ON ST. LEONTIUS OF ROME, MARTYR,` (0114–0146, 33)
- day-22 → `ON THE HOLY MARTYRS OF THE THEBAN LEGION: MAURICE THE PRIMICERIUS AND …, MARTYRS AT
  AGAUNUM IN VALAIS,` (0009–0068, 59 — **colon form**, six named men plus the legion) and
  `ON ST. EMMERAM OF REGENSBURG, BISHOP AND MARTYR,` (0099–0136, 37)

### ⭐ THE PRE-DISPATCH GREP MUST NOT BE `DE S.` ALONE — IT MISSED REAL HEADERS THIS ROUND
Grepping `^(DE S\.|DE SS\.)` found 15 headers on day 10 and 16 on day 15. The true counts are
**17 and 19**. Missed: `DE SANCTO HILARO PAPA` (day-10 0041), `DE SANCTA CATHARINA FLISCA ADURNA
VIDUA,` (day-15 0070 — **the largest dossier on the day**), `DE B. JOANNE SALERNITANO` (day-10
0083), `DE B. ORANNA…` and `DE B. ROLANDO DE MEDICIS…` (day-15 0066, 0067).
**The correct pattern is `^DE [A-Z]` — nothing narrower.** Day-10's `DE AFRICANIS MARTYRIBUS DOLETATULO, AUT CATULO, TUSCO, VALENTINO, ET FORTASSE MAGARO` (0005) is a genuine dossier with its own Commentarius, index lines and `J. S.` byline, and it escapes even the widened `DE S.|DE SANCT|DE B.` pattern because it names no saint at all. The day-10 agent caught it and flagged it rather than absorbing it into the preceding saint. **Day-10 alone had two escapes from the narrow pattern.** Also grep
`^APPENDIX` separately and tell the agent those are sub-sections, never headers (day-10 has two,
day-15 two). And check whether a header wraps across physical lines before quoting it — day-22's
Theban Legion header is **four lines**, day-10's Numidian group is three.

### day-15 RESOLVED — reverted to 19 → 19
The agent recast all 37 index heads back to the sentence-case elogium (merging each ALL-CAPS/location
pair back into the one Latin line it came from) and re-verified: 147 files, frontmatter ok, ratio
1.161, no chunk <0.9, **19 headers → 19 slugs, one distinct form each**, both mandates untouched, the
Etruscan-Sea recast intact, all 9 `BHL Number` lines and every `(S.)`/`(Bl.)` marker preserved. No
content was deleted — only casing and header form were wrong.

⬜ **A real question it surfaced, for Wilson, low stakes:** four of the 37 do open genuinely separate
*works* — the anonymous Passio (0010), Falco the monk's Passio (0011), the 1485 Legend of Louvain
(0064), Mayer's *Miracula recentiora* (0144). They lack a `DE` header, being introduced instead by a
source line (`Ex variis exemplaribus Mss. & impressis…`) with the index head beneath. The criterion
now applied is **"a separate work with its own Latin `DE` header gets a header line"** — which is what
day-07's five Stephen of Die works had, and these four do not. Note those five all merged to one slug
anyway, so this decides an in-page heading, not whether a page is built. If the rule is ever loosened
to "separate work" regardless of `DE`, day 15 is where it would change.

### ⚠️⚠️⚠️ THE FROZEN PROMPT ITSELF CAUSED THIS — `PROMPT-sep.md` LINE 82, NOW FIXED
Two Round-E agents with no contact with each other (day-15 and day-22) independently promoted every
running Bollandist index head to an ALL-CAPS saint header: **56 headers for 19 saints** and **29 for
13**. That is not two agents erring the same way by chance. The SAINT-HEADER RULES read:

> The Latin will often arrive spelled out as `DE SANCTO …` … **or as the Bollandist index form**
> (`Hieronymus presbyter … (S.)`). **Normalize all of these to the `ON ST.` / `ON SS.` / `ON BL.` forms.**

Both agents did exactly as instructed. **The clause is now rewritten**: spelled-out
`DE SANCTO`/`DE SANCTA`/`DE BEATO` remain true article headers to normalize (they are why the
pre-dispatch grep must not be `DE S.` alone), but the running index head is explicitly excluded, the
day-08 roster/index-block precedent is written in, and "a chunk with no header at all is normal" is
restated at the point of temptation.

⚠️ **Lesson beyond this bug: when two independent agents make the same judgement call, suspect the
prompt before suspecting the agents.** The day-15 agent was told its ruling was wrong on the strength
of the day-08 precedent; that was right about the outcome and wrong about the cause.

### ✅ THE OTHER FOURTEEN DAYS ARE CLEAN — surveyed 2026-08-29
`headers → slugs` for every finished day: 03 19→19 · 05 19→19 · 06 17→17 · 07 31→26 · 08 11→11 ·
09 22→22 · 11 21→18 · 12 16→16 · 13 17→17 · 15 19→19 (after revert) · 16 19→18 · 21 20→12 ·
23 11→11 · 24 10→10. **Only day-22 (29→13) was an outlier**, and it is being reverted. The defect
did not reach the earlier rounds — day-08's agent met the same index blocks and ruled correctly
against them, which is where the house precedent comes from.

### ⚠️⚠️ INDEX HEADS ARE NOT SAINT HEADERS — AND `headers → slugs` PARITY IS THE DETECTOR
The day-15 agent ruled that the Bollandist running index head (`Valerianus martyr, Threnorchii in
ducatu Burgundiæ (S.)`) should be normalized to the saint's mandated ALL-CAPS header, because 14
chunks carry no `DE ` line and would "lose their header signal." **The premise is false and the
ruling is wrong.** A mid-dossier chunk is *supposed* to carry no header — `PROMPT-sep.md` says so
outright — and all 14 were interior to a dossier that had its `DE` header chunks earlier. The line
is a *document* identification opening a Passio inside a dossier, not an article header.
**September day-08 already ruled the other way** (roster + 27-line index block rendered in sentence
case), and that is the practice across all eight deployed months.

⭐ **The cheap detector, worth running on every day from now on:** `check-day.mjs` already prints
`headers → slugs`. **The header count should sit at or just above the saint count.** Verified days:
day-13 17→17 · day-23 11→11 · day-16 19→18 · day-07 31→26 (and day-07's surplus is five genuinely
separate *works* in the Stephen of Die dossier, each with its own Latin `DE` header). **Day-15 came
back 56→19 — a three-fold outlier that named the defect instantly.** A ratio far above ~1.5
header-lines per saint means something that is not an article header is being emitted as one.

Note the failure was *invisible* to every other gate: file count, frontmatter, footer leak, byte
ratio (1.161, dead normal), per-chunk minimum, and even the distinct-slug count were all clean,
because identical pre-comma text merges every stray line onto the correct page. Nothing builds
wrong; the article just carries a repeated ALL-CAPS heading mid-text. **Slug distinctness is not
sufficient — check the ratio too.**

## ✅ Before Round E: nothing was in flight. All thirteen started days were COMPLETE and verified.

`node scripts/check-day.mjs sep --gaps` returns COMPLETE for every one. The next session starts a
fresh round on untouched days — see "Days still to do" below.

### The protocol was tested for real on 2026-08-15 and it worked
The day-11 agent was killed by the weekly limit. Its failure `result` field contained **one
sentence** — its opening line — and read exactly like "nothing was written." **94 of 99 chunks were
already on disk.** `--gaps` returned `0094–0098`, a five-chunk gap-fill closed it, and the seam
meets mid-sentence (0093 ends "…on the year of the Lord 1278, the sixth Indiction, on the day";
0094 opens "the 7th of the month of June, in the time of lord Pope Nicholas III").

Cost of trusting the report instead of the disk would have been 94 re-translated chunks.

---

## Status: 1,524 / 4,120 chunks (37.0%), 16 of 30 days complete — Round E landed 2026-08-29

| Day | Chunks | Vol | Round | Headers → slugs | Hand-fixes |
|-----|--------|-----|-------|-----------------|------------|
| 05 | 95 | II | B | 19 → 19 | footer strip + 2 header recasts |
| 06 | 86 | II | B | 17 → 17 | **none** |
| 08 | 71 | III | A | 11 → 11 | 8 comma repairs |
| 09 | 90 | III | B | 22 → 22 | **none** |
| 11 | 99 | III | C | 21 → 18 | **none** (gap-filled 0094–0098 after limit) |
| 12 | 26 | IV | A | 16 → 16 | 6 comma repairs |
| 13 | 52 | IV | A | 17 → 17 | 4 comma repairs + 2 Amatus recast |
| 21 | 65 | VI | A | 20 → 12 | **none** |
| 23 | 77 | VI | C | 11 → 11 | **none** |
| 24 | 61 | VI | C | 10 → 10 | **none** |

**Six of the last seven days needed no hand-fixes at all.** All repairs are concentrated in Round A,
before the `NAME, ROLE,` examples went into the prompt.

Running total **41 agents, 41 clean completions, zero self-throttle** (35 carried over from August).
Round A token/time: 237K/31m (day-08), 913K/79m (days 12+13), 752K/66m (day-21).
Round B token/time: 203K/104m (day-05), 997K/87m (day-06), 141K/95m (day-09).

**Days still to do (14):** 01, 02, 04, 14, 17, 18, 20, 25, 26, 27, 28, 29, 30 — plus **19 (60)**,
which is scraped-complete but never dispatched. **2,596 chunks.** Days 04 (294), 14 (387), 28 (241) and 30 (320) are the monsters, need
sharding, and stay last; their mandated mega-dossier header strings are in `PROMPT-sep.md`.

Suggested next round (whole-day ownership, within the proven 60–96 envelope):
**10** (154) · **15** (147) · **22** (149), or the two small ones **19** (60) + **20** (47).
Round D proved whole-day serial ownership at 116 chunks and self-sharding at 111/125, so the
125–155 band is dispatchable as one agent per day. Day 19's Januarius warning is now **closed** —
see STILL OPEN below; 19 is complete at 60 chunks.

## ⚠️ THE EN:LA RATIO NORM DEPENDS ON THE METRIC — 1.15 BY BYTES IS NORMAL

`RESUME-aug.md` quotes a corpus norm of **~1.46**, which is a word-based measure. A **byte**-based
`wc -c` ratio runs **~1.15** for the same healthy days. Measured this session:

| | byte ratio |
|---|---|
| sep 05 / 06 / 08 / 09 / 12 / 13 / 21 | 1.089–1.160 |
| aug 21 / 25 / 28 (finished, verified) | 1.155 / 1.157 / 1.159 |

**Do not read 1.15 as a 20% shortfall against 1.46 — they are different measures.** Compare like
with like, and prefer a per-chunk sweep flagging anything under 0.9 of the day's own mean.

## ⚠️ THE RATIO SWEEP'S OWN FALSE POSITIVE — LINE-FRAGMENTED GREEK
day-11 chunks **0063, 0070, 0077, 0079, 0080** all scored 0.86–0.89 and are **complete**. They hold
Elias Speleotes' Greek Vita, which the scrape broke to **one Greek word per line**. The Latin file is
padded with thousands of newlines; the English reflows the same Greek into continuous text, so the
byte ratio collapses with nothing missing. Verified by comparing tails — each English chunk ends on
exactly the Greek words its Latin ends on.

**Before treating any <0.9 chunk as truncated, compare the last line of the English against the last
line of its Latin.** If they end at the same words, it is complete. This is now noted in
`check-day.mjs` itself.

## ⚠️ THE TELEMETRY ARTIFACT, CONFIRMED A THIRD TIME
day-09 reported **141K tokens for 90 chunks** where its siblings reported 203K and 997K. Checked:
90/90 files, byte ratio 1.150 (dead normal), not one chunk under 0.9. Nothing truncated. Same as
August's day-16 (109K/90) and day-31 (114K/95). **A low reported token count is not evidence of
truncation and is never grounds for relaunching.**

---

## ⭐ ROUND A'S LESSON — THE HEADER NEEDS A COMMA, AND THE PROMPT MUST SAY SO WITH EXAMPLES

August's prompt hammered *"put every distinguishing epithet BEFORE the comma"* because of the
day-20 Bernard split. Carried into September unchanged, that clause **overshot**: the day-08 agent
generalized it into "use no comma at all" and emitted 8 of 11 headers commaless, so every office
and place-name landed in the display name and the URL slug —
`corbinian-first-bishop-of-freising-in-bavaria` where the corpus wants `corbinian`. Day-12 and
day-13 did the same to a lesser degree (6 and 4 headers).

**Day-21 did not make the mistake at all** — and the reason is diagnostic. Its prompt carried a
*mandated header string* for Matthew, `ON ST. MATTHEW THE APOSTLE AND EVANGELIST,`, with the comma
in it. One worked example taught the form that three paragraphs of rule did not.

**Fix applied to `PROMPT-sep.md`:** an explicit `NAME, ROLE,` section with five ✅/❌ worked
examples, placed *before* the pre-comma rule, plus a sentence naming this exact failure so the
next agent recognizes the trap it is being steered away from. Rounds B onward carry it.

**Generalize: a rule that constrains where text goes needs a specimen of the correct output, or
agents will satisfy the rule by deleting the structure it operates on.**

### The corpus form, for reference
`ON ST. <NAME>, <ROLE AND PLACE>,` — name before the comma, office/status/location after it.
The epithet moves *before* the comma **only** when two saints in the day would otherwise collide
(Genesius the Mime vs. Genesius the Notary; Amatus of Remiremont vs. Amatus of Sens). Group headers
are the exception: all the *names* stay before the comma, joined with `AND` so more survive the cut.

---

## ⚠️ VERIFY BY EVALUATING `extractSaintName`, NEVER BY READING THE AGENT'S REPORT

Round A produced two cases where the report and the disk disagreed, both caught by running the
real splitter functions over the emitted files:

1. **day-21 Alexander.** The agent reported emitting `ON ST. ALEXANDER, BISHOP AND MARTYR,` at both
   0026 and 0028. On disk 0028 has no header — its section is headed `ACTS OF THE MARTYRDOM`, which
   `isSaintBoundary` deliberately treats as a sub-section. The Acta therefore merge into the
   Alexander entry instead of forking a second page. **The disk was right and the report was wrong**,
   and the outcome is the one we want.
2. **day-08 slugs.** The agent's header list looked orderly and reported "all 11 pre-comma strings
   mutually distinct" — true, and useless. The defect was not collision but slug bloat, invisible
   unless the name-extraction is actually run.

Reusable checker written this round (kept in the session scratchpad, ~40 lines): it slices
`isSaintBoundary` / `extractSaintName` / `slugify` verbatim out of `split-saints.mjs`, evaluates
them over a day's emitted files, and prints `headers → distinct slugs` plus every slug reached by
more than one header form. Rebuild it rather than trusting a grep.

---

## Day-by-day notes

### day-08 (71 chunks, Vol III — Alexandrian and Nicomedian martyrs)
11 headers → 11 slugs. Two large dossiers: Adrian 0001–0028, Corbinian 0032–0052.

**Header judgment worth keeping:** the day-opening roster and the Bollandist index blocks (27 lines
of `Ammonius M. Alexandriæ in Ægypto (S.)`) were rendered in sentence case, not as headers. Had they
been emitted as headers they would have produced ~27 false splits *and* violated pre-comma half (b),
since the roster alone contains two Serapions, two Demetriuses, two Piuses and two Severuses.

**Greek + facing Latin (expected duplicate-scanner false positives):** 0007–0014 (Greek *Passio* of
Adrian and Natalia with facing Latin column). Short/inline: 0030, 0031, 0047, 0069. Greek with *no*
facing column, so no FP risk: 0001, 0002, 0006, 0015.

**`[ ]` lacunae — 6, one cause.** 0056, 0057 (×2), 0059, 0061, 0066 — all citation column numbers
destroyed by the scrape mashing `col.` into the next word (`Col.cribit`, `Col.ditas`, `Col.ogerii`,
`Col.ccurrit`, `Col.em&gt;` — the last retaining an HTML fragment that proves the mechanism).

**The one place received text was altered:** 0015 had two Bollandist index entries fused by a missing
newline (`…in BithyniaNatalia conjux…`); split into two lines to match the identical pair at 0001 and
0006. Scrape defect, reported not silent.

⬜ **WANTS A HUMAN EYE:** 0019 has a floating `o` in `proprium o missum` with the exact shape of a
footnote marker, but no note `o` exists in the day. Almost certainly `omissum` broken by the scrape.
Translated as "omitted" with no marker inserted. Left as-is pending Wilson.

### day-12 (26 chunks, Vol IV — smallest day in the month)
16 headers → 16 slugs. Chunk 0006 is the **Greek Acta of St. Autonomus in full** (7 numbered
paragraphs), 0007 its facing Latin column — the Acta legitimately appear once in Greek and once in
English. Shorter Greek+Latin at 0002, 0004, 0005.

**A false-split caught by the agent itself:** the Venerius location line had come out as
`ON TYRO MAJOR, AN ISLAND OF THE LIGURIAN SEA,` — a subtitle opening with `ON `, which
`isSaintBoundary` would have read as a saint header. Recast to
`IN THE ISLAND OF TYRO MAJOR IN THE LIGURIAN SEA,`. **This is the first time the never-open-a-
subtitle-with-`ON ` clause has demonstrably fired.** Keep it in the prompt.

Two Serapions appear (Catania, and one inside the Alexandrian group) but only the Catania one takes
a header and the group header opens `ON SS. CRONIDES…`, so no clash.

### day-13 (52 chunks, Vol IV — Tomis martyrs)
17 headers → 17 slugs. Greek+Latin at 0000, 0002, 0018, 0019, 0020.

**Two different men named Amatus**, correctly separated: the abbot (0024) and the bishop of Sens
(0040). Recast at verification into corpus form — `ON ST. AMATUS OF REMIREMONT, ABBOT OF HABEND,`
and `ON ST. AMATUS OF SENS, BISHOP AND CONFESSOR,` → slugs `amatus-of-remiremont` /
`amatus-of-sens`, matching the August `alexander-of-brescia` / `alexander-of-bergamo` pattern. A
third, spurious "Amatus of Sion" is discussed but takes no header.

The seven-name Tomis martyr group used `AND`-joining as instructed and all seven names survive the
comma cut.

### day-21 (65 chunks, Vol VI — Matthew the Apostle, Jonah)
20 headers → 12 slugs, and every multi-section dossier collapsed correctly: **Matthew ×3, Gerulphus
×4, Castor ×2, Maura ×2, Prandotha ×2** all landed on one page each. Zero splits, zero merges, zero
hand-fixes. The best-behaved day of the round.

**Two different Jonahs** on one day, correctly separated by pre-comma text:
`ON ST. JONAH THE PROPHET,` vs `ON ST. JONAH THE PRESBYTER AND MONK,`.

**Greek + facing Latin:** 0000 (Menæa metrical verse), 0012 (Irenæus with the Bollandists' own
literal Latin), 0032 (**two separate Greek+Latin pairs in one chunk** — Menæa prose on Eusebius and
a two-line epigram), 0033 (Menæa epigram on Isacius). Bare Greek, no FP risk: 0007, 0013, 0047, 0052.

Maura and Gerulphus both run their footnote series past `z` into doubled letters, up to `[ee]`.

**`[ ]` lacunae — 2**, both scrape-lost citation columns (0000 Ughelli, 0053 Labbe).

---

## ROUND B — the corrected prompt worked, and two new defects appeared

**Days 06 and 09 needed ZERO hand-fixes** — the first days of the month to come out clean. The only
change from Round A was the `NAME, ROLE,` section with ✅/❌ examples. Confirmed: the fix was the
examples, not the rule.

Two genuinely new failure modes surfaced, both now in `PROMPT-sep.md`:

### ⚠️ NEW DEFECT — THE SCRAPE FURNITURE SURVIVES IN THE *LAST* CHUNK
day-05's agent reproduced the whole German site block (`Heiligenlexikon`, `als USB-Stick oder als
DVD`, `Unser Reise-Blog`, `Impressum - Datenschutzerklärung`, and the `September II: 6. September`
navigation line) verbatim in chunk 0094 — **and said so in its report**, reasoning that preserving
it was consistent with the never-delete-source-content principle. It is not source content; it is
the scraped web page's chrome. Stripped by hand (26 lines).

**Why this is a structural trap, not a one-off:** the block only ever appears at the *end of a day*,
so it is invisible in the 94 chunks where the rule is easy, and gets tested exactly once, in the
chunk an agent reaches when it is furthest from its instructions. The prompt now names each line of
the block explicitly, says DELETE in capitals, and says the last chunk is where it lives.

### ⚠️ NEW DEFECT — A LARGE GROUP HEADER MAKES AN UNUSABLE URL
day-05's Ostia martyrs came out as a 22-name header, which the comma rule faithfully preserved into
a **250-character slug**. The group-names exception, applied to a group this size, defeats the
purpose of a display name.

**The fix already existed in the code and nobody had told the agents:** `extractSaintName` cuts at a
**colon** before it cuts at a comma — the mechanism built for the 19 Martyrs of Gorcum. Recast to
`ON THE HOLY MARTYRS OF OSTIA: CENSURINUS AND CYRIACUS AND …, MARTYRS,` → **"Martyrs of Ostia"**,
roster intact in the text. Prompt now carries the colon form with a >8-names threshold.

Also fixed on day-05: `ON ST. ROMULUS AND SS. EUDOXIUS AND …` had a stray honorific mid-header,
slugging as `romulus-and-ss-eudoxius-…`. Recast to `ON SS. ROMULUS AND EUDOXIUS AND …`.

### ⭐ THE MAP'S DAY LABELS NAME THE FEAST, NOT THE DOMINANT DOSSIER
`MAP-sep.md` lists day 06 as "Zechariah the prophet." **Zechariah is five chunks.** The real dossier
is **St. Magnus of Füssen, 0026–0074 — 49 chunks, over half the day.** The map's labels are
roster-derived and do not reliably identify where a day's bulk sits. Treat them as feast labels
only; for shard planning on the big days, measure the dossier spans directly (as the mega-dossier
table in `MAP-sep.md` does).

### day-05 (95 chunks, Vol II — Victorinus; the Ostia martyrs)
19 headers → 19 slugs. **Two Victorini** correctly disambiguated: the martyr near Cutiliæ
(`ST. VICTORINUS THE MARTYR`) and the bishop of Como (`ST. VICTORINUS OF COMO`). **Three distinct
Taurini** — one inside the Ostia group, one heading the Egyptian group, and the bishop of Auch; the
Bollandists themselves note in the Auch Sylloge that the old Fasti's two Taurini are "the one of
Ostia or Porto, the other of Alexandria," both distinct from Auch. SS. Romanus and David are Boris
and Gleb, whom the Bollandists deliberately treat both here and on 24 July.

**Greek + facing Latin:** 0011–0017, 0021, 0023 — Metaphrastes' Greek Acts of the Melitene martyrs
with facing Latin, plus shorter Greek in the Ostia and Rhaïs dossiers. Chunks 0011–0016 had
line-fragmented Greek (scrape artifact) reflowed into continuous text without altering a character.

**`[ ]` lacunae:** 0025 (a garbled heading date `Circa an. CCCIXX`), 0008/0015/0024/0034 (`col. [ ]`
scrape losses), 0029, 0062 ×2.

⚠️ **An editor-declared silent-repair policy, worth knowing for QA:** at 0087 annotation *n* the
Bollandist states outright that grammatical faults in the Boris Acts were corrected silently
"since the Acts are not of so great moment." That is *their* policy, not ours — but it means the
printed Boris text is not a diplomatic transcript and should not be treated as one.

### day-06 (86 chunks, Vol II — Zechariah; St. Magnus of Füssen)
17 headers → 17 slugs, zero hand-fixes. **Five distinct Zechariahs are discussed** (0001–0004): the
prophet; the son of Joiada slain under Joash; the father of John the Baptist; the son of Barachiah;
and the son of Baruch killed by the Zealots. Only the prophet takes a header, and the pre-comma text
was set to `ZACHARIAH THE PROPHET` deliberately so the display name can never read as the Baptist's
father. Also two Faustus (Alexandrian martyr inside the group header; abbot of Syracuse at 0017) and
three Magnus discussed with one headered — the Bollandists spend §7 arguing a 16th-c. envoy confused
Magnus of Füssen with Magnus prince of the Orkneys.

**Greek + facing Latin:** 0005 (Menæa couplet + Latin distich), 0007 (full Greek *elogium* of the
thirteen Alexandrian martyrs + facing Latin). `κουρεκτοριανοῦ` left untranslated **because the
editor himself refuses to render it**. Isolated glossed Greek etymologies at 0058, 0064, 0067, 0068,
0070, 0072 — single words, no duplication risk. The scrape artifact `ἐ;ν` inside 0007's Greek was
reproduced as printed.

Two internal seams were repaired mid-run by the agent itself (0051/0052 footnote over-run, 0073/0074
sentence over-run) and now meet exactly.

### day-09 (90 chunks, Vol III — Gorgonius; Theophanes)
22 headers → 22 slugs, zero hand-fixes.

⭐ **THE GORGONIUS DETERMINATION — ONE MAN, and the evidence is recorded.** The Bollandist (C. S.)
treats the Gorgonius venerated at Rome on the Via Lavicana and the Nicomedian martyr as the same
person. Decisive sentence, §III num. 20 (chunk 0002):

> *Mihi vero, etsi fatear, nihil certi statui posse, verisimilius apparet, S. Gorgonium, quem hodie
> Romæ cultum constat ex dictis, non alium esse, quam Nicomediensem Martyrem, qui in Hieronymianis
> ad diem XII Martii una cum Sociis commemoratur.*

Corroborated at num. 8: *Ego Gorgonium illum eumdem puto, de quo agunt Eusebius & Rufinus.*
**One** header emitted, joined with Dorotheus as the Bollandists print them:
`ON SS. DOROTHEUS AND GORGONIUS, MARTYRS,` with `AT NICOMEDIA IN BITHYNIA,` as a separate subtitle.

**This is the pattern to demand on every contested identity:** the determination is traceable to the
sentence it rests on, not to an agent's judgment. Ask for it explicitly in the prompt.

**Greek + facing Latin:** 0019, 0020 — Acts of S. Severianus (0019 is Greek §§1–8; 0020 is Greek
§§9–10 followed by the facing Latin §§1–9). Inline Greek only at 0016, 0017, 0018, 0021, 0022, 0089.

---

## ANOMALIES THE BOLLANDISTS DO **NOT** FLAG — Round A harvest

This is the list the corpus has no other record of. Round A's is unusually rich.

### Numbering defects
- **day-21 / 0004–0005: two consecutive paragraphs both numbered `[45]`** in the Matthew
  Commentarius (Ninevites' motives, then the sailors' report). Never remarked. Preserved as printed.
- **day-21 / 0045: a second `[47]`** in the Alexander Commentary — two consecutive paragraphs
  both `[47]`. Preserved.
- **day-21 / 0003: paragraph `[38]` simply missing** — text runs `[37]` → § III heading → `[39]`.
- **day-21 / 0035: paragraph `[15]` missing** — § II of the Castor Commentarius opens with
  unnumbered text where `[15]` belongs, then jumps to `[16]`.
- **day-08: at least fifteen unnumbered section-openers** across 0010, 0012, 0013, 0018, 0020, 0027,
  0035, 0037, 0038, 0040, 0041, 0042, 0054, 0057, 0059, 0060 — a `§` or chapter head swallows its
  paragraph number (`[29]`→unnumbered→`[31]`). Same systematic class as the August day-10/13 scrape
  defect; not worth retrofitting, but now recorded for September too.

### Dates and arithmetic
- **day-08 / 0063 vs 0064: the same Urban VIII decree** on veneration of blessed bodies dated
  **13 March 1625** in one place and **2 October 1625** in the other.
- **day-08 / 0060–0061: a year printed 1048 where context demands 1648.**
- **day-08 / 0026: an item headed "the same year 1630" containing a narrative dated 25 July 1634**,
  beside a neighbour dated 4 July 1634.
- **day-13 / 0048: Bl. Margaret Fontana's dossier header reads `An. MCXIII` (1113)** where the Life
  and the whole commentary put her death at **1513** (MDXIII). A four-century header error,
  unremarked. Rendered as printed.
- **day-21 / 0063: the same sentence printed twice with different years** — Prandotha's miracles run
  "to MCCCCLXIV" at `[2]` of the Commentary and "to MCCCCLXVI" at `[6]` of the Vitæ Compendium.
- **day-21 / 0043: Baldwin's regnal years used both ways in one paragraph.** The *Adventus* says he
  "had reigned thirty-six years"; the editor's own arithmetic from an 879 accession yields 914 at
  thirty-five and 915 at thirty-six, and he reaches two different years without choosing.
- **day-21 / 0018: Marsilius' arithmetic on the Salerno finding** — "about thirty years had passed"
  is corrected parenthetically to "nay, about a hundred and twenty-five", but Marsilius' figure is
  left standing with no comment on how a thirty-year error entered an author using the cathedral's
  own records.
- **day-12 / 0017: Guido's elevation feast** given as 24 June in the Brussels Usuardine codex and
  25 June in the body text three paragraphs later. Both printed, no comment.

### Silent slips of the editor's own pen
- **day-21 / 0060: `archiepiscopatum` for `episcopatum`** — Prandotha "entered upon his
  **arch**bishopric," though he was never an archbishop and every other reference in the section
  says bishop of Cracow.
- **day-13 / 0019 + 0021: Photius' *Library* cited as "cod. 182", "cod. 208" and "cod. 280"** for
  the *same* books against the Novatians, with the book-count wobbling between five and six inside
  one paragraph. The editor notes the 5-vs-6 slip but never the triple codex numbering.

### Missing or orphaned apparatus
- **day-08 / 0051: annotation `cc` has lost its letter entirely**, while the `[cc]` marker still
  stands in the body at 0050. Left letterless.
- **day-08 / 0010: annotation `c` has no anchor** anywhere in the body. Left bare.

### Reasoning the editor half-sees
- **day-21 / 0021: four churches claim St. Matthew's head** (Léon in Armorica, Beauvais, Chartres,
  Rangéval). The editor observes they cannot all be entire and proposes small particles on
  artificial heads — but misses that Beauvais and Chartres stay **mutually exclusive even on that
  reading**, since Saussay assigns Chartres the *vertex* cut from the Beauvais head while Du Cange
  has Chartres receiving a whole head from Constantinople.
- **day-21 / 0031: Cain's repentance and salvation.** The Gerulphus biographer asserts Cain repented
  "as is read in the book of Genesis" and enjoys heavenly rest, three sentences after saying Cain is
  banished from beatitude. The editor *does* flag the Genesis misreading and the self-contradiction
  — but does **not** note that the salvation clause is present only in the Saint-Omer manuscript he
  prints and absent from every other witness he collated, a textual fact he states without drawing
  the inference.
- **day-21 / 0034: the charter of George and Deda** is dated only "in the time of Charles" — Martel,
  Charlemagne, the Bald, or Charles of Provence, a spread of ~140 years — yet the editor then uses
  it to fix a *terminus ante quem* of the tenth century from an unrelated 967 grant, without
  flagging that the two datings are independent.
- **day-13 / 0043: Le Cointe's argument silently shifts** "at Ebroin's instigation" into "in order
  to comply with Ebroin." The editor rebuts the logic but never calls it a misquotation.
- **day-13 / 0034 + 0041: Briguet dates Amatus of Sion to 716** while also adopting the story that
  Eustasius († c. 625) brought him from Agaunum. The editor says he "does not know how they can be
  reconciled" but stops short of calling it an error.
- **day-21 / 0053: the Castor mother-in-law.** The Office lessons have the wife's mother die; the
  *Historia Occitaniæ* narrative the editor prints two paragraphs later has the same widow alive and
  bestowing her daughter. Nothing reconciled.
- **day-21 / 0059: Prandotha's birthplace doubled.** Baronius gives *Bolezlaw*; Dlugosz, Cromer,
  Okolski and the archive notices all give *Bialaczow*. The editor debates which line of the
  Odrowaz Bialaczow belonged to but never addresses that Baronius names a different village.
- **day-21 / 0027: "Antoninus/Antonius" in Ado** — his epitome is quoted with *sub Antonio
  imperatore* in one line and *Antoninus* throughout the rest, both without comment.

### Plain misprints left as printed
- **day-13 / 0001:** `suliano martyre` for *Juliano*, `Marcobio` for *Macrobio*.
- **day-08:** `Reda` for `Beda`, `auctarta` for `auctaria` (0005); unstable proper names
  (Estonça/Estonsa/Eslonsa/Eslonça; six spellings of Tagliapietra; Weihen-/Weichen-Stephan);
  non-standard numerals `MDLXXXXV`/`MDLXXXXVIII`/`MDLXXXXIX`; dittographies preserved intact
  (a doubled clause in an Anastasius quotation at 0036, doubled `fugam` at 0040, doubled
  `postquam quam` at 0070).

---

## ANOMALIES THE BOLLANDISTS DO **NOT** FLAG — Round B harvest

### Numbering defects
- **day-06 / 0038: a hymn is simply gone and the numbering leaps.** §IX prints the heading *The
  Invitation of S. Magnus* at `[105]`, the hymn text is **absent**, and the next paragraph is
  numbered **`[160]`** where `[106]` is required — with `[107]` following it correctly. Both the gap
  and the impossible numeral preserved verbatim. **The most striking numbering defect of the month.**
- **day-09 / 0064: paragraph `[54]` printed twice** in the Sergius commentary ("Putat Binius" and
  "Compellebatur autem"), and **`[56]` absent.** Third duplicated-number find of the month, after
  day-21's `[45]` and `[47]`.
- **day-09 / 0017: paragraph `[9]` skipped** in the Severianus commentary — [7], [8], [10].
- **day-06: silent paragraph-number gaps at every `§` break** — `[8]`, `[12]`, `[35]`, `[42]`,
  `[55]`, `[86]`, `[114]` each absorbed into a section heading and never printed. Same systematic
  class as day-08's fifteen and August's day-10/13.

### Text printed twice
- **day-06 / 0039: a clause doubled inside one sentence** — "neither to Hadrian II, *nor to John IX,
  but to John IX, but* to John VIII."
- **day-09 / 0072:** *ac de ore ejus tanta odoris suavitas exhalavit* printed twice in the
  Bertellinus/Guthlac Life.
- **day-06 / 0042: dittography inside a quotation** — Baudrand's notice reads "…on the very border
  of Bavaria, *variæ*, in the dominion…", the tail of *Bavariæ* repeated as a free-standing word.
- **day-05 / 0092:** `berti socius ac discipulus successit` — a line-break dittography of *Alberti*
  left uncorrected in the printed quotation from the *Vinea*.
- **day-09 / 0013:** `domini Adelberonis delberonis præsulis`, a word-fragment duplication.

### Contradictions the editor leaves standing
- **day-09 / 0046 vs 0050: the same well-miracle is sixty feet deep in Audomarus' Vita 2 and forty
  feet in Vita 3.** Never reconciled.
- **day-06 / 0060 vs 0041: Magnus' age at death is 73 in the Vita and 74 in the Commentary's own
  chronology**, three chunks apart, with no note.
- **day-06 / 0060: the Vita contradicts itself inside one chapter** — ch. 7 opens "when twenty-five
  years had passed" and closes "twenty-six years being completed" of the same stay. Note b flags
  only the manuscript *variants*, not the doubling.
- **day-06 / 0000 vs 0001: Zechariah's own date never reconciled.** The section title reads *About
  the year of the world MMMDXL*; §5 says he began prophesying in *the year of the world 3534*; §6
  fixes his death "about 3540." The title silently prints the death-year as the floruit.
- **day-06 / 0019: a century slip in the editors' own prose** — Magnus' entry into Luxeuil dated
  "about the year 690" inside an argument that requires the 590s (Columbanus reached Gaul before
  590, died 615).
- **day-06 / 0041: abbot Henry's year-list runs backwards twice** — MDLXXX, **MDLXIII, MDLIV**,
  then MDLXXXV, MDLXXXVI, MDLXXXVII, **MDLXXXII**.
- **day-06 / 0027 vs 0028: the same Jonas passage cited under two numbers** — "num. 37" at [19] and
  "num. 57" at [21].
- **day-05 / 0087: the Acts announce *duodecim filiis* and the list names eleven.** Annotation *i*
  flags a gap "between Stanislav and Sudislav" but never states that the running count is one short
  of the announced twelve — the discrepancy between stated number and printed list is itself unmarked.
- **day-06 / 0006: an uncorrected count.** The Roman Martyrology's "Faustus, Macarius and **ten**
  Companions" (=12) stands beside Sirletus' eleven named and the Menæa's stated thirteen; the editors
  reconcile 11↔13 and never touch the Roman ten.

### Missing or orphaned apparatus
- **day-06 / 0059–0060: footnote `bb` has a marker but no definition.** The body carries `bb`; the
  ANNOTATA run …z, aa, **cc**, dd. Bare marker left standing per convention.
- **day-05 / 0080–0081:** the Bertinus Miracles ch. II annotations run `a b c d e f g h` but the
  prose carries no `e` marker, skipping *d* → *f*.
- **day-05 / 0069:** the letter `l` used **twice** as a footnote marker within one Vita Tertia
  passage (`parvitatem l meam`, `veniam commissi l`). Preserved as printed.
- **day-05 / 0044–0045: an unclosed parenthesis** in the Füssen church description — "(which from
  authentic documents is believed to be the cell of the holy Man, whose not only altar…" never closes.

### ⚠️ CROSS-CHUNK FOOTNOTES — a hazard for any per-chunk validator
day-05 found **four** asterisk footnotes whose marker and definition fall in different chunks:
**0008→0009** (`& * lapis` → `* ut`), and three in the Boris/Gleb dossier — **0086→0087**
(`seniorem *` → *i.e. dominum*), **0087→0089** (`in ducem *` → *forte Deum*), **0089→0090**
(`servitutis *` → *forte juventutis*). Not errors — the build resolves cross-chunk notes — but any
future per-chunk footnote check must not flag these as orphans.

### Spelling and typographic residue left as printed
- **day-06 / 0006 + 0000: one martyr's name spelled three ways in three consecutive lines** —
  *Callodata* (day index), *Calodota* (section title), *Callodata* (commentary index), against Greek
  καλοδότης; likewise *Thecla* / *Thecla or Theocla* / θεοκλῆς.
- **day-06 / 0035: a fourth spelling of the bishop's name** — the margin reads **Linto** where the
  body reads *Lanto* throughout. The Lanto/Hanto/Hatto tangle is discussed at length; "Linto" is not.
- **day-06 / 0023–0024:** `Dulnemensis liber` for *Dunelmensis* inside a Camden quotation, alongside
  Heorthu / Heortheu / Heorteu / Herutey / Heruteu used interchangeably in one paragraph.
- **day-09 / 0085:** `Reculari` for *Regulari* in a section head; `Catissimo suo Poncio` for
  *Carissimo* (annotation *a* notes only the Ms. variant *Beatissimo*, not the garble).
- **day-09 / 0086:** `quod publice gostum est` for *gestum est*; `nomenfamiliæ` run together.
- **day-09 / 0089:** `in Cangit Glossario` for *Cangii*; `Commentarioprævio` and `demonasterio` run
  together. **day-09 / 0000:** stray `en` after *discessit ad Dominum*; `lacras` for *sacras*.
- **day-05 / 0092:** `Gnarnerius` for *Guarnerius* (n/u swap) and `testara` for *testata*, one paragraph.
- **day-05 / 0093:** `Mißa` (eszett standing in for the long-s ligature) in "Officio & Mißa".
- **day-05 / 0084 and 0090: a bare two-dot ellipsis** mid-sentence (`manuscriptis antiquissimis ..`,
  `.. per Dunam navigaret`), unexplained, reading as though something dropped out.

---

## ROUND C — three days, zero hand-fixes, and the limit hit mid-round

Days 23 and 24 landed clean and verified before the wall; day 11 died at chunk 0093 and was
gap-filled. **All three needed no hand-fixes.** The Round-B prompt clauses (footer-in-last-chunk,
colon form for large groups) both demonstrably fired: day-24's agent found the German block at the
tail of 0060 and deleted it, and correctly declined the colon form for Paphnutius because his 546
companions are unnamed in the source, so `AND HIS COMPANIONS` keeps the slug short anyway.

### ⭐ ASK FOR THE EVIDENCE, NOT THE CONCLUSION — this keeps paying
Three contested questions were put to agents as "determine, and give me the sentence you based it on":
- **day-09 Gorgonius** — one man, per §III num. 20 (quoted above).
- **day-11 Felix & Regula ± Exuperantius** — Exuperantius IS included; header is
  `ON SS. FELIX AND REGULA AND EXUPERANTIUS, MARTYRS AT ZURICH IN SWITZERLAND,`.
- **day-23 Liberius** — see the abandoned-arguments list below.

Every one came back traceable. Keep this in the prompt for every day with a disputed identity.

### day-11 (99 chunks, Vol III — Protus & Hyacinth; Felix & Regula of Zurich)
21 headers → 18 slugs. The collapse is correct: **Sperandea carries four byte-identical headers**
that land on one page — the same success as day-21's Matthew ×3 and Gerulphus ×4.

⚠️ **Its 0094–0098 were the post-limit gap-fill.** That range is the interior of the Sperandea
miracle appendix (§§ I–IV) and contains **no saint header at all** — expected, not a lost header.

**A convention question I answered on the spot and Wilson has NOT ruled on:** the 0094 Latin says a
miracle is retold `sed Italicis` — in Italian. There is no vernacular-Italian rule in the frozen
prompt, so the gap-fill agent was told to treat Italian as Greek is treated (reproduce, don't
translate, translate any facing Latin). **In the event it was moot**: the Bollandists print their own
Latin rendering every time they announce Italian, so no continuous vernacular passage survives.
Only isolated tokens were kept verbatim — `di Thomasso`, `sonnetti`, `compare`, `Zio`, `di Seti`.
⬜ The rule still wants ruling before a day arrives where real Italian *is* printed.

### day-23 (77 chunks, Vol VI — Linus, Thecla, Liberius)
11 headers → 11 slugs. **Two popes on one day** (Linus, Liberius) kept distinct. Notably restrained
header discipline: Præjectus of Clermont, Constantius of Aquino, Adamnan of Coldingham, Peter the
African martyr, and seven popes in passing are all *discussed* and none took a header.

⚠️ **MAP CORRECTION — Thecla is NOT a big Greek dossier.** The Bollandists decided not to reprint
her Greek Acts, so she yields only incipits and short tags. Day 23's heavy Greek is **Liberius's
epitaph distich (0022)** and **six verses on the African martyrs (0070)**. Her whole dossier runs
0004–0017 under a single `ON ST. THECLA, VIRGIN AND PROTOMARTYR,`.

### day-24 (61 chunks, Vol VI — Andochius and companions; Geremarus)
10 headers → 10 slugs. The agent explicitly confirms **it guessed no garbled numeral**, naming the
two places it was tempted (the Ysarnus epitaph whose epact contradicts its year; the Dalmatius
epitaph dating his death to the Kalends of October against every other witness) and leaving both as
printed. That is the August day-24 trap, sprung on the same day number a year of corpus-work later,
and correctly refused this time.

---

## ANOMALIES THE BOLLANDISTS DO **NOT** FLAG — Round C harvest

### The strongest numbering evidence yet
- **day-24 / 0003: `[28]` is missing AND the apparatus proves it existed.** The text runs `[27]` →
  unnumbered § III opener → `[29]`, and a later annotation cites *"his words given at num. 28."*
  Same shape at `[12]` in 0001 (`[11]` → unnumbered *Baronius in Notis…* → `[13]`).
  **This is better evidence than the other gaps: the book references the number it lost.**
- **day-23 / 0042: `[348]` printed where `[148]` belongs**, and **0047: `[274]` where `[174]`
  belongs** — 200 and 100 too high. Clean misprints, preserved.
- **day-24 / 0015: `[23]` printed twice consecutively** in the Paphnutius Acts — the fourth
  duplicated paragraph number of the month (after day-21's `[45]` and `[47]`, day-09's `[54]`).
- **day-23 / 0047 [172]: the same paragraph number cited twice in one sentence** for two different
  Sirmian formulas — "recited at number 29" and "presently at number 29 he proceeds." One is wrong;
  neither corrected.
- **day-11 §§ II–IV: three more swallowed section-opener numbers** (19, 32, 44 absent).

### ⚠️ LIBERIUS — arguments advanced, then quietly abandoned (day-23)
A different and more valuable class than numeric slips. The Bollandist:
1. **[107]–[109]** lays out Baronius's whole account of Felix II becoming legitimate Pontiff, then
   says he recited it *"not because I judge it true"* — leaving who held the see in 358 open forever.
2. **[186]–[187]** grants the *Acta Liberii* are by "an unskilled and inept man" and worthless, then
   two paragraphs later insists Damasus's vicariate under Liberius "cannot certainly be denied" —
   **keeping a claim alive on a source he has just destroyed.**
3. **[201]** floats that the rule for receiving the lapsed may have been drafted at Rome and carried
   east by Eusebius, calls it what the Greek "perhaps implies," and never returns to it.
4. **[233]** doubts Sozomen on the Western letters, then leans on Sozomen for the Sirmian assembly.
5. **[244]–[246]** defends Liberius's eloquence at length against Tillemont, then concedes the
   discourse in Ambrose "has some likeness with the style of S. Ambrose" — concession left standing.

### Impossible or self-defeating citations
- **day-23 / 0046: "S. Epiphanius Hær. 86"** — the *Panarion* stops at 80.
- **day-23: Philostorgius cited two ways for one passage** — `lib. 4 cap. 3` (0042, 0046) vs
  `lib. 2 num. 3` (0046 [159]).
- **day-23 / 0063: arithmetic** — a 1702 inspection says the chest held the body "eight hundred
  years ago (from the year 903)"; 903→1702 is 799.
- **day-23 / 0059 [253]: Anastasius dates Liberius's burial to the eighth Kalends of May** for a man
  who died in September. The Bollandist says only "I shall say nothing about the time of the burial
  here wrongly designated" and moves on.

### Contradictions left standing
- **day-24: St. Chunialdus vanishes between two inventories.** In 993 both bodies lie beside Rupert;
  in 1315 the tomb yields Gisilarius but not Chunialdus, and his name is absent from the tomb-stone
  — yet a 14th-c. tablet still lists him as certainly resting there. The editor speculates that
  "St. Martin's bones in great quantity" may be Chunialdus, but never says the records contradict.
- **day-24 / 0026–0027: the same Odo as two men, or one, unresolved.** The Bollandist's copy and the
  *Gallia Christiana*'s copy of the identical passage differ so wildly on the succession of Odo of
  Flay and Odo of St. Symphorian that he calls one "foully corrupt" and declines to say which.
- **day-24 / 0028: a bishop silently promoted** — Hartwic called "the XXII bishop and XII archbishop"
  of Salzburg in one breath.
- **day-23 / 0014 [77]: an unattached name.** Basil's horse-miracle introduces the owner as "a
  certain man most distinguished among the citizens," then two lines later has Thecla send the horse
  back "to Marianus" — a name never given him, and Marianus of Tarsus was killed off at [68]–[69].
- **day-23: Helena is *vidua* in the day's own head-list (0000) and *virginis* in the Benedict XIV
  text quoted at 0073** — and at 0076 [16] the Bollandist declines to call her either, refusing the
  virgin title without noting that his own index line and his cited authority disagree.
- **day-24 / 0015: the Paphnutius martyr count** is 546 in the title and closing, 547 in the Roman
  Martyrology and Basilian Menology. The editor notes the *timing* problem, never the 546/547 split.
- **day-24 / 0044–0045: the Ysarnus epitaph is arithmetically impossible as transmitted** — 27 years
  from a 1021 accession yields 1048, but the same stone's epact III belongs to 1047 by Clavius'
  table. The editor rescues it via a different table without noting the stone disagrees with itself
  under the standard one.
- **day-23 / 0006 [15]: "the disciple of Paul" printed twice**, once each side of the marginal note.

### ⚠️ APPARATUS THAT CROSSES CHUNK BOUNDARIES (day-11)
The Annotata asterisk counts do not match the in-body asterisks: 0094's block carries **eight** notes
against **five** body asterisks — the other three belong back in 0093; 0095's block has five notes
against four, and its first note (`sonnetti`) answers an asterisk standing in 0094. **Positions are
preserved as printed.** Same hazard class as day-05's four cross-chunk asterisk footnotes: correct
at build time, but any per-chunk footnote validator must not flag these as orphans.

---

## EXPECTED DUPLICATE-SCANNER FALSE POSITIVES — run `scan-duplicate-translations.mjs` at month end

Greek with the Bollandists' facing Latin column. The text appears once in Greek and once in English;
that is correct, not a duplicate translation. Do NOT "fix" these.

- **sep/day-08/0007–0014** — Greek *Passio* of Adrian and Natalia. Also inline at 0030, 0031, 0047, 0069.
- **sep/day-12/0006–0007** — Greek Acta of St. Autonomus, then its facing Latin. Also 0002, 0004, 0005.
- **sep/day-13/0000, 0002, 0018, 0019, 0020**.
- **sep/day-21/0000, 0012, 0032 (two separate pairs in the one chunk), 0033** — Menæa verse, Irenæus.
- **sep/day-05/0011–0017, 0021, 0023** — Metaphrastes' Greek Acts of the Melitene martyrs with facing
  Latin, plus shorter Greek in the Ostia and Rhaïs dossiers. (0011–0016 had line-fragmented Greek
  reflowed into continuous text; no character altered.)
- **sep/day-06/0005, 0007** — Menæa couplet + Latin distich; the full Greek *elogium* of the thirteen
  Alexandrian martyrs + facing Latin.
- **sep/day-09/0019, 0020** — Acts of S. Severianus: Greek §§1–8 in 0019, Greek §§9–10 plus facing
  Latin §§1–9 in 0020. **These two will look strongly duplicated — they are not.**
- **sep/day-23/0000, 0004, 0006, 0007, 0011, 0017, 0022, 0042, 0046, 0051, 0054, 0070, 0071** —
  heaviest are 0022 (Liberius's Greek epitaph distich + Latin) and 0070 (six Greek verses on the
  African martyrs + Latin). Printed oddities preserved character-for-character: `δυτταῖς` for
  `διτταῖς`, `ὁμοιοούσιος`.
- **sep/day-24/0011** — Menæa couplet on Paphnutius (Σταυροῦσι Παφνύτιον…) + the Bollandists' Latin.
  Bare Greek tags only at 0015 (annots. g, h) and 0038 (annot. s).
- **sep/day-11/0063, 0070, 0077, 0079, 0080** — Elias Speleotes' Greek Vita. ⚠️ These are also the
  chunks that trip the <0.9 ratio sweep; see the line-fragmented-Greek note above. Complete.

---

## STILL OPEN FOR SEPTEMBER

- ✅ **Day 19, Januarius of Naples — RESOLVED 2026-08-29. He is not in the scrape at all.**
  The roster's Bollandist note *"Acta imprimenda circa finem tomi"* is accurate: his acts print at
  the END of volume VI. But the dossier is not hiding in another day — it was never scraped.
  `day-19-full.txt` carries 14 `DE S.`/`DE SS.` headers and none is his, and the file ends cleanly
  on Lucia de Monte plus the `September VI: 20. September` boundary, so nothing was truncated.
  `einleitung-sep-vi.txt` has him in the synopsis and `INDEX SANCTORUM` (p. 761 ff., commentary
  outline to p. 801+) — but that file is front matter and index only, no article bodies. The only
  other `Januar-` hit in September (`day-29/0146`) is a **different** Januarius, a Roman
  soldier-martyr of 29 September. **Day 19 is therefore COMPLETE at 60 chunks and September can be
  called done**; the corpus is simply missing ~130 printed pages, including the Naples
  blood-liquefaction material. Recorded as **D9** in `CORPUS-DEFECTS.md` with the three options
  (ship + disclose · re-scrape and translate as a day-19 appendix · defer). ⬜ Wilson picks.
- ⬜ day-08/0019's floating `o` (above) — Wilson's call.
- The nine cross-seam mega-dossiers (Chrysostom 193, Jerome 172, Thomas of Villanova 165, Moses 108,
  Cyprian of Carthage 98, Rosalia 83, Hildegard 79, Michael 77, Gregory the Illuminator 75) still
  have their mandated header strings unfired — days 14, 30, 04, 28 are deliberately last.

## NOT DONE ON PURPOSE (do NOT do these until the month is WHOLE)
- `split-saints.mjs --all-sep` — a partial split creates saint pages a later re-split re-slugs
- `build-site.mjs`, `about.html` refresh, pagefind, deploy — all wait for a complete September
- The `--all-sep` + build-site September wiring is **uncommitted on `master`**, alongside
  `RESUME-aug.md`, `MAP-sep.md`, and now `PROMPT-sep.md` and this file

---

## Round D — 2026-08-28/29 (days 03, 07, 16) — ALL CLEAN

Three Opus agents, whole-day ownership, launched concurrently. **352 chunks.**
September now **1,074/4,120 chunks (26.1%), 13 of 30 days** (03, 05, 06, 07, 08, 09, 11, 12, 13, 16, 21, 23, 24).

| Day | Chunks | Vol | check-day.mjs | headers → slugs |
|-----|--------|-----|---------------|-----------------|
| 03 | 111 | I | files ok · frontmatter ok · no footer leak · no chunk <0.9 · ratio **1.206** | 19 → 19 |
| 07 | 116 | III | files ok · frontmatter ok · no footer leak · no chunk <0.9 · ratio 1.158 | 31 → 26 |
| 16 | 125 | V | files ok · frontmatter ok · no footer leak · no chunk <0.9 · ratio 1.158 | 19 → 18 |

Every slug merge was verified by EVALUATING `extractSaintName`, and every one is intentional:
day-16 Euphemia ×2 (Acts + the separate *culta* treatise at 0020), day-07 Stephen of Die ×5
(Commentary, metric Life, Miracula, Paraphrase, Letter) and John of Lodi ×2. Zero unintended
merges, zero same-saint splits. **The two Johns of day-07 landed as `john-the-martyr` and
`john-of-lodi`** — the mandated pair did its job.

### ⭐ AN AGENT GIVEN A WHOLE DAY MAY SHARD ITSELF — AND THE THREE OUTCOMES DIFFERED
None of the three prompts mentioned sharding; all said "you are the sole agent on this day."
- **day-07 (116 chunks) ran SERIALLY** — one agent, 154 tool uses, ~1h57m. Whole-day serial
  ownership is therefore *proven at 116 chunks*, which the Round-A–C record (max 99) had not shown.
- **day-03 (111) self-sharded into 8**, its coordinator reporting 1.2 MB of Latin as too large for
  one context at full fidelity.
- **day-16 (125) self-sharded into 5** at 25 chunks each, with pre-assigned header forms.
Same instruction, same size band, opposite strategies. **Do not infer from a clean big day that
serial ownership was what ran** — check the agent's own report. Both sharding coordinators froze a
header table centrally before dispatch (Round E's lesson, rediscovered unprompted) and both
verified seams afterward; that is why the self-sharding cost nothing.

### Defects the agents caught and repaired themselves (none reached disk)
- day-16: a clause duplicated across the 0048/0049 shard boundary.
- day-03: a place line opening `ON THE ISLAND OF CAPRAJA…` — a false-split shape — recast to `IN THE
  ISLAND OF…`; plus an inconsistent `[*]` marker across 0015–0027.
- day-07: **reading two Latin chunks per turn twice caused both to be translated into the earlier
  file** (0043/0044, 0085/0086); split back at the exact Latin boundary. New failure shape worth
  naming in the prompt — it is not a seam error, it is a *read-batching* error, and it produces a
  fat file plus a thin one rather than a gap.

### ⚠️ THE BYTE RATIO MOVES WITH GREEK LOAD — 1.206 IS NOT PADDING
day-03 came in at **1.206**, above the 1.09–1.16 band, i.e. the opposite direction from truncation.
Per-chunk spread is tight (max 1.27, no outlier), so it is a day-level property, not invented text
in one place. Cause: **untranslated Greek reproduced verbatim DEFLATES the ratio.** day-16 has Greek
in 20 files and sits at 1.158; day-03's Greek is much lighter and sits at 1.206. Read the band as
Greek-dependent, not absolute. `RESUME-aug.md`'s stated band was measured on Greek-bearing days.

### Header work mandated up front this round (all held)
- **day-07 two different Johns** — `ON ST. JOHN THE MARTYR,` (0003) vs `ON ST. JOHN OF LODI, …`
  (0082, 0097). Found by reading the day's Latin headers before dispatch, not from `MAP-sep.md`.
- **day-16 Euphemia** — `ON ST. EUPHEMIA OF CHALCEDON, VIRGIN AND MARTYR,` byte-identical across
  the Acts and the `DE S. EUPHEMIA V. M. CULTA` treatise, which would otherwise have built as a
  second page. Also Victor III (ordinal before the comma) and Edith/Eadgitha.
- **day-03** one-man-two-names: Godegrand/Chrodogang, Aristion/Aristeus; Aigulphus' companion
  roster kept out of the display name; Ambrose **of Sens** given its epithet pre-comma so it can
  never collide with Ambrose of Milan.
Generalizing the method: **grep each day's Latin `DE S.`/`DE SS.` headers before dispatch and put
the day's actual clashes in its prompt.** The three days' traps were all real and none of the three
appears in `MAP-sep.md`'s name-trap list.

⬜ **OPEN, for Wilson:** day-03/0038 prints apostrophus numerals (`1ⅠƆCC`, `1ⅠƆC`) for Strabo's
colonist figures. The glyphs survived the scrape intact, so the agent reproduced them verbatim
rather than blanking to `[ ]`. Reads correct — the lacuna convention is for *lost* content — but it
sits next to the deliberately-unruled garbled-WORDS question. Not re-raised elsewhere.

**NOT run this round (deliberate, per Wilson's "stop after that"):** split-saints, build-site,
pagefind, deploy. September still shows `forthcoming` on the live site.
Remaining: **17 days / 3,046 chunks.** 04 (294), 14 (387), 28 (241), 30 (320) still last.
