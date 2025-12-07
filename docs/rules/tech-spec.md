# 기술 스펙 (Technical Specification)

## 1. Core Framework & Language

- **Framework:** Next.js 16+ (App Router 필수)
  - `TurboPack` 사용 활성화
  - Server Actions 위주로 데이터 변형(Mutation) 처리
- **Language:** TypeScript 5.x (Strict Mode)
- **Package Manager:** pnpm (권장) 또는 npm

## 2. Code Quality & Formatting (Biome)

- **Linter & Formatter:** Biome (`@biomejs/biome`)
  - ESLint, Prettier 사용 금지 (Biome로 통합)
  - 규칙: `biome.json` 설정에 따름 (Import 정렬, 들여쓰기 등 자동화)
  - 저장 시 자동 포맷팅(Format on Save) 활성화 필수

## 3. UI & Styling

- **Styling Engine:** Tailwind CSS v4 (Rust 기반 컴파일러)
- **Component Library:** Shadcn/ui (Radix UI 기반)
- **Icons:** Lucide React
- **Animation:** Framer Motion (필요한 경우만, 최소화)
- **Font:** `next/font` (Google Fonts 최적화 - Pretendard 등 사용)

## 4. State Management

- **Global Client State:** Zustand (최소한으로 사용)
- **Server State:** React Query (TanStack Query) v5
  - _참고:_ 단순 데이터 조회는 Next.js `fetch` + `Server Component`를 우선 사용
  - 클라이언트 사이드 폴링이나 무한 스크롤이 필요할 때만 React Query 도입
- **URL State:** `nuqs` (Type-safe Search Params)
  - 필터, 검색어 등은 `useState`가 아니라 URL 쿼리 파라미터로 관리

## 5. Backend & Database (Serverless)

- **Platform:** Supabase
- **Database:** PostgreSQL
- **ORM/Client:** Supabase SSR Client (`@supabase/ssr`)
  - Database Type은 `supabase gen types` 명령어로 자동 생성하여 사용
- **Auth:** Supabase Auth (OAuth: Google, Kakao)
- **Storage:** Supabase Storage (이미지 등)

## 6. Forms & Validation

- **Form Management:** React Hook Form
- **Schema Validation:** Zod
  - API 입력값 검증 및 환경변수(Environment Variables) 검증에 Zod 사용 필수

## 7. Infrastructure & DevOps

## 7. Infrastructure & DevOps (Updated)

- **Hosting:** Vercel
- **CI/CD:** GitHub Actions (Build, Type Check, Lint Check)
- **Email:** Resend API + React Email
- **Analytics:** Vercel Analytics (MVP 단계)
- **Git Hooks & Linting:**
  - **Tool:** `lefthook` (Husky 대체)
  - **Commit Convention:** Conventional Commits (`@commitlint/config-conventional`)
  - **Pre-commit:** 커밋 시 `Biome`가 자동으로 코드 포맷팅 및 린트 검사를 수행하고, 수정된 사항을 스테이징에 다시 반영한다.
  - **Commit-msg:** 커밋 메시지 형식이 규칙(feat, fix 등)에 맞지 않으면 커밋을 차단한다.

### Database Workflow (Supabase CLI)

- **Local Development:** `supabase start`를 통해 로컬 Docker 환경에서 개발한다.
- **Migration:**
  - DB 스키마 변경 시 직접 SQL을 작성하지 않고, 로컬 대시보드에서 변경 후 `supabase db diff` 명령어로 마이그레이션 파일을 생성한다.
  - 생성된 마이그레이션 파일(`supabase/migrations/*.sql`)은 Git에 커밋되어야 한다.
- **Deployment:** `supabase db push`를 통해 프로덕션 DB에 반영한다.
- **Seeding:** 개발용 초기 데이터는 `supabase/seed.sql`에 작성하여 관리한다.

## 8. Data Fetching Strategy

### A. Data Access Layer (DAL)

- 위치: `services/` 또는 `lib/db/`
- 역할: Supabase DB에 직접 접근하는 순수 비동기 함수들을 모아둔다.
- 규칙: 이 계층의 함수들은 API 라우트가 아니며, Request/Response 객체를 다루지 않는다.

### B. Server Components (Default)

- **Direct Call Pattern:** 서버 컴포넌트에서는 API Route(`fetch('/api/...')`)를 호출하지 않는다.
- 대신 DAL의 함수를 직접 Import하여 호출한다. (`await getNews()`)

### C. Client Components

- **React Query + Server Actions:** - 클라이언트에서 데이터 페칭이 필요한 경우 (예: 무한 스크롤, 폴링), 별도의 API Route를 만들기보다 **Server Actions**를 작성하여 React Query의 `queryFn`으로 사용한다.
  - 이를 통해 API 엔드포인트 관리 부담을 줄이고 타입 안전성을 확보한다.

### D. Route Handlers (API Routes)

- 외부 서비스(Webhook)나 모바일 앱 등 **Next.js 외부**에서 접근해야 할 때만 `/app/api/` 경로에 생성한다.

## 10. SEO & Metadata Strategy (Critical)

- **Metadata API:** Next.js `generateMetadata` 함수를 적극 활용한다.
- **Dynamic OG Image:** `next/og` (Satori)를 사용하여 뉴스/퀴즈 결과 공유 시 동적인 썸네일(Open Graph Image)을 생성한다.
  - _예: "오늘의 퀴즈 점수: 100점" 텍스트가 박힌 이미지 자동 생성_
- **Sitemap:** `app/sitemap.ts`를 사용하여 동적 라우트(`/archive/[id]`)의 사이트맵을 자동 생성한다.
- **Semantic HTML:** AI는 반드시 시멘틱 태그(`article`, `section`, `main`, `h1~h6`)를 준수하여 마크업해야 한다.

## 11. Image Optimization Strategy

- **Component:** `next/image` 컴포넌트 사용 필수 (`<img>` 태그 금지).
- **Remote Patterns:** 외부 뉴스 이미지(Naver 등)를 로드하기 위해 `next.config.js`의 `remotePatterns` 설정이 필요함을 인지한다.
- **Placeholder:** 이미지 로딩 중 Layout Shift(CLS) 방지를 위해 `blurDataURL` 또는 스켈레톤 UI를 구현한다.

## 12. Error Handling & Logging

- **Error Boundaries:** `error.tsx`와 `global-error.tsx`를 사용하여 런타임 에러 발생 시 우아한(Graceful) 에러 페이지를 보여준다.
- **Toast UI:** 사용자 인터랙션 에러(예: 퀴즈 정답 제출 실패)는 `sonner`(Shadcn UI)를 사용하여 Toast 메시지로 알린다.
- **Console Logging:** 서버 사이드 에러는 `console.error`로 출력하여 Vercel Logs에 남기되, 민감 정보(PII)는 마스킹한다.

## 13. Security & Proxy (Next.js 16+)

- **File Convention:** `middleware.ts` 대신 **`proxy.ts`**를 사용한다 (Next.js 16 Breaking Change).
- **Role:**
  - Supabase Auth 세션 검증 (Session Guard).
  - 보호된 라우트(`/my`, `/admin`) 접근 제어.
  - A/B 테스트를 위한 Rewrite 처리.
- **Environment:** `proxy.ts`는 Node.js Runtime을 지원하므로, 필요시 Node.js 전용 라이브러리를 사용할 수 있다.
- **Security:** 모든 환경변수는 `process.env` 직접 접근을 금지하고, `env.ts` (Zod 검증)를 통해서만 접근한다.

## 14. Testing Strategy (MVP)

- **Unit Test:** 비즈니스 로직이 복잡한 유틸리티 함수(예: 점수 계산, 날짜 포맷팅)에 한해 `Vitest`로 작성한다.
- **E2E Test:** 핵심 사용자 흐름(로그인 -> 뉴스 조회 -> 퀴즈 풀기)은 `Playwright`로 테스트한다.
  - _MVP 단계에서는 UI 테스트보다 핵심 기능 작동 여부 확인에 집중._
