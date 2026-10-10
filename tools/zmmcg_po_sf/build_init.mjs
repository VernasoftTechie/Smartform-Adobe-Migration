// Compose the ZMMCG_PO_SF Initialization from the legacy program-lines nodes (verbatim) + glue,
// write the reviewable .abap copy and patch the tool-built interface (.sfpi.xml).
//   node build_init.mjs <repo>
import fs from 'node:fs';
// ABAP glue kept as plain text (no JS quoting)
import path from 'node:path';
const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const extraLines = () => fs.readFileSync(path.join(HERE, 'init_extra.abap'), 'utf8').split(/\r?\n/).slice(0, -1);

const repo = process.argv[2];
const ex = JSON.parse(fs.readFileSync(path.join(repo, 'docs/legacy_grab/ZMMCG_PO_SF_extract.json'), 'utf8'));
const node = (n) => { const c = ex.codeNodes.find((x) => x.name === n); if (!c) throw new Error(`no node ${n}`); return c.code.slice(); };
const trim = (a) => { let i = 0; let j = a.length; while (i < j && !a[i].trim()) i++; while (j > i && !a[j - 1].trim()) j--; return a.slice(i, j); };
const deviations = [];

// legacy node, verbatim, minus declared-away lines (by index) and debugger statements
function legacy(n, { drop = [], rename = null, note = null } = {}) {
  const src = node(n);
  const out = [];
  src.forEach((l, i) => {
    if (drop.includes(i)) return;
    if (/^\s*break(-point)?\b/i.test(l)) { deviations.push(`${n}: dropped debugger statement "${l.trim()}"`); return; }
    out.push(rename ? l.replace(rename[0], rename[1]) : l);
  });
  if (drop.length) deviations.push(`${n}: dropped declaration line(s) ${drop.join(',')} (hoisted to the single declaration block)`);
  if (rename) deviations.push(`${n}: renamed ${rename[0]} -> ${rename[1]}`);
  return [`*--- legacy node ${n}${note ? ' ' + note : ''}`, ...trim(out)];
}
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

const L = [];
const add = (...x) => L.push(...x.flat());

// ---------------------------------------------------------------- global initialization (verbatim)
add(...trim(ex.globalCoding));
add('');
add('*----------------------------------------------------------------------*');
add('* ZMMCG_PO_SF: the legacy program-lines nodes are re-hosted below because an');
add('* Adobe form has no per-window / per-row / per-footer code. Legacy code is');
add('* verbatim; every change is marked "BOLT:". Display tables / totals are what the');
add('* layout prints (formatted exactly as the Smart Form printed the same variables).');
add('*----------------------------------------------------------------------*');
add('* BOLT: one declaration block - the nodes declared the same locals one by one.');
add('DATA: lv_name        TYPE thead-tdname,');
add('      lv_id          TYPE thead-tdid,');
add('      v_kwert1       TYPE wmto_s-amount,');
add('      lv_amt_i       TYPE int8_lew,    "goods words (legacy %CODE85)');
add('      lv_amt_is      TYPE int4,        "service words (legacy %CODE12 declared int4)');
add('      lv_string      TYPE string,');
add('      lv_c1          TYPE string,');
add('      lv_c2          TYPE string,');
add('      lv_birr        TYPE string,');
add('      lv_satim       TYPE string,');
add('      lv_lang        LIKE sy-langu VALUE \'F\',');
add('      lt_zpos        TYPE ty_tline_tab,');
add('      ls_zpos        TYPE tline,');
add('      ls_goods       TYPE ty_s_goods,');
add('      ls_service     TYPE ty_s_service.');
add('');
add('* BOLT: Smart Forms start every document with empty globals; make that explicit.');
add('CLEAR: v_slno, g_netwr, lv_flag, v_dis, v_frg, v_ins, v_oth, v_sub, v_total, v_totali,');
add('       lv_vat, lv_ca, sub_total, vat, total, v_total1, gflag, lv_unitprice1, lv_total1,');
add('       gt_goods, gt_service, gs_totals, gv_lifnr_out, gv_hdrtxt, gv_term1_zpos.');
add('gv_langu = sy-langu.');
add('');

// ---------------------------------------------------------------- window / header level nodes
add(legacy('%CODE32', { note: '(WATER_MARK window: approved flag)' }), '');
add(legacy('COMP_PLANT_ADDRESS', { note: '(DELVRY_ADD window: plant address text into LT_ADRC)' }), '');
add(legacy('%CODE33', { note: '(PO_LAST_CHANGED window)' }), '');
add(legacy('%CODE11', { note: '(SUPPLIER_ADD window: supplying plant address for STO)' }), '');
add(legacy('%CODE27', { note: '(PO_DETAIL window: PO date text)' }), '');
add('* BOLT: %CODE28 shares the locals of %CODE27 here, so they are cleared exactly as a fresh node would have them.');
add('CLEAR: lv_mnth, lv_mnthtxt.');
add(legacy('%CODE28', { drop: [0, 1], note: '(PO_DETAIL window: delivery date text)' }), '');
add(legacy('%CODE34', { note: '(TABLE_DATA main window: header text F01/EKKO into LT_LINES)' }), '');
add('');
add(...extraLines());

// ---------------------------------------------------------------- goods PO (V_FLAG = X)
add('IF v_flag = \'X\'.');
add('*==================== goods purchase order (legacy table OTHER_PO over IT_EKPO, V_FLAG = X)');
add('  LOOP AT it_ekpo INTO wa_ekpo.');
add(legacy('%CODE2', { drop: [9], note: '(column 1: serial number, item text)' }));
add(legacy('%CODE9', { drop: [0, 1], note: '(column 3: material long text)' }));
add(legacy('%CODE1', { note: '(column 4)' }));
add(legacy('%CODE15', { note: '(column 6)' }));
add(legacy('%CODE3', { note: '(column 7)' }));
add('* BOLT: the row exactly as the Smart Form printed it (same variables, same formatting).');
add('    CLEAR ls_goods.');
add('    ls_goods-seqno = lines( gt_goods ) + 1.');
add('    WRITE v_slno TO ls_goods-slno.');
add('    WRITE wa_ekpo-matnr TO ls_goods-matnr.');
add('    ls_goods-descr = |{ wa_ekpo-txz01 } ({ matdesc })|.            "legacy %TEXT54/%TEXT114: &WA_EKPO-TXZ01& (&MATDESC&)');
add('    WRITE lv_menge TO ls_goods-menge.');
add('    WRITE wa_ekpo-meins TO ls_goods-meins.');
add('    IF v_waers = \'XOF\' OR v_waers = \'XAF\'.');
add('      WRITE lv_unitprice1 TO ls_goods-netpr.                       "legacy %TEXT57');
add('      WRITE lv_total1 TO ls_goods-netwr.                           "legacy %TEXT58');
add('    ELSE.');
add('      WRITE wa_ekpo-netpr TO ls_goods-netpr.                       "legacy %TEXT220');
add('      WRITE wa_ekpo-netwr TO ls_goods-netwr.                       "legacy %TEXT221');
add('    ENDIF.');
add('    CONDENSE: ls_goods-slno, ls_goods-matnr, ls_goods-menge, ls_goods-meins, ls_goods-netpr, ls_goods-netwr.');
add('    APPEND ls_goods TO gt_goods.');
add('  ENDLOOP.');
add('');
add('* footer event - the rows print in this order');
add(legacy('%CODE16', { note: '(DISCOUNT row)' }));
add('  IF v_waers = \'XOF\' OR v_waers = \'XAF\'.');
add('    WRITE v_dis TO gs_totals-dis.');
add('  ELSE.');
add('    WRITE v_kwert TO gs_totals-dis.');
add('  ENDIF.');
add(legacy('%CODE17', { note: '(FRGHT row)' }));
add('  IF v_waers = \'XOF\' OR v_waers = \'XAF\'.');
add('    WRITE v_frg TO gs_totals-frg.');
add('  ELSE.');
add('    WRITE v2_kwert TO gs_totals-frg.');
add('  ENDIF.');
add(legacy('%CODE19', { drop: [0], note: '(OTHER row)' }));
add('  IF v_waers = \'XOF\' OR v_waers = \'XAF\'.');
add('    WRITE v_oth TO gs_totals-oth.');
add('  ELSE.');
add('    WRITE lv_oth TO gs_totals-oth.');
add('  ENDIF.');
add(legacy('%CODE4', { note: '(SUB_TOTAL row)' }));
add('  IF v_waers = \'XOF\' OR v_waers = \'XAF\'.');
add('    WRITE v_sub TO gs_totals-sub.');
add('  ELSE.');
add('    WRITE sub_total TO gs_totals-sub.');
add('  ENDIF.');
add(legacy('%CODE30', { note: '(VAT row)' }));
add('  IF v_waers = \'XAF\' OR v_waers = \'XOF\'.');
add('    WRITE lv_vat TO gs_totals-vat.');
add('  ELSE.');
add('    WRITE lv_kwert1 TO gs_totals-vat.');
add('  ENDIF.');
add(legacy('%CODE20', { note: '(CA row)' }));
add('  IF v_waers = \'XAF\' OR v_waers = \'XOF\'.');
add('    WRITE lv_ca TO gs_totals-ca.');
add('  ELSE.');
add('    WRITE lv_navs1 TO gs_totals-ca.');
add('  ENDIF.');
add(legacy('%CODE29', { note: '(TOTAL row)' }));
add('  IF v_bsart <> \'ZPOI\'.');
add('    WRITE v_total TO gs_totals-total.                              "legacy %TEXT73');
add('  ELSE.');
add('    WRITE v_totali TO gs_totals-total.                             "legacy %TEXT235');
add('  ENDIF.');
add(legacy('%CODE85', { drop: range(0, 10), note: '(TOTAL_VALUE_WORDS row: amount in words)' }));
add(legacy('%CODE13', { note: '(last footer row: current date - only printed by nodes disabled with 1 = 2)' }));
add('');
add('ELSEIF v_flag = \'Y\'.');
add('*==================== service purchase order (legacy table SERVCE_PO over IT_ESLL, V_FLAG = Y)');
add('  LOOP AT it_esll INTO wa_esll.');
add(legacy('%CODE5', { drop: [24], note: '(column 1)' }));
add(legacy('%CODE6', { note: '(column 4)' }));
add(legacy('%CODE21', { drop: [0], note: '(column 6: unit price)' }));
add(legacy('%CODE7', { drop: [2], note: '(column 7: total)' }));
add('* BOLT: the row exactly as the Smart Form printed it.');
add('    CLEAR ls_service.');
add('    ls_service-seqno = lines( gt_service ) + 1.');
add('    WRITE v_slno TO ls_service-slno.');
add('    WRITE wa_esll-srvpos TO ls_service-srvpos.');
add('    ls_service-descr = |{ condense( g_txz01 ) }({ condense( wa_esll-ktext1 ) })|.   "legacy %TEXT90: &G_TXZ01(C)&(&WA_ESLL-KTEXT1(C)&)');
add('    WRITE lv_menge TO ls_service-menge.');
add('    WRITE wa_esll-meins TO ls_service-meins.');
add('    WRITE lv_unitprice1 TO ls_service-unitpr.');
add('    WRITE lv_total1 TO ls_service-total.');
add('    CONDENSE: ls_service-slno, ls_service-srvpos, ls_service-menge, ls_service-meins, ls_service-unitpr, ls_service-total.');
add('    APPEND ls_service TO gt_service.');
add('  ENDLOOP.');
add('');
add('* footer event - the rows print in this order');
add(legacy('%CODE22', { drop: [0], note: '(Gross Price row)' }));
add('  WRITE v_total TO gs_totals-gross.');
add(legacy('%CODE23', { drop: [0], note: '(Net Discount row)' }));
add('  WRITE v_dis TO gs_totals-dis.');
add(legacy('%CODE8', { note: '(Sub Total row)' }));
add('  WRITE v_sub TO gs_totals-sub.');
add(legacy('%CODE24', { note: '(VAT row)' }));
add('  WRITE lv_vat TO gs_totals-vat.');
add(legacy('%CODE31', { note: '(CA row)' }));
add('  IF v_waers = \'XAF\' OR v_waers = \'XOF\'.');
add('    WRITE lv_ca TO gs_totals-ca.');
add('  ELSE.');
add('    WRITE lv_navs1 TO gs_totals-ca.');
add('  ENDIF.');
add(legacy('%CODE25', { note: '(Total row)' }));
add('  WRITE v_total1 TO gs_totals-total.');
add(legacy('%CODE12', { drop: range(0, 5), rename: [/\blv_amt_i\b/gi, 'lv_amt_is'], note: '(words row)' }));
add(legacy('%CODE26', { note: '(last footer row: current date - only printed by nodes disabled with 1 = 2)' }));
add('ENDIF.');
add('');
add('* BOLT: explicit sort of the display tables and condensed totals.');
add('SORT: gt_goods BY seqno, gt_service BY seqno.');
add('CONDENSE: gs_totals-gross, gs_totals-dis, gs_totals-frg, gs_totals-oth, gs_totals-sub, gs_totals-vat, gs_totals-ca, gs_totals-total.');

export const initLines = L;
export const initDeviations = deviations;

if (process.argv[3] !== '--lib') {
  fs.writeFileSync(path.join(repo, 'docs/legacy_grab/ZMMCG_PO_SF_initialization.abap'), L.join('\n') + '\n', 'utf8');
  console.log(`Initialization: ${L.length} lines`);
  console.log(deviations.join('\n'));
}
