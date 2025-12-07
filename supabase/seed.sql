-- AI Test Samples (테스트 입력 데이터)
INSERT INTO public.ai_test_samples (job_title, raw_input, title)
VALUES 
(
  'Frontend Developer',
  '로그인 페이지에서 간헐적으로 404 에러가 뜨는 문제를 발견해서, 네트워크 로그를 분석해보니 API 요청 타이밍 이슈였다. useEffect 의존성 배열 고치고 해결함.',
  '로그인 페이지 404 에러 수정'
),
(
  'Backend Developer',
  '메인 대시보드 쿼리 속도가 너무 느려서 3초 이상 걸림. 실행 계획 떠보니 인덱스가 안 타고 있었음. 복합 인덱스 추가하고 쿼리 튜닝해서 0.2초로 단축.',
  '대시보드 쿼리 튜닝 (3s -> 0.2s)'
),
(
  'Product Manager',
  '유저 인터뷰 5명 진행했는데, 대부분 온보딩 3단계에서 이탈하는 이유가 "설명이 너무 길어서"였다. 그래서 3단계를 2단계로 줄이고 텍스트 대신 이미지로 대체하는 기획안 작성함.',
  '온보딩 이탈률 개선 기획'
);

-- AI Prompt Versions (프롬프트 버전)
-- Phase 1: Event Split & Classification
INSERT INTO public.ai_prompt_versions (phase, version, label, prompt_text, file_path, changelog)
VALUES 
(
  'phase1',
  'v1.0.0',
  'Initial Baseline',
  'Prompt loaded from file...', 
  'src/lib/prompts/phase1/v1.md',
  '최초 버전 Release'
);

-- Phase 2: Context Probing
INSERT INTO public.ai_prompt_versions (phase, version, label, prompt_text, changelog)
VALUES 
(
  'phase2',
  'v1.0.0',
  'Direct Questioning',
  'Generate a single probing question to clarify the missing information (problem, result, impact) for the given event.',
  '기본 질문 생성 로직'
);

-- Phase 3: PACRI Structuring
INSERT INTO public.ai_prompt_versions (phase, version, label, prompt_text, changelog)
VALUES 
(
  'phase3',
  'v1.0.0',
  'Standard PACRI',
  'Transform the provided event context and user answers into a structured PACRI format. Ensure professional tone.',
  'PACRI 기본 구조화'
);
