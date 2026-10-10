// Build src/zmmcg_po_sf_int.sfpi.xml: tool-built base (parameters, legacy globals/types, TY_TLINE_TAB)
// + display types/globals + composed Initialization + input/output lists.
//   node finalize_interface.mjs <repo>
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// shared Bolt Console tools (sfp_interface.mjs, lib/sfp.mjs); override with BOLT_TOOLS
const TOOLS = process.env.BOLT_TOOLS || 'C:/Users/veere/Downloads/bolt-console-updated/bolt-console-updated/tools';
const repo = process.argv[2];
process.chdir(repo);
const SCR = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const { initLines, initDeviations } = await import('file:///' + SCR + '/build_init.mjs?x=' + Date.now());
const { parseInterface, read } = await import('file:///' + TOOLS + '/lib/sfp.mjs');

const OUT = 'src/zmmcg_po_sf_int.sfpi.xml';
const base = spawnSync(process.execPath, [`${TOOLS}/sfp_interface.mjs`, '--extract', 'docs/legacy_grab/ZMMCG_PO_SF_extract.json', '--out', OUT, '--grab', 'vernasofttechie-zmmcg_po_sf/ZMMCG_PO_SF.md', '--text', 'ZMMCG_PO_SF interface', '--force'], { encoding: 'utf8' });
if (base.status !== 0 && base.status !== null && !/no failures/.test(base.stdout)) { console.error(base.stdout, base.stderr); process.exit(2); }

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&apos;');
const fpc = (l) => (l.length ? `      <FPCLINE>${esc(l)}</FPCLINE>` : '      <FPCLINE/>');

// ---- new types (declared after the legacy TYPES and the tool's TY_TLINE_TAB)
const newTypes = [
  'TYPES: BEGIN OF ty_s_goods,',
  '         seqno TYPE i,',
  '         slno  TYPE c LENGTH 20,',
  '         matnr TYPE c LENGTH 40,',
  '         descr TYPE string,',
  '         menge TYPE c LENGTH 40,',
  '         meins TYPE c LENGTH 20,',
  '         netpr TYPE c LENGTH 40,',
  '         netwr TYPE c LENGTH 40,',
  '       END OF ty_s_goods.',
  'TYPES: ty_t_goods TYPE STANDARD TABLE OF ty_s_goods WITH DEFAULT KEY.',
  'TYPES: BEGIN OF ty_s_service,',
  '         seqno  TYPE i,',
  '         slno   TYPE c LENGTH 20,',
  '         srvpos TYPE c LENGTH 40,',
  '         descr  TYPE string,',
  '         menge  TYPE c LENGTH 40,',
  '         meins  TYPE c LENGTH 20,',
  '         unitpr TYPE c LENGTH 40,',
  '         total  TYPE c LENGTH 40,',
  '       END OF ty_s_service.',
  'TYPES: ty_t_service TYPE STANDARD TABLE OF ty_s_service WITH DEFAULT KEY.',
  'TYPES: BEGIN OF ty_s_totals,',
  '         gross TYPE c LENGTH 40,',
  '         dis   TYPE c LENGTH 40,',
  '         frg   TYPE c LENGTH 40,',
  '         oth   TYPE c LENGTH 40,',
  '         sub   TYPE c LENGTH 40,',
  '         vat   TYPE c LENGTH 40,',
  '         ca    TYPE c LENGTH 40,',
  '         total TYPE c LENGTH 40,',
  '       END OF ty_s_totals.',
];
const newGlobals = [
  ['GT_GOODS', 'TY_T_GOODS'], ['GT_SERVICE', 'TY_T_SERVICE'], ['GS_TOTALS', 'TY_S_TOTALS'], ['GV_LANGU', 'SYLANGU'], ['GV_LIFNR_OUT', 'C LENGTH 20'], ['GV_HDRTXT', 'STRING'], ['GV_TERM1_ZPOS', 'STRING'],
];

let xml = fs.readFileSync(OUT, 'utf8');
xml = xml.replace('     </TYPES>', `${newTypes.map(fpc).join('\n')}\n     </TYPES>`);
xml = xml.replace('     </GLOBAL_DATA>', `${newGlobals.map(([n, t]) => `      <SFPGDATA><NAME>${n}</NAME><TYPING>TYPE</TYPING><TYPENAME>${t}</TYPENAME><DEFAULTVAL/><CONSTANT/></SFPGDATA>`).join('\n')}\n     </GLOBAL_DATA>`);

// ---- which interface symbols does the Initialization use?
let I = parseInterface(xml);
const names = new Map(); // upper -> kind
for (const p of I.imports) names.set(p.name.toUpperCase(), 'import');
for (const p of I.tables) names.set(p.name.toUpperCase(), 'table');
for (const p of I.globals) names.set(p.name.toUpperCase(), 'global');
const localDecl = new Set();
const code = initLines
  .filter((l) => !/^\s*\*/.test(l))
  .map((l) => l.replace(/"[^'|]*$/, (m) => (/'/.test(m) ? m : '')).replace(/'[^']*'/g, "''"));
const text = code.join('\n');
for (const m of text.matchAll(/\bDATA\s*:?\s*([\s\S]*?)\./gi)) for (const d of m[1].split(',')) { const nm = /^\s*(\w+)/.exec(d); if (nm) localDecl.add(nm[1].toUpperCase()); }
const used = new Map();
for (const m of text.matchAll(/[A-Za-z_][A-Za-z0-9_]*/g)) {
  const u = m[0].toUpperCase();
  if (names.has(u) && !used.has(u)) used.set(u, names.get(u));
}
const clash = [...localDecl].filter((n) => names.has(n));
if (clash.length) { console.error(`LOCAL DATA clashes with interface symbols: ${clash.join(', ')}`); process.exit(3); }
const inputs = [...used.keys()];
const outputs = [...used].filter(([, k]) => k === 'global').map(([n]) => n);

const list = (tag, arr) => `<${tag}>\n${arr.map((n) => `      <FPPARAMETER>${n}</FPPARAMETER>`).join('\n')}\n     </${tag}>`;
xml = xml.replace(/<INPUT_PARAMETERS>[\s\S]*?<\/INPUT_PARAMETERS>/, list('INPUT_PARAMETERS', inputs));
xml = xml.replace(/<OUTPUT_PARAMETERS>[\s\S]*?<\/OUTPUT_PARAMETERS>/, list('OUTPUT_PARAMETERS', outputs));
xml = xml.replace(/<INITIALIZATION>[\s\S]*?<\/INITIALIZATION>/, `<INITIALIZATION>\n${initLines.map(fpc).join('\n')}\n     </INITIALIZATION>`);
fs.writeFileSync(OUT, xml, 'utf8');

console.log(`interface written: ${initLines.length} Initialization lines, ${inputs.length} input / ${outputs.length} output parameters`);
console.log('imports/tables used (input only):', [...used].filter(([, k]) => k !== 'global').map(([n]) => n).join(', '));
console.log('globals used (input+output):', outputs.join(', '));
console.log('unused interface symbols:', [...names.keys()].filter((n) => !used.has(n)).join(', '));
console.log('local DATA:', [...localDecl].join(', '));
fs.writeFileSync(path.join(process.env.SCRATCH_OUT || '.', 'init_deviations.txt'), initDeviations.join('\n'));
