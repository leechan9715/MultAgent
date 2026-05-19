# AI_TOOL_USAGE.md review/fix result

Date: 2026-05-19
Scope: `AI_TOOL_USAGE.md`
Request marker: `AUTO_FIX_FROM_GEMINI_REVIEW`

Result:
- Rewrote `AI_TOOL_USAGE.md` from 748 lines to 283 lines.
- Consolidated the guide into 6 top-level sections: Quick Start, setup/install, run/tmux, roles/delegation, key files/rules, troubleshooting/safety.
- Kept `cd ~/TestProject && ./scripts/start-ai.sh` at the top and repeated it in run/troubleshooting contexts.
- Preserved Windows guidance via WSL Ubuntu, not native PowerShell execution.
- Consolidated install guidance into one copy/paste flow from base packages through Node.js, Codex CLI, Gemini CLI, Bun, and version checks for Serena/OMA.
- Unified Codex/Gemini role split and `ask-codex.sh` / `ask-gemini.sh` usage.
- Reduced troubleshooting to CRLF, pane ID file missing, and command-not-found cases.
- Kept OMA SSOT guidance and did not edit `.agents/`.

Verification:
- `wc -l AI_TOOL_USAGE.md` -> 283 lines.
- Confirmed 6 top-level `##` sections and presence of `Pane ID` phonebook explanation via `rg` and Serena `search_for_pattern`.
- No code tests were run because this was a Markdown-only documentation rewrite.