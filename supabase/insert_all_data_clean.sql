-- ============================================================
-- 통합 데이터 입력 스크립트 (Clean Version)
-- User ID: a57b679f-c4b8-402c-b14c-26ce86b365e3
-- 생성일: 2026-01-31
-- ============================================================

-- ============================================================
-- 0. 기존 데이터 삭제 (중복 방지)
-- ============================================================
DELETE FROM public.assets WHERE user_id = 'a57b679f-c4b8-402c-b14c-26ce86b365e3';
DELETE FROM public.debts WHERE user_id = 'a57b679f-c4b8-402c-b14c-26ce86b365e3';

-- ============================================================
-- 1. 자산 데이터 (Assets) - 현금/예금
-- ============================================================

INSERT INTO public.assets (user_id, category, sub_type, name, platform, current_value, purchase_value, notes) VALUES
-- [본인] 저축
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'cash', 'bank', '저축예금', '하나은행', 200000, 200000, '월급 수령용'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'cash', 'bank', '저축예금', '신한은행', 154042, 154042, '카드값용'),
-- [지영] 자산
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'cash', 'bank', 'CMA (지영)', 'CMA', 26317059, 26317059, '지영 목돈'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'cash', 'cash', '현금_부수입 (지영)', '현금', 3795592, 3795592, '지영 부수입'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'cash', 'cash', '현금_대출이자 (지영)', '현금', 6850000, 6850000, '지영 대출이자용'),
-- [세현] 자산
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'cash', 'bank', 'CMA (세현)', 'CMA', 1000000, 1000000, '세현 목돈'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'cash', 'cash', '현금 (세현)', '현금', 3350000, 3350000, '세현 현금');

-- ============================================================
-- 2. 자산 데이터 (Assets) - 연금/주식
-- ============================================================

INSERT INTO public.assets (user_id, category, sub_type, name, platform, current_value, purchase_value, notes) VALUES
-- 연금
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'stock', 'pension', '확정기여형(DC)', '하나은행', 13471270, 13471270, '퇴직금'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'stock', 'pension', '연금저축_ETF', '신한투자증권', 17725150, 16899315, '절세용'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'stock', 'pension', '연금저축_현금', '신한투자증권', 25628, 25628, '절세용'),
-- 주식/투자
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'stock', 'domestic', 'ISA_ETF', '신한투자증권', 24909478, 23127612, '절세계좌'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'stock', 'overseas', '해외주식', '신한투자증권', 38561710, 13719580, '해외투자'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'stock', 'domestic', '위탁상품', '대신투자증권', 178610, 7745935, '대손실 계좌'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'stock', 'domestic', '일반계좌_RP', '신한투자증권', 135681, 135681, 'RP'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'stock', 'domestic', 'ISA_현금', '신한투자증권', 6488, 6488, '절세계좌 현금'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'stock', 'commodity', '금', '신한투자증권', 4142800, 3031810, '금 투자');

-- ============================================================
-- 3. 크립토 - 스테이킹
-- ============================================================

INSERT INTO public.assets (
    user_id, category, sub_type, name, platform,
    token_name, token_symbol, quantity, current_value, purchase_value,
    staking_status, staking_start_date, staking_unlock_date, notes
) VALUES
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'staking', 'Mitosis Staking', 'Mitosis', 'tMITO', 'tMITO', 5301, 512289, 0, 'unlocking', '2025-08-22', '2026-02-22', '6달 베스팅, 수령 349.45 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'staking', 'Overtake Staking', 'Overtake', 'TAKE', 'TAKE', 24000, 1656000, 0, 'unlocking', '2025-08-25', '2026-04-03', '3달/3회 베스팅, 수령 1129.60 USDT');

-- ============================================================
-- 4. 크립토 - 런치패드/ICO (실제 보유 중인 것만)
-- ============================================================

INSERT INTO public.assets (
    user_id, category, sub_type, name, platform,
    token_name, token_symbol, quantity, current_value, purchase_value,
    ico_project_name, ico_invest_date, notes
) VALUES
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'ico', 'Limitless', 'Launch Pad', 'LIMIT', 'LIMIT', 302, 340330, 2960000, 'Limitless', '2025-01-01', '투자 2000 USDC'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'ico', 'Novastro', 'Launch Pad', 'NOVA', 'NOVA', 9040, 72206, 740000, 'Novastro', '2025-01-01', '투자 500 USDC'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'ico', 'Anichess', 'Launch Pad', 'ANI', 'ANI', 2857, 71884, 1480000, 'Anichess', '2025-01-01', '투자 1000 USDC'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'ico', 'zkPass', 'Launch Pad', 'ZKPASS', 'ZKPASS', 3265, 581419, 4385544, 'zkPass', '2025-01-01', '투자 2964 USDC'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'ico', 'Momentum', 'Launch Pad', 'MOM', 'MOM', 453, 389027, 4440000, 'Momentum', '2025-01-01', '투자 3000 USD1'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'ico', 'MegaETH', 'Launch Pad', 'MEGA', 'MEGA', 0, 0, 4435522, 'MegaETH', '2025-01-01', '투자 2999 USDC, 미배정'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'ico', 'AIRA', 'Launch Pad', 'AIRA', 'AIRA', 2181, 272866, 1478521, 'AIRA', '2025-01-01', '투자 999 USD1');

-- ============================================================
-- 5. 크립토 - NFT
-- ============================================================

INSERT INTO public.assets (
    user_id, category, sub_type, name, platform,
    quantity, current_value, purchase_value, nft_collection, notes
) VALUES
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'nft', 'Mythics NFT', 'OpenSea', 1, 1045353, 2331608, 'Mythics', 'ETH 기반, 구매가 $1,576, 현재가 $707'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'nft', 'Supermkas NFT', 'OpenSea', 1, 0, 74000, 'Supermkas', 'POL 기반, 구매가 $50'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'nft', 'Snoozie NFT', 'OpenSea', 1, 0, 221850, 'Snoozie', 'ETH 기반, 구매가 $150'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'nft', 'Billions Genesis', 'OpenSea', 1, 0, 148000, 'Billions Genesis', 'ETH 기반, 구매가 $100');

-- ============================================================
-- 6. 크립토 - 에어드랍 기록 (청산 완료)
-- ============================================================

INSERT INTO public.assets (
    user_id, category, sub_type, name, platform,
    token_name, token_symbol, quantity, current_value, purchase_value,
    airdrop_status, airdrop_expected_date, notes
) VALUES
-- 2025년 7월
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', '스케이트', '야핑', 'SKATE', 'SKATE', 216, 0, 28000, 'claimed', '2025-07-09', '청산 완료 - 19.58 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', '뉴턴', '야핑', 'NEWT', 'NEWT', 1927, 0, 1802719, 'claimed', '2025-07-24', '청산 완료 - 1260.64 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', '스케이트 2차', '야핑', 'SKATE', 'SKATE', 678, 0, 18984, 'claimed', '2025-07-01', '청산 완료 - 13.09 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'MEMEX', '야핑', 'USDT', 'USDT', 800, 0, 1120000, 'claimed', '2025-07-31', '청산 완료 - 800 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'ZYGO', '야핑', 'USDC', 'USDC', 100, 0, 140000, 'claimed', '2025-07-01', '청산 완료 - 100 USDC'),

-- 2025년 8월
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Sidekick 1차', '야핑', 'K', 'K', 8156, 0, 2283680, 'claimed', '2025-08-11', '청산 완료 - 1631.20 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Sidekick 2차', '야핑', 'K', 'K', 2091, 0, 585480, 'claimed', '2025-08-11', '청산 완료 - 418.20 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Sidekick 3차', '야핑', 'K', 'K', 3000, 0, 840000, 'claimed', '2025-08-11', '청산 완료 - 600 USDT'),

-- 2025년 9월
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Portal 1차', '야핑', 'PTB', 'PTB', 7817, 0, 273601, 'claimed', '2025-09-26', '12달/3회 베스팅, 186.12 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', '바이오메이', '야핑', 'ABURABI', 'ABURABI', 361, 0, 303240, 'claimed', '2025-09-26', '청산 완료 - 206.29 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', '미라', '야핑', 'MIRA', 'MIRA', 779, 0, 3504253, 'claimed', '2025-09-25', '청산 완료 - 2383.85 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', '하나 1차', '야핑', 'HANA', 'HANA', 301, 0, 29715, 'claimed', '2025-09-26', '12달/12회 베스팅, 20.21 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Overtake 2차', '야핑', 'TAKE', 'TAKE', 10000, 0, 2800000, 'claimed', '2025-09-25', '청산 완료 - 1904.76 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Overtake 1차', '야핑', 'TAKE', 'TAKE', 3333, 0, 933240, 'claimed', '2025-09-25', '청산 완료 - 634.86 USDT'),

-- 2025년 10월
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'TAC', '야핑', 'KAITO', 'KAITO', 50, 0, 105000, 'claimed', '2025-10-01', '청산 - 71.43 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Infinit', '야핑', 'IN', 'IN', 2420, 0, 478203, 'claimed', '2025-10-01', '청산 - 325.31 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'River 1차', '야핑', 'RIVER', 'RIVER', 24, 0, 92235, 'claimed', '2025-10-01', '청산 - 62.32 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Sonic 1차', '야핑', 'SONIC', 'S', 2515, 0, 615000, 'claimed', '2025-10-10', '청산 - 410 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'SURF 1차', '야핑', 'CYBER', 'CYBER', 100, 0, 163118, 'claimed', '2025-10-14', '청산 - 108.75 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Recall', '야핑', 'RECALL', 'RECALL', 665, 0, 689670, 'claimed', '2025-10-16', '청산 완료 - 459.78 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Portal 2차', '야핑', 'PTB', 'PTB', 25012, 0, 1312500, 'claimed', '2025-10-17', '청산 완료 - 875 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Overtake 3차', '야핑', 'TAKE', 'TAKE', 10000, 0, 4185818, 'claimed', '2025-10-25', '청산 - 2790.55 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Overtake 2차 추가', '야핑', 'TAKE', 'TAKE', 3333, 0, 1395133, 'claimed', '2025-10-25', '청산 - 930.09 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Overtake 1차 추가', '야핑', 'TAKE', 'TAKE', 3333, 0, 1395133, 'claimed', '2025-10-25', '청산 - 930.09 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', '하나 2차', '야핑', 'HANA', 'HANA', 301, 0, 22238, 'claimed', '2025-09-28', '청산 - 14.95 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Vultisig', 'WL', 'VSTG', 'VSTG', 7724, 0, 2740541, 'claimed', '2025-10-27', '청산 완료 - 1843 USDT'),

-- 2025년 11월
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'MMT 런치패드', '런치패드', 'MMT', 'MMT', 453, 0, 263000, 'claimed', '2025-11-04', '투자금 118, 청산 - 176.87 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Sonic 야핑', '야핑', 'SONIC', 'S', 947, 0, 222735, 'claimed', '2025-11-07', '청산 완료 - 148.59 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'MMT NFT', 'NFT', 'MMT', 'MMT', 210, 0, 103950, 'claimed', '2025-11-09', '청산 완료 - 69.30 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Allora', '야핑', 'ALLO', 'ALLO', 1250, 0, 1281400, 'claimed', '2025-11-12', '청산 완료 - 860 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'SURF 2차', '야핑', 'CYBER', 'CYBER', 200, 0, 290800, 'claimed', '2025-11-10', '청산 - 193.87 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'AIXBET', '야핑', 'KAITO', 'KAITO', 56, 0, 64492, 'claimed', '2025-11-15', '청산 - 42.71 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Imbue', '야핑', 'USDC', 'USDC', 51, 0, 77478, 'claimed', '2025-11-16', '청산 - 51.31 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'GOAT NETWORK', '야핑', 'GOAT', 'GOAT', 244, 0, 0, 'claimed', '2025-11-17', '청산 - 24.60 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Beldex 1차', '야핑', 'USDC', 'USDC', 500, 0, 377500, 'claimed', '2025-11-22', '청산 - 250$ 인출'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'MONAD', '야핑', 'MON', 'MON', 41389, 0, 1677483, 'claimed', '2025-11-24', '청산 - 1117.58 USDT, 200 USDT 남김'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Overtake 지영', '야핑', 'TAKE', 'TAKE', 3333, 0, 1419858, 'claimed', '2025-11-25', '판매 완료 - 지영이 전액 전달'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Overtake 청산', '야핑', 'TAKE', 'TAKE', 3333, 0, 1419858, 'claimed', '2025-11-25', '청산 - 945.94 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Irys', '야핑', 'IRYS', 'IRYS', 20060, 0, 329953, 'claimed', '2025-11-25', '청산 - 221 USDT'),

-- 2025년 12월
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Predict', '야핑', 'USDC', 'USDC', 50, 0, 74700, 'claimed', '2025-12-01', '청산 - 50 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Anichess 1차', '야핑', 'ANICHESS', 'ANI', 5000, 0, 64989, 'claimed', '2025-12-02', '청산 - 43.50 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Portal 3차', '야핑', 'PTB', 'PTB', 7817, 0, 30567, 'claimed', '2025-12-04', '청산 - 20.46 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'PlayAI', '야핑', 'PLAI', 'PLAI', 4892, 0, 15426, 'claimed', '2025-12-05', '청산 - 10.33 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'GAIB', '스토리텔러', 'GAIB', 'GAIB', 150, 0, 7888, 'claimed', '2025-12-06', '청산 - 5.28 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Beldex 2차', '야핑', 'USDC', 'USDC', 250, 0, 371750, 'claimed', '2025-12-10', '청산 - 250 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Cysic 1차', '야핑', 'CYS', 'CYS', 290, 0, 97726, 'claimed', '2025-12-11', '청산 - 65.50 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Talus 1차', '야핑', 'US', 'US', 16435, 0, 483990, 'claimed', '2025-12-11', '청산 - 324.39 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'SURF 3차', '야핑', 'CYBER', 'CYBER', 100, 0, 121584, 'claimed', '2025-12-12', '청산 - 81.71 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'RAVE', '텔레그램', 'RAVE', 'RAVE', 250, 0, 93193, 'claimed', '2025-12-12', '청산 - 62.63 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'KAITO 야핑', '야핑', 'KAITO', 'KAITO', 50, 0, 43954, 'claimed', '2025-12-13', '청산 - 29.46 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'TheroiqAI 1차', '야핑', 'THQ', 'THQ', 2958, 0, 382308, 'claimed', '2025-12-17', '청산 - 257.10 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Cysic 2차', '야핑', 'CYS', 'CYS', 490, 0, 200744, 'claimed', '2025-12-19', '판매 출금 - 135.09 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Infinit 2차', '야핑', 'IN', 'IN', 1517, 0, 163900, 'claimed', '2025-12-19', '판매 출금 - 110 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Multibank', '야핑', 'USDC', 'USDC', 400, 0, 586400, 'claimed', '2025-12-24', '판매 출금 - 400 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Cysic 3차', '야핑', 'CYS', 'CYS', 1276, 0, 439375, 'claimed', '2025-12-24', '판매 출금 - 299.71 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Injective 행사', '행사', 'USDT', 'USDT', 50, 0, 73300, 'claimed', '2025-12-25', '판매 출금 - 50 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'TheroiqAI 2차', '야핑', 'THQ', 'THQ', 1756, 0, 135444, 'claimed', '2025-12-25', '판매 출금 - 92.39 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Overtake 출금', '야핑', 'TAKE', 'TAKE', 3333, 0, 1499718, 'claimed', '2025-12-25', '판매 출금 - 1023 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'HANA 3차', '야핑', 'HANA', 'HANA', 300, 0, 5702, 'claimed', '2025-12-28', '판매 - 3.93 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'River 2차', '야핑', 'RIVERPTS', 'RIVER', 29308, 0, 51598, 'claimed', '2025-12-29', '판매 - 35.56 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'edgeX', '야핑', 'MARU', 'MARU', 1388, 0, 72600, 'claimed', '2025-12-31', '청산 - 50 USDT'),

-- 2026년 1월
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Anichess 2차', '야핑', 'CHECK', 'CHECK', 1500, 0, 123843, 'claimed', '2026-01-02', '판매 - 85.35 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Brevis', '야핑', 'BREV', 'BREV', 3500, 0, 2960148, 'claimed', '2026-01-06', '판매 - 2040.07 USDT, 150만원 출금'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Talus 2차', '야핑', 'US', 'US', 10640, 0, 93851, 'claimed', '2026-01-07', '판매 - 64.68 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Fogo', '야핑', 'FOGO', 'FOGO', 9999, 0, 772206, 'claimed', '2026-01-16', '판매 - 525.31 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Portal 4차', '야핑', 'PTB', 'PTB', 25012, 0, 63857, 'claimed', '2026-01-18', '12달/3회 베스팅 2차, 43.47 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Sentient', '야핑', 'SENT', 'SENT', 29640, 0, 1081826, 'claimed', '2026-01-22', '판매 - 730.47 USDT');

-- ============================================================
-- 7. 부채 데이터 (Debts) - 본인
-- ============================================================

INSERT INTO public.debts (user_id, name, creditor, debt_type, total_amount, remaining_amount, paid_amount, interest_rate, monthly_payment, description) VALUES
('a57b679f-c4b8-402c-b14c-26ce86b365e3', '어머니 대출', '어머니', 'family_loan', 100000000, 100000000, 0, 6.0, 500000, '[본인] 월 이자 50만원'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', '이모 대출', '이모', 'family_loan', 50000000, 50000000, 0, 7.2, 300000, '[본인] 월 이자 30만원'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', '은행 대출', '은행', 'bank_loan', 410000000, 410000000, 0, 5.1, 2084167, '[본인] 주택담보대출');

-- ============================================================
-- 8. 부채 데이터 (Debts) - 어머니
-- ============================================================

INSERT INTO public.debts (user_id, name, creditor, debt_type, total_amount, remaining_amount, paid_amount, interest_rate, monthly_payment, start_date, description) VALUES
('a57b679f-c4b8-402c-b14c-26ce86b365e3', '어머니 은행대출 1차', '은행', 'bank_loan', 200000000, 200000000, 0, 6.0, 1000000, '2022-12-01', '[어머니] 22.12~ 현재, 월 이자 100만원'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', '어머니 은행대출 2차', '은행', 'bank_loan', 50000000, 50000000, 0, 6.0, 250000, '2024-12-01', '[어머니] 24.12~, 월 이자 25만원'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', '어머니 은행대출 3차', '은행', 'bank_loan', 130000000, 130000000, 0, 6.0, 650000, '2025-08-01', '[어머니] 25.8 예정~, 월 이자 65만원');

-- ============================================================
-- 완료!
-- ============================================================
--
-- 자산 요약:
--   현금/예금: 약 4,167만원
--   주식/연금: 약 9,916만원
--   크립토: 약 494만원 (스테이킹 + ICO + NFT)
--   에어드랍 기록: 67건 (2025.07 ~ 2026.01, 청산 완료)
--
-- 부채 요약:
--   [본인] 5.6억원 (어머니 1억 + 이모 0.5억 + 은행 4.1억)
--   [어머니] 3.8억원 (은행 2억 + 0.5억 + 1.3억)
--   월 이자 합계: 본인 288만원 + 어머니 190만원 = 478만원
--
-- 실행 방법: Supabase SQL Editor에서 실행
-- ============================================================
