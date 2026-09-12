# Global Data Library

This is the `main`-branch library for assets and style evidence shared by all
Smart Form conversion branches. Populate it once from the SAP landscape,
then update it only when a new global style or SE78 graphic is introduced.

Conversion branches read this library; they do not duplicate global exports
or binary assets in their form-specific folders.

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

## Folder layout

```text
docs/global_data/
├── README.md
├── styles/
│   └── README.md
└── logos/
    └── README.md
```
