# S10 — Calibrate the layout to the wizard form of the SAME form (and the legacy printout), numerically

**Status: candidate, written 2026-10-10 from three rejected builds of `ZMMCG_PO_SF_ADT` (Window-3).** Builds on S08 (wizard
constructs) and S09 (rework, generator, client requests). It **corrects numbers that S08 sections 7 and 10 took from the
sibling form `ZMMET_PO_SF`** and adds the calibration method. Becomes validated only when the client has previewed a form
built this way (promotion standard in `README.md`).

## 1. Select this strategy

For **every** form with a printed legacy output, before the first layout push and again after every rework. A layout that
passes the structural checks (S09 section 5) can still be 0.6 mm off in every cell, 1.2 mm off in the title, or have wrong
conditions: the client sees the picture, not the checks.

## 2. Evidence hierarchy for geometry (highest first)

1. **The client's wizard-generated form of the SAME Smart Form** (XDP): reproduces the legacy output in the client's Adobe.
   Ask for it at intake (S08 section 14); keep a copy in the ticket (`docs/legacy_grab/wizard_reference/`).
2. **The legacy printout PDF** (`tools/pdf_probe.mjs`, S08 section 18): confirms or arbitrates (1).
3. The legacy export: conditions, wording in each language, line types, cell borders, template line heights - but **not its
   window borders and not its rounded heights** (4.70 mm is 4.692 mm on the printout).
4. A **sibling** form's wizard output: constructs only (S08), never numbers.

The two wizard generations differ: ZMMET_PO_SF = top inset 0.5 mm, line height 3.387 mm, growing cells (`minH`); ZMMCG_PO_SF =
top inset 1.122 mm, no line height, **fixed** single-line cells, whole-body content area. Every number in S08 sections 7 and 10 is
the ZMMET one. Extract the numbers again for each form.

## 3. The first-baseline rule (calibrated, not assumed)

In the client's Adobe the first baseline of a text line is at **cell top + top inset + 0.717 em** (Arial: 9 pt = 2.28 mm,
11 pt = 2.78 mm, 18 pt = 4.55 mm), independent of the paragraph line height. Every element of the ZMMCG wizard form agrees with
the printout under this rule (title, address, last changed, grids, totals, words row, terms). The font ascent (0.905 em) is
**wrong** here: it would print every text about 0.6 mm too high.

- Inset of a cell = `legacy baseline offset below the cell top - 0.717 em`. Legacy cells have the baseline 3.4 mm below the
  top for 9 pt, so the inset is 1.122 mm. Totals (rows start higher): 1.022 mm (9 pt), 0.47 mm (11 pt bold).
- A text placed by template line (title baselines on the template line tops, above the window top) goes into the parent block at
  `baseline - 0.717 em` (18 pt: top 11.445 / 24.445 mm for baselines 16.0 / 29.0 mm).
- The wizard folds the window position and the insets into the position: field at window left + 0.7 mm and window top + 1.122 mm
  with zero insets. Either form is equivalent; keep one.

## 4. Fixed or growing cells

| Cell | Construct | Why |
|---|---|---|
| single-line label / value / data cell | fixed `h`, top inset from section 3, no line height, `<textEdit/>` (single line) | keeps the legacy pitch exactly; long text is cut at the cell as in the legacy |
| cell that may legitimately wrap (description, words row, comment lines) | `minH` = row height, top inset from section 3, **line height fitted = row height - top inset** (4.183 - 1.122 = 3.061 mm) | one line is exactly one row; a second line grows the row; wrapped lines are 3.06 mm apart instead of 3.39 mm - state it |
| multi-line text with fixed pitch (terms, header text) | line height = legacy pitch (3.39 / 3.4 mm), small top inset (0.3 mm) and a bottom inset so that one line = the legacy row (0.51 mm for 4.2 mm); heading block sized so the first baseline lands on the printout (11.722 mm) | the pitch of wrapped lines and the row heights both stay exact |
| rows without printable text | height 0 and **no border** | the legacy prints no line there |

Unproven until rendered: the first baseline of the fitted-line-height cells (worst case 0.4 mm high). Say so in the status entry.

## 5. Page and header structure of the ZMMCG wizard form (a template for forms with fixed windows)

- page-1 content area = the **whole body** (x 7.5, y 0, 202 x 290 mm); page 2 = the legacy continuation window
  (x 7.5, y 5.5, 190 x 284.5 mm);
- header = one `layout="position"` subform (135 mm high) holding logo, title, PO number, address, last-changed and both grids at
  their **absolute** legacy coordinates (window left - 7.5 mm, window top); the items table starts right below it;
- address block = repeating subform bound to the address table (one field of 4.183 mm per line), no frame;
- grids = label cell (grey 176, 4 edges 0.75 pt) + value cell per row, fixed height, right inset 0 (a label that fills its cell, such
  as "Date de Bon de Cde.", must not wrap);
- watermark = page-area object (12 pt Courier New grey, window top + 1.4 mm), logo = page-area image at window + 0.1 mm;
- no window frame, no address box (the printout and the wizard form have none); the outer lines of the table / totals / terms
  block are the left and right edges of the rows; the closing rows end the block;
- alignments come from the wizard form (it read the paragraph formats): item number right (right inset 1.18 mm), code /
  quantity / unit centred, description left, prices right (1.28 mm), totals labels right.

## 6. The comparison, as a verifier (`tools/zmmcg_po_sf/conformance.mjs`, called by `verify.mjs`)

Compare the **generated** layout with the wizard XDP as **absolute page coordinates** (mm, tolerance 0.15 mm; exact for page areas,
heights, insets):

page areas and watermark; logo; title / PO number (centre, top, font); address block (position, line height); last-changed
origin (window + insets); every grid row (y, width, margins) and the last-row end; item table column widths, heading height,
and per column height, margins and alignment; sum of the totals rows against the wizard block; words row; terms heading, number
cell, text cell (margins, indent, line height).

Rules for writing it: map names explicitly (wizard `FORM_TITLE` = generated `HEADING`); compare the table of the same
**order type** as the sample (the goods table has its own widths in the export); restrict a row search to that row's own markup
(single-cell rows have no `C2`); keep deliberate deviations out of the comparison and list them in the status entry (section 8).

## 7. Generator lessons from the same rework

1. **Read the logical operators of conditions.** The export stores AND / OR as an item *of its own before the operand it
   connects*. A reader that keeps only operand items turns every OR into AND (12 of 65 multi-item conditions on ZMMCG_PO_SF:
   stock-transfer title, import / local branch, Inco terms). Test the reader on a known OR; the sample order may never show it.
2. **`SY-LANGU` in a legacy condition is the logon language**, the print language only selects the static text variants (French
   printout with English country and month names). Two variables.
3. **Window flags are not frames.** Never draw a frame or a box from the export's window border flag.
4. **Heights come from the template (`STATLINES`) and the printout**, not from the window or rounded export values; a blank
   paragraph inside a text is a real line; a text node with leading / trailing blank lines (terms heading) becomes margin, not blank lines.
5. **Write generator source with the file-writing tool**, never as shell strings (F64): a regex escaped through `node -e` was
   silently wrong again in this rework; keep helper constants (`ROW_DATA`, `ROW_TXT`, `ROW_BLANK`, margins) in one block.
6. **Alignment cannot be read from one printout value.** "1" and "10" ending at different x looked like centring; the cause was an
   integer printed with a trailing blank. Take alignments from the wizard form.
7. A layout that passes 20-28 checks proves structure only. Budget the numeric comparison as a gate, not as a review comment.

## 8. Status entry after a calibration rework

State: which sources were compared (wizard form of this form, printout, export); the main findings in the client's words
(e.g. "every text would have been 0.6 mm too high"); what was deliberately kept beyond the wizard form (all order types and
languages, repeating heading, growing cells); the verifier result including the conformance check; **what only a render can prove**
(first baseline of fitted cells, a row split across the page break, 3-digit item numbers, long values, order types without a
printout) and the printouts / wizard forms still wanted.

## 9. Relation to the generic design rulebook (`instructions/ADOBE_FORMS_DESIGN_MASTER_RULEBOOK.md`)

That document is form-type-agnostic and, by its maintainer's note, must not restyle a form already in flight (Helvetica, blue
palette, zebra rows would break the pixel match the client expects). What applies here from it: business behaviour first
(section 3), dynamic height for repeating tables, no pagination by blank lines (section 17), QA comparison against the legacy
(section 16: "business correctness before visual similarity" - the order is: business correctness, then the wizard form and
printout as the visual reference). S06 (explicit position for free-standing blocks) is kept for headers and grids; item tables
and footer rows use the wizard's table layout (S08 section 13).

## 10. Anti-patterns that cost a rejected build each (ZMMCG_PO_SF)

| Anti-pattern | Cost |
|---|---|
| numbers (insets, line heights, title size) copied from a sibling form's wizard output | title 28 pt instead of 18 pt; texts 0.6 mm high |
| first baseline from the font ascent | every text misplaced, found only by the client |
| window flags drawn as frames | frames the legacy never printed |
| condition reader that drops operators | three conditions that could never be true |
| rounded export heights (4.70 / 27.7 mm) | blocks 8 mm off, grid 0.1 mm per row |
| checks that prove structure only | three "ready for review" hand-offs that were not |
