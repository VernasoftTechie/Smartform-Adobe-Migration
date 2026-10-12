* BOLT: values the layout prints in converted / joined form (strategy S08 section 12).
WRITE lv_lifnr TO gv_lifnr_out.   "vendor number through its domain output routine (legacy &LV_LIFNR&)
CONDENSE gv_lifnr_out.
lv_nbsp = cl_abap_conv_in_ce=>uccp( '00A0' ).   "no-break blank: a 1-digit item number keeps the blank the legacy integer output has

* header text F01/EKKO (read by legacy %CODE34 into LT_LINES): paragraphs joined; the legacy form prints it
* in PO_DETAIL (%TEXT39, include text) when V_POTEXT is not X
CLEAR gv_hdrtxt.
LOOP AT lt_lines ASSIGNING FIELD-SYMBOL(<lfs_line>).
  IF <lfs_line>-tdformat = '/*' OR <lfs_line>-tdformat = '/:'.
    CONTINUE.                                      "comment and command lines are never printed
  ENDIF.
  gv_hdrtxt = SWITCH string( <lfs_line>-tdformat
                WHEN space THEN COND string( WHEN gv_hdrtxt IS INITIAL THEN <lfs_line>-tdline
                                             ELSE |{ gv_hdrtxt } { <lfs_line>-tdline }| )   "continuation line: joined with a blank
                WHEN '='   THEN |{ gv_hdrtxt }{ <lfs_line>-tdline }|                         "joined without a blank
                ELSE COND string( WHEN gv_hdrtxt IS INITIAL THEN <lfs_line>-tdline
                                  ELSE |{ gv_hdrtxt }{ cl_abap_char_utilities=>newline }{ <lfs_line>-tdline }| ) ).   "new paragraph = new line
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
  LOOP AT lt_zpos ASSIGNING FIELD-SYMBOL(<lfs_zpos>).
    IF <lfs_zpos>-tdformat = '/*' OR <lfs_zpos>-tdformat = '/:'.
      CONTINUE.
    ENDIF.
    gv_term1_zpos = SWITCH string( <lfs_zpos>-tdformat
                      WHEN space THEN COND string( WHEN gv_term1_zpos IS INITIAL THEN <lfs_zpos>-tdline
                                                   ELSE |{ gv_term1_zpos } { <lfs_zpos>-tdline }| )
                      WHEN '='   THEN |{ gv_term1_zpos }{ <lfs_zpos>-tdline }|
                      ELSE COND string( WHEN gv_term1_zpos IS INITIAL THEN <lfs_zpos>-tdline
                                        ELSE |{ gv_term1_zpos }{ cl_abap_char_utilities=>newline }{ <lfs_zpos>-tdline }| ) ).
  ENDLOOP.
ENDIF.

