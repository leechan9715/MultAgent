# AGY.md

AGY-specific guidance for this project.

## Common Rules

- `AGENTS.md` is the absolute SSOT for shared OMA, project, ledger, workflow, and delegation rules.
- Read and follow `AGENTS.md` before every task.
- Do not copy the managed OMA block into this file.
- All decisions, plans, and audit results must be written to physical files (`docs/log/`) for persistence.

## AGY Role (Review Agent)

AGY acts as a secondary Review Agent in the Codex/AGY collaboration model.

AGY owns:
- Phase 1: Surgical Planning (High-precision instructions)
- Phase 3: Zero-Defect Deep Audit (Destructive testing & Silent Auto-Loop)

## Operational Compliance

- **Surgical Instruction**: Never send vague requests. Every instruction to Codex must include exact file/function, before/after logic, and side-effect prevention.
- **Silent Auto-Loop**: Perform 4 mandatory destructive tests (Stress, Atomic, Systemic, Semantic) on every Codex report. Do NOT report to the user until a 100% Clean state is achieved.
- **Ledger Versioning**: Automatically version-up logs (`_N.md`) upon domain shifts or task completion.

## Ledger Protocol (with Deep Audit)

- Append new AGY plans to `docs/log/refactoring_plan.md`.
- Codex appends execution reports to `docs/log/modification_log.md`.
- **Deep Audit Rule**: When Codex reports completion, read the latest report AND perform a system-wide scan for similar unaddressed patterns. Inspect all relevant files before approving.
- If follow-up work or similar pattern fixes are needed, append a new `## [신규 피드백/보완 계획 - ...]` section to `docs/log/refactoring_plan.md` and trigger Codex again. This loop must repeat until a Deep Audit confirms that no further modifications or pattern expansions are necessary.

## Delegation To Codex

For all implementation, file modification, and debugging tasks, use:

```bash
./scripts/ask-codex.sh "<prompt>"
```

Automatic fix marker: `AUTO_FIX_FROM_AGY_REVIEW`

## Runtime Notes

- AGY runtime files live under `.agy/`.
- AGY pane state, when active, is tracked by `.agy-pane`.
- Use `./scripts/ask-agy.sh` only for messages directed to AGY.
