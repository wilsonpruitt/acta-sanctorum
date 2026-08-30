#!/usr/bin/env python3.11
"""Survey for defect D8: a second work's title heading inside one saint file.

Size is only a hint. The decisive signal is structural: the Acta opens each work
with an ALL-CAPS title, conventionally beginning "ON ...". A second such heading
below the top of the file means two works were merged at the split step.
"""
import re, sys
from pathlib import Path

def headings(path):
    t = path.read_text()
    body = t.split('---', 2)[2] if t.startswith('---') else t
    blocks = [b.strip() for b in re.split(r'\n\s*\n', body) if b.strip()]
    out = []
    for i, b in enumerate(blocks):
        letters = [c for c in b if c.isalpha()]
        if not letters or len(b) < 25:
            continue
        if sum(c.isupper() for c in letters) / len(letters) > 0.9 and re.match(r'^(ON|DE)\b', b):
            out.append((i, b[:95]))
    return out, len(blocks)

if __name__ == '__main__':
    hits = 0
    for a in sys.argv[1:]:
        for p in sorted(Path(a).rglob('*.md')):
            if 'preamble' in p.name:
                continue
            hs, n = headings(p)
            extra = [h for h in hs if h[0] > 3]     # heading 0-3 = the file's own title
            if extra:
                hits += 1
                print(f'\n{p.relative_to("src/translations")}  ({n} blocks)')
                for i, h in extra:
                    print(f'   block {i}: {h}')
    print(f'\n{hits} files with a second work heading')
