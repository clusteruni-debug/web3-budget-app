-- 초기 데이터 입력 스크립트 (수정됨)
-- User ID: 78341ee9-eda9-4f12-babf-7b9ec0c62f16
-- 생성일: 2025-01-29

-- =====================================================
-- 자산 데이터 (Assets)
-- =====================================================

-- [본인] 저축
INSERT INTO public.assets (user_id, category, sub_type, name, platform, current_value, purchase_value, notes)
VALUES
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'cash', 'bank', '저축예금', '하나은행', 200000, 200000, '월급 수령용'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'cash', 'bank', '저축예금', '신한은행', 154042, 154042, '카드값용');

-- [본인] 연금
INSERT INTO public.assets (user_id, category, sub_type, name, platform, current_value, purchase_value, notes)
VALUES
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'stock', 'pension', '확정기여형(DC)', '하나은행', 13471270, 13471270, '퇴직금'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'stock', 'pension', '연금저축_ETF', '신한투자증권', 17725150, 16899315, '절세용'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'stock', 'pension', '연금저축_현금', '신한투자증권', 25628, 25628, '절세용');

-- [본인] 주식/투자
INSERT INTO public.assets (user_id, category, sub_type, name, platform, current_value, purchase_value, notes)
VALUES
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'stock', 'domestic', 'ISA_ETF', '신한투자증권', 24909478, 23127612, '절세계좌'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'stock', 'overseas', '해외주식', '신한투자증권', 38561710, 13719580, '해외투자'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'stock', 'domestic', '위탁상품', '대신투자증권', 178610, 7745935, '대손실 계좌'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'stock', 'domestic', '일반계좌_RP', '신한투자증권', 135681, 135681, 'RP'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'stock', 'domestic', 'ISA_현금', '신한투자증권', 6488, 6488, '절세계좌 현금'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'stock', 'commodity', '금', '신한투자증권', 4142800, 3031810, '금 투자');

-- [본인] 코인 (청산으로 0원, 기록용)
INSERT INTO public.assets (user_id, category, sub_type, name, platform, current_value, purchase_value, notes)
VALUES
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'exchange', '거래소 잔고', '업비트', 0, 30000000, '청산 손실'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'exchange', '거래소 잔고', '빗썸', 0, 10000000, '청산 손실'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'exchange', '거래소 잔고', 'OKX', 0, 21185627, '7만불 청산 - 주요 손실');

-- [지영] 자산
INSERT INTO public.assets (user_id, category, sub_type, name, platform, current_value, purchase_value, notes)
VALUES
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'cash', 'bank', 'CMA (지영)', 'CMA', 26317059, 26317059, '지영 목돈'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'cash', 'cash', '현금_부수입 (지영)', '현금', 3795592, 3795592, '지영 부수입'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'cash', 'cash', '현금_대출이자 (지영)', '현금', 6850000, 6850000, '지영 대출이자용');

-- [세현] 자산
INSERT INTO public.assets (user_id, category, sub_type, name, platform, current_value, purchase_value, notes)
VALUES
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'cash', 'bank', 'CMA (세현)', 'CMA', 1000000, 1000000, '세현 목돈'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'cash', 'cash', '현금 (세현)', '현금', 3350000, 3350000, '세현 현금');

-- =====================================================
-- 부채 데이터 (Debts)
-- =====================================================

INSERT INTO public.debts (user_id, name, creditor, debt_type, total_amount, remaining_amount, paid_amount, interest_rate, monthly_payment, description)
VALUES
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', '어머니 대출', '어머니', 'family_loan', 100000000, 100000000, 0, 6.0, 500000, '월 이자 50만원'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', '이모 대출', '이모', 'family_loan', 50000000, 50000000, 0, 7.2, 300000, '월 이자 30만원'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', '은행 대출', '은행', 'bank_loan', 410000000, 410000000, 0, 5.1, 2084167, '주택담보대출 추정');

-- =====================================================
-- 순자산 스냅샷 (초기값)
-- =====================================================

INSERT INTO public.net_worth_snapshots (user_id, total_assets, total_crypto, total_stock, total_cash, total_debts, net_worth, recorded_at)
VALUES
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 140644898, 0, 99310925, 41333973, 560000000, -419355102, CURRENT_DATE);

-- =====================================================
-- 완료!
-- 총 자산: 140,644,898원
--   - 현금: 41,333,973원 (저축 + 지영 + 세현)
--   - 주식/연금: 99,310,925원
--   - 코인: 0원 (청산)
-- 총 부채: 560,000,000원
-- 순자산: -419,355,102원
-- =====================================================
