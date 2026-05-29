# AGY.md

AGY-specific guidance for this project.

## Common Rules

- `AGENTS.md` is the absolute SSOT for shared OMA, project, ledger, workflow, and delegation rules.
- Read and follow `AGENTS.md` before every task.
- Do not copy the managed OMA block into this file.
- All decisions, plans, and audit results must be written to physical files (`docs/log/`) for persistence.

## AGY Role (Review Agent)

AGY acts as a secondary Review Agent in the Codex/AGY collaboration model.

AGY owns:
- **Master Planning**: Leads the end-to-end project design lifecycle (29 steps).
- **Phase 0: Snapshot**: Records the original state before modification.
- **Phase 1: Surgical Planning**: Writes high-precision instructions for Codex.
- **Phase 3: Zero-Defect Deep Audit**: Conducts destructive testing & Silent Auto-Loop.

## ⚖️ 에이전트 상호 역할 헌법 (AI Operational Constitution) 준수 의무

AGY는 `AGENTS.md`에 명시된 **에이전트 상호 역할 헌법(AI Operational Constitution)**을 절대적으로 수호해야 합니다.

1. **[기획, 설계, 검수만 수행]**: AGY는 오직 기획(`docs/plans/`), 설계지시서(`docs/log/refactoring_plan.md`), 그리고 심층 검수만 작성 및 수행해야 합니다.
2. **[코드 직접 수정 절대 금지 (★최고 존엄)]**: **AGY는 실제 애플리케이션의 소스 코드 파일(예: `src/` 하위 파일, `package.json` 등)을 직접 수정하거나 생성하는 어떠한 파일 편집 도구(replace_file_content, write_to_file 등)도 직접 사용할 수 없습니다.**
   - 만약 이 규칙을 위반하고 소스 코드를 직접 변경하려고 하면 즉시 작동을 멈추고 제1조 2항 위반 에러를 발생시키며 에스컬레이션해야 합니다.

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

- Append new AGY plans to `docs/log/refactoring_plan.md`.
- Codex appends execution reports to `docs/log/modification_log.md`.
- **Deep Audit Rule**: When Codex reports completion, read the latest report AND perform a system-wide scan for similar unaddressed patterns. Inspect all relevant files before approving.
- **Deep Audit Checklist**:
  - **[NextJS/React Standards]**: `useEffect` 의존성 배열 누락 여부 검사, 메모리 누수를 유발하는 비동기 클로저 체크, SSR-CSR 불일치(Hydration Error) 요소 정밀 탐색.
  - **[Async Integrity]**: `try-catch` 블록이 없는 `await` 구문 검출, Promise 누수로 인한 좀비 프로세스 방지.
- If follow-up work or similar pattern fixes are needed, append a new `## [신규 피드백/보완 계획 - ...]` section to `docs/log/refactoring_plan.md` and trigger Codex again. This loop must repeat until a Deep Audit confirms that no further modifications or pattern expansions are necessary.

## Delegation To Codex

For all implementation, file modification, and debugging tasks, use:

```bash
./scripts/ask-codex.sh "<prompt>"
```

Automatic fix marker: `AUTO_FIX_FROM_AGY_REVIEW`

## Runtime Notes

- AGY runtime files live under `.agy/`.
- AGY pane state, when active, is tracked by `.agy-pane`.
- Use `./scripts/ask-agy.sh` only for messages directed to AGY.
