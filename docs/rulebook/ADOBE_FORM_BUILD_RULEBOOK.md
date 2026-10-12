# Adobe Form Build Rulebook (v2) — how every window builds a form that the client accepts the first time

**Status:** binding for every window, every ticket, every AI model, from 2026-10-12. Written after three rejected builds of
`ZMMCG_PO_SF_ADT` (Window-3) and the parallel work of Window-4 (`ZMMET_PO_SF_ADT`), on the user's instruction to "build a strong
rulebook for 100 % accurate results". It consolidates and, where they disagree, **supersedes** the strategies S01-S10, the Bolt
rulebook sections 5-8, and the runbook notes (the conflicts are resolved in section 12). `docs/rulebook/WINDOW_START_GATE.md` is the
entry gate: no window claims a ticket before it has been read to the end.

**Mission.** Deliver, for every Smart Form, an Adobe form that (1) prints **exactly what the legacy form prints** — every text, every
condition, every position to 0.15 mm, every page — (2) is **readable and maintainable** for the client's developers in the Designer, (3)
follows the company's **ABAP standards**, and (4) is **proven by evidence**, not by assertion. Beautification, new features and
"futuristic" improvements (section 7) come only **after** the client has signed off parity, and only as proposals the client chooses.

**Priority order when rules collide:** business correctness of the legacy output > the client's reference material (wizard form of the
same form, legacy printout) > this rulebook > the strategies > any generic design advice (including
`instructions/ADOBE_FORMS_DESIGN_MASTER_RULEBOOK.md`, which never restyles a form in flight).

---

## 1. The operating rules in ten lines (read these even if you read nothing else)

1. **Never claim "done".** Only the client's SAP result in the status file closes a ticket. Structure checks are necessary, never sufficient.
2. **Ask for the evidence first** (section 2): the wizard form of the same Smart Form, a legacy printout per order type, the SmartStyles. Without
   them you build on assumptions and the client rejects the build.
3. **Numbers come from the form's own evidence** (wizard form of the SAME form, printout), never from a sibling form, never from font metrics, never by eye.
4. **One generator from the export**, nothing typed by hand; a rerun reproduces the committed files byte for byte (check 9).
5. **Business logic lives in ABAP** (the Initialization prepares every variable text and value); the layout binds, positions and hides. Fewer scripts is better.
6. **Default visible, hide on `ready`**; never hidden by default. The Design View must be readable (default texts, no stacked variants of scripts).
7. **ABAP we write follows the company standard** (DIL naming, 7.4+ syntax, no INSERT / INTO CORRESPONDING) and is **interpreted and linted** before it is pushed; legacy code stays verbatim.
8. **Run the ten re-check passes (section 8) before every commit and before every hand-off.** Any failing pass blocks both.
9. **Say what only a render can prove** and ask the client to look at exactly that. Never hide an unproven assumption.
10. **Every lesson goes to `main` the same day** (strategy, build-issues log, this rulebook if it changes a rule); every window reads before it starts.

---

## 2. Intake: what to ask the client before building (put it in the first status entry)

| # | Evidence | Why | If missing |
|---|---|---|---|
| 1 | **The wizard-generated form of the same Smart Form** ("Create Adobe Form by Migration": SFPF xml + XDP) | positions, insets, heights, fonts, alignments that reproduce the legacy output in the client's Adobe (S10) | build from the printout; mark every number "unproven" |
| 2 | **A legacy output PDF per order type / variant** (goods, import, local, service, stock transfer, special) | ground truth for positions, wording, numbers, page breaks (`tools/pdf_probe.mjs`) | only the supplied variants are verified; say so |
| 3 | SmartStyle exports (or font, size, alignment of every paragraph / character format) | fonts and indents | take them from (1) and mark them |
| 4 | Number notation and the languages to print, per order type; how the print language reaches the form | `1,00` vs `1.00`; French / English rule | reproduce the legacy rule, flag it |
| 5 | Standard texts (names, ids, languages), text modules, graphics (SE78) | include texts and logos the export does not carry | fallback with an extension point |
| 6 | The driver program's call (read only) and a real document number per type | to test, not to modify | — |
| 7 | Decisions: one wording or every type / language? parts the legacy switched off (`1 = 2`)? | one-wording forms are plain static text; all variants need prepared data / scripts (S10 section 11) | ask, never assume |

For every reference form the user collects (medium / high complexity, other purposes) register it in `docs/reference_forms/` (section 3).

---

## 3. Complexity classes and what each requires

| Class | Signals | Plan | Extra evidence / gates |
|---|---|---|---|
| **A simple** | static header, one item table, fixed footer, ≤ 2 pages, ≤ 10 scripts | positioned header block + one flowing table; terms as prepared data | wizard form + one printout |
| **B medium** | several variants by type/language, conditional blocks, running totals, multi-page, 10-40 scripts | A + prepared-data blocks (terms, titles, totals), table per repeating block, `ready` hides, condition truth tables | printout per variant, the ten passes, the Design View screenshot review |
| **C complex** | nested tables, many variants, barcodes / QR, signatures, several languages, > 40 scripts, ≥ 3 pages | B + generator, simulator, interpreter for the scripts and the generated ABAP, staged increments with client previews | all of B + phased hand-offs (header → table → footer → terms), reference forms registered, comparison log |

Run `node tools/ref_form_probe.mjs <xdp>` on every reference and on your own output; compare script counts, table counts and features.
Rule of thumb: a one-case wizard form has ~2 scripts; if yours has 60+, ask the client whether every variant is needed before building scripts.

**Reference forms (`docs/reference_forms/`).** One row per form the user sources: purpose, class, constructs it demonstrates (probe output), files, whether it
renders in the client's SAP (`proven`), what we may copy (constructs, never numbers). A construct becomes a strategy only after it is `proven`.

---

## 4. Interface, Context and ABAP rules

**Naming (company policy "ABAP Naming Standards — DIL").** `gv_ gt_ gs_ gc_` globals, `lv_ lt_ ls_ lc_ lo_ lr_` locals, `<lfv_ lfs_ lft_>` local field symbols,
`iv_ is_ it_ ev_ es_ et_ cv_ cs_ ct_ rv_ rs_ rt_` parameters, `ty_` types. Legacy names inside re-hosted legacy code stay (verbatim, diffable).

**ABAP 7.4+ wherever possible:** inline declarations, string templates (never `CONCATENATE`), `VALUE #( )`, `COND`/`SWITCH`, table expressions, `lines( )`, `@`-SQL.
No `INSERT` (MODIFY / APPEND for internal tables), no `INTO CORRESPONDING FIELDS OF`, no `MOVE`, `CALL METHOD`, `DESCRIBE TABLE`, `READ TABLE ... INTO` in new code.
Display tables that must keep an order are standard tables with explicit `SORT` where the order is a key; otherwise sorted types.

**Legacy code is verbatim** (Initialization re-hosts program-lines nodes; every change is marked `BOLT:` and listed in the post-implementation notes). New code follows the standards.

**Prepared-data principle** (confirmed by the client's own forms: the invoice forms prepare their data in 1600-2700 Initialization lines with 7.4 inline declarations and TVARVC configuration, `docs/reference_forms/README.md`). Everything that varies by order type, language, currency or data volume is decided in the Initialization and handed to the layout as
data: titles, headings, terms (`GV_TERMS_TITLE` + `GT_TERMS`), formatted amounts and quantities (through `WRITE ... TO` so conversion exits apply), converted keys
(ALPHA, MATN1, unit text), joined standard texts (SAPscript paragraph rules). The layout then needs no condition for them.

**Generated ABAP is tested before it is pushed**: a tool interprets it for every environment (`abap_terms_sim.mjs` pattern: order type × flag × language) and
compares the result with the legacy export read by a separate reader; `abap_lint.mjs` checks naming and forbidden statements; text literals are chunked below 255
characters; string-template specials (`| { } \`) are escaped. State plainly that the code has **not been activated** until the client reports the activation.

**Context.** Flat data nodes (`NAME` = field with `-` → `_`, `GENERATED = X`), table loops with their columns; nothing unused; every layout bind resolves (check 10).

---

## 5. Layout engineering rules

### 5.1 Geometry model (calibrated, S10)
* First baseline = **cell top + top inset + 0.717 em** (Arial; 9 pt 2.28 mm, 11 pt 2.78 mm, 18 pt 4.55 mm), independent of the line height. Inset of a cell = legacy baseline offset − 0.717 em.
* One-line cells: **fixed height**, top inset from the rule (9 pt: 1.122 mm), no line height, `<textEdit/>`. Cells that may wrap: `minH` = row height with a **fitted line
  height** (`row height − top inset`) or the legacy pitch with compensated insets; growing cells are listed as "unproven first baseline" in the status entry.
* Heights and pitches come from the template (`STATLINES`), the wizard form and the printout (13 grid rows = 61.0 mm, not 4.70 × 13), not from window sizes.
* Positions are absolute page coordinates compared at 0.15 mm (`conformance.mjs`, `simulate.mjs`).
* Texts that the legacy places by template line (title above the window) go into the parent block at `baseline − 0.717 em`.
* Window border flags of the export are **not printed**: no frames, no boxes. The outer lines are left / right edges of the rows (line-type `CELLS/BORDERS`); rows without printable text have no height and no border.
* Border edge order is **top, right, bottom, left**; 0.75 pt; grey label fill 176,176,176 from the legacy cells.
* Fonts from the wizard form of the same form (Arial 9/11/18, Courier New 12 grey watermark); the master rulebook's Helvetica / blue palette is **not** applied.

### 5.2 Structure
* Page 1 content area as the wizard form (ZMMCG: x 7.5, y 0, 202 × 290 mm); the header is one `position` block at absolute legacy coordinates; flowing content (`layout="tb"`) below it.
* Tables are XFA table layout: `columnWidths` from the line type, heading row `TH` repeating (`occur max=-1`) with `<overflow leader="HeaderRow"/>` **on the table**, data row `TR` bound `$.DATA[*]`, `occur 0..-1`.
* Page 2 = the legacy continuation window; the row split at the page break is Adobe's decision — say so.
* Watermark and logo are page-area objects; the watermark text comes from data.
* Variant blocks: prefer **prepared data** (one table filled by ABAP) over stacked scripted variants; where two position grids must share a place (stock transfer / standard), only the one live for the sample carries default text.

### 5.3 Conditions (hierarchy, best first)
1. The **data decides** (prepared table empty → nothing prints; bound table `occur min=0`).
2. One `ready` event per block: `if (not (cond)) then $.presence = "hidden" endif` (default visible; never hidden by default).
3. A computed field (`calculate`) only for a text that varies and cannot be prepared — with a **default text equal to the sample document's wording** so the Design View is readable.
4. Never read conditions from window flags or by eye; read them from the export (section 6).
Target script counts: class A ≤ 10, B ≤ 40, C: every script justified; compare with the sibling forms (`ref_form_probe.mjs`).

### 5.3a Legacy construct → layout pattern (S12)
Before designing, fill the **conversion map** of [S12](../strategy/S12_legacy_construct_to_adobe_pattern_catalogue.md) section 4: every legacy page / window / template / table / loop / alternative / graphic / command gets a pattern id (P01-P26) with its evidence, or becomes a client question with a proof test. No layout object is drawn without a map row.

### 5.3b Proven client techniques to prefer (S11)
Before building a script: (1) wording that depends on language / type → **labels as data** (`GS_LABELS` from the label utility, `$.GS_LABELS.LB_X`), (2) block that depends on data → **Context condition** or an empty bound table, (3) page numbers / QR / zebra → `$layout` ready and `indexChange` patterns, (4) logos → BDS graphic at run time, (5) fixed standard texts → text-include Context node. Every technique carries its proof test (S11 section 11).

### 5.3c Hard limits and defaults that cost an import (F84, F86)
* **SFP Context node names: at most 30 characters.** A flattened name such as `GS_LABELS_LB_<scope>_<name>` exceeded it and abapGit failed with "SFPF deserialization error: Invalid request" on the whole form. Name a label node like its component (`LB_...`); the generator must stop, and the verifier must fail, above 30 (mutation-tested on the failing commit).
* **Hide scripts on `ready@$form` run on the server** (`<script contentType="application/x-formcalc" runAt="server">`), as all 17 of the same kind in the client form `ZEZC_SD_INVOICE_IN_EMAIL`. A script without `runAt` is a client script.
* Every new generator feature that reads a legacy construct the model did not read before (alternatives, loops, commands) is first checked against the raw XML by an independent reader (pass 5), because the shared model silently returned "no condition" for alternatives.

### 5.4 Design View readability (client deliverable)
Labels visible (static text or default text), no overlapping variant texts, one block per concept, sensible names (`TERMS_TITLE`, not `TEXT123`), no empty subforms, no unexplained zero-height rows.

---

## 6. Reading the legacy conditions correctly (each of these cost a rejected build)

* The logical operator (`AND` / `OR`) is an **item of its own before the operand it joins**; keep it (12 `OR`s of ZMMCG_PO_SF had become `AND`).
* Conditions are **cumulative** over ancestors (window, template, row, cell, text); `1 = 2` / `2 = 3` branches are dead and never built.
* **Alternatives** (node type `CD`) have a TRUE and a FALSE branch: the FALSE branch needs the negation.
* **Language:** the print language decides the static text variants (ZMMCG: French for ZPOL / ZPOS, English for ZPOI, otherwise the logon language; French falls back to English when the
  node has no F text); every legacy `SY-LANGU` condition is the **logon language**. Two variables, never one.
* Include texts (`TTYPE = I`), `/*` comment lines (never print), template line heights, line-type cell borders and fills are **not in the extract**: read the raw XML.
* Every environment is tested: order type × flag × language × currency × header text × Inco terms (`fc_sim.mjs`: 1152 environments).

---

## 7. Advanced Adobe Forms capabilities — when to use them, and under which proof

Parity first; these are proposals the client chooses after sign-off, each with its own preview test. Status: **proven** (renders in the client's SAP), **candidate** (documented, not yet proven here).

| Capability | Use when | Status / proof needed |
|---|---|---|
| XFA table layout, repeating header (`overflow leader`), growing rows | every item table | proven (ZMMET, ZMMCG wizard forms) |
| FormCalc `calculate` / `ready` hide | variable text, conditional blocks | proven |
| Data-prepared blocks (terms, titles, totals) | variants by type / language | candidate (ZMMCG terms, client preview pending) |
| **Labels as data** (`GS_LABELS`, optionally through `zcl_adobeform_utility=>get_header_labels`) | every multi-language / multi-type form | **proven in the client's `ZSDAF_V3_SEA001`; applied to ZMMCG_PO_SF_ADT 2026-10-12** (generated block, 54 labels, scripts 63 → 9; client preview pending); the utility needs the class and label table confirmed — S11 sections 1, 1b |
| **Context conditions** (`SFPCONDITION` on nodes), `subformSet relation="choice"` TRUE / FALSE | data-dependent blocks without scripts | **proven in `ZEZC_SD_INVOICE_IN_EMAIL`**; Context-side creation of TRUE / FALSE groups to be confirmed — S11 section 2 |
| Page X of Y (`xfa.layout.page(this)` / `pageCount()` on `ref="$layout"` ready) | long documents | **proven in `ZEZC_...`, `ZSDAF_V3_SEA001`**; legacy has none — S11 section 3 |
| Runtime graphics (`cl_ssf_xsf_utilities=>get_bds_graphic_as_bmp` + `CL_FP_GRAPHIC_CONTENT` + `imageEdit`) | logos, signatures | **proven in `ZSD_IVORY_FORM`, `ZSDAI_V3_CN0001`** — S11 section 5 |
| `CL_FP_TEXT_INCLUDE` Context node for standard texts | fixed standard texts | **proven in `ZSD_IVORY_FORM`** — S11 section 6 |
| Zebra rows (`indexChange`), `colSpan`, `lr-tb` flows, rich text with embedded fields | readability / mixed text | **proven in the costing / invoice forms** — S11 sections 4, 8 |
| `keep intact="contentArea"`, `overflow trailer="FooterRow"`, `break overflowLeader` | no split blocks, footers per page, leaders per page area | **proven in the client's forms** (`ZAF_PRE_ORD_COST_FORM`, `ZAF_INVOICE_CA`, `ZEZC_SD_INVOICE_IN_EMAIL`); changes pagination vs legacy — propose, never apply silently |
| Page X of Y, running totals per page, carried-forward totals | long item lists | candidate; legacy has none |
| Conditional page areas / master pages per order type | different letterheads | candidate; needs a real second letterhead |
| Barcode / QR (PO number, verification URL) | scan workflows | **proven in the client's own form `ZSDAF_V3_SEA001`** (`<barcode type="QRCode" errorCorrectionLevel="3" .../>` bound to a data node; layout-ready script hides it when the data is empty); not yet built by us |
| Translation through the SFP translation catalogue (`xliff:rid`) instead of per-label scripts | many languages | **proven: the client's forms carry 4-107 translation ids each**; prerequisite: client decides the language set; our forms do not use it yet |
| Number / date `<picture>` clauses (`num{z,zzz,zz9.99}`, `date{DD/MM/YYYY}`) or `de_DE` locale instead of prepared text | the client wants live reformatting | **proven in the client's forms**; the ZMMCG legacy prints prepared text (reproduced for parity) |
| PDF/UA tagging, PDF/A archiving, embedded font subsets | compliance | candidate; ADS configuration, client Basis |
| Digital signature fields, form version stamp | approval flows | candidate |
| Dynamic subform occurrence bound to data volume | blocks with variable rows | proven for tables; other uses candidate |

"Futuristic" improvements belong to a **phase 2 proposal** (status entry after sign-off): list 3-5 options with benefit, risk, test and effort; never mixed into the parity delivery.

---

## 8. The eleven re-check passes (ten of the checks plus the S12 conversion map) (before every commit, every hand-off, every "confirmed")

Run `node tools/zmmcg_po_sf/recheck.mjs <repo> <baseline.xdp>` (pattern; copy it to the ticket) — all eleven must pass (pass 11 exists from 2026-10-12; tickets older than that copy it in):

| # | Pass | What it proves | Tool |
|---|---|---|---|
| 1 | Structure | strict XML, binds resolve, FormCalc balanced, tables / leaders / borders / page areas, baseline untouched | `verify.mjs` |
| 2 | Interface parity | parameters, globals, types, Initialization verbatim vs the extract | `sfp_check interface` |
| 3 | Wizard-form conformance + coverage | every element of the same form's wizard XDP at absolute coordinates; every legacy text fragment (E and F) present | `conformance.mjs` + `verify.mjs` |
| 4 | Printout simulation | every predicted text baseline / anchor, line and grey box equals the legacy printout (2 pages) | `simulate.mjs` |
| 5 | Layout conditions | every FormCalc script run for 1152 environments equals the legacy export's live texts | `fc_sim.mjs` |
| 6 | Generated ABAP semantics | the terms ABAP, interpreted for 48 environments, equals the legacy terms | `abap_terms_sim.mjs` |
| 7 | ABAP standards | DIL naming, 7.4+, forbidden statements, line length | `abap_lint.mjs` |
| 8 | Condition reader | AND / OR operators of the raw export equal those the model reads | `recheck.mjs` |
| 9 | Reproducibility | regenerating changes no committed file | `recheck.mjs` |
| 10 | Context graph | nodes, parents, bound fields exist in the interface | `sfp_check context` |
| 11 | Conversion map (S12) | every legacy node (page, window, alternative, graphic, program lines, template, table, row, section, folder) has a map row with pattern id and status; every layout object the map names exists; every live program-lines node is in the Initialization, no disabled one is | `conv_map_check.mjs` (ticket copy) |

Mutation test every new checker once (break the code on purpose, see it fail) before relying on it. After the ten passes: read the generated layout once as a human
(Design View logic: labels, blocks, names) and list what only a render can prove. Record the run in the ticket's recheck log with the commit id.

The simulator's model (baseline 0.717 em, natural line 1.15 em, row-split behaviour) is calibrated from the wizard form and the printout; **it proves consistency with that model,
not Adobe's rendering**. The client's preview is the final check.

---

## 9. Status file, hand-offs and the client (condensed from the Bolt rulebook section 16)

* The status file is the only channel to the client; `WAITING_ON: operator` means do nothing until the client's confirmation entry; never continue on a chat say-so.
* Every hand-off: what changed (client's words), root causes, what was verified (the ten passes), **what is unproven**, the exact test cases, the decisions needed, the evidence still wanted.
* One manual step per hand-off. Never force-push; fetch, re-apply, push.
* Never write "ready for review" before the ten passes ran; never write "done" before the client's result.

---

## 10. Knowledge propagation (same day, every window)

* New lesson → strategy section or new `S<nn>`, row in `docs/BUILD_ISSUES_LOG.md` (**fetch main first and take the next free F number** — two windows once both wrote F60-F64), README row.
* Docs-only commits to `main` through a temporary worktree; code and generated files stay on the ticket branch.
* This rulebook changes only through a lesson that changes a rule; mention the change in the commit message.
* Memory / runbook notes are updated with the date; if they differ from this file, this file wins.

---

## 11. Parallel windows

1. Read `WINDOW_START_GATE.md` to its end; claim only with its acknowledgement (`queue.mjs claim ... --ack <token>`).
2. Private clone outside OneDrive, distinct window name, one ticket per window; never touch another window's branch or the shared tools (read only).
3. Before designing: read this rulebook, S06-S10, `BUILD_ISSUES_LOG.md` (F-numbers relevant to your constructs), the sibling tickets' latest status entries and branches.
4. Backlog: promote the QA tools (`simulate`, `fc_sim`, `abap_*`, `recheck`) from `tools/zmmcg_po_sf/` to a parameterised `tools/qa/` when the second form reuses them; until then copy and adapt.

---

## 12. Resolution of conflicting older rules

| Older rule | Newer evidence | Resolution |
|---|---|---|
| S06 "`layout=row` forbidden" | wizard forms use `layout=table` + `row` for every table | table layout for tables and footer lines; S06 stays for free-standing label / field blocks |
| S07 §7 edge order top/left/bottom/right | wizard evidence | **top, right, bottom, left** |
| S02 / F48 margins ≥ 1 cm | wizard: content area = window extents, page 1 whole body | content area as the wizard form |
| S07 / S08 §10 numbers (0.5 mm inset, 3.387 mm line, 4.177 mm rows, 28 pt) | ZMMET only; ZMMCG wizard 1.122 mm / fixed 4.183 mm / 18 pt | numbers are form-specific (S10) |
| Bolt rulebook 8.9 "hidden + initialize script" | client SAP did not run it | default visible + `ready` hide |
| Bolt rulebook 8.10 / README "leader on the row" | wizard | `overflow leader` on the table |
| S04 "structure Context nodes" | wizard flat nodes | flat data nodes |
| "Window flags are frames" (export) | printouts of ZMMET and ZMMCG | not printed |
| First baseline = font ascent 0.905 em | ZMMCG wizard + printout | 0.717 em |
| Master rulebook §1/§6/§14 (re-typography, Helvetica, blue, zebra) | client expects the legacy look | not applied before sign-off; phase 2 proposal only |
| Master rulebook §7 "Page X of Y", §12 QR | legacy has none | phase 2 proposals |
| Runbook §7 (memory) numbers of ZMMET | S10 | superseded |

---

## 13. Anti-patterns (each cost a rejected build or a hand-off that was not ready)

| Anti-pattern | Instead |
|---|---|
| numbers from a sibling form's wizard output | the same form's wizard form + printout |
| blocks hidden by default | default visible, hide on `ready` |
| every variant as a script field | prepared data, default texts, one `ready` per block |
| window flags drawn as frames | line-type cell borders only |
| condition reader that drops operators / alternatives | independent raw reader + environment sweep |
| rounded export heights | STATLINES + printout |
| "ready for review" after structure checks only | ten passes + stated unknowns |
| generator edited through shell quoting | write source files with the editor tool; keep constants in one block |
| lessons only in chat | same-day strategy + build-issues + rulebook |
| parallel windows starting from memory | the start gate and the acknowledgement |

---

## 14. Self-scoring before a hand-off (target ≥ 90)

| Category | Points | Evidence |
|---|---|---|
| Geometry parity (conformance + simulation) | 25 | passes 3, 4 |
| Conditions & languages | 20 | passes 5, 8 |
| ABAP standards and semantics | 15 | passes 6, 7 |
| Design View readability / script count / naming | 10 | human read-through |
| Multi-page and unproven items declared | 10 | status entry |
| Reproducibility and documentation | 10 | pass 9, docs on main |
| Client evidence requested and answered | 10 | intake table |

A score below 90 means the hand-off waits.

---

## 15. Tool index

| Tool | Where | Purpose |
|---|---|---|
| `legacy_xml_to_snapshot.mjs`, `xmlmini.mjs` | main `tools/` | extract + XML reader |
| `pdf_probe.mjs` | main `tools/` | legacy printout → text / line / box coordinates |
| `ref_form_probe.mjs` | main `tools/` | summarise any reference XDP (class, tables, scripts, features) |
| `sfp_check.mjs`, `sfp_interface.mjs`, `sfp_context.mjs`, `queue.mjs` | Bolt Console `tools/` | shared checkers / builders / queue |
| `model.mjs`, `gen.mjs`, `terms_gen.mjs`, `finalize_interface.mjs`, `build_init.mjs`, `verify.mjs`, `conformance.mjs`, `simulate.mjs`, `fc_sim.mjs`, `abap_terms_sim.mjs`, `abap_lint.mjs`, `recheck.mjs` | branch `vernasofttechie-zmmcg_po_sf`, `tools/zmmcg_po_sf/` | the ZMMCG reference implementation of the pattern |
