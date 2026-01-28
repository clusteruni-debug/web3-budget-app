# Supabase 설정 가이드

## 📋 준비 사항

1. Supabase 계정 생성: https://supabase.com
2. 새 프로젝트 생성
3. API 키 확인

---

## 🚀 Step-by-Step 설정

### 1. Supabase 프로젝트 생성

1. Supabase 대시보드 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `web3-budget-app`
   - Database Password: 안전한 비밀번호 설정
   - Region: `Northeast Asia (Seoul)`
4. "Create new project" 클릭
5. 프로젝트 생성 대기 (약 2분)

---

### 2. 데이터베이스 스키마 생성

1. 좌측 메뉴에서 **"SQL Editor"** 클릭
2. **"New Query"** 클릭
3. `/supabase/schema.sql` 파일의 내용 전체 복사
4. SQL Editor에 붙여넣기
5. **"Run"** 버튼 클릭 (또는 Ctrl+Enter)
6. 성공 메시지 확인

**생성되는 것들:**
- ✅ 4개 테이블: accounts, transactions, recurring_items, rpg_data
- ✅ RLS (Row Level Security) 정책
- ✅ 인덱스
- ✅ 트리거 (자동 업데이트)
- ✅ 함수 (기본 계정 생성)
- ✅ 뷰 (통계용)

---

### 3. API 키 복사

1. 좌측 메뉴에서 **"Settings"** 클릭
2. **"API"** 클릭
3. 다음 정보 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

### 4. 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**⚠️ 주의:** `.env` 파일은 Git에 커밋하지 마세요!

---

### 5. 테이블 구조 확인

SQL Editor에서 확인:

```sql
-- 모든 테이블 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- accounts 테이블 확인
SELECT * FROM accounts LIMIT 5;

-- transactions 테이블 확인
SELECT * FROM transactions LIMIT 5;
```

---

## 📊 데이터베이스 스키마 설명

### 1. Accounts (계정)
```
id              UUID        PK
user_id         UUID        FK → auth.users
name            VARCHAR     계정 이름
type            VARCHAR     web3/investment/bank/family
balance         BIGINT      잔액 (원 단위)
currency        VARCHAR     통화 (기본: KRW)
description     TEXT        설명
is_active       BOOLEAN     활성 여부
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

**특징:**
- 사용자가 회원가입하면 자동으로 4개 기본 계정 생성
- Web3 지갑, 투자 계정, 은행 계정, 가족 대출

---

### 2. Transactions (거래)
```
id              UUID        PK
user_id         UUID        FK → auth.users
type            VARCHAR     income/expense/transfer
category        VARCHAR     카테고리
amount          BIGINT      금액
title           VARCHAR     제목
description     TEXT        설명
date            DATE        거래일
account_from    UUID        FK → accounts (출금 계정)
account_to      UUID        FK → accounts (입금 계정)
token_name      VARCHAR     토큰명 (동적 필드)
token_quantity  DECIMAL     토큰 수량
token_price     DECIMAL     토큰 가격
reward_type     VARCHAR     보상 타입
tags            TEXT[]      태그 배열
is_recurring    BOOLEAN     반복 거래 여부
recurring_id    UUID        반복 항목 ID
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

**특징:**
- 동적 필드 지원 (토큰 수령, 보상 등)
- 계정 간 이체 지원
- 태그 시스템

---

### 3. Recurring Items (고정 항목)
```
id              UUID        PK
user_id         UUID        FK → auth.users
type            VARCHAR     income/expense
category        VARCHAR     카테고리
amount          BIGINT      금액
title           VARCHAR     제목
description     TEXT        설명
frequency       VARCHAR     daily/weekly/monthly
start_date      DATE        시작일
next_date       DATE        다음 예정일
end_date        DATE        종료일 (옵션)
account_from    UUID        FK → accounts
account_to      UUID        FK → accounts
is_active       BOOLEAN     활성 여부
auto_generate   BOOLEAN     자동 생성 여부
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

**특징:**
- 고정 수입/지출 관리
- 자동 거래 생성 지원 (향후)

---

### 4. RPG Data (RPG 게임 데이터)
```
id                          UUID        PK
user_id                     UUID        FK → auth.users (UNIQUE)
futures_current_streak      INTEGER     선물 중독 연속 일수
futures_max_streak          INTEGER     최장 기록
futures_last_check_date     DATE        마지막 체크 날짜
bank_loan_total             BIGINT      은행 대출 총액
bank_loan_paid              BIGINT      은행 대출 상환액
bank_loan_monthly           BIGINT      은행 대출 월 상환액
parent_loan_total           BIGINT      부모님 대출 총액
parent_loan_paid            BIGINT      부모님 대출 상환액
parent_loan_monthly         BIGINT      부모님 대출 월 상환액
daily_quest_date            DATE        Daily Quest 날짜
daily_quest_no_futures      BOOLEAN     선물 거래 안 함
daily_quest_vibe_coding     BOOLEAN     Vibe 코딩 완료
daily_quest_x_posting       BOOLEAN     X 포스팅 완료
daily_quest_mental_check    BOOLEAN     멘탈 체크 완료
level                       INTEGER     레벨
exp                         BIGINT      경험치
family_power                INTEGER     가족력
mental_defense              INTEGER     정신 방어
tech_power                  INTEGER     기술력
created_at                  TIMESTAMP
updated_at                  TIMESTAMP
```

**특징:**
- 사용자당 1개 레코드 (UNIQUE)
- 회원가입 시 자동 생성

---

## 🔐 Row Level Security (RLS)

모든 테이블에 RLS 적용:
- ✅ 사용자는 **자신의 데이터만** 조회/수정/삭제 가능
- ✅ `user_id`가 현재 로그인한 사용자와 일치해야 함
- ✅ Supabase Auth와 자동 연동

---

## 🎯 다음 단계

### Step 1: 인증 설정
```javascript
// src/services/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Step 2: 회원가입 테스트
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'your-secure-password'
})
```

### Step 3: 데이터 CRUD 테스트
```javascript
// 거래 추가
const { data, error } = await supabase
  .from('transactions')
  .insert({
    type: 'income',
    category: '에어드랍',
    amount: 100000,
    date: '2024-01-27'
  })
```

---

## 📚 참고 문서

- Supabase 공식 문서: https://supabase.com/docs
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security
- Realtime 구독: https://supabase.com/docs/guides/realtime

---

## ❓ 문제 해결

### 테이블이 생성되지 않음
- SQL Editor에서 에러 메시지 확인
- 각 섹션을 나누어서 실행 시도

### RLS 정책 오류
- 정책이 올바르게 생성되었는지 확인:
  ```sql
  SELECT * FROM pg_policies WHERE schemaname = 'public';
  ```

### 트리거가 작동하지 않음
- 트리거 목록 확인:
  ```sql
  SELECT * FROM information_schema.triggers;
  ```
