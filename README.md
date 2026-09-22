# LocalTaste

**실패 없는 진짜 로컬 맛집 매칭 플랫폼**

광고성 맛집 리뷰에 지친 사용자를 위해 실제 이용자의 영수증 인증 리뷰를 기반으로 믿을 수 있는 로컬 맛집을 찾을 수 있도록 돕는 맛집 추천 플랫폼입니다.

---

## 1. 기술 스택

### Frontend / Backend
- Next.js
- React
- TypeScript
- Next.js App Router
- Next.js Route Handlers

### Database
- MongoDB
- Mongoose

### Authentication
- JWT
- bcryptjs

### External API
- 지도 API (Google Maps 또는 Naver Maps)

---

## 2. 프로젝트 파일 구조

```text
local-taste/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   │
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── signup/
│   │   └── page.tsx
│   │
│   ├── restaurants/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── reviews/
│   │   └── create/
│   │       └── page.tsx
│   │
│   ├── map/
│   │   └── page.tsx
│   │
│   ├── mypage/
│   │   └── page.tsx
│   │
│   └── api/
│       ├── auth/
│       │   ├── login/
│       │   │   └── route.ts
│       │   └── signup/
│       │       └── route.ts
│       │
│       ├── restaurants/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       └── reviews/
│       │           └── route.ts
│       │
│       ├── reviews/
│       │   └── [id]/
│       │       └── route.ts
│       │
│       ├── bookmarks/
│       │   └── route.ts
│       │
│       └── users/
│           └── me/
│               └── route.ts
│
├── components/
│   ├── common/
│   ├── layout/
│   ├── restaurant/
│   ├── review/
│   ├── map/
│   └── user/
│
├── lib/
│   ├── mongodb.ts
│   ├── auth.ts
│   └── utils.ts
│
├── models/
│   ├── User.ts
│   ├── Restaurant.ts
│   ├── Review.ts
│   └── Bookmark.ts
│
├── types/
│   ├── user.ts
│   ├── restaurant.ts
│   └── review.ts
│
├── public/
│   └── images/
│
├── .env.local
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 3. 설치해야 할 패키지

### 프로젝트 생성

```bash
npx create-next-app@latest local-taste
```

권장 설정:

```text
TypeScript      Yes
ESLint          Yes
Tailwind CSS    Yes
src/ directory  No
App Router      Yes
Turbopack       Yes
```

### MongoDB / Mongoose

```bash
npm install mongoose
```

### JWT / 비밀번호 암호화

```bash
npm install jsonwebtoken bcryptjs
```

TypeScript 타입 패키지:

```bash
npm install -D @types/jsonwebtoken @types/bcryptjs
```

### 지도 API

Google Maps를 사용하는 경우:

```bash
npm install @react-google-maps/api
```

Naver Maps를 사용하는 경우에는 프로젝트에서 사용할 Naver Maps SDK 방식에 맞춰 추가합니다.

### 한 번에 설치

```bash
npm install mongoose jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs
```

---

## 4. 환경변수

프로젝트 루트에 `.env.local` 파일을 생성합니다.

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/localtaste

JWT_SECRET=YOUR_SECRET_KEY

NEXT_PUBLIC_MAP_API_KEY=YOUR_MAP_API_KEY
```

실제 비밀번호와 API Key는 GitHub에 업로드하지 않습니다.

`.gitignore`에 다음을 포함합니다.

```text
.env
.env.local
node_modules
.next
```

---

## 5. MongoDB Collection

### User

사용자 계정 및 취향 정보를 저장합니다.

```text
User
├── _id
├── email
├── password
├── nickname
├── tastePreference
│   ├── food
│   ├── atmosphere
│   └── avoidIngredients
├── createdAt
└── updatedAt
```

### Restaurant

맛집 기본 정보를 저장합니다.

```text
Restaurant
├── _id
├── name
├── address
├── category
├── tags
├── imageUrl
├── location
│   ├── lat
│   └── lng
├── averageRating
├── createdAt
└── updatedAt
```

### Review

사용자가 작성한 리뷰를 저장합니다.

```text
Review
├── _id
├── userId
├── restaurantId
├── rating
├── content
├── receiptAuth
├── receiptImageUrl
├── createdAt
└── updatedAt
```

### Bookmark

사용자가 저장한 맛집을 관리합니다.

```text
Bookmark
├── _id
├── userId
├── restaurantId
└── createdAt
```

---

## 6. Collection 관계

```text
User
 │
 │ 1 : N
 ▼
Review
 │
 │ N : 1
 ▼
Restaurant

User
 │
 │ 1 : N
 ▼
Bookmark
 │
 │ N : 1
 ▼
Restaurant
```

Review와 Bookmark는 User와 Restaurant의 ObjectId를 Reference로 연결합니다.

---

## 7. 주요 화면

### Home
- 상황별 맛집 추천
- 음식 카테고리 선택
- 취향 일치율
- 평점
- 거리
- 정렬

### Map
- 주변 맛집 지도 표시
- 맛집 마커
- 카테고리 / 상황 필터

### RestaurantDetail
- 대표 이미지
- 식당명
- 주소
- 카테고리
- 메뉴
- 평점
- 지도
- 리뷰
- 북마크
- 리뷰 작성

### ReviewCreate
- 영수증 업로드
- 영수증 인증
- 별점
- 후기 작성
- 리뷰 등록

### MyPage
- 프로필
- 음식 취향
- 기피 식재료
- 선호 분위기
- 작성 리뷰
- 북마크

### Login / Signup
- 회원가입
- 로그인
- JWT 인증
- 초기 취향 설정

---

## 8. 주요 API

### 인증

```text
POST /api/auth/signup
POST /api/auth/login
```

### 맛집

```text
GET /api/restaurants
GET /api/restaurants/:id
```

맛집 목록 검색 / 필터:

```text
GET /api/restaurants?category=한식&tag=혼밥&sort=rating
```

### 리뷰

```text
GET    /api/restaurants/:id/reviews
POST   /api/restaurants/:id/reviews
PATCH  /api/reviews/:id
DELETE /api/reviews/:id
```

### 북마크

```text
POST   /api/bookmarks
DELETE /api/bookmarks/:id
```

### 사용자

```text
GET /api/users/me
```

---

## 9. 리뷰 작성 흐름

```text
맛집 상세
   ↓
리뷰 작성
   ↓
영수증 업로드
   ↓
영수증 인증
   ↓
별점 선택
   ↓
후기 작성
   ↓
등록
   ↓
Review 저장
   ↓
Restaurant 평균 평점 갱신
   ↓
맛집 상세 화면
   ↓
작성한 리뷰 확인
```

---

## 10. Validation

### Client

- 별점 입력 여부
- 별점 1~5 범위
- 후기 입력 여부
- 후기 최소 10자
- 공백만 입력했는지 확인

### Server

- JWT 유효성 검사
- 로그인 여부 확인
- 별점 1~5 범위 검사
- 후기 공백 검사
- Restaurant 존재 여부 검사
- 잘못된 요청 데이터 검사

Client Validation만 믿지 않고 Server에서 반드시 다시 검증합니다.

---

## 11. HTTP Status

```text
200 OK
조회 성공

201 Created
데이터 생성 성공

400 Bad Request
잘못된 요청 / 필수값 누락

401 Unauthorized
로그인 필요 / JWT 인증 실패

404 Not Found
존재하지 않는 데이터

500 Internal Server Error
서버 오류
```

---

## 12. 개발 순서

### 1단계 - 프로젝트 기본 환경

- Next.js
- TypeScript
- Tailwind CSS
- MongoDB
- Mongoose

### 2단계 - Database

- User Model
- Restaurant Model
- Review Model
- Bookmark Model
- MongoDB 연결

### 3단계 - Authentication

- 회원가입 API
- 로그인 API
- JWT 인증
- 비밀번호 암호화

### 4단계 - Restaurant

- 맛집 목록
- 검색 / 필터
- 맛집 상세
- 지도 API

### 5단계 - Review

- 리뷰 작성
- 영수증 업로드
- 영수증 인증
- 리뷰 조회
- 리뷰 수정
- 리뷰 삭제

### 6단계 - Bookmark / MyPage

- 북마크 추가
- 북마크 삭제
- 마이페이지
- 취향 설정

### 7단계 - 테스트

- Client Validation
- Server Validation
- API 테스트
- 오류 처리
- 화면 ↔ API ↔ DB 연결 확인

---

## 13. MVP 우선순위

### 1순위

```text
회원가입 / 로그인
맛집 목록
맛집 상세
리뷰 작성
리뷰 조회
MongoDB 연동
```

### 2순위

```text
지도 API
검색 / 필터
리뷰 수정 / 삭제
```

### 3순위

```text
북마크
마이페이지 취향 설정
리뷰 댓글
```

---

## 14. Full-stack 데이터 흐름

```text
사용자
  ↓
Next.js 화면
  ↓
사용자 행동
  ↓
Next.js API Route Handler
  ↓
JWT 인증 / Server Validation
  ↓
Mongoose Model
  ↓
MongoDB
  ↓
Response
  ↓
Next.js UI 업데이트
```

---

## 15. 프로젝트 개발 원칙

1. **Next.js + MongoDB를 기본 기술 스택으로 사용한다.**
2. 화면 → API → DB 흐름을 명확하게 연결한다.
3. 인증이 필요한 API는 JWT로 보호한다.
4. Client Validation과 Server Validation을 모두 수행한다.
5. 리뷰 작성은 로그인한 사용자만 가능하게 한다.
6. 영수증 인증 리뷰를 서비스의 핵심 차별점으로 활용한다.
7. Figma 화면에 필요한 데이터가 API Response에 포함되어 있는지 확인한다.
8. MVP 핵심 기능부터 개발하고 추가 기능은 이후 구현한다.
9. 기능별로 개발한 뒤 테스트한다.
10. API 또는 DB Schema를 변경할 경우 관련 화면과 API 명세도 함께 확인한다.
