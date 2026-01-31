# Web3 자산관리 앱 - 프로젝트 컨텍스트

## 프로젝트 개요
- **목적**: 개인 자산/부채 추적, 현금 흐름 시각화, 크립토 포트폴리오 관리
- **스택**: Vite + Vanilla JS + Supabase + Chart.js

## 배포 & Git
- **GitHub**: https://github.com/clusteruni-debug/web3-budget-app.git
- **배포**: Vercel (`v2-unified-portfolio` 브랜치 연결)
- **배포 방법**: `git push` → 자동 배포
- **main 브랜치**: 이전 버전, 건드리지 않음

## 주요 기능
- 순자산 대시보드 (자산 - 부채)
- 현금흐름도 (Sankey 다이어그램, Google Charts)
- 크립토: 스테이킹, 에어드랍 추적 (67개 기록)
- 부채 관리

## 데이터 구조 (중요!)
- **어머니 대출**: `description`에 `[어머니]` 포함 → 참고용으로만 표시 (본인 지출 아님)
- **본인 대출**: `description`에 `[본인]` 포함 → 실제 월 고정지출
- **Supabase RLS**: 활성화됨, user_id로 필터링

## 파일 구조
```
src/
├── components/     # 탭별 컴포넌트
│   ├── HomeTab.js         # 대시보드 (접기/펼치기 기능)
│   ├── CashflowTab.js     # 현금흐름도
│   ├── AssetsTab.js       # 자산 관리
│   └── ...
├── services/
│   ├── database.js        # Supabase CRUD
│   └── analytics.js       # 통계 계산
├── styles/
│   ├── main.css           # 공통 스타일
│   ├── v2-home.css        # 홈 탭
│   └── v2-cashflow.css    # 현금흐름 탭
└── utils/
    ├── helpers.js         # formatAmountShort 등
    └── constants.js       # 카테고리, 목표금액
supabase/
├── insert_all_data_clean.sql    # 초기 데이터 (DELETE 후 INSERT)
└── migration_*.sql              # DB 스키마
```

## 스타일 가이드
- 다크 테마 + Glassmorphism
- 반응형: 768px, 480px 브레이크포인트
- 금액: `formatAmountShort()` → 억/만원 축약

## 자주 쓰는 명령
```bash
npm run dev      # 로컬 테스트 (http://localhost:5173)
npm run build    # 프로덕션 빌드
git push         # Vercel 자동 배포
```

## 작업 시 주의사항
- SQL 실행 시 중복 주의 → DELETE 먼저 실행
- 섹션 접기/펼치기: `.section-title[data-toggle]` 클릭 이벤트
- 어머니 대출은 CashflowTab에서 별도 섹션으로 분리 표시

---

## Claude Code 활용 팁

### 좋은 요청 예시
```
"HomeTab.js의 에어드랍 섹션에 총 수익 표시 추가해줘.
formatAmountShort() 사용하고, airdrop_status가 'claimed'인 것만 합산."
```

### 에러 발생 시
1. 에러 메시지 복사
2. 관련 코드 위치 알려주기
3. "이 에러 해결해줘" 요청

### 배포 요청
```
"변경사항 커밋하고 push 해줘" → 자동 Vercel 배포
```
