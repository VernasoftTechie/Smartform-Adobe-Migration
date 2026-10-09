# YMM_PO_SMARTFORM_INT — Initialization design notes

Source of every statement: `ymm_po_smartform.xml` (legacy export), read via
`YMM_PO_SMARTFORM_extract.{md,json}`. The full Initialization is also kept as plain ABAP in
`ymm_po_smartform_initialization.abap` (same text as in `src/ymm_po_smartform_int.sfpi.xml`).

## Why there is print-data code in the interface

The legacy form computes values in program-lines nodes while it prints (per table row, per
item-text loop, per footer). An Adobe Context can only hold scalars, structures and table loops
(S04), so none of that can run at print time. Every such value is therefore computed once in
Initialization into flat tables the Context/layout loops over. The statements are the legacy
ones; only the wrapping loops are new.

## Node disposition (171 program-lines nodes)

| Legacy node(s) | Where | Treatment |
|---|---|---|
| GLOBAL INITIALIZATION | Initialization (1) | verbatim |
| `%CODE95` (COMPANY_NAME), `%CODE146` (V_DATE), `%CODE24` (PR_DETAILS), `%CODE171` (PO_DETAILS), `%CODE84` (header texts F01-F16) | Initialization (2) | verbatim, unconditional and order-independent |
| `%CODE126/127/128` (header text chunk loop, `*` removal) | (3a) | `*` removal kept; the 100-line chunk loop is not carried (see D1) |
| `%CODE1/6/22/25/14`, footer `%CODE85` (EKPO table, V_FLAG = X) | (3b) | verbatim statements inside `LOOP AT it_ekpo`; `lv_name` renamed `lv_matname` in `%CODE6` (collides with `%CODE84`) |
| `%CODE3/23/94/8/27`, footer `%CODE86` (ESLL table, V_FLAG = Y) | (3c) | verbatim statements inside `LOOP AT it_esll`; `%CODE7` not carried (sets only GV_TEXTNAME, which no text node prints) |
| `%CODE101/129/133/137/141` + `%CODE102..` chunking + `%CODE64..68` + `%CODE104/132/136/140/144` | (3d) | one loop over text ids F01-F05, same statements (see D2, D3) |
| `%CODE147` (V_FLAG = X), `%CODE145` (V_FLAG = Y) | (3e) | verbatim, wrapped in `IF v_flag` as the legacy alternatives were |
| `%CODE89` (loop IT_EBAN, only if V_FLAG = X) | (3f) | verbatim inside the same loop/condition |
| `%CODE21` (watermark) | layout | not carried: `%CODE95` later overwrites `LV_FLAG`, which would change the watermark. Layout tests `IV_REL_INDICATOR` = R or A (the condition of `%CONDITION127` is `LV_FLAG = 'Y'`) |
| All nodes under `1 = 2` conditions, and the whole page-2 main window (`%WINDOW7`) tree | not carried | dead branch / unexecuted copy (see Q1) |

## New interface elements (deliberate additions, none in the legacy contract)

Types `ty_s_head_out/ty_t_head_out`, `ty_s_item_out/ty_t_item_out`, `ty_s_itxt_out/ty_t_itxt_out`
(sorted tables, unique key `idx`). Globals: `GT_HEAD_OUT`, `GT_EKPO_OUT`, `GT_ESLL_OUT`,
`GT_ITXT_OUT`, `GV_EKPO_TOTAL_TXT`, `GV_ESLL_TOTAL_TXT`. Numbers are written as text with
`WRITE ... TO` (same formatting as the Smart Form text nodes), so no QUAN/CURR reference fields
are needed.

## Deviations from "legacy verbatim" (listed, not silent)

- D1 Header texts: the legacy chunk loop prints `round(lines/100)` x 100 lines, so with 101-149
  lines (also 201-249, ...) it silently drops lines. Here every line is printed.
- D2 Item texts: same 150-line chunking not carried (same truncation effect, same reason).
- D3 Item-text block: `INSERT ... INDEX 1` re-written as `MODIFY ... INDEX 1` (ABAP standard: no
  INSERT), five copies merged into one parameterized loop; the five legacy nodes were diffed and
  differ only in text id, flag variable and heading text.
- D4 `%CODE6`: variable rename only.
- Carried legacy code keeps its original style (lower-case keywords, old-style SELECT, header
  line table in `%CODE6`); new code follows the DIL naming/7.4+ standards.

## Unconfirmed / open (stated to the client in the status file)

- Q1 Page 2: its main window has its own copy of the item tables and terms; printing both would
  double the output, so the page-1 `MAIN` tree is treated as the only live flow. Needs a
  multi-page legacy PDF to confirm.
- Q2 `tdformat`+`tdline` are concatenated as the Smart Form prints them; whether the Smart Form
  trims the trailing blank of `tdformat` is not provable from the export.
- Q3 Fonts: `YMM_PO_STYLE`, `SYSTEM`, `YMMDRAFTSTYLE` definitions were not supplied (Developer
  Extension Point); `ZMM_PURCHASE_REQ` is in the global library.
- Q4 French (F) texts exist on the form; Adobe translation handling is not decided.
- Extractor gap: the tree view omits an alternative node's own condition (`%CONDITION127`).
- The Initialization ABAP has not been compiled; the first activation is the real syntax check.
