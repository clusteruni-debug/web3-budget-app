-- ============================================
-- 원화 입출금 추적 (투자 손익 계산용)
-- 은행 ↔ 투자처(거래소/증권사) 입출금만 기록
-- ============================================

CREATE TABLE IF NOT EXISTS fiat_flows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdraw')),
    amount BIGINT NOT NULL,                       -- 금액 (원화)
    date DATE NOT NULL DEFAULT CURRENT_DATE,      -- 입출금 날짜
    platform VARCHAR(100),                        -- 거래소/증권사명 (업비트, OKX, 한투 등)
    platform_type VARCHAR(20) CHECK (platform_type IN ('crypto', 'stock', 'other')),
    notes TEXT,                                   -- 메모
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_fiat_flows_user_id ON fiat_flows(user_id);
CREATE INDEX IF NOT EXISTS idx_fiat_flows_date ON fiat_flows(date);
CREATE INDEX IF NOT EXISTS idx_fiat_flows_type ON fiat_flows(type);
CREATE INDEX IF NOT EXISTS idx_fiat_flows_platform_type ON fiat_flows(platform_type);

-- RLS 설정
ALTER TABLE fiat_flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fiat_flows"
    ON fiat_flows FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fiat_flows"
    ON fiat_flows FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fiat_flows"
    ON fiat_flows FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fiat_flows"
    ON fiat_flows FOR DELETE
    USING (auth.uid() = user_id);

-- updated_at 트리거 (update_updated_at_column 함수가 이미 존재한다고 가정)
CREATE TRIGGER update_fiat_flows_updated_at
    BEFORE UPDATE ON fiat_flows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 사용 예시
-- ============================================
-- 입금 (은행 → 업비트):
-- INSERT INTO fiat_flows (user_id, type, amount, date, platform, platform_type, notes)
-- VALUES (auth.uid(), 'deposit', 1000000, '2024-01-15', '업비트', 'crypto', '비트코인 구매용');
--
-- 출금 (OKX → 은행):
-- INSERT INTO fiat_flows (user_id, type, amount, date, platform, platform_type, notes)
-- VALUES (auth.uid(), 'withdraw', 500000, '2024-02-01', 'OKX', 'crypto', '생활비 출금');
--
-- 손익 계산:
-- 진짜 손익 = 총 출금 - 총 입금 + 현재 잔고
-- (양수면 수익, 음수면 손실)
