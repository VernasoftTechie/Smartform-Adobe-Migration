# S03 — Purchase Requisition composite layout

## Select this strategy

Use as a visual composition reference for a Purchase Requisition or another
wide operational form with a fixed header, a line-item table, approval state,
and signature labels. Do not copy its field names, generated Context, or
business conditions into another form.

## Confirmed composition

| Region | Pilot implementation | Form-specific evidence required |
|---|---|---|
| Identity header | SE78 logo, company, plant, and document title | Logo and header fields |
| Request/header details | Fixed labels with direct data bindings | Legacy window map and interface |
| Value line | Labeled amount and currency | Amount/currency semantics |
| Line items | 14-column `T_FINAL` repeatable row | Table type, column widths, QUAN/CURR references |
| Approval watermark | `Approved PR`, shown only for release `R` or `2` | Business release-state definition |
| Signature region | Legacy signature labels | Signer roles and any actual signature data |
| Date and pagination | Safe date display plus native XFA page calculation | Actual inbound date format and multi-page preview |

## Boundaries

`T_TEXT` placement, grand-total semantics, additional barcode behavior, and
multi-page table continuation remain form-specific decisions. Add them only
when the legacy XML, a real output, or an approved functional decision proves
their required behavior.

## Required validation

Test the empty and populated cases, release states, multiple line items, and
a realistic multi-page document. Compare its PDF against the original Smart
Form output before promoting the scenario as reusable.
