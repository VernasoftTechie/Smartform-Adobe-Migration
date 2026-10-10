# S08 — SAP-wizard reference constructs: table layout, FormCalc, flat data, multi-page

**Status: evidence-backed candidate, not yet promoted** (calibrated against the real legacy output PDF of `ZMMET_PO_SF`, section 18). Derived on 2026-10-10 from a form the
client's SAP generated with *Create Adobe Form by Migration* for `ZMMET_PO_SF`
(`ZMMET_PO_SF_ZETO_F`, interface `ZMMET_PO_SF_ZETO_PI`; files `SFPF_ZMMET_PO_SF_ZETO_F.XML` and
`ZMMET_PO_SF_ZETO_F.XDP`). That form runs in the client's SAP, so every construct below is known to
load there. It becomes a *validated* strategy only when our own form built with it has rendered in
the client's SAP (promotion standard in `README.md`). It supersedes the older hand-built patterns
wherever it contradicts them; the conflicts are listed in section 13.

## 1. Select this strategy

Use for **every** form, from the first layout line. At intake **ask the client for the wizard
reference form** of the same Smart Form (see section 14). It is the cheapest, most reliable
evidence of what this SAP accepts: it carries the real data schema, the real fonts, the real
borders and the real table constructs.

## 2. Why the first hand-built attempts failed (ZMMET_PO_SF, 2026-10-09)

| What was built | What the client saw | Cause found in the wizard reference |
|---|---|---|
| Context with `CL_FP_STRUCTURE` nodes, binds `$.LS_ADRC.NAME1` | empty address blocks | structure fields are **flat** data elements named `LS_ADRC_NAME1` |
| Body blocks `presence="hidden"` plus an `initialize` script that shows them | "no table, no terms and conditions" | the wizard shows everything by default and hides on `ready`; a script that does not run leaves the block invisible |
| Fixed-height rows in a `position` subform | overlaps, clipped text, borders that stop short | tables are XFA **table layout** with growing (`minH`) cells |
| Terms only from a standard text | no terms when the text is missing | the wizard prints a static terms block when the standard text is absent |

## 3. Context shape (what SFP generates)

- A scalar or a **structure field** is a direct `CL_FP_DATA` child of the root. For a structure
  field `LS_DADRC-NAME1`: `NAME` = `LS_DADRC_NAME1`, `GENERATED` = `X`, `FIELD` = `LS_DADRC-NAME1`.
  The XML element is `<LS_DADRC_NAME1>`.
- A table is a `CL_FP_LOOP`; its columns are `CL_FP_DATA` leaves with `FIELD` = `TABLE-COLUMN`.
  The XML is `<TABLE><DATA>(<COLUMN/>)</DATA></TABLE>` with `dd:minOccur="0"` and
  `dd:maxOccur="-1"`. An empty table has **no** `DATA` element (use `Exists(...)`).
- SFP writes the data description (`xfa:datasets / dd:dataDescription`) from the Context. Generate it
  the same way when you build the XDP so Designer sees the fields.
- **Do not hand-build `CL_FP_STRUCTURE` nodes** (`tools/sfp_context.mjs` kind `structure`): they imply
  a nested schema that the wizard never produces. Use `scalar` nodes with the hyphenated field and
  rename them to the flat name with `GENERATED=X` (see `ctx5.mjs` in the ZMMET_PO_SF work).
- Bind only what the legacy form prints (extract section 8) plus the flag fields the conditions need.

## 4. Binding rules

- Scalar or flat field, anywhere: `<bind match="dataRef" ref="$record.LS_ADRC_NAME1"/>`.
- Table: the table subform is bound `$record.GT_X`; its row subform `$.DATA[*]`; a column
  `$.COLUMN` (relative). The row subform has `occur min=0 max=-1`.
- Add `<connect connection="<FORM>_ADT" ref="$.NAME" usage="importOnly"/>` after every bind (what the
  wizard writes; the connection name is in the XDP `connectionSet`).
- Calculated text has `<bind match="none"/>` and a `<calculate>` script.

## 5. Computed text: FormCalc `calculate`

All wizard text assembly is FormCalc (`contentType="application/x-formcalc"`), not JavaScript:

```
$ = Concat($record.V_COMPANY_NAME.value, "\u000a", $record.LS_DADRC_NAME1.value, "\u000a", ...)
$ = Concat("+", $record.GV_ISD.value, $record.WA_VEND_TEL_NUMBER.value)
if ($record.LV_FLAG.value eq "Y") then $ = "Approved PO" else $ = "UnApproved PO" endif
$ = $.parent.index + 1                       // row number (replaces a counter program-lines node)
```
Multi-line legacy text nodes (the delivery address) become **one** multi-line field joined with
`"\u000a"`; blank lines stay, as in a Smart Form text node.

## 6. Conditions: default visible, hide on `ready`

```
<event activity="ready" name="event__ready" ref="$form">
  <script contentType="application/x-formcalc">if (not (<legacy condition>)) then $.presence = "hidden" endif</script>
</event>
```
Place it on the subform that must disappear (before its `bind`). Translate the legacy condition,
negated. Examples: `$record.V_FLAG.value eq "X"`, `Exists($record.GT_TERMS_TEXT.DATA)`,
`$record.V_BSART.value eq "ZPOT"`. Never start hidden and rely on a script to show.

## 7. Tables (item tables, comment tables, footer lines)

```
subform layout=table columnWidths="11.3mm 31.4mm ..."  name=<table>   bind $record.<TABLE>   <overflow leader="HeaderRow"/>
  subform layout=row name=HeaderRow  <assist role="TH"/>  <occur max="-1"/>      (draws, minH, fill 176 grey, 4 borders)
  subform layout=row name=DATA       <assist role="TR"/>  <occur min=0 max=-1/>  bind $.DATA[*]   (fields, minH)
```
- Widths come from the legacy line type (`CWIDTH` cm x 10 = mm). Cells use `minH` (4.177 mm for one
  9 pt line) so rows grow with their text; spacer cells use `h`/`minH` 0.
- **`<overflow leader="HeaderRow"/>` is on the table subform**, and the header row repeats
  (`occur max=-1`): the heading reprints at the top of every continuation page. This is the
  construct the wizard uses for every item table; it replaces the "leader on the row" version in
  `README`/rulebook 8.10.
- Footer lines (discount, freight, sub total, VAT, total, words, terms, spacers) are further
  one-row tables inside the same flowing container; they flow onto the next page like rows.
- A row printed once per item comes from the display table built in the Initialization (our
  interface); the wizard used a parallel table `GT_ITEMDESC(NAME,VALUE)` matched by `$.parent.index`,
  which breaks if the two tables ever differ in length. One table with all columns is safer.

## 8. Multi-page

1. `pageSet` with two page areas: `Page1` with `<occur min="1" max="1"/>` and `Page2` with
   `<occur min="0" max="-1"/>`.
2. **Content area = the legacy window extents**: page 1 content area is the bounding box of the page-1
   windows (ZMMET_PO_SF: x 7.5, y 5, w 201.5, h 285 mm), page 2 the main window of page 2 (x 7.5, y 5.5,
   w 190, h 284.5 mm). Margins under 1 cm are normal here and render in this SAP; the old 1 cm margin
   rule (S02/F48) does not apply.
3. **Page-level content lives in the page area** and prints on every page of that type: the
   watermark (a field with a FormCalc `calculate`, Courier New 12 pt, grey 176, `LV_FLAG`) and the logo
   (a draw with an embedded PNG, page 1 only). **No window frames are drawn:** the legacy export
   carries border attributes for the windows (delivery box, main window) but the real output PDF
   prints none (section 18). The old note that content in a page area blanked the Design View is not
   supported by this evidence.
4. Body: root `data` subform `layout="tb"` containing (a) a fixed `layout="position"` header
   area, sized exactly to the legacy distance from the content-area top to the table start
   (ZMMET_PO_SF: 115 mm, so the table starts at 12.00 cm), and (b) a `layout="tb"` container of
   width = legacy main-window width that holds the tables and footers and flows across pages.
5. Header blocks print once, on page 1, because the legacy second page has only the main window.
6. Row numbers: `$.parent.index + 1`. Keep rows together or not as the legacy table did.

## 9. Borders from the export, never by eye

- XFA border edges are written **top, right, bottom, left** (clockwise). `S07` section 7 says
  top/left/bottom/right; the wizard output proves clockwise (left-only `hhhE`, right-only `hEhh`,
  left+right `hEhE`, bottom-only `hhEh`).
- For each cell read `LLEFT/LTOP/LRIGHT/LBOTTOM` of the legacy line type (`CELLS/BORDERS`):
  value > 0 means a visible edge `<edge thickness="0.75pt"/>` (legacy 15 tw), 0 means
  `<edge presence="hidden"/>`. Continuation rows have a hidden top edge, the next row a hidden bottom
  edge; copy exactly.
- Label cells of the grids and table headings carry `<fill><color value="176,176,176"/></fill>`
  inside the border (the wizard's grey).

## 10. Fonts and paragraphs (from the wizard, i.e. from the SmartStyles)

9 pt Arial body; labels and headings 9 pt bold; delivery heading 11 pt bold; sub total, VAT, total
11 pt bold right-aligned; title and PO number 28 pt bold centred; watermark Courier New 12 pt grey.
Cell margins `bottom 0.29, left 0.5, right 0.35, top 0.5 mm`, `lineHeight 3.387 mm`. Quantity fields
carry a right inset of 8.1 mm, amounts 1.23 mm (paragraph indents). These are real style values, use
them instead of placeholders; still list them as "taken from the wizard" in the status entry.

## 11. Numbers

`numericEdit`, `<value><decimal fracDigits="2"/></value>`,
`<format><picture>num{z,zzz,zzz,zz9.99}</picture></format>`, right aligned. The wizard sets
`locale="de_DE"` on every numeric field (decimal comma). That reflects the system's number
notation; **ask the client** and keep it as one constant.

## 12. Things SFP does not do for you (do them in the Initialization)

- **Output conversion exits.** The Smart Form printed DDIC fields through their domain routine;
  SFP passes internal values. Convert in the Initialization: `CONVERSION_EXIT_MATN1_OUTPUT`
  (material), the unit text from `T006A-MSEH3` for the language (what the CUNIT routine returns; a typed
  `SELECT` avoids parameter-type conflicts of the function module), `CONVERSION_EXIT_ALPHA_OUTPUT` (vendor, PO,
  service numbers). The wizard did the same (`GV_LIFNR_OUT`, converted names in `GT_ITEMDESC`).
- **Include texts** (`TKEY` nodes, missing from the legacy extract): read with `READ_TEXT`, then join
  paragraphs by `TDFORMAT` (new paragraph = new line, blank = continuation with a space,
  `=` = join without space, `/*` and `/:` skipped; algorithm in the layout generator). Do not print one
  row per text line unless the legacy form did (the legacy comments table did).
- **Per-row program lines**: loop in the Initialization and build one display table (ZMMET_PO_SF
  interface). Run legacy nodes verbatim inside the loop.

## 13. What this overrides in the older strategies

| Older rule | Replaced by |
|---|---|
| F11 / rulebook 10: bind must be `$.X`, `$record.` fails | `$record.X` for scalars, `$.X` inside tables (wizard) |
| F46 / 8.5: row bind `$.TABLE.DATA[*]` | table subform bound `$record.TABLE`, row `$.DATA[*]` |
| S06: `layout="row"` forbidden | the wizard uses `layout=table` + `layout=row` for every table; S06 stays for the free-standing blocks |
| S07 section 7: edge order top/left/bottom/right | top/right/bottom/left |
| S02/F48: margins of at least 1 cm | content area = legacy window extents |
| 8.10 / F15: master-page content may blank the Design View | page-area watermark, logo and frame are what the wizard does |
| S04: structure Context nodes allowed | flat data nodes (section 3) |
| presence hidden + initialize script (8.9) | default visible + `ready` hide (section 6) |

## 14. What to request from the client at intake (put this in the first status entry)

1. The **wizard-generated form** (SFPF xml and XDP) of the same Smart Form, if one exists.
2. The SmartStyle exports of every style the form uses (fonts the wizard form already shows).
3. The DDIC type of each custom type used in the interface (for reference fields).
4. The number notation and the languages required (English only, or also French / local).
5. The **legacy output PDF** of two or three real documents (goods, service, special type): it is the
   ground truth for positions, fonts, borders, number notation and wording (section 18).
6. Whether static wording that the legacy form switched off (for example the long terms and
   conditions) is wanted as a fallback, and the approved wording.

## 15. Defects of the wizard output to correct on every form (checked against the legacy export)

- Window border attributes in the export are **not printed** (no delivery box border, no main window frame in the real output): the wizard is right to omit them; do not add them from the export.
- The wizard positions match the real output (title baseline 17.5 mm although the export window starts at 17.5 mm top: text in template lines is placed by the line, not by the window top); never "correct" them from the export coordinates.
- Branches switched off by `1 = 2` are carried or replaced by developer wording: decide with the owner.
- Language variants (English / French texts) are not carried: record as an extension point.
- Header cells that the Smart Form printed per line but the wizard merged into one field keep blank
  lines; check against the printout.
- Terms that the legacy read from a standard text should print the standard text first and the static
  wording only when the text is missing.

## 16. Verification (checker gap)

`tools/sfp_check.mjs layout` still encodes the older rules of section 13 and fails or warns on every
wizard-style construct (`$record` binds, `$.DATA[*]`, `layout="row"`, flat names, margins, page-area
content). Until it is extended, verify with a script that checks, against the Context-derived data
schema: every bind resolves; every FormCalc `$record.NAME` exists; every overflow leader is a
repeating header row inside the table; every legacy printed field is bound or deliberately replaced;
content areas are inside the page; nothing outside `<template>` changed except the data description.
The ZMMET_PO_SF branch carries this as the verification step of its status entries.

## 17. Required validation before promotion

Build a form with these constructs, then in the client's SAP: Pull, activate, preview a short and a
long order (more than one page), a service order and a special-type order; compare with the
legacy printout. Record the result and the commit in `docs/BUILD_ISSUES_LOG.md`.

## 18. Calibrate against the legacy output PDF (do this before the first layout push and after every layout change)

The PDF the Smart Form prints is the only reliable evidence of what the client considers correct. Extract
it with `tools/pdf_probe.mjs` (text with x / baseline y / width / font size, and every painted rectangle
and line with its fill and width) and compare element by element with the layout:

| Check | Source in the PDF | Found on ZMMET_PO_SF |
|---|---|---|
| Positions | text x and baseline y (mm) | wizard header coordinates reproduce the output to 0.1 mm; the export window coordinates do not (title 9 mm higher in the export) |
| Frames and boxes | long horizontal / vertical segments | no window frame, no delivery border; boxes only for the words row (190 x 4.18 mm) and the terms row |
| Cell grids and fills | rectangles, fill 176,176,176 | supplier grid labels grey, 35 + 66.3 mm, 4.69 mm rows; detail grid 30 + 50 mm, comment cell 21.7 mm |
| Fonts | font names and sizes | 28 pt bold title and PO number, 11 pt delivery heading and totals, 9 pt body, Courier 12 pt watermark; terms heading regular |
| Number notation | printed digits | `1,00`, `2.125,00`: decimal comma, dot grouping (`de_DE`), quantity with 2 decimals |
| Converted values | printed identifiers | material and service numbers without leading zeros, unit text `DAY` |
| Computed text | printed strings | `LEON HOTEL(HOTEL BILL)` (no blank), `++242...` (literal plus and the dial code), words line with the Inco terms, `Last Changed On:` wraps to a second line |
| Row heights | baseline pitch | item rows 4.18 mm (one 9 pt line + insets), spacer rows 3.39 mm |
| Terms | wording and wrap | standard-text terms printed line by line in a 190 mm box that continues on page 2 |

A mismatch is a defect in the layout, not in the PDF. Record it in `docs/BUILD_ISSUES_LOG.md`.
