# YFI_BANKTRANSFER - conversion map (S12 section 4), version 1 = exactly the legacy design (rulebook 2a)

Window-7, 2026-11-25. Sources: `vernasofttechie-yfi_banktransfer/yfi_banktransfer.xml` (raw export), `YFI_BANKTRANSFER_extract.md`,
the legacy grab, driver `YFI_BANKTRANSFER` (read only), `style_yfi_banktransfer.xml`, `style_yfi_banktransfer1.xml`. No wizard form or
printout yet: geometry from the export (windows, line types, styles) is **unproven** until the client previews.

## 1. Classification

**Class A/B**: a one-page letter (`%PAGE1`) - bank address with date, salutation, letter body, one transfer table with heading,
closing and two signatures, a "Re-Printed" watermark on reprints. One code node (date text), conditions: watermark flag,
beneficiary by document type (BLART = BT), two branches permanently switched off (`1 = 2`: an alternative salutation and the
signature window - not built). English only (F texts identical to E), no include texts, no graphics, no AND / OR.

## 2. Conversion map

| Legacy element | Role | Signal | Pattern | Status | Note / proof test |
|---|---|---|---|---|---|
| `%PAGE1` DINA4, form style `YFI_BANKTRANSFER1` | single page letter | - | one `pageArea` + body | proposal | - |
| `WATERMARK` `%TEXT17` (P8) | "Re-Printed" over the table area | `LV_WATERMARK = X` (driver: output already printed) | page-area text bound to prepared `GV_WATERMARK_TXT` (empty = nothing printed) | proposal | preview a reprint |
| `BANK_ADDRESS` + `%CODE1` | date ("November 25, 2026"), "The Managing Director", bank name / branch / street / city / province | none; `%CODE1` = month name + day + year (Initialization, verbatim) | positioned text lines, `GV_DATE_TXT`, IS_BNKA fields | proposal | - |
| `LETTER_SALUTATION` `LETTER_SALUATION` | alternative salutation | `1 = 2` | **not built** (switched off in the legacy) | - | - |
| `LETTER_SALUTATION` `%TEXT21` | "Attention: Branch Manager" / "Dear Sir" | none | static text (C4 / C3 / C2 character formats from the style) | proposal | - |
| `LETER_BODY` | "Fund Transfer" + the authority sentence | none | prepared `GV_BODY_TXT` (continuation lines joined by a blank, amount condensed) | proposal | - |
| `MAIN` `%TABLE1` over `IT_XFER_DETAILS` | S.NO, REF, Beneficiary(ies), Bank, Branch, Sort Code, Account No., Amount [currency] | table counter CNT -> `LV_SERIAL`; beneficiary "DANGOTE CEMENT PLC" when BLART = BT | P06 table from `GT_XFER_ROWS` (row number prepared 1, 2, 3 ...) | proposal | **serial numbers: check on a transfer with several beneficiaries** |
| `%TABLE1` footer `%TEXT18` / `%TEXT19` | "Please treat as VERY URGENT.", "Yours faithfully", company name (condensed), two "AUTHORISED SIGNATORY" | once after the table | P07 rows after the table, `GV_NAME1_TXT` | proposal | - |
| `SIGNATUREWINDOW` | signature window | `1 = 2` | **not built** | - | - |
| Line types / styles (P1-P9, C2-C4) | fonts, borders | raw XML + both style exports | layout step | open | - |
