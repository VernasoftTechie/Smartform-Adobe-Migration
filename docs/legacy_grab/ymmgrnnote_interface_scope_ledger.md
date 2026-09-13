# YMMGRNNOTE — 100% Interface Scope Ledger

**Evidence sources:** immutable `ymmgrnnote.xml` (SMARTFORMS download) and
`ymmgrnnote_legacy_program.md` (legacy-grab report). Source locations below
refer to unambiguous XML element paths, global-data order, or named code
nodes. Neither source is modified by this branch.

## Interface contract

| Direction | Name | Typing / type | Flags | XML evidence |
|---|---|---|---|---|
| Import | `ARCHIVE_INDEX` | TYPE `TOA_DARA` | optional, by value, standard | `/SMARTFORM/INTERFACE/item[4]` |
| Import | `ARCHIVE_INDEX_TAB` | TYPE `TSFDARA` | optional, by value, standard | `item[5]` |
| Import | `ARCHIVE_PARAMETERS` | TYPE `ARC_PARAMS` | optional, by value, standard | `item[6]` |
| Import | `CONTROL_PARAMETERS` | TYPE `SSFCTRLOP` | optional, by value, standard | `item[7]` |
| Import | `MAIL_APPL_OBJ` | TYPE `SWOTOBJID` | optional, by value, standard | `item[8]` |
| Import | `MAIL_RECIPIENT` | TYPE `SWOTOBJID` | optional, by value, standard | `item[9]` |
| Import | `MAIL_SENDER` | TYPE `SWOTOBJID` | optional, by value, standard | `item[10]` |
| Import | `OUTPUT_OPTIONS` | TYPE `SSFCOMPOP` | optional, by value, standard | `item[11]` |
| Import | `USER_SETTINGS` | TYPE `TDBOOL` | optional, by value, standard, default `'X'` | `item[12]` |
| Import | `LS_MKPF` | TYPE `MKPF` | none | `item[13]` |
| Import | `LS_MSEG` | LIKE `ZEXTRA_FIELD` | none | `item[14]` |
| Import | `LS_ADRC` | TYPE `ADRC` | optional | `item[15]` |
| Import | `LS_T001W` | TYPE `T001W` | none | `item[16]` |
| Import | `LS_T001` | TYPE `T001` | optional | `item[17]` |
| Import | `LS_EBAN` | TYPE `EBAN` | none | `item[18]` |
| Import | `LS_EKKO` | TYPE `EKKO` | none | `item[19]` |
| Import | `LV_MAKTX` | TYPE `MAKTX` | none | `item[20]` |
| Import | `LS_LFA1` | TYPE `LFA1` | none | `item[21]` |
| Import | `IV_WAERS` | TYPE `WAERS` | optional | `item[22]` |
| Import | `IV_KURSF` | TYPE `BAPICURR_D` | optional | `item[23]` |
| Export | `DOCUMENT_OUTPUT_INFO` | TYPE `SSFCRESPD` | by value, standard | `item[1]` |
| Export | `JOB_OUTPUT_INFO` | TYPE `SSFCRESCL` | by value, standard | `item[2]` |
| Export | `JOB_OUTPUT_OPTIONS` | TYPE `SSFCRESOP` | by value, standard | `item[3]` |
| Table | `LT_MSEG` | LIKE `ZEXTRA_FIELD` | none | `item[28]` |
| Exception | `FORMATTING_ERROR` | — | standard | `item[24]` |
| Exception | `INTERNAL_ERROR` | — | standard | `item[25]` |
| Exception | `SEND_ERROR` | — | standard | `item[26]` |
| Exception | `USER_CANCELED` | — | standard | `item[27]` |

## Global declarations

| Kind | Name / declaration | XML evidence | Adobe handling |
|---|---|---|---|
| Type | `TYPES LT_MSEG_1 TYPE ZEXTRA_FIELD` | `/SMARTFORM/GTYPES/item[1]` | Enter natively in SFP Global Definitions; no proven generated type-record serialization exists here. |
| Data | `WA_MSEG TYPE ZEXTRA_FIELD` | `/GDATA/item[1]` | Enter natively. |
| Data | `LV_UNIT TYPE ZERFMG` | `item[2]` | Enter natively; unit reference not evidenced. |
| Data | `TOT_AMNT TYPE DMBTR` | `item[3]` | Enter natively; currency reference not evidenced. |
| Data | `MONTH TYPE T247-KTX` | `item[4]` | Enter natively. |
| Data | `DATE TYPE CHAR20` | `item[5]` | Enter natively. |
| Data | `FINAL_AMT TYPE DMBTR` | `item[6]` | Enter natively; currency reference not evidenced. |
| Data | `FINAL_AMT1 TYPE DMBTR` | `item[7]` | Enter natively; currency reference not evidenced. |
| Data | `VAT TYPE KWERT` | `item[8]` | Enter natively; currency reference not evidenced. |
| Data | `DIS TYPE KWERT` | `item[9]` | Enter natively; currency reference not evidenced. |
| Data | `SUM TYPE BNBTR` | `item[10]` | Enter natively; currency reference not evidenced. |
| Data | `LV_DMBTR TYPE BNBTR` | `item[11]` | Enter natively; currency reference not evidenced. |
| Data | `LV_BUTXT TYPE T001-BUTXT` | `item[12]` | Enter natively. |
| Data | `GV_KSCHL TYPE KSCHL` | `item[13]` | Enter natively. |
| Data | `LV_NAME TYPE STRING` | `item[14]` | Enter natively. |
| Data | `LV_UNIT1 TYPE ZERFMG` | `item[15]` | Enter natively; unit reference not evidenced. |
| Field symbols | none | No field-symbol element in XML global scope | Do not add. |

## Initialization and output-node code

| Scope / node | Exact dependency evidence | Adobe treatment |
|---|---|---|
| Global initialization | `IMPORT p1 TO gv_kschl FROM MEMORY ID 'YSN_YM07DRAUS'`; `FREE MEMORY ID`; for `WE01`, `USR21` and `ADRP` selects based on `LS_MKPF-USNAM` to fill `LV_NAME` | `DEP-YMMGRNNOTE-01`. Do not copy until SFP interface initialization behavior, authorization, memory scope, and `p1` producer are approved. |
| `%CODE5` | `LS_MSEG` in; `LV_BUTXT` out; `SELECT SINGLE BUTXT FROM T001 ... BUKRS = LS_MSEG-BUKRS` | `DEP-YMMGRNNOTE-02`; native SFP coding only after DDIC/authorization confirmation. |
| `%CODE1` | Inputs `WA_MSEG-ERFMG/DMBTR/LV_URATE/PEINH`, `IV_KURSF`; outputs `LV_UNIT/LV_UNIT1` | `DEP-YMMGRNNOTE-03`; no calculation copied before references/divisor behavior are verified. |
| `%CODE3` / `%CODE4` | Uses `VAT`, `SUM`, `TOT_AMNT`, `FINAL_AMT`, `FINAL_AMT1`, and `WA_MSEG-VAT/BNBTR`; includes commented legacy paths | `DEP-YMMGRNNOTE-03`; carry no commented paths or debugger statement. |
| `%CODE2` | `LS_MKPF-BLDAT`, `MONTH`, `DATE`; custom FM `ZABF_ISP_GET_MONTH_NAME` | `DEP-YMMGRNNOTE-04`; native SFP coding only after helper availability and error behavior are approved. |
| Global parameter list | Inputs `GV_KSCHL`, `LS_MKPF`, `LV_NAME`; outputs `GV_KSCHL`, `LV_NAME` | `/GPLIST/item[1..5]`; documents legacy global-code flow, not an Adobe interface parameter. |

## Currency and quantity evidence

There is no `Currency/Quantity Fields` declaration element in the supplied
Smart Form XML. `QUAN` does not occur in the export. The types and uses above
prove likely quantity/currency *candidates* only; they do not prove DDIC
reference components. In SFP, inspect the actual DDIC metadata for each
component of `ZEXTRA_FIELD` before setting a Reference Field. `IV_WAERS` is
an interface `WAERS` field; `IV_KURSF` is an exchange rate, not a currency
reference. No `SFPREF` entry is serialized by this branch.

## Native SFP capture gate

The active blank interface observed after the hand-authored `SFPIOPAR`
experiment means that XML structural similarity to the archived reference is
not sufficient evidence of a successful import for this target object.
Enter the complete contract and global declarations above natively in
`YMMGRNNOTE_INT`, activate, manually map required Interface-tree entries to
the form Context, then use abapGit Stage -> Commit -> Push to capture the
generated SFPI/SFPF. That generated capture becomes the only baseline for
later interface coding or bound layout work.
