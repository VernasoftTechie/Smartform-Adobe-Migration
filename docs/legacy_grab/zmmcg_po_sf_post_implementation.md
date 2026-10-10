# ZMMCG_PO_SF -> ZMMCG_PO_SF_ADT / ZMMCG_PO_SF_INT - post-implementation notes

Rewritten 2026-10-10 (and corrected the same day against the real legacy printout, see `zmmcg_po_sf_printout_comparison.md`) after the client rejected layout steps 1-2d ("no table, no terms and conditions, spacing and
overlaps") and the layout, Context and interface additions were rebuilt on the wizard-proven constructs (strategy S08)
by a generator from the legacy export (strategy S09). **Not signed off**: sign-off is the client's confirmation in the
status file. Every item below is either unconfirmed in SAP or a decision taken without evidence in the export.

## 1. What exists

| Object | File | Notes |
|---|---|---|
| Interface `ZMMCG_PO_SF_INT` | `src/zmmcg_po_sf_int.sfpi.xml` | legacy contract unchanged (61 imports, 4 tables, 97 globals + type); added globals `GT_GOODS`, `GT_SERVICE`, `GS_TOTALS`, `GV_LANGU`, `GV_LIFNR_OUT`, `GV_HDRTXT`, `GV_TERM1_ZPOS`; Initialization 987 lines (`docs/legacy_grab/ZMMCG_PO_SF_initialization.abap`) |
| Form `ZMMCG_PO_SF_ADT` Context | `src/zmmcg_po_sf_adt.sfpf.xml` | 81 flat nodes (57 scalar + 4 tables), `GENERATED=X`; list in `zmmcg_po_sf_context_fields.json` |
| Layout | `src/zmmcg_po_sf_adt.sfpf.xdp` | A4; two page areas; fixed header area + flowing table container; XFA table layout; FormCalc; `ready` hide; generated from the export |
| Generators and verifier | `tools/zmmcg_po_sf/` | model reader, layout generator, interface/Initialization builder, Context post-processing, `verify.mjs` (20 checks) |

## 2. Changes of the rework (2026-10-10)

* Items table, totals, words and terms were invisible because blocks started hidden and relied on a script to show them:
  now **default visible, hidden by a `ready` event** (S08 s6).
* Context: structure fields are **flat nodes** (`WA_VEND_NAME1`), binds `$record.NAME` (S08 s3, s4).
* Tables are **XFA table layout** with growing cells; heading row repeats through `<overflow leader>` on the table.
* Borders in the correct order (top, right, bottom, left) and taken from the legacy template / line-type cells (grey 176
  label boxes, row frames); no window frame or delivery box is drawn (the legacy printout has none; the outer lines are the row edges).
* Positions: page-1 content area = the whole body (x 7.5, y 0, 202 x 290 mm) like the client's wizard form; header windows at their
  absolute legacy coordinates; table at 13.50 cm; page 2 at 0.55 cm; margins under 1 cm accepted (S08 s8). Insets and row heights
  from the wizard form (second rework, see `zmmcg_po_sf_printout_comparison.md`).
* Generator defect fixed: AND / OR of multi-item conditions (12 OR operators had been read as AND).
* Texts, conditions and the French/English variants come from the export for **every** live text node; the print-language
  rule is mechanical (S09 s3).
* Two include texts the first extract missed: header text F01/EKKO (printed in PO_DETAIL when `V_POTEXT` is not X) and the
  standard text `ZMMCG_PO_TEXT` (ST, F) = term 1 of the service terms for ZPOS: both read in the Initialization.
* Output conversion for the vendor number (`GV_LIFNR_OUT`).

## 3. Open items / Developer Extension Points

| ID | Item | Why open | Needed to close |
|---|---|---|---|
| DEP-1 | **Fonts, margins, positions**: taken from the **client's wizard form of this Smart Form** (`docs/legacy_grab/wizard_reference/`, which reproduces the legacy printout) and checked mechanically against it (`conformance.mjs`): Arial 9 pt, labels bold, totals 11 pt bold, title 18 pt bold, one-line cells top inset 1.122 mm (first baseline = top + inset + 0.717 em), fixed row heights; the style definitions themselves were not supplied | style exports not supplied | style exports (only to confirm) |
| DEP-2 | **ZPOL / language wording**: the export stores F translations that differ from the E text (for ZPOL the four table headings read English in F, the ZPOL amount-in-words has its own F wording); reproduced mechanically | which wording the legacy ZPOL printout shows is not provable from the export | legacy ZPOL printout |
| DEP-3 | **Print language wiring**: French when the order type is ZPOL/ZPOS, or (not ZPOI) when `GV_LANGU` = F; `GV_LANGU` = `SY-LANGU` = **logon language** of the Adobe run; READ_TEXT, month names, units and every legacy `SY-LANGU` condition (country LANDX50 / LANDX) use it (confirmed by the printout: French terms with the English country and month) | driver sets the language for the Smart Form only | preview of ZPOS (French) and ZPOI (English) |
| DEP-4 | **Grid cells have a fixed height** (4.692 mm per row, the last row of PO_DETAIL 21.769 mm, as the wizard form): a very long value (street, e-mail, payment terms) is cut at the cell | the legacy cuts as well; XFA single-line cells cut at the character | client preview with long values |
| DEP-5 | **Window overlaps kept**: the plant address (14 lines of 4.175 mm) runs down to 6.29 cm, PO_DETAIL starts at 6.50 cm; PO_LAST_CHANGED overlaps the title window; the title baselines lie above the title window top (printout) | legacy geometry | none unless asked |
| DEP-6 | Row heights: item rows 4.183 mm, text rows 4.2 mm, blank text line 3.4 mm, big totals 4.35 mm, 0 mm (and no border) for rows without text - taken from the wizard form and equal to the printout to 0.1 mm | measured for ZPOS only | goods-type printout |
| DEP-7 | **Logo** embedded as PNG taken from the wizard form of ZMMET_PO_SF (same SE78 graphic `DANGOTE LOGO WHITE`), at the legacy window position, native size | no PNG of the ZMMCG graphic itself | preview |
| DEP-8 | **Numbers are printed as text prepared by the Initialization** (user decimal notation, unit exits, XOF/XAF whole numbers), so there is no `de_DE` locale / numericEdit as in the wizard form | keeps the legacy output exactly; the wizard's notation question stays open | number notation of the client |
| DEP-9 | **Legacy behaviour reproduced on purpose**: goods Total (except ZPOI) and all service amounts except CA print from whole-number variables (rounded); ZPOL Sub Total label "SuosTotal" (no F translation); service French words line uses the currency code | faithful to the export | client may ask to correct |
| DEP-10 | **Switched off in the legacy form (`1 = 2`, `2 = 3`) and not rebuilt**: DRAFT window and image, old terms block, signature texts, date text, Insurance row, legacy plant address text; program-lines nodes %CODE10, %CODE14, %CODE18; page-1 "Background Image" has no graphic | never printed | none unless asked |
| DEP-11 | Driver `ZCGMMPOP001` untouched; how it will call the Adobe form is a separate decision (parameters unchanged; the form needs no new parameter) | out of scope by project rule | owner of the driver |
| DEP-12 | Per-row ABAP (Initialization, 987 lines) has never been compiled outside SAP; the client confirmed the first interface step without reporting an error, but no activation result is recorded, and the ~45 new lines are unconfirmed | needs the client's activation | activation result in the status file |
| DEP-13 | **Not provable without a render**: Adobe's first baseline in the growing cells (description, words row, comments) whose line height is fitted to one row height (3.061 / 3.078 mm, worst case 0.4 mm higher); rows that the legacy splits across the page break; item numbers of 100 or more; the legacy integer item number prints "1 " with a trailing blank (2-digit numbers end 0.8 mm further right on the printout) - not reproduced; goods order types not measured | no render of the new form here | client preview |

## 4. ABAP deviations (Initialization) - working default: legacy code verbatim

Marked `BOLT:` in the code; legacy code is **not modernised**. Departures from the legacy text: 7 debugger statements not
carried; local `DATA` merged into one block (`lv_amt_i` int8 for goods words, `lv_amt_is` int4 for service words kept
distinct); shared date locals cleared between the two date nodes; accumulators and flags cleared at the start; explicit
`SORT` of the display tables. New code (row builders, totals, `GV_LANGU`, `GV_LIFNR_OUT`, header text and ZPOS text join
with the SAPscript paragraph rules, `READ_TEXT` of `ZMMCG_PO_TEXT`) follows the user's standards (7.4+ syntax, DIL names,
no `INSERT`, no `INTO CORRESPONDING`). `GS_PRINT` of the first build was removed (the layout composes country and
telephone with FormCalc, as the wizard does).

## 5. Verification status

* `tools/zmmcg_po_sf/verify.mjs`: 0 fail, 0 warn, 23 passed (bindings, FormCalc, tables, leaders, borders, page areas,
  geometry, legacy text coverage, printed-field coverage, baseline, data description, and conformance with the client wizard form of this Smart Form).
* `sfp_check interface` 0 fail (38 intentional warnings); `sfp_check context` 0 fail; `sfp_check layout` is **not valid** for
  wizard-style layouts (S08 s16).
* Numeric comparison with a real legacy printout (ZPOS): `zmmcg_po_sf_printout_comparison.md` (12 differences found and corrected,
  the equal items, and what only a render can show). Nothing has been rendered in SAP by us: that is the client's preview and sign-off.
