-- ============================================
-- Asset Disposals (자산 정리 이력) 테이블
-- 자산 정리(매도/현금화/전환/손실) 이력 추적
-- ============================================

-- 테이블 생성
CREATE TABLE IF NOT EXISTS asset_disposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- 정리된 자산 정보 (snapshot)
    asset_id UUID,                       -- 원본 자산 ID (참조용, 자산 삭제 후에도 유지)
    asset_name VARCHAR(200) NOT NULL,
    asset_category VARCHAR(50),
    asset_platform VARCHAR(100),

    -- 정리 정보
    disposal_type VARCHAR(20) NOT NULL
        CHECK (disposal_type IN ('cash_out', 'convert', 'loss', 'other')),
    amount BIGINT NOT NULL,              -- 정리 금액

    -- 목적지 (현금화/전환 시)
    destination VARCHAR(200),            -- 은행명/거래소명/자산명
    destination_type VARCHAR(20),        -- 'bank' | 'exchange' | 'asset'

    -- 메타
    notes TEXT,
    disposal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_asset_disposals_user_id ON asset_disposals(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_disposals_disposal_date ON asset_disposals(disposal_date DESC);
CREATE INDEX IF NOT EXISTS idx_asset_disposals_type ON asset_disposals(disposal_type);

-- RLS 활성화
ALTER TABLE asset_disposals ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 데이터만 접근 가능
CREATE POLICY "Users can view own disposals"
    ON asset_disposals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own disposals"
    ON asset_disposals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own disposals"
    ON asset_disposals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own disposals"
    ON asset_disposals FOR DELETE
    USING (auth.uid() = user_id);

-- 코멘트
COMMENT ON TABLE asset_disposals IS '자산 정리(매도/현금화/전환/손실) 이력';
COMMENT ON COLUMN asset_disposals.disposal_type IS 'cash_out: 현금화, convert: 자산전환, loss: 손실처리, other: 기타';
COMMENT ON COLUMN asset_disposals.destination_type IS 'bank: 은행, exchange: 거래소 원화, asset: 다른 자산';
