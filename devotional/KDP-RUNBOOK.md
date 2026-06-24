# KDP Runbook — *Acta Sanctorum: A Daily Devotional* (Wroot Press)

Fill-in answers + step order for KDP's paperback setup wizard, single volume.
Source of truth: the interior PDF page count (`devotional.pdf`) and the cover
wrap dims printed in `cover/cover-wrap.typ`. Re-run the builds, then update the
page count / spine here if anything changes.

`☐` = a field only Wilson can finalize (ISBN, on-sale date, final price, KDP
category confirmation in the live chooser).

> **Current (2026-06-24):** Interior `devotional.pdf` = **327 pp**, 6×9 cream.
> Full cover wrap `cover/cover-wrap.pdf` built at **13.0675″ × 9.25″, spine
> 0.8175″** (327 × 0.0025″). Front/back/spine copy all locked in
> `cover-wrap.typ`. Ready for upload once Wilson has a free KDP ISBN.

---

## Files to upload
- **Manuscript (interior):** `devotional/devotional.pdf` (327 pp)
- **Cover (full wrap):** `devotional/cover/cover-wrap.pdf` (13.0675″ × 9.25″)
  - *Not* `cover-front.pdf` — that's the front panel only, for web/thumbnails.

⚠️ **If the page count changes, the spine width changes** → regenerate the wrap:
`typst compile cover/cover-wrap.typ cover/cover-wrap.pdf` after updating the
`sp` value (`pages × 0.0025in`), then re-confirm the dims in this file.

---

## Paperback details (KDP wizard, in order)

### 1. Language & title
- **Language:** English
- **Book Title:** Acta Sanctorum
- **Subtitle:** A Daily Devotional — Three Hundred Fifteen Lives of the Saints,
  January 1 to November 10
- **Series:** *(none — standalone)*
- **Edition number:** 1

### 2. Author / contributors
- **Author:** Wilson Pruitt
- **Contributor:** *(none — Wilson is sole author here, not Editor; the
  devotional entries are original compositions drawn from the AASS, not a
  reprint of a public-domain text)*
- **Publisher / imprint:** Wroot Press

### 3. Description
Paste the block under **"Description (copy-paste)"** below.

### 4. Publishing rights
- **I own the copyright and hold publishing rights.**
- *Nuance:* the underlying *Acta Sanctorum* (1643–1940) is public domain, **but
  every devotional entry is original copyrightable composition** — a newly
  written scene + life + turn, plus original selection and arrangement. Do
  **NOT** select "this is a public domain work."

### 5. AI disclosure (required; not shown to readers)
- **Yes — AI-based tools were used** to assist translation of source Latin
  passages and drafting of entries; all human-curated and reviewed. Disclose
  truthfully.

### 6. Keywords (up to 7)
1. saints daily devotional
2. lives of the saints
3. Catholic devotional reading
4. Christian daily reading
5. hagiography Bollandist
6. liturgical calendar saints
7. saint of the day

### 7. Categories / BISAC (up to 3 — confirm exact node in KDP's chooser)
- `REL012120` RELIGION / Christian Living / Devotional
- `REL033000` RELIGION / Christianity / Saints & Sainthood *(or
  Religion › Christian Books & Bibles › Saints in the live chooser)*
- `REL015000` RELIGION / Christianity / History

Live-chooser tree paths (cascading dropdowns; capture on first publish):
1. Religion & Spirituality › Christian Books & Bibles › Worship & Devotion › **Devotionals**
2. Religion & Spirituality › Christian Books & Bibles › Catholicism › **(Saints)**
3. Religion & Spirituality › Christian Living › **Spiritual Growth**

### 8. Audience
- Adults · not a children's book · no explicit content
- Low-content / large-print: **No**

### 9. Print options
- **Trim:** 6 × 9 in (15.24 × 22.86 cm)
- **Interior:** Black & white
- **Paper:** Cream
- **Bleed:** No bleed (interior)
- **Cover finish:** Matte
- **ISBN:** **9798184084053**
- **Territories:** Worldwide, all marketplaces

---

## Pricing
KDP US print cost = `$0.85 + $0.012 × pages`.

| Pages | Print cost | 60% royalty list floor | Suggested list |
|---|---|---|---|
| 327 | **$4.77** | **$7.96** | ☐ **$14.99** |

At $14.99 / 60% the royalty ≈ $4.22/sale (US). Floor sits well below list, so
$14.99 is safe. ☐ Confirm final price.

---

## Description (copy-paste)

> For three hundred years the Bollandists of Antwerp set themselves an all but
> impossible task: to gather the life of every saint the Church remembers, day
> by day through the calendar year. Sixty-eight folio volumes appeared between
> 1643 and 1940 — and even so the work reached only as far as the tenth of
> November before it outran its makers.
>
> This is a daily companion drawn from that vast compendium. Three hundred and
> fifteen entries, one for each day from the first of January to the tenth of
> November, each grounded in the *Acta*'s own account of the day's saint and
> told in about three hundred words: a scene, a life, and a quiet turn toward
> the reader. Kings and beggars, scholars and shepherds, martyrs and mystics —
> the famous and the nearly forgotten — set down in the order the year keeps
> them.
>
> *The Roman calendar holds the feasts; this book holds the saints.*

---

## Cover spec reference (from `cover/cover-wrap.typ`)
- Trim 6 × 9, bleed 0.125″, cream `#efe6ce`, ink `#2b2117`
- Spine = pages × 0.0025″ = 327 × 0.0025 = **0.8175″**
- Full wrap = `2×0.125 + 6 + 0.8175 + 6 = 13.0675″` wide × **9.25″** tall
- Spine text + WROOT PRESS foot; back panel carries the description above
- Barcode zone (bottom-right of back panel) left clear — KDP overlays the
  barcode; imprint sits bottom-left to avoid it.

---

## Post-publish (optional)
- **Kindle eBook:** the layout is prose (no apparatus/columns), so it reflows
  cleanly — a future `.epub` is straightforward via the live paperback's
  **"+ Create Kindle eBook"** button if desired.
- ⚠️ **KDP title-creation cap:** this account has a hard cap of ~2 new titles
  per ~24h rolling window (hit on the Wesley Notes run). One title here, so no
  issue — but don't create it the same day as other new KDP titles.
