#!/bin/sh
# Upload export/ to the shared wroot-corpus-export R2 bucket, under the
# acta-sanctorum/ prefix (~/open-corpus/PLAN.md item 8 — one bucket, one
# prefix per site). Run after scripts/build_export.mjs.
#
# Requires `npx wrangler` logged in (npx wrangler login) with R2 access on
# the account that owns the wroot-corpus-export bucket. This PUBLISHES
# files a third party will fetch — Wilson's per-action OK first, same as a
# deploy.
set -eu
cd "$(dirname "$0")/.."

BUCKET=wroot-corpus-export
PREFIX=acta-sanctorum

for f in export/*.jsonl.gz export/*.tar.gz export/README.md export/manifest.json; do
  [ -f "$f" ] || continue
  name=$(basename "$f")
  case "$name" in
    *.gz) ct=application/gzip ;;
    *.md) ct=text/markdown ;;
    *.json) ct=application/json ;;
    *) ct=application/octet-stream ;;
  esac
  echo "uploading $PREFIX/$name..."
  npx wrangler r2 object put "$BUCKET/$PREFIX/$name" --file="$f" --remote --content-type="$ct"
done
