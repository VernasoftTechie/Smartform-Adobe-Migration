# Anatomy of SFPF_ZEZC_SD_INVOICE_IN_EMAIL.XML

## Page structure

- **pageArea** `Page1` content[6.811mm,41.308mm 195mm×235.504mm] medium a4 ; occur {"max":"1","min":"1"}; own objects: HEADER_TEXT, LOGO, FOOTER_TEXT
- **pageArea** `Page2` content[7.069mm,42.369mm 195mm×234.443mm] medium a4 ; occur {}; own objects: HEADER_TEXT, Pages, CurrentPage, PageCount, FOOTER_TEXT

### Master-page content of pageArea `Page1` (repeats on every page that uses it)

- **subform** `WATERMARK` x=9.084mm y=42.776mm w=190.374mm h=183.964mm — 1 fields, 1 draws, 0 subforms

### Master-page content of pageArea `Page2` (repeats on every page that uses it)

- **subform** `INFO2` layout=tb x=155mm y=20mm w=45mm — 2 fields, 0 draws, 0 subforms
- **subform** `WATERMARK` x=9.456mm y=42.018mm w=190.374mm h=153.678mm — 1 fields, 1 draws, 0 subforms
- root subform layout=tb 

## Subform tree

- **subform** `BODY` layout=tb w=195mm — 56 fields, 27 draws, 48 subforms
  - **subform** `ADDRESS_INFO` layout=lr-tb w=195mm — 17 fields, 1 draws, 12 subforms
    - **subform** `ADDRESS` layout=tb w=100mm — 4 fields, 0 draws, 3 subforms
      - **subform** `ALTERNATIVE_ADDRESS_HEADER_TEXT`  — 2 fields, 0 draws, 2 subforms; bind $record.BIL_PRT_COM.HEAD_DETAIL.ALTERNATIVE_ADDRESS_HEADER_TEXT; margin 0mm/0mm/0mm/0mm
        - **subformSet** `SUB_ADDRESS_HEADER_TEXT` relation=choice  — 2 fields, 0 draws, 2 subforms
          - **subform** `TRUE` w=94.9999mm — 1 fields, 0 draws, 0 subforms; bind TRUE; margin 0mm/0mm/0mm/0mm
          - **subform** `FALSE` w=95mm — 1 fields, 0 draws, 0 subforms; bind FALSE; margin 0mm/0mm/0mm/0mm
    - **subform** `INFO` layout=tb w=95mm — 13 fields, 1 draws, 7 subforms
      - **subform** `SUB_REPEAT_PRINTOUT` layout=tb y=9.9998mm w=3.740153in — 1 fields, 1 draws, 0 subforms
      - **subform** `NUMBER` layout=lr-tb w=95mm — 2 fields, 0 draws, 0 subforms
      - **subform** `REF_NUMBER` layout=lr-tb y=27.6807mm w=95mm — 0 fields, 0 draws, 0 subforms
      - **subform** `DELIVERY_NOTE` layout=lr-tb y=-45.0003mm w=95mm — 2 fields, 0 draws, 0 subforms
      - **subform** `ORDER_NUMBER` layout=lr-tb y=-27.0002mm w=95mm — 0 fields, 0 draws, 0 subforms
      - **subform** `PREDECESSOR` layout=lr-tb y=61.1187mm w=95mm — 0 fields, 0 draws, 0 subforms
      - **subform** `TAX_LICENCE_NO` layout=lr-tb y=109.2574mm w=95mm — 2 fields, 0 draws, 0 subforms
  - **subform** `ALTERNATIVE_PAYMENT_TERMS` layout=tb  — 4 fields, 0 draws, 2 subforms; bind $record.BIL_PRT_COM.HEAD_DETAIL.ALTERNATIVE_PAYMENT_TERMS; margin 0mm/0mm/0mm/0mm
    - **subformSet** `SUB_ALTERNATIVE` relation=choice  — 4 fields, 0 draws, 2 subforms
      - **subform** `TRUE` layout=tb  — 3 fields, 0 draws, 0 subforms; bind TRUE; margin 0mm/0mm/0mm/0mm
      - **subform** `FALSE` y=0.433071in — 1 fields, 0 draws, 0 subforms; bind FALSE; margin 0mm/0mm/0mm/0mm
  - **subform** `WEIGHTS_VOL` layout=tb w=195mm — 6 fields, 1 draws, 3 subforms; margin 2mm/0/0/0
    - **subform** `NET_WEIGHT` layout=lr-tb y=6.8224mm w=195mm — 2 fields, 0 draws, 0 subforms
    - **subform** `GROSS_WEIGHT` layout=lr-tb y=12.3504mm w=195mm — 2 fields, 0 draws, 0 subforms
    - **subform** `VOLUME` layout=lr-tb y=17.8784mm w=195mm — 2 fields, 0 draws, 0 subforms
  - **subform** `ITEM_DETAIL_1` layout=table cols=[1.178222in 29.6228mm 29.206mm 29.6228mm 29.6228mm 29.6228mm 15.159mm]  — 9 fields, 7 draws, 7 subforms; bind $record.BIL_PRT_COM.ITEM_DETAIL; break overflowLeader=#HeaderRow_ID_copy1
    - **subform** `HEADER_DETAIL_1` layout=row  — 0 fields, 7 draws, 0 subforms; role TH
    - **subform** `DATA_DETAIL_1` layout=row  — 9 fields, 0 draws, 5 subforms; occur 0..-1; bind DATA[*]; keep intact=none; role TR
      - **subform** `BILL_OF_LADING` layout=tb  — 1 fields, 0 draws, 0 subforms
      - **subform** `ORDER_ID` layout=tb  — 1 fields, 0 draws, 0 subforms
      - **subform** `ITEMDESCRIPTION` layout=tb w=30.545mm — 1 fields, 0 draws, 0 subforms
      - **subform** `WEIGHT` y=0mm w=29.623mm h=9.417mm — 2 fields, 0 draws, 0 subforms
      - **subform** `VOLUME` w=29.623mm h=9.417mm — 2 fields, 0 draws, 0 subforms
  - **subform** `ITEM_DETAIL` layout=table cols=[1cm 18.5cm]  — 8 fields, 9 draws, 15 subforms; bind $record.BIL_PRT_COM.ITEM_DETAIL; margin 2mm/0mm/0mm/0mm
    - **subform** `HEADER_DETAIL` layout=row  — 0 fields, 2 draws, 0 subforms; keep intact=none; role TH
    - **subform** `DATA_DETAIL` layout=row  — 8 fields, 7 draws, 13 subforms; occur 0..-1; bind DATA[*]; break overflowLeader=#HEADER; keep intact=none; margin 0mm/0mm/0mm/0mm
      - **subform** `DETAILS` layout=tb  — 7 fields, 7 draws, 12 subforms; margin 0mm/0mm/0mm/0mm
        - **subform** `MATERIAL` layout=lr-tb w=185mm — 0 fields, 0 draws, 0 subforms
        - **subform** `QUANTITY` layout=lr-tb w=185mm — 0 fields, 0 draws, 0 subforms
        - **subform** `ITEM_CONDITIONS` layout=lr-tb w=7.283472in — 7 fields, 7 draws, 3 subforms
          - **subform** `CONDITIONS` layout=table cols=[3cm 3cm 1cm 2cm 1cm 4.4cm]  — 6 fields, 6 draws, 2 subforms; bind CONDITIONS; margin 0mm/0mm/0mm/0mm
            - **subform** `HEADER_COND` layout=row  — 0 fields, 6 draws, 0 subforms; keep intact=none; role TH
            - **subform** `DATA_COND` layout=row  — 6 fields, 0 draws, 0 subforms; occur 0..-1; bind DATA[*]; break overflowLeader=#HEADER_COND; keep intact=none; margin 0mm/0mm/0mm/0mm
        - **subform** `ITEM_CONFIGURATION` layout=lr-tb w=185mm — 0 fields, 0 draws, 0 subforms
        - **subform** `SALES_ORDER` layout=lr-tb w=185mm — 0 fields, 0 draws, 0 subforms
        - **subform** `DELIVERY` layout=lr-tb w=185mm — 0 fields, 0 draws, 0 subforms
        - **subform** `PURCHASE_ORDER` layout=lr-tb w=185mm — 0 fields, 0 draws, 0 subforms
        - **subform** `REF_DOCUMENT` layout=lr-tb w=185mm — 0 fields, 0 draws, 0 subforms
        - **subform** `EXTERNAL_NO` layout=lr-tb w=185mm — 0 fields, 0 draws, 0 subforms
  - **subform** `HEADER_CONDITIONS` layout=table cols=[4.5cm 1cm 3cm 1cm 2cm 1cm 3cm 4cm]  — 9 fields, 8 draws, 2 subforms; bind $record.BIL_PRT_COM.HEAD_DETAIL.CONDITIONS; margin 0mm/0mm/0mm/0mm
    - **subform** `HEADER_CONDITION` layout=row  — 0 fields, 8 draws, 0 subforms; keep intact=none; role TH
    - **subform** `DATA_CONDITION` layout=row  — 8 fields, 0 draws, 0 subforms; occur 0..-1; bind DATA[*]; break overflowLeader=#HEADER_CONDITION; keep intact=none; margin 0mm/0mm/0mm/0mm
  - **subform** `DOWN_PAY` layout=lr-tb w=195mm — 0 fields, 0 draws, 0 subforms

## Data bindings (distinct)

`BIL_PRT_COM.HEAD_DETAIL.HEADER_TEXT`, `BIL_PRT_COM.HEAD_DETAIL.FOOTER_TEXT`, `BIL_PRT_COM.ITEM_DETAIL.DATA[*].WATERMARK`, `$record.BIL_PRT_COM.HEAD_DETAIL.VBDKR.VBELN`, `$record.BIL_PRT_COM.HEAD_DETAIL.VBDKR.FKDAT`, `ADDRESS_HEADER_TEXT_IC`, `TRUE`, `ADDRESS_HEADER_TEXT`, `FALSE`, `$record.BIL_PRT_COM.HEAD_DETAIL.ALTERNATIVE_ADDRESS_HEADER_TEXT`, `$record.BIL_PRT_COM.HEAD_DETAIL.CUSTOMER_ADDRESS`, `$record.BIL_PRT_COM.HEAD_DETAIL.ADDRESS_SHIP_TO`, `$record.BIL_PRT_COM.HEAD_DETAIL.VBTYP_TEXT`, `$record.BIL_PRT_COM.HEAD_DETAIL.REPEAT`, `$record.BIL_PRT_COM.HEAD_DETAIL.VBDKR.VBELN_VL`, `$record.BIL_PRT_COM.HEAD_DETAIL.VBDKR.LEDAT`, `$record.BIL_PRT_COM.HEAD_DETAIL.VBDKR.KUNRE`, `$record.BIL_PRT_COM.HEAD_DETAIL.VBDKR.STCEG`, `$record.BIL_PRT_COM.HEAD_DETAIL.VBDKR.STCEG_T001`, `$record.BIL_PRT_COM.HEAD_DETAIL.VBDKR.VAT_T001Z`, `$record.BIL_PRT_COM.HEAD_DETAIL.VBDKR.STCD1_T001N`, `$record.BIL_PRT_COM.HEAD_DETAIL.VBDKR.LICNO`, `$record.BIL_PRT_COM.HEAD_DETAIL.VBDKR.LICDT`, `$record.BIL_PRT_COM.HEAD_DETAIL.VBDKR.WAERK`, `ZTERM_TX1`, `ZTERM_TX2`, `ZTERM_TX3`, `PAYMENT_TERMS`, `$record.BIL_PRT_COM.HEAD_DETAIL.ALTERNATIVE_PAYMENT_TERMS`, `$record.BIL_PRT_COM.HEAD_DETAIL.VBDKR.NTGEW`, `$record.BIL_PRT_COM.HEAD_DETAIL.VBDKR.GEWEI`, `$record.BIL_PRT_COM.HEAD_DETAIL.VBDKR.BRGEW`, `$record.BIL_PRT_COM.HEAD_DETAIL.VBDKR.VOLUM`, `$record.BIL_PRT_COM.HEAD_DETAIL.VBDKR.VOLEH`, `BILL_OF_LADING`, `SERVICE_DATE`, `ORD_ID`, `DESCRIPTION`, `GRO_WEI_VAL`, `GRO_WEI_UNI`, `GRO_VOL_VAL`, `GRO_VOL_UNI`, `VBDPR.NETWR`, `DATA[*]`, `$record.BIL_PRT_COM.ITEM_DETAIL`, `VBDPR.POSNR`, `CONDITIONS`, `VTEXT`, `KBETR`, `KOEIN`, `KPEIN`, `KMEIN`, `KWERT`, `$record.BIL_PRT_COM.ITEM_DETAIL.DATA[*].EX_CONDITIONS`, `$record.BIL_PRT_COM.HEAD_DETAIL.VBDKR.NETWR`, `$record.BIL_PRT_COM.HEAD_DETAIL.CONDITIONS`, `MWSKZ`, `KAWRT`, `$record.BIL_PRT_COM.HEAD_DETAIL.EX_CONDITIONS`, `$record.BIL_PRT_COM.HEAD_DETAIL.GROSS_VALUE`

## Fonts (face size weight: count)

Arial: 67; Arial 8pt bold: 16; Arial 8pt: 5; Arial 12pt: 3; Arial 6pt: 2; Arial 72pt bold: 2; Arial 14pt bold: 1; Arial  bold: 1

## UI element types

textEdit 71, imageEdit 1, numericEdit 18, dateTimeEdit 5

## Picture clauses

`date{YYYY-MM-DD}`, `zzzzzz`

## Scripts (35)

```
this.isNull || (this.rawValue >= 0 && this.rawValue <= 255);
```
```
if( this.rawValue == "001" ){ WATERMARK_TEXT.presence = "visible"; }
if( this.rawValue == "000" ){ WATERMARK_TEXT.presence = "invisible"; }
```
```
this.rawValue = xfa.layout.page(this);
```
```
this.rawValue = xfa.layout.pageCount();
```
```
if( this.rawValue == "001" ){ WATERMARK_TEXT.presence = "visible"; }
else { WATERMARK_TEXT.presence = "invisible"; }
```
```
if (HasValue($) == 0)
then $.presence = "hidden"
endif
```
```
if ( HasValue($) == 0 )
then $.parent.presence = "hidden"
endif
```
```
if (HasValue($) == 0)
then $.parent.presence = "hidden"
endif
```
```
if ( HasValue($) == 0 )
  then $.presence = "hidden"
endif
```
```
function testTotalDigits(maxDigits)
{
  var value = this.rawValue.toString();
  var numDigits = 0;
  for (i = 0; i < value.length; i++)
  {
    if (value.charAt(i) >= '0' && value.charAt(i) <= '9')
      numDigits++;
  }
  return (numDigits <= maxDigits);
}
this.isNull || (testTotalDigits(15));
```
```
if (HasValue($) == 0)
then KPEIN.presence = "invisible"
endif
```
