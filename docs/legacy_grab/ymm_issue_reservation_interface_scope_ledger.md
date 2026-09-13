# YMM_ISSUE_RESERVATION — Interface Scope Ledger

100%-evidenced interface contract, extracted directly from the raw
`Utilities → Download` XML export (`docs/legacy_grab/ymm_issue_reservation.xml`,
313,408 bytes, effectively one line — read via byte-offset extraction
per the established technique, `docs/BUILD_ISSUES_LOG.md` F27) rather
than the condensed `ZSF2AF_R_LEGACY_GRAB` report, which gives parameter
*names* but not exact ABAP *types*. Nothing here is inferred or assumed
from a "typical SSF signature" — every type below is the literal
`<TYPENAME>` value from the export.

Form: `YMM_ISSUE_RESERVATION`, caption "Reservation goods issue print",
`DEVCLASS` `ZMM`, last touched 2026-07-02.

## 1. Interface (20 entries — 3 export, 11 import, 4 exceptions, 1 table)

**EXPORTING**
| Name | Type | Flags |
|---|---|---|
| `DOCUMENT_OUTPUT_INFO` | `SSFCRESPD` | BYVALUE, STANDARD |
| `JOB_OUTPUT_INFO` | `SSFCRESCL` | BYVALUE, STANDARD |
| `JOB_OUTPUT_OPTIONS` | `SSFCRESOP` | BYVALUE, STANDARD |

**IMPORTING** — 8 standard SSF envelope parameters + 3 form-specific ones
| Name | Type | Flags |
|---|---|---|
| `ARCHIVE_INDEX` | `TOA_DARA` | OPTIONAL, BYVALUE, STANDARD |
| `ARCHIVE_INDEX_TAB` | `TSFDARA` | OPTIONAL, BYVALUE, STANDARD |
| `ARCHIVE_PARAMETERS` | `ARC_PARAMS` | OPTIONAL, BYVALUE, STANDARD |
| `CONTROL_PARAMETERS` | `SSFCTRLOP` | OPTIONAL, BYVALUE, STANDARD |
| `MAIL_APPL_OBJ` | `SWOTOBJID` | OPTIONAL, BYVALUE, STANDARD |
| `MAIL_RECIPIENT` | `SWOTOBJID` | OPTIONAL, BYVALUE, STANDARD |
| `MAIL_SENDER` | `SWOTOBJID` | OPTIONAL, BYVALUE, STANDARD |
| `OUTPUT_OPTIONS` | `SSFCOMPOP` | OPTIONAL, BYVALUE, STANDARD |
| `USER_SETTINGS` | `TDBOOL` | OPTIONAL, BYVALUE, DEFAULTVAL `'X'`, STANDARD |
| **`IV_PLANT_NAME`** | `NAME1` | OPTIONAL — **form-specific** |
| **`LV_LAND1`** | `T001W-LAND1` | mandatory — **form-specific, the discriminator variable for every conditional in this form (see §4)** |
| **`GV_TOTAL`** | `BDMNG` | mandatory — **form-specific, QUAN type; will need a `CL_FP_REFERENCE_FIELDS` unit once dragged into Context, same pattern as every prior form's QUAN fields** |

**EXCEPTIONS** (all STANDARD): `FORMATTING_ERROR`, `INTERNAL_ERROR`,
`SEND_ERROR`, `USER_CANCELED` — per S04, these are entered **natively**
in SFP, never hand-authored.

**TABLES**
| Name | Type | Flags |
|---|---|---|
| `IT_FINAL` | `LIKE YMM_ISSUE_RESERVATION` | a Z/Y structure named identically to the form itself — the flat print structure, same pattern as the pilot's `ZTABLE_PR_PRINT`/YMMGRNNOTE's `ZEXTRA_FIELD` |

## 2. Global TYPES (`GTYPES` block, literal source) — native-only per S04

```abap
TYPES: BEGIN OF w_header,
        rsnum TYPE rkpf-rsnum,
        rsdat TYPE rkpf-rsdat,
*        USNAM TYPE RKPF-USNAM,
*        NAME_FIRST TYPE ADRP-NAME_FIRST,
*        NAME_LAST TYPE ADRP-NAME_LAST,
        aufnr TYPE resb-aufnr,
        ingrp  TYPE  ingrp,
        vaplz  TYPE  gewrk,
        END OF w_header,
        i_header TYPE TABLE OF w_header.
TYPES: BEGIN OF w_item,
         rspos TYPE resb-rspos,
         matnr TYPE resb-matnr,
         maktx TYPE makt-maktx,
         bdmng TYPE resb-bdmng,
         meins TYPE resb-meins,
         lbkum TYPE mbew-lbkum,
         lgpbe TYPE mard-lgpbe,
***  BOC By Veeresh On 01/09/2022
*         verpr type verpr,  "<Mod02> JHARIHARAN 07.09.2017
         verpr TYPE resb-bdmng,
***  EOC By Veeresh On 01/09/2022
" Added by Zubin on 22.04.2021 (TYPE CHAR12 - for brackets)
         charg(12) TYPE c,     " resb-charg,
         END OF w_item,
         i_item TYPE TABLE OF w_item,
         BEGIN OF gty_t001k,
         bwkey  TYPE bwkey,
         bukrs  TYPE bukrs,
         END OF gty_t001k,
         BEGIN OF gty_t001,
         bukrs TYPE bukrs,
         adrnr TYPE adrnr,
         END OF gty_t001,
         BEGIN OF gty_adrc,
         ADDRNUMBER Type AD_ADDRNUM,
         DATE_FROM  Type AD_DATE_FR,
         NATION TYPE AD_NATION,
         name1 Type AD_NAME1,
         END OF gty_adrc.
```

Note: `verpr` is declared `TYPE resb-bdmng` (a quantity field), not a
currency/price type — the field name (moving price, `VERPR` is normally
`MBEW-VERPR`, a `CURR`) doesn't match its declared type here. This looks
like a genuine legacy inconsistency (the comment shows it was changed
from `TYPE verpr` on 07.09.2017), not something to silently "correct" —
preserved exactly as evidenced, flagged for functional-owner awareness.
`charg(12) TYPE c` is a fixed 12-char field, not bound to `RESB-CHARG`'s
real DDIC type — also preserved exactly, per a 2021 comment explaining
the deliberate override "for brackets" (likely a display-formatting
need, not investigated further here).

## 3. Global DATA (`GDATA` block, 11 entries)

| Name | Type |
|---|---|
| `WA_HEADER` | `W_HEADER` |
| `IT_HEADER` | `I_HEADER` |
| `WA_ITEM` | `W_ITEM` |
| `IT_ITEM` | `I_ITEM` |
| `FINAL_NAME` | `CHAR80` |
| `FIRST_NAME` | `CHAR40` |
| `LAST_NAME` | `CHAR40` |
| `WA_T001K` | `GTY_T001K` |
| `WA_FINAL` | `YMM_ISSUE_RESERVATION` |
| `WA_T001` | `GTY_T001` |
| `WA_ADRC` | `GTY_ADRC` |

All 7 non-DDIC types here (`W_HEADER`, `I_HEADER`, `W_ITEM`, `I_ITEM`,
`GTY_T001K`, `GTY_T001`, `GTY_ADRC`) resolve to the local `GTYPES` block
in §2 — meaning `GLOBAL_DATA` cannot be safely hand-authored until those
`TYPES` exist in the live interface (native-only per S04). Sequencing
implication for this form specifically: **`TYPES` must be entered
natively before `GLOBAL_DATA`/`CODING` are pushed**, not just before
`EXCEPTIONS` — a stricter ordering than YMMGRNNOTE needed, where every
`GLOBAL_DATA` entry referenced DDIC types that already existed
independently of anything hand-authored.

## 4. Global initialization code (`GCODING` block, literal source)

```abap
*BREAK ABAP8.
LOOP AT it_final.
  ON CHANGE OF it_final-rsnum.
    wa_header-rsnum = it_final-rsnum.
    wa_header-rsdat = it_final-rsdat.
*   WA_HEADER-USNAM = IT_FINAL-USNAM.
    wa_header-aufnr = it_final-aufnr.
    wa_header-ingrp = it_final-ingrp.
    wa_header-vaplz = it_final-vaplz.
    IF it_header[] IS INITIAL.
      APPEND wa_header TO it_header.
    ENDIF.
    CLEAR  wa_header.
  ENDON.
  wa_item-rspos = it_final-rspos.
  wa_item-matnr = it_final-matnr.
  wa_item-maktx = it_final-maktx.
  wa_item-bdmng = it_final-bdmng.
  wa_item-meins = it_final-meins.
  wa_item-lbkum = it_final-lbkum.
  wa_item-lgpbe = it_final-lgpbe.
  wa_item-verpr = it_final-verpr. "<Mod02> JHARIHARAN 07.09.2017
** Added by Zubin on 22.04.2021
  wa_item-charg = it_final-charg.
  APPEND wa_item TO it_item.
  CLEAR  wa_item.
ENDLOOP.
```

`*BREAK ABAP8.` is a commented-out debugger breakpoint — dead code,
excluded from the Adobe interface's `INITIALIZATION`, matching this
project's standing "exclude dead code/debugger statements" convention
(`docs/05_individual_form_conversion_framework.md`).

**Design note — this is genuinely simpler than YMMGRNNOTE's per-row
question (F27):** this loop runs **once** and produces two *complete*
derived tables (`IT_HEADER` — one row per distinct `RSNUM`, `IT_ITEM` —
one row per line item), not per-row math needing a live FormCalc
decision. `CL_FP_CODING`'s `INITIALIZATION` also runs once — so this
loop can be replicated **verbatim, unmodified**, as the Adobe
interface's own `INITIALIZATION`, with `IT_FINAL` as `INPUT_PARAMETERS`
and `WA_HEADER`/`IT_HEADER`/`WA_ITEM`/`IT_ITEM` as `OUTPUT_PARAMETERS`
(confirmed exactly this shape by the raw `GPLIST` block: all 5 names
appear with `OUTIN=I`, then all 5 again with `OUTIN=O`). No
FormCalc-vs-ABAP-loop design decision needed here, unlike YMMGRNNOTE's
`%CODE1`/`%CODE3`.

## 5. Window map (6 windows, evidenced via `NODETYPE` walk)

| Window | Caption | Content | Binding |
|---|---|---|---|
| `%WINDOW1` | Logo | Graphic, SE78 `GRAPHICS/DANGOTELOGO` (BMAP/BCOL) | same logo family as the pilot and YMMGRNNOTE — check Global Style Catalogue before treating as new |
| `%WINDOW2` | Plant heading | `%TEMPLATE2` section, 14.50cm wide | static/plant header text — contains the literal "OBAJANA CEMENT PLC" text found 11 times in the export (see §6) |
| `%WINDOW3` | Details | `%LOOP1`, bound to `IT_HEADER`/`WA_HEADER` | **non-ZA variant** (see §6) |
| `%WINDOW5` | Details | `%LOOP2`, bound to `IT_HEADER`/`WA_HEADER` — same binding as `%WINDOW3` | **ZA variant** (see §6) — a genuine alternate-layout pair, not a duplicate to collapse |
| `MAIN` | Main Window | `%TABLE1`, bound to `IT_ITEM`/`WA_ITEM` | the repeating line-items table — column captions found: S/No., Item code, Description and Part Nos, UOM, Qty required, Qty Issued, Stock balance/Store balance, Bin No |
| `%WINDOW4` | Date and Signature | `%TEMPLATE3` section, 18.63cm wide | signature block — captions found: Signature of the head, User Department, Section, S.I.R raised by |

## 6. Conditional design — binary `LV_LAND1 = 'ZA'` switch, not multi-way

16 `<sf:CONDITION>` nodes found; every one evaluates `LV_LAND1` (South
Africa country key `'ZA'`) — the overwhelming majority as a clean
either/or pair: `LV_LAND1 = 'ZA'` vs. `LV_LAND1 <> 'ZA'` (one condition,
`%CONDITION8`, additionally excludes `'SN'` — worth a second look once
the full condition list is walked, not yet fully enumerated here). This
is structurally **much simpler** than YMMGRNNOTE's 11-condition,
partially-dummied plant/output-type matrix (`DEP-YMMGRNNOTE-05`) — a
single discriminator variable already exists as a real, mandatory
interface parameter (`LV_LAND1`), and the branch is genuinely binary.

Maps directly onto the conditional-visibility pattern already
documented in `docs/legacy_grab/ymmgrnnote_post_implementation.md`
("Conditional visibility pattern — check variable + FormCalc/JS"): bind
`LV_LAND1` into a small field on the layout, and give the ZA-specific
and non-ZA-specific content blocks (at minimum: the `%WINDOW2` plant
heading, `%WINDOW3`/`%WINDOW5` Details pair, and likely also parts of
`MAIN`/`%WINDOW4` — not yet fully confirmed which blocks branch) an
`initialize` script setting `presence` from that field. **Not yet
built** — this is layout-phase work, flagged here so it isn't
rediscovered from scratch when that phase starts.

**`MAIN` table structure (`%TABLE1`), extracted ahead of Context** —
8 columns, total width 19.95cm (matches the section's own declared
`WIDTH`): `1.20 / 3.40 / 5.20 / 1.80 / 2.10 / 2.15 / 2.15 / 1.95` cm.
Row field bindings confirmed via `WA_ITEM-*` references in binding
order: `RSPOS`, `MATNR`, `CHARG`, `MAKTX`, `MEINS`, `BDMNG`, `LGPBE`,
`LBKUM`, `VERPR` — every one of `w_item`'s own fields is used
somewhere in this table, none left over. Column captions found
separately in the export (§5 above): S/No., Item code, Description
and Part Nos, UOM, Qty required, Qty Issued, Bin No, and either
"Stock balance" or "Store balance" (both appear — likely the E/F
language pair for the same column, matching this form's consistent
dual-language `T_CAPTION` pattern seen on every window/text node, not
two different columns; not yet 100% confirmed which column is which
caption — do that once Context/layout work actually starts on this
window). `BDMNG`/`LBKUM` are the QUAN fields already known from the
`w_item` TYPES declaration (§2); `VERPR` is nominally QUAN too per its
declared type but is `DEP-YMMISSUERES-02`'s flagged type-mismatch
field.

**Still to extract before layout work begins** (deferred, not blocking
the interface): exact literal text of the plant-heading template
(`%WINDOW2`/`%TEMPLATE2`) for both language variants, the exact
`MAIN` table's column-to-field mapping and widths, and the
`%WINDOW4`/`%TEMPLATE3` signature block's exact field bindings — same
byte-offset extraction technique, done only once layout work starts,
per this program's established phase discipline (interface → native
Context → layout).

## 7. Style/logo/prerequisite checklist status (§6-11 of the legacy-grab report)

- Logo: confirmed `GRAPHICS/DANGOTELOGO` — check against
  `docs/04_global_style_catalogue.md`/`docs/legacy_grab/global_logos.txt`
  before treating as a new asset.
- SmartStyle: not yet identified in this pass (report's own §6 stayed
  MANUAL) — needs an SE71 Output Options check against
  `docs/legacy_grab/global_smartstyles.txt`.
- Driver program: not found by source scan (report's own §3) — needs
  manual NACE/functional-owner confirmation, same as every other
  section-3 gap on this project; read-only regardless once found.
- Risk score: not yet assigned — defer to `docs/01_scope.md` §11's
  framework once the conditional-branding scope (§6 above) and driver
  context are both confirmed.
