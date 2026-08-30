# Round F — agent findings, banked as they land

⚠️ **Why this file exists.** The day-29 parent agent was killed by a content-filter error while its
children were still running. Normally the parent aggregates its children's anomaly reports; with it
dead, each child's report arrives with nobody to collect it. **These are banked verbatim as they
land so nothing is lost to a second kill or a context compaction.**

Destination once September is complete: the NOT-flagged lists belong in `CORPUS-DEFECTS.md` —
they are what the corpus has no other record of.

---

## sep day-29, chunks 0013–0026 (Michael dossier, Papebroch's *Commentarius* §§ VIII–XII, XIV)

Landed 2026-08-30. 14 files, verified in range, one chunk per turn. No saint header in range —
correct, the Michael `DE` header is at 0000 far upstream, and the agent explicitly did NOT
manufacture one. **Zero occurrences of the mandated header in range; nothing to reprint.**

⭐ The only ALL-CAPS line emitted is `BY SISINNIUS AS AUTHOR` (0025, from Latin `AUNCTORE
SISINNIO`) — deliberately not shaped as `ON …` so the splitter cannot read it as a header. Correct
handling; this is the shape that has caused false splits elsewhere.

⚠️ **0025 and 0026 are ~21 KB against a ~12 KB mean, and that is Greek passthrough, not
read-batching.** 0025 has ~14 Latin lines then the Greek Sisinnius Sermon; 0026 is 100% Greek, no
Latin at all. Convention 3, reproduced byte-for-byte (copied programmatically, not retyped).
**Note for the ratio sweep: this is the INVERSE of the day-11 false positive** — there,
line-fragmented Greek made ratios collapse below 0.9; here, Greek passthrough pushes them far above
the mean. Greek moves the byte ratio in BOTH directions and neither is a defect.

### `[ ]` lacunae emitted (4 + 1)
- 0021 — `who is borne in their hands [ ]` ← Latin `qui illis portatur in manibus l`, a stray `l`
  where the printed exclamation point stood.
- 0023 — `in Labbe volume 6, column [ ]` ← `apud Labbeum tom. 6 Col.figitur`, column lost to scrape.
- 0023 — `Cosmas is read at column [ ]` ← `Col.egitur subscriptus`, same defect.
- 0024 — `in Labbe volume 1, column [ ]` ← `apud Labbeum tom. 1 Col.ta habet`, same defect.
- 0022 — marginal note `[++ bellis,]` → `[[ ] in wars,]`, `++` scrape artifact where a word stood.

⚠️ These four `column [ ]` are **prose citations of Labbe's columns — NOT the `[Col. NNN]` inline
corpus marker.** Different thing; do not confuse them. No `[Col. NNN]` markers occur in this range.

### Bollandist-FLAGGED (Papebroch names the problem himself)
- 0017 — divergent Greek of Chrysostom: Montfaucon's `ὁι ἅγιοι ἐκεῖ πάντες` vs Morellian
  `ὁι ἅγιοι, ἢ καὶ πάντες`; he argues the printed `ἐκεῖ` is redundant.
- 0019 — Deut. 32:8 reads `Angelorum Dei` in the LXX but `filiorum Israël` in the Vulgate; he notes
  Jerome knew this and used the LXX anyway.
- 0021/0023 — corrects the common reading of Basil (the Angel does NOT depart for sin); flags the
  Lycus' natural chasm as probably the real source of the "miracle", declaring it "corruptly
  related" in every witness.
- 0024 — the Sisinnius attribution is untenable and the Archippus attribution fictitious;
  `Ψόνων` is a corruption for `Χώνων`.

### ⭐ NOT flagged — the valuable list
- **0013 — `Luc. 27 ℣ 22`** for the Lazarus / Abraham's-bosom text. **Luke has only 24 chapters**,
  and the same verse is cited correctly as `Luc. 16 ℣ 22` later in 0022. Left exactly as printed.
- **0013 — `1 Thessal. 4 ℣ 15`** for what is v. 16 in the Vulgate. Left as printed.
- **0013 — doubled conjunction** in the same quotation: `in jussu, & & in voce Archangeli`.
- **Paragraph numbers silently ABSENT** at the first paragraph of five sections: `[118]` (§ VIII,
  0015) · `[133]` (§ IX, 0016) · `[153]` (§ X, 0019) · `[164]` (§ XI, 0020) · `[185]` (§ XII, 0023).
  Each such paragraph opens with only its marginal note. **A five-fold repeating pattern, not five
  independent slips** — worth checking whether it holds across the whole corpus.
- **0018 — repeated `[144]` where `[149]` belongs**: the run goes `[147] [148] [144] [150]`, and the
  genuine `[144]` sits a few paragraphs earlier in the same chunk. Both preserved as printed.
- **Section numbering skips `§ XIII`** — 0023 is § XII, 0025 opens § XIV. No § XIII in range.
- **0024 — Theodoret cited `Interrog. 4 / Interrog. 3` on Genesis in reversed order.**

### Scrape-level character corruptions — translated for sense, reported not bracketed
Agent's stated criterion: the word is fully determined by grammar and **none is a numeral, name,
date or fact.** `immens+`→*immensa* (0014) · `Virtates`→*Virtutes*, `siunt`→*fiunt* (0015) ·
`culibet`→*cuilibet*, `castodes`→*custodes*, `imfectionem`→*imperfectionem* (0018) ·
`S. Angustinus`→*Augustinus* (0019) · `scritis`→*scriptis* (0017) · `offere`→*offerre*,
`Domininum`→*Dominum* (0021) · `stuvium`→*fluvium*, `poslemus`→*possemus*, dittography
`Iidem dem creduntur` (0022) · `AUNCTORE`→*AUCTORE* (0025).

⬜ **FOR WILSON — this is a judgement call convention 7 does not squarely cover.** Convention 7 says
never silently repair the source: write `[ ]` and report. The agent instead silently corrected ~14
OCR-level character corruptions and reported them in a list, on the reasoning that a scrape typo in
a common word is not a source variant. That is defensible and probably right — bracketing
`Virtates` would be absurd — but **it is a rule the frozen prompt does not state**, and other agents
are deciding it independently and invisibly. ⭐ Worth writing into `PROMPT-sep.md` explicitly:
*scrape-level character corruption in a word fully determined by grammar → correct silently and
list it; anything that is a numeral, name, date, place or fact → `[ ]` and report.*

---

## sep day-29, chunks 0027–0052 (Michael dossier, §§ through XXV — Garganus, Tumba, Mont-St-Michel)

Landed 2026-08-30. 26 files, verified in range, one chunk per turn. Byte sizes 11,913–13,370
(mean ≈12,638) — a tight band, **no fat/thin pair, so no read-batching.** Good self-check.

**No saint header in range; mandated Michael string occurs ZERO times — correct.** The Latin carries
no `DE …` article header anywhere in 0027–0052; the dossier opened at 0000 and runs unbroken.
Agent did not manufacture one.

⭐ **Three header-adjacent traps handled correctly — worth reusing as precedent:**
- `APPARITIO S. MICHAELIS IN MONTE GARGANO` (0037) → `THE APPARITION OF ST. MICHAEL ON MOUNT
  GARGANUS`. ALL-CAPS **document title inside a dossier**, not a saint header; does not begin `ON `.
- `APPARITIO` (0047) with subtitle `In monte Tumba` → rendered **`At Mount Tumba`, NOT "On Mount
  Tumba"** — the never-begin-a-subtitle-with-`ON ` rule, applied unprompted.
- 0032 quotes a chapter title `De S. Michaële archangelo prope S. Julianum` from the *Antiquitates
  Constantinopolitanae* → rendered inline in sentence case, **not promoted to a header.** This is
  the `DE …` shape appearing as QUOTED MATTER rather than as an article header — a fourth thing the
  `^DE [A-Z]` grep would catch that a reader must reject.

### `[ ]` lacunae emitted (6 across 5 chunks)
0030 "but seventy [ ] on foot" (`septuaginta vero .. pedibus`, word dropped) · 0032, 0034 ×2, 0035,
0039 — all scrape-lost Labbe/Ughelli **column numbers** (`Col.ic leguntur`, `a Col.sque ad 1370`,
`Col.eaque de causa`, `Col.in Sipontinis`, `Col.sserit`). **No numeral guessed or repaired.**
Again: these are prose citations of columns, NOT the `[Col. NNN]` inline marker. No `[Col. NNN]`
markers in range; none deleted, none invented.

### Bollandist-FLAGGED (left standing, as convention 7 requires)
Interpolated chronology A.D. 506 / Indiction 14 / Zeno + Gelasius, self-contradictory and the editor
says so (Zeno d. 491, Gelasius d. 496); Ughelli's rival 493 with Indiction 14 likewise (should be
Ind. 1) — 0033/0034 · Gelasius wrongly joined with Sabinus of Canosa; Barletta/Garganus dedication
bishop-lists called interpolated (0035) · Mount Garganus named from "a man Garganus" flagged as
fabulous, the name predating Christ (0035/0038) · "bounds of Campania" geographically wrong, it is
Apulia, flagged but retained as the author's reading (0038a) · Siponto–Benevento "150 miles"/"750"
flagged corrupt, editor prefers 50 or 57 (0038p) · Soracte's distance given as 50th/500th/1st/30th
mile, all called copyists' corruption (0038u) · *Serapti/Sirapti/Syrapti/Sarepti* for *Soracte*
(0038x) · *Apodanea* corrupt (0038s) · Archippus's 60 vs 70 years, the 5,000-man mob, the
river-diversion, all called exaggerated or incredible (0029 i,l,m,n) · Baronius's *circuli* for
*circi* rejected, and the St. Michael in Saxia inscription (Charles for Louis, Leo IV for Leo III)
"too openly faulty to be defended" (0044/0045) · Bernard the monk's parting sea, Mabillon's
"suspect, not to say fabulous" (0046/0048k) · Valesius's *maresci primi* etymology demolished;
Robert of Torigni's "Richard II introduced the monastic order" certainly false for Mont-St-Michel
(0050) · the editor flags that Acts §9 does not cohere with §7 on when the envoys were sent (0049aa).

### ⭐ NOT flagged — the valuable list
1. **0041 — broken paragraph number: `[195]` printed between `[294]` and `[296]`** (for `[295]`).
2. **0051 — `[352]` printed TWICE in succession** (Mabillon on the mount, then on the town);
   sequence then resumes at `[353]`.
3. **0041 — bad internal cross-reference:** cites the archbishop's Sunday exhortation as "num. 187";
   the passage is num. **287**, given three paragraphs earlier in the same section.
4. **0044 — impossible chapter citation:** Baronius quoted citing Gregory, *Dialogues* bk 4,
   **chapter 368**. Book 4 has nothing near 368 chapters.
5. **0035 — split date:** Charles VIII's capture of Naples as "the year from Christ's birth
   CCCCXCIIII (above a thousand)" — the *millesimum* sits in a parenthesis outside the numeral.
6. **0028 — stray character in a marginal rubric:** `[Pius Archippi obitus+]`, `+` carried through;
   probably a mangled dagger/cross glyph.
7. **0036 — dittography:** `non est dubitandum est est de ipsa apparitione`.
8. **0049 — two more dittographies:** `Digna erant miracula miracula!` and `an illa ecclesia illa
   ecclesia initio non fuerit monachorum` (the second carried into the English as printed).
9. **OCR-level word damage:** `pofuit` for *posuit* (0031) · `ab varias rationes` for *ob varias*
   (0043) · `strophæ` (0040) where the sense wants something like *strage* — ⭐ **the agent rendered
   "of the turn of events" rather than guess**, i.e. it did NOT silently repair a word that was not
   fully determined. That is the right side of the line proposed in the previous entry.
10. **⚠️ Asterisk apparatus is UNMATCHED ACROSS CHUNK BOUNDARIES.** 0038 ends with 18 free-standing
    `* al. …` variant lines whose in-text asterisks are spread across 0037–0038; 0031 carries an
    in-text `*` (`Angelicarum potestatum Primatis *`) whose note (`* Michaelis`) does not arrive
    until **0033**. Both halves preserved in position, unresolved. **This is a genuine structural
    problem for the splitter and the site: an apparatus marker and its note can land on different
    pages.** ⬜ Nobody has ruled on it.
11. **Skipped/doubled footnote letters are normal:** Garganus Acts run a–z with `j`, `v`, `w` absent
    (0037–0038); Tumba Acts run a–x then jump to `aa, bb … hh` (0047–0049). Printed order preserved.

### Greek
Left in Greek throughout (0027 doxology; 0029–0032, 0042). Where the Bollandists print their own
facing Latin, **that Latin WAS translated** — so the Synaxary line appears once in Greek and once in
English by design, per convention 3. Not a duplicate.

---

## sep day-29, chunks 0106–0159 (tail of the day: Leodowinus → Nicholas of Forca Palena)

Landed 2026-08-30. 54 files, verified in range, one chunk per turn. Bytes 11,659–13,938 except 0159
(1,442, matching its 1,603-byte Latin) — no fat/thin pair, no read-batching.

### ✅ FOUR SAINT HEADERS, AND THEY MATCH THE MANDATED DERIVATIONS
Emitted verbatim — compare against the strings added to `PROMPT-sep.md` this session:
```
0111  ON BL. ALARIC, OR ADALRIC, OF THE ORDER OF ST. BENEDICT,
0114  ON ST. GRIMOALD, PRIEST AND CONFESSOR,
0115  ON BL. JOHN OF MONTMIRAIL, OF THE CISTERCIAN ORDER,
0145  ON BL. NICHOLAS OF FORCA PALENA, OF THE ORDER OF THE HERMITS OF ST. JEROME OF THE
      CONGREGATION OF BL. PETER OF PISA,
```
⭐ **0145 is the "role leaked past the comma" trap, handled correctly** — display name cuts to
"Nicholas of Forca Palena"; the enormous office all falls after the comma and is discarded by the
splitter. This was the class that put four wrong display names on the LIVE site.
Subtitles all recast away from the `ON ` shape: `IN UFNAU, AN ISLAND OF THE LAKE OF ZURICH…`,
`AT PONTECORVO…`, `IN THE MONASTERY OF LONGPONT…`, `AT ROME.`
**Five Bollandist running index heads** (Leodowinus ×2, John of Montmirail, Nicholas of Forca,
Alaric) rendered in sentence case with `(S.)`/`(B.)` and `BHL Number` intact — never promoted.
**The rewritten prompt clause is holding across every Round-F agent.**

### ✅ GERMAN SCRAPE FURNITURE STRIPPED FROM 0159 — the day's last chunk, where the rule is tested
Deleted: `September VIII: 30. September`, `Heiligenlexikon`, `als USB-Stick oder als DVD`,
`Unterstützung für das Ökumenische Heiligenlexikon`, `Seite zum Ausdruck optimiert`,
`Unser Reise-Blog:` + its two-line blurb, `Empfehlung an Freunde senden`,
`Artikel kommentieren / Fehler melden`, `Fragen? - unsere FAQs antworten!`,
`Im Heiligenlexikon suchen`, `Impressum - Datenschutzerklärung`. Grep across all 54 files confirms
no furniture string survives. The `[Annotata]` marginal `* imo antea` was correctly KEPT.

### `[ ]` lacunae (7), all lost column/day numerals, none inferred
0129 · 0143 ×2 · 0145 (Latin reads `Col.em>`, **an HTML-tag fragment**) · 0147 · 0148 (Latin
`Col.x`, the `x` being the stranded head of `ex auditore`) · 0158 (`die a Maii`, day numeral lost).
No `[Col. NNN]` markers in range.

### Bollandist-FLAGGED
0106 `Hildericus`/`Childericus` impossible against Childebert's reign (editor orders the
substitution; text left as printed) · 0109 Mettlach charter's regnal year 12 Childebert vs A.D. 696
cannot both stand · 0129/0130 Galcher's 1200 for John of Montmirail's death corrected to 1217, with
Manrique's cascade of error from it · 0143/0144 Manrique's supplements of unproven credit, the
Gunther-buried-alive miracle called a fable · 0150 eighth Indiction with May 1446 flagged, ninth
required · 0153 "18 March 1647" flagged in-line as `(this year seems faulty)`, plus a 12 May / 28
May clash for the 1712 exhumation · 0158 **29 February 1746 flagged — 1746 was not a leap year** ·
0159 `10 January. Here the year is wanting.` · editor-declared omissions at 0143g, 0153, 0109f.

### ⭐ NOT flagged — the valuable list
1. **0143 — the annotation letters SKIP `g`**: notes run a, b, c, d, e, f, **h**, i, k, l, m, n, o,
   p, q. No `g` note exists though the sequence demands one. Unremarked anywhere.
2. **0117 — `in col.\nle ad Morinum Majorem fluvium`**: `colle` split across the scrape's line break,
   leaving a **false `col.` abbreviation**. Rendered "on a hill", not bracketed — scrape artifact,
   not a Bollandist lacuna. ⚠️ Note how close this is to the real lost-column defect; the two are
   distinguishable only by reading the sentence.
3. **0134, 0157 — mojibake `���`** on three signature lines; dropped as encoding corruption.
4. **0157 — `autam vitalem` for `auram vitalem`**, translated "drew the breath of life" without a
   bracket, the corruption being orthographic not numeric. (Same line as the previous shards.)
5. ⭐ **0121 — the Bollandist contradicts his own printed charters and never notices.** The
   biographer puts Bl. John's hospice "at Montmirail, his own castle"; the charters the Bollandist
   himself prints put it *below* the hill on the Chaussée. He argues against Machaut over the point
   but never registers that his own printed Life disagrees with his own printed charters.
6. ⭐ **0138 — an unremarked contradiction inside one dossier.** The blind man calls John *judex
   æquissimus* for tearing out his eyes, and the Bollandist defends the justice of the penalty
   (annotation *g*) — without remarking that the biographer has the same John begging the man's
   pardon on his knees in the next paragraph.
7. **0154/0156 — the Palena election of 1638** is granted by the *capitular* vicar Tabassius (sede
   vacante), yet bishop Corsignani in 1745 attributes the faculty to "my predecessor bishop."
8. **0156 — the 1741 Sulmona depositions** of Campana and Galassi describe the 1647 translation as
   eyewitnesses; the Bollandist notes the 94-year gap but stops short of the conclusion.

### Name collisions resolved WITHOUT touching the headers
Three Galcher/Galther/Walther of Montmirail (grandfather's brother the Cistercian; the infant
nephew; abbot Galcher of Longpont) — distinguished **by apposition in the prose, never by header**.
Two Hughs at Longpont, with the Bollandist's own doubling argument preserved. Two Johns of
Montmirail (the Blessed and his firstborn). Two Nicholases (of Forca, and Pope Nicholas V).
Marie de Goigneliu appears twice with the biographer's own inconsistency — **the editor's doubt
preserved rather than harmonized**, which is the right call under convention 7.

---

## sep day-29, chunks 0053–0105 (Michael's tail, then Fulgentius → Leodowinus)

Landed 2026-08-30. 53 files, verified in range, one chunk per turn. Bytes 11.5K–17.6K, no fat/thin
pairing.

### ✅ EIGHT HEADERS — AND THE THREE COLON-FORM RECASTS ARE SOURCED, NOT INVENTED
```
0077  ON ST. FULGENTIUS, BISHOP AND CONFESSOR,
0078  ON THE HOLY MARTYRS OF THRACE: EUTICUS OR EUTYCHIUS AND PLAUTUS AND PERHAPS HERACLEA AND
      PLACIDUS AND AMBUTUS AND TRACIA AND DONATA, MARTYRS,
0079  ON THE HOLY ROMAN MARTYRS: PERHAPS SALUTARIUS AND POSSESSUS AND JANUARIUS AND AMPLUS AND
      CELEDONUS AND JUSTINUS, AND SOME SOLDIERS, MARTYRS,
0079  ON THE HOLY MARTYRS OF PERSIA: DADAS AND GOBDELAAS AND CASDIA OR CASDOA AND PERHAPS
      GUDELIA, MARTYRS,
0084  ON ST. FRATERNUS, BISHOP OF AUXERRE,
0086  ON ST. URSIO, CONFESSOR, PERHAPS A MONK,
0088  ON ST. CYRIACUS, ABBOT AND CONFESSOR,
0098  ON ST. LEODOWINUS, OR LUTWINUS, ARCHBISHOP OF TRIER,
```
Each collective comes from that dossier's **own Latin subtitle** — `IN THRACIA`, `ROMÆ`,
`IN PERSIDE` — exactly the discipline the day-10 Caesarea case established. All three were the
slug-length traps flagged before dispatch, and all three took the colon form.
**Michael header: zero occurrences in 0053–0076**, correctly, the dossier's Latin `DE` line being at
0000. Nine running index heads rendered in sentence case with `(S.)`/`(SS.)` and `BHL Number: 4955`
intact. Subtitles recast off the `ON ` shape throughout.

⚠️ **One subtlety to keep in view:** the Bollandists themselves question **whether Heraclea and
Tracia are martyrs or PLACE-NAMES** (0079). The 0078 header makes "Martyrs of Thrace" the collective
while `TRACIA` also stands in the roster as a person. The agent kept both and claimed neither — the
right call under the day-05 Romulus/Melitene precedent — but if the Bollandists' doubt is ever
resolved, this header is where it lands.

### `[ ]` lacunae — ONE only
0093 annotation u: printed `+eminem Christianorum a fuga impedivit` (evidently *neminem*, preceded
by a stray sign) → `he hindered [ ] of the Christians from flight`. Not silently repaired.
No `[Col. NNN]` markers in range.

### Bollandist-FLAGGED
Fulgentius's see-length 31 yrs vs 13 (Ughelli) vs 16 (Palumbo); the Catalogue's "year 102 … reign of
Domitian … second persecution … second year of Clement" declared impossible; Nicander/Daria
martyrdom (173 or 302) incompatible with his lifetime (0077–0078) · whether Heraclea/Tracia are
martyrs or place-names; Ambutus in Thrace in most codices, Rome in Reichenau (0079) · Gudelia
possibly = Gobdelaas, Casdoas possibly = Gargalus, Casdia "daughter" vs Baronius's "wife", plus
annotations a–r on improbable torments and a queen's burial contradicting the earlier burial
(0079–0083) · Cyriacus's Indiction 2 (→1), Indiction XIII (→XII), age 57 (→77) all corrected;
note m flags 5 years dropped from the recapitulation (0089–0091, 0098) · the "Adalbert of
Andernach" genealogy judged forged, the threefold episcopate and prolonged-day miracle judged
fabulous, the epitaph's `Archimandritæ` line at odds with the Acts (0100–0104).

### ⭐ NOT flagged — the valuable list
1. ⭐⭐ **THE PARAGRAPH-NUMBER GAP IS NOW CONFIRMED SYSTEMATIC.** Absent here: `[392] [406] [429]
   [441] [452] [466] [479] [500] [522] [535] [561] [574]` — **twelve**, and the agent states the
   rule outright: **every new `§` opens with an unnumbered paragraph.** This matches the five found
   independently in chunks 0013–0026 (`[118] [133] [153] [164] [185]`, each the first paragraph of
   §§ VIII–XII). **Two agents with no contact, same finding, 17 instances.** This is a typesetting
   convention of the edition, not a scrape loss and not a defect — but nothing in the corpus records
   it. ⬜ Worth a corpus-wide check and a line in the methodology page.
2. **0058 — `[316]` printed where `[416]` is required** (between 415 and 417). Preserved.
3. **0054 — `[482]` printed where `[382]` is required** (between 381 and 383). Preserved.
4. **0059 dittography:** `Regulam debebat componere; non ad monachos,` printed twice consecutively.
5. **0075 dittography:** `exiguum dissito. It tamen hydriis duabus onustus:` printed twice.
6. **0090 — `septem septem exegit annos`**, "seven seven" printed. Preserved as printed.
7. **0073 — a real chronological impossibility, unremarked:** Veronica of Binasco's Angelic bread
   said to begin `anno ab Natali Christiano MCDXIII` (1413) — impossible for a woman who died 1497
   and whose three-year terminus is stated **in the same sentence.**
8. ⭐ **0077 — a flagged discrepancy sitting beside an unflagged one.** Florius gives Fulgentius's
   tenure as 31 yrs 7 mo **22 days**; Chronicle and Catalogue both give **28 days**. The Bollandists
   argue the 31-vs-13-years discrepancy at length and **never mention the 22/28.**
9. **0079 — the Persian index block prints `Gudelia M. in Perside (S.`** — closing parenthesis
   missing. Preserved as printed.
10. **0079 — the Roman index block lists six lines but OMITS Justinus**, who stands in both the
    header and the text.
11. **0080 — a footnote marker embedded INSIDE the Greek column:** `ἀπὸ τὰς χεῖρας i τῶν`. The
    stray `i` is addressed by annotation i but printed inside the Greek text. ⚠️ Convention 3 says
    Greek is reproduced verbatim; that means this marker is now inside our Greek too. Correct per
    the rule, but worth knowing it is there.
12. **~40 OCR/typographic corruptions passed through untouched**, listed by the agent: 0054
    `S: Michaëlis` · 0057 `asimentum` · 0062 `in obitæ S. Stephani`, `confusiis` · 0063 `defanctus`,
    `layemali` · 0067 `Mirabiliæ`, `ad ad 2 Junii` · 0073 `prosundæ`, `Contentino` · 0079 `sorte`
    for `forte` · 0093 run-together words `rebusspiritualibus`, `hocnostro`, `446,quocerte` · 0104
    `eum lectione` for *cum* · 0105 `Mediolancensem`, `Incujus`, `fuissetetiam` — among others.
    ⚠️ **Note this agent PASSED THESE THROUGH rather than correcting them**, where the 0013–0026
    agent silently corrected its equivalents. **Two agents, two different policies, same day.** This
    is the unstated rule biting exactly as predicted — see the open question in the first entry.

### Name collisions — none needed a header epithet
Two Basinus (bishop of Trier 0098–0104 vs bishop of Thérouanne in the Châlons privilege 0102) and
two Peters (Peter the Alexandrian, the Origenist intruder, vs Peter bishop of Corinth, Cyriacus's
uncle, 0092 note d) — **both distinguished in-text only, neither headed.** Correct: a name collision
only needs a header epithet when both parties HAVE headers.
