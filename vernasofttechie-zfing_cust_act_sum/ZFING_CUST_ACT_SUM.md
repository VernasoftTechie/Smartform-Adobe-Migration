# Legacy Grab - ZFING_CUST_ACT_SUM

Generated 2026-10-02 05:41:28 by ZSF2AF_R_LEGACY_GRAB.

## 1. Generated function module
`/1BCDWB/SF00000248`

## 2. Form interface (import/export/tables/exceptions)
Each parameter shows every attribute FUPARAREF carries for it (type/structure,
reference, default, optional ...) - the contract the Adobe interface must keep.
IMPORTING:
- KUNNR (STRUCTURE=KUNNR, REFERENCE=X, PPOSITION=10, TYPE=X)
- KEYDATE (STRUCTURE=CHAR45, REFERENCE=X, PPOSITION=14, OPTIONAL=X, TYPE=X)
- ARCHIVE_PARAMETERS (STRUCTURE=ARC_PARAMS, PPOSITION=3, OPTIONAL=X, TYPE=X)
- ARCHIVE_INDEX_TAB (STRUCTURE=TSFDARA, PPOSITION=2, OPTIONAL=X, TYPE=X)
- CONTROL_PARAMETERS (STRUCTURE=SSFCTRLOP, PPOSITION=4, OPTIONAL=X, TYPE=X)
- MAIL_APPL_OBJ (STRUCTURE=SWOTOBJID, PPOSITION=5, OPTIONAL=X, TYPE=X)
- ARCHIVE_INDEX (STRUCTURE=TOA_DARA, PPOSITION=1, OPTIONAL=X, TYPE=X)
- MAIL_RECIPIENT (STRUCTURE=SWOTOBJID, PPOSITION=6, OPTIONAL=X, TYPE=X)
- MAIL_SENDER (STRUCTURE=SWOTOBJID, PPOSITION=7, OPTIONAL=X, TYPE=X)
- OUTPUT_OPTIONS (STRUCTURE=SSFCOMPOP, PPOSITION=8, OPTIONAL=X, TYPE=X)
- NAME1 (STRUCTURE=NAME1_GP, REFERENCE=X, PPOSITION=11, TYPE=X)
- OPEN_BALNC (STRUCTURE=ZAMT_LOC, REFERENCE=X, PPOSITION=12, TYPE=X)
- CLOSE_BALNC (STRUCTURE=ZAMT_LOC, REFERENCE=X, PPOSITION=13, TYPE=X)
- TOTAL_PAYMENT (STRUCTURE=ZAMT_LOC, REFERENCE=X, PPOSITION=15, TYPE=X)
- TOTAL_BONUS (STRUCTURE=ZAMT_LOC, REFERENCE=X, PPOSITION=16, TYPE=X)
- TOTAL_RETURNS (STRUCTURE=ZAMT_LOC, REFERENCE=X, PPOSITION=17, TYPE=X)
- TOTAL_INVOICE (STRUCTURE=ZAMT_LOC, REFERENCE=X, PPOSITION=18, TYPE=X)
- V_DATE (STRUCTURE=CHAR45, REFERENCE=X, PPOSITION=19, TYPE=X)
- V_DATE1 (STRUCTURE=CHAR45, REFERENCE=X, PPOSITION=20, TYPE=X)
- GV_DATE1 (STRUCTURE=CHAR10, REFERENCE=X, PPOSITION=21, TYPE=X)
- GV_DATE (STRUCTURE=CHAR10, REFERENCE=X, PPOSITION=22, TYPE=X)
- STRAS (STRUCTURE=STRAS_GP, REFERENCE=X, PPOSITION=24, TYPE=X)
- ORT01 (STRUCTURE=ORT01_GP, REFERENCE=X, PPOSITION=25, TYPE=X)
- TOTAL_OPEN_ATC (STRUCTURE=ZAMT_LOC, REFERENCE=X, PPOSITION=26, TYPE=X)
- AVAILABLE_BAL (STRUCTURE=ZAMT_LOC, REFERENCE=X, PPOSITION=27, TYPE=X)
- CUR (STRUCTURE=CHAR5, REFERENCE=X, PPOSITION=23, OPTIONAL=X, TYPE=X)
- LS_COMP_ADD (STRUCTURE=ZFIS_COMPANY_ADDRESS, REFERENCE=X, PPOSITION=28, OPTIONAL=X, TYPE=X)
- USER_SETTINGS (STRUCTURE=TDBOOL, DEFAULTVAL='X', PPOSITION=9, OPTIONAL=X, TYPE=X)
EXPORTING:
- DOCUMENT_OUTPUT_INFO (STRUCTURE=SSFCRESPD, PPOSITION=1, TYPE=X)
- JOB_OUTPUT_INFO (STRUCTURE=SSFCRESCL, PPOSITION=2, TYPE=X)
- JOB_OUTPUT_OPTIONS (STRUCTURE=SSFCRESOP, PPOSITION=3, TYPE=X)
TABLES:
- PAYMENTITEMS (STRUCTURE=ZTAB_ACT_STMT, REFERENCE=X, PPOSITION=1, TYPE=X)
- BONUSITEMS (STRUCTURE=ZTAB_ACT_STMT, REFERENCE=X, PPOSITION=2, TYPE=X)
- RETURNITEMS (STRUCTURE=ZTAB_ACT_STMT, REFERENCE=X, PPOSITION=3, TYPE=X)
- INVOICEITEMS (STRUCTURE=ZTAB_ACT_STMT, REFERENCE=X, PPOSITION=4, TYPE=X)
- OPEN_ATC (STRUCTURE=ZSTR_ATC_TAB, REFERENCE=X, PPOSITION=5, TYPE=X)
CHANGING:
EXCEPTIONS:
- FORMATTING_ERROR (PPOSITION=1)
- INTERNAL_ERROR (PPOSITION=2)
- SEND_ERROR (PPOSITION=3)
- USER_CANCELED (PPOSITION=4)

### 2b. Custom types used by the interface (DDIC layout)
`ZAMT_LOC`: elementary type (P, length 13).
`ZFIS_COMPANY_ADDRESS` - 9 field(s):
- BUKRS (element BUKRS, type CHAR, length 000004, decimals 000000)
- NAME1 (element AD_NAME1, type CHAR, length 000040, decimals 000000)
- STREET (element CHAR200, type CHAR, length 000200, decimals 000000)
- STR_SUPPL1 (element AD_STRSPP1, type CHAR, length 000040, decimals 000000)
- STR_SUPPL2 (element AD_STRSPP2, type CHAR, length 000040, decimals 000000)
- LOCATION (element AD_LCTN, type CHAR, length 000040, decimals 000000)
- EMAIL (element AD_SMTPADR, type CHAR, length 000241, decimals 000000)
- WEBSITE (element ZFI_WEBSITE, type STRG, length 000300, decimals 000000)
- MOBILE (element AD_TLNMBR1, type CHAR, length 000030, decimals 000000)
`ZSTR_ATC_TAB` is a table type - line type:
`ZSTR_ATC_TAB` - 7 field(s):
- KUNNR (element KUNNR, type CHAR, length 000010, decimals 000000)
- DOCNO (element BELNR_D, type CHAR, length 000010, decimals 000000)
- MATNR (element MATNR, type CHAR, length 000040, decimals 000000)
- QTY_UOM (element , type CHAR, length 000015, decimals 000000)
- DOCDATE (element , type CHAR, length 000010, decimals 000000)
- AMOUNT (element ZAMT_LOC, type CURR, length 000025, decimals 000002)
- PERIOD (element , type CHAR, length 000007, decimals 000000)
`ZTAB_ACT_STMT` is a table type - line type:
`ZTAB_ACT_STMT` - 9 field(s):
- DOCNO (element BELNR_D, type CHAR, length 000010, decimals 000000)
- AMOUNTLC (element ZAMT_LOC, type CURR, length 000025, decimals 000002)
- ITEMTXT (element SGTXT, type CHAR, length 000050, decimals 000000)
- POSTINGDATE (element BUDAT, type DATS, length 000008, decimals 000000)
- DOCTYPE (element SGTXT, type CHAR, length 000050, decimals 000000)
- CUR (element WAERS, type CUKY, length 000005, decimals 000000)
- ALLOC_NMBR (element DZUONR, type CHAR, length 000018, decimals 000000)
- REF_DOC_NO (element XBLNR, type CHAR, length 000016, decimals 000000)
- KUNNR (element KUNNR, type CHAR, length 000010, decimals 000000)

### 2c. Currency/quantity reference fields - resolve before building SFPREF
Every CURR/QUAN field found above, with its real DDIC reference field and
whether a top-level scalar already covers it. Read this before writing any
REFERENCE_FIELDS entry - do not infer a field's CURR/QUAN kind from anything
else (a client's rejected reference, a similar-sounding field name, ...) -
this table is the DDIC's own answer. See BUILD_ISSUES_LOG.md F50.
Field | reference needed | resolution
---|---|---
`ZSTR_ATC_TAB-AMOUNT` (CURR) CUKY (currency key) GAP - no CUKY (currency key) scalar found in this interface; add one (e.g. a global typed WAERK)
`ZTAB_ACT_STMT-AMOUNTLC` (CURR) CUKY (currency key) GAP - no CUKY (currency key) scalar found in this interface; add one (e.g. a global typed WAERK)

Domain classification (CUKY/UNIT) depends on CL_ABAP_ELEMDESCR->GET_DDIC_FIELD,
not yet confirmed against a real system - if every "resolution" above says GAP
even for a field you know has a reference (like LV_WAERK here), that call likely
failed silently; fall back to checking by name/eye until confirmed.

### 2d. Context build order - drag these, in this order, nothing else to decide
Once the empty interface/form baseline exists in SFP, drag each of these from
the Interface tree into the form's Context, in this order. Where a CURR/QUAN
field is involved, use the reference resolved in section 2c above - if 2c
already declared it in the interface's own Reference Fields, SAP fills it in
for you; only set it by hand if 2c reported a GAP.
1. KUNNR (import)
2. KEYDATE (import)
3. NAME1 (import)
4. OPEN_BALNC (import)
5. CLOSE_BALNC (import)
6. TOTAL_PAYMENT (import)
7. TOTAL_BONUS (import)
8. TOTAL_RETURNS (import)
9. TOTAL_INVOICE (import)
10. V_DATE (import)
11. V_DATE1 (import)
12. GV_DATE1 (import)
13. GV_DATE (import)
14. STRAS (import)
15. ORT01 (import)
16. TOTAL_OPEN_ATC (import)
17. AVAILABLE_BAL (import)
18. CUR (import)
19. LS_COMP_ADD (import)
20. PAYMENTITEMS (table - repeating node)
21. BONUSITEMS (table - repeating node)
22. RETURNITEMS (table - repeating node)
23. INVOICEITEMS (table - repeating node)
24. OPEN_ATC (table - repeating node)

## 3. Driver program candidates (source + dependencies extracted)
Driver identity check (NACE/TNAPR PGNAM vs. the source-text scan below):
NACE/TNAPR (section 4) names no PGNAM for this form - confirm manually
via the NACE Processing Routines tab before trusting any candidate below.

- `ZKTEST_PROG` (source-scan CANDIDATE - form name found near an SSF_FUNCTION_MODULE_NAME call; see the driver identity check above before trusting this. READ-ONLY: never modified - see docs/01_scope.md section 8)
  full source extracted to `C:\Users\veere\OneDrive\Desktop\Vernasoft Mission\Sn\driver_ZKTEST_PROG.txt`
  dependent objects referenced (raw source lines, driver + its includes - confirm each one):
    *"INCLUDE zfi_cust_ac_stmt_email_f01              .    " FORM-Routines
    *"INCLUDE zfi_cust_ac_stmt_email_top              .    " global Data
    *"INCLUDE zfi_cust_act_stmt_f01.
    *"INCLUDE zfi_cust_act_stmt_top.
    **  INCLUDE zfi_cust_act_stmt_f01.
    **  INCLUDE zfi_cust_act_stmt_top.
    *****                CALL FUNCTION 'ZDATE_TIME_DIFFERENCE'
    *****      CALL FUNCTION 'ZDATE_TIME_DIFFERENCE'
    ******        CALL FUNCTION 'ZDATE_TIME_DIFFERENCE'
    ******      CALL FUNCTION 'ZDATE_TIME_DIFFERENCE'
    ***INCLUDE yrle_delnote_data_declare.
    ***INCLUDE yrle_delnote_forms.
    ***INCLUDE yrle_print_forms.
    **INCLUDE yrle_delnote_data_declare.
    **INCLUDE yrle_delnote_forms.
    **INCLUDE yrle_print_forms.
    *INCLUDE zfi_cust_act_stmt_f01.
    *INCLUDE zfi_cust_act_stmt_top.
- `ZTESTK` (source-scan CANDIDATE - form name found near an SSF_FUNCTION_MODULE_NAME call; see the driver identity check above before trusting this. READ-ONLY: never modified - see docs/01_scope.md section 8)
  full source extracted to `C:\Users\veere\OneDrive\Desktop\Vernasoft Mission\Sn\driver_ZTESTK.txt`
  dependent objects referenced (raw source lines, driver + its includes - confirm each one):
    *    CALL FUNCTION 'ZABF_ISP_GET_MONTH_NAME'    " 'ISP_GET_MONTH_NAME'    "#EC CI_USAGE_OK[2469385]
- `ZFI_CUST_ACT_STMT_F01_COPY` (source-scan CANDIDATE - form name found near an SSF_FUNCTION_MODULE_NAME call; see the driver identity check above before trusting this. READ-ONLY: never modified - see docs/01_scope.md section 8)
  full source extracted to `C:\Users\veere\OneDrive\Desktop\Vernasoft Mission\Sn\driver_ZFI_CUST_ACT_STMT_F01_COPY.txt`
  no other Z*/Y* object references found by the dependency scan
- `ZFI_SEND_STMT_I01` (source-scan CANDIDATE - form name found near an SSF_FUNCTION_MODULE_NAME call; see the driver identity check above before trusting this. READ-ONLY: never modified - see docs/01_scope.md section 8)
  full source extracted to `C:\Users\veere\OneDrive\Desktop\Vernasoft Mission\Sn\driver_ZFI_SEND_STMT_I01.txt`
  dependent objects referenced (raw source lines, driver + its includes - confirm each one):
        CALL FUNCTION 'ZABF_ISP_GET_MONTH_NAME'    " 'ISP_GET_MONTH_NAME'    "#EC CI_USAGE_OK[2469385]
- `ZFI_CUST_ACT_STMT_F01` (source-scan CANDIDATE - form name found near an SSF_FUNCTION_MODULE_NAME call; see the driver identity check above before trusting this. READ-ONLY: never modified - see docs/01_scope.md section 8)
  full source extracted to `C:\Users\veere\OneDrive\Desktop\Vernasoft Mission\Sn\driver_ZFI_CUST_ACT_STMT_F01.txt`
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
