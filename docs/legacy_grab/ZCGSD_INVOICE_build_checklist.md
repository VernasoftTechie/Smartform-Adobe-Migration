# ZCGSD_INVOICE_ADT — Layout Build Record

Built directly into `src/zcgsd_invoice_adt.sfpf.xdp` on the client's own
SFP-created baseline (per S01/S04 — the Context tree the client built stays
untouched; only the layout body was added). Following S02 (margin
discipline), S03 (composite header/lines/totals layout), S06 (explicit
`x`/`y` position by default), S07 (reusable patterns). Every field/table
binding below is read from `zcgsd_invoice.xml` and the pushed interface's
own `dd:dataDescription` — nothing guessed.

**Not yet SFP-tested.** Well-formed XML, verified sibling non-overlap and
margin arithmetic (script-checked, not eyeballed) — but per S01/S05, a
correct-on-paper layout still needs a real Design View screenshot before
it's trusted. Please pull, open Layout, and confirm it renders as a page
before reporting anything else.

## 0. Master page

| Setting | Value | Source |
|---|---|---|
| Paper | A4, **portrait** | `<PAGEFORMAT>DINA4</PAGEFORMAT>`; content fits well inside 21cm (widest legacy content 19.5cm) — no landscape signal like the PR pilot had |
| Medium / content area | `29.7cm × 21cm`, content area `20cm × 28.7cm` at `(0.5cm, 0.5cm)` | Same values already proven working on `ZSD_ATC_ADT` in this repo |
| Body width | `18cm` at `x=0.5cm` (0.5cm left + 1.5cm right margin) | S02's margin rule (F48) — a 0.4-0.5cm margin has failed twice before; budgeted 1.5cm here from the start |

## 1. Regions built (top to bottom)

| Region | Legacy window(s) | What's built | Evidence |
|---|---|---|---|
| Header band | `HEADER_WINDOW`, `%GRAPHIC1`, `ADDRESS_1230` | 3 side-by-side columns: logo placeholder, `LV_HEADING` + reprint marker, static Tanzania company address block | Section 4 node tree; `ADDRESS_1230` is the only live address window — the South Africa `ADDRESS` window's own condition is a permanent `1 = 2` |
| Pick-up plant line | `MAIN` (`%TEXT100`) | One line, "Pick-up Plant: Dangote Cement Plant" | Legacy text, condition `FLAG = 'X'` |
| Details band | `INVOICE_TO`, `INFORMATION` | 2 side-by-side boxes: bill-to address, customer/document reference fields | `%TEMPLATE2`/`WITHO_NAME3` (invoice_to), `%TEMPLATE9` (information — the live one; `%TEMPLATE4` is dead, `1 = 2`) |
| Line items | `MAIN` (`%TABLE1`) | Repeating table, 8 columns (Invoice / ATC No. / Invoice Date / Material / Quantity / Net Amount / Tax / Gross Amount), bound `$.LT_INVOICE.DATA[*]` | Legacy table columns + confirmed real data schema in the pushed `.sfpf.xdp` — table is genuinely `LT_INVOICE`/`GS_INVOICE`, not `GT_FINL` (see DEP-4) |
| Grand total | `MAIN` (`%TEMPLATE5`) | "Total" + `$.GROSS_TOT` | Legacy `%TEXT7`/`%TEXT12` |

## 2. Developer Extension Points — need your decision, not guessed

- **DEP-1 — Logo.** A bordered placeholder box (`[Dangote logo]`) sits where
  the SE78 graphic `DANGOTE LOGO WHITE` goes. Hand-authoring a binary image
  embed into the XDP has no proven pattern in this repo — please insert the
  real logo via Designer's own **Insert → Image** at that spot (top-left,
  ~3cm × 1.68cm), then Stage-Commit-Push.
- **DEP-2 — Two conditions simplified to "always show".** The legacy form
  only prints the reprint marker when `VSTAT='1' OR LV_REPRINT=true`, and
  the whole line-items table + pick-up line only when `FLAG='X'`. Both are
  built as always-visible here rather than an unverified FormCalc
  presence-condition script. Confirm this is acceptable, or tell me the
  conditions still need to be real and I'll build the scripted version.
- **DEP-3 — `INVOICE_TO`'s second variant dropped.** Legacy has two
  mutually-exclusive address templates keyed on `GS_INFO.I_NAME1 <>` /
  `= INITIAL` — nearly identical, differing by a couple of lines. Only the
  first (non-initial) variant is built. Confirm that's safe, or tell me
  what the `= INITIAL` case needs to show differently.
- **DEP-4 — `GT_FINL`/`GS_FINL` appear unused.** These are declared in the
  interface (and were part of the reference-fields fix) but never
  referenced anywhere in the legacy form's actual layout — only
  `LT_INVOICE`/`GS_INVOICE` is. Worth confirming they're genuinely dead
  before the interface carries them forward indefinitely, but not a layout
  blocker.
- **DEP-5 — Duplicate table.** The legacy form has a second copy of the
  exact same line-items table (`%TABLE8`), same condition, same binding,
  same columns — built once here, not twice. Please confirm this is a
  genuine legacy duplicate (not needed) rather than something with a
  distinct purpose I'm missing.
- **DEP-6 — `TOTAL` window and the Terms & Conditions page are dead code,
  not built.** `TOTAL`'s own window condition is `1 = 2` (always false —
  superseded by `MAIN`'s own grand total, which is built). The entire
  `TERMS_AND_CONDITION` page's window condition is
  `LV_EMAIL = ABAP_TRUE AND 1 = 2` — also always false, so it never printed
  in the legacy form either. It's a long block (30+ legal paragraphs) I
  have not transcribed, since it provably never rendered. If this was meant
  to print and the `1 = 2` is itself a legacy bug, please say so and I'll
  build it — otherwise treating it as retired.

## 3. Required validation (per S01/S05 — not done by this push)

1. Pull this branch in abapGit onto the pushed baseline.
2. Open Layout in SFP/Designer — confirm a physical A4 portrait page shows,
   with the 4 regions above roughly where described (no overlap, no
   content run off the page).
3. Preview with real data if available — check the table repeats correctly
   and the total shows.
4. Report back: a screenshot of Design View (or Preview PDF) is the fastest
   way for me to catch anything the arithmetic checks above can't (S06's
   own lesson — a correct `x`/`y` layout can still fail to render as
   expected the first time).
