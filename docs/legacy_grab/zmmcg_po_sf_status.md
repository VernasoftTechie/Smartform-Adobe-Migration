# Migration Status — ZMMCG_PO_SF

STATUS: waiting_manual
UPDATED: 2026-10-09T09:10:50.199Z
WAITING_ON: operator
NOTE: Interface pushed - in SFP create the EMPTY interface ZMMCG_PO_SF_INT and form ZMMCG_PO_SF_ADT (package ZAB_ADOBE), pull this branch onto them, activate the interface and tell me if SAP reports any error (exact message), then Stage/Commit/Push both objects back to this branch.
STOP: none
CLAIMED_BY: Window-3

---
## 2026-10-09T05:54:45.199Z — Queued
Migration submitted with 4 reference file(s).

## 2026-10-09T08:51:01.583Z — Picked up
Window-3 picked this migration up.

## 2026-10-09T09:10:49.199Z — Interface prepared
The form interface for ZMMCG_PO_SF has been prepared from your reference export and saved on this branch (`src/zmmcg_po_sf_int.sfpi.xml`, for interface `ZMMCG_PO_SF_INT`; the Adobe form will be `ZMMCG_PO_SF_ADT`).

**Carried over unchanged - the contract your driver sees**
- All 61 form parameters of the legacy interface (V_COMPANY_NAME ... V_POTEXT, same types, same optional flags) and the 4 tables (IT_EKPO, IT_ESLL, IT_EBAN, LT_ADRC). The standard SSF envelope parameters and the exceptions are left out on purpose - SAP creates its own equivalents and drops hand-written ones.
- The 97 global fields and the form's own type `GTY_ADRC`. One necessary change: the legacy form declared three globals (IT_RTEXT, IT_HEAD_TXT, LT_LINES) as "table of TLINE"; an Adobe interface declares that in the Types tab, so `TY_TLINE_TAB` was added and those three use it. Nothing about the data changes.
- Driver: `ZCGMMPOP001` (NACE output type ZCGO, application EF) calls this form - its source holds the form name `ZMMCG_PO_SF` as a constant. It stays untouched.

**The main design point: where the form's program code goes**
The Smart Form runs 36 "program lines" nodes at different print points - per window, per item row, in the totals block. An Adobe form has no code at those points, only one Initialization that runs before the layout. So **33 of the 36 nodes are now in the interface's Initialization tab** (about 940 lines), in the order the Smart Form ran them, copied line for line from your export. The other 3 (%CODE10, %CODE14, %CODE18) never ran in the legacy form: they sit inside branches switched off with `1 = 2` / `2 = 3`. They are not carried.

Because per-row code cannot run inside the layout, Initialization prepares the item rows and the totals exactly the way the Smart Form printed them (same variables, same formatting: your decimal notation, unit-of-measure conversion, the XOF/XAF whole-number handling, the rules per order type). This adds five fields to the interface; the caller contract is unchanged (the driver passes exactly what it passes today):
- `GT_GOODS` - one line per goods item: serial no., material, description (with the material long text), quantity, unit, unit price, total.
- `GT_SERVICE` - the same for service orders (service no., description, quantity, unit, unit price, total).
- `GS_TOTALS` - the footer amounts (discount, freight, other charges, sub total, VAT, CA, total; Gross Price for service orders).
- `GS_PRINT` - supplier country in the print language, supplier phone and fax with the ISD prefix (the Smart Form composed these inside text nodes).
- `GV_LANGU` - the print language, for the layout's language switches.
Since the layout will print these text values, **no currency/quantity field is bound anywhere, so no reference fields are needed** (the file has none).

**Every change to legacy code (also marked "BOLT:" in the code; full copy in `docs/legacy_grab/ZMMCG_PO_SF_initialization.abap`)**
- 7 debugger statements are not carried (`break abap1` x6, `BREAK MOCHEJE` x1; in %CODE11, %CODE85, %CODE23, %CODE8, %CODE24, %CODE31, %CODE12).
- The nodes each declared their own local variables; in one Initialization they would clash, so they are declared once at the top. Two nodes declared the same name with different types (`lv_amt_i`: int8 in the goods "total in words", int4 in the service one); the service one is renamed `lv_amt_is` so each keeps its own type.
- The two date nodes shared local names; the variables are cleared between them, as a fresh node would have had them. Accumulators and flags the Smart Form relied on starting empty (item counter, running net value, approved flag, totals) are cleared at the start.
- Nothing else in the legacy logic is changed and it is not modernised (old statement styles, SELECT without @, mixed case are as in your export). The code I added is new and follows the project standards (7.4 syntax, DIL names, explicit SORT).

**Checks run here (tools/sfp_check):** 0 failures, 305 passed, 38 warnings. The warnings, all intentional:
- 5 = the five added fields above;
- 1 = Initialization is longer than the legacy one-line global initialization (expected: it is composed as described);
- 36 = the program-lines nodes are not "declared as carried" because they were composed rather than copied wholesale: 33 are carried, 3 are not (never ran).
The file also parses under a strict XML parser; every parameter, global and type matches the export.

**Not confirmed until it is in SAP - please treat as unproven**
1. The size of the Initialization: about 940 lines with item loops, text reads and function calls. The largest earlier one in this project is 45 lines (YMMGRNNOTE). Nothing here has been compiled outside SAP; if activation shows a syntax error, send the exact message and line.
2. 11 globals are typed `P DECIMALS 0` as in the legacy form; earlier forms only had types like `C LENGTH 10`.
3. The display tables are `STANDARD TABLE ... WITH DEFAULT KEY` (same shape as ZMM_PO_DEMO's tables) with an explicit SORT.

**For later (not blocking this step)**
- The SmartStyle `YMM_PO_STYLE` is not in the global SmartStyle library. For exact fonts please download it (SMARTSTYLES > Utilities > Download) and add it under "SmartStyle exports" in Configure; until then the layout uses Arial placeholders.
- The Smart Form switches texts and units on `SY-LANGU`, and the driver sets French for ZPOL/ZPOS and English for ZPOI. The Adobe form may not receive the print language the same way - when we get to the preview, please check a ZPOL order prints French dates, units and country names.
- Several parts of the legacy form are switched off with `1 = 2` (the draft window with the DRAFT image, older terms and conditions texts, signature texts, the insurance row, the legacy address text). I will leave them out of the layout unless you tell me otherwise.

## 2026-10-09T09:10:50.199Z — Action needed from you (SAP)
Please do these in SAP, in order:
1. In transaction SFP create the Adobe form interface **ZMMCG_PO_SF_INT** and form **ZMMCG_PO_SF_ADT** (package ZAB_ADOBE). Leave the form empty - this is the safe starting point.
2. In abapGit, pull this branch (vernasofttechie-zmmcg_po_sf) onto them. Check the interface shows the 61 parameters and 4 tables, the Types tab shows `GTY_ADRC`, `TY_TLINE_TAB` and the `TY_S_*` / `TY_T_*` types, Global Data has 102 entries, and the Initialization tab starts with `SORT IT_EKPO ...` and ends with the `CONDENSE: gs_totals-...` line. No deserialize error.
3. Activate the interface. If SAP reports any error in the Initialization, **do not push** - use "Report a problem" and give the exact message and line.
4. Do **not** drag anything into the form's Context yourself. I build the Context here from the real SAP-generated form once you push it.
5. In abapGit do Stage, Commit and Push **both** the interface and the (empty) form back to this same branch.

When it is done click "I've done this - confirm" below. If anything fails, use "Report a problem" and give the exact message.
