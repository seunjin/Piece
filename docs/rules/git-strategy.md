# Git Branching Strategy (Piece Project)

본 프로젝트는 개인 개발 환경에 최적화된 **"Trunk-based Feature Workflow"**를 따릅니다.
복잡한 `git-flow`나 `dev` 브랜치 없이, `main` 브랜치를 중심으로 빠르고 간결하게 운영합니다.

## 1. Branch Structure

### 🌳 `main` (Protected)
- **역할:** 언제나 배포 가능한(Production-ready) 상태.
- **배포:** Vercel Production 환경과 자동 연동.
- **규칙:** 직접 커밋 금지(권장), 반드시 PR(Pull Request)을 통해 Merge.

### 🌿 `feat/*` (Feature)
- **역할:** 새로운 기능 개발.
- **생성:** `main`에서 분기.
- **예시:** `feat/auth-setup`, `feat/landing-page`
- **배포:** Vercel Preview 환경과 자동 연동 (테스트 용도).

### 🐛 `fix/*`, `chore/*`, `refactor/*`
- **fix:** 버그 수정 (`fix/login-error`)
- **chore:** 설정, 패키지 관리 (`chore/add-biome`)
- **refactor:** 코드 구조 개선 (`refactor/api-logic`)

---

## 2. Workflow (Step-by-Step)

1.  **브랜치 생성:**
    ```bash
    git checkout main
    git pull origin main
    git checkout -b feat/my-new-feature
    ```

2.  **작업 및 커밋:**
    - **Small Commits:** 가능한 작게 커밋합니다.
    - **Pre-commit:** 커밋 시 `Lefthook`이 자동으로 포맷팅(Biome)과 린트 검사를 수행합니다.
    - **Message:** Conventional Commits 규칙 준수.
    ```bash
    # 예시
    git commit -m "feat: implement login form UI"
    ```

3.  **푸시 (Push):**
    ```bash
    git push -u origin feat/my-new-feature
    ```

4.  **PR & Merge:**
    - GitHub에서 Pull Request 생성.
    - (Option) Vercel Preview URL에서 기능 확인.
    - `Squash and Merge` 사용하여 `main` 히스토리를 깔끔하게 유지.

5.  **로컬 정리:**
    ```bash
    git checkout main
    git pull origin main
    git branch -d feat/my-new-feature
    ```
