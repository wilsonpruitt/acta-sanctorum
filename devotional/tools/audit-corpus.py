#!/usr/bin/env python3
"""
Corpus-wide AASS audit for the devotional saints-picks.

For each pick in saints-picks.csv (Feb 1 – Nov 10):
  - Locate the AASS day-file (~/acta-sanctorum/src/latin/<mo>/day-NN/day-NN-full.txt)
  - Search DE-section headers for the saint's name stem
  - Classify VERIFIED / FLAGGED-NO-DE / ABSENT / MISSING-FILE / SKIP

Jan picks use a different (chunked, German) source layout and are skipped here;
they were audited during Phase 1.

Output: ~/acta-sanctorum/devotional/corpus-audit.md
"""

import csv
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

ROOT = Path.home() / "acta-sanctorum/src/latin"
CSV_FILE = Path.home() / "acta-sanctorum/devotional/saints-picks.csv"
REPORT = Path.home() / "acta-sanctorum/devotional/corpus-audit.md"

MONTH_DIR = {
    "February": "feb", "March": "mar", "April": "apr", "May": "may",
    "June": "jun", "July": "jul", "August": "aug", "September": "sep",
    "October": "oct", "November": "nov",
}

# English first-name → Latin stem fragments (>=4 chars; matched after normalize)
EN_TO_LATIN = {
    "john": ["joanne", "iohann", "ioanne", "johann"],
    "matthew": ["matthae", "matthe"],
    "mary": ["maria", "marian"],
    "james": ["jacobo", "jacobi", "iacobo"],
    "lawrence": ["laurent"],
    "william": ["wilhelm", "guillel", "guilelm"],
    "henry": ["henric", "heinric"],
    "hugh": ["hugone", "hugoni"],
    "bridget": ["brigid", "brigit"],
    "anthony": ["antoni"],
    "cyril": ["cyrill", "kyrill"],
    "methodius": ["methodi"],
    "joseph": ["joseph"],
    "stephen": ["stephan", "stephno", "steph"],
    "peter": ["petro", "petri", "petrus"],
    "paul": ["paulo", "pauli", "paulus"],
    "catherine": ["cathar", "catheri"],
    "katharine": ["cathar"],
    "elizabeth": ["elisab"],
    "margaret": ["margar"],
    "jerome": ["hieron"],
    "andrew": ["andrea", "andreæ"],
    "mark": ["marco"],
    "luke": ["luca"],
    "lucy": ["lucia"],
    "agnes": ["agnete", "agnes"],
    "patrick": ["patric"],
    "george": ["georg"],
    "michael": ["michael"],
    "alphege": ["aelph", "elph", "alphe"],
    "alphage": ["aelph", "elph"],
    "edmund": ["edmund"],
    "edward": ["edward", "eadwa"],
    "isidore": ["isidor"],
    "augustine": ["august"],
    "ambrose": ["ambrosi"],
    "lawrenc": ["laurent"],
    "kevin": ["coemgen"],
    "caedmon": ["caedmon", "cædmon"],
    "ladislaus": ["ladislao", "ladislai"],
    "celestine": ["coelest", "celest"],
    "pachomius": ["pachom"],
    "irenaeus": ["irenae", "irenæ"],
    "bademus": ["badema"],
    "joachim": ["joachi"],
    "antoninus": ["antonin"],
    "ansgar": ["ansgari", "anschar"],
    "matilda": ["mathild", "matild"],
    "turibius": ["turibi", "toribi"],
    "hunna": ["huna"],
    "wulfric": ["wulfric"],
    "cassian": ["cassian"],
    "boniface": ["bonifac"],
    "scholastica": ["scholasti"],
    "lateran": ["__feast__"],
    "presentation": ["__feast__"],
    "annunciation": ["__feast__"],
    "visitation": ["__feast__"],
    "nativity": ["__feast__"],
    "exaltation": ["__feast__"],
    "assumption": ["__feast__"],
    "transfiguration": ["__feast__"],
    "all": ["__feast__"],  # All Saints / All Souls
    "holy": ["__feast__"],  # Holy Cross / Holy Archangels (drafted as feast)
    "dedication": ["__feast__"],
    "first": ["__group__"],  # "First Martyrs of Rome"
}


# Manual stem overrides for tricky names (Latin form differs from English root)
# Format: English saint string (normalized) -> list of stem fragments (>=4 chars)
STEM_OVERRIDES = {
    "cloud (clodoald)": ["clodoald"],
    "giles (aegidius)": ["aegid", "egid"],
    "arcanus and aegidius of borgo san sepolcro": ["arcan", "aegid"],
    "kieran of clonmacnoise": ["kieran", "queran"],
    "ailbe of emly": ["albeo", "ailbeo", "alveo"],
    "john of egypt": ["joanne aegyptio", "joannes aegypt"],
    "john colobus (john the dwarf)": ["colobo", "joanne colobo"],
    "alypius of tagaste": ["alypio", "alipio"],
    "ambrose of agaune": ["ambrosio abbate"],
    "ursinus of bourges": ["ursino"],
    "tryphon of lampsacus": ["tryphone"],
    "emeric of hungary": ["emerico", "henrico duce"],
    "stephen of hungary": ["stephano primo hungar"],
    "leodegar of autun": ["leodegario"],
    "hubert of liège": ["huberto"],
    "winnoc of wormhoudt": ["winnoco"],
    "willibrord of utrecht": ["willibrord"],
    "godfrey of amiens": ["godefrido"],
    "austremonius of clermont": ["austremon"],
    "zechariah and elizabeth": ["zacharia"],
    "rose of viterbo": ["rosa virgine", "sancta rosa"],  # avoid Rosalia
    "edwin of northumbria": ["edwino", "eduino"],
    "gall of st. gallen": ["gallo, confess"],
    "severinus of cologne": ["severino, episcopo coloniensi"],
    "cleophas": ["cleopha"],
    "matthew the apostle": ["matthaeo apostolo", "matthæo"],
    "the two ewalds": ["ewaldis"],
    "phoebe the deaconess": ["__external__"],
    "luke the evangelist": ["luca"],
    "simon and jude, apostles": ["simone, apostolo", "thaddæo"],
    "demetrius of thessalonica": ["demetrio"],
    "denis of paris and companions": ["dionysio ep"],
    "paulinus of york": ["paulino, archiep"],
    "bruno the great": ["brunone, archiepiscopo coloniensi"],
    "wenceslaus of bohemia": ["wenceslao"],
    "adrian and natalia": ["adriano et viginti"],
    "cyprian and justina": ["cypriano, justina"],
    "cornelius and cyprian": ["cornelio papa", "cypriano, episc"],
    "cosmas and damian": ["cosma, damiano"],
    "maurice and the theban legion": ["mauritio primicerio"],
    "joseph of cupertino": ["josepho a cupertino"],
}


_LIGATURES = str.maketrans({
    "Æ": "AE", "æ": "ae",
    "Œ": "OE", "œ": "oe",
    "ß": "ss",
})

def normalize(s: str) -> str:
    s = s.translate(_LIGATURES)
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = s.lower()
    # Old AASS Latin orthography: V = U, J = I (Iulio = Julio, Hvgone = Hugone)
    # Apply only inside words, not as wholesale replace, but for substring search
    # this conservative replace works since we never search for w/y
    s = s.replace("v", "u").replace("j", "i")
    return s


def derive_stems(saint_en: str) -> list[str]:
    """Return Latin-fragment substrings to search for in DE-headers."""
    key = normalize(saint_en)
    if key in STEM_OVERRIDES:
        return STEM_OVERRIDES[key]

    # strip parenthetical
    s = re.sub(r"\(.*?\)", "", saint_en).strip()
    # split on " and ", " of ", " the " to get sub-saints
    parts = re.split(r"\s+(?:and|of|the|&)\s+", s, flags=re.IGNORECASE)
    stems = []
    for p in parts:
        p = p.strip().rstrip(",.")
        if not p:
            continue
        first = re.split(r"[\s,]+", p)[0].lower()
        # check English-Latin map first
        if first in EN_TO_LATIN:
            stems.extend(EN_TO_LATIN[first])
            continue
        # take first 4 chars (handles Latin inflection: -us/-o/-i/-um etc)
        if len(first) >= 4:
            stems.append(first[:4])
        elif len(first) >= 3:
            stems.append(first)
    return list(dict.fromkeys(stems))  # dedupe, preserve order


def is_external(notes: str, saint: str) -> bool:
    if not notes:
        return False
    n = notes.lower()
    # we accept biblical AND AASS-substantive picks (e.g. Zechariah Nov 5)
    # so only true externals are 'external' or unmarked feasts that didn't get swapped
    if "external" in n:
        return True
    if "modern external" in n:
        return True
    return False


def audit_pick(month: str, day: str, saint: str, notes: str):
    if month not in MONTH_DIR:
        return ("SKIP-JAN", "Phase 1 chunked layout")

    try:
        day_int = int(day)
    except ValueError:
        return ("SKIP", f"non-integer day: {day}")

    if month == "November" and day_int > 10:
        return ("SKIP", "out of scope (Phase 0 stops at Nov 10)")

    stems = derive_stems(saint)
    if "__external__" in stems:
        return ("EXTERNAL", "biblical/external pick by design")
    if "__feast__" in stems:
        return ("FEAST-NO-DE", "liturgical feast — methodology check needed (eighth/ninth/tenth corrections handled most)")
    if "__group__" in stems:
        return ("GROUP", "joint/group commemoration — name doesn't fit DE-header pattern")

    day_str = f"day-{day_int:02d}"
    path = ROOT / MONTH_DIR[month] / day_str / f"{day_str}-full.txt"
    if not path.exists():
        return ("MISSING-FILE", str(path))

    text = path.read_text(errors="replace")
    # extract all DE-section headers — both abbreviated (DE S./SS./B./BB.)
    # and spelled-out (DE SANCTO/SANCTA/SANCTIS) forms; capture next line too
    de_re = re.compile(
        r"^DE\s+(?:S{1,2}\.|B{1,2}\.|SANCT[OAIE]S?|BEAT[OAIE]S?)[^\n]*(?:\n[^\n]*)?",
        re.MULTILINE,
    )
    de_blocks = de_re.findall(text)
    de_text = normalize("\n".join(de_blocks))

    norm_stems = [normalize(s) for s in stems]
    matched_in_de = [s for s in norm_stems if s in de_text]
    if matched_in_de:
        return ("VERIFIED", f"DE-header matched: {', '.join(matched_in_de)}")

    # fallback: check first 80k chars of body (calendar headers + early apparatus)
    body_text = normalize(text[:80000])
    matched_in_body = [s for s in norm_stems if s in body_text]
    if matched_in_body:
        return ("FLAGGED-NO-DE", f"found in body but not in DE-header: {', '.join(matched_in_body)} (stems tried: {', '.join(stems)})")

    return ("ABSENT", f"no match for stems: {', '.join(stems)}")


def main():
    results = defaultdict(list)
    with open(CSV_FILE) as f:
        reader = csv.DictReader(f)
        for row in reader:
            month = row["Month"]
            status, info = audit_pick(month, row["Day"], row["Saint"], row.get("Notes", ""))
            results[status].append((month, row["Day"], row["Saint"], info))

    with open(REPORT, "w") as f:
        f.write("# Corpus-Wide AASS Audit Report\n\n")
        f.write("Generated by `tools/audit-corpus.py`. ")
        f.write("For each pick (Feb 1 – Nov 10), checks whether the saint's name stem ")
        f.write("appears in a `DE S.` header of the AASS day-file.\n\n")
        f.write("## Status counts\n\n")
        for status in ["VERIFIED", "FLAGGED-NO-DE", "ABSENT", "MISSING-FILE", "EXTERNAL", "FEAST-NO-DE", "GROUP", "SKIP-JAN", "SKIP"]:
            f.write(f"- **{status}**: {len(results.get(status, []))}\n")
        f.write("\n")
        for status in ["ABSENT", "FLAGGED-NO-DE", "MISSING-FILE", "EXTERNAL", "FEAST-NO-DE", "GROUP", "VERIFIED", "SKIP-JAN", "SKIP"]:
            entries = results.get(status, [])
            if not entries:
                continue
            f.write(f"## {status} ({len(entries)})\n\n")
            for m, d, s, info in entries:
                f.write(f"- **{m} {d}**: {s} — {info}\n")
            f.write("\n")

    print("STATUS COUNTS:")
    total = 0
    for status in ["VERIFIED", "FLAGGED-NO-DE", "ABSENT", "MISSING-FILE", "EXTERNAL", "FEAST-NO-DE", "GROUP", "SKIP-JAN", "SKIP"]:
        n = len(results.get(status, []))
        print(f"  {status:18s} {n:4d}")
        total += n
    print(f"  {'TOTAL':18s} {total:4d}")
    print(f"\nReport: {REPORT}")


if __name__ == "__main__":
    main()
