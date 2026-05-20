좋아. 아래는 상태바 추가 설정 + 자주 쓰는 tmux 명령어/단축키 정리본이야.

tmux 상태바 설정

~/.tmux.conf에 추가하면 돼.

# =========================

# 상태바 디자인

# =========================

# 상태바를 위쪽에 표시

set -g status-position top

# 상태바 갱신 주기

set -g status-interval 5

# 전체 상태바 색상

set -g status-style "bg=#071A2A,fg=#A4B8CC"

# 왼쪽 상태바: 세션 이름

set -g status-left-length 50
set -g status-left "#[bg=#3FFFD8,fg=#071A2A,bold] #S #[bg=#071A2A,fg=#3FFFD8] "

# 오른쪽 상태바: 날짜 + 시간

set -g status-right-length 100
set -g status-right "#[fg=#4EA8FF]#[bg=#4EA8FF,fg=#071A2A,bold] %Y-%m-%d #[bg=#3FFFD8,fg=#071A2A,bold] %H:%M "

# 현재 창 스타일

setw -g window-status-current-format "#[bg=#1F4360,fg=#FFFFFF,bold] #I:#W "

# 일반 창 스타일

setw -g window-status-format "#[fg=#A4B8CC] #I:#W "

적용:

tmux source-file ~/.tmux.conf

tmux 안에서는:

Ctrl + a → r
자주 쓰는 tmux 명령어
세션 관련
tmux

기본 tmux 실행.

tmux new -s agents

agents라는 이름으로 새 세션 만들기.

tmux ls

현재 tmux 세션 목록 보기.

tmux attach -t agents

agents 세션에 다시 접속.

tmux kill-session -t agents

agents 세션 종료.

tmux kill-server

tmux 전체 종료. 설정이 꼬였을 때 초기화용으로 자주 씀.

자주 쓰는 단축키

네 설정 기준 prefix는 Ctrl + a야.

기본
Ctrl + a → r

설정 다시 불러오기.

Ctrl + a → d

현재 tmux 세션에서 빠져나오기.
세션은 꺼지지 않고 백그라운드에 유지됨.

Ctrl + a → ?

tmux 단축키 목록 보기.

창 window 관련
Ctrl + a → c

새 window 만들기.

Ctrl + a → n

다음 window로 이동.

Ctrl + a → p

이전 window로 이동.

Ctrl + a → 숫자

해당 번호의 window로 이동.

Ctrl + a → ,

현재 window 이름 변경.

Ctrl + a → &

현재 window 닫기.

화면 분할 pane 관련
Ctrl + a → |

좌우로 화면 분할.

Ctrl + a → -

상하로 화면 분할.

Ctrl + a → h

왼쪽 pane으로 이동.

Ctrl + a → j

아래 pane으로 이동.

Ctrl + a → k

위 pane으로 이동.

Ctrl + a → l

오른쪽 pane으로 이동.

Ctrl + a → x

현재 pane 닫기.

Ctrl + a → z

현재 pane 확대/축소 토글.
한 화면만 크게 보고 싶을 때 좋음.

Codex + agy 쓸 때 예시
tmux new -s agents

tmux 세션 만들고,

Ctrl + a → |

좌우 분할.

왼쪽에는:

codex

오른쪽에는:

agy

이렇게 쓰면 됨.

나갈 때는:

Ctrl + a → d

다시 들어갈 때는:

tmux attach -t agents
아이콘 깨질 때

상태바의 이 아이콘이 네모로 보이면:

 

터미널 폰트를 Nerd Font로 바꾸면 돼.

추천 폰트:

CaskaydiaCove Nerd Font
JetBrainsMono Nerd Font
FiraCode Nerd Font

VSCode 터미널이면 settings.json에 예를 들어 이렇게:

{
"terminal.integrated.fontFamily": "CaskaydiaCove Nerd Font"
}

정리하면, 가장 많이 쓰는 건 이 정도야.

Ctrl + a → | 좌우 분할
Ctrl + a → - 상하 분할
Ctrl + a → h/j/k/l pane 이동
Ctrl + a → z pane 확대
Ctrl + a → d 세션 나가기
tmux attach -t agents 다시 접속
