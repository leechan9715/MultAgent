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

---

## Hook Location Note

OMA 관리 블록에는 공통 hook 경로가 `.agents/hooks/core/triggers.json`로 표시될 수 있다.
이 프로젝트의 실제 런타임 hook 파일은 아래 매핑 테이블을 기준으로 한다.
**OMA 관리 블록은 절대 직접 수정하지 않는다.**

| OMA 표시 경로                      | 실제 런타임 경로 | 담당 에이전트      |
| ---------------------------------- | ---------------- | ------------------ |
| `.agents/hooks/core/triggers.json` | `.codex/hooks/`  | Codex              |
| `.agents/hooks/core/triggers.json` | `.agy/hooks/`    | Review Agent (agy) |

---

## 에이전트 역할 정의

역할이 명확하지 않으면 Phase 경계에서 책임 공백이 생긴다. 역할 침범이 감지되면 즉시 작업을 중단하고 에스컬레이션한다.

| 에이전트               | 역할                            | 금지 행동                                           |
| ---------------------- | ------------------------------- | --------------------------------------------------- |
| **Review Agent (agy)** | 분석·계획·감사·장부 버전업 판단 | 코드 직접 수정, Codex 보고 없이 감사 생략           |
| **Codex**              | 코드 구현·자가 검증·보고        | Surgical Plan 없이 수정 시작, 장부 버전업 단독 실행 |

---

## Append-Only Ledger Protocol [Persistent Protocol] [Codex/Review Agent Collaboration]

이 프로젝트의 Codex와 Review Agent(agy/Gemini) 협업은 이력 누적형 Markdown 장부를 SSOT로 사용한다.
모든 작업은 **[Phase 0 → 초정밀 분석 → 상세 지시 → 구현 → 심층 감사 → 재귀적 보완]** 루프를 따른다.
루프는 DoD(Definition of Done) 전부 통과 시에만 종료된다.

```
Phase 0: 스냅샷 (의무)
    ↓
Phase 1: 초정밀 분석 & Surgical Plan 작성 (Review Agent)
    ↓
Phase 2: 구현 & 증거 기반 보고 (Codex)
    ↓
Phase 3: 자가 공격 감사 & 자동 루프 (Review Agent)
    ↓
[DoD 4가지 전부 통과?] → YES → 사용자 최종 보고
                        → NO  → Phase 1 재귀
                                (단, 동일 이슈 재발 3회 초과 시 에스컬레이션)
```

### Ledger Files

| 장부                                | 경로                             | 작성 주체    |
| ----------------------------------- | -------------------------------- | ------------ |
| 수정 계획 장부 (Surgical Plan)      | `docs/log/refactoring_plan_N.md` | Review Agent |
| 수정 보고 장부 (Implementation Log) | `docs/log/modification_log_N.md` | Codex        |

### 동시 쓰기 충돌 방지 (Race Condition)

장부는 append-only이며 동시 쓰기 충돌을 막기 위해 아래 규칙을 따른다.

1. 장부에 쓰기 전, 파일 말미의 마지막 타임스탬프를 확인한다.
2. 내가 마지막으로 읽은 줄 이후에만 append한다.
3. 충돌이 감지되면 `.conflict` 파일을 생성하고 즉시 사용자에게 에스컬레이션한다. 추측으로 진행하지 않는다.

---

## [Phase 0] 작업 전 스냅샷 (의무)

Review Agent는 모든 수정 작업 시작 전, 대상 파일의 원본 상태를 장부에 기록한다.
**스냅샷 없이 Phase 1로 진행하는 것은 금지다.** 스냅샷은 롤백의 유일한 근거다.

```markdown
## [Phase 0] 스냅샷 — YYYY-MM-DD HH:MM

- 대상 파일:
- 파일 해시(또는 핵심 함수 원본):
```

(원본 코드 또는 핵심 로직 붙여넣기)

```
- 스냅샷 목적: 롤백 기준점 확보
```

---

## [Phase 1] 초정밀 분석 및 상세 지시 (Surgical Planning)

Review Agent는 물리적 파일 저장을 보장하며, 코드베이스를 심층 분석한 뒤 아래 **고정 템플릿**으로 Surgical Plan을 작성한다.
Codex는 이 상세 지시서의 **최신 섹션만** 읽고 작업을 개시한다.

```markdown
### [Surgical Plan vN] YYYY-MM-DD HH:MM

**대상 파일**:
**대상 함수 / 라인**:

**수정 전 로직**:
(구체적 코드 또는 의사코드)

**수정 후 로직**:
(구체적 코드 또는 의사코드)

**예상 부작용**:
**부작용 방지책**:

**완료 기준 (DoD)**:

- [ ] 심각 이슈 0건
- [ ] 경고 이슈 신규 발생 0건
- [ ] 파괴 테스트 4회 전부 pass
- [ ] 수정 전/후 동작 동일성 검증 완료
```

---

## [Phase 2] 구현 및 증거 기반 보고 (Execution)

Codex는 지시사항을 이행한 후 아래 **고정 템플릿**으로 `modification_log_N.md`에 기록한다.
"상세히"가 아닌 아래 형식을 반드시 준수한다.

```markdown
## [Phase 2] Codex 작업 보고 — YYYY-MM-DD HH:MM

- **수정 파일**:
- **수정 함수 / 라인**:
- **수정 전 로직**:
  (코드)
- **수정 후 로직**:
  (코드)
- **자가 검증 방법**:
  (어떤 입력으로, 어떤 방식으로 검증했는지)
- **자가 검증 결과**:
  (pass / fail + 근거)
- **잔존 의심 사항**:
  (없으면 "없음"으로 명시)
```

---

## [Phase 3] 무조건적 자가 공격 감사 및 자동 루프 (Self-Attack & Auto-Loop)

Review Agent는 Codex의 보고 수신 시, **"이미 실패했다"고 가정**하고 아래 **4회의 독립적 파괴 테스트**를 의무 수행한다.

### 독립성 보장 규칙

- 각 테스트는 독립된 메모리 스냅샷 기준으로 수행한다.
- 테스트 전 반드시 상태를 초기화한다. 이전 테스트의 오염된 상태를 이어받지 않는다.
- 테스트 순서는 항상 **①→②→③→④ 고정**이며 순서 변경은 금지다.

### 파괴 테스트 4종

| 번호 | 테스트명               | 주입 / 검사 대상                                                          |
| ---- | ---------------------- | ------------------------------------------------------------------------- |
| ①    | 스트레스 테스트        | `null`, `undefined`, `NaN`, `Infinity`, 잘못된 타입, 빈 배열, 거대 데이터 |
| ②    | 아키텍처 감사          | 참조 누수(Reference Leak), 부동 소수점 오차, 전역 변수 오염, 클로저 누수  |
| ③    | 패턴 전수 조사         | `search_for_pattern`으로 프로젝트 전체에서 유사 결함 0건 증명             |
| ④    | 시맨틱 & 비즈니스 감사 | 초기 데이터 모순, 필수 기능 누락, 에러 처리 일관성, 고수준 설계 결함      |

### 자동 루프 (Silent Loop)

- 위 테스트 중 단 하나라도 실패하거나 "더 나은 방법"이 떠오른다면, **사용자에게 절대 보고하지 말고** 즉시 [Surgical Feedback]을 작성하여 Codex에게 재지시한다.
- 단, **동일 이슈로 재발 3회 초과 시** Silent Loop를 즉시 중단하고 에스컬레이션 프로토콜을 따른다.

### 자기 편향 방지

Review Agent는 자신이 작성한 Surgical Plan을 감사할 때 아래를 추가로 수행한다.

1. 이전 라운드 Plan과 이번 감사 결과를 교차 비교한다.
2. "이전 Plan에서 내가 놓친 게 있는가?"를 명시적으로 확인한 뒤 장부에 기록한다.
3. 자기 Plan을 옹호하는 방향으로 감사 결과를 기술하는 것은 직무유기다.

### DoD (Definition of Done) — 보고 자격 조건

오직 아래 4가지가 **모두 장부에 체크**되었을 때만 사용자에게 최종 보고를 할 자격이 생긴다.
모든 결과는 메모리가 아닌 하드디스크 MD 파일에 영구 저장된다.

- [ ] 심각(critical) 이슈 0건
- [ ] 경고(warning) 이슈 신규 발생 0건
- [ ] 파괴 테스트 ①②③④ 전부 pass (장부에 각 결과 기록)
- [ ] 수정 전/후 동작 동일성 검증 완료

> **경고**: 사용자님이 "한 번 더 검사해봐"라고 했을 때 보완 사항이 또 나온다면, 이는 Review Agent의 직무유기이며 시스템의 수치로 간주한다.

---

## 에스컬레이션 프로토콜

아래 상황에서는 Silent Loop를 즉시 중단하고 사용자에게 보고한다.
**추측으로 계속 진행하는 것은 엄격히 금지된다.**

| 트리거         | 조건                                                  |
| -------------- | ----------------------------------------------------- |
| 무한루프 방지  | 동일 이슈로 [Surgical Feedback] 3회 초과 재발         |
| 장부 손상      | 장부 파일 불일치 또는 파싱 불가 상태 감지             |
| 동시 쓰기 충돌 | `.conflict` 파일 생성된 경우                          |
| 복구 불명      | 세션 재시작 후 진행 상태가 불분명할 때                |
| 역할 침범      | 에이전트가 자신의 역할 범위를 벗어난 행동을 시도할 때 |

```markdown
## [ESCALATION] YYYY-MM-DD HH:MM

- **트리거 조건**:
- **현재 상태**:
- **재발 횟수** (해당 시):
- **에이전트 판단**:
- **사용자 결정 요청 사항**:
```

---

## 작업 도메인 기반 장부 분리(Versioning) 규칙

이 프로젝트는 작업의 집중도와 이력 관리 효율을 위해 **'도메인 분리형 장부 시스템'**을 강제한다.

### 장부 신규 생성(버전업) 트리거

아래 상황 중 하나라도 해당하면, 기존 장부(`_N.md`)를 보존하고 즉시 새로운 번호(`_N+1.md`)의 장부를 생성한다.
**판단 권한은 Review Agent 단독**이다. Codex는 버전업 제안만 가능하며 실행 전 Review Agent 승인이 필요하다.
긴급 상황 시 Codex 독자 생성 가능하나, 생성 이유를 장부 첫 줄에 반드시 명시한다.

- **도메인 전환**: 시스템 설정/인프라 작업에서 애플리케이션 로직/기능 구현으로 넘어갈 때
- **맥락의 단절**: 이전 작업의 "심층 분석"이 종료(Completed)된 후, 새로운 주제의 요청이 들어왔을 때
- **역할의 변화**: 리서치/분석 위주 작업에서 실제 대규모 코드 수정 작업으로 전환될 때
- **긴급 보안 패치**: 도메인과 무관하게, 보안 취약점이 발견된 즉시 별도 장부 생성

### 영속성(Persistence) 유지 수칙

에이전트는 세션이 재시작되거나 환경이 바뀌어도 아래 절차를 따른다.
**스스로 추측하여 진행하는 것은 금지다.**

1. `docs/log/` 폴더에서 최신 번호 장부를 읽고 마지막 상태(Phase, 진행 여부)를 파악한다.
2. 마지막 상태가 **"진행중"**이면 해당 Phase부터 재개한다.
3. 마지막 상태가 **"Completed"**이면 새 작업 대기 상태로 전환한다.
4. 장부 손상·내용 불일치·파싱 불가 감지 시 → 즉시 작업 중단 후 에스컬레이션.

새로운 도메인 작업 시작 시, 에이전트는 사용자에게 묻지 않고 **스스로 판단하여** 새 장부 파일을 생성하고 이 문서의 규칙을 준수한다.

---

## 변경 이력

| 날짜      | 버전 | 변경 내용                                                                                                                                                                                                          | 작성자 |
| --------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| 최초 작성 | v1.0 | 초기 프로토콜 (Append-Only Ledger, 3 Phase)                                                                                                                                                                        | 사용자 |
| 보완      | v3.0 | Phase 0 스냅샷 의무화, DoD 4항목 명문화, 에스컬레이션 프로토콜, 장부 템플릿 고정화, Race Condition 방지, 자기 편향 방지, 역할 정의 테이블, hook 경로 매핑 테이블, 긴급 보안 패치 트리거, 세션 복구 4단계 절차 추가 | Claude |
