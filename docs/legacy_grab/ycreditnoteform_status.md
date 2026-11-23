# Migration Status — YCREDITNOTEFORM

STATUS: waiting_manual
UPDATED: 2026-11-23T16:58:17.942Z
WAITING_ON: operator
NOTE: Two steps for you: (1) pull this branch in abapGit and activate YCREDITNOTEFORM_INT, (2) create the empty form YCREDITNOTEFORM_ADT, activate, push. Context and layout are done by us.
STOP: none
CLAIMED_BY: Window-5

---
## 2026-11-23T16:04:53.205Z — Queued
Migration submitted with 13 reference file(s).

Sent by Bolt with Fiori from SAP system DCD client 400 by user C.SSP (serial no. 1).
Early complexity signal: HIGH - 8 window(s), 3 table/loop section(s), 7 condition(s), 2 language(s), 6 embedded code node(s), 28 interface parameter(s). (structural read of the layout only - not the full risk score).

## 2026-11-23T16:10:31.204Z — Picked up
Window-5 picked this migration up.

## 2026-11-23T16:14:12.786Z — Picked up - evidence and decisions needed before building
Window-5 has started on YCREDITNOTEFORM. Thank you for the complete upload (legacy grab, form XML, style YCREDITSTYLE, ten driver programs).

**What I found in the form** (details: `docs/legacy_grab/YCREDITNOTEFORM_conversion_map.md` on this branch)
- A simple form (class A): one A4 page that repeats when the items run over, logo, company title / plant / TIN, address, a CREDIT NOTE (billing type ZG2) or DEBIT NOTE (ZL2) title, CN / DN number and date, one item table with a TOTAL line and the amount in words, signature lines at the bottom.
- The French texts are identical to the English ones, so the form prints English only.
- I will build it with prepared data instead of scripts: the title, the advice sentence and the CN / DN label are decided in the Initialization by the billing type, and every piece of legacy code (title, plant, TIN, totals, amount in words) is carried over unchanged.

**Please send (attach the files on this migration page in Bolt, or push them to this branch)**
1. **The wizard form of this Smart Form**: in SFP use *Create Adobe Form by Migration* on YCREDITNOTEFORM (any name, local package is fine) and send its form XML and layout (XDP). It shows how your SAP renders the same form and settles positions and fonts.
2. **Two printouts (PDF) made with the current Smart Form**: one credit note (ZG2) and one debit note (ZL2), with their document numbers. If you have one with several items, please add it.

**Please decide**
1. **Is this form still used, and by which program?** The main invoice program ZSDSN_RLB_INVOICE now prints credit notes with **ZSDSN_CRNOTE_SF** (YCREDITNOTEFORM is commented out there), and no output type in NACE points to YCREDITNOTEFORM. It is still called by YRLB_INVOICE, ZINVOICE, ZJ_INVOICE1 and ZSDI_INV_EXPORT (and the test programs ZTEST_1 / ZTEST_INVOICE). If it is no longer printed, should I migrate ZSDSN_CRNOTE_SF instead?
2. **Amount per item**: every item line prints the whole document amount (net + tax), and the TOTAL line adds it up again for each item. With one item the note is correct; with two items the total doubles. Keep exactly as today, or show each item's own amount?
3. **TOTAL line after every item**: today a TOTAL line follows every item line (running total). Keep, or one TOTAL line after the last item?
4. **Date**: the date printed is the day of printing, not the billing date. Keep?
5. **Box around the title**: the CREDIT NOTE / DEBIT NOTE text has a frame in the form definition. Is it printed inside a box on paper? (The printouts will answer this too.)

**What happens next**: with the evidence and answers I build the interface first and ask you to pull it (one step at a time). Nothing is changed in your system before that, and the driver programs are never touched.

## 2026-11-23T16:19:30.551Z — Complete list of questions (please answer in one reply)
This list replaces the requests of my previous entry and adds the remaining points, so you can answer everything at once. Nothing is built before your answers.

**How to reply:** open this migration in Bolt, type the answers in the box (just the numbers, e.g. "Q1 yes, Q2 keep ..."), attach the files and choose **I've done this - confirm**.

**Files to attach**
- **E1** The wizard form of this Smart Form: SFP > *Create Adobe Form by Migration* on YCREDITNOTEFORM (any name, local package), then its form XML and layout (XDP).
- **E2** One printed **credit note (ZG2)** and one printed **debit note (ZL2)** as PDF, made with the current Smart Form, with their document numbers. One with several items if you have it.
- **E3** If a note ever runs onto a second page: that printout as well.

**Questions**
- **Q1 Still in use?** ZSDSN_RLB_INVOICE now prints credit notes with **ZSDSN_CRNOTE_SF**, and no NACE output type points to YCREDITNOTEFORM. Which program and output type print YCREDITNOTEFORM today (YRLB_INVOICE, ZINVOICE, ZJ_INVOICE1, ZSDI_INV_EXPORT)? If it is no longer printed, should ZSDSN_CRNOTE_SF be migrated instead?
- **Q2 Amount per item:** every item line prints the whole document amount (net + tax) and TOTAL adds it again per item, so two items double the total. Keep as today, or print each item's own amount?
- **Q3 TOTAL line:** a TOTAL line follows every item (running total). Keep, or one TOTAL after the last item?
- **Q4 Date:** the date printed is the day of printing, not the billing date. Keep?
- **Q5 Title box:** is CREDIT NOTE / DEBIT NOTE printed inside a box?
- **Q6 Number format:** amounts as 1,234,567.89 (as today, I assume) - correct?
- **Q7 Language:** English only (the French texts in the form are identical to the English ones) - correct? The amount in words follows the user's logon language today; keep?
- **Q8 Plant name:** for credit notes of plants whose country is in set ZSD_COUNTRY_VALID the plant name is left out (legacy rule). Still wanted?
- **Q9 Logo:** the form uses graphic DANGOTE LOGO (SE78). Still the right logo?
- **Q10 Object names and package:** the new objects will be **YCREDITNOTEFORM_INT** (interface) and **YCREDITNOTEFORM_ADT** (form). Which package and transport should they go into?
- **Q11 Test documents:** one credit note and one debit note number we may use to preview the new form (can be the ones of E2).

The driver programs are only read, never changed. Which program will later call the new Adobe form is a separate decision for you; it is not part of this migration.

## 2026-11-23T16:48:19.118Z — No answers yet? Reply "proceed with defaults"
You do not need to know every answer. If you reply **proceed with defaults** (on this migration page in Bolt: type it in the box and choose **I've done this - confirm**), I build **version 1 exactly as your current Smart Form prints today**, using these defaults:

| | Default (= the legacy form today) |
|---|---|
| E1 / E2 / E3 files | not needed for version 1 - positions and fonts come from the form definition and its style YCREDITSTYLE; you compare the preview with a printed note afterwards |
| Q1 Still in use | migrate YCREDITNOTEFORM as loaded |
| Q2 Amount per item | as today: the document amount (net + tax) on every item line |
| Q3 TOTAL line | as today: after every item |
| Q4 Date | as today: date of printing |
| Q5 Title box | as the form defines it: CREDIT NOTE / DEBIT NOTE inside a box |
| Q6 Number format | as today: the user's number format |
| Q7 Language | English; amount in words in the logon language |
| Q8 Plant name | rule kept |
| Q9 Logo | DANGOTE LOGO |
| Q10 Names and package | YCREDITNOTEFORM_INT / YCREDITNOTEFORM_ADT, package ZAB_ADOBE (tell me if you use another) |
| Q11 Test documents | any credit note and debit note you choose |

After version 1 you get a short list of **post-implementation checks** (preview against a printed note, the points above). Anything you want different then comes as version 2. You can still answer any question individually - your answer replaces its default.

## 2026-11-23T16:49:24.741Z — Manual activity confirmed
Client confirmed the manual step is done: proceed with defaults

## 2026-11-23T16:55:43.172Z — Version 1, step 1 of 2: the interface is ready - action needed from you (SAP)
Thank you - proceeding with the defaults: version 1 prints exactly what YCREDITNOTEFORM prints today.

**What I built** (`src/ycreditnoteform_int.sfpi.xml`, generated by `tools/ycreditnoteform/gen_interface.mjs`)
- The same 11 import parameters and table IT_VBRP as the Smart Form (the standard SSF parameters are created by SAP itself), the 14 global fields.
- The Initialization runs the form's own code, unchanged: the VBRK read and the TIN, the title / plant / currency heading (%CODE6), the date (%CODE1), then for every item the serial number, amount and running total (%CODE2, %CODE3, %CODE5) and after the last item the amount in words (%CODE4). The code of the item lines now runs in one loop before printing, because an Adobe form cannot run code inside a table - the result is the same lines the Smart Form printed.
- The texts that depend on the billing type are prepared there as well (CREDIT NOTE / DEBIT NOTE, the advice sentence, CN NO / DN NO, the date line), so the layout needs no scripts. Every addition is marked `BOLT:` in the code.
- Checked: same parameters, globals and legacy code as the Smart Form (all program lines verbatim and in their order), valid XML, the generator reproduces the file exactly. Not checked yet: the activation in your system - only your SAP can show that.

**Please do (one step, in this order)**
1. **SFP**: create the interface **YCREDITNOTEFORM_INT** and the form **YCREDITNOTEFORM_ADT** (interface YCREDITNOTEFORM_INT), package **ZAB_ADOBE**, your transport. Leave both empty (one static text in the form is enough) and save.
2. **abapGit**: pull this branch (vernasofttechie-ycreditnoteform) - the interface receives its parameters, global fields and Initialization. **Activate YCREDITNOTEFORM_INT.** If SAP reports an error, send the exact message and line number (Report a problem) - I fix it right away.
3. **abapGit**: Stage, Commit and **Push** both objects (YCREDITNOTEFORM_INT and YCREDITNOTEFORM_ADT) back to this branch. This gives me your system's own form file, into which I build the Context and the layout (step 2).
4. Choose **I've done this - confirm** here.

**Next (step 2)**: Context and layout exactly as the legacy form (logo, header, address, CREDIT / DEBIT NOTE box, number and date, item table with TOTAL lines, amount in words, signature lines), then you preview a credit note and a debit note - with a short list of post-implementation checks.

## 2026-11-23T16:58:17.942Z — Simpler: only two steps for you (replaces the list above)
The interface is ready for you; the Context and the layout are built by us. You only need to:

1. **Pull the interface** - abapGit: pull this branch (vernasofttechie-ycreditnoteform), package **ZAB_ADOBE**. It creates **YCREDITNOTEFORM_INT** with its parameters, global fields and code. **Activate YCREDITNOTEFORM_INT.** If SAP reports an error, send the exact message and line (Report a problem).
2. **Create the form** - SFP: create the form **YCREDITNOTEFORM_ADT** on the interface YCREDITNOTEFORM_INT, package ZAB_ADOBE, leave it empty, **activate**. Then abapGit: **Stage, Commit and Push** it to this branch.

Then choose **I've done this - confirm**. We build the Context and the complete layout into your form and send it back for one pull and a preview.

(Only if the pull in step 1 does not create the interface: create YCREDITNOTEFORM_INT empty in SFP and pull again.)
