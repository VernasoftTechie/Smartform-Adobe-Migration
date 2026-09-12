# Global Findings — raw log of styles & logos

Feeds `04_global_style_catalogue.md` §Catalogue. Two parts:

## §0. System-wide inventory (from the `P_GLOB` sweep — do this first)

Run `ZSF2AF_R_LEGACY_GRAB` with `P_GLOB` ticked once and store the resulting
source files in `docs/global_data/`. This is the master list every form gets
matched against — built once, not rediscovered per form.

### All SmartStyles (from `global_smartstyles.txt`)
**Captured 2026-09-13:** 41 records in
[`global_data/styles/global_smartstyles.txt`](global_data/styles/global_smartstyles.txt)
(SHA-256 `FF5B76F9402DE62E7085E04C8C495BC15603B7DD625993F8C3CF07DB61491491`).

### All SE78 graphics (from `global_logos.txt`)
**Captured 2026-09-13:** 574 records in
[`global_data/logos/global_logos.txt`](global_data/logos/global_logos.txt)
(SHA-256 `1143FE94333D7CA4D35E22B9240B0BBC18479F233737775163B40D5DE37CE727`).
The supplied `Dangote_Logo.png` visual reference is stored beside the
inventory; exact per-form asset selection still comes from the form's legacy
Smart Form export.

## §1. Per-form matches

One row per form once its snapshot's §6/§7 name which SmartStyle/graphic
(from §0 above) it actually uses — a lookup against the inventory, not
fresh research.

### Styles matched

| Form | SmartStyle name (from §0) | Matched global style |
|---|---|---|
| _(none logged yet — populate as snapshots' §6 are filled in)_ | | |

### Logos matched

| Form | Graphic / SE78 object (from §0) | Matched global asset |
|---|---|---|
| _(none logged yet — populate as snapshots' §7 are filled in)_ | | |
