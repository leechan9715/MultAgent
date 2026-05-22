# MultAgent AI Collaboration Workspace

이 저장소는 Codex와 Review Agent(agy 또는 Gemini)를 tmux 2분할로 함께 사용하는 AI 협업 작업공간입니다. 현재 공유 규칙의 SSOT는 `AGENTS.md`이며, README는 빠른 실행과 구조 요약만 제공합니다.

## Quick Start

기본 Codex + agy 조합:

```bash
./scripts/start-ai.sh
```

Codex + Gemini 조합:

```bash
./scripts/start-ai.sh gemini
```

실행 후 tmux 왼쪽 pane은 Codex, 오른쪽 pane은 선택한 Review Agent입니다.

## 역할 분담

| 담당 | 역할 |
| --- | --- |
| Codex | 코드 수정, 리팩토링, 디버깅, 테스트 실행, 빌드/런타임 오류 해결, Git diff 확인 |
| Review Agent(agy/Gemini) | 리서치, 비교 분석, 기획, 아키텍처/QA/문서 검토, 긴 문맥 분석 |

구현이나 파일 변경이 필요한 작업은 Codex가 담당합니다. 리뷰나 분석 결과를 바탕으로 수정이 필요하면 Review Agent가 `AUTO_FIX_FROM_AGY_REVIEW` 또는 `AUTO_FIX_FROM_GEMINI_REVIEW` 마커를 붙여 Codex에 위임합니다.

## SSOT 구조

| 파일/디렉터리 | 용도 |
| --- | --- |
| `AGENTS.md` | 공통 프로젝트 규칙, 위임 규칙, 장부 프로토콜의 SSOT |
| `AGY.md` | AGY 런타임 전용 보조 지침 |
| `GEMINI.md` | Gemini 런타임 전용 보조 지침 |
| `.agents/` | oh-my-agent 설정, skills, workflows의 SSOT. 직접 수정하지 않습니다. |
| `.codex/agents/` | Codex native custom agent 정의 |
| `.agy/agents/` | agy native agent 정의 |
| `.gemini/agents/` | Gemini native agent 정의 |
| `docs/log/refactoring_plan.md` | Review Agent가 append-only로 작성하는 수정 계획 장부 |
| `docs/log/modification_log.md` | Codex가 append-only로 작성하는 수정 보고 장부 |
| `docs/setup/` | 설치 및 운영 보조 문서 |

상세한 규칙, 예외, 협업 프로토콜은 `AGENTS.md`를 기준으로 확인합니다. `AGY.md`와 `GEMINI.md`는 공통 규칙을 복제하지 않고 각 런타임에 필요한 차이만 보관합니다.

## Hook 및 Workflow 기준

- 공통 OMA 설정은 `.agents/`가 기준입니다.
- Runtime hook 구현은 `.codex/hooks/`, `.agy/hooks/`, `.gemini/hooks/`에 위치합니다.
- 중복 trigger 정의는 줄이고, 현재 `triggers.json`은 `.gemini/hooks/triggers.json`만 유지합니다.
- Workflow는 프롬프트 키워드 또는 명시 요청으로 실행됩니다. 직접 실행 규칙은 `AGENTS.md`와 `.agents/workflows/`를 따릅니다.

## Pane 메시지 전송

```bash
./scripts/ask-codex.sh "Codex에게 보낼 메시지"
./scripts/ask-agy.sh "agy에게 보낼 메시지"
./scripts/ask-gemini.sh "Gemini에게 보낼 메시지"
```

`scripts/start-ai.sh`는 활성 pane id를 `.codex-pane`, `.agy-pane`, `.gemini-pane` 중 필요한 파일에 기록합니다. 이 파일들은 런타임 상태 파일이며 사람이 직접 편집할 필요가 없습니다.

## 장부 기반 수정 루프

1. Review Agent가 `docs/log/refactoring_plan.md` 하단에 신규 계획 또는 보완 계획을 추가합니다.
2. Codex는 최신 증분 섹션만 읽고 수정합니다.
3. Codex는 `docs/log/modification_log.md` 하단에 신규 수정 보고를 추가합니다.
4. Codex는 활성 Review Agent 스크립트로 검토 요청을 보냅니다.
5. Review Agent는 최신 보고 섹션과 실제 변경 파일을 직접 검토합니다.

기존 장부 내용은 덮어쓰지 않고 항상 append-only로 유지합니다.

## 주의 사항

- `.agents/`는 직접 수정하지 않습니다.
- 민감 정보(API key, password, token)는 프롬프트나 장부에 넣지 않습니다.
- 코드 변경 후에는 가능한 한 `git diff --check`, 관련 테스트, 파일 존재 검증을 실행합니다.
- 리뷰 결과만 믿고 승인하지 말고 실제 변경 파일을 확인합니다.
- 새로운 상세 운영 문서는 `docs/setup/`에 둡니다.
