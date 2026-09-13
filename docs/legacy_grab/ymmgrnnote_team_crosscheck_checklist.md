# YMMGRNNOTE_ADT — Team Cross-Check & Sign-off Checklist

Give this to whoever on the internal team is reviewing the form before
it's called done. It does not require SAP/XFA knowledge — every item
names what to look at on screen (Design View or a real Print Preview)
and what a pass looks like. Where something is a known open question
rather than a defect, it's labelled **OPEN** instead of pass/fail.

Do this after pulling commit `c64caab` (or later) and completing the
Increment 2 (structural/header/TEMPLATE) and Increment 3 (table/
totals/signature/footer) checklists already in
`ymmgrnnote_post_implementation.md` — this document is the
business-facing summary layer on top of those, not a replacement.

---

## 1. Logo & branding

| # | Check | Pass looks like |
|---|---|---|
| 1.1 | Logo image | The Dangote logo (`DANOGATELOGONEW.bmp`, via SE78) appears top-left of the page, correctly proportioned, not stretched or pixelated |
| 1.2 | Logo placement | Logo does not overlap the "Goods Reciept Note" title or the GRN No./Date rows below it |
| 1.3 | Company/plant identity | Company name and plant name/address appear directly below the title, using the *live document's* data (not a hardcoded Dangote/Okpella text) — see item 5 below for why |

## 2. Text & labels

| # | Check | Pass looks like |
|---|---|---|
| 2.1 | Title | Reads exactly **"Goods Reciept Note"** — this spelling ("Reciept") is preserved verbatim from the legacy form, not a typo we introduced. Flag if your team wants it corrected — that's a one-line change, but a deliberate content decision, not something to silently fix |
| 2.2 | TEMPLATE window labels | All 17 labels (Name of the Supplier, Way Bill No. and Date, Invoice No and Date, Transporter Name, Vehicle No, LPR No. and Date, LPO No. and Date, Department Name, Section Name or Code, Air Way Bill No/Bill of Loding No, Air Way Bill/Bill of Loading Date, Name of Ship/Flight, Name of Clearing Agent, Letter of Credit(LC)No, Form M No, Container No. or Mark No, Currency/Exchange Rate) match the legacy form's exact wording, **including the legacy typos** ("Loding" instead of "Loading", "WAY_BII_NO" as a field name) — these are preserved deliberately since they may be real customer-facing wording, not corrected without your say-so |
| 2.3 | Table headers | SNo, Material Code, Item Description, Unit, Accepted Qty, St.Bin, Unit Rate, Amount — matches the legacy MAIN window's column headers |
| 2.4 | Totals row labels | Gross, Vat, Freight and other charge, Total Amount |
| 2.5 | Signature block wording | Prepared By / Checked By / Head (Store) / Head (User Department) — matches legacy. **OPEN**: the supplier end-of-report line ("Received the above goods in good condition...") is a placeholder — the exact legacy wording for this line was not captured verbatim; confirm the real text with us before sign-off |

## 3. Design / layout patterns

| # | Check | Pass looks like |
|---|---|---|
| 3.1 | Page size | A4 portrait, matching every other Dangote form in this program |
| 3.2 | No overlapping text or fields anywhere on the page | Every label is fully readable, every field box is visible and not hidden behind another element. **This was the specific defect found and fixed on 2026-09-13 (commit `c64caab`)** — re-confirm it's actually gone, don't assume |
| 3.3 | No content runs off the page edge | Nothing is clipped at the left/right/bottom margins |
| 3.4 | TEMPLATE section (two columns) | Left and right columns are clearly separated, aligned, and readable at 100% zoom |
| 3.5 | MAIN table | Header row and data rows are aligned column-to-column (SNo above SNo, Amount above Amount, etc.), not shifted |
| 3.6 | Table repeats correctly with multiple line items | Add 2+ test rows of data — a second/third row appears below the first without overlapping it (this specific behavior has not been tested yet as of `c64caab` — do this first before anything else in this section) |
| 3.7 | Multi-page behavior | If a test document has enough line items to span 2+ pages, the table continues cleanly on the next page and the header/footer still appear correctly on each page |
| 3.8 | Consistency with the already-approved pilot form (`Z_MM_PR_FORM_ADT`) | Font choices, spacing conventions, and general visual density feel consistent with that form — not a jarring departure in style |

## 4. Field conditioning (visibility logic)

| # | Check | Pass looks like |
|---|---|---|
| 4.1 | Current build uses **live data fields** for company/plant identity (not the 5-way conditional Dangote/Okpella branding logic from the legacy form) | Company name and plant address always show the *real* document's values, for every plant | 
| 4.2 | **OPEN — deferred by design**: the legacy form's conditional branding (different static header text/legal wording depending on plant `1000`/`1100`/`1021`, country `TZ`, and output type `WE01`/`ZET1`) is **not yet implemented**. It needs your team's confirmation of: (a) the exact wording for each branch, (b) which conditions are mutually exclusive with which, before we build it. Until then, every document renders with the same real-data header regardless of plant/output type — confirm this is acceptable for now, or prioritize resolving it |
| 4.3 | No field is unexpectedly hidden or shown | Every field that should always be visible (all evidenced/mapped fields) is visible in every test document, regardless of that document's data |

## 5. Interface & data mappings

Test with at least one real (or realistic test) GRN document number and
confirm each of the following shows the correct real value — not a
blank, not an error, not last month's cached preview.

| # | Field on the form | Bound to (SAP side) | Verify |
|---|---|---|---|
| 5.1 | GRN No. | `LS_MKPF.MBLNR` | Correct material document number |
| 5.2 | GRN Date | `LS_MKPF.BUDAT` | **OPEN** — a second field named `BUDAT_MKPF` also exists in the captured data; confirm this is the right one, not that one |
| 5.3 | Company name | `LV_BUTXT` | Correct company name for this document's `BUKRS` |
| 5.4 | Plant name & address | `LS_T001W.NAME1/STRAS/PFACH/ORT01` | Correct plant address, not the SAP demo/default plant |
| 5.5 | Supplier | `LS_LFA1.NAME1` | Correct supplier name |
| 5.6 | Waybill / Invoice / Transporter / Vehicle | `LS_MKPF.WAY_BII_NO/WAY_BIL_DT/VENDOR_INV/VEND_INV/TRANSPORTER/VEHICLE_NO` | Correct values, or blank only if genuinely empty on that document |
| 5.7 | LPR / LPO | `LS_EBAN.BANFN/BADAT`, `LS_EKKO.EBELN/BEDAT` | Correct PR/PO number and date |
| 5.8 | Department Name | `LS_EBAN.MFRPN` | **OPEN — needs functional confirmation**: `MFRPN` is normally "Manufacturer Part Number," an unusual source for a department name. This was carried over exactly as found in the legacy form's evidence; please confirm with the functional owner whether this is genuinely correct or a legacy mapping error worth fixing here |
| 5.9 | Section | `LS_EBAN.BEDNR` | Correct section code |
| 5.10 | Air waybill / Ship / Clearing / LC / Form M / Container | `LS_MKPF.AWB_NO_BOL/AWB_DT_BOL/SHIP_FLIGHT/CLEAR_AGNT/LC_NO/FORM_M/CONTAINER` | Correct values |
| 5.11 | Currency / Exchange Rate | `IV_WAERS`/`IV_KURSF` | Correct currency code and rate |
| 5.12 | Table line items | `LT_MSEG[*]` → S.No/Material/Description/Unit/Qty/Bin/Rate/Amount | Each row's 8 columns show the right values for the right item, in the right order |
| 5.13 | Gross vs. Total Amount | Both currently bound to `TOT_AMNT` | **OPEN — real ambiguity, not a bug we can silently resolve**: the legacy form's evidence shows "Gross" and "Total Amount" both referencing the same variable, but at what were likely two different points in the old program's processing (before vs. after VAT/freight were added). Please confirm with a real document whether these two numbers should actually differ — if so, we need a second variable from the interface, not just a layout change |
| 5.14 | Page footer | Date/time, GRN No. repeated, "Page X of Y" | All four show correct live values, and page numbering is correct on a multi-page test document |

## 6. Known open items — decide or defer, don't silently drop

These are the items flagged **OPEN** above, gathered in one place for a
go/no-go decision per item. None of them block using the form today —
each has a safe, evidenced current behavior — but each needs an answer
before we consider the form 100% complete:

| # | Item | Current behavior | What we need from your team |
|---|---|---|---|
| 1 | GRN Date field ambiguity (`BUDAT` vs `BUDAT_MKPF`) | Bound to `BUDAT` | Confirm this is the correct source, or tell us to switch |
| 2 | Department Name mapping (`LS_EBAN.MFRPN`) | Bound exactly as legacy evidenced it | Confirm with functional owner, or approve a correction |
| 3 | Gross vs. Total Amount | Both show the same `TOT_AMNT` value | Confirm if they should differ; if so, name the pre-VAT variable to use |
| 4 | Supplier end-of-report signature line wording | Placeholder text, not the real legacy wording | Supply the exact original wording |
| 5 | Conditional plant/output-type branding (5-way legal/branding text) | Deferred — real data shown regardless of plant/output type | Confirm acceptable to defer, or prioritize supplying exact wording + condition precedence for each branch |
| 6 | Per-row calculation timing for `%CODE1`/`%CODE3`'s original per-line math | Not yet built — table currently shows raw `LT_MSEG` values with no calculation | Confirm whether any of the 8 table columns actually need a calculated (not raw) value, and if so which |
| 7 | `DEP-YMMGRNNOTE-01`: legacy code reads another user's name via a cross-program memory ID (`USR21`/`ADRp` lookup) | Carried over as literal legacy code, not reviewed for whether it's still appropriate/authorized in this system | Confirm this pattern is still authorized, or tell us to remove/replace it |

## 7. Post-implementation steps (once sections 1–6 are all resolved)

1. Business/functional owner does a side-by-side visual comparison: legacy Smart Form OTF output vs. the new Adobe PDF, using the **same real document**.
2. Test the genuine edge cases: a document with an empty `LT_MSEG` (no line items), a document with 20+ line items (multi-page), a document with a zero/blank exchange rate.
3. Confirm every item in section 6 has an explicit decision recorded (not just "still open").
4. Named business sign-off recorded (`YMMGRNNOTE` is High-risk per the program's risk framework — no auto-cutover, ever — see `docs/01_scope.md` §5/§11).
5. Only after sign-off: decide, per existing driver program, how that driver eventually reaches this new Adobe Form — a separate, later, per-driver decision this project does not make on its own (`docs/01_scope.md` §8).

---

*This checklist is a living document — as items in section 6 get resolved, move them to a "Resolved" note (don't delete the row; keep the decision on record) and update `docs/BUILD_ISSUES_LOG.md` if the resolution requires a code/layout change.*
