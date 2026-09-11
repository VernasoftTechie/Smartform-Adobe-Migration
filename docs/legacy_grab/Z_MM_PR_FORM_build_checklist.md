# Z_MM_PR_FORM — Adobe Form Build Checklist

**Built from scratch against the real export — not the SFP "Create by Migration"
wizard.** Bolt owns the design; this checklist is the literal build spec.
Follow it in SFP/Adobe LiveCycle Designer, note any adjustment you had to
make, push the result (+ the adjustment notes) to `docs/legacy_grab/`, and
Bolt confirms it against `Z_MM_PR_FORM_blueprint.html` pixel-by-pixel
before it goes to UT.

Every number below is read from `z_mm_pr_form.xml` / `sfstyle-zstyle_pr_form.xml`
— not estimated. Where something is inferred rather than read directly, it's
marked **[INFER]** with the reasoning, so you know exactly what to double-check.

---

## 0. Master page

| Setting | Value | Source |
|---|---|---|
| Paper | DIN A4 | `<PAGEFORMAT>DINA4</PAGEFORMAT>` |
| Orientation | **Landscape** [INFER] | content extends to ~29cm horizontally (table width `29.00` + window right-edges up to 28.03cm) — doesn't fit A4 portrait's 21cm width, does fit landscape's 29.7cm. No explicit orientation flag found in the export — **confirm in SE71 before building** |
| Content area | ~0.5cm to ~28.5cm horizontal, ~0.2cm to ~20.9cm vertical | derived from window extents below |

## 1. Style → Adobe font mapping

From `sfstyle-zstyle_pr_form.xml` (`ZSTYLE_PR_FORM`, version 00022). Build
these as Adobe paragraph/character styles with the same names where Adobe
allows named styles, otherwise apply inline per the mapping:

| SmartStyle format | Used for (confirmed usage) | Font | Size | Bold | Italic | Justify |
|---|---|---|---|---|---|---|
| Paragraph P1 | Default body text | Courier | 11pt | – | – | Left |
| Paragraph P2 | "PURCHASE REQUISITION FORM" title line; company name line | Times | 15pt | **Yes** | – | Center |
| Paragraph P6 | `&PLANT_NAME&` line (pairs with P2 in the HEADER block) | Times | 15pt | **Yes** | – | Center |
| Paragraph P3 | General centered captions | Times | 11pt | – | – | Center |
| Paragraph P4 | Plain secondary text | Times | 10pt | – | – | Left |
| Paragraph P5 | Rarely used variant (Courier Cyrillic) | Courier | 10pt | – | – | Left |
| Character C1 | Inline bold labels — **every** field label in the form ("S.No", "Item Code", "LPR No :", etc.) | Times | 10pt | **Yes** | – | — |
| Character C2 | Page-footer text ("Page X of Y") | Times | 15pt | **Yes** | **Yes** | — |
| Character C3 / C4 | Declared, not observed in use — carry forward for parity, don't force usage | Times | 10pt | – | – | — |

**Propose to Global Style Catalogue** (`docs/04_global_style_catalogue.md`):
this pattern (C1 = bold inline label, body = plain) is generic enough to be
a reusable Global Adobe Style, not a one-off — flag when you build it.

## 2. Logo

| | Value |
|---|---|
| Asset | `DANGOTE LOGO`, type BCOL, 186×117px @ 100dpi (`STXBITMAPS`, confirmed via `P_GLOB` sweep) |
| Position | Left **0.60cm**, Top **0.20cm** |
| Size | Width **5.42cm**, Height **2.82cm** |
| Action | Export the binary from SE78 (object `GRAPHICS`, name `DANGOTE LOGO`, ID `BMAP`, type `BCOL`) and place as a static image field at the exact coordinates above |

## 3. Subforms (Smart Form windows → Adobe positioned subforms)

Build each as a **fixed-position** (non-flowed) subform at these exact
coordinates. `%WINDOW1` is a leftover default node — skip it, don't build it.

| Subform | Left | Top | Width | Height | Content |
|---|---|---|---|---|---|
| `logo` | 0.60 | 0.20 | 5.42 | 2.82 | Logo image, §2 |
| `header` | 6.60 | 0.40 | 17.47 | 2.20 | Two centered bold (P2/P6) lines: `&lv_company&`, then `&PLANT_NAME&`, then plain-text line "PURCHASE REQUISITION FORM" (P2) |
| `type_of_request` | 0.53 | 4.00 | 15.73 | 1.20 | Static text (C1 labels): "Type of Request : Revenue/Capital Spares/General Consumables", "Equipment Details:" |
| `pr_header` | 19.33 | 4.00 | 9.60 | 2.47 | 5 label/value lines (all C1 label + P1 value): `LPR No: &BANFN&`, `LPR Date: &BADAT&`, `Department: &EKNAM&`, `Section: &BEDNR&`, `Email: &IV_REQ_EMAIL&` — **resolved, see §6.1** |
| `value_line` | 0.50 | 5.47 | 13.97 | 0.50 | "Estimated Value of this LPR : `&V_EXTTOTAL(C)&` `&v_waers&`" |
| `watermark` | 2.20 | 10.40 | 20.50 | 8.80 | Conditional text, presence driven by a JavaScript `initialize` script — **resolved, see §6.2** |
| `date_line` | 0.50 | 19.87 | 7.60 | 0.93 | Weekday + month spell-out, computed client-side from `BADAT` — **resolved, see §6.3** |
| `page_footer` | 24.00 | 19.83 | 4.03 | 1.10 | "Page `&SFSY-PAGE&` of `&SFSY-FORMPAGES&`" (C2: bold italic, 15pt) — Adobe has native page-numbering fields, use those directly rather than reproducing SFSY manually |
| `main` (flowed) | *(fills remaining content area, ~6.5cm to ~19.7cm vertical)* | | | | Line-items table, §4 |

## 4. Line-items table (`main` subform)

Bound to `T_FINAL` / `W_FINAL`. **14 columns**, widths verified to sum
exactly to the table's declared 29.00cm — build the Adobe table with these
exact column widths, don't let the tool auto-distribute them:

| # | Header | Width (cm) | Field |
|---|---|---|---|
| 1 | S.No | 0.80 | `w_final-slno` |
| 2 | Item Code | 2.50 | `w_final-matnr` |
| 3 | Description and Part Number | 5.66 | `w_final-txz01` |
| 4 | Unit | 1.14 | `w_final-meins` |
| 5 | Req Qty | 2.22 | `w_final-menge` |
| 6 | Present Stock at Hand | 2.40 | `w_final-labst` |
| 7 | Consumption | 2.04 | `w_final-menge1` |
| 8 | Last Supplier | 1.99 | `w_final-name1` |
| 9 | Supply Rate | 1.66 | `w_final-supply_rate` |
| 10 | Exchange Rate | 1.61 | `w_final-exchange` |
| 11 | Open PR | 1.39 | `w_final-gv_value` |
| 12 | Open PO | 1.33 | `w_final-labst1` *(confirm — this column's exact field is the least certain of the 14; verify against a real printout)* |
| 13 | Total Available Stock | 1.96 | `w_final-total` *(confirm, same reason as above)* |
| 14 | Total Value | 2.30 | `w_final-gv_value1` *(confirm, same reason as above)* |
| | **Total** | **29.00** | matches declared table width — verified |

Column headers: C1 (bold, 10pt Times), left-aligned. Data rows: P1 (Courier
11pt) or P4 (Times 10pt) — the export shows 4 line-type variants
(`%LTYPE1`-`%LTYPE4`, likely header / normal row / alternating shading /
footer total) — **build note**: reproduce the alternating-row shading if
present when you inspect the form visually in SE71 first; not fully
resolved from the export alone.

A footer/total row spans the full 29.00cm width (3 sub-rows observed) —
build a merged total row beneath the data rows for the grand total line.

## 5. Explicitly exclude — do not carry forward

| Item | Where | Why |
|---|---|---|
| `break abap1.` | `%CODE15` node, TYPE window | Live debugger statement, not production logic |
| `CURRENCY` code node | MAIN window | Fully commented out, dead |
| `%CODE20` code node | VALUE window | Fully commented out, dead |
| Commented block in `%CODE15` | TYPE window | Dead code alongside the active `IF v_pstyp = '9'` logic — keep the active logic, drop the comments |

## 6. Embedded ABAP → FormCalc/JavaScript, decided

**The governing fact:** Smart Forms' "Program Lines" nodes execute real
ABAP, with full RFC/BAPI/database access, as the form is processed inside
the SAP kernel. Adobe's FormCalc/JavaScript run inside the *rendering*
engine (Adobe Document Services) — they can calculate, format, and show/hide
based on data already present in the form, but they **cannot** call an
ABAP function module, run a BAPI, or issue a database SELECT. That single
fact decides all four items below: anything that only *computes* from data
already in the interface stays client-side script; anything that *fetches*
data the interface doesn't already carry needs that data added to the
interface — as a new **optional** parameter, so an unmodified caller is
unaffected (empty/default value, graceful degrade) and the "preserve the
interface exactly" rule (`docs/01_scope.md` §8) isn't broken, only
extended.

### 6.1 Requisitioner e-mail — new optional interface parameter

`BAPI_USER_GET_DETAIL` is a real ABAP RFC call — can't run in FormCalc/JS.
**Decision:** add `IV_REQ_EMAIL TYPE STRING OPTIONAL` to the interface.
Bind the `pr_header` email line directly to it. An unmodified driver that
doesn't pass it renders a blank email line — safe degrade, nothing breaks.
*(Whoever eventually wires a caller to this form, per Phase 6, resolves the
BAPI call once, upstream, and passes the result in.)*

### 6.2 Watermark condition — new optional interface parameter + JavaScript

`SELECT SINGLE FRGKZ FROM EBAN` is a database read — can't run in
FormCalc/JS either. **Decision:** add `IV_FRGKZ TYPE EBAN-FRGKZ OPTIONAL`
to the interface. The visibility logic itself **is** exactly what
JavaScript is for — on the `watermark` subform's `initialize` event:

```javascript
// watermark :: initialize event
if (IV_FRGKZ.rawValue == "R" || IV_FRGKZ.rawValue == "2") {
    this.presence = "visible";
} else {
    this.presence = "hidden";
}
```

Unmodified caller doesn't pass `IV_FRGKZ` → it's blank → condition is
false → watermark hidden. Same safe degrade as 6.1.

### 6.3 Date spell-out — pure JavaScript, no interface change needed

Unlike 6.1/6.2, this needs **no new parameter** — `BADAT` is already in the
interface, and weekday/month-name is a pure computation from a date already
present, which JavaScript's own `Date` object handles natively. On the
`date_line` subform's `initialize` event:

```javascript
// date_line :: initialize event — adjust the BADAT.rawValue parse to
// whatever date format SFP actually binds it as once you're in the tool
var wkE = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
var wkF = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
var moE = ["January","February","March","April","May","June","July",
           "August","September","October","November","December"];
var moF = ["Janvier","Fevrier","Mars","Avril","Mai","Juin","Juillet",
           "Aout","Septembre","Octobre","Novembre","Decembre"];

var d = Date2Num(BADAT.rawValue, "YYYY-MM-DD");   // FormCalc-style parse;
                                                    // swap for the real bound format
var dow = Mod(d, 7);                               // 0-6
var lang = (xfa.form.language == "fr") ? "F" : "E";
var weekday = (lang == "F") ? wkF[dow] : wkE[dow];
var month   = (lang == "F") ? moF[Num2Date(d,"MM")-1] : moE[Num2Date(d,"MM")-1];
```

This replaces `ZABF_DATE_TO_DAY` + `ZABF_ISP_GET_MONTH_NAME` exactly, using
only data already in the interface. **Verify once in LiveCycle Designer**:
the tool validates FormCalc/JavaScript interactively as you type — unlike
the ABAP report, a syntax slip here surfaces immediately, not as a dump
later, so treat the snippet above as the logic to implement, not a
guaranteed-exact paste.

### 6.4 SO10 header note — likely already covered, confirm first

`READ_TEXT` (object `EBANH`, ID `B01`) fetches the PR's header long text —
another live ABAP call FormCalc/JS can't reproduce. **But**: the interface
already has a `TABLES T_TEXT` parameter (`docs/legacy_grab/Z_MM_PR_FORM.md`
§2) — a table of text lines is exactly the shape `READ_TEXT` would fill.
**Before adding a third new parameter, check whether `T_TEXT` already
carries this content** (likely, given the name) — if so, bind the MAIN
window's header-note text directly to it, no interface change needed at
all. Only add `IV_HEADER_NOTE` as a new optional parameter if `T_TEXT`
turns out to serve a different purpose once you inspect a real call.

### 6.5 Column 12-14 field bindings — verification, not a design decision

Carried over from §4 — these three bindings are medium-confidence from the
export alone; confirm against a real printed PR. Not resolvable by design
judgment, needs the real system.

## Interface summary — what changes, what doesn't

| | Count | Detail |
|---|---|---|
| Unchanged (existing 24 IMPORTING params) | 24 | Every field in `Z_MM_PR_FORM.md` §2 stays exactly as declared |
| Unchanged (TABLES, EXPORTING, EXCEPTIONS) | all | `T_FINAL`, `T_TEXT`, `DOCUMENT_OUTPUT_INFO`, etc. — untouched |
| **New, optional** | 2 (possibly 3, pending §6.4) | `IV_REQ_EMAIL TYPE STRING OPTIONAL`, `IV_FRGKZ TYPE EBAN-FRGKZ OPTIONAL` |

Both new parameters are **optional with a safe blank/hidden default** — an
unmodified existing caller is unaffected. This is the one interface change
Bolt is making unilaterally per your authorization; it's additive only,
never a required-parameter change, so it doesn't conflict with
`docs/01_scope.md` §8's interface-preservation rule.

## 7. Still open — not this checklist's job, but blocking full sign-off

- Driver program: **unresolved** (source scan found nothing) — confirm with
  the functional owner. Doesn't block the *design* build, does block
  Phase 6 wiring later.
- Output determination: **not found in TNAPR** — same status.

## 8. Validation before sign-off

1. Visual match against `Z_MM_PR_FORM_blueprint.html` — every subform
   position, every field, every exclusion in §5 accounted for.
2. Confirm `T_TEXT` covers the SO10 header note (§6.4) before assuming it
   does — if it doesn't, add `IV_HEADER_NOTE` and note it in the interface
   summary above.
3. Test both new optional parameters (§6.1, §6.2) two ways: with a value
   supplied (email shows, watermark conditionally shows) **and** blank
   (email line empty, watermark hidden) — the blank case is what every
   existing, unmodified caller will actually see until Phase 6 wiring.
4. Run one real Purchase Requisition through both forms:
   old Smart Form → OTF (`GETOTF='X'`) → PDF (`CONVERT_OTF`);
   new Adobe Form → its own PDF, same interface data. Diff visually.
5. Composite risk is **Medium** (`Z_MM_PR_FORM_blueprint.html` §05) — no
   named sign-off strictly required at Medium, but recommended given this
   is the **first form built with this process** — treat it as the pilot.

## Is it ready to import into SFP?

There's no literal import — SFP doesn't take a markdown spec as input. What
"ready" means here: every number and decision above is either read directly
from the real export or a deliberate, reasoned choice (§6) — nothing left
to *design*. What's left is genuinely manual: building each subform at its
coordinates, wiring the two new optional parameters into the interface, and
pasting the two script snippets in. That's real work, but it's execution
against a finished spec, not open design questions.
