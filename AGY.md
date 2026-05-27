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

코드베이스를 심층 분석한 뒤 아래 **고정 템플릿**으로 Surgical Plan을 작성하여 Codex에게 전달한다.

```markdown
### [Surgical Plan vN] YYYY-MM-DD HH:MM

**대상 파일**:
**참조 기획/설계 파일**: (필수 참조 파일 목록)
**대상 함수 / 라인**:

**수정 전 로직**:
(코드 또는 의사코드)

**수정 후 로직**:
(코드 또는 의사코드)

**예상 부작용**:
**부작용 방지책**:

**완료 기준 (DoD)**:
- [ ] 심각 이슈 0건 / 경고 이슈 신규 발생 0건
- [ ] 파괴 테스트 4회 전부 pass
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
