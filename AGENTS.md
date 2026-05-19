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

OMA 관리 블록에는 공통 hook 경로가 `.agents/hooks/core/triggers.json`로 표시될 수 있다. 이 프로젝트의 실제 런타임 hook 파일은 Codex용 `.codex/hooks/`와 Gemini용 `.gemini/hooks/`에 생성되어 있으며, OMA 관리 블록은 직접 수정하지 않는다.

## HIGH PRIORITY: Codex → Gemini Delegation Gate

이 프로젝트에서는 Codex CLI와 Gemini CLI를 tmux 2분할 환경에서 함께 사용한다.

이 규칙은 매우 중요하다. 사용자의 요청이 아래 유형에 해당하면 Codex는 바로 답변하거나 직접 처리하지 말고, 먼저 Gemini 위임 여부를 사용자에게 물어봐야 한다.

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

#### 에이전트 스킬 매핑 (Subagent Mapping)

| 역할                       | 담당 에이전트 (Subagents)                                                                                                        | 비고                                     |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------- |
| **Codex (나의 주력 스킬)** | `frontend-engineer`, `backend-engineer`, `db-engineer`, `mobile-engineer`, `tf-infra-engineer`, `debug-investigator` (코드 수정) | **직접 실행** 및 파일 수정               |
| **Gemini 위임 권장 스킬**  | `pm-planner`, `qa-reviewer`, `architecture-reviewer`, `debug-investigator` (심층 분석), `docs-curator`                           | 분석/리뷰가 필요하면 **Gemini에게 위임** |

### 금지: Gemini 위임 없이 리뷰 응답 시작 금지

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

`이 작업은 Gemini에게 맡기는 게 더 적합해 보여요. Gemini CLI에 보내서 실행할까요?`

이 규칙은 리뷰/검토/분석 요청에만 적용하며, 구현(Implementation), 디버깅(Debug), 테스트 실행 요청에는 적용하지 않는다.

### 복합 요청 처리 기준

분석/리서치와 코드 수정/디버깅/테스트가 섞인 요청은 최종 산출물을 기준으로 판단한다.

- 최종 산출물이 코드 변경, 파일 변경, 테스트 실행, 빌드/런타임 오류 해결이면 Codex가 우선 담당한다.
- 단순 코드 diff 기반 리뷰, 테스트 실패 원인 확인, 빌드 로그 분석처럼 실제 수정으로 이어질 가능성이 높은 작업은 Codex가 우선 처리한다.
- Codex가 진행 중 깊은 리서치, 긴 문맥 분석, QA/문서 검토만 별도로 필요하다고 판단한 경우에만 Gemini에게 해당 분석만 위임할지 사용자에게 묻는다.
- Gemini에게 위임한 분석 결과는 Codex가 다시 검토한 뒤 필요한 부분만 구현 또는 반영한다.

### Gemini 리뷰 결과 자동 수정 수신 기준

Codex가 Gemini CLI에서 전달된 프롬프트를 받았고, 첫 줄에 다음 marker가 있으면 사용자가 이미 Gemini 리뷰 결과 기반 수정 위임을 승인한 것으로 본다.

```text
AUTO_FIX_FROM_GEMINI_REVIEW
```

이 경우 Codex는 추가 사용자 확인 없이 리뷰 결과를 검토한 뒤 필요한 파일 수정을 수행한다. 단, 수정 범위는 Gemini가 명시한 파일과 리뷰 finding에 한정한다.

자동 실행 중에도 다음 작업은 사용자에게 다시 확인한다.

- 민감정보, API key, 비밀번호, 토큰 처리
- destructive command 또는 대규모 삭제
- 배포, 결제, 권한, 외부 서비스 설정 변경
- Gemini finding과 무관한 광범위한 리팩토링

### 반드시 먼저 물어볼 문장

위 조건에 해당하면 Codex는 작업을 시작하기 전에 반드시 아래 문장을 먼저 출력한다.

"이 작업은 Gemini에게 맡기는 게 더 적합해 보여요. Gemini CLI에 보내서 실행할까요?"

### 승인 조건

사용자가 다음처럼 승인한 경우에만 Gemini로 보낸다.

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
./scripts/ask-gemini.sh "<Gemini에게 보낼 프롬프트>"
```

### Gemini로 보낼 프롬프트에 반드시 포함할 내용

Gemini에게 짧은 명령만 보내지 않는다. 반드시 다음 내용을 포함한다.

- 사용자의 원래 요청
- 현재 프로젝트 맥락
- 현재 작업 요약
- 관련 파일 경로가 있으면 포함
- 이미 코드가 변경된 경우 `git diff --stat` 또는 변경 요약
- Git 저장소가 아니거나 `git diff` 확인이 불가능하면 변경된 파일 목록과 수정 내용을 직접 요약
- 필요한 경우 핵심 코드 조각
- Gemini가 검토해야 할 기준
- "파일은 수정하지 말고 리뷰/분석만 해줘" 지시
- 결과를 한국어로 정리하라는 지시

### 금지

- 사용자 승인 없이 Gemini CLI로 보내지 않는다.
- 리서치/조사/비교/기획/리뷰 요청을 Codex가 바로 처리하지 않는다.
- 코드 수정, 파일 변경, 리팩토링, 디버깅 작업은 Gemini에게 넘기지 않는다.
- Gemini에게 민감한 정보, API key, 비밀번호, 토큰을 포함하지 않는다.
- Gemini 결과를 무조건 적용하지 말고, Codex가 다시 검토한 뒤 필요한 부분만 반영한다.
