# Individual Form Conversion Framework

The repeatable procedure for turning one form's legacy-grab snapshot into a
signed-off Adobe Form **design**. Confirmed 2026-09-12: design + interface
only — no driver program is ever touched by this procedure.

## Naming convention — every form's Adobe deliverable

**Confirmed 2026-09-13**: the Adobe Form object and interface both take
the original Smart Form's exact name with `_ADF` appended — e.g.
`Z_MM_PR_FORM` → `Z_MM_PR_FORM_ADF`. Applies uniformly to every file for
that form:

| File | Pattern | Example |
|---|---|---|
| Data schema | `<name>_ADF.XSD` | `Z_MM_PR_FORM_ADF.XSD` |
| Layout template | `<name>_ADF.XDP` | `Z_MM_PR_FORM_ADF.XDP` |
| Form object (abapGit) | `SFPF_<name>_ADF.XML` | `SFPF_Z_MM_PR_FORM_ADF.XML` |
| Interface object (abapGit) | `SFPI_<name>_ADF.XML` | `SFPI_Z_MM_PR_FORM_ADF.XML` |

This naming is deliberately **not** the `Z<STEM>_*` pattern used for this
project's own tooling objects (`ZSF2AF_R_LEGACY_GRAB`) — Adobe Form
deliverables live in the *client's* existing SAP namespace, one-to-one with
the Smart Form they replace, not this project's own object stem.

**Landing zone — confirmed pilot-only, 2026-09-13**: all four files go in
`/src/` (never `docs/` — this repo's `.abapgit.xml` explicitly ignores
`docs/*`, and a file placed there is invisible to abapGit no matter how
correct its content is; hit this as a real trap on `Z_MM_PR_FORM_ADF`,
logged as F5 in `docs/BUILD_ISSUES_LOG.md`). For now, that means package
`ZABAP_UTIL` — this repo's only package — **as an explicit, temporary,
pilot-only decision**, not a settled architecture. Package `ZABAP_UTIL` is
Vernasoft's own shared utility package (also used by VS-Tower,
Dangote_Requirements, ZAB_V1_UT, and this project's own tooling); mixing
client deliverable forms into it long-term is a real mismatch worth
revisiting once there's more than one form to plan around — the user has
explicitly deferred that decision, not settled it.

## Prerequisites

- `docs/legacy_grab/<form>.md` is complete (all 11 sections — automated
  sections filled by the report, manual sections filled by hand).
- `docs/04_global_style_catalogue.md` has at least a first-pass catalogue
  (doesn't need to be complete — new global styles can still be proposed
  mid-conversion).

## Step 1 — Read & understand (read-only, nothing is modified)

- **Interface** (snapshot §2): the exact contract the Adobe Form's interface
  must preserve.
- **Driver program(s) + includes + dependencies** (snapshot §3): read to
  understand *why* and *how* this form is called — business context, any
  side effects, whether multiple drivers call it for different purposes.
  **Never edited.** If the driver logic is genuinely unclear, that's a
  question for the functional owner, not something to infer and build
  around silently.
- **Output determination** (snapshot §4): informs the later, separate
  wiring decision (Phase 6) — not acted on now.

## Step 2 — Design the Adobe Form

**Confirmed 2026-09-13 — Bolt designs the form from the real export;
the SFP wizard is not used.** Earlier drafts of this doc treated the SFP
"Create Adobe Form by Migration" wizard as the design source. User
overrode that: Bolt reads the Smart Form's own `Utilities → Download`
XML export directly (proven working, `docs/02_legacy_grab_spec.md`) and
produces the full design from it — window-by-window position/size, style
mapping, field bindings — never SAP's auto-migration. The wizard's ~80-85%
baseline is no longer the starting point for this project.

1. **Bolt reads the real export.** The form's `Utilities → Download` XML
   (`<sf:SMARTFORM>`, one `<sf:WINDOW>` per window with position/size in cm
   and its `<sf:NODE>` children) plus the SmartStyle's own XML export. Large
   exports (hundreds of KB, essentially one line) get read via byte-offset
   extraction (`grep -bo` + `tail -c` in Bash), not the normal line-based
   Read/Grep tools.
2. **Bolt produces two artifacts per form:**
   - a **blueprint** (`<form>_blueprint.html`) — the design read: window
     map, field bindings, findings, risk score, the proof chain tying the
     form's own references back to the global style/logo catalogue;
   - a **build checklist** (`<form>_build_checklist.md`) — the literal,
     numbered build spec: exact subform positions/sizes in cm, exact
     column widths, font/style mapping, explicit exclusions (dead code,
     debugger statements), and Developer Extension Points for anything
     that needs a decision.
3. **User builds it in SFP/Adobe LiveCycle Designer**, following the
   checklist field-by-field, and pushes the result (export, screenshot, or
   whatever abapGit will serialize) back into `docs/legacy_grab/` with any
   adjustment notes.
4. **Bolt confirms** the built form against the blueprint, item by item,
   before it goes to UT.
5. **Match style/logo needs against the Global Style Catalogue**
   (`04_global_style_catalogue.md`). Apply matched global styles. Where
   nothing fits, create a form-specific override and log it back into the
   catalogue as a candidate.
6. **Preserve the interface exactly** — same parameter names/shape as
   snapshot §2, so whatever eventually calls this form (this project doesn't
   decide what, or when) sees an unchanged contract.
7. **Where something can't be resolved** — no catalogue match, no way to
   verify a layout detail, or a decision needs business input — don't block.
   Leave a clearly named, empty **Developer Extension Point** (a named
   placeholder subform/field with an annotation explaining what belongs
   there) and add it to this form's entry in §Post-implementation checklist
   below.
8. **Special Adobe-specific features** (dynamic table flow, digital
   signature fields, proper interactive form controls, etc.) may be used at
   Bolt's judgment where they genuinely improve the form and fit its risk
   tier — always called out explicitly as "Enhancement: `<what, why>`" in
   the form's notes, never silently added.

## Step 3 — Validate

Run the same real document through both forms and diff visually:
- Old Smart Form → OTF (`GETOTF = 'X'`) → PDF (`CONVERT_OTF`).
- New Adobe Form → its own PDF, fed the same interface data.

This validates design fidelity standalone — it needs a real document key,
not a live driver call, and doesn't require anything to be wired up.

## Step 4 — Sign-off

Business owner reviews and signs off the design. High/Critical-risk forms
need a **named** sign-off (never auto-approved).

## Step 5 — Wiring (separate, later, not part of this framework)

How an existing (unmodified) driver eventually reaches this Adobe Form is
decided **per driver**, by that driver's owner, after the design is signed
off — a NACE config repoint where feasible, a new parallel entry point
otherwise, or left as a deliberate administrative decision. This project
does not propose or build that wiring.

## §Post-implementation developer checklist (per form)

> One row per unresolved item left as a Developer Extension Point. This is
> the punch list handed to a developer after the design phase — nothing on
> it should have blocked the design from being signed off.

| Form | Item left open | Why | Suggested next step |
|---|---|---|---|
| _(populate per form as conversions happen)_ | | | |
