# Test Flow Specification (Piece Pipeline – Test Version)

**문서 버전:** 1.1
**업데이트:** 2025-12-07
**문서 목적:**
Piece의 Phase1 → Phase2 → Phase3 전체 테스트 플로우를 정의하여
테스트 앱에서 실제 파이프라인을 재현할 수 있도록 한다.
※ 본 문서는 “테스트 환경 기준”이며, 실제 생산 환경과 대부분 동일한 구조를 가진다.

---

## 1. 전체 파이프라인 개요

테스트 앱에서 실행되는 전체 AI 플로우:

```text
Raw Input
   ↓
Phase 1 — Event Split & Classification
   ↓ (사용자 수정)
이벤트 편집 & 프로젝트 할당
   ↓ (Phase2 인터뷰 대상 선택)
Phase 2 — AI 인터뷰 (자동 보강)
   ↓ (AI가 자동 판단)
이벤트 상태 결정: Outcome 후보 / Seed / Log
   ↓
Phase 3 — PACRI 생성 & Seed 저장
   ↓
사용자 후편집 (옵션)
   ↓
DB 저장
```

➜ **핵심 변경:**
Phase 2 끝에서 사용자가 직접 “Seed/Outcome 판단”을 하지 않는다.
→ AI가 자동으로 판단하고,
→ 사용자는 Phase 3 이후에 필요하면 수정한다.

---

## 2. Phase 1 – Event Split & Classification

### 2.1 입력

사용자가 자유롭게 텍스트 입력
예:
“로그인 버그 고치고 대시보드 깨짐 문제 해결했고 PM 요청으로 통계 API 만들었음.”

### 2.2 Phase1 실행

- API `/api/phase1` 호출
- 모델: `gpt-4o-mini`

출력 예:

```json
{
  "events": [
    {
      "idx": 0,
      "text": "로그인 버그 고침",
      "category": "needs_context",
      "missing_info": ["problem", "result", "impact"],
      "is_seed_candidate": false
    }
  ]
}
```

---

## 3. Phase 1 후처리 (사용자 정제 구간)

테스트 앱에서 반드시 필요한 UI 단계.

사용자가 할 수 있는 작업:

1. **이벤트 텍스트 수정**
   - 오타/축약 입력된 내용을 보완 가능
2. **이벤트 삭제**
   - 성과로 쓰기 어려운 의미 없는 이벤트를 제거
3. **카테고리 수동 변경 (옵션)**
   - `needs_context` → `not_achievement` 등 수동 조정 가능
4. **프로젝트 할당 (필수)**
   - 이벤트마다 다음 중 선택:
     - 기존 프로젝트 선택
     - 새 프로젝트 생성
     - 하나의 이벤트가 여러 프로젝트에 속할 수 있음(N:N)

이 단계를 통해 이후 Seed/Outcome이 속할 프로젝트를 정의한다.

---

## 4. Phase 2 – Context Probing 인터뷰

### 4.1 Phase2 실행 대상 선택

이벤트 리스트에 체크박스:
- 기본 선택:
  - `needs_context` → 체크 ON
  - `achievement_ready` → 체크 OFF
  - `not_achievement` → 체크 OFF

사용자가 원하는 이벤트만 인터뷰 진행.

---

### 4.2 Phase2 작동 방식

각 이벤트에 대해:

1. Phase2 호출 → 질문 1개 생성
2. 사용자 답변 입력
3. 답변 저장
4. 사용자가 “더 질문 받기” or “인터뷰 종료” 선택

정책:
- 1회 호출 = 1개의 질문만 생성
- 이후 질문은 사용자가 원할 때만 추가 요청
- 질문은 다음을 기반으로 생성됨:
  - `missing_info`
  - `user.role`
  - `event.original_text`
  - 지금까지의 Q&A 히스토리(테스트 버전에서 옵션)

---

## 5. Phase 2 종료 후 “AI 자동 상태 결정”

여기서 대규모 UX 변화가 반영됨.

사용자는 Seed/Outcome 여부를 직접 선택하지 않는다.
→ **AI가 자동으로 판단한다.**

### AI 자동 규칙

| 조건 | 결과 |
|---|---|
| Achievement_ready | 바로 Outcome 후보 |
| Needs_context + 인터뷰 완료 후 문제·결과·영향이 채워짐 | Outcome 후보 |
| Needs_context + 여전히 정보 부족 | Seed |
| Not_achievement | Log 처리 |

출력 예:

```json
{
  "event_status": "to_outcome",
  "confidence": 0.82
}
```

AI는 다음 중 하나를 반환:
- `to_outcome`
- `to_seed`
- `discard`

---

## 6. Phase 3 – PACRI 생성 / Seed 생성

Phase2에서 자동 분류된 결과에 따라:

### Outcome 후보 → PACRI 생성
- 모델: `GPT-4o`
- 입력:
  - 이벤트 텍스트
  - 인터뷰 답변 리스트
  - 프로젝트 정보

출력:

```json
{
  "title": "로그인 안정성 개선",
  "pacri": {
    "problem": "...",
    "approach": "...",
    "contribution": "...",
    "result": "...",
    "impact": "..."
  },
  "skill_tags": ["React", "Debugging"],
  "quality_score": 86
}
```

### Seed 후보 → Seed 테이블 저장
- `event.text` + 일부 context 저장
- status: `open`

### discard → 저장 안 함

---

## 7. Phase 3 이후 사용자 후처리(UI)

Outcome 리스트 화면에서 사용자는 다음만 수행:

**Outcome 편집 가능**
- PACRI 수동 수정
- `title` 수정
- `skill_tags` 수정
- 삭제 → Seed로 변경(옵션)

**Seed 편집 가능**
- 텍스트 수정
- Seed 제거

---

## 8. 최종 저장
- Outcome / Seeds DB 저장
- `seed_outcome_link` 생성
- 프로젝트 기반으로 UI 리스트 업데이트

---

## 9. 플로우 다이어그램 (텍스트 기반)

```text
[Raw Input]
    ↓
[Phase 1 실행]
    ↓
[이벤트 편집 + 삭제 + 프로젝트 할당]
    ↓
[인터뷰할 이벤트 선택]
    ↓
[Phase 2 질문/답변 루프]
    ↓
[AI 자동 Seed/Outcome 결정]
    ↓
[Outcome → PACRI 생성]
[Seed 저장]
    ↓
[사용자 후편집]
    ↓
[DB 저장]
```
