# CLAUDE.md — Smart Form to Adobe Form Migration (ZSF2AF)

## ALWAYS do this first

Before writing or changing any ABAP source, any abapGit serialized object
(`.prog.*`, `.clas.*`, etc.), or before concluding a piece of code "should work":
read the **Bolt Playbook** (`memory:bolt_playbook`, canonical copy at
`docs/00_BOLT_PLAYBOOK.md` in `VernasoftTechie/Employee-360`) — same governance
applies here as every other Vernasoft SAP build: scoping doc → phases → Commit
Gate → increment/activate/fix-loop.

Then read [`docs/01_scope.md`](docs/01_scope.md) (requirement, risk framework,
phase plan), [`docs/02_legacy_grab_spec.md`](docs/02_legacy_grab_spec.md)
(what the legacy grab captures automatically vs. manually, and why),
[`docs/04_global_style_catalogue.md`](docs/04_global_style_catalogue.md) and
[`docs/05_individual_form_conversion_framework.md`](docs/05_individual_form_conversion_framework.md)
(the per-form design procedure).

## Project facts

- Target: **S/4HANA, on-premise, ADS (Adobe Document Services) already live**.
- Repo layout: flat `/src/`, abapGit `FOLDER_LOGIC=PREFIX`, package `ZABAP_UTIL`
  (existing package, shared with VS-Tower / Dangote_Requirements / ZAB_V1_UT —
  this repo ships its own `src/package.devc.xml` description, Dangote-style).
- Object stem: `SF2AF`. Naming per Bolt Playbook §1.4 (`Z<STEM>_*`).
- Nothing about a specific Smart Form (interface, style, logo, driver program) is
  ever invented — it is read from a legacy-grab snapshot in
  `docs/legacy_grab/<form>.md`, or confirmed live in the system, before any
  conversion code is written. This mirrors the "never invent an SAP field name"
  rule that has burned other Vernasoft projects twice already.

## Working rules

- **Architecture confirmed 2026-09-12 — driver programs are read-only,
  forever.** This project's deliverable is the Adobe Form **design +
  interface only**. Driver programs are read to understand calling context
  (multiple drivers can call the same form for different purposes) — **never
  modified, never rewritten.** How an existing driver eventually reaches the
  new Adobe Form is a separate, later, per-driver decision this project does
  not propose or build (`docs/01_scope.md` §8).
- Architecture/scope approval before implementation (Rulebook §8 / Playbook §2 Step 3).
- Every form is risk-scored (docs/01_scope.md §Risk framework) before it is converted.
- The interface is preserved **exactly** from each snapshot's §2 — whatever
  eventually calls the Adobe Form must see an unchanged contract.
- Style/logo needs are matched against the **Global Style Catalogue**
  (`docs/04_global_style_catalogue.md`) before designing anything form-specific.
- Anything a form's design can't resolve becomes a named **Developer
  Extension Point** + a post-implementation checklist entry
  (`docs/05_individual_form_conversion_framework.md`) — never a silent gap
  and never a reason to block sign-off.
