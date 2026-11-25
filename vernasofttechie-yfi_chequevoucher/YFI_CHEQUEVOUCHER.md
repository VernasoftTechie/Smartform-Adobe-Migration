# Legacy Grab - YFI_CHEQUEVOUCHER

Generated 2026-11-25 06:39:24 by ZSF2AF_R_LEGACY_GRAB (Bolt with Fiori port ZCL_AB_BOLT_LEGACY_GRAB, system DCD client 400).

## 1. Generated function module
`/1BCDWB/SF00000028`

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
- IS_PAYR (STRUCTURE=PAYR, REFERENCE=X, PPOSITION=10, TYPE=X)
- IS_LFA1 (STRUCTURE=LFA1, REFERENCE=X, PPOSITION=11, TYPE=X)
- IS_T012K (STRUCTURE=T012K, REFERENCE=X, PPOSITION=12, TYPE=X)
- IS_T012T (STRUCTURE=T012T, REFERENCE=X, PPOSITION=13, TYPE=X)
- IV_XBLNR (STRUCTURE=CHAR120, REFERENCE=X, PPOSITION=14, TYPE=X)
- IV_KOSTL (STRUCTURE=KOSTL, REFERENCE=X, PPOSITION=15, TYPE=X)
- IV_SGTXT1 (STRUCTURE=SGTXT, REFERENCE=X, PPOSITION=16, TYPE=X)
- IV_XBLNR1 (STRUCTURE=XBLNR1, REFERENCE=X, PPOSITION=17, TYPE=X)
- IV_XZAHL (STRUCTURE=XZAHL, REFERENCE=X, PPOSITION=18, TYPE=X)
- IV_XZAHL1 (STRUCTURE=XZAHL, REFERENCE=X, PPOSITION=19, TYPE=X)
- IV_SPELL (STRUCTURE=SPELL, REFERENCE=X, PPOSITION=20, TYPE=X)
- IV_BELNR (STRUCTURE=BELNR_D, REFERENCE=X, PPOSITION=21, TYPE=X)
- IV_INV_DOC (STRUCTURE=CHAR120, REFERENCE=X, PPOSITION=22, TYPE=X)
- IV_SGTXT (STRUCTURE=SGTXT, REFERENCE=X, PPOSITION=23, TYPE=X)
- IV_REPRINT (STRUCTURE=FLAG, REFERENCE=X, PPOSITION=24, TYPE=X)
- IV_INT_NUMBER (STRUCTURE=CHAR10, REFERENCE=X, PPOSITION=25, TYPE=X)
- IV_NAME (STRUCTURE=CHAR40, REFERENCE=X, PPOSITION=26, TYPE=X)
- LS_CEPC (STRUCTURE=CEPC, REFERENCE=X, PPOSITION=27, TYPE=X)
- LV_NAME1 (STRUCTURE=ADRC-NAME1, REFERENCE=X, PPOSITION=28, TYPE=X)
EXPORTING:
- DOCUMENT_OUTPUT_INFO (STRUCTURE=SSFCRESPD, PPOSITION=1, TYPE=X)
- JOB_OUTPUT_INFO (STRUCTURE=SSFCRESCL, PPOSITION=2, TYPE=X)
- JOB_OUTPUT_OPTIONS (STRUCTURE=SSFCRESOP, PPOSITION=3, TYPE=X)
TABLES:
- IT_BSAK (STRUCTURE=TT_BSAK, REFERENCE=X, PPOSITION=1, TYPE=X)
- IT_FLEXA (STRUCTURE=FAGLFLEXA_T_TYPE, REFERENCE=X, PPOSITION=2, TYPE=X)
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
1. IS_PAYR (import)
2. IS_LFA1 (import)
3. IS_T012K (import)
4. IS_T012T (import)
5. IV_XBLNR (import)
6. IV_KOSTL (import)
7. IV_SGTXT1 (import)
8. IV_XBLNR1 (import)
9. IV_XZAHL (import)
10. IV_XZAHL1 (import)
11. IV_SPELL (import)
12. IV_BELNR (import)
13. IV_INV_DOC (import)
14. IV_SGTXT (import)
15. IV_REPRINT (import)
16. IV_INT_NUMBER (import)
17. IV_NAME (import)
18. LS_CEPC (import)
19. LV_NAME1 (import)
20. IT_BSAK (table - repeating node)
21. IT_FLEXA (table - repeating node)

### 2e. Context node shapes - real DDIC shape + field list for each
Per S04 (confirmed 2026-10-01): CL_FP_DATA (scalar), CL_FP_STRUCTURE and
CL_FP_LOOP/CL_FP_LOOP_DATA (table) are all hand-authorable. This is the real
shape and, for a structure/table, the real field list each parameter in 2d
needs - read from RTTI on the real TYPENAME, not from FUPARAREF's PARAMTYPE
(a calling-convention flag, not a DDIC kind - a table-typed field can sit
under PARAMTYPE='I' same as a scalar) and never a guessed field name.
IS_PAYR - TYPENAME not found; confirm shape manually in SFP
IS_LFA1 - TYPENAME not found; confirm shape manually in SFP
IS_T012K - TYPENAME not found; confirm shape manually in SFP
IS_T012T - TYPENAME not found; confirm shape manually in SFP
IV_XBLNR - TYPENAME not found; confirm shape manually in SFP
IV_KOSTL - TYPENAME not found; confirm shape manually in SFP
IV_SGTXT1 - TYPENAME not found; confirm shape manually in SFP
IV_XBLNR1 - TYPENAME not found; confirm shape manually in SFP
IV_XZAHL - TYPENAME not found; confirm shape manually in SFP
IV_XZAHL1 - TYPENAME not found; confirm shape manually in SFP
IV_SPELL - TYPENAME not found; confirm shape manually in SFP
IV_BELNR - TYPENAME not found; confirm shape manually in SFP
IV_INV_DOC - TYPENAME not found; confirm shape manually in SFP
IV_SGTXT - TYPENAME not found; confirm shape manually in SFP
IV_REPRINT - TYPENAME not found; confirm shape manually in SFP
IV_INT_NUMBER - TYPENAME not found; confirm shape manually in SFP
IV_NAME - TYPENAME not found; confirm shape manually in SFP
LS_CEPC - TYPENAME not found; confirm shape manually in SFP
LV_NAME1 - TYPENAME not found; confirm shape manually in SFP
IT_BSAK - TYPENAME not found; confirm shape manually in SFP
IT_FLEXA - TYPENAME not found; confirm shape manually in SFP

## 3. Driver program candidates (source + dependencies extracted)
Driver identity check (NACE/TNAPR PGNAM vs. the source-text scan below):
NACE/TNAPR (section 4) names no PGNAM for this form - confirm manually
via the NACE Processing Routines tab before trusting any candidate below.

- `YFI_CHEQUEVOUCHER` (source-scan CANDIDATE - form name found near an SSF_FUNCTION_MODULE_NAME call; see the driver identity check above before trusting this. READ-ONLY: never modified - see docs/01_scope.md section 8)
  full source extracted to `driver_YFI_CHEQUEVOUCHER.txt`
  no other Z*/Y* object references found by the dependency scan

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
