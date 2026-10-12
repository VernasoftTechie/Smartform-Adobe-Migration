# ZMMCG_PO_SF - re-check log (ten passes, rulebook section 8)

Run: `node tools/zmmcg_po_sf/recheck.mjs <repo> <baseline.xdp>` on 2026-10-12T11:09Z, before the commit that contains this file.

```
PASS   1  structure, bindings, FormCalc, tables, borders, page areas, baseline - verify.mjs 0 fail / 23 passed
PASS   2  interface parity with the legacy extract - RESULT: no failures  -  0 fail, 38 warn, 311 passed (1 notes)
PASS   3  conformance with the client wizard form + legacy text / printed-field coverage - part of verify.mjs (conformance.mjs: coordinates; coverage: 369+ fragments)
PASS   4  printout simulation: every text baseline / anchor, every line, every grey box (2 pages) - RESULT: OK - layout matches the printout predicted texts 236, matched 236
PASS   5  layout conditions: FormCalc run for every order type / flag / language / currency vs the raw legacy export - RESULT: OK - every live legacy label / heading prints, nothing else, in every environment 1152 environments
PASS   6  terms ABAP: interpreted for every order type / flag / language vs the raw legacy export - RESULT: OK - the terms ABAP produces exactly the terms the legacy form prints
PASS   7  ABAP standards: DIL naming, no INSERT / INTO CORRESPONDING, 7.4+ constructs - RESULT: OK - our ABAP follows the standards (DIL naming, no INSERT / INTO CORRESPONDING, 7.4+ constructs)
PASS   8  condition reader: AND / OR operators of the raw export - raw OR 12 / AND 55, model OR 12 / AND 55 (alternative nodes are read separately)
PASS   9  reproducibility: terms_gen + finalize_interface + gen reproduce the committed files - identical
PASS  10  Context graph, bound fields exist in the interface - RESULT: no failures  -  0 fail, 0 warn, 10 passed (0 notes)

RESULT: all 10 passes OK
```

Model assumptions behind passes 3-5 (declared, not hidden): first baseline = cell top + top inset + 0.717 em (calibrated on the client's wizard form of this
Smart Form and the printout), natural line height 1.15 em, a text row that does not fit splits after its last fitting line. The simulator proves the generated layout
is consistent with the printout under this model; it is **not** Adobe's rendering.

Coverage limits: only a service order (ZPOS, 18 items, 2 pages) has a printout, so passes 3-4 compare that case; passes 5-6 cover every order type, flag and language
against the legacy export (labels, headings, terms), not against printouts; the goods table, the comments table and the totals of other types use the same
constructs and the export's widths, heights and borders but have no printout.

Known residuals: terms text 0.82 mm higher on page 2 (DEP-17); item numbers 1-9 depend on the no-break blank (DEP-16); the row split at the page break is Adobe's decision.
