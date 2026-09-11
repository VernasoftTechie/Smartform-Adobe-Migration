# Reference examples

Real exports/serializations from the target system, kept here as
authoritative format references — not guessed, not reconstructed from
documentation.

## Two different Hello World references — do not confuse them

### 1. SAP GUI "Utilities > Download" export (this folder)

`ZHELLO_WORLD_FORM.XDP` / `.XSD` / `SFPF_ZHELLO_WORLD_FORM.XML` /
`SFPI_ZHELLO_WORLD.XML` — generator
`AdobeLiveCycleDesigner_V11.0.9.20240701.1.52_SAP`, ADS host
`ikjdcdevcha01.dangote-group.com`. This is a **raw ABAP-side download**,
not an abapGit serialization:

- **`<FORMNAME>.XDP`** — the standalone XFA template.
- **`<FORMNAME>.XSD`** — the data schema the connectionSet references.
- **`SFPF_<FORMNAME>.XML`** — `asx:abap` wrapper directly at the root (no
  `<abapGit>` tag), with the XDP **base64-embedded** inside
  `LAYOUTT/FPLAYOUTT/LAYOUT`.
- **`SFPI_<FORMNAME>.XML`** — same bare-`asx:abap` shape, all
  `CL_FP_INTERFACE_DATA` children empty (Hello World has no parameters).

**Correction (2026-09-12): this is NOT the format abapGit reads.** Files
built to match this shape were rejected by abapGit twice. Keep these files
as content/structure references only (they're genuine, confirmed-authentic
exports) — never copy their outer wrapper into `/src/`.

### 2. abapGit-native serialization (`/src/zhello_world_*`) — the real target format

`src/zhello_world_form_adt.sfpf.xdp`, `src/zhello_world_form_adt.sfpf.xml`,
`src/zhello_world_adt.sfpi.xml` — pulled directly from a commit the user
made by creating this object in SAP and letting **abapGit itself**
serialize it (`LCL_OBJECT_SFPF` / `LCL_OBJECT_SFPI`, per the files'
`serializer` attribute). This is the actual, confirmed-working format:

- **`<name>.sfpf.xdp`** — the layout as a **plain, standalone XDP file**,
  no base64, no wrapper. Same content shape as `.XDP` above.
- **`<name>.sfpf.xml`** — root is `<abapGit version="v1.0.0"
  serializer="LCL_OBJECT_SFPF" serializer_version="v1.0.0">` wrapping the
  `asx:abap` block. `<LAYOUT href="#..."/>` inside `asx:values` points to
  a `CL_FP_LAYOUT` heap object that carries only metadata
  (`LAYOUT_TYPE`, etc.) — **not** the XDP itself; the real layout content
  lives entirely in the companion `.sfpf.xdp` file. `CL_FP_CONTEXT` here
  is a single empty root node (nothing bound in Hello World).
- **`<name>.sfpi.xml`** — same `<abapGit serializer="LCL_OBJECT_SFPI">`
  wrapper; otherwise the same `CL_FP_INTERFACE_DATA` skeleton as the
  download export, all children empty.
- **No standalone `.xsd` file at all** — abapGit does not track one as a
  separate object; the schema is derivable from the interface's own
  `CL_FP_PARAMETERS` and is not something we need to hand-maintain
  alongside the source.

**This is the format every `/src/` file in this repo must follow.**
`src/z_mm_pr_form_adt.sfpf.xdp` / `.sfpf.xml` /
`z_mm_pr_form_int_adt.sfpi.xml` were rebuilt against this exact shape —
see `docs/BUILD_ISSUES_LOG.md` entry F6 and
`docs/reference_examples_z_adt_mm_pr_form/README.md` for the populated
(non-trivial) `CL_FP_PARAMETERS`/`CL_FP_CONTEXT` reference this Hello
World example is too minimal to show.

**Naming note**: this object's own name is `ZHELLO_WORLD_FORM_ADT` /
`ZHELLO_WORLD_ADT` — see the naming-convention discussion in
`docs/reference_examples_z_adt_mm_pr_form/README.md` for why this project
switched from `_ADF` to `_ADT`.
