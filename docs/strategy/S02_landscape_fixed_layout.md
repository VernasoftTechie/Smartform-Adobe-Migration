# S02 — A4 landscape fixed-window layout

## Select this strategy

Use when the Smart Form's window positions or table width exceed portrait A4
width. The PR pilot selected this strategy because its table width is 29 cm.

## Proven pattern

Use an XFA A4 master page with:

```xml
<medium long="297mm" orientation="landscape" short="210mm" stock="a4"/>
<contentArea h="206mm" w="290mm" x="5mm" y="2mm"/>
```

Put fixed legacy windows inside the SFP-generated full-page positioned body
subform. Keep the root `data` subform and generated page structure unchanged.

## Geometry rule

For every fixed control, verify:

- `x + width <= 297 mm`;
- `y + height <= 210 mm`;
- each table's total column width fits the content area;
- the table x offset plus its width fits the physical page.

## Required validation

Open **Design View** and confirm the page is visibly landscape before adding
the complete header or table. A page with `long="297mm"` and `short="210mm"`
is not sufficient: without `orientation="landscape"`, Designer can render it
as a 210 mm-wide portrait page.

## Margin rule (added 2026-09-15, F48) — applies to every form, not just landscape

`x + width <= page width` is **necessary but not sufficient**. A 0.4cm
right margin worked on YMMGRNNOTE (F36) but the same math — content
ending at 0.5cm from a 21cm page edge — still triggered visible overflow
warnings on `ZSD_ATC` (F48). The exact extra offset was never fully
diagnosed (possibly `contentArea`'s own `x`/`y` applying to the body
subform's coordinate system on top of the content's own margin, possibly
something else) — don't assume either model is confirmed correct.

**Standing rule going forward**: budget **at least 1-1.5cm of margin**
on every side for a first-pass layout, not just enough to clear the
page width exactly. Treat anything under 1cm of margin as a real risk
worth a live Design View check before trusting it, regardless of how
the arithmetic works out on paper.

## Supporting lesson

F24 documents the pilot correction that eliminated the header and table
overlap. F48 documents the margin-discipline finding above, on `ZSD_ATC`.
