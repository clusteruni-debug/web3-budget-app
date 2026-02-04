-- ============================================
-- 커스텀 카테고리 테이블 (수입/지출 분류 관리)
-- 사용자별 커스텀 카테고리를 저장하여 기기 간 동기화
-- ============================================

CREATE TABLE IF NOT EXISTS custom_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(20) NOT NULL,        -- 'income' | 'expense'
    name VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, type, name)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_custom_categories_user ON custom_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_categories_type ON custom_categories(user_id, type);

-- RLS 활성화
ALTER TABLE custom_categories ENABLE ROW LEVEL SECURITY;

-- RLS 정책 4개 (SELECT/INSERT/UPDATE/DELETE)
CREATE POLICY "Users can view own categories"
    ON custom_categories FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
    ON custom_categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
    ON custom_categories FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
    ON custom_categories FOR DELETE
    USING (auth.uid() = user_id);
