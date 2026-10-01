# Migration Status — vernasofttechie-zcgsdinvoice

STATUS: waiting_manual
UPDATED: 2026-09-30T14:40:00.000Z
WAITING_ON: operator
NOTE: Layout pushed on your SFP baseline - pull, open Design View, confirm it renders, and answer the 6 open questions in the build checklist.
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

## 2026-09-30T13:45:00.000Z — Question: currency/quantity reference fields (not something the interface file controls)
Checked this against the real legacy form export before answering — two things:

**This isn't an interface-file problem.** The reference field for each currency/quantity node is a setting inside SFP's own Context builder (on each node, in the SAP GUI) — it isn't stored in `zcgsd_invoice_int.sfpi.xml` at all, so there's no file I can push that fixes this. But I can tell you exactly what to pick for each node.

**Why VBRK-WAERK and VBRP-VRKME are rejected:** Adobe Forms requires the reference field to be a field actually reachable in that node's own context (a sibling in the same structure, or a scalar already in the interface) — `VBRK` and `VBRP` are header/item database tables that were never part of this form's interface or of `GT_FINL`/`GT_INVOICE`'s own row type, so SAP correctly refuses them. The legacy Smart Form never had a real answer for this either — I checked its own internal reference-fields table (`REFFIELDS` in the export) and every one of these entries points at itself (e.g. `GS_FINL-KBETR`'s own "reference" is `GS_FINL-KBETR`), which is Smart Form's auto-generated placeholder when no real reference was ever configured, not a usable value. So this needs a decision now, not a carry-over from before.

**For every CURRENCY node** (`KBETR`, `NETWR`, `SUB_TOT`, `VAT`, `TOTAL`, `FVAT`, `KWERT`, `KAWRT`, `MWSBP`, `GROSS` — on `GT_FINL`/`GS_FINL`/`GT_INVOICE`/`GS_INVOICE`/`LT_INVOICE`): the interface already has a top-level `LV_WAERK` (type `WAERK`) parameter. If one currency for the whole document is correct (the usual case for an invoice), point every one of these nodes at `LV_WAERK` instead. Please confirm this is right for this form before setting it on all ~22 nodes.

**For the QUANTITY nodes** (`FKIMG` on `GT_INVOICE`/`GS_INVOICE`/`LT_INVOICE`): there is no unit-of-measure field anywhere in the interface to point at, and I don't have access to `ZSDNG_INVOICE_TT`'s own field list to check whether it already carries one. Please tell me either:
1. The exact field name inside `ZSDNG_INVOICE`/`ZSDNG_INVOICE_TT` that holds the sales unit for `FKIMG` (if one already exists there), or
2. If none exists, confirm adding a new import parameter (e.g. `LV_MEINS TYPE MEINS`) to the interface — this is a real change to the original contract, so I want your go-ahead before adding a field that wasn't in the legacy form's own interface.

Reply here (or "Report a problem" if I've misread something), and I'll push a corrected interface if a new parameter is needed, or confirm you can go ahead and set the references yourself in Context if `LV_WAERK` and an existing field cover it.

## 2026-09-30T14:05:00.000Z — Reference fields added to the interface — please pull
Correction and fix: I'd first said this couldn't go in the interface file — that was wrong. SAP's Interface Builder has its own **Reference Fields** tab for exactly this (a separate area from Import/Export/Table/Global), and it IS part of `ZCGSD_INVOICE_INT`, so this is our work, not something to hand to you as a manual decision. Pushed to this branch (`src/zcgsd_invoice_int.sfpi.xml`):
- Added one new global field: **`LV_MEINS` type `MEINS`** (unit of measure) — the interface had a currency field (`LV_WAERK`) already, but no quantity-unit field, so this was needed.
- Declared the reference for all 28 flagged fields: every amount field → `LV_WAERK`, every quantity field → `LV_MEINS`.

**Correction to my own question two entries up:** I'd wrongly told you `KAWRT` was a currency field. It isn't — your own error message showed it referencing `RV61A-AWEI1` (a unit-of-measure field), so it's a **quantity** field like `FKIMG`, not a currency one. It's declared correctly below.

**Please do this:**
1. In abapGit, pull this branch onto `ZCGSD_INVOICE_INT` — the new `LV_MEINS` field and all 28 reference declarations will appear.
2. In SFP, delete the ~28 nodes you already dragged into Context with the rejected references (`KBETR`, `KAWRT`, `NETWR`, `SUB_TOT`, `VAT`, `TOTAL`, `FVAT`, `KWERT`, `FKIMG`, `MWSBP`, `GROSS` — under `GT_FINL`/`GS_FINL`/`GT_INVOICE`/`GS_INVOICE`/`LT_INVOICE`) and drag them in again from the interface. SAP will now fill in the correct reference (`LV_WAERK` or `LV_MEINS`) by itself — nothing to type or decide.
   - If you'd rather not delete and redo them, you can instead open each existing node and change its reference field: `LV_WAERK` for the amount fields, `LV_MEINS` for `KAWRT`/`FKIMG`. Same result either way.
3. Stage, Commit, Push back to this branch.

No further decision needed on this from your side — click "I've done this — confirm" once pulled and applied, or "Report a problem" with the exact message if anything still doesn't resolve.

## 2026-09-30T13:40:56.097Z — Problem reported
Getting this error.. 

Field GT_FINL-KAWRT does not have data type QUAN

## 2026-09-30T14:20:00.000Z — Fixed: KAWRT was the wrong data type, not a new field to invent
You're right, and this one's on me — I classified `KAWRT` wrong. I'd guessed QUAN only because your original (rejected) reference for it pointed at a unit field (`RV61A-AWEI1`), but that was inferring the field's type from what someone had mistyped, not from `KAWRT` itself. It doesn't hold up: `KAWRT` sits in `GT_FINL`/`GS_FINL` alongside `KBETR`, `NETWR`, `SUB_TOT`, `VAT`, `TOTAL`, `FVAT`, `KWERT` — a set of pricing/total fields — while the real quantity field (`FKIMG`) lives entirely separately, only in the invoice-line structures. `KAWRT` ("condition value") is standard SAP terminology for a currency amount, matching its 7 siblings, not a quantity.

Pushed the fix: `GT_FINL-KAWRT` and `GS_FINL-KAWRT` are now declared `CURR` → `LV_WAERK`, same as the rest. Nothing else changed — still 28 entries, still 3 quantity ones (`FKIMG` only).

Please refresh abapGit (Local Object Refresh or Repo Refresh, whichever you normally use) and pull again onto `ZCGSD_INVOICE_INT`, redo the `KAWRT` node's reference (or re-drag it) to pick up `LV_WAERK`, then Stage-Commit-Push. If anything else in this list still doesn't resolve, please give me the exact message again — I'd rather you report it than have me guess a third time.

## 2026-09-30T14:03:11.016Z — Manual activity confirmed
Client confirmed the manual step is done: I've pushed the form.. Please check and work on the layout and confirm..

## 2026-09-30T14:40:00.000Z — Layout built and pushed
Checked the baseline you pushed - `ZCGSD_INVOICE_INT`'s reference fields and `ZCGSD_INVOICE_ADT`'s Context are exactly as expected. Built the actual page layout directly into `src/zcgsd_invoice_adt.sfpf.xdp` on top of it (your Context tree wasn't touched) and pushed it, following this project's own proven layout patterns (`docs/strategy` S02/S03/S06/S07) - A4 portrait, header band (logo/heading/company address), pick-up-plant line, invoice-to/information details band, the invoice line-items table, and the grand total.

Full detail, evidence, and **6 open questions I need your input on before this goes further** (labelled DEP-1 to DEP-6 - a dropped logo image, two simplified conditions, a dropped address variant, an apparently-unused table pair, and a duplicate table) are in `docs/legacy_grab/ZCGSD_INVOICE_build_checklist.md` on this branch.

**Please do this:**
1. Pull this branch in abapGit onto `ZCGSD_INVOICE_ADT`.
2. Open Layout in SFP/Designer - confirm a physical A4 portrait page renders with no overlapping content and nothing running off the page.
3. Read the 6 questions in the build checklist and answer each here (or via "Ask a question"/"Report a problem" if something looks broken).
4. A Design View screenshot is the fastest way for me to catch anything the arithmetic checks can't - attach one if you can (the concern box now supports images and documents).

I have not been able to render or preview this myself - per this project's own standing rule, a well-formed, arithmetically-correct layout still needs a real render check before it's trusted.

## 2026-10-01T05:30:00.000Z — Fixed: the "Couldn't check out the branch" error on Confirm
Sorry about that — found and fixed it. Two Bolt Console actions running close together on this migration (for example, confirming right after attaching a file) could interleave their git operations against the shared working copy, leaving it in a state where the next action's checkout was refused. Fixed in the console itself: actions on the same migration now queue one at a time instead of overlapping, so this can't happen again. Please click "I've done this — confirm" again — it should go through cleanly now.
