# Web3 수익 가계부 (v1) - 프로젝트 컨텍스트

## 📋 프로젝트
- **이름**: Web3 수익 가계부 v1
- **스택**: Vite + Vanilla JS + Supabase + Chart.js
- **한 줄 설명**: Web3 수익 추적 + RPG 게이미피케이션 가계부

---

## 🚨 절대 규칙 (위반 시 작업 중단)

**무조건 멈추고 확인:**
1. 파일/함수/컬럼 삭제
2. 3개 이상 파일 동시 수정
3. export 되는 함수/변수 이름 변경
4. DB 스키마 변경
5. 의존성 추가/제거

**절대 금지:**
- UI만 만들고 DB 연결 안 하기
- 확인 없이 작동하던 코드 덮어쓰기
- 같은 에러에 같은 방법 3회 이상 반복
- any 타입으로 도피

---

## 🎯 구현 완결성 (모든 기능 적용)

**기능 = UI + 로직 + DB + 피드백 + 조회**

### 구현 전 체크
```
□ DB 스키마/컬럼 존재? (없으면 먼저 추가)
□ 타입 정의 업데이트 필요?
□ 에러 핸들링 계획?
```

### 구현 후 자기검증
```
□ 저장 → DB 반영 확인
□ 새로고침 → 데이터 유지
□ 에러 상황 → 사용자 피드백
□ 동일 패턴 필요한 다른 곳 → 목록 제시
```

---

## 🔍 변경 전 영향도 분석 (필수)

코드 수정 전 먼저 분석 후 공유:

```
📍 영향 범위:
- 수정: [파일 목록]
- 영향: [이 변경으로 깨질 수 있는 것]
- DB: [스키마 변경 필요 여부]

⚠️ Edge Cases:
- [null/undefined 가능성]
- [에러 상황]
```

---

## 📋 플랜 형식

```
📋 요청: [이해한 내용]

🔍 영향: [수정 파일] → [영향받는 기능]

🔨 계획:
1. [단계] (UI→DB→피드백 전체 포함)
2. ...

🔄 동일 패턴: [다른 곳에도 필요한지]

진행?
```

---

## 🔧 작업 규칙

**코드:**
- 주석/커밋: 한국어
- 한 번에 하나 기능
- 복잡한 로직은 주석으로 "왜" 설명

**에러 대응:**
- 1-2회: 직접 수정
- 3회: 다른 접근법 제안
- 5회: 중단, 현재 상태 커밋, 선택지 제시

**커밋:**
- 작동하는 상태에서만
- 커밋 전 CHANGELOG.md 업데이트
- 형식: `feat:`, `fix:`, `refactor:`

---

## 🔄 세션 프로토콜

**시작:**
1. 이 파일 + CHANGELOG.md 읽기
2. "지난번 [X]까지, 오늘 [Y] 할까요?" 제안

**종료 (필수):**
CHANGELOG.md에 기록:
- 완료/진행중/다음
- 블로커 있으면 명시

---

## 🔐 보안 규칙

1. API 키 → `.env` 사용 (하드코딩 금지)
2. 에러 로깅 → 상세 정보 숨기기
3. 사용자 입력 → 항상 검증
4. `innerHTML` → `textContent` 사용 (XSS 방지)
5. Supabase RLS 정책 활성화 필수

---

## ⚙️ 프로젝트 특이사항

- Supabase: 모든 쿼리에 user_id 필터 필수
- 자동 로그인 에러 주의 (FIX_AUTO_LOGIN_ERROR.md 참고)
- 금액: 정수(원 단위)로 저장
- web3-budget-app (v2)과 별도 프로젝트

---

## 📁 핵심 파일 구조

```
src/
├── App.js                    # 메인 앱 클래스, 탭 라우팅
├── main.js                   # 엔트리 포인트
├── components/
│   ├── AuthComponent.js      # 인증
│   ├── HomeTab.js            # 대시보드
│   ├── DashboardTab.js       # 거래 + 통계
│   ├── RecurringTab.js       # 고정 수입/지출
│   ├── RPGTab.js             # RPG 게이미피케이션
│   ├── TransactionsTab.js    # 거래 관리
│   └── AccountsTab.js        # 계좌 관리
├── services/
│   ├── supabase.js           # Supabase 클라이언트
│   ├── auth.js               # 인증 서비스
│   ├── database.js           # CRUD 작업
│   ├── analytics.js          # 통계 계산
│   └── storage.js            # LocalStorage 래퍼
├── utils/
│   ├── helpers.js            # 유틸리티 함수
│   └── constants.js          # 카테고리, 상수
└── styles/
    ├── main.css              # 공통 스타일
    └── auth.css              # 인증 스타일
```

## 실행 방법
```bash
npm install
npx vite --port 5173     # http://localhost:5173
```

---

## 📊 개발 진행 상태

| Phase | 상태 | 주요 내용 |
|-------|------|----------|
| Phase 1 | ✅ 완료 | HTML 프로토타입 (web3-budget.html) |
| Phase 2 | ✅ 완료 | 모듈화 + Supabase 연동 |
| Phase 3 | 🔄 90% | 레벨/업적/차트 고급 기능 |
| Phase 4 | ⏳ 대기 | 배포 (Vercel), PWA |

---

## 📌 빠른 명령

| 상황 | 말할 것 |
|------|---------|
| 구현 전 | "영향도 먼저 분석해" |
| 전체 흐름 | "DB까지 전체 구현해" |
| 패턴 확인 | "다른 곳도 필요한지 확인해" |
| 검증 | "검증하고 테스트 시나리오 알려줘" |
| 종료 | "CHANGELOG 업데이트하고 마무리" |

---

## 🔗 관련 문서

- `CHANGELOG.md` - 버전 히스토리
- `PROGRESS.md` - 개발 진행 상태
- `ROADMAP.md` - 향후 개발 계획
- `CLAUDE_CODE_GUIDE.md` - Claude Code 활용 가이드
- `FIX_AUTO_LOGIN_ERROR.md` - 자동 로그인 에러 해결
- `supabase/SETUP.md` - DB 설정 가이드
