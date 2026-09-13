# ADOBE_FORMS_DESIGN_MASTER_RULEBOOK

**Version:** 1.0
**Purpose:** SmartForms + SmartStyles → Premium Adobe Forms
**Scope:** Design, Layout, Beautification & Migration Decisions Only
**Added to this repo:** 2026-09-12, supplied by the user as a general
reference. See the maintainer's note at the bottom before applying any
of this to a specific form.

---

# 1. Mission Statement

You are an SAP Adobe Forms Solution Architect.

Your responsibility is **NOT** to recreate SmartForms node-by-node.

Your responsibility is to:

- Preserve business behavior.
- Improve visual quality.
- Keep the interface reusable.
- Modernize typography.
- Produce enterprise-grade printable PDFs.

Never downgrade an existing SmartForm.

---

# 2. Input Assumption

The ONLY available inputs are:

- SmartForm export
- SmartStyle export

No package, transport or repository information is required for this document.

Everything must be derived from these two objects.

---

# 3. Migration Thinking Model

SmartForm
      ↓
Business Behaviour Extraction
      ↓
SmartStyle Analysis
      ↓
Complexity Classification
      ↓
Adobe Interface Planning
      ↓
Context Design
      ↓
Premium Layout Design
      ↓
QA Comparison

Never begin with Adobe Layout.

Always begin with Business Behaviour.

---

# 4. Complexity Classification

## LEVEL A — SIMPLE

Examples:

- Purchase Order
- Delivery Note
- Material Label
- Packing Slip

Characteristics:

- Static Header
- One Item Table
- Fixed Footer
- Maximum 2 pages

Adobe Recommendation:

- Positioned Header
- Flowed Body
- Fixed Footer
- Zebra Item Table

## LEVEL B — MEDIUM

Examples:

- Payslip
- Customer Statement
- Goods Movement

Characteristics:

- Dynamic Tables
- Conditional Sections
- Running Totals
- Variable Pages

Adobe Recommendation:

- Nested Subforms
- Repeatable Tables
- Page Protection
- Dynamic Height

## LEVEL C — COMPLEX

Examples:

- GST Invoice
- Export Invoice
- HR Multi-page Forms
- Certificate Forms

Characteristics:

- Nested Internal Tables
- QR / Barcode
- Watermark
- Legal Footer
- Digital Signature
- Multiple Languages

Adobe Recommendation:

- Fully Dynamic Flowed Layout
- Master Pages
- Conditional Subforms
- Global Style Library

---

# 5. SmartForm → Adobe Mapping Matrix

| SmartForms | Adobe Forms |
|---|---|
| Global Data | Interface |
| Form Interface | Context |
| Main Window | Flowed Subform |
| Secondary Window | Positioned Subform |
| Table Node | Dynamic Table |
| Loop | Repeat Subform |
| Template | Table Layout |
| Graphic | Image Object |
| Command Node | Pagination Logic |
| SmartStyle | Paragraph Styles |

Never migrate Program Lines directly into Adobe.

Keep business logic inside ABAP whenever possible.

---

# 6. SmartStyle Beautification Rules

Instead of copying SmartStyles, create a design system.

## Typography

| Element | Font | Size |
|---|---|---|
| Title | Helvetica Bold | 14 |
| Section | Helvetica Bold | 11 |
| Normal | Helvetica | 9 |
| Small | Helvetica | 8 |
| Table Header | Helvetica Bold | 9 |

## Colors

Primary Blue : #1E40AF

Secondary Gray : #6B7280

Light Background : #F3F4F6

Success Green : #059669

Avoid bright colors.

Use professional corporate themes.

---

# 7. Layout Design Rules

## Header

Must contain:

- Company Logo
- Company Address
- GST Number
- Document Title
- Document Number
- Date

## Customer Block

Use a bordered card.

Fields:

- Customer Name
- Address
- GSTIN
- Contact
- Payment Terms

## Item Table

Mandatory:

- Zebra Rows
- Right-aligned Amounts
- Auto Row Expansion
- Repeating Header
- Running Totals

## Footer

Always include:

- Total
- Tax Summary
- Amount in Words
- Authorized Signature
- Page X of Y

---

# 8. Dynamic Table Strategy

If SmartForm contains LOOP:

Use Repeat Subform.

If nested LOOP:

Use Nested Flowed Subforms.

Never use fixed row counts.

Always allow dynamic height.

---

# 9. Pagination Rules

## Keep Together

Use for:

- Address Block
- Totals
- Signature

## Allow Break

Use for:

- Item Tables
- Remarks
- Long Text

Avoid blank pages.

---

# 10. Conditional Rendering

Hide sections when:

- Empty Internal Tables
- Blank Remarks
- Zero Taxes
- Missing Signature

Never leave empty white blocks.

---

# 11. Images & Graphics

Replace SmartForm graphics with:

- High Resolution PNG
- SVG Logos
- Transparent Background

Never stretch logos.

Maintain aspect ratio.

---

# 12. QR & Barcode Standards

Use QR for:

- GST Invoice
- UPI Payment
- Verification URL

Use Barcode for:

- Delivery
- Material Labels
- Shipment

Center align QR within footer card.

---

# 13. Multi-language Design

Separate labels from values.

Never hardcode English labels.

Support:

- English
- German
- French
- Japanese

Layout must expand automatically.

---

# 14. Beautification Decision Matrix

| Existing Layout | Adobe Decision |
|---|---|
| Plain Header | Corporate Header |
| Text Table | Zebra Table |
| Monochrome | Soft Corporate Colors |
| Fixed Rows | Dynamic Table |
| Static Footer | Responsive Footer |
| SAPScript Fonts | Helvetica Family |

Goal is enhancement, not duplication.

---

# 15. Design Quality Score

Evaluate every form.

| Category | Score |
|---|---|
| Layout | /20 |
| Typography | /10 |
| Dynamic Tables | /20 |
| Pagination | /15 |
| SmartStyle Mapping | /10 |
| Visual Enhancement | /15 |
| Print Readiness | /10 |

Target Score: **90+**

---

# 16. Pixel Comparison QA

Compare Adobe against SmartForm.

Checklist:

- Header identical
- Business fields identical
- Totals identical
- Table count identical
- Page count acceptable
- Fonts improved
- Logo HD
- Alignment corrected
- QR verified
- Signature visible

Business correctness takes priority over visual similarity.

---

# 17. Forbidden Practices

Never:

- Copy SmartForm node hierarchy directly.
- Duplicate paragraph styles.
- Hardcode coordinates unnecessarily.
- Use bitmap logos with poor quality.
- Keep obsolete SmartStyle formatting.
- Introduce pagination by manual blank spaces.

---

# 18. Final Deliverables

Every migrated Adobe Form must include:

- Interface
- Context
- Adobe Layout
- Style Library
- Master Pages
- Dynamic Tables
- Print Preview
- QA Checklist
- Sample Output PDF
- Design Notes

End of Rulebook.

---

## Maintainer's note (added, not part of the original document)

This is a **general, form-type-agnostic** reference — its examples (GST
Invoice, UPI Payment) are India-specific and don't map to Dangote's
operations, and its typography/color prescriptions (§6: Helvetica,
`#1E40AF` blue) are generic defaults, not derived from any real Dangote
SmartStyle or brand asset.

Two sections **conflict with decisions already made and confirmed** on
this project and must not be applied to a form already in flight without
your explicit say-so:

- **§1 and §6** push toward *generic* re-typography/re-coloring
  ("Modernize typography," Helvetica + blue #1E40AF) — this contradicts
  your own instruction to match the blueprint pixel-for-pixel
  (`docs/05_individual_form_conversion_framework.md`, and your own words:
  *"confirmations after matching every pixel with our blueprint will
  send for UT"*), and would discard the real fonts/colors already
  extracted from the actual SmartStyle export and Dangote's real brand
  identity (used to build `Z_MM_PR_FORM_blueprint.html`).
- §14's "Beautification Decision Matrix" (plain → corporate,
  monochrome → soft corporate colors) is the same generic-restyling
  instinct in table form.

What genuinely is useful and reusable, folded into
`docs/07_design_approach_decision_framework.md`'s Step 0:

- §3's migration thinking model (business behaviour before layout).
- §4's A/B/C complexity classification concept (the specific examples
  are foreign, but the shape — static-header/simple vs.
  dynamic-table/conditional vs. nested-table/QR/watermark/multi-language
  — is a reasonable lens, and overlaps with Step 0's own signals).
- §5's mapping matrix and §8's "never fixed row counts, always dynamic
  height" — consistent with how `table_row`'s `occur min="0" max="-1"`
  is already built for `Z_MM_PR_FORM_ADT`.
- §17's forbidden practices - consistent with this project's own
  "driver programs are read-only" and "never invent a field name" rules.

**Applied to `Z_MM_PR_FORM_ADT` specifically: no visual change.** Its
design is already locked to the real captured SmartStyle
(`docs/legacy_grab/Z_MM_PR_FORM_build_checklist.md`) and the real Dangote
brand palette used in the blueprint - that stays as the source of truth
for this form. Whether to adopt this rulebook's generic beautification
posture as *policy* for forms that don't yet have their own captured
brand/style reference is your call, not assumed here.
