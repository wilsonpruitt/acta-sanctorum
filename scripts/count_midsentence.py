#!/usr/bin/env python3.11
"""Count paragraphs that BEGIN mid-sentence -- the artefact a reader actually sees.
Unambiguous: a real paragraph does not open with a lowercase letter."""
import re, sys
from pathlib import Path
BRACKET_ONLY = re.compile(r'^(\s*\[[^\]]*\]\s*)+$')
def count(path):
    t = path.read_text()
    body = t.split('---', 2)[2] if t.startswith('---') else t
    blocks = [b.strip() for b in re.split(r'\n\s*\n', body) if b.strip()]
    n = 0
    for b in blocks:
        if BRACKET_ONLY.match(b):
            continue
        s = re.sub(r'^\[[^\]]*\]\s*', '', b)          # strip a leading [N] marker
        # lettered footnote apparatus ("a. This place is...", "b Thus we have")
        # legitimately opens lowercase -- it is a note, not a broken paragraph
        if re.match(r'^[a-z][.)]?\s+[A-Z\u201c(]', s):
            continue
        if s[:1].islower():
            n += 1
    return n, len(blocks)
if __name__ == '__main__':
    tot = blk = 0
    for a in sys.argv[1:]:
        for p in sorted(Path(a).rglob('*.md')):
            n, b = count(p); tot += n; blk += b
    print(f'{tot} mid-sentence paragraph starts, of {blk} blocks')
