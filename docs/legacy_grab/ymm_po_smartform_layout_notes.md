# YMM_PO_SMARTFORM_ADT — layout notes (evidence, assumptions, increments)

Evidence source for every number below: window table of `YMM_PO_SMARTFORM_extract.md` section 4 and the
raw `OUTATTR` of each window in `ymm_po_smartform.xml`.

## Page and scaling

- A4 portrait (`long=297mm short=210mm`), one `pageArea`, `contentArea` x=10 mm y=10 mm w=190 mm h=277 mm
  (1 cm margins, rulebook S02/F48).
- The legacy windows span x = 0.17 .. 20.59 cm (20.42 cm wide, 0.41 cm from the right edge). To honour the 1 cm
  margin rule every x and width is scaled by 19/20.42 = 0.9305 and shifted by -0.17 cm; heights and y keep their
  legacy value (minus 0.03 cm, the top of `COMPANY_NAME`). Unscaled geometry would need 0.4 cm margins - say so
  after the preview if you prefer that.
- Body is `po_doc` (layout tb, flowing) holding hidden condition holders and `po_header` (position, 19 x 9.67 cm).

## Increment 1 — page-1 header block (this push)

| Legacy window | Legacy position (left/top, w x h cm) | Layout | Evidence for content |
|---|---|---|---|
| `%GRAPHIC1` | 0.17/0.13, 5.42 x 2.82 | `logo`, image `/sap/bc/fp/graphics/public/graphics/bmap/bcol/dangote%20logo.bmp` (same SE78 object as the pilot, rendered in the client's SAP) | graphic `GRAPHICS/DANGOTE LOGO/BMAP` BCOL |
| `COMPANY_NAME` | 6.03/0.03, 11.83 x 2.40, box | `win_company`, three exclusive variants: werks <> 1021 and LV_FLAG <> F; werks <> 1021 and LV_FLAG = F; werks = 1021 | text nodes `%TEXT164`, `%TEXT173`, `COMPANY_CODE`; `%CODE95` sets LV_FLAG |
| `HEADING_PO` | 5.65/2.50, 11.80 x 0.44, box | `win_heading`, 7 titles chosen by V_BSART | `%TEXT37/38/39/22/23/180/181` |
| `PR_DETAILS` | **left not in the export**, 3.11, 11.50 x 3.97, box | `win_pr`, x = 0.30 cm **assumed** (aligned with the supplier box); 4 variants V_FLAG X/Y x CUR_KEY A/B | `%TEXT55/54/41/191/40/190` |
| `PO_DETAILS` | 12.90/3.35, 7.32 x 4.07, box | `win_po`, "Last Changed On" + 3 variants by V_BSART | `%TEXT257/170/182/4` |
| `SUPPLIER_ORDER_ADDRESS` | 0.30/5.75, 11.50 x 3.40, box | `win_supplier` | `%TEXT155` |
| `LOCAL_IMPORT_PO_TEXT` | 0.33/9.16, 20.42 x 0.54 | `win_note`, ZLOC / ZIMP note | `%TEXT179`, `%TEXT183` |

Conditions are the legacy ones, evaluated in an `initialize` script from hidden holder fields that are direct
children of `po_doc` (rulebook 8.9 pattern, same as the pilot's watermark). Values shown in more than one variant are
bound once in a holder and copied by a composed field (pilot `date_display` pattern); values shown once are bound
directly. Amounts, the PR date and PR/vendor numbers come from `GS_FMT_OUT` (already formatted text).

### Not evidenced / placeholders (Developer Extension Points)

- Fonts: Arial placeholders (9 pt company lines, 10 pt bold titles, 8 pt bold for SC titles, 7.5 pt for PR/PO/supplier
  windows, 8 pt bold notes); `YMM_PO_STYLE`, `SYSTEM`, `YMMDRAFTSTYLE` are not in the export. Alignment is centred for
  company/title lines (assumption), left elsewhere.
- Inline bold (character format C4) inside a text line is represented by a separate label draw and a bold value field.
- 7.5 pt / 0.32 cm row pitch in `PR_DETAILS`: the legacy text must fit between 3.11 and the supplier box at 5.75 cm
  (8 lines), which fixes the pitch; the real legacy size is unknown.
- `PR_DETAILS` (3.11-7.08) and the supplier box (5.75-9.15) overlap vertically in the legacy form; reproduced as is.
- Page-1 only: the legacy header windows are not on page 2.

## Next increments (each is handed to the client for activation/preview)

2. Header texts, EKPO/ESLL item table with repeating header (rulebook 8.10, unconfirmed), totals, amount in words.
3. Item texts F01-F05 and the terms-and-conditions variants (18 variants selected by V_FLAG / LV_COND ...).
4. Watermark and "PO No / Page x of y" on every page (needs master-page content or the documented fallback).
