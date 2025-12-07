# 06. AI Engine
**문서 버전:** 1.0
**업데이트:** 2025-12-06  
**문서 목적:**  
AI Career Harvest OS의 핵심 엔진인 **Phase1 → Phase2 → Phase3 → Seed Linking** 전체 AI 작동 방식을 상세히 정의한다.  
이 문서는 실제 프롬프트 설계, API 연동, 상태 머신 구현의 기준이 된다.

---

# 1. AI Engine 전체 구조

AI 엔진은 다음 4단계로 구성된다:

1. **Phase 1 – Event Split & Classification**  
   Raw Input을 이벤트 단위로 나누고, 각 이벤트를 3가지 상태로 분류  
   - achievement_ready  
   - needs_context  
   - not_achievement (Log)

2. **Phase 2 – Context Probing (질문 생성 및 보완)**  
   needs_context 항목에 대해  
   - 1개의 핵심 질문을 생성  
   - 사용자가 답변하면 보강 정보로 저장  
   - 사용자가 “그만 질문하기” 선택 가능

3. **Phase 3 – PACRI Structuring**  
   성과(Achievement) 확정 시 PACRI 구조로 변환  
   - Problem  
   - Approach  
   - Contribution  
   - Result  
   - Impact  

4. **Phase 4 – Seed Linking Engine**  
   - 해당 Outcome과 관련된 Seed 자동 검색  
   - semantic similarity 기반 매칭  
   - seed_outcome_link 생성  

---

# 2. Phase 1 – Event Split & Classification

### 2.1 처리 단계

1. Raw Input(문단형 텍스트)을 문장 분리(Event Split)
2. 각 Event를 아래 3가지 카테고리로 분류
3. missing_info 배열 생성
4. Seed 후보 여부 판단

### 2.2 Category 조건

| Category | 정의 | 예시 |
|---------|------|------|
| achievement_ready | 문제·행동·결과가 명확 | “응답 속도 40% 개선함” |
| needs_context | 성과 가능성 있으나 맥락 부족 | “로그인 버그 고침” |
| not_achievement | 성과로 보기 어려움 | “회의 많이 함”, “테스트만 해봄” |

---

### 2.3 Phase 1 Output (JSON)

```json
{
  "events": [
    {
      "idx": 0,
      "text": "로그인 버그 고침",
      "category": "needs_context",
      "missing_info": ["problem", "result"],
      "is_seed_candidate": true
    },
    {
      "idx": 1,
      "text": "대시보드 로딩 최적화해 응답 속도 40% 개선",
      "category": "achievement_ready",
      "missing_info": []
    }
  ]
}
```

---

# 3. Phase 2 – Context Probing

### 3.1 트리거 조건  
- category = needs_context

### 3.2 정책

| 항목 | 설명 |
|------|------|
| 질문 수 | 이벤트당 1개 질문 생성 |
| 사용자 옵션 | ① 답변하기 ② 그만 질문하기 |
| 품질 보장 | 추가 정보 없으면 draft 성과 처리 |

---

### 3.3 질문 생성 기준

직군 기반 Role-aware questioning:

#### 개발자(FE/BE/DevOps)
- 어떤 기술적 접근을 했는가?
- 성능/안정성 지표 변화는?

#### PM/PO
- 어떤 지표 문제였는가?
- 사업적 영향은?

#### 디자이너
- 개선 목표는?
- 사용자 불편은 무엇이었는가?

#### 데이터 분석가
- 어떤 데이터 패턴을 발견했는가?
- 인사이트는?

---

### 3.4 Phase 2 Output 예시

```json
{
  "question": "이 로그인 버그를 해결했을 때 사용자 경험이나 성공률이 어떻게 달라졌나요?",
  "event_idx": 0
}
```

사용자 답변 후:

```json
{
  "event_idx": 0,
  "answer": "로그인 성공률이 92%에서 98%로 개선됨"
}
```

---

# 4. Phase 3 – PACRI Structuring

최종 성과를 PACRI 구조로 변환한다.

### 4.1 PACRI 규칙

- **Problem:** 해결해야 했던 배경·문제  
- **Approach:** 구체적 실행/기술  
- **Contribution:** 본인의 기여도(Role)  
- **Result:** 사실 기반 성과  
- **Impact:** 비즈니스·사용자 측면 영향 (정량/정성 모두 허용)

---

### 4.2 Phase 3 Output Example

```json
{
  "pacri": {
    "problem": "로그인 실패율이 특정 OS 환경에서 높았음",
    "approach": "세션 만료 로직 수정 및 API 에러 핸들링 개선",
    "contribution": "로그인 기능 단독 수정",
    "result": "로그인 성공률 92%→98% 개선",
    "impact": "사용자 이탈 감소 및 CS 문의 감소"
  },
  "title": "로그인 안정성 개선",
  "skill_tags": ["React", "Auth", "Debugging"],
  "quality_score": 87
}
```

---

# 5. Phase 4 – Seed Linking Engine

### 5.1 Seed 생성 조건

아래 중 하나라도 true이면 Seed로 지정:

- “문제 발견”, “원인 파악”, “느림”, “오류 확인” 등 문제 성격
- 아직 해결 결과 없음
- 결과 발생 가능성이 높은 잠재 Event

### 5.2 Seed Linking 규칙

Outcome 생성 시:

1. 동일 프로젝트 내 Seed 검색  
2. semantic similarity ≥ 0.80  
3. Seed.created_at < Outcome.created_at  
4. Impact/Problem 키워드 매칭  

### 5.3 Seed Linking Output 예시

```json
{
  "linked_seeds": [
    {
      "seed_id": "abc-123",
      "similarity": 0.89,
      "reason": "같은 '로그인 실패율' 문제 맥락"
    }
  ]
}
```

---

# 6. AI Engine API Flow

### Route: `/api/harvest`

```
Raw Input
   ↓
Phase 1 (Event Split & Classification)
   ↓
Project Mapping (UI)
   ↓
Phase 2 (질문 필요 시)
   ↓
Phase 3 (PACRI 구조)
   ↓
Phase 4 (Seed Linking)
   ↓
DB 저장
```

---

# 7. 모델 사용 전략

### 7.1 모델 선택
- GPT-4o-mini → Phase1, Phase2  
- GPT-4o → Phase3 (정교한 PACRI 생성)  
- Embedding 모델 → Seed Linking 용도  

### 7.2 비용 최적화
- Phase1/2는 mini 모델 활용  
- Phase3만 고급 모델로 처리  
- Seed Linking은 pgvector 기반 cosine similarity  

---

# 8. 오류 및 예외 처리 가이드

| 상황 | 해결 정책 |
|------|-----------|
| 사용자 답변이 너무 짧음 | PACRI Result/Impact를 정성적 표현으로 최소 구성 |
| 이벤트 텍스트 모호 | Seed로 저장 후 outcome 생성 보류 |
| 프로젝트 미선택 | 사용자 강제 선택 UX 제공 |

---

# 9. 다음 문서  
→ `07_event_state_machine.md`
