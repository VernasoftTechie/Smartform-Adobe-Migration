# Legacy Grab - YMMSLGRNNOTE

Generated 2026-11-25 19:14:07 by ZSF2AF_R_LEGACY_GRAB (Bolt with Fiori port ZCL_AB_BOLT_LEGACY_GRAB, system DCD client 400).

## 1. Generated function module
`/1BCDWB/SF00000126`

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
- LS_MKPF (STRUCTURE=MKPF, REFERENCE=X, PPOSITION=10, TYPE=X)
- LS_MSEG (STRUCTURE=ZEXTRA_FIELD, REFERENCE=X, PPOSITION=11, TYPE=X)
- LS_ADRC (STRUCTURE=ADRC, REFERENCE=X, PPOSITION=12, OPTIONAL=X, TYPE=X)
- LS_T001W (STRUCTURE=T001W, REFERENCE=X, PPOSITION=13, TYPE=X)
- LS_T001 (STRUCTURE=T001, REFERENCE=X, PPOSITION=14, OPTIONAL=X, TYPE=X)
- LS_EBAN (STRUCTURE=EBAN, REFERENCE=X, PPOSITION=15, TYPE=X)
- LS_EKKO (STRUCTURE=EKKO, REFERENCE=X, PPOSITION=16, TYPE=X)
- LV_MAKTX (STRUCTURE=MAKTX, REFERENCE=X, PPOSITION=17, TYPE=X)
- LS_LFA1 (STRUCTURE=LFA1, REFERENCE=X, PPOSITION=18, TYPE=X)
- IV_WAERS (STRUCTURE=WAERS, REFERENCE=X, PPOSITION=19, OPTIONAL=X, TYPE=X)
- IV_KURSF (STRUCTURE=BAPICURR_D, REFERENCE=X, PPOSITION=20, OPTIONAL=X, TYPE=X)
EXPORTING:
- DOCUMENT_OUTPUT_INFO (STRUCTURE=SSFCRESPD, PPOSITION=1, TYPE=X)
- JOB_OUTPUT_INFO (STRUCTURE=SSFCRESCL, PPOSITION=2, TYPE=X)
- JOB_OUTPUT_OPTIONS (STRUCTURE=SSFCRESOP, PPOSITION=3, TYPE=X)
TABLES:
- LT_MSEG (STRUCTURE=ZEXTRA_FIELD, REFERENCE=X, PPOSITION=1, TYPE=X)
CHANGING:
EXCEPTIONS:
- FORMATTING_ERROR (PPOSITION=1)
- INTERNAL_ERROR (PPOSITION=2)
- SEND_ERROR (PPOSITION=3)
- USER_CANCELED (PPOSITION=4)

### 2b. Custom types used by the interface (DDIC layout)
`ZEXTRA_FIELD` - 235 field(s):
- MANDT (element MANDT, type CLNT, length 000003, decimals 000000)
- MBLNR (element MBLNR, type CHAR, length 000010, decimals 000000)
- MJAHR (element MJAHR, type NUMC, length 000004, decimals 000000)
- ZEILE (element MBLPO, type NUMC, length 000004, decimals 000000)
- LINE_ID (element MB_LINE_ID, type NUMC, length 000006, decimals 000000)
- PARENT_ID (element MB_PARENT_ID, type NUMC, length 000006, decimals 000000)
- LINE_DEPTH (element MB_LINE_DEPTH, type NUMC, length 000002, decimals 000000)
- MAA_URZEI (element MAA_URZEI, type NUMC, length 000004, decimals 000000)
- BWART (element BWART, type CHAR, length 000003, decimals 000000)
- XAUTO (element MB_XAUTO, type CHAR, length 000001, decimals 000000)
- MATNR (element MATNR, type CHAR, length 000040, decimals 000000)
- WERKS (element WERKS_D, type CHAR, length 000004, decimals 000000)
- LGORT (element LGORT_D, type CHAR, length 000004, decimals 000000)
- CHARG (element CHARG_D, type CHAR, length 000010, decimals 000000)
- INSMK (element MB_INSMK, type CHAR, length 000001, decimals 000000)
- ZUSCH (element DZUSCH, type CHAR, length 000001, decimals 000000)
- ZUSTD (element DZUSTD, type CHAR, length 000001, decimals 000000)
- SOBKZ (element SOBKZ, type CHAR, length 000001, decimals 000000)
- LIFNR (element ELIFN, type CHAR, length 000010, decimals 000000)
- KUNNR (element EKUNN, type CHAR, length 000010, decimals 000000)
- KDAUF (element KDAUF, type CHAR, length 000010, decimals 000000)
- KDPOS (element KDPOS, type NUMC, length 000006, decimals 000000)
- KDEIN (element KDEIN, type NUMC, length 000004, decimals 000000)
- PLPLA (element PLPLA, type CHAR, length 000010, decimals 000000)
- SHKZG (element SHKZG, type CHAR, length 000001, decimals 000000)
- WAERS (element WAERS, type CUKY, length 000005, decimals 000000)
- DMBTR (element DMBTR_CS, type CURR, length 000013, decimals 000002)
- BNBTR (element BNBTR, type CURR, length 000013, decimals 000002)
- BUALT (element BUALT, type CURR, length 000013, decimals 000002)
- SHKUM (element SHKUM, type CHAR, length 000001, decimals 000000)
- DMBUM (element DMBUM, type CURR, length 000013, decimals 000002)
- BWTAR (element BWTAR_D, type CHAR, length 000010, decimals 000000)
- MENGE (element MENGE_D, type QUAN, length 000013, decimals 000003)
- MEINS (element MEINS, type UNIT, length 000003, decimals 000000)
- ERFMG (element ERFMG, type QUAN, length 000013, decimals 000003)
- ERFME (element ERFME, type UNIT, length 000003, decimals 000000)
- BPMNG (element BPMNG, type QUAN, length 000013, decimals 000003)
- BPRME (element BBPRM, type UNIT, length 000003, decimals 000000)
- EBELN (element BSTNR, type CHAR, length 000010, decimals 000000)
- EBELP (element EBELP, type NUMC, length 000005, decimals 000000)
- LFBJA (element LFBJA, type NUMC, length 000004, decimals 000000)
- LFBNR (element LFBNR, type CHAR, length 000010, decimals 000000)
- LFPOS (element LFPOS, type NUMC, length 000004, decimals 000000)
- SJAHR (element MJAHR, type NUMC, length 000004, decimals 000000)
- SMBLN (element MBLNR, type CHAR, length 000010, decimals 000000)
- SMBLP (element MBLPO, type NUMC, length 000004, decimals 000000)
- ELIKZ (element ELIKZ, type CHAR, length 000001, decimals 000000)
- SGTXT (element SGTXT, type CHAR, length 000050, decimals 000000)
- EQUNR (element EQUNR, type CHAR, length 000018, decimals 000000)
- WEMPF (element WEMPF, type CHAR, length 000012, decimals 000000)
- ABLAD (element ABLAD, type CHAR, length 000025, decimals 000000)
- GSBER (element GSBER, type CHAR, length 000004, decimals 000000)
- KOKRS (element KOKRS, type CHAR, length 000004, decimals 000000)
- PARGB (element PARGB, type CHAR, length 000004, decimals 000000)
- PARBU (element PARBU, type CHAR, length 000004, decimals 000000)
- KOSTL (element KOSTL, type CHAR, length 000010, decimals 000000)
- PROJN (element PROJN, type CHAR, length 000016, decimals 000000)
- AUFNR (element AUFNR, type CHAR, length 000012, decimals 000000)
- ANLN1 (element ANLN1, type CHAR, length 000012, decimals 000000)
- ANLN2 (element ANLN2, type CHAR, length 000004, decimals 000000)
- XSKST (element XSKST, type CHAR, length 000001, decimals 000000)
- XSAUF (element XSAUF, type CHAR, length 000001, decimals 000000)
- XSPRO (element XSPRO, type CHAR, length 000001, decimals 000000)
- XSERG (element XSERG, type CHAR, length 000001, decimals 000000)
- GJAHR (element GJAHR, type NUMC, length 000004, decimals 000000)
- XRUEM (element XRUEM, type CHAR, length 000001, decimals 000000)
- XRUEJ (element XRUEJ, type CHAR, length 000001, decimals 000000)
- BUKRS (element BUKRS, type CHAR, length 000004, decimals 000000)
- BELNR (element BELNR_D, type CHAR, length 000010, decimals 000000)
- BUZEI (element BUZEI, type NUMC, length 000003, decimals 000000)
- BELUM (element BELNR_D, type CHAR, length 000010, decimals 000000)
- BUZUM (element BUZEI, type NUMC, length 000003, decimals 000000)
- RSNUM (element RSNUM, type NUMC, length 000010, decimals 000000)
- RSPOS (element RSPOS, type NUMC, length 000004, decimals 000000)
- KZEAR (element KZEAR, type CHAR, length 000001, decimals 000000)
- PBAMG (element MENGE_D, type QUAN, length 000013, decimals 000003)
- KZSTR (element KZSTR, type CHAR, length 000001, decimals 000000)
- UMMAT (element UMMAT, type CHAR, length 000040, decimals 000000)
- UMWRK (element UMWRK, type CHAR, length 000004, decimals 000000)
- UMLGO (element UMLGO, type CHAR, length 000004, decimals 000000)
- UMCHA (element UMCHA, type CHAR, length 000010, decimals 000000)
- UMZST (element UMZST, type CHAR, length 000001, decimals 000000)
- UMZUS (element UMZUS, type CHAR, length 000001, decimals 000000)
- UMBAR (element UMBAR, type CHAR, length 000010, decimals 000000)
- UMSOK (element UMSOK, type CHAR, length 000001, decimals 000000)
- KZBEW (element KZBEW, type CHAR, length 000001, decimals 000000)
- KZVBR (element KZVBR, type CHAR, length 000001, decimals 000000)
- KZZUG (element KZZUG, type CHAR, length 000001, decimals 000000)
- WEUNB (element WEUNB, type CHAR, length 000001, decimals 000000)
- PALAN (element PALAN, type DEC, length 000011, decimals 000000)
- LGNUM (element LGNUM, type CHAR, length 000003, decimals 000000)
- LGTYP (element LGTYP, type CHAR, length 000003, decimals 000000)
- LGPLA (element LGPLA, type CHAR, length 000010, decimals 000000)
- BESTQ (element BESTQ, type CHAR, length 000001, decimals 000000)
- BWLVS (element BWLVS, type NUMC, length 000003, decimals 000000)
- TBNUM (element TBNUM, type NUMC, length 000010, decimals 000000)
- TBPOS (element TBPOS, type NUMC, length 000004, decimals 000000)
- XBLVS (element XBLVS, type CHAR, length 000001, decimals 000000)
- VSCHN (element T333_VSCHN, type CHAR, length 000001, decimals 000000)
- NSCHN (element T333_NSCHN, type CHAR, length 000001, decimals 000000)
- DYPLA (element DYPLA, type CHAR, length 000001, decimals 000000)
- UBNUM (element UBNUM, type NUMC, length 000010, decimals 000000)
- TBPRI (element TBPRI, type CHAR, length 000001, decimals 000000)
- TANUM (element TANUM, type NUMC, length 000010, decimals 000000)
- WEANZ (element WEANZ, type NUMC, length 000003, decimals 000000)
- GRUND (element MB_GRBEW, type NUMC, length 000004, decimals 000000)
- EVERS (element EVERS, type CHAR, length 000002, decimals 000000)
- EVERE (element EVERE, type CHAR, length 000002, decimals 000000)
- IMKEY (element IMKEY, type CHAR, length 000008, decimals 000000)
- KSTRG (element KSTRG, type CHAR, length 000012, decimals 000000)
- PAOBJNR (element RKEOBJNR, type CHAR, length 000010, decimals 000000)
- PRCTR (element PRCTR, type CHAR, length 000010, decimals 000000)
- PS_PSP_PNR (element PS_PSP_PNR, type NUMC, length 000008, decimals 000000)
- NPLNR (element NPLNR, type CHAR, length 000012, decimals 000000)
- AUFPL (element CO_AUFPL, type NUMC, length 000010, decimals 000000)
- APLZL (element CIM_COUNT, type NUMC, length 000008, decimals 000000)
- AUFPS (element CO_POSNR, type NUMC, length 000004, decimals 000000)
- VPTNR (element JV_PART, type CHAR, length 000010, decimals 000000)
- FIPOS (element FIPOS, type CHAR, length 000014, decimals 000000)
- SAKTO (element SAKNR, type CHAR, length 000010, decimals 000000)
- BSTMG (element MB_BSTMG, type QUAN, length 000013, decimals 000003)
- BSTME (element BSTME, type UNIT, length 000003, decimals 000000)
- XWSBR (element XWSBR, type CHAR, length 000001, decimals 000000)
- EMLIF (element EMLIF, type CHAR, length 000010, decimals 000000)
- DUMMY_INCL_EEW_COBL (element CFD_DUMMY, type CHAR, length 000001, decimals 000000)
- EXBWR (element EXBWR, type CURR, length 000013, decimals 000002)
- VKWRT (element VKWRT, type CURR, length 000013, decimals 000002)
- AKTNR (element WAKTION, type CHAR, length 000010, decimals 000000)
- ZEKKN (element DZEKKN, type NUMC, length 000002, decimals 000000)
- VFDAT (element VFDAT, type DATS, length 000008, decimals 000000)
- CUOBJ_CH (element CUOBJ_CH, type NUMC, length 000018, decimals 000000)
- EXVKW (element EXVKW, type CURR, length 000013, decimals 000002)
- PPRCTR (element PPRCTR, type CHAR, length 000010, decimals 000000)
- RSART (element RSART, type CHAR, length 000001, decimals 000000)
- GEBER (element BP_GEBER, type CHAR, length 000010, decimals 000000)
- FISTL (element FISTL, type CHAR, length 000016, decimals 000000)
- MATBF (element MATBF, type CHAR, length 000040, decimals 000000)
- UMMAB (element UMMAT, type CHAR, length 000040, decimals 000000)
- BUSTM (element BUSTM, type CHAR, length 000004, decimals 000000)
- BUSTW (element BUSTW, type CHAR, length 000004, decimals 000000)
- MENGU (element MENGU, type CHAR, length 000001, decimals 000000)
- WERTU (element WERTU, type CHAR, length 000001, decimals 000000)
- LBKUM (element LBKUM_MSEG, type QUAN, length 000013, decimals 000003)
- SALK3 (element SALK3_MSEG, type CURR, length 000013, decimals 000002)
- VPRSV (element VPRSV, type CHAR, length 000001, decimals 000000)
- FKBER (element FKBER, type CHAR, length 000016, decimals 000000)
- DABRBZ (element DABRBEZ, type DATS, length 000008, decimals 000000)
- VKWRA (element VKWRA, type CURR, length 000013, decimals 000002)
- DABRZ (element DABRBEZ, type DATS, length 000008, decimals 000000)
- XBEAU (element XBEAU, type CHAR, length 000001, decimals 000000)
- LSMNG (element LSMNG, type QUAN, length 000013, decimals 000003)
- LSMEH (element LSMEH, type UNIT, length 000003, decimals 000000)
- KZBWS (element KZBWS, type CHAR, length 000001, decimals 000000)
- QINSPST (element QINSPST, type CHAR, length 000001, decimals 000000)
- URZEI (element URZEI, type NUMC, length 000004, decimals 000000)
- J_1BEXBASE (element J_1BEXBASE, type CURR, length 000013, decimals 000002)
- MWSKZ (element MWSKZ, type CHAR, length 000002, decimals 000000)
- TXJCD (element TXJCD, type CHAR, length 000015, decimals 000000)
- EMATN (element EMATN, type CHAR, length 000040, decimals 000000)
- J_1AGIRUPD (element J_1AGIRUPD, type CHAR, length 000001, decimals 000000)
- VKMWS (element MWSKZ, type CHAR, length 000002, decimals 000000)
- HSDAT (element HSDAT, type DATS, length 000008, decimals 000000)
- BERKZ (element BERKZ, type CHAR, length 000001, decimals 000000)
- MAT_KDAUF (element MAT_KDAUF, type CHAR, length 000010, decimals 000000)
- MAT_KDPOS (element MAT_KDPOS, type NUMC, length 000006, decimals 000000)
- MAT_PSPNR (element MAT_PSPNR, type NUMC, length 000008, decimals 000000)
- XWOFF (element XWOFF, type CHAR, length 000001, decimals 000000)
- BEMOT (element BEMOT, type CHAR, length 000002, decimals 000000)
- PRZNR (element CO_PRZNR, type CHAR, length 000012, decimals 000000)
- LLIEF (element LLIEF, type CHAR, length 000010, decimals 000000)
- LSTAR (element LSTAR, type CHAR, length 000006, decimals 000000)
- XOBEW (element XOBEW, type CHAR, length 000001, decimals 000000)
- GRANT_NBR (element GM_GRANT_NBR, type CHAR, length 000020, decimals 000000)
- ZUSTD_T156M (element BAMOK_MSEG, type CHAR, length 000001, decimals 000000)
- SPE_GTS_STOCK_TY (element /SPE/GTS_STOCK_TYPE, type CHAR, length 000001, decimals 000000)
- KBLNR (element KBLNR_FI, type CHAR, length 000010, decimals 000000)
- KBLPOS (element KBLPOS, type NUMC, length 000003, decimals 000000)
- XMACC (element XMACC, type CHAR, length 000001, decimals 000000)
- VGART_MKPF (element VGART, type CHAR, length 000002, decimals 000000)
- BUDAT_MKPF (element BUDAT, type DATS, length 000008, decimals 000000)
- CPUDT_MKPF (element CPUDT, type DATS, length 000008, decimals 000000)
- CPUTM_MKPF (element CPUTM, type TIMS, length 000006, decimals 000000)
- USNAM_MKPF (element USNAM, type CHAR, length 000012, decimals 000000)
- XBLNR_MKPF (element XBLNR1, type CHAR, length 000016, decimals 000000)
- TCODE2_MKPF (element TCODE, type CHAR, length 000020, decimals 000000)
- VBELN_IM (element VBELN_VL, type CHAR, length 000010, decimals 000000)
- VBELP_IM (element POSNR_VL, type NUMC, length 000006, decimals 000000)
- SGT_SCAT (element SGT_SCAT, type CHAR, length 000040, decimals 000000)
- SGT_UMSCAT (element SGT_UMSCAT, type CHAR, length 000040, decimals 000000)
- SGT_RCAT (element SGT_RCAT, type CHAR, length 000040, decimals 000000)
- SERVICEPERFORMER (element SERVICEPERFORMER, type CHAR, length 000010, decimals 000000)
- PERNR (element PERNR_D, type NUMC, length 000008, decimals 000000)
- KNTTP_GR (element KNTTP, type CHAR, length 000001, decimals 000000)
- WORK_ITEM_ID (element /CPD/PFP_WORKITEM_ID, type CHAR, length 000010, decimals 000000)
- FBUDA (element FBUDA, type DATS, length 000008, decimals 000000)
- XPRINT (element XNAPR, type CHAR, length 000001, decimals 000000)
- NROFLABELS (element NUMBEROFLABELSTOBEPRINTED, type NUMC, length 000004, decimals 000000)
- /CWM/MENGE (element /CWM/MENGE, type QUAN, length 000013, decimals 000003)
- /CWM/MEINS (element /CWM/MEINS, type UNIT, length 000003, decimals 000000)
- /CWM/ERFMG (element /CWM/ERFMG, type QUAN, length 000013, decimals 000003)
- /CWM/ERFME (element /CWM/ERFME, type UNIT, length 000003, decimals 000000)
- SERVICE_DOC_TYPE (element FCO_SRVDOC_TYPE, type CHAR, length 000004, decimals 000000)
- SERVICE_DOC_ID (element FCO_SRVDOC_ID, type CHAR, length 000010, decimals 000000)
- SERVICE_DOC_ITEM_ID (element FCO_SRVDOC_ITEM_ID, type NUMC, length 000006, decimals 000000)
- EWM_LGNUM (element /SCWM/LGNUM, type CHAR, length 000004, decimals 000000)
- EWM_GMDOC (element /SCWM/DE_GM_DOC, type NUMC, length 000012, decimals 000000)
- RESOURCENAME_SID (element NSDM_RESOURCENAME_SID, type CHAR, length 000040, decimals 000000)
- RESOURCENAME_CID (element NSDM_RESOURCENAME_CID, type CHAR, length 000040, decimals 000000)
- DUMMY_MATDOC_INCL_EEW_PS (element CFD_DUMMY, type CHAR, length 000001, decimals 000000)
- DISUB_OWNER (element OWNER_D, type CHAR, length 000010, decimals 000000)
- FSH_SEASON_YEAR (element FSH_SAISJ, type CHAR, length 000004, decimals 000000)
- FSH_SEASON (element FSH_SAISO, type CHAR, length 000010, decimals 000000)
- FSH_COLLECTION (element FSH_COLLECTION, type CHAR, length 000010, decimals 000000)
- FSH_THEME (element FSH_THEME, type CHAR, length 000010, decimals 000000)
- FSH_UMSEA_YR (element FSH_UMSEA_YR, type CHAR, length 000004, decimals 000000)
- FSH_UMSEA (element FSH_UMSEA, type CHAR, length 000010, decimals 000000)
- FSH_UMCOLL (element FSH_UMCOLL, type CHAR, length 000010, decimals 000000)
- FSH_UMTHEME (element FSH_UMTHEME, type CHAR, length 000010, decimals 000000)
- SGT_CHINT (element SGT_CHINT, type CHAR, length 000001, decimals 000000)
- COMPL_MARK (element COMPL_MARK, type CHAR, length 000001, decimals 000000)
- FZGLS_MARK (element FZGLS, type CHAR, length 000001, decimals 000000)
- ETANP_MARK (element ETANP, type CHAR, length 000001, decimals 000000)
- POPUP_MARK (element POPUP, type CHAR, length 000001, decimals 000000)
- OINAVNW (element NAVNW, type CURR, length 000013, decimals 000002)
- OICONDCOD (element JV_CONDCOD, type CHAR, length 000002, decimals 000000)
- CONDI (element JV_CONDCOD, type CHAR, length 000002, decimals 000000)
- WRF_CHARSTC1 (element WRF_CHARSTC1, type CHAR, length 000018, decimals 000000)
- WRF_CHARSTC2 (element WRF_CHARSTC2, type CHAR, length 000018, decimals 000000)
- WRF_CHARSTC3 (element WRF_CHARSTC3, type CHAR, length 000018, decimals 000000)
- VAT (element KWERT, type CURR, length 000013, decimals 000002)
- FRI (element KWERT, type CURR, length 000013, decimals 000002)
- OTH (element KWERT, type CURR, length 000013, decimals 000002)
- DIS (element KWERT, type CURR, length 000013, decimals 000002)
- LV_URATE (element ZLV_URATE, type CURR, length 000023, decimals 000004)
- PEINH (element PEINH, type DEC, length 000005, decimals 000000)

### 2c. Currency/quantity reference fields - resolve before building SFPREF
Every CURR/QUAN field found above, with its real DDIC reference field and
whether a top-level scalar already covers it. Read this before writing any
REFERENCE_FIELDS entry - do not infer a field's CURR/QUAN kind from anything
else (a client's rejected reference, a similar-sounding field name, ...) -
this table is the DDIC's own answer. See BUILD_ISSUES_LOG.md F50.
Field | reference needed | resolution
---|---|---
`ZEXTRA_FIELD-DMBTR` (CURR) CUKY (currency key) GAP - no CUKY (currency key) scalar found in this interface; add one (e.g. a global typed WAERK)
`ZEXTRA_FIELD-BNBTR` (CURR) CUKY (currency key) GAP - no CUKY (currency key) scalar found in this interface; add one (e.g. a global typed WAERK)
`ZEXTRA_FIELD-BUALT` (CURR) CUKY (currency key) GAP - no CUKY (currency key) scalar found in this interface; add one (e.g. a global typed WAERK)
`ZEXTRA_FIELD-DMBUM` (CURR) CUKY (currency key) GAP - no CUKY (currency key) scalar found in this interface; add one (e.g. a global typed WAERK)
`ZEXTRA_FIELD-MENGE` (QUAN) UNIT (unit of measure) GAP - no UNIT (unit of measure) scalar found in this interface; add one (e.g. a global typed MEINS)
`ZEXTRA_FIELD-ERFMG` (QUAN) UNIT (unit of measure) GAP - no UNIT (unit of measure) scalar found in this interface; add one (e.g. a global typed MEINS)
`ZEXTRA_FIELD-BPMNG` (QUAN) UNIT (unit of measure) GAP - no UNIT (unit of measure) scalar found in this interface; add one (e.g. a global typed MEINS)
`ZEXTRA_FIELD-PBAMG` (QUAN) UNIT (unit of measure) GAP - no UNIT (unit of measure) scalar found in this interface; add one (e.g. a global typed MEINS)
`ZEXTRA_FIELD-BSTMG` (QUAN) UNIT (unit of measure) GAP - no UNIT (unit of measure) scalar found in this interface; add one (e.g. a global typed MEINS)
`ZEXTRA_FIELD-EXBWR` (CURR) CUKY (currency key) GAP - no CUKY (currency key) scalar found in this interface; add one (e.g. a global typed WAERK)
`ZEXTRA_FIELD-VKWRT` (CURR) CUKY (currency key) GAP - no CUKY (currency key) scalar found in this interface; add one (e.g. a global typed WAERK)
`ZEXTRA_FIELD-EXVKW` (CURR) CUKY (currency key) GAP - no CUKY (currency key) scalar found in this interface; add one (e.g. a global typed WAERK)
`ZEXTRA_FIELD-LBKUM` (QUAN) UNIT (unit of measure) GAP - no UNIT (unit of measure) scalar found in this interface; add one (e.g. a global typed MEINS)
`ZEXTRA_FIELD-SALK3` (CURR) CUKY (currency key) GAP - no CUKY (currency key) scalar found in this interface; add one (e.g. a global typed WAERK)
`ZEXTRA_FIELD-VKWRA` (CURR) CUKY (currency key) GAP - no CUKY (currency key) scalar found in this interface; add one (e.g. a global typed WAERK)
`ZEXTRA_FIELD-LSMNG` (QUAN) UNIT (unit of measure) GAP - no UNIT (unit of measure) scalar found in this interface; add one (e.g. a global typed MEINS)
`ZEXTRA_FIELD-J_1BEXBASE` (CURR) CUKY (currency key) GAP - no CUKY (currency key) scalar found in this interface; add one (e.g. a global typed WAERK)
`ZEXTRA_FIELD-/CWM/MENGE` (QUAN) UNIT (unit of measure) GAP - no UNIT (unit of measure) scalar found in this interface; add one (e.g. a global typed MEINS)
`ZEXTRA_FIELD-/CWM/ERFMG` (QUAN) UNIT (unit of measure) GAP - no UNIT (unit of measure) scalar found in this interface; add one (e.g. a global typed MEINS)
`ZEXTRA_FIELD-OINAVNW` (CURR) CUKY (currency key) GAP - no CUKY (currency key) scalar found in this interface; add one (e.g. a global typed WAERK)
`ZEXTRA_FIELD-VAT` (CURR) CUKY (currency key) GAP - no CUKY (currency key) scalar found in this interface; add one (e.g. a global typed WAERK)
`ZEXTRA_FIELD-FRI` (CURR) CUKY (currency key) GAP - no CUKY (currency key) scalar found in this interface; add one (e.g. a global typed WAERK)
`ZEXTRA_FIELD-OTH` (CURR) CUKY (currency key) GAP - no CUKY (currency key) scalar found in this interface; add one (e.g. a global typed WAERK)
`ZEXTRA_FIELD-DIS` (CURR) CUKY (currency key) GAP - no CUKY (currency key) scalar found in this interface; add one (e.g. a global typed WAERK)
`ZEXTRA_FIELD-LV_URATE` (CURR) CUKY (currency key) GAP - no CUKY (currency key) scalar found in this interface; add one (e.g. a global typed WAERK)

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
1. LS_MKPF (import)
2. LS_MSEG (import)
3. LS_ADRC (import)
4. LS_T001W (import)
5. LS_T001 (import)
6. LS_EBAN (import)
7. LS_EKKO (import)
8. LV_MAKTX (import)
9. LS_LFA1 (import)
10. IV_WAERS (import)
11. IV_KURSF (import)
12. LT_MSEG (table - repeating node)

### 2e. Context node shapes - real DDIC shape + field list for each
Per S04 (confirmed 2026-10-01): CL_FP_DATA (scalar), CL_FP_STRUCTURE and
CL_FP_LOOP/CL_FP_LOOP_DATA (table) are all hand-authorable. This is the real
shape and, for a structure/table, the real field list each parameter in 2d
needs - read from RTTI on the real TYPENAME, not from FUPARAREF's PARAMTYPE
(a calling-convention flag, not a DDIC kind - a table-typed field can sit
under PARAMTYPE='I' same as a scalar) and never a guessed field name.
LS_MKPF - TYPENAME not found; confirm shape manually in SFP
LS_MSEG - TYPENAME not found; confirm shape manually in SFP
LS_ADRC - TYPENAME not found; confirm shape manually in SFP
LS_T001W - TYPENAME not found; confirm shape manually in SFP
LS_T001 - TYPENAME not found; confirm shape manually in SFP
LS_EBAN - TYPENAME not found; confirm shape manually in SFP
LS_EKKO - TYPENAME not found; confirm shape manually in SFP
LV_MAKTX - TYPENAME not found; confirm shape manually in SFP
LS_LFA1 - TYPENAME not found; confirm shape manually in SFP
IV_WAERS - TYPENAME not found; confirm shape manually in SFP
IV_KURSF - TYPENAME not found; confirm shape manually in SFP
LT_MSEG - TYPENAME not found; confirm shape manually in SFP

## 3. Driver program candidates (source + dependencies extracted)
Driver identity check (NACE/TNAPR PGNAM vs. the source-text scan below):
MISMATCH - NACE names `YSLSAPM07DR_GRN`, but the source scan did NOT
find it (it exists as a program, so it most likely calls a wrapper routine
rather than SSF_FUNCTION_MODULE_NAME directly - read its source manually).
Treat this form's real driver as UNCONFIRMED until resolved with the
functional owner - do not silently pick the nearest candidate below.

Driver(s) named by NACE (authoritative - source extracted regardless of the scan):
- `YSLSAPM07DR_GRN` (TNAPR-PGNAM)
  full source extracted to `driver_YSLSAPM07DR_GRN.txt`

- `YSN_YM07DRAUS` (source-scan CANDIDATE - form name found near an SSF_FUNCTION_MODULE_NAME call; see the driver identity check above before trusting this. READ-ONLY: never modified - see docs/01_scope.md section 8)
  full source extracted to `driver_YSN_YM07DRAUS.txt`
  no other Z*/Y* object references found by the dependency scan

## 4. Output determination (NACE / TNAPR)
-
MANDT = 400
KSCHL = ZE01
NACHA = 1
KAPPL = ME
PGNAM = YSLSAPM07DR_GRN
RONAM = ENTRY_WA01
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
SFORM = YMMSLGRNNOTE
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
ME/ZE01: total 526593, last 365 days 2, last 30 days 0, processed OK 18438; first 2014-06-28, last 2026-07-02.

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
