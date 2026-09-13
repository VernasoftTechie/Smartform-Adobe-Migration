# YMMGRNNOTE — Adobe Build Checklist

**Gate:** Design-gated, High risk. Build only after scope/design approval and an SFP-created baseline has rendered. This checklist creates no SAP object and makes no driver or cutover change.

1. The SFP-generated `YMMGRNNOTE_ADT`/`YMMGRNNOTE_INT` envelope is captured, but the active target interface remained blank after the hand-authored parameter experiment. Pull the branch baseline only; do not rely on it to populate the interface or replace its generated envelope/Context.
2. In SFP, enter all 20 imports, 3 exports, `LT_MSEG`, 4 exceptions, one type, and 15 global declarations from [the 100% interface scope ledger](ymmgrnnote_interface_scope_ledger.md). Inspect `LT_MSEG`/`LS_MSEG` component DDIC references. Configure every actual `QUAN` with its DDIC unit target and every actual `CURR` with its DDIC currency target; do not infer targets from names. Activate interface and form, manually drag/drop required nodes from the left Interface tree into the right Context tree, and verify the mapped nodes beneath the Context root. Stage -> Commit -> Push the generated SFPF/SFPI. No bound XDP element or table may be added before that captured Context exists.
3. Configure a portrait master page. Do not infer absolute coordinates from the XML: its window positions are blank. Use the legacy output comparison for placement.
4. Resolve `YGRNNOTE` through SMARTSTYLES and the global catalogue. Capture its XML and map `P0/P1/P3/P5/P7/P8/P9/PA/PB` and `C1/C2/C3/U1`; do not substitute a generic font/style.
5. Resolve SE78 graphic `GRAPHICS/DANOGATELOGONEW/BMAP/BCOL` from the global inventory, validate its rendition, and add it as the header graphic.
6. Build the static/header increment: company/plant/title alternatives, GRN number/date, and all template labels/data listed in snapshot §3. Keep every conditional branch visibly annotated until `DEP-YMMGRNNOTE-05` is approved.
7. Build `LT_MSEG` as a repeatable table. Preserve its eight columns and widths exactly: `0.86/2.30/7.05/1.05/2.05/1.49/1.64/3.26 cm`; total 19.70 cm. Create Context/reference-field resolutions in SFP, not by hand-editing serialization.
8. Add row fields and total lines only after `DEP-YMMGRNNOTE-03` resolves quantity/currency behavior. Test initial and non-initial exchange rate and divisor values.
9. Add print-only signature labels/lines and the footer page counter. Do not add a barcode or electronic signature feature: neither is in the export.
10. Implement only approved server-side equivalents of the five named extension points. Never include debugger statements or uncommented legacy dead code.
11. Validate with an empty table, multiple rows, each evidenced condition, E/F language data, and a multi-page run. Compare old-form OTF-derived PDF with Adobe PDF using the same business data.
12. Record SFP preview/activation evidence after every increment. Capture the generated Context and final serialization through abapGit only after each successful SAP-side check.
