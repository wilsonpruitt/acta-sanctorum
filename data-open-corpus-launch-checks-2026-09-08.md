# Open Corpus reading-layer launch checks — actasanctorum.org

Run 2026-09-08, against production (actasanctorum.org) right after deploy `dpl_R4JWzJn85RY9ZhoiKhUytnMK3usr`.
See ~/open-corpus/PLAN.md Appendix F.

1. `curl -A GPTBot {work_url}` -> 200, full text, no gate. PASS (spot-checked /august/day-31/aidan.html).
2. `curl -A GPTBot {work_url}.txt` -> 200; `.json` parses. PASS.
3. robots.txt, llms.txt, sitemap.xml, /rights.html, /export.html -> 200; footer line present. PASS.
4. Canonical absolute https:// and equals @id in JSON-LD; JSON-LD parses. PASS (verified locally pre-deploy; spot-checked live).
5. /export manifest lists the newest export; R2 object downloads. NOT YET — wroot-corpus-export R2 bucket not provisioned. export/ built locally (3,635 saint entries, ~34.5M English words) but not uploaded; /export.html shows a placeholder EXPORT_R2_BASE_URL.
6. Sitemap URL count equals work count on disk (plus indexes). PASS (4,434 URLs; gen-sitemap.py walks all built .html).
7. Vercel edge-request figure noted day-before/week-after. NOT YET — check wilson-pruitts-projects dashboard (project "site") in ~1 week.

## Fixed this session (the flagged gap)

`site/` is gitignored so robots.txt, rights.html, style.css, about.html,
favicon.svg, and vercel.json had no git history. Moved to a new tracked
`site-static/`, copied into `site/` by `build-site.mjs`'s new
`copySiteStatic()` (first line of `buildSite()`). Verified: robots.txt and
style.css in the rebuilt `site/` are byte-identical to `site-static/`.

## Still open

- Provision the shared `wroot-corpus-export` R2 bucket, update
  `EXPORT_R2_BASE_URL` in scripts/build-export-page.mjs (same placeholder
  pattern as CL and migne), run scripts/upload_export_r2.sh, rebuild,
  redeploy. Outward-facing — Wilson's OK first.
- Vercel Firewall rate-limit rule (infra backstop, decision 3) — not urgent.
- `source_text` is null on every export record — the Latin isn't stored
  per saint-entry in this pipeline (only per-day chunk files pre-split).
  Not blocking; noted for whoever tackles decision 6's "PD source aligned"
  goal here specifically.
