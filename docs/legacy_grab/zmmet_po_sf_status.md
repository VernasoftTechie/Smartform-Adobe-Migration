# Migration Status — ZMMET_PO_SF

STATUS: in_progress
UPDATED: 2026-10-09T11:58:10.844Z
WAITING_ON: engineer
NOTE: 
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
