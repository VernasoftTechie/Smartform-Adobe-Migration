" ===== (1) legacy GLOBAL INITIALIZATION - verbatim =====
    DATA : lt_dcp_param TYPE zabtt_dcp_param,
           lr_ekorg     TYPE TABLE OF selopt.

    CALL METHOD zab_dcp_parameters=>get_parameter
      EXPORTING
        iv_param1    = 'ZMM_PO_SES_EKORG'
        iv_param2    = 'EKORG'
      IMPORTING
        et_dcp_param = lt_dcp_param.

    IF lt_dcp_param IS NOT INITIAL.
      lr_ekorg = VALUE #( FOR wa IN lt_dcp_param
                        ( sign = 'I'
                          option = 'EQ'
                          low = wa-value1
                          high = '' ) ).
    ENDIF.

    IF lr_ekorg[] IS NOT INITIAL AND v_bsart EQ 'ZSE1'.
      SELECT SINGLE @abap_true FROM ekko
                    INTO @lv_swap_text_ses
                    WHERE ebeln = @v_ebeln AND
                          ekorg IN @lr_ekorg AND
                          bsart EQ @v_bsart.
      IF sy-subrc NE 0.
        CLEAR lv_swap_text_ses.
      ENDIF.
    ENDIF.
**SOC by Kalyan on 13.08.2026
    SELECT SINGLE bukrs FROM ekko
                     INTO lv_bukrs
                     WHERE ebeln = v_ebeln.
**EOC by Kalyan on 13.08.2026

" ===== (2) legacy program-lines nodes carried verbatim =====
" --- legacy %CODE95 (window COMPANY_NAME - sets LV_FLAG = F for plant 1000 / ZLOC)
IF wa_plant-werks = '1000' AND v_bsart = 'ZLOC' .

  lv_Flag = 'F'.

ENDIF.
*** BOC By Veeresh On 20/03/2023
*IF wa_plant-werks IS NOT INITIAL.
*  SELECT SINGLE ad~name1 FROM t001w AS tw
*                         INNER JOIN t001k AS t0
*                         ON t0~bwkey EQ tw~bwkey
*                         INNER JOIN t001 AS t1
*                         ON t1~bukrs EQ t0~bukrs
*                         INNER JOIN adrc AS ad
*                         ON ad~addrnumber EQ t1~adrnr
*                         INTO lv_comp_name
*                         WHERE tw~werks EQ wa_plant-werks.
*  IF sy-subrc NE 0.
*    lv_comp_name = 'Dangote Cement PLC'.
*  ENDIF.
*ENDIF.
**** EOC By Veeresh On 20/03/2023

" --- legacy %CODE146 (MAIN window - V_DATE (print date))
concatenate sy-datum+6(2) sy-datum+4(2) sy-datum(4) into v_date separated by '-'.

" --- legacy %CODE24 (window PR_DETAILS - CUR_KEY, LV_FVAL1, LV_FVAL2)
*v_fval2 = gv_dmbtr_total + lv_kwert + v2_kwert + v1_kwert + V_KWERT.
*v_fval3 = gv_dmbtr_total + lv_kwert + v2_kwert + v1_kwert + V_KWERT.

*v_fval3 = gv_dmbtr_total + v2_kwert.
*v_fval2 = gv_dmbtr_total + v2_kwert.

if v_flag = 'X'.
  if v_waers eq 'XAF' or v_waers eq 'XOF'.
  CUR_KEY = 'A'.
clear lv_amount.
  lv_amount = V_FVAL .
  call function
  'CURRENCY_AMOUNT_SAP_TO_DISPLAY' "#EC CI_USAGE_OK[2340247]
    exporting
      currency        = V_WAERS "'XAF'
      amount_internal = lv_amount
    importing
      amount_display  = lv_amount
    exceptions
      internal_error  = 1
      others          = 2.
  if sy-subrc <> 0.
* Implement suitable error handling here
  endif.

lv_fval1 = lv_amount .
else.
  CUR_KEY = 'B'.
endif.
elseif v_flag = 'Y'.
  if v_waers eq 'XAF' or v_waers eq 'XOF'.
    CUR_KEY = 'A'.
clear lv_amount.
  lv_amount = V_FVAL1 .
  call function
  'CURRENCY_AMOUNT_SAP_TO_DISPLAY' "#EC CI_USAGE_OK[2340247]
    exporting
      currency        = V_WAERS "'XAF'
      amount_internal = lv_amount
    importing
      amount_display  = lv_amount
    exceptions
      internal_error  = 1
      others          = 2.
  if sy-subrc <> 0.
* Implement suitable error handling here
  endif.

lv_fval2 = lv_amount .
  else.
    CUR_KEY = 'B'.
  endif.
endif.

" --- legacy %CODE171 (window PO_DETAILS - last-changed date/time (LV_VAR4))
***SOC by Kalyan on 11.12.2025
SPLIT v_pono AT '/' INTO lv_var1 lv_var2 lv_var3 lv_var4.
CLEAR:lv_var1,lv_var2,LV_VAR4.
SELECT SINGLE lastchangedatetime FROM ekko
                                 INTO lv_last_changed_on
                                 WHERE ebeln = lv_var3.
IF sy-subrc = 0.
  LV_VAR4 = lv_last_changed_on.
  CONDENSE LV_VAR4 NO-GAPS.
  SPLIT LV_VAR4 at '.' INTO LV_VAR1 lv_var2.
  LV_PKTIM = LV_VAR1.
CALL FUNCTION 'PK_TIMESTAMP_INTO_DATE_TIME'
  EXPORTING
    iv_pktim       = LV_PKTIM
    iv_werks       = ' '
 IMPORTING
   EV_PKLDT       = LV_PKLDT
   EV_PKLUZ       = LV_PKLUZ.
ENDIF.
CLEAR:LV_VAR1,LV_VAR2,LV_VAR3,LV_VAR4.
CONCATENATE LV_PKLDT+6(2) LV_PKLDT+4(2) LV_PKLDT+0(4)
INTO lv_var1 SEPARATED BY '.'.
CONCATENATE LV_PKLUZ+0(2) LV_PKLUZ+2(2) LV_PKLUZ+4(2)
INTO lv_var2 SEPARATED BY ':'.
CLEAR: lv_var4.
CONCATENATE LV_var1 LV_var2 INTO LV_VAR4 SEPARATED BY ' '.
***EOC by Kalyan on 11.12.2025

" --- legacy %CODE84 (MAIN window - header texts F01-F16 into IT_HEAD_TXT (+ down payment lines))
DATA: lv_name TYPE thead-tdname,
      lv_id   TYPE thead-tdid.
SELECT SINGLE *  INTO lv_ekko
                 FROM ekko WHERE ebeln  = v_ebeln.

DO 16 TIMES.

  lv_name = v_ebeln ."wa_ekpo-ebeln.

  CASE sy-index.
    WHEN 1.
      lv_id = 'F01'.
      ls_head_txt-tdline = 'Header Text:'.
    WHEN 2.
      lv_id = 'F02'.
      ls_head_txt-tdline = 'Header Note:'.
    WHEN 3.
      lv_id = 'F03'.
      ls_head_txt-tdline = 'Pricing Types:'.
    WHEN 4.
      lv_id = 'F04'.
      ls_head_txt-tdline = 'Deadlines:'.
    WHEN 5.
      lv_id = 'F05'.
      ls_head_txt-tdline = 'Terms of Delivery:'.
    WHEN 6.
      lv_id = 'F06'.
      ls_head_txt-tdline = 'Shipping Instruction:'.
    WHEN 7.
      lv_id = 'F07'.
      ls_head_txt-tdline = 'Terms of Payment:'.
    WHEN 8.
      lv_id = 'F08'.
      ls_head_txt-tdline = 'Warranties:'.
    WHEN 9.
      lv_id = 'F09'.
      ls_head_txt-tdline = 'Penalty for breach of contract:'.
    WHEN 10.
      lv_id = 'F10'.
      ls_head_txt-tdline = 'Guarantees:'.
    WHEN 11.
      lv_id = 'F11'.
      ls_head_txt-tdline = 'Contract riders (clauses):'.
    WHEN 12.
      lv_id = 'F12'.
      ls_head_txt-tdline = 'Asset:'.
    WHEN 13.
      lv_id = 'F13'.
      ls_head_txt-tdline = 'Other contractul Stipulations:'.
    WHEN 14.
      lv_id = 'F14'.
      ls_head_txt-tdline = 'Delivery:'.
    WHEN 15.
      lv_id = 'F15'.
      ls_head_txt-tdline = 'Vendor memo(general):'.
    WHEN 16.
      lv_id = 'F16'.
      ls_head_txt-tdline = 'Vendor memo(special):'.
  ENDCASE.

  CALL FUNCTION 'READ_TEXT'
    EXPORTING
      client                  = sy-mandt
      id                      = lv_id
      language                = 'E' "sy-langu
      name                    = lv_name
      object                  = 'EKKO'
    TABLES
      lines                   = it_rtext
    EXCEPTIONS
      id                      = 1
      language                = 2
      name                    = 3
      not_found               = 4
      object                  = 5
      reference_check         = 6
      wrong_access_to_archive = 7
      OTHERS                  = 8.
  IF sy-subrc <> 0.
* Implement suitable error handling here
  ENDIF.


  IF it_rtext[] IS NOT INITIAL.
    APPEND ls_head_txt TO it_head_txt.
    CLEAR ls_head_txt.

    IF lv_ekko-dppct IS NOT INITIAL AND lv_id = 'F07'.
      IF v_waers = 'JPY'.

        lv_dwnpmt = lv_ekko-dppct.
        CONCATENATE 'Down Payment:' lv_dwnpmt '%' INTO ls_head_txt-tdline .
        APPEND ls_head_txt TO it_head_txt.

        lv_dwnpmt2 = ( lv_ekko-dpamt / 10 ).
        lv_dwnpmt1 = lv_dwnpmt2.
        CONDENSE lv_dwnpmt1.
        CONCATENATE 'Down Payment Amount:' lv_dwnpmt1 v_waers INTO ls_head_txt-tdline SEPARATED BY space.
        APPEND ls_head_txt TO it_head_txt.
        CLEAR ls_head_txt.
*  append ls_head_txt to it_head_txt.

      ELSE.

        lv_dwnpmt = lv_ekko-dppct.
        CONCATENATE 'Down Payment:' lv_dwnpmt '%' INTO ls_head_txt-tdline .
        APPEND ls_head_txt TO it_head_txt.

        lv_dwnpmt1 = lv_ekko-dpamt.
        CONDENSE lv_dwnpmt1.
        CONCATENATE 'Down Payment Amount:' lv_dwnpmt1 v_waers INTO ls_head_txt-tdline SEPARATED BY space.
        APPEND ls_head_txt TO it_head_txt.
        CLEAR ls_head_txt.
*  append ls_head_txt to it_head_txt.

      ENDIF.
    ENDIF.

    APPEND LINES OF it_rtext[] TO it_head_txt.
    CLEAR it_rtext[].
    APPEND ls_head_txt TO it_head_txt.

  ELSE.
    CLEAR ls_head_txt.
  ENDIF.

ENDDO.

*if lv_ekko-dppct is not INITIAL.
* if v_waers = 'JPY'.
*  LV_DWNPMT2 = ( LV_EKKO-DPAMT / 10 ).
*  LV_DWNPMT1 = LV_DWNPMT2.
*  CONCATENATE 'Down Payment Amount:' LV_DWNPMT1 '' v_waers into ls_head_txt-TDLINE.
*  append ls_head_txt to it_head_txt.
*
*  LV_DWNPMT = LV_EKKO-DPPCT.
*  CONCATENATE 'Down Payment:' LV_DWNPMT '% Paid' INTO ls_head_txt-TDLINE .
*  append ls_head_txt to it_head_txt.
*  clear ls_head_txt.
*  append ls_head_txt to it_head_txt.
*else.
*  LV_DWNPMT1 = LV_EKKO-DPAMT.
*  CONCATENATE 'Down Payment Amount:' LV_DWNPMT1 '' v_waers into ls_head_txt-TDLINE.
*  append ls_head_txt to it_head_txt.
*
*  LV_DWNPMT = LV_EKKO-DPPCT.
*  CONCATENATE 'Down Payment:' LV_DWNPMT '%' INTO ls_head_txt-TDLINE .
*  append ls_head_txt to it_head_txt.
*  clear ls_head_txt.
*  append ls_head_txt to it_head_txt.
*endif.
*endif.

LOOP AT it_head_txt INTO ls_head_txt.
  REPLACE ALL OCCURRENCES OF '<(>' IN ls_head_txt-tdline WITH space.
  REPLACE ALL OCCURRENCES OF '<)>' IN ls_head_txt-tdline WITH space.
  MODIFY it_head_txt FROM ls_head_txt.
  CLEAR ls_head_txt.
ENDLOOP.

" Added By Nepal Singh on 19.08.2025 for issue Table row greater than 176 cm
*DATA(it_head_txt1) = it_head_txt.
" Added By Nepal Singh on 19.08.2025 for issue Table row greater than 176 cm

" ===== (3) print-data preparation (new code) =====
" An Adobe Context has no per-row program lines. Everything the Smart Form computed while
" printing is computed here once into flat tables that the layout loops over. Each block
" names the legacy node(s) whose statements it re-uses; see ymm_po_smartform_initialization.md.
DATA: ls_item_out TYPE ty_s_item_out,
      ls_itxt_out TYPE ty_s_itxt_out,
      lv_wr       TYPE c LENGTH 120,
      lv_wr2      TYPE c LENGTH 120,
      lv_head_idx TYPE i,
      lv_item_idx TYPE i,
      lv_itxt_idx TYPE i,
      lv_kind     TYPE i,
      lv_tx_id    TYPE thead-tdid,
      lv_tx_name  TYPE thead-tdname,
      lv_tx_label TYPE string,
      lv_tx_head  TYPE string,
      lv_tx_flag  TYPE c LENGTH 1.

" --- (3a) header texts: legacy %CODE126/%CODE127/%CODE128 chunked print loop -> one flat table
LOOP AT it_head_txt INTO ls_head_txt.
  REPLACE ALL OCCURRENCES OF '*' IN ls_head_txt WITH ''.     " legacy %CODE128
  lv_head_idx = lv_head_idx + 1.
  APPEND VALUE #( idx = lv_head_idx tdline = ls_head_txt-tdline ) TO gt_head_out.
ENDLOOP.

" --- (3b) V_FLAG = X: legacy %TABLE1 (IT_EKPO) - row nodes %CODE1/6/22/25/14, footer %CODE85
IF v_flag = 'X'.
  LOOP AT it_ekpo INTO wa_ekpo.
    " legacy %CODE1
    v_slno = v_slno + 1.
    " legacy %CODE6 (lv_name renamed lv_matname: %CODE84 declares lv_name in the same scope)
    data : lt_lines type table of TLINE with header line,
          lv_matname type THEAD-TDNAME.

    clear : lt_lines[], lt_lines, lv_matname, gv_text.

    lv_matname = wa_ekpo-matnr.  "#EC CI_FLDEXT_OK[2215424]


    CALL FUNCTION 'READ_TEXT'
      EXPORTING
       CLIENT                        = SY-MANDT
        id                            = 'GRUN'
        language                      = sy-langu
        NAME                          = lv_matname
        OBJECT                        = 'MATERIAL'
*   ARCHIVE_HANDLE                = 0
*   LOCAL_CAT                     = ' '
* IMPORTING
*   HEADER                        =
      TABLES
        lines                         = lt_lines
     EXCEPTIONS
       ID                            = 1
       LANGUAGE                      = 2
       NAME                          = 3
       NOT_FOUND                     = 4
       OBJECT                        = 5
       REFERENCE_CHECK               = 6
       WRONG_ACCESS_TO_ARCHIVE       = 7
       OTHERS                        = 8
              .
    IF sy-subrc <> 0.
* Implement suitable error handling here
    ENDIF.

    LOOP AT lt_lines.
    concatenate GV_TEXT lt_lines-tdline into GV_TEXT separated by space.
    clear lt_lines.
    ENDLOOP.


    CONCATENATE wa_ekpo-ebeln wa_ekpo-ebelp INTO gv_textname.
    " legacy %CODE22
    lv_menge = wa_ekpo-menge.
    " legacy %CODE25
*lv_netpr = WA_EKPO-NETPR / 100.

    clear lv_amount.
    if v_waers eq 'XAF' or v_waers eq 'XOF'.
      lv_amount = wa_ekpo-netpr .
      call function     "#EC CI_USAGE_OK[2340247]
      'CURRENCY_AMOUNT_SAP_TO_DISPLAY'
        exporting
          currency        = V_WAERS "'XAF'
          amount_internal = lv_amount
        importing
          amount_display  = lv_amount
        exceptions
          internal_error  = 1
          others          = 2.
      if sy-subrc <> 0.
* Implement suitable error handling here
      endif.

    lv_netpr1 = lv_amount .
    else.
      "lv_netpr1 = wa_ekpo-netpr.
    endif.
    " legacy %CODE14
    clear lv_amount.
    if v_waers eq 'XAF' or v_waers eq 'XOF'.
      lv_amount = wa_ekpo-netwr .
      call function   "#EC CI_USAGE_OK[2340247]
      'CURRENCY_AMOUNT_SAP_TO_DISPLAY'
        exporting
          currency        = V_WAERS "'XAF'
          amount_internal = lv_amount
        importing
          amount_display  = lv_amount
        exceptions
          internal_error  = 1
          others          = 2.
      if sy-subrc <> 0.
* Implement suitable error handling here
      endif.

    lv_netwr = lv_amount .
    LV_TOTAL = LV_TOTAL + lv_netwr.
    else.
    lv_tot = lv_tot + wa_ekpo-netwr .
    endif.
    " print row (legacy text nodes %TEXT10/11/101/102/13/21/16/14/184/107/187)
    CLEAR ls_item_out.
    lv_item_idx = lv_item_idx + 1.
    ls_item_out-idx = lv_item_idx.
    ls_item_out-slno = |{ v_slno }|.
    WRITE wa_ekpo-matnr TO lv_wr LEFT-JUSTIFIED.
    ls_item_out-code = lv_wr.
    ls_item_out-descr = wa_ekpo-txz01.
    ls_item_out-mattxt = gv_text.
    IF wa_ekpo-peinh <> 1.
      WRITE wa_ekpo-peinh TO lv_wr LEFT-JUSTIFIED.
      WRITE wa_ekpo-meins TO lv_wr2 LEFT-JUSTIFIED.
      ls_item_out-uom = |{ lv_wr } Qty / { lv_wr2 }|.
    ELSE.
      WRITE wa_ekpo-meins TO lv_wr LEFT-JUSTIFIED.
      ls_item_out-uom = lv_wr.
    ENDIF.
    WRITE lv_menge TO lv_wr LEFT-JUSTIFIED.
    ls_item_out-menge = lv_wr.
    IF v_waers = 'XAF' OR v_waers = 'XOF'.
      WRITE lv_netpr1 TO lv_wr LEFT-JUSTIFIED.
      WRITE lv_netwr TO lv_wr2 LEFT-JUSTIFIED.
    ELSE.
      WRITE wa_ekpo-netpr TO lv_wr LEFT-JUSTIFIED.
      WRITE wa_ekpo-netwr TO lv_wr2 LEFT-JUSTIFIED.
    ENDIF.
    ls_item_out-netpr = lv_wr.
    ls_item_out-netwr = lv_wr2.
    APPEND ls_item_out TO gt_ekpo_out.
  ENDLOOP.
  " footer total (legacy %TEXT108 / %TEXT189)
  IF v_waers = 'XAF' OR v_waers = 'XOF'.
    WRITE lv_total TO lv_wr LEFT-JUSTIFIED.
  ELSE.
    WRITE lv_tot TO lv_wr LEFT-JUSTIFIED.
  ENDIF.
  gv_ekpo_total_txt = lv_wr.
  " legacy %CODE85 (footer: total in words)
  "BREAK-POINT.
  clear: v_amt, amt_words.
*data: v_amt type dmbtr.
  if v_waers = 'JPY'.
    v_amt = v_fval * 10.
  elseif v_waers = 'XAF' OR v_waers = 'XOF'.
   " v_amt = v_fval.

   clear lv_amount.
    lv_amount = V_FVAL .
    call function         "#EC CI_USAGE_OK[2340247]
    'CURRENCY_AMOUNT_SAP_TO_DISPLAY'
      exporting
        currency        = V_WAERS "'XAF'
        amount_internal = lv_amount
      importing
        amount_display  = lv_amount
      exceptions
        internal_error  = 1
        others          = 2.
    if sy-subrc <> 0.
* Implement suitable error handling here
    endif.


  if V_BSART  = 'ZIMP' OR V_BSART = 'ZLOC'.
    v_amt = v_fval.
  else.
    v_amt = lv_amount .         "#EC CI_FLDEXT_OK[2610650]
  endif.

  CALL FUNCTION 'SPELL_AMOUNT'  "#EC CI_FLDEXT_OK[2610650]
   EXPORTING
     AMOUNT          = v_amt
     CURRENCY        = V_WAERS"'USD'
*   FILLER          = ' '
     LANGUAGE        = SY-LANGU
   IMPORTING
     IN_WORDS        = words
* EXCEPTIONS
*   NOT_FOUND       = 1
*   TOO_LARGE       = 2
*   OTHERS          = 3
            .
  IF SY-SUBRC <> 0.
* Implement suitable error handling here
  ENDIF.



  "IF WORDS-DECWORD NE 'ZERO'.
  CONCATENATE WORDS-WORD lv_ktext
  "'AND' WORDS-DECWORD lv_cents 'ONLY'
  INTO AMT_WORDS SEPARATED BY space.
  "ELSE.
  "CONCATENATE WORDS-WORD lv_ktext 'ONLY ON' INTO AMT_WORDS SEPARATED BY
  "space.
  "ENDIF.

  CALL FUNCTION       "#EC CI_USAGE_OK[2469385]
  'ZABF_ISP_CONVERT_FRSTCHAR_TOUP'      " ISP_CONVERT_FIRSTCHARS_TOUPPER'
      EXPORTING
        INPUT_STRING        = AMT_WORDS
       SEPARATORS          = ' -.,;:'
     IMPORTING
       OUTPUT_STRING       = lv_amt_words.
  else.
      v_amt = v_fval.
   CALL FUNCTION 'SPELL_AMOUNT'   "#EC CI_FLDEXT_OK[2610650]
   EXPORTING
     AMOUNT          = v_amt
     CURRENCY        = V_WAERS"'USD'
*   FILLER          = ' '
     LANGUAGE        = SY-LANGU
   IMPORTING
     IN_WORDS        = words
* EXCEPTIONS
*   NOT_FOUND       = 1
*   TOO_LARGE       = 2
*   OTHERS          = 3
            .
  IF SY-SUBRC <> 0.
* Implement suitable error handling here
  ENDIF.


  IF WORDS-DECWORD NE 'ZERO'.
  CONCATENATE WORDS-WORD lv_ktext
  'AND' WORDS-DECWORD lv_cents 'ONLY'
  INTO AMT_WORDS SEPARATED BY space.
  ELSE.
  CONCATENATE WORDS-WORD lv_ktext 'ONLY ON' INTO AMT_WORDS SEPARATED BY
  space.
  ENDIF.

  CALL FUNCTION       "#EC CI_USAGE_OK[2469385]
  'ZABF_ISP_CONVERT_FRSTCHAR_TOUP'      " 'ISP_CONVERT_FIRSTCHARS_TOUPPER'
      EXPORTING
        INPUT_STRING        = AMT_WORDS
       SEPARATORS          = ' -.,;:'
     IMPORTING
       OUTPUT_STRING       = lv_amt_words     .
  endif.
ELSEIF v_flag = 'Y'.
  " --- (3c) V_FLAG = Y: legacy %TABLE2 (IT_ESLL) - row nodes %CODE3/23/94/8/27, footer %CODE86
  "      legacy %CODE7 (loop over IT_EKPO setting only GV_TEXTNAME, which no text node prints) is not carried
  LOOP AT it_esll INTO wa_esll.
    " legacy %CODE3
    v_slno = v_slno + 1.
    " legacy %CODE23
    lv_menge = wa_esll-menge.
    " legacy %CODE94
    if v_waers = 'JPY'.
      wa_esll-tbtwr = wa_esll-tbtwr / 10 .
    else.
      wa_esll-tbtwr = wa_esll-tbtwr.
    endif.

    clear: lv_amount, lv_netpr1.
    if v_waers eq 'XAF' or v_waers eq 'XOF'.
      lv_amount = wa_esll-tbtwr.
      call function         "#EC CI_USAGE_OK[2340247]
      'CURRENCY_AMOUNT_SAP_TO_DISPLAY'
        exporting
          currency        = 'XAF'
          amount_internal = lv_amount
        importing
          amount_display  = lv_amount
        exceptions
          internal_error  = 1
          others          = 2.
      if sy-subrc <> 0.
* Implement suitable error handling here
      endif.

    lv_netpr1 = lv_amount .
    else.
      "lv_netpr1 = wa_esll-tbtwr.
    endif.
    " legacy %CODE8
**GV_DMBTR = WA_ESLL-TBTWR * WA_ESLL-MENGE.
**gv_dmbtr_total = gv_dmbtr_total + gv_dmbtr.
*v_fval2 = gv_dmbtr_total + lv_kwert + v2_kwert + v1_kwert + V_KWERT.

    GV_DMBTR = WA_ESLL-TBTWR * WA_ESLL-MENGE. "#EC CI_FLDEXT_OK[2610650]
    gv_dmbtr_total = gv_dmbtr_total + gv_dmbtr.

    clear: lv_amount, lv_netwr.
      lv_amount = GV_DMBTR.
      call function   "#EC CI_USAGE_OK[2340247]
      'CURRENCY_AMOUNT_SAP_TO_DISPLAY'
        exporting
          currency        = 'XAF'
          amount_internal = lv_amount
        importing
          amount_display  = lv_amount
        exceptions
          internal_error  = 1
          others          = 2.
      if sy-subrc <> 0.
* Implement suitable error handling here
      endif.

    lv_netwr = lv_amount .

*clear: lv_amount, lv_total.
*  lv_amount = gv_dmbtr_total.
*  call function 'CURRENCY_AMOUNT_SAP_TO_DISPLAY'
*    exporting
*      currency        = 'XAF'
*      amount_internal = lv_amount
*    importing
*      amount_display  = lv_amount
*    exceptions
*      internal_error  = 1
*      others          = 2.
*  if sy-subrc <> 0.
** Implement suitable error handling here
*  endif.

    lv_total = lv_total + lv_amount .
    " print row (legacy text nodes %TEXT30/31/103/33/35/34/185/42/186)
    CLEAR ls_item_out.
    lv_item_idx = lv_item_idx + 1.
    ls_item_out-idx = lv_item_idx.
    ls_item_out-slno = |{ v_slno }|.
    WRITE wa_esll-srvpos TO lv_wr LEFT-JUSTIFIED.
    ls_item_out-code = lv_wr.
    ls_item_out-descr = wa_esll-ktext1.
    WRITE wa_esll-meins TO lv_wr LEFT-JUSTIFIED.
    ls_item_out-uom = lv_wr.
    WRITE lv_menge TO lv_wr LEFT-JUSTIFIED.
    ls_item_out-menge = lv_wr.
    IF v_waers = 'XAF' OR v_waers = 'XOF'.
      WRITE lv_netpr1 TO lv_wr LEFT-JUSTIFIED.
      WRITE lv_netwr TO lv_wr2 LEFT-JUSTIFIED.
    ELSE.
      WRITE wa_esll-tbtwr TO lv_wr LEFT-JUSTIFIED.
      WRITE gv_dmbtr TO lv_wr2 LEFT-JUSTIFIED.
    ENDIF.
    ls_item_out-netpr = lv_wr.
    ls_item_out-netwr = lv_wr2.
    APPEND ls_item_out TO gt_esll_out.
    " legacy %CODE27 (after the row is printed)
    clear GV_DMBTR.
  ENDLOOP.
  " footer total (legacy %TEXT18 / %TEXT188)
  IF v_waers = 'XAF' OR v_waers = 'XOF'.
    WRITE lv_total TO lv_wr LEFT-JUSTIFIED.
  ELSE.
    WRITE gv_dmbtr_total TO lv_wr LEFT-JUSTIFIED.
  ENDIF.
  gv_esll_total_txt = lv_wr.
  " legacy %CODE86 (footer: total in words)
  clear: v_amt, amt_words, lv_amount.
*data: v_amt type dmbtr.
  if v_waers = 'JPY'.
    v_amt = v_fval1 * 10.
  elseif v_waers = 'XOF' or v_waers = 'XAF'.
     lv_amount = v_fval1.
    call function
    'CURRENCY_AMOUNT_SAP_TO_DISPLAY' "#EC CI_USAGE_OK[2340247]
      exporting
        currency        = 'XAF'
        amount_internal = lv_amount
      importing
        amount_display  = lv_amount
      exceptions
        internal_error  = 1
        others          = 2.
    if sy-subrc <> 0.
* Implement suitable error handling here
    endif.

  v_amt_xaf = lv_amount .

  CALL FUNCTION 'SPELL_AMOUNT'    "#EC CI_FLDEXT_OK[2610650]
   EXPORTING
     AMOUNT          = v_amt_xaf
     CURRENCY        = V_WAERS "'USD'
*   FILLER          = ' '
     LANGUAGE        = SY-LANGU
   IMPORTING
     IN_WORDS        = words
* EXCEPTIONS
*   NOT_FOUND       = 1
*   TOO_LARGE       = 2
*   OTHERS          = 3
            .
  IF SY-SUBRC <> 0.
* Implement suitable error handling here
  ENDIF.

  "IF WORDS-DECWORD NE 'ZERO'.
  CONCATENATE WORDS-WORD lv_ktext
  "'AND' WORDS-DECWORD lv_cents
  'ONLY' INTO AMT_WORDS SEPARATED BY space.
  "ELSE.
  "CONCATENATE WORDS-WORD lv_ktext 'ONLY ON' INTO AMT_WORDS SEPARATED BY
  "space.
  "ENDIF.

  CALL FUNCTION
  'ZABF_ISP_CONVERT_FRSTCHAR_TOUP'    " ISP_CONVERT_FIRSTCHARS_TOUPPER'  "#EC CI_USAGE_OK[2469385]
      EXPORTING
        INPUT_STRING        = AMT_WORDS
       SEPARATORS          = ' -.,;:'
     IMPORTING
       OUTPUT_STRING       = lv_amt_words.

  else.
    v_amt = v_fval1.


  CALL FUNCTION 'SPELL_AMOUNT'    "#EC CI_FLDEXT_OK[2610650]
   EXPORTING
     AMOUNT          = v_amt
     CURRENCY        = V_WAERS "'USD'
*   FILLER          = ' '
     LANGUAGE        = SY-LANGU
   IMPORTING
     IN_WORDS        = words
* EXCEPTIONS
*   NOT_FOUND       = 1
*   TOO_LARGE       = 2
*   OTHERS          = 3
            .
  IF SY-SUBRC <> 0.
* Implement suitable error handling here
  ENDIF.

  IF WORDS-DECWORD NE 'ZERO'.
  CONCATENATE WORDS-WORD lv_ktext 'AND' WORDS-DECWORD lv_cents 'ONLY'
  INTO AMT_WORDS SEPARATED BY space.
  ELSE.
  CONCATENATE WORDS-WORD lv_ktext 'ONLY ON' INTO AMT_WORDS SEPARATED BY
  space.
  ENDIF.

  CALL FUNCTION
  'ZABF_ISP_CONVERT_FRSTCHAR_TOUP'      " ISP_CONVERT_FIRSTCHARS_TOUPPER'  "#EC CI_USAGE_OK[2469385]
      EXPORTING
        INPUT_STRING        = AMT_WORDS
       SEPARATORS          = ' -.,;:'
     IMPORTING
       OUTPUT_STRING       = lv_amt_words
              .
  endif.
ENDIF.

" --- (3d) item texts: legacy window-level loops %LOOP50/73/76/79/82 over IT_EKPO (nodes %CODE101/129/133/137/141, the 150-line
"      chunking %CODE102.. and the print loops) - one pass per text id; the five nodes differ only in text id, flag and heading.
"      The 150-line chunk loop (LT_COUNT) is not carried: it only worked around a Smart Forms row-height limit (see notes).
DO 5 TIMES.
  lv_kind = sy-index.
  CASE lv_kind.
    WHEN 1.
      lv_tx_id = 'F01'.
      lv_tx_label = 'Item Text'.
    WHEN 2.
      lv_tx_id = 'F02'.
      lv_tx_label = 'Info record PO text'.
    WHEN 3.
      lv_tx_id = 'F03'.
      lv_tx_label = 'Material PO Text'.
    WHEN 4.
      lv_tx_id = 'F04'.
      lv_tx_label = 'Delivery Text'.
    WHEN 5.
      lv_tx_id = 'F05'.
      lv_tx_label = 'Info record note'.
  ENDCASE.
  CLEAR: lv_tx_flag, lv_tx_head, count.
  LOOP AT it_ekpo INTO wa_ekpo.
    count = count + 1.
    CONCATENATE wa_ekpo-ebeln wa_ekpo-ebelp INTO gv_textname1.
    CLEAR: it_rtext, wa_rtext, lv_tx_name, gv_text.
    lv_tx_name = gv_textname1.
    CALL FUNCTION 'READ_TEXT'
      EXPORTING
        client                  = sy-mandt
        id                      = lv_tx_id
        language                = 'E'
        name                    = lv_tx_name
        object                  = 'EKPO'
      TABLES
        lines                   = it_rtext
      EXCEPTIONS
        id                      = 1
        language                = 2
        name                    = 3
        not_found               = 4
        object                  = 5
        reference_check         = 6
        wrong_access_to_archive = 7
        OTHERS                  = 8.
    IF sy-subrc <> 0.
* Implement suitable error handling here
    ENDIF.
    READ TABLE it_rtext INTO wa_rtext INDEX 1.
    IF sy-subrc = 0.
      CONCATENATE count wa_rtext INTO wa_rtext.
      REPLACE FIRST OCCURRENCE OF '*' IN wa_rtext WITH space.
      MODIFY it_rtext FROM wa_rtext INDEX 1.
      CLEAR wa_rtext.
    ENDIF.
    IF lv_tx_flag = ''.
      IF it_rtext IS NOT INITIAL.
        lv_tx_head = lv_tx_label.
        lv_tx_flag = 'X'.
      ENDIF.
    ELSE.
      CLEAR lv_tx_head.
    ENDIF.
    LOOP AT it_rtext INTO wa_rtext.
      REPLACE ALL OCCURRENCES OF '<(>' IN wa_rtext-tdline WITH space.
      REPLACE ALL OCCURRENCES OF '<)>' IN wa_rtext-tdline WITH space.
      MODIFY it_rtext FROM wa_rtext.
      CLEAR wa_rtext.
    ENDLOOP.
    IF lv_tx_head <> ' '.
      lv_itxt_idx = lv_itxt_idx + 1.
      CLEAR ls_itxt_out.
      ls_itxt_out-idx = lv_itxt_idx.
      ls_itxt_out-rtype = 'H'.
      ls_itxt_out-text = |{ lv_tx_head }:|.
      APPEND ls_itxt_out TO gt_itxt_out.
    ENDIF.
    LOOP AT it_rtext INTO wa_rtext.
      REPLACE ALL OCCURRENCES OF '*' IN wa_rtext WITH ''.     " legacy %CODE64/65/66/67/68
      IF wa_rtext <> ' '.
        lv_itxt_idx = lv_itxt_idx + 1.
        CLEAR ls_itxt_out.
        ls_itxt_out-idx = lv_itxt_idx.
        ls_itxt_out-rtype = 'L'.
        ls_itxt_out-text = |{ wa_rtext-tdformat }{ wa_rtext-tdline }|.
        APPEND ls_itxt_out TO gt_itxt_out.
      ENDIF.
    ENDLOOP.
  ENDLOOP.
  CLEAR: it_rtext, count.      " legacy %CODE104/132/136/140/144
ENDDO.

" --- (3e) terms-and-conditions selector: legacy alternatives %CONDITION209 (V_FLAG = X, node %CODE147) and %CONDITION213 (V_FLAG = Y, node %CODE145)
IF v_flag = 'X'.
  " legacy %CODE147
*BREAK abap2.
  IF ( V_BSART = 'ZIMP' ) AND LV_KTOKK = 'Z002'
      and ( LV_EKGRP ne 'CE2' OR LV_EKGRP NE 'CE4' ).
    lv_cond = 'X'.
  ELSEIF
    ( V_BSART = 'ZIMP' OR V_BSART = 'ZSU2') and ( LV_EKGRP ne 'CE2' OR LV_EKGRP NE 'CE4' ).
    lv_cond = 'Y'.
  ELSEIF
    ( v_bsart = 'ZLOC'  OR v_bsart = 'ZSU1') and ( lv_ekgrp ne 'CE2' OR lv_ekgrp ne 'CE4' )."Commented by kalyan
    lv_cond = 'Z'.
  ELSEIF
    ( v_bsart = 'ZCAS' ) and ( lv_ekgrp ne 'CE2' OR lv_ekgrp ne 'CE4' ).
    lv_cond = 'A'.
  ELSEIF
    ( V_BSART = 'ZIM2' ) AND LV_KTOKK = 'Z002'
      and ( LV_EKGRP ne 'CE2' OR LV_EKGRP NE 'CE4' ).
    lv_cond = 'B'.
  ELSEIF
    ( V_BSART = 'ZIM2' ) and ( LV_EKGRP ne 'CE2' OR LV_EKGRP NE 'CE4' ).
    lv_cond = 'C'.
*ELSEIF
*  ( v_bsart = 'ZSU1' ) and ( lv_ekgrp ne 'CE2' OR lv_ekgrp ne 'CE4' ).
*  lv_cond = 'D'.
  ENDIF.
ELSEIF v_flag = 'Y'.
  " legacy %CODE145
  clear lv_cond.

  IF ( V_BSART = 'ZSE2') and ( LV_EKGRP ne 'CE2' OR LV_EKGRP NE 'CE4' ).
    lv_cond = 'X'.
  ELSEIF
    ( V_BSART = 'ZREL') and ( LV_EKGRP ne 'CE2' OR LV_EKGRP NE 'CE4' ).
    lv_cond = 'Y'.
  ENDIF.
ENDIF.

" --- (3f) PR numbers: legacy loop %LOOP45 over IT_EBAN (only if V_FLAG = X), node %CODE89
IF v_flag = 'X'.
  LOOP AT it_eban INTO wa_eban.
    if wa_eban-banfn is not INITIAL.
      if sy-tabix = 1.
        gv_prno1 = wa_eban-banfn.
      elseif sy-tabix = 2.
        gv_prno2 = wa_eban-banfn.
      elseif sy-tabix = 3.
        gv_prno3 = wa_eban-banfn.
      elseif sy-tabix = 4.
        gv_prno4 = wa_eban-banfn.
      elseif sy-tabix = 5.
        gv_prno5 = wa_eban-banfn.
      endif.
       clear wa_eban-banfn.
    endif.
*split wa_eban-banfn at ',' into gv_prno1 gv_prno2.
  ENDLOOP.
ENDIF.
