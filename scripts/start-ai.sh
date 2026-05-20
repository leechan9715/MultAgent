#!/usr/bin/env bash
set -e

PROJECT="$(cd "$(dirname "$0")/.." && pwd)"
SESSION="ai"

tmux kill-session -t "$SESSION" 2>/dev/null || true

CODEX_PANE_ID=$(tmux new-session -d -s "$SESSION" -c "$PROJECT" -n main -P -F "#{pane_id}")
tmux send-keys -t "$CODEX_PANE_ID" 'codex' C-m

AGY_PANE_ID=$(tmux split-window -h -t "$CODEX_PANE_ID" -c "$PROJECT" -P -F "#{pane_id}")
tmux send-keys -t "$AGY_PANE_ID" 'agy' C-m

echo "$CODEX_PANE_ID" > "$PROJECT/.codex-pane"
echo "$AGY_PANE_ID" > "$PROJECT/.agy-pane"

rm -f "$PROJECT/.agy-pane"

tmux select-pane -t "$CODEX_PANE_ID"
tmux attach -t "$SESSION"