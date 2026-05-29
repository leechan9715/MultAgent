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

## [Codex 전용] 구현 및 증거 기반 보고 (Phase 2: Execution)

이 섹션은 **Codex**가 작업을 수행할 때 반드시 지켜야 하는 **표준 실행 명세**입니다.

### 1. 작업 전 전제 조건
Codex는 실제 구현을 시작하기 전에 반드시 **Surgical Plan에 명시된 '참조 기획/설계 파일'들을 우선적으로 조회**하여 해당 작업의 구체적인 컨텍스트를 파악해야 합니다. 무분별한 전체 파일 조회는 금지하며, 지정된 파일 내의 규칙을 엄격히 준수합니다.

### 2. 구현 및 보고 템플릿 (Implementation Log)
지시사항을 이행한 뒤 아래 **고정 템플릿**으로 `modification_log_N.md`에 기록합니다.

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
- **성능 및 복잡도 분석**:
  (Big-O 시간/공간 복잡도 및 최적화 요소 기술)
- **잔존 의심 사항**:
  (없으면 "없음"으로 명시)
```

### 3. 자가 검증 의무 (Self-Verification)
Codex는 보고 전 반드시 다음 사항을 스스로 확인해야 합니다.
- **빌드 및 린트**: `npm run lint` 및 타입 체크 결과가 100% Pass인가?
- **계획 일치**: Surgical Plan에 명시된 로직 변화가 오차 없이 반영되었는가?
- **범위 준수**: 계획에 없는 파일을 임의로 수정하지 않았는가?

### 4. 자가 오류 디버깅 루프 (Zero-Defect Self-Correction)
빌드, 린트 또는 자가 테스트 중 에러가 발생한 경우, Codex는 작업을 즉시 중단하고 대기하는 대신 아래 디버깅 루프를 수행해야 합니다.
1. **에러 원인 고립**: 터미널 출력(Stack Trace, Compiler Output)을 분석하여 에러가 발생한 정확한 위치(File:Line)와 원인 파악.
2. **가설 설정**: 타입 불일치, 누락된 임포트, 비동기 Race Condition 등 원인에 대한 구체적 가설 수립.
3. **정밀 수정(Surgical Fix)**: 다른 정상 파일에 파급 효과가 없는 가장 가볍고 명확한 수정안을 작성하고 반영.
4. **재검증**: 테스트 및 빌드를 재구동하여 에러 해결(Green) 확인. 해결되지 않으면 최대 3회까지 이 디버깅 루프를 반복 수행.

---

## Append-Only Ledger Protocol [Persistent Protocol] [Codex/Review Agent Collaboration]

모든 작업은 **[기획(Review Agent) → 구현(Codex) → 감사(Review Agent)]** 루프를 따릅니다.

1.  **기획 (Phase 0-1)**: 리뷰 에이전트(`GEMINI.md` / `AGY.md`)가 담당.
2.  **구현 (Phase 2)**: Codex(`AGENTS.md`)가 담당.
3.  **감사 (Phase 3)**: 리뷰 에이전트(`GEMINI.md` / `AGY.md`)가 담당.

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

# 에이전트 구동 엔진 및 프로젝트 로드맵 (AI Operational Standards)

이 섹션은 에이전트가 프로젝트를 기획하고 실행할 때 따라야 하는 **표준 프로세스 명세**입니다.

## 📜 [표준 1] 고수준 마스터 플랜 (Master Planning)

프로젝트의 전체 기획 및 로드맵 수립은 **리뷰 에이전트(Gemini CLI 1.0 또는 agy)**의 전담 책임입니다. 모든 새로운 프로젝트 기획 시, 리뷰 에이전트는 자신의 전용 지침서(`GEMINI.md` 또는 `AGY.md`)에 정의된 **29단계 마스터 플랜 로드맵**에 따라 `docs/plans/`에 문서를 생성해야 합니다.

---

## 🛠 [표준 2] 18단계 협업 메커니즘 (Detailed 18-Step Lifecycle)

### [Phase 1: PLAN] - 초정밀 기획 및 설계
1. **요구사항 심층 분석** (Step 1)
2. **API 컨트랙트 및 인터페이스 정의** (Step 2)
3. **작업 세분화 및 WBS 생성** (Step 3)
4. **3중 계획 리뷰** (Step 4)

### [Phase 2: IMPL] - 병렬 구현 및 실행
5. **에이전트 스폰 및 병렬 구현** (Step 5) (Codex 정독 구현 포함)

### [Phase 3: VERIFY] - 품질 검증 및 감사
6. **기획 정렬 리뷰** (Step 6)
7. **보안 및 취약점 리뷰** (Step 7)
8. **회귀 테스트 및 안정성 감사** (Step 8)

### [Phase 4: REFINE] - 코드 정제 및 고도화
9. **모듈 최적화 및 분할** (Step 9)
10. **재사용성 및 통합 리뷰** (Step 10)
11. **사이드 이펙트 전수 조사** (Step 11)
12. **코드 일관성 및 스타일 리뷰** (Step 12)
13. **데드코드 및 흔적 제거** (Step 13)

### [Phase 5: SHIP] - 최종 검사 및 배포 준비
14. **최종 품질 점검** (Step 14)
15. **UX/UI Flow 검증** (Step 15)
16. **연관 이슈 교차 검토** (Step 16)
17. **배포 준비 및 체크리스트 확인** (Step 17)

### [Phase 6: DOC] - 문서 동기화
18. **기술 문서 및 README 동기화** (Step 18)

---

## 🐞 [표준 3] 7단계 디버깅 워크플로우 (Zero-Defect Debugging)

1. **문제 정의 및 리서치**: 패턴 수색 및 심볼 추적.
2. **가설 수립 및 원인 격리**: 데이터 흐름 분석 및 원인 추론.
3. **경험적 재현**: 실패하는 테스트(Red) 선제 구축.
4. **Surgical Fix 설계**: 최소 파괴적 수정안 장부 명세 및 스냅샷.
5. **정밀 구현 및 자가 검증**: 장부 기반 수정 및 테스트 Green 확인.
6. **심층 감사 및 회귀 테스트**: 4대 파괴 테스트 및 영향도 전수 조사.
7. **DoD 최종 승인 및 보고**: 무결점 확인 후 상세 조치 보고.

