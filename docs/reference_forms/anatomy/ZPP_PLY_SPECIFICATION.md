# Anatomy of SFPF_ZPP_PLY_SPECIFICATION.XML

## Page structure

- **pageArea** `Page1` content[6.35mm,82.55mm 422.275mm×216.535mm] medium a3Extra landscape; occur {}; own objects: none

### Master-page content of pageArea `Page1` (repeats on every page that uses it)

- **subform** `Subform2` x=6.199mm y=15.703mm w=422.401mm h=67.281mm — 3 fields, 4 draws, 3 subforms
  - **subform** `Subform5` x=0mm y=0.049mm w=50.854mm h=60.448mm — 1 fields, 0 draws, 0 subforms
  - **subform** `Subform6` x=273.201mm y=0.172mm w=149.279mm h=66.675mm — 2 fields, 1 draws, 0 subforms
  - **subform** `Subform8` x=0.009mm y=12.872mm w=50.854mm h=54.436mm — 0 fields, 1 draws, 0 subforms
- **subform** `Subform3` x=57.062mm y=28.825mm w=371.827mm h=22.225mm — 3 fields, 0 draws, 0 subforms
- **subform** `Subform7` x=279.4mm y=37.719mm w=149.278mm h=28.575mm — 1 fields, 1 draws, 0 subforms
- **subform** `subform9` x=6.234mm y=295.123mm w=432.005mm h=19.202mm — 0 fields, 1 draws, 0 subforms
- root subform layout=tb 

## Subform tree

- **subform** `` layout=tb w=422.275mm — 20 fields, 15 draws, 9 subforms; occur ..-1; overflow target=Page1
  - **subform** `body` layout=tb w=422.369mm minH=105.256mm — 20 fields, 15 draws, 8 subforms; event initialize [x-javascript: var curpage = xfa.layout.page(this); if ( curpage > 1 ) { this.margin.]; margin 0mm/0/0/0
    - **subform** `Table1` layout=table cols=[13.8938mm 38.7858mm 51.7066mm 55.3999mm 52.92mm 45.16mm 28.0973mm 40.6248mm 26.7487mm 32.693mm 35.987mm]  — 20 fields, 15 draws, 7 subforms; occur ..-1; overflow leader=HeaderRow target=Page1; margin 0mm/0/0/0
      - **subform** `HeaderRow` layout=row  — 0 fields, 11 draws, 0 subforms; occur ..-1; keep intact=none; role TH
      - **subform** `Row1` layout=row  — 11 fields, 0 draws, 0 subforms; occur ..-1; keep intact=none; role TR
      - **subform** `Row3` layout=row  — 0 fields, 1 draws, 0 subforms; role TR
      - **subform** `Row4` layout=row  — 0 fields, 3 draws, 0 subforms; role TR
      - **subform** `Row5` layout=row  — 3 fields, 0 draws, 0 subforms; role TR
      - **subform** `Row6` layout=row  — 3 fields, 0 draws, 0 subforms; role TR
      - **subform** `Row7` layout=row  — 3 fields, 0 draws, 0 subforms; role TR

## Data bindings (distinct)

`$.LV_DATE`, `$.ZFORMAT`, `$.OTHER`, `$.DOCUMENT`, `$.LS_NAME1`, `$.REVISION`, `$.CHANGE`, `$.GT_FINAL.DATA[*].SRNO`, `$.GT_FINAL.DATA[*].SIZE`, `$.GT_FINAL.DATA[*].PLY_BEAKER`, `$.GT_FINAL.DATA[*].PLY_CODE`, `$.GT_FINAL.DATA[*].FAB_CODE`, `$.GT_FINAL.DATA[*].DIP_FABRIC_CODE`, `$.GT_FINAL.DATA[*].WIDTH`, `$.GT_FINAL.DATA[*].WIDTH_TOLERANCE`, `$.GT_FINAL.DATA[*].ANGLE`, `$.GT_FINAL.DATA[*].ANGLE_TOLERANCE`, `$.GT_FINAL.DATA[*].WIND_UP_STATION`, `$.LS_SRNO1`, `$.LS_DATE1`, `$.LS_CHANGE1`, `$.LS_SRNO2`, `$.LS_DATE2`, `$.LS_CHANGE2`, `$.LS_SRNO3`, `$.LS_DATE3`, `$.LS_CHANGE3`

## Fonts (face size weight: count)

Arial 12pt: 22; Arial: 14; Arial 14pt: 6; Arial 16pt: 2; Arial 22pt: 1; Arial 24pt: 1; Arial 26pt: 1

## UI element types

textEdit 41, dateTimeEdit 2, imageEdit 1, numericEdit 3, picture 1

## Picture clauses

`num{zzzzzzzzzzzz9}`, `num{zzzz9.99}`, `num{zzzz9.9}`

## Scripts (4)

```
var curpage = xfa.layout.page(this);
 if	( curpage > 1 ) {
 this.margin.topInset = "0in";
 }
```
```
this.isNull || (this.rawValue >= -2147483648 && this.rawValue <= 2147483647);
```
```
var envelope = "<?xml version='1.0' encoding='UTF-8'?>" +
  "<exData contentType='text/html' xmlns='http://www.xfa.org/schema/xfa-template/2.8/'" +
  "><body xmlns='http://www.w3.org/1999/xhtml' xmlns:xfa='http://www.xfa.org/schema/xfa-data/1.0/' " +
  "xfa:APIVersion='Acroform:2.7.0.0' xfa:spec='2.1'>" +
  "<p>"+ this.rawValue +"</p></body></exData>";

this.value.exData.loadXML(envelope,1,1);
```
