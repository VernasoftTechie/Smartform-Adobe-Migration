* BOLT: values the layout prints in converted / joined form (strategy S08 section 12).
WRITE lv_lifnr TO gv_lifnr_out.   "vendor number through its domain output routine (legacy &LV_LIFNR&)
CONDENSE gv_lifnr_out.

* header text F01/EKKO (read by legacy %CODE34 into LT_LINES): paragraphs joined; the legacy form prints it
* in PO_DETAIL (%TEXT39, include text) when V_POTEXT is not X
CLEAR gv_hdrtxt.
LOOP AT lt_lines INTO ls_line.
  IF ls_line-tdformat = '/*' OR ls_line-tdformat = '/:'.
    CONTINUE.                                      "comment and command lines are never printed
  ENDIF.
  IF gv_hdrtxt IS INITIAL.
    gv_hdrtxt = ls_line-tdline.
  ELSEIF ls_line-tdformat IS INITIAL.               "continuation line: joined with a blank
    gv_hdrtxt = |{ gv_hdrtxt } { ls_line-tdline }|.
  ELSEIF ls_line-tdformat = '='.                    "joined without a blank
    gv_hdrtxt = |{ gv_hdrtxt }{ ls_line-tdline }|.
  ELSE.                                             "new paragraph = new line
    gv_hdrtxt = |{ gv_hdrtxt }{ cl_abap_char_utilities=>newline }{ ls_line-tdline }|.
  ENDIF.
ENDLOOP.

* standard text ZMMCG_PO_TEXT (ST, language F): legacy include text %TEXT288 = term 1 of the service
* terms for order type ZPOS
CLEAR gv_term1_zpos.
IF v_bsart = 'ZPOS'.
  CLEAR lt_zpos.
  CALL FUNCTION 'READ_TEXT'
    EXPORTING
      id       = 'ST'
      language = 'F'
      name     = 'ZMMCG_PO_TEXT'
      object   = 'TEXT'
    TABLES
      lines    = lt_zpos
    EXCEPTIONS
      OTHERS   = 8.
  LOOP AT lt_zpos INTO ls_zpos.
    IF ls_zpos-tdformat = '/*' OR ls_zpos-tdformat = '/:'.
      CONTINUE.
    ENDIF.
    IF gv_term1_zpos IS INITIAL.
      gv_term1_zpos = ls_zpos-tdline.
    ELSEIF ls_zpos-tdformat IS INITIAL.
      gv_term1_zpos = |{ gv_term1_zpos } { ls_zpos-tdline }|.
    ELSEIF ls_zpos-tdformat = '='.
      gv_term1_zpos = |{ gv_term1_zpos }{ ls_zpos-tdline }|.
    ELSE.
      gv_term1_zpos = |{ gv_term1_zpos }{ cl_abap_char_utilities=>newline }{ ls_zpos-tdline }|.
    ENDIF.
  ENDLOOP.
ENDIF.

