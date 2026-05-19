#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PANE_FILE="$PROJECT_ROOT/.gemini-pane"
EXPECTED_CMD="gemini"
EXPECTED_PROCESS_PATTERN="(^|[ /])${EXPECTED_CMD}([[:space:]]|$)|(^|[ /])node[[:space:]].*[ /]${EXPECTED_CMD}([[:space:]]|$)"

if [ ! -f "$PANE_FILE" ]; then
  echo "Gemini pane id file not found: $PANE_FILE"
  echo "Run this command from the Gemini tmux pane:"
  echo "tmux display-message -p '#{pane_id}' > $PANE_FILE"
  exit 1
fi

PANE_ID="$(cat "$PANE_FILE")"
PROMPT="$*"
STATE_FILE="$PROJECT_ROOT/.ask-gemini-last"
DEDUPE_SECONDS="${ASK_DEDUPE_SECONDS:-30}"

if [ -z "$PROMPT" ]; then
  echo "Usage: ./scripts/ask-gemini.sh \"your prompt\""
  exit 1
fi

PANE_PID="$(tmux display-message -p -t "$PANE_ID" '#{pane_pid}' 2>/dev/null || true)"
PANE_COMMAND="$(tmux display-message -p -t "$PANE_ID" '#{pane_current_command}' 2>/dev/null || true)"
CHILD_PROCESSES="$(pgrep -a -P "$PANE_PID" 2>/dev/null || true)"

if [ -z "$PANE_PID" ] || ! printf '%s\n' "$CHILD_PROCESSES" | grep -Eq "$EXPECTED_PROCESS_PATTERN"; then
  echo "Refusing to send prompt: target pane $PANE_ID is running '${PANE_COMMAND:-unknown}', not $EXPECTED_CMD."
  echo "Start Gemini in that pane, then refresh the pane id if needed:"
  echo "tmux display-message -p '#{pane_id}' > .gemini-pane"
  exit 1
fi

PROMPT_HASH="$(printf '%s' "$PROMPT" | sha256sum | awk '{print $1}')"
NOW="$(date +%s)"

if [ "${ASK_GEMINI_ALLOW_DUPLICATE:-0}" != "1" ] && [ -f "$STATE_FILE" ]; then
  read -r LAST_HASH LAST_TIME < "$STATE_FILE" || true
  if [ "${LAST_HASH:-}" = "$PROMPT_HASH" ] && [[ "${LAST_TIME:-}" =~ ^[0-9]+$ ]]; then
    AGE="$((NOW - LAST_TIME))"
    if [ "$AGE" -ge 0 ] && [ "$AGE" -lt "$DEDUPE_SECONDS" ]; then
      echo "Skipped duplicate Gemini prompt sent ${AGE}s ago: $PANE_ID"
      exit 0
    fi
  fi
fi

printf '%s %s\n' "$PROMPT_HASH" "$NOW" > "$STATE_FILE"

tmux set-buffer -- "$PROMPT"
tmux paste-buffer -t "$PANE_ID"
sleep 0.5
tmux send-keys -t "$PANE_ID" Enter

echo "Sent to Gemini pane: $PANE_ID"
