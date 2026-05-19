#!/usr/bin/env bash
set -euo pipefail

PANE_FILE=".codex-pane"

if [ ! -f "$PANE_FILE" ]; then
  echo "Codex pane id file not found."
  echo "Run this command from the Codex tmux pane:"
  echo "tmux display-message -p '#{pane_id}' > .codex-pane"
  exit 1
fi

PANE_ID="$(cat "$PANE_FILE")"
PROMPT="$*"

if [ -z "$PROMPT" ]; then
  echo "Usage: ./scripts/ask-codex.sh \"your prompt\""
  exit 1
fi

tmux set-buffer -- "$PROMPT"
tmux paste-buffer -t "$PANE_ID"
tmux send-keys -t "$PANE_ID" Enter

echo "Sent to Codex pane: $PANE_ID"
