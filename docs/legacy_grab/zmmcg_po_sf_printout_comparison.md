# ZMMCG_PO_SF - comparison with the real legacy printout

Evidence: `ZCGO Smartform Output.pdf` (Smart Form printout of a service order, type ZPOS, French, "UnApproved PO", 2 pages,
logon language English), supplied by the project owner on 2026-10-10. Method: text items, vector lines/rectangles and image
placement read from the PDF with `tools/zmmcg_po_sf/printout_dump.cjs` (pdf.js), all numbers in cm from the top-left of the page.
Build compared: commit `607d265` (before) and the rework of 2026-10-10 (after). **This is a numeric comparison of the
generated layout parameters with the printout, not a render of the new form: the new form has not been rendered by us.**

## 1. Differences found in the build `607d265` and corrected

| # | Legacy printout (measured) | Build 607d265 | Now |
|---|---|---|---|
| 1 | Title and PO number: **18 pt** bold, centred on 8.92 cm (= window left 1.87 + half the template width 14.10), baselines **1.60 / 2.90 cm** (the baselines sit on the top of template lines 1 and 3: 1.60, 1.60 + 8.0 + 5.0) | 28 pt (copied from the wizard form of the sibling ticket), 14.56 cm wide, at wizard offsets | 18 pt, 141 mm wide cells at x 18.7 mm, y so that the baselines are 16.0 / 29.0 mm; the cells are children of the header area (they lie above the window top) |
| 2 | **No box** around the plant address; lines 4.175 mm apart (14 lines from 0.95 cm, x 14.80) | box with 4 edges, 3.387 mm lines | no border, line height 4.175 mm |
| 3 | **No frame** around the items / totals / terms block: the outer lines are the left and right edges of the rows (page 2 starts at 0.55 cm without a top line and ends without a bottom line) | frame drawn by the page area (`MAIN_FRAME`) | removed |
| 4 | Totals labels (Prix Brut, Remise, Sous Total, TVA, CA, Total) **right aligned**, ending at 16.55 cm; values end at 19.63 cm | labels left aligned | right aligned (all totals cells) |
| 5 | PO_DETAIL last row (Commentaires) is 21.70 mm: the grid ends at **12.90 cm**; text lines 3.387 mm apart | row filled the space down to the table (27.7 mm) | row heights read from the export (STATLINES): 9 x 4.70 mm + 21.70 mm |
| 6 | Text in cells starts **0.7 mm** after the cell edge (labels x 0.82 for a cell at 0.75, values 4.82 / 14.40 / 5.09 ...) | 0.5 mm (wizard) | 0.7 mm everywhere |
| 7 | Terms: text rows are 4.18 mm for one line (top 0.5 mm), the heading text has a blank line before and after (1.09 cm), item 10 has a trailing blank line (0.75 cm), 3 blank rows close the block | rows 3.39 mm, no top inset: block would end about 8 mm too high | rows 4.177 mm with the cell margins; heading and last term keep their blank lines |
| 8 | Item number centred on **1.67 cm** (1 and 10 both centre there; cell centre would be 1.32 cm) | right aligned at 1.76 cm | centred, 7.1 mm paragraph indent (legacy indent) |
| 9 | Qty ends at 12.12 cm (8.0 mm from the cell edge); prices end 1.2 mm from the cell edge, big totals values 1.3 mm | 8.1 / 1.23 / 1.43 mm | 8.0 / 1.2 / 1.3 mm |
| 10 | `SY-LANGU` conditions (country name, month name, ...) follow the **logon language**: English country "Republic of the Congo" and month "April" on a French (ZPOS) document | mapped to the print language (would print "Congo" in French) | mapped to the logon language (`GV_LANGU`); the print language drives only the static text variants |
| 11 | A legacy row without printable text has no height and no border (no line under the last blank row) | zero-height rows kept their borders | no border on rows without text |
| 12 | Grid label "Date de Bon de Cde." is 30.9 mm wide in a 30.95 mm area | right inset 0.35 mm (area 30.95 mm: wrap risk) | right inset 0 in grids |

## 2. Checked and found equal (no change)

Logo at 0.81 / 1.11 cm, 2.96 x 1.68 cm (build: 8.01 / 11.11 mm, 29.633 x 16.764 mm); watermark 12 pt monospace, grey 176,176,176,
centred in the window at 23.76 cm (page 1) and 17.76 cm (page 2); last-changed text at 0.94 / 3.67 cm; supplier and PO detail grids
(13 rows x 4.7 mm from 6.50 cm, grey 176 label cells, 0.75 pt edges, widths 4.00 / 6.13 and 3.20 / 5.80 cm); table header 13.50-14.26 cm
(two-line headings, centred, grey); data rows 4.177 mm, borders left/right/bottom per cell, column widths 11.3 / 31.4 / 57.0 / 22.0 /
12.4 / 28.0 / 27.9 mm and alignments (code and unit centred, description left, numbers right); blank rows 3.387 mm; totals rows
4.177 mm and big totals 4.36 mm; words row with top and bottom edge; term numbers at 1.07 cm and term text at 1.67 cm;
baseline offset in every cell (top inset 0.5 mm + ascent 2.87 mm = 0.34 cm: label baselines 6.84, 7.31, ... measured).

## 3. Still not provable without a render in SAP (to be judged in the client's preview)

* Adobe's first-baseline position when a paragraph has an explicit `lineHeight` larger than the font's natural line (address
  lines 4.175 mm, totals 4.36 mm): up to 0.5 mm vertical offset is possible.
* Rows that the legacy printout splits across the page break (term 4 starts on page 1 and ends on page 2): Adobe moves or splits
  the row by its own rule.
* Item numbers of 100 or more: the 4.2 mm area (legacy indent) holds two digits, as in the legacy form.
* Wrapping of very long values in the fixed-height grid cells (street, e-mail): the legacy cuts them at the cell.
* The legacy glyph problems on this printout (characters "e acute" and words broken apart in the French terms) are a
  font/encoding defect of the legacy output and are not reproduced.
* Goods orders (ZPOC/ZPOR/ZPOT/ZPOI/ZPOL): only a ZPOS printout was available; the goods table uses the same measured
  rules (same line types in the export) but is not measured.
