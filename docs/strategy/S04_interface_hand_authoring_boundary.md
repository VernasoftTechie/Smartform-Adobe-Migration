# S04 — Interface hand-authoring boundary

## Select this strategy

Use for **every** form's Adobe interface (`.sfpi.xml`), once the exact
parameter/global contract has been evidenced from the legacy Smart Form.

## Proven pattern

Hand-author and commit directly, then Pull onto a form/interface pair
that is currently in the safe empty baseline state:

- `CL_FP_PARAMETERS` → `IMPORT_PARAMETERS`, `EXPORT_PARAMETERS`,
  `TABLE_PARAMETERS` (each a list of `SFPIOPAR` - `NAME`/`TYPING`/
  `TYPENAME`/`OPTIONAL`/`BYVALUE`/`DEFAULTVAL`/`STANDARD`/`CONSTANT`).
- `CL_FP_GLOBAL_DEFINITIONS` → `GLOBAL_DATA` (a list of `SFPGDATA` -
  `NAME`/`TYPING`/`TYPENAME`/`DEFAULTVAL`/`CONSTANT`).
- `CL_FP_CODING` → `INPUT_PARAMETERS`/`OUTPUT_PARAMETERS` (lists of
  bare `FPPARAMETER` name entries) and `INITIALIZATION` (a list of
  `FPCLINE` entries, one per source line, blank lines as empty
  `<FPCLINE/>`).
- `CL_FP_GLOBAL_DEFINITIONS` → `TYPES` (confirmed 2026-09-13 on
  `YMM_ISSUE_RESERVATION_INT` — see below). Same shape as
  `INITIALIZATION`: a list of `FPCLINE` entries, one per literal ABAP
  source line (`TYPES: BEGIN OF ...`, each component line, `END OF ...`,
  chained `BEGIN OF`/`END OF` blocks under one trailing period exactly
  as ABAP allows) — **not** a structured component list like
  `GLOBAL_DATA`'s `SFPGDATA`.

This is a real, repeatable path - not a one-off. `IMPORT_PARAMETERS`/
`EXPORT_PARAMETERS`/`TABLE_PARAMETERS`/`GLOBAL_DATA`/`CODING` were
confirmed twice independently on the pilot form and YMMGRNNOTE; `TYPES`
was confirmed on 2026-09-13 on `YMM_ISSUE_RESERVATION_INT` — the user
natively entered one structure (`w_header`/`i_header`) and pushed,
which revealed the real `FPCLINE`-based shape for the first time
anywhere in this project (previously "unconfirmed," below). The
remaining 4 structures for that form were then hand-authored to match
and the full interface activated cleanly with **zero** deserialize
errors.

## Never do this

- Do not hand-author `EXCEPTIONS` (under `CL_FP_PARAMETERS`). Two
  attempts including a populated version threw a hard `SFPI error,
  deserialize` on Pull, bundled together with `TYPES` at the time; an
  isolation test with everything else present and only these two
  emptied deserialized cleanly (F30). Now that `TYPES`'s shape is
  confirmed safe (above), `EXCEPTIONS` is the one remaining genuinely
  unconfirmed section — its real XML shape has still never been
  captured from a native-entry example. Enter exceptions natively in
  SFP until a real reference confirms its shape the same way `TYPES`
  was confirmed.
- Do not hand-author `STANDARD="X"` import/export parameters — the
  classic SSF envelope (`ARCHIVE_INDEX`/`ARCHIVE_INDEX_TAB`/
  `ARCHIVE_PARAMETERS`/`CONTROL_PARAMETERS`/`MAIL_APPL_OBJ`/
  `MAIL_RECIPIENT`/`MAIL_SENDER`/`OUTPUT_OPTIONS`/`USER_SETTINGS` on
  import; `DOCUMENT_OUTPUT_INFO`/`JOB_OUTPUT_INFO`/`JOB_OUTPUT_OPTIONS`
  on export — present on every classic SSF-generated form's legacy-grab
  report, boilerplate, not form-specific). Confirmed on
  `YMM_ISSUE_RESERVATION_INT`: hand-authoring these has no effect — SFP
  silently drops them on Pull and substitutes its own auto-generated
  `/1BCDWB/DOCPARAMS` (`TYPE SFPDOCPARAMS`) parameter, which handles
  Adobe's own print/output control. Skip these entirely on every future
  form's `IMPORT_PARAMETERS`/`EXPORT_PARAMETERS` — only hand-author the
  form-specific, non-`STANDARD` parameters.
- Do not hand-author `CL_FP_CONTEXT` (the form's Context tree) under any
  circumstances. It is a linked graph of GUID-identified nodes
  (`CL_FP_FOLDER`/`CL_FP_DATA`/`CL_FP_LOOP`/`CL_FP_CONDITION`/
  `CL_FP_ALTERNATIVE`, threaded by `PARENT`/`SUCCESSOR`/`CHILD`
  references) - a fundamentally different, higher-risk structure than a
  flat parameter/global list. Always drag nodes from the Interface tree
  into Context manually in SFP, then capture with Stage → Commit → Push.
- Do not skip validating the file is well-formed XML before pushing, and
  do not push over an object that isn't currently in the safe empty
  baseline - Pull replaces the object's parameters/globals/coding
  wholesale.

## Why this exists

`YMMGRNNOTE_INT` needed 20 imports, 3 exports, 1 table, 4 exceptions, 15
globals, and real initialization logic entered before Context or layout
work could begin. Typing all of it natively is slow and doesn't scale to
500+ forms. Two full-scope attempts (F28, F29) failed with a hard
deserialize error; isolating the two least-evidenced sections
(`EXCEPTIONS`, `TYPES`) and removing them let everything else through
cleanly (F30) - proving the boundary is narrow and specific, not a
reason to abandon hand-authoring altogether.

## Required validation

- The target form/interface is in the safe empty baseline (no prior
  failed import left it in a partial state) before pushing.
- The XML is well-formed (validate before committing, not after Pull
  fails).
- After Pull, the Interface tree in SFP shows the expected
  Import/Export/Tables/Global Data/Types - if a deserialize error occurs
  instead, isolate by removing `EXCEPTIONS` first before suspecting
  anything else (the one remaining unconfirmed section).
- Never hand-author a `STANDARD="X"` parameter - it will be silently
  dropped and substituted with SFP's own generated equivalent
  (`/1BCDWB/DOCPARAMS` for import). Only include the form's genuinely
  custom, non-`STANDARD` parameters.

## Form-specific inputs

The parameter names, types, global declarations, and initialization
logic always come from the individual form's legacy-grab evidence
(ideally byte-offset extracted from the real Smart Form XML, not a
condensed summary - see `docs/BUILD_ISSUES_LOG.md` F27). This strategy
only defines which *sections* are safe to hand-author, never what
content goes in them.
