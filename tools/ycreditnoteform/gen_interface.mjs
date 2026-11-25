#!/usr/bin/env node
// YCREDITNOTEFORM_INT generator (Window-5, version 1 = exactly the legacy design, rulebook 2a).
// Rerun reproduces src/ycreditnoteform_int.sfpi.xml byte for byte:
//   node tools/ycreditnoteform/gen_interface.mjs
// 1. base from the shared builder (parameters, globals, global initialization + %CODE6 + %CODE1 verbatim);
// 2. BOLT additions: display table type + prepared-text globals, the item loop running the per-row
//    program lines %CODE2 / %CODE3 / %CODE5 verbatim, %CODE4 verbatim after the loop, the window texts.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TOOLS = 'C:/Users/veere/Downloads/bolt-console-updated/bolt-console-updated/tools';
const EXTRACT = path.join(root, 'docs/legacy_grab/YCREDITNOTEFORM_extract.json');
const GRAB = path.join(root, 'vernasofttechie-ycreditnoteform/YCREDITNOTEFORM.md');
const OUT = path.join(root, 'src/ycreditnoteform_int.sfpi.xml');

// ---- 1. base ---------------------------------------------------------------------------------
const run = spawnSync(process.execPath, [`${TOOLS}/sfp_interface.mjs`, '--extract', EXTRACT, '--out', OUT,
  '--init-nodes', '%CODE6,%CODE1', '--grab', GRAB, '--force'], { encoding: 'utf8' });
if (run.status !== 0) { process.stderr.write(run.stdout + run.stderr); throw new Error('sfp_interface failed'); }

const extract = JSON.parse(fs.readFileSync(EXTRACT, 'utf8'));
const node = (name) => {
  const n = extract.codeNodes.find((c) => c.name === name);
  if (!n) throw new Error(`code node ${name} missing`);
  const lines = n.code || n.lines || n.source;
  if (!Array.isArray(lines)) throw new Error(`code node ${name}: no line array (keys ${Object.keys(n)})`);
  return lines;
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&apos;');
const fpc = (l) => (l === '' ? '      <FPCLINE/>' : `      <FPCLINE>${esc(l)}</FPCLINE>`);
// Indent statements inside the LOOP for readability; a '*' comment must stay in column 1 (ABAP).
const indent = (lines) => lines.map((l) => (!l.trim() ? '' : l.startsWith('*') ? l : `  ${l}`));

// ---- 2. BOLT additions -----------------------------------------------------------------------
const TYPES = [
  'TYPES: BEGIN OF ty_item,',
  '         slno    TYPE string,',
  '         details TYPE string,',
  '         amount  TYPE string,',
  '         total   TYPE string,',
  '       END OF ty_item.',
  'TYPES: ty_item_tab TYPE STANDARD TABLE OF ty_item WITH DEFAULT KEY.',
];
const GLOBALS = [
  ['GT_ITEMS', 'TY_ITEM_TAB'],
  ['GV_SHOW_TABLE', 'CHAR1'],
  ['GV_DOC_TITLE', 'STRING'],
  ['GV_ADVICE_TEXT', 'STRING'],
  ['GV_DOC_NO_LINE', 'STRING'],
  ['GV_DATE_LINE', 'STRING'],
  ['GV_TIN_LINE', 'STRING'],
  ['GV_WORDS_LINE', 'STRING'],
];
const ADD_IN = ['V2_BEZEI', 'V_FLAG'];
const ADD_OUT = ['WA_VBRP', 'V_SLNO', 'V_NETWR', 'TOT_NETWR', 'LS_SPELL', 'LV_TOTWORDS', ...GLOBALS.map(([n]) => n)];

const INIT = [
  '',
  '" ===== BOLT (Window-5): main window table %TABLE1 of YCREDITNOTEFORM ======================',
  '" The program lines of the item line (%CODE2, %CODE3) and of the TOTAL line (%CODE5) ran once',
  '" per item in the Smart Form. An Adobe table cannot run code, so they run here, verbatim, in a',
  '" LOOP over IT_VBRP, and GT_ITEMS keeps what the two lines printed (item + running TOTAL).',
  '" %TABLE1 prints only when V_FLAG = Y (every caller passes Y for ZG2 / ZL2): its code runs only then.',
  'DATA lv_bolt_amount TYPE c LENGTH 30.',
  'DATA lv_bolt_total  TYPE c LENGTH 30.',
  "gv_show_table = COND #( WHEN v_flag = 'Y' THEN abap_true ELSE abap_false ).",
  'IF gv_show_table = abap_true.',
  'LOOP AT it_vbrp INTO wa_vbrp.',
  '* --- %CODE2 New Program Lines 2 (verbatim)',
  ...indent(node('%CODE2')),
  '* --- %CODE3 New Program Lines 3 (verbatim)',
  ...indent(node('%CODE3')),
  '* --- %CODE5 New Program Lines 5 (verbatim)',
  ...indent(node('%CODE5')),
  '  " BOLT: texts of %ROW2 / %ROW3 as printed (WRITE = the output conversion of the Smart Form fields)',
  '  WRITE v_netwr TO lv_bolt_amount.',
  '  WRITE tot_netwr TO lv_bolt_total.',
  '  APPEND VALUE #( slno    = |  { v_slno }|',
  '                  details = |{ v2_bezei } in respect of sales order no { wa_vbrp-aubel ALPHA = OUT } date | &&',
  '                            |{ wa_vbrp-erdat DATE = USER } as per attached.|',
  '                  amount  = | { condense( lv_bolt_amount ) }|',
  '                  total   = | { condense( lv_bolt_total ) }| ) TO gt_items.',
  'ENDLOOP.',
  '',
  '* --- %CODE4 New Program Lines 4 (verbatim) - table footer event, after the last item',
  ...node('%CODE4'),
  'ENDIF.',
  '',
  '" ===== BOLT (Window-5): texts of the windows, prepared once (conditions as in the Smart Form) =====',
  '" CREDETNOTE window: %TEXT15 (ZG2) / %TEXT11 (ZL2)',
  "gv_doc_title = SWITCH #( v1_fkart WHEN 'ZG2' THEN `CREDIT NOTE`",
  "                                  WHEN 'ZL2' THEN `DEBIT NOTE` ).",
  '" TEXTWINDOW: %TEXT19 (ZL2) / %TEXT20 (ZG2)',
  "gv_advice_text = SWITCH #( v1_fkart WHEN 'ZL2' THEN `Be advised that your account has been debited as shown below:`",
  "                                    WHEN 'ZG2' THEN `Be advised that your account has been credited as shown below:` ).",
  '" DATEWINDOW: %TEXT2 (ZG2) / %TEXT21 (ZL2)',
  "gv_doc_no_line = SWITCH #( v1_fkart WHEN 'ZG2' THEN |CN NO:{ v1_vbeln ALPHA = OUT }|",
  "                                    WHEN 'ZL2' THEN |DN NO:{ v1_vbeln ALPHA = OUT }| ).",
  "gv_date_line = COND #( WHEN v1_fkart = 'ZG2' OR v1_fkart = 'ZL2' THEN |DATE :{ v_date }| ).",
  '" HEADERWINDOW %TEXT1 line 5 and the footer event line %TEXT10',
  'gv_tin_line   = |TIN { lv_tinno }|.',
  'gv_words_line = COND #( WHEN gv_show_table = abap_true THEN |AMOUNT IN WORDS:{ lv_totwords }.| ).',
];

let s = fs.readFileSync(OUT, 'utf8');
const once = (a, b) => { if (s.split(a).length !== 2) throw new Error(`anchor not unique: ${a}`); s = s.replace(a, () => b); };
const gdata = (n, t) => `      <SFPGDATA><NAME>${n}</NAME><TYPING>TYPE</TYPING><TYPENAME>${t}</TYPENAME><DEFAULTVAL/><CONSTANT/></SFPGDATA>`;
once('     </GLOBAL_DATA>\n', `${GLOBALS.map(([n, t]) => gdata(n, t)).join('\n')}\n     </GLOBAL_DATA>\n     <TYPES>\n${TYPES.map(fpc).join('\n')}\n     </TYPES>\n`);
if (/<TYPES>[\s\S]*<TYPES>/.test(s)) throw new Error('two TYPES sections - the base already had one');
const params = (tag, add) => {
  const m = s.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  if (!m) throw new Error(`${tag} missing`);
  const have = [...m[1].matchAll(/<FPPARAMETER>([^<]+)<\/FPPARAMETER>/g)].map((x) => x[1]);
  const extra = add.filter((n) => !have.includes(n));
  once(m[0], `<${tag}>${m[1]}${extra.map((n) => ` <FPPARAMETER>${n}</FPPARAMETER>\n     `).join('')}</${tag}>`);
};
params('INPUT_PARAMETERS', ADD_IN);
params('OUTPUT_PARAMETERS', ADD_OUT);
once('     </INITIALIZATION>', `${INIT.map(fpc).join('\n')}\n     </INITIALIZATION>`);
fs.writeFileSync(OUT, s);
console.log(`written ${path.relative(root, OUT)}: +${GLOBALS.length} globals, TYPES ${TYPES.length} lines, Initialization +${INIT.length} lines`);
