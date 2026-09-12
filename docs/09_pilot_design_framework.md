# Pilot Adobe Form Design Framework

`Z_MM_PR_FORM_ADT` is the working example for future Smart Form conversions.
It is a **design pattern and validation sequence**, not a serialized template
to copy over another SFP form. Every future form starts with its own
SFP-created, rendered, and abapGit-captured baseline.

## 1. Baseline contract

| Rule | Required practice |
|---|---|
| Form metadata | Let SFP generate the SFPF Context and SFPI serialization. Do not hand-author, replace, or merge their object graphs. |
| Layout edits | Limit repository edits to the captured `.sfpf.xdp`, one renderable visual increment at a time. |
| Capture direction | After an SFP validation, use abapGit **Stage -> Commit -> Push** to capture SAP's generated result. Pull is repository -> SAP and must only import a known-good commit. |
| Interface | Preserve the snapshot contract. Add nothing without a recorded source and a safe caller behavior. |
| Driver programs | Read-only. A design never changes a driver or proposes its cutover. |
| Evidence | Each label, field, graphic, font, width, condition, and table mapping comes from the legacy snapshot/export or is a named extension point. |

This rule exists because an abapGit Pull previously replaced a healthy
SFP-generated layout and Context with hand-authored files. The complete cause
and recovery are F20-F23 in `docs/BUILD_ISSUES_LOG.md`.

## 2. Reusable page architecture

Use a two-layer page layout:

1. A root `data` subform with `layout="tb"`, containing the `pageSet` and
   one full-page positioned `page_body` subform. This is the exact
   SFP-generated pattern that the pilot rendered successfully.
2. Place fixed Smart Form windows in `page_body` at their captured positions.
   Bind data fields with `match="dataRef"` and a path confirmed by the
   generated data description.
3. Place a flowed subform inside the page body only for a legacy MAIN-window
   table or text area. Its repeated row has `occur min="0" max="-1"` and binds
   to the real table-row path.

The fixed header and the dynamic body are intentionally separate. A page body
must not be changed to `layout="tb"` just to support a table, because that
would discard the header's captured coordinates.

## 3. `Z_MM_PR_FORM_ADT` component map

| Component | Data / source | Implementation state |
|---|---|---|
| Page | A4 landscape, 297 x 210 mm | Confirmed rendered |
| Logo | `DANGOTE LOGO`, SAP graphics URL | Confirmed rendered |
| Identity header | `LV_COMPANY`, `PLANT_NAME`, form title | Confirmed rendered |
| PR header | `BANFN`, `BADAT`, `EKNAM`, `BEDNR`, `IV_REQ_EMAIL` | Confirmed rendered |
| Estimated value | `V_EXTTOTAL`, `V_WAERS` | Confirmed rendered |
| Line-item header | 14 headings and exact 290 mm legacy widths | Published for SFP render gate |
| Line-item row | Repeats `$.T_FINAL.DATA[*]`; 14 confirmed row fields | Published for SFP render gate |
| Long text | `T_TEXT` / `TDLINE` | Extension point: confirm the real output purpose first |
| Grand-total row | Legacy footer row | Extension point: confirm `V_EXTTOTAL1` and currency semantics on a real PR PDF |
| Date wording | `BADAT` | Extension point: confirm bound date format before adding a script |
| Watermark | `IV_FRGKZ` | Extension point: validate both shown and hidden cases in Designer |
| Page X of Y | Native Adobe pagination | Extension point: add in SFP/Designer, then capture generated output |

## 4. Table pattern

The pilot’s `line_items` subform is the reference table pattern:

- Header labels and width measurements come from the legacy table definition;
  never allow Designer to auto-distribute columns.
- The row is bound to the actual generated table node
  `$.T_FINAL.DATA[*]`, not a guessed structure or a copied XML path.
- Every cell binds only to a field confirmed in the generated data
  description.
- Quantity and currency reference-field settings are configured in SFP
  Context properties and captured by SAP-generated metadata. They are not
  recreated in the XDP.
- The 12th-14th legacy mappings (`LABST1`, `TOTAL`, `GV_VALUE1`) are
  deliberately retained as provisional until compared with one real Smart
  Form output.

## 5. Required delivery gates

| Gate | Evidence to retain | Result |
|---|---|---|
| Baseline | SFP Layout renders and activates; abapGit capture committed | Safe starting point |
| Static shell | Header, graphic, values visible in Layout and preview | Fixed-window design accepted |
| Table | Header, multiple `T_FINAL` rows, and overflow behavior validated | Dynamic-body pattern accepted |
| Behavior | Empty/non-empty text, watermark states, date, page numbering checked | Conditional design accepted |
| Fidelity | Same real PR rendered by Smart Form and Adobe Form, visually compared | Pilot ready for business review |
| Capture | SFP-generated changes Stage -> Commit -> Push after every green gate | Future Pull is safe |

## 6. Form-specific extension-point register

The following work is intentionally not guessed in the pilot:

| Extension point | Decision needed | Evidence required |
|---|---|---|
| `T_TEXT` placement | Whether it is the PR header note or another print text | Real PR output and the legacy text node |
| Table columns 12-14 | Confirm display labels and source semantics | Real PR output |
| Totals | Confirm the total field and currency key | Real PR output |
| Watermark | Confirm semantic meaning of `R` / `2` release states | Functional owner plus both test cases |
| Date script | Confirm inbound `BADAT` representation | Designer-bound sample data |
| Continuation pages | Confirm header/footer behavior beyond the first page | `T_FINAL` test with realistic row volume |

When an extension point is resolved, add it to the next small XDP increment,
test it in SFP, and capture the resulting generated artifacts before moving
to the next one.
