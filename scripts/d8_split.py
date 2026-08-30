#!/usr/bin/env python3.11
"""Split a merged work out of a saint file (defect D8). See D8-RUNBOOK.md.

    python3.11 scripts/d8_split.py <file> <block-index> --saint "Name" [--slug s] [--apply]

Cuts at the START of <block-index> (the ALL-CAPS work heading) and writes the
tail to a sibling file whose numeric prefix is the source's prefix plus a letter
suffix, so the build's filename sort places it immediately after the original
and NOTHING downstream needs renumbering.

Safety: the two halves are concatenated and compared against the original; the
write is refused unless they differ only in whitespace. Dry-run by default.
"""
import argparse, re, sys
from pathlib import Path

def frontmatter(t):
    if t.startswith('---'):
        p = t.split('---', 2)
        if len(p) == 3:
            return '---' + p[1] + '---', p[2]
    return '', t

def slugify(s):
    s = re.sub(r'\(.*?\)', '', s).lower()
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', s)).strip('-')

def next_name(src: Path):
    m = re.match(r'^(\d+)([a-z]*)-(.*)$', src.name)
    if not m:
        sys.exit(f'unexpected filename: {src.name}')
    num, suf = m.group(1), m.group(2)
    nxt = 'a' if not suf else chr(ord(suf[-1]) + 1)
    return num, suf + nxt if suf else nxt

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('file'); ap.add_argument('block', type=int)
    ap.add_argument('--saint', required=True); ap.add_argument('--slug')
    ap.add_argument('--apply', action='store_true')
    a = ap.parse_args()

    src = Path(a.file)
    orig = src.read_text()
    front, body = frontmatter(orig)
    blocks = [b.strip() for b in re.split(r'\n\s*\n', body) if b.strip()]
    if not 0 < a.block < len(blocks):
        sys.exit(f'block {a.block} out of range (0..{len(blocks)-1})')

    head, tail = blocks[:a.block], blocks[a.block:]
    print(f'  cut before: {tail[0][:100]}')
    print(f'  head ends : ...{head[-1][-80:]}')

    day = re.search(r'day:\s*(\d+)', front)
    slug = a.slug or slugify(a.saint)
    new_front = (f'---\nday: {day.group(1) if day else "?"}\n'
                 f'saint: "{a.saint}"\nslug: "{slug}"\nstatus: translated\n---\n')
    head_text = (front + '\n\n' if front else '') + '\n\n'.join(head) + '\n'
    tail_text = new_front + '\n' + '\n\n'.join(tail) + '\n'

    # hard gate: the split may only move a paragraph boundary, never a word
    if ' '.join((head_text + '\n' + '\n\n'.join(tail)).split()) != ' '.join(orig.split()):
        sys.exit('REFUSED: content would change; not a clean split')

    num, suf = next_name(src)
    dest = src.with_name(f'{num}{suf}-{slug}.md')
    print(f'  -> {dest.name}  ({len(head)} blocks stay, {len(tail)} move)')
    if dest.exists():
        sys.exit(f'REFUSED: {dest.name} already exists')
    if a.apply:
        src.write_text(head_text); dest.write_text(tail_text)
        print('  WROTE')
    else:
        print('  (dry run -- pass --apply to write)')

if __name__ == '__main__':
    main()
