# ZMMCG_PO_SF -> ZMMCG_PO_SF_ADT / ZMMCG_PO_SF_INT - post-implementation notes

Written 2026-10-09 by Window-3 after the client confirmed every build step in Bolt Console
(interface, Context, layout steps 1, 2a, 2b, 2c, 2d). **Not signed off**: sign-off is the client's
confirmation in the status file. Every item below is either unconfirmed in SAP or a decision
that was taken without evidence in the export - nothing is smoothed over.

## 1. What was built (evidence: `ZMMCG_PO_SF_extract.md/.json`, `zmmcg_po_sf.xml`)

| Object | File | Notes |
|---|---|---|
| Interface `ZMMCG_PO_SF_INT` | `src/zmmcg_po_sf_int.sfpi.xml` | 61 imports + 4 tables of the legacy contract unchanged; 97 legacy globals + `GT_GOODS`, `GT_SERVICE`, `GS_TOTALS`, `GS_PRINT`, `GV_LANGU`; Initialization re-hosts 33 of the 36 legacy program-lines nodes (`docs/legacy_grab/ZMMCG_PO_SF_initialization.abap`) |
| Form `ZMMCG_PO_SF_ADT` Context | `src/zmmcg_po_sf_adt.sfpf.xml` | 81 nodes (spec: `zmmcg_po_sf_context_spec.json`); no currency/quantity field bound, no reference fields |
| Layout | `src/zmmcg_po_sf_adt.sfpf.xdp` | A4 portrait; header blocks, flowing items tables with repeated heading, totals, words, terms, closing rows, watermark and frame on the master pages |

## 2. Developer Extension Points / open items

| ID | Item | Why open | Needed to close |
|---|---|---|---|
| DEP-1 | **Fonts, sizes, alignments, colours** - Arial 8 pt placeholders, title 14 pt bold, watermark Arial 40 pt bold grey, bold/right alignment guesses | SmartStyle definitions `ZWSA_COMMON_STYLE`, `ZMM_PURCHASE_REQ`, `YMM_PO_STYLE` not supplied (`YMM_PO_STYLE` not in the global inventory) | Style downloads (SMARTSTYLES > Utilities > Download) or font/size/alignment of paragraphs HP, P1, P2, P3, P4, P6, P8, PQ |
| DEP-2 | **ZPOL (French) table headings**: layout shows the French text of the explicit ZPOL nodes (Code Article, Description, Prix Unitaire (Excl.TVA), Total (Excl.TVA)); the export stores an *English* F-translation for those four nodes (%TEXT193-196) and a different F wording for the ZPOL amount-in-words node (%TEXT174) | Which of the two the legacy form really prints for ZPOL depends on the print-language mechanism, not provable from the export | A legacy ZPOL printout; client has not answered |
| DEP-3 | **French for goods orders of non-ZPOL types printed under a French login** (and F translations of supplier/detail labels on those types) not reproduced; only ZPOL explicit variants, ZPOS/ZPOL/`GV_LANGU = F` service orders and the terms (ZPOL/ZPOS/F) are French | Not requested; needs `GV_LANGU` to carry the print language in the Adobe run | Client decision |
| DEP-4 | **Print language wiring**: legacy form runs with `SY-LANGU` = `CONTROL_PARAMETERS-LANGU` (driver: F for ZPOL/ZPOS, E for ZPOI). `GV_LANGU = SY-LANGU` in the Initialization is only right if the Adobe run sets `SY-LANGU` the same way; also affects `READ_TEXT language = sy-langu`, month names, country names and unit conversion | Driver is read-only; wiring is a later decision | Preview of ZPOS (French) and ZPOI (English) orders |
| DEP-5 | **Geometry: exact legacy window coordinates since the correction of 2026-10-09** (logo, heading, plant address, last changed, supplier, PO detail, items table start 13.50, page 2 start 0.55, frame, watermark - all at the export values, widths included). Consequence: content areas now start at 0.75 / 0.55 cm and run to the right page edge, so several elements are closer than 1 cm to the paper edge (plant address box ends 0.14 cm from the right edge, logo 0.80 cm from the left) - the project margin rule (S02/F48) is knowingly not applied. Still estimated (not in the export): supplier/detail row pitch 0.5 cm, heading row positions, Inco1/Inco2 in two boxes | Legacy windows overlap the table area, so their heights are clipped to the used rows; row heights come from fonts that are not in the export | Preview: overflow badges in Design View, cut values |
| DEP-6 | **Row growth**: only the item description cell grows; vertical lines of the last four columns stop at 0.55 cm in rows whose description wraps | Fixed-height cells in position layout | Client's view; table layout is the alternative |
| DEP-7 | **Closing rows** (3 blank rows, signature row, closing row, 0.45 cm each) and blank rows in the footer | Legacy rows hold no printed text so their height is not in the export | Compare with a legacy printout |
| DEP-8 | **Logo** referenced by SE78 name with spaces (`DANGOTE%20LOGO%20WHITE.bmp`) | Never done with a spaced name on this project | Preview |
| DEP-9 | **Amount in words** is set by script from hidden bound fields (first text-setting script on the project); fallback: build the sentence in the Initialization | Unconfirmed construct | Preview (confirmed by the client's step confirmations without remarks, no explicit evidence) |
| DEP-10 | **Master-page objects** (watermark, frame, `<bind match="global"/>`, first page `occur max=1`) - rulebook F15 warned of a blank Design View | Confirmed only by the client's step confirmation | Final preview |
| DEP-11 | **Legacy behaviour reproduced on purpose**: goods Total (except ZPOI) and all service amounts except CA are printed from 0-decimal variables (rounding to whole numbers); ZPOL Sub Total label "SuosTotal" (typo, no F translation); service French words line uses the currency code | Faithful to the export | Client may ask to correct |
| DEP-12 | **Switched off in the legacy form (`1 = 2`, `2 = 3`) and not rebuilt**: DRAFT window and image, "Terms" block, signature texts, date text, Insurance row, legacy plant address text, program-lines nodes %CODE10, %CODE14, %CODE18 | Never printed | none unless asked |
| DEP-13 | Legacy page-1 "Background Image" node has no graphic assigned | nothing to print | none |
| DEP-14 | Driver `ZCGMMPOP001` untouched; how it will call the Adobe form is a separate decision (it passes `V_FLAG`, `V_BSART`, `IT_EKPO`... unchanged; the form needs no new parameter) | Out of scope by project rule | owner of the driver |

## 3. ABAP deviations (Initialization) - working default: legacy code verbatim

Marked `BOLT:` in `ZMMCG_PO_SF_initialization.abap`; **legacy code was not modernised** (old statement
forms, `SELECT` without `@`, `itab[]`, `SELECT SINGLE * ... INTO` before `FROM`, mixed case, chained `TABLES`
calls). Departures from the legacy text: 7 debugger statements (`break abap1` x6, `BREAK MOCHEJE` x1)
not carried; per-node local `DATA` declarations merged into one block (`lv_amt_i` int8 for goods words and
`lv_amt_is` int4 for service words kept distinct); `CLEAR` of the shared date locals between the two date
nodes; `CLEAR` of the accumulators/flags at the start; explicit `SORT` of the display tables. New code
(row builders, totals, `GS_PRINT`, `GV_LANGU`) follows the user's standards: 7.4+ syntax, DIL names, no
`INSERT`, no `INTO CORRESPONDING`.

## 4. Verification status

* Interface, Context and every layout step: client Pulled/activated and confirmed in Bolt Console
  (12:02-12:07 on 2026-10-09 entries) **without reporting a problem**.
* Nothing here is a visual or numeric comparison with a legacy printout - that is the client's sign-off.
* Shared checkers: `sfp_check` interface/context/layout run before every push; the only FAIL left is the
  completeness check (printed fields replaced on purpose by `GT_*` / `GS_*`, and texts switched off in the legacy form).
