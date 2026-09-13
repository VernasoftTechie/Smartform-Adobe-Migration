# S07 — Reusable XDP patterns (copy, don't re-derive)

## Select this strategy

Read this **before writing any XDP content** for a new form. Every
pattern below is extracted from a construct that has actually rendered
correctly in a real SAP/Designer session — either the pilot
`Z_MM_PR_FORM_ADT` (`docs/reference_examples/sfp_generated_archive/
z_mm_pr_form_adt.sfpf.xdp`) or `YMMGRNNOTE_ADT` after its full
debugging cycle (F34-F44). Copy the shape; only the field names,
widths, and bindings change per form's own evidence.

All patterns follow `S06` (explicit `x`/`y` position by default).

## 1. Label + single field row

```xml
<subform h="0.6cm" layout="position" name="tpl_example">
   <bind match="none"/>
   <draw h="0.6cm" name="lbl_example" w="5.5cm" x="0cm" y="0cm">
      <value><text>Label:</text></value>
   </draw>
   <field h="0.6cm" name="fld_example" w="5.16cm" x="5.5cm" y="0cm">
      <ui><textEdit/></ui>
      <bind match="dataRef" ref="$.SOME_FIELD"/>
   </field>
</subform>
```

## 2. Label + two fields (e.g. "No. and Date:" pairs)

```xml
<subform h="0.6cm" layout="position" name="tpl_example2">
   <bind match="none"/>
   <draw h="0.6cm" name="lbl_example2" w="5.5cm" x="0cm" y="0cm">
      <value><text>No. and Date:</text></value>
   </draw>
   <field h="0.6cm" name="fld_example2_no" w="2.58cm" x="5.5cm" y="0cm">
      <ui><textEdit/></ui>
      <bind match="dataRef" ref="$.SOME_NO"/>
   </field>
   <field h="0.6cm" name="fld_example2_dt" w="2.58cm" x="8.08cm" y="0cm">
      <ui><textEdit/></ui>
      <bind match="dataRef" ref="$.SOME_DATE"/>
   </field>
</subform>
```

## 3. A column of stacked rows

The **only** place `layout="tb"` is used for row-to-row stacking — the
column itself, not what's inside each row.

```xml
<subform h="5.68cm" layout="tb" name="template_col1" w="10.66cm" x="0cm" y="0cm">
   <bind match="none"/>
   <font size="7pt" typeface="Arial"/>
   <!-- one pattern-1 or pattern-2 row per line, in order -->
</subform>
```

## 4. Side-by-side columns

```xml
<subform h="5.7cm" name="template_block" w="20.20cm" x="0.4cm" y="8.3cm">
   <bind match="none"/>
   <subform h="5.68cm" layout="tb" name="template_col1" w="10.66cm" x="0cm" y="0cm">...</subform>
   <subform h="5.58cm" layout="tb" name="template_col2" w="9.54cm" x="10.66cm" y="0cm">...</subform>
</subform>
```

Always check `x + w` of the outer block against the page's own content
width (S02) before trusting this — `template_block` above sits at
`x=0.4cm` on a 21cm page specifically because `0.4 + 20.20 + 0.4 = 21.0`
exactly; a naive `x=1cm` overflowed by 0.2cm (F36).

## 5. Repeating table (header + occur row)

The proven pattern from the pilot `Z_MM_PR_FORM_ADT` (its own
`line_items`/`t_final_row`, lines 117-156) — confirmed working there,
and confirmed **wrong the first time** on `YMMGRNNOTE_ADT` when guessed
as `layout="row"` with `$.`-prefixed binds (F40), then fixed to match
this exact shape (F41).

```xml
<subform h="8cm" layout="tb" name="line_items" w="19.70cm" x="0.65cm" y="14.5cm">
   <bind match="none"/>
   <subform h="0.9cm" layout="position" name="table_header" w="19.70cm">
      <bind match="none"/>
      <border><edge thickness="0.26mm"/><edge thickness="0.26mm"/><edge thickness="0.26mm"/><edge thickness="0.26mm"/></border>
      <font size="8pt" typeface="Arial" weight="bold"/>
      <draw h="0.9cm" name="h01" w="2cm" x="0cm" y="0cm"><value><text>Column 1</text></value></draw>
      <draw h="0.9cm" name="h02" w="2cm" x="2cm" y="0cm"><value><text>Column 2</text></value></draw>
   </subform>
   <subform h="0.55cm" layout="position" name="table_row" w="19.70cm">
      <occur min="0" max="-1"/>
      <bind match="dataRef" ref="$.LT_SOME_TABLE[*]"/>
      <border><edge thickness="0.26mm"/><edge thickness="0.26mm"/><edge thickness="0.26mm"/><edge thickness="0.26mm"/></border>
      <font size="8pt" typeface="Arial"/>
      <field h="0.55cm" name="c01" w="2cm" x="0cm" y="0cm"><ui><textEdit/></ui><bind match="dataRef" ref="FIELD1"/></field>
      <field h="0.55cm" name="c02" w="2cm" x="2cm" y="0cm"><ui><textEdit/></ui><bind match="dataRef" ref="FIELD2"/></field>
   </subform>
</subform>
```

**Two non-obvious, easy-to-get-wrong details, both confirmed the hard
way (F40 → F41):**

1. The **outer wrapper** (`line_items`) is `layout="tb"` — this is the
   one place a repeating subform genuinely needs auto-flow, because
   `occur` instances must stack as they're added; a `position`-layout
   parent would render every instance at the same fixed `y`.
2. **`table_row`'s own fields use BARE bind refs** (`ref="FIELD1"`, not
   `ref="$.FIELD1"`). The row's own top-level `bind ref="$.LT_TABLE[*]"`
   already establishes each instance's context — a child field binds
   *relative* to that context, not from the document root again.

## 6. Totals / summary row

```xml
<subform h="1.0cm" layout="position" name="table_total" w="19.70cm">
   <bind match="none"/>
   <font size="8pt" typeface="Arial" weight="bold"/>
   <draw h="1.0cm" name="lbl_total" w="2.5cm" x="0cm" y="0cm"><value><text>Total:</text></value></draw>
   <field h="1.0cm" name="fld_total" w="2.5cm" x="2.5cm" y="0cm"><ui><numericEdit/></ui><bind match="dataRef" ref="$.TOTAL_FIELD"/></field>
</subform>
```

Give a totals/label row generous height (`1.0cm`, not `0.6cm`) from the
start if any label is longer than ~15-18 characters at 8pt — see
pattern 8 below for why.

## 7. Signature line (never underscore characters)

An underscore-heavy placeholder (`"Prepared By: _____________________"`)
risks overflowing its own draw's width and is a needless text-width
guess. Use a real bottom-border line instead — a second, empty draw
with only its bottom edge visible:

```xml
<draw h="0.5cm" name="lbl_prepared" w="3cm" x="0cm" y="0cm">
   <value><text>Prepared By:</text></value>
</draw>
<draw h="0.5cm" name="line_prepared" w="6.85cm" x="3cm" y="0cm">
   <border>
      <edge presence="hidden"/>
      <edge presence="hidden"/>
      <edge thickness="0.3mm"/>
      <edge presence="hidden"/>
   </border>
</draw>
```

The 4 `<edge>` children are top/left/bottom/right in that order — hide
3, show the bottom one.

## 8. Wrap-safe height for any label longer than ~15-18 characters

**The single most repeated fix in this program's history** (F37, F39,
F42, F43 — four separate occurrences across two different forms and two
different sections). If a `<draw>`/`<field>` label's text is long
relative to its declared width, it *will* wrap to 2 lines at real font
metrics even when a rough character-count estimate says it should fit
on one — trust the render, not the estimate. When in doubt:

- **Give the row generous height from the start** (roughly 1.5-2x a
  single line's height, e.g. `0.9cm`-`1.0cm` for an 8-9pt row that
  would otherwise be `0.5cm`-`0.6cm`) rather than shipping a tight
  height and waiting for an overflow badge to prove it wrong.
- If a badge still appears after that, don't fight it with an even
  taller row for every label — apply the fix to the row/column as a
  whole first (majority fix), then give only the genuine remaining
  outlier(s) a further targeted height increase (F39's lesson).
- Reducing font size is the *other* valid lever (F38), but only when
  the width itself is evidence-locked (e.g. an exact legacy column
  width) and can't reasonably be adjusted — otherwise, prefer height.

## Related

`S06` (the position-by-default rule these patterns all follow), `S02`
(the `x+w` overflow check pattern 4 depends on), `S03` (the composite
header/lines/watermark/signature layout these patterns compose into).
