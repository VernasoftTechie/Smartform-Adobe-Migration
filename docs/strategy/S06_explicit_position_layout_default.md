# S06 — Explicit `x`/`y` position is the default for every row

## Select this strategy

Use for **every** label/field row, table cell, and multi-child subform
in **every** form's `.sfpf.xdp`, from the very first line written. This
is not a fallback for when something breaks — it is the starting
convention. Applies to every future form in this program, without
exception, unless a specific case has its own live-confirmed screenshot
proving `layout="row"` is safe there (see "Narrow exception" below).

## The rule

Every subform that groups a label with one or more fields (or draws)
gets `layout="position"`, and every child gets an explicit `x`/`y`.
Compute `x` as the running sum of the previous siblings' widths within
that row; `y="0cm"` for everything on the same horizontal line. Never
write a subform with 2+ fixed-size children and no `layout` attribute,
and never rely on `layout="row"`/`layout="tb"` auto-flow to position
children correctly on its own.

```xml
<subform h="0.6cm" layout="position" name="tpl_example">
   <bind match="none"/>
   <draw h="0.6cm" name="lbl_example" w="5.5cm" x="0cm" y="0cm">
      <value><text>Label:</text></value>
   </draw>
   <field h="0.6cm" name="fld_example" w="3cm" x="5.5cm" y="0cm">
      <ui><textEdit/></ui>
      <bind match="dataRef" ref="$.SOME_FIELD"/>
   </field>
</subform>
```

A subform that only *stacks* other subforms vertically (a column of
rows, a page's body) may stay `layout="tb"` — that mechanism is not in
question, only the layout *inside* each row.

## Why this exists

This exact lesson cost **three separate debugging rounds** on one
template block (`YMMGRNNOTE_ADT`'s `TEMPLATE` window, 2026-09-13):

- **F35**: `layout="row"` nested inside `layout="tb"` inside
  `layout="row"` (3 levels, mixed) rendered garbled — fixed by flattening
  to explicit `position` at the outer level.
- **F41**: a native LiveCycle Designer save silently *stripped*
  `layout="row"` from 15 row subforms it never touched conceptually,
  regressing them all back to overlapping text at `x=0,y=0` — fixed by
  restoring the attribute (see `S05`).
- **F44**: even with `layout="row"` correctly restored and verified
  present in the source, the same rows still rendered as one merged,
  overlapping block in Design View — a genuine, unexplained reliability
  gap in how this SAP/Designer version handles `row` layout nested two
  levels inside `tb`. Fixed for good only by removing the dependency
  entirely: explicit `x`/`y` on every child.

Three rounds for one template block is exactly the kind of cost this
program cannot repeat at 100-forms-a-day scale. `layout="row"` looked
correct, was documented as "proven," and still failed a second time for
reasons that were never fully explained — that unpredictability is
itself the argument for never depending on it as the default.

## Narrow exception

`layout="row"` remains acceptable **only** for a subform that is a
**direct child of a `position`-layout parent** (not `tb`, not another
`row`), with exactly the same shape as the two cases that have rendered
correctly across every round of this program so far: `grn_no_line` and
`grn_date_line` (one draw + one field, 2 children, one level deep). Do
not extend this exception by analogy to a new case "because it looks
similar" — if a new row doesn't match this exact shape, use explicit
`position` instead of testing whether `row` happens to work this time.

## Bonus benefit: survives native re-saves

Explicit `x`/`y` values are ordinary attributes Designer has no reason
to touch when reserializing an unrelated part of the file. `layout="row"`
is exactly the kind of attribute F41 proved Designer can silently drop.
Defaulting to explicit position also reduces exposure to `S05`'s entire
class of regression, not just the layout-reliability question above.

## Required validation

- After writing any row this way, re-check that the sum of every
  child's `x + w` never exceeds the row's own declared `w` (or the
  column/page width it sits inside) — see `S02`'s landscape-overflow
  lesson, same arithmetic applies to `position` layout.
- Validate the file is well-formed XML before pushing (standing rule,
  every file, every push).
- This strategy does not replace visual confirmation — a well-formed,
  arithmetically-correct `position` layout still needs a real
  Design View screenshot before being trusted, per every other strategy
  in this catalogue.

## Proactive complexity triggers — act before it breaks, not after

Apply the relevant strategy the moment one of these is true, rather
than waiting for a screenshot to prove it's needed:

| Signal | Act immediately by |
|---|---|
| A row/column would sit more than 1 level of layout nesting deep (e.g. `tb` containing `row`, or `row` containing another subform) | Using explicit `position` for that row from the start — don't write `layout="row"` and wait to see if it renders correctly |
| A label's text is longer than ~15-18 characters at 8-9pt in a column narrower than ~3cm | Giving that row generous height (`0.9cm`-`1.0cm`, not `0.5cm`-`0.6cm`) in the same edit that writes the label — see `S07` §8 |
| Any native SFP/Designer save is about to happen (Context building, a user's manual layout tweak) | Recording the pre-save commit hash so the post-save diff (`S05`) has something to compare against, before the save happens |
| A signature line, blank, or placeholder needs to show where to write/sign | Using the bottom-border-draw pattern (`S07` §7) — never underscore characters |
| A new form's evidenced geometry doesn't match anything already proven in `S07` | Building the smallest possible test case for that new shape first (matching `S01`'s "smallest working baseline" discipline), instead of assembling the whole section at once and finding out via a full-page screenshot |

## Related

`S02` (landscape fixed-window layout — the same `x+w` overflow check),
`S05` (diff after every native save — the regression this default also
protects against), `S07` (reusable XDP snippets — the concrete
copy-paste patterns that implement this rule).
