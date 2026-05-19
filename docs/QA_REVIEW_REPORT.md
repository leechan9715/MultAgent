# QA Review Report (2026-05-19)

**[종합 검토 의견]**
전체적인 구조와 로직을 꼼꼼히 확인한 결과, **치명적인(CRITICAL) 보안 위험이나 시스템 오작동 우려 사항은 없습니다.**
특히, `ask-*.sh` 스크립트에서 대상 tmux pane을 검증하는 로직(`pgrep`을 통한 `codex`/`gemini` 프로세스 확인), `tmux set-buffer`를 활용한 Bash Quoting(특수문자 파싱 오류) 방지, Hash 기반 중복 전송 방지 로직 등은 모두 매우 안전하고 견고하게 잘 작성되었습니다. 잘못된 이름의 `READMD.md`도 `README.md`로 의도에 맞게 변경되었으며 내용 역시 초보자 친화적 가이드 역할을 충분히 하고 있습니다.

발견된 몇 가지 개선점(Findings)을 우선순위별로 정리했습니다.

---

### 🔍 Findings

**1. HIGH - `.agents/state/` 하위 상태 파일이 Git에 계속 추적됨**
- **대상 파일**: `.agents/state/keyword-detector-state.json`, `.agents/state/skill-sessions.json`
- **문제 설명**: 새로 작성하신 `.gitignore` 내용에 `.agents/state/`가 정상적으로 포함되어 있음에도 불구하고, 현재 `git status`를 보면 두 상태 파일이 `modified` 상태로 계속 잡히고 있습니다. 이는 과거 커밋에서 이 파일들이 이미 추적(Tracked) 상태로 등록되어 버렸기 때문입니다. 이 상태로 두면 AI 에이전트를 쓸 때마다 변경되는 로그 데이터가 계속 커밋 목록을 어지럽히게 됩니다.
- **추천 수정 방향**: 파일의 추적 상태를 캐시에서 제거해야 정상적으로 ignore가 적용됩니다. 다음 작업 진행 시 터미널에서 직접 실행하시거나 Codex에게 아래 명령을 실행하도록 요청하세요.
  `git rm --cached -r .agents/state/`

**2. LOW - `AGENTS.md`와 `GEMINI.md`의 Auto-Detection 훅(Hook) 이벤트 이름 불일치**
- **대상 파일**: `AGENTS.md` (66라인 부근), `GEMINI.md` (66라인 부근)
- **문제 설명**: 문서 내 `## Auto-Detection` 섹션에 명시된 Hook 이름이 두 문서 간에 다르게 기재되어 있습니다.
  - `AGENTS.md`: `UserPromptSubmit`, `PreToolUse`, `Stop`
  - `GEMINI.md`: `BeforeAgent`, `BeforeTool`, `AfterAgent`
- **추천 수정 방향**: Codex와 Gemini CLI의 내부 구조 및 런타임 이벤트 명칭 차이를 의도적으로 구분한 것이라면 이대로 두어도 무방합니다. 다만 둘 다 OMA 관리 블록(`<!-- OMA:START -->` 내부)에 있으므로, OMA 업데이트 시 덮어써질 가능성이 있다는 점만 참고하시면 됩니다.

---

### 📋 주요 검토 기준별 확인 결과 (정상/우수)

- **보안 및 스크립트 안정성 (우수)**:
  - 타겟 Pane에 프로세스(`codex` 혹은 `gemini`)가 살아있는지 검증하고, 없다면 프롬프트 전송을 중단(Refusing)하는 방어 코드가 훌륭합니다. 잘못된 터미널 창으로 민감한 데이터나 명령이 텍스트로 들어가는 보안 사고를 막아줍니다.
  - `tmux set-buffer` 대신 `tmux set-buffer` + `paste-buffer` 조합을 사용해 특수문자 탈출(escaping) 취약점을 완벽히 회피했습니다.
- **Gemini -> Codex 자동 위임 안전성 (정상)**:
  - `AUTO_FIX_FROM_GEMINI_REVIEW` 마커 처리 로직이 잘 구분되어 있고, 30초 내 중복 방지(`DEDUPE_SECONDS`) 해시 로직과 연계되어 무한 루프나 중복 실행 위험이 적절히 차단되었습니다.
- **문서 일관성 (정상)**:
  - `README.md` 내의 가이드 절차와 스크립트(`start-ai.sh`)의 동작이 정확히 일치하며 위임 기준의 모순도 없습니다.
