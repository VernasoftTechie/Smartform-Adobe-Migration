# Global Data Library

This is the `main`-branch library for assets, style evidence, and client
governance documents shared by all Smart Form conversion branches. Populate
each category once, then update it only when something new is introduced.

Conversion branches read this library; they do not duplicate global exports,
binary assets, or client documents in their form-specific folders.

Bolt Console's Configure → Global reference library page can push directly
into this folder (one category at a time, same rules as below) — a manual
push here works identically; either way lands in the same place.

## Intake order

1. Run `ZSF2AF_R_LEGACY_GRAB` with `P_GLOB` enabled.
2. Commit the resulting `global_smartstyles.txt` in `styles/` and
   `global_logos.txt` in `logos/`.
3. Export each approved global SmartStyle from SMARTSTYLES and store the XML
   beside its inventory entry in `styles/`.
4. Export each approved SE78 graphic and store its original binary and a
   provenance note in `logos/`.
5. Update `docs/06_global_findings.md` with the inventory and
   `docs/04_global_style_catalogue.md` with approved reusable style mappings.
6. Place any client-supplied naming standard document in `naming_standards/`
   and any other client policy/instructions document in `policies/` as
   supplied — see each folder's own README.

## Rules

- Preserve source export names. Do not rename a style or graphic based on a
  form-specific interpretation.
- Each asset must identify SAP object/type/ID, source system/client, export
  date, and checksum where practical.
- Do not store credentials, SAP session exports containing business data, or
  form-specific screenshots here.
- A conversion branch chooses from this library only after the form’s legacy
  evidence identifies its actual SmartStyle and graphic references.
- A new style or logo becomes reusable only after an SFP-rendered form has
  validated it and the result is promoted through `docs/strategy/`.
- A client naming standard or policy document only takes effect once it's
  confirmed present in `naming_standards/`/`policies/` — never assumed from
  a verbal description (Bolt Playbook §1.5).

## Folder layout

```text
docs/global_data/
├── README.md
├── styles/
│   └── README.md
├── logos/
│   └── README.md
├── naming_standards/
│   └── README.md
└── policies/
    └── README.md
```

## Current inventory

The initial SAP-wide extraction was supplied on 2026-09-13:

| Asset | Location | Records | SHA-256 |
|---|---|---:|---|
| SmartStyle inventory | `styles/global_smartstyles.txt` | 41 | `FF5B76F9402DE62E7085E04C8C495BC15603B7DD625993F8C3CF07DB61491491` |
| SE78 graphic inventory | `logos/global_logos.txt` | 574 | `1143FE94333D7CA4D35E22B9240B0BBC18479F233737775163B40D5DE37CE727` |
| Dangote logo reference | `logos/Dangote_Logo.png` | 4,267 bytes | `B1CAE66D144AE5F17C71371AA8EEB66C2F396DF072742AAE9117822F71A64B3D` |
