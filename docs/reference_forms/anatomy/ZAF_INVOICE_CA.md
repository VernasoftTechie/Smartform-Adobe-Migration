# Anatomy of SFPF_ZAF_INVOICE_CA.XML

## Page structure

- **pageArea** `Page1` content[6.35mm,28.575mm 203.2mm×244.475mm] medium letter ; occur {}; own objects: Border, GV_VBELN1, GV_HEADER, GV_INVOICE, Text1, ImageField2, gv_city1, Text26, GV_NAME1, GV_NAME2, GV_CITY, GV_TAX, Text27
- root subform layout=tb 

## Subform tree

- **subform** `Page1` w=8in — 46 fields, 20 draws, 4 subforms
  - **subform** `Heading` w=203.278mm h=88.958mm — 33 fields, 7 draws, 0 subforms
  - **subform** `GT_VBRP` layout=table cols=[9.474mm 23.783mm 19.76mm 23.177mm 30.1mm 10.377mm 8.3mm 11.992mm 12.789mm 12.113mm 9.302mm 12.556mm 19.365mm] y=88.925mm — 13 fields, 13 draws, 2 subforms; bind $record.GT_VBRP
    - **subform** `overflowLeader` layout=row  — 0 fields, 13 draws, 0 subforms; keep intact=none; role TH
    - **subform** `DATA` layout=row  — 13 fields, 0 draws, 0 subforms; occur ..-1; bind $.DATA[*]; keep intact=none; role TR
- **subform** `SubTotal` w=203.2mm h=46.694mm — 4 fields, 14 draws, 7 subforms
  - **subform** `Footer` layout=table cols=[107.514mm 19.365mm] x=76.15mm — 3 fields, 12 draws, 6 subforms; keep intact=contentArea
    - **subform** `Row1` layout=row  — 0 fields, 2 draws, 0 subforms; role TR
    - **subform** `Row3` layout=row  — 0 fields, 2 draws, 0 subforms; role TR
    - **subform** `Row4` layout=row  — 0 fields, 2 draws, 0 subforms; role TR
    - **subform** `Row5` layout=row  — 1 fields, 2 draws, 0 subforms; role TR
    - **subform** `Row6` layout=row  — 1 fields, 2 draws, 0 subforms; role TR
    - **subform** `Row6` layout=row  — 1 fields, 2 draws, 0 subforms; role TR
- **subform** `Table1` layout=table cols=[36.671mm 166.427mm]  — 9 fields, 19 draws, 11 subforms; overflow trailer=FooterRow
  - **subform** `Row1` layout=row  — 0 fields, 1 draws, 0 subforms; keep intact=none; role TR
  - **subform** `Row1` layout=row  — 1 fields, 1 draws, 0 subforms; keep intact=none; role TR
  - **subform** `Row1` layout=row  — 0 fields, 2 draws, 0 subforms; keep intact=none; role TR
  - **subform** `Row1` layout=row  — 1 fields, 2 draws, 0 subforms; keep intact=none; role TR
  - **subform** `Row2` layout=row  — 1 fields, 2 draws, 0 subforms; keep intact=none; role TR
  - **subform** `Row3` layout=row  — 1 fields, 2 draws, 0 subforms; keep intact=none; role TR
  - **subform** `Row4` layout=row  — 1 fields, 2 draws, 0 subforms; keep intact=none; role TR
  - **subform** `Row4` layout=row  — 1 fields, 2 draws, 0 subforms; role TR
  - **subform** `Row5` layout=row  — 1 fields, 2 draws, 0 subforms; keep intact=none; role TR
  - **subform** `Row6` layout=row  — 2 fields, 2 draws, 0 subforms; keep intact=none; role TR
  - **subform** `Row6` layout=row  — 0 fields, 1 draws, 0 subforms; role TR

## Data bindings (distinct)

`$.GV_VBELN1`, `$.GV_HEADER`, `$.GV_INVOICE`, `$.GV_CITY1`, `$.GV_NAME1`, `$.GV_NAME2`, `$.GV_CITY`, `$.GV_TAX`, `$record.GV_WAERK`, `$record.GV_PLANT_ADD`, `$record.GV_PLANT_CITY`, `$record.GV_P_NAME`, `$record.GV_SUPPLIER`, `$record.GV_HOUSE`, `$record.GV_COUNTRY`, `$record.GV_STREET`, `$record.GV_ADD1`, `$record.GV_HOUSENUM`, `$record.GV_SP_KUNNR`, `$record.GV_SOLD2PARTY`, `$record.GV_KUNNR`, `$record.GV_KUNNR_NAME`, `$record.GV_SH_NAME2`, `$record.GV_SP_STREET`, `$record.GV_SP_ADD1`, `$record.GV_SP_HOUSENUM`, `$record.GV_SP_NAME2`, `$record.GV_INVOICE`, `$record.GV_VBELN1`, `$record.GV_PROFORMA`, `$record.GV_REF`, `$record.GV_SFDC_ORDER`, `$record.GV_DATE`, `$record.GV_TERM`, `$record.GV_BP_NAME2`, `$record.GV_KUNNR1`, `$record.GV_KUNNR_NAME1`, `$record.GV_STREET1`, `$record.GV_HOUSENUM1`, `$record.GV_ADD2`, `$record.GV_TAX1`, `$.SLNO`, `$.PIPO`, `$.MATNR`, `$.PARTNO`, `$.ARKTX`, `$.FKIMG`, `$.MEINS`, `$.PRICE`, `$.NETWR`, `$.KWERT`, `$.TAX_RATE`, `$.MWSBP`, `$.TOTAL_INC_TAX`, `$.DATA[*]`, `$record.GT_VBRP`, `$.GV_VAT`, `$.GS_TOTAL.VAT_PERC`, `$.GV_VAT_CURR`, `$record.GS_TOTAL.TOTAL_INC_VAT`, `$.GS_TOTAL.VAT_EUR`, `$.GS_TOTAL.TOTAL_EXC_VAL`, `$.GS_TOTAL.SHIP_HANDLE`, `$.GS_TOTAL.DISCOUNT`, `$.GS_TOTAL.SUBTOTAL`, `$record.GV_NAME1`, `$.GS_BANK.BANK`, `$.GS_BANK.ACCOUNT`, `$.GS_BANK.BRANCH`, `$.GS_BANK.NAME`, `$.GS_BANK.SWIFT`, `$.GV_SORT_KEY`, `$.GV_SORT`, `$.GV_CONTACT`, `$.GV_EMAIL`

## Fonts (face size weight: count)

Arial: 69; Arial 8pt: 48; Arial 7pt bold: 13; Arial 14pt bold: 1; Arial 8pt bold: 1

## UI element types

textEdit 121, imageEdit 1, dateTimeEdit 1, numericEdit 10

## Picture clauses

`date{MM/DD/YYYY}`, `zero{}|num{z,zzz,zz9.99}`

## Scripts (1)

```
if ( $record.GV_USA_FLG.value == 'X')
 {
   this.presence = "hidden";
  }
```
