# Legacy Grab — what's captured automatically vs. manually, and why

`ZSF2AF_R_LEGACY_GRAB` produces one markdown snapshot per Smart Form
(`docs/legacy_grab/<form>.md`). This is the source of truth Bolt reads before
designing any driver-program rewrite or conversion mapping — never a
description of the form, the actual extracted facts.

## Why some sections are automated and others aren't

Every past Vernasoft project that invented an SAP field, table, or API
signature paid for it in dead activation rounds (Bolt Playbook Appendix A10/A11).
Smart Forms carries the same risk one level up: a wrong table field is a
runtime miss, but a wrong **function module signature** hard-coded into a
report can be a **compile-time failure that blocks the whole object from
activating**, or — as happened with `SSF_FUNCTION_MODULE_NAME` in v0.4 — a
runtime type-conflict dump even when the parameter *name* is right (see
`docs/BUILD_ISSUES_LOG.md` F1). So this report only automates a read once the
underlying API is either extremely well-established, or — better — a pattern
**already verified and logged** by another Vernasoft project. Anything else
stays a clearly labelled manual section rather than a guess.

## Automated (Tier 1)

| Captured | How | Confidence |
|---|---|---|
| Form → generated function module | `CALL FUNCTION 'SSF_FUNCTION_MODULE_NAME'` (`FORMNAME` in, `FM_NAME` out) — converted to a fixed `CHAR30` local first (F1 fix) | high — the textbook Smart Form driver pattern, now dump-safe |
| Form list (optional auto-discovery) | `TADIR` where `PGMID = 'R3TR'`, `OBJECT = 'SSFO'` | best-effort — verify hit count against SE71 the first time |
| **Form interface** (import/export/tables/exceptions) | `SELECT parameter, paramtype FROM fupararef WHERE funcname = @fm AND r3state = 'A'` | **verified** — this exact pattern is already proven in `Utility-Class-and-Method/docs/00_engineering_log.md` A18, built precisely to avoid guessing a `FUNCTION_IMPORT_INTERFACE`-style signature |
| Driver-program candidates | Single pass over every Z*/Y* program's source (`READ REPORT`), checked against every form name at once — see performance note below | high — plain ABAP statements, no DDIC/FM guess |
| **Output determination (NACE)** | `SELECT * FROM tnapr` (no field-name guess in the `WHERE` — there isn't one) + a generic reflection-based dump (`dump_any`, via `cl_abap_typedescr`) that scans every column of every row for the form name | high — `SELECT *` needs no field names; RTTI reflection needs no assumed column names either |
| Snapshot delivery | `GUI_DOWNLOAD` to the local frontend | high — standard, ubiquitous |

## Still manual (Tier 2)

| Left manual | Why | How to capture it now |
|---|---|---|
| SmartStyle(s) used | Style/format lists live inside Smart Form's internal storage — no table-based or generically-reflectable read confirmed yet (unlike TNAPR, there's no simple flat table to `SELECT *` from) | SE71 → Form Attributes → Output Options, then SMARTSTYLES |
| Logos/graphics | MIME Repository object names live inside the form definition, not a simple table read | SE71 window tree → Graphic node, export via SE80 MIME Repository |
| Form outline (pages/windows/node types) | Same reason | Walk the SE71 navigation tree |

**Unlocking these next round:** the likely API is `SSF_READ_FORM` (reads the
whole form definition into one deep structure — page/window/node tree, style
name, graphic references). Its exact signature isn't confirmed on this
system yet. **A 2-minute SE37 lookup** (search `SSF_READ_FORM`, or pattern
`SSF_*`, and check its parameters) is enough to wire it in safely next round —
once confirmed, it can likely also feed the generic `dump_any` reflection
dump the way TNAPR does now, so no field names need to be guessed there
either.

## Performance: the real bottleneck, and what was and wasn't done about it

The original build rescanned **every** Z*/Y* program's source **once per
form** — O(forms × programs) in redundant `TADIR` reads and `READ REPORT`
calls. That was the actual slow part, not a lack of parallel work processes.
Fixed in v0.5: `build_driver_index` does a **single pass** over every program
(checked against every form name in memory, which is cheap), so the cost is
now O(programs) once, not O(programs) per form.

**True multi-work-process parallel dispatch was investigated and deliberately
deferred**, not skipped:
- `GUI_DOWNLOAD` (and `cl_gui_frontend_services` generally) requires an active
  SAP GUI session and **cannot run inside a parallel/background work
  process** — only the data-gathering half of the work could be parallelized,
  the file-write to the frontend would still have to happen back on the main
  dialog process afterward.
- The existing shared framework for this (`ZCL_AB_V1_UT_BULK~run_parallel`,
  package `ZABAP_UTIL`) is the right tool for the data-gathering half — but
  inspecting its real implementation
  (`Utility-Class-and-Method/src/zcl_ab_v1_ut_bulk.clas.locals_imp.abap`)
  found that its documented `iv_context` parameter (meant to hand shared setup
  data, like a pre-built driver index, to every parallel work-process
  instance) is **never actually delivered** to the handler object — `do( )`
  stores it on the dispatcher but never passes it into
  `CREATE OBJECT lo_handler TYPE (mv_handler_class)`. Building a handler class
  around receiving that context would silently not work.
- Stacking a new global handler class + app-server staging + a fix to another
  project's shared framework onto the *same* round as several other unverified
  reads would break the Bolt Playbook's own increment-sizing rule (§4.3 —
  never batch several risky, unverified objects into one round). It's staged
  as the next increment instead, once Tier 1 automation here is confirmed
  working end to end.

## Workflow

1. Run `ZSF2AF_R_LEGACY_GRAB` (package `ZABAP_UTIL`) — Tier 1 sections fill
   themselves in; fill the Tier 2 sections of each downloaded `.md` while the
   form is open in SE71/NACE.
2. Drop the completed files into `docs/legacy_grab/` in this repo, commit, push.
3. Bolt reads the snapshots directly and produces the risk score, the driver
   rewrite, and the conversion checklist from them — never from a description.
