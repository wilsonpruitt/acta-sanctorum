# Acta August translation run log (2026-07-24) — SESSION END

> **CLOSED 2026-07-28:** the translation-methodology section is written and live on
> `site/about.html`. The brief it was built from — **`NOTES-methodology-page.md`** at the
> repo root — is kept as the record of what the page must contain. Note that the page
> cites this run's numbers (804 sections, 7-of-7 clean completions, the five reverted
> day-02/03 headers), so material changes here may want reflecting there.

## Status: 2,551 / 2,912 chunks (87.6%), 30 days complete (day-25 partial: 90/451)
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
| 16 | 90 | — | | 17 | 61 | — |
| 19 | 74 | — | | 29 | 27 | — |
| 18 | 106 | 15 | | 24 | 71 | 16 |
| 27 | 81 | 24 | | 30 | 61 | 16 |
| 31 | 95 | 22 | | 21 | 50 | 21 |
| 26 | 155 | 27 | | 20 | 233 | 22 |
| 28 | 217 | 47* | | 23 | 107 | 37* |
*header LINES, not saints: day-28 = 17 distinct saints, day-23 = 28. See Rounds C/D.

## ▶▶ REMAINING — day-25 ONLY — READ THIS BLOCK BEFORE LAUNCHING
**day-25 is the last day of August and the largest day in the entire corpus (451 chunks).**
Chunks **0000–0089 are DONE and verified**; **0090–0450 remain (361 chunks, ~4–5 agents).**
Suggested shards: 0090–0179 / 0180–0269 / 0270–0359 / 0360–0450 (90/90/90/91).

**THE SEAM INTO 0090 — hand this to the first agent verbatim:**
- English 0089 ends: *"…he began so to make himself over to the divine work that to all"*
- Latin 0089 ends `…ita se divino cœpit operi mancipare, ut cunctis`
- Latin 0090 opens `se cernentibus, velut jam futurus in Ecclesia præsul, forma fieret & exemplum.`
- So **0090 opens mid-sentence with "…beholding him, he became a pattern and example, as one who
  would one day be a prelate in the Church."** No recap, no bridging clause.
- Context: inside the Acts of St. Maxentius quoted within the **St. Severus of Agde** commentary.

⚠️⚠️ **ST. LOUIS IX HAS NOT STARTED YET.** He does NOT appear anywhere in 0000–0089 — his dossier
begins at 0090 or later and will be enormous. **The agent that opens it SETS THE HEADER FORM for
every later shard.** Instruct it to use the most explicit wording (`ON ST. LOUIS IX, KING OF
FRANCE, …`), to report it verbatim and prominently, and instruct every later shard to match it
byte-for-byte before the comma. This is the exact shape that produced the Bernard split.

**HEADERS ALREADY EMITTED IN day-25 — paste into every resume prompt so open dossiers align:**
```
ON ST. BARTHOLOMEW THE APOSTLE,
ON ST. GERONTIUS, BISHOP OF ITALICA IN SPAIN,
ON SS. EUSEBIUS AND PONTIANUS AND VINCENTIUS AND PEREGRINUS, ROMAN MARTYRS,
ON ST. MAGINUS OR MAXIMUS, MARTYR AMONG THE TARRACONESE IN CATALONIA,
ON ST. GENESIUS THE MIME, MARTYR AT ROME,
ON ST. GENESIUS THE NOTARY, MARTYR AT ARLES IN GAUL,
ON ST. MAXIMA, VIRGIN AND MARTYR IN THE TERRITORY OF CHARTRES IN GAUL,
ON SS. RUFINA AND EUTICA AND JULIAN AND PERHAPS JULIUS AND HERMES AND JUSTUS AND XVIII SOLDIERS, MARTYRS,
ON ST. JULIAN, MARTYR IN SYRIA,
ON ST. JOHN THE HERMIT, OF RUSELLO IN ABRUZZO OF ITALY,
ON ST. VICTOR OR VICTURUS, BISHOP OF LE MANS IN GAUL,
ON ST. GENNADIUS I, PATRIARCH OF CONSTANTINOPLE,
ON ST. SEVERUS, ABBOT OF AGDE IN OCCITANIA OF GAUL,      <- OPEN at 0089, continues into 0090
```

## ROUND D 2026-08-08/09 — day-23 sharded 2 + day-25 first 90 (Opus)
**Ran twice: the first launch died on a weekly API limit, the second finished it.**

### ⚠️⚠️ THE LESSON WORTH MORE THAN THE ROUND: CHECK THE DISK BEFORE RELAUNCHING
All three agents returned `status=failed` — *"You've hit your weekly limit"* — and the failure
notification's `result` field showed only each agent's FIRST message ("Now I'll begin. Writing
chunk 0000."). **That made it look as though nothing had been written. It was wrong.** They had
each run ~30 minutes and **92 chunks were already on disk**: day-23 `0000–0030` + `0054–0084`,
day-25 `0000–0029`.
**Had I trusted the notification and relaunched the original full ranges, three agents would have
re-translated 92 existing chunks** — which is precisely the mechanism that produced the corpus-wide
duplicate-translation defect (~65 pages) documented in [[acta-sanctorum]].
**STANDING RULE: after ANY agent failure, enumerate the output directory before relaunching, and
relaunch only the gap.** A `status=failed` notification says nothing reliable about how much work
landed. Partial work always flushes to disk.
Also verified before relaunch: the last file of every interrupted run ended exactly where its LATIN
chunk ended, so **no in-flight chunk was lost or truncated** — the "a failed agent only loses its
single in-flight chunk" note may be pessimistic; here it lost none.

### Resume-prompt recipe that worked (reuse for day-25's remaining 361)
1. Tell the agent it is RESUMING, that the earlier files are complete and verified, and that it
   must not touch or "improve" them.
2. **Quote the exact words its predecessor's last chunk ends on**, and say to continue from there
   with no recap. Allow it to read that ONE file to calibrate; forbid reading further.
3. **Paste the day's already-emitted headers verbatim** so a resumed dossier gets byte-identical
   pre-comma text. Without this the Bernard same-saint split is trivially easy to reproduce.
4. Name the ranges it must NOT write, including ranges owned by rounds that do not exist yet.

### day-23 COMPLETE — verified
107/107 chunks, 0 gaps, 0 extras, 0 footer leaks, 0 fatal header forms, frontmatter valid, ratio
1.498, no chunk under 0.9. **37 headers → 28 distinct slugs**; the 4 multi-part (Philip Benizi,
Ascelina, James of Bevagna, Bartholomew of Foresto) all merge correctly.
**Both RESUME seams clean** (`…in its propositions; so*` / `*it delights by its eloquence…`;
`…after Matins and Compline:` / `namely, Sub tuum PRÆSIDIUM etc.`) — no recap, no gap, no
duplicated paragraph, across an agent that died mid-dossier.

### ⬜ ONE COSMETIC CALL FOR WILSON (day-23/0053, not blocking)
`ON ST. ANTONY MONK AND PERHAPS ON BLESSED NICODEMUS OF THE ORDER OF ST. BASIL MONKS AND
CONFESSORS AT HIERACIUM IN CALABRIA,` has no comma until the end, so the display name is a
**21-word string** in the alphabetical index. It is FAITHFUL — the source hedges Nicodemus with
"perhaps", and the agent joined the names with AND so both saints survive the cut. Shortening it
means dropping the hedge or losing Nicodemus from the name. **Left as printed.** 1 entry of 28.

### day-25 chunks 0000–0089 — verified
90/90 contiguous, nothing at 0090+, 0 footer leaks, 0 fatal header forms, frontmatter valid,
ratio 1.475, no chunk under 0.9. **13 headers → 13 distinct slugs, no collisions.**
Resume seam 0029→0030 clean (`…I gather that this island` / `emerged near Hiera or Vulcania`).
Shape of the range: Bartholomew's dossier runs to 0061 (Lipari→Benevento translation, Orsini's
1698 bull with the anatomical inventory, the Rome-vs-Benevento controversy against Dini, the
relic-dispersal survey), then eleven shorter dossiers from 0061 on.

**day-25 anomalies the Bollandists do NOT flag:**
- **0061**: the reader is sent through Vaseo's *Chronicle* "from page 271 as far as page 183" — a
  DESCENDING page range. Left untouched.
- **0034**: Marius de Vipera dates the Beneventan translation **MXXXIX** (1039) while the whole
  surrounding argument, and the Bollandist's own conclusion, fix it at DCCCXXXIX (839). Quoted and
  passed over.
- **0059/0060**: the running tally of St. Bartholomew's **arms** across Lyons, Liège, Béthune,
  Canterbury, Carpineto, Cologne, Amalfi and Gercy exceeds two by a wide margin; the part-for-whole
  explanation is offered only in general terms and the specific count never reconciled.
- **0037/0041**: a council of twenty-three bishops "with whom we filled up the number of
  twenty-four", where neither the enumerated list nor the nineteen seals reconcile with either figure.
- **0080**: Castellan prints **"Victutus"** — a third variant beside Victor/Victurus — and the
  Bollandist, who discusses that confusion at length, never remarks on it.
- **0030**: paragraph [29] skipped entirely ([28] → unnumbered §III opening → [30]).
- **0084–0088**: "page 44 \*" with a bare asterisk, repeated four times, no annotation anywhere.
- **0077**: marker `[c]` in the Passion text where the annotation block runs a, b, an unmarked
  paragraph, then d. Bare marker left, nothing supplied.

### day-23 anomalies the Bollandists do NOT flag
- ⭐ **A cross-reference to a paragraph that does not exist**: the James of Bevagna Commentary jumps
  `[31]` → `[33]` with no `[32]`, and the editor at 0101 note q then CITES "num. 32". The error is
  inside their own apparatus, not their sources.
- **Callinicus's feast given three dates in one paragraph** (Aug 23, 24, 29 from the Vienna,
  Ambrosian and Chifflet witnesses); the compiler notes it "in passing", never reconciles it, and
  files him on the 23rd anyway.
- **Three incompatible council-lists for Flavius of Rouen** stand side by side: Ghini has him
  floruit 498 yet attending Orléans I–III (511/533/538); the compiler elsewhere argues II–IV; the
  Paris Martyrology also says II–IV.
- **Justinian II's mutilation**: Ambrosian says nose AND tongue, Vienna says nose only — and the
  annotation notes the Vienna text later has him speaking freely without drawing the conclusion.
- **0036 paragraph numbering prints [112] where [122] belongs** (sequence [121] → [112] → [123]).
- **Paragraph [227] skipped entirely** in the Philip Benizi Vita (0086 runs to [228]); and further
  gaps at [16]→[18] and [12]/[13].
- **0092 footnote marker `n`** appears inline where the annotation block runs a–e only; its
  definition never arrives in the source. Bare marker preserved, nothing supplied.
- **Two different men named Bartholomew** in the Bartholomew of Foresto dossier (0106 §5) — the
  Blessed, and "Brother Bartholomew the lay Brother of Salcio" who moved his bones. No note.
- **0090**: the body has the Florentines' relic-theft foiled by their wandering a field all night;
  note e has Peter the eighth General saying it was detected "by the outcries of the infants of
  Todi". Two incompatible mechanisms printed adjacently.
- **Three translations vs. four**: Altamura's eulogy counts "three translations within three
  hundred years"; 0098 §§38–39 enumerates four (1302, 1401, 1555, 1589).
- Sidonius's epitaph dated by Zeno's reign though he died under Gothic rule; Bucher's own dating
  internally inconsistent; Le Cointe's Flavius chronology silently contradicting his own 11th-c.
  source (500 vs. 529).

## ROUND C 2026-08-08 — day-28 sharded 3 (217 chunks, 3 Opus agents, 3 clean completions)
Running total **31 agents, 31 clean completions, zero self-throttle.**
Verified: 0 gaps, 0 extras, 0 footer leaks, 0 fatal header forms, frontmatter valid on all 217,
ratio 1.475, no chunk under 0.9. Both seams perfect (0072/0073 `…still in that error` / `I had
known to be held fast`; 0144/0145 `…of our certain knowledge, and also` / `of our own motion, by
Apostolic authority`). Token/time: 859K/80m, 806K/76m, 716K/76m.

### ✅ THE SAME-SAINT RULE WORKED ON ITS FIRST TEST, ON THE HARDEST CASE
Scan through the splitter's OWN functions: **47 header lines → 17 distinct slugs, ALL multi-part.**
Every saint's dossier merges to one page. Augustine spans SIX headers across chunks 0042–0186
(Commentarius, Acta priora, Possidius, Indiculus) and all six cut to "Augustine of Hippo"; Julian
of Brioude five → one; Vicinius, Moses, Pelagii, Salerno martyrs, Bibianus, Facundinus all likewise.
Zero splits, zero collisions, zero hand-fixes.
**Shard A self-corrected across the shard boundary**: it had written `ON ST. AURELIUS AUGUSTINE OF
HIPPO`, saw the 0073+ shard's `ON ST. AUGUSTINE OF HIPPO`, and changed its own to match. Telling
each agent the rule AND telling it to report headers verbatim is what makes cross-shard alignment
possible without a coordinator.
**Also caught by an agent, not by a check:** shard A recast a FATAL-shape subtitle
`ON MOUNT SCETIS IN LIBYA,` → `IN MOUNT SCETIS OF LIBYA,`. Second such catch in two rounds
(day-20's Filbert `ON the island of Hério`). This shape is common enough to be worth a standing
grep at month end: a line beginning `ON ` that is a PLACE, not a saint.

### ⭐ AN AGENT CAUGHT ITSELF MAKING A SILENT REPAIR
day-28/0095 (shard B): it had supplied an annotation's content (`[al. Bagai]`) at a bare `*`
marker, recognized this as exactly the inference rule 6 forbids, REVERTED to the bare marker, and
restored a second marker it had dropped — then reported all of it. Worth keeping as evidence the
convention is understood, not just obeyed.

### day-28 anomalies the Bollandists do NOT flag
Largest such list yet collected. Highlights:
- **A recurring 1-for-5 digit slip, three times**: [173] for [273], [687] for [587], [694] for
  [594]. A pattern, not three unrelated errors. Also `§ IL` for `§ XLIX`.
- **The Pavia relic dossier does not reconcile with itself**: 15 consultors chosen (margin says
  fifteen) but **17** voting unanimously at ¶796; **33** doctors subscribing at ¶781 vs **31** in
  the bull at ¶793; and the 1695 anatomist's "nothing besides is wanting" is falsified by the 1728
  finding of the missing Atlas, which the bull then says was at Ragusa all along.
- **One man under two names in one dossier**: the Barnabite advocate is *Michael de Collibus*
  (¶¶781–782) and *Michael de Turribus* (¶784, and again opening 0143).
- ⚠️ **FOR THE DUPLICATE SCANNER — the same texts are quoted twice with drift** and will score
  high without being duplicates: Jerome's letter at ¶290 and ¶596 (*plena/plene complemus*,
  *gladio/gladiis*); Darius's letter at ¶333 and ¶720; Marcellinus's killers *Heraclini* (¶456) vs
  *Heraclyanæ* (¶595). Add to the expected-false-positive list below.
- **A spurious letter with an unnoticed tell** (0196): a letter of "Augustine, servant of the
  servants of God" — *servus servorum Dei* is GREGORIAN, two centuries late. Mabillon calls the
  letter spurious on style; nobody names this, and it is the sharpest evidence against it.
- **The annotator's own anachronism** (0205 note f): Facundinus follows doctrine "approved in the
  sacred Council of Nicaea", which the Bollandist glosses as **Nicaea II, 787** — impossible beside
  Athanasius, Ambrose, Jerome, Augustine. The error is the editor's, not the biographer's.
- **0208 [50]** fuses "Justinian and Justin **and Charlemagne and Louis**" into one clause.
- **0216 [8]**: sons' murder dated 901 while the same annal has their supposed aunt dying 783.
- Ps.-Oldradus sums to 709 by one route and 710 by another; the Bollandists attack a component and
  never notice the total. Bishops exiled by Trasamund given as 120/220/225/230 in ONE passage.
- Moses the Ethiopian's disciples: Latin **75**, editor's own note says the Greek reads **70**, and
  the Greek Vita printed later also says 70. All three left standing.
- Chronotaxis letter-number collisions (Ep. 172 and Ep. 170 both "now 51"; Ep. 217 and Ep. 238 both
  "now 69"), plus a straight dittography in the list.
- Seven spellings of the Lombard king (Luitprandus/Luithprandus/Leutprandus/Liudbrandus/
  Liuthbrandus/Leuthbrandus/Lytprandus); ~20 scribal corruptions preserved, not repaired.
- Long paragraph-numbering gaps through the Augustine commentary ([45]→[47], [56]→[58], [111]→[113]
  and a dozen more), all preserved verbatim.
- Possidius's *Indiculus* (0186–0196) uses DOUBLED-letter markers `aa`–`sss` that depart from strict
  alphabetical order; printed POSITION preserved, per the day-20 `[h]`/`[g]` rule.

## ROUND B 2026-08-08 — day-20 sharded 3 (233 chunks, 3 Opus agents, 3 clean completions)
Running total **28 agents, 28 clean completions, zero self-throttle.**
FIRST THREE-WAY SHARD. Verified: 0 gaps, 0 extras, 0 footer leaks, 0 fatal header forms,
frontmatter valid on all 233, ratio 1.475, no chunk under 0.9. **BOTH seams clean** — 0077→0078
and 0155→0156, the second confirmed against the Latin (`…fugiendum arbitrabantur.` /
`Quasi enim per aliam viam…`). Token/time: 897K/82m, 890K/82m, 839K/78m.
Three-way sharding works: tell each agent BOTH neighbouring ranges by number, not just one.

### ⚠️⚠️ NEW DEFECT CLASS — SAME SAINT SPLITTING INTO TWO PAGES (not a collision)
Two agents independently flagged a predicted "Bernard collision." Both were wrong about the
mechanism, and the real problem was the OPPOSITE and worse. Traced through the actual
`extractSaintName`:
  `ON ST. BERNARD OF CLAIRVAUX, CONFESSOR,`            (0054) → slug "Bernard of Clairvaux"
  `ON ST. BERNARD, FIRST ABBOT OF CLAIRVAUX, …`        (0148) → slug **"Bernard"**
  `ON ST. BERNARD OF CANDELEDA, CISTERCIAN MONK…`      (0216) → slug "Bernard of Candeleda"
Three DISTINCT slugs — nothing collides. But 0054 and 0148 are THE SAME SAINT (Commentarius
prævius and Vita), so they would have built as TWO SEPARATE PAGES instead of one dossier with two
parts. The epithet sat AFTER the comma, where the cut discards it.
**FIXED** by moving it before: 0148 now reads `ON ST. BERNARD OF CLAIRVAUX, FIRST ABBOT, …`.
Verified against the real function: both now yield "Bernard of Clairvaux" and merge; Candeleda
unaffected. Whole-day scan: 22 headers → 21 distinct slugs, the one multi being the intended merge.
**LESSON — the collision clause is only half the rule.** Add to future prompts: *the pre-comma text
must be the SAME for every header belonging to the same saint, and DIFFERENT for every header
belonging to a different saint.* Agents check the second half and miss the first.
**Also: verify header slugs by EVALUATING `extractSaintName`, not by grepping the pre-comma text.**
A grep scan shows three different strings and reports "no collision" — which is true and useless.

### ⚠️ ONE CONVENTION QUESTION FOR WILSON (day-20/0090, not urgent)
The Latin prints `irregressibi` — a truncated WORD, not a numeral. The agent rendered the evident
sense ("irreversible") and flagged it, since rule 6 as written governs numerals and lost citations.
Decide whether `[ ]` extends to garbled words. Recommendation: leave it — the sense is unambiguous
and `[ ]` would lose real content — but the rule should say so explicitly either way.

### day-20 anomalies the Bollandists do NOT flag (the new reporting split is paying off)
- 0015: the Greek Acts of Severus and Memnon date the beheading to the **14th** of May; the facing
  Latin column the Bollandists print reads the **24th**. Latin translated as printed.
- 0032: footnote markers out of alphabetical order in the print — `[h]` precedes `[g]` in Bede's
  Acts of Oswin. Printed ORDER preserved; position governs, not the alphabet.
- 0098: the loaded-dice miracle is arithmetically impossible as printed (a throw of eighteen; two
  dice showing twelve; the third splitting to show six and five). Caesarius and Manrique both pass
  it without comment.
- 0215/0216: three miracle tallies that do not reconcile — the compiler counts 676, Ignatius
  Firminus 1,170, and Firminus's own components sum to 910. No editor comment anywhere.
- 0195: Eberhard says "thirty-six miracles" then lists 41 — he explains it himself.
- 0086: running-head names "Robert of Angoulême" where the body says **Gerard** throughout.
- 0079, 0137, 0118 (`Spitam` for *Spiram*), 0222 (`Dan. 1 v. 34` for Dan. 2:31–35, rendered
  `Daniel 1 [ ], verse 34` — NOT silently corrected).
- Missing paragraph numerals in the source's own sequence: [186] [214] [234] [242] [274] [583]
  [590] [606] absent; [335] printed where [535] is meant (0126); [42]→[44] and [342]→[348] in the
  Vita Prima. All preserved, nothing renumbered.
- 0216: scribal dittography in the LATIN (`carnem propinquus; sed ob multa sua flagitia` twice).
  Translated once; the doubling recorded here rather than reproduced.
- 0117: four `?` corrupt glyphs destroy a Spanish verse-diagram's bracketing on La Espina; the
  layout is unrecoverable from the scrape, rendered `[ ]` rather than guessed.
- 0011: a genuine hole in the Acts of St. Amator — "led them by his angel as far as [f] …", place
  name absent, and the Bollandists' note f says something seems missing.
- **Defect avoided:** St. Filibert's subtitle arrived as `ON the island of Hério` — a subtitle
  opening with `ON` is the exact shape that produces false splits. Agent recast it to
  `IN THE ISLAND OF HÉRIO IN GAUL,`. Watch for this shape in the remaining days.
- day-20 is ~2/3 one saint: chunks ~0054–0215 = St. Bernard of Clairvaux. Expect one very large
  Bernard page at build, same shape as day-07 Cajetan, day-18 Helena, day-26 Rose. NOT a mega-merge.

## ROUND A 2026-08-08 — day-21 whole + day-26 sharded 2 (205 chunks, 3 Opus agents, 3 clean completions)
Running total **25 agents, 25 clean completions, zero self-throttle.**
Verified both days: 0 gaps, 0 extras, 0 footer leaks, 0 fatal header forms, 0 same-day collisions,
frontmatter valid on all 205. day-21 ratio 1.483 / day-26 ratio 1.521; per-chunk sweep found no
chunk under 0.9 in either day. Token/time: 612K/54m, 899K/83m, 882K/84m.

**SECOND CLEAN SHARDED SEAM.** day-26 met at 0077→0078 mid-sentence with no recap and no gap
(0077 ends "…[extended] the cult", 0078 opens "of the same blessed Virgin still further"). The
three seam rules from day-18 are now proven twice — keep reusing them verbatim.

**THE COLLISION CLAUSE IS EARNING ITS KEEP.** day-26 alone needed SIX name disambiguations in one
day (two Alexanders → of Brescia / of Bergamo; two Felixes; two Victors; two Johns → of Caramola /
Bassand; two Liberatuses; plus a Theodore distinguished from Aug 27's). day-21 needed one (Bernard
of Alzira vs. Bl. Bernard Ptolomei). All handled unprompted, zero hand-fixes needed — vs. 4 hand-fixes
two rounds ago. KEEP THE CLAUSE.

**NEW PROMPT CLAUSES ADDED THIS ROUND (keep for 25/28/23):**
1. "If your shard contains NO saint header at all, that is possible and fine — say so explicitly."
   day-26's second shard was 77 straight chunks of one Rose of Lima dossier with zero headers, and
   said so, which is what kept the collision scan from reading it as lost headers.
2. Group headers whose names cannot survive the pre-comma cut get FLAGGED, not contorted. day-26
   joined two with "AND" instead of serial commas so more names survive; four others
   (`Justus…`, `Simplicius…`, `Poeclanus…`, `Januarius…`) cut to the first name only and were
   reported. Do NOT change the comma cut to fix this — it is load-bearing corpus-wide.

### ⚠️ ONE ANOMALY THE BOLLANDISTS DO **NOT** FLAG (ours to have caught)
aug/day-26/0064 — Chifflet on St-Paul de Besançon: "in the year MCXXXII Innocent IV forbade, by a
diploma given at Cluny…" Innocent IV reigned 1243–54, a century off. Every other contradiction in
the day carries the Bollandists' own note; this one does not. Left as printed, recorded here.
Prompt from Round B onward asks agents to say WHICH contradictions the Bollandists flag themselves
and which they do not — that distinction is worth having corpus-wide.

### Other day-21/26 notes for the eventual audit
- day-26/0041: annotation `dd` had lost BOTH its letter label and its column number; agent supplied
  the label from an unambiguous a–z sequence and marked the number `[ ]`, and REPORTED it. Same
  judgment class as day-06/0011 and day-10/0019. Not a silent repair.
- day-26/0039–0040: four `[ ]` inside Eadmer's Life of Bregwin are the LATIN's own lacunae — the
  Bollandists footnote them as faded in their exemplar. Source damage, not scrape damage.
- day-26/0154: ~25 bare `✠` marks with no name — the cardinals' subscriptions to Rose's
  canonization bull, names lost in the scrape. Reproduced as bare crosses, not filled in.
- day-26/0143: source's own numbering jumps [152]/[153] → [221] in the miracle list.
- day-21: 8 `[ ]`, all bare `Col.` citations (Gallia Christiana, Labbe, Hardouin, Ruinart,
  Ughelli ×2, Venetian Italia sacra — where one column number survived and the other did not).
- day-26 is ~half one saint: chunks ~0074–0154 = St. Rose of Lima. Expect one very large Rose page
  at build, same shape as day-07 Cajetan and day-18 Helena. NOT the mega-merge defect.
- EXPECTED scanner false positives, add to the list below: aug/day-26/0026–0027 (Adrian Martyrium,
  Greek + facing Latin) and the Menæa verse couplets at 0027/0029.

## ROUNDS 2026-08-07 — TWO ROUNDS, days 24/27/31 then 18/30 (414 chunks, 6 Opus agents, 6 clean completions)
Running total **22 agents, 22 clean completions, zero self-throttle.**
Round A (whole-day ownership): 24=71, 27=81, 31=95. Round B: 18 sharded 0000–0052 / 0053–0105, 30=61.
Verified all five days: 0 gaps, 0 extras, 0 footer leaks, 0 fatal header forms, frontmatter valid on
all 414. EN:Latin 1.460–1.488 (corpus norm ~1.46). Per-CHUNK truncation sweep added this round —
every one of the 414 chunks scored >0.9 EN:LA, so no short tail hiding inside a normal day average.
Token/time: 816K/77m, 934K/89m, 114K/99m(!), 632K/56m, 615K/55m, 694K/61m.

**FIRST SHARDED DAY SINCE THE METHOD WAS PINNED — the seam was PERFECT.** day-18's two agents met
mid-sentence with no recap and no gap (0052 ends "…and to this day behind", 0053 opens "placed in the
Constantinian apse"). What made it work, KEEP ALL THREE: (1) explicit inclusive ranges in both prompts;
(2) each agent told the other's range by number and forbidden to write there; (3) the second agent told
in so many words NOT to open its first chunk by recapping the previous one. Neither agent wrote a file
outside its range. Reuse this verbatim for 25/20/28/26/23.

⚠️ **TELEMETRY ARTIFACT CONFIRMED A SECOND TIME.** day-31 reported 114K tokens for 95 chunks where its
siblings reported 616–934K for fewer. Ratio 1.471, all 95 files pass per-chunk length check. Same as
day-16's 109K/90 last round. This is now a KNOWN reporting artifact — do not read a low token count as
truncation, and do not relaunch on it. (Cf. [[feedback_haiku-agent-telemetry-gate]].)

### ONE REAL COLLISION, hand-fixed (first since the header clause was added)
day-30 had TWO different Agiluses on the same day: `ON BL. AGILUS, VISCOUNT AND CONFESSOR` (0012) and
`ON ST. AGILUS, FIRST ABBOT OF REBAIS` (0014). Both cut at the first comma to "Agilus" → same slug.
FIXED by moving the distinguishing words BEFORE the comma:
  0012 → `ON BL. AGILUS THE VISCOUNT, CONFESSOR,`     (slug "Agilus the Viscount")
  0014 → `ON ST. AGILUS OF REBAIS, FIRST ABBOT,`      (slug "Agilus of Rebais")
Lesson for the prompt: the current clause says keep the NAMES before the comma, which agents now do
reliably — but two saints can SHARE a name, and then the name alone is not enough. Next round add:
"if two entries in the same day share a saint's name, the pre-comma text must also carry the
distinguishing epithet (of X / the Y)." Neither day-30 agent could have known — it wrote both headers
correctly in isolation. **This is a per-day check, not a per-agent one — always run the collision scan
across the WHOLE day after a shard set lands.**

### ⚠️ OPEN FOR WILSON — one guessed numeral, not yet resolved
day-24's agent rendered `tomo 11 Januarii` / `tomo 11 Aprilis` as "volume II", reasoning that January
has no volume 11. Plausible, but it is an INFERENCE, not the `[ ]` convention. It REPORTED it rather
than doing it silently. Round B's prompt was tightened accordingly ("if tempted to correct a garbled
numeral to what it probably was, DON'T — use `[ ]` and report it") and no round-B agent guessed.
Decide before the month is built: leave "volume II", or convert to `volume [ ]`. Affected: day-24 only.

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

### GOTCHA when tallying August (bit me 2026-08-07)
Days 01–15 and 22 each contain a `saints/` SUBDIRECTORY, left by the 2026-08-02 partial split. A bare
`ls day-NN | wc -l` therefore reports +1 for each of those 16 days and looks like 16 stray files.
Count `day-NN/*.md`, not `day-NN`. True count 2026-08-07: **1,699 .md chunks across 25 days.**

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
- aug/day-27/0014-0016 (NEW 2026-08-07) — Laurence of Rossano's Vita of St. Pœmen: 0014 and the
  first ~2/3 of 0015 are pure GREEK with no facing Latin; the Latin of the same Vita starts at
  line ~1175 of 0015 and runs into 0016. So the Vita is present once as Greek, once as English.
- aug/day-18/0001-0002 (NEW 2026-08-07) — Martyrium of Florus and Laurus, same pattern: Greek
  first, facing Latin only in 0002. Greek preserved (reflowed from a one-word-per-line scrape),
  Latin column translated. Once in Greek, once in English — not a duplicate translation.

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
- aug/day-18 is 62% one saint: chunks 0016-0081 = St. Helena, empress and mother of Constantine.
  Same shape as day-07; expect one very large Helena page at build. NOT the mega-merge defect.
- aug/day-30/0040 — the Bollandist himself notes a Fiacre miracle may be the same one told twice
  (cf. his number 43). A duplicate in the LATIN, retained as printed.
- aug/day-24/0000 — the day's saint-list header is misprinted `IX Kal. AUGUSTI` (= 24 July) where
  24 August needs `IX Kal. SEPTEMBRIS`. Every dossier body has it right. Translated literally.
- aug/day-27/0039 — paragraph number printed `[007A]` where `[25]` belongs (between [24] and [26]).
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
