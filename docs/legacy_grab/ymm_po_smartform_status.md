# Migration Status — YMM_PO_SMARTFORM

STATUS: waiting_manual
UPDATED: 2026-10-09T12:11:51.162Z
WAITING_ON: operator
NOTE: IMPORTANT: the layout was revised after the last entry to match the legacy form position for position. If you have not tested yet, PULL the latest commit of this branch first and test that version (earlier pulls are superseded). Then PULL, ACTIVATE the form, open Layout in Design View (page shown or blank?) and PREVIEW a released order, an unreleased order, an order with more than 25 items (rows growing, header repeated on page 2, Page x of y on every page) and a service order (V_FLAG = Y); compare each with the legacy PDF position by position and report differences with screenshots, plus any activation error text exactly. Confirm in Bolt Console only if it matches.
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

## 2026-10-09T11:38:42.159Z — Manual activity confirmed
Client confirmed the manual step is done.

## 2026-10-09T11:45:53.206Z — Layout increment 1 pushed (header block), waiting for your preview
**Delivered:** src/ymm_po_smartform_adt.sfpf.xdp now has an A4 portrait page with 1 cm margins and the page-1 header block: logo (same SE78 graphic the pilot already rendered), company block (3 variants), order title (7 variants by V_BSART), PR box (4 variants), PO box (3 variants + Last Changed On), supplier address and the ZLOC/ZIMP note. Everything outside the template is byte-identical to your baseline; the Context file is unchanged. Evidence for each window, assumptions and placeholders: docs/legacy_grab/ymm_po_smartform_layout_notes.md.

**Checks (sfp_check layout vs your baseline):** 13 passed - layout parses, nothing outside the template differs from your baseline, margins >= 1 cm, every child inside its parent, explicit x/y everywhere (S06), bind syntax, all 37 bindings resolve to Context nodes. 1 FAIL and 4 WARN, all expected at this stage: FAIL = 64 printed fields not bound yet (they belong to increments 2-4: item tables, header/item texts, terms, totals); WARN = 17 condition/holder fields the legacy form did not print (hidden fields that carry V_BSART, V_FLAG, WA_PLANT-WERKS, LV_FLAG, CUR_KEY and the formatted PR date/numbers), SFSY page fields need an XFA page counter (increment 4), 172 legacy static texts not yet in the layout, no repeating table yet.

**Please be aware (unconfirmed until your preview):** (1) Nothing here has been rendered by us; Design View/preview is the real check. (2) The legacy windows reach 0.41 cm from the right edge, so widths are scaled by 0.93 to keep the 1 cm margin; tell us if you want the unscaled geometry instead. (3) PR_DETAILS has no left position in the export; 0.30 cm is assumed. Its box and the supplier box overlap vertically in the legacy form and do here too. (4) Fonts are Arial placeholders (9/10/8/7.5 pt) and company/title lines are centred by assumption because YMM_PO_STYLE is not in the export - please tell us what looks wrong against the legacy PDF. (5) Conditions run in JavaScript initialize scripts reading hidden fields (the pilot watermark pattern); if a variant does not appear, say which order type and plant. (6) The Initialization ABAP: still no compile error reported to us after your activation, thank you.

## 2026-10-09T11:50:06.792Z — Manual activity confirmed
Client confirmed the manual step is done.

## 2026-10-09T11:54:21.920Z — Layout increment 2 pushed (header texts, item tables), waiting for your preview
**Delivered** in src/ymm_po_smartform_adt.sfpf.xdp (on top of increment 1, your baseline and Context untouched): the header text lines, the item table for V_FLAG = X (SNo, Item Code, Description with material text, UOM, Req. Qty, Unit Rate, Value) and the service table for V_FLAG = Y, each with a repeating column header, a total, and the Total Value In Words line. Page content area is now 190 x 255 mm (room kept for the page footer, increment 4). Details and evidence per node: docs/legacy_grab/ymm_po_smartform_layout_notes.md.

**Checks (sfp_check layout):** 22 passed (nothing outside the template differs from your baseline, margins >= 1 cm, geometry, bind syntax, all bindings resolve to Context nodes). **3 FAIL, all explained:** (1) 60 legacy printed fields not bound yet: the item texts, terms and conditions variants, watermark, and fields that the print tables replaced (GV_DMBTR, GV_DMBTR_TOTAL, GV_TEXT are bound as GT_ESLL_OUT / GT_EKPO_OUT columns); (2) and (3) the checker requires continuation containers to be layout tb; the two item tables are deliberately Adobe table/row layouts (see below), 8 matching S06 warnings. WARN: 35 holder fields the legacy form did not print, SFSY page fields (increment 4), 165 legacy static texts not yet in the layout, 1 S06 note.

**UNCONFIRMED and different from our usual pattern:** the item tables use Adobe’s own table/row construct copied from the Designer 11 Purchase Order sample, because item descriptions and material long texts must grow and S06 position rows have a fixed height. This is not yet proven in your SAP. If the preview is wrong, say what you see; the fallback is the S06 fixed-height row with the header row as overflow leader. Also unconfirmed: repeating of the column header on page 2 (rulebook 8.10), alignment (SNo centred, text left, numbers right) and bold values (character format C4 assumed bold), Arial placeholder fonts. The legacy chunking of header texts is not carried: all lines print. The MAIN window outline box and the page-2 geometry are not built yet.

## 2026-10-09T11:56:04.693Z — Manual activity confirmed
Client confirmed the manual step is done.

## 2026-10-09T11:59:20.975Z — Layout increment 3 pushed (item texts, terms and conditions), waiting for your preview
**Note on the last step:** your confirmation for increment 2 arrived about two minutes after we pushed it. We recorded it, but it is not clear a full preview (a 25+ item order, a service order) was done in that time. Please say in your next entry what you actually saw in the item table (rows growing with long text, the column header repeating on page 2, totals and words line); that table uses a construct not yet proven in your SAP.

**Delivered** in src/ymm_po_smartform_adt.sfpf.xdp (on top of increments 1 and 2, your baseline and the Context untouched): (1) the item text lines (F01-F05 with their headings) from the prepared table; (2) the terms and conditions: 11 variants for V_FLAG = X and 7 for V_FLAG = Y, each shown by the legacy condition of its text node (copied verbatim from the Smart Form, evaluated independently as before) with the amounts, delivery date, payment condition, shipping medium and incoterms filled in. One variant (%TEXT212) is not built because its condition contains 1 = 2 (permanently off). Mapping and the text-conversion rules: docs/legacy_grab/ymm_po_smartform_layout_notes.md.

**Checks (sfp_check layout):** 23 passed; the same 3 explained FAIL as before (57 printed fields not yet bound in the sense of the checker, mostly the fields the print tables replaced and the watermark, and the two item tables being Adobe table/row layouts). WARN: 50 holder fields that the legacy form did not print, SFSY page fields (increment 4), static terms texts are in scripts so the checker lists them as not found.

**Unconfirmed / differences:** emphasis inside the terms (character formats C1, C2, C4, C5, C6) is dropped and all terms use one 8 pt Arial (paragraph formats P6/P9 are not in the export); tabs at the start of a line are shown as a 4-space indent; the French texts are not built; page break behaviour of a long bordered terms block is unconfirmed (a block longer than the page space may move to the next page as a whole or split; please look at it). Not built yet: watermark, footer PO No / Page x of y, the MAIN window outline box and the page-2 geometry (increment 4).

## 2026-10-09T12:01:06.698Z — Manual activity confirmed
Client confirmed the manual step is done.

## 2026-10-09T12:03:56.257Z — Layout increment 4 pushed (watermark, page footer): layout complete, please test everything
**Delivered** in src/ymm_po_smartform_adt.sfpf.xdp: a master page that prints on every page with (1) the watermark: Approved PO when the release indicator is R or A, otherwise UnApproved PO (this is the legacy alternative %CONDITION127, which the extract tree had omitted and we read from the raw XML), grey 56 pt Courier New bold at the legacy window position; (2) the footer box at the legacy PAGE_NO position with PO No, Page x of y. The content area now ends at 25.5 cm to leave room for the footer.

**Layout coverage:** every legacy field that can print is bound. Of 36 legacy field references without a same-named binding, 29 are replaced by print-table columns computed in Initialization, and 7 are printed only by nodes that never print (permanently off 1 = 2 branches and the unexecuted page-2 copy). Not built, on purpose: the MAIN window outline box (tables and blocks have their own borders), French (F) texts, emphasis inside the terms, and the unexecuted page-2 copy of the main window. Details: docs/legacy_grab/ymm_po_smartform_layout_notes.md and ymm_po_smartform_initialization.md.

**Checks (sfp_check layout):** 27 passed; the same 3 explained FAIL (checker coverage count, two item tables as Adobe table/row layouts). New WARN: 4 elements live inside the page area (the master page). That is valid XFA and used by Adobe’s own Purchase Order sample, but our rulebook records a blank Design View in this SAP for content in the page area, and the data binding of master-page fields () is not yet proven in your SAP. Fallback if it fails: watermark and footer inside the flowing body.

**Honest status:** nothing in the layout has been rendered by us. The last three confirmations arrived within about two minutes of each push, with no description of what was seen, and no question of ours has been answered. Please treat this as the real test round: the item-table construct (rows growing, header repeat), the master page, the terms blocks, all order types and the amounts in the terms. We keep the ticket open until you report; sign-off needs your SAP activation and preview result recorded here.

## 2026-10-09T12:11:51.162Z — Layout revised to exact legacy geometry, please test this version
**Why:** the owner asked for an exact position-by-position check against the legacy form. We re-read every window and table in the Smart Form export against our layout and found four places where we had departed from the legacy coordinates; all are now corrected.

**What changed:** (1) the header windows are no longer scaled (we had squeezed everything by 0.93 to keep a 1 cm margin): logo, company block, order title, PR box, PO box, supplier box now sit at the exact legacy left/top/width/height, verified by an independent audit of the generated file against the export table (all match to 0.01 cm; the PR box left is not in the export, 0.30 cm assumed). The note window keeps its left/top/height but is 20.26 cm wide instead of 20.42 so it does not run outside its parent (borderless, text left aligned). (2) The item tables keep the legacy column widths (19.30 cm, previously squeezed to 19.0) and the 0.07 cm table margin; the EKPO header column is now the two paragraphs Req. / Qty and the service table header is Req.Qty as in the legacy form. (3) The form now has two page areas like the legacy form: page 1 body region 9.76-25.83 cm, page 2 body region 0.63-25.63 cm (legacy %WINDOW7), each with its MAIN window outline box, its footer (25.80 cm on page 1, 25.70 cm on page 2) and the watermark at 1.52/17.76 cm, 18.00 x 4.70 cm. (4) The footer text now sits in the lower part of its box (the legacy text has an empty first line).

**Consequences you should know about:** the legacy margins are 0.17 cm left and 0.41 cm right, so the layout now has the same. Our rulebook warns about under 1 cm margins (overflow badges were seen once on another form), and the checker warns. If Design View shows overflow badges, tell us and we switch back to a scaled variant. Two page areas are a second unconfirmed use of the master page in your SAP; the fallback is unchanged (body-only footer and watermark).

**Text check:** all 137 static texts of the header windows, table headings and footer in the export were compared with the layout; every real text is present (the terms blocks and composed headings live in scripts). **Checks (sfp_check layout):** 26 passed, same 3 explained FAIL as before plus the margin warning. Inner spacing, fonts, alignment and row pitch inside the windows are not in the export and remain our assumptions; please report anything that looks different against the legacy PDF.
