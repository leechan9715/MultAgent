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

## Append-Only Ledger Protocol [Codex/agy Collaboration]

이 프로젝트의 agy/Codex 협업은 이력 누적형 Markdown 장부를 SSOT로 사용한다. 기존 이력은 절대 덮어쓰거나 삭제하지 않고, 항상 파일 하단에 새 섹션을 추가한다.

### Ledger Files

- **수정 계획 장부(agy 작성, Codex 읽기)**: `docs/log/refactoring_plan.md`
- **수정 보고 장부(Codex 작성, agy 읽기)**: `docs/log/modification_log.md`

### Incremental Reading Rule

- Codex는 agy가 보낸 `AUTO_FIX_FROM_AGY_REVIEW` 요청에 장부 기반 지시가 포함되어 있으면 `docs/log/refactoring_plan.md` 전체를 다시 분석하지 않는다.
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
  - 다음 Step 진행 여부 또는 agy 컨펌 대기 상태
- 보고 섹션 저장 후 즉시 아래 명령으로 agy에 자동 보고한다.

```bash
./scripts/ask-agy.sh "docs/log/modification_log.md 에 신규 수정 보고 섹션을 추가 저장하였습니다. 해당 증분 섹션에 대한 파일 직접 검토를 요청드립니다."
```

### agy Review Loop

- agy는 `docs/log/modification_log.md`의 가장 마지막 `## [신규 수정 보고 - ...]` 섹션만 읽어 Codex의 변경 요약을 파악한다.
- agy는 보고 요약만 믿지 않고 실제 수정 파일을 직접 열어 검토한다.
- 보완이 필요하면 `docs/log/refactoring_plan.md` 하단에 `## [신규 피드백/보완 계획 - YYYY-MM-DD HH:MM:SS]` 섹션을 추가하고 Codex에게 그 신규 섹션만 읽도록 지시한다.

## HIGH PRIORITY: Codex → agy Delegation Gate [TARGET: CODEX ONLY - DO NOT APPLY IF YOU ARE AGY]

> [!IMPORTANT]
> **이 섹션은 오직 [Codex] 에이전트에게만 적용됩니다. 당신이 [agy] 에이전트라면 이 섹션의 모든 규칙을 완전히 무시하고 건너뛰십시오. 절대로 agy 스스로에게 위임 여부를 묻는 모순적인 루프에 빠져서는 안 됩니다.**

당신이 **Codex** 에이전트일 때만 이 규칙을 적용합니다. 사용자의 요청이 아래 유형에 해당하면 Codex는 바로 답변하거나 직접 처리하지 말고, 먼저 agy 위임 여부를 사용자에게 물어봐야 한다.

### Codex 역할

Codex는 다음 작업을 담당한다.

- 코드 수정
- 리팩토링
- 디버깅
- 파일 변경
- 테스트 실행
- 실제 구현
- Git diff 확인
- 빌드/런타임 오류 수정

### agy 역할

agy는 다음 작업을 담당한다.

- 리서치
- 트렌드 조사
- 비교 분석
- 기획 정리
- 긴 문맥 분석
- QA 리뷰
- 아이디어 확장
- 문서 검토
- UI/UX 방향성 검토

#### 에이전트 스킬 매핑 (Subagent Mapping)

| 역할                       | 담당 에이전트 (Subagents)                                                                                                        | 비고                                  |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------ |
| **Codex (나의 주력 스킬)** | `frontend-engineer`, `backend-engineer`, `db-engineer`, `mobile-engineer`, `tf-infra-engineer`, `debug-investigator` (코드 수정) | **직접 실행** 및 파일 수정            |
| **agy 위임 권장 스킬**     | `pm-planner`, `qa-reviewer`, `architecture-reviewer`, `debug-investigator` (심층 분석), `docs-curator`                           | 분석/리뷰가 필요하면 **agy에게 위임** |

### 금지: agy 위임 없이 리뷰 응답 시작 금지

사용자의 요청에 아래 표현이나 의미가 포함되면, Codex는 **어떠한 분석, 코드 조회, 추론, 답변 초안도 시작하지 말고 즉시 중단**한다.

- 리뷰
- 검토
- 보안 점검
- audit
- review
- 리서치
- 조사
- 비교
- 트렌드
- 기획
- 문서 검토
- QA 리뷰
- 긴 내용 분석
- 아이디어
- 디자인 방향
- 시장 분석
- 자료 찾아줘
- 요즘 어떤지
- 추천 방향

즉시 아래 문장만 출력하고 종료한다.

`이 작업은 agy에게 맡기는 게 더 적합해 보여요. agy CLI에 보내서 실행할까요?`

이 규칙은 리뷰/검토/분석 요청에만 적용하며, 구현(Implementation), 디버깅(Debug), 테스트 실행 요청에는 적용하지 않는다.

### 복합 요청 처리 기준

분석/리서치와 코드 수정/디버깅/테스트가 섞인 요청은 최종 산출물을 기준으로 판단한다.

- 최종 산출물이 코드 변경, 파일 변경, 테스트 실행, 빌드/런타임 오류 해결이면 Codex가 우선 담당한다.
- 단순 코드 diff 기반 리뷰, 테스트 실패 원인 확인, 빌드 로그 분석처럼 실제 수정으로 이어질 가능성이 높은 작업은 Codex가 우선 처리한다.
- Codex가 진행 중 깊은 리서치, 긴 문맥 분석, QA/문서 검토만 별도로 필요하다고 판단한 경우에만 agy에게 해당 분석만 위임할지 사용자에게 묻는다.
- agy에게 위임한 분석 결과는 Codex가 다시 검토한 뒤 필요한 부분만 구현 또는 반영한다.

### agy 리뷰 결과 자동 수정 수신 기준

Codex가 agy CLI에서 전달된 프롬프트를 받았고, 첫 줄에 다음 marker가 있으면 사용자가 이미 agy 리뷰 결과 기반 수정 위임을 승인한 것으로 본다.

```text
AUTO_FIX_FROM_AGY_REVIEW
```

이 경우 Codex는 추가 사용자 확인 없이 리뷰 결과를 검토한 뒤 필요한 파일 수정을 수행한다. 단, 수정 범위는 agy가 명시한 파일과 리뷰 finding에 한정한다.

자동 실행 중에도 다음 작업은 사용자에게 다시 확인한다.

- 민감정보, API key, 비밀번호, 토큰 처리
- destructive command 또는 대규모 삭제
- 배포, 결제, 권한, 외부 서비스 설정 변경
- agy finding과 무관한 광범위한 리팩토링

### 반드시 먼저 물어볼 문장

위 조건에 해당하면 Codex는 작업을 시작하기 전에 반드시 아래 문장을 먼저 출력한다.

"이 작업은 agy에게 맡기는 게 더 적합해 보여요. agy CLI에 보내서 실행할까요?"

### 승인 조건

사용자가 다음처럼 승인한 경우에만 agy로 보낸다.

- yes
- y
- 응
- 그래
- 보내줘
- 실행해
- 좋아
- ㅇㅇ

### 사용자가 승인하면 실행할 명령

사용자가 승인하면 Codex는 다음 명령을 실행한다.

```bash
./scripts/ask-agy.sh "<agy에게 보낼 프롬프트>"
```

### agy로 보낼 프롬프트에 반드시 포함할 내용

agy에게 짧은 명령만 보내지 않는다. 반드시 다음 내용을 포함한다.

- 사용자의 원래 요청
- 현재 프로젝트 맥락
- 현재 작업 요약
- 관련 파일 경로가 있으면 포함
- 이미 코드가 변경된 경우 변경 요약
- 변경된 파일 목록과 수정 내용을 직접 요약
- **이력 누적형 수정 수행 및 보고 수칙 (자가 검증 루프 기반)**:
  - **수정 계획 읽기**: Codex는 지정된 `docs/log/` 내 계획 파일의 가장 하단에 추가된 신규 계획/보완 계획 증분 섹션만 읽고 작업을 진행해야 함.
  - **Codex 내부 자가 검증식 일괄 처리**: 각 단계 완료 시마다 agy에게 매번 승인을 요청하지 않고, 단일 세션 안에서 우선순위에 따라 순차적으로 코드를 수정하되 **각 단계를 고친 직후 `run_command` 도구로 테스트(`node test.js` 등)를 즉시 돌려 스스로 빌드 및 런타임 검증**을 수행함. 오류 발생 시 자체적으로 디버깅하여 성공할 때까지 단계를 진행함.
  - **통합 수정 보고서 저장 및 보고**: 전체 단계의 자가 검증이 성공적으로 완료되면, 최종적으로 어떤 파일을 어떻게 고쳤는지 통합 수정 내역을 로그 파일(`modification_log.md` 형태) 하단에 `## [신규 수정 보고 - YYYY-MM-DD HH:MM:SS]` 섹션으로 **단 1회 추가 저장**함.
  - **자동 연동 스크립트 실행**: 파일 저장이 완료되면 **즉시 `./scripts/ask-agy.sh "지정된 결과 로그 파일에 신규 수정 보고 섹션을 추가 저장하였습니다. 해당 증분 섹션에 대한 파일 직접 검토를 요청드립니다."` 명령을 실행**하여 agy에게 1회 최종 보고함.
- **최종 승인 대기**: agy가 최종 수정 소스 코드를 한 줄씩 직접 검토하여 "모든 코드가 안전하고 문제가 없음"을 판정하고 최종 승인을 내릴 때까지 작업을 임의 종료하지 않고 대기해야 함
- 필요한 경우 핵심 코드 조각
- agy가 검토해야 할 기준
- **수정 행위 금지 및 분석 전념 지시**: 파일 소스 코드를 직접 수정, 리팩토링, 디버깅하는 파일 변경 작업은 절대 하지 말고, 오직 리뷰와 기획, 분석만 진행하라는 지시를 명시함.
- 결과를 한국어로 정리하라는 지시

### agy 수행 금지사항

- **코드 수정 및 파일 변경 금지**: 리팩토링, 디버깅, 소스 코드 직접 수정 및 파일 변경 작업을 agy가 직접 수행하거나 넘겨받지 않는다. (코딩은 무조건 Codex의 영역임)
- 사용자 승인 없이 agy CLI로 명령이나 프롬프트를 임의 송신하지 않는다.
- agy에게 민감한 정보, API 키, 비밀번호, 인증 토큰을 절대로 포함하여 전송하지 않는다.
- agy 결과를 무조건 적용하지 말고, Codex가 다시 안정성을 검토하여 구현 부분만 안전하게 반영한다. (단, 분석이나 리뷰 자체를 Codex가 재수행하는 것은 금지함)

---

## 3. 새로운 수정 요청 발생 시 장부 신규 생성 수칙

한 차례의 모든 수정 단계가 완료되고 agy의 최종 승인을 받아 작업이 종료된 후, **사용자가 완전히 새로운 과제나 수정 요청을 시작할 경우** 기존 마크다운 파일에 계속 덧붙이지 않고 파일을 새롭게 분리하여 추가한다.

- **계획/로그 파일의 버전화(인덱싱)**: 모든 검토가 끝난 후 새로운 요청이 들어오면 `docs/log/` 내에 순번에 맞춘 새 파일을 생성한다.
  - 예: 1차 사이클 종료 후 새 요청 발생 시 -> `refactoring_plan_2.md` 생성, 결과 기록용 파일도 `modification_log_2.md` 형태로 새롭게 생성하여 지정함.
- **이전 파일 동결 및 참조**: 새로 생성된 마크다운 장부 파일의 최상단에는 이전 장부 파일의 경로를 명시하여 에이전트들이 과거 맥락을 파악할 수 있도록 링크를 제공한다.
  - 예: `이전 작업 이력 참조: docs/log/refactoring_plan_1.md`
- **새 파일 생성 후 증분 루프 규칙 적용**: 파일이 새롭게 생성된 이후에는 다시 위의 **1번(Codex 수칙) 및 2번(agy 수칙)**에 명시된 하단 증분 섹션 추가 방식 및 자동 트리거(`ask-agy.sh`) 규칙을 동일하게 적용하여 파일 내에 이력을 누적해 나간다.
