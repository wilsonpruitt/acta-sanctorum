# D8 — merged works inside saint files: repair runbook

**Status:** surveyed 2026-08-29, **not started**. One instance fixed by hand
(`jun/day-24`, John the Baptist / Many Martyrs under Nero).
**Scope:** 283 boundaries across 226 files, Jan-vol2 through August.
**Defect record:** `CORPUS-DEFECTS.md` §D8. **Worklist:** `D8-WORKLIST.json`.

## What is wrong

At the split step, a work that begins partway through a chunk was appended to the
preceding saint instead of starting a new file. The merged work then has **no
page, no index entry, and no word count** — it is invisible on the site, and it
reads as a continuation of the previous saint's article.

Found by Wilson from the live page: June 24 ran John the Baptist straight into
*ON THE MANY HOLY MARTYRS AT ROME THROUGH FALSE CHARGE OF FIRE KILLED. A.D. 64*.

## Why this is not a mechanical pass

The survey finds a **candidate boundary** — an ALL-CAPS heading beginning `ON` or
`DE` below the top of a file. Deciding each one needs a reader:

- Some headings open a genuinely new work → split.
- Some are a **subsection of the same article** (e.g. `ON THE MARTYRDOM`, a
  chapter inside a longer vita) → leave alone.
- Some are an *appendix* about a different saint that the Bollandists
  deliberately printed under the main entry → judgement call; prefer splitting
  only when it has its own saint line.

**Do not batch-apply.** Work file by file, look at the heading in context, and
name the new saint from the heading or its saint line.

## Per-item procedure

1. Read the candidate from `D8-WORKLIST.json` (`file`, `block`, `heading`,
   `saint_line`). 79 of 283 have a `saint_line` — for those the name is given.
   For the rest, derive the name from the heading.
2. Read the blocks either side of the boundary in the file itself. Confirm the
   heading starts a new *work*, not a section.
3. Dry-run, then apply:

   ```bash
   python3.11 scripts/d8_split.py <file> <block> --saint "Name" [--slug s]
   python3.11 scripts/d8_split.py <file> <block> --saint "Name" --apply
   ```

   The splitter refuses unless the two halves recombine to the original with only
   whitespace differing. It picks the destination filename itself: a letter
   suffix (`0002` → `0002a`) that sorts into place, so **nothing is renumbered**.
4. A file with two merged works needs two passes; do the LAST boundary first, so
   earlier block indices stay valid.

## Verification

```bash
node scripts/build-site.mjs                 # entry count must rise by the number split
python3.11 scripts/d8_survey.py src/translations/*/day-*/saints | tail -1
```

⚠ `src/translations/` is **gitignored** — no VCS undo. Tar the month before
starting:

```bash
cd src/translations && tar czf ~/acta-snapshots/<mon>-saints-pre-d8-<date>.tgz <mon>/day-*/saints
```

## Order of work

By month, worst first: **aug 49 · jan-vol2 46 · feb 37 · may 34 · jul 32 ·
jun 31 · apr 27 · mar 27**. Do one month per session and rebuild after each.

⚠ **Do not deploy without Wilson's explicit OK** — outward-facing, and this
changes the site's structure (new pages and index entries), not just its prose.

## Trap worth knowing

When cutting, start at the **heading line, not the blank line above it**.
Deleting from the blank silently eats the previous work's last paragraph. The
splitter handles this correctly; a hand-edit with `sed` does not (that mistake
was made and caught on June 24).
