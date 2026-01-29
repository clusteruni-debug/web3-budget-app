# PC에서 작업 이어하기 가이드

> 작성일: 2026-01-29

## 현재 상태

V2 통합 자산 관리 시스템 개발 완료. Supabase에 SQL 실행만 하면 됨.

---

## 1. 로컬에서 시작하기

```bash
# 프로젝트 폴더로 이동
cd C:\Users\clust\Desktop\myvibe\web3-budget-app

# 최신 코드 가져오기
git pull origin v2-unified-portfolio

# 의존성 설치 (처음인 경우)
npm install

# 개발 서버 시작
npm run dev
```

브라우저에서 `http://localhost:5173` (또는 5174) 접속

---

## 2. Supabase SQL 실행 (필수)

Supabase 대시보드 → SQL Editor에서 아래 순서로 실행:

### Step 1: V2 스키마 생성
파일: `supabase/migration_v2_unified_portfolio.sql`
- assets, debts, asset_history, net_worth_snapshots 테이블 생성
- staking_overview, airdrop_overview 뷰 생성
- RLS 정책 적용

### Step 2: 기본 자산/부채 데이터
파일: `supabase/insert_initial_data.sql`
- 저축 계정 (하나은행, 신한은행)
- 연금 (DC, 연금저축)
- 주식 (ISA, 해외주식, 금)
- 부채 (어머니, 이모, 은행 대출)

### Step 3: 크립토 데이터
파일: `supabase/insert_crypto_data.sql`
- 스테이킹 2건 (Mitosis D-24, Overtake D-64)
- 야핑/에어드랍 70+건
- 런치패드 8건
- NFT 4건
- 선물 손실 기록

---

## 3. 주요 변경사항 요약

### UI 변경
| Before | After |
|--------|-------|
| 6탭 구조 | 3탭 구조 (홈, 자산관리, 거래) |
| 라이트 테마 | 프리미엄 다크 테마 |
| 기본 리스트 | 글래스모피즘 카드 |

### 새 기능
- 순자산 히어로 (자산 - 부채)
- 자산 구성 파이 차트
- 스테이킹 D-day 알림 (D-7 이하 시 경고)
- 에어드랍 클레임 알림
- 크립토 세부 현황 (거래소/지갑/스테이킹/NFT/에어드랍/ICO/DeFi)

### 새 파일
```
src/components/AssetManagementTab.js  # 자산관리 탭 (신규)
src/styles/v2-home.css                # 홈 다크테마
src/styles/v2-assets.css              # 자산관리 스타일
supabase/migration_v2_unified_portfolio.sql
supabase/insert_initial_data.sql
supabase/insert_crypto_data.sql
```

---

## 4. 크립토 데이터 요약

### 야핑 수익
- **총 수익**: 45,498,595원
- **청산액**: 35,754,226원
- **운영 기간**: 247일
- **일당**: 184,205원

### 손익
- **선물 손실**: -77,179 USDT (-114,151,681원)
- **야핑 실 손익 (원금 제외)**: -29,010.78 USDT (-34,911,336원)

### 스테이킹 현황
| 프로젝트 | 수량 | 언락일 |
|---------|------|--------|
| Mitosis | 5,301 tMITO | 2026-02-22 (D-24) |
| Overtake | 24,000 TAKE | 2026-04-03 (D-64) |

---

## 5. 남은 작업

### 필수
- [x] GitHub 푸시 완료
- [ ] Supabase SQL 실행 (위 Step 1~3)

### 선택
- [ ] 순자산 추이 그래프
- [ ] 실시간 가격 API 연동
- [ ] Vercel 배포

---

## 6. 문제 해결

### 에러: "column 'purchase_price' does not exist"
→ 이미 수정됨. `purchase_value` 컬럼 사용

### 데이터가 안 보여요
→ Supabase SQL 실행 확인. RLS 정책 때문에 로그인 필요

### 차트가 안 나와요
→ Chart.js가 index.html에 포함되어 있는지 확인
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

---

## 7. 파일 구조

```
web3-budget-app/
├── index.html              # 3탭 구조
├── src/
│   ├── main.js
│   ├── App.js              # 탭 라우팅
│   ├── components/
│   │   ├── HomeTab.js      # V2 대시보드 ⭐
│   │   ├── AssetManagementTab.js  # V2 자산관리 ⭐ (신규)
│   │   └── TransactionsTab.js
│   ├── services/
│   │   └── database.js     # V2 CRUD ⭐
│   └── styles/
│       ├── main.css        # 다크 테마 ⭐
│       ├── v2-home.css     # 홈 스타일 ⭐ (신규)
│       └── v2-assets.css   # 자산관리 스타일 ⭐ (신규)
└── supabase/
    ├── migration_v2_unified_portfolio.sql ⭐ (신규)
    ├── insert_initial_data.sql ⭐ (신규)
    └── insert_crypto_data.sql ⭐ (신규)
```

---

## 8. Git 브랜치

- **현재 브랜치**: `v2-unified-portfolio`
- **원격**: https://github.com/clusteruni-debug/web3-budget-app

```bash
# 브랜치 확인
git branch -a

# main으로 머지하려면
git checkout main
git merge v2-unified-portfolio
git push origin main
```

---

질문 있으면 Claude Code에서 이어서 물어보세요!
