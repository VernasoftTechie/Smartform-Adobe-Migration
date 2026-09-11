# Build Issues Log — Smart Form to Adobe Form Migration

Every activation/runtime error hit on this repo, and its fix. Read before
concluding new code "should work." Append the day a new one is hit (Bolt
Playbook §0.4) — mirror the one-row summary into the Playbook's Appendix A too.

| # | Symptom | Cause | Fix |
|---|---|---|---|
| F1 | Dump `CALL_FUNCTION_CONFLICT_TYPE` (`CX_SY_DYN_CALL_ILLEGAL_TYPE`) calling `SSF_FUNCTION_MODULE_NAME` from `RESOLVE_FM_NAME`, passing `IV_FORMNAME TYPE string` directly to `FORMNAME` | `SSF_FUNCTION_MODULE_NAME` is a classic, pre-STRING-era function module — its `FORMNAME` parameter is a fixed-length `C`-like type, not `STRING`. `CALL FUNCTION`'s static type-check rejects a `STRING` actual there even though an ordinary `MOVE`/assignment would convert it fine | Declare a fixed `CHAR30` local, assign the string to it (`lv_formname = iv_formname.`), pass *that* to `FORMNAME` instead of the string variable directly (fixed in v0.4) |

## Lesson for future calls in this project

Any **classic** (pre-Unicode-era) function module — `SSF_*`, most `SAPscript`/
Smart Forms APIs, many old BAPIs — is likely to have fixed-length `C`/`N`/`D`/`T`
typed parameters, not `STRING`. Before passing a `STRING`-typed variable into
one, convert it to a fixed-length local first. Modern function modules
(`GUI_DOWNLOAD` and most post-7.0 APIs) generally accept `STRING` natively —
but if a new `CALL_FUNCTION_CONFLICT_TYPE` dump shows up anywhere else in this
report, the fix is the same pattern: add a fixed-length local, assign, pass
that instead of the raw `string`.
