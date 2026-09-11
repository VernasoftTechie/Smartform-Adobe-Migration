*&---------------------------------------------------------------------*
*& Report ZSF2AF_R_LEGACY_GRAB
*&---------------------------------------------------------------------*
*& Smart Form -> Adobe Form migration: Legacy Grab (Phase 1a).
*&
*& For every Smart Form in scope, writes one markdown snapshot file to
*& the local frontend. Automated: generated function module, form
*& interface (import/export/tables/exceptions), driver-program
*& candidates (full source extracted to its own file, their own
*& INCLUDEs followed one level deep and extracted too, and a
*& dependency scan of the custom objects they reference), output
*& determination (NACE/TNAPR), and SSF_READ_FORM's own interface
*& (section 5, auto-probed via FUPARAREF every run - no separate step
*& needed), plus a full prerequisite checklist (section 11) covering
*& everything else a Smart Form can depend on. Still MANUAL: SmartStyle,
*& logo, form outline themselves (sections 6-8) - FUPARAREF gives
*& SSF_READ_FORM's parameter NAMES but not their exact TYPES, and
*& calling it with a guessed type risks the same class of dump as F1;
*& see docs/02_legacy_grab_spec.md.
*&
*& P_PROBE: fill it with any OTHER function module name to introspect
*& its interface via the same FUPARAREF technique instead of running
*& the legacy grab - a general-purpose tool for learning an unfamiliar
*& FM's parameter list before it gets called for real.
*&
*& P_GLOB: tick to run a system-wide sweep instead of the legacy grab -
*& every SmartStyle name (TADIR SSST) + every SE78 graphic (STXBITMAPS)
*& in one pass, written to global_smartstyles.txt / global_logos.txt.
*& Grab this ONCE, up front, rather than rediscovering styles/logos per
*& form - see docs/04_global_style_catalogue.md.
*&
*& Performance: driver-program candidates are found by scanning every
*& Z*/Y* program's source ONCE for the whole run (build_driver_index),
*& not once per form.
*&
*& After running: drop the downloaded .md/.txt files into
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

SELECTION-SCREEN BEGIN OF BLOCK b3 WITH FRAME TITLE TEXT-b03.
PARAMETERS p_probe TYPE char30 LOWER CASE.
SELECTION-SCREEN END OF BLOCK b3.

SELECTION-SCREEN BEGIN OF BLOCK b4 WITH FRAME TITLE TEXT-b04.
PARAMETERS p_glob AS CHECKBOX DEFAULT abap_false.
SELECTION-SCREEN END OF BLOCK b4.

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

    "! If P_PROBE is filled: introspect that function module's interface
    "! (reusing the same proven FUPARAREF technique as capture_interface)
    "! and stop - does not run the legacy grab. General-purpose tool for
    "! learning any unfamiliar FM's parameter list (names + I/E/T/C/X
    "! kind) before Bolt calls it for real, instead of guessing a
    "! signature. SSF_READ_FORM itself no longer needs this - it's
    "! probed automatically every normal run (section 5 of every
    "! snapshot).
    METHODS probe_fm
      IMPORTING iv_fm_name TYPE char30.

    "! If P_GLOB is ticked: build the Global Style & Asset Catalogue's raw
    "! inventory - every SmartStyle name and every SE78-registered graphic
    "! - once, system-wide, instead of per form. Feeds
    "! docs/06_global_findings.md (see docs/04_global_style_catalogue.md).
    "! Does not run the legacy grab.
    METHODS global_sweep.

    TYPES: BEGIN OF ty_driver_hit,
             progname TYPE tadir-obj_name,
           END OF ty_driver_hit,
           tt_driver_hit TYPE STANDARD TABLE OF ty_driver_hit WITH EMPTY KEY.

    TYPES: BEGIN OF ty_idx,
             formname TYPE string,
             progname TYPE tadir-obj_name,
           END OF ty_idx,
           tt_idx TYPE STANDARD TABLE OF ty_idx WITH EMPTY KEY.

    "! Per driver program: where its extracted source landed, what other
    "! Z*/Y* objects it appears to reference, and which of its own
    "! INCLUDEs were followed and extracted too (one level deep).
    TYPES: BEGIN OF ty_prog_info,
             progname      TYPE tadir-obj_name,
             source_file   TYPE string,
             deps          TYPE string_table,
             include_files TYPE string_table,
           END OF ty_prog_info,
           tt_prog_info TYPE STANDARD TABLE OF ty_prog_info WITH EMPTY KEY.

    DATA mt_prog_info TYPE tt_prog_info.

    "! SSF_READ_FORM's interface (names + I/E/T/C/X kind), probed once per
    "! run via FUPARAREF and reused in every form's snapshot - folded into
    "! the main process instead of a separate manual step.
    DATA mt_ssf_read_form_iface TYPE string_table.

    METHODS get_form_list
      RETURNING VALUE(rt_form) TYPE string_table.

    "! Single pass over every in-scope program's source, checked against
    "! every form at once. For every program that matches at least one
    "! form: extracts its full source to its own file and scans it for
    "! dependent Z*/Y* objects (stored in mt_prog_info).
    METHODS build_driver_index
      IMPORTING it_forms      TYPE string_table
      RETURNING VALUE(rt_idx) TYPE tt_idx.

    "! Writes a program's already-read source to its own file in P_PATH.
    METHODS write_driver_source
      IMPORTING iv_progname   TYPE tadir-obj_name
                it_source     TYPE string_table
      RETURNING VALUE(rv_file) TYPE string.

    "! Plain substring scan (no regex) for lines that look like a
    "! reference to another custom object - CALL FUNCTION 'Z.../Y...',
    "! CALL METHOD ZCL_.../YCL_..., NEW/TYPE ZCL_.../YCL_..., INCLUDE
    "! Z.../Y..., external PERFORM (Z.../Y...). Returns the raw matching
    "! lines (trimmed, deduplicated) as evidence rather than a parsed
    "! object name, to avoid mis-extracting one.
    METHODS scan_dependencies
      IMPORTING it_source      TYPE string_table
      RETURNING VALUE(rt_lines) TYPE string_table.

    "! Follows INCLUDE Z.../Y... statements found in it_source one level
    "! deep: extracts each included program's source to its own file and
    "! folds its dependency scan into ct_deps. Bounded to one level so a
    "! chain of includes can't run away.
    METHODS extract_includes
      IMPORTING it_source        TYPE string_table
      CHANGING  ct_include_files TYPE string_table
                ct_deps          TYPE string_table.

    METHODS get_prog_info
      IMPORTING iv_progname    TYPE tadir-obj_name
      RETURNING VALUE(rs_info) TYPE ty_prog_info.

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
    IF p_probe IS NOT INITIAL.
      probe_fm( p_probe ).
      RETURN.
    ENDIF.

    IF p_glob = abap_true.
      global_sweep( ).
      RETURN.
    ENDIF.

    DATA(lt_forms) = get_form_list( ).
    IF lt_forms IS INITIAL.
      w( |No forms in scope - fill S_FORM, or tick P_AUTO to try TADIR discovery.| ).
      RETURN.
    ENDIF.

    w( |Legacy grab starting for { lines( lt_forms ) } form(s).| ).

    " Probed once (not per form) via the same FUPARAREF technique as
    " section 2 - folded into the main process so SSF_READ_FORM's
    " interface never needs a separate manual step.
    mt_ssf_read_form_iface = capture_interface( 'SSF_READ_FORM' ).

    DATA(lt_idx) = build_driver_index( lt_forms ).
    w( |Driver-program index built: { lines( lt_idx ) } form/program match(es), | &&
       |{ lines( mt_prog_info ) } driver source(s) extracted.| ).

    LOOP AT lt_forms INTO DATA(lv_form).
      process_form( iv_formname = lv_form it_idx = lt_idx ).
    ENDLOOP.
    w( |Done. Snapshots and driver source files written under { p_path }.| ).
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
    DATA lt_source        TYPE string_table.
    DATA lt_matched_forms TYPE string_table.
    DATA lv_pattern       TYPE string.

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

      CLEAR lt_matched_forms.
      DATA(lv_joined) = concat_lines_of( table = lt_source sep = | | ).
      LOOP AT it_forms INTO DATA(lv_form).
        IF lv_joined CS lv_form.
          APPEND lv_form TO lt_matched_forms.
        ENDIF.
      ENDLOOP.

      IF lt_matched_forms IS INITIAL.
        CONTINUE.
      ENDIF.

      DATA(lv_source_file) = write_driver_source( iv_progname = ls_prog-obj_name it_source = lt_source ).
      DATA(lt_deps)        = scan_dependencies( lt_source ).

      DATA lt_include_files TYPE string_table.
      CLEAR lt_include_files.
      extract_includes( EXPORTING it_source        = lt_source
                         CHANGING  ct_include_files = lt_include_files
                                   ct_deps          = lt_deps ).

      APPEND VALUE #( progname      = ls_prog-obj_name
                       source_file   = lv_source_file
                       deps          = lt_deps
                       include_files = lt_include_files ) TO mt_prog_info.

      LOOP AT lt_matched_forms INTO lv_form.
        APPEND VALUE #( formname = lv_form progname = ls_prog-obj_name ) TO rt_idx.
      ENDLOOP.
    ENDLOOP.
  ENDMETHOD.

  METHOD write_driver_source.
    DATA(lv_filename) = |{ p_path }driver_{ iv_progname }.txt|.
    CALL FUNCTION 'GUI_DOWNLOAD'
      EXPORTING
        filename = lv_filename
        filetype = 'ASC'
      TABLES
        data_tab = it_source
      EXCEPTIONS
        OTHERS   = 1.
    IF sy-subrc = 0.
      rv_file = lv_filename.
    ENDIF.
  ENDMETHOD.

  METHOD scan_dependencies.
    LOOP AT it_source INTO DATA(lv_line).
      DATA(lv_trim) = |{ lv_line }|.
      IF lv_trim IS INITIAL.
        CONTINUE.
      ENDIF.

      DATA(lv_is_dep) = abap_false.
      IF    lv_trim CS `CALL FUNCTION 'Z` OR lv_trim CS `CALL FUNCTION 'Y`
         OR lv_trim CS `CALL METHOD ZCL_` OR lv_trim CS `CALL METHOD YCL_`
         OR lv_trim CS `NEW ZCL_`         OR lv_trim CS `NEW YCL_`
         OR lv_trim CS `TYPE ZCL_`        OR lv_trim CS `TYPE YCL_`
         OR lv_trim CS `INCLUDE Z`        OR lv_trim CS `INCLUDE Y`.
        lv_is_dep = abap_true.
      ENDIF.
      IF lv_trim CS `PERFORM`.
        IF lv_trim CS `(Z` OR lv_trim CS `(Y`.
          lv_is_dep = abap_true.
        ENDIF.
      ENDIF.

      IF lv_is_dep = abap_true.
        APPEND lv_trim TO rt_lines.
      ENDIF.
    ENDLOOP.

    SORT rt_lines.
    DELETE ADJACENT DUPLICATES FROM rt_lines.
  ENDMETHOD.

  METHOD extract_includes.
    LOOP AT it_source INTO DATA(lv_line).
      DATA(lv_work) = lv_line.
      CONDENSE lv_work.
      IF lv_work IS INITIAL.
        CONTINUE.
      ENDIF.
      IF NOT to_upper( lv_work ) CP 'INCLUDE *'.
        CONTINUE.
      ENDIF.

      SPLIT lv_work AT space INTO TABLE DATA(lt_words).
      DELETE lt_words WHERE table_line IS INITIAL.
      IF lines( lt_words ) < 2.
        CONTINUE.
      ENDIF.

      " Must be a fixed CHAR type, not STRING: classic offset/length
      " notation (+len) below only works on C/N/D/T fields, and
      " write_driver_source's IV_PROGNAME formal is TYPE tadir-obj_name
      " (by-reference IMPORTING needs an exact type match, not just a
      " convertible one).
      DATA lv_inclname TYPE tadir-obj_name.
      lv_inclname = to_upper( lt_words[ 2 ] ).
      DATA(lv_len) = strlen( lv_inclname ) - 1.
      IF lv_len > 0 AND lv_inclname+lv_len(1) = '.'.
        lv_inclname = lv_inclname(lv_len).
      ENDIF.

      IF NOT lv_inclname CP |{ p_pref }*|.
        " only follow custom includes, not standard SAP includes
        CONTINUE.
      ENDIF.

      DATA lt_inc_source TYPE string_table.
      CLEAR lt_inc_source.
      READ REPORT lv_inclname INTO lt_inc_source.
      IF sy-subrc <> 0 OR lt_inc_source IS INITIAL.
        CONTINUE.
      ENDIF.

      DATA(lv_inc_file) = write_driver_source( iv_progname = lv_inclname it_source = lt_inc_source ).
      IF lv_inc_file IS NOT INITIAL.
        APPEND |{ lv_inclname } -> { lv_inc_file }| TO ct_include_files.
      ENDIF.

      APPEND LINES OF scan_dependencies( lt_inc_source ) TO ct_deps.
    ENDLOOP.

    SORT ct_include_files.
    DELETE ADJACENT DUPLICATES FROM ct_include_files.
    SORT ct_deps.
    DELETE ADJACENT DUPLICATES FROM ct_deps.
  ENDMETHOD.

  METHOD get_prog_info.
    READ TABLE mt_prog_info INTO rs_info WITH KEY progname = iv_progname.
    IF sy-subrc <> 0.
      CLEAR rs_info.
    ENDIF.
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

    APPEND `## 3. Driver program candidates (source + dependencies extracted)` TO lt_lines.
    IF it_drivers IS INITIAL.
      APPEND `None found scanning Z*/Y* programs for a literal match. Confirm manually` TO lt_lines.
      APPEND `(NACE output-type Processing Routines tab, or ask the functional owner).` TO lt_lines.
    ELSE.
      LOOP AT it_drivers INTO DATA(ls_hit).
        DATA(ls_info) = get_prog_info( ls_hit-progname ).
        APPEND |- `{ ls_hit-progname }` (contains this form name + SSF_FUNCTION_MODULE_NAME - confirm it is the real driver. READ-ONLY: never modified - see docs/01_scope.md section 8)| TO lt_lines.
        IF ls_info-source_file IS NOT INITIAL.
          APPEND |  full source extracted to `{ ls_info-source_file }`| TO lt_lines.
        ELSE.
          APPEND `  (source extraction failed for this program - check authorization to READ REPORT)` TO lt_lines.
        ENDIF.
        IF ls_info-include_files IS NOT INITIAL.
          APPEND `  included programs extracted (one level deep):` TO lt_lines.
          LOOP AT ls_info-include_files INTO DATA(lv_inc).
            APPEND |    { lv_inc }| TO lt_lines.
          ENDLOOP.
        ENDIF.
        IF ls_info-deps IS INITIAL.
          APPEND `  no other Z*/Y* object references found by the dependency scan` TO lt_lines.
        ELSE.
          APPEND `  dependent objects referenced (raw source lines, driver + its includes - confirm each one):` TO lt_lines.
          LOOP AT ls_info-deps INTO DATA(lv_dep).
            APPEND |    { lv_dep }| TO lt_lines.
          ENDLOOP.
        ENDIF.
      ENDLOOP.
    ENDIF.
    APPEND `` TO lt_lines.

    APPEND `## 4. Output determination (NACE / TNAPR)` TO lt_lines.
    APPEND LINES OF capture_output_determination( iv_formname ) TO lt_lines.
    APPEND `` TO lt_lines.

    APPEND `## 5. SSF_READ_FORM interface (auto-probed via FUPARAREF)` TO lt_lines.
    APPEND `This is the likely API for sections 6-8 below. Probed automatically every` TO lt_lines.
    APPEND `run - no separate manual step. Gives parameter NAMES + I/E/T/C/X kind only,` TO lt_lines.
    APPEND `not each parameter's exact ABAP type, so it is not called for real yet -` TO lt_lines.
    APPEND `calling it with a guessed type for a deep EXPORTING/TABLES parameter risks` TO lt_lines.
    APPEND `the same kind of dump SSF_FUNCTION_MODULE_NAME caused earlier (see` TO lt_lines.
    APPEND `docs/BUILD_ISSUES_LOG.md F1). To unlock the real call: open SE37 -> display` TO lt_lines.
    APPEND `SSF_READ_FORM -> note the Reference Type shown for the EXPORTING/TABLES` TO lt_lines.
    APPEND `parameter(s) listed just below, and share that.` TO lt_lines.
    IF mt_ssf_read_form_iface IS INITIAL.
      APPEND `(not probed)` TO lt_lines.
    ELSE.
      APPEND LINES OF mt_ssf_read_form_iface TO lt_lines.
    ENDIF.
    APPEND `` TO lt_lines.

    APPEND `## 6. SmartStyle(s) used - MANUAL (one name lookup, not fresh research)` TO lt_lines.
    APPEND `SE71 -> Form Attributes -> Output Options shows the SmartStyle name this form` TO lt_lines.
    APPEND `uses. It should already be listed in docs/legacy_grab/global_smartstyles.txt` TO lt_lines.
    APPEND `(from the P_GLOB sweep) - just note WHICH one here and match it against` TO lt_lines.
    APPEND `docs/04_global_style_catalogue.md. Only research its format details fresh if` TO lt_lines.
    APPEND `it isn't in the global catalogue yet.` TO lt_lines.
    APPEND `` TO lt_lines.

    APPEND `## 7. Graphics / logos - MANUAL (one name lookup, not fresh research)` TO lt_lines.
    APPEND `Note any Graphic node in the form's window tree (SE71) and which SE78 object` TO lt_lines.
    APPEND `it points to. It should already be listed in` TO lt_lines.
    APPEND `docs/legacy_grab/global_logos.txt (from the P_GLOB sweep) - just note WHICH` TO lt_lines.
    APPEND `one here and match it against docs/04_global_style_catalogue.md.` TO lt_lines.
    APPEND `` TO lt_lines.

    APPEND `## 8. Form outline (pages / windows / node types) - MANUAL` TO lt_lines.
    APPEND `Walk the SE71 navigation tree and note each page/window/node (text, table,` TO lt_lines.
    APPEND `loop, graphic) as a short outline here.` TO lt_lines.
    APPEND `` TO lt_lines.

    APPEND `## 9. Risk score` TO lt_lines.
    APPEND `Business criticality / Interactivity / Layout complexity / Driver complexity /` TO lt_lines.
    APPEND `Integration touchpoints / Localization / Volume -> composite: Low / Medium / High / Critical.` TO lt_lines.
    APPEND `` TO lt_lines.

    APPEND `## 10. Output comparison (OTF) - Phase 2 pilot only, not auto-captured here` TO lt_lines.
    APPEND `OTF is a rendered print stream, not a design source - it cannot be used to` TO lt_lines.
    APPEND `rebuild the form. Its correct role is validation: once the Adobe Form exists,` TO lt_lines.
    APPEND `run this form for one real document (SSF control param GETOTF = 'X' captures` TO lt_lines.
    APPEND `JOB_OUTPUT_INFO-OTFDATA; CONVERT_OTF renders it to PDF for comparison) and` TO lt_lines.
    APPEND `diff it visually against the new Adobe Form's PDF for the same document.` TO lt_lines.
    APPEND `` TO lt_lines.

    APPEND `## 11. Full prerequisite checklist - confirm every item before converting` TO lt_lines.
    APPEND `[ ] SmartStyle name(s) (section 6)` TO lt_lines.
    APPEND `[ ] Paragraph/character formats used by each SmartStyle` TO lt_lines.
    APPEND `[ ] Graphics/logos referenced (section 7) - MIME Repository object + binary export` TO lt_lines.
    APPEND `[ ] Standard texts (SO10) referenced by any TEXT/INCLUDE TEXT node -` TO lt_lines.
    APPEND `    check each TDOBJECT/TDNAME/TDID/TDSPRAS via SO10` TO lt_lines.
    APPEND `[ ] Barcode / font resources (if the form prints barcodes or labels)` TO lt_lines.
    APPEND `[ ] Languages / translations required (each SPRAS variant, if multi-language)` TO lt_lines.
    APPEND `[ ] Driver program full source (section 3 - extracted)` TO lt_lines.
    APPEND `[ ] Included programs of the driver (section 3 - extracted where found)` TO lt_lines.
    APPEND `[ ] Other custom objects the driver/includes reference (section 3 - confirm each)` TO lt_lines.
    APPEND `[ ] Form interface (section 2 - extracted)` TO lt_lines.
    APPEND `[ ] Output determination / NACE linkage (section 4 - extracted)` TO lt_lines.
    APPEND `[ ] Digital signature / interactive XFA scripting, if this form is interactive` TO lt_lines.
    APPEND `[ ] Authorization checks inside the driver program (read the extracted source)` TO lt_lines.
    APPEND `[ ] Number-range/posting side effects inside the driver (read the extracted source)` TO lt_lines.

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

  METHOD global_sweep.
    w( `Global prerequisites sweep starting (SmartStyles + SE78 graphics)...` ).

    " --- SmartStyles: best-effort via TADIR, object type SSST (mirrors
    " SSFO for forms) - unverified guess, but zero risk: a wrong object
    " type value just returns zero rows, it doesn't error.
    DATA lv_pattern TYPE string.
    lv_pattern = p_pref && '%'.
    SELECT obj_name FROM tadir INTO TABLE @DATA(lt_tadir_style)
      WHERE pgmid = 'R3TR' AND object = 'SSST' AND obj_name LIKE @lv_pattern.

    DATA lt_style_out TYPE TABLE OF string.
    APPEND `# Global SmartStyle inventory` TO lt_style_out.
    APPEND `` TO lt_style_out.
    APPEND `TADIR object type SSST, best effort - verify count against` TO lt_style_out.
    APPEND `SMARTSTYLES/SE71 the first time this is run.` TO lt_style_out.
    APPEND `` TO lt_style_out.
    IF sy-subrc <> 0 OR lt_tadir_style IS INITIAL.
      APPEND `(none found - verify object type SSST in SE16/SMARTSTYLES, or list manually)` TO lt_style_out.
      w( `SmartStyle inventory: 0 found via TADIR SSST - verify the object type, or list manually.` ).
    ELSE.
      LOOP AT lt_tadir_style INTO DATA(ls_style).
        APPEND |- { ls_style-obj_name }| TO lt_style_out.
      ENDLOOP.
      w( |SmartStyle inventory: { lines( lt_tadir_style ) } found.| ).
    ENDIF.

    DATA(lv_style_file) = |{ p_path }global_smartstyles.txt|.
    CALL FUNCTION 'GUI_DOWNLOAD'
      EXPORTING
        filename = lv_style_file
        filetype = 'ASC'
      TABLES
        data_tab = lt_style_out
      EXCEPTIONS
        OTHERS   = 1.
    IF sy-subrc = 0.
      w( |Saved to { lv_style_file }| ).
    ENDIF.

    " --- Graphics/logos: SE78-registered, table STXBITMAPS. SELECT * -
    " no field-name guess, same safe pattern already proven for TNAPR.
    " The table NAME itself is a best-effort guess (unlike TNAPR, not yet
    " used in this project) - if wrong, this SELECT fails to activate,
    " a clean fixable error, not a guess baked silently into results.
    SELECT * FROM stxbitmaps INTO TABLE @DATA(lt_bitmaps) UP TO 10000 ROWS.

    DATA lt_logo_out TYPE TABLE OF string.
    APPEND `# Global logo/graphic inventory (SE78 / STXBITMAPS)` TO lt_logo_out.
    APPEND `` TO lt_logo_out.
    IF sy-subrc <> 0 OR lt_bitmaps IS INITIAL.
      APPEND `(no STXBITMAPS rows read - table may not exist/be authorized here;` TO lt_logo_out.
      APPEND `list manually via SE78)` TO lt_logo_out.
      w( `Logo inventory: STXBITMAPS read failed or empty - see file for manual fallback.` ).
    ELSE.
      LOOP AT lt_bitmaps INTO DATA(ls_bmp).
        APPEND `-` TO lt_logo_out.
        APPEND LINES OF dump_any( ls_bmp ) TO lt_logo_out.
      ENDLOOP.
      w( |Logo inventory: { lines( lt_bitmaps ) } row(s) found.| ).
    ENDIF.

    DATA(lv_logo_file) = |{ p_path }global_logos.txt|.
    CALL FUNCTION 'GUI_DOWNLOAD'
      EXPORTING
        filename = lv_logo_file
        filetype = 'ASC'
      TABLES
        data_tab = lt_logo_out
      EXCEPTIONS
        OTHERS   = 1.
    IF sy-subrc = 0.
      w( |Saved to { lv_logo_file }| ).
    ENDIF.

    w( `Global sweep done. Drop both files into docs/legacy_grab/, roll their` ).
    w( `contents into docs/06_global_findings.md, and push.` ).
  ENDMETHOD.

  METHOD probe_fm.
    w( |FM interface probe: { iv_fm_name } (via FUPARAREF - same technique as section 2)| ).
    DATA(lt_lines) = capture_interface( iv_fm_name ).

    DATA lt_out TYPE TABLE OF string.
    APPEND |# FM interface probe - { iv_fm_name }| TO lt_out.
    APPEND `` TO lt_out.
    APPEND LINES OF lt_lines TO lt_out.

    LOOP AT lt_out INTO DATA(lv_line).
      w( lv_line ).
    ENDLOOP.

    DATA(lv_filename) = |{ p_path }probe_{ iv_fm_name }.txt|.
    CALL FUNCTION 'GUI_DOWNLOAD'
      EXPORTING
        filename = lv_filename
        filetype = 'ASC'
      TABLES
        data_tab = lt_out
      EXCEPTIONS
        OTHERS   = 1.
    IF sy-subrc = 0.
      w( |Saved to { lv_filename }| ).
    ENDIF.
  ENDMETHOD.

  METHOD w.
    WRITE: / iv.
  ENDMETHOD.

ENDCLASS.

START-OF-SELECTION.
  DATA(go_grab) = NEW lcl_legacy_grab( ).
  go_grab->run( ).
