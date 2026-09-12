# Smart Form to Adobe Form Migration — Operating Model

**Status:** approved for the controlled pilot recovery and subsequent
portfolio discovery on 2026-09-12.

This is the operating model for migrating 500+ Smart Forms safely. It does
not replace the form-specific source of truth or authorize driver-program
changes.

## 1. Sources of truth and their roles

| Artifact | Purpose | Must be complete before |
|---|---|---|
| `docs/legacy_grab/<form>.md` | Exact form interface, caller evidence, output-determination evidence, risk record, and open items | Design starts |
| Smart Form + SmartStyle XML downloads beside the snapshot | Actual layout, windows, nodes, style use, and graphic references | Blueprint and build checklist |
| `docs/04_global_style_catalogue.md` + `docs/06_global_findings.md` | System-wide style/logo inventory and reusable mapping decisions | Form-specific style design |
| `<form>_blueprint.html` | Visual design evidence and layout mapping | SFP/LiveCycle build |
| `<form>_build_checklist.md` | Literal build and validation instructions | Build sign-off |
| `/src/<form>_adt.sfpf.xdp`, `.sfpf.xml`, `.sfpi.xml` | abapGit-importable Adobe Form design and interface | SAP import |

Only the serialized files in `/src/` are imported by abapGit. Downloads,
blueprints, checklists, screenshots, and comparison evidence stay under
`docs/`.

## 2. Portfolio intake: do once before Wave 1

1. Run `ZSF2AF_R_LEGACY_GRAB` with `P_GLOB` and commit the resulting
   `global_smartstyles.txt` and `global_logos.txt` under
   `docs/global_data/styles/` and `docs/global_data/logos/` respectively.
2. Populate `docs/06_global_findings.md` from that inventory and propose only
   evidence-backed entries in `docs/04_global_style_catalogue.md`.
3. For every in-scope form, capture the report snapshot plus the Smart Form
   and SmartStyle XML downloads. Do not begin a design from a verbal
   description, rendered OTF, or an unverified reference form.
4. Score business criticality, layout/logic complexity, integration,
   localization, volume, and read-only driver complexity. Assign Low,
   Medium, High, or Critical before selecting its wave.
5. Keep forms without complete evidence in the **Discovery queue**. They are
   not conversion candidates.

## 3. Per-form delivery board

Every form is in exactly one state:

| State | Entry criteria | Exit criteria |
|---|---|---|
| Discovery | Named form is in scope | Snapshot, XML exports, assets, and risk score captured |
| Design-gated | Discovery complete | Design path and extension points approved |
| Blueprinted | Design gate passed | Blueprint and literal build checklist reviewed |
| Build baseline | Fresh SFP object exists | Minimal layout renders and is editable |
| Incremental build | Baseline confirmed | One named layout increment renders and is captured |
| Validation | Full design assembled | Interface/Context captured, OTF-versus-PDF comparison completed |
| Sign-off | Validation evidence complete | Required business sign-off recorded |
| Wave-ready | Sign-off complete | Global catalogue and lessons updated |

No state may be skipped. Failed rendering returns the form to **Build
baseline**, not to a speculative whole-layout rewrite.

## 4. Adobe Form build discipline

- Driver programs are read-only. This project neither changes them nor chooses
  their later cutover mechanism.
- Preserve the legacy business-data contract. Do not add parameters merely to
  compensate for information that has not been evidenced in the snapshot or
  agreed by the form owner.
- Use an SFP-created and SFP-saved object, then export it with abapGit
  **Stage → Commit → Push** as the serialization baseline. Do not
  hand-author an XDP baseline or a
  `CL_FP_CONTEXT` object graph.
- After Context is built in SFP, immediately export it with abapGit
  **Stage → Commit → Push** so the repository owns the real generated
  Context. Later layout changes must start from that captured serialization.
- Import one minimal, independently renderable increment at a time: page
  geometry, static header, one bound field, table Context/reference fields,
  repeatable table, conditional sections, then assets/scripts.
- Treat a Design View or Print Preview result as the authority. XML
  well-formedness proves only syntax, never SFP renderability.
- If SFP becomes unresponsive or cannot place a new native field, delete and
  recreate the form and interface in SFP before another import.

## 5. Controlled pilot: Z_MM_PR_FORM

`Z_MM_PR_FORM_ADT` is a **Medium-risk pilot in Build baseline**, not a finished
Adobe Form. Its SFP-generated baseline was captured in the SAP-side abapGit
push at `c507878`; its populated Context must not be replaced by a
hand-authored SFPF/SFPI object. The first visual-shell increment is now
limited to page geometry, logo, heading, and header/value fields.

The next SAP-side action is:

1. Create the form and interface directly in SFP; do not pull over them.
2. Confirm a native static field renders and is editable.
3. Export the clean baseline with abapGit **Stage → Commit → Push**.
4. Build Context in SFP, correct the live reference-field errors, and export
   the generated Context with abapGit **Stage → Commit → Push**.
5. Reintroduce one checklist section per import/preview cycle.

The pilot may not be marked complete until the 31-field/dual-table evidence,
`T_TEXT` semantics, real output comparison, and open business decisions are
resolved or recorded as Developer Extension Points.

## 6. Required evidence at every gate

| Gate | Evidence to retain |
|---|---|
| Design gate | Snapshot, Smart Form XML, SmartStyle XML, risk score, chosen path |
| Build baseline | SFP Design View screenshot or recorded successful preview |
| Each increment | Named checklist section, SFP preview result, activation errors if any |
| Validation | Old-form OTF-derived PDF and Adobe PDF from identical business data |
| Sign-off | Visual comparison result and named business approver for High/Critical forms |

New SAP/SFP failures are added to `docs/BUILD_ISSUES_LOG.md`; reusable
process lessons are reflected in this operating model and the relevant
framework document.

## 7. Main repository and conversion-branch contract

`main` is the shared migration hub. It contains governance, the
`docs/global_data/` SmartStyle/SE78 library, global style/logo inventories,
naming/package standards, `docs/strategy/`, sample forms, the central
engineering history, and the central bug log. It contains no unrelated
individual-form business evidence.

Each conversion branch contains only its form or wave's immutable legacy
downloads, read-only program/NACE extraction, risk record, blueprint, build
checklist, validation evidence, and pullable SFPF/SFPI/XDP output. A branch
reads the shared strategy catalogue before design. When it resolves a new SAP
or Designer behavior, it records the incident in the central bug log and
promotes the now-validated pattern to `docs/strategy/` on `main`.

This creates flexibility without allowing branches to silently diverge from
the safe baseline, naming, asset, or capture rules.
