# Piece (피스) — Career Asset Harvester  
**문서 버전:** v1.1  
**최종 업데이트:** 2025-12-06  
**문서 성격:** 제품 전체를 개괄하는 최상위 레벨 문서  
**작성 목적:**  
- 본 제품의 목표, 문제 정의, 가치, 범위, MVP 정의를 명확하게 전달  
- 후속 PRD 문서 전체의 기준점 제공  
- 디자이너/개발자/PM/AI 엔지니어가 동일한 관점을 갖도록 정렬

---

# 1. Product Summary

**Piece(피스)**는 **“조각난 일상의 기록들을 모아 거대한 커리어 자산으로 만드는”**  
**경력 자산 자동 수집 시스템(AI Automated Achievement Harvest System)**이다.

이 서비스는 사용자가 복잡한 과정 없이 **그냥 일기처럼 조각글(Piece) 하나를 던져두면**,  
AI가 이를 분해(Event Split), 해석(Classify), 구조화(PACRI), 성과화(Outcome)하고,  
마침내 하나의 거대한 **걸작(Masterpiece)**으로 연결해준다.

**핵심 가치 제안(Value Proposition):**  
> **"Just leave a piece. We complete your masterpiece."**  
> (조각만 남기세요. 완성은 우리가 합니다.)

---

# 2. Problem Definition (문제 정의)

현대 직장인·개발자는 매일 수많은 일을 하지만,  
이 중 대부분은 **기록되지도, 성과로 정리되지도 않는다.**  

이로 인해 발생하는 치명적 문제들:

## ■ 문제 1: 개인은 자신의 기여도를 설명할 수 없다  
- 회사·팀은 결과만 보고 과정과 성장도를 평가하지 못한다  
- 개인은 성과가 있지만 뭘 했는지 “기억이 안 난다”

## ■ 문제 2: 실제 업무는 산만하고 중간 결과가 많다  
- 대부분의 성과는 생생한 중간 과정에서 나온다  
- 그런데 기존 기록 방식은 너무 정형화되어 있다 (Notion, Jira, Work Log)

## ■ 문제 3: 이직·평가 직전에 몰아서 정리하는 방식은 품질이 낮고 허위가 되기 쉽다  
- 기억 왜곡  
- 맥락 누락  
- 증빙 부족

## ■ 문제 4: AI가 답을 만들어줄 수는 있어도, “내 커리어 히스토리를 쌓아주지는 않는다”  
GPT를 쓰면 순간적으로 문장은 잘 만들어지지만,
- 경력 자산화 되지 않음  
- 구조적으로 저장되지 않음  
- 프로젝트 단위로 묶이지 않음  
- 시간이 쌓여도 “히스토리”가 됨  

즉, 생성형 AI는 **일회성 출력 도구**일 뿐,  
커리어라는 **장기 축적 시스템을 제공하지 않는다.**

---

# 3. Solution Summary (해결 방식)

AI Career Harvest OS는 아래 단계를 자동으로 수행하는 **경력 자산 축적 엔진**이다.
Raw Input → Event Split → Classification → Probing → PACRI → Record → Seed/Outcome Linking → Career DB

각 과정은 AI가 처리하며, 사용자는 필요 최소한의 인터랙션만 수행한다.

즉,  
**“기록은 최소화하고, 성과는 최대화하는 시스템”**.

---

# 4. What the Product Actually Does (서비스 핵심 기능)

## 4.1 1) Raw Work Input  
사용자는 아래 어떤 형태든 입력 가능:
- 한 줄 텍스트  
- 여러 문장이 섞인 텍스트  
- 요약되지 않은 일기 스타일 업무 로그

## 4.2 2) Event Split  
AI가 의미 단위로 사건(Event)을 자동 분해

예:  
> “로그인 버그도 고치고, 대시보드 그래프 깨지는 문제도 해결했고, API 필터도 마무리함”

→ 3개의 Event로 세분화

## 4.3 3) Event Classification (성과 판단 모델)
각 Event는 아래 중 하나로 분류된다:
- **achievement_ready**  
- **needs_context**  
- **not_achievement**  
- **seed / draft (후보군)**

## 4.4 4) Phase2 질문 인터랙션  
needs_context일 경우:
- 역할 기반 질문 발생  
- 반복 질문 가능  
- "그만 묻기" 옵션 제공 (Draft로 처리)

## 4.5 5) PACRI 구조화  
Outcome Event는 PACRI 구조로 변환된다:
- Problem  
- Approach  
- Contribution  
- Result  
- Impact  

+ title, tags, quality score 생성

## 4.6 6) Project Assignment  
각 Event가 어떤 프로젝트에 속하는지 사용자에게 선택받는다  
(멀티 선택 가능)

## 4.7 7) Seed/Outcome Linking  
과거 Seed와 연결해 의미 있는 장기 성과로 자동 확장  
예:
- Seed: "UI 복잡성 원인 발견함"  
- Outcome: "온보딩 단계 단순화로 전환율 12% 상승"  

→ 하나의 큰 성과로 연결

## 4.8 8) Dashboard & Report  
프로젝트별로 자동 그룹핑된 성과 조회  
- 월별 성과 그래프  
- 프로젝트별 로드맵  
- 연간 리뷰 자동 생성  
- 면접용 STAR 문서 자동 생성

---

# 5. Product Scope

## MVP 범위(현재 목표)
- 프로젝트 생성  
- 성과 입력  
- Event Split  
- Phase1 Classifier  
- Phase2 질문(한 번 이상 반복)  
- PACRI 생성  
- Seed 저장 및 자동 연결  
- Dashboard 기본 버전  
- 단순 텍스트 리포트

## 비포함 (Post-MVP)
- Vision(Screenshot) 분석  
- 자동 이력서 생성  
- PDF/Portfolio 자동 제작  
- 팀 기반 협업  
- AI 코치 기능  
- Slack/Notion/Webhook 연동  

---

# 6. Target Users

### 1) IT 직군 (PM, FE, BE, 디자이너, QA, 데이터)  
- 매일 수많은 일을 하지만 대부분 기록되지 않음  
- 업무 로그와 성과 간 괴리 큼  
- 이직 주기가 짧음 (평균 1.5–2.5년)

### 2) 빠르게 부상하는 AI 시대 직장인  
- "내가 뭘 했는지 설명 못하는 사람"  
- “일한 건 많은데 증명할 게 없음”

### 3) 신입·주니어  
- 이력서에 쓸 확실한 근거가 필요  

---

# 7. Product Value

## 정량적 가치  
- 성과 정리 시간 90% 감소  
- 이직 준비 기간 4주 → 4일  
- 평가 대비 준비 품질 향상

## 정성적 가치  
- “내 커리어가 쌓이는 느낌”  
- “내가 한 일이 실제 자산이 됨”

---

# 8. Differentiation (경쟁 우위)

| 항목 | 기존 Notion/Worklog | Career Harvest OS |
|------|----------------------|-------------------|
| 입력 | 수동 기록 | 자연어 1회 입력 |
| 정리 | 없음 | PACRI 자동 생성 |
| 히스토리 | 정리 필요 | 자동 아카이브 |
| 성과 연결 | 없음 | Seed-Link ML |
| 평가 활용 | 수동 정리 | 리포트 자동화 |

즉,  
**이 서비스는 "기록 도구"가 아니라 "경력 자산 성장 엔진"이다.**

---

# 9. Non-Goals (이 제품이 절대 목표로 하지 않는 것)

- Jira/Notion/Worklog 대체  
- OKR 관리 도구  
- 단순 요약기나 LLM 기반 문서 생성기  
- 이력서 자동 생성기(초기에는 아님)

---

# 10. Success Conditions

- 사용자 입력 → 성과화율 25% 이상  
- Phase2 질문 중단율 < 30%  
- 첫 10명 유저의 데이터를 반영해 PACRI 품질 점수 평균 > 75  

---

# 11. Next Document  

다음 문서에서 Persona/Problem Space를 상세화한다:
📄 **→ docs/02_persona_problem_space.md**