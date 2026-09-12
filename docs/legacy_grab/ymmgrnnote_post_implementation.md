# YMMGRNNOTE — Post-Implementation Extension Points and SAP Validation

## Named Developer Extension Points

| ID | Open item | Required SAP-side resolution |
|---|---|---|
| `DEP-YMMGRNNOTE-01` | Memory-ID/user-name derivation | Confirm whether `YSN_YM07DRAUS`, `USR21`, and `ADRP` access is authorised and retained; implement only in SFP interface coding. |
| `DEP-YMMGRNNOTE-02` | Company-name derivation | Confirm `T001-BUTXT` lookup and `LS_MSEG-BUKRS` semantics. |
| `DEP-YMMGRNNOTE-03` | Amount, totals, and references | Confirm `PEINH` zero handling, exchange-rate semantics, VAT/freight source fields, and all CURR/QUAN reference fields in SFP Context. |
| `DEP-YMMGRNNOTE-04` | Date/month helper | Confirm `ZABF_ISP_GET_MONTH_NAME`, its language behavior, and an approved replacement if unavailable in S/4HANA. |
| `DEP-YMMGRNNOTE-05` | Conditional legal/branding content | Business owner confirms condition precedence and the static Dangote/Okpella texts for `WE01`, `ZET1`, plants `1000/1100/1021`, country `TZ`, and value `12`. |
| `DEP-YMMGRNNOTE-06` | SmartStyle translation | Export and approve `YGRNNOTE`; map every evidenced paragraph/character format. |
| `DEP-YMMGRNNOTE-07` | Geometry and sign-off source | Supply representative legacy output because source XML has blank window positions. |

## SAP validation steps

1. Confirm the SFP baseline activates and shows a physical portrait page before adding bindings.
2. Build and capture SFP Context from the exact legacy interface; set and test all DDIC quantity/currency reference fields.
3. Render all five conditional header/template paths, including E and F language records.
4. Test zero/initial `PEINH`, initial/non-initial `IV_KURSF`, an empty `LT_MSEG`, multiple rows, and a multi-page table.
5. Compare legacy OTF (`GETOTF = 'X'`, `CONVERT_OTF`) against the Adobe PDF for the same document data, including manual signature lines and page counter.
6. Obtain named business-owner visual sign-off, required for this High-risk form.

**Out of scope:** driver-program changes, NACE/output-determination changes, and cutover decisions.
