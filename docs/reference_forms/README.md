# Reference forms — Adobe forms of different purposes and complexity, registered for reuse

Purpose: the user is sourcing real Adobe forms of **medium and high complexity** and different business purposes (invoice, delivery note, payslip, statement,
certificate, label, multi-language, barcode / QR, signature, multi-page with running totals ...). Each one is registered here so every window can learn a construct from
evidence instead of re-deriving it. A construct becomes a strategy (`docs/strategy/`) only after it is **proven** in the client's SAP.

## How to register a form (5 minutes)

1. Put the files in `docs/reference_forms/<form_name>/` (XDP, SFPF xml, a PDF of its output, the legacy export if any). No customer-confidential data beyond what the client has released.
2. Run `node tools/ref_form_probe.mjs <form.xdp> --json <form_name>/probe.json` and paste the summary into the table below.
3. Fill: purpose, class (A / B / C), constructs worth reusing, constructs to avoid, **proven in the client's SAP?** (yes / no / where), what we may copy (constructs, never numbers).
4. If it shows a construct that the rulebook section 7 lists as "candidate": write the test that would prove it (smallest form, what to look at in the preview).
5. Mention the new row in the commit message; update the rulebook only if a rule changes.

## Register

| Form | Purpose | Class | Tables / scripts / features (probe) | Worth reusing | Avoid | Proven in client SAP | Files |
|---|---|---|---|---|---|---|---|
| `ZMMCG_PO_SF_F` (wizard form of the Smart Form ZMMCG_PO_SF) | purchase order, service (ZPOS), French | B | 2 tables, 2 scripts, position header block | exact geometry of the legacy output (baseline 0.717 em, fixed cells), page structure | one case only (no other order types) | yes (client's own wizard output) | `docs/legacy_grab/wizard_reference/` on branch `vernasofttechie-zmmcg_po_sf` |
| `ZMMET_PO_SF_ZETO_F` (wizard form of ZMMET_PO_SF) | purchase order, English | B | tables per row, 29 scripts | table layout, overflow leader, ready-hide | insets 0.5 mm / 3.387 mm are not ZMMCG's | yes | client-supplied (Window-4 / user) |
| `ZMMCG_PO_SF_ADT` (our build) | purchase order, all types and languages | B-C | 42 table subforms, 63 scripts | generator + ten re-check passes, prepared terms table | script-heavy Design View (see S10 section 11) | pending client preview | branch `vernasofttechie-zmmcg_po_sf` |

### Client-built reference forms uploaded 2026-10-12 (`docs/reference_examples/SFPF_*.XML` + `SFPI_*.XML`; the layout is the base64 `<LAYOUT>` of the SFPF file)

All nine run in the client's SAP, so the constructs below are **proven there** (not yet proven in a form built by us). Probe: `node tools/ref_form_probe.mjs <extracted xdp>`.

| Form | Purpose | Class | Facts (probe + interface) | Constructs worth reusing |
|---|---|---|---|---|
| `ZAF_FABRIC_CUTTING_STICKER` | fabric cutting sticker, 97.8 × 45.7 mm page | A | 11 fields, 1 image, 0 scripts; interface 4 globals, 13 code lines | small custom page size, 7 pt labels, one logo |
| `ZAF_INVOICE_CA` | commercial invoice (Canada / US) | C | 3 tables, 133 objects, 1 JS (initialize); **interface 1592 Initialization lines, 83 globals**, SELECT SINGLE / TVARVC config / inline `DATA( )` | `<overflow trailer="FooterRow"/>`, `keep intact="contentArea"`, picture clauses `num{z,zzz,zz9.99}` `date{MM/DD/YYYY}`, 70 `xliff:rid` translation ids, data prepared in the Initialization |
| `ZAF_PRE_ORD_COST_FORM` | pre-order costing (garment), Times New Roman 8 pt | C | 3 tables, 140 objects, 0 scripts; interface 12 lines | `overflow leader="HeaderRow"` on 3 tables, `keep intact="contentArea"`, picture `num.decimal{zzz,zzz,zz9.99}` / `num{z,zzz,zzz,zz9}`, `lr-tb` layout |
| `ZAF_PRE_ORD_COST_FORM_YARN` | pre-order costing (yarn) | C | 6 tables, 263 objects, 3 JS (`indexChange`) | repeated costing blocks, row-index events |
| `ZEZC_SD_INVOICE_IN_EMAIL` | tax invoice India, e-mail variant | C | 4 tables, 2 page areas, **17 FormCalc + 18 JS (243 lines)**, events `ready@$form` ×17 and `ready@$layout` ×4; **interface 2682 Initialization lines** | `<break overflowLeader="#HEADER"/>` (leaders per page area), `lr-tb` flows, layout-ready hides |
| `ZPP_PLY_SPECIFICATION` | production specification, wide landscape (422 mm) | B | 1 table, 4 JS (`initialize`, `docClose@$host`); interface 407 lines | `overflow leader` + `target="Page1"`, very wide content area |
| `ZSDAF_V3_SEA001` | e-invoice with **QR code** | C | 2 tables, 3 JS (`ready@$layout`), `barcode type="QRCode"`; interface 117 lines | QR: `<barcode type="QRCode" errorCorrectionLevel="3" moduleWidth="0.0167in" .../>` bound to a data node; JS on `ref="$layout"` hides the QR when the UUID is empty; `xliff:rid` |
| `ZSD_IVORY_FORM` | simple delivery / ivory form, 8 × 10.5 in | B | 1 table, filled borders, 36 pt title | filled grey cells, single table with leader |
| `ZSL_OHT_SMRT_WHT_F` | smart-white (OHT) form | B | 1 table, named page area `X2500_PAGE1_ID`, `assist TF` | `overflow leader` + `trailer`, table footer role `TF`, picture clauses |

Per-form structural anatomy (page areas, master-page content, subform tree with layout / geometry / bind / occur / overflow / break / keep / events, fonts, picture clauses, scripts) is generated by `node tools/form_anatomy.mjs <extracted xdp or SFPF.XML> --out docs/reference_forms/anatomy/<FORM>.md` and stored in [`anatomy/`](anatomy/): [`ZAF_FABRIC_CUTTING_STICKER`](anatomy/ZAF_FABRIC_CUTTING_STICKER.md), [`ZAF_INVOICE_CA`](anatomy/ZAF_INVOICE_CA.md), [`ZAF_PRE_ORD_COST_FORM`](anatomy/ZAF_PRE_ORD_COST_FORM.md), [`ZAF_PRE_ORD_COST_FORM_YARN`](anatomy/ZAF_PRE_ORD_COST_FORM_YARN.md), [`ZEZC_SD_INVOICE_IN_EMAIL`](anatomy/ZEZC_SD_INVOICE_IN_EMAIL.md), [`ZPP_PLY_SPECIFICATION`](anatomy/ZPP_PLY_SPECIFICATION.md), [`ZSDAF_V3_SEA001`](anatomy/ZSDAF_V3_SEA001.md), [`ZSD_IVORY_FORM`](anatomy/ZSD_IVORY_FORM.md), [`ZSL_OHT_SMRT_WHT_F`](anatomy/ZSL_OHT_SMRT_WHT_F.md). **Add the anatomy of every new reference form** and let the construct → pattern mapping in [S12](../strategy/S12_legacy_construct_to_adobe_pattern_catalogue.md) grow from it.

Structural facts the anatomies show (verified 2026-10-12): page numbers (`xfa.layout.page`) exist only in `ZEZC_...`, `ZSDAF_V3_SEA001` (and one use in `ZPP_PLY_SPECIFICATION`); the costing forms keep an empty `PageNo` placeholder and print none; a barcode exists only in `ZSDAF_V3_SEA001`; `overflow trailer` only in `ZAF_INVOICE_CA` and `ZSL_OHT_SMRT_WHT_F`; `indexChange` zebra only in the yarn costing form; master-page *subforms* in `ZSDAF_V3_SEA001`, `ZPP_PLY_SPECIFICATION`, the sticker, `ZEZC_...` (`INFO2`, `WATERMARK`); letterhead *objects directly in the page area* in `ZEZC_...`, `ZAF_INVOICE_CA`, `ZSL_OHT_SMRT_WHT_F`; custom / landscape media in the sticker (97.79 × 45.72 mm content) and `ZPP_PLY_SPECIFICATION` (a3Extra landscape).

Findings from these nine, relevant to every window:
- **Data is prepared in the Initialization** (400-2700 lines in the invoice forms) with ABAP 7.4 inline declarations and TVARVC configuration; the layouts bind with `dataRef`. This confirms the prepared-data principle (rulebook section 4).
- **Number and date formatting through `<picture>` clauses** (`num{z,zzz,zz9.99}`, `date{DD/MM/YYYY}`) and `xliff:rid` translation ids are the client's own habit; our ZMMCG form prints prepared text (legacy parity). Offer picture clauses / translation ids in phase 2 (rulebook section 7).
- Constructs not used by our forms yet and available here as proven templates: `overflow trailer`, `keep intact="contentArea"`, `break overflowLeader`, QR barcode, layout-ready JavaScript hide, `lr-tb` flow, `assist TF`, custom page sizes, landscape A3.

## What to ask the user to supply per reference

Purpose and who uses it; the SFPF xml **and** XDP; a PDF of real output (with a document number); the languages / variants it prints; whether it runs in production;
which parts the client considers good (to copy) and bad (to avoid).
