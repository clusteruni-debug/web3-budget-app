-- Migration: recurring_items 테이블에 owner 컬럼 추가
-- 날짜: 2026-02-03
-- 목적: 고정 지출 소유자 지정 기능 (본인/어머니/공동 등)

-- 1. owner 컬럼 추가
ALTER TABLE recurring_items
ADD COLUMN IF NOT EXISTS owner VARCHAR(50) DEFAULT '본인';

-- 2. 기존 데이터의 description에서 소유자 추출
UPDATE recurring_items
SET owner = '어머니'
WHERE description ILIKE '%[어머니]%' OR description ILIKE '%어머니%';

UPDATE recurring_items
SET owner = '본인'
WHERE owner IS NULL OR owner = '';

-- 3. 인덱스 추가 (소유자별 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_recurring_items_owner ON recurring_items(owner);

-- 확인: 컬럼이 추가되었는지 확인
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'recurring_items' AND column_name = 'owner';
