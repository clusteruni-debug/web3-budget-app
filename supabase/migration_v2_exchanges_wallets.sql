-- ============================================
-- Migration: 거래소 & 지갑 계정 타입 추가
-- 실행 방법: Supabase SQL Editor에서 실행
-- ============================================

-- 1. 기존 accounts 테이블의 type 체크 제약 수정
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_type_check;

ALTER TABLE accounts ADD CONSTRAINT accounts_type_check
    CHECK (type IN ('web3', 'investment', 'bank', 'family', 'exchange', 'wallet'));

-- 2. 거래소/지갑 구분을 위한 sub_type 컬럼 추가
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS sub_type VARCHAR(50);

-- 3. 차익거래 추적을 위한 transactions 테이블 필드 추가
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_arbitrage BOOLEAN DEFAULT false;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS arbitrage_profit BIGINT DEFAULT 0;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS departure_amount BIGINT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS arrival_amount BIGINT;

-- 4. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_accounts_sub_type ON accounts(sub_type);
CREATE INDEX IF NOT EXISTS idx_transactions_is_arbitrage ON transactions(is_arbitrage);

-- 5. 차익거래 통계 뷰
CREATE OR REPLACE VIEW arbitrage_stats AS
SELECT
    user_id,
    DATE_TRUNC('month', date) as month,
    COUNT(*) as arbitrage_count,
    SUM(arbitrage_profit) as total_profit,
    SUM(CASE WHEN arbitrage_profit > 0 THEN 1 ELSE 0 END) as success_count,
    SUM(CASE WHEN arbitrage_profit < 0 THEN 1 ELSE 0 END) as loss_count
FROM transactions
WHERE is_arbitrage = true
GROUP BY user_id, DATE_TRUNC('month', date)
ORDER BY month DESC;

-- ============================================
-- 완료!
-- 이 SQL을 Supabase Dashboard > SQL Editor에서 실행하세요.
-- ============================================
