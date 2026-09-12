# YMMGRNNOTE — Legacy Smart Form Snapshot

**Caption:** Goods Reciept Note (legacy spelling)
**Evidence source:** `ymmgrnnote.xml`, SAP SMARTFORMS Utilities download, immutable copy.
**Source checksum:** SHA-256 `9D1F87A664ECFE9B3C936DC38E69922663B2970A696E751792A13429F5648E64` (209,891 bytes).
**Status:** Exact interface parameters are staged in the SFP-generated interface serialization. Its Context is still empty; bound XDP layout cannot begin until SFP generates and captures that Context.

## 1. Legacy facts

| Fact | XML evidence |
|---|---|
| Form / caption | `YMMGRNNOTE` / `Goods Reciept Note` |
| Legacy package | `ZMM` |
| Language evidence | Master language `E`; language vector `*`; captions/text records include `E` and `F` |
| Page | `%PAGE1`, portrait (`PAGEORTN=P`), next page loops to `%PAGE1` |
| Windows | `SIGN_MANUAL` (text), `%GRAPHIC1` (graphic), `SIGNATURE` (text), `DATE` (text), `TEMPLATE` (text), `HEADERWINDOW` (text), `MAIN` (main), `FOOTER` (text) |
| Style | Every populated text node identifies SmartStyle `YGRNNOTE`. It is not in `docs/global_data/styles/global_smartstyles.txt`; no Adobe global-style mapping exists. |
| Graphic | `%GRAPHIC1` references SE78 key `GRAPHICS` / `DANOGATELOGONEW` / `BMAP` / `BCOL`, at resolution `0150`; the name is present in `docs/global_data/logos/global_logos.txt`. No branch-local binary is copied. |
| Barcode / digital signature | No barcode node or signature control/graphic is present. Textual signature labels and manual signature lines are present. |

## 2. Exact legacy interface contract

The future Adobe interface must retain these names, directions, typings, optional flags, and default. This evidence is the contract; no fields are added in this branch.

| Direction | Name | Typing | Type | Flags / default |
|---|---|---|---|---|
| Export | `DOCUMENT_OUTPUT_INFO` | TYPE | `SSFCRESPD` | by value, standard |
| Export | `JOB_OUTPUT_INFO` | TYPE | `SSFCRESCL` | by value, standard |
| Export | `JOB_OUTPUT_OPTIONS` | TYPE | `SSFCRESOP` | by value, standard |
| Import | `ARCHIVE_INDEX` | TYPE | `TOA_DARA` | optional, by value, standard |
| Import | `ARCHIVE_INDEX_TAB` | TYPE | `TSFDARA` | optional, by value, standard |
| Import | `ARCHIVE_PARAMETERS` | TYPE | `ARC_PARAMS` | optional, by value, standard |
| Import | `CONTROL_PARAMETERS` | TYPE | `SSFCTRLOP` | optional, by value, standard |
| Import | `MAIL_APPL_OBJ` | TYPE | `SWOTOBJID` | optional, by value, standard |
| Import | `MAIL_RECIPIENT` | TYPE | `SWOTOBJID` | optional, by value, standard |
| Import | `MAIL_SENDER` | TYPE | `SWOTOBJID` | optional, by value, standard |
| Import | `OUTPUT_OPTIONS` | TYPE | `SSFCOMPOP` | optional, by value, standard |
| Import | `USER_SETTINGS` | TYPE | `TDBOOL` | optional, by value, standard; default `'X'` |
| Import | `LS_MKPF` | TYPE | `MKPF` | |
| Import | `LS_MSEG` | LIKE | `ZEXTRA_FIELD` | |
| Import | `LS_ADRC` | TYPE | `ADRC` | optional |
| Import | `LS_T001W` | TYPE | `T001W` | |
| Import | `LS_T001` | TYPE | `T001` | optional |
| Import | `LS_EBAN` | TYPE | `EBAN` | |
| Import | `LS_EKKO` | TYPE | `EKKO` | |
| Import | `LV_MAKTX` | TYPE | `MAKTX` | |
| Import | `LS_LFA1` | TYPE | `LFA1` | |
| Import | `IV_WAERS` | TYPE | `WAERS` | optional |
| Import | `IV_KURSF` | TYPE | `BAPICURR_D` | optional |
| Table | `LT_MSEG` | LIKE | `ZEXTRA_FIELD` | |
| Exception | `FORMATTING_ERROR` | — | — | standard |
| Exception | `INTERNAL_ERROR` | — | — | standard |
| Exception | `SEND_ERROR` | — | — | standard |
| Exception | `USER_CANCELED` | — | — | standard |

## 3. Content and layout evidence

The XML does not expose usable absolute window coordinates: the relevant positional fields are blank with only units retained. Reproduce the window hierarchy and measured table dimensions from the XML, then use the legacy print/PDF comparison to place windows.

| Legacy region | Evidence and Adobe design mapping |
|---|---|
| `%GRAPHIC1` | Place the matched `DANOGATELOGONEW` asset in the header after SAP-side asset lookup. |
| `HEADERWINDOW` | Company/plant/title alternatives. Includes `Dangote Cement PLC.`, dynamic `LV_BUTXT`, `LS_T001W-NAME1/STRAS/PFACH/ORT01`, and `Goods Receipt Note`. Conditions select variants for plants `1000`, `1100`, `1021`, country `TZ`, and condition value `12`. |
| `DATE` | `GRN NO. &LS_MKPF-MBLNR&` and `GRN Date: &LS_MKPF-BUDAT&`, using paragraph `P1` and character `C1`. |
| `TEMPLATE` | Two-column static template, width 20.20 cm, with supplier, waybill, invoice, transporter, vehicle, LPR/LPO, department, section, shipping/clearing/LC/Form M/container, and currency/exchange-rate details from `LS_MKPF`, `LS_EBAN`, `LS_EKKO`, `LS_LFA1`, `IV_WAERS`, and `IV_KURSF`. |
| `MAIN` | Table `%TABLE1`, bound to `LT_MSEG`, width 19.70 cm. Header columns: SNo, Material Code, Item Description, Unit, Accepted Qty, St.Bin, Unit Rate, Amount. Widths: 0.86, 2.30, 7.05, 1.05, 2.05, 1.49, 1.64, 3.26 cm. Row fields: `WA_MSEG-ZEILE`, `-MATNR`, `-SGTXT`, `-ERFME`, `-ERFMG`, `-LGPLA(C)`, `LV_UNIT1(C)`, `FINAL_AMT1`. Footer shows Gross (`TOT_AMNT`), Vat (`VAT`), Freight and other charge (`SUM`), and Total Amount (`TOT_AMNT`). |
| `SIGN_MANUAL` / `SIGNATURE` | Manual signature labels: Prepared/Checked By, Head (Store), Head (User Department), plus a supplier end-of-report line. Preserve as print-only labels/lines; no electronic signature is evidenced. |
| `FOOTER` | Date/time and `GRN No.`, plus `page &SFSY-PAGE& of &SFSY-FORMPAGES&`. |

## 4. Embedded logic and hard-coded values

| Evidence | Required treatment |
|---|---|
| Global code imports/frees memory ID `YSN_YM07DRAUS` into `GV_KSCHL`; for `WE01`, reads `USR21` then `ADRP` to derive `LV_NAME` from `LS_MKPF-USNAM`. | Developer Extension Point `DEP-YMMGRNNOTE-01`: decide and implement the server-side Adobe equivalent in SFP interface coding only after security/authorisation review. |
| Program lines read `T001-BUTXT` using `LS_MSEG-BUKRS`. | `DEP-YMMGRNNOTE-02`: server-side derivation of `LV_BUTXT`; do not add a new interface parameter. |
| Program lines calculate `LV_UNIT1 = ( WA_MSEG-DMBTR / WA_MSEG-PEINH ) * IV_KURSF`, then `FINAL_AMT1 = LV_UNIT1 * WA_MSEG-ERFMG`; accumulate `VAT`, `SUM`, `TOT_AMNT`; table CALC sums `FINAL_AMT1` to `TOT_AMNT`. | `DEP-YMMGRNNOTE-03`: confirm zero/initial `PEINH`, currency/reference-field handling, and aggregation semantics before implementation. |
| Program lines call custom FM `ZABF_ISP_GET_MONTH_NAME` using `LS_MKPF-BLDAT`, then concatenate `DATE`; `BREAK-POINT` and several lines are commented out. | `DEP-YMMGRNNOTE-04`: validate approved replacement/availability of the custom FM and month language behavior. Do not carry debugger or commented code into the Adobe design. |
| Conditions use `GV_KSCHL = 'WE01'`, `GV_KSCHL = 'ZET1'`, plants `'1000'`, `'1100'`, `'1021'`, country `'TZ'`, and value `12`. Static brand/address strings include Dangote and Okpella variants. | `DEP-YMMGRNNOTE-05`: obtain business-owner confirmation of every conditional branch and static legal/address text before recreating it. |

## 5. Risk score and design strategy

**Initial score: High (Level B/C).** Operational GRN output has multilingual evidence, eight windows, conditional branding, a repeating eight-column table, a matched graphic, custom/global ABAP logic, database reads, custom FM dependency, calculations, and manual signature regions. Volume, actual consumers, driver complexity, and output determination are not evidenced in this XML and remain unscored.

**Chosen strategy: Path A plus S01 — standard SFP-created baseline, blueprint-led incremental build.** S02 is not selected: the legacy page is portrait and the 19.70 cm table fits the 20.20 cm template width. S03 is not selected as a strategy because this is not a purchase-requisition form. No SFPF/SFPI/XDP is authored until an SFP-created baseline renders and is captured through abapGit.

## 6. Absent or unresolved evidence

- Legacy program/NACE evidence is preserved unchanged in `ymmgrnnote_legacy_program.md`: generated FM `/1BCDWB/SF00000019`; TNAPR links `WA01`/`WE01` to `YSAPM07DR_GRN` and `ZET1` to `YSLSAPM07DR_GRN`, all through `ENTRY_WA01`. These drivers are read-only and cutover is out of scope.
- The `YGRNNOTE` SmartStyle definition XML is absent; its paragraph/character definitions (`P0`, `P1`, `P3`, `P5`, `P7`, `P8`, `P9`, `PA`, `PB`, `C1`, `C2`, `C3`, `U1`) cannot be translated from this form XML alone.
- The global inventory confirms the logo name but not a reusable Adobe asset or size/crop.
- No text include/SO10 reference is present; all observed text is inline. No barcode or electronic signature node is present.
