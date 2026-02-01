-- ============================================
-- 예산 관리 테이블 추가
-- ============================================

-- 카테고리별 월 예산 테이블
CREATE TABLE IF NOT EXISTS budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category VARCHAR(50) NOT NULL,
    monthly_amount BIGINT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 같은 사용자가 같은 카테고리에 중복 예산 설정 방지
    UNIQUE(user_id, category)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);

-- RLS 설정
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budgets"
    ON budgets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets"
    ON budgets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
    ON budgets FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets"
    ON budgets FOR DELETE
    USING (auth.uid() = user_id);

-- updated_at 트리거
CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 예산 vs 실제 지출 비교 뷰
-- ============================================
CREATE OR REPLACE VIEW budget_vs_actual AS
SELECT
    b.user_id,
    b.category,
    b.monthly_amount as budget_amount,
    COALESCE(SUM(
        CASE
            WHEN t.type = 'expense'
            AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', CURRENT_DATE)
            THEN t.amount
            ELSE 0
        END
    ), 0) as spent_amount,
    b.monthly_amount - COALESCE(SUM(
        CASE
            WHEN t.type = 'expense'
            AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', CURRENT_DATE)
            THEN t.amount
            ELSE 0
        END
    ), 0) as remaining_amount
FROM budgets b
LEFT JOIN transactions t ON b.user_id = t.user_id AND b.category = t.category
WHERE b.is_active = true
GROUP BY b.user_id, b.category, b.monthly_amount;
