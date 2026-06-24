# Fidelity Audit — May & June Devotional Entries vs. Full AASS Translations

Run 2026-06-24. May and June were drafted in "translate-on-demand" mode from Latin
slivers *before* the full translations existed. Now that May and June are fully
translated, every entry was checked against its matched saint translation in
`src/translations/{may,jun}/day-NN/`. Drafts backed up at
`devotional/drafts/_backup-pre-fidelity-2026-06-24/`.

**Headline:** The closing pull-quotes are the systemic failure. Of 61 entries, only
~13 closers are genuinely supported by the source. The preface promises "*Most quotes
are from the Bollandist source itself; the few exceptions are quietly marked*" — so the
unmarked invented quotes break the book's own stated standard. There are also several
broken saint→source mappings and a few entries that import later legend *against* what
the Bollandists actually wrote.

Fix policy (Wilson, 2026-06-24):
1. Replace fabricated pull-quotes with genuine sourced quotes.
2. Fix clear-cut factual errors directly.
3. BROKEN MAPPINGS (§A) → **swap to a saint the Acta actually treats substantively on
   that day, and re-draft the entry.** Wilson curated the original picks carefully, so I
   surface the best candidate replacement saint(s) per day with evidence and pick the
   most substantive one, flagging each swap so he can override the saint choice.
4. LEGEND-AS-FACT (§B) → **reconcile the offending passages to what the Bollandists
   actually wrote** (e.g. Brendan loses the Navigatio voyage; Isidore's drowned son
   goes; Norbert's "poison" becomes the spider-in-the-chalice).

---

## A. BROKEN SAINT→SOURCE MAPPINGS — flag, editorial decision needed

| Day | Saint in draft | Problem |
|-----|----------------|---------|
| May 3 | Philip & James the Less | Not treated in AASS May 3 (day is Finding of the Holy Cross). Draft is all Scripture/tradition. |
| May 7 | John of Beverley | Not in the repo at all; drawn from Bede *HE* V.2. |
| May 10 | Antoninus of Florence | His AASS *Acta* are on **May 25** ("Pierozzi"), not May 10. Re-audit against day-25. |
| May 12 | Germanus (Patriarch of CP) | day-12 file is a *different* Germanus (Hegumen of Cosinitra). |
| May 18 | John I, Pope | Absent from day-18; real source is misfiled at **day-27** (`saints/0010-john-pope-i.md`). Draft is faithful to *that* text. Easiest fix: remap source pointer. |
| Jun 25 | Prosper of Aquitaine | Day-25 saint is **Prosper of Reggio Emilia** — a different man the Bollandists *explicitly set aside*. |
| Jun 30 | First Martyrs of Holy Roman Church | Not in AASS (a 1969 feast). Draft built from Tacitus *Ann.* 15.44 + Romans 16, both transparently attributed. |

## B. LEGEND ASSERTED AS FACT, against the source — flag

- **May 15 Isidore** — fabricated drowned son; wife "María de la Cabeza" (unnamed in source); "two strangers plowing" replaces the source's spectral white oxen.
- **May 16 Brendan** — the entire *Navigatio* voyage (Jasconius, etc.) is exactly what the Bollandist commentator branded "apocryphal deliriums" and **cut**.
- **Jun 5 Boniface** — the cut Gospel-codex / "Ragyndrudis Codex with sword-cut survives" is a disputed tradition the Bollandists *reject*.
- **Jun 6 Norbert** — "public poison challenge, drank it and lived" is really the private spider-in-the-chalice eucharistic miracle.
- **Jun 19 Bruno** — "eighteen companions / dawn war-band that killed the king" contradicts the source (king killed one brother; a second brother had Bruno beheaded, was struck blind, converted).

## C. CLEAR-CUT FACTUAL ERRORS — fix directly

- **May 6 Petronax:** destruction 581→**590**; lasted 140→**130** years; restoration 717→**720**; remove "bones of Benedict carried to Fleury" (source: remained at Cassino).
- **May 8 Peter of Tarentaise:** parents "noble"→modest landholders; professed "under Bernard of Clairvaux"→**under Abbot John at Bonnevaux**; "Little Saint Bernard"→**Great St Bernard / Mont-Jou**; drop "still bears his name"; the hiding episode = a **deaf-mute monk in a German monastery**, not a Swiss kitchen lay-brother for six months.
- **May 9 Pachomius:** disciple "Anub"→**John**.
- **May 13 Servatus:** Synod of Sardica 343→**347**.
- **May 14 Carthach:** drop invented birth-name "Cuthach"; migration 635→**630/631**.
- **May 22 Rita:** drop invented 1437 plague; drop "wound reopened only when scripture read aloud" (source: continuous); "widow of forty"→widowed ~30; drop husband's name "Paolo Mancini" (unnamed in source).
- **May 26 Augustine of Canterbury:** death 604→**608**; drop "wintered at Lérins, got as far as Aix" (source's turn-back miracle is at **Angers**).
- **May 27 Bede:** pull-quote "Receive my soul into thy hands" misreads "**take my head into your hands**" (asking the boy to position his head). Fix quote.
- **May 29 Maximinus:** death "346"→**~349**; "thirteen years" in see→**~17**; drop unsupported "received Paul of Constantinople."
- **Jun 7 Robert of Newminster:** "1138, twelve monks"→**1137, eleven**; drop "educated at Paris," the three daughter houses, 40-yr standing-Lenten prayer, 1147 lawsuit.
- **Jun 8 Medard:** "governed forty years"→**fifteen**; the colt/beating story → he gave one of his father's **horses**, miraculously restored (no beating); drop Salency *rosière* + "poor-go-first / cathedral door."
- **Jun 10 Margaret:** "three hundred orphans clothed"→source has **nine orphans** + 300 poor (conflation).
- **Jun 11 Barnabas:** martyrdom "stoned"→**stoned and burned**; "Mark wrote the Gospel at Salamis"→source places it at **Rome**.
- **Jun 12 Leo III:** father "Atyuppius"→**Azuppius**; "twenty-one years"→**twenty**; drop "apparitor" occupation.
- **Jun 13 Anthony of Padua:** Rimini **fish-sermon** is not this source (its Rimini passage = conversion of the heresiarch Bonovillus); drop "memorized the whole Bible"; named after the **place S. Antonio**, not the Egyptian father.
- **Jun 15 Landelinus:** death 686→**685**; drop "350 psalms a week" (cross-contamination from Jun-14 Methodius) and "rule of Columbanus"; the roadside-reunion-with-Aubert scene is invented.
- **Jun 16 Lutgardis:** parents inverted — the **mother** drove her to the cloister (father wanted her married); dowry = 20 marks lost over repeated English trading trips (not a single venture at age twelve); fasting = **two seven-year** fasts (bread+beer, then bread+herbs), not three 20-year periods; burial = **honorable choir-side spot**, not "under the choir step where sisters walk over her."
- **Jun 20 Silverius:** death 537→**539**; "island of Patara"→Patara is a **city** in Lycia.
- **Jun 27 Ladislaus:** death "July 29"→**June 29**; the move to the 27th is because June 29 is **Peter & Paul** (+ the 1192 elevation fell on the 27th), NOT "to dodge high-summer Hungarian saints"; drop the Szabolcs-synod / "first written ecclesiastical law" / 1083 triple-canonization claims (imported).

## D. FABRICATED / UNSUPPORTED PULL-QUOTES — replace with a genuine sourced line

May: 1, 5, 6, 8, 11 (misattributed to Mamertus; really Avitus), 13, 14, 17, 20, 22, 23,
26, 28, 29. Plus 27 (distorted — see C). May 2 & 24 are genuine quotes from the saint's
*own* works but not in the source-of-record — either mark as external or replace.

June: 3, 4, 5, 6, 7, 8, 10, 12, 13, 14, 15, 16, 17, 18 (verify — 1.2 MB source unread),
20, 23, 26, 27.

## E. SUPPORTED — leave as-is

- **Pull-quote genuinely in source:** May 9, 21, 25, 30, 31; Jun 1, 2, 9, 11, 19, 21.
- **Genuine external quote, transparently attributed (satisfies the preface):** Jun 24 (John 3:30), 28 (Irenaeus *AH* IV.20.7), 29 (Gal 2:11), 30 (Tacitus). May 3's John 14:8 is also Scripture but the *entry itself* is a broken mapping (see A).

## STATUS (2026-06-24)

**MAY — all quote + factual patches APPLIED to drafts.** Days edited: 1, 4, 5, 6, 8, 9, 11,
13, 14, 17, 18, 19, 20, 22, 23, 25, 26, 27, 28, 29. Clean/kept: 2, 21, 24 (external quote
kept w/ attribution), 30, 31.

**Two adjudication flags surfaced during the fix:**
- **Jun 16 Lutgardis** — the source has **three** successive seven-year fasts, not two
  (my earlier note said two). Applied as three. Confirm before print.
- **Jun 19 Bruno** — draft's "March 1009 by modern reckoning" isn't in the source (which
  argues plainly for 1008). Trimmed to 1008.

**Two broken-mapping days do NOT need swaps after all:**
- **May 18 John I** — his feast genuinely is May 18; the *Acta* treat him (text filed in the
  day-27 folder). KEPT John I; fixed the quote from the real source. No swap.
- **May 10 Antoninus of Florence** — feast is May 10; his *Acta* sit at May 25. Likely a
  keep-and-remap (not a swap), pending a check that the day-25 text supports the draft.

**ALL WORK COMPLETE (2026-06-24):**
- ✅ June quote+factual patches applied (incl. legend reconciles Jun 5 Boniface, Jun 6
  Norbert, Jun 19 Bruno).
- ✅ SWAPS drafted fresh from source: May 3→Juvenal of Narni, May 7→Pope Benedict II,
  May 12→Pancras, Jun 25→Prosper of Reggio Emilia, Jun 30→Erentrude of Salzburg.
  saints-picks.csv updated for all five (+ keep-notes on May 10 Antoninus & May 18 John I).
- ✅ LEGEND reconciles rewritten to source: May 15 Isidore (white-oxen/angelic plowing;
  no drowned son; wife unnamed), May 16 Brendan (Navigatio framed as the legend the
  Bollandists cut as "apocryphal deliriums").
- ✅ PDF rebuilt (`build-pdf.py` → 315 entries → `typst compile`, clean). Spot-checked:
  fabricated quotes absent, new sourced quotes present.

**May 10 RESOLVED (2026-06-24):** the Antoninus check disproved the keep-and-remap premise —
day-25 is the **Zenobius** dossier and only *cites* Antoninus's chronicle; Antoninus of
Florence is not in this corpus at all (a real broken mapping). Per the swap policy,
**May 10 → Comgall of Bangor**, drafted from day-10/saints/0007-comgall.md, CSV updated,
PDF rebuilt. So all 6 broken-Acta days are now swapped (May 3, 7, 10, 12; Jun 25, 30);
May 18 John I genuinely belongs and was kept.

**Both adjudication flags RESOLVED against the source (2026-06-24, verified directly):**
- **Lutgardis (Jun 16) = three seven-year fasts.** Source 0010-lutgardis.md §2 (bread+beer,
  Albigensians), §9 ("another seven years... on bread and herbs," sinners), §4 ("for a
  third time... she died in the seventh year of this salutary fast"); TOC confirms "The
  third fast of seven years." Draft text correct.
- **Bruno (Jun 19) = 1008.** Source 0012-boniface.md heading "AROUND THE YEAR 1008" and §5
  "to the year of Christ 1008 the martyrdom... must be assigned [but 1008.]" No "1009" in
  the text. Draft text correct; the original "March 1009" had no basis.

ALL ITEMS CLOSED. Only the print-time ISBN placeholder remains (front matter).

## F. NOT FULLY VERIFIED — needs a focused pass

- **May 19 Dunstan** — `saints/0010-dunstan.md` is present and correctly matched but was not line-checked.
- **Jun 18 Elizabeth of Schönau** — 1.2 MB source not exhaustively read; pull-quote *presumed* fabricated.
