# Reference: a colleague's already-completed migration of this same form

Four files the user provided from a separate, already-completed migration of
what is (with very high confidence — see below) **the same Smart Form,
`Z_MM_PR_FORM`**, done by someone else on the client side:

- `Z_ADT_MM_PR_FORM.XDP` / `.XSD` — SAP GUI "Utilities > Download" export
  of the layout + data schema (same export mechanism as the Hello World
  reference, NOT the abapGit-native format — see caveat below).
- `SFPF_Z_ADT_MM_PR_FORM.XML` — form object, same download-export shape.
- `SFPI_Z_INT_MM_PR_FORM.XML` — interface object `Z_INT_MM_PR_FORM`,
  same download-export shape.

**Format caveat**: these are in the SAP-GUI-download shape (base64-embedded
layout, no `<abapGit>` wrapper) — the same shape our first hand-authored
attempt used and that abapGit could not read. Do **not** copy these files'
outer structure into `/src/`. Use them only as a source of *content* facts
(field names, types, node structure) — the wrapper format to actually ship
comes from `src/zhello_world_form_adt.sfpf.xml` /
`.sfpf.xdp` / `zhello_world_adt.sfpi.xml`, which the user pulled directly
from an abapGit-serialized commit in this repo.

## Is this really the same form?

Yes, with high confidence. Our own legacy-grab (`docs/legacy_grab/Z_MM_PR_FORM.md`,
captured live via `SSF_READ_FORM`/FUPARAREF, independently of this reference)
found exactly the same 16 IMPORT parameters + `T_FINAL`/`T_TEXT` TABLES,
name-for-name, as this reference's interface. Two independent captures of
the same parameter list is strong corroboration, not a coincidence.

## Is it SAP-wizard-generated?

Yes. `Z_ADT_MM_PR_FORM.XDP` line 1 carries
`<?xfa generator="SAP_SmartForms" APIVersion="R700.SP0.N0"?>` and its
`$form` ready-event script is ~550 lines of SAP's own standard
Smart-Form-to-XFA migration boilerplate (`FindSubformField`,
`WalkTreeFromHere`, `RemoveSubform`, `HandleFormDOMConditions` —
infrastructure functions the wizard injects into every migrated form, not
business logic). By contrast, `zhello_world_form_adt.sfpf.xdp`'s generator
is `AdobeLiveCycleDesigner_V11.0.9...` — hand-built in the actual design
tool, the way the user asked this project to work. Worth knowing plainly:
whoever built this reference used the SFP "Create by Migration" wizard the
user told us not to use for this project. Not a problem for them, but it
means this reference is not necessarily the quality bar ("pixel-matched
against our blueprint") the user set for us — it's a source of *facts*,
not a template to imitate wholesale.

## What it confirms (adopted into `src/z_mm_pr_form_int_adt.sfpi.xml`)

- The real ABAP types behind all 16 import parameters (e.g.
  `BANFN TYPE EBAN-BANFN`, `EKNAM TYPE T024-EKNAM`,
  `V_EXTTOTAL TYPE WERTV8`) — our own legacy-grab only had the *names*.
- `T_FINAL TYPE ZTABLE_PR_PRINT`, `T_TEXT TYPE FMLINES` — real DDIC type
  names for the two TABLES parameters.
- The interface's own `CL_FP_PARAMETERS` was adopted **verbatim** for the
  16 original parameters (copied from the raw XML, not retyped by hand) —
  the two Bolt-proposed extension parameters (`IV_REQ_EMAIL`, `IV_FRGKZ`)
  are appended after them, clearly additive.

## What it reveals but we have NOT yet adopted (open scope decision)

- **The real `ZTABLE_PR_PRINT` row has 31 fields**, not the 14 our
  pilot's blueprint/checklist/XDP currently bind: in addition to our 14
  (`SLNO MATNR TXZ01 MEINS MENGE LABST MENGE1 NAME1 SUPPLY_RATE EXCHANGE
  GV_VALUE LABST1 TOTAL GV_VALUE1`), the real structure also carries
  `BNFPO SRVPOS WERKS PREIS1 PREIS EBELN LIFNR PEINH KTEXT1 BSMNG MENGE2
  EBELP SUPPLY_RATE1 EXCHANGE1 WAERS WAERS_PO`, plus **three nested
  per-row long-text loops** (`WA_TEXT`, `WA_TEXT1_LINE` ×2, `WA_LINETXT`
  — each `TDFORMAT`/`TDLINE`, i.e. `FMLINES`-shaped). There are also
  **two parallel tables** (`X2500_TABLE1`, `X2500_TABLE2`) with the
  identical row structure under the MAIN window — most likely first-page
  vs. continuation-page item tables (a classic multi-window Smart Form
  pagination pattern), not two different tables. **Not adopted into our
  XDP this round** — widening the pilot to the full 31-field/dual-table
  structure is a scope decision for the user, since some fields
  (`SRVPOS`, service-order quantities) suggest this structure may cover
  both material and service PRs, which may be out of scope for the
  pilot's original intent.
- **`CL_FP_CONTEXT` is fully populated** — a real folder/loop/condition
  node tree mirroring every window and field (`CL_FP_FOLDER`,
  `CL_FP_LOOP`, `CL_FP_ALTERNATIVE`/`CL_FP_CONDITION` for the watermark
  choice, `CL_FP_GRAPHIC`/`CL_FP_GRAPHIC_URL` for the logo). Hand-authoring
  this tree's `ID`/`PARENT`/`SUCCESSOR`/`CHILD` linkage correctly is
  high-risk to get wrong from a text file — our `z_mm_pr_form_adt.sfpf.xml`
  deliberately keeps `CL_FP_CONTEXT` as a single empty root node (the same
  pattern proven to import cleanly in `zhello_world_form_adt.sfpf.xml`),
  and relies on SFP itself to (re)derive the context tree from the XDP's
  data bindings on first open/save — a normal, safe SFP action, not a gap.
- **The logo is referenced via a live MIME-repository URL**, not embedded:
  `<image contentType="image/bmp" href="/sap/bc/fp/graphics/public/graphics/bmap/bcol/dangote logo.bmp"/>`
  (SE78 object `GRAPHICS`, id `BMAP`, type `BCOL`). **Adopted** into
  `z_mm_pr_form_adt.sfpf.xdp` — this is exactly the reusable,
  one-object-many-forms pattern the Global Style/Logo Catalogue was meant
  to use.
- **`CL_FP_REFERENCE_FIELDS`** (QUAN/CURR unit-field mappings, e.g.
  `W_FINAL-MENGE` → unit `MEINS`) is populated with 11 entries, several
  pointing at fields outside our 14-column subset (`NETPR`, `PREIS`,
  `BSMNG`, `MENGE2`). One entry looks like a genuine data-quality quirk in
  the source system worth flagging rather than copying blindly:
  `W_FINAL-SUPPLY_RATE` is typed `CURR` but its `<UNIT>` points to `MEINS`
  (a quantity unit, not a currency) — `EXCHANGE`/`PREIS` correctly point
  to `NETPR`. **Not adopted this round** — left empty, matching Hello
  World's proven-safe pattern, until the table-scope decision above is
  made (populating this only makes sense once we know which fields are
  actually bound).
- **`CL_FP_CODING`/`INITIALIZATION` is genuinely minimal** — just two
  real statements (`V_DATE = SY-DATUM.` and
  `lv_werks = VALUE #( t_final[ 1 ]-werks OPTIONAL ).`), with `FORMS`
  empty. Its `GLOBAL_DEFINITIONS` declares ~50 variables (BAPI email
  lookup, `READ_TEXT`/`STXH` text handling, weekday/month spell-out via
  `T247`/`ZABS_DTRESR`) that are **never used** anywhere in `CODING` —
  almost certainly leftover copy-paste from the driver program's own
  local variable pool, not live logic in the interface. **Practical
  takeaway**: this reference's own interface does not actually resolve
  the watermark flag or email address either — it isn't a working example
  of that piece, just evidence that the driver (permanently out of scope
  for us) is where such derivations really live. Our
  `IV_REQ_EMAIL`/`IV_FRGKZ` extension-parameter approach is still the
  most defensible path forward for this project's driver-untouched
  architecture, not superseded by anything shown here — but it is worth
  the user confirming with the functional owner whether the driver
  already computes an FRGKZ-equivalent value it could pass through.

## Naming convention discrepancy (needs the user's decision)

Three different marker conventions have now shown up for Adobe Form
objects in this system:

1. Bolt's original instruction: `_ADF` suffix (superseded by this
   entry — see below).
2. This reference's own objects: `Z_ADT_MM_PR_FORM` (form, **prefix**
   `Z_ADT_`) / `Z_INT_MM_PR_FORM` (interface, **prefix** `Z_INT_`).
3. The user's own just-created Hello World objects, staged the same day:
   `ZHELLO_WORLD_FORM_ADT` (form, **suffix** `_ADT`) /
   `ZHELLO_WORLD_ADT` (interface, also suffix `_ADT`, but note it drops
   `_FORM` relative to the form name — and the form's own `<INTERFACE>`
   tag inside `zhello_world_form_adt.sfpf.xml` names the interface
   `ZHELLO_WORLD` with **no** `_ADT` suffix at all, which doesn't match
   the interface object's own file name `zhello_world_adt.sfpi.xml` —
   likely a typo made while linking the two objects in SFP, flagged here
   rather than silently resolved).

Given (3) is the user's own freshly-created, confirmed-importable object
and shares its marker letters ("ADT") with (2)'s prefix, this project has
switched from `_ADF` to **`_ADT`** as of this round:
`Z_MM_PR_FORM_ADT` (form) / `Z_MM_PR_FORM_INT_ADT` (interface) — a
judgment call, not a silent guess. **Please confirm** whether `_ADT`
should be the standing convention for all 500+ forms, and whether the
interface should share the form's base name (as done here) or use a
distinct name (as the `Z_INT_` reference does) — and separately, whether
`ZHELLO_WORLD_FORM_ADT`'s interface link (`ZHELLO_WORLD`, no suffix) was
intentional or a typo to fix.
