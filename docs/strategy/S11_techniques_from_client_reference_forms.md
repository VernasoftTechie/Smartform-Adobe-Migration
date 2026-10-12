# S11 — Techniques found in the client's own reference forms (docs/reference_examples, uploaded 2026-10-12)

**Status: evidence-backed candidate.** Source: nine forms that run in the client's SAP (`SFPF_*.XML` + `SFPI_*.XML`, layout = base64 `<LAYOUT>` of the SFPF file;
extract with the one-liner in section 12). Everything below was read from those files, not guessed. A technique becomes **validated for our builds** when a form of ours
using it has rendered in the client's SAP (promotion rule in `README.md`); until then it is a *proposal with a proof test*. Registry: `docs/reference_forms/README.md`.

The forms: `ZAF_FABRIC_CUTTING_STICKER` (sticker, QR via ABAP), `ZAF_INVOICE_CA` (invoice, trailer rows, 1592-line Initialization), `ZAF_PRE_ORD_COST_FORM` / `_YARN` (costing,
zebra rows), `ZEZC_SD_INVOICE_IN_EMAIL` (SAP-standard-style invoice: Context conditions, choice subformSets, page numbers, 2682-line Initialization), `ZPP_PLY_SPECIFICATION`
(landscape 422 mm), `ZSDAF_V3_SEA001` (e-invoice: QR barcode, labels as data), `ZSD_IVORY_FORM` (graphics + text-include Context nodes), `ZSL_OHT_SMRT_WHT_F` (certificate: leader + trailer).

## 1. Labels and wording as DATA, not scripts (the answer to the multi-language problem)

`ZSDAF_V3_SEA001` / `ZSDAI_V3_CN0001`: the interface declares `GS_LABELS TYPE ZSDS_V3_CN001_LABELS` (a structure of `LB_*` fields). The Initialization fills it from the company's label
table through a utility class:

```abap
zcl_adobeform_utility=>get_header_labels( EXPORTING iv_formname = lc_from_name   " fpwbformname constant
                                                    iv_language = sy-langu
                                          IMPORTING it_labels   = DATA(lt_labels) ).   " label_id / translated_label
lo_stru ?= cl_abap_typedescr=>describe_by_data( gs_labels ).                  " fill every LB_* component by name
LOOP AT lo_stru->get_components( ) ASSIGNING FIELD-SYMBOL(<lfs_components>) ... ASSIGN COMPONENT ... OF STRUCTURE gs_labels ...
```
The layout binds each label field to `$.GS_LABELS.LB_BILL_TO` etc. No FormCalc, one language switch in ABAP, translations maintained by the client in a table.
**Use for every form with several languages or order-type-dependent wording** (ZMMCG_PO_SF: 63 scripts → 0): ask the client whether `ZCL_ADOBEFORM_UTILITY` and its label table exist in the target
system and how labels are maintained; until confirmed, keep default texts (S10 section 11) and propose this as the target design. Proof test: preview in two languages.

## 2. Context-level conditions (SFP does the hiding; no layout script)

`ZEZC_SD_INVOICE_IN_EMAIL`: a Context node can carry an SFP condition (`CL_FP_CONDITION` → `<CONDITIONS><SFPCONDITION><OPERAND1>GV_TAXKD</OPERAND1><COPERATOR>EQ</COPERATOR><OPERAND2>'2'</OPERAND2>`),
the same operand / operator format as a Smart Form condition; the node (and its children) exists in the data only if the condition holds (e.g. text include `TAX_HEADING` only for
tax code 2; `GV_BZIRK` only for sales organisation 1001). The layout binds to the node, so an absent node prints nothing. This is the native replacement for `ready` hide scripts
when the condition is about data that SFP knows. Alternatives appear in the layout as **`subformSet relation="choice"`** with subforms named `TRUE` / `FALSE` bound by `dataRef`.
Open: the Context-side creation of the TRUE / FALSE groups was not identified in the extract (needs the SFP Context editor); test before relying on it.

Empty-field hiding in the same forms: `<event activity="ready" ref="$form"><script runAt="server">if ( HasValue($) == 0 ) then $.presence = "hidden" endif</script></event>` — `runAt="server"` on SAP-standard
scripts (our wizard-style forms use none and render; keep the wizard form as the proven reference and verify in the preview).

## 3. Page numbers and layout events

`ZEZC_SD_INVOICE_IN_EMAIL`, `ZSDAF_V3_SEA001`: a small field with `<event activity="ready" ref="$layout"><script contentType="application/x-javascript">this.rawValue = xfa.layout.page(this);</script>` and a second one
`this.rawValue = xfa.layout.pageCount();` → "Page X of Y" (legacy ZMMCG has none: phase 2 option). `ZPP_PLY_SPECIFICATION`: `initialize` script `if (xfa.layout.page(this) > 1) this.margin.topInset = "0in"` (different top
margin from page 2). `ZSDAF_V3_SEA001`: `ready@$layout` hides the QR field when the UUID is empty. `ZAF_INVOICE_CA`: `initialize` hides a block by a data flag
(`$record.GV_USA_FLG.value == 'X'`).

## 4. Tables: leader, trailer, zebra, span

* `<overflow leader="HeaderRow"/>` (repeating heading, on the table), **`<overflow trailer="FooterRow"/>`** (a closing row printed before each page break; `ZAF_INVOICE_CA`, `ZSL_OHT_SMRT_WHT_F` with row role `<assist role="TF"/>`),
  `<overflow leader=".." target="Page1"/>` (continuation page area chosen explicitly), `<break overflowLeader="#HEADER"/>` (leader per page area, `ZEZC_SD_INVOICE_IN_EMAIL`).
* **Zebra rows**: the Designer row-pattern script on the data row: `<event activity="indexChange"><script runAt="both">` with `this.index % n` choosing the colour (`240,240,240` / `255,255,255`), recorded by
  `<?templateDesigner rowpattern first:1, next:1, firstcolor:f0f0f0, nextcolor:ffffff, apply:1?>` (`ZAF_PRE_ORD_COST_FORM_YARN`). Phase 2 option; legacy has none.
* `colSpan="-1"` on a cell spans the whole row (full-width remark / total rows), `colSpan="2"` spans two columns; `keep intact="contentArea"` keeps a block on one page (costing forms);
  `subform layout="lr-tb"` flows blocks left to right (address blocks); `<border>` with `<corner>` for rounded / unified corners.

## 5. Graphics and barcodes

* **Logo at run time instead of an embedded PNG**: Initialization `cl_ssf_xsf_utilities=>get_bds_graphic_as_bmp( p_object = 'GRAPHICS' p_name = 'ZAB_DANGOTE_LOGO' p_id = 'BMAP' p_btype = 'BCOL' )` into an `XSTRING` global;
  Context node `CL_FP_GRAPHIC_CONTENT` (`GRAPHIC_FIELD` = the global, MIME `IMAGE/BMP`); layout `field` with `<ui><imageEdit/></ui>` bound `$.GRAPHIC`. Single source of truth for logos (ZMMCG embeds the PNG of the wizard form
  because the legacy SE78 name is not confirmed): propose it when the client confirms the graphic name. Proof: preview shows the logo, and a missing graphic does not abort (`EXCEPTIONS not_found`).
* **QR code, two ways**: (a) XFA barcode bound to a data node `<ui><barcode type="QRCode" errorCorrectionLevel="3" moduleWidth="0.0167in" moduleHeight="0.0167in" dataLength="1000"/></ui>`; (b) ABAP renders it:
  `cl_rstx_barcode_renderer=>qr_code( i_module_size = 10 i_mode = 'U' i_error_correction = 'M' i_barcode_text = ... IMPORTING e_bitmap = lv_qrcode )` into an `XSTRING` bound to an `imageEdit` (sticker form). Empty → hide
  (technique 3).

## 6. Standard texts as Context nodes

`ZSD_IVORY_FORM`, `ZEZC_SD_INVOICE_IN_EMAIL`: `CL_FP_TEXT_INCLUDE` node: `TEXT_NAME` (`ZSD_NG_1160_ADDRESS`, or `NAMEFIELD`), `TEXT_LANGUAGE`, `TEXT_OBJECT` `TEXT`, `TEXT_ID` `ST`, `IGNORE_ERROR` `X`; SFP reads the text, the layout binds
a field to the node (`ref="TEXT"`). Replaces `READ_TEXT` + join code in the Initialization for plain standard texts (ZMMCG: `ZMMCG_PO_TEXT`, header text `EKKO / F01` use language / name from data, so keep the code unless the
name is fixed). Shape copied from a real, activated form: usable by `sfp_context.mjs` after a test.

## 7. Structure nodes with nested binds are valid (correction of the "flat only" rule)

`ZSD_IVORY_FORM`, `ZSDAF_V3_SEA001`: the Context has `CL_FP_STRUCTURE` nodes (`GS_HEADER`) with `CL_FP_DATA` children (`GENERATED = X`, `FIELD = GS_HEADER-TITLE`) and the layout binds `$.GS_HEADER.TITLE` /
`$record.GS_LABELS.LB_ITEM_NO` — nested paths work in the client's SAP. The wizard's flat names (`LS_ADRC_NAME1`) arise when single fields are dragged. S08 section 3 and the runbook said structure nodes do not reach the
layout; the cause of the ZMMET failure (hand-built structure nodes did not match the layout binds) was not established; these forms show that nested paths work when the layout binds the path the Context creates. Rule: **either is valid, but bind exactly the path the Context creates** and verify it against the data description (pass 10).

## 8. Number, date and text formatting in the layout

`<format><picture>num{z,zzz,zz9.99}</picture></format>`, `zero{}|num{z,zzz,zz9.99}` (blank zero), `num.decimal{zzz,zzz,zz9.99}`, `date{DD/MM/YYYY}`, `<validate nullTest>`; `locale="en_IN"` / `en_US`.
Our ZMMCG form prints text prepared by the Initialization (`WRITE ... TO`, conversion exits) because the legacy does; picture clauses are the phase 2 option for live formatting.
**Rich text with embedded values**: a `draw` with `<value><exData contentType="text/html"><body><p><span xfa:embed="#floatingField017421" xfa:embedMode="raw" xfa:embedType="uri"/></p></body></exData></value>` and a hidden
`field id="floatingField017421"` bound to the data — SAP's way of printing "text &VAR& text" (59 embeds in `ZAF_INVOICE_CA`). Alternative to FormCalc `Concat` for token texts (Last Changed On, words line).

## 9. Translation ids

70-107 `xliff:rid` / `xft-xliff:id` attributes per form (SFP translation catalogue; German tooltips in the SAP-standard invoice): the client translates layout texts through SFP, not through scripts. Preserve every `xliff:rid` and
`<?digestForSAP digest=..?>` processing instruction when editing a layout (S05).

## 10. Interface / Initialization style of the client's developers

400-2700 lines are normal; ABAP 7.4 inline declarations (`INTO TABLE @DATA(lt_x)`, `DATA(lv_x) =`), string templates incl. `|{ gv_vbeln ALPHA = IN }|`, `REDUCE`, `GROUP BY`, `COND`/`VALUE`, TVARVC for configuration (`ZUSNL_DOCUMENT_TYPES`),
`IMPORT lv_flag FROM MEMORY ID 'INV_CA'` (flag passed by the driver), conversion-exit function modules (`CONVERSION_EXIT_MATN1_OUTPUT`, `..._ALPHA_OUTPUT`), `J_1IG_AMT_IN_WORDS`, `CS_BOM_EXPL_MAT_V2`, form name as a
typed constant (`CONSTANTS lc_from_name TYPE fpwbformname VALUE '...'`), `READ_TEXT` joins. Our rule "legacy code verbatim, new code 7.4 + DIL" matches this style.

## 11. What this changes for ZMMCG_PO_SF_ADT (proposals for the client; none applied before parity sign-off)

| Proposal | Replaces | Evidence form | Proof test |
|---|---|---|---|
| labels as data (`GS_LABELS`) through the label utility | 63 FormCalc label scripts, default-text workaround | `ZSDAF_V3_SEA001` | two-language preview |
| Context conditions for blocks (stock-transfer grid, goods / service sections) | `ready` hide scripts | `ZEZC_SD_INVOICE_IN_EMAIL` | order types ZPOT / ZPOS / ZPOC preview |
| runtime logo from BDS | embedded PNG | `ZSD_IVORY_FORM`, `ZSDAI_V3_CN0001` | logo preview, missing graphic |
| `overflow trailer` / `keep intact` for totals | totals split across pages | `ZAF_INVOICE_CA`, costing forms | 60-item goods order |
| Page X of Y, zebra rows | nothing (legacy has none) | `ZEZC_...`, `..._YARN` | multi-page preview |
| text-include Context node | READ_TEXT code for fixed standard texts | `ZSD_IVORY_FORM` | order with and without the text |

## 12. Reading the SFPF files

```
node -e "const s=require('fs').readFileSync(process.argv[1],'utf8');require('fs').writeFileSync(process.argv[2],Buffer.from(/<LAYOUT>([\s\S]*?)<\/LAYOUT>/.exec(s)[1].replace(/\s+/g,''),'base64'))" <SFPF.XML> <out.xdp>
node tools/ref_form_probe.mjs <out.xdp>
```
The Context is the `cls:CL_FP_*` heap of the SFPF file (nodes, `CL_FP_CONDITION`, `CL_FP_TEXT_INCLUDE`, `CL_FP_GRAPHIC_CONTENT`), the interface is the `SFPI_*` file (`<INITIALIZATION>`).
