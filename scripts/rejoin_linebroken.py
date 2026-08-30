#!/usr/bin/env python3.11
"""
Repair line-broken translation files (corpus defect D7): each typographic line of
the Latin was emitted as its own paragraph, so the site renders one <p> per line.

Method. The affected translations are line-for-line with the Latin OCR, which does
retain real paragraph boundaries as blank lines. So:

  1. seed a global offset by proper-name/numeral signature matching;
  2. refine with a banded Needleman-Wunsch alignment (block <-> Latin line,
     allowing merged blocks and skipped lines, so the alignment cannot drift);
  3. rejoin each run of blocks into one paragraph, breaking where the aligned
     Latin line is followed by a blank.

Structural blocks -- headings, saint-list lines, [N] section markers, bracketed
editorial labels -- are never absorbed into a neighbouring paragraph, whatever the
Latin's line breaks look like.

A file is rewritten only when the alignment clears the gate; otherwise it is
reported for manual review.
"""
import argparse, re, sys, unicodedata
from pathlib import Path

ROOT       = Path(__file__).resolve().parent.parent
BAND       = 60     # DP band half-width around the seeded diagonal
GAP        = 0.45   # penalty for skipping a Latin line or a block
MIN_SCORE  = 0.30   # mean match score required over aligned pairs
MIN_MATCH  = 0.75   # fraction of blocks that must find a Latin match


def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s)
                   if unicodedata.category(c) != 'Mn')


def split_front(text):
    if text.startswith('---'):
        parts = text.split('---', 2)
        if len(parts) == 3:
            return '---' + parts[1] + '---', parts[2]
    return '', text


def blocks_of(body):
    return [b.strip() for b in re.split(r'\n\s*\n', body) if b.strip()]


NAME_RE = re.compile(r'\b([A-ZÆŒ][\wÀ-ɏ]{3,})')

def sig(line):
    s = strip_accents(line)
    out = {w[:4].lower() for w in NAME_RE.findall(s)}
    out |= set(re.findall(r'\d+', s))
    return out


def pair_score(a, le, b, ll):
    """Score a precomputed (signature, length) pair."""
    s = 0.0
    if a and b:
        s = 2.0 * len(a & b) / max(len(a), len(b))
    if le and ll and 0.75 <= le / ll <= 1.8:
        s += 0.6
    return s


def prep(lines):
    return [sig(l) for l in lines], [len(l) for l in lines]


# ---------------------------------------------------------------- structure

SECTION_RE = re.compile(r'^\[\d+\]')
BRACKET_ONLY_RE = re.compile(r'^\[[^\]]*\]$')
SAINT_LINE_RE = re.compile(r'\((S|B|V)\.\)\s*$')

def kind(b):
    """Classify a block. A paragraph never spans two kinds."""
    if b.startswith('#'):
        return 'head'
    if BRACKET_ONLY_RE.match(b):
        return 'label'
    if SAINT_LINE_RE.search(b) and len(b) < 120:
        return 'saint'
    letters = [c for c in b if c.isalpha()]
    if letters and len(b) < 200 and \
       sum(c.isupper() for c in letters) / len(letters) > 0.85:
        return 'caps'
    return 'prose'


# kinds where every block stands alone, whatever the Latin does
ALWAYS_ALONE = {'saint', 'label', 'head'}


def starts_section(b):
    return bool(SECTION_RE.match(b))


# ---------------------------------------------------------------- alignment

_LATIN_CACHE = {}

def load_latin(month, day):
    key = (month, day)
    if key in _LATIN_CACHE:
        return _LATIN_CACHE[key]
    p = ROOT / 'src' / 'latin' / month / f'day-{day}' / f'day-{day}-full.txt'
    if not p.exists():
        _LATIN_CACHE[key] = None
        return None
    nb, brk = [], []
    for l in p.read_text(encoding='utf-8').split('\n'):
        if l.strip():
            nb.append(l.strip())
            brk.append(False)
        elif nb:
            brk[-1] = True
    lsig, llen = prep(nb)
    _LATIN_CACHE[key] = (nb, brk, lsig, llen)
    return _LATIN_CACHE[key]


def seed_offset(bsig, blen, lsig, llen):
    n, m = len(bsig), len(lsig)
    probe = list(range(0, n, max(1, n // 40)))[:40]
    best = (-1.0, 0)
    for o in range(0, max(1, m - n + 1)):
        s = 0.0
        for i in probe:
            j = o + i
            if j < m:
                s += pair_score(bsig[i], blen[i], lsig[j], llen[j])
        if s > best[0]:
            best = (s, o)
    return best[1]


def align(bsig, blen, lsig, llen, off):
    """Banded NW. Returns list per block of the Latin indices it consumed."""
    n, m = len(bsig), len(lsig)
    NEG = float('-inf')
    prev = {}
    # column 0: consuming Latin lines before the first block costs nothing at the
    # seeded start, so allow free entry across the band.
    for j in range(max(0, off - BAND), min(m, off + BAND) + 1):
        prev[j] = (0.0, None)
    ptr = []
    for i in range(n):
        lo = max(0, off + i - BAND)
        hi = min(m - 1, off + i + BAND)
        cur, back = {}, {}
        for j in range(lo, hi + 1):
            best, bk = NEG, None
            # match block i with Latin j  (came from prev[j-1..])
            if j - 1 in prev or j == 0:
                base = prev.get(j - 1, (NEG, None))[0] if j > 0 else 0.0
                if base > NEG:
                    v = base + pair_score(bsig[i], blen[i], lsig[j], llen[j])
                    if v > best:
                        best, bk = v, ('M', j - 1)
            # skip Latin line j (block i still pending) -- stay in same row
            if j - 1 in cur:
                v = cur[j - 1][0] - GAP
                if v > best:
                    best, bk = v, ('L', j - 1)
            # skip block i entirely
            if j in prev:
                v = prev[j][0] - GAP
                if v > best:
                    best, bk = v, ('B', j)
            if bk:
                cur[j] = (best, bk)
                back[j] = bk
        if not cur:
            return None
        ptr.append(back)
        prev = cur
    # traceback from the best cell in the final row
    j = max(prev, key=lambda k: prev[k][0])
    score = prev[j][0]
    consumed = [[] for _ in range(n)]
    i = n - 1
    while i >= 0:
        op, pj = ptr[i][j]
        if op == 'M':
            consumed[i].append(j)
            j = pj
            i -= 1
        elif op == 'L':
            consumed[i].append(j)
            j = pj
        else:
            j = pj
            i -= 1
    for c in consumed:
        c.reverse()
    return consumed, score


# ---------------------------------------------------------------- repair

def repair(path, write=False):
    text = path.read_text(encoding='utf-8')
    front, body = split_front(text)
    blocks = blocks_of(body)
    if len(blocks) < 8:
        return ('too-short', None, None)
    m = re.search(r'/(\w{3})/day-(\d+)/', str(path))
    lat = load_latin(m.group(1), m.group(2))
    if not lat:
        return ('no-latin', None, None)
    nb, brk, lsig, llen = lat
    if len(blocks) > len(nb):
        return ('longer-than-latin', None, None)

    bsig, blen = prep(blocks)
    off = seed_offset(bsig, blen, lsig, llen)
    res = align(bsig, blen, lsig, llen, off)
    if not res:
        return ('align-failed', None, None)
    consumed, score = res

    matched = [i for i, c in enumerate(consumed) if c]
    if len(matched) / len(blocks) < MIN_MATCH:
        return ('low-match', None, f'matched={len(matched)}/{len(blocks)}')
    mean = sum(pair_score(bsig[i], blen[i], lsig[consumed[i][-1]], llen[consumed[i][-1]])
               for i in matched) / len(matched)
    if mean < MIN_SCORE:
        return ('low-confidence', None, f'score={mean:.2f}')

    kinds = [kind(b) for b in blocks]
    paras, cur = [], []
    for i, b in enumerate(blocks):
        nxt_k = kinds[i + 1] if i + 1 < len(blocks) else None
        # a [N] section marker always opens a paragraph
        if cur and (kinds[i] != kinds[i - 1] or starts_section(b)):
            paras.append(' '.join(cur)); cur = []
        cur.append(b)
        brk_here = (
            i == len(blocks) - 1
            or kinds[i] in ALWAYS_ALONE
            or nxt_k != kinds[i]
            or (nxt_k is not None and starts_section(blocks[i + 1]))
            or (consumed[i] and brk[consumed[i][-1]])
        )
        if brk_here:
            paras.append(' '.join(cur)); cur = []
    if cur:
        paras.append(' '.join(cur))

    out = (front + '\n\n' if front else '') + '\n\n'.join(paras) + '\n'
    # hard gate: rejoining may only change whitespace, never a word
    if ' '.join(out.split()) != ' '.join(text.split()):
        return ('content-changed', None, None)
    if write:
        path.write_text(out, encoding='utf-8')
    return ('ok', (len(blocks), len(paras), mean), out)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('paths', nargs='+')
    ap.add_argument('--write', action='store_true')
    ap.add_argument('--show', type=int, default=0)
    a = ap.parse_args()
    for p in a.paths:
        status, info, out = repair(Path(p), write=a.write)
        if status == 'ok':
            print(f'{"WROTE" if a.write else "OK   "} {p}: '
                  f'{info[0]} blocks -> {info[1]} paragraphs (score {info[2]:.2f})')
            if a.show:
                print('\n'.join(out.split('\n')[:a.show]))
        else:
            print(f'SKIP [{status}] {p} {info or ""}')
