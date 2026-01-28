# 변경 이력

모든 주요 변경사항을 기록합니다.

## [Unreleased]

### 예정
- 선물 중독 보스 기능 개선 (시작 날짜, 마일스톤)
- 홈 탭 가족 대출 계정 표시
- 고정 항목 D-day 표시

---

## [2.0.0] - 2025-01-28

### Added
- **UI 컴포넌트 완성**
  - HomeTab.js - 홈 대시보드
  - DashboardTab.js - 거래 추가/수정, 통계
  - RecurringTab.js - 고정 항목 관리
  - RPGTab.js - RPG 게임 모드
  - TransactionsTab.js - 거래 내역

- **새로운 CSS 스타일**
  - 사용자 정보 바
  - 거래 내역 리스트
  - 자금 흐름 카드
  - 고정 항목 리스트
  - 카테고리 분석
  - 모달 오버레이

- **기능**
  - CSV 내보내기
  - 거래 필터링 및 검색
  - 날짜별 거래 그룹화
  - 월별 트렌드 차트
  - 자산 분포 시각화

### Changed
- App.js 탭 라우팅 시스템 개선
- 컴포넌트 기반 아키텍처로 전환

---

## [1.5.0] - 2025-01-27

### Added
- **인증 시스템**
  - Supabase Auth 연동
  - 자동 로그인 기능
  - 세션 관리
  - 신규 사용자 기본 계정 생성

- **서비스 레이어**
  - supabase.js - Supabase 클라이언트
  - auth.js - 인증 서비스
  - database.js - CRUD 작업
  - analytics.js - 통계 계산

- **AuthComponent**
  - 로그인/회원가입 UI
  - 비밀번호 유효성 검사
  - 에러 메시지 표시

---

## [1.0.0] - 2025-01-26

### Added
- **프로젝트 구조화**
  - ES6 Modules 적용
  - Vite 빌드 환경
  - 폴더 구조 설계

- **유틸리티**
  - constants.js - 상수 정의
  - helpers.js - 포맷팅 및 계산 함수

- **Supabase 연동**
  - 데이터베이스 스키마
  - RLS 정책
  - 테이블 생성 (transactions, accounts, recurring_items, rpg_data)

---

## [0.1.0] - Phase 1

### Added
- **단일 HTML 프로토타입**
  - 홈 대시보드
  - 고정 항목 관리
  - RPG 모드 (보스, Daily Quest)
  - 거래 관리
  - 카테고리 분석

- **LocalStorage 기반 데이터 저장**

---

## 버전 명명 규칙

- **Major (X.0.0)**: 대규모 변경, 호환성 변경
- **Minor (0.X.0)**: 새로운 기능 추가
- **Patch (0.0.X)**: 버그 수정, 작은 개선
