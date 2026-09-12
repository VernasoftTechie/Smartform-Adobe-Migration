# 07 – Design Approach Decision Framework

**Status: APPROVED — controlled-pilot procedure, 2026-09-12.** Requested
directly: *"we need to prepare a framework around this before starting the
design .. deciding which one to go with in the beginning step itself is a big
key for us."* The portfolio queues and mandatory evidence are defined in
[`08_migration_operating_model.md`](08_migration_operating_model.md).

## Why this exists

The `Z_MM_PR_FORM_ADT` pilot has gone through 17 logged build issues
(`docs/BUILD_ISSUES_LOG.md` F1–F17) before reaching a state where the
layout can be safely rebuilt. Some of that cost was irreducible (SFP's
own Context/Reference-Field mechanics have no F4 help and had to be
reverse-engineered from real files). But some of it was **avoidable up
front** if we'd known this form's specific complexity signals before
starting — e.g. that absolute-layout structure must be validated in the
target SFP release before it is generalized (F11/F15), or that its table's
QUAN/CURR fields would need `CL_FP_REFERENCE_FIELDS` (F9/F10). This
framework turns those 17 lessons
into a **checklist applied before design starts**, so the next form's
build issues are the genuinely-new ones, not repeats.

## Reference material

`instructions/ADOBE_FORMS_DESIGN_MASTER_RULEBOOK.md` — a general
(India-market-flavored, not Dangote-specific) Adobe Forms design
reference the user supplied 2026-09-12. Its A/B/C complexity
classification and SmartForm→Adobe mapping matrix inform Step 0 below.
Its generic beautification guidance (Helvetica + blue palette) does
**not** apply to any form with its own captured SmartStyle/brand
reference, per that file's maintainer's note — flagged there as a
conflict with the pixel-matching instruction already governing this
project, not silently adopted.

## Step 0 — before any design work, classify the form

Run this against the form's legacy-grab snapshot
(`docs/legacy_grab/<form>.md`). Answer each question; the answers decide
the path in Step 1.

| Signal | Check in the legacy-grab snapshot | Why it matters |
|---|---|---|
| **Embedded logic** | Does the Smart Form have `CODE` / "Program Lines" nodes with real ABAP (DB reads, BAPI calls, text/TDLINE lookups)? | If yes, that logic has to land somewhere — either `CL_FP_CODING`/`INITIALIZATION` (server-side, proven to work per the `Z_INT_MM_PR_FORM` reference) or FormCalc/JS (client-side, cannot call BAPIs/DB). Pick which, per node, before designing the layout — not after (this project's own watermark/email logic, §6.1/6.2 of the build checklist, is still an open item for exactly this reason). |
| **Layout shape** | Are windows placed at fixed x/y coordinates (absolute layout), or does content just flow top-to-bottom? | Absolute layout needs a known-rendering SFP structure for the target release. The repository has conflicting historical reference patterns; F15 established that only the Hello World sibling-of-`pageSet` pattern was verified in this environment. Start from an SFP-created minimal baseline and add content incrementally; do not infer a universal nesting rule from an unverified reference. |
| **QUAN/CURR fields in tables** | Does the line-item table type (e.g. `ZTABLE_PR_PRINT`) carry quantity or currency fields? | Every one needs a resolvable Reference Field (F9/F10) — budget time for this; it has no F4 help in SFP. |
| **A real sibling reference exists** | Has this exact form, or a close sibling, already been migrated by someone else and can be pulled via abapGit/SE38? | This has been the single biggest accelerant on this pilot (3 real references cracked 8 of the 12 issues). A form with **no** real reference to check against is materially higher-risk than one with one. |
| **Driver/output-determination complexity** | How many drivers call this form, for how many different purposes? | Doesn't change the design approach, but affects the eventual cutover risk-score already in `docs/01_scope.md`. |
| **Overall complexity tier** | Static header + one table + fixed footer (**Level A**)? Dynamic tables + conditional sections + running totals (**Level B**)? Nested tables + QR/barcode + watermark + multi-language (**Level C**)? | Borrowed from `instructions/ADOBE_FORMS_DESIGN_MASTER_RULEBOOK.md` §4. A rough sizing signal, not a design mandate - `Z_MM_PR_FORM_ADT` is roughly Level B/C (watermark, multi-value table, conditional email) and is being hand-authored anyway. |

## Step 1 — pick the path

**Path A — Standard SFP-created baseline, blueprint-led build (required).**
Bolt derives the design from the legacy-grab snapshot and produces the
pixel-matched checklist. SFP/LiveCycle creates and saves the initial form,
then abapGit **Stage → Commit → Push** exports that generated SFPF/SFPI/XDP
serialization. Build the
checklist on top of that known-rendering baseline. This is the mandatory path
for every form because it preserves design control without fabricating
Designer/SFP internal state.

**Path B — Wizard-seeded skeleton (exception only).** Use SFP's "Create Adobe
Form by Migration" wizard only after Path A's standard baseline exists and
only with explicit per-form approval. Bolt redesigns all visual, layout, and
mapping decisions to match the blueprint; the wizard supplies plumbing, not
the design.

**Recommendation for right now:** use Path A for `Z_MM_PR_FORM_ADT`. Create
and save a fresh minimal Adobe Form in SFP/LiveCycle, then export it through
abapGit **Stage → Commit → Push**. The current object is known to be
corrupted/unresponsive (F17), so
it is not close to sign-off. Do not restore the full layout until the
SFP-created baseline has rendered and become editable, then add only one
verified checklist section at a time.

## Step 2 — sign-off gate

No form's design work starts until its Step 0 answers + chosen path are
written into its own section here (or a per-form addendum), confirmed by
you. Mirrors the existing per-form risk-scoring in `docs/01_scope.md` —
this is the design-approach equivalent of that gate.

Path B remains a documented contingency, not the current pilot choice. It
requires explicit per-form approval because the project baseline must be
created and captured by the standard SFP workflow.
