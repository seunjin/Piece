# 06. AI Engine
**문서 버전:** 1.1  
**업데이트:** 2025-12-07  
**문서 목적:**  
Piece (AI Career Harvest OS)의 핵심 엔진인 **Phase 1 → Phase 2 → Phase 3 → Phase 4(Seed Linking)** 전체 AI 작동 방식을 상세히 정의한다.  
이 문서는 실제 프롬프트 설계, API 연동, 상태 머신, 테스트용 랩(프롬프트 실험 도구) 구현의 기준이 된다.

> 모델/비용/Temperature 등의 공통 정책은 `ai-spec.md`를 소스 오브 트루스로 삼는다.  
> 이 문서는 **“각 Phase가 무엇을 받고, 무엇을 내보내는지”** 에 집중한다.

---

## 1. AI Engine 전체 구조

AI 엔진은 다음 4단계 + 1개 유저 편집 레이어로 구성된다.

1. **Phase 1 – Event Split & Classification**  
   - Raw Input을 이벤트 단위로 분해  
   - 각 이벤트를 3가지 상태로 분류  
     - `achievement_ready`  
     - `needs_context`  
     - `not_achievement` (단순 활동 로그)  
   - `missing_info`, `is_seed_candidate` 생성

2. **User Editing Layer (Phase 1 이후, Phase 2 이전)**  
   - 분해/분류된 이벤트를 유저가 직접 손질하는 단계  
   - 이벤트 삭제 / 병합 / 프로젝트 할당 / Seed 토글

3. **Phase 2 – Context Probing (질문 생성 및 보완)**  
   - `needs_context` 항목에 대해 1개 핵심 질문 생성  
   - 사용자가 답변 → 보강 정보로 이벤트에 저장  
   - 사용자가 “그만 질문하기” 선택 가능  
   - 정책에 따라 추가 질문 루프 허용 (선택)

4. **Phase 3 – PACRI Structuring**  
   - 충분한 정보가 모인 이벤트를 PACRI 구조로 변환  
   - `quality_score`를 기준으로 Draft / Good 성과 구분

5. **Phase 4 – Seed Linking Engine**  
   - Outcome 생성 시, 관련 Seed를 semantic similarity로 탐색  
   - `seed_outcome_link` 레코드 생성 (프로젝트 범위 내 우선)

전체 Flow:

```text
Raw Input
  ↓
Phase 1: Event Split & Classification
  ↓
User Editing Layer (이벤트 편집 + 프로젝트 할당 + Seed 조정)
  ↓
Phase 2: Context Probing (needs_context만)
  ↓
Phase 3: PACRI Structuring (성과 레코드 생성)
  ↓
Phase 4: Seed Linking (성과 ↔ 과거 Seed 연결)
  ↓
DB 저장 & 리포트/포트폴리오에서 활용
```

---

## 2. Phase 1 – Event Split & Classification

### 2.1 입력 (Input)

```json
{
  "text": "로그인 버그 고치고 대시보드 그래프 깨지는 문제도 해결했고 PM 요청으로 통계 API 필터도 추가했다.",
  "job_title": "Frontend Developer",
  "lang": "ko"
}
```

- `text`: 한 주/하루 동안 일기처럼 적은 원본 입력
- `job_title`: 직무 (질문생성/태깅에 활용)
- `lang`: 언어 (주로 ko, 추후 en 지원)

### 2.2 처리 단계
1. **Event Split (문장/의미 단위 분해)**
   - “로그인 버그 고침”
   - “대시보드 그래프 깨지는 문제도 해결”
   - “통계 API 필터 추가”
2. **Event Classification (카테고리 분류)**
   각 Event를 아래 3가지 중 하나로 태깅:

   | Category | 정의 | 예시 |
   |---|---|---|
   | **achievement_ready** | 문제·행동·결과가 이미 명확 | “응답 속도 40% 개선함” |
   | **needs_context** | 성과 가능성은 있지만 맥락/결과가 부족 | “로그인 버그 고침” |
   | **not_achievement** | 루틴/준비/결과 없는 활동 | “회의 많이 함”, “테스트만 해봄” |

3. **missing_info 배열 생성**
   - 예: `["problem", "result", "impact"]`
   - Phase 2에서 어떤 걸 물어볼지 기준이 됨.
4. **Seed 후보 여부 판단**
   - “문제 발견”, “원인 파악”, “이탈 발견” 등 인사이트/이슈 탐지 계열은 `is_seed_candidate = true`

### 2.3 Phase 1 Output (JSON Schema)

```json
{
  "events": [
    {
      "idx": 0,
      "original_text": "로그인 버그 고침",
      "category": "needs_context",
      "missing_info": ["problem", "result", "impact"],
      "is_seed_candidate": false
    },
    {
      "idx": 1,
      "original_text": "대시보드 그래프 깨지는 문제 해결",
      "category": "needs_context",
      "missing_info": ["problem", "impact", "result"],
      "is_seed_candidate": false
    },
    {
      "idx": 2,
      "original_text": "PM 요청으로 통계 API 필터 추가",
      "category": "needs_context",
      "missing_info": ["problem", "result", "impact"],
      "is_seed_candidate": false
    }
  ]
}
```

---

## 3. User Editing Layer (Phase 1 이후)

Phase 1 결과를 그대로 Phase 2로 넘기지 않고, 반드시 유저 편집 단계를 거친다.

### 3.1 유저가 할 수 있는 액션
1. **이벤트 삭제**
   - “이건 성과도 아니고, 기록으로도 별 가치 없다” → 삭제
2. **이벤트 병합 (Merge)**
   - 같은 프로젝트/맥락에서 이어지는 문장을 하나로 합치기
   - 예: “회원가입 오류 일부 수정” + “관련 API 응답 코드도 정리함”
3. **프로젝트 할당**
   - 각 이벤트를 하나 이상의 프로젝트에 연결
   - `event_project_links` (N:N) 구조
4. **Seed 토글**
   - `is_seed_candidate`를 사용자가 직접 On/Off

### 3.2 이 단계의 Output

UI에서 편집이 끝나면 최종 이벤트 리스트는 대략 아래 형태로 저장된다:

```json
{
  "events": [
    {
      "id": "ev_123",
      "original_text": "로그인 버그 고침",
      "normalized_text": "로그인 시 발생하던 특정 버그를 수정함.",
      "category": "needs_context",
      "missing_info": ["problem", "result", "impact"],
      "is_seed_candidate": false,
      "project_ids": ["proj_app_core"]
    },
    {
      "id": "ev_124",
      "original_text": "대시보드 그래프 깨지는 문제 해결",
      "normalized_text": "대시보드 그래프 렌더링 오류를 해결함.",
      "category": "needs_context",
      "missing_info": ["problem", "impact", "result"],
      "is_seed_candidate": false,
      "project_ids": ["proj_admin_dashboard"]
    }
  ]
}
```

---

## 4. Phase 2 – Context Probing (질문 생성)

### 4.1 트리거 조건
- `category = "needs_context"` 인 이벤트만 Phase 2 대상
- `achievement_ready`는 바로 Phase 3로 보낼 수 있음

### 4.2 질문 생성 정책

| 항목 | 설명 |
|---|---|
| **질문 수** | 기본 1개 (핵심 missing_info 기준) |
| **우선 순위** | impact > result > approach > problem |
| **사용자 옵션** | ① 답변하기 ② 다른 질문 듣기 ③ 그만 질문하기 |

- “다른 질문”을 요청하면 동일 이벤트에 대해 다른 각도 질문 1개 추가 생성
- “그만 질문하기” 선택 시:
  - 해당 이벤트는 `partial` 상태로 마킹
  - PACRI 생성 시 `quality_score`가 낮게 책정되며, 일부 필드는 정성적/일반 문장으로만 작성

### 4.3 직군별 질문 템플릿 (개념)
- **개발자(FE/BE/DevOps)**
  - 어떤 기술/도구를 사용했는가?
  - 성능/안정성 지표가 어떻게 변했는가?
- **PM/PO**
  - 어떤 비즈니스/제품 지표에 영향을 줬는가?
  - 그 작업의 목적이 무엇이었는가?
- **디자이너**
  - 어떤 UX 문제를 해결하고자 했는가?
  - 유저 피드백이나 테스트 결과는 어떠했는가?
- **데이터 분석가**
  - 어떤 인사이트를 발견했는가?
  - 그 인사이트가 어떤 의사결정/실행으로 이어졌는가?

### 4.4 Phase 2 I/O 예시

**Input**

```json
{
  "event_id": "ev_123",
  "user_input": "로그인 버그 고침",
  "missing_info": ["problem", "result", "impact"],
  "job_title": "Frontend Developer"
}
```

**AI Output**

```json
{
  "event_id": "ev_123",
  "question": "이 로그인 버그를 해결하기 전에 어떤 문제가 발생하고 있었고, 수정 후에는 사용자 컴플레인이나 오류 발생률이 어떻게 달라졌나요?"
}
```

**사용자 답변 저장 형태**

```json
{
  "event_id": "ev_123",
  "answers": [
    {
      "question": "이 로그인 버그를 해결하기 전에 어떤 문제가 발생하고 있었고...",
      "answer": "특정 브라우저에서만 로그인 실패가 자주 발생했고, 수정 후에는 관련 CS가 거의 0건으로 줄었어요."
    }
  ]
}
```

---

## 5. Phase 3 – PACRI Structuring

Phase 1 + 2에서 모인 정보를 바탕으로, 각 이벤트를 최종 성과 레코드로 변환한다.

### 5.1 PACRI 규칙
- **Problem:** 어떤 문제가 있었는지 (상황/배경)
- **Approach:** 무엇을 어떻게 했는지 (기술/방법)
- **Contribution:** 본인이 어떤 역할을 했는지 (Lead / Solo / Support 등)
- **Result:** 어떤 결과가 나왔는지 (수치 기반 선호, 없으면 정성)
- **Impact:** 비즈니스/사용자/팀 차원에서의 의미

### 5.2 Input

```json
{
  "event": {
    "original_text": "로그인 버그 고침",
    "normalized_text": "특정 브라우저에서 로그인 실패 버그를 수정함",
    "job_title": "Frontend Developer"
  },
  "answers": [
    {
      "question": "...",
      "answer": "특정 브라우저에서만 실패가 발생했고 수정 후 CS가 0건으로 줄었다."
    }
  ],
  "project_context": "코어 웹 서비스 로그인 모듈"
}
```

### 5.3 Output Schema

```json
{
  "event_id": "ev_123",
  "pacri": {
    "problem": "특정 브라우저에서 로그인 실패가 반복되어 사용자 불만과 CS가 꾸준히 발생하고 있었다.",
    "approach": "로그인 플로우와 세션 검증 로직을 점검해 브라우저별 쿠키 전달 이슈를 수정했다.",
    "contribution": "프론트엔드 단독으로 문제 재현, 원인 분석, 코드 수정까지 전체 과정을 담당했다.",
    "result": "해당 브라우저에서 발생하던 로그인 실패가 재발하지 않았고, 관련 CS가 0건 수준으로 감소했다.",
    "impact": "로그인 경험이 안정화되면서 사용자 이탈과 운영팀의 반복 대응 부담이 줄어들었다."
  },
  "title": "브라우저별 로그인 실패 버그 수정으로 CS 0건 달성",
  "skill_tags": ["React", "세션 관리", "버그 분석", "디버깅"],
  "quality_score": 0-100
}
```

### 5.4 Quality Gate 정책
- `quality_score >= 80` : **Good** (바로 이력서/포트폴리오 추천)
- `60 <= quality_score < 80` : **OK / Draft** (조금 더 디테일 보완 추천)
- `< 60` : **Draft**
- UI에서 “정보 부족 / 질문 더 받기” 안내 가능

---

## 6. Phase 4 – Seed Linking Engine

### 6.1 Seed 정의

다음 조건 중 하나 이상이면 Seed로 간주:
- 문제/이슈/인사이트 발견에 초점
  (예: “온보딩 2단계에서 45% 이탈 발견”, “로그에서 특정 오류 패턴 반복 발견”)
- 아직 해결/실행 단계 `Result/Impact` 없음
- 향후 Outcome과 연결될 가능성이 높은 이벤트

### 6.2 Linking 트리거
- Outcome(PACRI)이 생성될 때마다:
  1. 같은 `project_id` 내 Seed들을 후보로 가져옴
  2. embedding(`text-embedding-3-small`) 으로 유사도 계산
  3. `similarity >= 0.80` 인 Seed에 대해 링크 생성

### 6.3 Linking Output 예시

```json
{
  "outcome_id": "out_456",
  "linked_seeds": [
    {
      "seed_id": "seed_001",
      "similarity": 0.89,
      "reason": "둘 다 '온보딩 2단계 이탈' 문제를 다루고 있음"
    }
  ]
}
```

DB 차원에서는 `seed_outcome_link` 테이블로 관리.

---

## 7. AI Engine API Flow

### 7.1 주요 엔드포인트 (개념)
- `POST /api/harvest/phase1`
- `POST /api/harvest/phase2`
- `POST /api/harvest/phase3`
- `POST /api/harvest/seed-linking` (또는 비동기/배치 처리)

### 7.2 통합 플로우 (단일 과정)

1. 사용자가 텍스트 입력 → `/phase1`
2. Phase1 결과 UI 표시 → 유저 편집 (삭제/병합/프로젝트 할당/Seed 조정)
3. 편집 완료된 이벤트 중 `needs_context` → `/phase2` (질문생성)
4. 유저 답변 → `/phase3` (PACRI 생성)
5. PACRI 생성 시 → `/seed-linking` (관련 Seed 연결)
6. 최종 Outcome/Seed/Link 모두 DB 저장

---

## 8. 오류 및 예외 처리 가이드

| 상황 | 처리 정책 |
|---|---|
| **Phase1 JSON 파싱 실패** | 2회 재시도 후, 사용자에게 “AI 분석 실패” 메시지 및 원본 텍스트만 저장 |
| **질문에 “모르겠다” 답변** | 결과/임팩트는 정성적/간접 표현으로 최소 구성, `quality_score` 낮게 설정 |
| **이벤트가 너무 모호한 경우** | Seed로만 저장, Outcome 생성 보류 |
| **프로젝트 미선택 이벤트** | 다음 단계로 못 넘어가게 UX에서 강제 안내 |
| **Seed가 과도하게 많아지는 경우** | 향후 Seed 정리/아카이빙 기능에서 관리 (v2 이후) |

---

## 9. 관련 문서
- `05_data_model.md` — Event / Outcome / Seed / Link 테이블 정의
- `07_event_state_machine.md` — 이벤트 상태 전이 정의
- `ai-spec.md` — 모델/비용/Temperature/테스트 정책 정의
