# AI Tool Usage Guide

## 작동구조

# AI Collaboration Architecture Guide

이 문서는 이 프로젝트에 구성된 AI 협업 환경이 사용자의 질문을 어떻게 처리하고, 어떤 과정을 거쳐 최적의 모델과 에이전트를 선택하는지 설명합니다.

---

## 1. 개요: 2분할 AI 부서 구조

이 시스템은 하나의 AI가 모든 일을 하는 것이 아니라, 전문 분야가 다른 두 개의 큰 부서(CLI)가 협업하는 구조입니다.

| 부서(CLI)  | 메인 모델                           | 주요 역할                                     |
| :--------- | :---------------------------------- | :-------------------------------------------- |
| **Codex**  | OpenAI GPT 계열 (gpt-5.5)           | 코드 구현, 파일 수정, 디버깅, 테스트 실행     |
| **Gemini** | Google Gemini 계열 (gemini-3.1-pro) | 리서치, 기획, 문서 검토, QA 리뷰, 트렌드 분석 |

---

## 2. 질문 처리 3단계 흐름

사용자가 질문을 던지면 시스템은 아래의 3단계 프로세스를 거쳐 대답합니다.

### [1단계] 부서(CLI) 배정 및 위임 (Delegation Gate)

질문이 처음 도착한 창에서 담당 업무를 확인합니다.

1. **사용자 직접 전송**: 사용자가 `ask-codex.sh`나 `ask-gemini.sh`를 사용해 특정 창에 질문을 보냅니다.
2. **상호 위임 규칙**: 만약 질문의 성격이 담당 부서와 맞지 않으면(예: Gemini 창에 코딩 요청), 각 부서의 지침서(`AGENTS.md`, `GEMINI.md`)에 따라 AI가 사용자에게 다른 창으로 보낼지 묻습니다.
3. **토스(Toss)**: 사용자가 승인하면 AI는 자동으로 스크립트를 실행해 알맞은 창으로 질문을 전달합니다.

### [2단계] 키워드 자동 감지 (Hook System)

질문이 올바른 창에 도착하면, 답변을 생성하기 직전에 **Hook** 프로그램이 질문 내용을 실시간 분석합니다.

- **Trigger 감지**: `.agents/hooks/core/triggers.json`에 정의된 키워드(예: "React", "SQL", "보안")가 질문에 포함되어 있는지 확인합니다.
- **분야 판별**: 감지된 키워드를 바탕으로 현재 질문이 어떤 분야(Frontend, DB, QA 등)인지 확정합니다.

### [3단계] 전문가(Agent) 및 스킬(Skill) 장착

분야가 결정되면 **oh-my-agent (OMA)** 프레임워크가 해당 작업에 최적화된 전문가 세팅을 불러옵니다.

1. **스킬(Skill) 주입**: 해당 분야의 전문 지식 파일(`.agents/skills/*/SKILL.md`)을 AI의 컨텍스트에 즉시 주입합니다.
2. **모델 매핑**: `.agents/oma-config.yaml` 설정과 각 부서 지침서(`AGENTS.md`, `GEMINI.md`)의 스킬 매핑 표를 기준으로 해당 작업에 가장 적합한 모델 및 에이전트를 선택합니다.
   - 예: **Frontend** 구현 질문 -> `gpt-5.5` 모델의 `frontend-engineer` 에이전트 호출
   - 예: **QA** 리뷰 질문 -> `gemini-3.1-pro` 모델의 `qa-reviewer` 에이전트 호출
3. **최종 답변 생성**: 전문적인 지식과 해당 분야의 코딩 스타일 규칙이 적용된 상태로 AI가 작업을 수행합니다.

---

## 3. 핵심 아키텍처 다이어그램

```text
[사용자 질문]
      |
      V
[1단계: CLI 배정] ----> (Codex: 구현 / Gemini: 분석)
      |
      V
[2단계: Hook 감지] ----> (프롬프트 내 키워드 매칭)
      |
      V
[3단계: OMA 매핑] ----> (Skill 파일 주입 + 최적 모델/에이전트 선택)
      |
      V
[최종 결과물 출력]
```

---

## 4. 모델 및 에이전트 설정 위치

- **공통 설정**: `.agents/oma-config.yaml` (어떤 작업을 어느 모델이 할지 결정)
- **Codex 에이전트**: `.codex/agents/*.toml` (GPT 기반 전문가 정의)
- **Gemini 에이전트**: `.gemini/agents/*.md` (Gemini 기반 전문가 정의)
- **공통 규칙**: `AGENTS.md`, `GEMINI.md` (부서 간 협업 및 위임 규칙)

이 아키텍처 덕분에 사용자는 매번 모델을 지정할 필요 없이, 평소처럼 질문하는 것만으로도 뒤에서 가장 적합한 전문가 AI가 배정되어 응답하게 됩니다.

이 문서는 `/home/sc/TestProject`에 구성된 Codex + Gemini 2분할 AI 작업 환경을 처음 받은 사람이 Ubuntu 또는 Windows(WSL)에서 바로 실행하고 이해할 수 있도록 정리한 가이드입니다.

## 0. Quick Start / Fast Track: 설치가 끝난 뒤 바로 실행하기

이미 필요한 도구 설치와 로그인이 끝난 상태라면, 처음에는 아래 명령만 실행하면 됩니다.

```bash
cd ~/TestProject
./scripts/start-ai.sh
```

이 명령을 실행하면 왼쪽에는 Codex, 오른쪽에는 Gemini가 자동으로 열립니다. 처음 사용하는 사람은 먼저 이 방식으로 실행하고, 문제가 생겼을 때만 아래의 자세한 설치/수동 실행 설명을 보면 됩니다.

Windows 사용자는 PowerShell에서 이 명령을 실행하는 것이 아니라, WSL Ubuntu 터미널 안에서 실행합니다. 이 프로젝트의 자동 실행 스크립트는 `bash`와 `tmux`를 사용하므로 Windows native shell 기준이 아니라 Linux shell 기준으로 동작합니다.

## 1. 전체 구조

이 프로젝트는 AI 도구를 두 역할로 나누어 사용합니다.

```text
Codex
- 코드 구현
- 파일 수정
- 리팩토링
- 디버깅
- 테스트/빌드 실행
- Git diff 확인

Gemini
- 리서치
- 비교/트렌드 조사
- 기획 정리
- 긴 문맥 분석
- QA/문서/UI/UX 방향성 리뷰
```

기본 운영 방식은 `tmux` 화면을 좌우 2분할로 띄우는 것입니다.

```text
+----------------------+----------------------+
| Codex CLI            | Gemini CLI           |
| 구현/수정/실행 담당  | 분석/리뷰/기획 담당  |
+----------------------+----------------------+
```

일반적으로 사용자는 Codex 쪽을 메인 작업 창으로 쓰고, 리서치/기획/리뷰가 필요할 때 Gemini로 넘기는 흐름을 사용합니다.

초보자 관점에서는 이렇게 이해하면 됩니다.

```text
Codex 창 = 실제로 코드를 고치고 명령을 실행하는 작업자
Gemini 창 = 조사하고 검토하고 방향을 정리하는 리뷰어
.codex-pane / .gemini-pane = 두 창의 내부 주소를 적어 둔 파일
ask-codex.sh / ask-gemini.sh = 그 주소로 메시지를 보내는 스크립트
```

`.codex-pane`, `.gemini-pane` 같은 파일은 사용자가 직접 작성하는 프롬프트가 아닙니다. 두 AI 창의 전화번호를 적어 둔 주소록에 가깝습니다. `scripts/start-ai.sh`가 이 번호를 자동으로 찾아 파일에 적어 두기 때문에, 나중에 `ask-codex.sh`나 `ask-gemini.sh`가 어느 창으로 메시지를 보내야 하는지 스스로 찾을 수 있습니다.

## 2. 주요 파일

```text
AGENTS.md
- Codex가 따라야 하는 프로젝트 규칙
- Codex -> Gemini 위임 기준 포함

GEMINI.md
- Gemini가 따라야 하는 프로젝트 규칙
- Gemini -> Codex 위임 기준 포함

.agents/oma-config.yaml
- 언어, timezone, agent별 모델 기준 설정

.codex/agents/*.toml
- Codex native agent 정의
- 구현 계열 agent는 gpt-5.5 high 기준

.gemini/agents/*.md
- Gemini native agent 정의
- 분석/리뷰 계열 agent는 gemini-3.1-pro-preview 기준

scripts/start-ai.sh
- tmux 2분할 세션을 자동으로 시작

scripts/ask-codex.sh
- 현재 shell에서 Codex pane으로 프롬프트 전송

scripts/ask-gemini.sh
- 현재 shell에서 Gemini pane으로 프롬프트 전송
```

주의: `.agents/` 디렉터리는 oh-my-agent의 SSOT 영역입니다. 일반 작업 중 직접 수정하지 않습니다. 설정 변경은 보통 `.agents/oma-config.yaml`, `AGENTS.md`, `GEMINI.md`, 또는 생성된 agent 파일 쪽에서 의도를 확인한 뒤 진행합니다.

커스텀 규칙을 `AGENTS.md`나 `GEMINI.md`에 추가해야 한다면 반드시 `<!-- OMA:END -->` 태그 아래에 둡니다. `<!-- OMA:START -->`부터 `<!-- OMA:END -->`까지의 관리 블록 안에는 직접 작성한 규칙을 넣지 않습니다.

## 3. Ubuntu / Windows(WSL) 준비물

Windows에서는 WSL2 위의 Ubuntu를 기준으로 사용합니다. PowerShell, CMD, Git Bash에서 직접 `scripts/start-ai.sh`를 실행하는 방식은 권장하지 않습니다. `tmux`, `.sh` 스크립트, Linux 경로 처리를 그대로 쓰기 위해 WSL Ubuntu 안에서 설치와 실행을 진행합니다.

### 3.0 Windows에서 WSL Ubuntu 준비

Windows Terminal 또는 관리자 PowerShell에서 WSL을 설치합니다.

```powershell
wsl --install -d Ubuntu
```

설치가 끝나면 Windows를 재부팅하고, 시작 메뉴에서 Ubuntu를 실행합니다. 처음 실행할 때 Linux 사용자 이름과 비밀번호를 만들면 됩니다.

WSL 상태를 확인합니다.

```powershell
wsl --status
wsl --list --verbose
```

Ubuntu 터미널이 열리면 이후 명령은 모두 Ubuntu 안에서 실행합니다.

```bash
sudo apt update
sudo apt upgrade -y
```

중요한 기준은 다음과 같습니다.

```text
PowerShell/CMD = WSL 설치와 Ubuntu 실행까지만 사용
Ubuntu 터미널 = tmux, Codex, Gemini, npm, bun, serena, oma 설치와 실행에 사용
```

프로젝트는 가능하면 WSL의 Linux 파일시스템 안에 둡니다.

```bash
cd ~
git clone <REPOSITORY_URL> TestProject
cd ~/TestProject
```

`/mnt/c/Users/...` 아래에 프로젝트를 두면 Windows 파일시스템 경유로 인해 파일 권한, 실행 속도, line ending 문제가 생길 수 있습니다. 특별한 이유가 없다면 `~/TestProject`를 사용합니다.

### 3.1 기본 패키지

```bash
sudo apt update
sudo apt install -y tmux git curl ca-certificates build-essential
```

Windows 사용자는 이 명령을 WSL Ubuntu 안에서 실행합니다. Windows에 설치한 Git, Node.js, npm은 WSL Ubuntu 안의 명령과 별개입니다. 이 가이드를 따를 때는 WSL 안에도 필요한 도구를 설치해야 합니다.

### 3.2 Node.js와 npm

Codex CLI와 Gemini CLI는 npm 기반 설치가 가장 단순합니다. Node.js는 `nvm`으로 설치하는 것을 권장합니다.

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
node --version
npm --version
```

버전은 시간이 지나면 달라질 수 있습니다. 설치 시에는 공식 패키지 이름을 확인하고 진행합니다.

### 3.3 Codex CLI 설치

공식 npm 패키지 이름은 `@openai/codex`입니다.

주의: 설치 전에는 OpenAI 공식 문서나 공식 저장소에서 최신 공식 패키지 명칭을 반드시 확인합니다. CLI 패키지 이름은 시간이 지나며 바뀔 수 있습니다.

```bash
npm install -g @openai/codex
codex --version
```

처음 실행 시 로그인 또는 인증 절차가 필요할 수 있습니다.

```bash
codex
```

로그인 화면이나 인증 안내가 나오면 CLI 안내에 따라 완료합니다.

### 3.4 Gemini CLI 설치

공식 npm 패키지 이름은 `@google/gemini-cli`입니다.

주의: 설치 전에는 Google 공식 문서나 공식 저장소에서 최신 공식 패키지 명칭을 반드시 확인합니다. CLI 패키지 이름은 시간이 지나며 바뀔 수 있습니다.

```bash
npm install -g @google/gemini-cli
gemini --version
```

처음 실행 시 Google 계정 로그인 또는 API key 설정이 필요할 수 있습니다.

```bash
gemini
```

인증 정보, API key, token, password는 절대 문서나 프롬프트에 붙여 넣지 않습니다.

### 3.5 Bun 설치

이 프로젝트의 Gemini hook 설정은 `bun`으로 TypeScript hook 파일을 실행합니다.

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
bun --version
```

### 3.6 Serena와 OMA

이 프로젝트는 Serena MCP와 oh-my-agent 구성을 사용합니다.

```bash
serena --version
oma --version
```

두 명령이 없다면 프로젝트 제공자에게 설치 방법을 확인하거나, 사용 중인 oh-my-agent/Serena 배포 방식에 맞춰 설치합니다. 일반적인 사용만 할 때는 `scripts/start-ai.sh`로 Codex/Gemini를 띄우는 것이 핵심이고, OMA는 agent/workflow 설정을 생성하거나 갱신할 때 더 중요합니다.

### 3.7 Windows에서 작업 폴더 열기

WSL Ubuntu에서 현재 프로젝트를 Windows 탐색기로 열고 싶다면 다음을 사용할 수 있습니다.

```bash
cd ~/TestProject
explorer.exe .
```

VS Code를 사용한다면 Remote - WSL 확장을 설치한 뒤 WSL 터미널에서 여는 방식을 권장합니다.

```bash
cd ~/TestProject
code .
```

단, 터미널 명령 실행은 계속 WSL Ubuntu 터미널에서 진행합니다.

## 4. 프로젝트 받기

예시는 홈 디렉터리에 프로젝트를 둔다고 가정합니다.

```bash
cd ~
git clone <REPOSITORY_URL> TestProject
cd ~/TestProject
```

압축 파일로 받은 경우에도 최종 경로가 `~/TestProject`가 되도록 맞추면 예시 명령을 그대로 사용할 수 있습니다.

```bash
cd ~/TestProject
chmod +x scripts/*.sh
```

Windows에서 압축을 풀어 가져온 경우 shell script line ending이 CRLF로 바뀌어 실행 오류가 날 수 있습니다. `bad interpreter` 또는 `$'\r': command not found`가 보이면 WSL Ubuntu에서 다음을 실행합니다.

```bash
sudo apt install -y dos2unix
dos2unix scripts/*.sh .gemini/hooks/*.sh .codex/hooks/*.sh
chmod +x scripts/*.sh .gemini/hooks/*.sh .codex/hooks/*.sh
```

중요: `scripts/start-ai.sh`는 실행 위치와 관계없이 스크립트 파일 기준으로 프로젝트 루트를 자동 감지합니다.

```bash
PROJECT="$(cd "$(dirname "$0")/.." && pwd)"
```

프로젝트를 다른 위치에 두더라도 `scripts/start-ai.sh` 파일이 프로젝트의 `scripts/` 디렉터리 안에 있으면 별도 경로 수정 없이 동작합니다.

## 5. 자동 실행: tmux 2분할 시작

처음 사용하는 사람은 이 섹션만 따라 하면 됩니다. 사용자가 직접 입력해야 하는 명령은 아래 두 줄뿐입니다.

```bash
cd ~/TestProject
./scripts/start-ai.sh
```

위 명령을 실행하면 `scripts/start-ai.sh`가 나머지 준비를 자동으로 처리합니다. 아래 내용은 사용자가 직접 입력하는 단계가 아니라, 스크립트가 내부에서 알아서 처리하는 일입니다. 사용자는 아무것도 더 입력하지 말고 Codex/Gemini 화면이 뜰 때까지 기다리면 됩니다.

| 구분 | 스크립트가 자동으로 하는 일                                                                            | 사용자가 직접 입력해야 하나요? |
| ---- | ------------------------------------------------------------------------------------------------------ | ------------------------------ |
| 1    | 스크립트가 기존 `ai` tmux session이 있으면 정리함                                                      | 아니요                         |
| 2    | 스크립트가 새 `ai` session을 만듦                                                                      | 아니요                         |
| 3    | 스크립트가 왼쪽 창에서 `codex`를 실행함                                                                | 아니요                         |
| 4    | 스크립트가 오른쪽 창에서 `gemini`를 실행함                                                             | 아니요                         |
| 5    | 스크립트가 두 창이 서로 메시지를 주고받을 수 있도록 Codex 창의 내부 주소를 `.codex-pane`에 자동 기록함 | 아니요                         |
| 6    | 스크립트가 Gemini 창의 내부 주소를 `.gemini-pane`에 자동 기록함                                        | 아니요                         |
| 7    | 스크립트가 완성된 tmux 화면으로 들어감                                                                 | 아니요                         |

여기서 `.codex-pane`과 `.gemini-pane`은 두 AI 창의 전화번호부 같은 파일입니다. 편지를 보낼 때 주소를 적어 두면 매번 주소를 다시 찾지 않아도 되는 것처럼, 이 파일들이 있으면 `ask-codex.sh`나 `ask-gemini.sh`가 자동으로 올바른 창을 찾아 메시지를 보낼 수 있습니다. 사용자가 이 파일 내용을 외우거나 Codex/Gemini 프롬프트에 입력할 필요는 없습니다.

tmux 안에서 기본 조작은 다음과 같습니다.

```text
Ctrl-b + 방향키  pane 이동
Ctrl-b + d       tmux session 분리(detach)
tmux attach -t ai 다시 접속
exit             현재 pane의 CLI 종료
```

초보자 기준으로 `Ctrl-b + 방향키`는 동시에 계속 누르는 뜻이 아닙니다. `Ctrl-b`를 누른 뒤 손을 떼고, 그 다음 원하는 방향키를 입력하면 pane이 이동합니다.

## 6. 수동 실행 [상급자용 / 웬만하면 사용 금지]

이 섹션은 상급자용입니다. 처음 사용하는 사람은 읽지 말고 바로 섹션 7로 넘어가도 됩니다. 자동 실행이 실패했거나 tmux 구성을 직접 제어해야 하는 특수한 상황에서만 참고하세요.

자동 스크립트를 쓰지 않고 직접 만들려면 다음 순서로 실행합니다.

```bash
cd ~/TestProject
tmux new-session -s ai -c "$PWD"
```

첫 pane에서 Codex를 실행합니다.

```bash
codex
```

tmux에서 오른쪽 pane을 만듭니다.

```text
Ctrl-b %
```

오른쪽 pane에서 Gemini를 실행합니다.

```bash
gemini
```

각 pane id를 저장합니다. 이 단계는 자동 실행에서는 `scripts/start-ai.sh`가 대신 처리합니다. 수동 실행을 선택한 경우에만 아래 명령을 직접 입력합니다.

Codex pane에서:

```bash
tmux display-message -p '#{pane_id}' > .codex-pane
```

Gemini pane에서:

```bash
tmux display-message -p '#{pane_id}' > .gemini-pane
```

이 파일들이 있어야 `scripts/ask-codex.sh`, `scripts/ask-gemini.sh`가 상대 pane으로 메시지를 보낼 수 있습니다. 자동 실행을 사용했다면 이미 만들어져 있으므로 별도로 입력하지 않아도 됩니다.

## 7. pane 간 메시지 보내기

중요: `scripts/ask-codex.sh`와 `scripts/ask-gemini.sh`에 프롬프트를 보낼 때는 반드시 프롬프트 전체를 큰따옴표(`"`)로 감쌉니다. 따옴표 없이 입력하면 쉘 특수문자, 공백, 괄호, 세미콜론, 변수 표기 때문에 프롬프트가 깨지거나 의도치 않은 명령처럼 해석될 수 있습니다.

Codex pane으로 메시지를 보내려면:

```bash
./scripts/ask-codex.sh "이 파일을 생성해줘"
```

Gemini pane으로 메시지를 보내려면:

```bash
./scripts/ask-gemini.sh "이 내용을 분석만 해줘. 파일은 수정하지 마."
```

스크립트 내부 동작은 단순합니다.

1. `.codex-pane` 또는 `.gemini-pane`에서 pane id를 읽습니다.
2. 프롬프트를 tmux buffer에 넣습니다.
3. 해당 pane에 붙여넣습니다.
4. 안정적인 실행을 위해 0.5초 대기 후, 자동으로 Enter를 전송하여 작업을 즉시 시작합니다. (터미널 환경에 따라 더블 엔터가 적용될 수 있습니다.)

## 8. 실제 사용 흐름

### 8.1 코드 구현 요청

사용자가 다음처럼 말합니다.

```text
로그인 API 구현해줘.
```

처리 흐름:

```text
Codex가 코드 구조 확인
-> 필요한 파일 수정
-> 테스트 또는 빌드 실행
-> 변경 파일과 확인 결과 요약
```

이 경우 Gemini에게 넘기지 않습니다. 구현/수정/테스트는 Codex 담당입니다.

### 8.2 리서치 요청

사용자가 다음처럼 말합니다.

```text
요즘 프론트엔드 포트폴리오 트렌드 조사해줘.
```

처리 흐름:

```text
Codex가 Gemini 위임 여부 질문
-> 사용자가 승인
-> Codex가 scripts/ask-gemini.sh로 Gemini pane에 전달
-> Gemini가 분석 결과 작성
-> 필요한 파일 생성/수정은 Codex가 담당
```

### 8.3 리뷰 요청

요청 성격에 따라 나뉩니다.

```text
방금 수정한 diff 리뷰해줘.
```

이 경우 Codex가 우선 봅니다. 수정으로 이어질 가능성이 높기 때문입니다.

```text
전체 프로젝트를 보안/접근성/성능 관점으로 QA 리뷰해줘.
```

이 경우 Gemini에게 위임할지 먼저 물어보는 것이 자연스럽습니다.

```text
리뷰하고 문제 있으면 고쳐줘.
```

최종 산출물이 파일 수정이므로 Codex가 담당합니다.

## 9. 위임 규칙

### 9.1 Codex에서 Gemini로 넘기는 경우

Codex는 아래 성격의 요청을 받으면 먼저 사용자에게 묻습니다.

```text
이 작업은 Gemini에게 맡기는 게 더 적합해 보여요. Gemini CLI에 보내서 실행할까요?
```

대상 작업:

```text
리서치
조사
비교
트렌드
기획
문서 검토
QA 리뷰
긴 내용 분석
아이디어
디자인 방향
시장 분석
추천 방향
```

사용자가 `yes`, `y`, `응`, `그래`, `보내줘`, `실행해`, `좋아`, `ㅇㅇ`처럼 승인하면 Gemini로 보냅니다.

### 9.2 Gemini에서 Codex로 넘기는 경우

Gemini는 아래 성격의 요청을 받으면 먼저 사용자에게 묻습니다.

```text
이 작업은 Codex에게 맡기는 게 더 적합해 보여요. Codex CLI에 보내서 실행할까요?
```

대상 작업:

```text
코드 수정
구현
버그 수정
리팩토링
파일 수정
테스트 실행
컴포넌트 생성
에러 해결
빌드 오류
런타임 오류
CSS/React/Vue/API 연동 수정
```

사용자가 승인하면 Codex로 보냅니다.

예외적으로, 사용자가 이미 "Gemini 리뷰 결과를 바탕으로 수정까지 자동 진행"하라고 말한 경우에는 Gemini가 다시 묻지 않고 Codex로 바로 넘길 수 있습니다. 이때 Gemini는 Codex 프롬프트 첫 줄에 다음 marker를 넣습니다.

```text
AUTO_FIX_FROM_GEMINI_REVIEW
```

이 marker는 "Gemini가 먼저 검토했고, 사용자가 리뷰 결과 기반 수정 자동 위임을 허용한 요청"이라는 표시입니다. 초보자는 이 marker를 직접 입력할 필요가 거의 없습니다. Gemini가 Codex로 자동 위임할 때 붙이는 내부 표식이며, 화면에 보이면 "AI가 Gemini 검토 결과를 바탕으로 Codex에게 안전한 수정 요청을 넘기는 중이구나"라고 이해하면 됩니다.

Codex는 이 marker가 있는 요청을 받으면 사용자가 이미 승인한 자동 수정 위임으로 보고 바로 실행합니다. 단, 민감정보 처리, destructive command, 대규모 삭제, 배포, 결제/권한 변경, 외부 서비스 설정 변경은 자동 실행하지 않고 다시 확인해야 합니다.

### 9.3 복합 요청 기준

분석과 수정이 섞인 요청은 최종 산출물 기준으로 판단합니다.

```text
최종 산출물이 코드/파일 변경이면 Codex
최종 산출물이 리서치/기획/문서 검토면 Gemini
리뷰 + 수정이면 Codex
넓은 QA/방향성 리뷰만 필요하면 Gemini
```

## 10. 모델 기준

기준 파일은 `.agents/oma-config.yaml`입니다.

현재 운영 의도는 다음과 같습니다.

```text
Codex 구현 계열
- frontend
- backend
- debug
- db
- mobile
- tf-infra
=> openai/gpt-5.5, effort high

Gemini 분석 계열
- architecture
- pm
- qa
- design
- docs
=> google/gemini-3.1-pro-preview, effort medium

retrieval
=> google/gemini-3.1-flash-lite
```

실제 native agent 파일에서는 provider prefix를 제거한 모델명이 들어갑니다.

```text
openai/gpt-5.5 -> gpt-5.5
google/gemini-3.1-pro-preview -> gemini-3.1-pro-preview
```

## 11. 추천 운영 방식

권장:

```text
Codex + Gemini 2분할 유지
Codex를 메인 구현 창으로 사용
Gemini를 리서치/리뷰/기획 보조 창으로 사용
```

비권장:

```text
GPT-5.5용 별도 CLI pane을 하나 더 띄우기
```

이유:

```text
Codex가 이미 GPT-5.5 구현 agent 역할을 맡음
pane이 늘어나면 맥락이 분산됨
위임 규칙이 복잡해짐
tmux 화면 가독성이 떨어짐
```

## 12. 자주 쓰는 명령

```bash
# AI 2분할 시작
cd ~/TestProject
./scripts/start-ai.sh

# tmux session 다시 붙기
tmux attach -t ai

# tmux session 종료
tmux kill-session -t ai

# Codex pane으로 프롬프트 보내기
./scripts/ask-codex.sh "작업 내용"

# Gemini pane으로 프롬프트 보내기
./scripts/ask-gemini.sh "분석 요청"

# pane id 다시 저장
tmux display-message -p '#{pane_id}' > .codex-pane
tmux display-message -p '#{pane_id}' > .gemini-pane
```

## 13. 문제 해결

### 13.1 `Codex pane id file not found.`

원인:

```text
.codex-pane 파일이 없거나 현재 pane id가 저장되지 않음
```

해결:

Codex pane에서 실행합니다.

```bash
tmux display-message -p '#{pane_id}' > .codex-pane
```

또는 자동 실행 스크립트를 다시 실행합니다.

```bash
./scripts/start-ai.sh
```

### 13.2 `Gemini pane id file not found.`

Gemini pane에서 실행합니다.

```bash
tmux display-message -p '#{pane_id}' > .gemini-pane
```

또는 자동 실행 스크립트를 다시 실행합니다.

```bash
./scripts/start-ai.sh
```

### 13.3 `tmux: command not found`

```bash
sudo apt update
sudo apt install -y tmux
```

Windows에서 이 오류가 난다면 먼저 지금 위치가 WSL Ubuntu 터미널인지 확인합니다. PowerShell에서는 `tmux`가 기본 제공되지 않습니다.

```powershell
wsl
```

그 다음 Ubuntu 안에서 다시 실행합니다.

```bash
cd ~/TestProject
./scripts/start-ai.sh
```

### 13.4 `codex: command not found`

```bash
npm install -g @openai/codex
codex --version
```

설치 후에도 안 되면 npm global bin 경로가 `PATH`에 있는지 확인합니다.

```bash
npm bin -g
echo "$PATH"
```

### 13.5 `gemini: command not found`

```bash
npm install -g @google/gemini-cli
gemini --version
```

### 13.6 hook 실행 중 `bun` 오류

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
bun --version
```

### 13.7 Windows에서 `bad interpreter` 또는 `$'\r': command not found`

Windows에서 압축 해제 또는 편집 과정 중 `.sh` 파일이 CRLF line ending으로 바뀐 경우입니다. WSL Ubuntu에서 LF로 변환합니다.

```bash
sudo apt install -y dos2unix
dos2unix scripts/*.sh .gemini/hooks/*.sh .codex/hooks/*.sh
chmod +x scripts/*.sh .gemini/hooks/*.sh .codex/hooks/*.sh
```

### 13.8 Windows에서 `Permission denied`

스크립트 실행 권한이 빠진 경우입니다.

```bash
cd ~/TestProject
chmod +x scripts/*.sh .gemini/hooks/*.sh .codex/hooks/*.sh
```

프로젝트가 `/mnt/c/Users/...` 아래에 있으면 권한 처리나 실행 속도 문제가 겹칠 수 있으므로 가능하면 `~/TestProject`로 옮겨 실행합니다.

### 13.9 Serena 또는 Terraform 관련 경고

Serena MCP가 프로젝트 분석 중 언어 서버를 띄우려 할 때, Terraform이 없으면 Terraform 관련 경고가 나올 수 있습니다.

Terraform 파일을 실제로 분석하거나 수정할 일이 있다면 Terraform CLI를 설치합니다.

```bash
terraform version
```

Terraform 작업이 아니라면 일반 Codex/Gemini 2분할 사용 자체에는 큰 문제가 아닐 수 있습니다.

## 14. 안전 규칙

```text
API key, password, token은 프롬프트에 넣지 않기
.agents/ 디렉터리는 직접 수정하지 않기
코드 수정은 Codex가 담당
리서치/기획/긴 리뷰는 Gemini가 담당
Gemini 분석 결과를 무조건 적용하지 말고 Codex가 다시 검토하기
Git 저장소가 아니면 git diff 대신 변경 파일 목록과 변경 요약을 남기기
```

## 15. 공식 참고 링크

- OpenAI Codex CLI: https://help.openai.com/en/articles/11096431
- OpenAI Codex GitHub: https://github.com/openai/codex
- Google Gemini CLI GitHub: https://github.com/google-gemini/gemini-cli
- Gemini CLI documentation: https://google-gemini.github.io/gemini-cli/
