*&---------------------------------------------------------------------*
*& Report ZSF2AF_R_LEGACY_GRAB
*&---------------------------------------------------------------------*
*& Smart Form -> Adobe Form migration: Legacy Grab (Phase 1a).
*&
*& For every Smart Form in scope, writes one markdown snapshot file to
*& the local frontend. Automated: generated function module, form
*& interface (import/export/tables/exceptions), driver-program
*& candidates, output determination (NACE/TNAPR). Still MANUAL:
*& SmartStyle, logo, form outline - no read API for those has been
*& confirmed against this system yet; see docs/02_legacy_grab_spec.md.
*&
*& Performance: driver-program candidates are found by scanning every
*& Z*/Y* program's source ONCE for the whole run (build_driver_index),
*& not once per form - the original per-form rescan was the real
*& bottleneck, not a lack of parallel work processes.
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

AT SELECTION-SCREEN ON VALUE-REQUEST FOR p_path.
  DATA lv_folder TYPE string.
  lv_folder = p_path.
  CALL METHOD cl_gui_frontend_services=>directory_browse
    EXPORTING
      window_title    = 'Select the legacy-grab output folder'
      initial_folder  = lv_folder
    CHANGING
      selected_folder = lv_folder
    EXCEPTIONS
      cntl_error            = 1
      error_no_gui          = 2
      not_supported_by_gui  = 3
      OTHERS                = 4.
  IF sy-subrc = 0 AND lv_folder IS NOT INITIAL.
    IF substring( val = lv_folder off = strlen( lv_folder ) - 1 len = 1 ) <> '\'.
      lv_folder = lv_folder && '\'.
    ENDIF.
    p_path = lv_folder.
  ENDIF.

CLASS lcl_legacy_grab DEFINITION FINAL.
  PUBLIC SECTION.
    METHODS run.

  PRIVATE SECTION.
    TYPES: BEGIN OF ty_driver_hit,
             progname TYPE tadir-obj_name,
           END OF ty_driver_hit,
           tt_driver_hit TYPE STANDARD TABLE OF ty_driver_hit WITH EMPTY KEY.

    TYPES: BEGIN OF ty_idx,
             formname TYPE string,
             progname TYPE tadir-obj_name,
           END OF ty_idx,
           tt_idx TYPE STANDARD TABLE OF ty_idx WITH EMPTY KEY.

    METHODS get_form_list
      RETURNING VALUE(rt_form) TYPE string_table.

    "! Single pass over every in-scope program's source, checked against
    "! every form at once - the fix for the original per-form rescan.
    METHODS build_driver_index
      IMPORTING it_forms      TYPE string_table
      RETURNING VALUE(rt_idx) TYPE tt_idx.

    METHODS process_form
      IMPORTING iv_formname TYPE string
                it_idx      TYPE tt_idx.

    METHODS resolve_fm_name
      IMPORTING iv_formname   TYPE string
      RETURNING VALUE(rv_fm)  TYPE char30.

    "! Generic reflection-based dump of any structure's fields - used so
    "! the report never has to hard-code an uncertain DDIC field name.
    METHODS dump_any
      IMPORTING iv_data        TYPE any
      RETURNING VALUE(rt_lines) TYPE string_table.

    METHODS capture_interface
      IMPORTING iv_fm_name     TYPE char30
      RETURNING VALUE(rt_lines) TYPE string_table.

    METHODS capture_output_determination
      IMPORTING iv_formname    TYPE string
      RETURNING VALUE(rt_lines) TYPE string_table.

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
    DATA(lt_idx) = build_driver_index( lt_forms ).
    w( |Driver-program index built: { lines( lt_idx ) } form/program match(es).| ).

    LOOP AT lt_forms INTO DATA(lv_form).
      process_form( iv_formname = lv_form it_idx = lt_idx ).
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

  METHOD build_driver_index.
    DATA lt_source  TYPE TABLE OF string.
    DATA lv_pattern TYPE string.

    lv_pattern = p_pref && '%'.
    SELECT obj_name FROM tadir INTO TABLE @DATA(lt_prog)
      WHERE pgmid = 'R3TR' AND object = 'PROG' AND obj_name LIKE @lv_pattern.
    IF sy-subrc <> 0.
      RETURN.
    ENDIF.

    w( |Scanning { lines( lt_prog ) } program(s) once for driver candidates (this is the slow step)...| ).

    LOOP AT lt_prog INTO DATA(ls_prog).
      CLEAR lt_source.
      READ REPORT ls_prog-obj_name INTO lt_source.
      IF sy-subrc <> 0 OR lt_source IS INITIAL.
        CONTINUE.
      ENDIF.

      DATA(lv_has_ssf) = abap_false.
      LOOP AT lt_source INTO DATA(lv_line).
        IF lv_line CS 'SSF_FUNCTION_MODULE_NAME'.
          lv_has_ssf = abap_true.
          EXIT.
        ENDIF.
      ENDLOOP.
      IF lv_has_ssf = abap_false.
        CONTINUE.
      ENDIF.

      DATA(lv_joined) = concat_lines_of( table = lt_source sep = | | ).
      LOOP AT it_forms INTO DATA(lv_form).
        IF lv_joined CS lv_form.
          APPEND VALUE #( formname = lv_form progname = ls_prog-obj_name ) TO rt_idx.
        ENDIF.
      ENDLOOP.
    ENDLOOP.
  ENDMETHOD.

  METHOD resolve_fm_name.
    " SSF_FUNCTION_MODULE_NAME's FORMNAME parameter is a fixed-length
    " classic type, not STRING - passing a STRING actual directly dumps
    " CALL_FUNCTION_CONFLICT_TYPE. Convert to a fixed CHAR local first.
    DATA lv_formname TYPE char30.
    lv_formname = iv_formname.

    CALL FUNCTION 'SSF_FUNCTION_MODULE_NAME'
      EXPORTING
        formname = lv_formname
      IMPORTING
        fm_name  = rv_fm
      EXCEPTIONS
        OTHERS   = 1.
    IF sy-subrc <> 0.
      CLEAR rv_fm.
    ENDIF.
  ENDMETHOD.

  METHOD dump_any.
    DATA(lo_type) = cl_abap_typedescr=>describe_by_data( iv_data ).
    IF lo_type->kind = cl_abap_typedescr=>kind_struct.
      DATA(lo_struct) = CAST cl_abap_structdescr( lo_type ).
      LOOP AT lo_struct->components INTO DATA(ls_comp).
        ASSIGN COMPONENT ls_comp-name OF STRUCTURE iv_data TO FIELD-SYMBOL(<fs>).
        IF sy-subrc = 0.
          APPEND |{ ls_comp-name } = { <fs> }| TO rt_lines.
        ENDIF.
      ENDLOOP.
    ELSE.
      APPEND |{ iv_data }| TO rt_lines.
    ENDIF.
  ENDMETHOD.

  METHOD capture_interface.
    IF iv_fm_name IS INITIAL.
      APPEND `(no generated function module - see section 1)` TO rt_lines.
      RETURN.
    ENDIF.

    " FM interface introspection without guessing a signature - verified
    " pattern already proven in the ZAB_V1_UT engineering log (A18):
    " FUPARAREF, not a guessed FUNCTION_IMPORT_INTERFACE call.
    SELECT parameter, paramtype FROM fupararef INTO TABLE @DATA(lt_params)
      WHERE funcname = @iv_fm_name AND r3state = 'A'.
    IF sy-subrc <> 0 OR lt_params IS INITIAL.
      APPEND |(no FUPARAREF rows for { iv_fm_name } - confirm manually via SE37)| TO rt_lines.
      RETURN.
    ENDIF.

    APPEND `IMPORTING:` TO rt_lines.
    LOOP AT lt_params INTO DATA(ls_p) WHERE paramtype = 'I'.
      APPEND |- { ls_p-parameter }| TO rt_lines.
    ENDLOOP.
    APPEND `EXPORTING:` TO rt_lines.
    LOOP AT lt_params INTO ls_p WHERE paramtype = 'E'.
      APPEND |- { ls_p-parameter }| TO rt_lines.
    ENDLOOP.
    APPEND `TABLES:` TO rt_lines.
    LOOP AT lt_params INTO ls_p WHERE paramtype = 'T'.
      APPEND |- { ls_p-parameter }| TO rt_lines.
    ENDLOOP.
    APPEND `CHANGING:` TO rt_lines.
    LOOP AT lt_params INTO ls_p WHERE paramtype = 'C'.
      APPEND |- { ls_p-parameter }| TO rt_lines.
    ENDLOOP.
    APPEND `EXCEPTIONS:` TO rt_lines.
    LOOP AT lt_params INTO ls_p WHERE paramtype = 'X'.
      APPEND |- { ls_p-parameter }| TO rt_lines.
    ENDLOOP.
  ENDMETHOD.

  METHOD capture_output_determination.
    SELECT * FROM tnapr INTO TABLE @DATA(lt_tnapr) UP TO 50000 ROWS.
    IF sy-subrc <> 0 OR lt_tnapr IS INITIAL.
      APPEND `(no TNAPR rows read - table may not exist/be authorized here; confirm manually via NACE)` TO rt_lines.
      RETURN.
    ENDIF.

    DATA lv_hits TYPE i.
    LOOP AT lt_tnapr INTO DATA(ls_row).
      DATA(lt_dump)   = dump_any( ls_row ).
      DATA(lv_joined) = concat_lines_of( table = lt_dump sep = | | ).
      IF lv_joined CS iv_formname.
        lv_hits = lv_hits + 1.
        APPEND `-` TO rt_lines.
        APPEND LINES OF lt_dump TO rt_lines.
      ENDIF.
    ENDLOOP.

    IF lv_hits = 0.
      APPEND `(no TNAPR row mentions this form name - confirm manually via NACE; the` TO rt_lines.
      APPEND `output type may reference a driver routine rather than the form name directly)` TO rt_lines.
    ENDIF.
  ENDMETHOD.

  METHOD process_form.
    DATA(lv_fm) = resolve_fm_name( iv_formname ).

    DATA lt_drivers TYPE tt_driver_hit.
    LOOP AT it_idx INTO DATA(ls_idx) WHERE formname = iv_formname.
      APPEND VALUE #( progname = ls_idx-progname ) TO lt_drivers.
    ENDLOOP.

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

    APPEND `## 2. Form interface (import/export/tables/exceptions)` TO lt_lines.
    APPEND LINES OF capture_interface( iv_fm_name ) TO lt_lines.
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

    APPEND `## 4. Output determination (NACE / TNAPR)` TO lt_lines.
    APPEND LINES OF capture_output_determination( iv_formname ) TO lt_lines.
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
