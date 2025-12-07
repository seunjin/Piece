# 02. Persona & Problem Space
**문서 버전:** v1.0  
**업데이트:** 2025-12-06  
**문서 목적:**  
- 제품의 핵심 사용자(Persona)를 정의하고  
- 이들이 겪는 실질적인 Pain Point를 분석하며  
- 확장 직군까지 포괄하는 문제 공간을 명확히 규정한다.  

해당 문서는 제품 철학(03_philosophy.md), 사용자 플로우(04_user_flow.md),  
AI Event 처리 구조(06_ai_engine.md)의 기반이 된다.

---

# 1. Persona Overview

본 시스템(AI Career Harvest OS)은 **프로젝트 단위로 일하는 모든 지식 노동자**를 타겟한다.  
그러나 PRD 설계, AI 모델링, UX 전략의 기준을 명확하게 유지하기 위해  
**4개의 Core Persona**를 중심으로 문제 정의를 수행한다.

## Core Persona (4)
1. Product Manager (PM)  
2. Frontend Engineer (FE)  
3. Designer (UI/UX)  
4. Data Analyst (DA)  

이들은 IT 서비스 조직 내에서 가장 흔하고,  
성과 기록·구조화의 어려움을 대표하는 직군이다.

---

# 2. Persona #1 — Product Manager (PM)

## 2.1 기본 정보
- 연차: 1–8년  
- 담당: 제품 기획, 문제 정의, 협업, 우선순위 관리  
- 성공 기준: 전환율 / 유지율 / 기능 성과 / 프로세스 개선  

## 2.2 PM의 Pain Points
| 문제 유형 | 설명 |
|----------|------|
| 흐릿한 기여도 | PM은 “직접 구현하지 않아” 기여도를 설명하기 어렵다 |
| 중간 산출물 손실 | 분석/조율/기획 과정이 흔적 없이 사라진다 |
| 정량화 어려움 | 실험 결과나 퍼널 영향이 명확하게 기록되지 않음 |
| 회고 부담 | 평가/이직 직전에 몰아서 정리하면 정확도 매우 낮음 |

## 2.3 PM 로그 예시
- “전환율 떨어져서 원인 분석함”  
- “디자이너·개발자랑 일정 조율함”  
- “구독 모델 구조 논의함”  
→ 대부분 **needs_context**

---

# 3. Persona #2 — Frontend Engineer (FE)

## 3.1 기본 정보
- 연차: 1–6년  
- 담당: UI 구현, 성능 최적화, 로직 개선  

## 3.2 FE의 Pain Points
| 문제 유형 | 설명 |
|----------|------|
| 단순 작업과 성과 작업의 경계 모호 | “버그 고침”만으로는 성과가 드러나지 않음 |
| 사건 분해 필요 | 한 문장에 3~5개의 작업이 들어있음 |
| 결과 연결 누락 | UX/성능의 임팩트가 기록되지 않음 |
| 과소평가 | 작은 개선도 영향이 큰데 본인이 모름 |

---

# 4. Persona #3 — Designer (UI/UX)

## 4.1 기본 정보
- 연차: 1–7년  
- 담당: UX, 인터페이스 설계, 리서치  

## 4.2 Pain Points
| 문제 유형 | 설명 |
|----------|------|
| 성과 언어 부족 | 디자인은 "예쁘게 만들었다"가 아니라 "문제를 해결했다"여야 함 |
| 정성적 기여 누락 | 리서치·사용성 개선이 성과로 정리되지 않음 |
| 기여도 가시성 감소 | 협업의 흔적이 묻힘 |
| 구조화 어려움 | 감성적 작업을 성과 구조로 설명해야 함 |

---

# 5. Persona #4 — Data Analyst (DA)

## 5.1 기본 정보
- 연차: 1–5년  
- 담당: 지표 분석, 인사이트 도출  

## 5.2 Pain Points
| 문제 유형 | 설명 |
|----------|------|
| 인사이트가 사라짐 | 중요한 발견이 Seed로 남지 않음 |
| 후속 조치와 연결되지 않음 | 분석 → 개선이 일렬 흐름으로 남지 않음 |
| 단발 기록 | 데이터를 많이 보지만 기록은 적음 |
| 기여도 모호 | “인사이트 제공”이 성과로 보이지 않음 |

---

# 6. Cross-Persona Shared Pain Points

| 공통 Pain Point | 설명 |
|------------------|------|
| 성과 판단 어려움 | 성과인지 단순 업무인지 구분 불가 |
| 기록 피로 | 매일 기록은 불가능 |
| 기억 기반 회고 | 반년 후에는 다 잊음 |
| 맥락 누락 | 왜 했는지 이유가 사라짐 |
| 구조화 불가 | 문제-접근-결과 형태로 정리 어려움 |
| 장기 축적 불가 | 모든 기록이 단발성 |

---

# 7. Extended Roles (확장 직군 정의)

Core Persona 외에도 IT 서비스 조직에는 아래 직군들이 존재하며,  
프로젝트 기반 업무 특성상 AI Career Harvest OS가 적용 가능하다.

## 7.1 직군군(Group) 단위 분류

### 🟦 Product & Business  
- Product Manager (PM)  
- Product Owner (PO)  
- Growth PM  
- Business Manager  
- Marketing Manager  
- Performance Marketer  
- Content Marketer  

### 🟦 Engineering  
- Frontend Engineer  
- Backend Engineer  
- Fullstack Engineer  
- DevOps Engineer  
- Mobile Engineer (iOS/Android)  
- QA Engineer  
- Security Engineer  

### 🟦 Design  
- Product Designer  
- UX Researcher  
- Visual Designer  
- Motion Designer  

### 🟦 Data & Intelligence  
- Data Analyst  
- Data Scientist  
- ML Engineer  
- BI Analyst  

### 🟦 Operations & Policy  
- CS/고객지원  
- 운영 매니저  
- 정책/리스크 매니저  

---

# 8. Extended Roles — 성과 패턴 Mapping Table

이 테이블은 Phase1 Classifier, Phase2 Probing 질문, PACRI 구조화에 직접 적용된다.

| 역할군 | 대표 성과 유형 | Seed 유형 | PACRI에서 중요 요소 |
|--------|----------------|-----------|-----------------------|
| Product / PM / PO | 프로세스 개선, 전환율 개선, 문제 정의 | 문제 발견, 가설 수립 | Problem, Impact |
| Engineering (FE/BE/DevOps/Security) | 성능 개선, 안정성 확보, 버그 해결 | 기술적 병목 발견 | Approach, Result |
| Design | UX 개선, 사용성 향상, 디자인 일관성 | 통찰·리서치 결과 | Problem, Impact |
| Marketing | 캠페인 성과, CTR 개선 | 초기 데이터 인사이트 | Impact |
| Data | 원인 분석, 지표 탐색 | 패턴 발견 | Problem, Result |
| Operations | VOC 정리, 프로세스 개선 | 고객 문제 발견 | Problem, Result |

---

# 9. Extended Role-specific Problem Space

## 9.1 DevOps / Backend / Security
- 문제 인식이 기술 깊이에 있음  
- 성과는 숫자로 나타나기 어려움 (ex: 장애 예방)  
- 인프라 개선은 대부분 Seed → Outcome 구조  

## 9.2 Marketer
- 실험→전환→지표가 성과 구조  
- 로그가 캠페인 단위로 모여야 함  
- 작은 변경도 큰 Impact 가능  

## 9.3 QA / Tester
- 발견한 이슈가 Seed  
- 해결이 Outcome  
- 반복 업무가 많아 성과 판단이 어려움  

## 9.4 CS / 운영
- VOC 패턴이 Seed  
- 정책 변경이 Outcome  
- 결과 임팩트 측정이 어려움

---

# 10. Problem Space Summary

AI Career Harvest OS는 아래 문제를 해결해야 한다:

1. 직군마다 성과 정의가 다르지만 구조화는 동일해야 함 (PACRI)  
2. 성과 가능성이 있는 Seed를 놓치지 않아야 함  
3. 프로젝트 단위로 히스토리가 통합되어야 함  
4. 단발 기록이 아니라 “성과 연결(Seed→Outcome)”이 필요  
5. 장기적으로 커리어 자산화될 수 있는 구조여야 함  

즉,

# 👉 **직군이 다르더라도 “성과화 과정”은 동일해야 한다.**  
# 👉 **그 동일한 구조를 AI가 자동으로 수행해주는 것이 이 제품의 핵심 가치다.**

---

# 11. Next Document

다음 문서는 제품의 철학과 설계 원칙을 정의한다.
📄 **→ docs/03_product_philosophy.md**