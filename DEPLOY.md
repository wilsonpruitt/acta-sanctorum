# Deploying Acta Sanctorum

**Hosting is Vercel.** The `.netlify/` directory in this repo is a leftover from
an earlier host — ignore it, and do not use the Netlify CLI. This file used to
document a Netlify deploy; that was stale and is corrected here (2026-07-27).

The Vercel project is linked at `site/`, not at the repo root
(`site/.vercel/project.json`, Wroot Labs team).

## Build

```bash
node scripts/build-site.mjs
```

This regenerates all HTML in `site/`.

⚠ **Do not rebuild mid-month.** While a month is partly translated, running the
build (or a partial `split-saints` pass) publishes half a month and can re-slug
saints when the rest lands. Finish the month first. To ship an unrelated change —
a footer, a stylesheet, a hand-maintained page — deploy the existing `site/` as
it stands and skip the build step entirely.

## Deploy

```bash
cd site && npx vercel --prod
```

Production only — no preview or staging deploys.

## Hand-maintained files inside `site/`

`site/` is gitignored, but not everything in it is generated. These are written
by hand and are NOT reproduced by `build-site.mjs`, so a `rm -rf site/` loses
them permanently:

- `site/style.css`
- `site/about.html`
- `site/rights.html`
- `site/favicon.svg`

Back them up before any destructive operation on `site/`.

## If you need to split saints for a new month

```bash
node scripts/split-saints.mjs --all-mar --dry-run   # preview
node scripts/split-saints.mjs --all-mar              # write files
node scripts/build-site.mjs                          # rebuild
cd site && npx vercel --prod                         # deploy
```

Replace `--all-mar` with `--source <month>/day-<NN>` for a single day.
