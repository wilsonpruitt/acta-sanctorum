#!/usr/bin/env python3.11
"""Generate sitemap.xml for a plain-static site directory.

Maps files to canonical URLs the way Vercel serves them:
  index.html          -> /
  foo/index.html      -> /foo/
  foo.html            -> /foo.html   (acta's redirects treat .html as canonical)

Usage (run from the repo root, after the corpus changes):
    python3.11 scripts/gen-sitemap.py site https://actasanctorum.org

Note: site/ is gitignored in this repo, so the generated sitemap.xml and
the hand-written robots.txt beside it exist only on disk and in the
deploy. This script is the record of how sitemap.xml is produced.
"""
import sys
from pathlib import Path
from xml.sax.saxutils import escape

root = Path(sys.argv[1]).resolve()
base = sys.argv[2].rstrip("/")
exclude = set(sys.argv[3].split(",")) if len(sys.argv) > 3 else set()

urls = []
for f in sorted(root.rglob("*.html")):
    rel = f.relative_to(root).as_posix()
    if rel in exclude:
        continue
    # skip build/vendor dirs
    if any(part in {"node_modules", ".vercel", "pagefind"} for part in f.parts):
        continue
    if rel == "index.html":
        path = "/"
    elif rel.endswith("/index.html"):
        path = "/" + rel[: -len("index.html")]
    else:
        path = "/" + rel
    urls.append(base + path)

out = ['<?xml version="1.0" encoding="UTF-8"?>',
       '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for u in urls:
    out.append(f"  <url><loc>{escape(u)}</loc></url>")
out.append("</urlset>")
(root / "sitemap.xml").write_text("\n".join(out) + "\n", encoding="utf-8")
print(f"{root}: wrote sitemap.xml with {len(urls)} urls")
