# Deploying Acta Sanctorum

## Build

```bash
node scripts/build-site.mjs
```

This regenerates all HTML in `site/`.

## Deploy via Netlify CLI

```bash
npx netlify deploy --prod --dir=site
```

The CLI only uploads files whose content hash changed, so it's fast and doesn't use build minutes.

## First-time setup

If the CLI isn't linked to the site yet:

```bash
npx netlify login
npx netlify sites:list          # find the site name
npx netlify link --name <site>  # link this directory
```

## If you need to split saints for a new month

```bash
node scripts/split-saints.mjs --all-mar --dry-run   # preview
node scripts/split-saints.mjs --all-mar              # write files
node scripts/build-site.mjs                          # rebuild
npx netlify deploy --prod --dir=site                 # deploy
```

Replace `--all-mar` with `--source <month>/day-<NN>` for a single day.
