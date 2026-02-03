# Web3 자산관리 앱 - 프로젝트 컨텍스트

---

## 🔥 현재 세션 상태 (매 작업 후 업데이트)

> **Claude에게**: 이 섹션을 먼저 읽고, 작업 완료 후 업데이트해줘

| 항목 | 값 |
|------|-----|
| **마지막 작업** | 7가지 버그 수정 완료 (2026-02-04) |
| **마지막 커밋** | `fc49ea2` - fix: 7가지 버그 수정 및 기능 개선 |
| **배포 상태** | ✅ Vercel 자동 배포 완료 |
| **다음 작업** | 없음 (모든 작업 완료) |

### ✅ Supabase 마이그레이션 완료
- `migration_add_day_of_month.sql` ✅
- `migration_add_owner_to_recurring.sql` ✅

### 2026-02-04 완료된 버그 수정

| # | 이슈 | 해결 내용 |
|---|------|----------|
| 1 | day_of_month 컬럼 오류 | recurring_items에 컬럼 추가 마이그레이션 |
| 2 | 고정 지출 소유자 지정 | owner 컬럼 + UI 추가 |
| 3 | 런치패드/ICO 손익 계산 | calculateIcoProfit 함수 + 요약 UI |
| 4 | 에어드랍 입력 UI 간소화 | 빠른 추가 모달 생성 |
| 5 | 자산관리 UI 깨짐 | 모바일 반응형 수정 |
| 6 | 고정 수입 총수입 미반영 | updateMonthlySummary 수정 |
| 7 | 자동 계산 기능 | 대출 월상환액/적금 만기액/수익률 함수 |

### 스킵할 것
- ❌ 로컬 빌드 테스트 (Windows 환경 문제 → Vercel에서 확인)
- ❌ 거래소 API 연동 (보류)

---

## ⚡ 효율적인 요청 방법

### 원샷 요청 템플릿
```
"[파일명]에서 [작업내용] 하고, 커밋 메시지 '[타입]: [내용]'으로 푸시까지"

예시:
"HomeTab.js에서 로딩 스피너 추가하고, 커밋 메시지 'feat: 홈 로딩 추가'로 푸시까지"
```

### 다중 작업 요청
```
"다음 작업들 순서대로 진행해줘:
1. [작업1]
2. [작업2]
3. 완료 후 커밋, 푸시"
```

### 상태 확인 (토큰 절약)
```
❌ "어디까지 됐어?" (파일 다시 읽어야 함)
✅ "CLAUDE.md의 현재 세션 상태 기준으로 다음 작업 진행해줘"
```

### 에러 해결
```
"[에러메시지 전체 복사]
파일: [파일경로]
이 에러 해결하고 푸시까지"
```

---

## 🚫 환경 제약 조건

| 제약 | 대응 |
|------|------|
| Windows 로컬 빌드 불안정 | `npm run build` 스킵, Vercel에서 확인 |
| Vite 타임아웃 | 빌드 에러는 push 후 Vercel 로그 확인 |

---

## 📋 프로젝트 개요

- **목적**: 개인 자산/부채 추적, 현금 흐름 시각화, 크립토 포트폴리오 관리
- **스택**: Vite + Vanilla JS + Supabase + Chart.js
- **GitHub**: https://github.com/clusteruni-debug/web3-budget-app.git
- **배포**: Vercel (`v2-unified-portfolio` 브랜치) → `git push` = 자동 배포

---

## 🔐 보안 규칙

1. API 키 → `.env` 사용 (하드코딩 금지)
2. 에러 로깅 → 상세 정보 숨기기
3. 사용자 입력 → 항상 검증
4. `innerHTML` → `textContent` 사용 (XSS 방지)

---

## 📁 핵심 파일 구조

```
src/
├── components/
│   ├── HomeTab.js         # 대시보드 + 스마트 입력
│   ├── DashboardTab.js    # 거래 탭 (서브탭: 입력 | 현금흐름)
│   ├── CashflowTab.js     # 현금흐름 (Sankey)
│   ├── ToolsTab.js        # 도구 (예산, 설정, 알림)
│   └── AssetManagementTab.js
├── utils/
│   ├── helpers.js         # formatAmountShort, parseTransactionText, showToast, Push알림
│   └── constants.js       # 카테고리
└── styles/
    ├── main.css           # 공통 + 서브탭
    ├── v2-home.css        # 홈 + 스마트입력
    └── v2-tools.css       # 도구 + 알림설정
```

---

## ✅ UX 로드맵 완료 현황

| Phase | 상태 | 주요 내용 |
|-------|------|----------|
| Phase 1 | ✅ 100% | 홈 간소화, FAB 거래입력, 빈상태 CTA |
| Phase 2 | ✅ 100% | 모바일 탭바, 탭 통합, 스마트 입력 |
| Phase 3 | ✅ 100% | CSS 변수, 스켈레톤, 애니메이션 |
| Phase 4 | ✅ 100% | 월간 리포트, Push 알림 |

> 상세: `docs/CHECKLIST.md`

---

## 🎯 자주 쓰는 작업

### 새 기능 추가
```
"[파일명]에 [기능] 추가해줘. [참고파일] 패턴 따라서. 완료 후 푸시"
```

### 버그 수정
```
"[에러내용]
[파일:라인] 수정하고 푸시"
```

### 스타일 수정
```
"[컴포넌트]의 [요소] 스타일 변경: [현재] → [변경]. 푸시까지"
```

---

## 📝 데이터 규칙

- **어머니 대출**: `description`에 `[어머니]` → 참고용만
- **본인 대출**: `description`에 `[본인]` → 실제 지출
- **금액 표시**: `formatAmountShort()` → 억/만원 축약

---

## 🔗 관련 문서

- `docs/CHECKLIST.md` - UX 체크리스트 (100% 완료)
- `docs/UX_IMPROVEMENT_ROADMAP.md` - 상세 로드맵
- `supabase/SETUP.md` - DB 설정 가이드
