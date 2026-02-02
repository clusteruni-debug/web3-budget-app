# Web3 자산관리 앱 - 프로젝트 컨텍스트

---

## 🔐 보안 체크리스트 (작업 시작 전 확인)

### 필수 확인사항
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] Supabase RLS(Row Level Security)가 활성화되어 있는가?
- [ ] `auth.js`에서 비밀번호를 localStorage에 저장하지 않는가?

### 코드 작성 시 보안 규칙
1. **API 키**: 절대 코드에 하드코딩 금지 → `.env` 사용
2. **에러 로깅**: `console.error(error)` 대신 일반 메시지만 표시
3. **사용자 입력**: 항상 검증 후 사용 (길이 제한, 타입 체크)
4. **innerHTML 사용 금지**: XSS 방지를 위해 `textContent` 사용

### 최근 보안 수정 (2026-02-02)
- ✅ 평문 비밀번호 localStorage 저장 제거
- ✅ Supabase 세션 기반 자동 로그인으로 변경
- ✅ 에러 로깅에서 상세 정보 숨기기
- ✅ 보안 헤더 추가 (X-Frame-Options 등)

---

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

## UX/UI 개선 로드맵

> 상세 내용: `docs/UX_IMPROVEMENT_ROADMAP.md`
> 체크리스트: `docs/CHECKLIST.md`

### 현재 상태 (2026-02-02)
| 영역 | 점수 | 핵심 이슈 |
|------|------|----------|
| PM (제품 전략) | 6/10 | 기능 과다, 핵심 여정 불명확 |
| UX/UI (사용자 경험) | 5/10 | 정보 과부하, 인터랙션 부족 |
| Visual Design | 7/10 | 좋은 기반, 일관성 부족 |

### 개선 우선순위
1. **P0**: 홈 탭 간소화, 거래 빠른 입력 (플로팅 버튼)
2. **P1**: 빈 상태 CTA 추가, 버튼/카드 컴포넌트 표준화
3. **P2**: 색상 대비 개선, 모달 애니메이션
4. **P3**: 거래소 API 연동, 월간 리포트

### Phase별 일정
| Phase | 내용 | 예상 기간 |
|-------|------|----------|
| Phase 1 | Quick Wins (홈 간소화, 빠른 입력) | 1주 |
| Phase 2 | Core UX (IA 재구성, 모바일 최적화) | 2주 |
| Phase 3 | Design System (버튼/카드 표준화) | 1주 |
| Phase 4 | Advanced (API 연동, 리포트) | 4주+ |

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
