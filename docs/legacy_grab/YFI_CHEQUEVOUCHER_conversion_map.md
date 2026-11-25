# YFI_CHEQUEVOUCHER - conversion map (S12 section 4), version 1 = exactly the legacy design (rulebook 2a)

Window-6, 2026-11-25. Sources: `vernasofttechie-yfi_chequevoucher/yfi_chequevoucher.xml` (raw export), `YFI_CHEQUEVOUCHER_extract.md`,
the legacy grab `YFI_CHEQUEVOUCHER.md`, driver `YFI_CHEQUEVOUCHER` (read only), `style_yfi_chequevoucher.xml`. No wizard form or
printout yet: geometry will come from the export (windows, templates, line types, style) and is **unproven** until the client previews.

## 1. Classification

**Class B (medium)** on structure, simple on logic: one A4 page (`%PAGE1`), seven windows, five templates (label / value grids),
two tables (`IT_BSAK` in the secondary window `MAIN`, `IT_FLEXA` in the main window `%WINDOW6`), two code nodes, three variant
switches (reprint, company code 1220, debit / credit by DRCRK), English only (F texts identical to E), no include texts,
no AND / OR conditions. Variants as prepared data in the Initialization (no layout scripts planned).

## 2. Conversion map

| Legacy element | Role | Signal | Pattern | Status | Note / proof test |
|---|---|---|---|---|---|
| `%PAGE1` DINA4 | single page | - | one `pageArea` + body | proposal | - |
| `%WINDOW1` + `%TEMPLATE1` + `%GRAPHIC1` DANGOTELOGO | letterhead: logo, company name (condensed), profit-centre address, voucher no., payment doc no., date | `IV_REPRINT` X / space: "(Reprint)" line + voucher no. one line lower | positioned block, prepared `GV_COMP_*`, `GV_REPRINT_TXT`, `GV_INT_NUMBER`, `GV_VBLNR`, `GV_ZALDT`; P14 embedded logo | proposal | preview a reprint and a first print |
| `%WINDOW3` + `%TEMPLATE3` | supplier / invoice block | none | positioned grid, prepared values | proposal | - |
| `%WINDOW2` + `%TEMPLATE2` | sign-off block | `IS_T012K-BUKRS` = 1220 -> SIGNATORY A / B, else audit / Head of Department | prepared `GV_SIGN1_TITLE`, `GV_SIGN2_TITLE` (P16) | proposal | preview company code 1220 and another |
| `MAIN` (secondary) `%TABLE1` over `IT_BSAK` | "Payment made in respect of" + currency, rows (`IV_SGTXT1`, `BSAK-SGTXT`, `WRBTR`), Total | fixed window 4.20 cm: rows beyond it are cut off in the legacy | P06 table from `GT_BSAK_ROWS`, height limited as the window | proposal | **legacy cuts rows beyond the window; Total prints `GV_TOTAL`, never filled = 0.00** |
| `%WINDOW4` + `%TEMPLATE4` + `%CODE2` | cheque details: prepared by / date, cheque no., amount, bank, account, words, signed by A / B | `%CODE2` = absolute amount (Initialization, verbatim) | positioned grid, prepared values | proposal | - |
| `%WINDOW5` + `%TEMPLATE5` | "Payment received" grid | none | positioned grid | proposal | - |
| `%WINDOW6` (main) `%TABLE2` over `IT_FLEXA` + `%CODE1` | accounting lines: date, "Accnt No" (= `LOGSYS`), description (= RFAREA+SCNTR+PPRCTR+SFAREA), cost / profit centre, debit / credit by DRCRK, footer totals | `%CODE1` per row (sign, debit / credit sums) | P06 table from `GT_FLEXA_ROWS`; `%CODE1` verbatim in the Initialization loop | proposal | **"Accnt No" prints the logical system** - kept as legacy |
| Templates / line types (cell widths, borders) | grids | from the raw XML | field borders, edge order top, right, bottom, left | open | layout step reads `CELLS/BORDERS` from the raw export |
| Style `YFI_CHEQUEVOUCHER` (P1, P2, P3, P6, `*`; tabs `,,`) | fonts and tab stops | - | from `style_yfi_chequevoucher.xml` | open | layout step |

## 3. Driver evidence (read only)

`YFI_CHEQUEVOUCHER` (source-scan candidate in the legacy grab; NACE section of the grab to confirm).
