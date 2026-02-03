-- Migration: recurring_items 테이블에 day_of_month 컬럼 추가
-- 날짜: 2026-02-03
-- 이슈: "Could not find the 'day_of_month' column of 'recurring_items' in the schema cache"

-- 1. day_of_month 컬럼 추가 (매월 결제일/수입일)
ALTER TABLE recurring_items
ADD COLUMN IF NOT EXISTS day_of_month INTEGER DEFAULT 1 CHECK (day_of_month >= 1 AND day_of_month <= 31);

-- 2. 기존 데이터의 day_of_month 값 설정 (start_date 또는 next_date에서 추출)
UPDATE recurring_items
SET day_of_month = EXTRACT(DAY FROM next_date)::INTEGER
WHERE day_of_month IS NULL OR day_of_month = 1;

-- 3. 인덱스 추가 (결제일별 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_recurring_items_day_of_month ON recurring_items(day_of_month);

-- 확인: 컬럼이 추가되었는지 확인
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'recurring_items' AND column_name = 'day_of_month';
