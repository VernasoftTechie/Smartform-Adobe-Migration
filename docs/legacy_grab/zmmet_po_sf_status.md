# Migration Status — ZMMET_PO_SF

STATUS: waiting_manual
UPDATED: 2026-10-10T06:08:58.000Z
WAITING_ON: operator
NOTE: Layout cross-checked against the legacy output PDF and corrected (no frames, title position, terms heading and lines). Pull the branch onto ZMMET_PO_SF_ADT again, activate, run the tests and send one line per test, plus a preview PDF of the same service PO as in the legacy PDF. Not closed without your test results.
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

## 2026-10-09T11:29:39.531Z — Manual activity confirmed
Client confirmed the manual step is done.

## 2026-10-09T11:40:17.000Z — Layout started, first increment built
Your Context pull is confirmed, so the layout has started. Increment 1 is pushed in `src/zmmet_po_sf_adt.sfpf.xdp`, built on the page you pushed. Only the template section changed; the three baseline lines that changed are the page size and the empty body. Everything else in the file is byte-for-byte what SAP wrote.

**What increment 1 contains (page 1 header only, no item table yet)**
- **Page:** A4 portrait (legacy DINA4; SAP's default was Letter). Content area 19 x 27.7 cm with a 1 cm margin on all sides.
- **Logo:** window LOGO (0.80 / 1.10 cm, 2.80 x 2.23 cm), graphic DANGOTE LOGO WHITE from SE78, loaded with the same SAP graphics URL pattern the YMMGRNNOTE form uses.
- **Title:** window PO_HEADING (4.20 / 1.75 cm, 12.10 cm wide). One of 8 titles is shown by the order type V_BSART: ZPOR Release Order, ZPOC Cash Purchase Order, ZPOL Local Purchase Order, ZPOI Import Purchase Order, YCAP Capex Purchase Order, YRAW Purchase Order, ZPOS Service Purchase Order, ZPOT or ZPIC Stock Transfer PO. The PO number (V_EBELN) prints below it, 1.3 cm under the title line, as the legacy template lines (8 mm, 5 mm, 7.91 mm) place it.
- **Delivery address box:** window DELVRY_ADD (4.70 x 4.23 cm, border on all sides): "Delivery Address:" then company name and the LS_DADRC name 1, name 2, street, city, postal code, telephone and fax, one per line.
- **Supplier grid:** window SUPPLIER_ADD, 13 rows of 4.7 mm, columns 3.50 + 6.63 cm with a border on every cell, exactly as the legacy template. Two versions, chosen by V_BSART: for ZPOT (stock transfer) the plant data (LV_RESWK, LS_ADRC, LV_LAND, no e-mail value); for every other type the vendor (LV_LIFNR, WA_VEND, WA_T005T country, "+" country dialling code GV_ISD + telephone/fax, V_EMAIL).
- **Last changed:** "Last Changed On:" with LV_VAR4.
- **PO detail grid:** window PO_DETAIL, 9 rows of 4.7 mm plus the 21.7 mm "Additional Comments" row, columns 3.00 + 5.00 cm: PO date, delivery date, department, buyer name, telephone, fax, e-mail, payment terms, Inco terms. The comments text (lines of LT_LINES, the legacy include text EKKO / F01) shows only when V_POTEXT is blank; when it is X the same text prints above the items instead (that comes with the items table).

**Where I moved things away from the legacy coordinates, and why**
- Everything is shifted 0.25 cm to the right so the legacy 0.75 cm left margin becomes 1 cm (rulebook S02 margin rule).
- The delivery box and the "Last Changed On" text ended 0.1 cm and 0.35 cm from the right page edge in the legacy form; both are moved left so they end 1 cm from the edge.
- In the legacy form the "Last Changed On" window (starts 4.27 cm) overlaps the lower part of the delivery box (ends 5.40 cm). I kept that overlap as the legacy has it. **Please look at the preview and tell me if it collides in your printout; then I will move it.**

**Not evidenced, so placeholders, please confirm**
- Fonts and alignment: the SmartStyles ZWSA_COMMON_STYLE, ZMM_PURCHASE_REQ and YMM_PO_STYLE are only names in the export. I used Arial 8 pt (labels bold) and Arial 14 pt bold centred for the title and PO number. To make this exact, download those three styles in SMARTSTYLES (Utilities > Download) and add them under "SmartStyle exports", or give me font, size, bold and alignment of the paragraphs P1, P4, P6, H1 and the character formats B1, C4.
- Logo URL: the graphic name contains spaces, so the URL is `.../bcol/DANGOTE%20LOGO%20WHITE.bmp`. If the logo does not show, tell me; it is the first thing I would check.
- Empty lines: a legacy text line that holds only an empty field (for example address line 2) keeps its blank line here (fixed line positions).

**Not in this increment yet:** the Approved / UnApproved PO watermark, the items tables (goods and service), the totals, amount in words, terms text, the second page and the frame around the main window. Left out for good (switched off by `1 = 2`): DRAFT window, the long terms and conditions, the signature texts. The French wording is not designed.

**Checks before pushing**
- Valid XML (also under a strict parser); nothing outside `<template>` differs from your baseline; A4, margins 1.00 cm on all four sides; all 152 elements inside their parent; explicit x/y everywhere; all 50 bindings resolve to the Context.
- `sfp_check layout`: 1 FAIL, 3 WARN, 14 passed.
- FAIL (expected at this stage): 31 printed fields not bound yet. They belong to later increments (item rows, totals, amount in words, footers, terms), to the French-only text, or to the parts switched off by `1 = 2`.
- WARN: V_BSART and V_POTEXT are bound but not printed by the legacy form (hidden helper fields that drive the conditions).
- WARN: 53 legacy static texts not found yet (watermark, DRAFT, item and footer labels): later increments or switched off.
- WARN: the comments lines (4.8 cm wide) are narrower than the 19 cm items table, because they sit in the narrow comments cell.
- Unconfirmed in SAP: the conditions use the same hidden-field and script pattern as the earlier forms (S07 8.9); the combined "+" country code and number fields, the growing comment lines and the logo URL are new here.

## 2026-10-09T11:40:17.000Z — Action needed from you (SAP)
Please do these in SAP, in order:
1. In abapGit, pull this branch onto form ZMMET_PO_SF_ADT and activate it. Note the activation result and any message.
2. Open the Layout. You should see an A4 portrait page with the logo and title at the top, the delivery box top right, the supplier grid at the left, and the PO detail grid at the right. Report any overflow or warning badges. In Design View all 8 titles and both supplier grids sit on top of each other (the conditions only act at run time), so judge one at a time.
3. Preview with a real purchase order: try a local PO (ZPOL), a stock transfer (ZPOT) and, if you have one, a service PO (ZPOS). Check the title, the PO number, the delivery box, the supplier grid (vendor details, or plant details for ZPOT), the PO detail values, and the Additional Comments text (V_POTEXT blank). Tell me about overlaps (especially "Last Changed On" against the delivery box), the logo, wrapped or clipped text.
4. If it looks right, confirm and I continue with the watermark and the items table. If anything is off, report it with a screenshot. If you adjust in Designer and push, I compare your save against this version before building on it.

## 2026-10-09T11:45:10.756Z — Manual activity confirmed
Client confirmed the manual step is done: Some overflows I could see in the layout.. Could you please adjust and beautify the layout..? Also where is the loop section..? If its missing please continue on leftover activities and confirm me.

## 2026-10-09T11:49:36.000Z — Layout increment 2: items tables, totals and terms
Thank you for the feedback. Increment 1 had no item table yet, that is the "loop section" you asked about, and it is in this push (`src/zmmet_po_sf_adt.sfpf.xdp`, built on your baseline; only the template section changed). Nothing was pushed by you after my last push, so I could not see which overflows you meant. I fixed the most likely cause and ask you for the rest below.

**Overflow fix (increment 1 part)**
The hidden helper fields that carry V_BSART, V_POTEXT, the country code and so on were only 1 mm x 1 mm, so Designer flags any text in them as overflowing. They are now 2 cm x 0.4 cm and still hidden. If you still see overflow badges, please send the badge text and the element name (or a screenshot) so I fix exactly those.

**Now in the layout (all printed from the tables prepared in the Initialization)**
- **Additional Comments table** (legacy %TABLE1 on LT_LINES, printed when V_POTEXT = X): heading line, the text lines (growing rows) and a closing line, 19 cm wide.
- **Goods table** (V_FLAG = X, legacy OTHER_PO), columns exactly as the legacy line type: Sr No 1.13, Material No. 3.14, Item Description 6.45, Qty 2.22, UOM 1.10, Unit Price (Excl.VAT) 2.37, "<V_WAERS> Total (Excl.VAT)" 2.59 cm = 19.00 cm. One row per item from GT_OTHER_PO (serial number, material number, "description (long text)", quantity, unit, unit price, value). The item description cell grows with its text.
- **Service table** (V_FLAG = Y, legacy SERVCE_PO), widths 1.13 / 3.14 / 5.70 / 2.20 / 1.24 / 2.80 / 2.79 cm: serial number, service number, "text(short text)", quantity, unit, unit price, value, from GT_SERVICE_PO.
- **Column headings repeat at the top of every page** (the heading is the overflow leader of the row, the pattern copied from Adobe's Purchase Order and Dunning Notice samples). This is the same construct as on ZMM_PO_DEMO, which is not yet confirmed in SAP: please check page 2 of a long order.
- **Footer lines under the goods table:** Nett Discount (V_KWERT), Freight Charges (V2_KWERT), Insurance Charges (V1_KWERT, only order type ZPOI), Other Charges (LV_OTH), Sub Total, VAT (LV_KWERT1), Total; then the amount in words box and the terms box (standard text ZPOI_ET for import orders, ZPOL_ET for the others, read in the Initialization), then 3 spacer lines.
- **Footer lines under the service table:** Gross Price (G_NETWR), Net Discount (V_KWERT), an empty Other Charges line, Sub Total, VAT, Total, the amount in words box, the terms box only for order type ZPOS (standard text ZPOL_ET), and 2 spacer lines.
- **Amount in words** reads "Total order Value In Words(<currency>): <words> <Inco1> <Inco2> basis", with "Order" capitalised for ZIMP and ZLOC, as the legacy two variants do.
- Amounts use the display pattern z,zzz,zzz,zz9.99; the quantity prints as the plain value of Z_MENGE.
- Partial borders (side lines of the footer lines) use the edge order top, left, bottom, right, confirmed from Adobe's own Purchase Order sample and strategy S07.

**Not yet in the layout (next increment):** the Approved / UnApproved PO watermark, the frame around the whole main window (legacy window TABLE_DATA, 19 x 17 cm, border on all sides, repeated on page 2), the signature lines of order type ZBUK, and the closing line under the last spacer. The frame and the watermark print on every page, which is why they are left to a separate step (it needs a decision about page-level drawings, the open point of ZMM_PO_DEMO). Switched off by `1 = 2` and not drawn: the DRAFT window, the long terms and conditions, the signature texts, one empty discount line.
The legacy frame is 17 cm high starting at 12.00 cm, i.e. it ends 0.3 cm closer to the page edge than the 1 cm margin; I will keep the margin.

**Not evidenced, so placeholders** (same as before): fonts are Arial 8 pt; column headings bold and centred, amounts right-aligned, serial number, material number and unit centred, description left. Please send the three SmartStyle exports (ZWSA_COMMON_STYLE, ZMM_PURCHASE_REQ, YMM_PO_STYLE) or the font, size and alignment of the paragraphs P1 to P8 if you want these exact.

**Row height limitation:** all cells of an item row are fixed at 0.6 cm except the description, which grows. When a description wraps to two lines the other cells of that row stay 0.6 cm high, so their borders do not reach the bottom of the row. A table construct without this limit is not yet proven in this SAP, so I used the proven pattern. Tell me if it looks bad in your preview.

**Checks before pushing**
- Valid XML (also under a strict parser); nothing outside `<template>` differs from your baseline; A4, margins 1.00 cm; all 288 elements inside their parent; explicit x/y everywhere; all 99 bindings resolve to the Context; the continuation wiring (leader, id, occur, flowing container) passes.
- `sfp_check layout`: 1 FAIL, 3 WARN, 28 passed. The FAIL lists 19 printed fields that are not bound under their legacy name, on purpose: the item-row fields now come from the prepared tables (V_SLNO, LV_MENGE, MATDESC, G_TXZ01, WA_EKPO and WA_ESLL columns), the French-only fields (LV_BEZEI, LV_LANDX50, LV_STR3) are not designed, and G_CURR_DATE belongs to a switched-off branch. WARN: V_BSART, V_POTEXT, V_FLAG and the new table columns are bound although the legacy form did not print them under those names; 38 legacy static texts not found (watermark, DRAFT and the switched-off terms and conditions); the comments column of the detail grid is narrower than the table.
- Unconfirmed in SAP: the page-continuation heading, the numeric pattern, the script-built amount-in-words and heading texts, the hidden-field conditions.

## 2026-10-09T11:49:36.000Z — Action needed from you (SAP)
Please do these in SAP, in order:
1. In abapGit pull this branch onto form ZMMET_PO_SF_ADT, activate it, and note the result and any message.
2. Open the Layout and report every overflow or warning badge with the element name or a screenshot.
3. Preview with real orders: a goods PO (V_FLAG = X) with one item and with more than 25 items (check page 2: repeated column headings, rows continuing, totals at the end), a service PO (V_FLAG = Y), an import PO (ZPOI: insurance line, terms text ZPOI_ET), and one with V_POTEXT = X (Additional Comments table above the items).
4. Tell me what is wrong or ugly (screenshots help), or confirm and I continue with the frame, the watermark and page 2.

## 2026-10-09T11:52:30.836Z — Manual activity confirmed
Client confirmed the manual step is done.

## 2026-10-09T11:56:02.000Z — Layout increment 3: page frame, watermark, first and following pages
Increment 3 is pushed in `src/zmmet_po_sf_adt.sfpf.xdp` (template section only changed; the rest of the file is what SAP wrote). It adds what the legacy form prints on every page.

**What is new**
- **Two page types:** the first page and "the rest", declared the way Adobe's own Dunning Notice sample does (`pagePosition="first"` and `"rest"`). Both are A4 portrait with the same 19 x 27.7 cm content area.
- **Frame around the main window**, as the legacy window TABLE_DATA (border on all four sides): on page 1 from 12.00 cm down (the legacy window is 19 x 17 cm at 0.75 / 12.00); on the following pages from the top of the page (legacy 19 x 28.45 cm at 0.75 / 0.55). The item tables, footers and the amount-in-words and terms boxes flow inside it. Both frames end at 28.7 cm instead of the legacy 29.0 cm, and the page 2 frame starts at 1.0 cm instead of 0.55 cm, so the 1 cm page margin holds.
- **Watermark** (legacy window WATER_MARK, 18.00 x 4.70 cm at 1.52 / 17.76, printed on both pages): "Approved PO" when LV_FLAG = Y (release indicator R or A, set by the legacy node %CODE15), otherwise "UnApproved PO". The text is read from LV_FLAG by a small script on the page.

**What I did not build, and why**
- The signature lines for order type ZBUK: in the legacy form all their texts are switched off by `1 = 2`, so they print only empty cells, and the frame now closes the area. Their bottom lines (rows %ROW21 / %ROW24) are not drawn.
- Still not drawn because switched off by `1 = 2`: DRAFT window, the long terms and conditions, signature texts.
- The French wording.

**Unconfirmed, please check these first**
1. **Drawings on the page itself (master page).** The frame and the watermark sit in the page areas. Adobe's samples do this, but an old entry in this project (F15) recorded a blank Design View in this SAP when content was placed inside a page area. If the Layout shows nothing, or only a blank page, tell me: I have a fallback ready (frame as borders of the flowing rows, watermark only on page 1 in the body).
2. **Watermark script.** The watermark field is bound to LV_FLAG and sets its own text. It is written so that it gives the same result on both pages.
3. **Font of the watermark.** Not in the export (style ZMM_PURCHASE_REQ, paragraph P6); placeholder Arial 40 pt bold in light grey (200,200,200) so that the item rows stay readable. Send the style export or the font, size and colour if you want it exact.
4. The page-continuation heading, the numeric pattern and the script-built texts from increment 2 are still unconfirmed too.

**Checks before pushing:** valid XML (also under a strict parser); nothing outside `<template>` differs from your baseline; margins 1.00 cm; all elements inside their parents; explicit x/y; all bindings resolve to the Context; continuation wiring passes. `sfp_check layout`: 1 FAIL, 4 WARN, 30 passed. The FAIL is the same 19 printed fields not bound under their legacy names, on purpose (item-row fields now come from the prepared tables; French-only fields; G_CURR_DATE). The WARNs: the master-page content (point 1 above); V_BSART, V_POTEXT, V_FLAG and the table columns are bound under new names; 38 legacy static texts not found (watermark words are produced by the script, DRAFT and the terms and conditions are switched off); the comments column of the detail grid is narrower than the table.

## 2026-10-09T11:56:02.000Z — Action needed from you (SAP)
Please do these in SAP, in order:
1. In abapGit pull this branch onto form ZMMET_PO_SF_ADT, activate it, and note the result and any message.
2. Open the Layout. Check that the page shows (a) the frame, (b) the watermark text, (c) the header blocks from increment 1. Report every overflow or warning badge with the element name or a screenshot, or "blank page" if nothing shows.
3. Preview: a goods PO with 1 item and one with 25+ items (page 2: frame, repeated column headings, rows continuing, totals at the end); one with release indicator R or A (watermark "Approved PO") and one without ("UnApproved PO"); a service PO; an import PO (ZPOI).
4. Compare against a printout of the legacy form and tell me what differs (position, wrapping, fonts, numbers), or confirm and I close the layout with the open points for your sign-off.

## 2026-10-09T11:58:10.844Z — Manual activity confirmed
Client confirmed the manual step is done.

## 2026-10-09T12:00:19.000Z — Final test results needed before this form can be closed
Thank you for confirming the last pulls. The confirmations so far came without any result, so I cannot tell what was tested, and nothing is closed on a bare confirmation. The form stays open until you send the results below. All four layout increments are on this branch (interface, Context, header blocks, goods and service tables with footers, frame and watermark). I am not changing anything until I hear from you.

**Please send, in the confirmation text (or "Report a problem" with a screenshot), one line per test: PASS, or what is wrong**

*A. Activation*
1. Interface ZMMET_PO_SF_INT activates without errors or warnings.
2. Form ZMMET_PO_SF_ADT activates without errors. Layout shows a page (not blank) with the frame and the header blocks. List every overflow or warning badge with its element name.

*B. Preview with real purchase orders (compare each with the printout of the legacy Smart Form ZMMET_PO_SF for the same PO)*
3. Goods PO (V_FLAG = X), 1 item: logo, title, PO number, delivery box, supplier grid, PO detail grid, item row, discount / freight / other lines, sub total, VAT, total, amount in words, terms text (ZPOL_ET).
4. Goods PO with more than 25 items: on page 2 the frame, repeated column headings, rows in order, totals on the last page, nothing missing or overlapping.
5. Import PO (ZPOI): title "Import Purchase Order", Insurance Charges line, terms text ZPOI_ET.
6. Service PO (V_FLAG = Y, order type ZPOS): service table columns, Gross Price / Net Discount lines, terms text ZPOL_ET.
7. Stock transfer PO (ZPOT or ZPIC): title "Stock Transfer PO", supplier grid shows the supplying plant data.
8. A PO with release indicator R or A shows the watermark "Approved PO"; one without shows "UnApproved PO".
9. A PO with V_POTEXT = X: "Additional Comments" table above the items; with V_POTEXT blank: the comments inside the PO detail grid.
10. Numbers: unit price, value, totals and amount in words equal the legacy printout (also for a currency other than the document's two-decimal case, if you have one, for example JPY).
11. Long material descriptions: the description cell grows and the row still reads correctly.

*C. Questions I could not answer from the export*
12. Is French output still needed? (Only the English wording is designed.)
13. Does "Last Changed On" collide with the delivery box in your printout?
14. Fonts, sizes and alignment: please send the SmartStyle exports of ZWSA_COMMON_STYLE, ZMM_PURCHASE_REQ and YMM_PO_STYLE (SMARTSTYLES > Utilities > Download), or the font, size, bold and alignment of the paragraphs P1 to P8 and the character formats B1, C4. Until then fonts are Arial placeholders.
15. Does the logo show? (SE78 graphic DANGOTE LOGO WHITE; if not, send the exact name or the image.)

**Known limits you should judge in the preview:** the Approved / UnApproved watermark is a light grey placeholder; the other cells of an item row stay 0.6 cm high when a description wraps to a second line; the signature rows for order type ZBUK are not drawn (their texts are switched off in the legacy form).

When all lines are PASS and you accept the open points, say so in your confirmation and I record the sign-off. If anything fails, report the line number and what you see and I fix it and ask for a new test.

## 2026-10-09T12:00:19.000Z — Action needed from you (SAP)
Please run the tests above in SAP and send the results (one line per test) with your confirmation. If something differs from the legacy printout, use "Report a problem" with a screenshot. I will not close this migration without your explicit test result.

## 2026-10-09T12:10:53.000Z — Positions rechecked against the legacy form and made exact
On request I rechecked every section against the legacy export and removed the margin adjustments I had made earlier. The layout now uses the legacy page coordinates exactly. **This version replaces the one you may already be testing: please pull again before you send the test results.**

**What changed**
- Before: all header blocks were shifted 0.25 cm to the right, the delivery box and "Last Changed On" were moved left, and the frames were trimmed to keep a 1 cm page margin.
- Now: the content area starts at the legacy origin (0.75 cm from the left, 0.55 cm from the top) and is 20.15 x 28.45 cm, so a legacy position X / Y on the page is the same position in the layout. Nothing is shifted any more. The only consequence is the page margin, see "Risk" below.

**Section by section (page coordinates in cm, left / top, width; legacy value = layout value)**
| Section (legacy window) | Legacy | Layout |
|---|---|---|
| Logo (LOGO) | 0.80 / 1.10, 2.80 x 2.23 | same |
| Title and PO number (PO_HEADING) | 4.20 / 1.75, 12.10 wide, lines 8 mm + 5 mm + 7.91 mm | same: title on line 1, PO number 1.30 cm below the top |
| Delivery box (DELVRY_ADD) | 16.20 / 1.17, 4.70 x 4.23, border | same |
| Supplier grid (SUPPLIER_ADD, both variants) | 0.75 / 5.00, 3.50 + 6.63 wide, 13 lines of 4.70 mm | same, rows at 0.47 cm steps |
| Last changed (PO_LAST_CHANGED) | 16.11 / 4.27, 4.24 wide | same |
| PO detail grid (PO_DETAIL) | 11.65 / 5.00, 3.00 + 5.00 wide, 9 lines of 4.70 mm + 1 line of 21.70 mm | same |
| Main window, page 1 (TABLE_DATA) | 0.75 / 12.00, 19.00 x 17.00, border | frame same; item tables start exactly at 12.00 |
| Main window, following pages | 0.75 / 0.55, 19.00 x 28.45, border | same |
| Watermark (WATER_MARK, both pages) | 1.52 / 17.76, 18.00 x 4.70 | same |
| Goods table columns | 1.13 / 3.14 / 6.45 / 2.22 / 1.10 / 2.37 / 2.59 (19.00) | same |
| Service table columns | 1.13 / 3.14 / 5.70 / 2.20 / 1.24 / 2.80 / 2.79 (19.00) | same |
| Footer lines | cells 0.01 / 4.26 / 11.90 / 2.83; 11.20 / 4.30 / 3.50; 11.20 / 4.33 / 3.47 (goods), 11.50 / 4.33 / 3.17 (service) | same |
I verified the header-block positions by reading them back from the generated file; the table, footer and frame widths come straight from the legacy cell definitions.

**Still not exact, because the export has no value for it (placeholders):** fonts and sizes (SmartStyles not supplied); the heights of the table heading (0.9 cm), the item rows (0.6 cm minimum) and the footer lines (0.5 cm); the heights of the empty spacer lines (0.3 cm). The legacy table lines have no fixed height, they follow the text of the style. Send the three SmartStyle exports or the measured heights from your printout and I make these exact too.

**Risk you must judge:** the legacy form itself leaves only 0.10 cm to the right page edge (delivery box ends at 20.90 cm) and 0.70 cm at the bottom (frame ends at 29.00 cm). Rulebook S02/F48 recorded overflow warnings in this SAP with margins under 1 cm, and printers cannot print into their own non-printable edge. If the Layout shows overflow badges or the preview cuts the right or bottom edge, tell me and I move those two items inside the margin again.

**Checks:** valid XML (strict parser); nothing outside `<template>` differs from your baseline; every element inside its parent; all 99 bindings resolve. `sfp_check layout`: 1 FAIL, 5 WARN, 29 passed: the same 19 printed fields not bound under their legacy names (on purpose), the master-page drawings (unconfirmed), the new field names, the texts not found (switched off or script-built), and the new margin warning (0.75 / 0.55 / 0.10 / 0.70 cm, the legacy values, deliberate).

## 2026-10-09T12:10:53.000Z — Action needed from you (SAP)
Please pull this branch onto form ZMMET_PO_SF_ADT again, activate it, and then run the test list from my previous entry on this version. Send one line per test (PASS or what is wrong). If the Layout shows overflow badges at the right or bottom edge, name the elements. This migration stays open until you send the test results.

## 2026-10-09T19:31:46.000Z — Layout rebuilt on the constructs SAP itself generates (replaces all earlier layout versions)
Your comments on the earlier layouts reached me outside this file: no table, no terms and conditions, spacing and overlaps. They were right, and I found the causes by comparing with the form that SAP's own migration wizard generated for this Smart Form (`ZMMET_PO_SF_ZETO_F`) and with the legacy export again. **This push replaces the interface, the Context and the layout. Please pull all three (interface first, then the form) and test this version only.**

**Why the earlier versions failed**
1. *Data did not reach the fields.* SFP names a structure field as one flat element (`LS_ADRC_NAME1`). My Context used structure nodes, so the layout looked for `LS_ADRC/NAME1` and found nothing.
2. *Blocks started hidden.* The item tables and terms were hidden until a script showed them; when the script does not run (the preview) they never appear. SAP's own form shows everything and hides on the `ready` event. Same now.
3. *Fixed-height rows.* The item rows were fixed height, so wrapped descriptions overlapped or clipped. The tables are now real table objects whose rows grow with their text, with the column headings repeating on every page.
4. *Terms.* Terms printed only when the standard text (ZPOI_ET / ZPOL_ET) was found. Now the standard text prints when it exists and the terms and conditions block prints when it does not (see "Decisions" below).

**What the layout contains now (every width, border and position read from the legacy export)**
- Page 1 and following pages exactly as the wizard form: A4, page-area watermark ("Approved PO" / "UnApproved PO", from LV_FLAG), the Dangote logo (the PNG from your wizard form) on page 1, and the frame of the main window on both pages (the wizard form had dropped the frame and the delivery box border; the legacy form has them).
- Header area 115 mm high so the tables start at 12.00 cm as in the legacy form: title by order type and PO number (legacy position 4.20 / 1.75 cm), delivery address box with border, the two supplier grids (stock transfer ZPOT / all others) with the legacy cell borders and grey label cells, "Last Changed On", the PO detail grid with Additional Comments (text lines joined into paragraphs).
- Tables as table objects: Additional Comments (only V_POTEXT = X), goods table (V_FLAG = X) and service table (V_FLAG = Y) with 7 columns exactly as the legacy line types, heading repeats on every page, row number from the row index; footer lines (Nett Discount, Freight, Insurance only for ZPOI, Other Charges, Sub Total, VAT, Total, amount in words, terms, spacer lines, ZBUK signature lines) with the legacy cell borders.
- Fonts, grey fill, margins and number pattern are the values SAP's wizard took from your SmartStyles (9 pt Arial, bold labels, 11 pt bold totals, 28 pt bold title).

**Interface changes in this push (new pull needed)**
- The Smart Form printed material numbers, units, vendor and PO numbers through their output conversion; SFP does not. The Initialization now converts them (material number MATN1, unit text from T006A, vendor / PO / service number ALPHA) into two new globals GV_EBELN_OUT and GV_LIFNR_OUT and into the item rows. Nothing else in the interface changed; the legacy nodes are still verbatim.

**Decisions I took, please confirm or correct**
1. *Terms and conditions fallback.* When the standard text is missing the form prints the 9-point terms block from your wizard form (Dangote Industries Ethiopia Ltd, Ethiopia Birr). The legacy export has no such text: its long terms (Sephaku Cement, ZAR) are switched off by `1 = 2`. I used the wizard wording because it is the Ethiopian version; tell me if the wording or the rule is different.
2. *Number notation.* Amounts and quantities use the wizard's setting `de_DE` (1.234,50). Tell me if your printouts show 1,234.50.
3. *Title and PO number position:* legacy position (1.75 cm), 9.5 mm lower than in the wizard form.
4. French wording is not designed (English only), as before.

**Checks before pushing:** valid XML (strict parser) for interface, Context and layout; Context graph consistent (87 nodes, 0 fail); every one of the 64 bindings resolves to the data schema generated from the Context; all 31 FormCalc scripts reference existing data names; each table's heading is a repeating header row and the leader of its table; all 79 legacy printed fields are bound or deliberately replaced (French-only fields, the switched-off date, the row fields that are now table columns); content areas inside the A4 page; nothing outside the template differs from your baseline except the data description, which is generated from the Context exactly as SFP writes it. The shared checker `sfp_check` rejects wizard constructs that it was written before seeing (for example `$record` binds), so it is not used for the layout; the interface check shows the same one FAIL as before (the untyped legacy global S, deliberate) and the same WARNs. I recorded all constructs and the rules they replace as strategy S08 in `docs/strategy`.

**Still unconfirmed (only your SAP can show):** pull and activation of interface and form; that the Design View and the preview show data, tables and the frame; the page-2 behaviour of the repeating headings; the `ready` conditions; the unit and material output conversions.

## 2026-10-09T19:31:46.000Z — Action needed from you (SAP)
Please do these in SAP, in order:
1. In abapGit pull this branch onto the interface ZMMET_PO_SF_INT and activate it. Report any syntax error with its exact text.
2. Pull the branch onto form ZMMET_PO_SF_ADT (this replaces its Context and layout) and activate it.
3. Open the Layout and report overflow or warning badges with the element name (a screenshot helps).
4. Preview with real orders and compare with the legacy printout: goods PO with 1 item and with more than 25 items, service PO, import PO (ZPOI), stock transfer (ZPOT), an approved and an unapproved PO, one with V_POTEXT = X, one with a missing standard text (terms and conditions block) and one with the standard text.
5. Send one line per test (PASS or what is wrong) and your answers to the four decisions above. This migration stays open until you do.

## 2026-10-10T06:08:58.000Z — Layout cross-checked against the legacy output PDF; four corrections
I compared the layout, element by element, with the printout of the legacy Smart Form (`ZETO Smartform Output.pdf`, a service PO, 2 pages): text positions to 0.1 mm, font sizes, fonts, every drawn line and fill, number notation and wording. The PDF is now the reference. **This push supersedes the previous one; please pull the form again (the interface and Context did not change since the last entry).**

**Confirmed identical to the printout**
- Header: title 28 pt bold (baseline 17.5 mm) and PO number (30.5 mm); "Delivery Address:" 11 pt bold at x 162.3; address lines 9 pt every 3.39 mm with the empty lines kept; "Last Changed On:" wraps to a second line as in the PDF; watermark "UnApproved PO" in Courier 12 pt at x 88.7, y 181.9 on both pages.
- Supplier grid: 35 + 66.3 mm, 4.69 mm rows, label cells filled grey (176), 0.26 mm lines; telephone prints "++242..." (literal plus, dial code, number); empty fax prints "+". PO detail grid: 30 + 50 mm columns, comments cell 21.7 mm high, the long text breaks by width.
- Tables: heading 9 pt bold on two lines ("Unit Price" / "(Excl.VAT)", "XAF Total" / "(Excl.VAT)"); row pitch 4.18 mm (one 9 pt line plus margins); serial number right, material number and unit centred, text left, amounts right; the service description reads `LEON HOTEL(HOTEL BILL)` with no blank; material number printed without leading zeros and the unit as "DAY" (the conversions I added are needed and right).
- **Number notation: `1,00` and `2.125,00`** (decimal comma, dot grouping, quantity with two decimals): this is the `de_DE` setting I took from the wizard form. Decision 2 of my last entry is answered by the PDF.
- Footer: spacer rows 3.39 mm, "Gross Price" 213 mm, "Net Discount" 217 mm, Sub Total / VAT / Total 11 pt bold right-aligned, the words row as one 190 x 4.18 mm box ("Total order Value In Words(CFA Franc BEAC): ... basis"), then the terms box.
- **Terms and conditions are printed in the real output** (Ethiopia wording, 9 points, heading, blank line, the box continuing on page 2 with point 9). The wording equals the static block in the layout, so decision 1 of my last entry is answered: keep it. The legacy export you gave me shows other wording (Sephaku, ZAR) switched off, so it is an older version or the text comes from the standard text; please send a fresh export and the content of the standard texts ZPOI_ET / ZPOL_ET.

**Four things I got wrong, now corrected**
1. I had drawn a **frame** around the main window (page 1 and 2) and a **border around the delivery box** because the export has border attributes. The real output has neither. Removed.
2. I had moved the title and the PO number to the export window coordinates (9 mm lower than printed). Restored to the printed position.
3. The terms heading was bold; the printout is regular. Fixed.
4. Terms from the standard text were joined into one paragraph; the printout shows them line by line. Now one row per text line, in the same 190 mm box.

**Checks before pushing:** valid XML (strict parser); all 64 bindings resolve to the data schema from the Context; 31 FormCalc scripts reference existing names; leaders, geometry and legacy printed-field coverage pass (13 of 13). The comparison method is now a tool (`tools/pdf_probe.mjs`) and a section of strategy S08 (section 18), so every ticket is checked against its legacy PDF the same way. Still only your SAP can show: pull and activation, that the Layout and the preview show the data, and the page-2 behaviour.

**Still open:** French wording (English only), whether the standard texts exist in your system, a fresh export of the Smart Form. The test list of the previous entry stands.

## 2026-10-10T06:08:58.000Z — Action needed from you (SAP)
Please pull the branch onto form ZMMET_PO_SF_ADT (the interface needs a pull only if you have not yet done the previous one), activate, and run the tests of the previous entry. Send one line per test (PASS or what is wrong); please include a preview PDF of the same service PO as in `ZETO Smartform Output.pdf` so I can compare the two PDFs directly. This migration stays open until you do.
