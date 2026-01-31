# 프로젝트 컨텍스트

## 프로젝트 개요
- **이름**: Web3 자산관리 앱
- **목적**: 개인 자산/부채 추적, 현금 흐름 시각화, 크립토 포트폴리오 관리
- **스택**: Vite + Vanilla JS + Supabase

## 배포 정보
- **GitHub**: https://github.com/clusteruni-debug/web3-budget-app.git
- **배포**: Vercel (v2-unified-portfolio 브랜치 연결)
- **Supabase 프로젝트**: 연결됨 (RLS 활성화)

## 브랜치 전략
- `main`: 이전 버전 (건드리지 않음)
- `v2-unified-portfolio`: 현재 작업 브랜치, Vercel 배포 연결

## 주요 기능
- 순자산 대시보드 (자산 - 부채)
- 현금흐름도 (Sankey 다이어그램)
- 크립토: 스테이킹, 에어드랍 추적
- 부채 관리 (본인 대출 vs 어머니 대출 분리)

## 데이터 구조
- 어머니 대출: `description`에 `[어머니]` 포함 → 참고용으로만 표시 (본인 지출 아님)
- 본인 대출: `description`에 `[본인]` 포함 → 실제 월 고정지출

## 파일 구조
```
src/
├── components/     # 탭 컴포넌트 (HomeTab, CashflowTab, AssetsTab 등)
├── services/       # Supabase 연동 (database.js, analytics.js)
├── styles/         # CSS (main.css, v2-*.css)
└── utils/          # 헬퍼 함수, 상수
supabase/
├── insert_all_data_clean.sql    # 초기 데이터
└── migration_*.sql              # DB 마이그레이션
```

## 스타일 가이드
- 다크 테마 + Glassmorphism
- 모바일 반응형 (768px, 480px 브레이크포인트)
- 금액 표시: 억/만원 축약 사용 (`formatAmountShort`)

## 자주 하는 작업
- 배포: `git push` → Vercel 자동 배포
- 로컬 테스트: `npm run dev`
- 빌드: `npm run build`
