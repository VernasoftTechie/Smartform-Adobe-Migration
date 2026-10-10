// Make the hand-built Context look like what SFP generates for dragged structure fields (S08 section 3):
// flat NAME (hyphen -> underscore) and GENERATED = X on every data node.
import fs from 'node:fs';
const f = process.argv[2];
let s = fs.readFileSync(f, 'utf8');
let n = 0;
s = s.replace(/(<cls:CL_FP_DATA id="o\d+">\s*<CL_FP_NODE classVersion="1">\s*<ID>[0-9A-F]+<\/ID>\s*)<NAME>([^<]*)<\/NAME>(\s*)<GENERATED\/>/g, (m, pre, name, ws) => {
  n += 1;
  return `${pre}<NAME>${name.replace(/-/g, '_')}</NAME>${ws}<GENERATED>X</GENERATED>`;
});
fs.writeFileSync(f, s, 'utf8');
console.log(`renamed/flagged ${n} data nodes`);
