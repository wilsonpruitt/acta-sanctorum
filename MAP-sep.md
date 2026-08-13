# September map — scoping pass (2026-08-13)

Companion to `RESUME-aug.md`. Nothing translated yet: **0 / 4,120 chunks.**
This file is the pre-dispatch map only — day sizes, volume boundaries, dossier
spans, and the header strings that must be frozen BEFORE any agent runs.

## Shape of the month

- **30 days** (September has no day-31), **4,120 Latin chunks**, 93 MB on disk.
- **41% larger than August** (2,912 chunks) and 31% larger than July (3,146).
  September is the second-biggest month in the corpus after October (153 MB).
- Latin at `src/latin/sep/day-NN/chunks/NNNN-sep-day-NN.md`; English goes flat to
  `src/translations/sep/day-NN/NNNN-sep-day-NN.md`. **Same layout as August —
  chunks carry NO frontmatter, agents must generate the YAML.**
- 8 Latin volumes (September I–VIII), plus `einleitung-sep-I..VIII.txt` at the
  month root.

## Day-by-day

| Day | Chunks | Vol | Shards @~70 | Notes |
|-----|--------|-----|-------------|-------|
| 01 | 199 | I | 3 | Joshua, Gideon, Giles (Ægidius), Verena |
| 02 | 154 | I | 2 | Antoninus of Apamea |
| 03 | 111 | I | 2 | Phoebe the deaconess, Aquileian martyrs |
| 04 | 294 | II | 4 | **Moses** (108) · **Rosalia** (83) · Rosa (44) |
| 05 | 95 | II | 2 | Victorinus, Ostia martyrs |
| 06 | 86 | II | 2 | Zechariah the prophet |
| 07 | 116 | III | 2 | Regina of Alesia, Sozon |
| 08 | 71 | III | 1 | Alexandrian martyrs |
| 09 | 90 | III | 2 | Gorgonius, Theophanes |
| 10 | 154 | III | 2 | African martyrs; Nicholas of Tolentino |
| 11 | 99 | III | 2 | Protus & Hyacinth; Felix & Regula of Zurich |
| 12 | 26 | IV | 1 | smallest day in the month |
| 13 | 52 | IV | 1 | Tomis martyrs |
| **14** | **387** | IV | **6** | **Chrysostom (193!) · Cyprian (98) · Cornelius (30)** |
| 15 | 147 | V | 2 | Nicomedes, Nicetas the Goth |
| 16 | 125 | V | 2 | Euphemia of Chalcedon |
| 17 | 175 | V | 3 | **Hildegard (79) · Lambert (60)** |
| 18 | 188 | V | 3 | **Thomas of Villanova (165 — 88% of the day)** |
| 19 | 60 | VI | 1 | Januarius of Naples ⚠ see note below |
| 20 | 47 | VI | 1 | Eustathius/Placidus |
| 21 | 65 | VI | 1 | **Matthew the Apostle**, Jonah |
| 22 | 149 | VI | 2 | **Maurice & the Theban Legion**, Phocas |
| 23 | 77 | VI | 2 | Pope Linus, Thecla, Pope Liberius |
| 24 | 61 | VI | 1 | Andochius & companions, Geremarus |
| 25 | 116 | VII | 2 | Cleophas, Firminus of Amiens |
| 26 | 119 | VII | 2 | Cyprian & Justina, Callistratus + 49 |
| 27 | 136 | VII | 2 | Cosmas & Damian, John Mark |
| 28 | 241 | VII | 4 | **Wenceslaus (47)**, Lioba, Faustus of Riez |
| 29 | 160 | VIII | 2 | **Michael the Archangel (77)** |
| 30 | 320 | VIII | 5 | **Jerome (172 — 54% of the day) · Gregory the Illuminator (75)** |

**Totals: 4,120 chunks → ~66 shards** at the proven 60–70 chunks/agent size,
3 concurrent (8 GB cap).

## ⭐ Mega-dossiers — freeze these header strings BEFORE dispatch

Round E's lesson: when one saint dominates a day and will span multiple
concurrent shards, the header string must be **mandated identically in every
shard prompt**, byte-identical before the comma. There is no report to read
when shards run in parallel. Nine dossiers in September cross a shard seam:

| Day | Latin header | Chunks | Shards crossed |
|-----|--------------|--------|----------------|
| 14 | `DE S. JOANNE CHRYSOSTOMO, EPISCOPO CONSTANTINOPOLITANO ET ECCLESIÆ DOCTORE,` | 0159–0351 (193) | 3 |
| 30 | `DE S. HIERONYMO PRESBYTERO` | 0098–0269 (172) | 3 |
| 18 | `DE S. THOMA A VILLANOVA, ARCHIEPISCOPO…` | 0023–0187 (165) | 3 |
| 04 | `DE S. MOYSE PROPHETA, DUCE, ET LEGISLATORE POPULI ISRAËLITICI` | 0000–0107 (108) | 2 |
| 14 | `DE S. CYPRIANO, EPISC. MART.` | 0030–0127 (98) | 2 |
| 04 | `DE S. ROSALIA VIRGINE, EXIMIA CONTRA PESTEM PATRONA,` | 0167–0249 (83) | 2 |
| 17 | `DE S. HILDEGARDE VIRGINE, MAGISTRA SORORUM ORD. S. BENEDICTI` | 0096–0174 (79) | 2 |
| 29 | `DE S. MICHAELE ARCHANGELO, ET DE OMNIBUS ANGELIS` | 0000–0076 (77) | 2 |
| 30 | `DE S. GREGORIO EPISCOPO ARMENIÆ CONFESSORE: ITEM DE SS. VIRGINIBUS RIPSIME, GAIANA ET SOCIIS` | 0020–0094 (75) | 2 |

Chrysostom at 193 chunks is the largest single dossier September holds — bigger
than August's Augustine (145) and second in the corpus only to Louis IX (293).

## ⚠️ Name traps to put in the prompt before they bite

Both halves of the header rule matter here — same pre-comma text for the same
saint, different for different saints:

- **Two Cyprians, ten days apart.** Sept 14 = `DE S. CYPRIANO, EPISC. MART.`
  (Cyprian of Carthage); Sept 26 = `DE SS. CYPRIANO ET JUSTINA` (Cyprian of
  Antioch, the magician). Different saints — a naïve header cuts both to
  `Cyprian` and merges them, the day-25 Ebba defect exactly.
- **Two Ferreoli on the same day.** Sept 18 has `DE S. FERREOLO MARTYRE`
  (0000) and `DE S. FERREOLO EPISC. CONF.` (0014). Distinguishing epithet must
  sit **before** the comma.
- **Two Marcelli on the same day.** Sept 4 has `DE S. MARCELLO MARTYRE` (0113)
  and `DE S. MARCELLO EPISC. ET MART.` (0122).
- **Two Fausti on the same day.** Sept 28 has `DE S. FAUSTO EPISCOPO REGIENSI`
  (0033) and `DE S. FAUSTO EPISC.` (0074).
- **Rosalia vs Rosa vs Rosula.** Sept 4 has both Rosalia (0167) and Rosa (0250);
  Sept 1 has Rosa of Sulci; Sept 14 has Rosula. Four distinct women.
- **Two Candidae on one day.** Sept 4: `DE SANCTA CANDIDA A S. PETRO APOSTOLO
  CONVERSA` (0108) and `DE S. CANDIDA JUNIORE MULIERE CONJUGATA` (0137).
- **Victor recurs** on days 10, 14 and 30 (the last being Victor of the Theban
  Legion) — across days it is harmless, but do not let day-30's Victor absorb
  the Ursus dossier.

## Structural notes found in the scan

- ⚠️ **Day 19, Januarius of Naples**: the roster itself carries the Bollandist
  note *"Acta imprimenda circa finem tomi"* — his acts are printed at the END of
  the volume, not at his feast. Day 19 is only 60 chunks for that reason. His
  dossier may sit physically in another day's scrape or be absent; **check
  before treating day 19 as complete.** This is a scrape-shape question, not a
  translation question — resolve it during the gate pass, not mid-run.
- **Day 14 has only 9 dossier headers for 387 chunks** — the sparsest header
  density in the month. That is genuine (two of them are 193 and 98 chunks), not
  a header-detection failure; confirmed by a broader sweep for
  `COMMENTARIUS`/`VITA`/`PASSIO`/`ACTA`/`APPENDIX` forms.
- **`[Col. NNN]` markers are present but rare in September** — 10 Latin files
  carry them (1 in day-14/day-30). Keep them, per the corpus convention; if the
  number is lost to the scrape, the form is `[Col. [ ]]`.
- Day 12 (26 chunks) and day 13 (52) are the only days small enough for one
  agent to hold comfortably with room to spare — good warm-up pair.

## Wiring not yet done (mechanical, Sonnet/Haiku work)

1. `scripts/split-saints.mjs` needs an **`--all-sep`** flag (loop days 1–**30**,
   not 1–31 — the `--all-aug` pattern hardcodes 31).
2. `scripts/build-site.mjs` needs full September wiring: `sepDays`/`sepSaints`
   via `collectSplitSaints('sep', 1, 30)`, the month-grid link (currently
   hardcoded `<div class="month-link disabled">September … forthcoming</div>` at
   line 946), a September Pages block with `SEPTEMBER_DATES`, alphabetical-index
   inclusion, `monthLabel` `'Sep'`, homepage totals, and July→August→September
   `nextLink` chaining. Month dir = `september/`, Latin name `September`.
3. The `.month-notice` partial-month block already exists and is generic on
   `augDayCount < 31` — it must be parameterized or duplicated for
   `sepDayCount < 30`.

## Suggested run order

Warm up on the small days to re-prove the frozen prompt on September's typography
(12, 13, 20, 24, 21, 08), then the mid-sized days, and take the four monsters
(14, 30, 04, 28) last when the header conventions have been exercised — the same
order that worked in August, where day-25 ran clean as the final round.

Before the first dispatch: state the burn estimate and get Wilson's model + go.
