#!/usr/bin/env python3.11
"""Second pass for corpus defect D7a — see CORPUS-DEFECTS.md.

rejoin_linebroken.py aligns blocks against the Latin and is deliberately
conservative: where it cannot place a block it leaves the break alone. Those
leftovers are the artefact Wilson sees — paragraphs beginning mid-sentence.

This pass needs no Latin. It joins a block to the previous one only when BOTH
sides say mid-sentence: the previous ends on a letter/,/&/-, and the next opens
lowercase. Structural blocks (leading [ # *, or >80% uppercase letters) are
exempt on both sides. Requiring both sides is what makes it safe.

Run over <mon>/day-*/saints ONLY. The numbered chunk files are line-for-line
with the Latin by design and must not be swept in.

    python3.11 scripts/rejoin_residual.py src/translations/jun/day-*/saints
    python3.11 scripts/rejoin_residual.py --apply src/translations/jun/day-*/saints

Word count must be identical before and after; a re-run must report 0.
"""
import re, sys
from pathlib import Path

def split_front(text):
    if text.startswith('---'):
        p = text.split('---', 2)
        if len(p) == 3:
            return '---' + p[1] + '---', p[2]
    return '', text

# Previous block ends mid-sentence. A letter, comma, ampersand or hyphen, plus:
#   ';'      a semicolon never ends a paragraph in this corpus
#   '...'/'…' an elision continuing into the next block
# Greek is included explicitly -- large stretches of the Acta are Greek, and a
# Latin-only class silently exempts every one of them.
GREEK = 'Ͱ-Ͽἀ-ῼ'
PREV_OPEN = re.compile(f'([A-Za-zÀ-ɏ{GREEK}0-9,&;:-]|\\.\\.\\.|…)$')
# next block begins mid-sentence: lowercase letter (Latin or Greek), & or ,
NEXT_CONT = re.compile(f'^[a-zà-ɏ{GREEK}&,]')

# A block that is NOTHING BUT bracketed labels (marginalia, [Annotatum], etc.).
# NOT a prose paragraph that merely opens with a [N] section marker -- those are
# ordinary paragraphs and must stay joinable. Getting this wrong silently skips
# every paragraph that opens with a section number.
BRACKET_ONLY = re.compile(r'^(\s*\[[^\]]*\]\s*)+$')

GREEK_CH = re.compile(f'[{GREEK}]')

def same_script(a, b):
    """A Latin paragraph followed by a Greek block is a real boundary -- the
    Acta sets quoted Greek as its own paragraph. Only join like to like."""
    prev_gk = bool(GREEK_CH.search(a[-1:]))
    next_gk = bool(GREEK_CH.match(b[:1]))
    return prev_gk == next_gk


def structural(b):
    if b.startswith('#') or b.startswith('*'):
        return True
    if BRACKET_ONLY.match(b):
        return True
    # An all-caps test needs a length floor, but a tight one: a lone dropped
    # initial ("Ὁ") is 100% uppercase yet is an orphaned first letter, not a
    # heading. A short word like LIFE or ACTA IS a heading -- keep it exempt.
    if len(b) < 3:
        return False
    letters = [c for c in b if c.isalpha()]
    if letters and sum(c.isupper() for c in letters) / len(letters) > 0.8:
        return True
    return False

def fix(path, apply=False):
    text = path.read_text()
    front, body = split_front(text)
    blocks = [b.strip() for b in re.split(r'\n\s*\n', body) if b.strip()]
    out, joins = [], 0
    for b in blocks:
        if (out and not structural(b) and not structural(out[-1])
                and PREV_OPEN.search(out[-1]) and NEXT_CONT.match(b)
                and same_script(out[-1], b)):
            out[-1] = out[-1] + ' ' + b
            joins += 1
        else:
            out.append(b)
    if joins and apply:
        path.write_text(front + '\n\n' + '\n\n'.join(out) + '\n')
    return joins

if __name__ == '__main__':
    apply = '--apply' in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    total = 0
    for a in args:
        for p in sorted(Path(a).rglob('*.md')) if Path(a).is_dir() else [Path(a)]:
            n = fix(p, apply)
            if n:
                total += n
                print(f'{n:5d}  {p}')
    print(f'total joins: {total}')
