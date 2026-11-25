#!/usr/bin/env node
// YFI_BANKTRANSFER_INT generator (Window-7, version 1 = exactly the legacy design, rulebook 2a).
// Rerun reproduces src/yfi_banktransfer_int.sfpi.xml byte for byte:
//   node tools/yfi_banktransfer/gen_interface.mjs
// 1. base from the shared builder (parameters, globals, %CODE1 date text verbatim - unconditional, order-independent);
// 2. BOLT additions: display table for %TABLE1 (the table counter CNT -> LV_SERIAL becomes the row number, the
//    BLART = BT beneficiary rule), the letter body sentence, amounts and texts prepared as the Smart Form printed them.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TOOLS = 'C:/Users/veere/Downloads/bolt-console-updated/bolt-console-updated/tools';
const EXTRACT = path.join(root, 'docs/legacy_grab/YFI_BANKTRANSFER_extract.json');
const GRAB = path.join(root, 'vernasofttechie-yfi_banktransfer/YFI_BANKTRANSFER.md');
const OUT = path.join(root, 'src/yfi_banktransfer_int.sfpi.xml');

const run = spawnSync(process.execPath, [`${TOOLS}/sfp_interface.mjs`, '--extract', EXTRACT, '--out', OUT,
  '--init-nodes', '%CODE1', '--grab', GRAB, '--force'], { encoding: 'utf8' });
// The shared builder carries %CODE1's legacy parameter SY-DATUM into the Initialization's input list and its own
// check then fails ("not a declared parameter or global"): a system field is never an SFP coding parameter (it is
// always available). That one failure is expected here; SY-DATUM is removed below. Any other failure stops.
const fails = [...`${run.stdout}${run.stderr}`.matchAll(/^FAIL\s+(.*)$/gm)].map((m) => m[1]);
if (run.status !== 0 && !(fails.length === 1 && /^Initialization parameter SY-DATUM /.test(fails[0]))) {
  process.stderr.write(run.stdout + run.stderr); throw new Error('sfp_interface failed');
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&apos;');
const fpc = (l) => (l === '' ? '      <FPCLINE/>' : `      <FPCLINE>${esc(l)}</FPCLINE>`);
const out = (target, src, pad = '') => [`${pad}WRITE ${src} TO lv_bolt_out.`, `${pad}${target} = condense( lv_bolt_out ).`];

const TYPES = [
  'TYPES: BEGIN OF ty_xfer_row,',
  '         slno        TYPE string,',
  '         ref         TYPE string,',
  '         beneficiary TYPE string,',
  '         banka       TYPE string,',
  '         brnch       TYPE string,',
  '         bankl       TYPE string,',
  '         bankn       TYPE string,',
  '         wrbtr       TYPE string,',
  '       END OF ty_xfer_row.',
  'TYPES: ty_xfer_tab TYPE STANDARD TABLE OF ty_xfer_row WITH DEFAULT KEY.',
];
const STRINGS = ['GV_DATE_TXT', 'GV_BODY_TXT', 'GV_CURR_TXT', 'GV_WATERMARK_TXT', 'GV_NAME1_TXT'];
const GLOBALS = [['GT_XFER_ROWS', 'TY_XFER_TAB'], ...STRINGS.map((n) => [n, 'STRING'])];
const ADD_IN = ['IT_XFER_DETAILS', 'IS_BSIS', 'IV_BANK_NAME', 'IV_BANK_ACCNT', 'IV_AMNT_WORDS', 'IV_TRANSACTION_AMNT', 'IV_CURR', 'LV_WATERMARK', 'LV_NAME1'];
const ADD_OUT = ['LS_XFER_DETAILS', 'LV_SERIAL', ...GLOBALS.map(([n]) => n)];

const INIT = [
  '',
  '" ===== BOLT (Window-7): main window, table %TABLE1 over IT_XFER_DETAILS ======================',
  '" The Smart Form numbered the rows with a table counter (calculation CNT -> LV_SERIAL); an Adobe',
  '" table has no counter, so the rows are numbered here. Beneficiary: %TEXT8 (BLART = BT) /',
  '" %TEXT20 (BLART <> BT).',
  'DATA lv_bolt_out TYPE c LENGTH 255.',
  'CLEAR lv_serial.',
  'LOOP AT it_xfer_details INTO ls_xfer_details.',
  '  lv_serial = lv_serial + 1.',
  '  APPEND INITIAL LINE TO gt_xfer_rows ASSIGNING FIELD-SYMBOL(<lfs_row>).',
  ...out('<lfs_row>-slno', 'lv_serial', '  '),
  ...out('<lfs_row>-ref', 'ls_xfer_details-ref', '  '),
  "  <lfs_row>-beneficiary = COND #( WHEN ls_xfer_details-blart = 'BT' THEN `DANGOTE CEMENT PLC`",
  '                                  ELSE ls_xfer_details-name1 ).',
  ...out('<lfs_row>-banka', 'ls_xfer_details-banka', '  '),
  ...out('<lfs_row>-brnch', 'ls_xfer_details-brnch', '  '),
  ...out('<lfs_row>-bankl', 'ls_xfer_details-bankl', '  '),
  ...out('<lfs_row>-bankn', 'ls_xfer_details-bankn', '  '),
  '  " WRBTR: reference field declared in the form (REFFIELDS): IS_BSIS-WAERS',
  '  WRITE ls_xfer_details-wrbtr TO lv_bolt_out CURRENCY is_bsis-waers.',
  '  <lfs_row>-wrbtr = condense( lv_bolt_out ).',
  'ENDLOOP.',
  '',
  '" ===== BOLT (Window-7): the other printed texts, as the Smart Form printed them ================',
  '" BANK_ADDRESS: &lv_date2(C)& (date text of %CODE1, condensed)',
  'gv_date_txt = condense( lv_date2 ).',
  '" LETER_BODY: the sentence with its three continuation lines joined by a blank, amount (C) condensed',
  'WRITE iv_transaction_amnt TO lv_bolt_out.',
  'gv_body_txt = |Kindly use this letter as an authority to debit our { iv_bank_name } { iv_bank_accnt } | &&',
  '              |with the sum of { iv_curr } { condense( lv_bolt_out ) } ( { iv_amnt_words }) | &&',
  '              |and transfer to the beneficiary(ies) detailed below :|.',
  '" %TABLE1 heading of the amount column: [&iv_curr&]',
  'gv_curr_txt = |[{ iv_curr }]|.',
  '" WATERMARK window %TEXT17 (LV_WATERMARK = X: reprint)',
  "gv_watermark_txt = COND #( WHEN lv_watermark = 'X' THEN `Re-Printed` ).",
  '" table footer %TEXT18: &lv_name1(C)&',
  'gv_name1_txt = condense( lv_name1 ).',
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
once('      <FPPARAMETER>SY-DATUM</FPPARAMETER>\n', '');
params('INPUT_PARAMETERS', ADD_IN);
params('OUTPUT_PARAMETERS', ADD_OUT);
once('     </INITIALIZATION>', `${INIT.map(fpc).join('\n')}\n     </INITIALIZATION>`);
fs.writeFileSync(OUT, s);
console.log(`written ${path.relative(root, OUT)}: +${GLOBALS.length} globals, TYPES ${TYPES.length} lines, Initialization +${INIT.length} lines`);
