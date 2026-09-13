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
| `%WINDOW2` | Plant heading | `%TEMPLATE2`, 14.50cm wide, 3 rows | row 1: 5-way country-conditional company name (§6); row 2: plant name (`IV_PLANT_NAME`, unconditional); row 3: static title "STORE ISSUE RESERVATION" |
| `%WINDOW3` | Details | `%LOOP1`/`%TEMPLATE1`, bound to `IT_HEADER`/`WA_HEADER` | **confirmed identical to `%WINDOW5`** (re-scanned in full, §6) — build once |
| `%WINDOW5` | Details | `%LOOP2`, bound to `IT_HEADER`/`WA_HEADER` — same fields as `%WINDOW3`, word-for-word | not a content branch — SmartForms artifact of some other (not yet identified) duplication reason, safe to collapse to one Adobe subform |
| `MAIN` | Main Window | `%TABLE1`, bound to `IT_ITEM`/`WA_ITEM`, 8 columns | line-items table — exact widths/bindings in §6 below |
| `%WINDOW4` | Date and Signature | `%TEMPLATE3`, 18.63cm wide, 3 columns | footer signature block — "Name and Signature of the Issuer" + "(User Department)" (§6) |

## 6. Conditional design — CORRECTED 2026-09-13 after full re-read

**This section's earlier claim ("clean binary `LV_LAND1 = 'ZA'` switch")
was wrong** — it was based on sampling 6 of 16 conditions rather than
reading the actual window content each one gates. Corrected here after
a full re-scan of `%WINDOW2`, per the user's explicit instruction to
double-check before concluding.

**`%WINDOW2` (Plant heading) row 1 — a genuine 5-way country branch on
the company-name line**, one static text alternative per condition
(each with its own `T_CAPTION`/`T_TEXT` — note several of these show
mismatched/swapped E vs F language text, e.g. `ZA_COUNTRY`'s English
caption reads "Sephaku" while its English `T_TEXT` line reads "SEPHAKU
CEMENT" and its French `T_TEXT` reads "DANGOTE CEMENT SENEGAL S.A" —
preserved exactly as evidenced, not corrected, flagged as
`DEP-YMMISSUERES-06` below):

| Node | Condition | Live? | Content |
|---|---|---|---|
| `ZA_COUNTRY` | `LV_LAND1 <> 'SN' AND LV_LAND1 = 'ZA'` | live | static "SEPHAKU CEMENT" (E) / "DANGOTE CEMENT SENEGAL S.A" (F) |
| `SN_COUNTRY` | `LV_LAND1 = 'SN' AND LV_LAND1 <> 'ZA'` | live | static "DANGOTE CEMENT SENEGAL" (E) / "...S.A" (F) |
| `%TEXT2` | `LV_LAND1 NOT IN ('SN','ZA','ZM','TZ') AND 1=2` | **disabled — dummy `1=2` clause** | static "DANGOTE CEMENT PLC" — voided, same pattern as YMMGRNNOTE's `%CONDITION4`/`%CONDITION6` |
| `EXCP_SN_ZA_ZM_TZ_COUNTRY` | same NOT-IN list `AND 1=2` | **disabled — dummy** | static "DANGOTE CEMENT LIMITED" — voided |
| `ZM_COUNTRY` | `LV_LAND1 NOT IN ('SN','ZA') AND LV_LAND1 = 'ZM'` | live | **dynamic**, `&WA_ADRC-NAME1&` — the real resolved company name via the `%CODE3` DB lookup chain (`IT_FINAL→WA_T001K→WA_T001→WA_ADRC`, already in `GLOBAL_DATA`/needs its own `CL_FP_CODING` replication — see `DEP-YMMISSUERES-07`) |

No dedicated `TZ`-specific branch was found — `TZ` only appears inside
the two now-*disabled* dummy conditions' exclusion lists. With those
voided (matching this project's own established precedent — YMMGRNNOTE's
user explicitly confirmed dummy-clause branches are excluded from
design), there is currently **no live branch at all for `TZ`** in the
legacy form itself — a genuine gap in the source, not something to
silently patch; flagged as `DEP-YMMISSUERES-08`.

**Adobe design decision, following the exact precedent already
approved for YMMGRNNOTE** (`docs/legacy_grab/ymmgrnnote_post_implementation.md`
§"keep every conditional branch visibly annotated until approved"):
bind the company-name line to **`WA_ADRC.NAME1`** (the always-real,
dynamically-resolved company name — not just Zambia's fallback, but a
generically correct value for any plant once `%CODE3`'s DB lookup runs)
instead of building the full static per-country text switch. This
requires `%CODE3`'s literal lookup chain to be replicated into
`CL_FP_CODING`/`INITIALIZATION` (its own `PLIST` already shows the
exact inputs: `IT_FINAL`, `WA_FINAL`, `WA_T001`, `WA_T001K`, `WA_ADRC`)
— not yet done, tracked as `DEP-YMMISSUERES-07`. The full 3-way static
branding (`ZA_COUNTRY`/`SN_COUNTRY`/the voided fallbacks) stays
annotated-but-unbuilt pending business sign-off, exactly like
YMMGRNNOTE's own deferred branding.

**`%WINDOW2` rows 2-3 — unconditional, no branching:**
- Row 2 (`%TEXT3`): plant name, dynamic `&iv_plant_name&` — always
  shows, bind directly to `IV_PLANT_NAME`.
- Row 3 (`%TEXT4`): static title "STORE ISSUE RESERVATION" (both E/F) —
  always shows, plain static text.

**`%WINDOW3`/`%WINDOW5` ("Details", non-ZA/ZA) — confirmed IDENTICAL
content**, not a genuine content branch (re-scanned both in full: same
7 fields/labels, word-for-word). Build this **once**, not as two
conditional variants — a real simplification versus the original
assumption. Fields (`%TEMPLATE1`/`%TEMPLATE4`, bound to `WA_HEADER`
via the `%LOOP1`/`%LOOP2` header loop):

| Label | Bound to |
|---|---|
| Reservation No: | `WA_HEADER-RSNUM` |
| Maint Ord No: | `WA_HEADER-AUFNR` |
| Department: | `WA_HEADER-INGRP` |
| Section: | `WA_HEADER-VAPLZ` |
| Date: | `WA_HEADER-RSDAT` |
| S.I.R raised by (Name): | `FINAL_NAME` |
| Signature of the Head: | *(label only, print-only blank line)* |
| (User Department) | *(label only, print-only blank line — appears again in `%WINDOW4`, a distinct second occurrence, not a duplicate to collapse)* |

`INGRP` (planner group) and `VAPLZ` (work center) are labeled
"Department"/"Section" respectively in the UI text — preserved exactly
as evidenced, a legacy labeling choice, not a data-mapping error.

**`%WINDOW4` ("Date and Signature") — separate footer block**,
`%TEMPLATE3`, 3 columns (4.29/6.11/8.23cm, total 18.63cm):
"Name and Signature of the Issuer" label + a literal underscore line
(`______________________________`, the legacy form's own convention —
rebuilt as a bottom-border draw per `S07` §7, not underscores) and a
second, distinct "(User Department)" blank label line.

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
