# AI Tool Usage Guide

이 문서는 `/home/sc/TestProject`에 구성된 Codex + Gemini 2분할 AI 작업 환경을 Ubuntu 또는 Windows(WSL)에서 바로 실행하기 위한 초보자용 가이드입니다.

## 0. Quick Start

설치와 로그인이 끝난 상태라면 아래 명령만 실행합니다.

```bash
cd ~/TestProject && ./scripts/start-ai.sh
```

실행되면 왼쪽에는 Codex, 오른쪽에는 Gemini가 열립니다.

```text
+----------------------+----------------------+
| Codex CLI            | Gemini CLI           |
| 구현/수정/실행 담당  | 분석/리뷰/기획 담당  |
+----------------------+----------------------+
```

Windows 사용자는 PowerShell이 아니라 WSL Ubuntu 터미널에서 실행합니다. 이 프로젝트의 스크립트는 `bash`와 `tmux` 기준으로 동작합니다.

## 1. 준비와 설치

### Windows 사용자는 먼저 WSL Ubuntu 준비

Windows Terminal 또는 관리자 PowerShell에서 한 번만 실행합니다.

```powershell
wsl --install -d Ubuntu
wsl --status
wsl --list --verbose
```

설치 후 Ubuntu를 열고, 이후 명령은 모두 Ubuntu 터미널에서 실행합니다.

```bash
sudo apt update
sudo apt upgrade -y
```

프로젝트는 가능하면 Windows 경로(`/mnt/c/Users/...`)가 아니라 WSL의 Linux 파일시스템에 둡니다.

```bash
cd ~
git clone <REPOSITORY_URL> TestProject
cd ~/TestProject
```

### Ubuntu/WSL 공통 설치

아래 블록은 기본 패키지, Node.js, Codex CLI, Gemini CLI, Bun까지 한 번에 준비하는 흐름입니다.

```bash
sudo apt update
sudo apt install -y tmux git curl ca-certificates build-essential

curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts

npm install -g @openai/codex
npm install -g @google/gemini-cli

curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

node --version
npm --version
tmux -V
codex --version
gemini --version
bun --version
serena --version
oma --version
```

`serena` 또는 `oma` 명령이 없다면 프로젝트 제공자에게 설치 방법을 확인합니다. 이 둘은 배포 방식이 환경마다 다를 수 있습니다.

처음 한 번은 각 CLI에서 로그인을 완료합니다.

```bash
codex
gemini
```

API key, token, password 같은 민감정보는 문서나 프롬프트에 붙여 넣지 않습니다.

## 2. 실행과 tmux 기본 조작

자동 실행은 아래 명령만 사용합니다.

```bash
cd ~/TestProject && ./scripts/start-ai.sh
```

`scripts/start-ai.sh`가 자동으로 처리하는 일:

| 순서 | 자동 처리 |
| --- | --- |
| 1 | 기존 `ai` tmux session 정리 |
| 2 | 새 `ai` session 생성 |
| 3 | 왼쪽 pane에서 `codex` 실행 |
| 4 | 오른쪽 pane에서 `gemini` 실행 |
| 5 | `.codex-pane`, `.gemini-pane`에 Pane ID 저장 |
| 6 | 완성된 tmux 화면으로 접속 |

Pane ID는 각 AI 창의 내부 주소입니다. `.codex-pane`과 `.gemini-pane`은 그 주소를 적어 둔 전화번호부 같은 파일이며, 사용자가 내용을 외우거나 직접 프롬프트에 입력할 필요는 없습니다.

tmux 기본 조작:

```text
Ctrl-b 누른 뒤 방향키   pane 이동
Ctrl-b 누른 뒤 d        tmux session 분리(detach)
tmux attach -t ai       다시 접속
tmux kill-session -t ai session 종료
exit                    현재 pane의 CLI 종료
```

수동 실행은 자동 스크립트가 실패했을 때만 사용합니다.

```bash
cd ~/TestProject
tmux new-session -s ai -c "$PWD"
codex
```

오른쪽 pane은 `Ctrl-b`를 누른 뒤 `%`를 입력해 만들고, 오른쪽 pane에서 실행합니다.

```bash
gemini
```

## 3. 역할과 위임 규칙

이 환경은 Codex와 Gemini의 역할을 분리해서 사용합니다.

| 도구 | 담당 |
| --- | --- |
| Codex | 코드 구현, 파일 수정, 리팩토링, 디버깅, 테스트/빌드 실행, Git diff 확인 |
| Gemini | 리서치, 비교/트렌드 조사, 기획 정리, 긴 문맥 분석, QA/문서/UI/UX 방향성 리뷰 |

기준은 최종 산출물입니다.

```text
코드/파일 변경이 목적이면 Codex
조사/기획/리뷰/분석이 목적이면 Gemini
리뷰 후 수정까지 원하면 Codex
넓은 QA나 방향성 검토만 원하면 Gemini
```

상대 pane으로 프롬프트를 보낼 때는 전체 내용을 큰따옴표로 감쌉니다.

```bash
# Codex pane으로 보내기
./scripts/ask-codex.sh "이 파일을 수정해줘"

# Gemini pane으로 보내기
./scripts/ask-gemini.sh "이 내용을 분석만 해줘. 파일은 수정하지 마."
```

Codex가 리서치/조사/비교/트렌드/기획/문서 검토/QA 리뷰/긴 내용 분석/아이디어/디자인 방향/시장 분석/추천 방향 요청을 받으면 먼저 Gemini 위임 여부를 묻습니다.

```text
이 작업은 Gemini에게 맡기는 게 더 적합해 보여요. Gemini CLI에 보내서 실행할까요?
```

Gemini가 코드 수정/구현/버그 수정/리팩토링/파일 수정/테스트 실행/컴포넌트 생성/에러 해결/빌드 오류/런타임 오류 요청을 받으면 먼저 Codex 위임 여부를 묻습니다.

```text
이 작업은 Codex에게 맡기는 게 더 적합해 보여요. Codex CLI에 보내서 실행할까요?
```

Gemini 리뷰 결과를 바탕으로 자동 수정 위임이 승인된 경우에는 Codex 프롬프트 첫 줄에 다음 marker가 붙습니다.

```text
AUTO_FIX_FROM_GEMINI_REVIEW
```

이 marker가 있으면 Codex는 Gemini finding에 한정해 필요한 파일 수정을 진행합니다. 민감정보 처리, destructive command, 대규모 삭제, 배포, 결제/권한 변경, 외부 서비스 설정 변경은 다시 확인합니다.

## 4. 주요 파일과 관리 규칙

| 파일 | 용도 |
| --- | --- |
| `AGENTS.md` | Codex가 따르는 프로젝트 규칙, Codex -> Gemini 위임 기준 |
| `GEMINI.md` | Gemini가 따르는 프로젝트 규칙, Gemini -> Codex 위임 기준 |
| `.agents/oma-config.yaml` | 언어, timezone, agent별 모델 기준 |
| `.codex/agents/*.toml` | Codex native agent 정의 |
| `.gemini/agents/*.md` | Gemini native agent 정의 |
| `scripts/start-ai.sh` | Codex/Gemini 2분할 tmux 자동 실행 |
| `scripts/ask-codex.sh` | Codex pane으로 프롬프트 전송 |
| `scripts/ask-gemini.sh` | Gemini pane으로 프롬프트 전송 |

`.agents/` 디렉터리는 oh-my-agent의 SSOT 영역입니다. 일반 작업 중 직접 수정하지 않습니다.

커스텀 규칙을 `AGENTS.md`나 `GEMINI.md`에 추가할 때는 반드시 `<!-- OMA:END -->` 아래에 둡니다. `<!-- OMA:START -->`부터 `<!-- OMA:END -->`까지의 관리 블록은 직접 수정하지 않습니다.

현재 운영 의도:

```text
Codex 구현 계열
- frontend, backend, debug, db, mobile, tf-infra
- openai/gpt-5.5, effort high

Gemini 분석 계열
- architecture, pm, qa, design, docs
- google/gemini-3.1-pro-preview, effort medium
```

## 5. 문제 해결과 안전 규칙

### 5.1 Windows에서 `bad interpreter` 또는 `$'\r': command not found`

Windows에서 압축 해제나 편집 과정 중 `.sh` 파일이 CRLF 줄바꿈으로 바뀐 경우입니다.

```bash
cd ~/TestProject
sudo apt install -y dos2unix
dos2unix scripts/*.sh .gemini/hooks/*.sh .codex/hooks/*.sh
chmod +x scripts/*.sh .gemini/hooks/*.sh .codex/hooks/*.sh
```

### 5.2 `Codex pane id file not found.` 또는 `Gemini pane id file not found.`

가장 쉬운 해결은 자동 실행 스크립트를 다시 실행하는 것입니다.

```bash
cd ~/TestProject && ./scripts/start-ai.sh
```

수동으로 저장해야 한다면 각 pane에서 실행합니다.

```bash
# Codex pane에서
tmux display-message -p '#{pane_id}' > .codex-pane

# Gemini pane에서
tmux display-message -p '#{pane_id}' > .gemini-pane
```

### 5.3 `tmux`, `codex`, `gemini`, `bun` command not found

먼저 Windows PowerShell이 아니라 WSL Ubuntu 터미널인지 확인합니다.

```powershell
wsl
```

Ubuntu 안에서 필요한 명령을 다시 설치하거나 PATH를 확인합니다.

```bash
sudo apt install -y tmux
npm install -g @openai/codex
npm install -g @google/gemini-cli
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

echo "$PATH"
codex --version
gemini --version
bun --version
```

안전 규칙:

```text
API key, password, token은 프롬프트에 넣지 않기
.agents/ 디렉터리는 직접 수정하지 않기
코드 수정은 Codex가 담당
리서치/기획/긴 리뷰는 Gemini가 담당
Gemini 분석 결과는 Codex가 다시 검토한 뒤 필요한 부분만 반영하기
Git 저장소가 아니면 git diff 대신 변경 파일 목록과 변경 요약을 남기기
```

공식 참고:

- OpenAI Codex CLI: https://help.openai.com/en/articles/11096431
- OpenAI Codex GitHub: https://github.com/openai/codex
- Google Gemini CLI GitHub: https://github.com/google-gemini/gemini-cli
- Gemini CLI documentation: https://google-gemini.github.io/gemini-cli/
