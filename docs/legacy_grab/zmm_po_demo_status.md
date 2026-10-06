# Migration Status — ZMM_PO_DEMO

STATUS: in_progress
UPDATED: 2026-10-06T06:33:02.930Z
WAITING_ON: engineer
NOTE: 
STOP: none
CLAIMED_BY: Window-1

---
## 2026-10-05T13:13:33.381Z — Queued
Migration submitted with 2 reference file(s).

## 2026-10-06T06:18:58.000Z — Picked up
Window-1 picked this migration up.

## 2026-10-06T06:21:22.000Z — Interface prepared
The form interface for ZMM_PO_DEMO has been prepared from your reference export and saved on this branch (`src/zmm_po_demo_int.sfpi.xml`).
- This form is self-contained: it takes one input, the PO number (`LV_EBELN`), and reads the purchase order itself. So the interface is small — 1 import parameter, no tables — but it carries the form's own logic.
- The two database reads (`SELECT SINGLE` from `EKKO` for the header, `SELECT` from `EKPO` for the items) are the form's embedded program lines. They are placed in the interface's **Initialization** tab, copied line for line from the legacy form (all 32 lines checked identical to the export).
- The form's own types (`TY_EKKO`, `TY_EKPO`) and its three global fields (`LS_EKKO`, `LT_EKPO`, `LS_EKPO`) are in the interface too. One small, necessary change: the legacy form declared the items table as `TABLE OF TY_EKPO` directly; an Adobe interface declares its table type in the Types tab instead, so `TY_EKPO_TAB` was added and `LT_EKPO` uses it. Nothing about the data changes.
- Left out on purpose: the standard SSF envelope parameters and exceptions (SAP recreates them itself) and the context tree.
- No currency/quantity reference fields are needed: the form only prints text fields (PO number, company code, currency key, payment-terms key; per item: PO, item, material, plant, storage location). The amount/quantity fields (`MENGE`, `NETPR`, `NETWR`) are read but never printed, so they stay out of the Context and out of the reference-field requirement.
- Also noted: no driver program could be confirmed for this form (nothing in NACE/TNAPR, none found by the source scan). It doesn't block the design work — driver programs are out of scope here — but please confirm with the functional owner what calls it before go-live. Whatever calls it only has to pass the PO number.

## 2026-10-06T06:21:22.000Z — Action needed from you (SAP)
Please do these in SAP, in order:
1. In transaction SFP create the Adobe form interface **ZMM_PO_DEMO_INT** and form **ZMM_PO_DEMO_ADT** (package ZAB_ADOBE). Leave the form empty — this is the safe starting point.
2. In abapGit, pull this branch (vernasofttechie-zmm_po_demo) onto that interface. Check the Interface tab shows `LV_EBELN`, the Types and Global Data tabs show the types and the three fields, and the Initialization tab shows the two SELECTs.
3. Do **not** drag anything into the form's Context yourself — dragging a whole structure pulls in the amount and quantity fields and SAP then demands references for them. I build the Context here from the real SAP-generated form once you push it.
4. In abapGit do Stage, Commit and Push **both** the interface and the (empty) form back to this same branch.

When it is done click "I've done this — confirm" below. If anything fails, use "Report a problem" and give the exact message.

## 2026-10-06T06:33:02.930Z — Manual activity confirmed
Client confirmed the manual step is done.
