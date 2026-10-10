# ZMMCG_PO_SF -> ZMMCG_PO_SF_ADT / ZMMCG_PO_SF_INT - post-implementation notes

Rewritten 2026-10-10 after the client rejected layout steps 1-2d ("no table, no terms and conditions, spacing and
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
  label boxes, row frames); the main-window frame and the delivery box are drawn.
* Positions: content area = bounding box of the legacy windows; header windows at the exact legacy coordinates (no shift,
  exact widths); table at 13.50 cm; page 2 at 0.55 cm; margins under 1 cm accepted (S08 s8).
* Texts, conditions and the French/English variants come from the export for **every** live text node; the print-language
  rule is mechanical (S09 s3).
* Two include texts the first extract missed: header text F01/EKKO (printed in PO_DETAIL when `V_POTEXT` is not X) and the
  standard text `ZMMCG_PO_TEXT` (ST, F) = term 1 of the service terms for ZPOS: both read in the Initialization.
* Output conversion for the vendor number (`GV_LIFNR_OUT`).

## 3. Open items / Developer Extension Points

| ID | Item | Why open | Needed to close |
|---|---|---|---|
| DEP-1 | **Fonts and paragraph formats** (Arial 9 pt, labels bold, totals 11 pt bold, title 28 pt bold, cell insets) are **taken from the wizard form of the sibling ticket ZMMET_PO_SF**, which uses the same three SmartStyles; `PQ` (terms heading) and `HP` are not in that form: terms heading is bold 9 pt, title as the wizard | style definitions not supplied for ZMMCG itself | wizard form of ZMMCG_PO_SF or the style exports |
| DEP-2 | **ZPOL / language wording**: the export stores F translations that differ from the E text (for ZPOL the four table headings read English in F, the ZPOL amount-in-words has its own F wording); reproduced mechanically | which wording the legacy ZPOL printout shows is not provable from the export | legacy ZPOL printout |
| DEP-3 | **Print language wiring**: French when the order type is ZPOL/ZPOS, or (not ZPOI) when `GV_LANGU` = F; `GV_LANGU` = `SY-LANGU` of the Adobe run; READ_TEXT, month names, units and country names also use `SY-LANGU` | driver sets the language for the Smart Form only | preview of ZPOS (French) and ZPOI (English) |
| DEP-4 | **Grid cells have a fixed height** (4.7 mm per row, as the wizard and as the legacy windows allow): a very long value (street, e-mail, payment terms) is cut at the cell; the last row of PO_DETAIL (header text) is 27.7 mm | legacy rows grow, the wizard grids do not | client preview with long values |
| DEP-5 | **Overlap kept from the legacy windows**: the delivery box ends 1.6 mm below the top of PO_DETAIL; PO_LAST_CHANGED overlaps the title window | legacy geometry | none unless asked |
| DEP-6 | Row heights of blank/spacer rows: 3.387 mm for a blank text line, 0 for rows without text (wizard evidence) | not in the export itself | compare with a legacy printout |
| DEP-7 | **Logo** embedded as PNG taken from the wizard form of ZMMET_PO_SF (same SE78 graphic `DANGOTE LOGO WHITE`), at the legacy window position, native size | no PNG of the ZMMCG graphic itself | preview |
| DEP-8 | **Numbers are printed as text prepared by the Initialization** (user decimal notation, unit exits, XOF/XAF whole numbers), so there is no `de_DE` locale / numericEdit as in the wizard form | keeps the legacy output exactly; the wizard's notation question stays open | number notation of the client |
| DEP-9 | **Legacy behaviour reproduced on purpose**: goods Total (except ZPOI) and all service amounts except CA print from whole-number variables (rounded); ZPOL Sub Total label "SuosTotal" (no F translation); service French words line uses the currency code | faithful to the export | client may ask to correct |
| DEP-10 | **Switched off in the legacy form (`1 = 2`, `2 = 3`) and not rebuilt**: DRAFT window and image, old terms block, signature texts, date text, Insurance row, legacy plant address text; program-lines nodes %CODE10, %CODE14, %CODE18; page-1 "Background Image" has no graphic | never printed | none unless asked |
| DEP-11 | Driver `ZCGMMPOP001` untouched; how it will call the Adobe form is a separate decision (parameters unchanged; the form needs no new parameter) | out of scope by project rule | owner of the driver |
| DEP-12 | Per-row ABAP (Initialization, 987 lines) has never been compiled outside SAP; the client confirmed the first interface step without reporting an error, but no activation result is recorded, and the ~45 new lines are unconfirmed | needs the client's activation | activation result in the status file |

## 4. ABAP deviations (Initialization) - working default: legacy code verbatim

Marked `BOLT:` in the code; legacy code is **not modernised**. Departures from the legacy text: 7 debugger statements not
carried; local `DATA` merged into one block (`lv_amt_i` int8 for goods words, `lv_amt_is` int4 for service words kept
distinct); shared date locals cleared between the two date nodes; accumulators and flags cleared at the start; explicit
`SORT` of the display tables. New code (row builders, totals, `GV_LANGU`, `GV_LIFNR_OUT`, header text and ZPOS text join
with the SAPscript paragraph rules, `READ_TEXT` of `ZMMCG_PO_TEXT`) follows the user's standards (7.4+ syntax, DIL names,
no `INSERT`, no `INTO CORRESPONDING`). `GS_PRINT` of the first build was removed (the layout composes country and
telephone with FormCalc, as the wizard does).

## 5. Verification status

* `tools/zmmcg_po_sf/verify.mjs`: 0 fail, 0 warn, 20 passed (bindings, FormCalc, tables, leaders, borders, page areas,
  geometry, legacy text coverage, printed-field coverage, baseline, data description).
* `sfp_check interface` 0 fail (38 intentional warnings); `sfp_check context` 0 fail; `sfp_check layout` is **not valid** for
  wizard-style layouts (S08 s16).
* Nothing here is a visual or numeric comparison with a legacy printout and nothing has been rendered in SAP by us: that is
  the client's preview and sign-off.
