# YCREDITNOTEFORM - conversion map (S12 section 4) and intake analysis

Window-5, 2026-11-23. Sources: `vernasofttechie-ycreditnoteform/ycreditnoteform.xml` (raw export, 120,133 bytes),
`YCREDITNOTEFORM_extract.md` (this folder), the legacy grab `YCREDITNOTEFORM.md`, the ten driver candidates (read only),
`style_ycreditstyle.xml`. **Draft before the intake evidence: no geometry is decided here** (rulebook section 2, S10).

## 1. Classification

**Class A (simple)** - one page layout (`%PAGE1`, next page = itself), one item table, static letterhead / footer, two
variants by billing type (ZG2 credit note, ZL2 debit note), English only (the F texts are identical copies of E), 7 code
nodes, 3 conditions, no include texts (`TTYPE` absent), no AND / OR operators (single-operand conditions only).
Target: <= 10 scripts. Variants as prepared data (S11 labels as data / rulebook section 4), not scripts.

## 2. Conversion map

| Legacy element (raw code) | Role | Signal | Pattern | Evidence | Status | Client question / proof test |
|---|---|---|---|---|---|---|
| `%PAGE1` (PA), DINA4, next page empty (= itself) | single page layout, repeats on overflow | every window prints on every page | one `pageArea` occur 1..-1 + body flow; letterhead objects in the page area (P01) | export NEXTPAGE empty | proposal | printout of a note with enough items for 2 pages (if it ever happens) |
| `%GRAPHIC1` (GR) `DANGOTE LOGO` BMAP BCOL, 0.17 cm, 3.79 x 2.91 cm | letterhead logo, every page | no condition | P14 embedded image in the page area (P01) | `docs/global_data/logos/global_logos.txt` | proposal | is the SE78 logo still current? |
| `HEADERWINDOW` (WI) + `%CODE6` (CO) + `%TEXT1` | letterhead: company title, plant, TIN | no condition; `LV_PLANT_DES` cleared for ZG2 when the plant country is in set `ZSD_COUNTRY_VALID` | `%CODE6` verbatim into the Initialization; three fields in the page area | export, DEP-02 | proposal | - |
| `ADDRESSWINDOW` (WI) `%TEXT3` | recipient address, every page | no condition | positioned fields `TO:` + `C_NAME1`, `C_STRAS`, `C_ORT01`, `LANDX50`, `C_PSTLZ` (P01) | export | proposal | empty lines: legacy prints them as blank lines (verify on printout) |
| `CREDETNOTE` (WI) `%TEXT15` / `%TEXT11` | document title box | `V1_FKART = 'ZG2'` -> CREDIT NOTE, `'ZL2'` -> DEBIT NOTE; text nodes carry borders on all four sides | one field bound to prepared `GV_DOC_TITLE` (P16), no script | export | proposal | **is the title printed inside a box?** (text-node borders, not only the window flag, F60/F72) |
| `TEXTWINDOW` (WI) `%TEXT19` / `%TEXT20` | advice sentence | ZL2 debited / ZG2 credited | one field bound to prepared `GV_ADVICE_TEXT` (P16) | export | proposal | - |
| `DATEWINDOW` (WI) + `%CODE1` + `%TEXT2` / `%TEXT21` | document no. and date | ZG2 `CN NO:` / ZL2 `DN NO:`; date = **SY-DATUM (print date)** | prepared label + `V1_VBELN`; `%CODE1` verbatim | export DEP-03 | proposal | print date or billing date (FKDAT)? (legacy: print date) |
| `MAIN` (WI) `%TABLE1` over `IT_VBRP` | item table | table only if `V_FLAG = 'Y'` - every active driver passes `Y` for ZG2 / ZL2 | P06 XFA table: header row `%ROW1` (`%LTYPE1`, 3 cells 1.17 / 9.83 / 6.10 cm, borders all four sides), data rows from a prepared display table | export, drivers | proposal | - |
| `%ROW2` (main area, `%LTYPE2`) + `%CODE2`, `%CODE3` | item line: S/NO, text, amount | per item; **amount = document net + tax (`WA_VBRK-NETWR + MWSBK`), not the item value** | per-row program lines verbatim inside a LOOP in the Initialization filling a display table (runbook section 6) | DEP-04, DEP-05 | proposal | **with more than one item every row shows the document total and TOTAL multiplies - reproduce or correct?** |
| `%ROW3` (main area, `%LTYPE3`) + `%CODE5` | TOTAL line | in the **main area**: prints after **every** item with the running total | second row kind in the same display table (row type) | export | proposal | keep a TOTAL line after every item? (legacy behaviour) |
| `%ROW4` (footer event, `%LTYPE4`, 1 cell 17.10 cm) + `%CODE4` | amount in words | once after the table; `SPELL_AMOUNT` in the **logon language** + table `YCURRDENOM` | P07 row after the table, bound to prepared `LV_TOTWORDS`; `%CODE4` verbatim after the loop | DEP-07 | proposal | - |
| `FOOTERWINDOW` (WI) `%TEXT4` | signature lines Prepared / Checked / Approved | every page, 27.20 cm | static draw in the page area (P01) | export | proposal | - |
| Global `INITIALIZATION` | VBRK read + TIN from `ZAB_DCP_PARAMETERS` | always | verbatim into the Initialization | DEP-01 | proposal | class `ZAB_DCP_PARAMETERS` exists in the target system (it does in the source) |
| Cell borders (10 definitions, 15 TW = 0.75 pt) | `%LTYPE1` 3 cells all four edges; `%LTYPE2/3` 3 cells and `%LTYPE4` 1 cell: left, right, bottom | - | field borders, edge order top, right, bottom, left (F57) | export | proposal | printout |
| Style `YCREDITSTYLE` (P1, P2, P4, P5, `*`, C1, C2) | fonts | - | from the wizard form, cross-checked with `style_ycreditstyle.xml` | style export on the branch | open | wizard form |

## 3. Driver evidence (read only, never modified)

Callers with an active `SSF_FUNCTION_MODULE_NAME` for `YCREDITNOTEFORM`: `YRLB_INVOICE`, `ZINVOICE`, `ZJ_INVOICE1`,
`ZSDI_INV_EXPORT`, `ZTEST_1`, `ZTEST_INVOICE` (the last two look like test programs). Commented out: `ZJ_INVOICE`,
`ZRLB_INVOICE_NEW`. **`ZSDSN_RLB_INVOICE` now calls `ZSDSN_CRNOTE_SF`** with `'YCREDITNOTEFORM'` left as a comment, and NACE
(TNAPR) names no program for this form - the credit note may have moved to a newer form. All active callers set
`V_FLAG = 'Y'` for ZL2 / ZG2 and pass the same parameters (`C_LAND1` commented out everywhere).

## 4. Legacy behaviour to reproduce verbatim and flag (not "fix" silently)

1. Item amount = whole document net + tax; TOTAL line after every item with a running sum (one-item notes print correctly).
2. Date = date of printing, not the billing date.
3. Amount in words in the logon language, currency words from `YCURRDENOM`.
4. Company title in upper case from the company code address; plant name suppressed for credit notes of plants in set `ZSD_COUNTRY_VALID`.
