# 03 – Smart Form to Adobe Form Migration – Version History

## v5.1 — load the initial global SAP asset inventories

Added the supplied SAP-wide `P_GLOB` outputs to `docs/global_data/`: 41
SmartStyle records and 574 SE78/STXBITMAPS graphic records, plus the supplied
Dangote logo reference. Recorded SHA-256 values and updated the global
findings register to link the immutable source inventories rather than
duplicating them into Markdown.

## v5.0 — isolate pilot forms from the new package import scope

Aligned the package definition description with `ZAB_ADOBE` and moved the
already-worked Hello World and Purchase Requisition SFPF/SFPI/XDP artifacts
from `/src/` to `docs/reference_examples/sfp_generated_archive/`. Because
`docs/*` is ignored by `.abapgit.xml`, those forms remain available as
references but cannot be pulled into the new package. `/src/` now contains
only the package definition and `ZSF2AF_R_LEGACY_GRAB`.

## v4.9 — create the shared global-data intake library

Added `docs/global_data/` as the single `main`-branch home for the one-time
global SmartStyle inventory, original SmartStyle XML exports, SE78 graphic
inventory, and approved source graphics. Conversion branches use this
library after their own Smart Form export identifies the referenced assets;
they no longer need duplicate style/logo uploads.

## v4.8 — establish the successful-scenario strategy catalogue

Added `docs/strategy/` as the shared `main`-branch catalogue for scenarios
that have rendered and activated successfully in SFP. Its initial entries
capture the SFP-generated baseline/capture discipline, A4 landscape geometry,
and PR composite design. Updated the operating model with the `main` versus
conversion-branch contract and recorded `_ADT` forms / `_INT` interfaces as
the future naming standard without renaming the already-proven pilot.

## v4.7 — correct the landscape master page

The pilot's physical page was rendering in portrait even though its medium
specified A4's long and short sides. The missing XFA
`orientation="landscape"` attribute left only 210 mm of visible width, so
the valid 290 mm legacy table and right-side header appeared to overlap or
fall beyond the page. Added the explicit landscape orientation and recorded
the durable check as F24.

## v4.6 — complete the visible pilot-layout framework

Added the verified visible secondary-window elements to the generated pilot
baseline: the `Approved PR` conditional watermark, signature labels,
date-display calculation, native XFA Page X of Y calculation, and table
row/header outlines. The watermark remains hidden for blank or unsupported
release status, and the date field falls back to the received value when it
is not in a recognized safe format. `T_TEXT` placement and the grand-total
semantics stay explicit extension points because no captured output proves
their intended use.

## v4.5 — establish the reusable pilot design framework

Created `docs/09_pilot_design_framework.md` from the rendered
`Z_MM_PR_FORM_ADT` baseline and the captured legacy evidence. It separates
reusable XDP layout patterns from SFP-generated Context/interface artifacts
and names every remaining form-specific behavior as an evidence-backed
extension point. This is the working model for the next form, not an object
serialization to copy into another form.

## v4.4 — visual-shell rendering confirmed; begin the `T_FINAL` table increment

The user confirmed that `bf5d290` renders in SFP/Adobe LiveCycle Designer.
This proves the recovery method: a real SFP-generated baseline, preserved
generated Context, and a small XDP-only increment can render reliably after
abapGit import. The root-cause and durable operating rule are recorded as
F23 in `docs/BUILD_ISSUES_LOG.md`.

The next bounded increment adds the legacy-specified 14-column line-item
structure backed by the already-generated `T_FINAL` Context. It does not
alter the interface or Context and deliberately leaves the uncertain legacy
column mappings (Open PO, Total Available Stock, and Total Value) subject to
a real-Purchase-Requisition PDF comparison.

## v4.3 — capture the generated baseline and add visual shell increment

The SFP-created baseline was exported through abapGit and pushed at
`c507878`. It restores a real XDP `pageSet`/page area and the generated
SFPF Context graph; these are now the only valid base for pilot design.

The first controlled design increment updates only the generated XDP's visual
shell: A4 landscape geometry, confirmed logo URL, company/plant/title block,
request captions, PR header fields, and estimated-value line. It leaves the
repeatable table, Context changes, reference-field changes, and scripts for
later independently rendered increments.

## v4.2 — remove the unsafe pilot import artifacts

Removed the three hand-authored `Z_MM_PR_FORM_ADT` artifacts from `/src/`:
the XDP layout, SFPF metadata, and SFPI metadata. An abapGit Pull had proven
that these files overwrite an otherwise healthy SFP-generated form and
produce `Failure to layout form: no pageSet element defined`.

The legacy snapshot, visual blueprint, and build checklist remain available
under `docs/legacy_grab/`. The replacement artifact set must be created and
saved in SFP, verified in Designer, then exported through abapGit
**Stage → Commit → Push**. Logged as F21 in `docs/BUILD_ISSUES_LOG.md`.

## v4.1 — correct the SFP baseline capture direction

The controlled test established the decisive fact: a newly created,
SFP-activated Adobe Form displayed a physical Designer page and native
`User` field correctly. After an abapGit **Pull**, that same form reverted to
the hierarchy-only state and LiveCycle reported `Failure to layout form: no
pageSet element defined`.

The cause was process direction. Pull imports the repository's old
hand-authored serialization into SAP, overwriting the working
SFP-generated layout; it does not capture the new SAP object. The standard
capture workflow is therefore **Stage → Commit → Push** from abapGit
immediately after a form first renders, and after each validated increment.
Only other systems may Pull after that generated serialization has been
pushed.

This replaces the earlier, incorrect “pull-to-capture” wording in the
framework documents. Logged as F20 in `docs/BUILD_ISSUES_LOG.md`.

## v4.0 — fix F16: reset to a minimal baseline instead of another full rewrite

v3.1 matched Hello World's exact skeleton and Design View was STILL
blank. A direct test - dragging a brand-new Text field from the Object
Library onto the empty canvas, not from our file at all - also showed
nothing, and the object then started showing as corrupted/unresponsive.
Since even a UI-placed element didn't render, the problem was no longer
conclusively isolated to our file's content - continuing to rewrite the
whole design was the wrong move.

**Reset, not another guess.** Recommended deleting and recreating both
`Z_MM_PR_FORM_ADT` objects (form + interface) to rule out corrupted
object state. Stripped `z_mm_pr_form_adt.sfpf.xdp` to a deliberate
minimal baseline: root "data" -> pageSet/pageArea (geometry only) -> one
`page_body` subform -> one static draw + one bound field (`BANFN`). No
image, table, scripts, or HTML blocks - as close to Hello World's proven
shape as possible while still being the real object.

The full design (logo, header, type-of-request text, PR header fields,
value line, watermark script, computed date line, page footer, 14-column
table) is preserved in git history at commit `0b8e141` (v3.1) and in
`docs/legacy_grab/Z_MM_PR_FORM_build_checklist.md` - it gets added back
one piece at a time, confirming Design View after each addition, only
once this baseline is confirmed rendering. Logged as F16 in
`docs/BUILD_ISSUES_LOG.md`.

## v3.1 — fix F15: revert pageArea nesting, rebuild on Hello World's confirmed pattern

v3.0's third fix (content nested inside `<pageArea>`) was reasoned from
`ZSD_SODETAILS_FORMS`, a reference never actually confirmed to render in
this tool/environment - only assumed because it's a real file. After
0 activation errors (F9/F10/F13/F14 all fixed), Design View and Print
Preview both still showed nothing.

Re-checked against `zhello_world_form_adt.sfpf.xdp` - the one file
directly confirmed by the user to render in this exact SFP session.
Its `<pageArea>` holds only `<contentArea>`/`<medium>`, nothing else.
Its real content sits in a separate subform, a *sibling* of `<pageSet>`,
sized to the full page, with no explicit `layout` (defaults to
`"position"`). The `"tb"` root flows that one subform to the top of the
page; its own children then place by explicit x/y because ITS layout is
`"position"`.

Reverted the pageArea-nesting: `<pageArea>` back to geometry-only; all 9
content subforms moved into one new `page_body` subform (matching Hello
World's pattern exactly), sitting after `</pageSet>` as body content.
Kept v3.0's other two fixes (root named `data`, `match="dataRef"`),
which remain correct and are orthogonal to this question. Logged as F15
in `docs/BUILD_ISSUES_LOG.md` - including the general lesson: when two
real references disagree, only trust the one actually confirmed working
in the user's own environment.

## v3.0 — fix F11: full XDP structural rebuild, root name / bind syntax / pageArea nesting

Design View was still completely blank after v2.8/v2.9's Context-tab
fixes - "not a single pixel changed." User provided a third real
reference, `ZSD_SODETAILS_FORMS` (a Sales Order Details form), small
enough to read start to finish for the first time rather than in
size-limited fragments like the two earlier references. Full visibility
exposed three structural defects fragment-reading had missed:

1. The root template `<subform>` must be named `"data"` - matching
   Hello World too - not the form's own object name. Ours was
   `"Z_MM_PR_FORM_ADT"`.
2. Every `<bind>` needs `match="dataRef"` alongside `ref="$.FIELDNAME"`.
   v2.7 had dropped the original `"$."` prefix in favor of `$record.`,
   reasoning from a single data point (a graphic-specific binding in the
   Z_ADT reference) - the actually-missing piece was the `match`
   attribute, present on every bind in this new reference and absent
   from every one of ours the whole time.
3. Absolutely-positioned content subforms belong nested **directly
   inside `<pageArea>`**, not as top-level siblings of `<pageSet>` under
   a `layout="position"` root. The real reference's root is
   `layout="tb"`, and every one of its x/y-positioned subforms sits
   inside `<pageArea>`, which supplies the coordinate space they're
   measured against.

Rewrote `z_mm_pr_form_adt.sfpf.xdp` end to end: root renamed to `data`
(`layout="tb"`, `restoreState="auto"`); every content subform relocated
inside `<pageArea>`; every bind corrected to
`match="dataRef" ref="$.FIELDNAME"` (table row bindings included -
previously bare, unqualified, no match attribute at all); explicit
`<bind match="none"/>` added to every non-data-bound layout subform;
`xfa:datasets` simplified from a populated sample-data block to the
proven-minimal `<xfa:data xfa:dataNode="dataGroup"/>` pattern, matching
both known-good references exactly. Logged as F11 in
`docs/BUILD_ISSUES_LOG.md`.

## v2.9 — fix F10: reference-field UNIT needs a real declared field, not a bare table-column name

Applying v2.8's `MEINS`/`WAERS` values as the Reference Field for the 10
`T_FINAL-*` entries produced 20 new errors: *"Field MEINS does not
exist"* / *"Field WAERS does not exist"*. Root cause: a reference
field's UNIT must resolve to an actually-declared field in the
interface's own data model — not automatically to a same-named column
inside the bound table. Confirmed by re-reading the reference file's raw
`GLOBAL_DATA` (not previously extracted in full): it declares `MEINS
TYPE EBAN-MEINS`, `LABST TYPE MARA-MEINS`, `NETPR TYPE EKKO-WAERS` as
dedicated standalone global variables built specifically to be
reference-field targets. `V_EXTTOTAL`'s reference to `V_WAERS` (a real
import parameter) didn't error, confirming the pattern.

Fixed: added the same two standalone globals to
`z_mm_pr_form_adt.sfpi.xml`'s `GLOBAL_DATA` (`MEINS TYPE EBAN-MEINS`,
`WAERS TYPE EKKO-WAERS`). Left `REFERENCE_FIELDS`' `T_FINAL-<field>`
VALUE qualifiers unchanged — SAP's own error text already addressed
fields that way, confirming it was correct.

**Known, flagged follow-on gap**: nothing populates these two globals
with a real per-row value yet (`CL_FP_CODING`/`INITIALIZATION` is still
empty) — same true of the reference file's own equivalents, which also
have no visible population logic. They satisfy static validation now;
wiring a real value into them is separate work, not yet done. Logged as
F10 in `docs/BUILD_ISSUES_LOG.md`.

## v2.8 — fix F9: populate CL_FP_REFERENCE_FIELDS, confirms live that T_FINAL really is the full ZTABLE_PR_PRINT

User manually dragged `T_FINAL` into SFP's Context tree (working around
F8's empty-Context problem via drag from the Interface's Tables folder),
which also confirmed live — not just from the colleague's reference file
— that `T_FINAL` really does carry the full `ZTABLE_PR_PRINT` structure
(the dragged Context tree showed `MATNR`/`SRVPOS`/`WERKS`/`TXZ01`/`MEINS`/
`MENGE`, matching that structure exactly). This produced 11 activation
errors, all the same shape: *"Reference field EBAN-MEINS of field
T_FINAL-MENGE cannot be used here"* — standard ABAP Dictionary behavior:
QUAN/CURR fields need a resolvable unit/currency reference field, and
these fields' inherited references point at their original source
tables (`EBAN`, `MARA`, `EKKO`), which aren't part of this Context.

Fixed by pointing each at a field that actually exists in `T_FINAL`
instead: `MENGE`/`MENGE1`/`BSMNG`/`MENGE2`/`LABST`/`LABST1` → `MEINS`;
`NETPR`/`PREIS`/`EXCHANGE`/`SUPPLY_RATE` → `WAERS`; `V_EXTTOTAL`
(top-level) → `V_WAERS`. Deliberately did NOT copy the colleague's
reference file's own `CL_FP_REFERENCE_FIELDS` values verbatim here —
they're internally inconsistent (e.g. `LABST` self-referencing itself as
its own unit, `SUPPLY_RATE` typed CURR but pointing at a unit-of-measure
field instead of a currency one), reads as an unresolved artifact of
that wizard-generated form rather than something worth propagating.
Added the corrected 11 entries to `z_mm_pr_form_adt.sfpi.xml`'s
`CL_FP_REFERENCE_FIELDS` so this survives the next re-import. Logged as
F9 in `docs/BUILD_ISSUES_LOG.md`.

## v2.7 — fix F8: invalid bind syntax, two broken initialize scripts, empty Context tab identified

After v2.6's layout fix, Design View was still blank. Found three more
real bugs in `z_mm_pr_form_adt.sfpf.xdp`, all confirmed against the real
`Z_ADT_MM_PR_FORM.XDP` reference and general XFA semantics, not guessed:

1. Every top-level `<bind ref="$.FIELDNAME"/>` used an invalid SOM prefix
   (`$.` is not real XFA bind syntax — the confirmed reference only ever
   uses `$record.`). Fixed: all 9 occurrences (`PLANT_NAME`, `BANFN`,
   `BADAT`, `EKNAM`, `BEDNR`, `IV_REQ_EMAIL`, `V_EXTTOTAL`, `V_WAERS`,
   `T_FINAL[*]`) changed to `$record.`.
2. The watermark's `initialize` script read `IV_FRGKZ.rawValue`, but no
   field named `IV_FRGKZ` exists anywhere (only as a data node) —
   "undefined object" at layout time. Fixed: added a hidden
   `fld_frgkz` field bound to `$record.IV_FRGKZ`, script now reads that.
3. The date-line's `initialize` script called `Date2Num`/`Mod`/`Num2Date`
   — FormCalc built-ins that don't exist in JavaScript at all — and read
   a bare `BADAT` instead of the real field name `fld_badat`. Fixed:
   rewritten in plain JS using the native `Date` object and the real
   field name.

Also removed `restrict="open"` from the root subform — not a real XFA
attribute (doesn't appear in either confirmed reference), a stray
leftover from the original hand-authored draft.

**Separately, and likely the bigger factor**: the user's screenshot of
SFP's own **Context tab** (Form Builder > Context) showed the Interface's
Import/Tables parameters correctly populated on the left, but a
completely **empty** tree under the form name on the right. This is a
different thing from the SFPF file's `CL_FP_CONTEXT` heap node — it's
SFP's own internal mapping of interface parameters into the form's data
model, normally built via SFP's own Context-tab sync/generate tooling
after the interface is defined — not something an abapGit-imported XML
file populates by itself. Logged as F8 in `docs/BUILD_ISSUES_LOG.md`.
Next step for the user: use that sync control before re-checking Design
View, now that the file-level bugs are also fixed.

## v2.6 — fix F7: root subform layout="tb" was silently discarding every child's absolute position

User imported successfully (Hierarchy tree showed every subform correctly
named) but Design View rendered completely blank — at any zoom, with any
node selected. Root cause: `Z_MM_PR_FORM_ADT`'s root subform was
`layout="tb"`, which makes the layout engine auto-stack children by
height and **ignore their explicit `x`/`y`** entirely. The 9 body
sections' heights (logo/header/type_of_request/pr_header/value_line/
watermark/date_line/page_footer/main) sum to ~33cm; the single
`pageArea` was a fixed one-page area only 21cm tall with no room to flow
onto a second page — so there was nothing valid to paint.

Fixed in `z_mm_pr_form_adt.sfpf.xdp`: root subform changed to
`layout="position"` (confirmed against how `zhello_world_form_adt.sfpf.xdp`'s
own body wrapper does it — no `layout` attribute, i.e. XFA's implicit
default of `position`), so every child's absolute cm coordinate is
honored as originally designed. Also added `<occur min="0" max="-1"/>`
to `pageArea` as a defensive multi-page allowance, matching the real
`Z_ADT_MM_PR_FORM.XDP` reference. Logged as F7 in
`docs/BUILD_ISSUES_LOG.md`.

## v2.5 — naming confirmed: _ADT only, form and interface share one name

User confirmed the naming question v2.4 flagged: *"Use _ADT only .. This
uniqueness I wanted to distinguish between other processes."* Standing
rule for all 500+ forms going forward: `<name>_ADT`, identical for both
the SFPF (form) and SFPI (interface) object — no `_INT_` infix, no
distinct interface base name (the object type itself distinguishes them
in TADIR). Renamed `z_mm_pr_form_int_adt.sfpi.xml` → `z_mm_pr_form_adt.sfpi.xml`,
updated `z_mm_pr_form_adt.sfpf.xml`'s `<INTERFACE>` reference from
`Z_MM_PR_FORM_INT_ADT` to `Z_MM_PR_FORM_ADT` to match, and updated every
doc reference (`05_individual_form_conversion_framework.md`'s naming
table, `reference_examples/README.md`,
`reference_examples_z_adt_mm_pr_form/README.md`'s naming section, now
marked confirmed rather than open).

## v2.4 — fix F6: real abapGit-native SFPF/SFPI format, adopt confirmed interface types, switch naming to _ADT

User reported abapGit still couldn't clone after F5's folder fix — "still
not able to clone through ABAPGit bcz of the format concerns" — and staged
a real abapGit-serialized Hello World object into the repo as ground truth
(`src/zhello_world_form_adt.sfpf.xdp`/`.sfpf.xml`/`zhello_world_adt.sfpi.xml`).
Pulling and reading those revealed the actual format: an `<abapGit
serializer="LCL_OBJECT_SFPF">`/`LCL_OBJECT_SFPI` root wrapper, the SFPF
layout shipped as a **separate** `.sfpf.xdp` companion file (not
base64-embedded), and **no standalone `.xsd`** object at all. See
`docs/BUILD_ISSUES_LOG.md` F6.

Rebuilt all three deliverable files against this exact confirmed shape:
- `src/z_mm_pr_form_adt.sfpf.xdp` (was `Z_MM_PR_FORM_ADF.XDP`) — same
  layout content, logo now bound via a live SAP graphics-repository URL
  (`/sap/bc/fp/graphics/public/graphics/bmap/bcol/dangote logo.bmp`)
  instead of an empty embed placeholder, matching a genuinely-migrated
  sibling form (see below).
- `src/z_mm_pr_form_adt.sfpf.xml` (was `SFPF_Z_MM_PR_FORM_ADF.XML`) —
  `<abapGit>`-wrapped, `LAYOUT` left as a `CL_FP_LAYOUT` stub pointing at
  the companion `.sfpf.xdp`.
- `src/z_mm_pr_form_adt.sfpi.xml` (was `SFPI_Z_MM_PR_FORM_ADF.XML`) —
  `<abapGit>`-wrapped; `CL_FP_PARAMETERS/IMPORT_PARAMETERS` now populated
  with the real, confirmed ABAP types for all 16 original interface
  parameters plus the 2 Bolt-proposed extensions, and
  `TABLE_PARAMETERS` populated (`T_FINAL TYPE ZTABLE_PR_PRINT`,
  `T_TEXT TYPE FMLINES`) — previously left empty pending exactly this
  evidence.
- `Z_MM_PR_FORM_ADF.XSD` moved to `docs/legacy_grab/` as a design
  reference only — not a real abapGit-tracked object type.

**Source of the confirmed types**: the user also provided 4 files from a
colleague's already-completed migration of what independent evidence
(identical 16-parameter interface, captured separately by our own
legacy-grab) confirms is the same form —
`docs/reference_examples_z_adt_mm_pr_form/` documents in full what was
adopted (interface parameter types, table types, MIME-based logo
pattern), what was deliberately NOT adopted this round (the real
31-field/dual-table `ZTABLE_PR_PRINT` row structure, a populated
`CL_FP_CONTEXT` node tree, `CL_FP_REFERENCE_FIELDS`), and why (scope and
risk reasons, spelled out per item — not silently skipped).

**Naming convention changed from `_ADF` to `_ADT`**, based on evidence
from both the user's own newly-created Hello World object and the
colleague's reference (see the reference README's naming section) — a
judgment call flagged for explicit confirmation, not assumed silently.

## v2.3 — fix F5: object files were outside /src/, invisible to abapGit

User reported "unable to view any of the files from the repo, abapGit is
not able to read." Root cause confirmed against this repo's own
`.abapgit.xml`: `STARTING_FOLDER=/src/` and `<IGNORE><item>/docs/*</item></IGNORE>`
— all four `Z_MM_PR_FORM_ADF` deliverables had been placed in
`docs/legacy_grab/`, which abapGit is explicitly configured to never scan.
Correct XML content was irrelevant; the files were never being looked at.
Self-inflicted — authored that `.abapgit.xml` in v1.0, didn't check it
before placing a new object type there in v2.0-2.2.

Moved all four (`Z_MM_PR_FORM_ADF.XDP/.XSD`,
`SFPF_/SFPI_Z_MM_PR_FORM_ADF.XML`) to `/src/`. Verified BOM convention
against the real Hello World reference files before moving (none of the
four carry a UTF-8 BOM — confirmed by inspection, not assumed by analogy
to `.prog.xml`/`.clas.xml`).

**Landing zone, confirmed pilot-only**: user directed "use the same repo
for this sample form, will make a plan for this later" — package
`ZABAP_UTIL` (this repo's only package) for now, explicitly **not** a
settled architecture decision; `docs/05_individual_form_conversion_framework.md`
updated to record this as deferred, not resolved (mixing client deliverable
forms into Vernasoft's shared utility package long-term is a real
mismatch worth revisiting once there's more than one form to plan
around).

Logged as F5 in `docs/BUILD_ISSUES_LOG.md` and G14 in the shared Bolt
Playbook Appendix A — general lesson beyond this file type: check a
repo's own `.abapgit.xml` `STARTING_FOLDER`/`IGNORE` before placing any
new object type, every time, not just once per repo.

Still unresolved and separate from this fix: whether abapGit itself has
serializer support for `SFPF`/`SFPI` object types at all — proposed
testing with the (now correctly-placed) Hello World reference files
first to isolate that question from content correctness.

## v2.2 — naming convention: `_ADF` suffix, applied and documented

User asked for uniform naming across all object files. **Confirmed
standing convention**: the Adobe Form object/interface take the original
Smart Form's exact name with `_ADF` appended — `Z_MM_PR_FORM` →
`Z_MM_PR_FORM_ADF` — applied to all four file types
(`docs/05_individual_form_conversion_framework.md` now documents this as
the rule for every future form, not just this one).

Renamed and rebuilt all four `Z_MM_PR_FORM` deliverables to
`*_ADF`: `Z_MM_PR_FORM_ADF.XSD`, `Z_MM_PR_FORM_ADF.XDP` (internal
`subform name` and `xsdConnection name` updated to match, not just the
filename), `SFPF_Z_MM_PR_FORM_ADF.XML` (base64 payload rebuilt from the
renamed XDP, `<INTERFACE>` reference updated to
`Z_MM_PR_FORM_ADF`), `SFPI_Z_MM_PR_FORM_ADF.XML` (filename only — no
internal object-name references exist in that file, confirmed by
inspection). Re-validated all four as well-formed XML and re-confirmed the
base64 round-trip after rebuilding.

## v2.1 — the real abapGit-importable format (SFPF/SFPI/XDP/XSD)

User confirmed v2.0's plain `.xdp` "can't be addressed by abapGit" and
supplied a real reference: `ZHELLO_WORLD_FORM.XDP/.XSD` +
`SFPF_ZHELLO_WORLD_FORM.XML` + `SFPI_ZHELLO_WORLD.XML` — an actual Adobe
Form exported from their own system. This is the authoritative abapGit
serialization format for SAP Adobe/Interactive Forms (object types `SFPF`
form, `SFPI` interface) — confirms every Smart-Form-to-Adobe-Form migration
needs these 4 file types, not a bare XDP.

Produced all four for `Z_MM_PR_FORM`:
- **`Z_MM_PR_FORM.XSD`** — the data schema for the full interface (24
  existing + 2 new optional params + `T_FINAL`/`T_TEXT` row types). Full
  confidence — standard XSD, real field list.
- **`Z_MM_PR_FORM.XDP`** — v2.0's template upgraded to match the reference's
  authentic structure exactly: `connectionSet`/`xsdConnection` linking to
  the XSD, `xfa:datasets`, a full `localeSet` block. Full confidence on
  structure/positions/fields (unchanged from v2.0, verified against real
  export data throughout).
- **`SFPF_Z_MM_PR_FORM.XML`** — the form object, matching the reference
  wrapper exactly (`VERSION`/`INTERFACE`/`CONTEXTT`/`LAYOUTT` with the XDP
  base64-embedded). Verified: parsed as well-formed XML (PowerShell `[xml]`
  cast), and the embedded base64 decodes back byte-for-byte identical to
  the standalone XDP (round-trip checked).
- **`SFPI_Z_MM_PR_FORM.XML`** — the interface object. **Deliberately left
  with empty `PARAMETERS`/`CONTEXT`, matching the only verified pattern
  available** (the Hello World reference's interface is itself empty — no
  bound fields) — rather than guess the internal structure of a *populated*
  parameter list/context node tree, which would repeat the exact mistake
  that produced the unusable v2.0 file. The real field list lives in the
  XSD; adding it to SFP's own Interface tab stays a manual step, same as
  always, until a populated reference example is available to verify
  against.

All four files validated well-formed via PowerShell `[xml]` parsing before
being handed off.

## v2.0 — first hand-authored Adobe Form template (XDP)

User asked Bolt to build the actual importable Adobe Form design, not just
the checklist — "I'll import into SFP." Produced
`docs/legacy_grab/Z_MM_PR_FORM.xdp`: a hand-authored XFA template using
every exact position/size/field/font/script from the build checklist —
all 9 positioned subforms at their real coordinates, the 14-column table
(header row + repeating data row bound to `T_FINAL[*]`, grand-total row
with a FormCalc `Sum()`), the logo image field, native page-numbering
fields, and the two resolved JavaScript `initialize` scripts (watermark
visibility on `IV_FRGKZ`, date spell-out computed from `BADAT`) verbatim
from checklist §6.2/§6.3. Includes sample/preview data matching the
interface plus the two new optional parameters.

**Flagged explicitly as the highest-risk deliverable so far**: unlike
everything else built this session, an XDP's schema correctness can't be
verified without a live SFP/ADS import — no compile/activation feedback
loop available beforehand. Framed to the user as a genuine first test: try
the import, paste back the exact result (success or error text), fix fast
if needed — same discipline as every ABAP fix this session, applied to a
much larger file. Noted two things the XDP doesn't do: it doesn't add the
2 new optional parameters to SFP's own Form Interface tab (a separate GUI
step, prerequisite to the import), and its `bind ref` paths assume a flat
interface Context — SFP's actual Data View may nest fields differently, in
which case only the `ref` attributes need adjusting, not the structure.

## v1.9 — resolve the embedded ABAP: FormCalc/JavaScript decisions, made

User authorized Bolt to decide the interface where needed and use
FormCalc/JavaScript for conditions. Resolved all 4 embedded-ABAP items in
the build checklist §6, governed by one fact: FormCalc/JS can compute from
data already in the interface, but can't call a BAPI/FM or run a database
SELECT — so anything that only *computes* stays client-side script, and
anything that *fetches* new data becomes a new **optional** interface
parameter (safe blank default, unmodified callers unaffected):

- **6.1 Requisitioner e-mail** — `BAPI_USER_GET_DETAIL` can't run in
  FormCalc/JS → new `IV_REQ_EMAIL TYPE STRING OPTIONAL`.
- **6.2 Watermark condition** — `SELECT ... FROM EBAN` can't run in
  FormCalc/JS → new `IV_FRGKZ TYPE EBAN-FRGKZ OPTIONAL`, with a JavaScript
  `initialize` script (given, §6.2) driving the subform's `presence`.
- **6.3 Date spell-out** — no interface change needed at all: `BADAT` is
  already in the interface, weekday/month-name is pure computation,
  replaced the two custom Z-FMs (`ZABF_DATE_TO_DAY`,
  `ZABF_ISP_GET_MONTH_NAME`) with a JavaScript snippet (given, §6.3).
- **6.4 SO10 header note** — likely already covered by the existing
  `TABLES T_TEXT` parameter; flagged to confirm before adding a third new
  parameter, not assumed either way.

Net interface change: 2 new optional parameters (possibly 3, pending 6.4),
0 existing parameters touched. Blueprint updated to match (window notes,
governance panel) and republished.

## v1.8 — build checklist: Bolt-authored design, no SFP wizard

**Confirmed 2026-09-13 — user overrode the SFP-wizard design path.** Bolt
now designs every form from scratch against its real `Utilities → Download`
export; the wizard's ~80-85% auto-migration is not used for this project.
`docs/05_individual_form_conversion_framework.md` Step 2 rewritten to
match.

Extracted the remaining precision data from `z_mm_pr_form.xml` (exact
window positions/sizes in cm via `WLEFT`/`WTOP`/`WWIDTH`/`WHEIGHT`, all 14
line-item table column widths — verified to sum exactly to the table's
declared 29.00cm) and produced
`docs/legacy_grab/Z_MM_PR_FORM_build_checklist.md`: a literal, numbered
build spec — master page, style→font mapping, subform-by-subform exact
coordinates, the 14-column table spec, explicit exclusions (dead code, the
`break abap1` statement), Developer Extension Points, and a validation
checklist. User builds from this in SFP/LiveCycle Designer directly (not
via the migration wizard); Bolt confirms the result against the blueprint
before UT.

Corrected the blueprint: the line-items table is **14** columns, not 13
(undercounted in v1.7 — corrected once the column widths were verified to
sum exactly to the declared table width). Columns 12-14's exact field
bindings are medium-confidence, flagged for confirmation against a real
printout.

## v1.7 — Z_MM_PR_FORM design specification (spec 001 of 500+)

Read the full `Z_MM_PR_FORM` export via byte-offset extraction (the file
is ~363KB as essentially one line; `grep -bo` + `tail -c` in Bash, since
both Read and Grep's line-based tools truncate very long single-line
matches). Produced the first complete design specification:
- All 10 windows with real field bindings (not inferred): HEADER,
  LOGO → `DANGOTE LOGO`, PRHEADER (BANFN/BADAT/EKNAM/BEDNR + an embedded
  `BAPI_USER_GET_DETAIL` call), TYPE, DATE (2 embedded custom Z-FMs), MAIN
  (line-items table), VALUE, PAGE, WATER_MARK (conditional on
  `EBAN-FRGKZ`), unused `%WINDOW1`.
- MAIN window's line-items table: all 13 columns mapped to their
  `W_FINAL-*` field bindings.
- 4 real findings: a live `break abap1` debugger statement, dead code in 3
  nodes, an SO10 header-text read (`object=EBANH`, `id=B01`) not
  previously in the checklist, and 2 form-owned custom Z-FM dependencies
  invisible to the driver-only source scan.
- Risk re-scored against the framework using real data (composite: Medium).

Published as `docs/legacy_grab/Z_MM_PR_FORM_blueprint.html` — a designed
specification page (not raw markdown), meant to read cleanly for both a
technical and an executive audience, and to serve as the visual/structural
template for the remaining 500+ forms' spec sheets.

## v1.6 — confirmed: SE71/SMARTSTYLES "Utilities → Download" is the real design source

User provided real exports for `Z_MM_PR_FORM`: the form's own
`Utilities → Download` XML (`<sf:SMARTFORM>`, 363KB, one `<sf:WINDOW>` per
window with text/graphic/code/condition `<sf:NODE>` children) and
`ZSTYLE_PR_FORM`'s SmartStyle XML export. Both verified real and directly
cross-consistent: the form's `LOGO` window's graphic node resolves to
`GKEYBDS/NAME=DANGOTE LOGO`, which matches an actual row the `P_GLOB` sweep
already found in `STXBITMAPS`; every text node's `STYLE_NAME` is
`ZSTYLE_PR_FORM`, matching both the style XML and the `global_smartstyles.txt`
inventory. `docs/02_legacy_grab_spec.md` updated: this GUI export is now the
confirmed way to get a form's real design into Bolt's hands — not a
background-report capability, but real, complete, parseable data once
exported. Investigating whether the underlying FM can be called directly to
automate this for all 500+ forms.

Read the real XML directly (byte-offset extraction via `grep -bo` + `tail -c`,
since the export is essentially one enormous line and both the Read and Grep
tools truncate very long single-line matches) and produced a first accurate
design read of `Z_MM_PR_FORM`: 10 windows (title/company header, PR
header fields via embedded ABAP CODE nodes, type-of-request block, date
block with 2 custom Z-FM calls, page-number footer, value/total block, a
conditional watermark, the DANGOTE LOGO graphic, and the MAIN line-items
window). Found real cleanup items: a live `break abap1` debugger statement,
dead/commented code in 3 places, and an SO10 header-text read
(`object=EBANH`, `id=B01`) not previously captured by the legacy-grab tool
— logged as a design finding, not yet built into the tool itself.

## v1.5 — fix PROBE_FORM_STORAGE activation errors (F3, F4)

- F3: `SELECT * FROM (lv_tab) INTO TABLE <tab> ...` failed activation —
  *"The variable `<TAB>` must be escaped using `@`"*. Modern strict Open SQL
  requires every host variable, including an existing field symbol (not
  just an inline `DATA()`), to be `@`-prefixed as a SELECT target. Fixed:
  `INTO TABLE @<tab>`.
- F4: ATC warning *"ABAP Doc comment is in the wrong position"* on the `"!`
  block preceding `TYPES: BEGIN OF ty_prog_info, ...` — a blank line alone
  (which fixed the same warning on `PROBE_FM` earlier) wasn't enough here;
  ABAP Doc doesn't support commenting a compound `TYPES:` chain that
  declares two types at once. Downgraded to a plain `"` comment.
- Both logged in `docs/BUILD_ISSUES_LOG.md` and the shared Bolt Playbook
  Appendix A (D8, D9).

## v1.4 — attempt an automatic per-form style/logo match, safely

User pushed back on the manual-per-form fallback at real scale (500+
forms) — a per-form SE71 lookup 500 times isn't viable. Added
`probe_form_storage`: safely tries four unverified candidate tables
(`STXFOBJECT`, `STXFATTR`, `STXFHEADER`, `SSFOBJ`) via
`cl_abap_typedescr=>describe_by_name` inside `TRY...CATCH cx_root` — a
wrong guess is a caught runtime exception, not an activation risk (unlike a
static `SELECT` against a guessed table, e.g. v1.2's `STXBITMAPS`). Any
table that resolves is read generically (dynamic `SELECT *` + `dump_any`,
no column names guessed) and scanned for the current form's name. Wired
into sections 6-7 of every snapshot, ahead of the existing manual fallback.

If none of the four land, the snapshot now states the one action that
closes this for *every remaining form at once*: an ABAP debugger
breakpoint in SE71 at the point the SmartStyle name loads reveals the real
table/field definitively — a single session, not 500 manual lookups.

## v1.3 — correction: SSF_READ_FORM is not the layout read API

First real snapshot back (`Z_MM_PR_FORM`, a Purchase Requisition print form)
showed `SSF_READ_FORM`'s actual interface: `O_CAPTION`/`O_VARTEXT`/
`O_FMNUMB`/`O_FMNUMB_TEST`/`O_ACTIVE`/`O_ADMDATA` out, **no `TABLES`
parameter**. Every field name reads as form header/admin metadata (roughly
SE71's Form Attributes → General tab), not a page/window/node/style/graphic
layout tree. **Corrects earlier notes here and in the report that assumed
this FM was the pending unlock for sections 6-8** — it wasn't; kept as
informational-only in section 5 (occasionally useful for description/
version), reworded honestly.

Smart Form layout appears to have no confirmed safe read API at all — unlike
`TNAPR`/`FUPARAREF` (flat config tables), a form's compiled layout isn't a
simple table. `docs/05_individual_form_conversion_framework.md` Step 2
rewritten to make explicit that the design comes from **SFP's "Create Adobe
Form by Migration" wizard** — SAP's own sanctioned tool for this, not a
workaround — with a concrete next step to check whether abapGit can
serialize the resulting Adobe Form object (would become the review channel,
same as everything else in this project, if it can).

## v1.2 — global sweep: grab all SmartStyles + logos once, not per form

- New `P_GLOB` mode: ticking it (instead of filling per-form fields) runs a
  system-wide sweep instead of the legacy grab — every SmartStyle name
  (`TADIR` object type `SSST`) and every SE78-registered graphic
  (`SELECT * FROM stxbitmaps`, same safe pattern as `TNAPR`) in one pass,
  written to `global_smartstyles.txt` / `global_logos.txt`.
- Per-form sections 6/7 (SmartStyle, Graphics/logos) reworded: now a lookup
  against the sweep output ("which one does this form use"), not fresh
  research each time.
- `docs/06_global_findings.md` restructured: §0 holds the system-wide
  inventory (paste the sweep's output there once), §1 holds per-form matches
  against it.
- `docs/04_global_style_catalogue.md` process updated: sweep first,
  system-wide, once (step 0), *then* match per form.
- `STXBITMAPS` is a best-effort table-name guess (unlike `TNAPR`, not
  previously used here) — flagged in `docs/BUILD_ISSUES_LOG.md` as an
  activation-time risk to watch, not yet a confirmed trap.

## v1.1 — fold SSF_READ_FORM's interface probe into the main process

- `SSF_READ_FORM`'s interface is now probed **automatically as part of every
  normal run** — no separate `P_PROBE` step needed for it specifically.
  `capture_interface( 'SSF_READ_FORM' )` runs once per run (not once per
  form) and the result becomes **section 5** of every snapshot.
- Sections renumbered to make room: SmartStyle (6), Graphics/logos (7), Form
  outline (8), Risk score (9), Output comparison/OTF (10), Full prerequisite
  checklist (11).
- **Honest limit, spelled out in section 5 itself**: `FUPARAREF` gives
  parameter *names* and *kind* (I/E/T/C/X), not each parameter's exact ABAP
  *type* — not enough to safely call `SSF_READ_FORM` for real data yet
  (a wrong type guess on a deep EXPORTING/TABLES parameter risks the same
  class of dump as F1). Section 5 states exactly what's still needed: the
  **Reference Type** shown in SE37 next to the EXPORTING/TABLES parameter(s)
  it already names — a targeted look, not blind exploration.
- `P_PROBE` kept as a general-purpose version of the same tool, for any
  *other* unfamiliar FM this project needs later.
- `docs/02_legacy_grab_spec.md` updated to match; also fixed stale
  "driver-program rewrite" language left over from before the v1.0 scope
  pivot.

## v1.0 — scope pivot: design + interface only, driver programs read-only

**Architecture decision, confirmed 2026-09-12** — supersedes the driver
rewrite described in earlier versions of `docs/01_scope.md`:
- Driver programs are **read-only inputs forever** — understood, never
  modified. Multiple drivers can call the same Smart Form for different
  purposes; rewriting one for one purpose risks silently breaking another.
- This project's deliverable is the **Adobe Form design + interface only**.
  The interface is preserved exactly from each snapshot's §2. How an
  existing driver eventually reaches the new Adobe Form (NACE config
  repoint, new parallel entry point, or an administrative decision) is a
  **separate, later, per-driver decision** — not proposed or built here.
- `docs/01_scope.md` updated throughout: business outcome, §4, §8 (out of
  scope), §9 (phase plan — added 1c, redefined 2/3/4/5 as design-only, 6
  reframed as a separate wiring track), risk framework's driver-complexity
  dimension, definition of done.
- **New: Global Style & Asset Catalogue** (`docs/04_global_style_catalogue.md`)
  — instead of a bespoke Adobe style per form, consolidate every logo/style
  found across all forms into a small reusable set, matched per form rather
  than designed fresh each time. `docs/06_global_findings.md` is the raw log
  feeding it.
- **New: Individual Form Conversion Framework**
  (`docs/05_individual_form_conversion_framework.md`) — the repeatable
  per-form design procedure (read → design → match catalogue → validate via
  OTF/PDF diff → sign-off), with unresolved items becoming a named
  **Developer Extension Point** + a post-implementation checklist entry,
  never a silent gap. Special Adobe-specific features may be used at Bolt's
  judgment, always called out explicitly.
- `ZSF2AF_R_LEGACY_GRAB` section 3 wording clarified: driver candidates are
  explicitly labelled READ-ONLY, pointing at `01_scope.md` §8.

## v0.9 — fix EXTRACT_INCLUDES activation errors (F2)

- `LV_INCLNAME` was inferred `TYPE string` by `DATA(lv_inclname) = to_upper(
  ... )`, which broke two things: the classic offset/length trim
  (`field+off(len)`, valid only on fixed `C/N/D/T` types) and the
  by-reference `IMPORTING` binding to `write_driver_source`'s
  `IV_PROGNAME TYPE tadir-obj_name` formal (needs an exact type match, not
  just a convertible one). Fixed by declaring `lv_inclname` explicitly as
  `TYPE tadir-obj_name` and assigning via `=`. See `docs/BUILD_ISSUES_LOG.md`
  F2; also logged as D7 in the shared Bolt Playbook Appendix A.
- Also fixed an ABAP Doc "wrong position" warning on `PROBE_FM`'s doc
  comment (added the blank line before it that every other doc-commented
  method in this file already has).

## v0.8 — P_PROBE: safely confirm SSF_READ_FORM's interface before calling it

- New optional selection field `P_PROBE`: fill it with a function module name
  (e.g. `SSF_READ_FORM`, confirmed as the likely form-read API this round)
  and the report introspects its interface via the same `FUPARAREF` technique
  already proven for section 2, writes the parameter list to the list and to
  `probe_<fmname>.txt`, then stops without running the legacy grab.
- This is the safe way to learn an unfamiliar FM's real parameter list before
  any code calls it — no more guessing a signature and risking a repeat of
  F1. Next round, once `SSF_READ_FORM`'s parameters are confirmed this way,
  real automation for sections 5-7 (SmartStyle/logo/outline) can be built.

## v0.7 — deep mining: follow driver includes; full prerequisite checklist

- **`extract_includes`**: driver programs' own `INCLUDE Z.../Y...` statements
  are now followed one level deep — each included program's full source is
  extracted to its own file too, and its dependency scan is folded into the
  same driver's dependency list. Bounded to one level so an include chain
  can't run away.
- **New section 10 — full prerequisite checklist**: every Smart Form snapshot
  now ends with a static, always-emitted checklist covering everything a
  Smart Form can depend on (SmartStyle, formats, graphics, SO10 standard
  texts, barcodes/fonts, languages, digital signature/XFA scripting,
  authorization checks and number-range/posting side effects inside the
  driver) — a completeness net for what still can't be safely automated
  (the form's own internal definition), so nothing gets missed in the manual
  pass.
- Section 3's driver breakdown now lists extracted include files alongside
  the driver's own source file and dependency evidence.

## v0.6 — extract driver source + dependencies; clarify OTF's role

- **Driver-program candidates now have their full source extracted** to its
  own file (`driver_<progname>.txt`) in the output folder, not just their
  name — addresses "the program has to extract the form and respective
  objects into that folder."
- **New dependency scan** (`scan_dependencies`, plain substring matching, no
  regex): for each extracted driver, flags lines referencing other custom
  objects (`CALL FUNCTION 'Z.../Y...'`, `CALL METHOD ZCL_.../YCL_...`,
  `NEW`/`TYPE ZCL_.../YCL_...`, `INCLUDE Z.../Y...`, external
  `PERFORM (Z.../Y...)`) and lists the raw matching source lines (not a
  parsed object name, deliberately, to avoid mis-extracting one) in a new
  per-driver breakdown under section 3.
- **New section 9 (Output comparison / OTF)**: clarifies that OTF is a
  rendered print stream, not a design source, and documents its correct
  role — visual validation of the pilot Adobe Form's PDF against the old
  Smart Form's OTF for the same real document (`GETOTF = 'X'` +
  `CONVERT_OTF`) — as a Phase 2 activity, not something Phase 1a auto-runs
  (it needs a real document key per form). See
  `docs/02_legacy_grab_spec.md` "OTF is not a design source."

## v0.5 — automate interface + output-determination capture; fix the real perf bug

- **Fixed the actual bottleneck**: driver-program candidates were being found
  by rescanning every Z*/Y* program's source **once per form**
  (O(forms × programs) in redundant `TADIR`/`READ REPORT` calls).
  `build_driver_index` now does one pass over every program, checked against
  every form name in memory. This was the real slowdown, not a lack of
  parallel work processes.
- **Form interface (section 2) is now automated**, via
  `SELECT parameter, paramtype FROM fupararef WHERE funcname = @fm AND
  r3state = 'A'` — a pattern already verified in the `ZAB_V1_UT` engineering
  log (A18), specifically built to avoid guessing an FM signature like
  `FUNCTION_IMPORT_INTERFACE`'s.
- **Output determination / NACE (section 4) is now automated**, via
  `SELECT * FROM tnapr` (no field-name guess needed — there's no `WHERE`)
  plus a new generic reflection-based dump helper (`dump_any`, built on
  `cl_abap_typedescr`) that scans every column of every row for the form
  name, so no `TNAPR` column name has to be assumed either.
- SmartStyle / logo / form-outline (sections 5-7) stay manual — the likely
  API (`SSF_READ_FORM`) isn't confirmed on this system yet; see
  `docs/02_legacy_grab_spec.md` for the 2-minute SE37 lookup that unlocks it.
- **True multi-work-process parallel dispatch investigated, deliberately
  deferred to its own increment** — `GUI_DOWNLOAD` can't run in a parallel
  work process (no GUI), and inspecting `ZCL_AB_V1_UT_BULK`'s real
  implementation found its `iv_context` parameter is never actually delivered
  to handler instances (logged in `Utility-Class-and-Method/docs/00_engineering_log.md`
  A25). See `docs/02_legacy_grab_spec.md` "Performance" section for the full
  reasoning.

## v0.4 — fix CALL_FUNCTION_CONFLICT_TYPE dump in RESOLVE_FM_NAME

- `SSF_FUNCTION_MODULE_NAME`'s `FORMNAME` parameter is a fixed-length classic
  type, not `STRING` — passing `IV_FORMNAME TYPE string` directly dumped
  `CALL_FUNCTION_CONFLICT_TYPE`. Fixed by converting to a `CHAR30` local
  before the call. See `docs/BUILD_ISSUES_LOG.md` F1.

## v0.3 — F4 folder picker for the output path

- `ZSF2AF_R_LEGACY_GRAB`: `AT SELECTION-SCREEN ON VALUE-REQUEST FOR p_path` now
  opens a folder-browse dialog (`CL_GUI_FRONTEND_SERVICES=>DIRECTORY_BROWSE`)
  instead of requiring the path to be typed by hand. Auto-appends a trailing
  `\` to whatever folder is picked.

## v0.2 — use existing ZABAP_UTIL package

- Reused the existing shared `ZABAP_UTIL` package (already used by VS-Tower,
  Dangote_Requirements, ZAB_V1_UT) instead of creating a dedicated
  `ZFORM_UTIL`. `src/package.devc.xml` carries its own `CTEXT`, matching the
  Dangote precedent for a package shared across repos.

## v0.1 — Phase 1a: repo scaffold + legacy-grab tooling

- Repo created, registered in the Bolt Playbook Project Register
  (`VernasoftTechie/Smartform-Adobe-Migration`, package `ZABAP_UTIL`, stem `SF2AF`).
- `docs/01_scope.md` — finalized scoping document + risk framework + phase plan
  (approved).
- `docs/02_legacy_grab_spec.md` — legacy-grab capture spec (what is automated in
  v1 vs. left as a manual, clearly-labelled placeholder, and why).
- `src/zsf2af_r_legacy_grab.prog.abap` — first build: per-form markdown snapshot
  generator. Automates: form-name resolution to its generated function module
  (`SSF_FUNCTION_MODULE_NAME`), driver-program candidate discovery (source scan
  of Z*/Y* programs for the form name + `SSF_FUNCTION_MODULE_NAME`), optional
  TADIR-based form auto-discovery (object type `SSFO`, best effort — verify
  count against SE71). Deliberately leaves interface parameter list, output
  determination (NACE), SmartStyle, logo, and form outline as manual sections —
  no confirmed read API for those yet; see `02_legacy_grab_spec.md`.

**Status:** awaiting first run against the target system. Not yet activated /
pulled — `ZABAP_UTIL` already exists (shared with VS-Tower / Dangote /
ZAB_V1_UT), no new package to create.
