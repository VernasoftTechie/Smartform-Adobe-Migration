# YMM_PO_SMARTFORM_ADT — layout notes (evidence, assumptions, increments)

Evidence source for every number below: window table of `YMM_PO_SMARTFORM_extract.md` section 4 and the
raw `OUTATTR` of each window in `ymm_po_smartform.xml`.

## Page and geometry (revised: exact legacy positions)

Owner request 2026-10-09: every window at its legacy position. Coordinates are page-absolute as in the Smart Form export.

- A4 portrait. Page 1 content area = the legacy MAIN window region: x 0.17 cm, y 0.03 cm, w 20.42 cm, h 25.80 cm (bottom 25.83 cm). Page 2 content area = legacy %WINDOW7: x 0.17, y 0.63, w 20.42, h 25.00 (bottom 25.63). Two page areas (page 1 once, page 2 repeated).
- The page-1 header block (`po_header`, 20.42 x 9.73 cm, origin 0.17/0.03) holds the legacy windows at their exact left/top/width/height; the flow (MAIN window) therefore starts at y = 9.76 cm like the legacy MAIN window.
- Margins are therefore 0.17 cm left and 0.41 cm right (the legacy values); the rulebook S02/F48 margin rule (at least 1 cm) is deliberately not applied. `sfp_check` warns; if the preview shows overflow badges, the first thing to try is the scaled variant (x and width x 0.93).
- Tables: legacy column widths unscaled (19.30 cm) with the table left margin 0.07 cm.
- Independent audit (generated XDP versus export window table): logo, COMPANY_NAME, HEADING_PO, PR_DETAILS, PO_DETAILS, SUPPLIER_ORDER_ADDRESS match to 0.01 cm; LOCAL_IMPORT_PO_TEXT keeps left/top/height but is 20.26 cm wide instead of 20.42 (borderless window that would otherwise exceed its parent by 0.16 cm). PR_DETAILS has no left value in the export: 0.30 cm assumed.

## Increment 1 — page-1 header block (this push)

| Legacy window | Legacy position (left/top, w x h cm) | Layout | Evidence for content |
|---|---|---|---|
| `%GRAPHIC1` | 0.17/0.13, 5.42 x 2.82 | `logo`, image `/sap/bc/fp/graphics/public/graphics/bmap/bcol/dangote%20logo.bmp` (same SE78 object as the pilot, rendered in the client's SAP) | graphic `GRAPHICS/DANGOTE LOGO/BMAP` BCOL |
| `COMPANY_NAME` | 6.03/0.03, 11.83 x 2.40, box | `win_company`, three exclusive variants: werks <> 1021 and LV_FLAG <> F; werks <> 1021 and LV_FLAG = F; werks = 1021 | text nodes `%TEXT164`, `%TEXT173`, `COMPANY_CODE`; `%CODE95` sets LV_FLAG |
| `HEADING_PO` | 5.65/2.50, 11.80 x 0.44, box | `win_heading`, 7 titles chosen by V_BSART | `%TEXT37/38/39/22/23/180/181` |
| `PR_DETAILS` | **left not in the export**, 3.11, 11.50 x 3.97, box | `win_pr`, x = 0.30 cm **assumed** (aligned with the supplier box); 4 variants V_FLAG X/Y x CUR_KEY A/B | `%TEXT55/54/41/191/40/190` |
| `PO_DETAILS` | 12.90/3.35, 7.32 x 4.07, box | `win_po`, "Last Changed On" + 3 variants by V_BSART | `%TEXT257/170/182/4` |
| `SUPPLIER_ORDER_ADDRESS` | 0.30/5.75, 11.50 x 3.40, box | `win_supplier` | `%TEXT155` |
| `LOCAL_IMPORT_PO_TEXT` | 0.33/9.16, 20.42 x 0.54 | `win_note`, ZLOC / ZIMP note | `%TEXT179`, `%TEXT183` |

Conditions are the legacy ones, evaluated in an `initialize` script from hidden holder fields that are direct
children of `po_doc` (rulebook 8.9 pattern, same as the pilot's watermark). Values shown in more than one variant are
bound once in a holder and copied by a composed field (pilot `date_display` pattern); values shown once are bound
directly. Amounts, the PR date and PR/vendor numbers come from `GS_FMT_OUT` (already formatted text).

### Not evidenced / placeholders (Developer Extension Points)

- Fonts: Arial placeholders (9 pt company lines, 10 pt bold titles, 8 pt bold for SC titles, 7.5 pt for PR/PO/supplier
  windows, 8 pt bold notes); `YMM_PO_STYLE`, `SYSTEM`, `YMMDRAFTSTYLE` are not in the export. Alignment is centred for
  company/title lines (assumption), left elsewhere.
- Inline bold (character format C4) inside a text line is represented by a separate label draw and a bold value field.
- 7.5 pt / 0.32 cm row pitch in `PR_DETAILS`: the legacy text must fit between 3.11 and the supplier box at 5.75 cm
  (8 lines), which fixes the pitch; the real legacy size is unknown.
- `PR_DETAILS` (3.11-7.08) and the supplier box (5.75-9.15) overlap vertically in the legacy form; reproduced as is.
- Page-1 only: the legacy header windows are not on page 2.

## Next increments (each is handed to the client for activation/preview)

2. Header texts, EKPO/ESLL item table with repeating header (rulebook 8.10, unconfirmed), totals, amount in words.
3. Item texts F01-F05 and the terms-and-conditions variants (18 variants selected by V_FLAG / LV_COND ...).
4. Watermark and "PO No / Page x of y" on every page (needs master-page content or the documented fallback).

## Increment 2 — header texts and item tables (page-1 MAIN flow)

| Legacy node(s) | Layout | Evidence |
|---|---|---|
| `%LOOP70/71` + `%TEXT198` (header text lines) | `head_texts` / `head_row`, one growable line per `GT_HEAD_OUT` row, 8 pt | extract section 4, MAIN window; the 100-line chunk loop is not carried (D1) |
| `%TABLE1` (V_FLAG = X, IT_EKPO) | `items_ekpo`, columns 1.00/2.90/5.46/1.40/2.56/2.80/3.18 cm | table `CELLS` in the export (19.30 cm) |
| `%TABLE2` (V_FLAG = Y, IT_ESLL) | `items_esll`, columns 1.00/3.00/5.93/1.50/2.33/2.46/3.08 cm | same (19.30 cm) |
| header row (`%ROW1`, `%ROW5`) | repeating header row (`occur max=-1`), titles SNo / Item Code / Description / UOM / Req. Qty / Unit Rate (CUR) / Value (CUR) | `%TEXT5-9,15,106`, `%TEXT24-29,98` |
| item row (`%ROW2`, `%ROW6`) | one row per `GT_EKPO_OUT` / `GT_ESLL_OUT` record; description cell = short text + material long text (EKPO) | `%TEXT10/11/101/102/13/21/16/14/184/107/187`, `%TEXT30/31/103/33/35/34/185/42/186` |
| footer total (`%ROW9`, `%ROW4`) | six empty bordered cells + total text in the last column | `%TEXT108/189`, `%TEXT18/188` |
| footer words (`%ROW29`, `%ROW30`) | one full-width cell: "Total Value In Words(K): words INCO1 INCO2 basis"; for ZIMP/ZLOC "Total Order Value In Words(...)" | `AMOUNT_WORDS`, `%TEXT171`, `%TEXT49` |

Table frame and cell borders: the export shows a 0.75 pt frame, header cells with all four sides and item/footer
cells with left/right/bottom; here every cell has four 0.26 mm edges (adjacent edges coincide). Column widths are the
legacy ones (19.30 cm); EKPO header cell 5 is the two paragraphs "Req." / "Qty", ESLL header cell 5 is "Req.Qty".

### Deliberate deviation from the S06 default — UNCONFIRMED in the client's SAP

The two item tables use Adobe's own table construct (`layout="table"` with `layout="row"` rows, `minH` growable
multi-line cells, header row with `occur max=-1` named as `<overflow leader>` of the data row), copied from the
Designer 11 sample `Purchase Order/Dynamic/Forms/Purchase Order.xdp`. S06 says to avoid `layout="row"` and uses
fixed-height position rows; fixed-height rows clip item long text (material text can be 1,000+ characters), so
growth was judged more important. `sfp_check` therefore reports FAIL "continuation container must be layout tb"
and eight S06 `layout="row"` warnings for these two tables. **Fallback if the preview is wrong:** S06/S07 pattern 5
position rows (fixed height) with the header row as the overflow leader (rulebook 8.10).

### Not in this increment

Item texts, terms and conditions, watermark, footer "PO No / Page x of y", the MAIN window outline box, the
page-2 window geometry. The text-line column alignment (centre for SNo and headings, left for code/description,
right for UOM/quantity/amounts) and the bold values (character format C4) are assumptions.

## Increment 3 — item texts and terms and conditions

| Legacy node(s) | Layout | Evidence |
|---|---|---|
| window-level loops `%LOOP50/73/76/79/82` (item texts F01-F05, headings "Item Text", "Info record PO text", "Material PO Text", "Delivery Text", "Info record note") | `item_texts`: one growable line per `GT_ITXT_OUT` row (heading rows and text lines, prepared in Initialization block 3d) | `%TEXT199-208`, `%TEXT200-206` |
| `%CONDITION209` (V_FLAG = X): `%TEXT217/218/258/219/220/221/222/223/224/225/226` | 11 bordered, growable blocks `tc_x_*`, each shown by the legacy condition of its text node AND V_FLAG = X | extract section 4 (conditions copied verbatim and translated to JavaScript) |
| `%CONDITION213` (V_FLAG = Y): `%TEXT209/210/259/211/213/214/215` | 7 blocks `tc_y_*`; `%TEXT212` is not built (condition contains `1 = 2`) | same |

How a terms block is built: the legacy lines of the English text are read from the extract; a line whose format is
blank, `=` is a continuation of the previous paragraph (joined with a space), `/*` comment lines are dropped, `,,`
(tab) at the start of a line becomes a 4-space indent and elsewhere one space, `<(>,<)>` becomes a comma, `&FIELD&`
and `&FIELD(C)&` are replaced by the value of a hidden holder (amounts and the delivery date from `GS_FMT_OUT`).
The block is one multi-line field per variant whose text is set in an initialize script; the variant itself is shown
or hidden by its condition. All conditions are evaluated independently, exactly as in the Smart Form, so overlapping
conditions would print two blocks as they did before.

Known differences (not evidenced or lost): character formats `<C1> <C2> <C4> <C5> <C6>` inside the terms (emphasis) are
dropped, paragraph formats P6/P9 have no known font so one 8 pt Arial is used, the French (F) texts are not built,
and the legacy `YMM_PO_STYLE` spacing between paragraphs is not reproduced. Static terms texts live in scripts, so
`sfp_check` cannot see them and still lists them as "not found".

## Increment 4 — master page: watermark and page footer (UNCONFIRMED in the client's SAP)

Two master pages (page 1 and page 2, exactly as the legacy form has two pages) hold:

| Legacy | Layout | Evidence |
|---|---|---|
| `WATER_MARK` window (1.52/17.76, 18.00 x 4.70 cm; on pages 1 and 2) with the alternative `%CONDITION127` (`LV_FLAG = 'Y'`, which `%CODE21` sets for release indicator R or A) | `wm_approved` "Approved PO" when `IV_REL_INDICATOR` is R or A, else `wm_unapproved` "UnApproved PO"; 56 pt Courier New bold, grey, centred | `%CODE21`, raw XML of `%CONDITION127` (the extract tree omits that condition) |
| `PAGE_NO` window (0.17/25.80 on page 1, 0.17/25.70 on page 2), text `%TEXT110` "PO No:&V_PONO& Page &SFSY-PAGE& of &SFSY-FORMPAGES(3ZC)&" | `mp_footer`: box, one field with a calculate script "PO No:<V_PONO>   Page <absPage> of <pageCount>" (`xfa.layout.absPage/pageCount`, the pilot's page counter) | extract section 4 |

The two data values reach the master page through hidden fields bound with `$record.IV_REL_INDICATOR` and
`$record.V_PONO` (Adobe's *Purchase Order Dynamic* sample binds its master page the same way). `sfp_check` warns
that content sits inside `pageArea` (rulebook s10/F15: a blank Design View was once seen in this SAP).
**Fallback if the preview shows nothing or the values are empty:** drop the master-page content and put the footer
and watermark inside the flowing body (footer as the last row of the table container, watermark only on page 1).

Choices without evidence: watermark colour (light grey) and size (56 pt so that "UnApproved PO" fits 18 cm); the
footer text has no blank first line (legacy had one empty `PF` paragraph before the text); 8 pt bold.

### Not built (stated, not hidden)

- The MAIN window outline box is now drawn on both master pages (page 1: 9.76-25.83 cm, page 2: 0.63-25.63 cm).
- Page 2 has its own page area with the legacy %WINDOW7 geometry; the header block is page 1 only, as in the legacy form.
- The unreferenced legacy page-2 copy of the main window (see Q1 in `ymm_po_smartform_initialization.md`) is not built.

### Coverage of legacy printed fields (36 legacy references without a same-named binding)

29 are replaced by print-table columns computed in Initialization (`GV_DMBTR`, `GV_DMBTR_TOTAL`, `GV_TEXT`, `V_SLNO`,
`LV_MENGE`, `LV_NETPR1`, `LV_NETWR`, `LV_TOT`, `LV_TOTAL`, `WA_EKPO-*`, `WA_ESLL-*`, `LV_ITEM/INFO/MAT/DEL/NOTE`,
`WA_RTEXT-*`, `LS_HEAD_TXT-TDLINE`). 7 are only printed by nodes that never print: `V_DATE`, `V_NETPR`, `V_ZTERM`,
`LV_TEXT`, `WA_PLANT-STRAS/ORT01/PFACH` (dead `1 = 2` nodes and the page-2 copy). No live legacy field is missing.
