# Web3 수익 가계부

Web3 활동(에어드랍, 야핑, 테스트넷 등)에서 발생하는 수익과 지출을 체계적으로 관리하고, RPG 게임 요소로 재정 목표 달성에 동기부여를 제공하는 가계부 애플리케이션

## 주요 기능

### 홈 대시보드
- 총 자산 현황 및 이번 달 변화
- 수입/지출/순수익 요약
- 자산 분포 (Web3 지갑, 투자 계정, 은행 계정)
- 자금 흐름 분석 및 자동 인사이트
- 월별 트렌드 차트

### 거래 관리
- 거래 추가/수정/삭제
- 날짜별 필터 (전체, 이번 주, 이번 달, 지난 달)
- 카테고리별 분석 및 파이 차트
- 검색 및 필터링

### 고정 항목 관리
- 고정 수입/지출 등록
- 반복 주기 설정 (매월, 매주, 매일)
- 월 예상 순수익 자동 계산

### RPG 모드
- **Main Quest**: 500억 자산 달성 목표
- **선물 중독 보스**: 선물거래 중단 스트릭 관리
- **대출 보스**: 은행 대출, 부모님 대출 상환 진행
- **Daily Quest**: 일일 미션 체크리스트

### 거래 내역
- 전체 거래 목록
- 유형/카테고리/검색어 필터
- CSV 내보내기

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Vanilla JS + ES6 Modules |
| Build Tool | Vite |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (자동 로그인 지원) |
| Charts | Chart.js |
| Styling | Pure CSS + CSS Variables |

## 프로젝트 구조

```
src/
├── main.js                 # 앱 진입점
├── App.js                  # 메인 앱 클래스
├── components/
│   ├── AuthComponent.js    # 로그인/회원가입
│   ├── HomeTab.js          # 홈 대시보드
│   ├── DashboardTab.js     # 거래 추가/통계
│   ├── RecurringTab.js     # 고정 항목
│   ├── RPGTab.js           # RPG 모드
│   └── TransactionsTab.js  # 거래 내역
├── services/
│   ├── supabase.js         # Supabase 클라이언트
│   ├── auth.js             # 인증 서비스
│   ├── database.js         # DB CRUD
│   ├── storage.js          # LocalStorage
│   └── analytics.js        # 통계 계산
├── utils/
│   ├── constants.js        # 상수 정의
│   └── helpers.js          # 유틸리티 함수
└── styles/
    ├── main.css            # 메인 스타일
    └── auth.css            # 인증 스타일
```

## 시작하기

### 1. 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일 생성:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 빌드
```bash
npm run build
```

## Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. `supabase/schema.sql` 파일의 SQL 실행
3. `.env` 파일에 URL과 ANON KEY 입력
4. 자세한 내용은 `supabase/SETUP.md` 참고

## 문서

- [PROGRESS.md](./PROGRESS.md) - 개발 진행 상황
- [ROADMAP.md](./ROADMAP.md) - 향후 개발 계획
- [CHANGELOG.md](./CHANGELOG.md) - 변경 이력
- [supabase/SETUP.md](./supabase/SETUP.md) - Supabase 설정 가이드

## 라이선스

MIT
