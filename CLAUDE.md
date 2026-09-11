# CLAUDE.md — Smart Form to Adobe Form Migration (ZSF2AF)

## ALWAYS do this first

Before writing or changing any ABAP source, any abapGit serialized object
(`.prog.*`, `.clas.*`, etc.), or before concluding a piece of code "should work":
read the **Bolt Playbook** (`memory:bolt_playbook`, canonical copy at
`docs/00_BOLT_PLAYBOOK.md` in `VernasoftTechie/Employee-360`) — same governance
applies here as every other Vernasoft SAP build: scoping doc → phases → Commit
Gate → increment/activate/fix-loop.

Then read [`docs/01_scope.md`](docs/01_scope.md) (requirement, risk framework,
phase plan) and [`docs/02_legacy_grab_spec.md`](docs/02_legacy_grab_spec.md)
(what the legacy grab captures automatically vs. manually, and why).

## Project facts

- Target: **S/4HANA, on-premise, ADS (Adobe Document Services) already live**.
- Repo layout: flat `/src/`, abapGit `FOLDER_LOGIC=PREFIX`, package `ZFORM_UTIL`.
- Object stem: `SF2AF`. Naming per Bolt Playbook §1.4 (`Z<STEM>_*`).
- Nothing about a specific Smart Form (interface, style, logo, driver program) is
  ever invented — it is read from a legacy-grab snapshot in
  `docs/legacy_grab/<form>.md`, or confirmed live in the system, before any
  conversion code is written. This mirrors the "never invent an SAP field name"
  rule that has burned other Vernasoft projects twice already.

## Working rules

- Architecture/scope approval before implementation (Rulebook §8 / Playbook §2 Step 3).
- Every form is risk-scored (docs/01_scope.md §Risk framework) before it is converted.
- Driver program rewrites preserve the original interface signature — callers
  (output determination, transactions) must not need to change.
- Output determination is repointed via a parallel NAST condition / switch, never
  a hard cutover — Smart Form and Adobe Form run side by side until sign-off.
