-- Web3 Budget App Database Schema
-- Supabase PostgreSQL

-- ============================================
-- 1. Users 테이블은 Supabase Auth가 자동 관리
-- ============================================

-- ============================================
-- 2. Accounts (계정) 테이블
-- ============================================
CREATE TABLE accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('web3', 'investment', 'bank', 'family')),
    balance BIGINT DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'KRW',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accounts 인덱스
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_type ON accounts(type);

-- ============================================
-- 3. Transactions (거래) 테이블
-- ============================================
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    category VARCHAR(50),
    amount BIGINT NOT NULL,
    title VARCHAR(200),
    description TEXT,
    date DATE NOT NULL,
    
    -- 계정 관련
    account_from UUID REFERENCES accounts(id) ON DELETE SET NULL,
    account_to UUID REFERENCES accounts(id) ON DELETE SET NULL,
    
    -- 동적 필드 (토큰 수령 등)
    token_name VARCHAR(100),
    token_quantity DECIMAL(20, 8),
    token_price DECIMAL(20, 8),
    reward_type VARCHAR(50),
    
    -- 메타데이터
    tags TEXT[],
    is_recurring BOOLEAN DEFAULT false,
    recurring_id UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions 인덱스
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_account_from ON transactions(account_from);
CREATE INDEX idx_transactions_account_to ON transactions(account_to);

-- ============================================
-- 4. Recurring Items (고정 항목) 테이블
-- ============================================
CREATE TABLE recurring_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    category VARCHAR(50),
    amount BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,

    -- 반복 설정
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    day_of_month INTEGER DEFAULT 1 CHECK (day_of_month >= 1 AND day_of_month <= 31),
    start_date DATE NOT NULL,
    next_date DATE NOT NULL,
    end_date DATE,

    -- 계정
    account_from UUID REFERENCES accounts(id) ON DELETE SET NULL,
    account_to UUID REFERENCES accounts(id) ON DELETE SET NULL,

    -- 상태
    is_active BOOLEAN DEFAULT true,
    auto_generate BOOLEAN DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recurring Items 인덱스
CREATE INDEX idx_recurring_items_user_id ON recurring_items(user_id);
CREATE INDEX idx_recurring_items_next_date ON recurring_items(next_date);
CREATE INDEX idx_recurring_items_is_active ON recurring_items(is_active);
CREATE INDEX idx_recurring_items_day_of_month ON recurring_items(day_of_month);

-- ============================================
-- 5. RPG Data (RPG 게임 데이터) 테이블
-- ============================================
CREATE TABLE rpg_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- 선물 중독 보스
    futures_current_streak INTEGER DEFAULT 0,
    futures_max_streak INTEGER DEFAULT 0,
    futures_last_check_date DATE DEFAULT CURRENT_DATE,
    
    -- 대출 보스
    bank_loan_total BIGINT DEFAULT 410000000,
    bank_loan_paid BIGINT DEFAULT 0,
    bank_loan_monthly BIGINT DEFAULT 2100000,
    parent_loan_total BIGINT DEFAULT 150000000,
    parent_loan_paid BIGINT DEFAULT 0,
    parent_loan_monthly BIGINT DEFAULT 800000,
    
    -- Daily Quest
    daily_quest_date DATE DEFAULT CURRENT_DATE,
    daily_quest_no_futures BOOLEAN DEFAULT true,
    daily_quest_vibe_coding BOOLEAN DEFAULT false,
    daily_quest_x_posting BOOLEAN DEFAULT false,
    daily_quest_mental_check BOOLEAN DEFAULT false,
    
    -- Stats (미래 기능)
    level INTEGER DEFAULT 1,
    exp BIGINT DEFAULT 0,
    family_power INTEGER DEFAULT 0,
    mental_defense INTEGER DEFAULT 0,
    tech_power INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RPG Data 인덱스
CREATE INDEX idx_rpg_data_user_id ON rpg_data(user_id);

-- ============================================
-- 6. Row Level Security (RLS) 설정
-- ============================================

-- Accounts RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own accounts"
    ON accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts"
    ON accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
    ON accounts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
    ON accounts FOR DELETE
    USING (auth.uid() = user_id);

-- Transactions RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
    ON transactions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
    ON transactions FOR DELETE
    USING (auth.uid() = user_id);

-- Recurring Items RLS
ALTER TABLE recurring_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recurring items"
    ON recurring_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring items"
    ON recurring_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring items"
    ON recurring_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring items"
    ON recurring_items FOR DELETE
    USING (auth.uid() = user_id);

-- RPG Data RLS
ALTER TABLE rpg_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rpg data"
    ON rpg_data FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rpg data"
    ON rpg_data FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rpg data"
    ON rpg_data FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- 7. Functions & Triggers
-- ============================================

-- Updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Accounts updated_at 트리거
CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Transactions updated_at 트리거
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Recurring Items updated_at 트리거
CREATE TRIGGER update_recurring_items_updated_at
    BEFORE UPDATE ON recurring_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RPG Data updated_at 트리거
CREATE TRIGGER update_rpg_data_updated_at
    BEFORE UPDATE ON rpg_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. 초기 계정 생성 함수
-- ============================================
CREATE OR REPLACE FUNCTION create_default_accounts()
RETURNS TRIGGER AS $$
BEGIN
    -- 사용자 회원가입 시 기본 계정 4개 자동 생성
    INSERT INTO accounts (user_id, name, type, balance) VALUES
        (NEW.id, 'Web3 지갑', 'web3', 0),
        (NEW.id, '투자 계정', 'investment', 0),
        (NEW.id, '은행 계정', 'bank', 0),
        (NEW.id, '가족 대출', 'family', 0);

    -- RPG 데이터 초기화
    INSERT INTO rpg_data (user_id) VALUES (NEW.id);

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- 에러 발생 시 로그만 남기고 사용자 생성은 계속 진행
    RAISE WARNING 'create_default_accounts failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 사용자 생성 시 자동으로 기본 계정 생성
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_accounts();

-- ============================================
-- 9. 뷰 (Views) - 편리한 조회용
-- ============================================

-- 월별 통계 뷰
CREATE OR REPLACE VIEW monthly_stats AS
SELECT 
    user_id,
    DATE_TRUNC('month', date) as month,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_income,
    COUNT(*) as transaction_count
FROM transactions
GROUP BY user_id, DATE_TRUNC('month', date)
ORDER BY month DESC;

-- 카테고리별 통계 뷰
CREATE OR REPLACE VIEW category_stats AS
SELECT 
    user_id,
    type,
    category,
    COUNT(*) as count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount
FROM transactions
WHERE category IS NOT NULL
GROUP BY user_id, type, category
ORDER BY total_amount DESC;

-- ============================================
-- 10. 완료!
-- ============================================
-- 이 스키마를 Supabase SQL Editor에서 실행하세요.
