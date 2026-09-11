# 03 – Smart Form to Adobe Form Migration – Version History

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
