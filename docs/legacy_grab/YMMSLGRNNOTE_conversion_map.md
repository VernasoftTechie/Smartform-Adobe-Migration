# YMMSLGRNNOTE - conversion map (S12 section 4), version 1 = exactly the legacy design (rulebook 2a)

Window-8, 2026-11-25. Sources: `vernasofttechie-ymmslgrnnote/ymmslgrnnote.xml` (raw export), `YMMSLGRNNOTE_extract.md`, the legacy grab,
drivers `YSLSAPM07DR_GRN` / `YSN_YM07DRAUS` (read only), `style_ygrnnote.xml`. Sibling evidence for constructs only (never numbers, S10):
`docs/legacy_grab/ymmgrnnote*` on main (YMMGRNNOTE). No wizard form / printout yet: geometry from the export is **unproven**.

## 1. Classification

**Class B**: one page layout that repeats (`%PAGE1`, next page = itself, footer "page X of Y"), seven windows, one item table with a
four-line footer (Gross, Vat, Freight, Total), a label / value template, 7 code nodes (two per item, three in the footer), variants by
plant (1000 / 1100 header), by currency (XOF / XAF whole-number amounts) and by movement type (103: no freight line). English only
(F texts identical), no include texts. No currency / quantity reference fields declared in the form (REFFIELDS empty): every amount and
quantity prints with the decimals of its type - reproduced with plain WRITE.

## 2. Conversion map

| Legacy element | Role | Signal | Pattern | Status | Note / proof test |
|---|---|---|---|---|---|
| `%PAGE1` DINA4, next page itself | every window on every page | - | one `pageArea` occur 1..-1, letterhead / footer in the page area (P01) | proposal | a GRN with enough items for 2 pages |
| `%GRAPHIC1` DANOGATELOGONEW (BCOL, 150 dpi) | logo | - | P14 embedded | proposal | logo current? |
| `HEADERWINDOW` + `%CODE5` + `%TEXT1` / `%TEXT29` | company / plant / address / title | plants 1000, 1100: "Dangote Cement PLC." without the plant name | prepared `GV_HDR_L1..L4` (P16) | proposal | preview plant 1000 and another |
| `DATE` | GRN no. and date | - | prepared `GV_GRN_NO`, `GV_GRN_DATE` | proposal | - |
| `TEMPLATE` `%TEMPLATE1` (window flagged with a border) | 17 label / value lines in two columns | - | positioned grid, prepared values | proposal | border printed? (window flags are not printed - F60) |
| `MAIN` `%TABLE1` over `LT_MSEG` + `%CODE1` + `%CODE3` | items: SNo, material, description, unit, accepted qty, bin, unit rate, amount | XOF / XAF: whole-number rate and amount | P06 table from `GT_ITEM_ROWS`; code verbatim in the Initialization loop | proposal | - |
| Table footer `%ROW5` / `%ROW3` / `%ROW4` / `%ROW7` + `%CODE6` / `%CODE7` / `%CODE4` | Gross, Vat, Freight and other charge, Total Amount | each value as at the moment its line printed (last item's work area); freight line only when BWART <> 103 | P07 rows after the table, prepared `GV_GROSS_TXT`, `GV_VAT_TXT`, `GV_FREIGHT_*`, `GV_TOTAL_TXT` | proposal | **compare with a printed GRN - see section 3** |
| `SIGNATURE` `%TEXT21` | confirmation texts, line, "End Of GRN Report For Supplier ..." | - | static texts + `GV_END_TXT` | proposal | - |
| `FOOTER` + `%CODE2` | "date,time GRN No.: ... page X of Y" | - | `GV_FOOTER_TXT` + page numbers (P12 `xfa.layout.page` / `pageCount`) | proposal | page numbers on 1 and 2 pages |
| Global initialization `break abap1.` | debug breakpoint for user ABAP1 | - | **not carried** (commented, marked BOLT) | - | no effect on the output |

## 3. Legacy behaviour reproduced exactly (the code as it is) - to confirm on the first preview

1. **Gross** prints `TOT_AMNT` before the Total line adds to it: by the code, Gross shows 0.00 (XOF / XAF: 0).
2. **Vat** is the VAT of the **last** item, not a sum.
3. **Freight and other charge** is the sum of BNBTR over all items; for XOF / XAF the value is multiplied by 10 in `%CODE3`, then
   replaced by `%CODE7` with the plain sum (the line prints the `%CODE7` value).
4. **Total Amount** = freight + Vat (item amounts are not included).
5. Freight value condition `BWART <> '103' AND WAERS = 'XOF' OR WAERS = 'XAF'` evaluated as generated ABAP does (AND before OR).
