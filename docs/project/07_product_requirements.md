# 07. Product Requirements
**문서 버전:** 1.0
**업데이트:** 2025-12-06  
**문서 목적:** 
AI Career Harvest OS의 MVP 및 확장 기능에 대한 제품 요구사항을 정의하여 개발팀·디자인팀·데이터팀이 동일한 방향성 아래 제품을 설계·구현할 수 있도록 한다.

## 1. Product Vision
AI 기반의 ‘성과 정제 및 커리어 자산화 시스템’을 제공하여, 사용자가 단순히 “일을 했다” 수준의 기록을 넘어서 구조화된 성과(PACRI)로 자동 변환되도록 돕는다.  
장기적으로는 사용자의 커리어 성장 패턴을 분석하여 포트폴리오, 면접 답변, 연봉 협상 정보까지 자동 생성하는 ‘AI 커리어 오퍼레이팅 시스템’으로 확장한다.

---

## 2. Target User
### Primary Persona
- IT 직군(개발자, 디자이너, PM, 데이터 분석가 등)
- 프로젝트 단위 성과를 기록해야 하는 모든 지식 노동자
- “성과 정리”, “이력서 업데이트”, “면접 준비”에 어려움을 느끼는 직장인

### Secondary Persona
- 마케터·CS·운영 등 비 IT 지식노동자  
- 정량적 성과가 약한 직무에서 커리어 정리의 어려움을 겪는 사람들

---

## 3. Core Value Proposition
1. ✍ **기록 없이도 성과가 생성되는 시스템**  
   - 원시 입력(raw input)을 자동 분해 → 이벤트 단위 성과 분석  
2. 🧠 **AI가 성과 판단·질문·정제까지 자동 처리**  
   - Needs_context에 대해 최소 질문만으로 완성  
3. 📚 **PACRI 구조화로 강력한 커리어 자산 확보**  
4. 🔍 **프로젝트 기반 관리 + Seed 시스템으로 장기 성과 추적**  
5. 🧾 **PDF/포트폴리오/이력서 자동 생성**

---

## 4. Key Features (MVP 기준)
### 4.1 성과 입력
- 자유 입력 텍스트(일기처럼 길게 입력 가능)
- AI가 문맥 분해 후 이벤트 리스트 생성

### 4.2 이벤트 자동 분류 (Phase 1)
- `achievement_ready`, `needs_context`, `not_achievement`  
- confidence, missing_info 포함

### 4.3 프로젝트 매핑
- 사용자가 이벤트별로 프로젝트 선택(1개 이상)
- 자동 매핑 가능하나 MVP에서는 수동 우선

### 4.4 Seed / Outcome Engine
- needs_context → Seed 저장  
- 해결 완료된 사건(Outcome)과 연결 자동 탐지

### 4.5 PACRI 구조화 (Phase 3)
- 간결한 1–2줄 문장  
- skill_tags 자동 생성  
- quality_score 포함

### 4.6 성과 리스트 페이지
- 프로젝트별 필터  
- Seed / Outcome 상태 표시  
- Draft / Completed 상태 표시

### 4.7 리포트 생성
- 월간/분기/연간  
- 프로젝트별 성과 요약  
- PACRI 기반 STAR 자동 변환

---

## 5. Non-Functional Requirements
### 성능
- 100줄 입력 기준 이벤트 분해 < 3초  
- PACRI 구조화 < 2초

### 보안
- 이미지 사용 시 클라이언트 블러 기능 지원(Phase 2)
- Supabase RLS 필수 적용

### 확장성
- 향후 Interview Prep, Portfolio Builder 확장 가능한 DB 구조

---

## 6. Success Metrics
- 입력 1회 → 완성된 성과 2건 이상  
- PACRI 생성 품질 점수 75점 이상 유지  
- 월간 재방문율 45%  
- 90일 지속 사용자 비율 30%  

---

## 7. Future Expansion
- AI 면접 시뮬레이터  
- 능력 매핑 그래프(능력·스킬 성장도)  
- Seed 기반 자동 OKR 추천  
