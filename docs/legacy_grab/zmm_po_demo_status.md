# Migration Status — ZMM_PO_DEMO

STATUS: in_progress
UPDATED: 2026-10-06T06:50:38.748Z
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

## 2026-10-06T06:36:48.000Z — Context tree built
Checked the branch — the pushed form (`src/zmm_po_demo_adt.sfpf.xml`) is exactly the safe empty starting point, wired to `ZMM_PO_DEMO_INT`, so nothing to redo there. I built the Context tree on top of it and pushed it to the same file. It binds only what the legacy form actually prints:
- `LV_EBELN` (the PO number input)
- `LS_EKKO` as a structure with 4 fields: `EBELN`, `BUKRS`, `WAERS`, `ZTERM` (PO number, company code, currency key, payment-terms key)
- `LT_EKPO` as a repeating table with 5 columns: `EBELN`, `EBELP`, `MATNR`, `WERKS`, `LGORT` (PO, item, material, plant, storage location)

Left out on purpose: the other fields the interface loads (`LIFNR`, `BEDAT`, `TXZ01`, `MENGE`, `MEINS`, `NETPR`, `NETWR` and so on) — the legacy form never printed them, and the quantity and amount ones would each need a unit/currency reference. If you later want any of them on the form, tell me and I'll add them with the right reference.

The tables and structures here are interface global fields filled by the Initialization code, so they are bound the same way SAP itself serializes global data in `YMM_ISSUE_RESERVATION`. The file passed a full consistency check before pushing (every node's parent/child/sibling links and condition links resolve; no duplicate ids). The one thing a check outside SAP can't prove is that SAP accepts it, so please:
1. Pull this branch onto form **ZMM_PO_DEMO_ADT** in SFP.
2. Check the Context tree shows 14 nodes: `LV_EBELN`; `LS_EKKO` with its 4 fields; `LT_EKPO` with its 5 columns under it. No deserialize error.
3. If it imports clean — click confirm and I'll start the layout.
4. If SAP throws an error — use "Report a problem" with the **exact** message and I'll fix precisely that.

## 2026-10-06T06:41:27.309Z — Manual activity confirmed
Client confirmed the manual step is done.

## 2026-10-06T06:42:17.000Z — Layout started
The Context imported cleanly in SAP, so the next gate is open. I have started the layout for ZMM_PO_DEMO_ADT: the page, the title, the PO header block and the items table, built on the SFP-generated form you pushed. You will see a "Waiting" request here again as soon as there is something to pull and check in SAP.

## 2026-10-06T06:46:58.000Z — Layout built (first version)
The layout for `ZMM_PO_DEMO_ADT` is pushed in `src/zmm_po_demo_adt.sfpf.xdp`, built on the SFP-generated page you pushed. It follows the legacy form's three windows, with sizes and positions read from your export:
- **Page:** A4 portrait (legacy DINA4).
- **Title:** "Purchase Order Form" (legacy window `%WINDOW2`, 15.57 x 2.00 cm).
- **PO header:** 4 rows, label on the left and value on the right, each cell 8 cm wide — PO Number, Company Code, Currency Key, Terms of Payment Key. The row and column of every item come straight from the legacy template, not from guessing. The values are bound to `LS_EKKO`.
- **Items table:** inside the bordered main window (16.43 x 17.39 cm). Five columns, 3 / 3 / 4 / 2 / 4 cm exactly as the legacy table: Purchasing Document Number, Po Item Number, Material Number, Plant, Storage Location. It repeats once per item from `LT_EKPO`.

Checked here before pushing: the file is valid XML, nothing outside the page body was changed, every element sits inside its parent with at least 1 cm of page margin, the columns add up to the legacy 16 cm, and all 9 field bindings resolve to the Context you confirmed (nothing amount- or quantity-related is bound, so no reference fields are involved).

**Please check these in SAP** — I can't see the rendered page from here:
1. Pull this branch onto form `ZMM_PO_DEMO_ADT`, then activate it. Note the activation result.
2. Open the Layout. You should see an A4 portrait page with the title at the top, the 4-row header, and a bordered box with the five column headings across its top. Report any overflow or warning badges.
3. Preview/test with a real PO number in `LV_EBELN` and check the header values and item rows fill in.
4. If everything looks right, confirm. If you adjust anything in Designer, push it back and tell me — I compare every Designer save against this version before building on it.

**Three things I could not settle from the export, so please decide or help:**
- **Fonts.** The title and text use the SmartStyle `ZMM_STYLE`, but the export only holds the style's name, not its fonts. I used Arial as a placeholder (title 14pt bold centered, header 9pt, table 8pt). For an exact match, download `ZMM_STYLE` in SMARTSTYLES (Utilities > Download) and add it under "SmartStyle exports" in Configure, or just tell me the font, size and alignment of paragraph `P1` and the default paragraph.
- **More than about 29 items.** The legacy main window continues onto further pages automatically. This first version is a single page: it holds about 29 item rows, and rows beyond that would not show. If your purchase orders can be longer than that, say so and I will build page continuation as its own step (it needs its own test).
- **Title position.** Legacy places the title 0.53 cm from the top edge; I put it at 0.5 cm inside the printable area (about 1 cm from the edge) to stay clear of the page edge. Tell me if you need the exact legacy offset.

## 2026-10-06T06:50:38.748Z — Manual activity confirmed
Client confirmed the manual step is done: PO - build page continuation..
Title position - Fit as per the possibilities.
