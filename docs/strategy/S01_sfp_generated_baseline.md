# S01 — SFP-generated baseline and safe abapGit capture

## Select this strategy

Use for **every** Smart Form conversion, before any layout work.

## Proven pattern

1. Create the Adobe Form and its interface in SFP.
2. Open Layout, add a native static field, save, and activate.
3. Confirm the physical page and native field render in Designer.
4. Capture the generated SFPF, SFPI, and XDP artifacts through abapGit
   **Stage -> Commit -> Push**.
5. Treat that commit as the baseline; change only one independently
   renderable design increment at a time.

## Never do this

- Do not invent or copy a `CL_FP_CONTEXT` object graph.
- Do not Pull an unverified repository layout over a working SAP object.
- Do not use XML parsing as proof that SFP Layout will render.
- Do not modify the caller or driver program to make the form appear to work.

## Why this exists

The PR pilot proved that a Pull can overwrite a healthy SFP-created form with
hand-authored serialization, removing the valid page structure and generated
Context. Repeated imports of alternative serializations can also leave the
SFP object unresponsive. See F20-F23.

## Required validation

- SFP Layout opens and displays a physical page.
- Activation is successful.
- The baseline is captured before another design edit is attempted.

## Form-specific inputs

The baseline does not decide fields, table structures, styles, graphics, or
conditions. Those always come from the individual form's legacy evidence.
