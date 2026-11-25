#!/usr/bin/env node
// Proves what sfp_check cannot for this form: every legacy program-lines node is in the Initialization verbatim and in
// legacy order - %CODE5 and %CODE2 (shared part), %CODE1 and %CODE3 inside the LT_MSEG loop, then the table footer
// %CODE6, %CODE7, %CODE4 after the loop; every '*' comment in column 1; the debug breakpoint is not active.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const extract = JSON.parse(fs.readFileSync(path.join(root, 'docs/legacy_grab/YMMSLGRNNOTE_extract.json'), 'utf8'));
const xml = fs.readFileSync(path.join(root, 'src/ymmslgrnnote_int.sfpi.xml'), 'utf8');
const un = (s) => s.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const init = xml.match(/<INITIALIZATION>([\s\S]*?)<\/INITIALIZATION>/)[1]
  .split('\n').map((l) => l.trim()).filter(Boolean).map((l) => (l === '<FPCLINE/>' ? '' : un(l.replace(/^<FPCLINE>/, '').replace(/<\/FPCLINE>$/, ''))));
let fails = 0;
const fail = (m) => { fails++; console.log(`FAIL  ${m}`); };
const loopAt = init.findIndex((l) => l === 'LOOP AT lt_mseg INTO wa_mseg.');
const loopEnd = init.findIndex((l, i) => i > loopAt && l === 'ENDLOOP.');
if (loopAt < 0 || loopEnd < 0) fail('LT_MSEG loop missing');
let pos = -1;
for (const [name, where] of [['%CODE5', 'before'], ['%CODE2', 'before'], ['%CODE1', 'in'], ['%CODE3', 'in'], ['%CODE6', 'after'], ['%CODE7', 'after'], ['%CODE4', 'after']]) {
  const node = extract.codeNodes.find((c) => c.name === name);
  const lines = (node.code || node.lines || node.source).filter((l) => l.trim());
  let first = -1;
  let ok = true;
  for (const l of lines) {
    const at = init.findIndex((x, i) => i > pos && (x === l || x === `  ${l}`));
    if (at < 0) { fail(`${name}: line not found in order: ${l}`); ok = false; break; }
    if (first < 0) first = at;
    pos = at;
  }
  if (!ok) continue;
  const placed = where === 'before' ? pos < loopAt : where === 'in' ? first > loopAt && pos < loopEnd : first > loopEnd;
  if (!placed) fail(`${name}: not ${where} the item loop`);
  else console.log(`PASS  ${name}: ${lines.length} non-blank lines verbatim, in order, ${where} the item loop`);
}
if (init.some((l) => /^\s*break\s/i.test(l))) fail('an active BREAK statement is in the Initialization'); else console.log('PASS  no active breakpoint');
const bad = init.filter((l) => /^\s+\*/.test(l));
if (bad.length) fail(`indented '*' comments: ${bad.length}`); else console.log("PASS  every '*' comment in column 1");
console.log(fails ? `RESULT: ${fails} fail` : 'RESULT: no failures');
process.exit(fails ? 1 : 0);
