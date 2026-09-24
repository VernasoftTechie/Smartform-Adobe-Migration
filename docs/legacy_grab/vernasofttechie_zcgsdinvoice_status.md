# Migration Status — vernasofttechie-zcgsdinvoice

STATUS: waiting_manual
UPDATED: 2026-09-24T09:30:40.377Z
WAITING_ON: operator
NOTE: Build the Context in SFP: refresh+pull in abapGit (accept deleting the wrongly named form), drag all interface nodes into Context, set LV_WAERK as currency for the amounts, activate, then Stage-Commit-Push BOTH ZCGSD_INVOICE_ADT and ZCGSD_INVOICE_INT. Then confirm here.
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

## 2026-09-24T08:47:12.783Z — Correction: object names
The interface was first saved under the wrong name (it used the branch name). It is now named to the project standard: interface ZCGSD_INVOICE_INT (file src/zcgsd_invoice_int.sfpi.xml), with the Adobe form to be named ZCGSD_INVOICE_ADT. The old file has been removed from the branch.
If you already started the abapGit pull, please cancel it and pull again from the latest commit. Use these names in SAP:
1. In SFP create interface ZCGSD_INVOICE_INT and form ZCGSD_INVOICE_ADT (package ZAB_ADOBE) with one simple static field.
2. In abapGit pull this branch again so the parameters and global fields appear on ZCGSD_INVOICE_INT.
3. Build the Context and unit/currency references, then Stage, Commit and Push back to this branch.
Then click confirm below.

## 2026-09-24T08:52:31.447Z — Problem reported: import failed (SFPI deserialize error)
abapGit failed to import ZCGSD_INVOICE_INT with "SFPI error, deserialize". Cause found on our side: the interface file was written in the wrong internal layout, not the layout SAP itself produces. It has been rebuilt on top of a real SAP-generated empty interface, so only the parameter list, the global fields and the description differ from a genuine SAP file. Same contents as before: 27 imports, 6 tables, 15 global fields.
Please click Refresh in abapGit (latest commit on this branch) and pull again onto the empty ZCGSD_INVOICE_INT you created in SFP. If it fails again, click 'Report a problem' with the exact message and we will isolate the section responsible.

## 2026-09-24T09:24:26.570Z — Manual activity confirmed
Client confirmed the manual step is done: I've pushed the new files.. Please continue..

## 2026-09-24T09:30:40.376Z — Checked: form received
Thank you - the form ZCGSD_INVOICE_ADT is on the branch with the correct name. The earlier wrongly named form (ZCGSD_INVOICE_INT as a form) has been removed from the branch.
What I found: the form on the branch is still SAP's empty starting point - its Context is empty and the layout has no content. The layout can only be designed once the Context is built inside SAP (it cannot be created from a file), so the next step is yours.

## 2026-09-24T09:30:40.376Z — Action needed from you (SAP): build the Context
1. In abapGit click Refresh, then Pull. It will offer to delete the local wrongly named form ZCGSD_INVOICE_INT - accept that. Do not edit the form before this pull.
2. Open interface ZCGSD_INVOICE_INT in SFP and check the tree shows the 27 import parameters, the 6 tables and the 15 global data fields. If anything is missing, use 'Report a problem' with what you see.
3. Open form ZCGSD_INVOICE_ADT, go to the Context tab and drag in everything from the interface: all import parameters, all 6 tables (drag the table itself so its fields come with it) and all global data.
4. Currency references: set LV_WAERK as the currency for the amounts LV_TOTAL, LV_VAT, LV_SUBTOTAL and GROSS (the old form printed these with LV_WAERK). For the fields inside the tables, do not guess - activate the form and SAP will list any amount or quantity field that lacks a reference. Add what it asks for, and tell me the field names you used.
5. Activate the form, then in abapGit Stage, Commit and Push BOTH ZCGSD_INVOICE_ADT and ZCGSD_INVOICE_INT to this branch. The interface must be included because the currency references are stored there.
6. Click 'I've done this - confirm' here and tell me anything SAP complained about.
