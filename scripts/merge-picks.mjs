/**
 * merge-picks.mjs — Merge Nov-Dec picks from Propylaeum into main saints-picks.csv
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const MAIN = path.join(ROOT, 'devotional/saints-picks.csv');
const NOV_DEC = path.join(ROOT, 'devotional/nov-dec-picks.csv');

// Parse a CSV line with quoted fields
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
  const mainRows = fs.readFileSync(MAIN, 'utf-8').trim().split('\n');
  const novDecRows = fs.readFileSync(NOV_DEC, 'utf-8').trim().split('\n');

  // Build a map of Nov-Dec picks
  const novDecMap = new Map();
  for (let i = 1; i < novDecRows.length; i++) {
    const [month, day, saint, notes] = parseCsvLine(novDecRows[i]);
    novDecMap.set(`${month}-${day}`, { saint, notes });
  }

  // Merge: replace any ??? rows in main where we have Propylaeum data
  const header = mainRows[0];
  const newRows = [header];
  let replaced = 0;
  for (let i = 1; i < mainRows.length; i++) {
    const fields = parseCsvLine(mainRows[i]);
    const [month, day, saint, notes] = fields;
    const key = `${month}-${day}`;

    if ((saint === '???' || saint === '') && novDecMap.has(key)) {
      const pick = novDecMap.get(key);
      newRows.push(toCsvLine([month, day, pick.saint, 'Propylaeum: ' + pick.notes]));
      replaced++;
    } else {
      newRows.push(mainRows[i]);
    }
  }

  fs.writeFileSync(MAIN, newRows.join('\n') + '\n', 'utf-8');
  console.log(`Merged ${replaced} Propylaeum picks into ${MAIN}`);

  // Report remaining ???
  const stillMissing = newRows.filter(r => r.includes('???')).length;
  console.log(`Remaining ??? rows: ${stillMissing}`);
}

main();
