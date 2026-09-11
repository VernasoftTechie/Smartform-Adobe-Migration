*&---------------------------------------------------------------------*
*& Report ZSF2AF_R_LEGACY_GRAB
*&---------------------------------------------------------------------*
*& Smart Form -> Adobe Form migration: Legacy Grab (Phase 1a).
*&
*& For every Smart Form in scope, writes one markdown snapshot file to
*& the local frontend, capturing what this report can read safely and
*& automatically, plus clearly labelled MANUAL sections for anything
*& that needs a read API this has not been confirmed against your
*& system yet (interface parameter list, output determination, style,
*& logo, form outline) - see docs/02_legacy_grab_spec.md for why those
*& stay manual in v1.
*&
*& After running: drop the downloaded .md files into
*& docs/legacy_grab/ of this repo and push (or hand them to Bolt).
*&---------------------------------------------------------------------*
REPORT zsf2af_r_legacy_grab.

DATA gv_dummy_form TYPE char30.

SELECTION-SCREEN BEGIN OF BLOCK b1 WITH FRAME TITLE TEXT-b01.
SELECT-OPTIONS s_form FOR gv_dummy_form.
PARAMETERS p_auto AS CHECKBOX DEFAULT abap_false.
PARAMETERS p_pref  TYPE char10 DEFAULT 'Z'.
SELECTION-SCREEN END OF BLOCK b1.

SELECTION-SCREEN BEGIN OF BLOCK b2 WITH FRAME TITLE TEXT-b02.
PARAMETERS p_path TYPE char100 LOWER CASE OBLIGATORY DEFAULT 'C:\Legacy_Grab\'.
SELECTION-SCREEN END OF BLOCK b2.

CLASS lcl_legacy_grab DEFINITION FINAL.
  PUBLIC SECTION.
    METHODS run.

  PRIVATE SECTION.
    TYPES: BEGIN OF ty_driver_hit,
             progname TYPE tadir-obj_name,
           END OF ty_driver_hit,
           tt_driver_hit TYPE STANDARD TABLE OF ty_driver_hit WITH EMPTY KEY.

    METHODS get_form_list
      RETURNING VALUE(rt_form) TYPE string_table.

    METHODS process_form
      IMPORTING iv_formname TYPE string.

    METHODS resolve_fm_name
      IMPORTING iv_formname   TYPE string
      RETURNING VALUE(rv_fm)  TYPE char30.

    METHODS find_driver_candidates
      IMPORTING iv_formname  TYPE string
      RETURNING VALUE(rt_hit) TYPE tt_driver_hit.

    METHODS write_snapshot
      IMPORTING iv_formname TYPE string
                iv_fm_name  TYPE char30
                it_drivers  TYPE tt_driver_hit.

    METHODS w
      IMPORTING iv TYPE string.
ENDCLASS.

CLASS lcl_legacy_grab IMPLEMENTATION.

  METHOD run.
    DATA(lt_forms) = get_form_list( ).
    IF lt_forms IS INITIAL.
      w( |No forms in scope - fill S_FORM, or tick P_AUTO to try TADIR discovery.| ).
      RETURN.
    ENDIF.

    w( |Legacy grab starting for { lines( lt_forms ) } form(s).| ).
    LOOP AT lt_forms INTO DATA(lv_form).
      process_form( lv_form ).
    ENDLOOP.
    w( |Done. Snapshots written under { p_path }.| ).
    w( |Drop them into docs/legacy_grab/ of Smartform-Adobe-Migration and push.| ).
  ENDMETHOD.

  METHOD get_form_list.
    DATA lt_result  TYPE string_table.
    DATA lv_pattern TYPE string.

    LOOP AT s_form INTO DATA(ls_form).
      IF ls_form-low IS NOT INITIAL.
        APPEND |{ ls_form-low }| TO lt_result.
      ENDIF.
    ENDLOOP.

    IF p_auto = abap_true.
      " Best effort only: TADIR object type for Smart Forms is SSFO.
      " Verify the hit count against your SE71/SMARTFORMS list before
      " trusting this. If it returns nothing, list forms in S_FORM.
      lv_pattern = p_pref && '%'.
      SELECT obj_name FROM tadir INTO TABLE @DATA(lt_tadir)
        WHERE pgmid = 'R3TR' AND object = 'SSFO' AND obj_name LIKE @lv_pattern.
      IF sy-subrc = 0.
        LOOP AT lt_tadir INTO DATA(ls_tadir).
          APPEND |{ ls_tadir-obj_name }| TO lt_result.
        ENDLOOP.
      ELSE.
        w( |TADIR auto-discovery (object type SSFO) returned nothing - verify in SE16/SE71, or list forms manually.| ).
      ENDIF.
    ENDIF.

    SORT lt_result.
    DELETE ADJACENT DUPLICATES FROM lt_result.
    rt_form = lt_result.
  ENDMETHOD.

  METHOD resolve_fm_name.
    CALL FUNCTION 'SSF_FUNCTION_MODULE_NAME'
      EXPORTING
        formname = iv_formname
      IMPORTING
        fm_name  = rv_fm
      EXCEPTIONS
        OTHERS   = 1.
    IF sy-subrc <> 0.
      CLEAR rv_fm.
    ENDIF.
  ENDMETHOD.

  METHOD find_driver_candidates.
    DATA lt_source  TYPE TABLE OF string.
    DATA lv_pattern TYPE string.

    lv_pattern = p_pref && '%'.
    SELECT obj_name FROM tadir INTO TABLE @DATA(lt_prog)
      WHERE pgmid = 'R3TR' AND object = 'PROG' AND obj_name LIKE @lv_pattern.
    IF sy-subrc <> 0.
      RETURN.
    ENDIF.

    LOOP AT lt_prog INTO DATA(ls_prog).
      CLEAR lt_source.
      READ REPORT ls_prog-obj_name INTO lt_source.
      IF sy-subrc <> 0 OR lt_source IS INITIAL.
        CONTINUE.
      ENDIF.

      DATA(lv_has_ssf)  = abap_false.
      DATA(lv_has_form) = abap_false.
      LOOP AT lt_source INTO DATA(lv_line).
        IF lv_line CS 'SSF_FUNCTION_MODULE_NAME'.
          lv_has_ssf = abap_true.
        ENDIF.
        IF lv_line CS iv_formname.
          lv_has_form = abap_true.
        ENDIF.
      ENDLOOP.

      IF lv_has_ssf = abap_true AND lv_has_form = abap_true.
        APPEND VALUE #( progname = ls_prog-obj_name ) TO rt_hit.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.

  METHOD process_form.
    DATA(lv_fm)      = resolve_fm_name( iv_formname ).
    DATA(lt_drivers) = find_driver_candidates( iv_formname ).
    write_snapshot( iv_formname = iv_formname
                     iv_fm_name  = lv_fm
                     it_drivers  = lt_drivers ).
    w( |{ iv_formname }: FM { COND #( WHEN lv_fm IS INITIAL THEN 'NOT FOUND - check SE71' ELSE lv_fm ) }, | &&
       |{ lines( lt_drivers ) } driver candidate(s).| ).
  ENDMETHOD.

  METHOD write_snapshot.
    DATA lt_lines TYPE TABLE OF string.
    DATA(lv_stamp) = |{ sy-datum+0(4) }-{ sy-datum+4(2) }-{ sy-datum+6(2) } | &&
                     |{ sy-uzeit+0(2) }:{ sy-uzeit+2(2) }:{ sy-uzeit+4(2) }|.

    APPEND |# Legacy Grab - { iv_formname }| TO lt_lines.
    APPEND `` TO lt_lines.
    APPEND |Generated { lv_stamp } by ZSF2AF_R_LEGACY_GRAB.| TO lt_lines.
    APPEND `` TO lt_lines.

    APPEND |## 1. Generated function module| TO lt_lines.
    IF iv_fm_name IS INITIAL.
      APPEND `NOT FOUND - form may not exist, or is not active. Check SE71.` TO lt_lines.
    ELSE.
      APPEND |`{ iv_fm_name }`| TO lt_lines.
    ENDIF.
    APPEND `` TO lt_lines.

    APPEND `## 2. Form interface (import/export/tables/exceptions) - MANUAL` TO lt_lines.
    APPEND `Not auto-captured - no confirmed read API yet (see docs/02_legacy_grab_spec.md).` TO lt_lines.
    APPEND |Capture from SE71/SFP -> Interface tab, or SE37 -> display `{ iv_fm_name }`, and paste below.| TO lt_lines.
    APPEND `` TO lt_lines.

    APPEND `## 3. Driver program candidates (source-scan match)` TO lt_lines.
    IF it_drivers IS INITIAL.
      APPEND `None found scanning Z*/Y* programs for a literal match. Confirm manually` TO lt_lines.
      APPEND `(NACE output-type Processing Routines tab, or ask the functional owner).` TO lt_lines.
    ELSE.
      LOOP AT it_drivers INTO DATA(ls_hit).
        APPEND |- `{ ls_hit-progname }` (contains this form name + SSF_FUNCTION_MODULE_NAME - confirm it is the real driver)| TO lt_lines.
      ENDLOOP.
    ENDIF.
    APPEND `` TO lt_lines.

    APPEND `## 4. Output determination (NACE) - MANUAL` TO lt_lines.
    APPEND `Not auto-captured. In NACE, find the application + output type whose Processing` TO lt_lines.
    APPEND `Routines row names this form/driver, and list the output type(s) here.` TO lt_lines.
    APPEND `` TO lt_lines.

    APPEND `## 5. SmartStyle(s) used - MANUAL` TO lt_lines.
    APPEND `SE71 -> Form Attributes -> Output Options -> note the SmartStyle name(s), then` TO lt_lines.
    APPEND `print the style's paragraph/character format list from SMARTSTYLES.` TO lt_lines.
    APPEND `` TO lt_lines.

    APPEND `## 6. Graphics / logos - MANUAL` TO lt_lines.
    APPEND `Note any Graphic node in the form's window tree (SE71) and the MIME Repository` TO lt_lines.
    APPEND `object it points to; export the image from SE80 MIME Repository.` TO lt_lines.
    APPEND `` TO lt_lines.

    APPEND `## 7. Form outline (pages / windows / node types) - MANUAL` TO lt_lines.
    APPEND `Walk the SE71 navigation tree and note each page/window/node (text, table,` TO lt_lines.
    APPEND `loop, graphic) as a short outline here.` TO lt_lines.
    APPEND `` TO lt_lines.

    APPEND `## 8. Risk score` TO lt_lines.
    APPEND `Business criticality / Interactivity / Layout complexity / Driver complexity /` TO lt_lines.
    APPEND `Integration touchpoints / Localization / Volume -> composite: Low / Medium / High / Critical.` TO lt_lines.

    DATA(lv_filename) = |{ p_path }{ iv_formname }.md|.
    CALL FUNCTION 'GUI_DOWNLOAD'
      EXPORTING
        filename = lv_filename
        filetype = 'ASC'
      TABLES
        data_tab = lt_lines
      EXCEPTIONS
        OTHERS   = 1.
    IF sy-subrc <> 0.
      w( |WARNING: download failed for { iv_formname } to { lv_filename }, sy-subrc { sy-subrc }.| ).
    ENDIF.
  ENDMETHOD.

  METHOD w.
    WRITE: / iv.
  ENDMETHOD.

ENDCLASS.

START-OF-SELECTION.
  DATA(go_grab) = NEW lcl_legacy_grab( ).
  go_grab->run( ).
