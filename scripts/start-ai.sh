#!/usr/bin/env bash
set -e

PROJECT="$(cd "$(dirname "$0")/.." && pwd)"
SESSION="ai"

tmux kill-session -t "$SESSION" 2>/dev/null || true

CODEX_PANE_ID=$(tmux new-session -d -s "$SESSION" -c "$PROJECT" -n main -P -F "#{pane_id}")
tmux send-keys -t "$CODEX_PANE_ID" 'codex' C-m

GEMINI_PANE_ID=$(tmux split-window -h -t "$CODEX_PANE_ID" -c "$PROJECT" -P -F "#{pane_id}")
tmux send-keys -t "$GEMINI_PANE_ID" 'gemini' C-m

echo "$CODEX_PANE_ID" > "$PROJECT/.codex-pane"
echo "$GEMINI_PANE_ID" > "$PROJECT/.gemini-pane"

tmux select-pane -t "$CODEX_PANE_ID"
tmux attach -t "$SESSION"
