# Smart Form to Adobe Form Migration

Risk-scored, phased migration of SAP Smart Forms to Adobe Forms (S/4HANA, ADS live).

- [docs/01_scope.md](docs/01_scope.md) — requirement, risk framework, phase plan
- [docs/02_legacy_grab_spec.md](docs/02_legacy_grab_spec.md) — what the legacy grab
  captures automatically vs. manually, and why
- [docs/legacy_grab/](docs/legacy_grab/) — one snapshot per Smart Form, produced by
  `ZSF2AF_R_LEGACY_GRAB` and dropped here before any conversion work starts
- `src/zsf2af_r_legacy_grab.prog.abap` — the legacy-grab extraction report
  (package `ZABAP_UTIL`)

Governance follows the Vernasoft **Bolt Playbook** (`docs/00_BOLT_PLAYBOOK.md` in
`VernasoftTechie/Employee-360`) — same Commit Gate, phasing doctrine and
increment discipline as every other project in the org.
