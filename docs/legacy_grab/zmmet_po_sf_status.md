# Migration Status — ZMMET_PO_SF

STATUS: waiting_manual
UPDATED: 2026-10-09T11:21:41.000Z
WAITING_ON: operator
NOTE: Context tree built and pushed. In SFP pull this branch onto form ZMMET_PO_SF_ADT, check the Context tree shows 89 nodes with no error, activate if you can, then confirm or report the exact error. If SAP asks for a reference field on the MENGE column, report it.
STOP: none
CLAIMED_BY: Window-4

---
## 2026-10-09T05:57:46.710Z — Queued
Migration submitted with 5 reference file(s).

## 2026-10-09T08:51:03.634Z — Picked up
Window-4 picked this migration up.

## 2026-10-09T09:09:43.000Z — Interface prepared
The interface for ZMMET_PO_SF is built from your reference export and saved on this branch as `src/zmmet_po_sf_int.sfpi.xml` (object ZMMET_PO_SF_INT, with the form to be ZMMET_PO_SF_ADT). Nothing is pushed to SAP by me; this is what you pull in the next step.

**What is in it**
- The 60 form-specific input parameters and the 3 tables (IT_EKPO, IT_ESLL, IT_EBAN), exactly as the legacy form declares them. The standard envelope parameters and the exceptions are left out on purpose (SAP recreates them itself).
- The form's own type (GTY_ADRC) and its global fields (83 of the 84 in the legacy form), plus 3 new ones described below.
- 12 currency reference fields: every printed amount points at the document currency V_WAERS (already one of the legacy inputs). They are V_KWERT, V1_KWERT, V2_KWERT, LV_OTH, LV_KWERT1, SUB_TOTAL, TOTAL, G_NETWR and the price and value columns of the two new item tables.
- The Initialization code (574 lines): the 18 distinct program-lines nodes of the legacy form, copied line for line, in the order the legacy form ran them, each marked "Legacy node <name>".

**Why the Initialization is more than a copy of the legacy nodes** (please read, this is the main design decision)
An Adobe form has no program lines inside a table row, and no "include text" nodes. This form needs both, so the same work moves into the Initialization:
1. *Item rows.* The legacy form ran 4 nodes for every goods item (serial number, material long text via READ_TEXT, quantity, running net value) and 3 for every service line. Those nodes now run, still verbatim, inside a LOOP over IT_EKPO (when V_FLAG = X) or IT_ESLL (when V_FLAG = Y), and each pass appends one display row to a new table GT_OTHER_PO or GT_SERVICE_PO. The form will print from those two tables. The sub total, total and "amount in words" nodes run once after the loop, as the legacy footer did. This is the pattern the earlier form YMM_ISSUE_RESERVATION already uses (its Initialization loop builds the display tables, and that interface imported and activated cleanly in SAP).
2. *Item description.* The legacy text "&WA_EKPO-TXZ01& (&MATDESC&)" (goods) and "&G_TXZ01(C)&(&WA_ESLL-KTEXT1(C)&)" (services) is assembled into one field, item_desc, with the same literal characters. The two legacy alternatives for GFLAG = 1 and GFLAG = 2 print identical text, so they become one field.
3. *Standard texts.* The legacy form has four INCLUDE-TEXT nodes: %TEXT39 (PO header text, object EKKO, id F01: the same text the legacy form already reads into LT_LINES, so no new read), %TEXT118 (standard text ZPOI_ET, shown when LV_COND = V), %TEXT113 and %TEXT120 (both ZPOL_ET; language E, text object TEXT, id ST). The last three are read in the Initialization into one new table GT_TERMS_TEXT, under the same conditions.
4. The DATA statements of the legacy nodes (6 statements, listed at the end) are collected into one block at the top, because the Initialization is a single scope and several nodes declared the same variable. Nothing else in a legacy node was changed.

**Not carried, on purpose**
- Global `S` in the legacy form has no type at all (an incomplete leftover), is not used by any node, and cannot be declared in an Adobe interface. Omitted. The checker therefore reports it as the one FAIL below.
- %CODE14 is an identical one-line copy of %CODE13, so it is not repeated.

**Standards.** New code follows your ABAP standards (DIL names TY_/GT_/LV_, 7.4 syntax: VALUE, COND, string templates, explicit SORT). The legacy nodes are verbatim and so keep their old style (classic CONCATENATE, SELECT without @, WA_/IT_ names); I did not modernise them. Things the standards would change in the legacy code, if you want that done later: classic SELECT/CONCATENATE syntax, generic names (WA_*, IT_*), SELECT SINGLE *, and the READ_TEXT call in the goods row node %CODE2, whose result (MATDESC1) is never printed.

**Findings from the export you should know about**
- The driver is ZMMET_PO_DRIVER_RP (NACE, routine ENTRY_NEU). Its include ZMMET_PO_DRIVER_RP_FRMS calls form ZMMET_PO_SF with exactly this interface, so the earlier "mismatch" note is resolved by reading the source. ZMMSN_PO_PROGRAM is NOT a driver of this form (it calls ZMMSN_LOCAL_PO_SF / ZMMSN_PO_SMARTFORM). Drivers stay untouched.
- Several parts are permanently switched off in the legacy form by the condition `1 = 2`: the DRAFT_WINDOW (draft image), both long "Purchase Order Terms & Conditions" texts, the signature texts (rows SIGN / %ROW21) and one empty discount row. They never print today. I plan to leave them out of the Adobe layout and will list them again at layout time.
- The form exists in English and French. Only a few texts differ in French: the delivery-address block (it prints WA_PLANT-NAME1, LV_STR3, LV_BEZEI, LV_LANDX50 instead of the plant address), the labels City/District (French: Suburb/City) and the amount-in-words sentence. I design from the English master. **Please tell me whether French output is still needed.**
- The reference-field list assumes EKPO-NETPR/NETWR, ESLL-TBTWR/NETWR and KWERT are currency fields (their standard SAP definition, which I cannot look up from here). SAP will say if one is not.

**Please be aware (cannot be proven outside SAP)**
- `LV_MENGE` and the quantity column use the custom type Z_MENGE. Its definition is not in the export, so I did not add a quantity reference field. If SAP asks for one on pull, report it and I will add it.
- LIKE-typed globals (WORDS LIKE SPELL and the GV_TEXTNAME fields) and the LIKE-typed table parameters are carried as the legacy form has them. LIKE table parameters imported cleanly on ZCGSD_INVOICE; the LIKE globals are unproven.
- The ABAP was checked by reading it and by the shared checker only. SAP's own syntax check at activation is the real test.

**Checker (tools/sfp_check.mjs interface): 1 FAIL, 21 WARN, 270 passed**
- FAIL: global S (explained above, deliberate).
- WARN: 3 globals not in the legacy form (GT_OTHER_PO, GT_SERVICE_PO, GT_TERMS_TEXT, explained above).
- WARN: Initialization contains code that is not the legacy global initialization (that one is empty; the code is the composed Initialization described above).
- WARN x19: "program-lines node X is not declared as carried" for %CODE15, COMP_PLANT_ADDRESS, %CODE11, %CODE16, %CODE32, %CODE2, %CODE9, %CODE1, %CODE3, %CODE4, %CODE85, %CODE10, %CODE13, %CODE5, %CODE6, %CODE7, %CODE8, %CODE12, %CODE14. The checker only recognises a node when the whole Initialization is its verbatim copy. All of them except %CODE14 are carried inside the composed Initialization; %CODE14 is the duplicate noted above.

**Removed DATA statements (now in the top block):** %CODE32: lv_ebeln, lv_textname. %CODE2 and %CODE5: lv_name. %CODE9: lv_name, lv_id. %CODE85 and %CODE12: lv_amt_i, lv_string, lv_c1, lv_c2, lv_birr, lv_satim. New: lv_terms_name.

## 2026-10-09T09:09:43.000Z — Action needed from you (SAP)
Please do these in SAP, in order:
1. In transaction SFP create the Adobe form interface **ZMMET_PO_SF_INT** and the form **ZMMET_PO_SF_ADT** (package ZAB_ADOBE). Leave the form empty (or add the single native static field and activate, as in the baseline procedure). This is the safe starting point.
2. In abapGit, pull this branch (vernasofttechie-zmmet_po_sf) onto that interface. Check that the Interface tab shows the 60 inputs and 3 tables, that Global Data and Types show the new GT_OTHER_PO, GT_SERVICE_PO and GT_TERMS_TEXT, and that the Initialization tab shows the code. If SAP reports any error (deserialize, syntax or reference field), copy the exact message.
3. Do **not** drag anything into the form's Context. I build the Context here, from the real SAP-generated form once you push it, binding only what the legacy form prints.
4. In abapGit do Stage, Commit and Push **both** the interface and the (empty) form back to this same branch.

When it is done click "I've done this — confirm" below. If anything fails, use "Report a problem" and give the exact message.

## 2026-10-09T11:00:27.000Z — Interface corrected (activation error on 4 reference fields)
Activating ZMMET_PO_SF_INT in SAP gave 4 errors: "Field GT_OTHER_PO-NETPR / GT_OTHER_PO-NETWR / GT_SERVICE_PO-TBTWR / GT_SERVICE_PO-NETWR does not have data type CURR". This was reported to me outside the status file, so please also confirm it below.

**Cause (my mistake):** the two item tables are declared in the interface's own Types block. A field declared there (for example `netpr TYPE ekpo-netpr`) is a plain packed number in the interface, not a DDIC currency field, so SAP rejects a currency reference on it. The other 8 reference fields (V_KWERT, V1_KWERT, V2_KWERT, LV_OTH, LV_KWERT1, SUB_TOTAL, TOTAL, G_NETWR) point at fields typed directly by SAP data elements and were not rejected.

**Fix:** the 4 reference fields on the item tables are removed (12 become 8). Nothing else in the interface changed. Those columns now carry the same value and two decimals, but are not tied to the document currency in the form; for currencies other than 2-decimal ones (the legacy driver already adjusts JPY) the layout would need to format them, which I will check at layout time.

**Checker after the fix:** 1 FAIL (global S, deliberate, as before), 21 WARN (unchanged, listed in the "Interface prepared" entry), 262 passed.

## 2026-10-09T11:00:27.000Z — Action needed from you (SAP)
Please pull this branch again onto ZMMET_PO_SF_INT in abapGit (overwriting the interface), activate it, and note the result. If the interface activates without errors, Stage, Commit and Push the interface and the empty form ZMMET_PO_SF_ADT back to this branch, then click "I've done this — confirm". If SAP reports any error, use "Report a problem" with the exact message. Do not drag anything into the Context.

## 2026-10-09T11:18:29.943Z — Manual activity confirmed
Client confirmed the manual step is done.

## 2026-10-09T11:21:41.000Z — Context tree built
Checked the branch first: the form you pushed (`src/zmmet_po_sf_adt.sfpf.xml`, commit 71af67a) is exactly the safe empty starting point, wired to ZMMET_PO_SF_INT, with only the root Context node. The interface file is unchanged from my corrected version. I built the Context on top of it and pushed it to the same file. The layout file (`.xdp`) is untouched (byte-identical to what you pushed).

**What is bound (89 nodes), only what the legacy form prints**
- 33 single fields: the PO header and address values (V_COMPANY_NAME, V_PODATE, V_EBELN, LV_EINDT, V_DEPARTMNT, G_ERNAME, the buyer phone/fax/e-mail, V_EMAIL, LV_VTEXT payment terms, GV_INCO1/GV_INCO2, V_WAERS, LV_LIFNR, LV_RESWK, LV_LAND, GV_ISD, LV_VAR4 "last changed on"), the totals (V_KWERT, V2_KWERT, V1_KWERT, LV_OTH, G_NETWR, SUB_TOTAL, LV_KWERT1, TOTAL), the amount in words (LV_AMT_WORDS, LV_KTEXT).
- 4 fields that only drive conditions in the layout: V_BSART (title, insurance row, words wording), V_FLAG (goods or service table), V_POTEXT (where the header comments print), LV_FLAG (Approved / UnApproved PO watermark).
- 4 structures: WA_VEND (10 supplier fields), WA_T005T (country name), LS_DADRC (7 delivery-address fields), LS_ADRC (10 supplier-plant fields for stock transfers).
- 4 repeating tables: GT_OTHER_PO (7 columns, goods items), GT_SERVICE_PO (7 columns, service lines), LT_LINES (header comment text lines, TDLINE) and GT_TERMS_TEXT (standard text lines, TDLINE).

**Left out on purpose**
- IT_EKPO, IT_ESLL and IT_EBAN are not bound: the item rows print from the two prepared tables above (see "Interface prepared"). IT_EBAN is never printed by the legacy form.
- The French-only fields (WA_PLANT-NAME1, LV_STR3, LV_BEZEI, LV_LANDX50), V_SLNO, LV_MENGE, MATDESC, G_TXZ01 (now columns of the item tables) and G_CURR_DATE (only used in a branch switched off by `1 = 2`).
- Nothing quantity- or currency-typed is bound without a reference field. The 8 reference fields in the interface cover V_KWERT, V1_KWERT, V2_KWERT, LV_OTH, LV_KWERT1, G_NETWR, SUB_TOTAL and TOTAL.

**Checks before pushing:** valid XML (also under a strict parser); every node's parent/child/sibling and condition link resolves, no duplicate ids; `sfp_check context`: 0 FAIL, 0 WARN, 10 passed. All 89 bound fields exist in the interface. The plan listed no unresolved printed field. Layout checks are not run yet (there is no layout).

**Please check in SAP — I can't see it from here**
1. In SFP pull this branch onto form ZMMET_PO_SF_ADT. Note any error message (especially about a reference field on the MENGE column: the type Z_MENGE is custom and I could not check its definition; if SAP asks for a reference, report it and I will add it).
2. Check the Context tree shows the 89 nodes: the single fields, the 4 structures with their fields, and the 4 tables with their columns (7, 7, 1, 1). No deserialize error.
3. Activate if you can and note the result.
4. If it imports clean, click confirm and I start the layout. If SAP throws an error, use "Report a problem" with the exact message.

**Still open:** French output needed or not? (Only the English master is designed.) Fonts: the SmartStyle YMM_PO_STYLE is not in the global library; the other two are.
