# Smart Form to Adobe Form Migration — Scoping & Phase Plan

## 1. Requirement (verbatim)
> "I've got a requirement to do the smartform to adobeform conversion in SAP...
> I'm happy even if I get 80-85% accuracy in designs, rest I'll manage manually
> with your suggestions... Reading Legacy to convert ABAP for S4 scopings which
> fits best for adobe forms should be focused more. Stylings, logos and driver
> programs associated with the forms to be carefully read and converts with the
> best model. For each form risk levels should be analyzed carefully before
> taking it to operate."

**Business outcome:** every in-scope Smart Form has a functionally- and
visually-equivalent Adobe Form **design**, individually risk-scored, with its
interface preserved exactly (so any existing or future caller stays
compatible) and validated against real output. **Scope confirmed
2026-09-12: this project delivers the Adobe Form design + interface only —
never a driver-program change.** Multiple driver programs can call the same
Smart Form for different purposes; rewriting a driver to suit one purpose
risks silently breaking another, so driver programs are read-only inputs
(to understand calling context), never edited. How an existing driver
eventually reaches the new Adobe Form — a NACE config repoint, a new parallel
entry point, or an administrative cutover — is a **separate, later decision**
made per driver, not something this project proposes or builds.

**Primary users:** business users receiving the printed/PDF output (invoices,
POs, payslips, dunning notices, etc.), functional/output-management
consultants, Basis (ADS), and the developer(s) who close out whatever this
project's checklist leaves as a post-implementation item.

## 2. System context
- SAP: **S/4HANA, on-premise**. Release/SAP_BASIS — confirm when the pilot
  form is selected.
- **ADS (Adobe Document Services) is already live** — confirmed 2026-09-11.
- Clients — confirm at pilot selection.

## 3. Form inventory (data sources of this project)
| Need | How it's captured | Verified? |
|---|---|---|
| List of Smart Forms in scope | `ZSF2AF_R_LEGACY_GRAB` (`S_FORM` manual list, or `P_AUTO` TADIR best-effort discovery) | ☐ |
| Driver program per form | Source-scan of Z*/Y* programs for the form name + `SSF_FUNCTION_MODULE_NAME` (candidate list — confirm the real one) | ☐ |
| Form interface (import/export/tables/exceptions) | Manual — SE71/SFP Interface tab or SE37, until a read API is confirmed | ☐ |
| Output determination (NACE) linkage | Manual — NACE Processing Routines tab, until a table read is confirmed | ☐ |
| SmartStyle(s), logos, form outline | Manual — SE71 walk-through, SE80 MIME Repository export | ☐ |

> Rule: **never invent an SAP field, table, or API name.** Every automated read
> in `ZSF2AF_R_LEGACY_GRAB` uses only APIs confirmed with high confidence
> (`SSF_FUNCTION_MODULE_NAME`, `TADIR`, `READ REPORT`, `GUI_DOWNLOAD`). Anything
> else stays a manual, clearly-labelled section until verified on the target
> system — see [`02_legacy_grab_spec.md`](02_legacy_grab_spec.md).

## 4. Consumers & authorization
- Who triggers each form: NACE output type / direct FM call / workflow — captured
  per form in its legacy-grab snapshot.
- Auth checks in driver programs: read from the driver source at legacy-grab time,
  **read-only** — captured to understand context, never modified (§8).

## 5. Non-functional
- Volume/frequency: captured per form (manual note) — drives risk score and wave order.
- Legal/financial forms (invoice, dunning, payslip, e-invoicing) get the longest
  parallel run and a named sign-off — never auto-cutover.
- Languages: multi-language forms flagged as higher risk (style/translation loss).

## 6. Naming & landing zone
| | Value | Confirmed |
|---|---|---|
| Repo | `VernasoftTechie/Smartform-Adobe-Migration` | ✅ NEW, confirmed 2026-09-11 |
| Package | `ZABAP_UTIL` (existing, shared with VS-Tower / Dangote / ZAB_V1_UT) | ✅ confirmed 2026-09-11 |
| Object stem | `SF2AF` | ✅ |
| Branch / push mode | `main`, direct push (matches other Vernasoft repos) | default — confirm if different |
| Client naming override | none known | confirm before first client-specific object |

## 7. Assumptions & open questions
| # | Question | Working default (used until answered) |
|---|---|---|
| 1 | SAP_BASIS release / S/4HANA version | confirm at pilot selection |
| 2 | Which Smart Forms are in scope | run `ZSF2AF_R_LEGACY_GRAB` with the real list, or `P_AUTO` against your Z-namespace |
| 3 | TADIR object type for Smart Forms is `SSFO` | best-effort default in the report; verify hit count against SE71 the first time it's run |
| 4 | Programmatic bulk-migration API behind SFP's "Create by Migration" wizard | none assumed — the wizard is run in-system per form until/unless one is found and confirmed |
| 5 | Usage/frequency stats source | manual business input (no ST03N mining assumed) |

## 8. Out of scope / parked
| Item | Label | Re-open when |
|---|---|---|
| **Driver-program modification, of any kind** | **Permanently out of scope** (confirmed 2026-09-12) | never — driver programs are read-only inputs; a shared form's multiple driver perspectives can't be safely reconciled by editing one |
| Live cutover / output-determination rewiring for an existing driver | Action pending for discussions | decided per-driver once its legacy-grab snapshot is read; config-only (NACE) where feasible |
| Digital-signature-enabled forms | Additional scope | after Wave 1/2 patterns are proven |
| Forms with zero recent usage | Action pending for discussions | usage confirmed, or form retired instead of converted |

## 9. Phase plan

**Every phase from 2 onward produces an Adobe Form *design + interface*
only.** No phase modifies a driver program. "Done" for a form means its
design is signed off and validated — not that anything is live or cut over.

| Phase | Goal | Key objects | Done when |
|---|---|---|---|
| **1a** | Legacy-grab tooling | `ZSF2AF_R_LEGACY_GRAB` (package `ZABAP_UTIL`) | report activates, runs against ≥1 real form, produces a snapshot |
| **1b** | Discovery: full inventory + risk score every form | `docs/legacy_grab/*.md`, risk register | risk-ranked list approved, pilot form chosen |
| **1c** | Global Style & Asset Catalogue (first pass) | `docs/06_global_findings.md`, a proposed set of global Adobe styles | every completed snapshot's style/logo sections rolled up; a first rationalized global style set proposed — see [`04_global_style_catalogue.md`](04_global_style_catalogue.md) |
| **2** | Pilot conversion (thin end-to-end slice) — **design only** | one Adobe Form design (SFP migration), interface preserved from section 2 of its snapshot | pilot's PDF output matches the Smart Form's OTF for the same real document (visual diff, `GETOTF='X'` + `CONVERT_OTF`); every unresolved item logged as a developer-checklist entry, not silently dropped — see [`05_individual_form_conversion_framework.md`](05_individual_form_conversion_framework.md) |
| **3** | Wave 1 — Low-risk forms | same design-only pattern, per form | all Low-risk forms have a signed-off design; catalogue updated with any new reusable global style found |
| **4** | Wave 2 — Medium-risk forms | same | Medium-risk forms designed, traps logged |
| **5** | Wave 3 — High/Critical forms | same | named sign-off per form's design |
| **6** | Wiring & cutover (separate track, per driver) | *not owned by this project's core deliverable* | decided per driver once its owner reviews the design — config-only repoint where feasible, otherwise a new parallel entry point; old Smart Form retired only after that owner signs off |

## 10. Phase 1a — increment plan
| Increment | Objects | Verify |
|---|---|---|
| 1a-i | `ZSF2AF_R_LEGACY_GRAB` in `ZABAP_UTIL` | Activate All → run in test mode against one known form |

## 11. Risk classification framework
| Dimension | Low | Medium | High/Critical |
|---|---|---|---|
| Business criticality | internal report | operational doc | legal/financial (invoice, dunning, payslip, e-invoice) |
| Interactivity | static print | fillable, no scripting | XFA scripting, dynamic interactive |
| Layout complexity | header + flat lines | nested tables/loops | dynamic subforms, complex graphics, conditional windows |
| Driver program complexity (read-only risk — how hard it is to *understand* the calling context correctly, never to rewrite) | thin wrapper, few params | some business logic | heavy logic, side effects (postings, number ranges), or multiple drivers calling the same form for different purposes |
| Integration touchpoints | none | barcode/label printer | digital signature, EDI/e-invoicing, external consumption |
| Localization | single language | 2–3 languages | many languages / RTL |
| Volume | low, occasional | daily, moderate | high-volume daily, customer-facing |

Composite score → **Low / Medium / High / Critical**, decides wave assignment,
parallel-run length, and sign-off requirement (Critical = named business
sign-off, never auto-cutover).

## 12. Definition of Done (per phase)
- [ ] Commit Gate passed (repo, branch, package `ZABAP_UTIL`, naming `ZSF2AF_*`/`SF2AF`)
- [ ] Activates green (Activate All Inactive, twice); ATC/SLIN clean
- [ ] For 1a: report runs against a real form and produces a usable snapshot
- [ ] For 2+: Adobe Form **design** matches Smart Form output on representative
      data (OTF-vs-PDF visual diff); interface unchanged in shape from the
      snapshot's section 2; **no driver program touched**
- [ ] Every item the design couldn't resolve is logged as a developer-checklist
      entry (`05_individual_form_conversion_framework.md` §Post-implementation
      checklist) — never silently dropped
- [ ] Any newly-useful reusable style/logo pattern is proposed back into the
      Global Style Catalogue (`04_global_style_catalogue.md`)
- [ ] Risk score recorded before any form enters a wave
- [ ] Named sign-off recorded for High/Critical forms' designs
- [ ] `docs/03_version_history.md` + memory updated
