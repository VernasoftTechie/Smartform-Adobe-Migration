# Migration Status — YMM_PO_SMARTFORM

STATUS: waiting_manual
UPDATED: 2026-10-09T11:33:53.154Z
WAITING_ON: operator
NOTE: Corrected interface pushed (fixes the SAP error Statement END not allowed in context). In abapGit PULL this branch again (interface and form), ACTIVATE the interface and then the form, open the Context tab and check the nodes show without errors. Report the exact error text if anything fails, otherwise confirm in Bolt Console. No push back is needed. Layout is built only after your confirmation.
STOP: none
CLAIMED_BY: Window-2

---
## 2026-10-09T05:58:22.398Z — Queued
Migration submitted with 4 reference file(s).

## 2026-10-09T08:51:01.534Z — Picked up
Window-2 picked this migration up.

## 2026-10-09T10:40:49.000Z — Interface pushed, waiting for your empty baseline
Window-2 pushed `src/ymm_po_smartform_int.sfpi.xml` (interface YMM_PO_SMARTFORM_INT, legacy form YMM_PO_SMARTFORM). Contents: 55 import and 3 table parameters (all non-STANDARD ones from the legacy contract, TLINE/EKPO/ESLL/EBAN table parameters typed LIKE as in ZCGSD_INVOICE), 91 globals, TYPES, and an Initialization of 933 lines. No STANDARD parameters, no EXCEPTIONS, no Context and no layout were authored.

**Initialization.** Legacy global init plus nodes %CODE95, %CODE146, %CODE24, %CODE171, %CODE84 are carried verbatim. A Context cannot hold per-row program lines, so the per-row/footer/item-text logic (%CODE1/6/22/25/14/85, %CODE3/23/94/8/27/86, the five item-text nodes, %CODE147/145, %CODE89) is re-run once in Initialization into six NEW globals (GT_HEAD_OUT, GT_EKPO_OUT, GT_ESLL_OUT, GT_ITXT_OUT, GV_EKPO_TOTAL_TXT, GV_ESLL_TOTAL_TXT) that the layout will loop over. These six are deliberate additions to the legacy interface. Node-by-node mapping and every deviation: `docs/legacy_grab/ymm_po_smartform_initialization.md`.

**Checker (sfp_check interface):** 0 fail, 172 warn, 278 passed. WARNs: the six added globals; Initialization differs from the single legacy node by design; ~170 legacy program-lines nodes not carried as listed in the mapping (dead 1 = 2 branches, unexecuted page-2 copies, chunk-loop nodes, nodes replaced by the new print-data block, %CODE21 handled in the layout).

**Please be aware / please answer when you can:** (1) The ABAP in Initialization has not been compiled anywhere; your first activation is its syntax check, so please send the exact error text if any. (2) Legacy chunking of header texts and item texts silently drops lines when the line count rounds down (e.g. 101-149 header lines); the new code prints all lines. Tell us if you want the legacy truncation kept. (3) Page 2 of the Smart Form has its own copy of the item tables and terms; we treat the page-1 main window as the only executed flow. Please confirm with a multi-page legacy PDF (a V_FLAG=X and a V_FLAG=Y order). (4) SmartStyle definitions for YMM_PO_STYLE, SYSTEM and YMMDRAFTSTYLE were not supplied, so fonts will be placeholders (Developer Extension Point). (5) The form has French (F) texts; whether Adobe should carry translations is open. (6) Driver YMM_PO_PROGRAM is confirmed by NACE (MATCH) and stays read-only.

Not done yet, by design: Context, layout, sign-off. Nothing is complete until your SAP activation/preview result is recorded here.

## 2026-10-09T11:05:27.362Z — Manual activity confirmed
Client confirmed the manual step is done: 1. For Styles - Take the best possible selection on your own.. On rest of the points make your own decisions to fit in best possible..

I've pulled the interface object and pushed the adobe form..

## 2026-10-09T11:16:19.196Z — Context built on your baseline, waiting for your pull
Verified your baseline first: empty Context (no child nodes), root subform named data, and the interface round-tripped from SAP with no difference to what we pushed, so the interface imported cleanly on your side. Thank you for the style/decision guidance; fonts will use Arial placeholders chosen from the legacy paragraph formats (Developer Extension Point), and the open points (print all text lines, page 1 main window as the executed flow) go ahead as proposed.

**Pushed:** (1) src/ymm_po_smartform_adt.sfpf.xml now carries the Context: 33 scalars, 4 structures (WA_PLANT, WA_VEND, WA_T005T and the new GS_FMT_OUT) and 4 flat table loops (GT_HEAD_OUT, GT_EKPO_OUT, GT_ESLL_OUT, GT_ITXT_OUT), built only from the three proven node shapes and only onto your empty Context. Your .xdp layout file is untouched (byte-identical). (2) src/ymm_po_smartform_int.sfpi.xml revision 2: one added global structure GS_FMT_OUT plus 46 more Initialization lines that write the amounts, dates and ALPHA-exit numbers the Smart Form printed (KWERT amounts, PR date, PR/vendor numbers) into text, so no currency reference fields are needed. Details: docs/legacy_grab/ymm_po_smartform_initialization.md.

**Checks:** sfp_check context 0 fail, 0 warn (10 passed, every bound field exists in the interface, node graph consistent); sfp_check interface 0 fail, 172 warn, 292 passed (same WARN groups as the previous entry: added globals and legacy nodes deliberately not carried).

**Still unconfirmed:** the Initialization ABAP has never been compiled; please send the exact error text from the interface activation if there is one. Not built yet: layout and sign-off.

## 2026-10-09T11:33:53.154Z — Interface error fixed, please pull again
Reported by SAP on activation of YMM_PO_SMARTFORM_INT: 2 errors, Statement END not allowed in context (the form warning that the interface does not exist follows from it).

**Cause (ours):** in the TYPES block of interface revision 2 the new structure ty_s_fmt_out ended its last component line (gv_prno5) with a period instead of a comma, which closed the TYPES statement before END OF ty_s_fmt_out. The same defect is reported twice by SAP. It is one character in src/ymm_po_smartform_int.sfpi.xml; nothing else changed and the Context file is unchanged.

**Checked before pushing:** every TYPES statement in the interface is a well-formed chain (7 statements, 0 malformed); every IF/LOOP/DO/CASE in the Initialization has its END statement (0 unclosed, 0 mismatched); sfp_check interface 0 fail, 172 warn (same groups as before); sfp_check context 0 fail, 0 warn. As before, the Initialization has never been compiled, so a further error is possible; please send the exact text if one appears.
