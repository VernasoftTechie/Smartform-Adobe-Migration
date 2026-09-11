# Individual Form Conversion Framework

The repeatable procedure for turning one form's legacy-grab snapshot into a
signed-off Adobe Form **design**. Confirmed 2026-09-12: design + interface
only — no driver program is ever touched by this procedure.

## Prerequisites

- `docs/legacy_grab/<form>.md` is complete (all 10 sections — automated
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

1. **Auto-migrate the baseline layout** via SFP → "Create Adobe Form by
   Migration from Smart Form" (the ~80-85% baseline).
2. **Match style/logo needs against the Global Style Catalogue**
   (`04_global_style_catalogue.md`). Apply matched global styles. Where
   nothing fits, create a form-specific override and log it back into the
   catalogue as a candidate.
3. **Preserve the interface exactly** — same parameter names/shape as
   snapshot §2, so whatever eventually calls this form (this project doesn't
   decide what, or when) sees an unchanged contract.
4. **Where something can't be resolved** — no catalogue match, no verified
   extraction API yet (e.g. form outline detail still pending
   `SSF_READ_FORM` automation), or a decision needs business input — don't
   block. Leave a clearly named, empty **Developer Extension Point** (a
   named placeholder subform/field with an annotation explaining what
   belongs there) and add it to this form's entry in §Post-implementation
   checklist below.
5. **Special Adobe-specific features** (dynamic table flow, digital
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
