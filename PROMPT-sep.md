# September frozen translation prompt

The template below is the August Round-E prompt (which ran 35-for-35 clean) retargeted to
September, plus the two clauses August's rounds said to add: the `[Col. NNN]` marker rule and
September's name traps. **Until now this template lived only in agent transcripts** — it is
written down here so a later session does not have to reconstruct it.

Per-shard fields to fill: `{SHARD}`, `{DAY}`, `{FIRST}`, `{LAST}`, `{COUNT}`, `{NEIGHBOURS}`,
`{VOL}`, `{FROZEN_HEADERS}`, `{MEGA_DOSSIER_BLOCK}`.

Run order (from `MAP-sep.md`): warm up on the small days, take days 14 / 30 / 04 / 28 last.

---

You are translating the Acta Sanctorum (Bollandist) from Latin into English for the project at `~/acta-sanctorum/`. This is a production corpus translation, not a demo.

## ANTI-SELF-THROTTLE PREAMBLE — READ FIRST
Previous agents on this project have failed in exactly one way: they decided partway through that the work was too long, and started summarizing, abridging, batching "representative" chunks, or writing a note saying "the remaining chunks follow the same pattern." THAT IS THE FAILURE MODE. Do not do it. Every single assigned chunk gets a full, complete, sentence-by-sentence English translation of its entire Latin content. You have a very large context budget and 35 prior agents have completed 50–96 chunks each at full fidelity, 35 clean completions with zero self-throttling. There is no need to conserve. Work steadily from the first chunk to the last. Do not stop early. Do not ask permission to continue. Do not summarize your progress until you are finished with the last chunk.

## YOUR ASSIGNMENT — {SHARD}
Translate chunks **`{FIRST}-sep-day-{DAY}.md` through `{LAST}-sep-day-{DAY}.md` inclusive ({COUNT} chunks)** of September day-{DAY}.

- Latin source: `~/acta-sanctorum/src/latin/sep/day-{DAY}/chunks/NNNN-sep-day-{DAY}.md`
- English output: `~/acta-sanctorum/src/translations/sep/day-{DAY}/NNNN-sep-day-{DAY}.md` (flat, no subdirectories)

One Latin chunk → exactly one English file with the identical filename.

## RANGE DISCIPLINE (critical — read twice)
Your range is `{FIRST}`–`{LAST}`. {NEIGHBOURS}
- **Do NOT write any file outside `{FIRST}`–`{LAST}`.** Anything you leave outside your range collides with another agent's work — this is exactly the mechanism behind this corpus's known duplicate-translation defect.

## SEAM DISCIPLINE — do not bridge
Your first chunk begins wherever its Latin begins, which may well be mid-sentence and mid-document. **Do NOT recap, summarize, introduce, or write a bridging clause. Do not restate what came before.** Translate the first Latin word as the first English word. Eight sharded seams across five days have met mid-sentence with no gap and no overlap — match that.

Do NOT read chunks outside your range for "context." To calibrate register, read one or two existing files from a finished month, e.g. `~/acta-sanctorum/src/translations/aug/day-25/0000-aug-day-25.md` — for style only, and repeat none of their content.

Your last chunk simply ends where its Latin ends, almost certainly mid-sentence. Add no closing summary or bridging text.

## ⚠️ ONE LATIN CHUNK PER TURN — THE READ-BATCHING ERROR
**Read exactly one Latin chunk, write its English file, then read the next.** Do not read two or
more Latin chunks in the same turn to "save round-trips." A September Round-D agent did this twice
on day-07 and both times translated *both* chunks into the *earlier* file (0043/0044, 0085/0086),
leaving one fat file and one thin one. It had to be split back by hand at the exact Latin boundary.

This is not a seam error and the range check will not catch it — the file count is right and no
chunk is missing. The only tell is a byte ratio far above the day's mean paired with one far below.
If you ever find you have read ahead, stop and write each chunk's translation to its own file
before continuing.

## OUTPUT FORMAT
The Latin source has NO frontmatter. You must GENERATE the YAML frontmatter on every English file:

```
---
day: {DAY}
month: sep
chunk: "{FIRST}"
status: translated
---

<translation body>
```

(`chunk` is the zero-padded 4-digit number as a quoted string.)

## TRANSLATION CONVENTIONS (frozen — follow exactly)

1. **Complete and literal.** Translate everything: commentaries, Acts, Vitae, annotations, martyrologies, charters, letters, notes, bulls, testaments. Nothing is skipped as "boilerplate."
2. **Drop the German scrape furniture — ALWAYS, INCLUDING IN YOUR LAST CHUNK.** `Acta Sanctorum der Bollandisten`, `Einleitung September {VOL}`, `Band September {VOL}`, `Anhang September {VOL}`, `Heiligenlexikon`, `als USB-Stick oder als DVD`, `Unterstützung für das Ökumenische Heiligenlexikon`, `Seite zum Ausdruck optimiert`, `Unser Reise-Blog`, `Empfehlung an Freunde senden`, `Artikel kommentieren / Fehler melden`, `Fragen? - unsere FAQs antworten!`, `Im Heiligenlexikon suchen`, `Impressum - Datenschutzerklärung`, and any `September {VOL}: NN. September` navigation line are website scrape artifacts, not source text. **DELETE them.** ⚠️ A September Round-B agent reproduced this whole block verbatim in its final chunk, reasoning that preserving it was consistent with the "never delete source content" principle — it is NOT source content, it is the scraped web page's chrome, and it had to be stripped by hand. **The last chunk of a day is where this block lives**, so that is exactly where the rule gets tested. Nothing else gets dropped.
3. **Greek stays Greek.** Do NOT translate Greek passages — reproduce them as-is. Where the Bollandists print a facing Latin column of the same text, translate that Latin column. (A Greek Vita thus legitimately appears once in Greek and once in English — correct, not a duplicate.)
4. **Paragraph numbers and section marks preserved verbatim** (`[1]`, `[23]`, `§`, chapter numerals) — including where the source's own numbering jumps, repeats, or is plainly wrong.
5. **Inline footnote markers.** The Latin body carries bare single letters (a–o) floating between words as footnote references, e.g. `quidem c Petro`. Render these as bracketed markers at the corresponding position: `[c] Peter`. Do NOT mistake the Latin preposition `a` for a marker. Footnote definitions in an `[Annotata]` / notes section use period format: `a. Definition text.` If the printed markers run out of alphabetical order, preserve the printed ORDER — position governs, not the alphabet. Some dossiers use DOUBLED letters (`aa`, `bb` … `sss`); render those as `[aa]` etc.
6. **`[Col. NNN]` inline markers are CORPUS CONVENTION — KEEP THEM.** Where the Latin carries an inline column marker such as `[Col. 421]`, reproduce it in the English at the same position. It is not scrape furniture and it is not a footnote. Two August agents independently reasoned these away and had to be corrected by hand. If the number itself was lost to the scrape, the form is `[Col. [ ]]`. September has these in only ~10 Latin files, so you may see none — that is fine; just never delete one you do see.
7. **NEVER silently repair the source.** If a numeral is garbled, missing, or impossible (e.g. `die LX Februarii`, a 60th of February; a citation whose column number was lost in the scrape), write the empty-bracket lacuna `[ ]` — `the [ ] day of February`, `column [ ]`, `volume [ ]` — and REPORT it. **If you are tempted to correct a garbled numeral to what it probably was, DON'T.** Inference is not the convention; `[ ]` plus a report is. This extends to annotation content: if a footnote marker's definition is missing, leave the bare marker — do NOT supply what the note probably said. Likewise leave the Bollandists' own self-contradictions (dates, emperors, numbers, arithmetic that does not close) exactly as printed.
8. **In your report, separate the contradictions the Bollandists flag THEMSELVES from the ones they do not.** The second list is the valuable one — it is what the corpus has no other record of.
9. **Register:** dignified, readable scholarly English. Not archaizing, not modernizing-chatty. Calibrate on the existing files named above.

## SAINT-HEADER RULES (load-bearing — a splitter reads these lines)
A downstream script detects saint entries by the header line ALONE, and cuts the display name at **the first comma**. Everything after that comma is discarded for naming purposes.

- Required form: `ON ST. X` / `ON STS. X` / `ON SS. X` / `ON S. X` / `ON BL. X` / `ON BB. X` / `ON BLESSED X` / `ON THE HOLY X` / `ON THE BLESSED X` / `ON VEN. X` / `ON VENERABLE X` / `ON SAINT X`, or `CONCERNING …` with the same honorifics. **ALL CAPS, on its own line.**
- The Latin will often arrive spelled out as `DE SANCTO …` / `DE SANCTIS …` / `DE BEATO …` / `DE BEATA …` instead of `DE S.`. **Normalize all of these to the `ON ST.` / `ON SS.` / `ON BL.` forms.** They are true article headers and a grep for `DE S.` alone will miss them — September day-10's Hilarus, day-15's Catherine Fieschi Adorno (the largest dossier on her day), and three `DE B.` blesseds all arrived this way.
- ⚠️⚠️ **BUT THE BOLLANDIST INDEX HEAD IS NOT AN ARTICLE HEADER — DO NOT PROMOTE IT.** The running identification line `Valerianus martyr, Threnorchii in ducatu Burgundiæ (S.)` — typically sitting under a source line such as `Ex variis exemplaribus Mss. & impressis inter se collatis.` and above a `BHL Number:` line — identifies a *document* inside a dossier that already has its own `DE` header elsewhere. **Render it in sentence case as the elogium it is** (`Valerian, martyr, at Tournus in the duchy of Burgundy. (S.)`), keeping the `(S.)`/`(Bl.)` marker and the `BHL Number` line. Never emit it as an ALL-CAPS `ON ST.` line.
  - This clause used to read "…or as the Bollandist index form (`Hieronymus presbyter … (S.)`). Normalize all of these" — and **two independent September Round-E agents duly promoted every running index head to a header**, one emitting 56 header lines for 19 saints and the other 29 for 13. Both had to be reverted. The instruction, not the agents, was at fault; it is corrected here.
  - **A chunk with no header at all is normal and expected** — see the clause below. Do not go looking for a header to give it. If a dossier's `DE` header appeared in an earlier chunk, every later chunk of that dossier correctly carries none.
  - The same applies to the **day-opening roster** and to the Bollandist **index blocks** (runs of lines like `Ammonius M. Alexandriæ in Ægypto (S.)`). September day-08 met 27 such lines and rendered them in sentence case; emitted as headers they would have produced ~27 false splits. Sentence case, always.
- `ON BLESSED X` and `ON THE HOLY MARTYRS X` are legitimate corpus-majority forms. Do not "fix" them.
- **FATAL forms — never emit:** `OF SAINT X`, `OF S. X`, `CONCERNING BLESSED X` as an opener, or any lowercase keyword/honorific.
- **A subtitle or location line must never begin with `ON `** — that shape gets misread as a saint header and produces a false split. Recast it (`ON MOUNT SCETIS IN LIBYA` → `IN MOUNT SCETIS OF LIBYA`).
- For a large martyr group where the cut can only capture the first name, joining names with `AND` instead of serial commas lets more survive. Do this where it reads naturally; do not contort the header. Flag any header whose names cannot survive the cut.
- **If your range contains NO saint header at all, that is possible and fine** — a single large dossier can run through a whole shard. Say so explicitly so the downstream scan doesn't conclude headers were lost.

**⚠️ THE HEADER MUST HAVE A COMMA. NAME BEFORE IT, ROLE AFTER IT.**
This is the corpus form across all eight deployed months, and it is the single most common thing to get wrong. The header reads `ON ST. <NAME>, <ROLE AND PLACE>,` — the name (plus any epithet needed to tell this saint from another of the same name) goes **before** the comma; the office, status, and location go **after** it, where the splitter discards them.

```
ON ST. GERONTIUS, BISHOP OF ITALICA IN SPAIN,        → display "Gerontius"          ✅
ON ST. ZEPHYRINUS, POPE,                             → display "Zephyrinus"         ✅
ON SS. TIMOTHY AND FAUSTUS, MARTYRS AT ANTIOCH,      → display "Timothy and Faustus" ✅
ON ST. CORBINIAN FIRST BISHOP OF FREISING IN BAVARIA → display "Corbinian First Bishop of Freising in Bavaria"  ❌
ON ST. BELINA VIRGIN AND MARTYR                      → display "Belina Virgin and Martyr"  ❌
```

**Do not respond to the pre-comma rule below by dropping the comma.** A September day-08 agent read "put every distinguishing epithet before the comma" and emitted eight of eleven headers with no comma at all, so every role and place-name landed in the display name and the URL slug; all eight had to be repaired by hand. The epithet moves before the comma **only when two saints in the day would otherwise share a name** (Genesius the Mime vs. Genesius the Notary; Alexander of Brescia vs. Alexander of Bergamo). Absent a clash, the plain name stands alone before the comma and everything else follows it.

Group headers are the one exception: all the *names* stay before the comma even when there are several (`ON SS. EUSEBIUS AND NESTABUS AND ZENO AND NESTOR, MARTYRS AT GAZA IN PALESTINE,`), because names are the identifying content. Roles and places still follow the comma.

**But for a LARGE group — more than about eight names — use the colon form instead.** `extractSaintName` cuts at a colon *before* it cuts at a comma, which is the mechanism built for the 19 Martyrs of Gorcum. Give the group a collective name, then a colon, then the full roster:

```
ON THE HOLY MARTYRS OF OSTIA: CENSURINUS AND CYRIACUS AND MAXIMUS AND …, MARTYRS,
                                                     → display "Martyrs of Ostia"  ✅
```

The roster survives in the text; only the page *name* is shortened. Without the colon, a 22-name Ostia group produced a 250-character slug and an unusable URL, and had to be recast by hand.

**THE PRE-COMMA RULE, BOTH HALVES:**
The text before the first comma must be
  (a) **the SAME for every header belonging to the same saint**, and
  (b) **DIFFERENT for every header belonging to a different saint.**

Agents reliably check (b) and miss (a). A real case from August day-20: the same Bernard of Clairvaux got `ON ST. BERNARD OF CLAIRVAUX, CONFESSOR,` at the *Commentarius* and `ON ST. BERNARD, FIRST ABBOT OF CLAIRVAUX,` at the *Vita* — the epithet fell after the comma in the second, so one dossier would have built as two separate pages. **If a saint's dossier has several headers (Commentarius prævius, Acta, Vita, Miracula, Translatio, Annotata), give them all byte-identical pre-comma text.** Put every distinguishing epithet BEFORE the comma, never after.

Half (b) is not hypothetical either: August day-25 had two *different* abbesses of Coldingham both named Ebba, and naïve headers would have merged two unrelated saints onto one page.

## ⚠️ SEPTEMBER NAME TRAPS — check these before you write a header
- **Two different Cyprians, twelve days apart.** Sept 14 `DE S. CYPRIANO, EPISC. MART.` is Cyprian of Carthage; Sept 26 `DE SS. CYPRIANO ET JUSTINA` is Cyprian of Antioch, the magician. Different men — the pre-comma text must distinguish them.
- **Two Ferreoli on day 18:** `DE S. FERREOLO MARTYRE` (0000) and `DE S. FERREOLO EPISC. CONF.` (0014).
- **Two Marcelli on day 04:** `DE S. MARCELLO MARTYRE` (0113) and `DE S. MARCELLO EPISC. ET MART.` (0122).
- **Two Fausti on day 28:** `DE S. FAUSTO EPISCOPO REGIENSI` (0033) and `DE S. FAUSTO EPISC.` (0074).
- **Two Candidae on day 04:** `DE SANCTA CANDIDA A S. PETRO APOSTOLO CONVERSA` (0108) and `DE S. CANDIDA JUNIORE MULIERE CONJUGATA` (0137).
- **Rosalia / Rosa / Rosula / Rosa of Sulci are four distinct women** (day 04 ×2, day 01, day 14).
- **Victor recurs** on days 10, 14 and 30; day-30's is Victor of the Theban Legion and must not absorb the Ursus dossier.

## HEADERS ALREADY EMITTED EARLIER IN THIS DAY — if your range continues any of these dossiers, reprint the header byte-identically:
```
{FROZEN_HEADERS}
```

{MEGA_DOSSIER_BLOCK}

## DO NOT
- Do not re-translate or overlap a chunk. Each Latin chunk is emitted exactly once.
- Do not duplicate paragraphs across a chunk boundary.
- Do not run any build, split, or deploy script.
- Do not write outside chunks `{FIRST}`–`{LAST}` of `src/translations/sep/day-{DAY}/`.

## WHEN FINISHED
Verify you wrote exactly {COUNT} files, `{FIRST}`–`{LAST}`, then report: chunks completed; any `[ ]` lacunae and why; any `[Col. NNN]` markers you carried through; source anomalies split into Bollandist-flagged vs NOT-flagged; any name collisions or same-saint header alignments you made; the full verbatim list of saint headers you emitted, or an explicit statement that your range contained none; which dossier is still OPEN at your last chunk; **the first ~20 words of your first chunk**; and **the last ~20 words of your last chunk**, so both seams can be checked.

---

## `{MEGA_DOSSIER_BLOCK}` — mandated header strings

Use this block verbatim (adapted) on **every** shard of a day whose mega-dossier crosses a seam.
Round E's lesson: concurrent shards have no report to read, so the string must be mandated up
front, in all of them.

```
⚠️⚠️ **<SAINT> — MANDATED HEADER FORM.** His/her dossier is enormous (Commentarius prævius,
Vitae, Miracula, Translatio, Annotata) and runs straight through your range. All shards of this
day have been given the SAME mandated wording. Every header line belonging to any part of this
dossier must read exactly:

    <MANDATED HEADER>

byte-identical before the comma, every time, no variation (not "<WRONG VARIANT 1>", not
"<WRONG VARIANT 2>"). Report each occurrence verbatim and prominently.
```

Mandated strings for September's cross-seam dossiers (English forms; Latin sources in `MAP-sep.md`).
**Re-derived 2026-08-30 by grepping every day with `^DE [A-Z]` and measuring the gap to the next
header.** Two spans in the old table were WRONG and one of them merged two saints — see the warning
below. Threshold is now **~40 chunks**, not 75.

| Day | Mandated header | Latin chunks |
|-----|-----------------|--------------|
| 14 | `ON ST. JOHN CHRYSOSTOM, BISHOP OF CONSTANTINOPLE AND DOCTOR OF THE CHURCH,` | 0159–0351 (193) |
| 30 | `ON ST. JEROME THE PRESBYTER,` | 0098–0269 (172) |
| 18 | `ON ST. THOMAS OF VILLANOVA, ARCHBISHOP OF VALENCIA,` | **0023–0142 (120)** ⚠ corrected |
| 04 | `ON ST. MOSES THE PROPHET, LEADER AND LAWGIVER OF THE PEOPLE OF ISRAEL,` | 0000–0107 (108) |
| 14 | `ON ST. CYPRIAN OF CARTHAGE, BISHOP AND MARTYR,` | 0030–0127 (98) |
| 04 | `ON ST. ROSALIA OF PALERMO, VIRGIN,` | 0167–0249 (83) |
| 29 | `ON ST. MICHAEL THE ARCHANGEL, AND ON ALL THE ANGELS,` | 0000–0076 (77) |
| 30 | `ON ST. GREGORY THE ILLUMINATOR, BISHOP OF ARMENIA AND CONFESSOR,` | 0020–0094 (75) |
| 02 | `ON ST. STEPHEN, FIRST KING OF THE HUNGARIANS,` | 0068–0140 (73) |
| 28 | `ON BL. BERNARDINO OF FELTRE, CONFESSOR OF THE ORDER OF MINORS OBSERVANT OF ST. FRANCIS,` | 0173–0240 (68) |
| 17 | `ON ST. LAMBERT, BISHOP OF MAASTRICHT AND MARTYR,` | 0030–0089 (60) |
| 28 | `ON ST. WENCESLAUS, MARTYR, DUKE AND PATRON OF BOHEMIA,` | 0108–0154 (47) |
| 17 | `ON ST. HILDEGARD, VIRGIN AND MISTRESS OF THE SISTERS OF THE ORDER OF ST. BENEDICT,` | **0096–0141 (46)** ⚠ corrected |
| 01 | `ON ST. JOSHUA, LEADER OF THE ISRAELITES,` | 0000–0044 (45) |
| 18 | `ON BL. JOSEPH OF CUPERTINO, PRESBYTER OF THE ORDER OF MINORS CONVENTUAL OF ST. FRANCIS,` | 0143–0187 (45) |
| 26 | `ON SS. CYPRIAN OF ANTIOCH AND JUSTINA AND THEOCTISTUS, MARTYRS NEAR NICOMEDIA IN BITHYNIA,` | 0003–0046 (44) |
| 27 | `ON ST. ELZÉAR DE SABRAN, BARON OF ANSOUIS AND COUNT OF ARIANO, CONFESSOR,` | 0093–0135 (43) |
| 26 | `ON ST. NILUS, ABBOT OF GROTTAFERRATA,` | 0057–0098 (42) |
| 28 | `ON ST. FAUSTUS OF RIEZ, BISHOP,` | 0033–0073 (41) |
| 04 | `ON ST. ROSE OF VITERBO, VIRGIN,` | 0250–0289 (40) |

Day 25 has no dossier over 40 chunks (18 headers across 116) and needs no mandated string.
The eleven strings below the old 75-chunk line were derived 2026-08-30 from each dossier's OWN
Latin header and subtitle, never from outside knowledge; they have not yet been through an agent.

### ⚠️⚠️ THE OLD TABLE HAD TWO WRONG SPANS — ONE WOULD HAVE MERGED TWO SAINTS
- **Day 18: Thomas of Villanova was listed as 0023–0187 (165).** He actually ends at **0142**;
  chunk **0143 opens `DE B. JOSEPHO A CUPERTINO`**, a 45-chunk dossier of his own. Dispatched on the
  old figure, every shard past 0143 would have been ordered to head Joseph of Cupertino's dossier
  with Thomas's mandated string — **manufacturing the exact D8 merged-works defect on purpose**, and
  the mandate would have made it look correct to every gate.
- **Day 17: Hildegard was listed as 0096–0174 (79).** She ends at **0141**; 0142 is
  `DE B. GANDOLPHO` and 0158 is `DE B. PETRO ARBUESIO`.

**Lesson: a mandated span is an instruction to OVERWRITE headers, so a too-long span is far more
dangerous than no mandate at all.** Re-measure the gap to the next `^DE [A-Z]` before trusting any
row here, and never widen a span to "cover" a shard boundary.

### ⚠️ THREE MORE THINGS THE `^DE [A-Z]` SWEEP TURNED UP
- **`^DE [A-Z]` has its own false positives.** Day-17/0153 is `DE CULTU, RELIQUIIS ET MIRACULIS
  RECENTIORIBUS.` — a *sub-section* of the Gandolphus dossier, not an article header, and it names
  no saint. Same family as day-10's `DE AFRICANIS MARTYRIBUS…`, which was the opposite case (a real
  dossier naming no saint). **The pattern is the right net; a reader still has to sort the catch.**
- **The `ITEM DE …` joined-dossier shape recurs.** Day-30's Gregory header is
  `DE S. GREGORIO EPISCOPO ARMENIÆ CONFESSORE: ITEM DE SS. VIRGINIBUS RIPSIME, GAIANA ET SOCIIS` —
  the mandated string above keeps only Gregory and **silently drops Ripsime and Gaiana**. Day-02's
  0010 does the same to a second Nicomedian group. This is the day-05 Romulus/Melitene problem:
  **keep both and claim neither wrongly.** ⬜ Unresolved — decide before day 30 is dispatched.
- **Day-17's Lambert header itself carries `ET EA OCCASIONE DE BB. PETRO, ANDOLETO ETC.`** — a
  second group folded into the header line. Same decision as above.

Note day 14: Cyprian's mandated form carries **OF CARTHAGE before the comma** precisely so it can
never collide with day 26's Cyprian of Antioch. Same reasoning for Rosalia **OF PALERMO**.

---

## ✅ THE `ITEM DE` / JOINED-DOSSIER RULE — RULED BY WILSON 2026-09-03

**When one Latin header folds a second dossier into itself** — `ITEM DE …`, a colon joining two
parties, or `ET EA OCCASIONE DE …` — **both parties go into the display name.** Use the colon form:
every party's NAME before the colon, roles and places after it.

```
LATIN   DE S. LAMBERTO SEU LANDEBERTO EPISCOPO TRAJECTENSI ET MARTYRE,
        ET EA OCCASIONE DE BB. PETRO, ANDOLETO ETC.
HEADER  ON ST. LAMBERT AND BB. PETER AND ANDOLETUS: BISHOP OF MAASTRICHT AND MARTYR,
        → display "Lambert and Bb. Peter and Andoletus"
```

This is the **day-05 Romulus/Melitene form**, now house policy: *keep both, claim neither wrongly.*
A blind primary-only header relocates or erases a saint who has no other page.

⚠️ **Round F's day-02/0010 went the other way** — `ON THE HOLY 6,628 MARTYRS OF NICOMEDIA: WITH SS.
AITHALUS, JUNIUS, PHILIP, AND THEODOTUS, MARTYRS,` drops Aithalus and company from the display name.
That is now the **outlier**, logged for repair before the September deploy; do not copy it.

**Live cases this rule governs:** day 17/0030 (Lambert + BB. Peter, Andoletus) · day 01/0122
(`DE SS. MARCIANO EP., SISINNIO, AMAUSO: ITEM DE SS. PRIMO AC MATERNO MM.`) · day 30/0020
(`DE S. GREGORIO EPISCOPO ARMENIÆ CONFESSORE: ITEM DE SS. VIRGINIBUS RIPSIME, GAIANA ET SOCIIS`).

⚠️ **The mandated-string table above is written in the primary-only form for days 17 and 30. Where
this rule applies, the mandated string is SUPERSEDED by the colon form.** Corrected strings:

| Day | Chunks | Mandated header (supersedes the table row) |
|-----|--------|--------------------------------------------|
| 17 | 0030–0089 | `ON ST. LAMBERT AND BB. PETER AND ANDOLETUS: BISHOP OF MAASTRICHT AND MARTYR,` |
| 30 | 0020–0094 | `ON ST. GREGORY THE ILLUMINATOR AND SS. RIPSIME AND GAIANA: BISHOP OF ARMENIA AND CONFESSOR,` |

⚠️ Day 01/0122 is a four-header chunk and needs no mandated string (the dossier is short); the rule
still applies to its header line: `ON SS. MARCIAN AND SISINNIUS AND AMASUS AND PRIMUS AND MATERNUS:
BISHOP AND MARTYRS,`.


---

## ⛔⛔ THE HONORIFIC MUST SIT IMMEDIATELY AFTER `ON ` — added 2026-09-04, after a real defect

The splitter's `isSaintBoundary()` **silently rejects** a header whose honorific is not immediately
adjacent to `ON `. A rejected header produces **no page**: the saint's text accretes onto the
preceding saint, and `check-day.mjs` still reports `headers → slugs` parity, because the counts stay
*self-consistently wrong*. Every other gate — file count, frontmatter, byte ratio, per-chunk minimum,
distinct-slug count — stays green too. **This is defect class D11 and it is invisible without the
dedicated checker.**

**Safe openers, and nothing else:**
`ON ST.` · `ON STS.` · `ON SS.` · `ON S.` · `ON BL.` · `ON BB.` · `ON BLESSED` · `ON THE HOLY …` ·
`ON THE BLESSED …` · `ON VEN.` · `ON VENERABLE` · `ON SAINT` — or `CONCERNING …` with the same
honorifics.

⛔ **Never put a number, adjective, or article between `ON THE` and `HOLY`/`BLESSED`.**

**The real case (September day-01/0077, caught pre-split 2026-09-04).** A twelve-name group took the
colon form and came out as:

    ON THE TWELVE HOLY BROTHERS: DONATUS AND FELIX AND …, MARTYRS AT BENEVENTO IN ITALY,   ❌ REJECTED

`TWELVE` sits between `THE` and `HOLY`. The dossier is **fifteen chunks (0077–0091)**; rejected, all
twelve martyrs get no page at all. Corrected to:

    ON THE HOLY TWELVE BROTHERS: DONATUS AND FELIX AND …, MARTYRS AT BENEVENTO IN ITALY,   ✅ PASSES

⚠️ **THE SHAPE RECURS ON NUMBERED GROUPS — second real instance, September day-28/0001.**
`ET DE TRIGINTA MILITIBUS` translates naturally to `ON THE THIRTY HOLY SOLDIERS…`, rejected for the
same reason. It was caught pre-dispatch and the group took the sourced collective
`ON THE HOLY MARTYRS OF ASIA MINOR: …` instead. **Whenever a group header carries a NUMBER, check it
against the real function before you write it** — the number is what lands in the fatal slot.

⭐ Note the corrected form is also the **more literal** one — the Latin is `DE SS. DUODECIM FRATRIBUS`,
*sanctis duodecim fratribus*, "the holy twelve brothers".

**VERIFY EVERY HEADER YOU WRITE. Do not eyeball it — run the real function:**

```
cd ~/acta-sanctorum && node -e "
const fs=require('fs');
const m=fs.readFileSync('scripts/split-saints.mjs','utf8').match(/function isSaintBoundary[\s\S]*?\n}/);
eval(m[0].replace('function isSaintBoundary','globalThis.isSaintBoundary=function'));
console.log(isSaintBoundary('YOUR HEADER LINE HERE'));
"
```

Every real saint header must return `true`. Or check a whole finished day at once with
`node scripts/check-header-boundaries.mjs` — it extracts the real function from `split-saints.mjs` by
source, so it cannot drift from the splitter.

⚠️ **And the mirror rule: no subtitle or section heading may begin with `ON `.** Those lines are
*correctly* rejected today, so they cause no false split — but they become false splits the instant
`isSaintBoundary()` is widened, which is a live option for the D11 repair. Recast them against their
own Latin. Two real cases on September day 17:

| Latin | Wrong | Right |
|---|---|---|
| `IN MONTE S. RUPERTI JUXTA BINGIUM…` | `ON THE MOUNT OF ST. RUPERT…` | `AT THE MOUNT OF ST. RUPERT…` |
| `DE CULTU, RELIQUIIS ET MIRACULIS RECENTIORIBUS.` | `ON THE CULT, THE RELICS…` | `OF THE CULT, THE RELICS…` |

⭐ The first is the trap worth remembering: the Latin is `IN MONTE`, and rendering `IN` as the natural
English `ON` is what created the fatal shape. **A location line translated naturally drifts into it.**


---

## ⚖️ THE SILENT-REPAIR CLAUSE — RULED BY WILSON 2026-09-04. THIS SUPERSEDES ALL EARLIER PRACTICE.

The scrape and the printed source corrupt things in different ways, and the corpus had **no single
policy**, so agents on the same day applied opposite ones — day-29 split 93 chunks, day-25 split 21
files. **There is now one policy. State it verbatim in every shard prompt, and rule it centrally
before you shard.**

### The three branches

**① A WORD the scrape mangled, whose correct form is fixed by the immediate text → CORRECT IT, AND LOG IT.**
Render the word correctly and record it in the day's repair ledger. The licence is narrow and it is
the whole of the rule: *the surrounding text must supply the answer.*

> **The deciding case (day-27/0002).** The Latin reads `quo minus idem esse possit Jones`. `Jones` is
> not a Latin word; the printed text is `Joannes`, and chunk 0003 spells `Joannes Marcus` three times
> in the same argument. → rendered **"John Mark"**, logged. ✅

⛔ **"Fixed by the immediate text" means a witness you can point at** — the same word spelled correctly
elsewhere in the dossier, or a grammatical form with exactly one possible completion. It does **not**
mean "what it probably was," and it does **not** mean your own knowledge of who the saint was. If your
justification would be *"this is obviously Saint So-and-so"* rather than *"the text says so at line
N"*, you are in branch ②, not branch ①.

**② A NUMERAL, DATE, PLACE, or NAME with NO textual witness → `[ ]` AND REPORT IT.**
Column numbers, paragraph numbers, years, day-dates, place-names, and any name the surrounding text
does not independently supply. Write the empty-bracket lacuna — `the [ ] day of February`,
`column [ ]`, `volume [ ]` — and report it. **Never infer what a lost numeral probably was.**

**③ Anything the source PRINTS, however wrong → PRESERVE IT EXACTLY, and report it under "NOT flagged".**
Numbering that jumps, repeats, or is impossible; the Bollandists' own contradictions, bad arithmetic,
wrong regnal numbers, misattributed Scripture. This is convention 4 and it is untouched by the above.
A wrong year inside a quoted papal decree stays as printed (day-18/0156).

### Where the boundary actually falls
Branch ① is about **transmission damage** — the scrape ate a character. Branch ② is about
**information that is gone**. Branch ③ is about **information that is present and wrong**.
⚠️ The failure mode is drifting from ① into ②: "the text fixes it" quietly becoming "I know what it
should say." When you cannot name the witness, use `[ ]`.

### The repair ledger — REQUIRED for every branch-① correction
Append to **`~/acta-sanctorum/REPAIRS-sep.md`**, one line per correction:

```
| day | chunk | printed/scraped | rendered | the witness that fixed it |
|-----|-------|-----------------|----------|---------------------------|
| 27  | 0002  | `Jones`         | John Mark | 0003 spells `Joannes Marcus` 3x |
```

A branch-① correction that is **not** in the ledger is a silent repair, which is the thing this clause
exists to abolish. Ordinary printer/OCR noise translated straight to evident sense (`Fremitæ` for
*Eremitæ*, `muficam` for *musicam*) does **not** need a ledger line — the ledger is for cases where a
reader could reasonably have expected `[ ]` instead.
