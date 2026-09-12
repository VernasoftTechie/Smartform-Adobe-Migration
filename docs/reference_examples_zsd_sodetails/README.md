# Reference: ZSD_SODETAILS_FORMS (Sales Order Details)

A third real, working Adobe Form from the client's system, provided
2026-09-12. Unlike `Z_ADT_MM_PR_FORM` (too large to read in full - only
readable in size-limited fragments), this one is small enough to read
start to finish. That completeness is what makes it valuable: it exposed
three structural defects in `z_mm_pr_form_adt.sfpf.xdp` that fragment
reads of the larger reference had missed. See `docs/BUILD_ISSUES_LOG.md`
entry F11 and `docs/03_version_history.md` v3.0 for the full story - this
file only records what to reuse from it going forward.

## Confirmed conventions (apply to every future form)

1. **Root template `<subform>` is always named `"data"`.** Never the
   form's own object name. Confirmed by this reference AND
   `ZHELLO_WORLD_FORM_ADT` independently.
2. **Every `<bind>` needs `match="dataRef"` alongside `ref="$.FIELDNAME"`.**
   The `"$."` prefix is correct XFA relative-SOM shorthand; without
   `match="dataRef"` the processor doesn't apply it. This holds at every
   nesting depth - top-level fields, row-level fields inside a repeating
   table subform, and the table subform's own `occur`-driven binding
   (`<bind match="dataRef" ref="$.DATA[*]"/>` in this reference,
   `ref="$.T_FINAL[*]"` for ours).
3. **Absolutely-positioned content subforms nest directly inside
   `<pageArea>`**, not as top-level siblings of `<pageSet>`. The root
   subform itself is `layout="tb"` (matching Hello World); `<pageArea>`
   supplies the fixed coordinate space that each child's explicit `x`/`y`
   is measured against.
4. **Non-data-bound layout/grouping subforms get an explicit
   `<bind match="none"/>`.** Seen on every purely-positional wrapper
   subform in this reference.
5. **`xfa:datasets` doesn't need populated sample data** - this
   reference ships just `<xfa:data xfa:dataNode="dataGroup"/>` (empty).
   A separate `dd:dataDescription` block carries the schema shape, but
   that's LiveCycle Designer's own cached annotation, not something a
   hand-authored file needs to reproduce.
6. A dotted path is used for nested-schema binds
   (`ref="$.LWA_VBAK.LT_VBAK"`), matching the XSD's own nesting -
   confirms `"$."` binds use dot notation for hierarchy, not dash
   notation (dash notation, e.g. `T_FINAL-MENGE`, is a separate
   ABAP-side convention used only inside SFP's own Context/Reference
   Field addressing, not inside the XDP's `bind ref` values).

## Not adopted

This form's own field/table names (`LWA_VBAK`, `LT_VBAK`, `P_VBELN`,
etc.) are specific to itself - only the structural conventions above are
reusable across forms.
