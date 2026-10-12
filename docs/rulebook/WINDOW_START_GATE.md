# Window start gate — read this to the end BEFORE you claim a ticket or touch a file

Every window (every AI model, every session) that works on a Smart Form → Adobe Form ticket starts here. The user's instruction (2026-10-12): *"whenever
the parallel windows start the work, before that it should be asked to follow every point that we have already worked out; not a single window should miss
these basic instructions."* `queue.mjs claim` refuses a claim without the acknowledgement at the end of this file.

## 1. Read, in this order (do not skim)

1. `CLAUDE.md` and `docs/00_START_HERE.md`.
2. **`docs/rulebook/ADOBE_FORM_BUILD_RULEBOOK.md` — all of it.** It overrides older notes (section 12 lists what it replaced).
3. `docs/strategy/README.md`, then S06, S07, S08, **S09 and S10** in full (S01-S05 as needed). Where S06-S08 give numbers, S10 says they are form-specific.
4. `docs/BUILD_ISSUES_LOG.md`: skim every F-number whose construct you will use; read F50-F77 completely.
5. The latest status entries and the layout / tools of the sibling tickets (ZMMET_PO_SF, ZMMCG_PO_SF): `git show origin/<branch>:docs/legacy_grab/<form>_status.md`.
6. The company ABAP standards (memory `feedback_abap_coding_standards`: DIL naming, 7.4+, no INSERT / INTO CORRESPONDING, sorted tables).
7. The form's own evidence: legacy-grab `.md`, the raw export XML, **the wizard form of the same Smart Form and the legacy printouts if the client supplied them**.

## 2. Commitments you make by claiming (each is checked later)

- [ ] I will ask the client, in my first status entry, for the intake evidence (rulebook section 2) and I will not invent geometry, wording or conditions.
- [ ] Numbers come from the same form's wizard form and printouts, never from a sibling form or from font metrics.
- [ ] I will generate the layout and the interface additions from the export with a script that a rerun reproduces exactly.
- [ ] Business logic and variable text are prepared in the Initialization; the layout stays simple, default visible, readable in the Design View.
- [ ] ABAP I write follows DIL naming and 7.4+ syntax; legacy code stays verbatim; generated ABAP is interpreted and linted before it is pushed.
- [ ] Before every commit and every hand-off I run the ten re-check passes (rulebook section 8) and fix every failure.
- [ ] I state what only a render in the client's SAP can prove and I never write "done" before the client's result is in the status file.
- [ ] I respect the status-file gate: `WAITING_ON: operator` = stop; one manual step per hand-off; never force-push.
- [ ] Every lesson goes to `main` the same day (strategy, build-issues log with the next free F number, rulebook if a rule changes).
- [ ] One ticket per window, private clone outside OneDrive, I do not touch other windows' branches or the shared tools.

## 3. How to claim

```
node <BoltConsole>/tools/queue.mjs claim <your clone> <branch> "<your window name>" --ack <TOKEN>
```

`<TOKEN>` is the value of the last line of this file. Reading only the claim error message does not give it to you.

---
ACK-TOKEN: GATE-V2-20261012-RULEBOOK-S10-RECHECK10
