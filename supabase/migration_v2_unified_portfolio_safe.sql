-- ============================================
-- V2 Migration: 통합 자산 관리 스키마 (Safe Version)
-- 기존 정책/트리거 삭제 후 재생성
-- ============================================

-- ============================================
-- 0. 기존 정책 삭제 (에러 방지)
-- ============================================

-- Assets 정책 삭제
DROP POLICY IF EXISTS "Users can view their own assets" ON assets;
DROP POLICY IF EXISTS "Users can insert their own assets" ON assets;
DROP POLICY IF EXISTS "Users can update their own assets" ON assets;
DROP POLICY IF EXISTS "Users can delete their own assets" ON assets;

-- Debts 정책 삭제
DROP POLICY IF EXISTS "Users can view their own debts" ON debts;
DROP POLICY IF EXISTS "Users can insert their own debts" ON debts;
DROP POLICY IF EXISTS "Users can update their own debts" ON debts;
DROP POLICY IF EXISTS "Users can delete their own debts" ON debts;

-- Asset History 정책 삭제
DROP POLICY IF EXISTS "Users can view their own asset history" ON asset_history;
DROP POLICY IF EXISTS "Users can insert their own asset history" ON asset_history;

-- Net Worth Snapshots 정책 삭제
DROP POLICY IF EXISTS "Users can view their own net worth" ON net_worth_snapshots;
DROP POLICY IF EXISTS "Users can insert their own net worth" ON net_worth_snapshots;
DROP POLICY IF EXISTS "Users can update their own net worth" ON net_worth_snapshots;

-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS update_assets_updated_at ON assets;
DROP TRIGGER IF EXISTS update_debts_updated_at ON debts;

-- ============================================
-- 1. Assets (통합 자산) 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- 기본 정보
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL, -- crypto, stock, cash, real_estate, other
    sub_type VARCHAR(50),          -- exchange, wallet, staking, nft, airdrop, ico, defi

    -- 금액 정보
    current_value BIGINT DEFAULT 0,       -- 현재 가치 (원)
    purchase_value BIGINT DEFAULT 0,      -- 매입 금액
    quantity DECIMAL(20, 8),              -- 수량 (토큰, 주식 수 등)

    -- 세부 정보
    platform VARCHAR(100),                -- 거래소/지갑/증권사 등
    token_name VARCHAR(50),               -- 토큰명 (BTC, ETH 등)
    token_symbol VARCHAR(20),             -- 심볼

    -- 스테이킹 전용
    staking_status VARCHAR(20),           -- active, unlocking, claimable, completed
    staking_start_date DATE,
    staking_unlock_date DATE,             -- 언락 예정일
    staking_apy DECIMAL(10, 2),           -- 연이율 %

    -- 에어드랍 전용
    airdrop_status VARCHAR(20),           -- pending, confirmed, claimable, claimed, missed
    airdrop_expected_date DATE,
    airdrop_expected_value BIGINT,        -- 예상 가치

    -- NFT 전용
    nft_collection VARCHAR(200),
    nft_token_id VARCHAR(100),
    nft_image_url TEXT,

    -- ICO/투자 전용
    ico_project_name VARCHAR(200),
    ico_invest_date DATE,
    ico_vesting_end_date DATE,            -- 베스팅 종료일
    ico_tge_date DATE,                    -- TGE 날짜

    -- 메타데이터
    description TEXT,
    notes TEXT,
    tags TEXT[],
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets 인덱스
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_sub_type ON assets(sub_type);
CREATE INDEX IF NOT EXISTS idx_assets_is_active ON assets(is_active);

-- ============================================
-- 2. Debts (부채) 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS debts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    name VARCHAR(200) NOT NULL,
    debt_type VARCHAR(50) NOT NULL,       -- bank_loan, family_loan, credit_card, other_debt

    total_amount BIGINT NOT NULL,         -- 총 부채액
    remaining_amount BIGINT NOT NULL,     -- 남은 금액
    paid_amount BIGINT DEFAULT 0,         -- 상환 금액

    interest_rate DECIMAL(10, 2),         -- 이자율 %
    monthly_payment BIGINT,               -- 월 상환액

    start_date DATE,
    end_date DATE,                        -- 상환 완료 예정일

    creditor VARCHAR(200),                -- 채권자 (은행명, 가족 등)
    description TEXT,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Debts 인덱스
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_debt_type ON debts(debt_type);

-- ============================================
-- 3. Asset History (가치 변동 이력)
-- ============================================
CREATE TABLE IF NOT EXISTS asset_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,

    recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
    value BIGINT NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asset History 인덱스
CREATE INDEX IF NOT EXISTS idx_asset_history_user_id ON asset_history(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_history_asset_id ON asset_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_history_recorded_at ON asset_history(recorded_at);

-- ============================================
-- 4. Net Worth Snapshots (순자산 스냅샷)
-- ============================================
CREATE TABLE IF NOT EXISTS net_worth_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,

    total_assets BIGINT DEFAULT 0,
    total_crypto BIGINT DEFAULT 0,
    total_stock BIGINT DEFAULT 0,
    total_cash BIGINT DEFAULT 0,
    total_real_estate BIGINT DEFAULT 0,
    total_other BIGINT DEFAULT 0,

    total_debts BIGINT DEFAULT 0,
    net_worth BIGINT DEFAULT 0,           -- total_assets - total_debts

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, recorded_at)
);

-- Net Worth 인덱스
CREATE INDEX IF NOT EXISTS idx_net_worth_user_id ON net_worth_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_net_worth_recorded_at ON net_worth_snapshots(recorded_at);

-- ============================================
-- 5. RLS (Row Level Security)
-- ============================================

-- Assets RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assets"
    ON assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own assets"
    ON assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own assets"
    ON assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own assets"
    ON assets FOR DELETE USING (auth.uid() = user_id);

-- Debts RLS
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own debts"
    ON debts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own debts"
    ON debts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own debts"
    ON debts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own debts"
    ON debts FOR DELETE USING (auth.uid() = user_id);

-- Asset History RLS
ALTER TABLE asset_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own asset history"
    ON asset_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own asset history"
    ON asset_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Net Worth Snapshots RLS
ALTER TABLE net_worth_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own net worth"
    ON net_worth_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own net worth"
    ON net_worth_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own net worth"
    ON net_worth_snapshots FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 6. updated_at 함수 (없으면 생성)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. Triggers
-- ============================================

-- Assets updated_at 트리거
CREATE TRIGGER update_assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Debts updated_at 트리거
CREATE TRIGGER update_debts_updated_at
    BEFORE UPDATE ON debts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. Views (통계용)
-- ============================================

-- 자산 요약 뷰
CREATE OR REPLACE VIEW asset_summary AS
SELECT
    user_id,
    category,
    COUNT(*) as count,
    SUM(current_value) as total_value,
    SUM(purchase_value) as total_cost,
    SUM(current_value) - SUM(purchase_value) as total_profit
FROM assets
WHERE is_active = true
GROUP BY user_id, category;

-- 크립토 세부 요약 뷰
CREATE OR REPLACE VIEW crypto_summary AS
SELECT
    user_id,
    sub_type,
    COUNT(*) as count,
    SUM(current_value) as total_value
FROM assets
WHERE category = 'crypto' AND is_active = true
GROUP BY user_id, sub_type;

-- 스테이킹 현황 뷰
CREATE OR REPLACE VIEW staking_overview AS
SELECT
    user_id,
    id,
    name,
    platform,
    token_name,
    current_value,
    staking_status,
    staking_unlock_date,
    staking_apy,
    CASE
        WHEN staking_unlock_date IS NOT NULL
        THEN staking_unlock_date - CURRENT_DATE
        ELSE NULL
    END as days_until_unlock
FROM assets
WHERE sub_type = 'staking' AND is_active = true
ORDER BY staking_unlock_date NULLS LAST;

-- 에어드랍 현황 뷰
CREATE OR REPLACE VIEW airdrop_overview AS
SELECT
    user_id,
    id,
    name,
    airdrop_status,
    airdrop_expected_date,
    airdrop_expected_value,
    CASE
        WHEN airdrop_expected_date IS NOT NULL
        THEN airdrop_expected_date - CURRENT_DATE
        ELSE NULL
    END as days_until_airdrop
FROM assets
WHERE sub_type = 'airdrop' AND is_active = true
ORDER BY airdrop_expected_date NULLS LAST;

-- ============================================
-- 완료!
-- ============================================
