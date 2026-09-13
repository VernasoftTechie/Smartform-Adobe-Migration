# S05 — Diff after every native SFP/Designer save

## Select this strategy

Use every time a form's `.sfpf.xdp`/`.sfpf.xml`/`.sfpi.xml` is pulled from
SAP after **any** native edit was made in SFP or LiveCycle Designer -
even a small, targeted one (repositioning one field, adding one row,
fixing one binding). Applies to every form, forever - this is not
form-specific.

## The risk

LiveCycle Designer/SFP does not write a surgical diff when it saves - it
**reserializes the entire template**. A user who opens the form only to
fix one thing can unknowingly cause the tool to rewrite formatting,
attribute order, and in at least one confirmed case, **silently drop an
attribute it considers redundant or that its own internal model doesn't
carry** on subforms the user never touched.

## Confirmed incident (F41)

On `YMMGRNNOTE_ADT`, the user repositioned exactly two rows
(`tpl_supplier`, `tpl_waybill`) in Designer to fine-tune their layout,
then pushed. Diffing that commit (`8977211`) against the prior
known-good one proved Designer's save silently stripped `layout="row"`
from thirteen *other* row subforms it never touched conceptually
(`tpl_invoice`, `tpl_transporter`, `tpl_vehicle`, `tpl_lpr`, `tpl_lpo`,
`tpl_department`, `tpl_section`, `tpl_ship`, `tpl_clearing`, `tpl_lc`,
`tpl_formm`, `tpl_container`, `tpl_currency`, plus `grn_no_line`/
`grn_date_line`). Every one of those rows then defaulted to
`layout="position"` with no explicit `x`/`y` on its children, so every
row's own label and field(s) rendered stacked on top of each other -
visually severe (see the screenshot that triggered this investigation),
but invisible in a raw file read unless specifically diffed against a
prior good version and checked attribute-by-attribute.

## Required practice

After every Pull that follows a native SFP/Designer save (regardless of
how small the intended change was):

1. `git diff <last-known-good-commit> <new-pull>` on every changed file.
2. For a large diff (SFP's reserialization routinely produces
   thousand-line diffs for a one-field change - see `8977211`'s
   2812-line diff for a 2-row edit), do not eyeball it. Instead:
   - Confirm every subform that previously had `layout="row"` or
     `layout="tb"` still has it - a value silently reverting to the
     `position` default is the specific failure mode confirmed in F41.
   - Confirm no `bind`, `occur`, or `border` element present before the
     edit disappeared from an unrelated subform.
3. Only trust the new pull as a baseline after this check, not merely
   because "the user only meant to change one thing."

## Why this matters at 500-form scale

Every form in this program will go through at least one native SFP
edit cycle (Context building, or a human's own layout fine-tuning, is
unavoidable per S01/S04). If reserialization silently corrupts
unrelated content every time, and that corruption is only caught by a
user screenshot after the fact, the defect surfaces late and looks like
a fresh layout bug rather than what it is - a side effect of the
previous save. Making the diff-check a standing step turns a recurring,
hard-to-diagnose class of regression into a five-minute mechanical
check on every pull.

## Related

`docs/BUILD_ISSUES_LOG.md` F35 (the original, correct `layout="row"`
pattern this incident regressed), F41 (this incident, full diagnosis
and fix).
