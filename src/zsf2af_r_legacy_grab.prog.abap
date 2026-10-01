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
*& determination (NACE/TNAPR), plus a full prerequisite checklist
*& (section 11) covering everything else a Smart Form can depend on.
*& SSF_READ_FORM's own interface is auto-probed (section 5, informational
*& only - its parameters turned out to be header/admin metadata, not a
*& layout read API - see docs/02_legacy_grab_spec.md). Sections 6-7
*& (SmartStyle, logo) also attempt an automatic match: probe_form_storage
*& safely tries a short list of candidate DB tables via RTTI (a wrong
*& guess is a caught exception, never an activation risk) and scans any
*& that resolve for this form's name - at 500+-form scale this is meant
*& to close the "which style/logo does THIS form use" gap in one run
*& rather than per form. Falls back to the usual manual note if nothing
*& matches. Section 8 (form outline) and the design itself still come from
*& the SFP "Create Adobe Form by Migration" wizard, never a background
*& extraction (docs/05_individual_form_conversion_framework.md).
*&
*& Extended (increment A): the interface shows every FUPARAREF attribute
*& (type, reference, default, optional) and the DDIC layout of every custom
*& type it names (section 2b); the driver NACE names (TNAPR-PGNAM) is always
*& extracted with its includes even when the text scan missed it, and its
*& custom function modules get their interfaces read; NAST usage counts per
*& output type (section 4b, untick P_VOL to skip); TNAPR rows are matched on
*& the exact SFORM column; both Z* and Y* objects are covered (P_PREF /
*& P_PREF2); one form failing no longer stops the run.
*&
*& Extended (increment B): section 2c resolves every CURR/QUAN field's real
*& DDIC reference field (REFTABLE/REFFIELD, the same DFIES columns ALV/table
*& controls use) and checks it against the interface's own top-level scalars
*& - read this before writing any SFPREF entry, never infer a field's
*& CURR/QUAN kind from anything else (see BUILD_ISSUES_LOG.md F50).
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
PARAMETERS p_pref2 TYPE char10 DEFAULT 'Y'.
PARAMETERS p_vol   AS CHECKBOX DEFAULT abap_true.
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

    " Per driver program: where its extracted source landed, what other
    " Z*/Y* objects it appears to reference, and which of its own
    " INCLUDEs were followed and extracted too (one level deep).
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

    TYPES: BEGIN OF ty_kind,
             code  TYPE c LENGTH 1,
             title TYPE string,
           END OF ty_kind,
           tt_kind TYPE STANDARD TABLE OF ty_kind WITH EMPTY KEY.

    "! True if the name starts with either custom prefix (P_PREF / P_PREF2,
    "! default Z and Y). Used instead of hard-coding 'Z' so Y-forms and
    "! Y-programs are covered too.
    METHODS is_custom
      IMPORTING iv_name          TYPE clike
      RETURNING VALUE(rv_custom) TYPE abap_bool.

    "! One-line "COLUMN=value, COLUMN=value" rendering of every NON-initial
    "! elementary column of any flat row, minus the columns in IT_SKIP.
    "! Reflection only - no column name is hard-coded, so an unexpected
    "! table layout can't break activation (same discipline as dump_any).
    METHODS dump_nonempty
      IMPORTING is_row         TYPE any
                it_skip        TYPE string_table OPTIONAL
      RETURNING VALUE(rv_text) TYPE string.

    "! Distinct custom (Z*/Y*) type names mentioned in the interface rows
    "! of a function module (read from FUPARAREF with SELECT *, then any
    "! non-empty column value with a custom prefix).
    METHODS interface_custom_types
      IMPORTING iv_fm_name      TYPE char30
      RETURNING VALUE(rt_types) TYPE string_table.

    "! DDIC layout of one type (structure, or the line type of a table
    "! type): every field with data element, type, length, decimals.
    "! Runtime lookup with classic EXCEPTIONS handling (F12 lesson).
    METHODS describe_type
      IMPORTING iv_type         TYPE string
      RETURNING VALUE(rt_lines) TYPE string_table.

    "! DDIC domain datatype of one elementary type (CUKY/UNIT/CHAR/...) -
    "! same DFIES-based RTTI as describe_type. Unconfirmed against a real
    "! system yet - degrades to empty on any failure, never a guess.
    METHODS classify_scalar
      IMPORTING iv_type        TYPE string
      RETURNING VALUE(rv_kind) TYPE string.

    "! Every CURR/QUAN field across the interface's custom types, with its
    "! real DDIC reference field (REFTABLE/REFFIELD) and whether a top-level
    "! scalar already covers it - see BUILD_ISSUES_LOG.md F50.
    METHODS capture_reference_requirements
      IMPORTING iv_fm_name      TYPE char30
                it_custom_types TYPE string_table
      RETURNING VALUE(rt_lines) TYPE string_table.

    "! Interfaces of the custom function modules a driver calls
    "! (CALL FUNCTION 'Z...' / 'Y...' lines from the dependency scan).
    METHODS dependency_fm_interfaces
      IMPORTING it_deps         TYPE string_table
      RETURNING VALUE(rt_lines) TYPE string_table.

    "! Usage evidence for an output type from NAST: total rows, rows in
    "! the last 365 / 30 days, processed rows, first and last date.
    "! Answers "is this form still used, and how much" - the volume input
    "! for the risk score.
    METHODS capture_volume
      IMPORTING iv_kappl        TYPE nast-kappl
                iv_kschl        TYPE nast-kschl
      RETURNING VALUE(rt_lines) TYPE string_table.

    "! Extracts a program that NACE names as driver (TNAPR-PGNAM) even
    "! when the source-text scan missed it: source to its own file, its
    "! custom includes one level deep, and the dependency scan. Skips
    "! standard SAP programs (not ours to migrate).
    METHODS ensure_driver_extracted
      IMPORTING iv_progname TYPE string.

    "! Report lines for one extracted driver: source file, includes and
    "! dependencies (same layout as the source-scan candidates).
    METHODS driver_info_lines
      IMPORTING iv_progname     TYPE string
      RETURNING VALUE(rt_lines) TYPE string_table.

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

    "! Also exports the distinct PGNAM (driver program) values found on any
    "! matching TNAPR row - the authoritative driver identity per NACE
    "! output-type configuration, used by write_snapshot to cross-check
    "! against build_driver_index's source-scan candidates (see the fix
    "! for the ZSD_ATC false-positive/false-negative driver, F1-ish class,
    "! docs/BUILD_ISSUES_LOG.md ZSD_ATC section).
    "! Also exports the distinct KAPPL/KSCHL pairs (application and output
    "! type) of every matching TNAPR row, so write_snapshot can count real
    "! usage in NAST (capture_volume).
    METHODS capture_output_determination
      IMPORTING iv_formname     TYPE string
      EXPORTING et_pgnam        TYPE string_table
                et_keys         TYPE string_table
      RETURNING VALUE(rt_lines) TYPE string_table.

    "! Safely tries a short list of candidate table names that might hold
    "! this form's SmartStyle/logo linkage - none confirmed to exist, but
    "! trying is zero-risk: RTTI resolves each name at RUNTIME (a bad name
    "! is a caught exception, not an activation failure the way a static
    "! SELECT against a wrong table would be), and any table found is read
    "! generically (SELECT * + dump_any, no column names needed either) and
    "! scanned for this form's name. Aimed at closing the SmartStyle/logo
    "! gap for all forms at once, not per form - see docs/02_legacy_grab_spec.md.
    METHODS probe_form_storage
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

    " One form failing must not stop the other 499: a catchable error is
    " reported and the run moves on. (Non-class-based runtime errors such as
    " CALL_FUNCTION_CONFLICT_TYPE still dump - resolve_fm_name already guards
    " that one - so the log lists which forms were completed.)
    DATA lv_failed TYPE i.
    DATA lv_done   TYPE i.
    LOOP AT lt_forms INTO DATA(lv_form).
      TRY.
          process_form( iv_formname = lv_form it_idx = lt_idx ).
          lv_done = lv_done + 1.
        CATCH cx_root INTO DATA(lx_form).
          lv_failed = lv_failed + 1.
          w( |ERROR { lv_form }: { lx_form->get_text( ) } - form skipped, run continues.| ).
      ENDTRY.
    ENDLOOP.
    w( |Forms completed: { lv_done }, failed: { lv_failed }.| ).
    w( |Done. Snapshots and driver source files written under { p_path }.| ).
    w( |Drop them into docs/legacy_grab/ of Smartform-Adobe-Migration and push.| ).
  ENDMETHOD.

  METHOD get_form_list.
    DATA lt_result   TYPE string_table.
    DATA lv_pattern  TYPE string.
    DATA lv_pattern2 TYPE string.

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
      lv_pattern2 = COND #( WHEN p_pref2 IS INITIAL THEN lv_pattern ELSE p_pref2 && '%' ).
      SELECT obj_name FROM tadir INTO TABLE @DATA(lt_tadir)
        WHERE pgmid = 'R3TR' AND object = 'SSFO'
          AND ( obj_name LIKE @lv_pattern OR obj_name LIKE @lv_pattern2 ).
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

    DATA lv_pattern2 TYPE string.
    lv_pattern = p_pref && '%'.
    lv_pattern2 = COND #( WHEN p_pref2 IS INITIAL THEN lv_pattern ELSE p_pref2 && '%' ).
    SELECT obj_name FROM tadir INTO TABLE @DATA(lt_prog)
      WHERE pgmid = 'R3TR' AND object = 'PROG'
        AND ( obj_name LIKE @lv_pattern OR obj_name LIKE @lv_pattern2 ).
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

      " Collect every line where SSF_FUNCTION_MODULE_NAME is actually
      " called - a program can call it more than once, for more than one
      " form.
      DATA lt_call_idx TYPE TABLE OF i.
      CLEAR lt_call_idx.
      LOOP AT lt_source INTO DATA(lv_line).
        IF lv_line CS 'SSF_FUNCTION_MODULE_NAME'.
          APPEND sy-tabix TO lt_call_idx.
        ENDIF.
      ENDLOOP.
      IF lt_call_idx IS INITIAL.
        CONTINUE.
      ENDIF.

      " Fix for the confirmed ZSD_ATC false-positive driver match
      " (docs/BUILD_ISSUES_LOG.md, ZSD_ATC section): matching the form name
      " ANYWHERE in the whole file was too loose - two unrelated programs
      " matched this way (each calling SSF_FUNCTION_MODULE_NAME for a
      " different form, while separately mentioning this form's name
      " elsewhere) while the real driver, which calls a wrapper routine
      " instead of this FM directly, was missed entirely. Require the form
      " name within a bounded window of an actual call site instead of the
      " whole file - a real, meaningful tightening, though still not proof:
      " a genuine call site almost always passes a variable as FORMNAME
      " (see this report's own RESOLVE_FM_NAME), not a literal, so a plain
      " text scan can never fully confirm the argument value. A window hit
      " is still only a CANDIDATE - write_snapshot cross-checks it against
      " NACE/TNAPR's PGNAM (capture_output_determination), which is the
      " actual authority on driver identity.
      CLEAR lt_matched_forms.
      LOOP AT it_forms INTO DATA(lv_form).
        DATA lv_found TYPE abap_bool.
        lv_found = abap_false.
        LOOP AT lt_call_idx INTO DATA(lv_hit_idx).
          DATA lv_from TYPE i.
          DATA lv_to   TYPE i.
          lv_from = lv_hit_idx - 20.
          IF lv_from < 1.
            lv_from = 1.
          ENDIF.
          lv_to = lv_hit_idx + 20.

          DATA lv_window TYPE string.
          CLEAR lv_window.
          LOOP AT lt_source INTO DATA(lv_wline) FROM lv_from TO lv_to.
            lv_window = lv_window && lv_wline && | |.
          ENDLOOP.
          IF lv_window CS lv_form.
            lv_found = abap_true.
            EXIT.
          ENDIF.
        ENDLOOP.
        IF lv_found = abap_true.
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

      IF is_custom( lv_inclname ) = abap_false.
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
    " SELECT * (not a column list) so the typing, reference, default and
    " optional flags come along without any column name being guessed here;
    " dump_nonempty prints whatever the row actually carries. FUNCNAME,
    " R3STATE, PARAMETER and PARAMTYPE are the four columns already proven
    " above and are handled explicitly.
    SELECT * FROM fupararef INTO TABLE @DATA(lt_params)
      WHERE funcname = @iv_fm_name AND r3state = 'A'.
    IF sy-subrc <> 0 OR lt_params IS INITIAL.
      APPEND |(no FUPARAREF rows for { iv_fm_name } - confirm manually via SE37)| TO rt_lines.
      RETURN.
    ENDIF.

    DATA(lt_kind) = VALUE tt_kind(
      ( code = 'I' title = `IMPORTING:` )
      ( code = 'E' title = `EXPORTING:` )
      ( code = 'T' title = `TABLES:` )
      ( code = 'C' title = `CHANGING:` )
      ( code = 'X' title = `EXCEPTIONS:` ) ).
    DATA(lt_skip) = VALUE string_table(
      ( `FUNCNAME` ) ( `R3STATE` ) ( `PARAMETER` ) ( `PARAMTYPE` ) ).

    LOOP AT lt_kind INTO DATA(ls_kind).
      APPEND ls_kind-title TO rt_lines.
      LOOP AT lt_params INTO DATA(ls_p) WHERE paramtype = ls_kind-code.
        DATA(lv_detail) = dump_nonempty( is_row = ls_p it_skip = lt_skip ).
        IF lv_detail IS INITIAL.
          APPEND |- { ls_p-parameter }| TO rt_lines.
        ELSE.
          APPEND |- { ls_p-parameter } ({ lv_detail })| TO rt_lines.
        ENDIF.
      ENDLOOP.
    ENDLOOP.
  ENDMETHOD.

  METHOD is_custom.
    rv_custom = abap_false.
    IF iv_name IS INITIAL.
      RETURN.
    ENDIF.
    DATA(lv_up) = to_upper( |{ iv_name }| ).
    IF p_pref IS NOT INITIAL AND lv_up CP |{ p_pref }*|.
      rv_custom = abap_true.
    ELSEIF p_pref2 IS NOT INITIAL AND lv_up CP |{ p_pref2 }*|.
      rv_custom = abap_true.
    ENDIF.
  ENDMETHOD.

  METHOD dump_nonempty.
    DATA(lo_type) = cl_abap_typedescr=>describe_by_data( is_row ).
    IF lo_type->kind <> cl_abap_typedescr=>kind_struct.
      RETURN.
    ENDIF.
    DATA(lo_struct) = CAST cl_abap_structdescr( lo_type ).
    LOOP AT lo_struct->components INTO DATA(ls_comp).
      READ TABLE it_skip WITH KEY table_line = ls_comp-name TRANSPORTING NO FIELDS.
      IF sy-subrc = 0.
        CONTINUE.
      ENDIF.
      ASSIGN COMPONENT ls_comp-name OF STRUCTURE is_row TO FIELD-SYMBOL(<fs>).
      IF sy-subrc <> 0 OR <fs> IS INITIAL.
        CONTINUE.
      ENDIF.
      DATA(lo_comp_type) = cl_abap_typedescr=>describe_by_data( <fs> ).
      IF lo_comp_type->kind <> cl_abap_typedescr=>kind_elem.
        CONTINUE.
      ENDIF.
      DATA(lv_val) = |{ <fs> }|.
      CONDENSE lv_val.
      IF rv_text IS INITIAL.
        rv_text = |{ ls_comp-name }={ lv_val }|.
      ELSE.
        rv_text = |{ rv_text }, { ls_comp-name }={ lv_val }|.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.

  METHOD interface_custom_types.
    IF iv_fm_name IS INITIAL.
      RETURN.
    ENDIF.
    SELECT * FROM fupararef INTO TABLE @DATA(lt_params)
      WHERE funcname = @iv_fm_name AND r3state = 'A'.
    IF sy-subrc <> 0.
      RETURN.
    ENDIF.

    LOOP AT lt_params INTO DATA(ls_p).
      DATA(lo_struct) = CAST cl_abap_structdescr( cl_abap_typedescr=>describe_by_data( ls_p ) ).
      LOOP AT lo_struct->components INTO DATA(ls_comp).
        IF ls_comp-name = 'FUNCNAME' OR ls_comp-name = 'PARAMETER'.
          CONTINUE.
        ENDIF.
        ASSIGN COMPONENT ls_comp-name OF STRUCTURE ls_p TO FIELD-SYMBOL(<fs>).
        IF sy-subrc <> 0 OR <fs> IS INITIAL.
          CONTINUE.
        ENDIF.
        DATA(lo_comp_type) = cl_abap_typedescr=>describe_by_data( <fs> ).
        IF lo_comp_type->kind <> cl_abap_typedescr=>kind_elem.
          CONTINUE.
        ENDIF.
        DATA(lv_val) = to_upper( |{ <fs> }| ).
        CONDENSE lv_val.
        " > 2 characters: single-letter flags ('X', 'Y') are not type names.
        IF strlen( lv_val ) > 2 AND is_custom( lv_val ) = abap_true.
          APPEND lv_val TO rt_types.
        ENDIF.
      ENDLOOP.
    ENDLOOP.

    SORT rt_types.
    DELETE ADJACENT DUPLICATES FROM rt_types.
  ENDMETHOD.

  METHOD describe_type.
    DATA lo_descr TYPE REF TO cl_abap_typedescr.
    " Classic EXCEPTIONS handling: TYPE_NOT_FOUND is not class-based (F12).
    CALL METHOD cl_abap_typedescr=>describe_by_name
      EXPORTING
        p_name         = iv_type
      RECEIVING
        p_descr_ref    = lo_descr
      EXCEPTIONS
        type_not_found = 1
        OTHERS         = 2.
    IF sy-subrc <> 0 OR lo_descr IS NOT BOUND.
      APPEND |`{ iv_type }`: not found as a DDIC type on this system - confirm manually in SE11.| TO rt_lines.
      RETURN.
    ENDIF.

    DATA lo_struct TYPE REF TO cl_abap_structdescr.
    IF lo_descr->kind = cl_abap_typedescr=>kind_table.
      DATA(lo_line) = CAST cl_abap_tabledescr( lo_descr )->get_table_line_type( ).
      APPEND |`{ iv_type }` is a table type - line type:| TO rt_lines.
      IF lo_line->kind = cl_abap_typedescr=>kind_struct.
        lo_struct = CAST cl_abap_structdescr( lo_line ).
      ENDIF.
    ELSEIF lo_descr->kind = cl_abap_typedescr=>kind_struct.
      lo_struct = CAST cl_abap_structdescr( lo_descr ).
    ELSE.
      APPEND |`{ iv_type }`: elementary type ({ lo_descr->type_kind }, length { lo_descr->length }).| TO rt_lines.
      RETURN.
    ENDIF.

    IF lo_struct IS NOT BOUND.
      APPEND |`{ iv_type }`: not a structure - confirm manually in SE11.| TO rt_lines.
      RETURN.
    ENDIF.

    DATA lt_fields TYPE ddfields.
    CALL METHOD lo_struct->get_ddic_field_list
      RECEIVING
        p_field_list = lt_fields
      EXCEPTIONS
        not_found    = 1
        no_ddic_type = 2
        OTHERS       = 3.
    IF sy-subrc = 0 AND lt_fields IS NOT INITIAL.
      APPEND |`{ iv_type }` - { lines( lt_fields ) } field(s):| TO rt_lines.
      LOOP AT lt_fields INTO DATA(ls_f).
        APPEND |- { ls_f-fieldname } (element { ls_f-rollname }, type { ls_f-datatype }, length { ls_f-leng }, decimals { ls_f-decimals })| TO rt_lines.
      ENDLOOP.
    ELSE.
      " Not a DDIC-backed structure: fall back to the technical components.
      APPEND |`{ iv_type }` - technical components (no DDIC field list available):| TO rt_lines.
      LOOP AT lo_struct->components INTO DATA(ls_c).
        APPEND |- { ls_c-name } (type kind { ls_c-type_kind }, length { ls_c-length }, decimals { ls_c-decimals })| TO rt_lines.
      ENDLOOP.
    ENDIF.
  ENDMETHOD.

  "! DDIC domain datatype of one elementary type (e.g. CUKY for a currency
  "! key, UNIT for a unit of measure) - same DFIES-based RTTI as
  "! describe_type, authoritative, never guessed. CL_ABAP_ELEMDESCR's
  "! GET_DDIC_FIELD has not been run against a real system in this project
  "! yet (unconfirmed signature) - wrapped so a mismatch degrades to an
  "! empty result (falls back to name-matching in capture_reference_
  "! requirements below) rather than risking a dump.
  METHOD classify_scalar.
    DATA lo_descr TYPE REF TO cl_abap_typedescr.
    CALL METHOD cl_abap_typedescr=>describe_by_name
      EXPORTING
        p_name         = iv_type
      RECEIVING
        p_descr_ref    = lo_descr
      EXCEPTIONS
        type_not_found = 1
        OTHERS         = 2.
    IF sy-subrc <> 0 OR lo_descr IS NOT BOUND OR lo_descr->kind <> cl_abap_typedescr=>kind_elem.
      RETURN.
    ENDIF.
    DATA lo_elem TYPE REF TO cl_abap_elemdescr.
    TRY.
        lo_elem = CAST cl_abap_elemdescr( lo_descr ).
      CATCH cx_root.
        RETURN.
    ENDTRY.
    DATA ls_dfies TYPE dfies.
    CALL METHOD lo_elem->get_ddic_field
      EXPORTING
        p_langu    = sy-langu
      RECEIVING
        p_flddescr = ls_dfies
      EXCEPTIONS
        not_found  = 1
        OTHERS     = 2.
    IF sy-subrc = 0.
      rv_kind = ls_dfies-datatype.
    ENDIF.
  ENDMETHOD.

  "! For every CURR/QUAN field in the interface's own import parameters and
  "! custom table/structure row types, resolves its real DDIC reference
  "! field (REFTABLE/REFFIELD - the same DFIES columns ALV and table
  "! controls use for this exact purpose, read directly off the same
  "! GET_DDIC_FIELD_LIST call describe_type already makes, never guessed)
  "! and checks whether a top-level interface scalar already exists to use
  "! as the SFPREF UNIT. This is what would have caught KAWRT's real
  "! DATATYPE from the start (BUILD_ISSUES_LOG.md F50) instead of inferring
  "! it from a client-side abapGit error - every CURR/QUAN field in the
  "! interface is listed here before any SFPREF entry is written.
  METHOD capture_reference_requirements.
    " Collect every CURR/QUAN field across the interface's own custom types,
    " with its evidenced reference field.
    TYPES: BEGIN OF ty_hit,
             owner_type TYPE string,
             fieldname  TYPE string,
             datatype   TYPE string,
             reftable   TYPE string,
             reffield   TYPE string,
           END OF ty_hit,
           tt_hit TYPE STANDARD TABLE OF ty_hit WITH EMPTY KEY.
    DATA lt_hits TYPE tt_hit.

    LOOP AT it_custom_types INTO DATA(lv_type).
      DATA lo_descr TYPE REF TO cl_abap_typedescr.
      CALL METHOD cl_abap_typedescr=>describe_by_name
        EXPORTING
          p_name         = lv_type
        RECEIVING
          p_descr_ref    = lo_descr
        EXCEPTIONS
          type_not_found = 1
          OTHERS         = 2.
      IF sy-subrc <> 0 OR lo_descr IS NOT BOUND.
        CONTINUE.
      ENDIF.
      DATA lo_struct TYPE REF TO cl_abap_structdescr.
      IF lo_descr->kind = cl_abap_typedescr=>kind_table.
        DATA(lo_line) = CAST cl_abap_tabledescr( lo_descr )->get_table_line_type( ).
        IF lo_line->kind = cl_abap_typedescr=>kind_struct.
          lo_struct = CAST cl_abap_structdescr( lo_line ).
        ENDIF.
      ELSEIF lo_descr->kind = cl_abap_typedescr=>kind_struct.
        lo_struct = CAST cl_abap_structdescr( lo_descr ).
      ENDIF.
      IF lo_struct IS NOT BOUND.
        CONTINUE.
      ENDIF.

      DATA lt_fields TYPE ddfields.
      CALL METHOD lo_struct->get_ddic_field_list
        RECEIVING
          p_field_list = lt_fields
        EXCEPTIONS
          not_found    = 1
          no_ddic_type = 2
          OTHERS       = 3.
      IF sy-subrc <> 0.
        CONTINUE.
      ENDIF.
      LOOP AT lt_fields INTO DATA(ls_f) WHERE datatype = 'CURR' OR datatype = 'QUAN'.
        APPEND VALUE #( owner_type = lv_type fieldname = ls_f-fieldname datatype = ls_f-datatype
                         reftable = ls_f-reftable reffield = ls_f-reffield ) TO lt_hits.
      ENDLOOP.
    ENDLOOP.

    IF lt_hits IS INITIAL.
      APPEND `No CURR/QUAN fields found in this interface's custom table/structure types.` TO rt_lines.
      RETURN.
    ENDIF.

    " Build a lookup of this form's own OWN import parameters (non-STANDARD)
    " as candidate top-level UNIT scalars, classified by DDIC domain where
    " possible (CUKY for currency keys, UNIT for units of measure).
    SELECT parameter, paramtype FROM fupararef INTO TABLE @DATA(lt_params)
      WHERE funcname = @iv_fm_name AND r3state = 'A' AND paramtype = 'I'.
    TYPES: BEGIN OF ty_scalar,
             name  TYPE string,
             kind  TYPE string,
           END OF ty_scalar,
           tt_scalar TYPE STANDARD TABLE OF ty_scalar WITH EMPTY KEY.
    DATA lt_scalars TYPE tt_scalar.
    LOOP AT lt_params INTO DATA(ls_p).
      DATA(lv_tname) = dump_nonempty( is_row = ls_p it_skip = VALUE string_table( ( `FUNCNAME` ) ( `PARAMETER` ) ( `PARAMTYPE` ) ) ).
      " TYPENAME is one of the dumped fields; pull it out rather than re-querying.
      FIND REGEX 'TYPENAME=(\S+?)(,|$)' IN lv_tname SUBMATCHES DATA(lv_typename).
      APPEND VALUE #( name = to_upper( ls_p-parameter ) kind = classify_scalar( lv_typename ) ) TO lt_scalars.
    ENDLOOP.

    APPEND `Field | reference needed | resolution` TO rt_lines.
    APPEND `---|---|---` TO rt_lines.
    LOOP AT lt_hits INTO DATA(ls_hit).
      DATA(lv_need) = COND string( WHEN ls_hit-datatype = 'CURR' THEN 'CUKY (currency key)' ELSE 'UNIT (unit of measure)' ).
      DATA lv_resolution TYPE string.
      CLEAR lv_resolution.
      " 1) Exact name match: a top-level scalar literally named like the DDIC reference field.
      READ TABLE lt_scalars WITH KEY name = to_upper( ls_hit-reffield ) TRANSPORTING NO FIELDS.
      IF sy-subrc = 0.
        lv_resolution = |use existing `{ to_upper( ls_hit-reffield ) }` (name matches the DDIC reference field exactly)|.
      ELSE.
        " 2) Domain match: any top-level scalar of the right CUKY/UNIT kind,
        " even under a different local name (this is what actually resolved
        " KAWRT/FKIMG - LV_WAERK, not a field literally named WAERS).
        DATA(lv_want) = COND string( WHEN ls_hit-datatype = 'CURR' THEN 'CUKY' ELSE 'UNIT' ).
        LOOP AT lt_scalars INTO DATA(ls_s) WHERE kind = lv_want.
          lv_resolution = |use existing `{ ls_s-name }` ({ lv_want }-typed, matches by domain not by name)|.
          EXIT.
        ENDLOOP.
      ENDIF.
      IF lv_resolution IS INITIAL.
        lv_resolution = |GAP - no { lv_need } scalar found in this interface; add one (e.g. a global typed { COND #( WHEN ls_hit-datatype = 'CURR' THEN 'WAERK' ELSE 'MEINS' ) })|.
      ENDIF.
      APPEND |`{ ls_hit-owner_type }-{ ls_hit-fieldname }` ({ ls_hit-datatype }) | &&
             |{ lv_need } | &&
             |{ lv_resolution }| TO rt_lines.
    ENDLOOP.
    APPEND `` TO rt_lines.
    APPEND `Domain classification (CUKY/UNIT) depends on CL_ABAP_ELEMDESCR->GET_DDIC_FIELD,` TO rt_lines.
    APPEND `not yet confirmed against a real system - if every "resolution" above says GAP` TO rt_lines.
    APPEND `even for a field you know has a reference (like LV_WAERK here), that call likely` TO rt_lines.
    APPEND `failed silently; fall back to checking by name/eye until confirmed.` TO rt_lines.
  ENDMETHOD.

  METHOD dependency_fm_interfaces.
    DATA lt_seen TYPE string_table.
    LOOP AT it_deps INTO DATA(lv_dep).
      DATA lv_fm TYPE string.
      CLEAR lv_fm.
      FIND FIRST OCCURRENCE OF REGEX `CALL FUNCTION '([ZY][A-Za-z0-9_/]*)'` IN lv_dep
        IGNORING CASE SUBMATCHES lv_fm.
      IF sy-subrc <> 0 OR lv_fm IS INITIAL.
        CONTINUE.
      ENDIF.
      lv_fm = to_upper( lv_fm ).
      READ TABLE lt_seen WITH KEY table_line = lv_fm TRANSPORTING NO FIELDS.
      IF sy-subrc = 0.
        CONTINUE.
      ENDIF.
      APPEND lv_fm TO lt_seen.

      DATA lv_fm30 TYPE char30.
      lv_fm30 = lv_fm.
      APPEND |Custom function module `{ lv_fm }` - interface:| TO rt_lines.
      APPEND LINES OF capture_interface( lv_fm30 ) TO rt_lines.
    ENDLOOP.
  ENDMETHOD.

  METHOD capture_volume.
    " COUNT / MAX / MIN on NAST for one application + output type. KAPPL,
    " KSCHL, ERDAT and VSTAT are standard NAST fields. Read-only; can be slow
    " on a very large NAST - untick P_VOL to skip.
    DATA lv_from365 TYPE d.
    DATA lv_from30  TYPE d.
    lv_from365 = sy-datum - 365.
    lv_from30  = sy-datum - 30.

    SELECT COUNT( * ) FROM nast
      WHERE kappl = @iv_kappl AND kschl = @iv_kschl
      INTO @DATA(lv_total).
    IF lv_total = 0.
      APPEND |{ iv_kappl }/{ iv_kschl }: no NAST rows - never output (or archived).| TO rt_lines.
      RETURN.
    ENDIF.

    SELECT COUNT( * ) FROM nast
      WHERE kappl = @iv_kappl AND kschl = @iv_kschl AND erdat >= @lv_from365
      INTO @DATA(lv_365).
    SELECT COUNT( * ) FROM nast
      WHERE kappl = @iv_kappl AND kschl = @iv_kschl AND erdat >= @lv_from30
      INTO @DATA(lv_30).
    SELECT COUNT( * ) FROM nast
      WHERE kappl = @iv_kappl AND kschl = @iv_kschl AND vstat = '1'
      INTO @DATA(lv_ok).
    SELECT MIN( erdat ) FROM nast
      WHERE kappl = @iv_kappl AND kschl = @iv_kschl
      INTO @DATA(lv_first).
    SELECT MAX( erdat ) FROM nast
      WHERE kappl = @iv_kappl AND kschl = @iv_kschl
      INTO @DATA(lv_last).

    APPEND |{ iv_kappl }/{ iv_kschl }: total { lv_total }, last 365 days { lv_365 }, last 30 days { lv_30 }, processed OK { lv_ok }; first { lv_first DATE = ISO }, last { lv_last DATE = ISO }.| TO rt_lines.
  ENDMETHOD.

  METHOD ensure_driver_extracted.
    IF iv_progname IS INITIAL.
      RETURN.
    ENDIF.
    DATA lv_prog TYPE tadir-obj_name.
    lv_prog = to_upper( iv_progname ).
    IF is_custom( lv_prog ) = abap_false.
      RETURN.
    ENDIF.
    READ TABLE mt_prog_info WITH KEY progname = lv_prog TRANSPORTING NO FIELDS.
    IF sy-subrc = 0.
      RETURN.
    ENDIF.

    DATA lt_source TYPE string_table.
    READ REPORT lv_prog INTO lt_source.
    IF sy-subrc <> 0 OR lt_source IS INITIAL.
      RETURN.
    ENDIF.

    DATA(lv_file) = write_driver_source( iv_progname = lv_prog it_source = lt_source ).
    DATA(lt_deps) = scan_dependencies( lt_source ).
    DATA lt_inc TYPE string_table.
    extract_includes( EXPORTING it_source        = lt_source
                       CHANGING  ct_include_files = lt_inc
                                 ct_deps          = lt_deps ).
    APPEND VALUE #( progname      = lv_prog
                     source_file   = lv_file
                     deps          = lt_deps
                     include_files = lt_inc ) TO mt_prog_info.
  ENDMETHOD.

  METHOD driver_info_lines.
    DATA lv_prog TYPE tadir-obj_name.
    lv_prog = to_upper( iv_progname ).
    DATA(ls_info) = get_prog_info( lv_prog ).
    IF ls_info-source_file IS NOT INITIAL.
      APPEND |  full source extracted to `{ ls_info-source_file }`| TO rt_lines.
    ELSEIF is_custom( lv_prog ) = abap_false.
      APPEND |  `{ lv_prog }` is not a custom (Z/Y) program - standard SAP code, not extracted.| TO rt_lines.
    ELSE.
      APPEND `  (source extraction failed - check authorization to READ REPORT, or the name is a routine/include)` TO rt_lines.
    ENDIF.
    IF ls_info-include_files IS NOT INITIAL.
      APPEND `  included programs extracted (one level deep):` TO rt_lines.
      LOOP AT ls_info-include_files INTO DATA(lv_inc).
        APPEND |    { lv_inc }| TO rt_lines.
      ENDLOOP.
    ENDIF.
    IF ls_info-deps IS NOT INITIAL.
      APPEND `  dependent objects referenced (raw source lines - confirm each one):` TO rt_lines.
      LOOP AT ls_info-deps INTO DATA(lv_dep).
        APPEND |    { lv_dep }| TO rt_lines.
      ENDLOOP.
      APPEND LINES OF dependency_fm_interfaces( ls_info-deps ) TO rt_lines.
    ENDIF.
  ENDMETHOD.

  METHOD capture_output_determination.
    CLEAR: et_pgnam, et_keys.

    SELECT * FROM tnapr INTO TABLE @DATA(lt_tnapr) UP TO 50000 ROWS.
    IF sy-subrc <> 0 OR lt_tnapr IS INITIAL.
      APPEND `(no TNAPR rows read - table may not exist/be authorized here; confirm manually via NACE)` TO rt_lines.
      RETURN.
    ENDIF.

    DATA lv_hits TYPE i.
    LOOP AT lt_tnapr INTO DATA(ls_row).
      DATA(lt_dump)   = dump_any( ls_row ).
      DATA(lv_joined) = concat_lines_of( table = lt_dump sep = | | ).
      " Exact match on SFORM (the Smart Form column of TNAPR) when the row
      " has one, so ZSD_ATC no longer picks up ZSD_ATC_NEW's output type as a
      " substring hit. Rows with an empty SFORM keep the old "name appears in
      " any column" test.
      DATA(lv_is_hit) = abap_false.
      ASSIGN COMPONENT 'SFORM' OF STRUCTURE ls_row TO FIELD-SYMBOL(<fs_sform>).
      IF sy-subrc = 0 AND <fs_sform> IS NOT INITIAL.
        IF to_upper( |{ <fs_sform> }| ) = to_upper( iv_formname ).
          lv_is_hit = abap_true.
        ENDIF.
      ELSEIF lv_joined CS iv_formname.
        lv_is_hit = abap_true.
      ENDIF.
      IF lv_is_hit = abap_true.
        lv_hits = lv_hits + 1.
        APPEND `-` TO rt_lines.
        APPEND LINES OF lt_dump TO rt_lines.
        " PGNAM (print/driver program) is a standard TNAPR field - this is
        " NACE's own record of the driver, independent of and more
        " authoritative than build_driver_index's source-text scan.
        IF ls_row-pgnam IS NOT INITIAL.
          APPEND ls_row-pgnam TO et_pgnam.
        ENDIF.
        " Application + output type of the matching row, for the NAST usage
        " count. Assigned by name (KAPPL / KSCHL are standard TNAPR keys) and
        " only used when both resolve, so a surprise here can't dump.
        ASSIGN COMPONENT 'KAPPL' OF STRUCTURE ls_row TO FIELD-SYMBOL(<fs_kappl>).
        DATA(lv_kappl_rc) = sy-subrc.
        ASSIGN COMPONENT 'KSCHL' OF STRUCTURE ls_row TO FIELD-SYMBOL(<fs_kschl>).
        IF lv_kappl_rc = 0 AND sy-subrc = 0.
          APPEND |{ <fs_kappl> }/{ <fs_kschl> }| TO et_keys.
        ENDIF.
      ENDIF.
    ENDLOOP.
    SORT et_keys.
    DELETE ADJACENT DUPLICATES FROM et_keys.

    IF lv_hits = 0.
      APPEND `(no TNAPR row mentions this form name - confirm manually via NACE; the` TO rt_lines.
      APPEND `output type may reference a driver routine rather than the form name directly)` TO rt_lines.
    ENDIF.

    IF et_pgnam IS NOT INITIAL.
      SORT et_pgnam.
      DELETE ADJACENT DUPLICATES FROM et_pgnam.
    ENDIF.
  ENDMETHOD.

  METHOD probe_form_storage.
    DATA(lt_candidates) = VALUE string_table(
      ( `STXFOBJECT` ) ( `STXFATTR` ) ( `STXFHEADER` ) ( `SSFOBJ` ) ).

    LOOP AT lt_candidates INTO DATA(lv_tab).
      DATA lo_struct TYPE REF TO cl_abap_structdescr.
      DATA lo_descr  TYPE REF TO cl_abap_typedescr.
      CLEAR: lo_struct, lo_descr.
      " NOTE (F12): DESCRIBE_BY_NAME's TYPE_NOT_FOUND is a classic,
      " non-class-based exception - TRY/CATCH cx_root around a functional
      " call NEVER catches it and dumps instead. Must use classic
      " CALL METHOD ... EXCEPTIONS syntax and check sy-subrc.
      CALL METHOD cl_abap_typedescr=>describe_by_name
        EXPORTING
          p_name      = lv_tab
        RECEIVING
          p_descr_ref = lo_descr
        EXCEPTIONS
          type_not_found = 1
          OTHERS         = 2.
      IF sy-subrc <> 0.
        CONTINUE.
      ENDIF.
      TRY.
          lo_struct = CAST cl_abap_structdescr( lo_descr ).
        CATCH cx_root.
          CONTINUE.
      ENDTRY.
      IF lo_struct IS NOT BOUND.
        CONTINUE.
      ENDIF.

      DATA lr_tab TYPE REF TO data.
      TRY.
          DATA(lo_tabtype) = cl_abap_tabledescr=>create(
            p_line_type  = lo_struct
            p_table_kind = cl_abap_tabledescr=>tablekind_std
            p_unique     = abap_false ).
          CREATE DATA lr_tab TYPE HANDLE lo_tabtype.
        CATCH cx_root.
          CONTINUE.
      ENDTRY.
      ASSIGN lr_tab->* TO FIELD-SYMBOL(<tab>).
      IF <tab> IS NOT ASSIGNED.
        CONTINUE.
      ENDIF.

      TRY.
          SELECT * FROM (lv_tab) INTO TABLE @<tab> UP TO 20000 ROWS.
        CATCH cx_root.
          CONTINUE.
      ENDTRY.
      IF sy-subrc <> 0 OR <tab> IS INITIAL.
        CONTINUE.
      ENDIF.

      DATA lv_hits TYPE i.
      lv_hits = 0.
      LOOP AT <tab> ASSIGNING FIELD-SYMBOL(<row>).
        DATA(lt_dump)   = dump_any( <row> ).
        DATA(lv_joined) = concat_lines_of( table = lt_dump sep = | | ).
        IF lv_joined CS iv_formname.
          lv_hits = lv_hits + 1.
          IF lv_hits <= 3.
            APPEND |candidate table { lv_tab } (unverified - confirm relevance):| TO rt_lines.
            APPEND `-` TO rt_lines.
            APPEND LINES OF lt_dump TO rt_lines.
          ENDIF.
        ENDIF.
      ENDLOOP.
      IF lv_hits > 3.
        APPEND |... and { lv_hits - 3 } more row(s) in { lv_tab }| TO rt_lines.
      ENDIF.
    ENDLOOP.

    IF rt_lines IS INITIAL.
      APPEND `(no candidate table matched - these were speculative guesses (STXFOBJECT,` TO rt_lines.
      APPEND `STXFATTR, STXFHEADER, SSFOBJ), tried safely: a wrong table name is skipped,` TO rt_lines.
      APPEND `not fatal. For a DEFINITIVE answer that unlocks safe automation for every` TO rt_lines.
      APPEND `remaining form at once (not just this one) - set an ABAP debugger` TO rt_lines.
      APPEND `breakpoint in SE71 at the point the SmartStyle name loads (or ask an` TO rt_lines.
      APPEND `ABAP/Basis colleague to), inspect which table/field it reads from, and` TO rt_lines.
      APPEND `share that.` TO rt_lines.
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
    APPEND `Each parameter shows every attribute FUPARAREF carries for it (type/structure,` TO lt_lines.
    APPEND `reference, default, optional ...) - the contract the Adobe interface must keep.` TO lt_lines.
    APPEND LINES OF capture_interface( iv_fm_name ) TO lt_lines.
    APPEND `` TO lt_lines.

    APPEND `### 2b. Custom types used by the interface (DDIC layout)` TO lt_lines.
    DATA(lt_custom_types) = interface_custom_types( iv_fm_name ).
    IF lt_custom_types IS INITIAL.
      APPEND `(no custom Z/Y type named in the interface, or no interface rows read)` TO lt_lines.
    ELSE.
      LOOP AT lt_custom_types INTO DATA(lv_ctype).
        APPEND LINES OF describe_type( lv_ctype ) TO lt_lines.
      ENDLOOP.
    ENDIF.
    APPEND `` TO lt_lines.

    APPEND `### 2c. Currency/quantity reference fields - resolve before building SFPREF` TO lt_lines.
    APPEND `Every CURR/QUAN field found above, with its real DDIC reference field and` TO lt_lines.
    APPEND `whether a top-level scalar already covers it. Read this before writing any` TO lt_lines.
    APPEND `REFERENCE_FIELDS entry - do not infer a field's CURR/QUAN kind from anything` TO lt_lines.
    APPEND `else (a client's rejected reference, a similar-sounding field name, ...) -` TO lt_lines.
    APPEND `this table is the DDIC's own answer. See BUILD_ISSUES_LOG.md F50.` TO lt_lines.
    IF lt_custom_types IS INITIAL.
      APPEND `(no custom types to check - see 2b)` TO lt_lines.
    ELSE.
      APPEND LINES OF capture_reference_requirements( iv_fm_name = iv_fm_name it_custom_types = lt_custom_types ) TO lt_lines.
    ENDIF.
    APPEND `` TO lt_lines.

    " Authoritative driver identity, captured once here so section 3 can be
    " cross-checked against it rather than standing as an unverified guess
    " (fix for the confirmed ZSD_ATC false-positive/false-negative driver
    " match - docs/BUILD_ISSUES_LOG.md, ZSD_ATC section).
    DATA lt_pgnam TYPE string_table.
    CLEAR lt_pgnam.
    DATA lt_keys TYPE string_table.
    CLEAR lt_keys.
    DATA(lt_nace_lines) = capture_output_determination(
      EXPORTING iv_formname = iv_formname
      IMPORTING et_pgnam    = lt_pgnam
                et_keys     = lt_keys ).

    " The driver NACE names is the authority - extract its source even when
    " the text scan (build_driver_index) missed it (the ZSD_ATC case: the
    " real driver calls a wrapper, so it never showed up as a candidate).
    LOOP AT lt_pgnam INTO DATA(lv_pgnam_x).
      ensure_driver_extracted( lv_pgnam_x ).
    ENDLOOP.

    APPEND `## 3. Driver program candidates (source + dependencies extracted)` TO lt_lines.

    APPEND `Driver identity check (NACE/TNAPR PGNAM vs. the source-text scan below):` TO lt_lines.
    IF lt_pgnam IS INITIAL.
      APPEND `NACE/TNAPR (section 4) names no PGNAM for this form - confirm manually` TO lt_lines.
      APPEND `via the NACE Processing Routines tab before trusting any candidate below.` TO lt_lines.
    ELSE.
      LOOP AT lt_pgnam INTO DATA(lv_pgnam_entry).
        DATA lv_is_candidate TYPE abap_bool.
        lv_is_candidate = abap_false.
        LOOP AT it_drivers INTO DATA(ls_check) WHERE progname = lv_pgnam_entry.
          lv_is_candidate = abap_true.
          EXIT.
        ENDLOOP.

        IF lv_is_candidate = abap_true.
          APPEND |MATCH - NACE names `{ lv_pgnam_entry }`, and the source scan independently| TO lt_lines.
          APPEND |found it below. Still confirm live before treating as final.| TO lt_lines.
        ELSE.
          DATA lv_pgnam_exists TYPE abap_bool.
          lv_pgnam_exists = abap_false.
          SELECT SINGLE obj_name FROM tadir INTO @DATA(lv_tadir_hit)
            WHERE pgmid = 'R3TR' AND object = 'PROG' AND obj_name = @lv_pgnam_entry.
          IF sy-subrc = 0.
            lv_pgnam_exists = abap_true.
          ENDIF.

          APPEND |MISMATCH - NACE names `{ lv_pgnam_entry }`, but the source scan did NOT| TO lt_lines.
          IF lv_pgnam_exists = abap_true.
            APPEND |find it (it exists as a program, so it most likely calls a wrapper routine| TO lt_lines.
            APPEND |rather than SSF_FUNCTION_MODULE_NAME directly - read its source manually).| TO lt_lines.
          ELSE.
            APPEND |find it, and it does not exist as a PROG in TADIR either (may be a routine| TO lt_lines.
            APPEND |or include name, not a standalone program). See docs/02_legacy_grab_spec.md| TO lt_lines.
            APPEND |for the debugger-breakpoint fallback.| TO lt_lines.
          ENDIF.
          APPEND |Treat this form's real driver as UNCONFIRMED until resolved with the| TO lt_lines.
          APPEND |functional owner - do not silently pick the nearest candidate below.| TO lt_lines.
        ENDIF.
      ENDLOOP.
    ENDIF.
    APPEND `` TO lt_lines.

    IF lt_pgnam IS NOT INITIAL.
      APPEND `Driver(s) named by NACE (authoritative - source extracted regardless of the scan):` TO lt_lines.
      LOOP AT lt_pgnam INTO DATA(lv_nace_prog).
        APPEND |- `{ lv_nace_prog }` (TNAPR-PGNAM)| TO lt_lines.
        APPEND LINES OF driver_info_lines( lv_nace_prog ) TO lt_lines.
      ENDLOOP.
      APPEND `` TO lt_lines.
    ENDIF.

    IF it_drivers IS INITIAL.
      APPEND `None found scanning Z*/Y* programs for a literal match near an` TO lt_lines.
      APPEND `SSF_FUNCTION_MODULE_NAME call. Confirm manually (NACE output-type` TO lt_lines.
      APPEND `Processing Routines tab, or ask the functional owner).` TO lt_lines.
    ELSE.
      LOOP AT it_drivers INTO DATA(ls_hit).
        DATA(ls_info) = get_prog_info( ls_hit-progname ).
        APPEND |- `{ ls_hit-progname }` (source-scan CANDIDATE - form name found near an SSF_FUNCTION_MODULE_NAME call; see the driver identity check above before trusting this. READ-ONLY: never modified - see docs/01_scope.md section 8)| TO lt_lines.
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
    APPEND LINES OF lt_nace_lines TO lt_lines.
    APPEND `` TO lt_lines.

    APPEND `### 4b. Usage evidence (NAST) - how much is this form really used?` TO lt_lines.
    IF p_vol = abap_false.
      APPEND `(skipped - P_VOL unticked)` TO lt_lines.
    ELSEIF lt_keys IS INITIAL.
      APPEND `(no application/output-type key found in section 4, so nothing to count)` TO lt_lines.
    ELSE.
      LOOP AT lt_keys INTO DATA(lv_key).
        DATA lv_kappl_s TYPE string.
        DATA lv_kschl_s TYPE string.
        DATA lv_kappl   TYPE nast-kappl.
        DATA lv_kschl   TYPE nast-kschl.
        CLEAR: lv_kappl_s, lv_kschl_s.
        SPLIT lv_key AT '/' INTO lv_kappl_s lv_kschl_s.
        lv_kappl = lv_kappl_s.
        lv_kschl = lv_kschl_s.
        TRY.
            APPEND LINES OF capture_volume( iv_kappl = lv_kappl iv_kschl = lv_kschl ) TO lt_lines.
          CATCH cx_root INTO DATA(lx_vol).
            APPEND |{ lv_key }: NAST count failed - { lx_vol->get_text( ) }| TO lt_lines.
        ENDTRY.
      ENDLOOP.
    ENDIF.
    APPEND `` TO lt_lines.

    APPEND `## 5. SSF_READ_FORM interface (auto-probed via FUPARAREF, informational only)` TO lt_lines.
    APPEND `Correction: this turned out NOT to be the layout/style/graphic read API -` TO lt_lines.
    APPEND `its EXPORTING fields (CAPTION/VARTEXT/FMNUMB/ACTIVE/ADMDATA) read as form` TO lt_lines.
    APPEND `header/admin metadata, and there is no TABLES parameter for a node tree.` TO lt_lines.
    APPEND `Kept for reference (occasionally useful for description/version) - sections` TO lt_lines.
    APPEND `6-8 stay manual, produced via the SFP "Create Adobe Form by Migration"` TO lt_lines.
    APPEND `wizard instead (see docs/05_individual_form_conversion_framework.md), not a` TO lt_lines.
    APPEND `background read.` TO lt_lines.
    IF mt_ssf_read_form_iface IS INITIAL.
      APPEND `(not probed)` TO lt_lines.
    ELSE.
      APPEND LINES OF mt_ssf_read_form_iface TO lt_lines.
    ENDIF.
    APPEND `` TO lt_lines.

    DATA(lt_storage_probe) = probe_form_storage( iv_formname ).

    APPEND `## 6. SmartStyle(s) used - auto-probe attempted, fallback MANUAL` TO lt_lines.
    APPEND LINES OF lt_storage_probe TO lt_lines.
    APPEND `SE71 -> Form Attributes -> Output Options shows the SmartStyle name this form` TO lt_lines.
    APPEND `uses. It should already be listed in docs/legacy_grab/global_smartstyles.txt` TO lt_lines.
    APPEND `(from the P_GLOB sweep) - just note WHICH one here and match it against` TO lt_lines.
    APPEND `docs/04_global_style_catalogue.md. Only research its format details fresh if` TO lt_lines.
    APPEND `it isn't in the global catalogue yet.` TO lt_lines.
    APPEND `` TO lt_lines.

    APPEND `## 7. Graphics / logos - see the storage probe in section 6` TO lt_lines.
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
    " Both prefixes (default Z and Y): a Y-form's SmartStyle (e.g. YGRNNOTE)
    " was missing from the inventory when only Z* was swept.
    DATA lv_pattern  TYPE string.
    DATA lv_pattern2 TYPE string.
    lv_pattern = p_pref && '%'.
    lv_pattern2 = COND #( WHEN p_pref2 IS INITIAL THEN lv_pattern ELSE p_pref2 && '%' ).
    SELECT obj_name FROM tadir INTO TABLE @DATA(lt_tadir_style)
      WHERE pgmid = 'R3TR' AND object = 'SSST'
        AND ( obj_name LIKE @lv_pattern OR obj_name LIKE @lv_pattern2 ).

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
