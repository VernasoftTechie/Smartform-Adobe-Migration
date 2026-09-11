# Legacy Grab — what's captured automatically vs. manually, and why

`ZSF2AF_R_LEGACY_GRAB` produces one markdown snapshot per Smart Form
(`docs/legacy_grab/<form>.md`). This is the source of truth Bolt reads before
designing any Adobe Form conversion mapping — never a description of the
form, the actual extracted facts. Driver programs are read-only inputs here,
never a target for change (`docs/01_scope.md` §8).

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
| Driver-program candidates, **full source + one level of includes + dependencies** | Single pass over every Z*/Y* program's source (`READ REPORT`), checked against every form name at once (see performance note below). For every match: the program's **full source is downloaded to its own file** (`driver_<progname>.txt`); its `INCLUDE Z.../Y...` statements are followed **one level deep** (`extract_includes`) and those programs' sources extracted too; a plain substring scan (`scan_dependencies`, no regex) on the driver **and** its includes flags lines that reference another custom object — `CALL FUNCTION 'Z.../Y...'`, `CALL METHOD ZCL_.../YCL_...`, `NEW`/`TYPE ZCL_.../YCL_...`, `INCLUDE Z.../Y...`, external `PERFORM (Z.../Y...)` | high — plain ABAP statements, no DDIC/FM guess. Dependency lines are raw evidence (the matching source line), not a parsed object name — deliberately, to avoid mis-extracting one. Include-following is bounded to one level so a chain can't run away |
| **Full prerequisite checklist** (section 11) | Static, always emitted — enumerates every category a Smart Form can depend on (SmartStyle, formats, graphics, SO10 texts, barcodes/fonts, languages, signatures, plus everything already automated above) with exact navigation per item | not automation — a completeness net so nothing gets missed in the manual pass |
| **Output determination (NACE)** | `SELECT * FROM tnapr` (no field-name guess in the `WHERE` — there isn't one) + a generic reflection-based dump (`dump_any`, via `cl_abap_typedescr`) that scans every column of every row for the form name | high — `SELECT *` needs no field names; RTTI reflection needs no assumed column names either |
| Snapshot delivery | `GUI_DOWNLOAD` to the local frontend | high — standard, ubiquitous |

## Still manual (Tier 2)

| Left manual | Why | How to capture it now |
|---|---|---|
| SmartStyle(s) used | Style/format lists live inside Smart Form's internal storage — no table-based or generically-reflectable read confirmed yet (unlike TNAPR, there's no simple flat table to `SELECT *` from) | SE71 → Form Attributes → Output Options, then SMARTSTYLES |
| Logos/graphics | MIME Repository object names live inside the form definition, not a simple table read | SE71 window tree → Graphic node, export via SE80 MIME Repository |
| Form outline (pages/windows/node types) | Same reason | Walk the SE71 navigation tree |

These live in section 6-8 of every snapshot. See the next section for exactly
what's needed to unlock automating them.

## SSF_READ_FORM's interface — probed automatically, every run

`SSF_READ_FORM` (confirmed by the user as the likely form-read API) has its
interface probed **automatically as part of every normal run** — no separate
manual step. `capture_interface( 'SSF_READ_FORM' )` runs once at the top of
`run()` (not once per form) and the result is included as **section 5** of
every form's snapshot: parameter names + IMPORTING/EXPORTING/TABLES/CHANGING/
EXCEPTIONS kind, via the same `FUPARAREF` technique as section 2.

**Correction (2026-09-12, first real snapshot back — `Z_MM_PR_FORM`):**
`SSF_READ_FORM`'s real, probed interface is `I_FORMNAME`/`I_LANGUAGE`/
`I_ACTIVE` in; `O_CAPTION`/`O_VARTEXT`/`O_FMNUMB`/`O_FMNUMB_TEST`/`O_ACTIVE`/
`O_ADMDATA` out; **no `TABLES` parameter at all**. Every export field name
reads as header/admin metadata (description/caption, internal form number,
a test-variant number, an active-version flag, an "admin data" block) — not
a page/window/node/style/graphic layout tree. **This was not the API that
unlocks sections 6-8** the way earlier notes here assumed — it looks like
the equivalent of SE71's Form Attributes → General tab, not the Layout tab.
Smart Form layout appears to be stored in a way that doesn't expose a
simple read API the way `TNAPR`/`FUPARAREF` do (those are flat config
tables; a form's compiled layout evidently isn't). Kept in every snapshot
anyway (harmless, occasionally useful for the description/version), but
sections 6-8 stay manual — not because of a missing type (as first
assumed), but because there may be no safe read API for the layout itself.
See `docs/05_individual_form_conversion_framework.md` for how the design
actually gets produced instead: SFP's **"Create Adobe Form by Migration"**
wizard, SAP's own sanctioned tool for exactly this, run per form inside the
system — not a background extraction.

`P_PROBE` still exists as a general-purpose version of the same tool, for
any *other* unfamiliar FM this project needs to call later — fill it with a
function module name and the report introspects that FM's interface the same
way, writes it to `probe_<fmname>.txt`, and stops without running the legacy
grab.

## Per-form style/logo auto-match attempt (`probe_form_storage`)

At 500+-form scale, a per-form manual SE71 lookup for every form is exactly
the repeated-effort problem the Global Style Catalogue is meant to avoid —
so sections 6-7 also attempt an **automatic match**, not just a manual
fallback. `probe_form_storage` safely tries a short list of *unverified*
candidate DB tables (`STXFOBJECT`, `STXFATTR`, `STXFHEADER`, `SSFOBJ` — none
confirmed to exist) via `cl_abap_typedescr=>describe_by_name` **at runtime**,
inside a `TRY...CATCH cx_root`: a wrong guess is a caught exception and gets
skipped, **not an activation risk** — unlike a static `SELECT` against a
guessed table name (the `STXBITMAPS` risk below), which would fail the whole
program's activation if wrong. Any table that *does* resolve is read
generically (dynamic `SELECT *` + `dump_any`, so no column names are guessed
either) and scanned for the current form's name.

If none of the four candidates land, the snapshot says so and gives the
**one action that solves this for all 500+ forms at once**, not one at a
time: an ABAP debugger breakpoint set in SE71 at the point the SmartStyle
name loads (or a Basis/ABAP colleague doing the same) reveals the real
table/field definitively — a single 5-minute session, after which the real
table name replaces the guesses here and every remaining form gets matched
automatically, not manually.

## Global sweep (`P_GLOB`) — grab all styles/logos once, not per form

SmartStyles and SE78 graphics don't need per-form re-discovery the way a
form's own internal definition does — they're each independently enumerable
system-wide:
- **SmartStyles**: `TADIR` where `OBJECT = 'SSST'` (mirrors `SSFO` for
  forms) — best-effort, but zero risk: a wrong object-type guess just
  returns zero rows, it can't error.
- **SE78 graphics**: `SELECT * FROM stxbitmaps` — same safe `SELECT *` +
  `dump_any` reflection pattern already proven for `TNAPR`, so no column
  name is guessed. The table *name* itself is a best-effort guess (unlike
  `TNAPR`, not previously used in this project) — if wrong, the `SELECT`
  fails to activate, a clean fixable error, not a silent wrong answer.

Tick `P_GLOB` (instead of filling the per-form fields) and the report writes
`global_smartstyles.txt` and `global_logos.txt` to `P_PATH` in one pass,
then stops — does not run the legacy grab. Do this **once, up front**; see
`docs/04_global_style_catalogue.md` for how it feeds the catalogue. Each
form's own section 6/7 then only needs one name looked up in SE71 and
matched against this inventory — not fresh research every time.

## OTF is not a design source — don't try to "redesign from OTF"

OTF is the **rendered print stream** for one specific document instance (real
data already merged in) — it does not contain the form's layout definition,
loops, conditions, or interface, so it cannot be used to reconstruct or
redesign a form. Its correct role is **validation, in Phase 2**: after the
pilot Adobe Form exists, run the *same* real document through the old Smart
Form with the SSF control parameter `GETOTF = 'X'` (captures
`JOB_OUTPUT_INFO-OTFDATA`), convert it to PDF via `CONVERT_OTF`, and diff it
visually against the new Adobe Form's PDF output for that same document. This
needs a real business document key per form, so it isn't something Phase 1a's
generic legacy-grab can supply — each snapshot's section 10 documents the
mechanism so it's ready to use once a pilot form is picked.

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
3. Bolt reads the snapshots directly and produces the risk score and the
   Adobe Form design from them — never from a description, and never by
   touching the driver program (`docs/01_scope.md` §8).
