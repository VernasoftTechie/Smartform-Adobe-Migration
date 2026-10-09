# Migration Status — ZMMCG_PO_SF

STATUS: waiting_manual
UPDATED: 2026-10-09T11:30:47.993Z
WAITING_ON: operator
NOTE: Layout step 1 (page + header blocks) pushed - pull onto ZMMCG_PO_SF_ADT, activate, open the Layout and preview with 3 purchase orders (types ZPOT, ZPOL and any other), then confirm or report exactly what you see.
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

## 2026-10-09T11:14:51.678Z — Manual activity confirmed
Client confirmed the manual step is done.

## 2026-10-09T11:16:40.387Z — Context tree built
Checked the branch first: your push (`3130234`) holds the form `src/zmmcg_po_sf_adt.sfpf.xml` wired to `ZMMCG_PO_SF_INT` with an empty Context - exactly the safe starting point. The layout file (`.sfpf.xdp`) is byte-for-byte what SAP generated; I did not touch it. I built the Context on top of the form file and pushed it there.

**What is bound (81 nodes).** Only what the form prints, plus the few flags the layout needs for its conditions:
- Scalars (24): `V_EBELN`, `V_BSART`, `V_FLAG`, `V_POTEXT`, `V_WAERS`, `LV_FLAG`, `GV_LANGU`, `V_DEPARTMNT`, `G_ERNAME`, `V_BUYERTELE`, `V_BUYERTELFX`, `V_BUYEREMAIL`, `LV_VTEXT`, `GV_INCO1`, `GV_INCO2`, `V_EMAIL`, `LV_RESWK`, `LV_LAND`, `LV_LIFNR`, `LV_VAR4`, `PODATE`, `EINDT`, `LV_KTEXT`, `LV_AMT_WORDS`.
- Structures: `WA_VEND` (8 address fields), `LS_ADRC` (10 fields: the supplying plant for stock transfers), `GS_PRINT` (3), `GS_TOTALS` (8).
- Repeating tables: `LT_ADRC` (TDLINE - plant address text), `LT_LINES` (TDLINE - header text), `GT_GOODS` (7 columns), `GT_SERVICE` (7 columns).
Left out on purpose: `IT_EKPO` / `IT_ESLL` (the layout prints the prepared tables `GT_GOODS` / `GT_SERVICE` instead), every amount/quantity field (the values are prepared as text, so no reference fields are involved), and everything the legacy form never printed.

**Checks run here:** Context graph consistent (every parent/child/successor/condition link resolves, no duplicate ids), strict XML parse OK, `sfp_check context`: 0 fail, 0 warn, 10 passed.

**Unconfirmed in SAP:** this is 81 nodes; the largest Context proven so far is 14 (ZMM_PO_DEMO imported clean) and 24 (ZFING_CUST_ACT_SUM, still unconfirmed). The loops over global tables follow the ZMM_PO_DEMO shape that imported clean.

## 2026-10-09T11:16:41.388Z — Action needed from you (SAP)
1. In abapGit pull this branch (vernasofttechie-zmmcg_po_sf) onto form **ZMMCG_PO_SF_ADT** (only the form file changed).
2. Open the form in SFP and check the Context tree: 81 nodes - the 24 scalars, the structures `WA_VEND`, `LS_ADRC`, `GS_PRINT`, `GS_TOTALS` with their fields, and the tables `LT_ADRC`, `LT_LINES`, `GT_GOODS`, `GT_SERVICE` with their columns. No deserialize error.
3. Do not add or move anything in the Context. If it imports clean click "I've done this - confirm" and I start the layout. If SAP throws an error, use "Report a problem" with the exact message.

## 2026-10-09T11:22:15.071Z — Manual activity confirmed
Client confirmed the manual step is done.

## 2026-10-09T11:30:46.993Z — Layout step 1 built (page and header blocks)
The Context imported cleanly, so the layout has started. This first step is **only the A4 page and the header blocks**; the items table, totals, terms and watermark are the next steps (each is tested in SAP before the next is added). It is in `src/zmmcg_po_sf_adt.sfpf.xdp`, built on the page SAP generated for you; nothing outside the page body was changed.

**What is in this step (legacy window -> layout, positions read from your export)**
- **Page:** A4 portrait (legacy DINA4); the SAP baseline was Letter.
- **Logo** (window LOGO, 2.80 x 2.23 cm): the SE78 graphic `DANGOTE LOGO WHITE`, referenced by name from the graphics repository.
- **Title and PO number** (window PO_HEADING): the title text depends on the order type exactly as in the Smart Form - ZPOR Release Order, ZPOC Cash Purchase Order, ZPOL Bon de Commande / Local, ZPOI Import Purchase Order, YCAP Capex Purchase Order, YRAW Purchase Order, ZPOS Service Purchase Order, ZPOT or ZPIC Stock Transfer PO (any other type prints no title, as in the legacy form) - then the PO number.
- **Plant address box** (DELVRY_ADD, bordered): the address text lines (`LT_ADRC`), one per row.
- **Last Changed On** (PO_LAST_CHANGED).
- **Supplier block** (SUPPLIER_ADD): 13 label/value rows. For a stock transfer (ZPOT) it shows the supplying plant (`LS_ADRC`, `LV_RESWK`, `LV_LAND`) with its own labels; for every other type the vendor (`WA_VEND`, `LV_LIFNR`, country, phone/fax with the ISD prefix, e-mail). Labels are English, and French for ZPOL, as in the legacy form.
- **PO detail block** (PO_DETAIL): PO Date, Delivery Date, Department, Buyer Name, Telephone, Fax, Email, Payment Terms, Inco Terms, Additional Comments (label only - the legacy value is an empty text); French labels for ZPOL.
Every value is bound to the Context you confirmed (42 bindings, all resolve).

**Where I had to depart from the legacy positions - please check these in the preview**
1. The whole header is moved 0.25 cm right and 0.10 cm down so no element is closer than 1 cm to the paper edge (project margin rule). Legacy had the plant address box ending 0.14 cm from the right edge and the PO detail block 0.80 cm.
2. Because of that the plant address box is **5.02 cm wide instead of 6.13 cm** and the PO detail value column is 5.4 cm instead of 5.8 cm. Long address lines will wrap or be cut in the 0.45 cm rows - tell me if any address line is cut.
3. Row height in the supplier and detail blocks is 0.5 cm (the Smart Form's templates size rows by their text; 13 rows must end above the items table at 13.5 cm, which allows at most 0.53 cm). Long values (street, e-mail) are single-line and may be cut.
4. The two parts of the Inco Terms value (`GV_INCO1`, `GV_INCO2`) sit side by side in two boxes instead of one text with a space.

**Not evidenced - Arial placeholders / guesses (Developer Extension Points)**
- Fonts: the SmartStyle definitions (`ZWSA_COMMON_STYLE`, `ZMM_PURCHASE_REQ`, `YMM_PO_STYLE`) were not supplied. I used Arial 8 pt for labels/values (labels bold) and 14 pt bold centred for the title - **a guess, not read from your style**. Please download the three styles (SMARTSTYLES > Utilities > Download) and add them under "SmartStyle exports" in Configure, or tell me font, size and alignment of paragraphs HP, P1, P6, P2, P3, P8, PQ.
- Title/PO-number row positions (0 and 1.6 cm in the heading box) are my estimate of the legacy three-line template.
- The French variants the Smart Form selects with the *login language* on non-ZPOL types (the "also in F" translations) are **not** reproduced; only the explicit ZPOL (French) and ZPOI (English) variants are. Tell me if French is also needed for other types.
- Draft window (condition `1 = 2`) and the legacy address text switched off by `1 = 2` are left out.

**Unconfirmed in SAP - treat as unproven**
- The logo reference (`.../bmap/bcol/DANGOTE%20LOGO%20WHITE.bmp`): the graphic name contains spaces, no earlier form had one. If the logo does not show, report it.
- Show/hide of the label sets and titles by order type uses the same script pattern as the earlier watermark (rulebook 8.9), now with 14 scripts.

**Checks run here:** strict XML parse OK; nothing outside the page body differs from your SAP baseline; margins >= 1 cm; all 131 elements inside their parents; explicit x/y everywhere; all 42 bindings resolve. The checker still **FAILS on completeness (40 printed fields and 143 texts not yet in the layout)** - that is the items table, totals, terms and watermark, which are the next steps - and warns about the two width changes above.

## 2026-10-09T11:30:47.993Z — Action needed from you (SAP)
Please do these in SAP, in order:
1. In abapGit pull this branch (vernasofttechie-zmmcg_po_sf) onto form **ZMMCG_PO_SF_ADT**, then activate it. Note the activation result.
2. Open the Layout. You should see an A4 portrait page with the logo, title area, plant address box, supplier block and PO detail block. Report any warning/overflow badges.
3. Preview with real purchase orders of three kinds: a stock transfer (ZPOT), a local order (ZPOL, French labels) and any other type. Check the title, the supplier block (vendor vs plant), the PO detail values, the address box, and whether the logo shows.
4. If you change anything in Designer, push it back and tell me - I compare every Designer save with this version before building on it.
5. If it looks right, confirm. If anything is off, tell me which block and what you see (a screenshot helps).
