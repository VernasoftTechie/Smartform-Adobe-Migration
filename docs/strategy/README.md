# Adobe Conversion Strategy Catalogue

This folder is the shared catalogue of **SAP-validated successful scenarios**.
It belongs on `main`, is available to every conversion branch, and grows only
after a scenario has rendered and activated in the target S/4HANA system.

It is deliberately not an abapGit import location. Form-specific source
downloads, screenshots, blueprints, checklists, and generated SFP artifacts
stay in the relevant conversion branch.

## How branches use this catalogue

1. Read the applicable strategy before creating the form in SFP.
2. Create and activate a native SFP baseline; capture it with abapGit
   **Stage -> Commit -> Push**.
3. Apply the closest validated pattern, using only the current form's legacy
   evidence for field names, styles, labels, graphics, and business behavior.
4. Add any new failure to the central `docs/BUILD_ISSUES_LOG.md` with the
   branch and commit that resolved it.
5. Promote a scenario here only after it has a successful SFP Layout and
   activation result. A strategy must link to its supporting bug-log IDs and
   validation evidence.

## Current successful scenarios

| Strategy | Applies to | Supporting lessons |
|---|---|---|
| [S01 — SFP-generated baseline and safe abapGit capture](S01_sfp_generated_baseline.md) | Every form | F20-F23 |
| [S02 — A4 landscape fixed-window layout](S02_landscape_fixed_layout.md) | Wide forms and 29 cm tables | F24 |
| [S03 — Purchase Requisition composite layout](S03_pr_composite_layout.md) | Header, repeating lines, watermark, date, footer, signatures | `Z_MM_PR_FORM_ADT` |
| [S04 — Interface hand-authoring boundary](S04_interface_hand_authoring_boundary.md) | Every form's `.sfpi.xml` | F28-F30 |
| [S05 — Diff after every native SFP/Designer save](S05_post_native_edit_diff_discipline.md) | Every form, after every native SFP/Designer edit | F41 |

## Promotion standard

Do not place experimental layouts, guessed field mappings, copied SFPF
Context graphs, or untested scripts here. Each strategy must state:

- the Smart Form design signals that select it;
- the SFP/Adobe structure to use;
- what remains form-specific;
- the exact test cases that establish success;
- the linked bug-log and commit IDs.
