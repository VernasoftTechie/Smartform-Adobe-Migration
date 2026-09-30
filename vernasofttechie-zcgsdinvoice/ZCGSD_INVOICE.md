# Legacy Grab - ZCGSD_INVOICE

Generated 2026-09-22 10:34:16 by ZSF2AF_R_LEGACY_GRAB.

## 1. Generated function module
`/1BCDWB/SF00000196`

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
- LV_TOTAL
- LV_VAT
- LV_CONTROLLER
- LV_MAILID
- LV_PHONE
- LV_ACCHOLDER
- LV_BRANCHCODE
- LV_ACCNUM
- LV_BANK
- LV_VAT_DET
- LV_PAVAL2
- VSTAT
- LV_HEADING
- LV_SUBTOTAL
- LV_WAERK
- LV_SH_LAND1
- LV_FLAG
- LV_SH_STREET
- LV_IN_LAND1
- LV_DEBIT
- LV_CREDIT
- LV_EMAIL
- LV_BUKRS
- LV_LABEL
- LV_FVAT
- LV_REPRINT
- GROSS
EXPORTING:
- DOCUMENT_OUTPUT_INFO
- JOB_OUTPUT_INFO
- JOB_OUTPUT_OPTIONS
TABLES:
- GT_FINL
- GT_INFO
- LT_TLINE
- LT_TLINE_ADRC
- GT_INVOICE
- GT_DEPOT
CHANGING:
EXCEPTIONS:
- FORMATTING_ERROR
- INTERNAL_ERROR
- SEND_ERROR
- USER_CANCELED

## 3. Driver program candidates (source + dependencies extracted)
Driver identity check (NACE/TNAPR PGNAM vs. the source-text scan below):
MISMATCH - NACE names `ZCGSDINV002`, but the source scan did NOT
find it (it exists as a program, so it most likely calls a wrapper routine
rather than SSF_FUNCTION_MODULE_NAME directly - read its source manually).
Treat this form's real driver as UNCONFIRMED until resolved with the
functional owner - do not silently pick the nearest candidate below.

- `ZCGSDINV002_F01` (source-scan CANDIDATE - form name found near an SSF_FUNCTION_MODULE_NAME call; see the driver identity check above before trusting this. READ-ONLY: never modified - see docs/01_scope.md section 8)
  full source extracted to `C:\Users\veere\OneDrive\Desktop\Vernasoft Mission\Sn\driver_ZCGSDINV002_F01.txt`
  dependent objects referenced (raw source lines, driver + its includes - confirm each one):
    *  CALL FUNCTION 'ZSDF_EMAIL_SEND'

## 4. Output determination (NACE / TNAPR)
-
MANDT = 150
KSCHL = ZICG
NACHA = 1
KAPPL = V3
PGNAM = ZCGSDINV002
RONAM = ENTRY
FONAM =
PGNAM2 =
RONAM2 =
FONAM2 =
PGNAM3 =
RONAM3 =
FONAM3 =
PGNAM4 =
RONAM4 =
FONAM4 =
PGNAM5 =
RONAM5 =
FONAM5 =
FUNCNAME =
SFORM = ZCGSD_INVOICE_SF
FORMTYPE =
SFORM2 =
FORMTYPE2 =
SFORM3 =
FORMTYPE3 =
SFORM4 =
FORMTYPE4 =
SFORM5 =
FORMTYPE5 =

## 5. SSF_READ_FORM interface (auto-probed via FUPARAREF, informational only)
Correction: this turned out NOT to be the layout/style/graphic read API -
its EXPORTING fields (CAPTION/VARTEXT/FMNUMB/ACTIVE/ADMDATA) read as form
header/admin metadata, and there is no TABLES parameter for a node tree.
Kept for reference (occasionally useful for description/version) - sections
6-8 stay manual, produced via the SFP "Create Adobe Form by Migration"
wizard instead (see docs/05_individual_form_conversion_framework.md), not a
background read.
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

## 6. SmartStyle(s) used - auto-probe attempted, fallback MANUAL
(no candidate table matched - these were speculative guesses (STXFOBJECT,
STXFATTR, STXFHEADER, SSFOBJ), tried safely: a wrong table name is skipped,
not fatal. For a DEFINITIVE answer that unlocks safe automation for every
remaining form at once (not just this one) - set an ABAP debugger
breakpoint in SE71 at the point the SmartStyle name loads (or ask an
ABAP/Basis colleague to), inspect which table/field it reads from, and
share that.
SE71 -> Form Attributes -> Output Options shows the SmartStyle name this form
uses. It should already be listed in docs/legacy_grab/global_smartstyles.txt
(from the P_GLOB sweep) - just note WHICH one here and match it against
docs/04_global_style_catalogue.md. Only research its format details fresh if
it isn't in the global catalogue yet.

## 7. Graphics / logos - auto-probe attempted, fallback MANUAL
(no candidate table matched - these were speculative guesses (STXFOBJECT,
STXFATTR, STXFHEADER, SSFOBJ), tried safely: a wrong table name is skipped,
not fatal. For a DEFINITIVE answer that unlocks safe automation for every
remaining form at once (not just this one) - set an ABAP debugger
breakpoint in SE71 at the point the SmartStyle name loads (or ask an
ABAP/Basis colleague to), inspect which table/field it reads from, and
share that.
Note any Graphic node in the form's window tree (SE71) and which SE78 object
it points to. It should already be listed in
docs/legacy_grab/global_logos.txt (from the P_GLOB sweep) - just note WHICH
one here and match it against docs/04_global_style_catalogue.md.

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
