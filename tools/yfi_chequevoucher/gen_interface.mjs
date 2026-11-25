#!/usr/bin/env node
// YFI_CHEQUEVOUCHER_INT generator (Window-6, version 1 = exactly the legacy design, rulebook 2a).
// Rerun reproduces src/yfi_chequevoucher_int.sfpi.xml byte for byte:
//   node tools/yfi_chequevoucher/gen_interface.mjs
// 1. base from the shared builder (parameters, globals, %CODE2 verbatim - unconditional and order-independent);
// 2. BOLT additions: display tables for both legacy tables (the per-row program lines %CODE1 run verbatim in the
//    IT_FLEXA loop), every printed value prepared as text with the Smart Form's output conversion (WRITE),
//    the variant texts (reprint, company code 1220 signatories) decided once.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TOOLS = 'C:/Users/veere/Downloads/bolt-console-updated/bolt-console-updated/tools';
const EXTRACT = path.join(root, 'docs/legacy_grab/YFI_CHEQUEVOUCHER_extract.json');
const GRAB = path.join(root, 'vernasofttechie-yfi_chequevoucher/YFI_CHEQUEVOUCHER.md');
const OUT = path.join(root, 'src/yfi_chequevoucher_int.sfpi.xml');

const run = spawnSync(process.execPath, [`${TOOLS}/sfp_interface.mjs`, '--extract', EXTRACT, '--out', OUT,
  '--init-nodes', '%CODE2', '--grab', GRAB, '--force'], { encoding: 'utf8' });
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
// Statements inside a LOOP are indented; a '*' comment stays in column 1 (ABAP).
const indent = (lines) => lines.map((l) => (!l.trim() ? '' : l.startsWith('*') ? l : `  ${l}`));
// The Smart Form printed every &field& through WRITE (conversion exit, user date / number format, currency).
const out = (target, src, cur, append = false, pad = '') => [
  `${pad}WRITE ${src} TO lv_bolt_out${cur ? ` CURRENCY ${cur}` : ''}.`,
  `${pad}${target} = ${append ? `${target} && ` : ''}condense( lv_bolt_out ).`,
];

const TYPES = [
  '" BOLT: display rows of the two legacy tables, as printed',
  'TYPES: BEGIN OF ty_flexa_row,',
  '         budat  TYPE string,',
  '         logsys TYPE string,',
  '         descr  TYPE string,',
  '         rcntr  TYPE string,',
  '         prctr  TYPE string,',
  '         debit  TYPE string,',
  '         credit TYPE string,',
  '       END OF ty_flexa_row,',
  '       ty_flexa_tab TYPE STANDARD TABLE OF ty_flexa_row WITH EMPTY KEY.',
  'TYPES: BEGIN OF ty_bsak_row,',
  '         sgtxt1 TYPE string,',
  '         sgtxt  TYPE string,',
  '         wrbtr  TYPE string,',
  '       END OF ty_bsak_row,',
  '       ty_bsak_tab TYPE STANDARD TABLE OF ty_bsak_row WITH EMPTY KEY.',
];
const STRINGS = ['GV_ZALDT', 'GV_LIFNR', 'GV_VBLNR', 'GV_CHECT', 'GV_AMNT', 'GV_BANKN', 'GV_BANK_TEXT', 'GV_WAERS', 'GV_WORDS',
  'GV_VENDOR_NAME', 'GV_XBLNR', 'GV_INV_DOC', 'GV_INT_NUMBER', 'GV_PREPARER', 'GV_COMP_NAME', 'GV_COMP_LINE1',
  'GV_COMP_LINE2', 'GV_COMP_LINE3', 'GV_TOTAL_TXT', 'GV_DEBIT_TXT', 'GV_CREDIT_TXT', 'GV_REPRINT_TXT', 'GV_SIGN1_TITLE',
  'GV_SIGN2_TITLE'];
const GLOBALS = [['GT_FLEXA_ROWS', 'TY_FLEXA_TAB'], ['GT_BSAK_ROWS', 'TY_BSAK_TAB'], ...STRINGS.map((n) => [n, 'STRING'])];
const ADD_IN = ['IT_FLEXA', 'IT_BSAK', 'IS_T012K', 'IS_T012T', 'IS_LFA1', 'IV_SPELL', 'IV_XBLNR', 'IV_INV_DOC', 'IV_INT_NUMBER',
  'IV_NAME', 'LV_NAME1', 'LS_CEPC', 'IV_SGTXT1', 'IV_REPRINT', 'GV_TOTAL'];
const ADD_OUT = ['LS_FLEXA', 'IS_BSAK', 'LV_DEBIT', 'LV_CREDIT', ...GLOBALS.map(([n]) => n)];

const INIT = [
  '',
  '" ===== BOLT (Window-6): main window %WINDOW6, table %TABLE2 over IT_FLEXA =====================',
  '" %CODE1 ran once per row in the Smart Form. An Adobe table cannot run code, so it runs here,',
  '" verbatim, in a LOOP, and GT_FLEXA_ROWS keeps what the row printed (debit / credit by DRCRK).',
  'DATA lv_bolt_out TYPE c LENGTH 255.',
  'LOOP AT it_flexa INTO ls_flexa.',
  '* --- %CODE1 New Program Lines 1 (verbatim)',
  ...indent(node('%CODE1')),
  '  " BOLT: the cells of %ROW5 as printed',
  '  APPEND INITIAL LINE TO gt_flexa_rows ASSIGNING FIELD-SYMBOL(<lfs_flexa>).',
  ...out('<lfs_flexa>-budat', 'ls_flexa-budat', '', false, '  '),
  ...out('<lfs_flexa>-logsys', 'ls_flexa-logsys', '', false, '  '),
  '  " Description = &RFAREA&&SCNTR&&PPRCTR&&SFAREA& (no separators, as in the Smart Form)',
  ...out('<lfs_flexa>-descr', 'ls_flexa-rfarea', '', false, '  '),
  ...out('<lfs_flexa>-descr', 'ls_flexa-scntr', '', true, '  '),
  ...out('<lfs_flexa>-descr', 'ls_flexa-pprctr', '', true, '  '),
  ...out('<lfs_flexa>-descr', 'ls_flexa-sfarea', '', true, '  '),
  ...out('<lfs_flexa>-rcntr', 'ls_flexa-rcntr', '', false, '  '),
  ...out('<lfs_flexa>-prctr', 'ls_flexa-prctr', '', false, '  '),
  "  IF ls_flexa-drcrk = 'S'.",
  ...out('<lfs_flexa>-debit', 'ls_flexa-tsl', 'ls_flexa-rtcur', false, '    '),
  '  ENDIF.',
  "  IF ls_flexa-drcrk = 'H'.",
  ...out('<lfs_flexa>-credit', 'ls_flexa-tsl', 'ls_flexa-rtcur', false, '    '),
  '  ENDIF.',
  'ENDLOOP.',
  ...out('gv_debit_txt', 'lv_debit', ''),
  ...out('gv_credit_txt', 'lv_credit', ''),
  '',
  '" ===== BOLT (Window-6): window MAIN, table %TABLE1 over IT_BSAK (no program lines) ============',
  'LOOP AT it_bsak INTO is_bsak.',
  '  APPEND INITIAL LINE TO gt_bsak_rows ASSIGNING FIELD-SYMBOL(<lfs_bsak>).',
  '  <lfs_bsak>-sgtxt1 = iv_sgtxt1.',
  '  <lfs_bsak>-sgtxt  = is_bsak-sgtxt.',
  ...out('<lfs_bsak>-wrbtr', 'is_bsak-wrbtr', 'is_bsak-waers', false, '  '),
  'ENDLOOP.',
  '" GV_TOTAL is never filled by the legacy form (prints 0.00) - kept as it is (version 1 = legacy).',
  ...out('gv_total_txt', 'gv_total', ''),
  '',
  '" ===== BOLT (Window-6): the other printed values, as the Smart Form printed them ==============',
  ...out('gv_zaldt', 'is_payr-zaldt', ''),
  ...out('gv_lifnr', 'is_payr-lifnr', ''),
  ...out('gv_vblnr', 'is_payr-vblnr', ''),
  ...out('gv_chect', 'is_payr-chect', ''),
  ...out('gv_amnt', 'lv_amnt', ''),
  ...out('gv_bankn', 'is_t012k-bankn', ''),
  'gv_bank_text   = is_t012t-text1.',
  'gv_waers       = is_payr-waers.',
  'gv_words       = iv_spell-word.',
  'gv_vendor_name = is_lfa1-name1.',
  'gv_xblnr       = iv_xblnr.',
  'gv_inv_doc     = iv_inv_doc.',
  'gv_int_number  = iv_int_number.',
  'gv_preparer    = iv_name.',
  '" %WINDOW1 %TEXT2: &lv_name1(C)& (condensed) and the profit-centre address lines',
  'gv_comp_name  = condense( lv_name1 ).',
  'gv_comp_line1 = |({ ls_cepc-name1 })|.',
  'gv_comp_line2 = |{ ls_cepc-stras } { ls_cepc-ort01 }|.',
  'gv_comp_line3 = |{ ls_cepc-ort02 }{ ls_cepc-pfach }{ ls_cepc-pstlz }|.',
  '" %WINDOW1 %TEXT53 (IV_REPRINT = X) / %TEXT3 (IV_REPRINT = space)',
  "gv_reprint_txt = COND #( WHEN iv_reprint = 'X' THEN `(Reprint)` ).",
  '" %WINDOW2 %TEXT13 / COMP_1220 and %TEXT1 / COMP_1220_2 (company code 1220 = signatories A and B)',
  "gv_sign1_title = COND #( WHEN is_t012k-bukrs = '1220' THEN `SIGNATORY A`",
  '                         ELSE `Voucher controlled and accepted by audit` ).',
  "gv_sign2_title = COND #( WHEN is_t012k-bukrs = '1220' THEN `SIGNATORY B`",
  '                         ELSE `Voucher authorized by Head Of Department` ).',
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
