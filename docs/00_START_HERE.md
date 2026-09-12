# SmartForm to Adobe Forms Migration - START HERE

## 🎯 Quick Navigation

This repository contains the scoping, framework, build history, and
working code for migrating SAP SmartForms to Adobe Forms.

**Consolidated 2026-09-12** — this index originally pointed at a planned
`AGENT_INSTRUCTIONS.md` / `design_patterns/` / `FORM_ASSESSMENT_TEMPLATE.md`
/ `IMPLEMENTATION_CHECKLISTS.md` structure that was never actually built.
Rather than maintain two parallel, overlapping frameworks, every link
below points at what actually exists in this repo today.

- **Governance & how to work on this repo**: `CLAUDE.md` (read first,
  every session) → then `docs/00_BOLT_PLAYBOOK.md` (cross-project
  standing protocol, canonical copy in `VernasoftTechie/Employee-360`)
- **Scope, risk framework, phase plan**: `docs/01_scope.md`
- **Per-form design procedure** (the "which pattern, which steps" guide): `docs/05_individual_form_conversion_framework.md`
- **Which approach to use for a given form, decided BEFORE design starts**: `docs/07_design_approach_decision_framework.md`
- **Every build issue hit and how it was fixed** (the real "build checklist"): `docs/BUILD_ISSUES_LOG.md`
- **Full version-by-version history**: `docs/03_version_history.md`
- **General Adobe Forms design reference** (apply with judgment - see its own maintainer's note): `instructions/ADOBE_FORMS_DESIGN_MASTER_RULEBOOK.md`
- **Working real-file references**: `docs/reference_examples/` (Hello World baseline), `docs/reference_examples_z_adt_mm_pr_form/` (a real migrated PR form), `docs/reference_examples_zsd_sodetails/` (a real migrated Sales Order form)
- **Legacy-grab tool**: `src/zsf2af_r_legacy_grab.prog.abap` + its output for the pilot form, `docs/legacy_grab/Z_MM_PR_FORM.md` and `docs/legacy_grab/Z_MM_PR_FORM_build_checklist.md`

---

## 📋 Document Structure (as it actually exists)

```
docs/
├── 00_START_HERE.md                              ← YOU ARE HERE
├── 00_BOLT_PLAYBOOK.md                           ← cross-project governance (canonical copy in Employee-360)
├── 01_scope.md                                   ← requirement, risk framework, phase plan
├── 02_legacy_grab_spec.md                        ← what the legacy-grab tool captures, and why
├── 03_version_history.md                         ← full v0.1 -> current changelog
├── 04_global_style_catalogue.md                  ← consolidated styles/logos across all forms
├── 05_individual_form_conversion_framework.md    ← per-form design procedure + naming convention
├── 06_global_findings.md                         ← raw output of the global SmartStyle/logo sweep
├── 07_design_approach_decision_framework.md      ← which approach to use, decided before design starts
├── BUILD_ISSUES_LOG.md                           ← every build issue (F1-F12+) and its fix
├── reference_examples/                           ← Hello World baseline (confirmed-importable)
├── reference_examples_z_adt_mm_pr_form/          ← real migrated PR form (sibling of the pilot)
├── reference_examples_zsd_sodetails/             ← real migrated Sales Order form
└── legacy_grab/
    ├── Z_MM_PR_FORM.md                           ← raw legacy-grab snapshot for the pilot form
    ├── Z_MM_PR_FORM_build_checklist.md           ← literal build spec (coordinates, fonts, mappings)
    └── Z_MM_PR_FORM_blueprint.html               ← published design showcase (see repo commit history for the artifact URL)

instructions/
└── ADOBE_FORMS_DESIGN_MASTER_RULEBOOK.md         ← general reference, apply per its own maintainer's note
```

```
src/
├── z_mm_pr_form_adt.sfpf.xdp / .sfpf.xml         ← pilot form layout + metadata
├── z_mm_pr_form_adt.sfpi.xml                     ← pilot form interface
├── zhello_world_form_adt.sfpf.xdp / .sfpf.xml    ← reference baseline
├── zhello_world_adt.sfpi.xml                     ← reference baseline interface
└── zsf2af_r_legacy_grab.prog.abap / .prog.xml    ← legacy-grab tool
```

---

## ⚡ Quick Start

### **For whoever (or whatever agent) picks this up next:**
1. Read `CLAUDE.md`, then `docs/00_BOLT_PLAYBOOK.md` - every session, no exceptions.
2. Read `docs/01_scope.md` and `docs/05_individual_form_conversion_framework.md`.
3. Starting a *new* form: run its complexity classification in `docs/07_design_approach_decision_framework.md` **before** any design work.
4. Check `docs/BUILD_ISSUES_LOG.md` before assuming any pattern "should work" - odds are a close variant of it has already been hit and fixed once.

---

## 🔧 Z_MM_PR_FORM's Layout Issue — Status

**As of this write-up: fixed in the source file, NOT YET CONFIRMED
rendering in SFP.** Do not treat this as done until it's been verified
in Design View / Print Preview and reported back.

**Root causes found and fixed** (`docs/BUILD_ISSUES_LOG.md` F9-F11):
1. Root subform must be named `data` (XFA convention) - was named after the form itself.
2. Every `<bind>` needs `match="dataRef"` alongside `ref="$.FIELD"` - was missing the `match` attribute on every field.
3. Absolutely-positioned content subforms must sit inside `<pageArea>`, not as top-level siblings of `<pageSet>`.
4. `CL_FP_REFERENCE_FIELDS` needed real declared globals (`MEINS`/`WAERS`) as targets, not bare table-column names.

Full before/after detail: `docs/BUILD_ISSUES_LOG.md` entries F9-F11 and
`docs/03_version_history.md` v2.8-v3.0.

---

## 🎓 Key Concepts

### **Adobe Forms ≠ SmartForms**
| Aspect | SmartForm | Adobe Form |
|--------|-----------|-----------|
| **Design Tool** | SE71 (SAP transaction) | SFP + LiveCycle Designer (embedded) |
| **Language** | ABAP (forms logic) | JavaScript/FormCalc (layout logic), ABAP-like coding still lives in `CL_FP_CODING`/`INITIALIZATION` on the interface |
| **Layout Engine** | SAP spool | PDF + XFA (XML Forms Architecture) via ADS |
| **Styling** | SmartStyles (paragraph/character) | XFA `<font>`/`<para>` properties on the layout |
| **Table Repeat** | LOOP AT logic | Subform with `occur min="0" max="-1"`, bound to a table parameter |
| **Object types (abapGit)** | SSFO (form), SSST (style) | SFPF (form), SFPI (interface) |

### **Root Template Must Be `<subform name="data">`**
XFA convention, confirmed against two real reference forms. See
`src/z_mm_pr_form_adt.sfpf.xdp`.

### **All Field Bindings Need `match="dataRef"`**
```xml
<bind match="dataRef" ref="$.BANFN"/>
```
Without `match="dataRef"`, the `ref` is not applied and the field never
binds to data.

### **Position-Absolute Content Belongs Inside `<pageArea>`**
Not as a sibling of `<pageSet>`. `<pageArea>` supplies the coordinate
space that each child's explicit `x`/`y` is measured against.

### **QUAN/CURR table fields need a resolvable Reference Field**
Every quantity or currency field needs a paired unit/currency-key field
that actually exists in the interface's data model (a declared global,
an import parameter, or another table column) - see
`docs/BUILD_ISSUES_LOG.md` F9/F10.

---

## 📞 When to Escalate (Not the agent's job)

- ❌ "I need ADS configured on the Java stack" → DevOps/Basis
- ❌ "What SmartStyle did the legacy form use?" → confirm with the functional owner if the legacy-grab snapshot doesn't have it
- ❌ "How do we handle 500-row tables at scale?" → Architecture / this project's own scope discussion
- ❌ "Which driver should call the new form, and when?" → out of scope entirely, per `CLAUDE.md` - drivers are read-only forever
- ✅ "How do I bind a nested table?" → `docs/reference_examples_z_adt_mm_pr_form/` shows a real one
- ✅ "What's the date formatting script?" → `src/z_mm_pr_form_adt.sfpf.xdp`'s `date_line` subform
- ✅ "How do I add a watermark condition?" → `src/z_mm_pr_form_adt.sfpf.xdp`'s `watermark` subform

---

## 🔐 Quality Gates (Non-Negotiable)

### **Before Development Starts**
- [ ] Legacy-grab snapshot captured (`docs/legacy_grab/<form>.md`)
- [ ] Complexity classified per `docs/07_design_approach_decision_framework.md` Step 0
- [ ] Design approach (Path A/B) confirmed
- [ ] SmartStyle/logo needs matched against `docs/04_global_style_catalogue.md`

### **Before Sign-Off** (`docs/05_individual_form_conversion_framework.md`'s validation step)
- [ ] PDF renders without blank sections
- [ ] All table rows visible, tested with realistic data volume
- [ ] Conditional logic works (watermark, show/hide)
- [ ] Date/currency formatting matches locale
- [ ] Interface preserved exactly (no breaking change to what calls it)
- [ ] Business owner visual sign-off against the blueprint, pixel by pixel

---

## 📖 Next Steps

1. **New here?** Read `CLAUDE.md` → `docs/00_BOLT_PLAYBOOK.md` → `docs/01_scope.md`.
2. **Reviewing the pilot form?** Read `docs/BUILD_ISSUES_LOG.md` start to finish - it's the real story.
3. **Starting a new form?** `docs/07_design_approach_decision_framework.md` Step 0, before anything else.

---

**Last Updated:** 2026-09-12
**Pilot form status:** fixes pushed (v3.0, commit `75a59b5`), rendering **not yet confirmed** - awaiting the user's re-test in SFP.
