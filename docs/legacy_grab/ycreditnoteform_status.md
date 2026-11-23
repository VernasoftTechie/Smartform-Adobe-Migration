# Migration Status — YCREDITNOTEFORM

STATUS: waiting_manual
UPDATED: 2026-11-23T16:48:19.118Z
WAITING_ON: operator
NOTE: Answer the questions of the previous entry, or simply reply "proceed with defaults" - I then deliver version 1 exactly as your current Smart Form.
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
