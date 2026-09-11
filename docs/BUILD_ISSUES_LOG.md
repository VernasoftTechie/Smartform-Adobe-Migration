# Build Issues Log — Smart Form to Adobe Form Migration

Every activation/runtime error hit on this repo, and its fix. Read before
concluding new code "should work." Append the day a new one is hit (Bolt
Playbook §0.4) — mirror the one-row summary into the Playbook's Appendix A too.

| # | Symptom | Cause | Fix |
|---|---|---|---|
| F1 | Dump `CALL_FUNCTION_CONFLICT_TYPE` (`CX_SY_DYN_CALL_ILLEGAL_TYPE`) calling `SSF_FUNCTION_MODULE_NAME` from `RESOLVE_FM_NAME`, passing `IV_FORMNAME TYPE string` directly to `FORMNAME` | `SSF_FUNCTION_MODULE_NAME` is a classic, pre-STRING-era function module — its `FORMNAME` parameter is a fixed-length `C`-like type, not `STRING`. `CALL FUNCTION`'s static type-check rejects a `STRING` actual there even though an ordinary `MOVE`/assignment would convert it fine | Declare a fixed `CHAR30` local, assign the string to it (`lv_formname = iv_formname.`), pass *that* to `FORMNAME` instead of the string variable directly (fixed in v0.4) |
| F3 | Activation error: *"The variable `<TAB>` must be escaped using `@`"* on `SELECT * FROM (lv_tab) INTO TABLE <tab> ...` in `PROBE_FORM_STORAGE` | Modern strict Open SQL requires **every** host variable — including an existing field symbol, not just an inline `DATA()` — to be prefixed with `@` when used as a SELECT target | `INTO TABLE @<tab>` (fixed in v1.5) |
| F4 | ATC warning: *"ABAP Doc comment is in the wrong position"* on the `"!` block preceding `TYPES: BEGIN OF ty_prog_info, ...` | A blank line before it wasn't enough (unlike the same warning on `PROBE_FM`'s `METHODS` doc, fixed by a blank line alone) — ABAP Doc appears not to support commenting a compound `TYPES:` chain declaring two types at once | Downgraded to a plain `"` comment (fixed in v1.5) — no functional loss, `"!` is only needed where a tool actually renders the doc (e.g. method signatures) |
| F2 | Activation errors in `EXTRACT_INCLUDES`: *"LV_INCLNAME must be a character-like field (data type C, N, D, or T)"* on the offset/length access, and *"LV_INCLNAME is not type-compatible with formal parameter IV_PROGNAME"* on the `write_driver_source( iv_progname = lv_inclname ... )` call | `DATA(lv_inclname) = to_upper( lt_words[ 2 ] ).` inferred `lv_inclname` as `TYPE string` (the return type of `to_upper( )`). Classic offset/length notation (`field+off(len)`) is **not valid on `STRING`**, only on fixed `C/N/D/T` types. Separately, `write_driver_source`'s `IV_PROGNAME` formal is `TYPE tadir-obj_name` (a by-reference `IMPORTING` param) — passing a `STRING` actual there fails type-compatibility even though a plain assignment would convert fine (same class of trap as ZAB_V1_UT engineering-log T2/T3) | Declare `lv_inclname` explicitly as `TYPE tadir-obj_name` (not inline `DATA()`), assign via `=` (plain assignment allows the conversion), *then* do the offset/length trim and pass it to `write_driver_source` — fixed in v0.9 |
| F5 | User: *"unable to view any of the files from the repo, abapGit is not able to read"* — all 4 `Z_MM_PR_FORM_ADF` deliverables (`.XDP`, `.XSD`, `SFPF_*.XML`, `SFPI_*.XML`) invisible to abapGit despite valid content | Files were placed under `docs/legacy_grab/` — this repo's own `.abapgit.xml` sets `STARTING_FOLDER=/src/` and explicitly `<IGNORE><item>/docs/*</item></IGNORE>`. abapGit was never looking there; correct XML content is irrelevant if the file sits outside the scanned folder. Self-inflicted: I authored that `.abapgit.xml` in v1.0 and didn't check it before placing new object-type files | Moved all 4 to `/src/` (fixed in v2.3). **General lesson, not just SFPF/SFPI-specific**: any file meant to become a real importable SAP object goes in `/src/`, never `docs/`, regardless of how unfamiliar the object type — check the repo's own `.abapgit.xml` `STARTING_FOLDER`/`IGNORE` before placing anything new, don't assume |
| F6 | User: *"still not able to clone through ABAPGit bcz of the format concerns"* — even after F5's folder fix, `SFPF_Z_MM_PR_FORM_ADF.XML` / `Z_MM_PR_FORM_ADF.XDP` / `SFPI_Z_MM_PR_FORM_ADF.XML` still would not clone | Wrong wrapper format, not a folder problem this time. I had modeled these files on the **SAP GUI "Utilities > Download" export** shape (`<asx:abap>` as the literal XML root, XDP base64-embedded inside `LAYOUTT/FPLAYOUTT/LAYOUT`). abapGit's real serializer for object types SFPF/SFPI (`LCL_OBJECT_SFPF`/`LCL_OBJECT_SFPI`) uses a **different, abapGit-specific shape**: an `<abapGit version="v1.0.0" serializer="LCL_OBJECT_..." serializer_version="v1.0.0">` root wrapping the `asx:abap` block, and — for SFPF only — the layout is **not** embedded at all; it ships as a **separate companion file** (`<name>.sfpf.xdp`, plain unencoded XDP) while `<name>.sfpf.xml`'s `LAYOUT href` points to a `CL_FP_LAYOUT` heap stub carrying only metadata. There is also **no standalone `.xsd` file** in the real format — the download export's `.XSD` was never a trackable abapGit object | Confirmed by having the user create a trivial Adobe Form in SAP and letting abapGit serialize it for real (`src/zhello_world_form_adt.sfpf.xdp`/`.sfpf.xml`/`zhello_world_adt.sfpi.xml`, pulled via `git pull`) — then rebuilding `Z_MM_PR_FORM`'s three files against that exact proven shape (v2.4/v3.0): dropped the standalone `.xsd`, split the XDP into its own `.sfpf.xdp` file, added the `<abapGit serializer="...">` wrapper to both XML files. **General lesson, not just this project**: when abapGit rejects a hand-authored serialization and the object type is unfamiliar, don't keep guessing at the wrapper shape from a raw SAP GUI download — get one real example of that *exact* object type serialized by abapGit itself (create the simplest possible object in the system, commit it, pull it) and copy its outer structure exactly; content facts (field names/types) can still come from other sources, but the wrapper shape cannot be reliably reverse-engineered from a non-abapGit export |

| F7 | Imported into SFP/LiveCycle Designer cleanly (Hierarchy tree showed every subform correctly), but Design View canvas rendered completely blank at any zoom level and with any node selected | The root template subform (`Z_MM_PR_FORM_ADT`) was declared `layout="tb"` (top-to-bottom auto-flow). Under `tb`, the layout engine **ignores every child subform's explicit `x`/`y`** and instead auto-stacks children by height in document order. The 9 body sections' heights sum to ~33cm, but the single `pageArea` was a fixed one-page area (default `occur` = exactly 1) only 21cm tall — the flowed content had nowhere valid to go, so nothing painted at all | Changed the root subform to `layout="position"` (XFA's own default when the attribute is omitted — confirmed by re-checking how `zhello_world_form_adt.sfpf.xdp`'s own body wrapper subform does it: no `layout` attribute, i.e. implicit `position`) so every child's explicit `x`/`y` is honored as designed. Also added `<occur min="0" max="-1"/>` to `pageArea` as a defensive multi-page allowance, matching the real `Z_ADT_MM_PR_FORM.XDP` reference's own pattern (fixed in v2.6). **General lesson**: `layout="tb"`/`"row"` and explicit per-child `x`/`y` are mutually exclusive — a subform meant to hold absolutely-positioned children (the norm when recreating a Smart Form's window-based layout) must be `layout="position"` (or omit `layout` entirely), never `"tb"` |

## Unverified table names to watch (not yet confirmed traps)

`global_sweep` (P_GLOB, v1.2) reads `STXBITMAPS` for SE78-registered
graphics via a **static** `SELECT *` — this table name has not been used
anywhere else in this project and is a best-effort guess. If it's wrong,
expect an **activation-time** error naming the table (not a runtime dump,
since `SELECT *` needs no field names) — paste it back and it's a one-line
fix (swap the table name).

`probe_form_storage` (v1.4) reads four other unverified candidate tables —
`STXFOBJECT`, `STXFATTR`, `STXFHEADER`, `SSFOBJ` — but via **dynamic**
`SELECT * FROM (lv_tab)` inside `TRY...CATCH cx_root`, resolved through
`cl_abap_typedescr=>describe_by_name` first. A wrong name here is a caught
runtime exception, not an activation failure — genuinely zero risk to the
program even if all four don't exist (which is plausible; they're
speculative). No fix-round needed if they all miss — the snapshot just says
so and points at the debugger-based alternative
(`docs/02_legacy_grab_spec.md`).

## Lesson for future calls in this project

Any **classic** (pre-Unicode-era) function module — `SSF_*`, most `SAPscript`/
Smart Forms APIs, many old BAPIs — is likely to have fixed-length `C`/`N`/`D`/`T`
typed parameters, not `STRING`. Before passing a `STRING`-typed variable into
one, convert it to a fixed-length local first. Modern function modules
(`GUI_DOWNLOAD` and most post-7.0 APIs) generally accept `STRING` natively —
but if a new `CALL_FUNCTION_CONFLICT_TYPE` dump shows up anywhere else in this
report, the fix is the same pattern: add a fixed-length local, assign, pass
that instead of the raw `string`.
