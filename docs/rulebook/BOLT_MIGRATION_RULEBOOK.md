# Bolt Migration Rulebook — SmartForm → Adobe Form (SF2AF)

**Single-file, AI-consumable rulebook for the `VernasoftTechie/Smartform-Adobe-Migration`
project.** This file is the input given to Claude on every Bolt Console migration
run. It consolidates the project's scope, governance, the strategy catalogue
(S01–S07), and the generalized lessons from every real defect logged in
`docs/BUILD_ISSUES_LOG.md`. It is maintained as **one file, by request only** —
update it only when explicitly asked to; do not let it silently drift from the
full documents in the repo (`docs/01_scope.md`, `docs/02_legacy_grab_spec.md`,
`docs/04_global_style_catalogue.md`, `docs/05_individual_form_conversion_framework.md`,
`docs/08_migration_operating_model.md`, `docs/strategy/*.md`,
`docs/BUILD_ISSUES_LOG.md`), which remain the source of truth this file is
generated from.

Every code pattern below is copied verbatim from a construct that has actually
rendered or activated in a real SAP/Designer session — never invented. Where a
pattern is still unconfirmed or only tested once, that is stated explicitly.
Follow that same discipline going forward: never present a guess as a proven
pattern.

---

## 0. What this project delivers — and what it never touches

- **Deliverable: Adobe Form design + interface only.** Every phase from
  discovery onward produces a signed-off Adobe Form design. Nothing is ever
  wired live, and no driver program is ever touched.
- **Driver programs are permanently read-only.** They are read to understand
  calling context (multiple drivers can call the same form for different
  purposes) — never modified, never rewritten, never a target for "fixing" to
  make a form appear to work. How an existing driver eventually reaches the
  new Adobe Form is a separate, later, per-driver decision this project does
  not propose or build.
- **Never invent an SAP field, table, API signature, or driver identity.**
  Every fact about a specific form (interface, style, logo, driver program)
  comes from that form's legacy-grab snapshot (`docs/legacy_grab/<form>.md`
  plus its raw `.xml` export) or is confirmed live in the system — never
  guessed, never pattern-matched from a similar-looking form.
- **80–85% design accuracy is the accepted target**, with the remainder
  handled manually with suggestions — not a reason to lower rigor on the part
  that is automated, but a signal that an unresolved item is not a blocker:
  log it as a Developer Extension Point (§7) and keep moving.
- **Every form is risk-scored before conversion** (business criticality,
  interactivity, layout complexity, driver complexity, integration
  touchpoints, localization, volume) → Low/Medium/High/Critical. High/Critical
  forms need a **named** business sign-off — never auto-approved, never
  auto-cutover.
- **The interface is preserved exactly.** Whatever eventually calls the Adobe
  Form must see an unchanged parameter/table contract from the legacy
  snapshot's interface section.
- **Before designing anything, check §13 for an already-achieved precedent**,
  and hold the output to §14's first-attempt discipline before presenting it
  as finished.
- **While working a live migration, follow §15's confirmation gates** —
  interface first, stop for the operator's own confirmation before layout,
  stay open to follow-up changes, and log the full record in the branch.

## 1. Driver identification — fixed in the tool, pending a live activation test

`ZSF2AF_R_LEGACY_GRAB`'s driver-candidate scan (`build_driver_index`)
previously flagged a program as a form's driver by two independent, loose
checks: its source contained the literal string `SSF_FUNCTION_MODULE_NAME`
*anywhere*, and it contained the form's name *anywhere else in the file*.
Neither check confirmed the form name was the actual argument on that
specific call. This produced a confirmed false result on `ZSD_ATC`: the scan
surfaced two unrelated programs as "driver candidates" (each matched by
coincidence) while completely missing the real driver, which NACE's own
`TNAPR` row names via `PGNAM` (`ZSD_DRIVER_ATC`) — the scan never found it
because it calls a wrapper routine, not `SSF_FUNCTION_MODULE_NAME` directly.

**Fixed 2026-09-25** (`src/zsf2af_r_legacy_grab.prog.abap`, not yet
live-activation-tested per this program's own S01 discipline — treat as
correct in design, unconfirmed in practice until run against a real system):

1. The source-scan match is now bounded to a window (±20 lines) around an
   actual `SSF_FUNCTION_MODULE_NAME` call site, instead of the whole file —
   this alone would have ruled out both of `ZSD_ATC`'s false positives. It
   still cannot prove the form name is the literal `FORMNAME` argument (a
   real call site almost always passes a variable, not a literal), so a
   window hit remains a **candidate**, never a confirmed driver.
2. `capture_output_determination` now also extracts `TNAPR-PGNAM` — NACE's
   own record of the driver — and every snapshot's section 3 opens with an
   explicit, computed **MATCH / MISMATCH** reconciliation against the
   source-scan candidates, including a live `TADIR` check on the PGNAM value
   when it doesn't match anything the scan found. This is what would have
   caught `ZSD_ATC`'s mismatch automatically, at generation time, instead of
   a human noticing days later.

**Standing rule regardless of this fix**: never present a legacy-grab
"driver program candidate" as confirmed on its own. The new MATCH/MISMATCH
line is the authority to read, not the candidate list below it. On MISMATCH
or an empty PGNAM, flag the driver as an open question for the functional
owner — do not silently pick the nearest textual match. This does not block
interface or layout work (the interface is self-contained from the form's
own definition), but it must never be reported as resolved when it isn't.

## 2. What the legacy-grab snapshot gives you, and what stays manual

Automated (high confidence, safe to trust): the generated function module
name, the form's interface (import/export/tables/exceptions via `FUPARAREF`),
driver-program full source + one level of includes + dependency scan (subject
to §1's caveat), the full prerequisite checklist, NACE/`TNAPR` output
determination rows.

Still manual, every form: SmartStyle name(s) used, logos/graphics, and the
form's window/page/node outline — these live inside the Smart Form's internal
storage with no confirmed table-based read. **The real unlock**: SE71/
SMARTFORMS → Utilities → Download exports the complete form definition as XML
(`<sf:SMARTFORM>`, one `<sf:WINDOW>` per window with `<sf:NODE>` children,
`<sf:GRAPHIC>` for logos, `<STYLE_NAME>` per text node). This XML — not the
condensed `.md` snapshot — is the real design source for layout work.

**Large exports (100–300 KB, effectively one line) must be read by byte-offset
extraction** (`grep -bo` + `tail -c`), never the normal line-based read —
the condensed snapshot only names structures, never the literal ABAP source
inside a `%CODE` node or a `TYPES` block. Reading the condensed version alone
has already hidden real distinctions (e.g. two similarly-named date fields
computed differently) that only the byte-offset-extracted literal source
revealed.

OTF (the rendered print stream) is **never a design source** — it holds no
layout, loop, or interface information. Its only correct role is Phase 2
validation: diff the new Adobe Form's PDF against the old Smart Form's OTF
(`GETOTF='X'` → `CONVERT_OTF`) for the same real document.

## 3. Interface hand-authoring boundary — exactly what is safe to write directly

Hand-author and commit directly to `.sfpi.xml`, then Pull onto a form/interface
pair currently in the safe empty baseline:

- `CL_FP_PARAMETERS` → `IMPORT_PARAMETERS`/`EXPORT_PARAMETERS`/
  `TABLE_PARAMETERS` (each a list of `SFPIOPAR`: `NAME`/`TYPING`/`TYPENAME`/
  `OPTIONAL`/`BYVALUE`/`DEFAULTVAL`/`STANDARD`/`CONSTANT`).
- `CL_FP_GLOBAL_DEFINITIONS` → `GLOBAL_DATA` (list of `SFPGDATA`: `NAME`/
  `TYPING`/`TYPENAME`/`DEFAULTVAL`/`CONSTANT`).
- `CL_FP_GLOBAL_DEFINITIONS` → `TYPES` — **confirmed safe.** Same shape as
  `INITIALIZATION` below: a list of `FPCLINE` entries, one per literal ABAP
  source line (`TYPES: BEGIN OF ...`, each component line, `END OF ...`), not
  a structured component list like `GLOBAL_DATA`.
- `CL_FP_CODING` → `INPUT_PARAMETERS`/`OUTPUT_PARAMETERS` (bare `FPPARAMETER`
  name lists) and `INITIALIZATION` (list of `FPCLINE` entries, one per source
  line, blank lines as empty `<FPCLINE/>`).
- `CL_FP_REFERENCE_FIELDS` (`SFPREF`) — flat list, proven safe repeatedly.

**Never hand-author:**

- **`EXCEPTIONS`** (under `CL_FP_PARAMETERS`). Two attempts threw a hard
  deserialize error on Pull. Its real XML shape has never been captured from
  a native-entry example — enter exceptions natively in SFP until it is.
- **Any `STANDARD="X"` import/export parameter** (the classic SSF envelope —
  `ARCHIVE_INDEX`, `CONTROL_PARAMETERS`, `OUTPUT_OPTIONS`, `JOB_OUTPUT_INFO`,
  etc.). Confirmed: SFP silently drops these on Pull and substitutes its own
  `/1BCDWB/DOCPARAMS`. Hand-authoring them has no effect — skip them
  entirely; only include the form's genuinely custom, non-`STANDARD`
  parameters.
- **`CL_FP_CONTEXT`** (the Context tree), under any circumstances. It is a
  linked graph of GUID-identified nodes (`CL_FP_FOLDER`/`CL_FP_DATA`/
  `CL_FP_LOOP`/`CL_FP_CONDITION`/`CL_FP_ALTERNATIVE`, threaded by `PARENT`/
  `SUCCESSOR`/`CHILD`), not a flat list. Always drag nodes from the Interface
  tree into Context manually in SFP, then capture with Stage → Commit → Push.
  Context is build-once-in-the-tool-then-pull-to-capture — never
  push-from-repo. Every Pull overwrites SAP's live Context with whatever the
  repo file holds, so re-pulling an old file discards hand-built Context.

**Validation, every time**: confirm the target form/interface is in the safe
empty baseline before pushing; validate the XML is well-formed before
pushing, not after Pull fails; after Pull, confirm the Interface tree shows
the expected sections — if a deserialize error occurs, isolate by removing
`EXCEPTIONS` first.

## 4. QUAN/CURR reference-field resolution — a recurring, solvable class of error

Every QUAN (quantity) or CURR (currency) field surfaced in Context needs a
`CL_FP_REFERENCE_FIELDS` entry pointing its unit/currency at a field that
**actually exists and is declared somewhere in the interface's own data
model** — not a same-named sibling column assumed to auto-resolve, and not
necessarily the field the legacy structure's own original reference pointed
at (that original reference often points at a source table that isn't part
of this Context at all).

Resolution pattern, in order of preference: (1) an existing import parameter
or full structure field already in Context (e.g. `LS_EBAN-MEINS`,
`LS_EKKO-WAERS`); (2) a dedicated standalone `GLOBAL_DATA` entry built
specifically as a reference-field target when nothing evidenced already
carries the right unit/currency (e.g. `GV_GEWEI TYPE GEWEI` for weight
fields with no other unit field in scope). When SAP reports "Field X does
not exist," the fix is almost always that the reference target needs a real,
qualified declaration — not that the field name itself is wrong.

## 5. Layout — position-by-default, the standing rule for every row

**Every** label/field row, table cell, and multi-child subform in **every**
form's `.sfpf.xdp` gets `layout="position"` with explicit `x`/`y` on every
child, from the first line written — not a fallback for when something
breaks. This cost three separate debugging rounds on one template block
before being written down; the unpredictability of `layout="row"`/`"tb"`
auto-flow at 2+ levels of nesting is itself the reason never to depend on it.

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

Compute `x` as the running sum of the previous siblings' widths; `y="0cm"`
for everything on the same line. A subform that only *stacks* other subforms
vertically (a column of rows, a page's body) may stay `layout="tb"` — that
stacking mechanism is not in question, only the layout *inside* each row.

**Narrow exception**: `layout="row"` is acceptable only for a subform that is
a direct child of a `position`-layout parent (not `tb`, not another `row`),
with exactly one draw + one field, one level deep. Do not extend this by
analogy to a new case "because it looks similar" — if it doesn't match this
exact shape, use explicit `position`.

**Proactive triggers — act before it breaks:**

| Signal | Act by |
|---|---|
| A row would sit more than 1 level of layout nesting deep | Using explicit `position` from the start |
| A label longer than ~15–18 characters at 8–9pt in a column narrower than ~3cm | Giving that row generous height (0.9–1.0cm, not 0.5–0.6cm) in the same edit |
| Any native SFP/Designer save is about to happen | Recording the pre-save commit hash so the post-save diff (§6) has something to compare against |
| A signature line, blank, or placeholder is needed | Using the bottom-border-draw pattern (§8.7) — never underscore characters |
| A new form's geometry doesn't match anything already proven below | Building the smallest possible test case for that new shape first |

## 6. Diff after every native SFP/Designer save — never assume "only one thing changed"

LiveCycle Designer/SFP does not write a surgical diff when it saves — it
**reserializes the entire template**, and has been confirmed to **silently
strip attributes** (specifically `layout="row"`) from subforms the user never
touched, even when the user's own edit was as small as repositioning two
rows. A 2-row edit has produced a 2,800-line diff carrying an unrelated
regression across 15 other subforms.

**Required practice after every Pull following a native save**: `git diff
<last-known-good> <new-pull>` on every changed file. For a large diff, don't
eyeball it — specifically confirm every subform that previously had
`layout="row"`/`"tb"` still has it (silently reverting to the `position`
default is the confirmed failure mode), and confirm no `bind`/`occur`/
`border` disappeared from an unrelated subform. Only trust the new pull as a
baseline after this check.

## 7. Landscape / wide-form layout and the margin rule

For a form whose window positions or table width exceed portrait A4:

```xml
<medium long="297mm" orientation="landscape" short="210mm" stock="a4"/>
<contentArea h="206mm" w="290mm" x="5mm" y="2mm"/>
```

Explicitly setting `orientation="landscape"` is mandatory — without it,
Designer can render a `long="297mm"`/`short="210mm"` page as 210mm-wide
portrait despite the dimensions being correct.

**Margin rule (applies to every form, not just landscape)**: `x + width <=
page width` is **necessary but not sufficient**. A 0.4cm right margin worked
on one form but the identical arithmetic (content ending 0.5cm from a 21cm
page edge) still produced visible overflow on another — the exact extra
offset was never fully diagnosed (possibly `contentArea`'s own `x`/`y`
compounding with the content's own offset). **Budget at least 1–1.5cm of
margin on every side for a first-pass layout**, not just enough to clear the
page width exactly. Treat anything under 1cm as a real risk worth a live
Design View check regardless of how the arithmetic works out on paper.

## 8. Reusable XDP patterns — copy, don't re-derive

Every pattern below has actually rendered correctly in a real SAP/Designer
session. Copy the shape; only field names, widths, and bindings change per
the current form's own evidence. All patterns follow §5 (explicit position).

### 8.1 Label + single field row
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

### 8.2 Label + two fields ("No. and Date:" pairs)
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

### 8.3 A column of stacked rows
The only place `layout="tb"` is used for row-to-row stacking — the column
itself, not what's inside each row.
```xml
<subform h="5.68cm" layout="tb" name="template_col1" w="10.66cm" x="0cm" y="0cm">
   <bind match="none"/>
   <font size="7pt" typeface="Arial"/>
   <!-- one 8.1 or 8.2 row per line, in order -->
</subform>
```

### 8.4 Side-by-side columns
```xml
<subform h="5.7cm" name="template_block" w="20.20cm" x="0.4cm" y="8.3cm">
   <bind match="none"/>
   <subform h="5.68cm" layout="tb" name="template_col1" w="10.66cm" x="0cm" y="0cm">...</subform>
   <subform h="5.58cm" layout="tb" name="template_col2" w="9.54cm" x="10.66cm" y="0cm">...</subform>
</subform>
```
Always check `x + w` of the outer block against the page's content width
(§7) before trusting this.

### 8.5 Repeating table (header + occur row)
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
      <bind match="dataRef" ref="$.LT_SOME_TABLE.DATA[*]"/>
      <border><edge thickness="0.26mm"/><edge thickness="0.26mm"/><edge thickness="0.26mm"/><edge thickness="0.26mm"/></border>
      <font size="8pt" typeface="Arial"/>
      <field h="0.55cm" name="c01" w="2cm" x="0cm" y="0cm"><ui><textEdit/></ui><bind match="dataRef" ref="FIELD1"/></field>
      <field h="0.55cm" name="c02" w="2cm" x="2cm" y="0cm"><ui><textEdit/></ui><bind match="dataRef" ref="FIELD2"/></field>
   </subform>
</subform>
```

**Three non-obvious details, each independently confirmed by a real failure:**

1. **The row bind is `$.TABLE.DATA[*]`, not bare `$.TABLE[*]`.** Every SFP
   table parameter's real captured data schema nests a `DATA` array *inside*
   the table name (`<LT_TABLE><DATA dd:maxOccur="-1">...</DATA></LT_TABLE>`).
   A bare `$.TABLE[*]` form was previously documented here as proven — that
   was a transcription error, not a second working variant. If any existing
   form's table still uses the bare form, it has not been re-verified against
   this correction and should not be trusted until it is.
2. The **outer wrapper** (`line_items`) is `layout="tb"` — the one place a
   repeating subform genuinely needs auto-flow, because `occur` instances
   must stack as they're added; a `position`-layout parent renders every
   instance at the same fixed `y`.
3. **`table_row`'s own fields use bare bind refs** (`ref="FIELD1"`, not
   `ref="$.FIELD1"`). The row's own top-level `bind` already establishes each
   instance's context — a child field binds *relative* to that context.

### 8.6 Totals / summary row
```xml
<subform h="1.0cm" layout="position" name="table_total" w="19.70cm">
   <bind match="none"/>
   <font size="8pt" typeface="Arial" weight="bold"/>
   <draw h="1.0cm" name="lbl_total" w="2.5cm" x="0cm" y="0cm"><value><text>Total:</text></value></draw>
   <field h="1.0cm" name="fld_total" w="2.5cm" x="2.5cm" y="0cm"><ui><numericEdit/></ui><bind match="dataRef" ref="$.TOTAL_FIELD"/></field>
</subform>
```
Give a totals/label row generous height (1.0cm, not 0.6cm) from the start if
any label exceeds ~15–18 characters at 8pt.

### 8.7 Signature line (never underscore characters)
An underscore-heavy placeholder risks overflowing its own draw's width and
is a needless text-width guess. Use a bottom-border line instead:
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
The 4 `<edge>` children are top/left/bottom/right in that order — hide 3,
show the bottom one.

### 8.8 Wrap-safe height for any label longer than ~15–18 characters
The single most repeated fix in this program's history (4 separate
occurrences across two forms). A label will wrap to 2 lines at real font
metrics even when a rough character count says it should fit on one — trust
the render, not the estimate.

- Give the row generous height from the start (roughly 1.5–2x a single
  line's height) rather than shipping a tight height and waiting for an
  overflow badge.
- If a badge still appears after that, fix the row/column as a whole first
  (the majority fix), then give only the genuine remaining outlier(s) a
  further targeted increase — don't keep growing every row for one or two
  outliers.
- Reducing font size is the other valid lever, but only when the width
  itself is evidence-locked (an exact legacy column width) — otherwise
  prefer height. When a row needs an ever-taller height to avoid clipping,
  that is itself a sign the font is too large for the space, not a reason to
  keep growing the row.

### 8.9 Conditional visibility (e.g. reprint/draft watermark)

Confirmed working pattern, reused verbatim across two forms: a **sibling**
hidden field (not nested inside the conditional block) carries the flag
value; the conditional content is its own **wrapping subform** (never a bare
`<draw>` — draws don't reliably support scripting the way subforms/fields
do), toggled by an `initialize` script that walks up to the sibling field via
`resolveNode`.

```xml
<field h="1mm" name="lv_flag_check" presence="hidden" w="1mm" x="1cm" y="2.4cm">
   <ui><textEdit/></ui>
   <bind match="dataRef" ref="$.LV_FLAG"/>
</field>
<subform h="0.9cm" layout="position" name="draft_window" w="11.5cm" x="1cm" y="2.5cm">
   <bind match="none"/>
   <!-- ...normal content... -->
   <subform h="0.4cm" layout="position" name="reprinted_watermark" presence="hidden" w="11.5cm" x="0cm" y="0.5cm">
      <bind match="none"/>
      <event activity="initialize" name="initialize">
         <script contentType="application/x-javascript">var flag = this.parent.parent.resolveNode("lv_flag_check");
this.presence = flag &amp;&amp; flag.rawValue === "X" ? "visible" : "hidden";</script>
      </event>
      <draw h="0.4cm" name="lbl_reprinted" w="11.5cm" x="0cm" y="0cm">
         <!-- watermark text -->
      </draw>
   </subform>
</subform>
```

Adjust `this.parent.parent` to the actual nesting depth between the
conditional subform and the sibling flag field — it must resolve to the
subform that is the flag field's own direct parent.

## 9. Per-form conversion procedure

1. **Naming**: Adobe Form uses `_ADT` suffix; its interface uses `_INT`
   (e.g. `Z_MM_PR_FORM_ADT` / `Z_MM_PR_FORM_INT`). Files: layout
   `<name_lower>_adt.sfpf.xdp`, form object `<name_lower>_adt.sfpf.xml`,
   interface object `<name_lower>_int.sfpi.xml` — all in `/src/`, never
   `docs/` (abapGit's `STARTING_FOLDER=/src/` ignores `docs/*` entirely; a
   file placed there is invisible to abapGit regardless of how correct its
   content is).
2. **Read & understand (read-only)**: the interface contract (snapshot §2),
   the driver program(s) for calling context only (snapshot §3, subject to
   §1's accuracy caveat above — never edited), output determination
   (snapshot §4, informs a later separate wiring decision, not acted on now).
3. **Baseline first, always**: create the form and interface in SFP, add one
   native static field, save, activate, confirm the physical page and field
   render, then abapGit **Stage → Commit → Push** to capture the
   SFP-generated baseline. Never Pull a hand-authored or previously-exported
   serialization over a working SFP object — this has corrupted objects
   badly enough to require full delete-and-recreate more than once.
4. **Design from the real export**, not the condensed snapshot: read the
   form's `Utilities → Download` XML (byte-offset extraction if large) plus
   the SmartStyle's own export. Build the layout mapping and build checklist
   from that.
5. **Author the interface** per §3's boundary, get Context built natively in
   SFP (drag nodes from Interface tree, set every QUAN/CURR reference field
   per §4), capture via Stage → Commit → Push.
6. **Author the layout** per §5–§8, in small independently-renderable
   increments — never assemble a whole complex section at once and find out
   via one big screenshot.
7. **After every native SFP/Designer save**, diff per §6 before trusting the
   new pull as a baseline.
8. **Match style/logo needs against the Global Style Catalogue**
   (`docs/04_global_style_catalogue.md`) before designing anything
   form-specific. Log any form-specific override back into the catalogue as
   a candidate.
9. **Anything unresolved** — no catalogue match, no way to verify a layout
   detail, a decision needing business input — becomes a named **Developer
   Extension Point**: a clearly labeled empty placeholder plus a
   post-implementation checklist entry. Never a silent gap, never a reason to
   block sign-off.
10. **Validate**: same real document through both forms, old Smart Form → OTF
    → PDF vs. new Adobe Form → PDF, visual diff.
11. **Sign-off**: business owner reviews; High/Critical-risk forms need a
    **named** sign-off, never auto-approved.
12. **Wiring is out of scope for this procedure** — decided later, per
    driver, by that driver's owner.

## 10. Generalized lessons from real defects (condensed from `docs/BUILD_ISSUES_LOG.md`)

Full forensic detail (symptom, root-cause diagnosis, exact fix) for every
item below lives in the repo's `docs/BUILD_ISSUES_LOG.md` under its F-number.
This section carries only the reusable rule each one produced.

- **Classic function modules need fixed-length types.** A pre-STRING-era FM
  (`SSF_*`, most SAPscript/Smart Forms APIs, many old BAPIs) typically has
  fixed-length `C`/`N`/`D`/`T` parameters — passing a `STRING` directly can
  fail a static type-check even though a plain assignment would convert
  fine. Convert to a fixed-length local first.
- **Abap Doc (`"!`) doesn't support a compound `TYPES:` chain** declaring two
  types at once — use a plain `"` comment there instead.
- **Offset/length notation (`field+off(len)`) is invalid on `TYPE string`** —
  only on fixed `C`/`N`/`D`/`T`. Declare the variable with its real target
  type, not inline `DATA()` inference, before using offset/length or passing
  it to a by-reference formal parameter of a different type.
- **A file meant to become a real SAP object always goes in `/src/`, never
  `docs/`** — check the repo's own `.abapgit.xml` `STARTING_FOLDER`/`IGNORE`
  before placing anything new; don't assume.
- **Don't guess an unfamiliar abapGit object-type's serialization wrapper
  from a raw SAP GUI export.** Get one real example of that exact object
  type serialized by abapGit itself (create the simplest possible object,
  commit it, pull it) and copy its outer structure exactly.
- **`layout="tb"` and explicit per-child `x`/`y` are mutually exclusive** — a
  subform meant to hold absolutely-positioned children must be
  `layout="position"` (or omit `layout`), never `"tb"`.
- **Bind syntax**: every `<bind>` needs `match="dataRef"` alongside
  `ref="$.FIELDNAME"` — a bare `ref` with no `match` attribute, or a `$record.`
  prefix instead of `$.`, both fail. Non-data-bound layout subforms need an
  explicit `<bind match="none"/>`.
- **Absolutely-positioned content belongs inside the page's body subform**,
  which is itself a sibling of `<pageSet>` (not nested inside `<pageArea>`,
  and not the `<pageSet>`'s own root) — `<pageArea>` holds only geometry
  (`<contentArea>`/`<medium>`). When two real reference files disagree on
  structure, trust only the one directly confirmed to render in the current
  environment — "it's a real file" is not the same evidence as "it's been
  seen working."
- **A classic `EXCEPTIONS` parameter on a method signature is a hazard
  sign** — `TRY/CATCH cx_root` around a functional call never catches it;
  use classic `CALL METHOD ... EXCEPTIONS ... OTHERS = n.` + `sy-subrc`.
- **The Context tab is genuinely separate from the SFPF's own serialized
  Context node graph** — it doesn't auto-populate from an abapGit-imported
  interface. It has to be built once in SFP's own tooling (drag nodes in),
  then captured by Pull — never assume it, never push a hand-authored
  version over it.
- **A reference field's `UNIT`/`CURRENCY` value must resolve to an actually
  existing, uniquely-addressable field somewhere in the interface's own data
  model** — never a bare same-named sibling column assumed to auto-resolve.
  See §4.
- **If a form object starts showing UI-level corruption** (unresponsive
  Layout, can't select/edit, even for a brand-new element placed via the
  tool's own UI) after several import/edit/activate cycles, **delete and
  recreate the object immediately** rather than continuing to debug in
  place — re-import never clears whatever generated/cached runtime state
  causes this.
- **A new child package under a shared parent package needs
  `FOLDER_LOGIC=PREFIX`-compliant naming from the start** (must begin with
  the parent's own name) or it breaks abapGit pulls for every repo scoped to
  that parent.
- **Read literal source by byte offset for any form with real embedded
  logic** before writing its interface coding spec — a conceptual paraphrase
  of a `%CODE` block can hide execution-scope and field-identity
  distinctions (e.g. whether logic runs once vs. per table row) that only
  the exact source reveals.
- **Don't reuse another form's or a colleague's reference file's field
  mappings uncritically** — a reference file's own `CL_FP_REFERENCE_FIELDS`
  or similar list can itself be incomplete or internally inconsistent; live
  system error feedback is more reliable than a static reference document
  for this specific question.
- **When "most labels fit, a couple don't," fix the couple, not the whole
  section again** — don't treat a small number of genuine outliers as
  evidence the global setting (font size, row height) is wrong project-wide.
- **After any native SFP/Designer save, diff before trusting it** — see §6;
  this is the single most expensive repeated lesson in the project's history
  (three separate debugging rounds on one template block before being
  written down as a standing rule).

## 11. Open items — do not silently resolve these; they are real, unclosed gaps

- **`ZSD_ATC`'s real driver identity** (`ZSD_DRIVER_ATC` per NACE) has never
  been located as a program in the source scan — see §1. Treat as unresolved
  until a live debugger trace or Basis lookup confirms it.
- **`YMMGRNNOTE_ADT`'s own repeating `MAIN` table** was built before the
  `$.TABLE.DATA[*]` binding correction (§8.5 item 1) and has never been
  re-verified against it — do not assume it is correct without checking.
- **`YMM_ISSUE_RESERVATION_ADT`'s table row-repeat behavior** with real
  multi-row data has never been confirmed via a Design View screenshot.
- Any Developer Extension Point logged in
  `docs/05_individual_form_conversion_framework.md`'s post-implementation
  checklist for a given form remains open until a functional owner resolves
  it — never close one silently.
- **Multi-page / flowed content** (a table that genuinely overflows one
  page, headers/footers repeating across pages) has no proven pattern yet —
  every form converted so far is single-page. Do not assume §5's
  position-by-default approach extends automatically to a genuinely
  multi-page form; treat it as a new, unproven case requiring its own
  smallest-test-case validation before trusting it.

## 12. Creating a conversion branch for a new requirement

Formalized 2026-09-22 from an observed pattern across three branches,
previously undocumented — treat as a standing rule, not a suggestion.

**Naming**: `vernasofttechie-<formname>`, where `<formname>` is the Smart
Form's technical name, lowercased, with underscores removed —
`YMM_ISSUE_RESERVATION` → `vernasofttechie-ymmissuereservation`,
`ZSD_ATC` → `vernasofttechie-zsdatc`. No other separator; the prefix is
fixed for this program, not swapped per contributor.

**Always cut from an up-to-date `main`, never from another form's branch or
a stale local `main`.** Branching from a stale `main` is exactly how earlier
strategy updates once went missing from new branches until someone
remembered to sync them — the same risk this rulebook exists to prevent.

```bash
git fetch origin
git checkout main
git pull origin main
git checkout -b vernasofttechie-<formname>
```

Before starting design on the new branch, confirm `docs/strategy/README.md`
lists every strategy currently on `main` — if it doesn't, the branch was cut
from a stale `main`; delete it and recut rather than proceed with an
outdated rulebook.

Full detail: `docs/08_migration_operating_model.md` §8.

## 13. Reference already-achieved scenarios before designing anything new

Before authoring any interface or layout content for a form, check for the
closest already-validated precedent — in this order:

1. **`docs/strategy/README.md`'s "Current successful scenarios" table** — it
   names which S-strategy applies to a given form shape (wide/landscape,
   composite header+table+signature, etc.) and links its supporting
   evidence. Read the matched strategy in full (§3–§8 above) before writing
   anything.
2. **The actual completed forms, as worked examples, not only the
   abstracted pattern library.** `YMMGRNNOTE_ADT`, `YMM_ISSUE_RESERVATION_ADT`,
   and `ZSD_ATC_ADT` (their real `.sfpf.xdp`/`.sfpi.xml` in `/src/`, and their
   `docs/legacy_grab/<form>_interface_scope_ledger.md` evidence) are real,
   rendered precedent — sometimes ahead of what has been promoted into the
   strategy catalogue. §8.9's conditional-visibility pattern, for example,
   existed as real, working code in `ZSD_ATC_ADT` before it was written into
   this rulebook. When a new form needs something not yet in §8, check
   whether a completed form already solved it before treating it as new.
3. **Never re-derive a shape that already has a validated precedent.** Copy
   the closest match; only field names, widths, and bindings change per the
   new form's own legacy evidence — the same rule §8's own header states.
   Treating an already-solved shape as novel is how the same debugging
   round gets paid for twice.
4. **When nothing already proven matches**, that is itself meaningful
   signal (§5's proactive-trigger table) — say so explicitly, build the
   smallest possible test case for that new shape first, and treat it as
   genuinely new rather than forcing an ill-fitting precedent onto it.

## 14. First-attempt accuracy discipline

This rulebook exists to make the design layer — pattern selection, interface
authoring, evidence reading — as close to correct as possible on the very
first attempt, by citing exact precedent instead of re-deriving, and by
never guessing what a real defect has already answered. Before presenting
any design output as finished, it should hold up against this checklist:

- **Every binding or field claim cites its exact evidence source** (a
  snapshot section, or a byte offset in the raw XML export) — never an
  unlabeled assumption.
- **Every layout construct matches an existing precedent** — cite which
  pattern in §8, or which completed form (§13), it was copied from. If none
  matches, say so explicitly rather than presenting a new guess as settled.
- **Every driver, reference-field, or interface-boundary claim has been
  checked against §1–§4's rules** before being stated as fact.
- **Anything unconfirmed is flagged as unconfirmed**, in the output itself —
  not silently smoothed over. §11 names the specific open items already
  known; any new one found during a fresh migration gets named the same
  way, not resolved by assumption.

**What this discipline cannot do, and must not claim to do**: it cannot
replace live SFP/Designer confirmation. This project's own history has a
confirmed case (§10, the repeated `layout="row"` lesson) of a construct that
was correctly declared, matched a proven pattern, and still rendered
unreliably for reasons never fully explained — a real example of
environment-level behavior no document can predict with certainty. Every
strategy in this rulebook (§3, §5, §6, §8.8) already says the same thing in
its own terms: well-formed, evidence-backed output is necessary, never
sufficient, and a Design View or activation result is always the actual
authority. A rulebook that claimed otherwise would contradict its own most
expensive lesson. **The realistic target is this**: eliminate every
previously-seen class of error on the first attempt, and never present
unconfirmed work as done when a live check could have caught it.

## 15. Live interaction protocol — confirmation gates and continuous conversation

This section governs *how* Bolt behaves turn-by-turn while working a live
migration in Bolt Console — when to act, when to stop and ask, and what
must be true before moving to the next stage. §9 already defines *what*
each stage does; this defines the *sequence and gating* between them, and
applies on top of §9, not instead of it.

**Level 1 — Interface first.** Read the migration's reference files (§2's
byte-offset discipline for any large raw export) and author the interface
content per §3's boundary — `IMPORT_PARAMETERS`/`EXPORT_PARAMETERS`/
`TABLE_PARAMETERS`/`GLOBAL_DATA`/`TYPES`/`CL_FP_CODING`/
`CL_FP_REFERENCE_FIELDS`. Present this as a proposal in the response — not
yet pushed, not yet assumed correct. Never propose content for `EXCEPTIONS`
or `CL_FP_CONTEXT` (§3's never-hand-author list).

**Level 2 — Confirm the native baseline and push, then stop and wait.** Tell
the operator plainly what has to happen next in SAP, and stop there: create
the form/interface in SFP with one native static field (S01), build Context
by dragging the interface's own nodes in and resolving every QUAN/CURR
reference field (§4), then abapGit **Stage → Commit → Push** onto this
migration's own branch. Ask directly — *"Confirm once you've created the
baseline and pushed it"* — and do not proceed until the operator says so in
their own words. Never treat silence, a timeout, or an assumption as
confirmation, and never imply a push happened that wasn't reported.

**Level 3 — Layout design, only after a confirmed push.** Once the operator
confirms, verify it before designing anything — check the branch for a real
commit past the interface baseline, the same way this rulebook's own
maintenance checks real repo state rather than trusting a description (§14).
Only then author the layout per §5–§8, citing precedent per §13.

**Level 4 — After layout, ask what's next; never declare finished on your
own.** A layout proposal is not a conclusion. Ask explicitly what needs to
change — a defect from a live Design View screenshot, a missing field, a
wrong binding — and revise. Treat this as the expected shape of the work,
not an exception path.

**Level 5 — Stay open for anything, for as long as the operator is working
this migration.** Do not treat interface → confirm → layout → revise as a
fixed pipeline that ends after one pass. The operator can ask anything at
any point — a question, a change unrelated to the last proposal, a request
to revisit an earlier decision — and it gets a direct, contextual answer or
change, the same way this rulebook itself gets revised turn-by-turn in a
live conversation, not through a rigid script. The migration stays open
until the operator says it's complete.

**Level 6 — Persist the full record in the branch itself, not only in Bolt
Console's own database.** At minimum on every proposal, every confirmation
gate, and every revision, append an entry to
`docs/legacy_grab/<form>_bolt_log.md` on the migration's own branch (same
naming convention as the existing
`docs/legacy_grab/<form>_post_implementation.md` files) — timestamp, actor,
what was asked, what was proposed or done, and the real git commit hash once
something is pushed. Commit this log alongside whatever else is being
pushed at that step, not as a separate step the operator has to remember.
This is what makes the full history readable directly from the branch
later, independent of whether Bolt Console's own activity log or database
survives — matching this rulebook's own "the repo is the durable source of
truth" position.

**What this section can and cannot guarantee.** This rulebook shapes what
the AI *proposes* in its own responses — it cannot force the application
around it to literally pause between turns, verify a GitHub push actually
happened, or write the log file automatically. Those are the Bolt Console
application's own responsibility (a real check against the GitHub API
before Level 3 starts, and a step in its own code that writes Level 6's log
entry), not something a rulebook document can enforce by itself — flag this
explicitly to whoever builds that part, the same way §12's branch-naming
convention turned out not to be followed by the application's own git logic
even though it is written here.
