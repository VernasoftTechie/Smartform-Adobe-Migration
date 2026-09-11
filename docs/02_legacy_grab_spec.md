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
report is a **compile-time failure that blocks the whole object from
activating**. So v1 of this report only automates reads built on APIs used
with very high confidence across the SAP ecosystem, and leaves everything else
as a clearly labelled manual section rather than guessing.

## Automated (Tier 1 — high-confidence standard APIs only)

| Captured | API used | Confidence |
|---|---|---|
| Form → generated function module | `CALL FUNCTION 'SSF_FUNCTION_MODULE_NAME'` (`FORMNAME` in, `FM_NAME` out) | high — the textbook Smart Form driver pattern |
| Form list (optional auto-discovery) | `TADIR` where `PGMID = 'R3TR'`, `OBJECT = 'SSFO'` | best-effort — verify hit count against SE71 the first time |
| Driver-program candidates | `READ REPORT <prog> INTO itab` + string scan for the form name literal and `SSF_FUNCTION_MODULE_NAME` | high — plain ABAP statements, no DDIC/FM guess |
| Snapshot delivery | `GUI_DOWNLOAD` to the local frontend | high — standard, ubiquitous |

## Manual for now (Tier 2 — needs on-system confirmation first)

| Left manual | Why | How to capture it now |
|---|---|---|
| Form interface (import/export/tables/exceptions) | No function-module signature for reading it back has been confirmed against this system yet | SE71/SFP → Interface tab, or SE37 → display the resolved FM |
| Output determination (NACE) linkage | Same — a table-based read (e.g. `TNAPR`) wasn't hard-coded without confirming its exact fields first | NACE → application → output type → Processing Routines tab |
| SmartStyle(s) used | Style names/format lists aren't in a table Bolt is confident of without checking | SE71 → Form Attributes → Output Options, then SMARTSTYLES |
| Logos/graphics | MIME Repository object names live inside the form definition, not a simple table read | SE71 window tree → Graphic node, export via SE80 MIME Repository |
| Form outline (pages/windows/node types) | Same reason | Walk the SE71 navigation tree |

## Upgrading a Tier 2 item to automated

Once we're working the **pilot form** (Phase 2) with real system access, confirm
the exact API in SE37/SE11 for the item in question, then it gets wired into
`ZSF2AF_R_LEGACY_GRAB` and moves to Tier 1 for every form after that — same
discipline as verifying an HR field in SE11 before using it in a CDS view.

## Workflow

1. Run `ZSF2AF_R_LEGACY_GRAB` (package `ZFORM_UTIL`) — fill in the manual
   sections of each downloaded `.md` while the form is open in SE71/NACE.
2. Drop the completed files into `docs/legacy_grab/` in this repo, commit, push.
3. Bolt reads the snapshots directly and produces the risk score, the driver
   rewrite, and the conversion checklist from them — never from a description.
