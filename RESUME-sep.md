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

## ✅ NOTHING IS IN FLIGHT. All ten started days are COMPLETE and verified.

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

## Status: 722 / 4,120 chunks (17.5%), 10 of 30 days complete — STOPPED HERE 2026-08-16 at Wilson's instruction

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

**Days still to do (20):** 01, 02, 03, 04, 07, 10, 14, 15, 16, 17, 18, 19, 20, 22, 25, 26, 27, 28,
29, 30 — **3,398 chunks.** Days 04 (294), 14 (387), 28 (241) and 30 (320) are the monsters, need
sharding, and stay last; their mandated mega-dossier header strings are in `PROMPT-sep.md`.

Suggested next round (whole-day ownership, within the proven 60–96 envelope):
**07** (116, shard 2) · **10** (154, shard 2) · **20** (47) + **19** (60) — but see the day-19
Januarius warning below before treating 19 as complete.

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

- ⚠️ **Day 19, Januarius of Naples** — the roster carries the Bollandist note *"Acta imprimenda
  circa finem tomi"*; his acts print at the END of the volume, which is why day 19 is only 60
  chunks. His dossier may sit physically in another day's scrape or be absent. **Check before
  treating day 19 as complete.** Scrape-shape question, resolve at the gate pass, not mid-run.
- ⬜ day-08/0019's floating `o` (above) — Wilson's call.
- The nine cross-seam mega-dossiers (Chrysostom 193, Jerome 172, Thomas of Villanova 165, Moses 108,
  Cyprian of Carthage 98, Rosalia 83, Hildegard 79, Michael 77, Gregory the Illuminator 75) still
  have their mandated header strings unfired — days 14, 30, 04, 28 are deliberately last.

## NOT DONE ON PURPOSE (do NOT do these until the month is WHOLE)
- `split-saints.mjs --all-sep` — a partial split creates saint pages a later re-split re-slugs
- `build-site.mjs`, `about.html` refresh, pagefind, deploy — all wait for a complete September
- The `--all-sep` + build-site September wiring is **uncommitted on `master`**, alongside
  `RESUME-aug.md`, `MAP-sep.md`, and now `PROMPT-sep.md` and this file
