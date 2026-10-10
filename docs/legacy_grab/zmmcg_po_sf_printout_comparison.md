# ZMMCG_PO_SF - comparison with the legacy printout and with the client's wizard form of this Smart Form

Three sources, in this order of authority for **geometry**:

1. `docs/legacy_grab/wizard_reference/ZMMCG_PO_SF_F.XDP` (+ `SFPF_...XML`): the client's SAP wizard form of THIS Smart Form
   (supplied 2026-10-10). It reproduces the legacy printout of the ZPOS sample, field by field.
2. `ZCGO Smartform Output.pdf`, the legacy printout (ZPOS, French, unapproved, 2 pages), read with
   `tools/zmmcg_po_sf/printout_dump.cjs` (text origins, lines, rectangles, image).
3. The legacy export: conditions, texts (English and French), line types, borders, template line heights.

`tools/zmmcg_po_sf/conformance.mjs` (called by `verify.mjs`) compares the generated layout with source 1 as absolute page
coordinates; the printout confirms source 1 (title, address, last changed, grids, totals, words row and terms agree with the
wizard form to 0.1 mm). **The new layout has not been rendered by us.**

## 1. The baseline rule I had wrong (and its consequence)

First baseline of a line = **cell top + top inset + 0.717 em** (9 pt: 2.28 mm, 11 pt: 2.78 mm, 18 pt: 4.55 mm). The wizard form
satisfies this for every kind of element against the printout: title top 11.445 mm -> baseline 16.0 mm (printout 16.0), address
10.422 -> 12.70 (printout 12.70), grid cell 65 + 1.122 -> 68.40 (printout 68.4), totals 7.822 -> 10.10 below the table (printout
10.1), terms heading, words row. My earlier builds used 0.905 em (the font's ascent) with top insets of 0.5 mm: **every text would
have been printed about 0.6 mm above its legacy place and the 18 pt title 1.2 mm too high.** Insets now follow the wizard form:
1.122 mm for one-line 9 pt cells (1.092 mm with line height 3.4 mm), 0.47 / 1.022 mm in the totals, 4.422 mm for the terms heading.
(The sibling form ZMMET_PO_SF uses 0.5 mm with line height 3.387 mm - not applicable here.)

## 2. Differences between the previous build (`b321a85`, `607d265`) and the wizard form / printout, now corrected

| # | Wizard form / printout | Previous build | Now |
|---|---|---|---|
| 1 | page-1 content area x 7.5, y 0, 202 x 290 mm; the header is one 135 mm positioned block, all windows at their absolute coordinates | content area = bounding box of the windows (y 9.3, 201 x 281 mm) | same as the wizard form |
| 2 | title / PO number 18 pt bold, top 11.445 / 24.445 mm (baselines 16.0 / 29.0), 110 mm cells centred on 89.2 mm | 28 pt, later 18 pt at the 0.905 em position (1.2 mm too high) | 18 pt, tops 11.447 / 24.447 mm, 141 mm cells with the same centre |
| 3 | plant address: repeating subform, one 4.183 mm field per line, x 140.5, y 10.422, no frame | one multi-line field with a box | repeating subform bound to LT_ADRC, 4.183 mm lines, no frame |
| 4 | grids: rows 4.692 mm from y 65, cells 40 + 61.3 and 32 + 58 mm, fixed height, top inset 1.122, left 0.7, right 0; last row 21.769 mm (ends 129.0 mm), left 0.35, top 1.092, line height 3.4 | 4.70 mm rows, top inset 0.5, last row 27.7 / 21.7 mm | as the wizard form |
| 5 | table: heading row 7.6 mm (inset 1.122, 0.3 left/right, line height 3.4); item rows fixed 4.183 mm; item no. right (right inset 1.18), code / quantity / unit centred, description left, prices right (1.28) | minH rows 4.177 mm, insets 0.5, quantity right aligned with 8.0 mm inset, item no. centred | as the wizard form; the description cell may grow (see 4) |
| 6 | totals labels right aligned; rows 4.2 mm (9 pt) and 4.3 / 4.4 mm (11 pt bold); amount in words 4.2 mm with a box | left aligned labels, 0.5 mm insets | right aligned, 4.2 / 4.35 mm rows, insets 1.022 / 0.47 mm, words row 4.2 mm |
| 7 | terms heading: one 11.722 mm field, bold, top inset 4.422, left 1.18; term rows: number cell 5.5 mm (top 0.3), text cell left 0.353 + hanging indent 0.353, right 0.8, line height 3.39 | heading text with blank lines (3 lines), 0.5 / 0.29 mm insets, no hanging indent | as the wizard form (bottom inset 0.51 mm so that one line is 4.2 mm as on the printout) |
| 8 | no frame around the window, no address box (the printout agrees); outer lines = left / right edges of the rows | frame drawn (607d265), removed in b321a85 | none |
| 9 | watermark 12 pt grey Courier, x 15.2, y 239 (page 1) / 179 (page 2), 6 mm high, inset 0 | y at the window top, top inset 0.74 mm, line height 4.233 mm | y = window top + 1.4 mm = 239 / 179, inset 0 |
| 10 | logo x 0.6 + 7.5, y 11.1 mm, 29.6 x 16.8 mm | 8.01 / 11.11 mm, 29.633 x 16.764 mm | 8.1 / 11.1 mm, 29.6 x 16.8 mm |

## 3. A defect found in the generator while doing this (not visible in the sample)

The legacy export stores the logical operator of a condition (AND / OR) as an **item of its own before the operand it connects**.
`model.mjs` dropped those items, so every `OR` condition was generated as `AND`: the stock-transfer title (`V_BSART = ZPOT OR ZPIC`),
the import / local branch (`ZIMP OR ZLOC`) and the Inco-terms text (`GV_INCO1 <> blank OR GV_INCO2 <> blank`) could never be true.
Fixed (12 `OR` and 55 `AND` operators of 65 multi-item conditions are now read); the three scripts changed.

## 4. Where the generated layout deliberately differs from the wizard form

* **All order types and both languages**: the wizard form is one ZPOS case with French labels; the generated layout carries every
  live legacy text node with its condition, in English and French, the goods table (its own column widths), the comments table and
  the totals for every type.
* **Repeating heading row** (`overflow leader`) and growing rows for pages after the first.
* **Description cell** grows with long texts (the legacy wraps them) with a line height fitted so that one line is exactly 4.183 mm
  (3.061 mm); the other item cells are fixed like the wizard form. Same fitting for the words row, comments and text rows.
* **Terms rows** 4.2 mm (bottom inset 0.51 mm) instead of the wizard form's 3.96 mm, which is how the printout is spaced (rows
  27.25, 27.67 ... cm); the heading is 11.722 mm as in the wizard form so that the first term baseline is 27.57 cm like the printout.
* **Watermark** text by `LV_FLAG` (approved / unapproved) instead of fixed text.
* **Item number**: right aligned as in the wizard form. The printout shows "10" ending 0.8 mm right of "1" (the legacy value is an
  integer printed as "1 " with a trailing blank); not reproduced.

## 5. Not provable without a render in SAP (to be judged in the client's preview)

* The baseline model is taken from the wizard form and agrees with the printout in every element, but only a render can show
  Adobe's behaviour with the fitted line heights (3.061 / 3.078 mm) of the growing cells: a first baseline up to 0.4 mm higher
  would be the worst case in those cells.
* A term row that the legacy splits across the page break (term 4): Adobe decides itself whether to move or split it.
* Item numbers of 100 or more in the 11.3 mm cell; long values cut at the fixed grid cells (legacy: cut, too).
* Only a ZPOS sample was available: goods types use the same constructs but are not measured.
