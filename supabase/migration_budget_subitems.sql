-- ============================================
-- 예산 세부항목 기능 추가
-- ============================================

-- budgets 테이블에 sub_items 컬럼 추가
ALTER TABLE budgets
ADD COLUMN IF NOT EXISTS sub_items JSONB DEFAULT '[]'::jsonb;

-- sub_items 구조 예시:
-- [
--   {"name": "식비", "amount": 150000},
--   {"name": "교통비", "amount": 100000},
--   {"name": "유틸리티", "amount": 50000}
-- ]

-- 인덱스 추가 (JSONB 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_budgets_sub_items ON budgets USING GIN (sub_items);

COMMENT ON COLUMN budgets.sub_items IS '예산 카테고리 내 세부항목 목록 (JSONB 배열)';
