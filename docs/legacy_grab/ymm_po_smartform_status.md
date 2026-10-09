# Migration Status — YMM_PO_SMARTFORM

STATUS: waiting_manual
UPDATED: 2026-10-09T10:40:49.000Z
WAITING_ON: operator
NOTE: Interface pushed. In SFP create the EMPTY interface YMM_PO_SMARTFORM_INT and the EMPTY Adobe form YMM_PO_SMARTFORM_ADT (package ZAB_ADOBE, interface assigned, add one native static field, save, activate). In abapGit PULL this branch so src/ymm_po_smartform_int.sfpi.xml loads onto the interface, ACTIVATE the interface (this is its first compile) and report any error text exactly. Then Stage, Commit and Push the SAP-generated empty baseline (form + interface) to this branch and confirm in Bolt Console. Do not build any layout yet.
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
