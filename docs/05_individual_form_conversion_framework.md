# Individual Form Conversion Framework

The repeatable procedure for turning one form's legacy-grab snapshot into a
signed-off Adobe Form **design**. Confirmed 2026-09-12: design + interface
only — no driver program is ever touched by this procedure.

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

**The design comes from the SFP wizard, not from a background extraction.**
Smart Form layout (pages/windows/nodes/styles/graphics) is stored in a
compiled, proprietary form — there is no confirmed safe API to read it
directly (`SSF_READ_FORM` was tried and ruled out — see
`docs/02_legacy_grab_spec.md`; its interface is header/admin metadata, not a
layout read). SAP's own sanctioned tool for turning that layout into an
Adobe Form **is** the migration wizard, so it is the design source, not a
workaround:

1. **Run the wizard** — SFP → "Create Adobe Form by Migration from Smart
   Form", against the form named in the snapshot (§1's generated FM confirms
   it's the right one). This produces the ~80-85% baseline layout.
2. **Get it into Bolt's hands for review.** Bolt has no live GUI/RFC access,
   so — same pull-based loop as everything else in this project — the
   result needs to reach the repo somehow. Try, in this order:
   - **abapGit**: after running the wizard, check whether the new Adobe
     Form object (transaction `SFP`) shows up as a pullable/stageable object
     in the package — if abapGit can serialize it, that becomes the review
     channel (same as every ABAP object in this project) and this bullet
     gets replaced with the confirmed answer.
   - If abapGit can't serialize it: a screenshot of SFP's layout/preview
     screen, or an exported PDF from a test run, gives Bolt something
     concrete to review and suggest refinements against — not as good as
     text/XML, but still real data, never a description.
3. **Match style/logo needs against the Global Style Catalogue**
   (`04_global_style_catalogue.md`). Apply matched global styles. Where
   nothing fits, create a form-specific override and log it back into the
   catalogue as a candidate.
4. **Preserve the interface exactly** — same parameter names/shape as
   snapshot §2, so whatever eventually calls this form (this project doesn't
   decide what, or when) sees an unchanged contract.
5. **Where something can't be resolved** — no catalogue match, no way to
   verify a layout detail, or a decision needs business input — don't block.
   Leave a clearly named, empty **Developer Extension Point** (a named
   placeholder subform/field with an annotation explaining what belongs
   there) and add it to this form's entry in §Post-implementation checklist
   below.
6. **Special Adobe-specific features** (dynamic table flow, digital
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
