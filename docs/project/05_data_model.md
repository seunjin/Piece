# 05. Data Model
**문서 버전:** 1.1  
**업데이트:** 2025-12-07  
**작성 목적:**  
AI Career Harvest OS의 백엔드 설계 기반이 되는 **데이터 모델(ERD v3)**을 상세 명세하며,  
Seed 시스템 · PACRI Outcome · Project 매핑 · Phase2 Q&A · Embedding 검색 구조를 명확히 정의한다.

---

# 1. 전체 ERD v3 개요

본 서비스의 핵심 개념 4개:

1. **Project** – 사용자가 수행하는 업무 단위 그룹  
2. **Event** – Raw Input을 Phase1에서 분해한 최소 단위 업무 조각  
3. **Seed** – 아직 성과가 아니지만, 나중에 Outcome으로 발전할 가능성 있는 “문제/논의/관찰”  
4. **Outcome** – PACRI 구조로 완성된 최종 성과 데이터

이를 연결/보조하기 위한 테이블:

- `raw_inputs` – 일기처럼 작성한 원본 텍스트  
- `event_project_map` – 이벤트와 프로젝트의 N:N 연결  
- `seed_outcome_link` – Seed ↔ Outcome 추적  
- `event_answers` – Phase2에서 생성된 Q&A 저장  
- `user_profile` (옵션) – 직무, 경력 등 추가 메타  
- (옵션) `search_embeddings` – 통합 벡터 인덱스 (v2 이상)

관계 개요:

```text
User ───< Project ───< Event ───< Seed
                     └──< Outcome
Event ───< EventAnswer
Seed ───< seed_outcome_link >── Outcome
RawInput ───< Event
```

---

# 2. 테이블 상세 정의

## 2.1 users

서비스 사용자 기본 정보.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid (PK) | 사용자 ID |
| email | text | 로그인 이메일 |
| name | text | 사용자 이름 |
| role | text | FE/BE/PM/Designer/Analyst/Marketer 등 |
| created_at | timestamp | 가입일 |

---

## 2.2 user_profile (옵션, v2)

사용자의 직무/경력 등 AI 컨텍스트에 활용되는 확장 정보.

| 필드 | 타입 | 설명 |
|---|---|---|
| user_id | uuid (PK, FK users.id) | 사용자 ID |
| job_title | text | 현재 직무 (예: Frontend Developer) |
| years_experience | int | 경력 연차 |
| skills | text[] | 주 사용 기술/도메인 태그 |
| updated_at | timestamp | 마지막 수정일 |

---

## 2.3 projects

사용자가 진행 중인 프로젝트(또는 카테고리).

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid (PK) | 프로젝트 ID |
| user_id | uuid (FK users.id) | 소유 사용자 |
| name | text | 프로젝트명 |
| description | text | 설명 |
| status | enum(active, archived) | 프로젝트 상태 |
| created_at | timestamp | 생성일 |

향후 확장:
- 팀 기능 추가 시 team_id, visibility(private/team) 필드 추가 가능

---

## 2.4 raw_inputs

사용자가 자유 형식으로 입력한 문장 덩어리(일기/주간 회고 등).

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid (PK) |  |
| user_id | uuid (FK users.id) |  |
| text | text | 사용자가 작성한 원본 문장(일기) |
| created_at | timestamp | 입력 시점 |
| source | enum(manual, vision, voice) | 입력 형태 |
| lang | text | ko / en 등 |

---

## 2.5 events

Phase1에서 raw_input이 분해된 최소 단위 사건(Event).

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid (PK) |  |
| user_id | uuid (FK users.id) | (조인 최적화를 위해 중복 저장) |
| raw_input_id | uuid (FK raw_inputs.id) | 원본 소스 |
| idx | integer | raw input에서의 순서 |
| original_text | text | 쪼개기 전 원문 조각 (“로그인 버그 고치고”) |
| normalized_text | text | AI가 약간 다듬은 설명용 텍스트 (선택) |
| category | enum(achievement_ready, needs_context, not_achievement) | Phase1 분류 |
| state | enum(draft, in_progress, completed, discarded) | 내부 상태 머신용 |
| missing_info | jsonb | [“problem”,“approach”] 등 |
| is_seed_candidate | boolean | Seed 가능성 플래그 |
| is_deleted | boolean | 사용자 편집에서 삭제 여부 |
| created_at | timestamp |  |
| updated_at | timestamp |  |
| embedding | vector (옵션) | 유사도 검색용 벡터 (pgvector) |

state는 `07_event_state_machine.md`와 연결됨.

---

## 2.6 event_project_map

이벤트와 프로젝트의 N:N 매핑 테이블.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid (PK) |  |
| event_id | uuid (FK events.id) |  |
| project_id | uuid (FK projects.id) |  |
| assigned_by_user | boolean | 사용자 지정 여부 (true/false) |
| created_at | timestamp |  |

인덱스:
- unique(event_id, project_id)
- index(project_id, event_id)

---

## 2.7 event_answers (Phase2 Q&A 저장)

Phase2에서 생성된 질문과 사용자의 답변을 저장하는 테이블.

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid (PK) |  |
| event_id | uuid (FK events.id) |  |
| question | text | AI가 생성한 질문 |
| answer | text | 사용자가 입력한 답변 |
| created_at | timestamp |  |
| source | enum(ai, user) | 초기에는 모두 ai→user 답변 구조이나 확장 대비 |

---

## 2.8 seeds

아직 성과가 아니지만 “성과가 될 수 있는 후보” 시드(Seed).
예:
- “UI 복잡함이 문제라고 고객 3명이 말함”
- “로그인 실패율이 높았음” (문제 관찰)

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid (PK) |  |
| user_id | uuid (FK users.id) |  |
| event_id | uuid (FK events.id) | 어떤 이벤트에서 유래했는가 |
| project_id | uuid (FK projects.id) |  |
| text | text | 시드 내용 (문제/인사이트 중심) |
| status | enum(open, merged_to_outcome, dismissed) |  |
| created_at | timestamp |  |
| updated_at | timestamp |  |
| embedding | vector (옵션) | Seed 검색/매칭용 벡터 |

---

## 2.9 outcomes

최종 성과(PACRI 구조 포함).

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid (PK) |  |
| user_id | uuid (FK users.id) |  |
| event_id | uuid (FK events.id) | 어떤 이벤트에서 파생됐는가 |
| project_id | uuid (FK projects.id) |  |
| title | text | 성과 제목 |
| pacri | jsonb | {problem, approach, contribution, result, impact} |
| skill_tags | text[] | [“React”, “SQL”] |
| quality_score | integer | 0~100 |
| status | enum(draft, finalized) | 이력서/포트폴리오 반영 준비 여부 |
| created_at | timestamp |  |
| updated_at | timestamp |  |
| embedding | vector (옵션) | 검색/추천용 벡터 |

---

## 2.10 seed_outcome_link

Seed → Outcome 연결을 기록.

예: Seed(“UI 복잡함 문제 확인”) → Outcome(“온보딩 단계 단순화하여 이탈률 45%→20% 개선”)

| 필드 | 타입 | 설명 |
|---|---|---|
| id | uuid (PK) |  |
| seed_id | uuid (FK seeds.id) |  |
| outcome_id | uuid (FK outcomes.id) |  |
| link_type | enum(contributes_to, resolved_by) |  |
| similarity | numeric | 0~1, 임베딩 유사도 |
| reason | text | (옵션) AI가 생성한 연결 이유 |
| created_at | timestamp |  |

---

# 3. 상태 전이 정의 (요약)

## 3.1 Event → Seed

조건(예시):
- category = needs_context or not_achievement 이고,
- text에 “원인”, “문제”, “느렸다”, “불편”, “이탈”, “확인함” 등의 패턴이 포함되며,
- 해결/액션이 명시되어 있지 않음

→ seeds 레코드 생성, status = open

---

## 3.2 Event → Outcome

조건:
- category = achievement_ready 이거나
- Phase2 질문을 통해 필요한 정보가 보완되었고
- PACRI 생성 후 quality_score >= 60

→ outcomes 레코드 생성, status = draft 또는 finalized

---

## 3.3 Seed → Outcome (Linking)

Outcome 생성 시:
- 동일 project_id 내 Seed 조회
- similarity >= 0.80 (embedding 기반)
- Seed.created_at < Outcome.created_at

→ seed_outcome_link insert

---

# 4. 핵심 시나리오 (요약)

## 4.1 Raw Input → Event 생성

예:
“로그인 버그 고치고 대시보드 개선했다”

→ Event 두 개 생성
→ Phase1 분류 후 User Editing 단계에서 프로젝트 할당, 삭제, 병합 가능

---

## 4.2 Event → Outcome / Seed
- 명확한 성과 → 바로 Outcome 생성 (Phase3)
- 문제 발견/분석 → Seed 생성
- 애매한 것 → Seed만 생성하거나, log로만 남김

---

# 5. DB 성능 전략
- Supabase Postgres 기반
- events, seeds, outcomes 테이블에 `pgvector 2.0` 적용 (embedding 컬럼)
- 주요 인덱스:
  - events(user_id, created_at)
  - outcomes(user_id, project_id, created_at)
  - seeds(project_id, status)
  - seed_outcome_link(outcome_id, seed_id)

---

# 6. 향후 확장 고려
- **팀 워크스페이스:** projects에 team_id 추가
- **Vision Input:** raw_inputs.source = vision, 별도 image_url/ocr_text 컬럼
- **자동 프로젝트 추천:** event.embedding 기반 클러스터링

---

# 7. 다음 문서

→ `06_ai_engine.md`
