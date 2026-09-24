# Migration Status — vernasofttechie-zcgsdinvoice

STATUS: waiting_manual
UPDATED: 2026-09-24T07:14:07.127Z
WAITING_ON: operator
NOTE: SAP steps: create the SFP form/interface with one static field, abapGit-pull this branch onto it, build Context and unit/currency references, then abapGit Stage-Commit-Push back to this branch. Then confirm here.
STOP: none
CLAIMED_BY: Window-1

---
## 2026-09-24T05:57:25.042Z — Queued
Migration submitted with 2 reference file(s).

## 2026-09-24T05:59:30.505Z — Picked up
Window-1 picked this migration up.

## 2026-09-24T07:14:07.125Z — Interface prepared
The form interface for ZCGSD_INVOICE has been prepared from your reference export and saved on this branch (src/vernasofttechie_zcgsdinvoice_int.sfpi.xml, commit 1599cae).
- 27 custom import parameters and 6 tables, read directly from the form's own definition (nothing guessed).
- 15 global data fields from the form's global definitions.
- Left out on purpose: the standard SSF envelope parameters (SAP recreates them itself), the exceptions and the context tree - these must be created inside SAP, not from a file.
- Note for later: the legacy analysis could not confirm which driver program prints this form (NACE says ZCGSDINV002, but its source doesn't call the form directly). Please confirm with the functional owner who runs this form in production.

## 2026-09-24T07:14:07.125Z — Action needed from you (SAP)
Please do these in SAP, in order:
1. In transaction SFP create the Adobe form interface and form for ZCGSD_INVOICE with one simple static field (this is the safe empty starting point).
2. In abapGit, pull this branch (vernasofttechie-zcgsdinvoice) onto that interface so the parameters and global fields appear.
3. In the form Context, drag in the interface nodes, then check every quantity and amount field has a unit/currency reference (SAP will tell you if one is missing).
4. In abapGit do Stage, Commit and Push back to this same branch.
When it is done click 'I've done this - confirm' below. If anything fails, use 'Report a problem' and tell me the exact message.
