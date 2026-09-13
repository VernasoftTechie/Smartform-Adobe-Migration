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

This is a real, repeatable path - not a one-off. It was confirmed twice
independently: once by the user's own native-entry-then-capture cycle
(which produced this exact multi-line XML shape), and once by a
from-scratch hand-authored file built to match it, which deserialized
and activated cleanly on Pull.

## Never do this

- Do not hand-author `EXCEPTIONS` or `TYPES` (under `CL_FP_PARAMETERS`
  and `CL_FP_GLOBAL_DEFINITIONS` respectively). Two attempts including
  populated versions of these both threw a hard `SFPI error,
  deserialize` on Pull; an isolation test with everything else present
  and only these two emptied deserialized cleanly. Their real XML shape
  is still unconfirmed - enter exceptions and any `TYPES:` declarations
  natively in SFP instead.
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
  Import/Export/Tables/Global Data - if a deserialize error occurs
  instead, isolate by removing `EXCEPTIONS`/`TYPES` first before
  suspecting anything else.

## Form-specific inputs

The parameter names, types, global declarations, and initialization
logic always come from the individual form's legacy-grab evidence
(ideally byte-offset extracted from the real Smart Form XML, not a
condensed summary - see `docs/BUILD_ISSUES_LOG.md` F27). This strategy
only defines which *sections* are safe to hand-author, never what
content goes in them.
