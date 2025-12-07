# 05. Data Model
**문서 버전:** 1.0
**업데이트:** 2025-12-06  
**작성 목적:**  
AI Career Harvest OS의 백엔드 설계 기반이 되는 **데이터 모델(ERD v3)**을 상세 명세하며,  
Seed 시스템 · PACRI Outcome · Project 매핑 구조를 명확히 정의한다.

---

# 1. 전체 ERD v3 개요

본 서비스의 핵심 개념 4개:

1. **Project** – 사용자가 수행하는 업무 단위 그룹  
2. **Event** – Raw Input을 Phase1에서 분해한 최소 단위 업무 조각  
3. **Seed** – 아직 성과가 아니지만, 나중에 Outcome으로 발전할 가능성 있는 “문제/논의/관찰”  
4. **Outcome** – PACRI 구조로 완성된 최종 성과 데이터

이를 연결하기 위한 지원 테이블:

- event_project_map  
- seed_outcome_link  
- user_profile  

최종적으로 ERD는 아래와 같은 관계를 형성한다:

```
User ───< Project ───< Event ───< Seed
                     └──< Outcome
Seed ───< seed_outcome_link >── Outcome
```

---

# 2. 테이블 상세 정의

---

## 2.1 users

서비스 사용자 기본 정보.

| 필드 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 사용자 ID |
| email | text | 로그인 이메일 |
| name | text | 사용자 이름 |
| role | text | FE/BE/PM/Designer/Analyst/Marketer 등 |
| created_at | timestamp | 가입일 |

---

## 2.2 projects

사용자가 진행 중인 프로젝트(또는 카테고리).

| 필드 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 프로젝트 ID |
| user_id | uuid (FK users.id) | 소유 사용자 |
| name | text | 프로젝트명 |
| description | text | 설명 |
| status | enum(active, archived) | 프로젝트 상태 |
| created_at | timestamp | 생성일 |

---

## 2.3 raw_inputs

사용자가 자유 형식으로 입력한 문장 덩어리.

| 필드 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) |
| user_id | uuid (FK users.id) |
| text | text | 사용자가 작성한 원본 문장(일기) |
| created_at | timestamp | 입력 시점 |
| source | enum(manual, vision, voice) | 입력 형태 |

---

## 2.4 events

Phase1에서 raw_input이 분해된 최소 단위 사건(Event).

| 필드 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) |
| raw_input_id | uuid (FK raw_inputs.id) | 원본 소스 |
| idx | integer | raw input에서의 순서 |
| text | text | 이벤트 조각(예: "로그인 버그 고침") |
| category | enum(achievement_ready, needs_context, not_achievement) |
| missing_info | jsonb | ["problem","approach"] 등 |
| is_seed_candidate | boolean | Seed 가능성 |
| created_at | timestamp |

---

## 2.5 event_project_map

이벤트와 프로젝트의 N:N 매핑 테이블.

| 필드 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) |
| event_id | uuid (FK events.id) |
| project_id | uuid (FK projects.id) |
| assigned_by_user | boolean | 사용자 지정 여부 |
| created_at | timestamp |

---

## 2.6 seeds

아직 성과가 아니지만 “성과가 될 수 있는 후보” 시드(Seed).

예:  
- “UI 복잡함이 문제라고 고객 3명이 말함”  
- “로그인 실패율이 높았음” (문제 관찰)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) |
| event_id | uuid (FK events.id) | 어떤 이벤트에서 유래했는가 |
| project_id | uuid (FK projects.id) |
| text | text | 시드 내용 |
| status | enum(open, merged_to_outcome, dismissed) |
| created_at | timestamp |

---

## 2.7 outcomes

최종 성과(PACRI 구조 포함).

| 필드 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) |
| event_id | uuid (FK events.id) | 어떤 이벤트에서 파생됐는가 |
| project_id | uuid (FK projects.id) |
| title | text | 성과 제목 |
| pacri | jsonb | {problem, approach, contribution, result, impact} |
| skill_tags | text[] | ["React", "SQL"] |
| quality_score | integer | 0~100 |
| created_at | timestamp |

---

## 2.8 seed_outcome_link

Seed → Outcome 연결을 기록.

예: Seed(“UI 복잡함 문제 확인”) → Outcome(“온보딩 단계 단순화하여 이탈률 45%→20% 개선”)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) |
| seed_id | uuid (FK seeds.id) |
| outcome_id | uuid (FK outcomes.id) |
| link_type | enum(contributes_to, resolved_by) |
| created_at | timestamp |

---

# 3. 상태 전이 정의

### 3.1 Event → Seed

조건:
- category = needs_context or not_achievement  
- 하지만 “문제 탐지·원인 확인·불편 파악” 등 패턴일 때만 Seed로 저장  
- heuristic example:
  → text에 “원인”, “문제”, “느렸다”, “불편”, “확인함” 등이 있을 때 true

---

### 3.2 Seed → Outcome

조건:
- 해당 프로젝트에서 “결과를 내는 성과”가 생성되었을 때  
- AI가 자동 매칭 또는 사용자가 수동 연결  

---

# 4. 핵심 데이터 처리 시나리오

---

## 4.1 Raw Input → Event 생성

예:  
“로그인 버그 고치고 대시보드 개선했다”

→ Event 두 개 생성

```
event 1: 로그인 버그 고치고
event 2: 대시보드 개선했다
```

---

## 4.2 Event → Project 매핑

사용자가:
- 프로젝트 A
- 프로젝트 B

둘 중 선택한다.

N:N 매핑으로 인해 하나의 Event가 여러 프로젝트에 속할 수 있음.

---

## 4.3 Event → Outcome 생성

Event.category = achievement_ready or  
Phase2 질문을 통해 완성된 경우

Outcome 생성 규칙:

```
Outcome.project_id = event.project_id
Outcome.pacri = AI Phase3 구조화 결과
Outcome.skill_tags = AI 추출
```

---

## 4.4 Seed Linking 알고리즘

Outcome 생성 시 다음 시드를 검색:

조건:
- 동일 프로젝트 내
- created_at이 Outcome보다 먼저
- semantic similarity >= 0.80
- Impact 관련성 키워드 매칭

매칭되면:

```
insert into seed_outcome_link
```

---

# 5. 데이터 정확도 보정 로직

### 5.1 잘못 분류된 Event
사용자가 Event 편집 가능  
→ Category 수정 → Seed/Outcome 자동 업데이트

---

### 5.2 Seed 자동 해제
Seed.status = dismissed 조건:

- 120일 이상 연결된 Outcome 없음  
- 사용자가 명시적으로 제거  

---

# 6. DB 성능 전략

- Supabase Postgres  
- events, seeds, outcomes 테이블에 **pgvector 2.0** 적용 (semantic search)  
- created_at index 필수  
- event_project_map composite index(event_id, project_id)  

---

# 7. 향후 확장 고려

- Team workspace → project.user_id 다중 허용  
- Vision Input → raw_inputs.source=vision  
- 자동 프로젝트 생성 모델 → embedding clustering 기반  

---

# 8. 다음 문서
→ docs/06_ai_engine.md
