#!/usr/bin/env bash
set -e

PROJECT="$(cd "$(dirname "$0")/.." && pwd)"
SESSION="ai"

tmux kill-session -t "$SESSION" 2>/dev/null || true

tmux new-session -d -s "$SESSION" -c "$PROJECT" -n main
tmux send-keys -t "$SESSION:0.0" 'codex' C-m

tmux split-window -h -t "$SESSION:0.0" -c "$PROJECT"
tmux send-keys -t "$SESSION:0.1" 'gemini' C-m

tmux display-message -p -t "$SESSION:0.0" '#{pane_id}' > "$PROJECT/.codex-pane"
tmux display-message -p -t "$SESSION:0.1" '#{pane_id}' > "$PROJECT/.gemini-pane"

tmux select-pane -t "$SESSION:0.0"
tmux attach -t "$SESSION"
