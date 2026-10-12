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

## What to ask the user to supply per reference

Purpose and who uses it; the SFPF xml **and** XDP; a PDF of real output (with a document number); the languages / variants it prints; whether it runs in production;
which parts the client considers good (to copy) and bad (to avoid).
