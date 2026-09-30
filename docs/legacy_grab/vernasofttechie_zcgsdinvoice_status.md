# Migration Status — vernasofttechie-zcgsdinvoice

STATUS: open_for_concerns
UPDATED: 2026-09-30T13:26:26.684Z
WAITING_ON: engineer
NOTE: 
STOP: none
CLAIMED_BY: Window-1

---
## 2026-09-30T13:11:12.718Z — Queued
Migration submitted with 2 reference file(s).

## 2026-09-30T13:17:18.317Z — Picked up
Window-1 picked this migration up.

## 2026-09-30T13:20:42.000Z — Interface prepared
The form interface for ZCGSD_INVOICE has been prepared from your reference export and saved on this branch (`src/zcgsd_invoice_int.sfpi.xml`).
- 27 custom import parameters and 6 tables, read directly from the form's own definition (nothing guessed).
- 15 global data fields from the form's global definitions.
- Left out on purpose: the standard SSF envelope parameters (SAP recreates them itself), the exceptions and the context tree — these must be created inside SAP, not from a file.
- Note for later: the legacy analysis could not confirm which driver program prints this form (NACE says `ZCGSDINV002`, but its source doesn't call the form directly). Please confirm with the functional owner who runs this form in production.

## 2026-09-30T13:20:42.000Z — Action needed from you (SAP)
Please do these in SAP, in order:
1. In transaction SFP create the Adobe form interface **ZCGSD_INVOICE_INT** and form **ZCGSD_INVOICE_ADT** (package ZAB_ADOBE) with one simple static field — this is the safe empty starting point.
2. In abapGit, pull this branch (vernasofttechie-zcgsdinvoice) onto that interface so the parameters and global fields appear.
3. In the form Context, drag in the interface nodes, then check every quantity and amount field has a unit/currency reference (SAP will tell you if one is missing).
4. In abapGit do Stage, Commit and Push back to this same branch.

When it is done click "I've done this — confirm" below. If anything fails, use "Report a problem" and give the exact message.

## 2026-09-30T13:26:26.684Z — Problem reported
Getting these currency and quantity reference errors.. Please fix in the interface.. 

Form ZCGSD_INVOICE_ADT, Node KBETR
Reference field VBRK-WAERK of field GT_FINL-KBETR cannot be used here
Form ZCGSD_INVOICE_ADT, Node KAWRT
Reference field RV61A-AWEI1 of field GT_FINL-KAWRT cannot be used here
Form ZCGSD_INVOICE_ADT, Node NETWR
Reference field VBRK-WAERK of field GT_FINL-NETWR cannot be used here
Form ZCGSD_INVOICE_ADT, Node SUB_TOT
Reference field VBRK-WAERK of field GT_FINL-SUB_TOT cannot be used here
Form ZCGSD_INVOICE_ADT, Node VAT
Reference field VBRK-WAERK of field GT_FINL-VAT cannot be used here
Form ZCGSD_INVOICE_ADT, Node TOTAL
Reference field VBRK-WAERK of field GT_FINL-TOTAL cannot be used here
Form ZCGSD_INVOICE_ADT, Node FVAT
Reference field VBRK-WAERK of field GT_FINL-FVAT cannot be used here
Form ZCGSD_INVOICE_ADT, Node KWERT
Reference field VBRK-WAERK of field GT_FINL-KWERT cannot be used here
Form ZCGSD_INVOICE_ADT, Node FKIMG
Reference field VBRP-VRKME of field GT_INVOICE-FKIMG cannot be used here
Form ZCGSD_INVOICE_ADT, Node NETWR
Reference field VBRK-WAERK of field GT_INVOICE-NETWR cannot be used here
Form ZCGSD_INVOICE_ADT, Node MWSBP
Reference field VBRK-WAERK of field GT_INVOICE-MWSBP cannot be used here
Form ZCGSD_INVOICE_ADT, Node GROSS
Reference field VBRK-WAERK of field GT_INVOICE-GROSS cannot be used here
Form ZCGSD_INVOICE_ADT, Node KBETR
Reference field VBRK-WAERK of field GS_FINL-KBETR cannot be used here
Form ZCGSD_INVOICE_ADT, Node KAWRT
Reference field RV61A-AWEI1 of field GS_FINL-KAWRT cannot be used here
Form ZCGSD_INVOICE_ADT, Node NETWR
Reference field VBRK-WAERK of field GS_FINL-NETWR cannot be used here
Form ZCGSD_INVOICE_ADT, Node SUB_TOT
Reference field VBRK-WAERK of field GS_FINL-SUB_TOT cannot be used here
Form ZCGSD_INVOICE_ADT, Node VAT
Reference field VBRK-WAERK of field GS_FINL-VAT cannot be used here
Form ZCGSD_INVOICE_ADT, Node TOTAL
Reference field VBRK-WAERK of field GS_FINL-TOTAL cannot be used here
Form ZCGSD_INVOICE_ADT, Node FVAT
Reference field VBRK-WAERK of field GS_FINL-FVAT cannot be used here
Form ZCGSD_INVOICE_ADT, Node KWERT
Reference field VBRK-WAERK of field GS_FINL-KWERT cannot be used here
Form ZCGSD_INVOICE_ADT, Node FKIMG
Reference field VBRP-VRKME of field GS_INVOICE-FKIMG cannot be used here
Form ZCGSD_INVOICE_ADT, Node NETWR
Reference field VBRK-WAERK of field GS_INVOICE-NETWR cannot be used here
Form ZCGSD_INVOICE_ADT, Node MWSBP
Reference field VBRK-WAERK of field GS_INVOICE-MWSBP cannot be used here
Form ZCGSD_INVOICE_ADT, Node GROSS
Reference field VBRK-WAERK of field GS_INVOICE-GROSS cannot be used here
Form ZCGSD_INVOICE_ADT, Node FKIMG
Reference field VBRP-VRKME of field LT_INVOICE-FKIMG cannot be used here
Form ZCGSD_INVOICE_ADT, Node NETWR
Reference field VBRK-WAERK of field LT_INVOICE-NETWR cannot be used here
Form ZCGSD_INVOICE_ADT, Node MWSBP
Reference field VBRK-WAERK of field LT_INVOICE-MWSBP cannot be used here
Form ZCGSD_INVOICE_ADT, Node GROSS
Reference field VBRK-WAERK of field LT_INVOICE-GROSS cannot be used here
