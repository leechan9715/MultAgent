<!-- OMA:START — managed by oh-my-agent. Do not edit this block manually. -->

# oh-my-agent

## Architecture

- **SSOT**: `.agents/` directory (do not modify directly)
- **Response language**: Follows `language` in `.agents/oma-config.yaml`
- **Skills**: `.agents/skills/` (domain specialists)
- **Workflows**: `.agents/workflows/` (multi-step orchestration)
- **Subagents**: Same-vendor native dispatch via `.gemini/agents/{name}.md`; cross-vendor or unsupported cases fall back to `oma agent:spawn {agent} {prompt} {sessionId}`

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

Hooks: `BeforeAgent` (keyword detection), `BeforeTool`, `AfterAgent` (persistent mode)
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

OMA 관리 블록에는 공통 hook 경로가 `.agents/hooks/core/triggers.json`로 표시될 수 있다. 이 프로젝트의 실제 런타임 hook 파일은 Codex용 `.codex/hooks/`와 Gemini용 `.gemini/hooks/`에 생성되어 있으며, OMA 관리 블록은 직접 수정하지 않는다.

## HIGH PRIORITY: Gemini → Codex Delegation Gate

이 프로젝트에서는 Gemini CLI와 Codex CLI를 tmux 2분할 환경에서 함께 사용한다.

이 규칙은 매우 중요하다. 사용자의 요청이 아래 유형에 해당하면 Gemini는 바로 직접 처리하지 말고, 먼저 Codex 위임 여부를 사용자에게 물어봐야 한다.

### Gemini 역할

Gemini는 다음 작업을 담당한다.

- 리서치
- 트렌드 조사
- 비교 분석
- 기획 정리
- 긴 문맥 분석
- QA 리뷰
- 아이디어 확장
- 문서 검토
- UI/UX 방향성 검토

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

#### 에이전트 스킬 매핑 (Subagent Mapping)

| 역할                   | 담당 에이전트 (Subagents)                                                                                                        | 주요 작업 내용                                                             |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| **Gemini (전략/검토)** | `pm-planner`, `qa-reviewer`, `architecture-reviewer`, `debug-investigator` (원인 분석), `docs-curator`                           | 요구사항 분석, 코드 품질 리뷰, 설계 검토, 버그 원인 파악, 문서 정합성 체크 |
| **Codex (실행/수정)**  | `frontend-engineer`, `backend-engineer`, `db-engineer`, `mobile-engineer`, `tf-infra-engineer`, `debug-investigator` (코드 수정) | UI/API 구현, DB 마이그레이션, 실제 코드 및 설정 파일 수정, 테스트 실행     |

### 반드시 Codex 위임 여부를 물어봐야 하는 요청

사용자의 요청에 아래 표현이나 의미가 포함되면, Gemini는 직접 처리하지 말고 먼저 Codex 위임 여부를 물어본다.

- 코드 수정
- 구현
- 버그 고쳐줘
- 리팩토링
- 파일 수정
- 테스트 돌려줘
- 컴포넌트 만들어줘
- 에러 해결
- 빌드 오류
- 런타임 오류
- CSS 수정
- React 수정
- Vue 수정
- API 연동 수정

### 복합 요청 처리 기준

분석/기획과 코드 수정/구현이 섞인 요청은 최종 산출물을 기준으로 판단한다.

- 최종 산출물이 코드 변경, 파일 변경, 테스트 실행, 빌드/런타임 오류 해결이면 Codex 위임 여부를 먼저 사용자에게 묻는다.
- 최종 산출물이 리서치, 비교, 기획, 아이디어 정리, 문서 검토라면 Gemini가 직접 처리하고 Codex로 넘기지 않는다.
- Codex가 작업을 마친 뒤 검토가 필요하면 Gemini는 diff, 테스트 결과, 변경 요약을 기준으로 리뷰/분석만 수행한다.
- Codex에게 위임할 때는 구현 범위와 수정 금지 범위를 명확히 적어 불필요한 파일 변경을 막는다.

### 자동 Codex 위임 예외

Gemini가 리뷰/분석을 완료한 뒤 그 결과를 바탕으로 파일 수정이 필요하다고 판단한 경우, 사용자가 이미 "수정까지 진행", "Codex에 맡겨", "알아서 넘겨", "자동으로 실행"처럼 자동 수정 위임 의사를 밝힌 상태라면 별도의 추가 확인 없이 Codex로 위임한다.

이때 Gemini는 사용자에게 다시 "Codex CLI에 보내서 실행할까요?"라고 묻지 않는다. 대신 다음 명령을 바로 실행한다.

```bash
./scripts/ask-codex.sh "<Codex에게 보낼 프롬프트>"
```

자동 위임 프롬프트에는 반드시 다음 marker를 첫 줄에 포함한다.

```text
AUTO_FIX_FROM_GEMINI_REVIEW
```

자동 위임은 Gemini 리뷰 결과를 바탕으로 한 코드/문서/설정 파일 수정에만 허용한다. 민감정보 처리, destructive command, 대규모 삭제, 배포, 결제/권한 변경, 외부 서비스 설정 변경은 자동 위임하지 말고 사용자 승인을 다시 받는다.

### 반드시 먼저 물어볼 문장

위 조건에 해당하면 Gemini는 작업을 시작하기 전에 반드시 아래 문장을 먼저 출력한다.

"이 작업은 Codex에게 맡기는 게 더 적합해 보여요. Codex CLI에 보내서 실행할까요?"

### 승인 조건

사용자가 다음처럼 승인한 경우에만 Codex로 보낸다.

- yes
- y
- 응
- 그래
- 보내줘
- 실행해
- 좋아
- ㅇㅇ

### 사용자가 승인하면 실행할 명령

사용자가 승인하면 Gemini는 다음 명령을 실행한다.

```bash
./scripts/ask-codex.sh "<Codex에게 보낼 프롬프트>"
```

### Codex로 보낼 프롬프트에 반드시 포함할 내용

Codex에게 짧은 명령만 보내지 않는다. 반드시 다음 내용을 포함한다.

- 사용자의 원래 요청
- 현재 프로젝트 맥락
- 현재 작업 요약
- 관련 파일 경로가 있으면 포함
- 이미 코드가 변경된 경우 `git diff --stat` 또는 변경 요약
- Git 저장소가 아니거나 `git diff` 확인이 불가능하면 변경된 파일 목록과 수정 내용을 직접 요약
- 수정 허용 범위
- 기존 구조와 className을 최대한 유지하라는 지시
- 변경 후 수정 파일과 수정 이유를 요약하라는 지시
- 가능하면 테스트 또는 확인 기준
- 민감한 정보는 포함하지 말 것

### 금지

- 사용자 승인 없이 Codex CLI로 보내지 않는다. 단, 위 "자동 Codex 위임 예외"에 해당하는 경우는 이미 사용자 승인 범위에 포함된 것으로 본다.
- 리서치, 비교, 기획, 아이디어 정리만 필요한 작업은 Codex로 넘기지 않는다.
- Codex에게 민감한 정보, API key, 비밀번호, 토큰을 포함하지 않는다.
- Codex가 수정한 결과는 반드시 diff와 테스트 결과를 확인한다. Git 저장소가 아니라 diff 확인이 불가능하면 변경 파일 목록과 변경 요약을 확인한다.
