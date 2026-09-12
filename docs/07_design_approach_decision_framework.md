# 07 – Design Approach Decision Framework

**Status: DRAFT — proposed 2026-09-12, for your adjustment before it
becomes standing procedure.** Requested directly: *"we need to prepare
a framework around this before starting the design .. deciding which
one to go with in the beginning step itself is a big key for us."*

## Why this exists

The `Z_MM_PR_FORM_ADT` pilot has gone through 12 logged build issues
(`docs/BUILD_ISSUES_LOG.md` F1–F12) before reaching a state where the
layout might actually render. Some of that cost was irreducible (SFP's
own Context/Reference-Field mechanics have no F4 help and had to be
reverse-engineered from real files). But some of it was **avoidable up
front** if we'd known this form's specific complexity signals before
starting — e.g. that it needed absolute-position layout nested inside
`<pageArea>` (F11), or that its table's QUAN/CURR fields would need
`CL_FP_REFERENCE_FIELDS` (F9/F10). This framework turns those 12 lessons
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
| **Layout shape** | Are windows placed at fixed x/y coordinates (absolute layout), or does content just flow top-to-bottom? | Absolute layout requires the root subform `layout="tb"` + every positioned subform nested **inside `<pageArea>`** (F11). Flow-only content is simpler and closer to what SFP's own wizard produces natively. |
| **QUAN/CURR fields in tables** | Does the line-item table type (e.g. `ZTABLE_PR_PRINT`) carry quantity or currency fields? | Every one needs a resolvable Reference Field (F9/F10) — budget time for this; it has no F4 help in SFP. |
| **A real sibling reference exists** | Has this exact form, or a close sibling, already been migrated by someone else and can be pulled via abapGit/SE38? | This has been the single biggest accelerant on this pilot (3 real references cracked 8 of the 12 issues). A form with **no** real reference to check against is materially higher-risk than one with one. |
| **Driver/output-determination complexity** | How many drivers call this form, for how many different purposes? | Doesn't change the design approach, but affects the eventual cutover risk-score already in `docs/01_scope.md`. |
| **Overall complexity tier** | Static header + one table + fixed footer (**Level A**)? Dynamic tables + conditional sections + running totals (**Level B**)? Nested tables + QR/barcode + watermark + multi-language (**Level C**)? | Borrowed from `instructions/ADOBE_FORMS_DESIGN_MASTER_RULEBOOK.md` §4. A rough sizing signal, not a design mandate - `Z_MM_PR_FORM_ADT` is roughly Level B/C (watermark, multi-value table, conditional email) and is being hand-authored anyway. |

## Step 1 — pick the path

**Path A — Hand-authored from scratch (this pilot's approach).**
Bolt designs the XDP/XSD/SFPF/SFPI directly from the legacy-grab
snapshot, matching the build checklist pixel-for-pixel. Full design
control stays with Bolt, per your original instruction. Best suited to
forms where: a real reference exists to validate structural conventions
against, OR the form is simple enough (flow-layout, no embedded logic,
no QUAN/CURR table fields) that there's little left to get wrong.

**Path B — Wizard-seeded, Bolt-corrected.** Use SFP's "Create Adobe Form
by Migration" wizard *only* to generate a structurally-valid skeleton
(correct root name, bind syntax, `<pageArea>` nesting, Context —
everything SAP's own tooling gets right by construction, which is
exactly the class of bug F7/F8/F11 turned out to be), then Bolt
redesigns every visual/layout/mapping decision on top of it to 100% match
the blueprint — the wizard only ever supplies plumbing, never the
design. This directly conflicts with your earlier instruction (*"I'll
not use SAP tool to design the adobeform .. the entire design has to be
taken care by you from the scratch"*) — **flagging it, not adopting it
silently.** Worth considering only for forms with embedded logic +
absolute layout + no real reference available, where Path A's risk
compounds with nothing to validate against.

**Recommendation for right now:** finish `Z_MM_PR_FORM_ADT` via Path A —
we're close, and switching approach mid-pilot would throw away the
now-validated structural lessons (F9–F11) that make Path A viable at
all. Apply this framework starting with the *next* form.

## Step 2 — sign-off gate

No form's design work starts until its Step 0 answers + chosen path are
written into its own section here (or a per-form addendum), confirmed by
you. Mirrors the existing per-form risk-scoring in `docs/01_scope.md` —
this is the design-approach equivalent of that gate.

## Open question for you

Does Path B (wizard-seeded skeleton, Bolt-corrected design) belong in
this framework at all, given your original instruction ruled it out
entirely? I've included it because the last 12 issues were almost all
*plumbing* SAP's own tooling gets right automatically — but the decision
to reopen that door is yours, not mine to assume.
