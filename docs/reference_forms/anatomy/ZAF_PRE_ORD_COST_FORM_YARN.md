# Anatomy of SFPF_ZAF_PRE_ORD_COST_FORM_YARN.XML

## Page structure

- **pageArea** `Page1` content[6.35mm,6.35mm 197.3mm×282.575mm] medium a4 ; occur {}; own objects: none

### Master-page content of pageArea `Page1` (repeats on every page that uses it)

- **subform** `PageNo` x=6.35mm y=288.925mm w=197.25mm h=6.35mm — 0 fields, 0 draws, 0 subforms
- root subform layout=tb 

## Subform tree

- **subform** `` layout=tb w=7.767722in — 255 fields, 8 draws, 61 subforms
  - **subform** `Top` w=197.299mm — 0 fields, 1 draws, 0 subforms
  - **subform** `Cost` w=197.299mm h=29.591mm — 12 fields, 1 draws, 0 subforms
  - **subform** `CustomerOrderDetails` layout=lr-tb w=197.299mm — 19 fields, 6 draws, 4 subforms
    - **subform** `Order` w=197.299mm — 5 fields, 1 draws, 0 subforms
    - **subform** `shrink` w=63.5mm h=33.147mm — 4 fields, 2 draws, 0 subforms
    - **subform** `Quantities` w=63.5mm h=33.147mm — 5 fields, 1 draws, 0 subforms
    - **subform** `FabDetails` w=70.282mm h=33.147mm — 5 fields, 2 draws, 0 subforms
  - **subform** `YarnDetails` layout=tb w=197.3mm — 24 fields, 0 draws, 5 subforms
    - **subform** `YarnDetailsHeader` w=197.104mm h=9.779mm — 5 fields, 0 draws, 0 subforms
    - **subform** `YarnDetailsTable` layout=tb w=197.104mm — 18 fields, 0 draws, 3 subforms
      - **subform** `Table4` layout=table cols=[18.238mm 13.333mm 13.778mm 11.582mm 21.567mm 20.367mm 22.767mm 19.167mm 56.292mm]  — 18 fields, 0 draws, 2 subforms; keep intact=contentArea
        - **subform** `HeaderRow` layout=row  — 9 fields, 0 draws, 0 subforms; role TH
        - **subform** `Row1` layout=row  — 9 fields, 0 draws, 0 subforms; occur ..-1; bind $.GT_YARN_T1.DATA[*]; role TR; event indexChange [x-javascript both: //{{Adobe LiveCycle Designer Generated Code Begin}} - row shading scri]
  - **subform** `CostSheet` layout=tb w=197.3mm — 12 fields, 0 draws, 5 subforms
    - **subform** `GreigeYarnTable` layout=tb w=197.305mm — 11 fields, 0 draws, 4 subforms
      - **subform** `Table5` layout=table cols=[30mm 30mm 34.129mm 43.348mm 59.828mm]  — 11 fields, 0 draws, 3 subforms; keep intact=contentArea
        - **subform** `HeaderRow` layout=row  — 1 fields, 0 draws, 0 subforms; role TH
        - **subformSet** `sec`  — 10 fields, 0 draws, 2 subforms
          - **subform** `HeaderRow` layout=row  — 5 fields, 0 draws, 0 subforms; role TH
          - **subform** `Row1` layout=row  — 5 fields, 0 draws, 0 subforms; occur ..-1; bind $.GT_YARN_COSTING.DATA[*]; role TR; event indexChange [x-javascript both: //{{Adobe LiveCycle Designer Generated Code Begin}} - row shading scri]
  - **subform** `WeavingCost` layout=tb w=197.3mm — 20 fields, 0 draws, 5 subforms
    - **subform** `Type` w=196.85mm h=4.191mm — 3 fields, 0 draws, 0 subforms
    - **subform** `WeavingCostTable` layout=tb w=197.307mm — 16 fields, 0 draws, 3 subforms
      - **subform** `Table6` layout=table cols=[22.167mm 18.374mm 18.374mm 29.152mm 23.967mm 22.767mm 29.152mm 33.353mm]  — 16 fields, 0 draws, 2 subforms; keep intact=contentArea
        - **subform** `HeaderRow` layout=row  — 8 fields, 0 draws, 0 subforms; role TH
        - **subform** `Row1` layout=row  — 8 fields, 0 draws, 0 subforms; occur ..-1; bind $.GT_YARN_WEAVING.DATA[*]; role TR; event indexChange [x-javascript both: //{{Adobe LiveCycle Designer Generated Code Begin}} - row shading scri]
  - **subform** `CostSheet` layout=tb w=197.332mm — 151 fields, 0 draws, 29 subforms
    - **subform** `RMFabricCostTable` layout=tb w=197.299mm — 73 fields, 0 draws, 14 subforms
      - **subform** `Table1` layout=table cols=[36.749mm 21.774mm 24.91mm 22.363mm 25.699mm 27.067mm 38.054mm]  — 73 fields, 0 draws, 13 subforms; overflow leader=HeaderRow
        - **subform** `HeaderRow` layout=row  — 1 fields, 0 draws, 0 subforms; occur ..-1; role TH
        - **subform** `Row1` layout=row  — 7 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row2` layout=row  — 7 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row3` layout=row  — 7 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row3` layout=row  — 1 fields, 0 draws, 0 subforms; role TH
        - **subform** `Row3` layout=row  — 7 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row3` layout=row  — 7 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row3` layout=row  — 7 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row3` layout=row  — 7 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row3` layout=row  — 1 fields, 0 draws, 0 subforms; role TH
        - **subform** `Row3` layout=row  — 7 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row3` layout=row  — 7 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row3` layout=row  — 7 fields, 0 draws, 0 subforms; role TR
    - **subform** `ProcessingCostTable` layout=tb w=197.299mm — 78 fields, 0 draws, 13 subforms
      - **subform** `Table2` layout=table cols=[37.119mm 21.394mm 25.054mm 22.12mm 25.966mm 26.878mm 38.581mm]  — 78 fields, 0 draws, 12 subforms
        - **subform** `HeaderRow` layout=row y=0mm — 1 fields, 0 draws, 0 subforms; occur ..-1; role TH
        - **subform** `Row2` layout=row y=0mm — 7 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row3` layout=row y=0mm — 7 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row4` layout=row y=0mm — 7 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row5` layout=row y=0mm — 7 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row6` layout=row y=0mm — 7 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row7` layout=row y=0mm — 7 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row8` layout=row y=0mm — 7 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row9` layout=row y=0mm — 7 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row10` layout=row y=0mm — 7 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row11` layout=row y=0mm — 7 fields, 0 draws, 0 subforms; role TR
        - **subform** `Row11` layout=row y=0mm — 7 fields, 0 draws, 0 subforms; role TR
  - **subform** `Totals` w=197.299mm — 17 fields, 0 draws, 5 subforms; keep intact=none
    - **subform** `Table3` layout=table cols=[36.816mm 22.313mm 24.726mm 21.933mm 25.654mm 26.961mm 38.671mm] y=0mm — 17 fields, 0 draws, 4 subforms; keep intact=contentArea
      - **subform** `HeaderRow` layout=row  — 1 fields, 0 draws, 0 subforms; occur ..-1; role TH
      - **subform** `Row2` layout=row  — 7 fields, 0 draws, 0 subforms; role TR
      - **subform** `Row2` layout=row  — 7 fields, 0 draws, 0 subforms; role TR
      - **subform** `Row2` layout=row  — 2 fields, 0 draws, 0 subforms; role TR

## Data bindings (distinct)

`$.GS_FABRIC.V_SRNO`, `$.GS_FABRIC.V_VERSION`, `$.GS_FABRIC.V_CUST`, `$.GS_FABRIC.V_DATE`, `$.GS_FABRIC.V_MAT`, `$.GS_FABRIC.V_MATDES`, `$.GS_FABRIC.V_PRODUCT`, `$.GS_FABRIC.V_MAT_LONG`, `$.GS_FABRIC.CUST_REF`, `$.GS_FABRIC.REF_DET`, `$.GS_FABRIC.CUST_DATE`, `$.GS_FABRIC.V_UOM`, `$.GS_FABRIC.V_QTY`, `$.GS_FABRIC.V_RATE`, `$.GS_FABRIC.TARGT_DATE`, `$.GS_FABRIC.V_AMT`, `$.GS_FABRIC.V_QTY_VALUELOSS`, `$.LV_VALUELOSS1`, `$.GS_FABRIC.V_QTY_MTR_SH`, `$.LV_SHRINK1`, `$.GS_FABRIC.V_TD_QTY`, `$.GS_FABRIC.V_TF_QTY`, `$.GS_FABRIC.V_GR_ORDR_QTY`, `$.GS_FABRIC.V_PR_LOSS_QTY`, `$.GS_FABRIC.V_ORDER_QTY`, `$.GS_FABRIC.V_KNIT_FAB`, `$.GS_FABRIC.V_SALES_GRP`, `$.GS_FABRIC.V_SALES_GRP_DES`, `$.GS_FABRIC.V_GR_FAB`, `$.GS_FABRIC.PROCUR_DATE`, `$.GS_FABRIC.V_MACHINE`, `$.GS_FABRIC.V_WASTAGE`, `$.GS_FABRIC.V_WASTAGE_AMT`, `$.GS_FABRIC.RS`, `$.GS_FABRIC.TAPE_LENGTH`, `$.YARN_TYPE`, `$.SEQ_COUNT`, `$.DYEING`, `$.PLY`, `$.CNT`, `$.YARN`, `$.EPI_PPI`, `$.RATE`, `$.MATERIAL`, `$.GT_YARN_T1.DATA[*]`, `$.YARN_QTY`, `$.AMOUNT`, `$.GT_YARN_COSTING.DATA[*]`, `$.GS_FABRIC.V_TYPE`, `$.GS_FABRIC.V_WEAVING`, `$.GS_FABRIC.V_QUALITY`, `$.CHARGES_TYPE`, `$.WEIGHT`, `$.CHARGES_PM`, `$.TOTAL_CHARGES`, `$.GT_YARN_WEAVING.DATA[*]`, `$.GS_FABRIC.V_YARN_QTY_TGRC`, `$.GS_FABRIC.V_RATE_TGRC`, `$.GS_FABRIC.V_QTY_TGRC`, `$.GS_FABRIC.V_RATEVAL_TGRC`, `$.GS_FABRIC.V_PRCO_TGRC`, `$.GS_FABRIC.V_AMT_TGRC`, `$.GS_FABRIC.V_AMT_TRTCST`, `$record.GS_FABRIC.V_YARN_QTY_WARP`, `$record.GS_FABRIC.V_RATE_WARP`, `$record.GS_FABRIC.V_PRCO_WARP`, `$record.GS_FABRIC.V_YARN_QTY_WEFT`, `$record.GS_FABRIC.V_RATE_WEFT`, `$record.GS_FABRIC.V_PRCO_WEFT`, `$record.GS_FABRIC.V_YARN_QTY_YDCO`, `$record.GS_FABRIC.V_RATE_YDCO`, `$record.GS_FABRIC.V_QTY_YDCO`, `$record.GS_FABRIC.V_RATEVAL_YDCO`, `$record.GS_FABRIC.V_PRCO_YDCO`, `$record.GS_FABRIC.V_YARN_QTY_TDCO`, `$record.GS_FABRIC.V_RATE_TDCO`, `$record.GS_FABRIC.V_QTY_TDCO`, `$record.GS_FABRIC.V_RATEVAL_TDCO`, `$record.GS_FABRIC.V_PRCO_TDCO`, `$record.GS_FABRIC.V_AMT_TDCO`, `$record.GS_FABRIC.V_QTY_WEAV`, `$record.GS_FABRIC.V_RATEVAL_WEAV`, `$record.GS_FABRIC.V_AMT_WEAV`, `$record.GS_FABRIC.V_YARN_QTY_WW`, `$record.GS_FABRIC.V_RATE_WW`, `$record.GS_FABRIC.V_PRCO_WW`, `$record.GS_FABRIC.V_YARN_QTY_TFCO`, `$record.GS_FABRIC.V_RATE_TFCO`, `$record.GS_FABRIC.V_QTY_TFCO`, `$record.GS_FABRIC.V_RATEVAL_TFCO`, `$record.GS_FABRIC.V_AMT_TFCO`, `$.GS_FABRIC.V_RATE_PRSH`, `$.GS_FABRIC.V_QTY_PRSH`, `$.GS_FABRIC.V_RATEVAL_PRSH`, `$.GS_FABRIC.V_PRCO_PRSH`, `$.GS_FABRIC.V_AMT_PRSH`, `$.GS_FABRIC.V_QTY_FABCO`, `$.GS_FABRIC.V_RATEVAL_FABCO`, `$.GS_FABRIC.V_AMT_FABCO`, `$.GS_FABRIC.V_QTY_FABDY`, `$.GS_FABRIC.V_RATEVAL_FABDY`, `$.GS_FABRIC.V_AMT_FABDY`, `$.GS_FABRIC.V_QTY_FABPR`, `$.GS_FABRIC.V_RATEVAL_FABPR`, `$.GS_FABRIC.V_AMT_FABPR`, `$.GS_FABRIC.V_QTY_JOBEMB`, `$.GS_FABRIC.V_RATEVAL_JOBEMB`, `$.GS_FABRIC.V_AMT_JOBEMB`, `$.GS_FABRIC.V_QTY_JOBPR`, `$.GS_FABRIC.V_RATEVAL_JOBPR`, `$.GS_FABRIC.V_AMT_JOBPR`, `$.GS_FABRIC.V_QTY_FABFICO`, `$.GS_FABRIC.V_RATEVAL_FABFICO`, `$.GS_FABRIC.V_AMT_FABFICO`, `$.GS_FABRIC.V_QTY_ADD`, `$.GS_FABRIC.V_RATEVAL_ADD`, `$.GS_FABRIC.V_AMT_ADD`, `$.GS_FABRIC.V_QTY_LUCO`, `$.GS_FABRIC.V_RATEVAL_LUCO`, `$.GS_FABRIC.V_PRCO_LUCO` … (136 in all)

## Fonts (face size weight: count)

Times New Roman 8pt: 179; Times New Roman 8pt bold: 74; Arial: 17; Times New Roman 9pt bold: 14; Times New Roman 11pt bold: 1; Arial  bold: 1; Times New Roman  bold: 1

## UI element types

textEdit 211, dateTimeEdit 2, numericEdit 50

## Picture clauses

`date{DD/MM/YYYY}`, `date{YYYY-MM-DD}`, `date{MM/DD/YYYY}`, `num{z,zzz,zzz,zz9}`

## Scripts (3)

```
//{{Adobe LiveCycle Designer Generated Code Begin}} - row shading script. Don't modify it!
var Freqs=[1,1];
var Colors=["240,240,240","255,255,255"];
var nFreqSize = 0;
for (var i=0; i<Freqs.length; i++)
  nFreqSize += Freqs[i];
var nRelIndex = this.index % nFreqSize + 1;
for (var nRun=0; nRun<Freqs.length; nRun++)
{
   if (nRelIndex>Freqs[nRun])
   {
        nRelIndex -= Freqs[nRun];
```
