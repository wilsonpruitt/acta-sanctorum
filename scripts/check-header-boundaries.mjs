import fs from 'fs';
import path from 'path';
const src = fs.readFileSync('scripts/split-saints.mjs','utf8');
const start = src.indexOf('function isSaintBoundary');
let i = src.indexOf('{', start), depth=0, end=-1;
for (let j=i;j<src.length;j++){ if(src[j]==='{')depth++; else if(src[j]==='}'){depth--; if(!depth){end=j+1;break;}} }
const isSaintBoundary = new Function(src.slice(start,end)+'; return isSaintBoundary;')();

// A line the author plainly MEANT as a saint header: names a person-ish honorific.
const MEANT = /\b(ST\.?|STS\.?|SS\.?|SAINTS?|BL\.?|BB\.?|BLESSED|VEN\.?|VENERABLE|HOLY (MARTYRS?|VIRGINS?|MAIDENS?|ANCHORITES?|CONFESSORS?|BROTHERS?|SISTERS?|WOMEN|MEN|ROMAN|AFRICAN|[A-Z]+ MARTYRS?))\b/;
// A line that is plainly a SUBTITLE/place or a section title, correctly rejected.
const SUBTITLE = /^(ON|CONCERNING) (MOUNT|THE ISLAND|THE FRONT|THE BACK|THE RELICS|THE FINDING|THE TRANSLATION|THE MIRACLES|THE VENERATION|THE BRINGING|THE DEEDS|HIS |THE \d+(TH|ST|ND|RD)? DAY|THE CULT)/;

const root='src/translations';
const real=[], subs=[];
for (const m of fs.readdirSync(root)){
  const mdir=path.join(root,m); if(!fs.statSync(mdir).isDirectory())continue;
  for (const day of fs.readdirSync(mdir)){
    const ddir=path.join(mdir,day); if(!fs.statSync(ddir).isDirectory())continue;
    for (const f of fs.readdirSync(ddir)){
      if(!f.endsWith('.md'))continue;
      for (const line of fs.readFileSync(path.join(ddir,f),'utf8').split('\n')){
        const t=line.trim();
        if(!/^(ON|CONCERNING) /.test(t)||t.length<10)continue;
        if(isSaintBoundary(t))continue;
        const rec=`${m}/${day} ${f.slice(0,4)}  ${t.slice(0,100)}`;
        if(SUBTITLE.test(t)) subs.push(rec);
        else if(MEANT.test(t)) real.push(rec);
        else subs.push(rec);
      }
    }
  }
}
console.log('=== A. LIKELY REAL SILENT REJECTIONS (a saint page was never created):', real.length);
for(const x of real) console.log('  ✗',x);
console.log('\n=== B. subtitles/section titles beginning "ON " — correctly rejected, but violate the prompt rule:', subs.length);
const bym={}; for(const x of subs){const k=x.split('/')[0]; bym[k]=(bym[k]||0)+1;}
console.log('   per month:', JSON.stringify(bym));
