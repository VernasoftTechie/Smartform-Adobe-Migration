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

## Initialization and output-node code — exact literal source

Extracted directly from `ymmgrnnote.xml` by byte offset (not the condensed
report), so this is the complete ABAP text, comments and dead lines
included, not a paraphrase.

**Global initialization** (runs once, before any window renders) —
`GCODING`, params: in `GV_KSCHL`/`LS_MKPF`/`LV_NAME`, out `GV_KSCHL`/`LV_NAME`:

```abap
IMPORT p1 TO gv_kschl FROM MEMORY ID 'YSN_YM07DRAUS'.
FREE MEMORY ID 'YSN_YM07DRAUS'.

IF gv_kschl = 'WE01'.

  DATA: lv_pers_no TYPE ad_persnum.

  CLEAR lv_name.

  SELECT SINGLE persnumber
    FROM usr21
    INTO lv_pers_no
    WHERE bname = ls_mkpf-usnam.
  IF sy-subrc = 0.

    SELECT SINGLE name_text
      FROM adrp
      INTO lv_name
      WHERE persnumber = lv_pers_no.

  ENDIF.

ENDIF.
```
`DEP-YMMGRNNOTE-01`. **Authorization question, not just an evidence gap**:
this reads another user's personal data (name) via a cross-program memory
handoff (`MEMORY ID 'YSN_YM07DRAUS'`) whose *producer* is not this form —
some other program sets `p1` before this form runs. Two things need an
explicit answer before this is typed into SFP: (1) is Basis/security aware
this form reads `USR21`/`ADRP` for another user's name, and is that still
approved when the caller is Adobe/ADS instead of the original SmartForm
driver; (2) does the memory ID still get set at all when this GRN prints
through the Adobe path — a memory ID is only populated if the actual
calling program still performs that `EXPORT ... TO MEMORY ID` step, which
this evidence doesn't show and the driver is out of scope to change.

**`%CODE5`** (header window `HEADERWINDOW`) — in `LS_MSEG`, out `LV_BUTXT`:
```abap
select single  butxt from t001 into lv_butxt where bukrs = ls_mseg-bukrs.
```
`DEP-YMMGRNNOTE-02`; single DDIC read, no authorization concern evidenced
beyond normal `T001` read access.

**`%CODE1`** (inside the `MAIN`/`%TABLE1` row loop — `WA_MSEG` is the loop
work area) — in `WA_MSEG-ERFMG/DMBTR/LV_URATE/PEINH`, `IV_KURSF`; out
`LV_UNIT`/`LV_UNIT1`:
```abap
lv_unit = wa_mseg-dmbtr * iv_kursf.
"Added By Veeresh on 01/11/2022
lv_unit1 = ( wa_mseg-dmbtr / wa_mseg-peinh ) * iv_kursf.
*lv_unit = wa_mseg-lv_urate.
```
Note: `ERFMG` is declared as an input in the parameter list but is not
actually read in this node's own code (it's used by `%CODE3` instead) —
likely SmartForms tracking the whole processing route, not a discrepancy
to resolve. The commented `*lv_unit = wa_mseg-lv_urate.` confirms the
active formula is the `DMBTR * IV_KURSF` line above it, not a rate lookup.
**`PEINH` is a divisor** (`lv_unit1`) — zero/initial `PEINH` on any row
would divide-by-zero at runtime; this is `DEP-YMMGRNNOTE-03`'s open
question, now precisely located.

**`%CODE3`** (also inside the `MAIN` row loop, runs after `%CODE1` per
row) — in `WA_MSEG-DMBTR/ERFMG/LV_URATE`, `WA_MSEG`, `VAT`, `SUM`,
`IV_KURSF`, `LV_UNIT`, `LV_UNIT1`; out `FINAL_AMT`, `VAT`, `SUM`,
`TOT_AMNT`, `FINAL_AMT1`:
```abap
vat = wa_mseg-vat.
sum = sum + wa_mseg-bnbtr.
*FRI = wa_mseg-FRI.
*OTH = wa_mseg-OTH.
*DIS = wa_mseg-DIS.
*FINAL_AMT = ( WA_MSEG-DMBTR * WA_MSEG-ERFMG ).
*final_amt = ( wa_mseg-lv_urate * wa_mseg-erfmg ).
final_amt = ( lv_unit * wa_mseg-erfmg )."#EC CI_FLDEXT_OK[2610650]
final_amt1 = ( lv_unit1 * wa_mseg-erfmg ).
```
`SUM` is a **running accumulator across rows** (`sum = sum + ...`), not a
per-row value — it must start at zero before the first row and carry
forward. `DIS` is declared globally but its only assignment is commented
out (`*DIS = wa_mseg-DIS.`) — it is a dead field in the current active
logic; do not invent a value for it. `FRI`/`OTH` (freight/other charge)
are referenced only in commented lines — evidence of a prior design, not
current behavior.

**`%CODE4`** (runs once, after the row loop finishes — table footer) —
in `TOT_AMNT`, `VAT`, `SUM`, `WA_MSEG-BNBTR`; out `TOT_AMNT`, `VAT`,
`WA_MSEG-BNBTR`, `DIS`:
```abap
*BREAK-POINT.
TOT_AMNT =  TOT_AMNT + sum + vat.
```
`DEP-YMMGRNNOTE-03`; do not carry the commented `BREAK-POINT` forward.
`TOT_AMNT` accumulates across pages too if the table spans more than one
— confirm during multi-page testing.

**`%CODE2`** (footer window `FOOTER`, runs once) — in `LS_MKPF-BLDAT`;
out `MONTH`, `DATE`:
```abap
*break developer.
***SOC by kalyan on 25.07.2025
*CALL FUNCTION 'ISP_GET_MONTH_NAME'"#EC CI_USAGE_OK[2469385]
CALL FUNCTION 'ZABF_ISP_GET_MONTH_NAME'"#EC CI_USAGE_OK[2469385]
***EOC by kalyan on 25.07.2025
  EXPORTING
   DATE               = ls_mkpf-bldat
    LANGUAGE           = SY-LANGU
*   MONTH_NUMBER       = MON_NO
 IMPORTING
*   LANGU_BACK         =
*   LONGTEXT           = MONTH
   SHORTTEXT          = MONTH
 EXCEPTIONS
   CALENDAR_ID        = 1
   DATE_ERROR         = 2
   NOT_FOUND          = 3
   WRONG_INPUT        = 4
   OTHERS             = 5
          .
IF SY-SUBRC <> 0.
* Implement suitable error handling here
ENDIF.

CONCATENATE ls_mkpf-bldat+6(2)'-' month'-'ls_mkpf-bldat+0(4)
   into date.
```
`DEP-YMMGRNNOTE-04`. **Important distinction, easy to miss**: this
computes `DATE` from `LS_MKPF-BLDAT` (document date) for the FOOTER only.
The separate `DATE` *window* (§3 of `ymmgrnnote.md`) prints
`&LS_MKPF-BUDAT&` (posting date) directly, unformatted — a different
field, not this computed string. Both must be carried into the Adobe
design; they are not the same value.

## Per-row vs one-time execution — a design decision, not free evidence

`%CODE1`/`%CODE3` run **per `LT_MSEG` row** (they use `WA_MSEG`, the
SmartForms loop work area); the global initialization, `%CODE5`, and
`%CODE2` run **once**. Adobe's `CL_FP_CODING`/`INITIALIZATION` runs once,
before layout rendering — there is no native per-row hook there. Two ways
to realize the per-row math, both legitimate, not yet chosen:

- **FormCalc on the layout** — `LV_UNIT`/`LV_UNIT1`/`FINAL_AMT`/
  `FINAL_AMT1` computed per row directly from `DMBTR`/`PEINH`/`ERFMG`
  (already present as row columns) and `IV_KURSF` (top-level parameter),
  in a `calculate` script on each cell. `SUM`/`TOT_AMNT` as a
  `Sum(table_row[*].field)` FormCalc expression, matching the pilot's own
  grand-total pattern. No ABAP loop needed; keeps `CL_FP_CODING` limited
  to the true one-time items (init, `%CODE5`, `%CODE2`).
- **ABAP loop in `CL_FP_CODING`/`INITIALIZATION`** — loop over the
  imported `LT_MSEG`, compute the same fields per row, write them back
  into the table (or export an enriched copy) before rendering. Keeps all
  business logic server-side, matching this project's own Adobe Forms
  Rulebook guidance (`instructions/ADOBE_FORMS_DESIGN_MASTER_RULEBOOK.md`
  §5: "keep business logic inside ABAP whenever possible").

**Recommendation, not yet confirmed**: FormCalc for the pure arithmetic
(simpler, no new table plumbing, and division-by-zero on `PEINH` is
easier to guard client-side with an `if` in FormCalc than to add
exception handling to a server-side loop) — but this is your call, not
assumed here.

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
