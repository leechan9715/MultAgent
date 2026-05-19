#!/usr/bin/env bash
set -euo pipefail

PANE_FILE=".gemini-pane"

if [ ! -f "$PANE_FILE" ]; then
  echo "Gemini pane id file not found."
  echo "Run this command from the Gemini tmux pane:"
  echo "tmux display-message -p '#{pane_id}' > .gemini-pane"
  exit 1
fi

PANE_ID="$(cat "$PANE_FILE")"
PROMPT="$*"

if [ -z "$PROMPT" ]; then
  echo "Usage: ./scripts/ask-gemini.sh \"your prompt\""
  exit 1
fi

tmux set-buffer -- "$PROMPT"
tmux paste-buffer -t "$PANE_ID"
tmux send-keys -t "$PANE_ID" Enter

echo "Sent to Gemini pane: $PANE_ID"