# S04 — Interface and Context hand-authoring boundary

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

### `CL_FP_CONTEXT` (confirmed 2026-10-01 — see "Context now allowed" below)

All three node shapes a real form's Context tree needs are now
independently proven by hand-authoring, on a disposable throwaway
object (`Z_TEMP_CTXTEST_INT`/`_ADT`, branch `vernasofttechie-ctxtest`,
never a migration branch), each spliced into a real, already-pulled
`.sfpf.xml` and confirmed clean on Pull with zero errors:

- **Scalar** (`CL_FP_DATA` directly under root `CONTEXT`) — commit
  `8d71383`. Bound a plain import parameter.
- **Table parameter** (`CL_FP_LOOP` → `CL_FP_LOOP_DATA` → `CL_FP_DATA`
  leaves) — commit `f930564`. This is the structurally hardest of the
  three (two separate `CL_FP_CONDITION` wrappers per loop - one for the
  node's own `CONDITION`, one for `CL_FP_LOOP`'s own `WHERE_CONDITION`,
  both pointing back at the loop node) and it imported clean, field
  labels resolving correctly from DDIC despite `FIELD_LABEL` being left
  empty.
- **Structure parameter** (`CL_FP_STRUCTURE` → `CL_FP_DATA` leaves,
  table-qualified `FIELD` values like `LS_TEST-EBELN`) — commit
  `daa7f1e`.

Shape confirmed from real SAP-generated examples throughout, never
guessed: every `CL_FP_NODE` wraps its own `CONDITION` in a separate
`CL_FP_CONDITION` object (`NODE` href back to the owning node + empty
`CONDITIONS`), even when there's nothing conditional about it - this
wrapper pattern was first seen on 2026-10-01 from the user's own native
drag and used in every splice since.

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
- `CL_FP_CONTEXT` is **no longer a blanket "never"** (see "Context now
  allowed" below) — but only for the three proven node shapes
  (`CL_FP_DATA` scalar, `CL_FP_STRUCTURE`, `CL_FP_LOOP`/`CL_FP_LOOP_DATA`
  table), each as a flat sibling directly under the root `CONTEXT` node.
  Still genuinely untested, and still native-drag-only until each gets
  its own disposable-branch confirmation the same way: `CL_FP_FOLDER`
  (grouping nodes), `CL_FP_ALTERNATIVE` (conditional branches),
  `CL_FP_CONDITION` with real, non-empty `CONDITIONS` content (every
  confirmed example so far has an empty `<CONDITIONS/>`), a node nested
  more than one level deep (e.g. a loop inside a loop, or a structure
  field inside a loop row), and graphs at real-client scale (ZCGSD_INVOICE-
  sized interfaces, 20+ parameters chained together) rather than the 2-9
  node splices tested so far.
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

## Context now allowed — build procedure

For the three proven shapes only (flat scalar, structure, table - each a
direct sibling under root `CONTEXT`), build the splice from section 2d's
parameter order (`docs/02_legacy_grab_spec.md` - exact drag order,
SSF-envelope names already excluded) plus each parameter's real DDIC
shape:

1. Classify each parameter: elementary (→ `CL_FP_DATA`), structured (→
   `CL_FP_STRUCTURE`), or table-typed (→ `CL_FP_LOOP`/`CL_FP_LOOP_DATA`).
2. For a structure or table parameter, enumerate its real field list via
   `GET_DDIC_FIELD_LIST` (same reflection already used for section 2c's
   reference-field resolution) - never invent a field name.
3. Chain parameters as siblings under root `CONTEXT` in section 2d's
   order (`PARENT href` to the root node, `SUCCESSOR href` to the next
   sibling, last one's `SUCCESSOR` empty). Give every node, including
   every auto-expanded structure/table field, its own fresh GUID and its
   own `CL_FP_CONDITION` wrapper (`NODE href` back to itself, empty
   `CONDITIONS`) - a loop additionally needs a second wrapper for its own
   `WHERE_CONDITION`.
4. Validate before every push: well-formed XML, no duplicate `oN`
   document-local ids, no dangling `href` targets (every reference
   resolves to a declared id in the same file).
5. Pull onto a form currently in the safe empty baseline, same as every
   other section in this strategy.

## Required validation

- The target form/interface is in the safe empty baseline (no prior
  failed import left it in a partial state) before pushing.
- The XML is well-formed (validate before committing, not after Pull
  fails) - for Context specifically, also check id/href graph
  consistency (step 4 above).
- After Pull, the Interface tree in SFP shows the expected
  Import/Export/Tables/Global Data/Types - if a deserialize error occurs
  instead, isolate by removing `EXCEPTIONS` first before suspecting
  anything else (the one remaining unconfirmed section).
- After Pull, the Context tree in SFP shows the expected nodes bound to
  the expected fields, same visual check used to confirm all three
  shapes above.
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
