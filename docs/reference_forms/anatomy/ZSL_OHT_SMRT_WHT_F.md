# Anatomy of SFPF_ZSL_OHT_SMRT_WHT_F.XML

## Page structure

- **pageArea** `X2500_PAGE1_ID` content[6.35mm,5.489mm 203.766mm×249.962mm] medium letter ; occur {"min":"1"}; own objects: TextField, TextField, Text3, Image1
- root subform layout=undefined x=6.35mm y=5.489mm

## Subform tree

- **subform** `` layout=tb x=-6.293mm y=21.208mm w=203.708mm — 26 fields, 14 draws, 7 subforms; margin 0/0/0/0mm
  - **subform** `` w=203.601mm h=81.226mm — 15 fields, 1 draws, 0 subforms; overflow leader= trailer=
  - **subform** `Table` layout=tb w=203.673mm — 10 fields, 12 draws, 4 subforms; occur ..-1
    - **subform** `IT_WITH_ITEM` layout=table cols=[35.8841mm 26.858mm 22.2694mm 21.898mm 21.898mm 22.8318mm 22.376mm 29.633mm]  — 10 fields, 12 draws, 3 subforms; occur ..-1; bind $.IT_WITH_ITEM; overflow leader=overflowLeader
      - **subform** `overflowLeader` layout=row x=-0.057mm — 0 fields, 8 draws, 0 subforms; occur ..-1; role TH
      - **subform** `DATA` layout=row x=-0.057mm — 8 fields, 0 draws, 0 subforms; occur ..-1; bind $.DATA[*]; keep intact=none; role TR
      - **subform** `DATA` layout=row x=-0.057mm — 2 fields, 4 draws, 0 subforms; occur ..-1; role TF
  - **subform** `` layout=tb w=203.637mm — 1 fields, 1 draws, 0 subforms; keep intact=contentArea

## Data bindings (distinct)

`$.WA_FINAL.CTNUMBER`, `$.WA_FINAL.PAVAL`, `$.IT_FINAL.DATA[*].BELNR`, `$.IT_FINAL.DATA[*].BLDAT`, `$.IT_FINAL.DATA[*].MC_NAME1`, `$.IT_FINAL.DATA[*].PO_BOX`, `$.IT_FINAL.DATA[*].MC_STREET`, `$.IT_FINAL.DATA[*].MC_CITY1`, `$.V_NAME`, `$.IT_FINAL.DATA[*].HOUSE_NUM1`, `$.IT_FINAL.DATA[*].MC_STREET_V`, `$.IT_FINAL.DATA[*].MC_CITY1_V`, `$.NATIONAL_ID`, `$.FDATE`, `$.TDATE`, `$.GAMT_C`, `$.TAMT_C`, `$.BKTXT`, `$.J_1KFTBUS`, `$.WT_QSSHH`, `$.WT_ACCBS`, `$.QSATZ`, `$.WT_QBSHH`, `$.AUGDT`, `$.ZALDT`, `$.DATA[*]`, `$.IT_WITH_ITEM`, `$record.WT_QSSHH`, `$record.WT_QBSHH`, `$.DATE`

## Fonts (face size weight: count)

Arial: 35; Arial  bold: 8

## UI element types

textEdit 33, imageEdit 1, dateTimeEdit 6, numericEdit 4

## Picture clauses

`date{DD/MM/YYYY}`, `date{YYYY-MM-DD}`
