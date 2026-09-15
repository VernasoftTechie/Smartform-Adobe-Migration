# ZSD_ATC — Interface Scope Ledger

100%-evidenced interface contract, extracted directly from the raw
`Utilities → Download` XML export (`docs/legacy_grab/zsd_atc.xml`,
130,173 bytes, one line — byte-offset extraction per F27) rather than
the condensed `ZSF2AF_R_LEGACY_GRAB` report, which gives names but not
exact ABAP types.

Form: `ZSD_ATC`, caption **"Delivery (ATC)"**, `DEVCLASS` `ZSD`, created
2012-02-01. No repeating table in this interface — single-item print,
not a multi-line document.

## 0. Driver mismatch — flagged before anything else, needs your input

**Neither driver candidate the legacy-grab scan found actually calls
this form.** Confirmed by reading both (read-only, per standing rule):

- `ZSD_ATC_BULK_PRINT` calls `SSF_FUNCTION_MODULE_NAME` for formname
  `'YSD_SO_ATC'` (and `'YSD_SO_ATC_FR'` for a French branch) — a
  **different** form, and its own data model is sales-order-based
  (`SELECT ... FROM vbak/vbap`), not delivery-based. `ZSD_ATC`'s real
  interface is entirely `LIKP`/`LIPS` (delivery header/item) typed —
  the two forms don't even share a data source.
- `ZNGSDATCPRINT` calls `SSF_FUNCTION_MODULE_NAME` for formname
  `'ZSDATCFRM'` — also a different form.
- The NACE output-determination row (`zsd_atc.md` §4) names the real
  driver **routine** as `PGNAM=ZSD_DRIVER_ATC`, `RONAM=ENTRY` — a
  program neither candidate matches, and the legacy-grab source-scan
  never found or extracted it.

Both candidates surfaced only because they contain the literal string
"ZSD_ATC" (in `ZSD_ATC_BULK_PRINT`'s own report name) or call
`SSF_FUNCTION_MODULE_NAME` (both do, for their own unrelated forms) —
false positives from the scan's matching heuristic, not this form's
real caller. **Driver context for `ZSD_ATC` is genuinely unknown** —
this doesn't block interface work (the interface is self-contained from
the form's own definition), but it does mean I have zero evidence of
*how* or *when* this form is actually triggered. Please confirm the
real driver (likely `ZSD_DRIVER_ATC`, per NACE) before relying on any
assumption about calling context, side effects, or authorization
checks — none of which can be read from a program I don't have.

## 1. Interface (32 entries — 3 export, 9+23 import, 4 exceptions, 0 tables)

**EXPORTING** (all `STANDARD="X"` — per S04, don't hand-author, SFP
silently drops these and substitutes `/1BCDWB/DOCPARAMS`):
`DOCUMENT_OUTPUT_INFO`/`JOB_OUTPUT_INFO`/`JOB_OUTPUT_OPTIONS`.

**IMPORTING** — 9 standard SSF envelope (same skip-list as every prior
form) + **23 form-specific**:

| Name | Type |
|---|---|
| `V_VBELN` | `LIKP-VBELN` |
| `V_KUNNR` | `KNA1-KUNNR` |
| `V_LFDAT` | `LIKP-LFDAT` |
| `V_MATNR` | `MARA-MATNR` |
| `V_MAKTX` | `MAKT-MAKTX` |
| `V_LFIMG` | `LIPS-LFIMG` |
| `V_VRKME` | `LIPS-VRKME` |
| `V_VGBEL` | `LIPS-VGBEL` |
| `V_NAME1` | `KNA1-NAME1` |
| `V_PLANT` | `T001W-NAME1` |
| `V_BTGEW` | `STRING` |
| `V_GEWEI` | `LIKP-GEWEI` |
| `V_ADD` | `CHAR300` |
| `V_WORDS` | `CHAR100` |
| `V_WORDS1` | `CHAR100` |
| `V_TRANS` | `LIKP-TRANS_NAME` |
| `V_TRUCK` | `LIKP-TRUCK_NO` |
| `V_DRIVER` | `LIKP-DRIVER` |
| `V_TRANSPORTER` | `CHAR40` |
| `V_PRINT` | `STRING` (OPTIONAL) |
| `V_TABIX` | `STRING` |
| `V_TOTAL` | `STRING` |
| `LV_FLAG` | `C` |

Every field is `LIKP`/`LIPS`/`KNA1`/`MARA`/`MAKT`/`T001W`-typed — a
genuine outbound delivery document (transporter/truck/driver fields
confirm this is a dispatch/gate-pass style print, consistent with the
"Delivery (ATC)" caption). `V_BTGEW` (gross weight), `V_TABIX`,
`V_TOTAL` are typed `STRING` despite representing numeric concepts —
preserved exactly as evidenced, not "corrected" to `DEC`/`QUAN`.

**EXCEPTIONS** (all `STANDARD`): `FORMATTING_ERROR`/`INTERNAL_ERROR`/
`SEND_ERROR`/`USER_CANCELED` — native-entry only per S04.

**TABLES**: none. This form prints one delivery item's data per call —
no repeating-table/`occur` pattern needed in the layout.

## 2. Global TYPES — empty, nothing needed

`GTYPES` contains 24 empty `<item/>` placeholders and no actual `TYPES:`
declaration. Unlike `YMM_ISSUE_RESERVATION`, this form needs **no**
native-only `TYPES` step — `GLOBAL_DATA`/`CL_FP_CODING` can be
hand-authored in the same push as the parameters, no sequencing
constraint.

## 3. Global DATA (`GDATA`, 6 entries — all DDIC/simple, safe to hand-author)

| Name | Type |
|---|---|
| `V_DECIMALS` | `DECIMALS` |
| `V_LENG` | `DDLENG` |
| `LV_LFIMG` | `STRING` |
| `V_LFIMG1` | `STRING` |
| `LS_NAST` | `NAST` |
| `V_FLAG` | `C` |

## 4. Window-level code (4 `%CODE` nodes, not one global `GCODING`)

Unlike both prior forms, this form's logic sits in 4 separate
window-level `CO` (code) nodes rather than one global init block.
**`%CODE1`/`%CODE2`/`%CODE3` are byte-for-byte identical** (same
quantity-formatting logic, evidently duplicated once per page/window
that needed it) — build it **once** in Adobe's `INITIALIZATION`, not
three times.

**`%CODE1`/`%CODE2`/`%CODE3`** (`PLIST`: in `V_LFIMG`/`V_DECIMALS`; out
`V_LENG`/`V_LFIMG1`/`LV_LFIMG`) — strips the decimal portion for
display if present:
```abap
*break developer.
if v_lfimg is not INITIAL.
  lv_lfimg = v_lfimg.
  split lv_lfimg at '.' into v_leng v_decimals.
ENDIF.
IF not v_decimals is INITIAL.
  v_lfimg1 = v_leng.
else.
  v_lfimg1 = lv_lfimg.
ENDIF.
```

**`%CODE4`** (`PLIST`: in `V_FLAG`/`V_VBELN`; out `LS_NAST` — `V_FLAG`
itself isn't declared as an output in this node's own `PLIST` despite
being assigned in the code below; a genuine `PLIST` inconsistency in
the legacy source, not something to silently "fix" by omission — the
literal behavior, not the possibly-incomplete `PLIST`, is followed for
the Adobe rebuild) — checks whether output type `ZDEL` was already
sent for this delivery via `NAST`:
```abap
*break developer.
SELECT SINGLE * FROM nast INTO ls_nast WHERE objky = v_vbeln
                                       AND vstat = '1'
                                       AND kschl = 'ZDEL'.
IF sy-subrc = 0.
  v_flag = 'X'.
ENDIF.
```

`*break developer.` is a commented-out debugger breakpoint on every
node — dead code, excluded from the Adobe `INITIALIZATION`, matching
the standing convention.

**Adobe design decision**: both blocks run once (no table, no per-row
question at all this time — genuinely the simplest of the three forms
built so far). Replicate verbatim into one `CL_FP_CODING`/
`INITIALIZATION`: `INPUT_PARAMETERS` = `V_LFIMG`, `V_DECIMALS`,
`V_VBELN`, `V_FLAG`; `OUTPUT_PARAMETERS` = `V_LENG`, `V_LFIMG1`,
`LV_LFIMG`, `LS_NAST`, `V_FLAG`.

## 5. Still to extract before layout work begins

Window/page structure, exact literal text, logo/style — deferred to
the layout phase per this program's established interface → native
Context → layout discipline. Not yet touched in this pass.
