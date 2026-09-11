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

1. **Collect** — for every completed `docs/legacy_grab/<form>.md`, read
   section 5 (SmartStyle) and section 6 (Graphics/logos) once they're filled
   in (manually today, pending `SSF_READ_FORM` automation — see
   `02_legacy_grab_spec.md`).
2. **Log** — every distinct style/logo found gets one row in
   [`06_global_findings.md`](06_global_findings.md), the running raw log,
   tagged with which form(s) use it.
3. **Propose** — once enough forms are logged (or at natural review points,
   e.g. after Phase 1b/1c or after each wave), Bolt proposes a **rationalized
   set of Global Adobe Styles** in this doc's §Catalogue below — each one
   named for its purpose (not its source SmartStyle), with the SmartStyles it
   supersedes and its status.
4. **Build once** — each Global Adobe Style gets built **once**, in SFP/Adobe
   LiveCycle Designer, as a small fixed set of paragraph/character formats +
   a cleaned logo asset library (correctly sized/cropped for Adobe forms) —
   not per form.
5. **Match, don't design** — converting an individual form
   (`05_individual_form_conversion_framework.md`) starts by matching its
   logged style/logo needs against this catalogue. Reuse whatever matches.
   Only create a form-specific override where the catalogue genuinely doesn't
   fit — and when that happens, log the override back into §Findings as a
   candidate new global style if it looks reusable elsewhere.

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
