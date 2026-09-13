# YMM_ISSUE_RESERVATION — Post-Implementation Extension Points

## Named Developer Extension Points

| ID | Open item | Required resolution |
|---|---|---|
| `DEP-YMMISSUERES-01` | Print output control (archiving, mail, control/output options — the classic SSF envelope: `ARCHIVE_INDEX`/`ARCHIVE_INDEX_TAB`/`ARCHIVE_PARAMETERS`/`CONTROL_PARAMETERS`/`MAIL_APPL_OBJ`/`MAIL_RECIPIENT`/`MAIL_SENDER`/`OUTPUT_OPTIONS`/`USER_SETTINGS` on import, `DOCUMENT_OUTPUT_INFO`/`JOB_OUTPUT_INFO`/`JOB_OUTPUT_OPTIONS` on export) | **Explicitly out of scope per user instruction, 2026-09-13: "Print output control is something we can handle manually.. dont include it in your scope."** Confirmed separately by live evidence: hand-authoring these into the Adobe interface has no effect — SFP silently drops them and substitutes its own auto-generated `/1BCDWB/DOCPARAMS` (`TYPE SFPDOCPARAMS`) parameter, which bundles Adobe's own print/output handling. No further interface work needed here; whoever wires this form's calling driver decides output/archiving/mail handling separately, using the standard Adobe `FP_JOB_OPEN`/`FP_FUNCTION_MODULE_NAME`/`FP_JOB_CLOSE` pattern and `/1BCDWB/DOCPARAMS` — not this project's concern (matches the standing "driver programs are read-only, wiring is a separate later decision" rule, `docs/01_scope.md` §8). |
| `DEP-YMMISSUERES-02` | `verpr` type mismatch | The legacy `TYPES` block declares `verpr TYPE resb-bdmng` (a quantity type) even though the field name (`VERPR`, moving price) and its own comment history suggest it should be a currency/price type (`MBEW-VERPR`, `CURR`). Preserved exactly as evidenced (not silently "corrected") — flag for functional-owner confirmation before this field's real behavior is trusted. |
| `DEP-YMMISSUERES-03` | `charg` fixed-length override | `charg(12) TYPE c` is a fixed 12-character field, not bound to `RESB-CHARG`'s real DDIC type — per a 2021 comment ("for brackets"), likely a deliberate display-formatting choice. Preserved exactly as evidenced; confirm intent before assuming it's safe to leave as-is at scale. |
| `DEP-YMMISSUERES-04` | Conditional plant/country branding | The form's entire conditional design is a binary `LV_LAND1 = 'ZA'` switch (see the interface scope ledger §6) governing at minimum the plant-heading window and the "Details" window pair (`%WINDOW3` non-ZA / `%WINDOW5` ZA) — not yet built in the layout. Needs the exact literal text for both branches (byte-offset extraction, deferred to layout phase) before implementation. |
| `DEP-YMMISSUERES-05` | SmartStyle / driver / risk score | Sections 3, 4, 6, and 9 of the legacy-grab report are still manual/unconfirmed (no driver found by source scan, no SmartStyle auto-matched) — same standing gaps as every other form on this project; confirm via SE71/NACE before layout sign-off. |

## Interface-build findings (confirmed via live native entry + Pull, 2026-09-13)

1. **`TYPES`'s real XML shape is now confirmed** — a list of `<FPCLINE>` elements (literal ABAP source, one per line), the *same* shape as `INITIALIZATION`, not a structured component list like `GLOBAL_DATA`'s `SFPGDATA`. Confirmed by pulling the user's own native entry of `w_header`/`i_header` (commit `180a7ec`). This resolves S04's long-standing "TYPES shape unconfirmed" gap from YMMGRNNOTE's F28 — worth promoting to the strategy catalogue once this form's full interface (now including the remaining 4 structures, hand-authored on top of the user's proven single-structure test) is confirmed to activate cleanly.
2. **The classic SSF envelope parameters don't survive into an Adobe interface at all** — confirmed by the same Pull: none of the 8 `STANDARD="X"` import parameters or 3 `STANDARD="X"` export parameters I originally hand-authored appear in the captured result; only the 3 genuinely custom import parameters (`IV_PLANT_NAME`/`LV_LAND1`/`GV_TOTAL`) and the 1 custom table (`IT_FINAL`) came through. SFP substitutes `/1BCDWB/DOCPARAMS` for the import side. Also now explicitly out of scope per `DEP-YMMISSUERES-01` above — don't attempt to hand-author these on any future form either.

## SAP validation steps

1. ☐ Activate the interface with the completed `TYPES`/`GLOBAL_DATA`/`CL_FP_CODING` (all 7 structures, all 11 globals, the literal init loop) — confirm no deserialize error.
2. ☐ Build and capture Context natively (drag `IT_FINAL`, `IT_HEADER`, `IT_ITEM` into the Context tree); resolve `GV_TOTAL`'s QUAN reference field once it's dragged in (same pattern as every prior form's QUAN/CURR fields).
3. ☐ Render the binary `LV_LAND1` conditional paths (`DEP-YMMISSUERES-04`) for at least one ZA and one non-ZA test document.
4. ☐ Test an empty `IT_ITEM`, a single-reservation document, and a multi-reservation/multi-page document.
5. ☐ Compare legacy OTF against the Adobe PDF for the same real document.
6. ☐ Named business-owner sign-off once risk score is assigned (`DEP-YMMISSUERES-05`).

**Out of scope:** driver-program changes, NACE/output-determination changes, print/output/archiving/mail control (`DEP-YMMISSUERES-01`), and cutover decisions.
