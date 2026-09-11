# 03 – Smart Form to Adobe Form Migration – Version History

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
