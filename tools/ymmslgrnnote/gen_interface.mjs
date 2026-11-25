#!/usr/bin/env node
// YMMSLGRNNOTE_INT generator (Window-8, version 1 = exactly the legacy design, rulebook 2a).
// Rerun reproduces src/ymmslgrnnote_int.sfpi.xml byte for byte:   node tools/ymmslgrnnote/gen_interface.mjs
// 1. base from the shared builder (parameters, globals, TYPES, %CODE5 company name and %CODE2 date - both unconditional,
//    order-independent); system fields are removed from the coding parameters (F87);
// 2. BOLT additions: the item table (%CODE1, %CODE3 verbatim per item), the table footer (%CODE6, %CODE7, %CODE4 verbatim,
//    in the legacy order, every printed value taken at the moment its line printed), header variants (plants 1000 / 1100),
//    the template values and the footer line. The form declares no currency / quantity reference fields (REFFIELDS),
//    so every amount and quantity prints with the decimals of its type: plain WRITE, as the Smart Form did.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TOOLS = 'C:/Users/veere/Downloads/bolt-console-updated/bolt-console-updated/tools';
const EXTRACT = path.join(root, 'docs/legacy_grab/YMMSLGRNNOTE_extract.json');
const GRAB = path.join(root, 'vernasofttechie-ymmslgrnnote/YMMSLGRNNOTE.md');
const OUT = path.join(root, 'src/ymmslgrnnote_int.sfpi.xml');

const run = spawnSync(process.execPath, [`${TOOLS}/sfp_interface.mjs`, '--extract', EXTRACT, '--out', OUT,
  '--init-nodes', '%CODE5,%CODE2', '--force'], { encoding: 'utf8' });
// No --grab: its section 2c lists 17 CURR / QUAN columns of ZEXTRA_FIELD without a reference. References matter only
// for fields that reach the Context (F50 / F54); version 1 binds prepared text only (GT_ITEM_ROWS, GV_*), so none is
// declared and the legacy contract stays unchanged (no added unit / currency parameters).
void GRAB;
// Expected builder failures (F87): legacy program-lines parameters that are system fields (SY-DATUM) or components
// (LS_MKPF-BLDAT) are copied as SFP coding parameters; SFP takes whole parameters / globals only. Fixed below.
const fails = [...`${run.stdout}${run.stderr}`.matchAll(/^FAIL\s+(.*)$/gm)].map((m) => m[1]);
if (run.status !== 0 && !(fails.length && fails.every((f) => /parameter (SY-[A-Z]+|[A-Z0-9_]+-[A-Z0-9_]+) is not a declared/.test(f)))) {
  process.stderr.write(run.stdout + run.stderr); throw new Error('sfp_interface failed');
}

const extract = JSON.parse(fs.readFileSync(EXTRACT, 'utf8'));
const node = (name) => {
  const n = extract.codeNodes.find((c) => c.name === name);
  if (!n) throw new Error(`code node ${name} missing`);
  const lines = n.code || n.lines || n.source;
  if (!Array.isArray(lines)) throw new Error(`code node ${name}: no line array`);
  return lines;
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&apos;');
const fpc = (l) => (l === '' ? '      <FPCLINE/>' : `      <FPCLINE>${esc(l)}</FPCLINE>`);
const indent = (lines) => lines.map((l) => (!l.trim() ? '' : l.startsWith('*') ? l : `  ${l}`));
const out = (target, src, pad = '') => [`${pad}WRITE ${src} TO lv_bolt_out.`, `${pad}${target} = condense( lv_bolt_out ).`];
const XOF = "wa_mseg-waers = 'XOF' OR wa_mseg-waers = 'XAF'";

const TYPES = [
  '" BOLT: display rows of %TABLE1 (LT_MSEG), as printed',
  'TYPES: BEGIN OF ty_item_row,',
  '         zeile  TYPE string,',
  '         matnr  TYPE string,',
  '         sgtxt  TYPE string,',
  '         erfme  TYPE string,',
  '         erfmg  TYPE string,',
  '         lgpla  TYPE string,',
  '         urate  TYPE string,',
  '         amount TYPE string,',
  '       END OF ty_item_row,',
  '       ty_item_tab TYPE STANDARD TABLE OF ty_item_row WITH EMPTY KEY.',
];
const STRINGS = ['GV_HDR_L1', 'GV_HDR_L2', 'GV_HDR_L3', 'GV_HDR_L4', 'GV_GRN_NO', 'GV_GRN_DATE', 'GV_SUPPLIER', 'GV_WAYBILL',
  'GV_INVOICE', 'GV_TRANSPORTER', 'GV_VEHICLE', 'GV_LPR', 'GV_LPO', 'GV_DEPT', 'GV_SECTION', 'GV_AWB_NO', 'GV_AWB_DATE',
  'GV_SHIP', 'GV_AGENT', 'GV_LC_NO', 'GV_FORM_M', 'GV_CONTAINER', 'GV_CURR_RATE', 'GV_GROSS_TXT', 'GV_VAT_TXT',
  'GV_FREIGHT_LBL', 'GV_FREIGHT_TXT', 'GV_TOTAL_TXT', 'GV_FOOTER_TXT', 'GV_END_TXT'];
const GLOBALS = [['GT_ITEM_ROWS', 'TY_ITEM_TAB'], ...STRINGS.map((n) => [n, 'STRING'])];
const ADD_IN = ['LT_MSEG', 'LS_MKPF', 'LS_T001W', 'LS_EBAN', 'LS_EKKO', 'LS_LFA1', 'IV_WAERS', 'IV_KURSF', 'LV_BUTXT', 'DATE'];
const ADD_OUT = ['WA_MSEG', 'LV_UNIT', 'LV_UNIT_XOF', 'LV_AMOUNT', 'VAT', 'SUM', 'FINAL_AMT', 'LV_VAT_XOF', 'LV_SUM_XOF',
  'FINAL_AMT_XOF', 'TOT_AMNT', 'TOT_AMNT_XOF', ...GLOBALS.map(([n]) => n)];

const INIT = [
  '',
  '" ===== BOLT (Window-8): main window, table %TABLE1 over LT_MSEG ===============================',
  '" %CODE1 (unit rate) and %CODE3 (amount, VAT, freight sum) ran once per item in the Smart Form.',
  '" An Adobe table cannot run code, so they run here, verbatim, in a LOOP; GT_ITEM_ROWS keeps what',
  '" the row printed (XOF / XAF: the whole-number amounts of %TEXT32 / %TEXT33).',
  'DATA lv_bolt_out TYPE c LENGTH 255.',
  'DATA lv_bolt_a   TYPE string.',
  'DATA lv_bolt_b   TYPE string.',
  'LOOP AT lt_mseg INTO wa_mseg.',
  '* --- %CODE1 New Program Lines 1 (verbatim)',
  ...indent(node('%CODE1')),
  '* --- %CODE3 New Program Lines 3 (verbatim)',
  ...indent(node('%CODE3')),
  '  " BOLT: the cells of %ROW2 as printed',
  '  APPEND INITIAL LINE TO gt_item_rows ASSIGNING FIELD-SYMBOL(<lfs_item>).',
  ...out('<lfs_item>-zeile', 'wa_mseg-zeile', '  '),
  ...out('<lfs_item>-matnr', 'wa_mseg-matnr', '  '),
  '  <lfs_item>-sgtxt = wa_mseg-sgtxt.',
  ...out('<lfs_item>-erfme', 'wa_mseg-erfme', '  '),
  ...out('<lfs_item>-erfmg', 'wa_mseg-erfmg', '  '),
  ...out('<lfs_item>-lgpla', 'wa_mseg-lgpla', '  '),
  `  IF ${XOF}.`,
  ...out('<lfs_item>-urate', 'lv_unit_xof', '    '),
  ...out('<lfs_item>-amount', 'final_amt_xof', '    '),
  '  ELSE.',
  ...out('<lfs_item>-urate', 'lv_unit', '    '),
  ...out('<lfs_item>-amount', 'final_amt', '    '),
  '  ENDIF.',
  'ENDLOOP.',
  '',
  '" ===== BOLT (Window-8): table footer, in the legacy order (WA_MSEG = the last item) ===========',
  '" Each footer line printed its value at the moment it was processed - taken here the same way.',
  '* --- %CODE6 New Program Lines 6 (verbatim) - row "Gross:"',
  ...node('%CODE6'),
  `IF ${XOF}.`,
  ...out('gv_gross_txt', 'tot_amnt_xof', '  '),
  ...out('gv_vat_txt', 'lv_vat_xof', '  '),
  'ELSE.',
  ...out('gv_gross_txt', 'tot_amnt', '  '),
  ...out('gv_vat_txt', 'vat', '  '),
  'ENDIF.',
  "gv_freight_lbl = COND #( WHEN wa_mseg-bwart <> '103' THEN `Freight and other charge :` ).",
  '* --- %CODE7 New Program Lines 7 (verbatim) - row "Freight and other charge"',
  ...node('%CODE7'),
  '" %TEXT28: BWART <> 103 AND WAERS = XOF OR WAERS = XAF (generated ABAP: AND before OR) / %TEXT36',
  "IF ( wa_mseg-bwart <> '103' AND wa_mseg-waers = 'XOF' ) OR wa_mseg-waers = 'XAF'.",
  ...out('gv_freight_txt', 'lv_sum_xof', '  '),
  "ELSEIF wa_mseg-bwart <> '103' AND wa_mseg-waers <> 'XOF' AND wa_mseg-waers <> 'XAF'.",
  ...out('gv_freight_txt', 'sum', '  '),
  'ENDIF.',
  '* --- %CODE4 New Program Lines 4 (verbatim) - row "Total Amount:"',
  ...node('%CODE4'),
  `IF ${XOF}.`,
  ...out('gv_total_txt', 'tot_amnt_xof', '  '),
  'ELSE.',
  ...out('gv_total_txt', 'tot_amnt', '  '),
  'ENDIF.',
  '',
  '" ===== BOLT (Window-8): header window %TEXT1 / %TEXT29 (plants 1000 and 1100) ================',
  'lv_bolt_a = |{ ls_t001w-stras },{ ls_t001w-pfach },{ ls_t001w-ort01 }|.',
  "IF ls_t001w-werks = '1000' OR ls_t001w-werks = '1100'.",
  '  gv_hdr_l1 = `Dangote Cement PLC.`.',
  '  gv_hdr_l2 = lv_bolt_a.',
  '  gv_hdr_l3 = `Goods Receipt Note`.',
  '  CLEAR gv_hdr_l4.',
  'ELSE.',
  '  gv_hdr_l1 = lv_butxt.',
  '  gv_hdr_l2 = ls_t001w-name1.',
  '  gv_hdr_l3 = lv_bolt_a.',
  '  gv_hdr_l4 = `Goods Receipt Note`.',
  'ENDIF.',
  '" DATE window',
  ...out('gv_grn_no', 'ls_mkpf-mblnr'),
  ...out('gv_grn_date', 'ls_mkpf-budat'),
  '" TEMPLATE window %TEXT3 / %TEXT4: the values after each label (<(>&<)> and && print "&")',
  'gv_supplier = ls_lfa1-name1.',
  ...out('lv_bolt_a', 'ls_mkpf-way_bii_no'), ...out('lv_bolt_b', 'ls_mkpf-way_bil_dt'),
  'gv_waybill = |{ lv_bolt_a } & { lv_bolt_b }|.',
  ...out('lv_bolt_a', 'ls_mkpf-vendor_inv'), ...out('lv_bolt_b', 'ls_mkpf-vend_inv'),
  'gv_invoice = |{ lv_bolt_a } & { lv_bolt_b }|.',
  ...out('gv_transporter', 'ls_mkpf-transporter'),
  ...out('gv_vehicle', 'ls_mkpf-vehicle_no'),
  ...out('lv_bolt_a', 'ls_eban-banfn'), ...out('lv_bolt_b', 'ls_eban-badat'),
  'gv_lpr = |{ lv_bolt_a }&{ lv_bolt_b }|.',
  ...out('lv_bolt_a', 'ls_ekko-ebeln'), ...out('lv_bolt_b', 'ls_ekko-bedat'),
  'gv_lpo = |{ lv_bolt_a }&{ lv_bolt_b }|.',
  ...out('gv_dept', 'ls_eban-mfrpn'),
  ...out('gv_section', 'ls_eban-bednr'),
  ...out('gv_awb_no', 'ls_mkpf-awb_no_bol'),
  ...out('gv_awb_date', 'ls_mkpf-awb_dt_bol'),
  ...out('gv_ship', 'ls_mkpf-ship_flight'),
  ...out('gv_agent', 'ls_mkpf-clear_agnt'),
  ...out('gv_lc_no', 'ls_mkpf-lc_no'),
  ...out('gv_form_m', 'ls_mkpf-form_m'),
  ...out('gv_container', 'ls_mkpf-container'),
  ...out('lv_bolt_a', 'iv_kursf'),
  'gv_curr_rate = |{ iv_waers } / { lv_bolt_a }|.',
  '" FOOTER window %TEXT22: date (%CODE2), time, GRN no. - "page X of Y" is added by the layout',
  ...out('lv_bolt_a', 'ls_mkpf-cputm'),
  'gv_footer_txt = |{ date },{ lv_bolt_a } GRN No.: { gv_grn_no } page|.',
  '" SIGNATURE window %TEXT21 last line',
  'gv_end_txt = |End Of GRN Report For Supplier { ls_lfa1-name1 }|.',
];

let s = fs.readFileSync(OUT, 'utf8');
const once = (a, b) => { if (s.split(a).length !== 2) throw new Error(`anchor not unique: ${a}`); s = s.replace(a, () => b); };
// System fields are never SFP coding parameters; a component stands for its parameter / global (F87).
s = s.replace(/ *<FPPARAMETER>SY-[A-Z]+<\/FPPARAMETER>\n/g, '');
for (const tag of ['INPUT_PARAMETERS', 'OUTPUT_PARAMETERS']) {
  s = s.replace(new RegExp(`(<${tag}>)([\\s\\S]*?)(</${tag}>)`), (all, open, body, close) => {
    const seen = new Set();
    const lines = body.split('\n').map((l) => {
      const m = l.match(/^(\s*)<FPPARAMETER>([^<]+)<\/FPPARAMETER>$/);
      if (!m) return l;
      const name = m[2].split('-')[0];
      if (seen.has(name)) return null;
      seen.add(name);
      return `${m[1]}<FPPARAMETER>${name}</FPPARAMETER>`;
    }).filter((l) => l !== null);
    return open + lines.join('\n') + close;
  });
}
// The legacy global initialization is only "break abap1." - a debug breakpoint for one user, no effect on the output.
once('      <FPCLINE>break abap1.</FPCLINE>', fpc('* BOLT: break abap1.  (debug breakpoint of the legacy form for user ABAP1 - not carried, no effect on the output)'));
const gdata = (n, t) => `      <SFPGDATA><NAME>${n}</NAME><TYPING>TYPE</TYPING><TYPENAME>${t}</TYPENAME><DEFAULTVAL/><CONSTANT/></SFPGDATA>`;
once('     </GLOBAL_DATA>\n', `${GLOBALS.map(([n, t]) => gdata(n, t)).join('\n')}\n     </GLOBAL_DATA>\n`);
if (/<TYPES>/.test(s)) once('     </TYPES>', `${TYPES.map(fpc).join('\n')}\n     </TYPES>`);
else once('     </GLOBAL_DATA>\n', `     </GLOBAL_DATA>\n     <TYPES>\n${TYPES.map(fpc).join('\n')}\n     </TYPES>\n`);
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
console.log(`written ${path.relative(root, OUT)}: +${GLOBALS.length} globals, TYPES +${TYPES.length} lines, Initialization +${INIT.length} lines`);
