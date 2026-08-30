#!/usr/bin/env python3.11
"""List files hit by defect D7: >30% of body blocks are unterminated single lines."""
import re, sys
from pathlib import Path

def split_front(text):
    if text.startswith('---'):
        p = text.split('---', 2)
        if len(p) == 3:
            return p[2]
    return text

def affected(path, thresh=0.30):
    body = split_front(path.read_text())
    blocks = [b.strip() for b in re.split(r'\n\s*\n', body) if b.strip()]
    if len(blocks) < 10:
        return False
    def broken(b):
        if '\n' in b:
            return False
        # a block that is only a bracketed label, or an all-caps heading, is
        # structural -- it legitimately ends without sentence punctuation
        if re.match(r'^(\\s*\\[[^\\]]*\\]\\s*)+$', b):
            return False
        letters = [c for c in b if c.isalpha()]
        if letters and sum(c.isupper() for c in letters) / len(letters) > 0.8:
            return False
        s = b.rstrip('*_)"\'\u00bb\u201d')          # markdown emphasis / closing quotes
        return not re.search(r'[.!?:;\u2026]$', s)

    bad = sum(1 for b in blocks if broken(b))
    return bad / len(blocks) > thresh

if __name__ == '__main__':
    for a in sys.argv[1:]:
        for p in sorted(Path(a).rglob('*.md')):
            if 'preamble' in p.name:
                continue
            if affected(p):
                print(p)
