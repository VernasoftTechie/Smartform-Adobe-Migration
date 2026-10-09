# Legacy Grab - ZMMET_PO_SF

Generated 2026-10-09 06:50:50 by ZSF2AF_R_LEGACY_GRAB.

## 1. Generated function module
`/1BCDWB/SF00002050`

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
- V_COMPANY_NAME (STRUCTURE=ADRC-NAME1, REFERENCE=X, PPOSITION=10, TYPE=X)
- V_PONO (STRUCTURE=CHAR26, REFERENCE=X, PPOSITION=11, TYPE=X)
- V_DEPARTMNT (STRUCTURE=T024-EKNAM, REFERENCE=X, PPOSITION=12, TYPE=X)
- V_BEDAT (STRUCTURE=EKKO-BEDAT, REFERENCE=X, PPOSITION=13, TYPE=X)
- V_PODATE (STRUCTURE=CHAR10, REFERENCE=X, PPOSITION=14, TYPE=X)
- V_BANFN (STRUCTURE=BANFN, REFERENCE=X, PPOSITION=15, TYPE=X)
- V_BADAT (STRUCTURE=BADAT, REFERENCE=X, PPOSITION=16, TYPE=X)
- WA_PLANT (STRUCTURE=T001W, REFERENCE=X, PPOSITION=17, TYPE=X)
- V_BSART (STRUCTURE=ESART, REFERENCE=X, PPOSITION=18, TYPE=X)
- V_FLAG (STRUCTURE=CHAR1, REFERENCE=X, PPOSITION=19, TYPE=X)
- V_FVAL (STRUCTURE=YMMQUANTITY, REFERENCE=X, PPOSITION=20, TYPE=X)
- V_FVAL1 (STRUCTURE=NETWR, REFERENCE=X, PPOSITION=21, TYPE=X)
- IV_REL_INDICATOR (STRUCTURE=FRGKE, REFERENCE=X, PPOSITION=22, TYPE=X)
- WA_VEND (STRUCTURE=ADRC, REFERENCE=X, PPOSITION=23, TYPE=X)
- V_BEDNR (STRUCTURE=BEDNR, REFERENCE=X, PPOSITION=24, TYPE=X)
- V_ZTERM (STRUCTURE=DZTERM, REFERENCE=X, PPOSITION=25, TYPE=X)
- V_TEXT1 (STRUCTURE=TEXT1_007S, REFERENCE=X, PPOSITION=26, TYPE=X)
- IS_HEADER (STRUCTURE=TLINE, REFERENCE=X, PPOSITION=27, OPTIONAL=X, TYPE=X)
- V_EBELN (STRUCTURE=EBELN, REFERENCE=X, PPOSITION=28, TYPE=X)
- LV_KWERT (STRUCTURE=KWERT, REFERENCE=X, PPOSITION=29, TYPE=X)
- LV_EINDT (STRUCTURE=CHAR10, REFERENCE=X, PPOSITION=30, TYPE=X)
- LS_KONV (STRUCTURE=KONV, REFERENCE=X, PPOSITION=31, OPTIONAL=X, TYPE=X)
- LV_OTH (STRUCTURE=KWERT, REFERENCE=X, PPOSITION=32, TYPE=X)
- ITEM_TEXT (STRUCTURE=TLINE, REFERENCE=X, PPOSITION=33, OPTIONAL=X, TYPE=X)
- LV_VTEXT (STRUCTURE=DZTERM_BEZ, REFERENCE=X, PPOSITION=34, TYPE=X)
- V1_KWERT (STRUCTURE=KWERT, REFERENCE=X, PPOSITION=35, TYPE=X)
- V2_KWERT (STRUCTURE=KWERT, REFERENCE=X, PPOSITION=36, TYPE=X)
- GV_INCO1 (STRUCTURE=INCO1, REFERENCE=X, PPOSITION=37, TYPE=X)
- GV_INCO2 (STRUCTURE=INCO2, REFERENCE=X, PPOSITION=38, TYPE=X)
- V_WAERS (STRUCTURE=WAERS, REFERENCE=X, PPOSITION=39, TYPE=X)
- V_NETPR (STRUCTURE=YMMQUANTITY, REFERENCE=X, PPOSITION=40, TYPE=X)
- V_NETWR (STRUCTURE=SNETWR, REFERENCE=X, PPOSITION=41, TYPE=X)
- V_LVALUE (STRUCTURE=NETWR, REFERENCE=X, PPOSITION=42, TYPE=X)
- LV_KWERT1 (STRUCTURE=KWERT, REFERENCE=X, PPOSITION=43, TYPE=X)
- V_EMAIL (STRUCTURE=AD_SMTPADR, REFERENCE=X, PPOSITION=44, TYPE=X)
- WA_T005T (STRUCTURE=T005T, REFERENCE=X, PPOSITION=45, TYPE=X)
- V_BUYERTELFX (STRUCTURE=T024-TELFX, REFERENCE=X, PPOSITION=46, TYPE=X)
- V_BUYEREMAIL (STRUCTURE=AD_SMTPADR, REFERENCE=X, PPOSITION=47, TYPE=X)
- V1_ZDOC (STRUCTURE=KWERT, REFERENCE=X, PPOSITION=48, TYPE=X)
- V1_ZFOB (STRUCTURE=KWERT, REFERENCE=X, PPOSITION=49, TYPE=X)
- V1_ZPK1 (STRUCTURE=KWERT, REFERENCE=X, PPOSITION=50, TYPE=X)
- LV_AIRSEA (STRUCTURE=CHAR3, REFERENCE=X, PPOSITION=51, TYPE=X)
- LV_DOWNTEXT (STRUCTURE=CHAR50, REFERENCE=X, PPOSITION=52, TYPE=X)
- LV_KTOKK (STRUCTURE=LFA1-KTOKK, REFERENCE=X, PPOSITION=53, TYPE=X)
- LV_DOLLARS (STRUCTURE=CHAR50, REFERENCE=X, PPOSITION=54, TYPE=X)
- LV_CENTS (STRUCTURE=CHAR50, REFERENCE=X, PPOSITION=55, TYPE=X)
- LV_KTEXT (STRUCTURE=KTEXT_CURT, REFERENCE=X, PPOSITION=56, TYPE=X)
- LV_LANDX50 (STRUCTURE=T005T-LANDX50, REFERENCE=X, PPOSITION=57, TYPE=X)
- LV_BEZEI (STRUCTURE=T005U-BEZEI, REFERENCE=X, PPOSITION=58, TYPE=X)
- LV_STR3 (STRUCTURE=STRING, REFERENCE=X, PPOSITION=59, TYPE=X)
- LV_STR6 (STRUCTURE=STRING, REFERENCE=X, PPOSITION=60, TYPE=X)
- LV_LIFNR (STRUCTURE=LIFNR, REFERENCE=X, PPOSITION=61, TYPE=X)
- LV_RESWK (STRUCTURE=RESWK, REFERENCE=X, PPOSITION=62, TYPE=X)
- V_BUYERTELE (STRUCTURE=T024-EKTEL, REFERENCE=X, PPOSITION=63, TYPE=X)
- G_ERNAME (STRUCTURE=EKKO-ERNAM, REFERENCE=X, PPOSITION=64, TYPE=X)
- GV_ORT02 (STRUCTURE=LFA1-ORT02, REFERENCE=X, PPOSITION=65, OPTIONAL=X, TYPE=X)
- GV_ISD (STRUCTURE=T005K-TELEFTO, REFERENCE=X, PPOSITION=66, OPTIONAL=X, TYPE=X)
- V_RSTATUS (STRUCTURE=CHAR1, REFERENCE=X, PPOSITION=67, OPTIONAL=X, TYPE=X)
- V_KWERT (STRUCTURE=KWERT, REFERENCE=X, PPOSITION=68, TYPE=X)
- V_POTEXT (STRUCTURE=CHAR1, PPOSITION=69, OPTIONAL=X, TYPE=X)
EXPORTING:
- DOCUMENT_OUTPUT_INFO (STRUCTURE=SSFCRESPD, PPOSITION=1, TYPE=X)
- JOB_OUTPUT_INFO (STRUCTURE=SSFCRESCL, PPOSITION=2, TYPE=X)
- JOB_OUTPUT_OPTIONS (STRUCTURE=SSFCRESOP, PPOSITION=3, TYPE=X)
TABLES:
- IT_EKPO (STRUCTURE=EKPO, REFERENCE=X, PPOSITION=1, TYPE=X)
- IT_ESLL (STRUCTURE=ESLL, REFERENCE=X, PPOSITION=2, TYPE=X)
- IT_EBAN (STRUCTURE=EBAN, REFERENCE=X, PPOSITION=3, TYPE=X)
CHANGING:
EXCEPTIONS:
- FORMATTING_ERROR (PPOSITION=1)
- INTERNAL_ERROR (PPOSITION=2)
- SEND_ERROR (PPOSITION=3)
- USER_CANCELED (PPOSITION=4)

### 2b. Custom types used by the interface (DDIC layout)
`YMMQUANTITY`: elementary type (P, length 8).

### 2c. Currency/quantity reference fields - resolve before building SFPREF
Every CURR/QUAN field found above, with its real DDIC reference field and
whether a top-level scalar already covers it. Read this before writing any
REFERENCE_FIELDS entry - do not infer a field's CURR/QUAN kind from anything
else (a client's rejected reference, a similar-sounding field name, ...) -
this table is the DDIC's own answer. See BUILD_ISSUES_LOG.md F50.
No CURR/QUAN fields found in this interface's custom table/structure types.

### 2d. Context build order - drag these, in this order, nothing else to decide
Once the empty interface/form baseline exists in SFP, drag each of these from
the Interface tree into the form's Context, in this order. Where a CURR/QUAN
field is involved, use the reference resolved in section 2c above - if 2c
already declared it in the interface's own Reference Fields, SAP fills it in
for you; only set it by hand if 2c reported a GAP.
1. V_COMPANY_NAME (import)
2. V_PONO (import)
3. V_DEPARTMNT (import)
4. V_BEDAT (import)
5. V_PODATE (import)
6. V_BANFN (import)
7. V_BADAT (import)
8. WA_PLANT (import)
9. V_BSART (import)
10. V_FLAG (import)
11. V_FVAL (import)
12. V_FVAL1 (import)
13. IV_REL_INDICATOR (import)
14. WA_VEND (import)
15. V_BEDNR (import)
16. V_ZTERM (import)
17. V_TEXT1 (import)
18. IS_HEADER (import)
19. V_EBELN (import)
20. LV_KWERT (import)
21. LV_EINDT (import)
22. LS_KONV (import)
23. LV_OTH (import)
24. ITEM_TEXT (import)
25. LV_VTEXT (import)
26. V1_KWERT (import)
27. V2_KWERT (import)
28. GV_INCO1 (import)
29. GV_INCO2 (import)
30. V_WAERS (import)
31. V_NETPR (import)
32. V_NETWR (import)
33. V_LVALUE (import)
34. LV_KWERT1 (import)
35. V_EMAIL (import)
36. WA_T005T (import)
37. V_BUYERTELFX (import)
38. V_BUYEREMAIL (import)
39. V1_ZDOC (import)
40. V1_ZFOB (import)
41. V1_ZPK1 (import)
42. LV_AIRSEA (import)
43. LV_DOWNTEXT (import)
44. LV_KTOKK (import)
45. LV_DOLLARS (import)
46. LV_CENTS (import)
47. LV_KTEXT (import)
48. LV_LANDX50 (import)
49. LV_BEZEI (import)
50. LV_STR3 (import)
51. LV_STR6 (import)
52. LV_LIFNR (import)
53. LV_RESWK (import)
54. V_BUYERTELE (import)
55. G_ERNAME (import)
56. GV_ORT02 (import)
57. GV_ISD (import)
58. V_RSTATUS (import)
59. V_KWERT (import)
60. V_POTEXT (import)
61. IT_EKPO (table - repeating node)
62. IT_ESLL (table - repeating node)
63. IT_EBAN (table - repeating node)

## 3. Driver program candidates (source + dependencies extracted)
Driver identity check (NACE/TNAPR PGNAM vs. the source-text scan below):
MISMATCH - NACE names `ZMMET_PO_DRIVER_RP`, but the source scan did NOT
find it (it exists as a program, so it most likely calls a wrapper routine
rather than SSF_FUNCTION_MODULE_NAME directly - read its source manually).
Treat this form's real driver as UNCONFIRMED until resolved with the
functional owner - do not silently pick the nearest candidate below.

Driver(s) named by NACE (authoritative - source extracted regardless of the scan):
- `ZMMET_PO_DRIVER_RP` (TNAPR-PGNAM)
  full source extracted to `C:\Users\veere\OneDrive\Desktop\n\driver_ZMMET_PO_DRIVER_RP.txt`
  included programs extracted (one level deep):
    ZMMET_PO_DRIVER_RP_DATA -> C:\Users\veere\OneDrive\Desktop\n\driver_ZMMET_PO_DRIVER_RP_DATA.txt
    ZMMET_PO_DRIVER_RP_FRMS -> C:\Users\veere\OneDrive\Desktop\n\driver_ZMMET_PO_DRIVER_RP_FRMS.txt
  dependent objects referenced (raw source lines - confirm each one):
      CALL FUNCTION 'ZABF_ISP_CONVERT_FRSTCHAR_TOUP'    " 'ISP_CONVERT_FIRSTCHARS_TOUPPER'    "#EC CI_USAGE_OK[2469385]
    INCLUDE zmmet_po_driver_rp_data.
    INCLUDE zmmet_po_driver_rp_frms.
Custom function module `ZABF_ISP_CONVERT_FRSTCHAR_TOUP` - interface:
IMPORTING:
- INPUT_STRING (STRUCTURE=C, PPOSITION=1, TYPE=X)
- SEPARATORS (STRUCTURE=C, DEFAULTVAL=' -.,;:', PPOSITION=2, OPTIONAL=X, TYPE=X)
EXPORTING:
- OUTPUT_STRING (STRUCTURE=C, PPOSITION=1, TYPE=X)
TABLES:
CHANGING:
EXCEPTIONS:

- `ZMMET_PO_DRIVER_RP_FRMS` (source-scan CANDIDATE - form name found near an SSF_FUNCTION_MODULE_NAME call; see the driver identity check above before trusting this. READ-ONLY: never modified - see docs/01_scope.md section 8)
  full source extracted to `C:\Users\veere\OneDrive\Desktop\n\driver_ZMMET_PO_DRIVER_RP_FRMS.txt`
  dependent objects referenced (raw source lines, driver + its includes - confirm each one):
      CALL FUNCTION 'ZABF_ISP_CONVERT_FRSTCHAR_TOUP'    " 'ISP_CONVERT_FIRSTCHARS_TOUPPER'    "#EC CI_USAGE_OK[2469385]

## 4. Output determination (NACE / TNAPR)
-
MANDT = 400
KSCHL = ZETO
NACHA = 1
KAPPL = EF
PGNAM = ZMMET_PO_DRIVER_RP
RONAM = ENTRY_NEU
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
SFORM = ZMMET_PO_SF
FORMTYPE = 1
SFORM2 =
FORMTYPE2 =
SFORM3 =
FORMTYPE3 =
SFORM4 =
FORMTYPE4 =
SFORM5 =
FORMTYPE5 =

### 4b. Usage evidence (NAST) - how much is this form really used?
EF/ZETO: total 26571, last 365 days 17, last 30 days 8, processed OK 158; first 2015-07-02, last 2026-10-08.

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
