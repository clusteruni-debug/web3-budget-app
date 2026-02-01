-- ============================================
-- 구독 서비스 관리 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,           -- 서비스명 (Netflix, YouTube Premium 등)
    category VARCHAR(50),                  -- 카테고리 (영상, 음악, 소프트웨어 등)
    amount BIGINT NOT NULL DEFAULT 0,      -- 월 구독료
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly, weekly
    billing_day INTEGER,                   -- 결제일 (1-31)
    next_billing_date DATE,               -- 다음 결제 예정일
    start_date DATE,                      -- 구독 시작일
    is_active BOOLEAN DEFAULT true,       -- 활성 상태
    auto_renew BOOLEAN DEFAULT true,      -- 자동 갱신 여부
    notes TEXT,                           -- 메모
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_active ON subscriptions(is_active);

-- RLS 설정
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
    ON subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
    ON subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
    ON subscriptions FOR DELETE
    USING (auth.uid() = user_id);

-- updated_at 트리거
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
