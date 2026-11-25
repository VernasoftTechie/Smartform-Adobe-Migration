#!/usr/bin/env node
// Proves what sfp_check cannot for this form: the per-row program lines %CODE1 are in the Initialization
// verbatim, in order, inside the IT_FLEXA loop; every '*' comment in column 1; %CODE2 (shared part) is
// checked by sfp_check (first 5 lines).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const extract = JSON.parse(fs.readFileSync(path.join(root, 'docs/legacy_grab/YFI_CHEQUEVOUCHER_extract.json'), 'utf8'));
const xml = fs.readFileSync(path.join(root, 'src/yfi_chequevoucher_int.sfpi.xml'), 'utf8');
const un = (s) => s.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const init = xml.match(/<INITIALIZATION>([\s\S]*?)<\/INITIALIZATION>/)[1]
  .split('\n').map((l) => l.trim()).filter(Boolean).map((l) => (l === '<FPCLINE/>' ? '' : un(l.replace(/^<FPCLINE>/, '').replace(/<\/FPCLINE>$/, ''))));
let fails = 0;
const fail = (m) => { fails++; console.log(`FAIL  ${m}`); };
const loopAt = init.findIndex((l) => l === 'LOOP AT it_flexa INTO ls_flexa.');
const loopEnd = init.findIndex((l, i) => i > loopAt && l === 'ENDLOOP.');
if (loopAt < 0 || loopEnd < 0) fail('IT_FLEXA loop missing');
let pos = loopAt;
const node = extract.codeNodes.find((c) => c.name === '%CODE1');
const lines = (node.code || node.lines || node.source).filter((l) => l.trim());
for (const l of lines) {
  const at = init.findIndex((x, i) => i > pos && (x === l || x === `  ${l}`));
  if (at < 0 || at > loopEnd) { fail(`%CODE1: line not found in order inside the loop: ${l}`); break; }
  pos = at;
}
if (!fails) console.log(`PASS  %CODE1: ${lines.length} non-blank lines verbatim, in order, inside the IT_FLEXA loop`);
const bad = init.filter((l) => /^\s+\*/.test(l));
if (bad.length) fail(`indented '*' comments: ${bad.length}`); else console.log("PASS  every '*' comment in column 1");
console.log(fails ? `RESULT: ${fails} fail` : 'RESULT: no failures');
process.exit(fails ? 1 : 0);
