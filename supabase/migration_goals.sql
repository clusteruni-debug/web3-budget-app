-- ============================================
-- 목표 관리 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,              -- 목표명
    category VARCHAR(50),                     -- 카테고리 (저축, 투자, 부채상환, 구매 등)
    target_amount BIGINT NOT NULL DEFAULT 0, -- 목표 금액
    current_amount BIGINT NOT NULL DEFAULT 0, -- 현재 달성 금액
    start_date DATE DEFAULT CURRENT_DATE,    -- 시작일
    target_date DATE,                         -- 목표 달성 예정일
    is_completed BOOLEAN DEFAULT false,       -- 완료 여부
    is_active BOOLEAN DEFAULT true,           -- 활성 상태
    color VARCHAR(20) DEFAULT '#667eea',      -- 표시 색상
    icon VARCHAR(10) DEFAULT '🎯',            -- 아이콘
    notes TEXT,                               -- 메모
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_is_active ON goals(is_active);

-- RLS 설정
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals"
    ON goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
    ON goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
    ON goals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
    ON goals FOR DELETE
    USING (auth.uid() = user_id);

-- updated_at 트리거
CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
