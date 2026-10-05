# Legacy Grab - ZMM_PO_DEMO

Generated 2026-10-05 13:59:32 by ZSF2AF_R_LEGACY_GRAB.

## 1. Generated function module
`/1BCDWB/SF00002071`

## 2. Form interface (import/export/tables/exceptions)
Each parameter shows every attribute FUPARAREF carries for it (type/structure,
reference, default, optional ...) - the contract the Adobe interface must keep.
IMPORTING:
- ARCHIVE_INDEX (STRUCTURE=TOA_DARA, PPOSITION=1, OPTIONAL=X, TYPE=X)
- ARCHIVE_INDEX_TAB (STRUCTURE=TSFDARA, PPOSITION=2, OPTIONAL=X, TYPE=X)
- ARCHIVE_PARAMETERS (STRUCTURE=ARC_PARAMS, PPOSITION=3, OPTIONAL=X, TYPE=X)
- CONTROL_PARAMETERS (STRUCTURE=SSFCTRLOP, PPOSITION=4, OPTIONAL=X, TYPE=X)
- MAIL_APPL_OBJ (STRUCTURE=SWOTOBJID, PPOSITION=5, OPTIONAL=X, TYPE=X)
- MAIL_RECIPIENT (STRUCTURE=SWOTOBJID, PPOSITION=6, OPTIONAL=X, TYPE=X)
- MAIL_SENDER (STRUCTURE=SWOTOBJID, PPOSITION=7, OPTIONAL=X, TYPE=X)
- OUTPUT_OPTIONS (STRUCTURE=SSFCOMPOP, PPOSITION=8, OPTIONAL=X, TYPE=X)
- USER_SETTINGS (STRUCTURE=TDBOOL, DEFAULTVAL='X', PPOSITION=9, OPTIONAL=X, TYPE=X)
- LV_EBELN (STRUCTURE=EKKO-EBELN, REFERENCE=X, PPOSITION=10, TYPE=X)
EXPORTING:
- DOCUMENT_OUTPUT_INFO (STRUCTURE=SSFCRESPD, PPOSITION=1, TYPE=X)
- JOB_OUTPUT_INFO (STRUCTURE=SSFCRESCL, PPOSITION=2, TYPE=X)
- JOB_OUTPUT_OPTIONS (STRUCTURE=SSFCRESOP, PPOSITION=3, TYPE=X)
TABLES:
CHANGING:
EXCEPTIONS:
- FORMATTING_ERROR (PPOSITION=1)
- INTERNAL_ERROR (PPOSITION=2)
- SEND_ERROR (PPOSITION=3)
- USER_CANCELED (PPOSITION=4)

### 2b. Custom types used by the interface (DDIC layout)
(no custom Z/Y type named in the interface, or no interface rows read)

### 2c. Currency/quantity reference fields - resolve before building SFPREF
Every CURR/QUAN field found above, with its real DDIC reference field and
whether a top-level scalar already covers it. Read this before writing any
REFERENCE_FIELDS entry - do not infer a field's CURR/QUAN kind from anything
else (a client's rejected reference, a similar-sounding field name, ...) -
this table is the DDIC's own answer. See BUILD_ISSUES_LOG.md F50.
(no custom types to check - see 2b)

### 2d. Context build order - drag these, in this order, nothing else to decide
Once the empty interface/form baseline exists in SFP, drag each of these from
the Interface tree into the form's Context, in this order. Where a CURR/QUAN
field is involved, use the reference resolved in section 2c above - if 2c
already declared it in the interface's own Reference Fields, SAP fills it in
for you; only set it by hand if 2c reported a GAP.
1. LV_EBELN (import)

## 3. Driver program candidates (source + dependencies extracted)
Driver identity check (NACE/TNAPR PGNAM vs. the source-text scan below):
NACE/TNAPR (section 4) names no PGNAM for this form - confirm manually
via the NACE Processing Routines tab before trusting any candidate below.

None found scanning Z*/Y* programs for a literal match near an
SSF_FUNCTION_MODULE_NAME call. Confirm manually (NACE output-type
Processing Routines tab, or ask the functional owner).

## 4. Output determination (NACE / TNAPR)
(no TNAPR row mentions this form name - confirm manually via NACE; the
output type may reference a driver routine rather than the form name directly)

### 4b. Usage evidence (NAST) - how much is this form really used?
(no application/output-type key found in section 4, so nothing to count)

## 5. SSF_READ_FORM interface (auto-probed via FUPARAREF, informational only)
Correction: this turned out NOT to be the layout/style/graphic read API -
its EXPORTING fields (CAPTION/VARTEXT/FMNUMB/ACTIVE/ADMDATA) read as form
header/admin metadata, and there is no TABLES parameter for a node tree.
Kept for reference (occasionally useful for description/version) - sections
6-8 stay manual, produced via the SFP "Create Adobe Form by Migration"
wizard instead (see docs/05_individual_form_conversion_framework.md), not a
background read.
IMPORTING:
- I_FORMNAME (STRUCTURE=TDSFNAME, PPOSITION=1, TYPE=X)
- I_LANGUAGE (STRUCTURE=SPRAS, DEFAULTVAL=SY-LANGU, PPOSITION=2, OPTIONAL=X, TYPE=X)
- I_ACTIVE (STRUCTURE=C, DEFAULTVAL=SPACE, PPOSITION=3, OPTIONAL=X, TYPE=X)
EXPORTING:
- O_CAPTION (STRUCTURE=TDTEXT, PPOSITION=1, TYPE=X)
- O_VARTEXT (STRUCTURE=TSFVTEXT, PPOSITION=2, TYPE=X)
- O_FMNUMB (STRUCTURE=TDFMNUMB, PPOSITION=3, TYPE=X)
- O_FMNUMB_TEST (STRUCTURE=TDFMNUMB, PPOSITION=4, TYPE=X)
- O_ACTIVE (STRUCTURE=TDSFFLAG, PPOSITION=5, TYPE=X)
- O_ADMDATA (STRUCTURE=STXFADM, PPOSITION=6, TYPE=X)
TABLES:
CHANGING:
EXCEPTIONS:
- NO_FORM (PPOSITION=1)
- NO_ACTIVE_SOURCE (PPOSITION=2)
- NO_SOURCE (PPOSITION=3)

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

## 7. Graphics / logos - see the storage probe in section 6
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
