# Migration Status — vernasofttechie-zcgsdinvoice

STATUS: waiting_manual
UPDATED: 2026-09-30T13:20:42.000Z
WAITING_ON: operator
NOTE: Create the empty interface/form in SFP with the correct names, pull this branch in abapGit, build Context + unit/currency references, then Stage-Commit-Push back.
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
