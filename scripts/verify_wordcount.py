#!/usr/bin/env python3.11
"""Per-file token-count gate: snapshot tree vs live tree. Never use a cat-based
aggregate -- files lacking a trailing newline merge tokens across boundaries."""
import sys, tarfile, tempfile
from pathlib import Path

snap, live = sys.argv[1], Path(sys.argv[2])
with tempfile.TemporaryDirectory() as td:
    with tarfile.open(snap) as t:
        t.extractall(td)
    root = next(Path(td).iterdir())
    o = {p.relative_to(root): p for p in root.rglob('*.md')}
    n = {p.relative_to(live): p for p in live.rglob('*.md') if 'saints' in p.parts}
    bad = 0
    for r in sorted(set(o) & set(n)):
        a, b = len(o[r].read_text().split()), len(n[r].read_text().split())
        if a != b:
            print(f'DIFF {r}: {a} -> {b}'); bad += 1
    for r in sorted(set(o) - set(n)): print(f'LOST {r}'); bad += 1
    print(f'{len(set(o) & set(n))} files compared, {bad} differing, '
          f'{len(set(n) - set(o))} new')
    sys.exit(1 if bad else 0)
