# Global Style & Asset Catalogue — process

**Goal:** instead of a bespoke SmartStyle-to-Adobe-style translation done
fresh for every form, consolidate every logo and style found **across all
forms** into a small, reusable set of Global Adobe Styles + a shared logo
library — then match each individual form against that catalogue instead of
designing its style from scratch. Confirmed 2026-09-12.

## Why

Real Smart Form estates typically have far fewer *distinct* visual patterns
than they have forms — most invoices share a header style, most letters
share a body paragraph format, one or two logos cover the whole company.
Building one Adobe style per form multiplies work and produces drift (the
same "body text" ends up subtly different across ten forms). A rationalized
catalogue, matched once, gives consistency across the whole migrated estate
and far less design work per form after the first few.

## Process

0. **Sweep first, system-wide, once** — run `ZSF2AF_R_LEGACY_GRAB` with
   `P_GLOB` ticked (instead of per-form fields). One pass produces
   `global_smartstyles.txt` (every SmartStyle name in the system, via
   TADIR object type `SSST`) and `global_logos.txt` (every SE78-registered
   graphic, via `SELECT * FROM stxbitmaps`). This is the master inventory —
   built once, not rediscovered per form. Drop both files into
   `docs/legacy_grab/` and roll them into
   [`06_global_findings.md`](06_global_findings.md).
1. **Match per form, don't research** — for each form, section 6/7 of its
   snapshot only needs ONE thing looked up in SE71 (which SmartStyle name /
   which graphic it uses) — that name should already be in the sweep output,
   so it's a lookup, not fresh research. Log the match in
   `06_global_findings.md`.
2. **Propose** — once enough forms are matched (or at natural review points,
   e.g. after Phase 1b/1c or after each wave), Bolt proposes a **rationalized
   set of Global Adobe Styles** in this doc's §Catalogue below — each one
   named for its purpose (not its source SmartStyle), with the SmartStyles it
   supersedes and its status.
3. **Build once** — each Global Adobe Style gets built **once**, in SFP/Adobe
   LiveCycle Designer, as a small fixed set of paragraph/character formats +
   a cleaned logo asset library (correctly sized/cropped for Adobe forms) —
   not per form. When converting an individual form
   (`05_individual_form_conversion_framework.md`), reuse whatever it matched
   to in step 1. Only create a form-specific override where the catalogue
   genuinely doesn't fit — and when that happens, log the override back into
   `06_global_findings.md` as a candidate new global style if it looks
   reusable elsewhere.

## §Catalogue (proposed Global Adobe Styles)

> Empty until Phase 1c has enough logged findings to propose from. Each row:
> a Global Style Bolt proposes, what it's for, which SmartStyles it
> supersedes, and its build status.

| Global style name | Purpose | Supersedes (SmartStyle names) | Status |
|---|---|---|---|
| _(none proposed yet)_ | | | |

## §Logo / asset library (proposed)

| Asset name | Purpose | Source (form / MIME object) | Status |
|---|---|---|---|
| _(none proposed yet)_ | | | |

## When a form can't be matched

If a form's style/logo need doesn't fit any catalogue entry and building a
new global style isn't justified by reuse, it's a **form-specific override**
— allowed, but always logged (which form, what override, why) so the
catalogue's rationale stays visible and future forms don't quietly diverge
the same way twice.
