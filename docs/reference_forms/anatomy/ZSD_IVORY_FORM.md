# Anatomy of SFPF_ZSD_IVORY_FORM.XML

## Page structure

- **pageArea** `Page1` content[0.25in,0.25in 8in×10.5in] medium letter ; occur {}; own objects: none
- root subform layout=tb 

## Subform tree

- **subform** `` w=8in h=10.5in — 31 fields, 18 draws, 3 subforms
  - **subform** `GT_ITEM` layout=table cols=[33.3333mm 61.387mm 20.888mm 17.64mm 33.3333mm 36.34mm] y=104.775mm — 6 fields, 6 draws, 2 subforms; occur 0..; bind $.GT_ITEM; overflow leader=overflowLeader; keep intact=contentArea
    - **subform** `overflowLeader` layout=row  — 0 fields, 6 draws, 0 subforms; occur ..-1; role TH
    - **subform** `DATA` layout=row  — 6 fields, 0 draws, 0 subforms; occur ..-1; bind $.DATA[*]; role TR

## Data bindings (distinct)

`$.GS_HEADER.TITLE`, `$.GS_HEADER.SHIP_TO_KUNNR`, `$.GS_HEADER.SHIP_TO_ADDR1`, `$.GS_HEADER.SHIP_TO_ADDR2`, `$.GS_HEADER.SHIP_TO_ADDR3`, `$.GS_HEADER.INVOICE_TO_KUNNR`, `$.GS_HEADER.INVOICE_TO_ADDR2`, `$.GS_HEADER.SHIP_TO_ADDR4`, `$.GS_HEADER.ZDATE`, `$.GS_HEADER.INVOICE_NUMBER`, `$.GS_HEADER.PO_NUMBER`, `$.GS_HEADER.SO_NUMBER`, `$.GS_HEADER.DELVERY_NUMBER`, `$.GS_HEADER.WAY_BILL_NO`, `$.PRODUCT`, `$.MAKTX`, `$.MENGE`, `$.UNIT`, `$.UNIT_SEL`, `$.TOTAL`, `$.DATA[*]`, `$.GT_ITEM`, `GV_VAL`, `GS_HEADER.AISLE_H`, `$.GS_HEADER.AISLE`, `$.GS_HEADER.TOTAL`, `$.GRAPHIC`, `TEXT`, `GS_HEADER.VAT_H`, `$.GS_HEADER.VAT`, `GS_HEADER.TIN_SH`, `GS_HEADER.TIN_INV`, `$.GS_HEADER.CUST_REF`

## Fonts (face size weight: count)

Arial: 48; Arial 36pt: 1

## UI element types

textEdit 42, numericEdit 6, imageEdit 1
