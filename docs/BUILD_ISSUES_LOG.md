# Build Issues Log — Smart Form to Adobe Form Migration

Every activation/runtime error hit on this repo, and its fix. Read before
concluding new code "should work." Append the day a new one is hit (Bolt
Playbook §0.4) — mirror the one-row summary into the Playbook's Appendix A too.

| # | Symptom | Cause | Fix |
|---|---|---|---|
| F1 | Dump `CALL_FUNCTION_CONFLICT_TYPE` (`CX_SY_DYN_CALL_ILLEGAL_TYPE`) calling `SSF_FUNCTION_MODULE_NAME` from `RESOLVE_FM_NAME`, passing `IV_FORMNAME TYPE string` directly to `FORMNAME` | `SSF_FUNCTION_MODULE_NAME` is a classic, pre-STRING-era function module — its `FORMNAME` parameter is a fixed-length `C`-like type, not `STRING`. `CALL FUNCTION`'s static type-check rejects a `STRING` actual there even though an ordinary `MOVE`/assignment would convert it fine | Declare a fixed `CHAR30` local, assign the string to it (`lv_formname = iv_formname.`), pass *that* to `FORMNAME` instead of the string variable directly (fixed in v0.4) |
| F2 | Activation errors in `EXTRACT_INCLUDES`: *"LV_INCLNAME must be a character-like field (data type C, N, D, or T)"* on the offset/length access, and *"LV_INCLNAME is not type-compatible with formal parameter IV_PROGNAME"* on the `write_driver_source( iv_progname = lv_inclname ... )` call | `DATA(lv_inclname) = to_upper( lt_words[ 2 ] ).` inferred `lv_inclname` as `TYPE string` (the return type of `to_upper( )`). Classic offset/length notation (`field+off(len)`) is **not valid on `STRING`**, only on fixed `C/N/D/T` types. Separately, `write_driver_source`'s `IV_PROGNAME` formal is `TYPE tadir-obj_name` (a by-reference `IMPORTING` param) — passing a `STRING` actual there fails type-compatibility even though a plain assignment would convert fine (same class of trap as ZAB_V1_UT engineering-log T2/T3) | Declare `lv_inclname` explicitly as `TYPE tadir-obj_name` (not inline `DATA()`), assign via `=` (plain assignment allows the conversion), *then* do the offset/length trim and pass it to `write_driver_source` — fixed in v0.9 |

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
