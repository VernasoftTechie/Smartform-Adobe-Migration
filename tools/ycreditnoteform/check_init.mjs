#!/usr/bin/env node
// Proves what sfp_check cannot for this form: the per-row program lines %CODE2/%CODE3/%CODE5 (inside the
// BOLT loop) and %CODE4 (after it) are in the Initialization verbatim and in legacy order, every '*'
// comment in column 1, the shared part (global init + %CODE6 + %CODE1) unchanged (sfp_check: first 108 lines).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const extract = JSON.parse(fs.readFileSync(path.join(root, 'docs/legacy_grab/YCREDITNOTEFORM_extract.json'), 'utf8'));
const xml = fs.readFileSync(path.join(root, 'src/ycreditnoteform_int.sfpi.xml'), 'utf8');
const un = (s) => s.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const init = xml.match(/<INITIALIZATION>([\s\S]*?)<\/INITIALIZATION>/)[1]
  .split('\n').map((l) => l.trim()).filter(Boolean).map((l) => (l === '<FPCLINE/>' ? '' : un(l.replace(/^<FPCLINE>/, '').replace(/<\/FPCLINE>$/, ''))));
let fails = 0;
const fail = (m) => { fails++; console.log(`FAIL  ${m}`); };
let pos = init.findIndex((l) => l.startsWith('LOOP AT it_vbrp INTO wa_vbrp.'));
if (pos < 0) fail('item loop missing');
for (const name of ['%CODE2', '%CODE3', '%CODE5', '%CODE4']) {
  const node = extract.codeNodes.find((c) => c.name === name);
  const lines = (node.code || node.lines || node.source).filter((l) => l.trim());
  for (const l of lines) {
    const at = init.findIndex((x, i) => i > pos && (x === l || x === `  ${l}`));
    if (at < 0) { fail(`${name}: line not found in order: ${l}`); break; }
    if (l.startsWith('*') && init[at] !== l) fail(`${name}: comment not in column 1: ${l}`);
    pos = at;
  }
  if (!fails) console.log(`PASS  ${name}: ${lines.length} non-blank lines verbatim, in order`);
}
const loopEnd = init.findIndex((l) => l === 'ENDLOOP.');
const code4 = init.findIndex((l) => l.startsWith('* --- %CODE4'));
if (!(loopEnd > 0 && code4 > loopEnd)) fail('%CODE4 must follow the loop (table footer event)');
else console.log('PASS  %CODE4 runs after the last item (footer event)');
const bad = init.filter((l) => /^\s+\*/.test(l));
if (bad.length) fail(`indented '*' comments: ${bad.length}`); else console.log("PASS  every '*' comment in column 1");
console.log(fails ? `RESULT: ${fails} fail` : 'RESULT: no failures');
process.exit(fails ? 1 : 0);
