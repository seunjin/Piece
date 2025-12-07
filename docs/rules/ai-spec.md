# AI Engineering Specification (AI Spec)
**Product:** Piece — Career Asset Harvester
**Version:** 0.3
**Last Updated:** 2025-12-07
**Owner:** AI / FE Eng (세운)

이 문서는 Piece(이하 "서비스") 개발 시 AI 관련 모든 기술 정책, 모델 전략, 프롬프트 관리 및 테스트 방식에 대한 기준을 정의한다.
목적은 **비용 효율적인 구조로, 일관된 품질의 커리어 성과 로그를 PACRI 포맷으로 수확(Harvest)하는 것**이다.

---

## 1. 전체 개요 (High-level Overview)

### 1.1 AI가 하는 일

서비스의 핵심 AI 역할은 다음 세 가지다.

1. **성과 후보 문장 분해 및 분류**
   - 유저가 한 주 동안의 일을 일기처럼 적으면, 이를 이벤트 단위로 분해하고
   - 성과인지/시드(seed)인지/그냥 활동인지 분류한다.

2. **맥락 보완 질문 생성 (Probing)**
   - 애매한 이벤트에 대해 “이게 성과가 될 수 있는지” 판단하기 위해 최소한의 질문을 던진다.

3. **PACRI 구조화 및 커리어 자산화**
   - 충분한 정보가 모인 이벤트를 PACRI(Problem / Approach / Contribution / Result / Impact) 구조로 정리하고
   - 이력서/포트폴리오/자기소개에 바로 쓸 수 있는 문장과 스킬 태그로 변환한다.

추가로 **Seed 관리 및 Linking(Phase 4)** 를 통해, 당장은 성과가 아니더라도 나중에 성과로 연결될 수 있는 “씨앗”을 관리한다.

---

## 2. AI Model Strategy

### 2.1 Model Selection Standard

비용과 성능의 균형을 위해 Phase별 모델을 이원화한다.

| Phase  | Task Type                                   | Model                | Reason                                           |
|--------|---------------------------------------------|----------------------|--------------------------------------------------|
| Phase 1 | Classification, Event Split, Seed Tagging   | `gpt-4o-mini`        | 규칙 기반 분류/분해는 mini로 충분, 저비용/고속   |
| Phase 2 | Context Probing (질문 생성)                  | `gpt-4o-mini`        | 질문 1줄 생성은 mini로 충분                      |
| Phase 3 | PACRI Creation (작문/요약/태깅)              | `gpt-4o` (또는 mini) | 핵심 출력(이력서용 문장), 품질 우선 단계         |
| Phase 4 | Seed Linking (유사도 검색/Embedding)        | `text-embedding-3-small` | 빠르고 저렴한 벡터 검색용                           |

> 초기 MVP에서는 Phase 3도 `gpt-4o-mini`로 테스트하고,
> **"중요한 성과만 4o로 리라이팅" 버튼**을 제공하는 하이브리드 모델 전략을 사용한다.

### 2.2 Provider

- **Primary:** OpenAI API (Vercel AI SDK 기반)
- **Fallback 후보:** Anthropic Claude 3.5 Sonnet (Post-MVP, 실험용)

### 2.3 Determinism / Temperature Policy

Phase별 temperature / top-p 정책:

| Phase  | Temperature | Top-p | 목표                         |
|--------|-------------|-------|------------------------------|
| 1      | 0.0         | 1.0   | 완전 결정적 분류/분해        |
| 2      | 0.3         | 1.0   | 질문은 안정성 + 약간의 자연스러움 |
| 3      | 0.5         | 1.0   | 자연스러운 문장, 맥락 있는 서술 |
| 4      | N/A         | N/A   | Embedding은 파라미터 없음     |

---

## 3. Phase 정의 & I/O 스키마

### 3.1 Phase 0 — Raw Input

- **Input Source**
  - 테스트용: 사전에 정의된 샘플 텍스트
  - 실제 서비스: 사용자의 자유 입력 (한 주/한 일자 단위)

- **Raw Input 예시**
  ```text
  로그인 버그 고치고 대시보드 그래프 깨지는 문제도 해결했고
  PM 요청으로 통계 API 필터도 추가했다.
  ```

### 3.2 Phase 1 — Event Split & Classification

**역할:**
- Raw 텍스트를 “이벤트 단위”로 분해
- 각 이벤트를 `achievement_ready`, `needs_context`, `not_achievement`로 분류
- `needs_context` 중 “문제 발견/인사이트” 계열은 Seed 후보로 태깅

**Input (from frontend or test harness)**
```json
{
  "text": "사용자 원본 입력",
  "job_title": "Frontend Developer",
  "lang": "ko"
}
```

**System Prompt (요약 버전 컨셉)**
- 경력 로그 분석가 역할
- 이벤트 단위 분해
- `category`, `missing_info`, `is_seed_candidate` 생성

**Output Schema**
```json
{
  "events": [
    {
      "idx": 0,
      "original_text": "로그인 버그 고침",
      "category": "needs_context", // achievement_ready | needs_context | not_achievement
      "missing_info": ["problem", "result", "impact"],
      "is_seed_candidate": false
    },
    ...
  ]
}
```

**이후 처리 (User Editing Layer)**
Phase 1 이후에는 반드시 사용자 편집 단계가 존재한다:
- **사용자 액션:**
  - 이벤트 삭제
  - 이벤트 병합(merge): 여러 이벤트를 하나로 묶기
  - 프로젝트 할당: 각 이벤트를 0..N개의 프로젝트에 붙이기
  - Seed 여부 수정: `is_seed_candidate` 토글
- **서버에 저장될 구조:**
  - `events` 테이블: Phase 1 결과 + 유저 수정 상태
  - `projects` 테이블: 유저가 생성한 프로젝트(카테고리 느낌)
  - `event_project_links` 테이블: N:N 매핑

### 3.3 Phase 2 — Context Probing (질문 생성)

**역할:**
- `needs_context` 이벤트에 대해 최소한의 질문 1개를 생성
- 목표는 PACRI 구조를 채우기 위한 핵심 `missing_info` 보완

**Input (per event)**
```json
{
  "user_input": "로그인 버그 고침",
  "missing_info": ["problem", "result", "impact"],
  "job_title": "Frontend Developer"
}
```

**Output Schema**
```json
{
  "question": "로그인 버그 수정 이후 사용자 경험이나 에러 발생률에 어떤 변화가 있었나요?"
}
```

**정책:**
- 한 번 호출당 질문은 1개만 생성
- 우선순위: `impact` > `result` > `approach` > `problem`
- 사용자가 “그만 물어봐요”를 선택하면:
  - 해당 이벤트는 `quality_score` 하락/드래프트 표시
  - PACRI 생성은 하되 “보수적으로” 작성

### 3.4 Phase 3 — PACRI Structuring

**역할:**
Phase 1 + Phase 2에서 모인 정보를 기반으로, 각 이벤트를 최종 PACRI 레코드로 변환한다.

**Input**
```json
{
  "combined_text": "원본 + 보완답변",
  "job_title": "Frontend Developer",
  "project_context": "선택된 프로젝트 이름/설명 (optional)"
}
```

**Output Schema**
```json
{
  "pacri": {
    "problem": "로그인 과정에서 특정 환경에서 오류가 발생해 사용자가 로그인하지 못하는 문제가 있었다.",
    "approach": "세션 검증 로직과 쿠키 전달 방식을 점검하고 버그를 수정했다.",
    "contribution": "로그인 관련 이슈를 단독으로 분석하고 수정했다.",
    "result": "관련 오류 로그와 CS 컴플레인이 거의 0건 수준으로 감소했다.",
    "impact": "사용자 로그인 경험이 안정화되고 운영팀의 반복 대응 부담이 줄었다."
  },
  "title": "로그인 세션 검증 로직 개선으로 오류 CS 0건 달성",
  "skill_tags": ["React", "Next.js", "세션 관리", "버그 수정"],
  "quality_score": 0-100
}
```

**Quality Policy:**
- `quality_score` < 70:
  - UI에서 “보완 필요” 뱃지 표시
  - 사용자가 추가 편집/보완 후, 다시 PACRI 생성 가능

### 3.5 Phase 4 — Seed Linking (Post-MVP)

**역할:**
- 당장은 성과가 아니지만, 나중에 성과로 이어질 수 있는 “시드(Seed)”를 프로젝트 단위로 관리.
- 유사 문제/인사이트들을 묶어, 나중에 해결 성과와 연결할 수 있는 힌트 제공.

**Embedding Strategy:**
- **Model:** `text-embedding-3-small`
- **Embedding Target:**
  - seed 이벤트의 `original_text`
  - 선택적으로 PACRI의 `problem` 필드

**사용 예:**
- “예전에 온보딩 이탈 문제 찾았던 거 뭐였지?”
  → 해당 Seed들과 연결된 Outcome 리스트 보여주기

---

## 4. Prompt Engineering & Management

### 4.1 Prompt Compression Policy
- Few-shot 예시는 최소화하고, 규칙과 스키마 위주로 설계
- 장황한 역할 설명 대신, 한 줄 역할 정의 + 핵심 규칙만 명시
- 출력은 항상 JSON, 자연어는 필드 내부에서만 사용

### 4.2 Directory Structure
```
lib/
  prompts/
    phase1-classifier.ts
    phase2-prober.ts
    phase3-pacri.ts
    phase4-linking.ts
  ai/
    client.ts          // OpenAI/Vercel AI SDK 래퍼
    orchestrator.ts    // Phase 호출용 헬퍼
docs/
  ai-spec.md
  eval/
    golden-dataset.json
```

### 4.3 Versioning
- 파일 내 상수 이름으로 버전 관리:
  - `PHASE1_SYSTEM_PROMPT_V1`
  - `PHASE1_SYSTEM_PROMPT_V2`
- 변경 시 주석에 변경 이유 기록:
  ```typescript
  // v2: 질문 수를 1개로 제한, seed 판정 규칙 강화
  ```

### 4.4 Structured Output (Zod + generateObject)
- 모든 응답은 Vercel AI SDK `generateObject` + `zod` schema로 검증

---

## 5. Reliability & Error Handling

### 5.1 Retry + Fallback
- **JSON 파싱 실패 시:**
  - 최대 2회 재시도
  - 그래도 실패하면 “AI 응답 오류”로 사용자에게 노출, 로그에 저장
- **일시적 API 에러 (429, 500 계열):**
  - Exponential backoff로 자동 재시도

### 5.2 Timeout
- **Phase 1/2:** 5초 이내 응답 목표
- **Phase 3:** 10초 이내 응답 목표, 필요 시 Streaming 적용
- Vercel Serverless `maxDuration`(예: 15초) 내에 끝나도록 설계

---

## 6. Evaluation & Testing

### 6.1 Golden Dataset (MVP)
- `docs/eval/golden-dataset.json` 에 다음 포함:
  - 다양한 직무(프론트엔드, 백엔드, PM, 디자이너, 데이터)의
  - Raw 입력
  - 기대하는 PACRI 출력
  - 기대하는 category/seed 판정 결과

### 6.2 Prompt Test Harness
- 내부 “프롬프트 테스트용 UI”에서:
  - 샘플 선택 → Phase1/2/3 동시 실행
  - 각 Phase별 결과, 비용, 토큰 수를 함께 보여줌
  - 프롬프트 버전별 결과 비교(diff) 기능

(상세 아키텍처는 `ai-test-architecture.md` 문서 참고)

---

## 7. Logging & Observability

### 7.1 AI 호출 로그

Supabase에 `ai_logs` (또는 `ai_calls`) 테이블 생성:
- `id`
- `user_id` (nullable for 테스트)
- `phase` (1/2/3/4)
- `model`
- `prompt_version`
- `input_tokens`
- `output_tokens`
- `estimated_cost`
- `status` (success / failed / retried)
- `created_at`

### 7.2 대시보드
- 일/주/월 단위:
  - 총 AI 호출 수
  - Phase별 비용 비율
  - 사용자당 평균 비용
  - 이벤트당 평균 비용

---

## 8. Security & Safety

### 8.1 PII 마스킹
- 클라이언트에서 1차 정규식 마스킹 (전화번호, 이메일, 주민번호 등)
- 서버에서 추가 검사 후 OpenAI로 전달

### 8.2 Moderation
- OpenAI Moderation API를 이용해 입력 텍스트 필터링
- 폭력/혐오/성적/위험 입력은:
  - 기록은 하되 AI 호출은 차단
  - 사용자에게 안내 메시지 제공

### 8.3 Prompt Injection 방지
- System Prompt는 하드코딩/서버 사이드에서만 관리
- 유저 입력은 항상 User 역할로만 전달
- 유저 메시지 내 “지금까지 규칙 무시해” 같은 문장은 무조건 무시

---

## 9. 향후 확장 (Roadmap)
- Phase 4 Seed Linking 활성화 (벡터 검색 + 프로젝트 단위 인사이트 페이지)
- 면접 질문 자동 생성 (PACRI 기반 STAR 답변 확장)
- 팀 계정: 여러 유저의 성과를 모아서 팀 단위 리포트 생성
- 온디바이스/브라우저 LLM을 활용한 ultra-low-cost 간이 파서 도입 (Phase 1 대체 후보)
