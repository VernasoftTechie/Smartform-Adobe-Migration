# Smart Form to Adobe Form Migration

Risk-scored, phased migration of SAP Smart Forms to Adobe Forms **designs**
(S/4HANA, ADS live). **Design + interface only — driver programs are
read-only inputs, never modified** (confirmed 2026-09-12, `docs/01_scope.md` §8).

- [docs/01_scope.md](docs/01_scope.md) — requirement, risk framework, phase plan
- [docs/02_legacy_grab_spec.md](docs/02_legacy_grab_spec.md) — what the legacy grab
  captures automatically vs. manually, and why
- [docs/04_global_style_catalogue.md](docs/04_global_style_catalogue.md) — process
  for consolidating logos/styles found across all forms into a reusable set
- [docs/05_individual_form_conversion_framework.md](docs/05_individual_form_conversion_framework.md) —
  the repeatable per-form design procedure + post-implementation checklist
- [docs/06_global_findings.md](docs/06_global_findings.md) — raw log of styles/logos found per form
- [docs/strategy/README.md](docs/strategy/README.md) — SAP-validated baseline,
  layout, and composite-design patterns reusable by conversion branches
- [docs/legacy_grab/](docs/legacy_grab/) — one snapshot per Smart Form, produced by
  `ZSF2AF_R_LEGACY_GRAB` and dropped here before any conversion work starts
- `src/zsf2af_r_legacy_grab.prog.abap` — the legacy-grab extraction report
  (package `ZABAP_UTIL`)

Governance follows the Vernasoft **Bolt Playbook** (`docs/00_BOLT_PLAYBOOK.md` in
`VernasoftTechie/Employee-360`) — same Commit Gate, phasing doctrine and
increment discipline as every other project in the org.
