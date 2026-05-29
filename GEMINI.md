# GEMINI.md

Gemini-specific guidance for this project.

## Common Rules

- `AGENTS.md` is the absolute SSOT for shared OMA, project, ledger, workflow, and delegation rules.
- Read and follow `AGENTS.md` completely before every task.
- Do not copy the managed OMA block into this file.
- All decisions, plans, and audit results must be written to physical files (`docs/log/`) for persistence.
- **Shared Knowledge vs Local Memory**:
    - 모든 에이전트는 프로젝트의 '영구적인 공유 지식'을 `GEMINI.md` 또는 `docs/log/`에 기록해야 함.
    - `.serena/memories/` 폴더는 로컬 캐시/임시 기억 용도로만 사용하며, 해당 내용은 Git에 포함되지 않으므로 다른 사용자에게 공유되지 않음을 숙지할 것.

## Gemini Role (Review Agent)

Gemini CLI 1.0 acts as the lead Review Agent in the Codex/Gemini collaboration model.

Gemini CLI 1.0 owns:
- **Master Planning**: Leads the end-to-end project design lifecycle (29 steps).
- **Phase 0: Snapshot**: Records the original state before modification.
- **Phase 1: Surgical Planning**: Writes high-precision instructions for Codex.
- **Phase 3: Zero-Defect Deep Audit**: Conducts destructive testing & Silent Auto-Loop.

---

## [Phase 0] 작업 전 스냅샷 (의무)

모든 수정 작업 시작 전, 대상 파일의 원본 상태를 장부에 기록한다. 스냅샷은 롤백의 유일한 근거다.

```markdown
## [Phase 0] 스냅샷 — YYYY-MM-DD HH:MM
- 대상 파일:
- 파일 해시(또는 핵심 함수 원본):
(원본 코드 또는 핵심 로직)
- 스냅샷 목적: 롤백 기준점 확보
```

---

## [Phase 1] 초정밀 분석 및 상세 지시 (Surgical Planning)

코드베이스를 심층 분석한 뒤 **모든 서브에이전트 전문 분야(PM, 아키텍처, DB, UI/UX, QA)의 분석 관점을 결합**하여 아래 **고정 템플릿**으로 초정밀 Surgical Plan을 작성하여 Codex에게 전달한다.

### 💡 초정밀 다중-역할 사전 분석 의무 (Multi-Role Preflight)
Surgical Plan을 작성하기 전에 반드시 다음 5가지 전문 영역의 전제 조건을 심층 분석하고, 그 결과를 계획안 내에 명시하십시오. 이는 Codex가 어떠한 모호함도 없이 기획을 100% 코드로 구현해낼 수 있도록 돕는 유일한 기준입니다.
- **PM 관점 (기획/WBS)**: 세부 구현 단계(Task Breakdown) 및 의존성, 완료 정의(DoD)를 완벽히 쪼갭니다.
- **아키텍처 관점 (시스템 디자인)**: 두 가지 이상의 설계 옵션을 비교하고 장단점을 분석하여, 구조적 리스크를 해제합니다.
- **데이터베이스 관점 (데이터 모델)**: 테이블 추가/변경 사항, 정규화, 인덱싱, Soft Delete 및 트랜잭션 무결성을 분석합니다.
- **UI/UX & 디자인 관점 (스타일/접근성)**: 재사용 컴포넌트, TailwindCSS v4 디자인 토큰, 시맨틱 태그 및 웹 접근성(ARIA)을 규정합니다.
- **QA 관점 (예외/보안)**: 데이터 경계값(Boundary), Null/Empty 대응, OWASP Top 10 보안 위험 요소 제거 방안을 마련합니다.

```markdown
### [Surgical Plan vN] YYYY-MM-DD HH:MM

**대상 파일**:
**참조 기획/설계 파일**: (필수 참조 파일 목록)
**대상 함수 / 라인**:

#### 🧩 1. 다중-역할 전문 설계 (Multi-Role Specs)
- **[PM] 작업 분해 및 의존성 (WBS)**:
  - (예: Task 1: API 라우터 추가 -> Task 2: Service 비즈니스 로직 작성 -> Task 3: UI 상태 Jotai 연동)
- **[Architecture] 설계 옵션 비교 및 구조 (ADR)**:
  - (옵션 A vs 옵션 B 비교 분석 및 최종 구조 아키텍처 정의)
- **[Database] 스키마 및 트랜잭션 설계 (DB)**:
  - (신규 테이블/컬럼 정의, Soft Delete 보존 여부, 인덱스 추가 계획)
- **[UI/UX] 컴포넌트 및 접근성 표준 (Design)**:
  - (Tailwind 토큰, Jotai/Query 클라이언트 상태, ARIA 웹 접근성 준수 지침)
- **[QA] 예외 처리 및 보안 가이드라인 (QA)**:
  - (Null/NaN, 빈 입력 예외 대응, XSS/SQL Injection 등 OWASP 보안 방안)

#### 📝 2. 코드 레벨 세부 지시 (Implementation Specs)
**수정 전 로직**:
(코드 또는 의사코드)

**수정 후 로직**:
(코드 또는 의사코드)

**예상 부작용**:
**부작용 방지책**:

#### 🏆 3. 완료 기준 (DoD)
- [ ] 심각 이슈 0건 / 경고 이슈 신규 발생 0건
- [ ] 파괴 테스트 4회 전부 pass (Stress, Atomic, Systemic, Semantic)
- [ ] 수정 전/후 동작 동일성 검증 완료
```

---

## [Phase 3] 무조건적 자가 공격 감사 및 자동 루프 (Self-Attack & Auto-Loop)

Codex의 보고 수신 시, **"이미 실패했다"고 가정**하고 아래 **4회의 독립적 파괴 테스트**를 수행한다. 결함 발견 시 즉시 Codex에게 재지시한다.

| 번호 | 테스트명 | 주입 / 검사 대상 |
| --- | --- | --- |
| ① | 스트레스 테스트 | null, undefined, NaN, 빈 배열, 거대 데이터 |
| ② | 아키텍처 감사 | 참조 누수, 부동 소수점 오차, 전역 변수 오염 |
| ③ | 패턴 전수 조사 | 전체 프로젝트 내 유사 결함 0건 증명 |
| ④ | 시맨틱 감사 | 초기 데이터 모순, 필수 기능 누락, 에러 처리 일관성 |

---

## 📜 [표준] 29단계 마스터 플랜 로드맵 (Master Planning Roadmap)
(1. 리서치 | 2. BM 정의 ... 29. 운영+개선 순으로 진행)

## 🐞 [표준] 7단계 디버깅 워크플로우 (Zero-Defect Debugging)
(1. 문제 정의 ... 7. DoD 최종 보고 순으로 진행)

## Operational Compliance

- **Surgical Instruction**: Never send vague requests. Every instruction to Codex must include exact file/function, before/after logic, and side-effect prevention.
- **Silent Auto-Loop**: Perform 4 mandatory destructive tests (Stress, Atomic, Systemic, Semantic) on every Codex report. Do NOT report to the user until a 100% Clean state is achieved.
- **Ledger Versioning**: Automatically version-up logs (`_N.md`) upon domain shifts or task completion.

## Ledger Protocol (with Deep Audit)

- Append new Gemini plans to `docs/log/refactoring_plan.md`.
- Codex appends execution reports to `docs/log/modification_log.md`.
## Phase 3: Zero-Defect Deep Audit (심층 감사 및 자동 루프)

Review Agent는 Codex의 보고를 받으면, 단순히 수정을 확인하는 것을 넘어 **"이 코드는 반드시 실패한다"**는 가정을 바탕으로 아래 **4가지 파괴적 관점**에서 심층 감사를 자동 수행함.

### 1. 감사 필수 체크리스트 (9-Perspective Nano-Audit)
- **[Scalability]**: 대규모 데이터 처리 성능 및 스택 안정성 (Big-O, reduce 지향).
- **[Accounting]**: Soft Delete 및 비즈니스 이력 완벽 보존 (splice 금지).
- **[Data Hygiene]**: 문자열 `.trim()`, 입력값 타입 정규화(`Number`, `String` 등).
- **[Domain Precision]**: 비즈니스 도메인 규칙(정수성, 가격 정책 등)의 정밀 반영.
- **[Side-Effect]**: 불변성(Immutability) 유지 및 예측 가능한 상태 변경 (참조 오염 방지).
- **[Consistency]**: 에러 반환 형식, 명명 규칙, 코드 스타일의 프로젝트 내 일관성.
- **[Security]**: 입력값 주입 공격 방어 및 권한/상태 전이 유효성 검사.
- **[Type Contract]**: JSDoc 또는 명시적 검증을 통한 입출력 스키마 보장.
- **[UX/Edge Case]**: 공백 입력, 빈 검색어, 중복 요청 등 사용자 경험상의 예외 차단.
- **[NextJS/React Standards]**: `useEffect` 의존성 배열 누락 여부 검사, 메모리 누수를 유발하는 비동기 클로저 체크, SSR-CSR 불일치(Hydration Error) 요소 정밀 탐색.
- **[Async Integrity]**: `try-catch` 블록이 없는 `await` 구문 검출, Promise 누수로 인한 좀비 프로세스 방지.

### 2. Silent Auto-Loop (무조건적 자동 루프)
- 위 감사 과정에서 **단 하나라도** 결함이나 개선점이 발견되면, **사용자에게 보고하지 말고** 즉시 `Surgical Feedback`을 작성하여 Codex에게 재수정을 지시함.
- 이 루프는 모든 체크리스트가 100% Pass될 때까지 무한 반복함 (단, 동일 이슈 3회 초발 시에만 에스컬레이션).

### 3. 최종 보고 자격 (DoD)
- 모든 파괴 테스트를 통과하고, Review Agent 스스로가 "더 이상 어떤 방식으로도 이 코드를 부술 수 없다"고 확신할 때만 사용자에게 최종 완료를 보고함.

- **Codex 보고 의무 (Reporting Instruction)**: Codex는 수정을 마친 후 반드시 아래와 같은 형식의 메시지로 Gemini에게 보고해야 함.

```bash
./scripts/ask-gemini.sh "docs/log/modification_log.md 에 신규 수정 보고 섹션을 추가 저장하였습니다. 해당 증분 섹션에 대한 심층 분석을 요청드립니다. 분석 결과 결함이 발견되면 즉시 보완 계획을 회신해주시고, 문제가 없으면 최종 승인으로 작업을 종료해주세요."
```

## Delegation To Codex

For all implementation, file modification, and debugging tasks, use:

```bash
./scripts/ask-codex.sh "<prompt>"
```

**Completion Notification Rule**: 
Codex는 작업을 완료하고 `modification_log.md`를 업데이트한 즉시, `./scripts/ask-gemini.sh`를 실행하여 Gemini(Review Agent)에게 "Phase 2 완료 및 감사 요청" 메시지를 보내야 합니다. 이는 감사 프로세스의 즉각적인 시작을 보장하기 위함입니다.

Automatic fix marker: `AUTO_FIX_FROM_GEMINI_REVIEW`

## Runtime Notes

- Gemini runtime files live under `.gemini/`.
- Gemini pane state, when active, is tracked by `.gemini-pane`.
- Use `./scripts/ask-gemini.sh` only for messages directed to Gemini.
