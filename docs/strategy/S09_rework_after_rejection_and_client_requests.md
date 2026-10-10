# S09 — Rework after a rejected layout: generate from the export, verify mechanically, ask the client for the right evidence

**Status: candidate, written 2026-10-10 from the ZMMCG_PO_SF rework (client rejected layout steps 1-2d: "no table,
no terms and conditions, spacing and overlaps").** It builds on S08 (wizard-reference constructs, from
ZMMET_PO_SF) and applies to every ticket, new or in rework. It becomes validated only when the client has previewed
a form built this way (promotion standard in `README.md`).

## 1. What went wrong, in one table (so the next ticket avoids it from line one)

| Symptom the client saw | Cause | Rule now |
|---|---|---|
| No items table, no terms, no totals | blocks started `presence="hidden"` and an `initialize` script was meant to show them; in the client's ADS the script did not run | default **visible**, hide with a FormCalc `ready` event (S08 s6); never start hidden |
| Empty address / supplier blocks | Context with nested `CL_FP_STRUCTURE` nodes, binds like `$.LS.FIELD` that never matched | flat DATA nodes (`LS_ADRC_NAME1`, `GENERATED=X`) and `$record.NAME` binds (S08 s3, s4) |
| Overlaps, cut text, borders that stop short | fixed-height rows in `position` layout; text longer than the row; left/right borders written in the wrong order | table layout with `minH` cells (S08 s7); border edges are **top, right, bottom, left** (S08 s9) |
| Labels without the grey boxes and frames of the legacy form | the extract did not read the **template cell borders and fills** | read `CELLS/BORDERS` of every template and line type from the export |
| Missing French, missing include texts | the extract shows other languages only as "also in F" and skips include-text nodes | read `T_TEXT` for every language and the `TTYPE=I` / `TKEY` nodes from the raw XML |
| "Exact positions" disputed | a 1 cm margin rule moved and narrowed windows | content area = bounding box of the legacy windows; margins under 1 cm are normal (S08 s8) |

## 2. Evidence to extract from the raw Smart Form XML (beyond the legacy-grab `.md`)

1. Every node's own condition (`sf:COND`, with AND/OR) and the conditions of its ancestors; constants such as `1 = 2` /
   `2 = 3` mean the branch never prints (list them, do not build them).
2. Template and line-type definitions: `CELLS` (width per column), `BORDERS` (`LLEFT/LTOP/LRIGHT/LBOTTOM` > 0 = visible),
   `FILLCOLOR` (the grey 176 label boxes), and per text its `T_LINENR` / `T_CELLNR` / `T_LINETYPE`.
3. Every text per language (`T_TEXT` E and F, with `TDFORMAT`): where the translation differs, the wording that prints
   depends on the print language, not on the order type alone.
4. Include texts (`TTYPE=I`, `TKEY`: object, name, id, language): they are read with `READ_TEXT` in the Initialization.
5. Window geometry and borders per page; the unnamed windows of page 2 are the watermark and the main window again.
6. Rows with no text lines print with height 0; a text node with one blank line prints 3.387 mm (9 pt line).

## 3. Method: one generator from the export, nothing typed by hand

`tools/zmmcg_po_sf/` holds the working example (model reader, layout generator, Context field list, interface/Initialization
builder, verifier). The pattern to reuse:

- A **model** of the whole legacy tree (nodes, conditions, positions, borders, texts in all languages).
- A **slot engine**: all text nodes at one position (same template line and cell) become one cell. A static single text is
  a `draw`; a single field is a direct bind; everything else is one `field` with a FormCalc `calculate` that picks the
  variant: legacy condition translated to FormCalc, the language rule (below) choosing the E or F text, `&FIELD&` tokens
  turned into `Concat(...)`, SAP-script escapes (`<(>`, `<B1>`) removed, continuation lines joined with a blank.
- **Print language rule** (from the driver and the legacy `SY-LANGU` conditions): French when the order type is in the
  driver's French list or, for other types, when the login language is F; English otherwise; the text used is the E or F
  text of the node that is visible for that order type. Where the export contains surprising F translations, reproduce them
  and **flag them to the client** (do not "fix" silently).
- The generator records every field it uses: that list is the Context (flat nodes), the data description, and the verifier's
  reference. One source, three consistent outputs.
- Per-row and footer program lines run verbatim inside the Initialization and fill display tables (S08 s12); output
  conversions and include texts are prepared there as well.

## 4. Multi-page checklist (every item must be true before a layout is pushed)

1. `pageSet`: `Page1` occur 1/1, `Page2` occur 0/-1; each with its own content area.
2. Page-1 content area = bounding box of the page-1 windows; page-2 content area = the legacy page-2 main window.
3. Root `data` subform `layout="tb"` holding (a) a fixed `layout="position"` header area whose height is exactly the legacy
   distance from the content-area top to the table start, and (b) a `layout="tb"` flowing container as wide as the main
   window.
4. Header blocks sit in the fixed area, positioned at the legacy window coordinates relative to the content area; they print
   once (page 1), because the legacy page 2 has only the main window.
5. Every table is `layout="table"` with `columnWidths` from the legacy line type, a header row (`occur max=-1`,
   `<assist role="TH"/>`) and a data row (`occur min=0 max=-1`, bound `$.DATA[*]`, `minH` cells, borders from the line type),
   and `<overflow leader="HeaderRow"/>` **on the table subform**: the heading reprints on every continuation page.
6. Footer lines, words, terms, spacers and closing rows are one-row (or few-row) tables in the same flowing container; they
   flow onto the next page like data rows.
7. Page-level objects live in the page area and print per page type: watermark (FormCalc, Courier New 12 pt grey 176),
   logo (page 1 only, embedded PNG), frame of the main window at its legacy extent.
8. Everything conditional starts visible and hides on `ready`; nothing relies on a script to appear.
9. Rows that must not split, or must keep with the next row, as in the legacy table, are marked the same way.
10. Test cases (given to the client): a one-page order, an order of more than two pages (heading repeats, no cut row, totals
    and terms flow, frame and watermark on every page), a service order, the special order types, an order with header text,
    one with a long item description.

## 5. Mechanical verification before every push (`tools/zmmcg_po_sf/verify.mjs`)

Strict XML parse; Context has only flat nodes and every field belongs to the interface; every `$record.NAME` bind, every
FormCalc reference and every table column resolves; connects use the form connection; FormCalc blocks are balanced; every
`ready` event only hides and nothing starts hidden; every overflow leader is a repeating header row of its own table;
`columnWidths` equal the cell widths; every border has four edges; content areas lie inside the page; positioned children
lie inside their parents; **every live legacy text fragment (English and French) appears in the layout**; every legacy
printed field is bound or deliberately replaced; nothing outside `<template>` and the data description differs from the
client's baseline. A pass is necessary, never sufficient: the client's preview decides.

## 6. Measure the legacy printout (the most valuable evidence there is) — what the ZMMCG_PO_SF printout corrected

Whenever a real printout of the legacy form exists (PDF), **measure it before the first layout push and again after every
rework**. A PDF made by the Smart Form keeps text items (origin, font, size), vector lines and rectangles (cell borders,
grey boxes) and the image placement. Read them with `tools/pdf_probe.mjs` (S08 section 18; pdf.js: item origin `transform[4]/[5]`, pt to cm by 28.3465,
glyph top = baseline minus the font size) and compare, section by section, with the generator parameters; the ticket
keeps its own dump script (`tools/zmmcg_po_sf/printout_dump.cjs`, text plus vector shapes plus image placement). Twelve differences were found on ZMMCG_PO_SF **after** the layout had passed 20
mechanical checks - the checks prove structure, only the printout proves the picture (full list: the ticket's
`zmmcg_po_sf_printout_comparison.md`). The reusable rules:

1. **Do not copy sizes from the wizard form of a sibling form.** Title 28 pt came from the wizard form of another ticket; the
   printout shows 18 pt. Wizard forms prove constructs (S08), not the legacy's formats.
2. **Baseline = cell top + top inset + 0.905 x font size** (Arial). Use it both ways: to check that the generated cell
   sits where the printout's baseline is (label baselines 6.84, 7.31, ... in a grid starting at 6.50 prove a 0.5 mm inset),
   and to place a text that the legacy prints above its window (the title baselines sat on the template line tops, i.e.
   above the window top): put such cells in the parent area, not inside the window subform.
3. **Window borders in the export are not printed.** The flag on the main window and on a text window did not produce a frame
   on the printout; the visible outer lines are the left and right edges of the table rows (and the header/closing rows).
   Never draw a window frame from the flag; read the line types' `CELLS/BORDERS` (S09 section 2).
4. **Row heights come from the template (`STATLINES` / `LHEIGHT`) and from the text**: a template's last line can be much taller
   than the window leaves (21.7 mm, not "fill to the table"); a one-line text row is 0.5 mm top inset + 3.387 mm + 0.29 mm
   = 4.177 mm; blank paragraphs inside a text node are real lines (heading with blank before and after = 3 lines; the last
   term with a trailing blank line = 2); a row without printable text has no height and no border.
5. **Cell text starts 0.7 mm after the cell edge** in this legacy form, right-aligned numbers end 1.2 mm before the cell
   edge, a paragraph indent shows up as a centre that is not the cell centre (item number centred on 1.67 cm in a cell
   whose centre is 1.32 cm = indent 7.1 mm). Derive the margins from the measured text origin / end, not from a default.
6. **Check text widths against the area**: a label 30.9 mm wide in a 30.95 mm area wraps in Adobe and overlaps in a fixed
   row - give text cells in tight grids no right inset.
7. **SY-LANGU in a condition is the logon language**, not the print language: the French printout showed the English country
   and month. Keep two language variables apart (print language for static text variants; logon language for every legacy
   `SY-LANGU` condition and for the data the Initialization reads in `SY-LANGU`).
8. Put the measured numbers into the verifier (28 checks now) so the next regeneration cannot undo them, and state in the
   status entry which items a render alone can prove (first-baseline offset with an explicit line height, rows split over
   a page break, 3-digit numbers in a 2-digit area, long values).

## 7. What to ask the client (put it in the first status entry; repeat it in any rework entry)

1. The **wizard-generated form** (SFPF xml and XDP, "Create Adobe Form by Migration") of the same Smart Form: the best proof
   of what their SAP renders. If it exists it settles fonts, borders, positions and language wording.
2. The **SmartStyle exports** of every style used (or font, size and alignment of each paragraph and character format).
3. For each order type that occurs (goods, import, local French, stock transfer, service, special): **one real document
   printed with the legacy form** (PDF) and its number or data, so each section can be compared line by line.
4. The **number notation** and the **languages** to print (English only, or French as well, and which types).
5. How the **print language reaches the form** (the driver sets it for the Smart Form; the Adobe call needs the same).
6. Whether parts the legacy form switched off (`1 = 2`) are wanted, and the wording of fallbacks the legacy form read from a
   standard text that may be missing.
7. The DDIC definition of custom types and, for standard texts the form reads, their names, ids and languages.

## 8. Rework status entry (skeleton)

Acknowledge the client's comments in their own words; give the **root causes**; list what changed (interface, Context,
layout) and what did **not**; state the verification result and every WARN; list the unconfirmed constructs; give the
client the test cases of section 4 point 10; end with the requests of section 7. One hand-off, `WAITING_ON: operator`.
