# 코딩 컨벤션 (Coding Conventions)

이 문서는 프로젝트의 모든 코드 작성 시 준수해야 할 규칙을 정의합니다.
AI는 코드를 생성할 때 이 규칙을 엄격히 따라야 합니다.

## 1. 파일 및 폴더 구조 (File Structure)

### 1.1 기본 구조

- **App Router:** 모든 페이지와 라우트는 `app/` 디렉토리 내에 위치한다.
- **Components:** `components/` 디렉토리에 위치한다.
  - `components/ui/`: Shadcn UI 컴포넌트 전용 (수정 지양).
  - `components/features/`: 도메인별 기능 단위 컴포넌트 (예: `quiz/`, `news/`).
  - `components/layout/`: 헤더, 푸터, 사이드바 등 레이아웃 관련.
- **Logic:**
  - `services/`: Supabase DB 접근 로직 (DAL) - **Server Only**.
  - `actions/`: Server Actions 파일 (`-action.ts` 접미사 권장).
  - `hooks/`: 커스텀 React Hooks (`use-` 접두사).
  - `lib/`: 유틸리티 함수, 상수, Zod 스키마, 타입 정의.

### 1.2 네이밍 규칙 (Naming)

- **폴더명:** kebab-case (예: `news-detail`, `user-profile`)
- **컴포넌트 파일명:** PascalCase (예: `NewsCard.tsx`, `QuizForm.tsx`)
- **일반 TS 파일명:** kebab-case (예: `date-utils.ts`, `supabase-client.ts`)
- **함수/변수명:** camelCase
- **상수(Constant):** UPPER_SNAKE_CASE

## 2. 컴포넌트 작성 규칙 (Component Architecture)

### 2.1 Server vs Client

- **기본은 Server Component:** 모든 컴포넌트는 기본적으로 Server Component로 작성한다.
- **"use client":** `useState`, `useEffect`, 이벤트 핸들러(`onClick`)가 필요한 **최하위(Leaf) 컴포넌트**에만 명시한다.
- **Data Passing:** Server Component에서 데이터를 fetch하고, Client Component에는 props로 전달하는 패턴을 지향한다.

### 2.2 작성 스타일

- **Named Export:** `export default` 대신 `export const`를 사용한다. (Refactoring 및 자동완성 용이성)
- **Props Interface:** 컴포넌트 Props는 반드시 `interface`로 정의하며, 이름은 `Props` 또는 `[Component]Props`로 한다.
- **Arrow Function:** 컴포넌트 정의 시 화살표 함수(`const Page = () => {}`)보다 함수 선언문(`function Page() {}`)을 선호한다. (디버깅 시 컴포넌트 이름 표시 용이)

```tsx
// ✅ Good
interface NewsCardProps {
  title: string;
}

export function NewsCard({ title }: NewsCardProps) {
  return <div>{title}</div>;
}

// ❌ Bad
const NewsCard = ({ title }: any) => { ... }
export default NewsCard;
```

## 3. 상태 관리 규칙 (State Management)

- URL State (nuqs): 검색어, 필터, 페이지네이션 등 "공유 가능한 상태"는 무조건 URL Query Parameter로 관리한다.

- Server State: 데이터는 DB에서 가져온 시점의 상태를 유지하며, 변경이 필요하면 Server Action을 통해 재검증(revalidatePath)한다.

- Client State (useState): UI의 일시적인 상태(모달 열림/닫힘, 입력 폼 값)에만 사용한다.

- Global State (Zustand): 정말 필요한 전역 상태(예: 유저 세션 정보)가 아니면 사용을 지양한다.

## 4. 데이터 페칭 및 로직 (Logic Flow)

### 4.1 "DAL -> Action -> UI" 패턴

- **Direct DB Access 금지**: 컴포넌트 내부에서 supabase.from(...)을 직접 호출하지 않는다. 반드시 services/ 폴더의 함수를 호출한다.

- API Route 사용 금지: 데이터 페칭을 위해 app/api/를 만들지 않는다. Server Component에서 DAL을 직접 부르거나, Server Action을 사용한다.

### 4.2 데이터 변경 (Mutation) 및 응답 구조

- 반드시 **Server Actions**를 사용한다.
- **공통 응답 타입 (`ApiResponse<T>`) 사용:**

  - `lib/types.ts`에 정의된 Discriminated Union 패턴을 사용한다.
  - **구조:**

    ```typescript
    // 1. 성공했을 때의 형태

    export type ApiSuccess<T> = {
      success: true; // 판별자 (Discriminator)
      data: T; // 성공 시엔 데이터가 무조건 있음
      message?: string; // (선택) "저장되었습니다" 같은 토스트 메시지용
    };

    // 2. 실패했을 때의 형태
    export type ApiError = {
      success: false; // 판별자
      error: string; // 실패 시엔 에러 메시지가 무조건 있음
      code?: string; // (선택) 에러 코드 (예: 'AUTH_REQUIRED')
      validationFields?: Record<string, string[] | undefined>; // (선택) 폼 필드별 에러 (Zod용)
    };

    // 3. 최종 공통 응답 타입 (두 가지를 합침)
    export type ApiResponse<T = void> = ApiSuccess<T> | ApiError;
    ```

- **Action 내부 흐름 표준:**
  1.  **Validation:** Zod로 검증 실패 시 `{ success: false, error: '입력값 오류', validationFields: ... }` 반환.
  2.  **Try-Catch:** 로직 수행 중 에러 발생 시 `{ success: false, error: error.message }` 반환.
  3.  **Success:** 성공 시 `{ success: true, data: result }` 반환.

## 5. 스타일링 (Tailwind CSS & Shadcn)

- **Utility First:** CSS 파일 생성 금지 (Tailwind 클래스 사용).
- **cn() 사용:** 클래스 병합 시 `clsx` + `tailwind-merge` 조합인 `cn()` 유틸리티 사용.
- **Color Variables:** 색상 하드코딩 금지. `bg-primary`, `text-muted-foreground` 등 디자인 시스템 변수 사용.

## 6. 타입스크립트 (TypeScript)

- **No Any:** `any` 타입 사용 금지.
- **Supabase Types:** DB 데이터 타입은 자동 생성된 `Database` 타입을 import 하여 사용.

## 7. 경로 별칭 (Import Aliases)

- 상대 경로(../../components) 대신 절대 경로 별칭(@/components)을 사용한다.
- app/ -> @/app/
- components/ -> @/components/
- lib/ -> @/lib/
- services/ -> @/services/

## 8. Git & Commit Convention

우리는 **Conventional Commits** 규칙을 따릅니다.
커밋 메시지 구조: `<type>(<scope>): <subject>`

### 8.1 허용되는 Type

- **feat:** 새로운 기능 추가 (Features)
- **fix:** 버그 수정 (Bug Fixes)
- **docs:** 문서 변경 (Documentation)
- **style:** 코드 포맷팅, 세미콜론 누락 등 (비즈니스 로직 변경 없음)
- **refactor:** 코드 리팩토링 (버그 수정이나 기능 추가가 아님)
- **test:** 테스트 코드 추가/수정
- **chore:** 빌드 업무 수정, 패키지 매니저 설정 등 (src 및 test 파일 변경 없음)

### 8.2 작성 규칙

- **Subject:** 50자 이내, 명령문/현재시제 사용 (예: "change" O, "changed" X).
- **Language:** 한글/영어 혼용 가능하나, 핵심 키워드는 영어 권장.
- **Example:**
  - `feat(quiz): 퀴즈 정답 체크 로직 구현`
  - `fix(auth): 로그인 세션 만료 버그 수정`
  - `chore: biome 설정 파일 업데이트`

## 9. Git Branching Strategy (Solo Flow)

개인 개발이지만 체계적인 이력 관리를 위해 **Feature Branch Workflow**를 사용합니다.

### 9.1 브랜치 구조
- **main:** 언제나 배포 가능한 상태(Production-ready)여야 합니다.
- **feat/*:** 새로운 기능 개발 (예: `feat/setup-supabase`, `feat/auth-ui`) 
- **fix/*:** 버그 수정 (예: `fix/login-error`)
- **chore/*:** 설정 변경, 리팩토링 등 (예: `chore/update-deps`)

### 9.2 작업 흐름
1. `main`에서 새로운 브랜치 생성: `git checkout -b feat/my-feature`
2. 작업 및 커밋 (Conventional Commits 준수)
3. 작업 완료 후 Push: `git push origin feat/my-feature`
4. (선택) GitHub에서 Pull Request 생성 및 Self-Review (습관화 권장)
5. `main`으로 Merge 후 브랜치 삭제
