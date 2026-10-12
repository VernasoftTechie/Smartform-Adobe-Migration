# Anatomy of SFPF_ZAF_PRE_ORD_COST_FORM.XML

## Page structure

- **pageArea** `Page1` content[6.35mm,6.35mm 197.3mm×276.225mm] medium a4 ; occur {}; own objects: none

### Master-page content of pageArea `Page1` (repeats on every page that uses it)

- **subform** `PageNo` x=6.35mm y=285.75mm w=197.25mm h=9.525mm — 0 fields, 0 draws, 0 subforms
- root subform layout=tb 

## Subform tree

- **subform** `` layout=tb w=7.767722in — 126 fields, 14 draws, 34 subforms
  - **subform** `Top` w=197.299mm — 0 fields, 1 draws, 0 subforms
  - **subform** `Cost` w=197.299mm h=29.591mm — 11 fields, 1 draws, 0 subforms
  - **subform** `CustomerOrderDetails` layout=lr-tb w=197.299mm — 19 fields, 6 draws, 4 subforms
    - **subform** `Order` w=197.299mm — 5 fields, 1 draws, 0 subforms
    - **subform** `shrink` w=63.5mm h=33.147mm — 4 fields, 2 draws, 0 subforms
    - **subform** `Quantities` w=63.5mm h=33.147mm — 5 fields, 1 draws, 0 subforms
    - **subform** `FabDetails` w=70.282mm h=33.147mm — 5 fields, 2 draws, 0 subforms
  - **subform** `CostSheet` layout=tb w=197.3mm — 83 fields, 4 draws, 20 subforms
    - **subform** `RMFabricCostTable` layout=tb w=197.299mm — 15 fields, 4 draws, 5 subforms
      - **subform** `Table1` layout=table cols=[35.697mm 29.814mm 40.011mm 31.782mm 30.203mm 29.425mm]  — 15 fields, 4 draws, 4 subforms; overflow leader=HeaderRow; keep intact=contentArea
        - **subform** `HeaderRow` layout=row  — 1 fields, 0 draws, 0 subforms; occur ..-1; role TH
        - **subform** `Row1` layout=row  — 6 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row2` layout=row  — 4 fields, 2 draws, 0 subforms; role TR
        - **subform** `Row3` layout=row  — 4 fields, 2 draws, 0 subforms; role TR
    - **subform** `ProcessingCostTable` layout=tb w=197.299mm — 67 fields, 0 draws, 13 subforms
      - **subform** `Table2` layout=table cols=[35.508mm 30mm 39.822mm 32.171mm 30mm 30mm]  — 67 fields, 0 draws, 12 subforms; overflow leader=HeaderRow; keep intact=contentArea
        - **subform** `HeaderRow` layout=row  — 1 fields, 0 draws, 0 subforms; occur ..-1; role TH
        - **subform** `Row2` layout=row  — 6 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row3` layout=row  — 6 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row4` layout=row  — 6 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row5` layout=row  — 6 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row6` layout=row  — 6 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row7` layout=row  — 6 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row8` layout=row  — 6 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row9` layout=row  — 6 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row10` layout=row  — 6 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row11` layout=row  — 6 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row11` layout=row  — 6 fields, 0 draws, 0 subforms; role TR
  - **subform** `Totals` layout=tb w=197.299mm — 13 fields, 2 draws, 5 subforms
    - **subform** `Table3` layout=table cols=[35.897mm 29.614mm 40.011mm 31.971mm 30.014mm 30mm]  — 13 fields, 2 draws, 4 subforms; overflow leader=HeaderRow; keep intact=contentArea
      - **subform** `HeaderRow` layout=row  — 1 fields, 0 draws, 0 subforms; occur ..-1; role TH
      - **subform** `Row2` layout=row  — 5 fields, 1 draws, 0 subforms; role TR
      - **subform** `Row2` layout=row  — 5 fields, 1 draws, 0 subforms; role TR
      - **subform** `Row2` layout=row  — 2 fields, 0 draws, 0 subforms; role TR

## Data bindings (distinct)

`$.GS_FABRIC.V_SRNO`, `$.GS_FABRIC.V_VERSION`, `$.LV_NAME1`, `$.GS_FABRIC.V_DATE`, `$.GS_FABRIC.V_MAT`, `$.GS_FABRIC.V_MATDES`, `$.GS_FABRIC.V_PRODUCT`, `$.GS_FABRIC.V_MAT_LONG`, `$.GS_FABRIC.CUST_REF`, `$.GS_FABRIC.REF_DET`, `$.GS_FABRIC.CUST_DATE`, `$.GS_FABRIC.V_UOM`, `$.GS_FABRIC.V_QTY`, `$.GS_FABRIC.V_RATE`, `$.GS_FABRIC.TARGT_DATE`, `$.GS_FABRIC.V_AMT`, `$.GS_FABRIC.V_QTY_VALUELOSS`, `$.LV_VALUELOSS1`, `$.GS_FABRIC.V_QTY_MTR_SH`, `$.LV_SHRINK1`, `$.GS_FABRIC.V_TD_QTY`, `$.GS_FABRIC.V_TF_QTY`, `$.GS_FABRIC.V_GR_ORDR_QTY`, `$.GS_FABRIC.V_PR_LOSS_QTY`, `$.GS_FABRIC.V_ORDER_QTY`, `$.GS_FABRIC.V_KNIT_FAB`, `$.GS_FABRIC.V_SALES_GRP`, `$.GS_FABRIC.V_SALES_GRP_DES`, `$.GS_FABRIC.V_GR_FAB`, `$.GS_FABRIC.V_FAB_RATE`, `$.GS_FABRIC.V_QTY_TGRC`, `$.GS_FABRIC.V_RATEVAL_TGRC`, `$.GS_FABRIC.V_AMT_TGRC`, `$.GS_FABRIC.V_AMT_TRTCST`, `$.GS_FABRIC.V_RATE_PRSH`, `$.GS_FABRIC.V_QTY_PRSH`, `$.GS_FABRIC.V_RATEVAL_PRSH`, `$.GS_FABRIC.V_PRCO_PRSH`, `$.GS_FABRIC.V_AMT_PRSH`, `$.GS_FABRIC.V_QTY_FABCO`, `$.GS_FABRIC.V_RATEVAL_FABCO`, `$.GS_FABRIC.V_AMT_FABCO`, `$.GS_FABRIC.V_QTY_FABDY`, `$.GS_FABRIC.V_RATEVAL_FABDY`, `$.GS_FABRIC.V_AMT_FABDY`, `$.GS_FABRIC.V_QTY_FABPR`, `$.GS_FABRIC.V_RATEVAL_FABPR`, `$.GS_FABRIC.V_AMT_FABPR`, `$.GS_FABRIC.V_QTY_JOBEMB`, `$.GS_FABRIC.V_RATEVAL_JOBEMB`, `$.GS_FABRIC.V_AMT_JOBEMB`, `$.GS_FABRIC.V_QTY_JOBPR`, `$.GS_FABRIC.V_RATEVAL_JOBPR`, `$.GS_FABRIC.V_AMT_JOBPR`, `$.GS_FABRIC.V_QTY_FABFICO`, `$.GS_FABRIC.V_RATEVAL_FABFICO`, `$.GS_FABRIC.V_AMT_FABFICO`, `$.GS_FABRIC.V_QTY_ADD`, `$.GS_FABRIC.V_RATEVAL_ADD`, `$.GS_FABRIC.V_AMT_ADD`, `$.GS_FABRIC.V_QTY_LUCO`, `$.GS_FABRIC.V_RATEVAL_LUCO`, `$.GS_FABRIC.V_PRCO_LUCO`, `$.GS_FABRIC.V_AMT_LUCO`, `$.GS_FABRIC.V_RATE_VALLOSS`, `$.GS_FABRIC.V_QTY_VALLOSS`, `$.GS_FABRIC.V_RATEVAL_VALLOSS`, `$.GS_FABRIC.V_PRCO_VALLOSS`, `$.GS_FABRIC.V_AMT_VALLOSS`, `$record.GS_FABRIC.V_RATE_SELL`, `$record.GS_FABRIC.V_AMT_SELL`, `$.GS_FABRIC.V_QTY_TCOST`, `$.GS_FABRIC.V_RATEVAL_TCOST`, `$.GS_FABRIC.V_PRCO_TCOST`, `$.GS_FABRIC.V_AMT_TCOST`, `$record.GS_FABRIC.V_QTY_NMARGIN`, `$record.GS_FABRIC.V_RATEVAL_NMARGIN`, `$record.GS_FABRIC.V_AMT_NMARGIN`, `$record.GS_FABRIC.V_MARGIN_PER`

## Fonts (face size weight: count)

Times New Roman 8pt: 98; Times New Roman 8pt bold: 45; Times New Roman 9pt bold: 9; Times New Roman 11pt bold: 1; Arial  bold: 1; Times New Roman  bold: 1

## UI element types

textEdit 97, dateTimeEdit 3, numericEdit 40

## Picture clauses

`date{DD/MM/YYYY}`, `date{MM/DD/YYYY}`, `num{z,zzz,zzz,zz9}`, `num.decimal{zzz,zzz,zz9.99}`
