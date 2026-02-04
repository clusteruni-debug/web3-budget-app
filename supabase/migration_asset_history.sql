-- 자산 히스토리 테이블 (자산 가치 변동 추적)
CREATE TABLE IF NOT EXISTS asset_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    value BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- 같은 자산/같은 날짜에 하나만 (upsert용)
    UNIQUE(asset_id, recorded_date)
);

-- 인덱스: 자산별 날짜 조회 최적화
CREATE INDEX IF NOT EXISTS idx_asset_history_asset_date
ON asset_history(asset_id, recorded_date DESC);

-- RLS 정책
ALTER TABLE asset_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for authenticated users" ON asset_history
    FOR ALL
    USING (true)
    WITH CHECK (true);
