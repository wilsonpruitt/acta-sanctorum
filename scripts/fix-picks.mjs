/**
 * fix-picks.mjs — Fill remaining gaps and clean up obvious name issues
 * in devotional/saints-picks.csv
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const CSV = path.join(ROOT, 'devotional/saints-picks.csv');

// Gap fills (from WebFetch results)
const GAP_FILLS = {
  'June-1': 'Justin Martyr',
  'June-2': 'Martyrs of Lyons (Pothinus)',
  'July-1': 'Martin of Vienne',
  'July-2': 'Visitation of Mary',
};

// Name corrections — map of "CSV saint value" → cleaned name
// These are obvious cases from the Propylaeum parser and Latin scraper
const NAME_FIXES = {
  'Clementin': 'Clement',
  'Roman': 'Romanus',
  'Ampel': 'Ampelius',
  'Dei genitricis': 'Presentation of Mary',
  'Ruf': 'Rufinus',
  'Basile': 'Basileus',
  'Diodor': 'Diodorus',
  'Sophonia': 'Sabbas',
  'Sabba': 'Sabbas',
  'Mariae virginis': 'Mary',
  'Eutychian': 'Eutychian (Pope)',
  'Restitut': 'Restitutus',
  'Melchiadis': 'Melchiades (Pope)',
  'Synesius': 'Synesius',
  'Heronis': 'Hero',
  'Florian': 'Florian',
  'Flavian': 'Flavian',
  'Nemesius': 'Nemesius',
  'Sabin': 'Sabinus',
  // Latin oblique cases from scraper
  'Ctesiphonte': 'Ctesiphon',
  'Venantio': 'Venantius',
  'Melitone': 'Meliton',
  'Prvdentio': 'Prudentius',
  'Macario': 'Macarius',
  'Theodolo': 'Theodulus',
  'Pancratius': 'Pancras',
  'Didymo': 'Didymus',
  'Prochoro': 'Prochorus',
  'Holda': 'Holda',
  'Coprica': 'Coprica',
  'Cyria': 'Cyriacus',
  'Primo': 'Primus',
  'Fide': 'Faith',
  'Paulino': 'Paulinus',
  'Leolino': 'Leolinus',
  'Beata': 'Blessed Virgin',
  'Marcello': 'Marcellus',
  // Jan/Feb auto-picks that need better choices
  'Martina': 'Odilo', // Jan 1 — Solemnity of Mary/Odilo/Fulgentius; but pick better-known
  'Basilius Of Ankara': 'Basil the Great',
  'Priscus Priscillianus Und Benedicta': 'Elizabeth Ann Seton',
  'Gregory Of Acritas': 'Edward the Confessor',
  'Erminold Of Pr Fening': 'Epiphany',
  'Knud Lavard': 'Lucian of Antioch',
  'Dominica Und Gef Hrtinnen': 'Severinus of Noricum',
  'Paulinus Of Aquileia': 'Theodosius the Cenobiarch',
  'Caesaria The Elder': 'Benedict Biscop',
  'Paulus And Companions': 'Felix of Nola',
  'Maurus Of Subiaco': 'Maurus',
  'Martyrs Of Pontus': 'Prisca',
  'Martyrs Blaithmacus The Priest': 'Marius and Martha',
  'African Martyrs Hermes And Solutor': 'Agnes',
  'Martyrs Manuel': 'Vincent of Saragossa',
  'Timothy The Apostle': 'Timothy and Titus',
  'And Divinely Inspired Writer Henry Suso Of The Order Of Preachers': 'Henry Suso',
  'African Martyrs Secundus And Fortunatus': 'John Chrysostom',
  'Alexandrian Martyrs': 'Thomas Aquinas',
  'African Martyrs Paul': 'Gildas',
  'African Martyrs Felicianus': 'Hyacinthe Mariscotti',
  'Basil': 'Brigid of Ireland',  // Feb 1
  'African Martyrs Victor': 'Presentation of the Lord',  // Feb 2 = Candlemas
  'Martyrs Paul And Simon': 'Blaise',
  'Gemmulus The Martyr': 'Gilbert of Sempringham',
  // March picks — many need manual replacement
  'St. Bonavita, a blacksmith, of the Third Order of Saint Francis, at Lugo in Italy': 'David of Wales',
};

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuote && line[i + 1] === '"') { current += '"'; i++; }
      else inQuote = !inQuote;
    } else if (c === ',' && !inQuote) {
      result.push(current); current = '';
    } else {
      current += c;
    }
  }
  result.push(current);
  return result;
}

function toCsvLine(fields) {
  return fields.map(f => {
    if (/[",\n]/.test(f)) return `"${f.replace(/"/g, '""')}"`;
    return f;
  }).join(',');
}

function main() {
  const rows = fs.readFileSync(CSV, 'utf-8').trim().split('\n');
  const newRows = [rows[0]];
  let gapsFilled = 0;
  let namesCleaned = 0;

  for (let i = 1; i < rows.length; i++) {
    const [month, day, saint, notes] = parseCsvLine(rows[i]);
    const key = `${month}-${day}`;

    let newSaint = saint;
    let newNotes = notes;

    // Fill gaps
    if (saint === '???' && GAP_FILLS[key]) {
      newSaint = GAP_FILLS[key];
      newNotes = 'WebFetch fill';
      gapsFilled++;
    }

    // Apply name fixes
    if (NAME_FIXES[newSaint]) {
      newSaint = NAME_FIXES[newSaint];
      namesCleaned++;
    }

    newRows.push(toCsvLine([month, day, newSaint, newNotes]));
  }

  fs.writeFileSync(CSV, newRows.join('\n') + '\n', 'utf-8');
  console.log(`Gaps filled: ${gapsFilled}`);
  console.log(`Names cleaned: ${namesCleaned}`);

  const stillMissing = newRows.filter(r => r.includes('???')).length;
  console.log(`Remaining ???: ${stillMissing}`);
}

main();
