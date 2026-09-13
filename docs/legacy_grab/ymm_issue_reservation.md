# Legacy Grab - YMM_ISSUE_RESERVATION

Generated 2026-09-13 16:33:07 by ZSF2AF_R_LEGACY_GRAB.

## 1. Generated function module
`/1BCDWB/SF00000020`

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
- IV_PLANT_NAME
- LV_LAND1
- GV_TOTAL
EXPORTING:
- DOCUMENT_OUTPUT_INFO
- JOB_OUTPUT_INFO
- JOB_OUTPUT_OPTIONS
TABLES:
- IT_FINAL
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
