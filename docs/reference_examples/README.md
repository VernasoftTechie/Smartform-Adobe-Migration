# Reference examples

Real exports from the target system, kept here as authoritative format
references for building every future form's Adobe deliverables — not
guessed, not reconstructed from documentation.

## ZHELLO_WORLD_FORM.* / SFPF_ZHELLO_WORLD_FORM.XML / SFPI_ZHELLO_WORLD.XML

A minimal "Hello World" Adobe Form exported from this system (generator:
`AdobeLiveCycleDesigner_V11.0.9.20240701.1.52_SAP`, ADS host
`ikjdcdevcha01.dangote-group.com`). Confirms the real abapGit serialization
format for Adobe/Interactive Forms:

- **`<FORMNAME>.XDP`** — the standalone XFA template (LiveCycle Designer's
  native format): `template`, `config`, `connectionSet`/`xsdConnection`
  (linking to the `.XSD`), `xfa:datasets`, `localeSet`.
- **`<FORMNAME>.XSD`** — the data schema the connectionSet references. Empty
  `<xsd:sequence/>` here because Hello World has no bound fields — a real
  form's XSD declares every interface parameter.
- **`SFPF_<FORMNAME>.XML`** — the **form** object (TADIR type `SFPF`,
  parallel to Smart Forms' `SSFO`). `asx:abap` wrapper: `VERSION`,
  `INTERFACE` (name reference to the SFPI object), `CONTEXT`/`CONTEXTT`,
  `LAYOUT`/`LAYOUTT` — the XDP is **base64-embedded** inside
  `LAYOUTT/FPLAYOUTT/LAYOUT`, byte-for-byte identical to the standalone
  `.XDP`. `asx:heap` carries `CL_FP_LAYOUT` (layout metadata) and
  `CL_FP_CONTEXT` (context node tree — a **single empty root node** here,
  since nothing is bound).
- **`SFPI_<FORMNAME>.XML`** — the **interface** object (TADIR type `SFPI`).
  `asx:abap` wrapper: `VERSION`, `INTERFACE` (heap reference), `INTERFACET`.
  `asx:heap` carries `CL_FP_INTERFACE_DATA` with four empty children:
  `CL_FP_CODING` (script/forms), `CL_FP_PARAMETERS`
  (`IMPORT_PARAMETERS`/`EXPORT_PARAMETERS`/`TABLE_PARAMETERS`/`EXCEPTIONS`,
  all empty here), `CL_FP_GLOBAL_DEFINITIONS`, `CL_FP_REFERENCE_FIELDS`.

**What this confirms with full confidence**: the outer wrapper/skeleton
shape for all four file types, and that the layout truly is just the XDP,
base64-embedded.

**What this does NOT show** (Hello World has no bound fields): what a
*populated* `CL_FP_CONTEXT` node tree or a *populated* `CL_FP_PARAMETERS`
list looks like internally — field names, type references, how children
nest. `Z_MM_PR_FORM`'s `SFPI_Z_MM_PR_FORM.XML`
(`docs/legacy_grab/`) deliberately keeps those sections empty rather than
guess that structure — the real field list lives in its `.XSD` instead,
added to SFP's Interface tab manually until a populated reference closes
this gap the same way this one closed the wrapper-format gap.
