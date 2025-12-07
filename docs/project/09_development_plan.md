# 09. Development Plan
**문서 버전:** 1.0
**업데이트:** 2025-12-06  
**문서 목적:** AI Career Harvest OS의 MVP 및 확장 기능에 대한 개발 계획을 정의하여 개발팀·디자인팀·데이터팀이 동일한 방향성 아래 제품을 설계·구현할 수 있도록 한다.

## 1. Technical Stack
- **Frontend:** Next.js 14, React  
- **Backend:** Supabase (PostgreSQL + Edge Functions)  
- **AI:** OpenAI GPT-4o / GPT-4o-mini  
- **Auth:** Supabase Auth  
- **Deployment:** Vercel  
- **Monitoring:** Vercel Analytics + Supabase Logs

---

## 2. Architecture Overview
```
Next.js → API Route → Supabase (DB)  
           ↓
       OpenAI API
```

---

## 3. Development Phases

## Phase 1 — MVP (3~4 weeks)
### 1.1 Core Features
- 자유 텍스트 입력
- 이벤트 자동 분해
- Phase1 classifier 적용
- 프로젝트 매핑 UI
- Phase2 질문 1회
- PACRI 생성
- 성과 리스트 + 필터
- 기본 리포트(PDF)

### 1.2 DB Tables
- projects  
- events  
- seeds  
- outcomes  
- pacri_records  

---

## Phase 2 — Seed/Outcome Intelligence (2 weeks)
- Seed 자동 추천  
- Outcome 발생 시 Seed 자동 연결  
- Seed Timeline 시각화  
- 프로젝트 자동 클러스터링(간단 TF-IDF)

---

## Phase 3 — Portfolio & Resume Engine (3 weeks)
- STAR 변환  
- Notion 용 포트폴리오 문서 자동 구성  
- 커리어 스토리라인 생성  
- PDF 템플릿 고도화

---

## Phase 4 — AI Career Coach (4 weeks)
- AI 면접 코치  
- 역량 지도(competency graph)  
- 성장 리포트(연간)  
- Seed 기반 OKR 추천  

---

## 4. Development Schedule

### Week 1
- DB 설계  
- 이벤트 분해 + Classifier 연결  
- 기본 입력 UI

### Week 2
- 프로젝트 매핑 UI  
- Phase2 질문 로직  
- PACRI 엔진 구축  

### Week 3
- 성과 리스트 페이지  
- 간단 리포트 생성  
- Seed/Outcome 기본 구조  

### Week 4
- QA + 버그 픽스  
- MVP 배포  
- 베타 30명 온보딩  

---

## 5. Risks & Mitigations
### 리스크 1: 이벤트 분해 오류
- 해결: Rule-based fallback 추가, 수동 병합 기능 제공

### 리스크 2: PACRI 부정확
- 해결: quality_score 80 이하 Draft 처리

### 리스크 3: 프로젝트 매핑 정확도 부족
- 해결: 자동 매핑은 Phase3로 미룸, MVP는 수동 매핑

---

## 6. Launch Plan
- 커리어 커뮤니티(OKKY, FEConf) 소규모 공개  
- 베타 유저 피드백 수집  
- 3개월 내 유료 플랜 출시  

---

## 7. Future Hiring Plan
- Product Designer  
- Backend Engineer  
- AI Engineer  
- Content Strategist  

---
