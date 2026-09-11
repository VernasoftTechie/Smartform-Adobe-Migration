# 03 – Smart Form to Adobe Form Migration – Version History

## v1.2 — global sweep: grab all SmartStyles + logos once, not per form

- New `P_GLOB` mode: ticking it (instead of filling per-form fields) runs a
  system-wide sweep instead of the legacy grab — every SmartStyle name
  (`TADIR` object type `SSST`) and every SE78-registered graphic
  (`SELECT * FROM stxbitmaps`, same safe pattern as `TNAPR`) in one pass,
  written to `global_smartstyles.txt` / `global_logos.txt`.
- Per-form sections 6/7 (SmartStyle, Graphics/logos) reworded: now a lookup
  against the sweep output ("which one does this form use"), not fresh
  research each time.
- `docs/06_global_findings.md` restructured: §0 holds the system-wide
  inventory (paste the sweep's output there once), §1 holds per-form matches
  against it.
- `docs/04_global_style_catalogue.md` process updated: sweep first,
  system-wide, once (step 0), *then* match per form.
- `STXBITMAPS` is a best-effort table-name guess (unlike `TNAPR`, not
  previously used here) — flagged in `docs/BUILD_ISSUES_LOG.md` as an
  activation-time risk to watch, not yet a confirmed trap.

## v1.1 — fold SSF_READ_FORM's interface probe into the main process

- `SSF_READ_FORM`'s interface is now probed **automatically as part of every
  normal run** — no separate `P_PROBE` step needed for it specifically.
  `capture_interface( 'SSF_READ_FORM' )` runs once per run (not once per
  form) and the result becomes **section 5** of every snapshot.
- Sections renumbered to make room: SmartStyle (6), Graphics/logos (7), Form
  outline (8), Risk score (9), Output comparison/OTF (10), Full prerequisite
  checklist (11).
- **Honest limit, spelled out in section 5 itself**: `FUPARAREF` gives
  parameter *names* and *kind* (I/E/T/C/X), not each parameter's exact ABAP
  *type* — not enough to safely call `SSF_READ_FORM` for real data yet
  (a wrong type guess on a deep EXPORTING/TABLES parameter risks the same
  class of dump as F1). Section 5 states exactly what's still needed: the
  **Reference Type** shown in SE37 next to the EXPORTING/TABLES parameter(s)
  it already names — a targeted look, not blind exploration.
- `P_PROBE` kept as a general-purpose version of the same tool, for any
  *other* unfamiliar FM this project needs later.
- `docs/02_legacy_grab_spec.md` updated to match; also fixed stale
  "driver-program rewrite" language left over from before the v1.0 scope
  pivot.

## v1.0 — scope pivot: design + interface only, driver programs read-only

**Architecture decision, confirmed 2026-09-12** — supersedes the driver
rewrite described in earlier versions of `docs/01_scope.md`:
- Driver programs are **read-only inputs forever** — understood, never
  modified. Multiple drivers can call the same Smart Form for different
  purposes; rewriting one for one purpose risks silently breaking another.
- This project's deliverable is the **Adobe Form design + interface only**.
  The interface is preserved exactly from each snapshot's §2. How an
  existing driver eventually reaches the new Adobe Form (NACE config
  repoint, new parallel entry point, or an administrative decision) is a
  **separate, later, per-driver decision** — not proposed or built here.
- `docs/01_scope.md` updated throughout: business outcome, §4, §8 (out of
  scope), §9 (phase plan — added 1c, redefined 2/3/4/5 as design-only, 6
  reframed as a separate wiring track), risk framework's driver-complexity
  dimension, definition of done.
- **New: Global Style & Asset Catalogue** (`docs/04_global_style_catalogue.md`)
  — instead of a bespoke Adobe style per form, consolidate every logo/style
  found across all forms into a small reusable set, matched per form rather
  than designed fresh each time. `docs/06_global_findings.md` is the raw log
  feeding it.
- **New: Individual Form Conversion Framework**
  (`docs/05_individual_form_conversion_framework.md`) — the repeatable
  per-form design procedure (read → design → match catalogue → validate via
  OTF/PDF diff → sign-off), with unresolved items becoming a named
  **Developer Extension Point** + a post-implementation checklist entry,
  never a silent gap. Special Adobe-specific features may be used at Bolt's
  judgment, always called out explicitly.
- `ZSF2AF_R_LEGACY_GRAB` section 3 wording clarified: driver candidates are
  explicitly labelled READ-ONLY, pointing at `01_scope.md` §8.

## v0.9 — fix EXTRACT_INCLUDES activation errors (F2)

- `LV_INCLNAME` was inferred `TYPE string` by `DATA(lv_inclname) = to_upper(
  ... )`, which broke two things: the classic offset/length trim
  (`field+off(len)`, valid only on fixed `C/N/D/T` types) and the
  by-reference `IMPORTING` binding to `write_driver_source`'s
  `IV_PROGNAME TYPE tadir-obj_name` formal (needs an exact type match, not
  just a convertible one). Fixed by declaring `lv_inclname` explicitly as
  `TYPE tadir-obj_name` and assigning via `=`. See `docs/BUILD_ISSUES_LOG.md`
  F2; also logged as D7 in the shared Bolt Playbook Appendix A.
- Also fixed an ABAP Doc "wrong position" warning on `PROBE_FM`'s doc
  comment (added the blank line before it that every other doc-commented
  method in this file already has).

## v0.8 — P_PROBE: safely confirm SSF_READ_FORM's interface before calling it

- New optional selection field `P_PROBE`: fill it with a function module name
  (e.g. `SSF_READ_FORM`, confirmed as the likely form-read API this round)
  and the report introspects its interface via the same `FUPARAREF` technique
  already proven for section 2, writes the parameter list to the list and to
  `probe_<fmname>.txt`, then stops without running the legacy grab.
- This is the safe way to learn an unfamiliar FM's real parameter list before
  any code calls it — no more guessing a signature and risking a repeat of
  F1. Next round, once `SSF_READ_FORM`'s parameters are confirmed this way,
  real automation for sections 5-7 (SmartStyle/logo/outline) can be built.

## v0.7 — deep mining: follow driver includes; full prerequisite checklist

- **`extract_includes`**: driver programs' own `INCLUDE Z.../Y...` statements
  are now followed one level deep — each included program's full source is
  extracted to its own file too, and its dependency scan is folded into the
  same driver's dependency list. Bounded to one level so an include chain
  can't run away.
- **New section 10 — full prerequisite checklist**: every Smart Form snapshot
  now ends with a static, always-emitted checklist covering everything a
  Smart Form can depend on (SmartStyle, formats, graphics, SO10 standard
  texts, barcodes/fonts, languages, digital signature/XFA scripting,
  authorization checks and number-range/posting side effects inside the
  driver) — a completeness net for what still can't be safely automated
  (the form's own internal definition), so nothing gets missed in the manual
  pass.
- Section 3's driver breakdown now lists extracted include files alongside
  the driver's own source file and dependency evidence.

## v0.6 — extract driver source + dependencies; clarify OTF's role

- **Driver-program candidates now have their full source extracted** to its
  own file (`driver_<progname>.txt`) in the output folder, not just their
  name — addresses "the program has to extract the form and respective
  objects into that folder."
- **New dependency scan** (`scan_dependencies`, plain substring matching, no
  regex): for each extracted driver, flags lines referencing other custom
  objects (`CALL FUNCTION 'Z.../Y...'`, `CALL METHOD ZCL_.../YCL_...`,
  `NEW`/`TYPE ZCL_.../YCL_...`, `INCLUDE Z.../Y...`, external
  `PERFORM (Z.../Y...)`) and lists the raw matching source lines (not a
  parsed object name, deliberately, to avoid mis-extracting one) in a new
  per-driver breakdown under section 3.
- **New section 9 (Output comparison / OTF)**: clarifies that OTF is a
  rendered print stream, not a design source, and documents its correct
  role — visual validation of the pilot Adobe Form's PDF against the old
  Smart Form's OTF for the same real document (`GETOTF = 'X'` +
  `CONVERT_OTF`) — as a Phase 2 activity, not something Phase 1a auto-runs
  (it needs a real document key per form). See
  `docs/02_legacy_grab_spec.md` "OTF is not a design source."

## v0.5 — automate interface + output-determination capture; fix the real perf bug

- **Fixed the actual bottleneck**: driver-program candidates were being found
  by rescanning every Z*/Y* program's source **once per form**
  (O(forms × programs) in redundant `TADIR`/`READ REPORT` calls).
  `build_driver_index` now does one pass over every program, checked against
  every form name in memory. This was the real slowdown, not a lack of
  parallel work processes.
- **Form interface (section 2) is now automated**, via
  `SELECT parameter, paramtype FROM fupararef WHERE funcname = @fm AND
  r3state = 'A'` — a pattern already verified in the `ZAB_V1_UT` engineering
  log (A18), specifically built to avoid guessing an FM signature like
  `FUNCTION_IMPORT_INTERFACE`'s.
- **Output determination / NACE (section 4) is now automated**, via
  `SELECT * FROM tnapr` (no field-name guess needed — there's no `WHERE`)
  plus a new generic reflection-based dump helper (`dump_any`, built on
  `cl_abap_typedescr`) that scans every column of every row for the form
  name, so no `TNAPR` column name has to be assumed either.
- SmartStyle / logo / form-outline (sections 5-7) stay manual — the likely
  API (`SSF_READ_FORM`) isn't confirmed on this system yet; see
  `docs/02_legacy_grab_spec.md` for the 2-minute SE37 lookup that unlocks it.
- **True multi-work-process parallel dispatch investigated, deliberately
  deferred to its own increment** — `GUI_DOWNLOAD` can't run in a parallel
  work process (no GUI), and inspecting `ZCL_AB_V1_UT_BULK`'s real
  implementation found its `iv_context` parameter is never actually delivered
  to handler instances (logged in `Utility-Class-and-Method/docs/00_engineering_log.md`
  A25). See `docs/02_legacy_grab_spec.md` "Performance" section for the full
  reasoning.

## v0.4 — fix CALL_FUNCTION_CONFLICT_TYPE dump in RESOLVE_FM_NAME

- `SSF_FUNCTION_MODULE_NAME`'s `FORMNAME` parameter is a fixed-length classic
  type, not `STRING` — passing `IV_FORMNAME TYPE string` directly dumped
  `CALL_FUNCTION_CONFLICT_TYPE`. Fixed by converting to a `CHAR30` local
  before the call. See `docs/BUILD_ISSUES_LOG.md` F1.

## v0.3 — F4 folder picker for the output path

- `ZSF2AF_R_LEGACY_GRAB`: `AT SELECTION-SCREEN ON VALUE-REQUEST FOR p_path` now
  opens a folder-browse dialog (`CL_GUI_FRONTEND_SERVICES=>DIRECTORY_BROWSE`)
  instead of requiring the path to be typed by hand. Auto-appends a trailing
  `\` to whatever folder is picked.

## v0.2 — use existing ZABAP_UTIL package

- Reused the existing shared `ZABAP_UTIL` package (already used by VS-Tower,
  Dangote_Requirements, ZAB_V1_UT) instead of creating a dedicated
  `ZFORM_UTIL`. `src/package.devc.xml` carries its own `CTEXT`, matching the
  Dangote precedent for a package shared across repos.

## v0.1 — Phase 1a: repo scaffold + legacy-grab tooling

- Repo created, registered in the Bolt Playbook Project Register
  (`VernasoftTechie/Smartform-Adobe-Migration`, package `ZABAP_UTIL`, stem `SF2AF`).
- `docs/01_scope.md` — finalized scoping document + risk framework + phase plan
  (approved).
- `docs/02_legacy_grab_spec.md` — legacy-grab capture spec (what is automated in
  v1 vs. left as a manual, clearly-labelled placeholder, and why).
- `src/zsf2af_r_legacy_grab.prog.abap` — first build: per-form markdown snapshot
  generator. Automates: form-name resolution to its generated function module
  (`SSF_FUNCTION_MODULE_NAME`), driver-program candidate discovery (source scan
  of Z*/Y* programs for the form name + `SSF_FUNCTION_MODULE_NAME`), optional
  TADIR-based form auto-discovery (object type `SSFO`, best effort — verify
  count against SE71). Deliberately leaves interface parameter list, output
  determination (NACE), SmartStyle, logo, and form outline as manual sections —
  no confirmed read API for those yet; see `02_legacy_grab_spec.md`.

**Status:** awaiting first run against the target system. Not yet activated /
pulled — `ZABAP_UTIL` already exists (shared with VS-Tower / Dangote /
ZAB_V1_UT), no new package to create.
