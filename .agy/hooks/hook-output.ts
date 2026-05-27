// Vendor-specific hook output builders.
// Each runtime (Claude Code, Codex CLI, Cursor, agy CLI, Qwen Code)
// expects a slightly different stdout JSON shape; centralize the dialect
// translation here so individual hooks can stay vendor-agnostic.

import type { Vendor } from "./types.ts";

function defaultHookEventName(vendor: Vendor): string {
  switch (vendor) {
    case "agy":
      return "BeforeAgent";
    case "claude":
    case "codex":
    case "cursor":
    case "qwen":
      return "UserPromptSubmit";
  }
  return "UserPromptSubmit";
}

export function makePromptOutput(
  vendor: Vendor,
  additionalContext: string,
  hookEventName: string = defaultHookEventName(vendor),
): string {
  switch (vendor) {
    case "claude":
      return JSON.stringify({ additionalContext });
    case "codex":
      return JSON.stringify({
        hookSpecificOutput: {
          hookEventName,
          additionalContext,
        },
      });
    case "cursor":
      return JSON.stringify({
        additionalContext,
        additional_context: additionalContext,
        hookSpecificOutput: {
          hookEventName,
          additionalContext,
        },
      });
    case "agy":
      return JSON.stringify({
        hookSpecificOutput: {
          hookEventName,
          additionalContext,
        },
      });
    case "qwen":
      // Qwen Code fork uses hookSpecificOutput (same as Codex)
      return JSON.stringify({
        hookSpecificOutput: {
          hookEventName,
          additionalContext,
        },
      });
  }
}

export function makeBlockOutput(vendor: Vendor, reason: string): string {
  switch (vendor) {
    case "claude":
    case "codex":
    case "cursor":
    case "qwen":
      return JSON.stringify({ decision: "block", reason });
    case "agy":
      // agy AfterAgent uses "deny" to reject response and force retry
      return JSON.stringify({ decision: "deny", reason });
  }
}

export function makePreToolOutput(
  vendor: Vendor,
  updatedInput: Record<string, unknown>,
): string {
  switch (vendor) {
    case "agy":
      return JSON.stringify({
        decision: "rewrite",
        tool_input: updatedInput,
      });
    case "cursor":
      return JSON.stringify({
        updated_input: updatedInput,
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          updatedInput,
        },
      });
    case "claude":
    case "codex":
    case "qwen":
      return JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          updatedInput,
        },
      });
  }
}
