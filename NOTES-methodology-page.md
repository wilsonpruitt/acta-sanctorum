# TODO — Acta needs a methodology page

**Written 2026-07-28.** Wilson's ask, after the Bonaventure About page was rewritten:
bring Acta up to the same depth. Acta is currently the weakest of the three on this.

## The gap

`site/about.html` (159 lines, **hand-maintained and gitignored** — edit it directly, it
is not generated) has **no translation methodology at all.** Its scholarly content is a
bibliography of hagiographic method — Delehaye 1907, the *Bibliotheca Hagiographica* —
which is about *the Bollandists'* method, not ours. A reader who wonders whether these
translations are invented or paraphrased finds nothing on the site that answers them.

Migne is in better shape: `~/patrologia/site/method/index.html` is a real page, ten
sections, and it does disclose the model — but only in passing, and it makes no argument
for why the work is done this way at all.

## The model to copy

`~/bonaventure-sentences/site/src/app/about/page.tsx` — live at
bonaventure.wrootpress.com/about. Its shape, in order:

1. **How This Translation Is Made** — one plain sentence disclosing that drafting is
   LLM-assisted, immediately followed by: *the second half of that sentence is what
   decides whether the translation is any good, so here it is in full.* Disclosure is
   not buried and not defended; it is stated and then earned.
2. **Setting the Latin** — the source of truth and why (OCR over eyes-on print), where
   that inverts, and the 450 dpi column-band read.
3. **The English** — literal, parallel, marker-for-marker; fixed formula table; the
   apparatus translated in full.
4. **The Apparatus** — three named hazards, each with a real instance.
5. **What Is Checked, and When** — the per-unit audits, then the gate cadence.
6. **What We Do Not Correct** — Quaracchi's own errors stand; no silent emendation.
7. **Why Translate This Way** — the argument (below).
8. **A Working Draft** — cite as draft, corrections wanted, address given.

**What makes it credible is the specificity.** Every claim carries an instance with a
number attached: three footer registers of twenty-six notes recovered off the bands, ten
runovers in sixteen units, a hundred and eleven seams checked and three notes recovered,
a formatting scanner that was silently hardcoded to two volumes for months. Vague
assurance persuades nobody; a project that names its own near-misses does.

## Acta's own material for it

Do not port Bonaventure's examples — write Acta's. The raw material is already on disk
and it is strong:

- `CORPUS-DEFECTS.md` — the standing defect register.
- `RESUME-aug.md` — the anomaly list and corrected header rules.
- The per-day completion discipline (one agent = 1–2 **complete** days, 71–96 chunks,
  7/7 clean completions) is a real methodological claim about how the work is batched.
- The content-filter-blocked scan pages that had to be hand-transcribed (cf. the Péguy
  s11-c09 case) — an honest limit worth stating.
- The ES/IT translations are made **from the English**, not from the Latin. Say so
  plainly on the page; a reader will otherwise assume otherwise.

## The argument section

Wilson's own words, 2026-07-28 — this is the part neither Acta nor Migne has, and it is
the part that answers the real objection. Use his framing, not a paraphrase of it:

> Beneath the question of human against machine lies a prior question that settles it:
> nobody was doing this. No one had attempted the full *Acta* before. The cost is measured
> in human lifetimes and has not moved since the nineteenth century, so the corpus stood
> no closer to English this year than it would a thousand years from now. A corpus of this
> size is not translated slowly. It is not translated at all.
>
> The aim is therefore not a perfect translation. It is to unlock the language gate to the
> tradition.
>
> There will be errors, including serious ones — as there are in Migne, and in the
> Bollandists, and in every edition of this kind ever assembled. The model carries a fault
> forward, a line or a spacing or an artifact of the transcription, much as a clerk copying
> his exemplar carried forward the mistake set in front of him. Working this way has made
> me feel nearer to the medieval copyists than to a modern translator.

## Cross-link the three projects

Bonaventure's page now links **actasanctorum.org** and **migne.app** by name where it says
these corpora have never existed in English. Acta's page should link the other two back.
Three projects, one method, each vouching for the others.

## Scope note

This is a **publishing** change on an outward-facing site — it needs Wilson's OK before
deploy, like any other. Writing it is authored prose (Opus per the model rubric); the
deploy is mechanical.
