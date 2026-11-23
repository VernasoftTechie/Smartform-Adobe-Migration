# Migration Status — YCREDITNOTEFORM

STATUS: waiting_manual
UPDATED: 2026-11-23T16:14:12.786Z
WAITING_ON: operator
NOTE: Picked up by Window-5. Before building, please send the evidence and answers listed in the latest entry (wizard form, printouts, 5 decisions).
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
