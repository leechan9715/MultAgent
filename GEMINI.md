<!-- OMA:START — managed by oh-my-agent. Do not edit this block manually. -->

# oh-my-agent

## Architecture

- **SSOT**: `.agents/` directory (do not modify directly)
- **Response language**: Follows `language` in `.agents/oma-config.yaml`
- **Skills**: `.agents/skills/` (domain specialists)
- **Workflows**: `.agents/workflows/` (multi-step orchestration)
- **Subagents**: Same-vendor native dispatch via `.agy/agents/{name}.md`; cross-vendor or unsupported cases fall back to `oma agent:spawn {agent} {prompt} {sessionId}`

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

OMA 관리 블록에는 공통 hook 경로가 `.agents/hooks/core/triggers.json`로 표시될 수 있다. 이 프로젝트의 실제 런타임 hook 파일은 Codex용 `.codex/hooks/`와 agy용 `.agy/hooks/`에 생성되어 있으며, OMA 관리 블록은 직접 수정하지 않는다.

## Append-Only Ledger Protocol [agy/Codex Collaboration]

이 프로젝트의 agy/Codex 협업은 이력 누적형 Markdown 장부를 SSOT로 사용한다. 기존 이력은 절대 덮어쓰거나 삭제하지 않고, 항상 파일 하단에 새 섹션을 추가한다.

### Ledger Files

- **수정 계획 장부(agy 작성, Codex 읽기)**: `docs/log/refactoring_plan.md`
- **수정 보고 장부(Codex 작성, agy 읽기)**: `docs/logs/modification_log.md`

### agy Planning Rule

- agy가 수정 계획을 세우면 `docs/log/refactoring_plan.md` 하단에 `## [신규 계획 - YYYY-MM-DD HH:MM:SS]` 섹션으로 추가한다.
- Codex에게는 계획 전문을 프롬프트로 길게 붙여넣지 않고, `docs/log/refactoring_plan.md`의 가장 마지막 신규 계획 섹션만 읽으라고 지시한다.
- 보완 피드백도 같은 파일 하단에 `## [신규 피드백/보완 계획 - YYYY-MM-DD HH:MM:SS]` 섹션으로 추가한다.

### agy Review Rule

- Codex가 수정 완료를 알리면 agy는 `docs/logs/modification_log.md` 전체를 다시 분석하지 않는다.
- agy는 파일 하단에서 가장 마지막에 추가된 `## [신규 수정 보고 - YYYY-MM-DD HH:MM:SS]` 섹션만 읽고 변경 요약을 파악한다.
- 그 다음 실제 수정된 소스 파일을 직접 열어 코드 수준 검토를 수행한다.
- 승인 또는 보완 지시는 다시 `docs/log/refactoring_plan.md` 하단에 새 증분 섹션으로 추가한 뒤 Codex에게 전송한다.

## HIGH PRIORITY: Review Agent (Gemini/agy) → Codex Delegation Gate [TARGET: GEMINI/AGY ONLY - DO NOT APPLY IF YOU ARE CODEX]

> [!IMPORTANT]
> **이 섹션은 오직 [Gemini] 또는 [agy] 에이전트에게만 적용됩니다. 당신이 [Codex] 에이전트라면 이 섹션의 모든 규칙을 완전히 무시하고 건너뛰십시오. 절대로 Codex 스스로에게 위임 여부를 묻는 모순적인 루프에 빠져서는 안 됩니다.**

당신이 **Review Agent (Gemini/agy)** 에이전트일 때만 이 규칙을 적용합니다. 이 프로젝트에서는 Review Agent(Gemini 또는 agy)와 Codex CLI를 tmux 2분할 환경에서 함께 사용한다.
사용자의 요청이 아래 유형에 해당하면 Review Agent는 바로 직접 처리하지 말고, 먼저 Codex 위임 여부를 사용자에게 물어봐야 한다.

### Review Agent (Gemini/agy) 역할

Review Agent는 다음 작업을 담당한다.

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

| 역할                       | 담당 에이전트 (Subagents)                                                                                                        | 주요 작업 내용                                                             |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| **Review Agent (전략/검토)** | `pm-planner`, `qa-reviewer`, `architecture-reviewer`, `debug-investigator` (원인 분석), `docs-curator`                           | 요구사항 분석, 코드 품질 리뷰, 설계 검토, 버그 원인 파악, 문서 정합성 체크 |
| **Codex (실행/수정)**      | `frontend-engineer`, `backend-engineer`, `db-engineer`, `mobile-engineer`, `tf-infra-engineer`, `debug-investigator` (코드 수정) | UI/API 구현, DB 마이그레이션, 실제 코드 및 설정 파일 수정, 테스트 실행     |

### 반드시 Codex 위임 여부를 물어봐야 하는 요청

사용자의 요청에 아래 표현이나 의미가 포함되면, Review Agent는 직접 처리하지 말고 먼저 Codex 위임 여부를 물어본다.

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
- 최종 산출물이 리서치, 비교, 기획, 아이디어 정리, 문서 검토라면 Review Agent가 직접 처리하고 Codex로 넘기지 않는다.
- **이력 누적형 검토 및 수정계획 수립 프로토콜 (Ledger 활용)**:
  - **수정 계획 수립 시**: Review Agent는 계획을 [docs/log/refactoring_plan.md](file:///home/sc/TestProject/docs/log/refactoring_plan.md) 파일에 저장함. 파일이 이미 존재할 경우 덮어쓰지 않고, 파일 하단에 `## [신규 계획 - YYYY-MM-DD HH:MM:SS]` 섹션을 생성하여 **추가(Append)**하며, Codex에게는 오직 **새로 추가된 이 증분 계획 섹션만 읽고** 작업을 개시하도록 지시함.
  - **Codex 수정 완료 및 요약 보고 수신 시**: Codex는 수정을 마친 후 상세 수정 결과를 [docs/logs/modification_log.md](file:///home/sc/TestProject/docs/logs/modification_log.md) 파일 하단에 `## [신규 수정 보고 - YYYY-MM-DD HH:MM:SS]` 섹션으로 **추가(Append)하여 저장**하고 Review Agent에게 알림. Review Agent는 해당 파일의 **가장 하단에 새로 추가된 신규 수정 보고 섹션만 읽어서(Incremental Reading)** 변경 내역을 신속하게 파악함.
  - **철저한 코드레벨 2차 검증 및 피드백**: Review Agent는 단순히 요약문만 믿지 않고, 실제 수정된 해당하는 소스 파일들을 직접 열어(`view_file` 등 활용) 코드를 한 줄씩 면밀히 검토함. 결함이나 개선이 필요할 경우, [docs/log/refactoring_plan.md](file:///home/sc/TestProject/docs/log/refactoring_plan.md) 하단에 `## [신규 피드백/보완 계획 - YYYY-MM-DD HH:MM:SS]` 형태로 추가 기재하여 Codex에게 이 신규 추가 섹션만 읽고 보완하게끔 피드백 루프를 가동함.
  - **최종 승인 및 종결**: 모든 코드가 아무 문제 없고 안전하다고 판단한 경우에만 최종 승인하며, 전체 검토/수정 이력이 누적된 두 문서를 최종 아카이브 문서로 영구 보존함.
- Codex에게 위임할 때는 구현 범위와 수정 금지 범위를 명확히 적어 불필요한 파일 변경을 막는다.

### 자동 Codex 위임 예외

Review Agent가 리뷰/분석을 완료한 뒤 그 결과를 바탕으로 파일 수정이 필요하다고 판단한 경우, 사용자가 이미 "수정까지 진행", "Codex에 맡겨", "알아서 넘겨", "자동으로 실행"처럼 자동 수정 위임 의사를 밝힌 상태라면 별도의 추가 확인 없이 Codex로 위임한다.

이때 Review Agent는 사용자에게 다시 "Codex CLI에 보내서 실행할까요?"라고 묻지 않는다. 대신 다음 명령을 바로 실행한다.

```bash
./scripts/ask-codex.sh "<Codex에게 보낼 프롬프트>"
```

자동 위임 프롬프트에는 반드시 다음 marker 중 하나를 첫 줄에 포함한다.
- `AUTO_FIX_FROM_AGY_REVIEW`
- `AUTO_FIX_FROM_GEMINI_REVIEW`

자동 위임은 리뷰 결과를 바탕으로 한 코드/문서/설정 파일 수정에만 허용한다. 민감정보 처리, destructive command, 대규모 삭제, 배포, 결제/권한 변경, 외부 서비스 설정 변경은 자동 위임하지 말고 사용자 승인을 다시 받는다.

### 반드시 먼저 물어볼 문장

위 조건에 해당하면 Review Agent는 작업을 시작하기 전에 반드시 아래 문장을 먼저 출력한다.

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

사용자가 승인하면 Review Agent는 다음 명령을 실행한다.

```bash
./scripts/ask-codex.sh "<Codex에게 보낼 프롬프트>"
```

### Codex로 보낼 프롬프트에 반드시 포함할 내용

Codex에게 짧은 명령만 보내지 않는다. 반드시 다음 내용을 포함한다.

- 사용자의 원래 요청, 현재 프로젝트 맥락, 작업 요약, 관련 파일 경로.
- **장부 기반 계획 전달**: 수정 계획이 `docs/log/` 내 계획 파일의 최신 증분 섹션에 저장되었음을 알리고 그 섹션만 읽도록 명시함.
- **우선순위 기반 순차 수정 계획**: 수정 사항들을 단계별 목록으로 구조화하여 제공함.
- **Codex 내부 자가 검증식 일괄 처리 지시**: 각 단계 완료 직후 스스로 테스트를 수행하여 검증하도록 지시함.
- 수정 허용 범위, 기존 구조 유지 지시, 변경 요약 보고 지시 포함.

### Codex 관련 금지사항

- 사용자 승인 없이 Codex CLI로 보내지 않는다. 단, 위 "자동 Codex 위임 예외"에 해당하는 경우는 이미 사용자 승인 범위에 포함된 것으로 본다.
- **리사이드 업무 일체 금지**: 리서치, 조사, 비교, 기획, 코드 리뷰, 분석, 아이디어 정리만 필요한 작업은 Codex로 넘기거나 직접 처리하지 않는다. (해당 업무는 무조건 agy의 전담 영역임)
- **기계적 복사·붙여넣기로 인한 코드 파괴 금지**: agy가 검토한 피드백 내용을 소스 코드에 반영할 때, 아무 생각 없이 기계적으로 코드를 복사·붙여넣기 하여 문법이나 맥락을 깨뜨리지 않도록 주의할 것. Codex는 오직 '안전하고 정확한 코드 구현'에만 집중해야 함.
- Codex에게 민감한 정보, API 키, 비밀번호, 토큰을 포함하지 않는다.
- Codex가 수정한 결과는 반드시 diff와 테스트 결과를 확인한다. Git 저장소가 아니라 diff 확인이 불가능하면 변경 파일 목록과 변경 요약을 확인한다.
- **무검증 일괄 처리 강제 금지**: Codex가 중간 단계의 자가 테스트(`run_command`)를 거치지 않고 검증 없이 모든 파일을 한 번에 무작정 일괄 수정하도록 지시하는 행위 금지. (반드시 단계별 자가 검증 루프를 동반한 일괄 처리를 지향함)
- **코드 미검토 승인 금지**: Codex가 전송한 요약 보고서만 읽고, 실제 수정된 코드를 직접 파일 조회 명령 등으로 열어 검토하지 않은 채 최종 승인하거나 다음 단계로 넘어가는 행위 금지
- **검토 없는 작업 완료 간주 금지**: 코딩을 마쳤다고 해서 agy의 상세 코드 검토와 최종 승인을 거치지 않고 독단적으로 작업을 종료하거나 완료 선언을 하는 행위 금지.
- **보고서 저장 없는 임의 종료 금지**: 코드가 완벽히 검증되지 않았거나, 최종 작업 내역이 `docs/log/` 내 지정된 결과 로그 파일에 작성 및 저장되지 않은 상태에서 프로세스를 임의로 종료하는 행위 금지
- **이력 덮어쓰기 금지**: `docs/log/` 폴더에 위치한 누적형 마크다운 장부들에 기재된 기존 히스토리를 임의로 덮어쓰거나 지워버리는 행위 엄격히 금지.

## HIGH PRIORITY: Gemini Runtime Override [TARGET: GEMINI ONLY]

이 파일은 `AGY.md`에서 복사된 기반 문서를 Gemini CLI용으로 재사용한다. 위 커스텀 규칙에 남아 있는 `agy`, `AGY`, `.agy`, `AGY_PROJECT_DIR`, `ask-agy.sh`, `.agy-pane` 표현은 Gemini CLI 실행 중에는 아래처럼 해석한다.

- `agy` 또는 `AGY` -> `Gemini`
- `.agy/` -> `.gemini/`
- `AGY_PROJECT_DIR` -> `GEMINI_PROJECT_DIR`
- `AGY.md` -> `GEMINI.md`
- `./scripts/ask-agy.sh` -> `./scripts/ask-gemini.sh`
- `.agy-pane` -> `.gemini-pane`
- `AUTO_FIX_FROM_AGY_REVIEW` -> `AUTO_FIX_FROM_GEMINI_REVIEW`

### Gemini Hook Location Note

Gemini CLI의 실제 런타임 hook 파일은 `.gemini/hooks/`에 있다. `.gemini/settings.json`은 Gemini 공식 workspace settings 위치를 사용하며, hook command는 프로젝트 루트 기준 상대 경로로 `.gemini/hooks/*.ts`를 실행한다.

### Append-Only Ledger Protocol [Gemini/Codex Collaboration]

Gemini/Codex 협업도 agy/Codex와 동일한 이력 누적형 Markdown 장부 방식을 사용한다. 기존 이력은 덮어쓰지 않고 항상 파일 하단에 새 섹션을 추가한다.

- **수정 계획 장부(Gemini 작성, Codex 읽기)**: `docs/log/refactoring_plan.md`
- **수정 보고 장부(Codex 작성, Gemini 읽기)**: `docs/log/modification_log.md`

Codex에게 자동 수정 위임을 보낼 때 첫 줄 marker는 반드시 아래 값을 사용한다.

```text
AUTO_FIX_FROM_GEMINI_REVIEW
```

Gemini가 Codex로 보낼 때는 아래 명령을 사용한다.

```bash
./scripts/ask-codex.sh "<Codex에게 보낼 프롬프트>"
```

Codex 수정 완료 보고를 받을 때는 아래 명령이 사용된다.

```bash
./scripts/ask-gemini.sh "docs/log/modification_log.md 에 신규 수정 보고 섹션을 추가 저장하였습니다. 해당 증분 섹션에 대한 파일 직접 검토를 요청드립니다."
```

### Gemini Role

Gemini는 agy와 같은 전략/검토 보조 역할을 맡는다. 리서치, 비교 분석, 기획 정리, QA 리뷰, 문서 검토, UI/UX 방향성 검토는 Gemini가 처리하고, 코드 수정, 리팩토링, 파일 변경, 테스트 실행, 빌드/런타임 오류 수정은 Codex에게 위임한다.
