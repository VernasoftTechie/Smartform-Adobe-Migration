SORT IT_EKPO ASCENDING BY EBELN EBELP.

*----------------------------------------------------------------------*
* ZMMCG_PO_SF: the legacy program-lines nodes are re-hosted below because an
* Adobe form has no per-window / per-row / per-footer code. Legacy code is
* verbatim; every change is marked "BOLT:". Display tables / totals are what the
* layout prints (formatted exactly as the Smart Form printed the same variables).
*----------------------------------------------------------------------*
* BOLT: one declaration block - the nodes declared the same locals one by one.
DATA: lv_name        TYPE thead-tdname,
      lv_id          TYPE thead-tdid,
      v_kwert1       TYPE wmto_s-amount,
      lv_amt_i       TYPE int8_lew,    "goods words (legacy %CODE85)
      lv_amt_is      TYPE int4,        "service words (legacy %CODE12 declared int4)
      lv_string      TYPE string,
      lv_c1          TYPE string,
      lv_c2          TYPE string,
      lv_birr        TYPE string,
      lv_satim       TYPE string,
      lv_lang        LIKE sy-langu VALUE 'F',
      lt_zpos        TYPE ty_tline_tab,
      lv_nbsp        TYPE c LENGTH 1,         "no-break blank (item number padding)
      lv_fr          TYPE abap_bool,   "print language is French (terms)
      ls_term        TYPE ty_s_term,
      ls_goods       TYPE ty_s_goods,
      ls_service     TYPE ty_s_service.

* BOLT: Smart Forms start every document with empty globals; make that explicit.
CLEAR: v_slno, g_netwr, lv_flag, v_dis, v_frg, v_ins, v_oth, v_sub, v_total, v_totali,
       lv_vat, lv_ca, sub_total, vat, total, v_total1, gflag, lv_unitprice1, lv_total1,
       gt_goods, gt_service, gs_totals, gv_lifnr_out, gv_hdrtxt, gv_term1_zpos.
gv_langu = sy-langu.

*--- legacy node %CODE32 (WATER_MARK window: approved flag)
***SOC by kalyan on 09.05.2025
  if iv_rel_indicator eq 'R' or
    iv_rel_indicator eq 'A'.

    lv_flag = 'Y'.

    ENDIF.
***EOC by kalyan on 09.05.2025

*--- legacy node COMP_PLANT_ADDRESS (DELVRY_ADD window: plant address text into LT_ADRC)
  SELECT SINGLE
    addrnumber
    date_from
    nation
    name1
    name2
    street
    str_suppl1
    str_suppl2
    city2
    post_code1
    city1
    country
    tel_number
    fax_number

      FROM adrc
         INTO ls_dadrc
         WHERE addrnumber = wa_plant-adrnr.



IF ls_dadrc-country IS NOT INITIAL.
  SELECT SINGLE landx50 FROM t005t
                        INTO lv_land1
                        WHERE land1 = wa_plant-land1 AND
                              spras = 'EN'.
ENDIF.

"""SOC by kalyan on 24.09.2024
CALL FUNCTION 'READ_TEXT'
        EXPORTING
          id                      = 'ST'
          language                = sy-langu
          name                    = 'ZSD_CG_ADDRESS'
          object                  = 'TEXT'
        TABLES
          lines                   = lt_adrc
        EXCEPTIONS
          id                      = 1
          language                = 2
          name                    = 3
          not_found               = 4
          object                  = 5
          reference_check         = 6
          wrong_access_to_archive = 7
          OTHERS                  = 8.
"""EOC by kalyan on 24.09.2024

*--- legacy node %CODE33 (PO_LAST_CHANGED window)
***SOC by Kalyan on 12.12.2025
LV_VAR3 = V_EBELN.
SELECT SINGLE lastchangedatetime FROM ekko
                                 INTO lv_last_changed_on
                                 WHERE ebeln = LV_VAR3.
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
CLEAR:LV_VAR1,LV_VAR2,LV_VAR3.
CONCATENATE LV_PKLDT+6(2) LV_PKLDT+4(2) LV_PKLDT+0(4)
INTO lv_var1 SEPARATED BY '.'.
CONCATENATE LV_PKLUZ+0(2) LV_PKLUZ+2(2) LV_PKLUZ+4(2)
INTO lv_var2 SEPARATED BY ':'.
CLEAR:lv_var4.
CONCATENATE LV_var1 LV_var2 INTO LV_VAR4 SEPARATED BY ' '.
***EOC by Kalyan on 12.12.2025

*--- legacy node %CODE11 (SUPPLIER_ADD window: supplying plant address for STO)
*Get the Supplier Plant Address

SELECT SINGLE *  INTO ls_plant
FROM t001w
WHERE werks = lv_reswk.
IF sy-subrc = 0.
  SELECT SINGLE
    addrnumber
    date_from
    nation
    name1
    name2
    street
    str_suppl1
    str_suppl2
    city2
    post_code1
    city1
    country
    tel_number
    fax_number

      FROM adrc
         INTO ls_adrc
         WHERE addrnumber = ls_plant-adrnr.

ENDIF.

IF ls_adrc-country IS NOT INITIAL.
  if v_bsart = 'ZPOI'.
  SELECT SINGLE landx50 FROM t005t INTO lv_land
     WHERE land1 = ls_plant-land1 AND                    " added by karthikeyan for pl
                           spras = 'E'.
    ELSEIF v_bsart = 'ZPOL'.
       SELECT SINGLE landx50 FROM t005t INTO lv_land
     WHERE land1 = ls_plant-land1 AND                    " added by karthikeyan for pl
                           spras = 'F'.
      else.
         SELECT SINGLE landx50 FROM t005t INTO lv_land
     WHERE land1 = ls_plant-land1 AND                    " added by karthikeyan for pl
                           spras = sy-langu.
       endif.
ENDIF.

*--- legacy node %CODE27 (PO_DETAIL window: PO date text)
data:lv_mnth(2) type c.
data:lv_mnthtxt(10) TYPE C.
lv_mnth = v_podate+3(2).
if v_bsart = 'ZPOI'.
SELECT SINGLE LTX FROM T247 INTO lv_mnthtxt
  where MNR = lv_mnth and SPRAS = 'E'.
elseif v_bsart = 'ZPOL'.
SELECT SINGLE LTX FROM T247 INTO lv_mnthtxt
  where MNR = lv_mnth and SPRAS = 'F'.
else.
  SELECT SINGLE LTX FROM T247 INTO lv_mnthtxt
  where MNR = lv_mnth and SPRAS = sy-langu.
endif.
  CONCATENATE v_podate+0(2) lv_mnthtxt v_podate+6(4) INTO podate SEPARATED BY space.

* BOLT: %CODE28 shares the locals of %CODE27 here, so they are cleared exactly as a fresh node would have them.
CLEAR: lv_mnth, lv_mnthtxt.
*--- legacy node %CODE28 (PO_DETAIL window: delivery date text)
lv_mnth = lv_eindt+3(2).
if v_bsart = 'ZPOI'.
SELECT SINGLE LTX FROM T247 INTO lv_mnthtxt
  where MNR = lv_mnth and SPRAS = 'E'.
  ELSEIF v_bsart = 'ZPOL'.
SELECT SINGLE LTX FROM T247 INTO lv_mnthtxt
  where MNR = lv_mnth and SPRAS = 'F'.

   else.
     SELECT SINGLE LTX FROM T247 INTO lv_mnthtxt
  where MNR = lv_mnth and SPRAS = sy-langu.

    endif.
  CONCATENATE lv_eindt+0(2) lv_mnthtxt lv_eindt+6(4) INTO eindt SEPARATED BY space.

*--- legacy node %CODE34 (TABLE_DATA main window: header text F01/EKKO into LT_LINES)
**SOC by Kalyan on 21.09.2026
DATA: lv_ebeln    TYPE ekko-ebeln,
      lv_textname TYPE thead-tdname.


CALL FUNCTION 'CONVERSION_EXIT_ALPHA_INPUT'
  EXPORTING
    input  = v_ebeln
  IMPORTING
    output = lv_ebeln.

lv_textname = lv_ebeln.

CLEAR: lt_lines.

CALL FUNCTION 'READ_TEXT'
  EXPORTING
    id                      = 'F01'
    language                = 'E'   "Internal SAP key for English (EN)
    name                    = lv_textname
    object                  = 'EKKO'
  TABLES
    lines                   = lt_lines
  EXCEPTIONS
    id                      = 1
    language                = 2
    name                    = 3
    not_found               = 4
    object                  = 5
    reference_check         = 6
    wrong_access_to_archive = 7
    OTHERS                  = 8.


**EOC by Kalyan on 21.09.2026


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

* BOLT: terms and conditions prepared for the layout (GV_TERMS_TITLE, GT_TERMS). Generated by tools/zmmcg_po_sf/terms_gen.mjs from the
* legacy folders %FOLDER1 / %FOLDER2 (goods, V_FLAG = X) and %FOLDER4 (service, V_FLAG = Y); texts are the legacy texts, English and French.
CLEAR: gt_terms, gv_terms_title.
lv_fr = COND #( WHEN v_bsart = 'ZPOL' OR v_bsart = 'ZPOS' THEN abap_true     "legacy driver: French for local and service orders
                 WHEN v_bsart = 'ZPOI' THEN abap_false                          "import orders: English
                 WHEN gv_langu = 'F' THEN abap_true
                 ELSE abap_false ).
IF v_flag = 'X'.      "table OTHER_PO
  IF v_bsart = 'ZPOI'.      "folder %FOLDER1
    gv_terms_title = |Purchase Order Terms & Conditions:|.
    APPEND VALUE #(
      slno = |1.|
      text = |Vendor must send one non-negotiable original Master Bill of Lading directly to a|
             && |pplicant bank, immediately after shipment is done.| ) TO gt_terms.
    APPEND VALUE #(
      slno = |2.|
      text = |Bill of Lading/Air Way Bill Number, Commercial Invoice, Packing List, Manufactur|
             && |er Certificate, CCVO (Combined Certificate for Value & Origin), ECTN (Electronic|
             && | Cargo Tracking Note) are mandatory documents as shipping advice to buyer and ou|
             && |r Clearing/Logistic Department.| ) TO gt_terms.
    APPEND VALUE #(
      slno = |3.|
      text = |L/C (Letter of Credit) Number should appear on every individual shipping documen|
             && |ts..| ) TO gt_terms.
    APPEND VALUE #(
      slno = |4.|
      text = |All the Bank charges within CONGO REPUBLIC are to Buyer's account & all other ba|
             && |nk charges are to supplier's account.| ) TO gt_terms.
    APPEND VALUE #(
      slno = |5.|
      text = |The Purchase Order number must be reflected on all invoices to effect payment. A|
             && |ll invoices must be sent to the Finance Department.| ) TO gt_terms.
    APPEND VALUE #(
      slno = |6.|
      text = |Guarantee/Warranty: where a guarantee/warranty, is applicable the necessary docu|
             && |mentation most accompany the goods or services. Otherwise, as a default, the ite|
             && |ms covered under this order shall stand guarantee/warranty of 18 months from the|
             && | date of supply or 12 months from the date of installation / commissioning.| ) TO gt_terms.
    APPEND VALUE #(
      slno = |7.|
      text = |Any other regulatory certificates e.g. Material Safety Data Sheet (MSDS), Operat|
             && |ing Manuals, Waste Disposal etc., needs to be current and must accompany this Pu|
             && |rchase Order.| ) TO gt_terms.
    APPEND VALUE #(
      slno = |8.|
      text = |Logistics Manager|
             && cl_abap_char_utilities=>newline
             && |Ste. Dangote Cement Congo SA,|
             && cl_abap_char_utilities=>newline
             && |Quartier NDJINDJI, Vers CFAO CONGO,|
             && cl_abap_char_utilities=>newline
             && |BP 1103, Pointe Noire,|
             && cl_abap_char_utilities=>newline
             && |Republic of Congo|
             && cl_abap_char_utilities=>newline
             && |Tel: +242 05 799 9383|
             && cl_abap_char_utilities=>newline
             && |Email: DCCG-LOGISTICS@DANGOTE.COM|
             && cl_abap_char_utilities=>newline
             && |DCCG-PURCHASE@DANGOTE.COM| ) TO gt_terms.
    APPEND VALUE #(
      slno = |9.|
      text = |Goods and/or Services would be accepted, only if it conforms to our quality and/|
             && |or standard specifications.| ) TO gt_terms.
    APPEND VALUE #(
      slno = |10.|
      text = |Invoice shall be raised based on the lowest between principal vendor's weighbrid|
             && |ge quantity and Dangote's weighbridge quantity.| ) TO gt_terms.
    APPEND VALUE #(
      slno = |11.|
      text = |No variation in this terms and conditions will be accepted.| ) TO gt_terms.
  ELSEIF v_bsart <> 'ZPOI'.      "folder %FOLDER2
    gv_terms_title = COND string( WHEN lv_fr = abap_true
                       THEN |Les autres termes et conditions applicables au bon de commande:|
                       ELSE |Purchase Order Terms & Conditions:| ).
    APPEND VALUE #(
      slno = |1.|
      text = COND string( WHEN lv_fr = abap_true
               THEN |Prix exprimés sont basés sur un prix rendu au Congo.|
               ELSE |Prices expressed are based on a delivered price in Congo.| ) ) TO gt_terms.
    APPEND VALUE #(
      slno = |2.|
      text = COND string( WHEN lv_fr = abap_true
               THEN |Les Prix unitaires sont exclusivement sur la tax sur valeur ajoutée. (TVA)|
               ELSE |Unit Prices are exclusive of Value Added Tax (VAT).| ) ) TO gt_terms.
    APPEND VALUE #(
      slno = |3.|
      text = COND string( WHEN lv_fr = abap_true
               THEN |Le numéro de commande doit être inscrit sur toutes les factures afin d'effectuer|
                    && | le paiement.|
               ELSE |The Purchase Order number must be reflected on all invoices to effect payment.| ) ) TO gt_terms.
    APPEND VALUE #(
      slno = |4.|
      text = COND string( WHEN lv_fr = abap_true
               THEN |Le terme de paiement, est strictement de 30 jours après la livraison, sauf accor|
                    && |d contraire conformément à l'accord contractuel signé.|
               ELSE |Payment terms, is strictly 30 days after delivery, unless otherwise agreed as pe|
                    && |r signed contractual agreement.| ) ) TO gt_terms.
    APPEND VALUE #(
      slno = |5.|
      text = COND string( WHEN lv_fr = abap_true
               THEN |Guarantie: Lorsqu' une garantie est applicable, la documentation nécessaire doit|
                    && | accompagner les biens ou les services. Sinon, par défaut, les éléments couverts|
                    && | par ce bon  seront garanties pour 18 mois à compter de la date d'installation /|
                    && | mise en service.|
               ELSE |Guarantee/Warranty: where a guarantee/warranty, is applicable the necessary docu|
                    && |mentation most accompany the goods or services. Otherwise, as a default, the ite|
                    && |ms covered under this order shall stand guarantee/warranty of 18 months from the|
                    && | date of supply or 12 months from the date of installation / commissioning.| ) ) TO gt_terms.
    APPEND VALUE #(
      slno = |6.|
      text = COND string( WHEN lv_fr = abap_true
               THEN |Tous les autres certificats réglementaires à l'exemple de la Fiche de données de|
                    && | Sécurité (FDS), les Manuels d'Utilisation, de traitement des dechets etc., doiv|
                    && |ent être actuels et doivent accompagner ce bon de commande.|
               ELSE |Any other regulatory certificates e.g. Material Safety Data Sheet (MSDS), Operat|
                    && |ing Manuals, Waste Disposal etc., needs to be current and must accompany this Pu|
                    && |rchase Order.| ) ) TO gt_terms.
    APPEND VALUE #(
      slno = |7.|
      text = COND string( WHEN lv_fr = abap_true
               THEN |Les marchandises et / ou services ne seront acceptés que s'ils sont conformes à |
                    && |nos standards de  qualités et / ou à nos spécifications standar ds.|
               ELSE |Goods and/or Services would be accepted, only if it conforms to our quality and/|
                    && |or standard specifications.| ) ) TO gt_terms.
    APPEND VALUE #(
      slno = |8.|
      text = COND string( WHEN lv_fr = abap_true
               THEN |La facture doit être établie sur la base de la plus faible quantité entre celle |
                    && |du pont bascule du fournisseur principal et celle du pont bascule de Dangote.|
               ELSE |Invoice shall be raised based on the lowest between principal vendor's weighbrid|
                    && |ge quantity and Dangote's weighbridge quantity.| ) ) TO gt_terms.
    APPEND VALUE #(
      slno = |9.|
      text = COND string( WHEN lv_fr = abap_true
               THEN |Toutes les factures doivent être envoyées au Département des finances.|
               ELSE |All invoices must be sent to the Finance Department.| ) ) TO gt_terms.
    APPEND VALUE #(
      slno = |10.|
      text = COND string( WHEN lv_fr = abap_true
               THEN |Aucune modification de ces termes et conditions ne sera acceptée.|
               ELSE |No variation in this terms and conditions will be accepted.| ) ) TO gt_terms.
  ENDIF.
ELSEIF v_flag = 'Y'.      "table SERVCE_PO
  IF v_bsart <> 'ZPOI'.      "folder %FOLDER4
    gv_terms_title = COND string( WHEN lv_fr = abap_true
                       THEN |Les autres termes et conditions applicables au bon de commande:|
                       ELSE |Purchase Order Terms & Conditions:| ).
    APPEND VALUE #(
      slno = |1.|
      text = COND string(
               WHEN v_bsart <> 'ZPOS'
               THEN COND string( WHEN lv_fr = abap_true
                       THEN |Les prix exprimés sont basés sur un prix de livraison au Cameroun.|
                       ELSE |Prices expressed are based on a delivered price in Cameroon.| )
               WHEN v_bsart = 'ZPOS'
               THEN gv_term1_zpos      "standard text ZMMCG_PO_TEXT (legacy include text)
               ELSE || ) ) TO gt_terms.
    APPEND VALUE #(
      slno = |2.|
      text = COND string( WHEN lv_fr = abap_true
               THEN |Les Prix unitaires sont exclusivement sur la tax sur valeur ajoutée. (TVA)|
               ELSE |Unit Prices are exclusive of Value Added Tax (VAT).| ) ) TO gt_terms.
    APPEND VALUE #(
      slno = |3.|
      text = COND string( WHEN lv_fr = abap_true
               THEN |Le numéro de commande doit être inscrit sur toutes les factures afin d'effectuer|
                    && | le paiement.|
               ELSE |The Purchase Order number must be reflected on all invoices to effect payment.| ) ) TO gt_terms.
    APPEND VALUE #(
      slno = |4.|
      text = COND string( WHEN lv_fr = abap_true
               THEN |Le terme de paiement, est strictement de 30 jours après la livraison, sauf accor|
                    && |d contraire conformément à l'accord contractuel signé.|
               ELSE |Payment terms, is strictly 30 days after delivery, unless otherwise agreed as pe|
                    && |r signed contractual agreement.| ) ) TO gt_terms.
    APPEND VALUE #(
      slno = |5.|
      text = COND string( WHEN lv_fr = abap_true
               THEN |Guarantie: Lorsqu' une garantie est applicable, la documentation nécessaire doit|
                    && | accompagner les biens ou les services. Sinon, par défaut, les éléments couverts|
                    && | par ce bon  seront garanties pour 18 mois à compter de la date de l'offre ou de|
                    && | 12 mois à compter de la date d'installation / mise en service.|
               ELSE |Guarantee/Warranty: where a guarantee/warranty, is applicable the necessary docu|
                    && |mentation most accompany the goods or services. Otherwise, as a default, the ite|
                    && |ms covered under this order shall stand guarantee/warranty of 18 months from the|
                    && | date of supply or 12 months from the date of installation / commissioning.| ) ) TO gt_terms.
    APPEND VALUE #(
      slno = |6.|
      text = COND string( WHEN lv_fr = abap_true
               THEN |Tous les autres certificats réglementaires à l'exemple de la Fiche de données de|
                    && | Sécurité (FDS), les Manuels d'Utilisation, de traitement des dechets etc., doiv|
                    && |ent être actuels et doivent accompagner ce bon de commande.|
               ELSE |Any other regulatory certificates e.g. Material Safety Data Sheet (MSDS), Operat|
                    && |ing Manuals, Waste Disposal etc., needs to be current and must accompany this Pu|
                    && |rchase Order.| ) ) TO gt_terms.
    APPEND VALUE #(
      slno = |7.|
      text = COND string( WHEN lv_fr = abap_true
               THEN |Les marchandises et / ou services ne seront acceptés que s'ils sont conformes à |
                    && |nos standards de  qualités et / ou à nos  spécifications standards.|
               ELSE |Goods and/or Services would be accepted, only if it conforms to our quality and/|
                    && |or standard specifications.| ) ) TO gt_terms.
    APPEND VALUE #(
      slno = |8.|
      text = COND string( WHEN lv_fr = abap_true
               THEN |La facture doit être établie sur la base de la plus faible quantité entre celle |
                    && |du pont bascule du fournisseur principal et celle du pont bascule de Dangote.|
               ELSE |Invoice shall be raised based on the lowest between principal vendor's weighbrid|
                    && |ge quantity and Dangote's weighbridge quantity.| ) ) TO gt_terms.
    APPEND VALUE #(
      slno = |9.|
      text = COND string( WHEN lv_fr = abap_true
               THEN |Toutes les factures doivent être envoyées au Département des finances.|
               ELSE |All invoices must be sent to the Finance Department.| ) ) TO gt_terms.
    APPEND VALUE #(
      slno = |10.|
      text = COND string( WHEN lv_fr = abap_true
               THEN |Aucune modification de ces termes et conditions ne sera acceptée.|
               ELSE |No variation in this terms and conditions will be accepted.| ) ) TO gt_terms.
  ENDIF.
ENDIF.
* BOLT: labels and variable texts of the layout prepared here (GS_LABELS-LB_*). Generated by tools/zmmcg_po_sf/gen.mjs from the legacy text nodes,
* conditions and English / French variants; the layout only binds them (strategy S11 section 1). lv_fr = print language is French (set by the terms block above).
"HDR / HEADING
gs_labels-lb_hdr_heading = COND string(
                             WHEN v_bsart = 'ZPOT' OR v_bsart = 'ZPIC'
                             THEN |STOCK TRANSFER PO|
                             WHEN v_bsart = 'ZPOS'
                             THEN COND string( WHEN lv_fr = abap_true
                                    THEN |BON DE COMMANDE / SERVICE|
                                    ELSE |SERVICE PURCHASE ORDER| )
                             WHEN v_bsart = 'YRAW'
                             THEN |PURCHASE ORDER|
                             WHEN v_bsart = 'YCAP'
                             THEN COND string( WHEN lv_fr = abap_true
                                    THEN |CAPEX PURCHASE ORDER|
                                    ELSE |Capex Purchase Order| )
                             WHEN v_bsart = 'ZPOI'
                             THEN |IMPORT PURCHASE ORDER|
                             WHEN v_bsart = 'ZPOL'
                             THEN |BON DE COMMANDE / LOCAL|
                             WHEN v_bsart = 'ZPOC'
                             THEN COND string( WHEN lv_fr = abap_true
                                    THEN |BON DE COMMANDE / CASH|
                                    ELSE |CASH PURCHASE ORDER| )
                             WHEN v_bsart = 'ZPOR'
                             THEN COND string( WHEN lv_fr = abap_true
                                    THEN |BON DE COMMANDE / RELEASE|
                                    ELSE |RELEASE ORDER| )
                             ELSE || ).
"FOR_ZPOT / FOR_ZPOT_R1C1
gs_labels-lb_for_zpot_r1c1 = COND string( WHEN lv_fr = abap_true
                               THEN |Reference Fournisseur|
                               ELSE |SAP Supplier Number| ).
"FOR_ZPOT / FOR_ZPOT_R2C1
gs_labels-lb_for_zpot_r2c1 = COND string( WHEN lv_fr = abap_true
                               THEN |Nom du Fournisseur|
                               ELSE |Supplier Name| ).
"FOR_ZPOT / FOR_ZPOT_R3C1
gs_labels-lb_for_zpot_r3c1 = COND string( WHEN lv_fr = abap_true
                               THEN |Nom du Fournisseur|
                               ELSE |Supplier Name 2| ).
"FOR_ZPOT / FOR_ZPOT_R5C1
gs_labels-lb_for_zpot_r5c1 = COND string( WHEN lv_fr = abap_true
                               THEN |Rue 2|
                               ELSE |Street 2| ).
"FOR_ZPOT / FOR_ZPOT_R6C1
gs_labels-lb_for_zpot_r6c1 = COND string( WHEN lv_fr = abap_true
                               THEN |Rue 3|
                               ELSE |Street 3| ).
"FOR_ZPOT / FOR_ZPOT_R7C1
gs_labels-lb_for_zpot_r7c1 = COND string( WHEN lv_fr = abap_true
                               THEN |Suburb|
                               ELSE |City| ).
"FOR_ZPOT / FOR_ZPOT_R8C1
gs_labels-lb_for_zpot_r8c1 = COND string( WHEN lv_fr = abap_true
                               THEN |Ville|
                               ELSE |District| ).
"FOR_ZPOT / FOR_ZPOT_R9C1
gs_labels-lb_for_zpot_r9c1 = COND string( WHEN lv_fr = abap_true
                               THEN |Pays|
                               ELSE |Country| ).
"FOR_ZPOT / FOR_ZPOT_R10C1
gs_labels-lb_for_zpot_r10c1 = COND string( WHEN lv_fr = abap_true
                                THEN |Code Postal|
                                ELSE |Postal/Zip Code| ).
"FOR_ZPOT / FOR_ZPOT_R12C1
gs_labels-lb_for_zpot_r12c1 = COND string( WHEN lv_fr = abap_true
                                THEN |Numero Fax|
                                ELSE |Fax Number| ).
"TEMPLATE4 / TEMPLATE4_R1C1
gs_labels-lb_template4_r1c1 = COND string(
                                WHEN v_bsart = 'ZPOL'
                                THEN |Reference Fournisseur|
                                WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                                THEN COND string( WHEN lv_fr = abap_true
                                       THEN |Reference Fournisseur|
                                       ELSE |SAP Supplier Number| )
                                WHEN v_bsart = 'ZPOI'
                                THEN COND string( WHEN lv_fr = abap_true
                                       THEN |SAP Suppiler Number|
                                       ELSE |SAP Supplier Number| )
                                ELSE || ).
"TEMPLATE4 / TEMPLATE4_R2C1
gs_labels-lb_template4_r2c1 = COND string(
                                WHEN v_bsart = 'ZPOL'
                                THEN |Nom du Fournisseur|
                                WHEN v_bsart = 'ZPOI'
                                THEN |Supplier Name|
                                WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                                THEN COND string( WHEN lv_fr = abap_true
                                       THEN |Nom du Fournisseur|
                                       ELSE |Supplier Name| )
                                ELSE || ).
"TEMPLATE4 / TEMPLATE4_R3C1
gs_labels-lb_template4_r3c1 = COND string(
                                WHEN v_bsart = 'ZPOL'
                                THEN |Nom du Fournisseur 2|
                                WHEN v_bsart = 'ZPOI'
                                THEN |Supplier Name 2|
                                WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                                THEN COND string( WHEN lv_fr = abap_true
                                       THEN |Nom du Fournisseur 2|
                                       ELSE |Supplier Name 2| )
                                ELSE || ).
"TEMPLATE4 / TEMPLATE4_R4C1
gs_labels-lb_template4_r4c1 = COND string(
                                WHEN v_bsart = 'ZPOL'
                                THEN |No. & Nom de la Rue|
                                WHEN v_bsart = 'ZPOI'
                                THEN |No. & Street Name|
                                WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                                THEN COND string( WHEN lv_fr = abap_true
                                       THEN |No. & Nom de la Rue|
                                       ELSE |No. & Street Name| )
                                ELSE || ).
"TEMPLATE4 / TEMPLATE4_R5C1
gs_labels-lb_template4_r5c1 = COND string(
                                WHEN v_bsart = 'ZPOL'
                                THEN |Rue 2|
                                WHEN v_bsart = 'ZPOI'
                                THEN |Street 2|
                                WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                                THEN COND string( WHEN lv_fr = abap_true
                                       THEN |Rue 2|
                                       ELSE |Street 2| )
                                ELSE || ).
"TEMPLATE4 / TEMPLATE4_R6C1
gs_labels-lb_template4_r6c1 = COND string(
                                WHEN v_bsart = 'ZPOL'
                                THEN |Rue 3|
                                WHEN v_bsart = 'ZPOI'
                                THEN |Street 3|
                                WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                                THEN COND string( WHEN lv_fr = abap_true
                                       THEN |Rue 3|
                                       ELSE |Street 3| )
                                ELSE || ).
"TEMPLATE4 / TEMPLATE4_R7C1
gs_labels-lb_template4_r7c1 = COND string(
                                WHEN v_bsart = 'ZPOL'
                                THEN |Ville|
                                WHEN v_bsart = 'ZPOI'
                                THEN |City|
                                WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                                THEN COND string( WHEN lv_fr = abap_true
                                       THEN |Ville|
                                       ELSE |City| )
                                ELSE || ).
"TEMPLATE4 / TEMPLATE4_R9C1
gs_labels-lb_template4_r9c1 = COND string(
                                WHEN v_bsart = 'ZPOL'
                                THEN |Pays|
                                WHEN v_bsart = 'ZPOI'
                                THEN |Country|
                                WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                                THEN COND string( WHEN lv_fr = abap_true
                                       THEN |Pays|
                                       ELSE |Country| )
                                ELSE || ).
"TEMPLATE4 / TEMPLATE4_R9C2
gs_labels-lb_template4_r9c2 = COND string(
                                WHEN gv_langu = 'F'
                                THEN |{ wa_t005t-landx }|
                                WHEN gv_langu = 'E'
                                THEN |{ wa_t005t-landx50 }|
                                ELSE || ).
"TEMPLATE4 / TEMPLATE4_R10C1
gs_labels-lb_template4_r10c1 = COND string(
                                 WHEN v_bsart = 'ZPOL'
                                 THEN |Code Postal|
                                 WHEN v_bsart = 'ZPOI'
                                 THEN |Postal/Zip Code|
                                 WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                                 THEN COND string( WHEN lv_fr = abap_true
                                        THEN |Code Postal|
                                        ELSE |Postal/Zip Code| )
                                 ELSE || ).
"TEMPLATE4 / TEMPLATE4_R11C1
gs_labels-lb_template4_r11c1 = COND string(
                                 WHEN v_bsart = 'ZPOL'
                                 THEN |Numero Telephone|
                                 WHEN v_bsart = 'ZPOI'
                                 THEN |Telephone Number|
                                 WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                                 THEN COND string( WHEN lv_fr = abap_true
                                        THEN |Numero Telephone|
                                        ELSE |Telephone Number| )
                                 ELSE || ).
"TEMPLATE4 / TEMPLATE4_R11C2
gs_labels-lb_template4_r11c2 = |+|
                               && |{ gv_isd }|
                               && |{ wa_vend-tel_number }|.
"TEMPLATE4 / TEMPLATE4_R12C1
gs_labels-lb_template4_r12c1 = COND string(
                                 WHEN v_bsart = 'ZPOL'
                                 THEN |Numero Fax|
                                 WHEN v_bsart = 'ZPOI'
                                 THEN |Fax Number|
                                 WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                                 THEN COND string( WHEN lv_fr = abap_true
                                        THEN |Numero Fax|
                                        ELSE |Fax Number| )
                                 ELSE || ).
"TEMPLATE4 / TEMPLATE4_R12C2
gs_labels-lb_template4_r12c2 = |+|
                               && |{ gv_isd }|
                               && |{ wa_vend-fax_number }|.
"TEMPLATE4 / LAST_CHANGED
gs_labels-lb_template4_last_changed = |Last Changed On:|
                                      && |{ lv_var4 }|.
"TEMPLATE2 / TEMPLATE2_R1C1
gs_labels-lb_template2_r1c1 = COND string(
                                WHEN v_bsart = 'ZPOL' AND v_bsart <> 'ZPOI'
                                THEN |Date de Bon de Cde.|
                                WHEN v_bsart = 'ZPOI'
                                THEN |PO Date|
                                WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                                THEN COND string( WHEN lv_fr = abap_true
                                       THEN |Date de Bon de Cde.|
                                       ELSE |PO Date| )
                                ELSE || ).
"TEMPLATE2 / TEMPLATE2_R2C1
gs_labels-lb_template2_r2c1 = COND string(
                                WHEN v_bsart = 'ZPOL'
                                THEN |Date de Livraison|
                                WHEN v_bsart = 'ZPOI'
                                THEN |Delivery Date|
                                WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                                THEN COND string( WHEN lv_fr = abap_true
                                       THEN |Date de Livraison|
                                       ELSE |Delivery Date| )
                                ELSE || ).
"TEMPLATE2 / TEMPLATE2_R4C1
gs_labels-lb_template2_r4c1 = COND string(
                                WHEN v_bsart = 'ZPOL' AND v_bsart <> 'ZPOI'
                                THEN COND string( WHEN lv_fr = abap_true
                                       THEN |Nom de l’acheteur|
                                       ELSE |Nom de l'acheteur| )
                                WHEN v_bsart = 'ZPOI'
                                THEN |Buyer Name|
                                WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                                THEN COND string( WHEN lv_fr = abap_true
                                       THEN |Nom de l’acheteur|
                                       ELSE |Buyer Name| )
                                ELSE || ).
"TEMPLATE2 / TEMPLATE2_R5C1
gs_labels-lb_template2_r5c1 = COND string(
                                WHEN v_bsart = 'ZPOL' AND v_bsart <> 'ZPOI'
                                THEN |Numero Telephone|
                                WHEN v_bsart = 'ZPOI'
                                THEN |Telephone Number|
                                WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                                THEN COND string( WHEN lv_fr = abap_true
                                       THEN |Numero Telephone|
                                       ELSE |Telephone Number| )
                                ELSE || ).
"TEMPLATE2 / TEMPLATE2_R6C1
gs_labels-lb_template2_r6c1 = COND string(
                                WHEN v_bsart = 'ZPOL' AND v_bsart <> 'ZPOI'
                                THEN |Numero Fax|
                                WHEN v_bsart = 'ZPOI'
                                THEN |Fax Number|
                                WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                                THEN COND string( WHEN lv_fr = abap_true
                                       THEN |Numero Fax|
                                       ELSE |Fax Number| )
                                ELSE || ).
"TEMPLATE2 / TEMPLATE2_R8C1
gs_labels-lb_template2_r8c1 = COND string(
                                WHEN v_bsart = 'ZPOL' AND v_bsart <> 'ZPOI'
                                THEN |Termes de Paiement|
                                WHEN v_bsart = 'ZPOI'
                                THEN |Payment Terms|
                                WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                                THEN COND string( WHEN lv_fr = abap_true
                                       THEN |Termes de Paiement|
                                       ELSE |Payment Terms| )
                                ELSE || ).
"TEMPLATE2 / TEMPLATE2_R9C2
gs_labels-lb_template2_r9c2 = |{ gv_inco1 }|
                              && | |
                              && |{ gv_inco2 }|.
"TEMPLATE2 / TEMPLATE2_R10C1
gs_labels-lb_template2_r10c1 = COND string(
                                 WHEN v_bsart = 'ZPOL' AND v_bsart <> 'ZPOI'
                                 THEN |Commentaires|
                                 WHEN v_bsart = 'ZPOI'
                                 THEN |Additional Comments|
                                 WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                                 THEN COND string( WHEN lv_fr = abap_true
                                        THEN |Commentaires|
                                        ELSE |Additional Comments| )
                                 ELSE || ).
"TEMPLATE2 / TEMPLATE2_R10C2
gs_labels-lb_template2_r10c2 = COND string(
                                 WHEN v_potext = ' '
                                 THEN gv_hdrtxt
                                 ELSE || ).
"GT_GOODS / H2
gs_labels-lb_gt_goods_h2 = COND string(
                             WHEN v_bsart = 'ZPOL'
                             THEN COND string( WHEN lv_fr = abap_true
                                    THEN |Material No.|
                                    ELSE |Code Article| )
                             WHEN v_bsart = 'ZPOI'
                             THEN COND string( WHEN lv_fr = abap_true
                                    THEN |Code Article|
                                    ELSE |Material No.| )
                             WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                             THEN COND string( WHEN lv_fr = abap_true
                                    THEN |Code Article|
                                    ELSE |Material No.| )
                             ELSE || ).
"GT_GOODS / H3
gs_labels-lb_gt_goods_h3 = COND string(
                             WHEN v_bsart = 'ZPOL'
                             THEN COND string( WHEN lv_fr = abap_true
                                    THEN |Item Description|
                                    ELSE |Description| )
                             WHEN v_bsart = 'ZPOI'
                             THEN COND string( WHEN lv_fr = abap_true
                                    THEN |Code Article|
                                    ELSE |Item Description| )
                             WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                             THEN COND string( WHEN lv_fr = abap_true
                                    THEN |Description|
                                    ELSE |Item Description| )
                             ELSE || ).
"GT_GOODS / H6
gs_labels-lb_gt_goods_h6 = COND string(
                             WHEN v_bsart = 'ZPOL'
                             THEN COND string( WHEN lv_fr = abap_true
                                    THEN |Unit Price (Excl.VAT)|
                                    ELSE |Prix Unitaire (Excl.TVA)| )
                             WHEN v_bsart = 'ZPOI'
                             THEN COND string( WHEN lv_fr = abap_true
                                    THEN |Prix Unitaire (Excl.TVA)|
                                    ELSE |Unit Price (Excl.VAT)| )
                             WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                             THEN COND string( WHEN lv_fr = abap_true
                                    THEN |Prix Unitaire (Excl.TVA)|
                                    ELSE |Unit Price (Excl.VAT)| )
                             ELSE || ).
"GT_GOODS / H7
gs_labels-lb_gt_goods_h7 = COND string(
                             WHEN v_bsart = 'ZPOL'
                             THEN COND string( WHEN lv_fr = abap_true
                                    THEN |{ v_waers }|
                                         && | Total (Excl.VAT)|
                                    ELSE |{ v_waers }|
                                         && | Total (Excl.TVA)| )
                             WHEN v_bsart = 'ZPOI'
                             THEN COND string( WHEN lv_fr = abap_true
                                    THEN |{ v_waers }|
                                         && | Total (Excl.TVA)|
                                    ELSE |{ v_waers }|
                                         && | Total (Excl.VAT)| )
                             WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                             THEN COND string( WHEN lv_fr = abap_true
                                    THEN |{ v_waers }|
                                         && | Total (Excl.TVA)|
                                    ELSE |{ v_waers }|
                                         && | Total (Excl.VAT)| )
                             ELSE || ).
"DISCOUNT / C2
gs_labels-lb_discount_c2 = COND string(
                             WHEN v_bsart = 'ZPOL'
                             THEN |Remise|
                             WHEN v_bsart = 'ZPOI'
                             THEN |Net Discount|
                             WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                             THEN COND string( WHEN lv_fr = abap_true
                                    THEN |Remise|
                                    ELSE |Net Discount| )
                             ELSE || ).
"FRGHT / C2
gs_labels-lb_frght_c2 = COND string(
                          WHEN v_bsart = 'ZPOL'
                          THEN |Frais de Transport|
                          WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                          THEN COND string( WHEN lv_fr = abap_true
                                 THEN |Frais de Transport|
                                 ELSE |Freight Charges| )
                          WHEN v_bsart = 'ZPOI'
                          THEN |Freight Charges|
                          ELSE || ).
"OTHER / C2
gs_labels-lb_other_c2 = COND string(
                          WHEN v_bsart = 'ZPOL'
                          THEN |Autres Charges|
                          WHEN v_bsart = 'ZPOI'
                          THEN |Other Charges|
                          WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                          THEN COND string( WHEN lv_fr = abap_true
                                 THEN |Autres Charges|
                                 ELSE |Other Charges| )
                          ELSE || ).
"SUB_TOTAL / C2
gs_labels-lb_sub_total_c2 = COND string(
                              WHEN v_bsart = 'ZPOL'
                              THEN |SuosTotal|
                              WHEN v_bsart = 'ZPOI'
                              THEN |Sub Total|
                              WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                              THEN COND string( WHEN lv_fr = abap_true
                                     THEN |Sous Total|
                                     ELSE |Sub Total| )
                              ELSE || ).
"VAT / C2
gs_labels-lb_vat_c2 = COND string(
                        WHEN v_bsart = 'ZPOL'
                        THEN |TVA|
                        WHEN v_bsart = 'ZPOI'
                        THEN |VAT|
                        WHEN v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                        THEN COND string( WHEN lv_fr = abap_true
                               THEN |TVA|
                               ELSE |VAT| )
                        ELSE || ).
"TOTAL_VALUE_WORDS / WORDS
gs_labels-lb_total_value_words_words = COND string(
                                         WHEN v_bsart = 'ZPOI'
                                         THEN COND string( WHEN lv_fr = abap_true
                                                THEN |Total Order Value In Words(|
                                                     && |{ lv_ktext }|
                                                     && |): |
                                                     && |{ lv_amt_words }|
                                                     && | |
                                                     && |{ gv_inco1 }|
                                                     && | |
                                                     && |{ gv_inco2 }|
                                                ELSE |Total Order Value In Words(|
                                                     && |{ lv_ktext }|
                                                     && |): |
                                                     && |{ lv_amt_words }|
                                                     && | |
                                                     && |{ gv_inco1 }|
                                                     && | |
                                                     && |{ gv_inco2 }|
                                                     && | basis| )
                                         WHEN v_bsart = 'ZIMP' OR v_bsart = 'ZLOC'
                                         THEN COND string( WHEN lv_fr = abap_true
                                                THEN |Montant Total en Lettre(|
                                                     && |{ lv_ktext }|
                                                     && |): |
                                                     && |{ lv_amt_words }|
                                                     && | |
                                                     && |{ gv_inco1 }|
                                                     && | |
                                                     && |{ gv_inco2 }|
                                                ELSE |Total Order Value In Words(|
                                                     && |{ lv_ktext }|
                                                     && |): |
                                                     && |{ lv_amt_words }|
                                                     && | |
                                                     && |{ gv_inco1 }|
                                                     && | |
                                                     && |{ gv_inco2 }|
                                                     && | basis| )
                                         WHEN v_bsart = 'ZPOL'
                                         THEN COND string( WHEN lv_fr = abap_true
                                                THEN |Montant Total en Lettre(|
                                                     && |{ lv_ktext }|
                                                     && |): |
                                                     && |{ lv_amt_words }|
                                                     && | |
                                                     && |{ gv_inco1 }|
                                                     && |{ gv_inco2 }|
                                                     && cl_abap_char_utilities=>newline
                                                     && |basis|
                                                ELSE |Montant Total en Lettre(|
                                                     && |{ lv_ktext }|
                                                     && |): |
                                                     && |{ lv_amt_words }|
                                                     && | |
                                                     && |{ gv_inco1 }|
                                                     && | |
                                                     && |{ gv_inco2 }|
                                                     && | basis| )
                                         WHEN v_bsart <> 'ZIMP' AND v_bsart <> 'ZLOC' AND v_bsart <> 'ZPOL' AND v_bsart <> 'ZPOI'
                                         THEN COND string( WHEN lv_fr = abap_true
                                                THEN |Montant Total en Lettre(|
                                                     && |{ v_waers }|
                                                     && |): |
                                                     && |{ lv_amt_words }|
                                                     && | |
                                                     && |{ gv_inco1 }|
                                                     && | |
                                                     && |{ gv_inco2 }|
                                                ELSE |Total order Value In Words(|
                                                     && |{ lv_ktext }|
                                                     && |): |
                                                     && |{ lv_amt_words }|
                                                     && | |
                                                     && |{ gv_inco1 }|
                                                     && | |
                                                     && |{ gv_inco2 }|
                                                     && | basis| )
                                         ELSE || ).
"GT_SERVICE / H2
gs_labels-lb_gt_service_h2 = COND string( WHEN lv_fr = abap_true
                               THEN |Code Article|
                               ELSE |Material No.| ).
"GT_SERVICE / H3
gs_labels-lb_gt_service_h3 = COND string( WHEN lv_fr = abap_true
                               THEN |Description|
                               ELSE |Item Description| ).
"GT_SERVICE / H6
gs_labels-lb_gt_service_h6 = COND string( WHEN lv_fr = abap_true
                               THEN |Prix Unitaire (Excl.TVA)|
                               ELSE |Unit Price (Excl.VAT)| ).
"GT_SERVICE / H7
gs_labels-lb_gt_service_h7 = COND string( WHEN lv_fr = abap_true
                               THEN |{ v_waers }|
                                    && | Total (Excl.TVA)|
                               ELSE |{ v_waers }|
                                    && | Total (Excl.VAT)| ).
"_ROW8 / C2
gs_labels-lb__row8_c2 = COND string( WHEN lv_fr = abap_true
                          THEN |Prix Brut|
                          ELSE |Gross Price| ).
"_ROW9 / C2
gs_labels-lb__row9_c2 = COND string( WHEN lv_fr = abap_true
                          THEN |Remise|
                          ELSE |Net Discount| ).
"_ROW12 / C2
gs_labels-lb__row12_c2 = COND string( WHEN lv_fr = abap_true
                           THEN |Sous Total|
                           ELSE |Sub Total| ).
"_ROW13 / C2
gs_labels-lb__row13_c2 = COND string( WHEN lv_fr = abap_true
                           THEN |TVA|
                           ELSE |VAT| ).
"_ROW16 / WORDS
gs_labels-lb__row16_words = COND string(
                              WHEN gv_inco1 <> ' ' OR gv_inco2 <> ' '
                              THEN COND string( WHEN lv_fr = abap_true
                                     THEN |Montant Total en Lettre(|
                                          && |{ lv_ktext }|
                                          && |): |
                                          && |{ lv_amt_words }|
                                          && | |
                                          && |{ gv_inco1 }|
                                          && | |
                                          && |{ gv_inco2 }|
                                     ELSE |Total Order Value In Words(|
                                          && |{ lv_ktext }|
                                          && |): |
                                          && |{ lv_amt_words }|
                                          && | |
                                          && |{ gv_inco1 }|
                                          && | |
                                          && |{ gv_inco2 }|
                                          && | basis| )
                              WHEN gv_inco1 = ' ' AND gv_inco2 = ' '
                              THEN COND string( WHEN lv_fr = abap_true
                                     THEN |Montant Total en Lettre(|
                                          && |{ v_waers }|
                                          && |): |
                                          && |{ lv_amt_words }|
                                          && | |
                                          && |{ gv_inco1 }|
                                          && | |
                                          && |{ gv_inco2 }|
                                     ELSE |Total order Value In Words(|
                                          && |{ lv_ktext }|
                                          && |): |
                                          && |{ lv_amt_words }| )
                              ELSE || ).
IF v_flag = 'X'.
*==================== goods purchase order (legacy table OTHER_PO over IT_EKPO, V_FLAG = X)
  LOOP AT it_ekpo INTO wa_ekpo.
*--- legacy node %CODE2 (column 1: serial number, item text)
***BREAK ABAP08.
v_slno = v_slno + 1.
**CONDENSE v_slno.
CLEAR : MATDESC1,
        WA_RTEXT,
        IT_RTEXT,
        G_TEXT.



**count = count + 1.

concatenate WA_EKPO-EBELN WA_EKPO-EBELP into G_TEXT.

clear : it_rtext[], wa_rtext, lv_name." g_text.

lv_name = G_TEXT.

CALL FUNCTION 'READ_TEXT'
  EXPORTING
   CLIENT                        = SY-MANDT
    id                            = 'F01'
    language                      = 'E' "sy-langu
    NAME                          = lv_name
    OBJECT                        = 'EKPO'
*   ARCHIVE_HANDLE                = 0
*   LOCAL_CAT                     = ' '
* IMPORTING
*   HEADER                        =
  TABLES
    lines                         = it_rtext
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

IF it_rtext IS NOT INITIAL.

  LOOP AT IT_RTEXT INTO WA_RTEXT.
    CONCATENATE MATDESC1 WA_RTEXT-TDLINE INTO MATDESC1.
    CLEAR WA_RTEXT-TDLINE.
  ENDLOOP.

ENDIF.

CONDENSE MATDESC1.
*--- legacy node %CODE9 (column 3: material long text)
CLEAR :LV_NAME,
        GFLAG,
        WA_RTEXT,
        IT_RTEXT,
        MATDESC.                             "#EC CI_FLDEXT_OK[2610650]

LV_NAME = WA_EKPO-MATNR.                     "#EC CI_FLDEXT_OK[2215424]

CALL FUNCTION 'READ_TEXT'
  EXPORTING
    CLIENT                  = SY-MANDT
    ID                      = 'GRUN'
    LANGUAGE                = 'E' "sy-langu
    NAME                    = LV_NAME
    OBJECT                  = 'MATERIAL'
  TABLES
    LINES                   = IT_RTEXT
  EXCEPTIONS
    ID                      = 1
    LANGUAGE                = 2
    NAME                    = 3
    NOT_FOUND               = 4
    OBJECT                  = 5
    REFERENCE_CHECK         = 6
    WRONG_ACCESS_TO_ARCHIVE = 7
    OTHERS                  = 8.
**BREAK ABAP08.
IF SY-SUBRC <> 0.
* Implement suitable error handling here
ENDIF.

IF IT_RTEXT IS NOT INITIAL .
  GFLAG = 1.
  LOOP AT IT_RTEXT INTO WA_RTEXT.
    CONCATENATE MATDESC WA_RTEXT-TDLINE INTO MATDESC.
    CLEAR WA_RTEXT-TDLINE.
  ENDLOOP.
ELSE.
  GFLAG = 2.
ENDIF.

CONDENSE MATDESC.
*--- legacy node %CODE1 (column 4)
LV_MENGE = WA_EKPO-MENGE.
*--- legacy node %CODE15 (column 6)
lv_unitprice1 = wa_ekpo-netpr.
*CALL FUNCTION 'CURRENCY_AMOUNT_SAP_TO_DISPLAY'
*  EXPORTING
*    currency              = v_waers
*    amount_internal       = lv_unitprice
* IMPORTING
*   AMOUNT_DISPLAY        = lv_unitprice
** EXCEPTIONS
**   internal_error        = 1
**   others                = 2
**          .
*lv_unitprice1 = lv_unitprice.
*if SY-SUBRC <> 0.
** iMPLEMENT SUITABLE ERROR HANDLING HERE
*endif.
*--- legacy node %CODE3 (column 7)
G_NETWR = G_NETWR + WA_EKPO-NETWR.

lv_total1 = wa_ekpo-netwr.
*CALL FUNCTION 'CURRENCY_AMOUNT_SAP_TO_DISPLAY'
*  EXPORTING
*    currency              = v_waers
*    amount_internal       = lv_total
* IMPORTING
*   AMOUNT_DISPLAY        = lv_total
** EXCEPTIONS
**   INTERNAL_ERROR        = 1
**   OTHERS                = 2
*          .
*IF sy-subrc <> 0.
** Implement suitable error handling here
*ENDIF.
*
*lv_total1 = lv_total.
*
*
*
*
*
*
*
*
*
*
*
* BOLT: the row exactly as the Smart Form printed it (same variables, same formatting).
    CLEAR ls_goods.
    ls_goods-seqno = lines( gt_goods ) + 1.
    WRITE v_slno TO ls_goods-slno.
    WRITE wa_ekpo-matnr TO ls_goods-matnr.
    ls_goods-descr = |{ wa_ekpo-txz01 } ({ matdesc })|.            "legacy %TEXT54/%TEXT114: &WA_EKPO-TXZ01& (&MATDESC&)
    WRITE lv_menge TO ls_goods-menge.
    WRITE wa_ekpo-meins TO ls_goods-meins.
    IF v_waers = 'XOF' OR v_waers = 'XAF'.
      WRITE lv_unitprice1 TO ls_goods-netpr.                       "legacy %TEXT57
      WRITE lv_total1 TO ls_goods-netwr.                           "legacy %TEXT58
    ELSE.
      WRITE wa_ekpo-netpr TO ls_goods-netpr.                       "legacy %TEXT220
      WRITE wa_ekpo-netwr TO ls_goods-netwr.                       "legacy %TEXT221
    ENDIF.
    CONDENSE: ls_goods-slno, ls_goods-matnr, ls_goods-menge, ls_goods-meins, ls_goods-netpr, ls_goods-netwr.
    IF strlen( ls_goods-slno ) = 1.                                "legacy integer output: a 1-digit number keeps a trailing blank
      ls_goods-slno = |{ ls_goods-slno }{ lv_nbsp }|.
    ENDIF.
    APPEND ls_goods TO gt_goods.
  ENDLOOP.

* footer event - the rows print in this order
*--- legacy node %CODE16 (DISCOUNT row)
v_dis = v_kwert.
  IF v_waers = 'XOF' OR v_waers = 'XAF'.
    WRITE v_dis TO gs_totals-dis.
  ELSE.
    WRITE v_kwert TO gs_totals-dis.
  ENDIF.
*--- legacy node %CODE17 (FRGHT row)
v_frg = v2_kwert.
  IF v_waers = 'XOF' OR v_waers = 'XAF'.
    WRITE v_frg TO gs_totals-frg.
  ELSE.
    WRITE v2_kwert TO gs_totals-frg.
  ENDIF.
*--- legacy node %CODE19 (OTHER row)
*v_oth = lv_oth.

IF LV_OTH IS NOT INITIAL.
  V_KWERT1 = LV_OTH.

**Converting amount format based on currency
  CALL FUNCTION               "#EC CI_USAGE_OK[2340247]
    'CURRENCY_AMOUNT_SAP_TO_DISPLAY'
    EXPORTING
      CURRENCY        = V_WAERS
      AMOUNT_INTERNAL = V_KWERT1
    IMPORTING
      AMOUNT_DISPLAY  = V_KWERT1
    EXCEPTIONS
      INTERNAL_ERROR  = 1
      OTHERS          = 2.
  IF SY-SUBRC <> 0.
    MESSAGE ID SY-MSGID TYPE SY-MSGTY NUMBER SY-MSGNO
              WITH SY-MSGV1 SY-MSGV2 SY-MSGV3 SY-MSGV4.

  ENDIF.
  V_OTH = V_KWERT1.
ENDIF.
  IF v_waers = 'XOF' OR v_waers = 'XAF'.
    WRITE v_oth TO gs_totals-oth.
  ELSE.
    WRITE lv_oth TO gs_totals-oth.
  ENDIF.
*--- legacy node %CODE4 (SUB_TOTAL row)
*SUB_TOTAL = ( G_NETWR + V2_KWERT + LV_KWERT + V1_KWERT ) + V_KWERT.
if v_waers = 'XOF' or v_waers = 'XAF'.
sub_total = ( g_netwr + v_frg  + v1_kwert )
             + v_dis + v_oth.

else.
sub_total = ( g_netwr + v2_kwert + v1_kwert )
             + v_kwert + lv_oth.

endif.
*IF SUB_TOTAL IS NOT INITIAL.
*VAT = ( SUB_TOTAL * 14 ) / 100.
*ENDIF.

v_sub = sub_total.
if v_waers = 'XOF' or v_waers = 'XAF'.
total = v_sub + lv_kwert1 + lv_navs1.
else.
  total = sub_total + lv_kwert1 + lv_navs1.
endif.

v_total = total.
  IF v_waers = 'XOF' OR v_waers = 'XAF'.
    WRITE v_sub TO gs_totals-sub.
  ELSE.
    WRITE sub_total TO gs_totals-sub.
  ENDIF.
*--- legacy node %CODE30 (VAT row)
"lv_ca = lv_navs1.
lv_vat = lv_kwert1.
  IF v_waers = 'XAF' OR v_waers = 'XOF'.
    WRITE lv_vat TO gs_totals-vat.
  ELSE.
    WRITE lv_kwert1 TO gs_totals-vat.
  ENDIF.
*--- legacy node %CODE20 (CA row)
"lv_vat = lv_kwert1.
clear lv_ca.
lv_ca = lv_navs1.
  IF v_waers = 'XAF' OR v_waers = 'XOF'.
    WRITE lv_ca TO gs_totals-ca.
  ELSE.
    WRITE lv_navs1 TO gs_totals-ca.
  ENDIF.
*--- legacy node %CODE29 (TOTAL row)
if v_bsart = 'ZPOI' and ( v_waers ne 'XOF' or v_waers ne 'XAF' ).
v_totalI = total.

endif.
  IF v_bsart <> 'ZPOI'.
    WRITE v_total TO gs_totals-total.                              "legacy %TEXT73
  ELSE.
    WRITE v_totali TO gs_totals-total.                             "legacy %TEXT235
  ENDIF.
*--- legacy node %CODE85 (TOTAL_VALUE_WORDS row: amount in words)
CLEAR: v_amt, amt_words.
*data: v_amt type dmbtr.
IF v_waers = 'JPY'.
  v_amt = total * 10.
ELSE.
  if v_bsart eq 'ZPOI'.
  v_amt = v_totalI. "#EC CI_FLDEXT_OK[2610650]
  else.
    v_amt = v_total. "#EC CI_FLDEXT_OK[2610650]
    endif.
ENDIF.

lv_string = v_amt.

SPLIT lv_string AT '.' INTO lv_c1 lv_c2.
lv_amt_i = lv_c1.
if v_bsart = 'ZPOL'.
CALL FUNCTION 'SPELL_AMOUNT'
EXPORTING
 amount          = lv_amt_i"v_amt1
* currency        = v_waers"'USD'
 language        = lv_lang
IMPORTING
 in_words        = words
 EXCEPTIONS
   NOT_FOUND       = 1
   TOO_LARGE       = 2
   OTHERS          = 3
        .
IF sy-subrc = 0.
  lv_birr = words-word.
ENDIF.
elseif v_bsart = 'ZPOI'.
  CALL FUNCTION 'SPELL_AMOUNT'
EXPORTING
 amount          = lv_amt_i"v_amt1
* currency        = v_waers"'USD'
 language        = 'E'
IMPORTING
 in_words        = words
 EXCEPTIONS
   NOT_FOUND       = 1
   TOO_LARGE       = 2
   OTHERS          = 3
        .
IF sy-subrc = 0.
  lv_birr = words-word.
ENDIF.
else.
  CALL FUNCTION 'SPELL_AMOUNT'
EXPORTING
 amount          = lv_amt_i"v_amt1
* currency        = v_waers"'USD'
 language        =  sy-langu
IMPORTING
 in_words        = words
 EXCEPTIONS
   NOT_FOUND       = 1
   TOO_LARGE       = 2
   OTHERS          = 3
        .
IF sy-subrc = 0.
  lv_birr = words-word.
ENDIF.
endif.

CLEAR: lv_string, lv_c1, lv_c2, lv_amt_i.
lv_string = v_amt.

SPLIT lv_string AT '.' INTO lv_c1 lv_c2.
lv_amt_i = lv_c2.
if v_bsart = 'ZPOL'.
CALL FUNCTION 'SPELL_AMOUNT'
EXPORTING
 amount          = lv_amt_i"v_amt1
* currency        = v_waers"'USD'
 language        = lv_lang
 IMPORTING
 in_words        = words
 EXCEPTIONS
   NOT_FOUND       = 1
   TOO_LARGE       = 2
   OTHERS          = 3
        .
IF sy-subrc = 0.
  lv_satim = words-word.
ENDIF.

elseif v_bsart = 'ZPOI'.
  CALL FUNCTION 'SPELL_AMOUNT'
EXPORTING
 amount          = lv_amt_i"v_amt1
* currency        = v_waers"'USD'
 language        =  'E'
IMPORTING
 in_words        = words
 EXCEPTIONS
   NOT_FOUND       = 1
   TOO_LARGE       = 2
   OTHERS          = 3
        .
IF sy-subrc = 0.
  lv_satim = words-word.
ENDIF.

  else.
  CALL FUNCTION 'SPELL_AMOUNT'
EXPORTING
 amount          = lv_amt_i"v_amt1
* currency        = v_waers"'USD'
 language        =  sy-langu
IMPORTING
 in_words        = words
 EXCEPTIONS
   NOT_FOUND       = 1
   TOO_LARGE       = 2
   OTHERS          = 3
        .
  IF sy-subrc = 0.
  lv_satim = words-word.
ENDIF.

  endif
  .
IF lv_satim NE 'ZERO'.
if v_bsart ne 'ZPOI'.
  if lv_satim is NOT INITIAL.
  CONCATENATE lv_birr lv_dollars 'AND' lv_satim   'ONLY ON' INTO
amt_words SEPARATED BY space.
  else.
    CONCATENATE lv_birr lv_dollars   'ONLY ON' INTO amt_words
SEPARATED BY space.
   endif.
else.

  CONCATENATE lv_birr lv_dollars 'AND' lv_satim lv_cents 'ONLY ON'
INTO amt_words SEPARATED BY space.
endif.
*CONCATENATE WORDS-WORD V_WAERS 'AND' WORDS-DECWORD lv_cents 'ONLY'
*INTO AMT_WORDS SEPARATED BY space.
*    CONCATENATE words-word lv_dollars 'ONLY' INTO amt_words SEPARATED
*BY space.
ELSE.
*CONCATENATE WORDS-WORD lv_ktext 'ONLY ON' INTO AMT_WORDS SEPARATED BY
*space.
  CONCATENATE lv_birr lv_dollars 'ONLY ON' INTO amt_words
  SEPARATED BY space.
ENDIF.

CALL FUNCTION 'ZABF_ISP_CONVERT_FRSTCHAR_TOUP'
  EXPORTING
    input_string  = amt_words
    separators    = ' -.,;:'
  IMPORTING
    output_string = lv_amt_words.
*--- legacy node %CODE13 (last footer row: current date - only printed by nodes disabled with 1 = 2)
CONCATENATE sy-datum+6(2) sy-datum+4(2) sy-datum+0(4) INTO g_curr_date
   SEPARATED BY '-'.
*WRITE sy-datum TO g_curr_date.

ELSEIF v_flag = 'Y'.
*==================== service purchase order (legacy table SERVCE_PO over IT_ESLL, V_FLAG = Y)
  LOOP AT it_esll INTO wa_esll.
*--- legacy node %CODE5 (column 1)
v_slno = v_slno + 1.

**CONDENSE v_slno.
CLEAR : G_PACKNO,
        G_EBELP,
        MATDESC,
        WA_RTEXT,
        IT_RTEXT.

SELECT SINGLE PACKNO
              FROM ESLL
              INTO g_PACKNO
              WHERE SUB_PACKNO = WA_ESLL-PACKNO.

  IF G_PACKNO IS NOT INITIAL.

    SELECT SINGLE EBELP TXZ01
                  FROM EKPO
                  INTO (G_EBELP , g_TXZ01)
                  WHERE EBELN = V_EBELN
                  AND   PACKNO = G_PACKNO.

  ENDIF.


**count = count + 1.

concatenate V_EBELN G_EBELP into G_TEXT.

clear : it_rtext[], wa_rtext, lv_name." g_text.

lv_name = G_TEXT.

CALL FUNCTION 'READ_TEXT'
  EXPORTING
   CLIENT                        = SY-MANDT
    id                            = 'F01'
    language                      = 'E' "sy-langu
    NAME                          = lv_name
    OBJECT                        = 'EKPO'
*   ARCHIVE_HANDLE                = 0
*   LOCAL_CAT                     = ' '
* IMPORTING
*   HEADER                        =
  TABLES
    lines                         = it_rtext
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

IF it_rtext IS NOT INITIAL.

  LOOP AT IT_RTEXT INTO WA_RTEXT.
    CONCATENATE MATDESC WA_RTEXT-TDLINE INTO MATDESC.
    CLEAR WA_RTEXT-TDLINE.
  ENDLOOP.

ENDIF.

CONDENSE MATDESC.
*--- legacy node %CODE6 (column 4)
LV_MENGE = WA_ESLL-MENGE.
*--- legacy node %CODE21 (column 6: unit price)
 V_KWERT1 = WA_ESLL-TBTWR.

 CALL FUNCTION          "#EC CI_USAGE_OK[2340247]
 'CURRENCY_AMOUNT_SAP_TO_DISPLAY'
   EXPORTING
     CURRENCY        = V_WAERS
     AMOUNT_INTERNAL = V_KWERT1
   IMPORTING
     AMOUNT_DISPLAY  = V_KWERT1
   EXCEPTIONS
     INTERNAL_ERROR  = 1
     OTHERS          = 2.
 IF SY-SUBRC <> 0.
   MESSAGE ID SY-MSGID TYPE SY-MSGTY NUMBER SY-MSGNO
             WITH SY-MSGV1 SY-MSGV2 SY-MSGV3 SY-MSGV4.

 ENDIF.
 LV_UNITPRICE1 = V_KWERT1.
*--- legacy node %CODE7 (column 7: total)
*G_NETWR = WA_ESLL-NETWR.

 V_KWERT1 =  WA_ESLL-NETWR.

 CALL FUNCTION                "#EC CI_USAGE_OK[2340247]
  'CURRENCY_AMOUNT_SAP_TO_DISPLAY'
   EXPORTING
     CURRENCY        = V_WAERS
     AMOUNT_INTERNAL = V_KWERT1
   IMPORTING
     AMOUNT_DISPLAY  = V_KWERT1
   EXCEPTIONS
     INTERNAL_ERROR  = 1
     OTHERS          = 2.
 IF SY-SUBRC <> 0.
   MESSAGE ID SY-MSGID TYPE SY-MSGTY NUMBER SY-MSGNO
             WITH SY-MSGV1 SY-MSGV2 SY-MSGV3 SY-MSGV4.

 ENDIF.

 LV_TOTAL1 = V_KWERT1.
 G_NETWR = G_NETWR + WA_ESLL-NETWR.
* BOLT: the row exactly as the Smart Form printed it.
    CLEAR ls_service.
    ls_service-seqno = lines( gt_service ) + 1.
    WRITE v_slno TO ls_service-slno.
    WRITE wa_esll-srvpos TO ls_service-srvpos.
    ls_service-descr = |{ condense( g_txz01 ) }({ condense( wa_esll-ktext1 ) })|.   "legacy %TEXT90: &G_TXZ01(C)&(&WA_ESLL-KTEXT1(C)&)
    WRITE lv_menge TO ls_service-menge.
    WRITE wa_esll-meins TO ls_service-meins.
    WRITE lv_unitprice1 TO ls_service-unitpr.
    WRITE lv_total1 TO ls_service-total.
    CONDENSE: ls_service-slno, ls_service-srvpos, ls_service-menge, ls_service-meins, ls_service-unitpr, ls_service-total.
    IF strlen( ls_service-slno ) = 1.                              "legacy integer output: a 1-digit number keeps a trailing blank
      ls_service-slno = |{ ls_service-slno }{ lv_nbsp }|.
    ENDIF.
    APPEND ls_service TO gt_service.
  ENDLOOP.

* footer event - the rows print in this order
*--- legacy node %CODE22 (Gross Price row)
 V_KWERT1 = G_NETWR.

 CALL FUNCTION                "#EC CI_USAGE_OK[2340247]
  'CURRENCY_AMOUNT_SAP_TO_DISPLAY'
   EXPORTING
     CURRENCY        = V_WAERS
     AMOUNT_INTERNAL = V_KWERT1
   IMPORTING
     AMOUNT_DISPLAY  = V_KWERT1
   EXCEPTIONS
     INTERNAL_ERROR  = 1
     OTHERS          = 2.
 IF SY-SUBRC <> 0.
   MESSAGE ID SY-MSGID TYPE SY-MSGTY NUMBER SY-MSGNO
             WITH SY-MSGV1 SY-MSGV2 SY-MSGV3 SY-MSGV4.

 ENDIF.

 V_TOTAL = V_KWERT1.
  WRITE v_total TO gs_totals-gross.
*--- legacy node %CODE23 (Net Discount row)
 V_DIS = v_kwert.
  WRITE v_dis TO gs_totals-dis.
*--- legacy node %CODE8 (Sub Total row)
SUB_TOTAL = v_total  + v_dis.


V_SUB = SUB_TOTAL.
  WRITE v_sub TO gs_totals-sub.
*--- legacy node %CODE24 (VAT row)
lv_vat = lv_kwert1.
  WRITE lv_vat TO gs_totals-vat.
*--- legacy node %CODE31 (CA row)
"lv_vat = lv_kwert1.
clear lv_ca.
lv_ca = lv_navs1.
  IF v_waers = 'XAF' OR v_waers = 'XOF'.
    WRITE lv_ca TO gs_totals-ca.
  ELSE.
    WRITE lv_navs1 TO gs_totals-ca.
  ENDIF.
*--- legacy node %CODE25 (Total row)
TOTAL = V_SUB + LV_vat + LV_CA.
v_total1 = total.
  WRITE v_total1 TO gs_totals-total.
*--- legacy node %CODE12 (words row)
CLEAR: v_amt, amt_words.
*data: v_amt type dmbtr.
IF v_waers = 'JPY'.
  v_amt = total * 10. "#EC CI_FLDEXT_OK[2610650]
ELSE.
  v_amt = v_total1. "#EC CI_FLDEXT_OK[2610650]
ENDIF.
lv_string = v_amt.

SPLIT lv_string AT '.' INTO lv_c1 lv_c2.
lv_amt_is = lv_c1.

CALL FUNCTION 'SPELL_AMOUNT'
EXPORTING
 amount          = lv_amt_is"v_amt1
* currency        = v_waers"'USD'
 language        = sy-langu
IMPORTING
 in_words        = words
 EXCEPTIONS
   NOT_FOUND       = 1
   TOO_LARGE       = 2
   OTHERS          = 3
        .
IF sy-subrc = 0.
  lv_birr = words-word.
ENDIF.

CLEAR: lv_string, lv_c1, lv_c2, lv_amt_is.
lv_string = v_amt.

SPLIT lv_string AT '.' INTO lv_c1 lv_c2.
lv_amt_is = lv_c2.

CALL FUNCTION 'SPELL_AMOUNT'
EXPORTING
 amount          = lv_amt_is"v_amt1
* currency        = v_waers"'USD'
 language        = sy-langu
IMPORTING
 in_words        = words
 EXCEPTIONS
   NOT_FOUND       = 1
   TOO_LARGE       = 2
   OTHERS          = 3
        .
IF sy-subrc = 0.
  lv_satim = words-word.
ENDIF.

IF lv_satim NE 'ZERO'.
  if gv_inco1 is  NOT INITIAL or gv_inco2 is NOT INITIAL.
  CONCATENATE lv_birr lv_dollars 'AND' lv_satim 'ONLY ON' INTO
amt_words SEPARATED BY space.
  else.
    CONCATENATE lv_birr lv_dollars 'AND' lv_satim 'ONLY' INTO
amt_words SEPARATED BY space.
    endif.
*CONCATENATE WORDS-WORD V_WAERS 'AND' WORDS-DECWORD lv_cents 'ONLY'
*INTO AMT_WORDS SEPARATED BY space.
*    CONCATENATE words-word lv_dollars 'ONLY' INTO amt_words SEPARATED
*BY space.
ELSE.
*CONCATENATE WORDS-WORD lv_ktext 'ONLY ON' INTO AMT_WORDS SEPARATED BY
*space.
  if gv_inco1 is NOT INITIAL  or gv_inco2 is NOT INITIAL.
  CONCATENATE lv_birr lv_dollars 'ONLY ON' INTO amt_words SEPARATED BY
space.
  else.
CONCATENATE lv_birr lv_dollars 'ONLY' INTO amt_words SEPARATED BY space.
ENDIF.
ENDIF.


CALL FUNCTION 'ZABF_ISP_CONVERT_FRSTCHAR_TOUP'
  EXPORTING
    input_string  = amt_words
    separators    = ' -.,;:'
  IMPORTING
    output_string = lv_amt_words.
*--- legacy node %CODE26 (last footer row: current date - only printed by nodes disabled with 1 = 2)
CONCATENATE sy-datum+6(2) sy-datum+4(2) sy-datum+0(4) INTO g_curr_date
   SEPARATED BY '-'.
*WRITE sy-datum TO g_curr_date.
ENDIF.

* BOLT: explicit sort of the display tables and condensed totals.
SORT: gt_goods BY seqno, gt_service BY seqno.
CONDENSE: gs_totals-gross, gs_totals-dis, gs_totals-frg, gs_totals-oth, gs_totals-sub, gs_totals-vat, gs_totals-ca, gs_totals-total.
