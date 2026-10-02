# Migration Status — zfing_cust_act_sum

STATUS: waiting_manual
UPDATED: 2026-10-02T05:15:50.000Z
WAITING_ON: operator
NOTE: Create the empty interface/form in SFP with the correct names, pull this branch in abapGit, build Context + the currency reference, then Stage-Commit-Push back.
STOP: none
CLAIMED_BY: Window-1

---
## 2026-10-02T04:49:06.048Z — Queued
Migration submitted with 7 reference file(s).

## 2026-10-02T05:15:20.000Z — Picked up
Window-1 picked this migration up.

## 2026-10-02T05:15:50.000Z — Interface prepared
The form interface for ZFING_CUST_ACT_SUM has been prepared from your reference export and saved on this branch (`src/zfing_cust_act_sum_int.sfpi.xml`).
- 19 custom import parameters and 5 tables, read directly from the form's own definition (nothing guessed) — plus one new import parameter, `LV_WAERK` (currency key), added for the reason below.
- 13 global data fields from the form's global definitions.
- Left out on purpose: the standard SSF envelope parameters (SAP recreates them itself), the exceptions and the context tree — these must be created inside SAP, not from a file.
- Your own legacy-grab snapshot (`ZFING_CUST_ACT_SUM.md` section 2c) flagged two amount fields — `ZSTR_ATC_TAB-AMOUNT` and `ZTAB_ACT_STMT-AMOUNTLC` — as CURR fields with no currency-key scalar anywhere in the original interface to reference. Rather than leave that for a rejected-Context round-trip (the exact failure logged as F50 on ZCGSD_INVOICE), I added `LV_WAERK` (type WAERK) to the interface and pre-declared it as the Reference Field's unit for every amount field that uses it: `PAYMENTITEMS`, `BONUSITEMS`, `RETURNITEMS`, `INVOICEITEMS`, `OPEN_ATC` (table parameters) and `PAYMENTS`, `BONUSES`, `RETURNS`, `INVOICES`, `ATC_ITEMS` (their per-row globals, bound in the legacy form's MAIN/%WINDOW2 windows) — 10 Reference Field entries in total, all pointing at `LV_WAERK`. Please still check these in SFP once Context is built; a pre-declared reference is a starting point, not a guarantee.
- Also noted in the legacy-grab snapshot: no driver could be confirmed via NACE/TNAPR for this form — `ZKTEST_PROG`, `ZTESTK`, `ZFI_CUST_ACT_STMT_F01`, `ZFI_CUST_ACT_STMT_F01_COPY` and `ZFI_SEND_STMT_I01` are source-scan candidates only. This doesn't block interface/layout work — driver programs are read-only and out of scope for this project either way — but please confirm the real driver with the functional owner before this form goes live.

## 2026-10-02T05:15:50.000Z — Action needed from you (SAP)
Please do these in SAP, in order:
1. In transaction SFP create the Adobe form interface **ZFING_CUST_ACT_SUM_INT** and form **ZFING_CUST_ACT_SUM_ADT** (package ZAB_ADOBE) with one simple static field — this is the safe empty starting point.
2. In abapGit, pull this branch (vernasofttechie-zfing_cust_act_sum) onto that interface so the parameters, global fields and the pre-declared currency reference appear.
3. In the form Context, drag in the interface nodes in the order listed in `ZFING_CUST_ACT_SUM.md` section 2d, then check every amount field against the `LV_WAERK` reference SAP should already be offering.
4. In abapGit do Stage, Commit and Push back to this same branch.

When it is done click "I've done this — confirm" below. If anything fails, use "Report a problem" and give the exact message.
