// PreToolUse/BeforeTool hook — Filter test output to show only failures
// Works with: Claude Code, Codex CLI, agy/Gemini CLI, Qwen Code

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveGitRoot } from "./fs-utils.ts";
import { makePreToolOutput } from "./hook-output.ts";
import type { Vendor } from "./types.ts";

function inferVendorFromScriptPath(): Vendor | null {
  const path = import.meta.filename;
  if (path.includes(`${join(".cursor", "hooks")}`)) return "cursor";
  if (path.includes(`${join(".qwen", "hooks")}`)) return "qwen";
  if (path.includes(`${join(".claude", "hooks")}`)) return "claude";
  if (path.includes(`${join(".gemini", "hooks")}`)) return "gemini";
  if (path.includes(`${join(".agy", "hooks")}`)) return "agy";
  if (path.includes(`${join(".codex", "hooks")}`)) return "codex";
  return null;
}

function detectVendor(input: Record<string, unknown>): Vendor {
  const event = input.hook_event_name as string | undefined;
  const byScriptPath = inferVendorFromScriptPath();
  if (byScriptPath) return byScriptPath;
  if (event === "BeforeTool" && process.env.GEMINI_PROJECT_DIR)
    return "gemini";
  if (event === "BeforeTool") return "agy";
  if (event === "PreToolUse" && "session_id" in input) return "codex";
  if (process.env.QWEN_PROJECT_DIR) return "qwen";
  return "claude";
}

function getProjectDir(vendor: Vendor, input: Record<string, unknown>): string {
  let dir: string;
  switch (vendor) {
    case "codex":
      dir = (input.cwd as string) || process.cwd();
      break;
    case "agy":
      dir = process.env.AGY_PROJECT_DIR || process.cwd();
      break;
    case "gemini":
      dir = process.env.GEMINI_PROJECT_DIR || process.cwd();
      break;
    case "qwen":
      dir = process.env.QWEN_PROJECT_DIR || process.cwd();
      break;
    default:
      dir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
      break;
  }
  return resolveGitRoot(dir);
}

function getHookDir(vendor: Vendor): string {
  switch (vendor) {
    case "codex":
      return ".codex/hooks";
    case "agy":
      return ".agy/hooks";
    case "gemini":
      return ".gemini/hooks";
    case "qwen":
      return ".qwen/hooks";
    default:
      return ".claude/hooks";
  }
}

const TEST_PATTERNS = [
  /\bvitest\b/,
  /\bjest\b/,
  /\bmocha\b/,
  /\bnpm\s+(run\s+)?test\b/,
  /\bbun\s+(run\s+)?test\b/,
  /\byarn\s+test\b/,
  /\bpnpm\s+(run\s+)?test\b/,
  /\bpytest\b/,
  /\bpython\s+-m\s+unittest\b/,
  /\bgo\s+test\b/,
  /\bcargo\s+test\b/,
  /\bflutter\s+test\b/,
  /\bdart\s+test\b/,
  /\bswift\s+test\b/,
  /\bdotnet\s+test\b/,
  /\b(gradle|gradlew|\.\/gradlew)\s+test\b/,
  /\bmvn\s+test\b/,
  /\brspec\b/,
  /\bmix\s+test\b/,
  /\bphpunit\b/,
];

const EXCLUDE_PATTERNS = [
  /\b(install|add|remove|uninstall|init)\b/,
  /\b(cat|head|tail|less|more|wc)\b.*\.(test|spec)\./,
];

interface PreToolUseInput {
  tool_name: string;
  tool_input: {
    command?: string;
    [key: string]: unknown;
  };
  hook_event_name?: string;
  session_id?: string;
  sessionId?: string;
  cwd?: string;
}
const inputFile = process.env.OMA_HOOK_INPUT_FILE;
const raw = inputFile
  ? readFileSync(inputFile, "utf-8")
  : readFileSync(0, "utf-8");
if (!raw.trim()) process.exit(0);

const input: PreToolUseInput = JSON.parse(raw);

if (input.tool_name !== "Bash" && input.tool_name !== "run_shell_command") {
  process.exit(0);
}

const command = input.tool_input?.command;
if (!command) process.exit(0);

const isTestCommand = TEST_PATTERNS.some((p) => p.test(command));
if (!isTestCommand) process.exit(0);

const isExcluded = EXCLUDE_PATTERNS.some((p) => p.test(command));
if (isExcluded) process.exit(0);

const vendor = detectVendor(input);
const projectDir = getProjectDir(vendor, input);
const filterScript = join(
  projectDir,
  getHookDir(vendor),
  "filter-test-output.sh",
);

if (!existsSync(filterScript)) process.exit(0);

const filteredCmd = `set -o pipefail; (${command}) 2>&1 | bash "${filterScript}"`;

const updatedInput: Record<string, unknown> = {
  ...input.tool_input,
  command: filteredCmd,
};

console.log(makePreToolOutput(vendor, updatedInput));
