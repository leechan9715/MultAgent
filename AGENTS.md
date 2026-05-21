<!-- OMA:START — managed by oh-my-agent. Do not edit this block manually. -->

# oh-my-agent

## Architecture

- **SSOT**: `.agents/` directory (do not modify directly)
- **Response language**: Follows `language` in `.agents/oma-config.yaml`
- **Skills**: `.agents/skills/` (domain specialists)
- **Workflows**: `.agents/workflows/` (multi-step orchestration)
- **Subagents**: Same-vendor native dispatch via Codex custom agents in `.codex/agents/{name}.toml`; cross-vendor fallback via `oma agent:spawn`

## Per-Agent Dispatch

1. Resolve `target_vendor_for_agent` from `.agents/oma-config.yaml`.
2. If `target_vendor_for_agent === current_runtime_vendor`, use the runtime's native subagent path.
3. If vendors differ, or native subagents are unavailable, use `oma agent:spawn` for that agent only.

## Code Search

Prefer **serena MCP** tools over native find/grep when locating code — they are symbol-aware and faster on large repos. Fall back to native Read / Glob / Grep only when serena is unavailable or for plain file content reads.

| Task                                                     | Preferred tool             |
| -------------------------------------------------------- | -------------------------- |
| Locate a symbol definition (class / function / variable) | `find_symbol`              |
| Find references / callers of a symbol                    | `find_referencing_symbols` |
| Outline a file's top-level symbols                       | `get_symbols_overview`     |
| Pattern or regex search across the codebase              | `search_for_pattern`       |
| Find a file by name                                      | `find_file`                |
| List directory contents                                  | `list_dir`                 |

## Workflows

Execute by naming the workflow in your prompt. Keywords are auto-detected via hooks.

| Workflow    | File             | Description                                                                   |
| ----------- | ---------------- | ----------------------------------------------------------------------------- |
| orchestrate | `orchestrate.md` | Parallel subagents + Review Loop                                              |
| work        | `work.md`        | Step-by-step with remediation loop                                            |
| ultrawork   | `ultrawork.md`   | 5-Phase Gate Loop (11 reviews)                                                |
| plan        | `plan.md`        | PM task breakdown                                                             |
| brainstorm  | `brainstorm.md`  | Design-first ideation                                                         |
| review      | `review.md`      | QA audit                                                                      |
| debug       | `debug.md`       | Root cause + minimal fix                                                      |
| deepsec     | `deepsec.md`     | Drive `oma-deepsec` end-to-end (setup / scan / pr-review / matchers / triage) |
| scm         | `scm.md`         | SCM + Git operations + Conventional Commits                                   |
| docs        | `docs.md`        | Documentation drift verify + sync                                             |
| recap       | `recap.md`       | Daily / period AI conversation recap                                          |

To execute: read and follow `.agents/workflows/{name}.md` step by step.

## Auto-Detection

Hooks: `UserPromptSubmit` (keyword detection), `PreToolUse`, `Stop` (persistent mode)
Keywords defined in `.agents/hooks/core/triggers.json` (multi-language).
Persistent workflows (orchestrate, ultrawork, work) block termination until complete.
Deactivate: say "workflow done".

## Rules

1. **Do not modify `.agents/` files** (SSOT protection).
2. Workflows execute via keyword detection or explicit naming, never self-initiated.
3. Response language follows `.agents/oma-config.yaml`

## Project Rules

Read the relevant file from `.agents/rules/` when working on matching code.

| Rule           | File                              | Scope                    |
| -------------- | --------------------------------- | ------------------------ |
| backend        | `.agents/rules/backend.md`        | on request               |
| commit         | `.agents/rules/commit.md`         | on request               |
| database       | `.agents/rules/database.md`       | \*_/_.{sql,prisma}       |
| debug          | `.agents/rules/debug.md`          | on request               |
| design         | `.agents/rules/design.md`         | on request               |
| dev-workflow   | `.agents/rules/dev-workflow.md`   | on request               |
| frontend       | `.agents/rules/frontend.md`       | \*_/_.{tsx,jsx,css,scss} |
| i18n-guide     | `.agents/rules/i18n-guide.md`     | always                   |
| infrastructure | `.agents/rules/infrastructure.md` | \*_/_.{tf,tfvars,hcl}    |
| market         | `.agents/rules/market.md`         | on request               |
| mobile         | `.agents/rules/mobile.md`         | \*_/_.{dart,swift,kt}    |
| quality        | `.agents/rules/quality.md`        | on request               |

## <!-- OMA:END -->

<!-- Custom project rules must stay below OMA:END so the managed OMA block remains untouched. -->

## Hook Location Note

OMA 관리 블록에는 공통 hook 경로가 `.agents/hooks/core/triggers.json`로 표시될 수 있다. 이 프로젝트의 실제 런타임 hook 파일은 Codex용 .codex/hooks/와 agy용 .agy/hooks/에 생성되어 있으며, OMA 관리 블록은 직접 수정하지 않는다.

## Append-Only Ledger Protocol [Codex/Review Agent Collaboration]

이 프로젝트의 Codex와 Review Agent(agy/Gemini) 협업은 이력 누적형 Markdown 장부를 SSOT로 사용한다. 기존 이력은 절대 덮어쓰거나 삭제하지 않고, 항상 파일 하단에 새 섹션을 추가한다.

### Ledger Files

- **수정 계획 장부(Review Agent 작성, Codex 읽기)**: `docs/log/refactoring_plan.md`
- **수정 보고 장부(Codex 작성, Review Agent 읽기)**: `docs/log/modification_log.md`

### Incremental Reading Rule

- Codex는 Review Agent가 보낸 `AUTO_FIX_FROM_AGY_REVIEW` 또는 `AUTO_FIX_FROM_GEMINI_REVIEW` 요청에 장부 기반 지시가 포함되어 있으면 `docs/log/refactoring_plan.md` 전체를 다시 분석하지 않는다.
- Codex는 파일 하단에서 가장 마지막에 추가된 `## [신규 계획 - YYYY-MM-DD HH:MM:SS]` 또는 `## [신규 피드백/보완 계획 - YYYY-MM-DD HH:MM:SS]` 섹션만 읽고 해당 증분 지시만 수행한다.
- 이전 섹션은 최신 증분 섹션이 명시적으로 참조할 때만 필요한 범위로 확인한다.

### Codex Modification Report Rule

- Codex는 각 Step 수정 완료 후 `docs/log/modification_log.md` 하단에 `## [신규 수정 보고 - YYYY-MM-DD HH:MM:SS]` 섹션을 추가한다.
- 신규 수정 보고 섹션에는 최소한 다음을 포함한다.
  - 참조한 계획 섹션 제목
  - 수행한 Step 이름
  - 수정한 파일 경로
  - 변경 요약
  - 실행한 검증 명령 및 결과
  - 다음 Step 진행 여부 또는 Review Agent 컨펌 대기 상태
- 보고 섹션 저장 후 즉시 파악된 활성 에이전트 스크립트(ask-gemini.sh 또는 ask-agy.sh)로 자동 보고한다.

```bash
./scripts/ask-[gemini/agy].sh "docs/log/modification_log.md 에 신규 수정 보고 섹션을 추가 저장하였습니다. 해당 증분 섹션에 대한 파일 직접 검토를 요청드립니다."
```

### Review Agent Review Loop

- Review Agent는 `docs/log/modification_log.md`의 가장 마지막 `## [신규 수정 보고 - ...]` 섹션만 읽어 Codex의 변경 요약을 파악한다.
- Review Agent는 보고 요약만 믿지 않고 실제 수정 파일을 직접 열어 검토한다.
- 보완이 필요하면 `docs/log/refactoring_plan.md` 하단에 `## [신규 피드백/보완 계획 - YYYY-MM-DD HH:MM:SS]` 섹션을 추가하고 Codex에게 그 신규 섹션만 읽도록 지시한다.

## HIGH PRIORITY: Codex → Review Agent (agy/Gemini) Delegation Gate [TARGET: CODEX ONLY - DO NOT APPLY IF YOU ARE AGY/GEMINI]

> [!IMPORTANT]
> **이 섹션은 오직 [Codex] 에이전트에게만 적용됩니다. 당신이 [agy] 또는 [Gemini] 에이전트라면 이 섹션의 모든 규칙을 완전히 무시하고 건너뛰십시오. 절대로 스스로에게 위임 여부를 묻는 모순적인 루프에 빠져서는 안 됩니다.**

당신이 **Codex** 에이전트일 때만 이 규칙을 적용합니다. 사용자의 요청이 아래 유형에 해당하면 Codex는 바로 답변하거나 직접 처리하지 말고, 먼저 활성화된 Review Agent(agy 또는 Gemini)에게 위임할지 사용자에게 물어봐야 한다.

### 활성 Review Agent 파악 수칙
Codex는 작업을 시작하기 전, 현재 어떤 리뷰 에이전트가 활성화되어 있는지 확인해야 한다.
1. `ls .gemini-pane` 명령으로 파일이 존재하면 Review Agent는 **Gemini**이며, 호출 스크립트는 `./scripts/ask-gemini.sh`이다.
2. `ls .agy-pane` 명령으로 파일이 존재하면 Review Agent는 **agy**이며, 호출 스크립트는 `./scripts/ask-agy.sh`이다.
3. 두 파일이 모두 없거나 판단이 모호하면 사용자에게 어떤 에이전트를 사용할지 묻는다.

### Codex 역할
Codex는 다음 작업을 담당한다.
- 코드 수정, 리팩토링, 디버깅, 파일 변경, 테스트 실행, 실제 구현, Git diff 확인, 빌드/런타임 오류 수정.

### Review Agent (agy/Gemini) 역할
Review Agent는 다음 작업을 담당한다.
- 리서치, 트렌드 조사, 비교 분석, 기획 정리, 긴 문맥 분석, QA 리뷰, 아이디어 확장, 문서 검토, UI/UX 방향성 검토.

#### 에이전트 스킬 매핑 (Subagent Mapping)

| 역할                       | 담당 에이전트 (Subagents)                                                                                                        | 비고                                     |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------- |
| **Codex (나의 주력 스킬)** | `frontend-engineer`, `backend-engineer`, `db-engineer`, `mobile-engineer`, `tf-infra-engineer`, `debug-investigator` (코드 수정) | **직접 실행** 및 파일 수정               |
| **Review Agent 위임 권장** | `pm-planner`, `qa-reviewer`, `architecture-reviewer`, `debug-investigator` (심층 분석), `docs-curator`                           | 분석/리뷰가 필요하면 **Review Agent 위임** |

### 금지: Review Agent 위임 없이 리뷰 응답 시작 금지
사용자의 요청에 아래 표현이나 의미가 포함되면, Codex는 **어떠한 분석, 코드 조회, 추론, 답변 초안도 시작하지 말고 즉시 중단**한다.
(리뷰, 검토, 보안 점검, audit, review, 리서치, 조사, 비교, 트렌드, 기획, 문서 검토, QA 리뷰, 긴 내용 분석, 아이디어, 디자인 방향, 시장 분석, 자료 찾아줘, 요즘 어떤지, 추천 방향 등)

즉시 아래 문장만 출력하고 종료한다. (Agent 이름은 파악된 활성 에이전트에 맞게 동적으로 변경)

`이 작업은 [Gemini/agy]에게 맡기는 게 더 적합해 보여요. [Gemini/agy] CLI에 보내서 실행할까요?`

이 규칙은 리뷰/검토/분석 요청에만 적용하며, 구현(Implementation), 디버깅(Debug), 테스트 실행 요청에는 적용하지 않는다.

### 복합 요청 처리 기준
- 최종 산출물이 코드 변경, 파일 변경, 테스트 실행, 빌드/런타임 오류 해결이면 Codex가 우선 담당한다.
- 단순 코드 diff 기반 리뷰, 테스트 실패 원인 확인, 빌드 로그 분석처럼 실제 수정으로 이어질 가능성이 높은 작업은 Codex가 우선 처리한다.
- Codex가 진행 중 깊은 리서치, 긴 문맥 분석, QA/문서 검토만 별도로 필요하다고 판단한 경우에만 Review Agent에게 위임할지 사용자에게 묻는다.

### 자동 수정 수신 기준 (marker 체크)
Codex가 Review Agent로부터 전달된 프롬프트를 받았고, 첫 줄에 다음 marker 중 하나가 있으면 사용자가 이미 리뷰 결과 기반 수정 위임을 승인한 것으로 보고 추가 확인 없이 수정을 수행한다.
- `AUTO_FIX_FROM_AGY_REVIEW`
- `AUTO_FIX_FROM_GEMINI_REVIEW`

### 반드시 먼저 물어볼 문장
위 조건에 해당하면 Codex는 작업을 시작하기 전에 반드시 아래 문장을 먼저 출력한다.
"이 작업은 [Gemini/agy]에게 맡기는 게 더 적합해 보여요. [Gemini/agy] CLI에 보내서 실행할까요?"

### 사용자가 승인하면 실행할 명령
사용자가 승인하면 Codex는 파악된 활성 에이전트의 스크립트를 호출한다.
```bash
./scripts/ask-[gemini/agy].sh "<Review Agent에게 보낼 프롬프트>"
```

### Review Agent로 보낼 프롬프트 필수 포함 내용
- 사용자의 원래 요청, 현재 프로젝트 맥락, 작업 요약, 관련 파일 경로.
- **이력 누적형 수정 수행 및 보고 수칙**: Codex는 `docs/log/` 내 계획 파일의 최신 증분 섹션만 읽고 작업을 진행하며, 수정 완료 후 `modification_log.md`에 보고를 남긴다.
- **자동 연동 스크립트 실행**: 보고서 저장 후 즉시 `./scripts/ask-[gemini/agy].sh "docs/log/modification_log.md 에 신규 수정 보고 섹션을 추가 저장하였습니다..."` 명령을 실행하여 1회 최종 보고한다.

### Review Agent 수행 금지사항
- 코드 수정 및 파일 변경 금지: 코딩은 무조건 Codex의 영역임.
- 사용자 승인 없이 Review Agent CLI로 임의 송신 금지.
- 민감 정보 전송 금지.

---

## 3. 새로운 수정 요청 발생 시 장부 신규 생성 수칙

한 차례의 모든 수정 단계가 완료되고 Review Agent의 최종 승인을 받아 작업이 종료된 후, **사용자가 완전히 새로운 과제나 수정 요청을 시작할 경우** 기존 마크다운 파일에 계속 덧붙이지 않고 파일을 새롭게 분리하여 추가한다.
- **계획/로그 파일의 버전화(인덱싱)**: 모든 검토가 끝난 후 새로운 요청이 들어오면 `docs/log/` 내에 순번에 맞춘 새 파일을 생성한다.
  - 예: 1차 사이클 종료 후 새 요청 발생 시 -> `refactoring_plan_2.md` 생성, 결과 기록용 파일도 `modification_log_2.md` 형태로 새롭게 생성하여 지정함.
- **이전 파일 동결 및 참조**: 새로 생성된 마크다운 장부 파일의 최상단에는 이전 장부 파일의 경로를 명시하여 에이전트들이 과거 맥락을 파악할 수 있도록 링크를 제공한다.
  - 예: `이전 작업 이력 참조: docs/log/refactoring_plan_1.md`
- **새 파일 생성 후 증분 루프 규칙 적용**: 파일이 새롭게 생성된 이후에는 다시 위의 **Codex 수칙 및 Review Agent 수칙**에 명시된 하단 증분 섹션 추가 방식 및 자동 트리거(`ask-gemini.sh` 또는 `ask-agy.sh`) 규칙을 동일하게 적용하여 파일 내에 이력을 누적해 나간다.

## 4. Gemini 병행 사용 수칙 [Codex/agy 또는 Codex/Gemini]

이 프로젝트는 기본 Codex+agy 구성을 유지하되, 사용자가 Gemini를 보조 리뷰/분석 에이전트로 띄운 경우 Codex+Gemini 조합도 같은 규칙으로 사용한다.

- `./scripts/start-ai.sh`는 기본값으로 Codex+agy를 실행한다.
- `./scripts/start-ai.sh gemini`는 Codex+Gemini를 실행하고 `.gemini-pane`을 기록한다.
- Codex는 리뷰/분석/기획/문서 검토류 요청을 위임해야 할 때 반드시 **활성 Review Agent 파악 수칙**에 따라 `.gemini-pane` 또는 `.agy-pane`을 확인하여 적절한 스크립트를 선택한다.
- Gemini에서 Codex로 자동 수정 위임이 올 때 marker는 `AUTO_FIX_FROM_GEMINI_REVIEW`로 인정하며, 이는 `AUTO_FIX_FROM_AGY_REVIEW`와 동일한 효력을 갖는다.

Codex가 Gemini에게 보낼 때는 agy 프롬프트 필수 포함 항목과 동일한 내용을 포함하되, 수신자/명령/marker만 Gemini 기준으로 바꾼다.

```bash
./scripts/ask-gemini.sh "<Gemini에게 보낼 프롬프트>"
```

Gemini에게 수정 완료 보고를 보낼 때는 아래 명령을 사용한다.

```bash
./scripts/ask-gemini.sh "docs/log/modification_log.md 에 신규 수정 보고 섹션을 추가 저장하였습니다. 해당 증분 섹션에 대한 파일 직접 검토를 요청드립니다."
```

위임 여부를 물어야 하는 상황에서 활성 보조 에이전트가 Gemini이면 아래 문장을 사용한다.

`이 작업은 Gemini에게 맡기는 게 더 적합해 보여요. Gemini CLI에 보내서 실행할까요?`
