# Anatomy of SFPF_ZSDAF_V3_SEA001.XML

## Page structure

- **pageArea** `Page1` content[6.35mm,104.775mm 204.216mm×164.973mm] medium letter ; occur {}; own objects: TextField9, CurrentPage, PageCount, Pages, Text9

### Master-page content of pageArea `Page1` (repeats on every page that uses it)

- **subform** `HeaderDetails` x=6.265mm y=5.63mm w=204.724mm h=99.145mm — 22 fields, 1 draws, 9 subforms
  - **subform** `LOGO` x=0.07mm w=73.025mm h=16.599mm — 1 fields, 0 draws, 0 subforms
  - **subform** `Heading` x=133.435mm y=3.895mm w=71.057mm h=12.807mm — 1 fields, 0 draws, 0 subforms
  - **subform** `HeaderDeatails` x=0mm y=15.875mm w=204.724mm h=83.27mm — 20 fields, 1 draws, 6 subforms
    - **subform** `CompanyaddSubform` x=1.257mm y=0.095mm w=133.392mm h=19.138mm — 0 fields, 0 draws, 0 subforms
    - **subform** `SHIBillAddsub` x=0mm y=0.015mm w=134.665mm h=83.255mm — 5 fields, 1 draws, 3 subforms
      - **subform** `Table1` layout=table cols=[2.625014in 67.564mm] x=0.254mm y=19.193mm — 4 fields, 0 draws, 2 subforms
        - **subform** `Row1` layout=row y=0mm — 2 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row2` layout=row y=0mm — 2 fields, 0 draws, 0 subforms; role TR
    - **subform** `Invoicedetails` x=134.601mm y=9.535mm w=70.056mm h=73.735mm — 15 fields, 0 draws, 0 subforms
- **subform** `DocNosubform` x=140.97mm y=21.437mm w=69.85mm h=9.652mm — 2 fields, 0 draws, 0 subforms
- root subform layout=tb 

## Subform tree

- **subform** `ItemData` layout=tb w=204.216mm — 34 fields, 2 draws, 6 subforms
  - **subform** `GT_ITEM` layout=table cols=[12.7mm 40.64mm 74.422mm 18.034mm 16.9164mm 22.5146mm 19.304mm]  — 14 fields, 0 draws, 2 subforms; occur 0..; bind $.GT_ITEM; overflow leader=overflowLeader
    - **subform** `overflowLeader` layout=row  — 7 fields, 0 draws, 0 subforms; occur ..-1; role TH
    - **subform** `DATA` layout=row  — 7 fields, 0 draws, 0 subforms; occur ..-1; bind $.DATA[*]; role TR
  - **subform** `BankAccountDetails` layout=lr-tb w=204.216mm — 17 fields, 2 draws, 0 subforms
  - **subform** `Footer_of_form` layout=lr-tb w=204.216mm — 3 fields, 0 draws, 1 subforms
    - **subform** `` layout=tb w=203.2mm — 3 fields, 0 draws, 0 subforms

## Data bindings (distinct)

`$.HEADER_LOGO`, `$.GS_HEADER.HEADER`, `$.GS_LABELS.LB_BILL_TO`, `$.GS_LABELS.LB_SHIP_TO`, `$.GS_HEADER.BILL_ADD`, `$.GS_HEADER.SHIP_ADD`, `$.GS_HEADER.COMPANY_ADD`, `$.GS_LABELS.LB_BILL_DT`, `$.GS_LABELS.LB_DEL_NOTE`, `$.GS_LABELS.LB_PAY_TERMS`, `$.GS_LABELS.LB_DEL_TERMS`, `$.GS_LABELS.LB_COO`, `$.GS_LABELS.LB_DOC_CUR`, `$.GS_HEADER.BILL_DATE`, `$.GS_HEADER.DEL_NOTE`, `$.GS_HEADER.DEL_TERMS`, `$.GS_HEADER.DOC_CURR`, `$.GS_HEADER.COO`, `$.GS_HEADER.PAY_TERMS`, `$.GS_HEADER.QR_CODE`, `$.GS_LABELS.LB_UUID`, `$.GS_HEADER.UUID`, `$.GS_LABELS.LB_BILL_DOC`, `$.GS_HEADER.BILL_DOC`, `$.GS_HEADER.E_O_E`, `$record.GS_LABELS.LB_ITEM_NO`, `$record.GS_LABELS.LB_PART_NO`, `$record.GS_LABELS.LB_ITM_DESC`, `$record.GS_LABELS.LB_ITM_PRICE`, `$record.GS_LABELS.LB_ITM_UT_PRICE`, `$record.GS_LABELS.LB_ITM_QTY`, `$record.GS_LABELS.LB_ITM_AMT`, `$.ITEM_NO`, `$.ITEM_TEXT`, `$.DESC_ITEM`, `$.PRICE`, `$.UOP`, `$.QTY`, `$.AMT`, `$.DATA[*]`, `$.GT_ITEM`, `$.GS_LABELS.LB_BNK_DETAILS`, `$.GS_LABELS.LB_BNK_TAX_AMT`, `$.GS_HEADER.TAXABLE_AMT`, `$.GS_LABELS.LB_BNK_TT_TO`, `$.GS_HEADER.TT_TO`, `$.GS_LABELS.LB_BNK_OUT_TAX`, `$.GS_HEADER.OUTPUT_TAX`, `$.GS_LABELS.LB_BNK_BANKER`, `$.GS_HEADER.BANKER`, `$.GS_LABELS.LB_BNK_TOT_INV_AMT`, `$.GS_HEADER.TOTAL_AMT`, `$.GS_LABELS.LB_BNK_AC_NO`, `$.GS_HEADER.AC_NO`, `$.GS_LABELS.LB_BNK_TOT_INV_AMT_WRD`, `$.GS_HEADER.TOTAL_AMT_WORDS`, `$.GS_LABELS.LB_BNK_SHIFT_CODE`, `$.GS_HEADER.SWIFT_CODE`, `$.GS_LABELS.LB_REMARK`, `$.GS_HEADER.REMARK`, `$.GS_HEADER.COMPU_SIGN`

## Fonts (face size weight: count)

Arial 8pt: 27; Arial 9pt: 17; Arial: 11; Arial 8pt bold: 7; Arial 9pt bold: 2; Arial  bold: 1

## UI element types

imageEdit 1, textEdit 59, barcode 1, numericEdit 5

## Scripts (3)

```
var uuidValue = "";

if ($record.GS_HEADER.UUID.value != null) {
    uuidValue = $record.GS_HEADER.UUID.value;
}

if (uuidValue == "") {
    this.presence = "hidden";
} else {
    this.presence = "visible";
}
```
```
this.rawValue = xfa.layout.page(this);
```
```
this.rawValue = xfa.layout.pageCount();
```
