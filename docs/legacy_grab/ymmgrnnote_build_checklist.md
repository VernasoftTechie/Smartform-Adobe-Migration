# YMMGRNNOTE — Adobe Build Checklist

**Gate:** Design-gated, High risk. Build only after scope/design approval and an SFP-created baseline has rendered. This checklist creates no SAP object and makes no driver or cutover change.

1. The SFP-generated `YMMGRNNOTE_ADT`/`YMMGRNNOTE_INT` baseline is captured. Confirm its original SAP Design View and activation result before applying the authored visual-shell increment. Do not replace the generated serialization envelope or Context.
2. Recreate the interface exactly from [snapshot §2](ymmgrnnote.md#2-exact-legacy-interface-contract) through SFP; do not add convenience fields. Generate/capture its Context before adding any bound field or table.
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
