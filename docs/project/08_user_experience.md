# 08. User Experience 
**문서 버전:** 1.0
**업데이트:** 2025-12-06  
**문서 목적:** AI Career Harvest OS의 사용자 경험을 정의하여 사용자 편의성과 사용자 경험을 최적화한다.

## 1. UX Principles
1. **Zero-Resistance Input**  
   - 사용자는 편하게 적기만 하면 됨  
2. **AI-First Guidance**  
   - 시스템이 먼저 판단하고, 사용자는 최소 입력  
3. **Project-Centric Organization**  
   - 사용자 머릿속 업무 구조를 앱에서도 동일하게 반영  
4. **Seed & Outcome Timeline**  
   - ‘문제 발견 → 해결’의 자연스러운 연결 흐름 제공  
5. **Low Cognitive Load**  
   - 질문은 단 한 번씩만, 단순하고 직관적으로  

---

## 2. Core Flows

### 2.1 온보딩
- 직무 선택  
- 주요 프로젝트 2–5개 등록  
- “이번 주 했던 일 1줄만 써보세요” 첫 입력

---

### 2.2 성과 입력 플로우
```
사용자 입력 → 문맥 분해 → 이벤트별 분류 → 프로젝트 매핑 → 질문(필요 시) → PACRI 생성
```

#### 상세 단계
1. 자유 텍스트 입력  
2. AI가 문장을 이벤트 단위로 자동 분해  
3. 각 이벤트 상태 표시  
4. 프로젝트 매핑 UI (drag or multiselect)  
5. Needs_context 이벤트는 질문 모달 실행  
6. 답변 후 PACRI 구조 자동 생성  
7. Seed는 별도 Seed 탭에 저장

---

### 2.3 성과 리스트 UX
- Seed / Outcome 구분 탭  
- Project 필터  
- Quality Score 표시  
- Draft 상태 수정 가능  
- Outcome는 Seed 연결 뱃지 표시

---

### 2.4 리포트 UX
- 월간 / 분기 / 연간 선택  
- 프로젝트별 성과 자동 그룹화  
- 그래프 및 PACRI 포함  
- 다운로드(PDF), 공유 링크(Notion embed)

---

## 3. UI Components
- Event Card  
- Seed Chip  
- Project Selector Modal  
- AI Question Modal  
- PACRI Preview Panel  
- Report Viewer  

---

## 4. Edge Case UX
### 4.1 너무 긴 텍스트 입력
- 자동으로 “문단별 이벤트 분해”  
- 20개 이상 이벤트 → “너무 많아요, 범위를 나눠볼까요?”

### 4.2 답변이 불충분
- “조금만 더 구체적으로 알려주면 강한 성과가 돼요”  
- 계속 부족하면 Draft로 저장 후 사용자가 직접 수정하도록 유도

### 4.3 프로젝트 분류 누락
- 저장 시 “어떤 프로젝트에 속하나요?” 모달 자동 실행  

---

## 5. Gamification
- Seed 해결 시 “문제 → 성과” 연결 레벨업  
- 연속 입력 보상  
- 리포트 완성 시 배지 지급  

---

