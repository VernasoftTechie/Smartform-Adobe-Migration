# Legacy Grab - Z_MM_PR_FORM

Generated 2026-09-11 20:18:15 by ZSF2AF_R_LEGACY_GRAB.

## 1. Generated function module
`/1BCDWB/SF00002041`

## 2. Form interface (import/export/tables/exceptions)
IMPORTING:
- ARCHIVE_INDEX
- ARCHIVE_INDEX_TAB
- ARCHIVE_PARAMETERS
- CONTROL_PARAMETERS
- MAIL_APPL_OBJ
- MAIL_RECIPIENT
- MAIL_SENDER
- OUTPUT_OPTIONS
- USER_SETTINGS
- BANFN
- BEDNR
- BADAT
- AFNAM
- EKNAM
- V_EXTTOTAL
- PLANT_NAME
- IV_LFDAT
- V_BSART
- V_PSTYP
- V_WAERS
- LV_COMPANY
- GV_ERNAM
- V_EXTTOTAL1
- LV_WAERS_PO
- V_KNTTP
EXPORTING:
- DOCUMENT_OUTPUT_INFO
- JOB_OUTPUT_INFO
- JOB_OUTPUT_OPTIONS
TABLES:
- T_FINAL
- T_TEXT
CHANGING:
EXCEPTIONS:
- FORMATTING_ERROR
- INTERNAL_ERROR
- SEND_ERROR
- USER_CANCELED

## 3. Driver program candidates (source + dependencies extracted)
None found scanning Z*/Y* programs for a literal match. Confirm manually
(NACE output-type Processing Routines tab, or ask the functional owner).

## 4. Output determination (NACE / TNAPR)
(no TNAPR row mentions this form name - confirm manually via NACE; the
output type may reference a driver routine rather than the form name directly)

## 5. SSF_READ_FORM interface (auto-probed via FUPARAREF)
This is the likely API for sections 6-8 below. Probed automatically every
run - no separate manual step. Gives parameter NAMES + I/E/T/C/X kind only,
not each parameter's exact ABAP type, so it is not called for real yet -
calling it with a guessed type for a deep EXPORTING/TABLES parameter risks
the same kind of dump SSF_FUNCTION_MODULE_NAME caused earlier (see
docs/BUILD_ISSUES_LOG.md F1). To unlock the real call: open SE37 -> display
SSF_READ_FORM -> note the Reference Type shown for the EXPORTING/TABLES
parameter(s) listed just below, and share that.
IMPORTING:
- I_FORMNAME
- I_LANGUAGE
- I_ACTIVE
EXPORTING:
- O_CAPTION
- O_VARTEXT
- O_FMNUMB
- O_FMNUMB_TEST
- O_ACTIVE
- O_ADMDATA
TABLES:
CHANGING:
EXCEPTIONS:
- NO_FORM
- NO_ACTIVE_SOURCE
- NO_SOURCE

## 6. SmartStyle(s) used - MANUAL
SE71 -> Form Attributes -> Output Options -> note the SmartStyle name(s), then
print the style's paragraph/character format list from SMARTSTYLES.

## 7. Graphics / logos - MANUAL
Note any Graphic node in the form's window tree (SE71) and the MIME Repository
object it points to; export the image from SE80 MIME Repository.

## 8. Form outline (pages / windows / node types) - MANUAL
Walk the SE71 navigation tree and note each page/window/node (text, table,
loop, graphic) as a short outline here.

## 9. Risk score
Business criticality / Interactivity / Layout complexity / Driver complexity /
Integration touchpoints / Localization / Volume -> composite: Low / Medium / High / Critical.

## 10. Output comparison (OTF) - Phase 2 pilot only, not auto-captured here
OTF is a rendered print stream, not a design source - it cannot be used to
rebuild the form. Its correct role is validation: once the Adobe Form exists,
run this form for one real document (SSF control param GETOTF = 'X' captures
JOB_OUTPUT_INFO-OTFDATA; CONVERT_OTF renders it to PDF for comparison) and
diff it visually against the new Adobe Form's PDF for the same document.

## 11. Full prerequisite checklist - confirm every item before converting
[ ] SmartStyle name(s) (section 6)
[ ] Paragraph/character formats used by each SmartStyle
[ ] Graphics/logos referenced (section 7) - MIME Repository object + binary export
[ ] Standard texts (SO10) referenced by any TEXT/INCLUDE TEXT node -
    check each TDOBJECT/TDNAME/TDID/TDSPRAS via SO10
[ ] Barcode / font resources (if the form prints barcodes or labels)
[ ] Languages / translations required (each SPRAS variant, if multi-language)
[ ] Driver program full source (section 3 - extracted)
[ ] Included programs of the driver (section 3 - extracted where found)
[ ] Other custom objects the driver/includes reference (section 3 - confirm each)
[ ] Form interface (section 2 - extracted)
[ ] Output determination / NACE linkage (section 4 - extracted)
[ ] Digital signature / interactive XFA scripting, if this form is interactive
[ ] Authorization checks inside the driver program (read the extracted source)
[ ] Number-range/posting side effects inside the driver (read the extracted source)

## Bolt's read of this snapshot (2026-09-12)

- **Form purpose**: Purchase Requisition print form (MM). Interface fields
  confirm it: `BANFN` (PR number), `BEDNR` (requirement tracking number),
  `BADAT` (PR date), `AFNAM`/`EKNAM` (requisitioner / purchasing group name),
  `V_BSART`/`V_PSTYP`/`V_KNTTP` (doc type / item category / account
  assignment category), `V_WAERS`/`LV_WAERS_PO` (currency), `V_EXTTOTAL`/
  `V_EXTTOTAL1` (totals), `PLANT_NAME`, `IV_LFDAT` (delivery date),
  `LV_COMPANY`, `GV_ERNAM`. `T_FINAL` is almost certainly the PR line-item
  table; `T_TEXT` the long-text table.
- **Driver not found by source scan** — either it's a standard (non-Z/Y)
  SAP program, the form name is built dynamically rather than appearing as
  a literal, or `P_PREF` needs widening. Doesn't block design work (driver
  is read-only context, never required for the design itself) but worth
  confirming with the functional owner per section 3's fallback note.
- **Output determination not found in `TNAPR`** — same open question; NACE
  configuration should be checked directly for whichever output type
  triggers this form.
- **`SSF_READ_FORM` correction**: see `docs/02_legacy_grab_spec.md` and
  `docs/03_version_history.md` v1.3 — this FM turned out to return form
  header/admin metadata, not the layout. Section 5 above (from the original
  v1.1 run) still says "likely API for sections 6-8" — that claim is now
  retracted; a re-run of the report will show the corrected v1.3 wording.
