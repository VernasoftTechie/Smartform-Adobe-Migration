# Archived SFP-generated Adobe Form References

These files are SAP-generated, abapGit-native SFPF/SFPI/XDP artifacts retained
only as design and serialization references.

They are intentionally outside `/src/`. The repository's `.abapgit.xml`
ignores `docs/*`, so abapGit cannot import them into the new `ZAB_ADOBE`
package or overwrite a new conversion.

| Archive | Purpose | Pullable through abapGit |
|---|---|---|
| `zhello_world_*` | Minimal known-rendering SFP/LiveCycle baseline | No |
| `z_mm_pr_form_adt.*` | Validated Purchase Requisition pilot and composite-layout example | No |

For each new form, create its Adobe Form and `_INT` interface in SFP under
the intended package, validate its native baseline, and then commit the
newly generated `/src/` artifacts on that form's dedicated branch.
