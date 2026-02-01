-- ============================================================
-- 에어드랍 데이터 입력 스크립트
-- User ID: a57b679f-c4b8-402c-b14c-26ce86b365e3
-- 실행: Supabase SQL Editor에서 실행
-- ============================================================

-- 기존 에어드랍 데이터 삭제 (중복 방지)
DELETE FROM public.assets
WHERE user_id = 'a57b679f-c4b8-402c-b14c-26ce86b365e3'
AND sub_type = 'airdrop';

-- ============================================================
-- 에어드랍 데이터 (2025년 7월 ~ 2026년 1월)
-- purchase_value = 청산/판매 당시 원화 가치
-- ============================================================

INSERT INTO public.assets (
    user_id, category, sub_type, name, platform,
    token_name, token_symbol, quantity, current_value, purchase_value,
    airdrop_status, airdrop_expected_date, notes
) VALUES
-- 2025년 7월
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', '스케이트', '야핑', 'SKATE', 'SKATE', 216, 0, 28000, 'claimed', '2025-07-09', '청산 - 19.58 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', '뉴턴', '야핑', 'NEWT', 'NEWT', 1927, 0, 1802719, 'claimed', '2025-07-24', '청산 - 1260.64 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', '스케이트 2차', '야핑', 'SKATE', 'SKATE', 678, 0, 18984, 'claimed', '2025-07-01', '청산 - 13.09 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'MEMEX', '야핑', 'USDT', 'USDT', 800, 0, 1120000, 'claimed', '2025-07-31', '청산 - 800 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'ZYGO', '야핑', 'USDC', 'USDC', 100, 0, 140000, 'claimed', '2025-07-01', '청산 - 100 USDC'),

-- 2025년 8월
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Sidekick 1차', '야핑', 'K', 'K', 8156, 0, 2283680, 'claimed', '2025-08-11', '청산 - 1631.20 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Sidekick 2차', '야핑', 'K', 'K', 2091, 0, 585480, 'claimed', '2025-08-11', '청산 - 418.20 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Sidekick 3차', '야핑', 'K', 'K', 3000, 0, 840000, 'claimed', '2025-08-11', '청산 - 600 USDT'),

-- 2025년 9월
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Portal 1차', '야핑', 'PTB', 'PTB', 7817, 0, 273601, 'claimed', '2025-09-26', '12달/3회 베스팅, 186.12 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', '바이오메이', '야핑', 'ABURABI', 'ABURABI', 361, 0, 303240, 'claimed', '2025-09-26', '청산 - 206.29 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', '미라', '야핑', 'MIRA', 'MIRA', 779, 0, 3504253, 'claimed', '2025-09-25', '청산 - 2383.85 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', '하나 1차', '야핑', 'HANA', 'HANA', 301, 0, 29715, 'claimed', '2025-09-26', '12달/12회 베스팅, 20.21 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Overtake 2차', '야핑', 'TAKE', 'TAKE', 10000, 0, 2800000, 'claimed', '2025-09-25', '청산 - 1904.76 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Overtake 1차', '야핑', 'TAKE', 'TAKE', 3333, 0, 933240, 'claimed', '2025-09-25', '청산 - 634.86 USDT'),

-- 2025년 10월
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'TAC', '야핑', 'KAITO', 'KAITO', 50, 0, 105000, 'claimed', '2025-10-01', '청산 - 71.43 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Infinit', '야핑', 'IN', 'IN', 2420, 0, 478203, 'claimed', '2025-10-01', '청산 - 325.31 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'River 1차', '야핑', 'RIVER', 'RIVER', 24, 0, 92235, 'claimed', '2025-10-01', '청산 - 62.32 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Sonic 1차', '야핑', 'SONIC', 'S', 2515, 0, 615000, 'claimed', '2025-10-10', '청산 - 410 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'SURF 1차', '야핑', 'CYBER', 'CYBER', 100, 0, 163118, 'claimed', '2025-10-14', '청산 - 108.75 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Recall', '야핑', 'RECALL', 'RECALL', 665, 0, 689670, 'claimed', '2025-10-16', '청산 - 459.78 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Portal 2차', '야핑', 'PTB', 'PTB', 25012, 0, 1312500, 'claimed', '2025-10-17', '청산 - 875 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Overtake 3차', '야핑', 'TAKE', 'TAKE', 10000, 0, 4185818, 'claimed', '2025-10-25', '청산 - 2790.55 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Overtake 2차 추가', '야핑', 'TAKE', 'TAKE', 3333, 0, 1395133, 'claimed', '2025-10-25', '청산 - 930.09 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Overtake 1차 추가', '야핑', 'TAKE', 'TAKE', 3333, 0, 1395133, 'claimed', '2025-10-25', '청산 - 930.09 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', '하나 2차', '야핑', 'HANA', 'HANA', 301, 0, 22238, 'claimed', '2025-09-28', '청산 - 14.95 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Vultisig', 'WL', 'VSTG', 'VSTG', 7724, 0, 2740541, 'claimed', '2025-10-27', '청산 - 1843 USDT'),

-- 2025년 11월
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'MMT 런치패드', '런치패드', 'MMT', 'MMT', 453, 0, 263000, 'claimed', '2025-11-04', '투자금 118, 청산 - 176.87 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Sonic 야핑', '야핑', 'SONIC', 'S', 947, 0, 222735, 'claimed', '2025-11-07', '청산 - 148.59 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'MMT NFT', 'NFT', 'MMT', 'MMT', 210, 0, 103950, 'claimed', '2025-11-09', '청산 - 69.30 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Allora', '야핑', 'ALLO', 'ALLO', 1250, 0, 1281400, 'claimed', '2025-11-12', '청산 - 860 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'SURF 2차', '야핑', 'CYBER', 'CYBER', 200, 0, 290800, 'claimed', '2025-11-10', '청산 - 193.87 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'AIXBET', '야핑', 'KAITO', 'KAITO', 56, 0, 64492, 'claimed', '2025-11-15', '청산 - 42.71 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Imbue', '야핑', 'USDC', 'USDC', 51, 0, 77478, 'claimed', '2025-11-16', '청산 - 51.31 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'GOAT NETWORK', '야핑', 'GOAT', 'GOAT', 244, 0, 36600, 'claimed', '2025-11-17', '청산 - 24.60 USDT'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Beldex 1차', '야핑', 'USDC', 'USDC', 500, 0, 377500, 'claimed', '2025-11-22', '청산 - 250$ 인출'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'MONAD', '야핑', 'MON', 'MON', 41389, 0, 1677483, 'claimed', '2025-11-24', '청산 - 1117.58 USDT, 200 USDT 남김'),
('a57b679f-c4b8-402c-b14c-26ce86b365e3', 'crypto', 'airdrop', 'Overtake 지영', '야핑', 'TAKE', 'TAKE', 3333, 0, 1419858, 'claimed', '2025-11-25', '판매 - 지영이 전액 전달'),
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
-- 완료!
-- ============================================================
-- 총 에어드랍: 67건
-- 총 수익 (purchase_value 합계): 약 4,680만원
--
-- Supabase SQL Editor에서 실행하세요!
-- ============================================================
