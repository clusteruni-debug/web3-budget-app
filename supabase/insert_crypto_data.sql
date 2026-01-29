-- ============================================================
-- 크립토 실제 데이터 입력 스크립트
-- User ID: 78341ee9-eda9-4f12-babf-7b9ec0c62f16
-- 생성일: 2026-01-29
-- 야핑 총계: 45,498,595원 | 청산: 35,754,226원
-- 선물 총손실: -77,179 USDT | 야핑 실수익: -29,010.78 USDT
-- ============================================================

-- 기존 크립토 데이터 삭제 (선택적)
-- DELETE FROM assets WHERE user_id = '78341ee9-eda9-4f12-babf-7b9ec0c62f16' AND category = 'crypto';

-- ============================================================
-- 1. 스테이킹 (현재 진행 중)
-- ============================================================

INSERT INTO public.assets (
    user_id, category, sub_type, name, platform,
    token_name, token_symbol, quantity, current_value, purchase_value,
    staking_status, staking_start_date, staking_unlock_date,
    notes
) VALUES
-- Mitosis tMITO 스테이킹 (D-24)
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'staking',
 'Mitosis Staking', 'Mitosis',
 'tMITO', 'tMITO', 5301, 512289, 0,
 'unlocking', '2025-08-22', '2026-02-22',
 '6달 베스팅, 수령 349.45 USDT'),

-- Overtake TAKE 스테이킹 (D-64)
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'staking',
 'Overtake Staking', 'Overtake',
 'TAKE', 'TAKE', 24000, 1656000, 0,
 'unlocking', '2025-08-25', '2026-04-03',
 '3달/3회 베스팅, 수령 1129.60 USDT');

-- ============================================================
-- 2. 야핑/에어드랍 완료 (청산)
-- ============================================================

INSERT INTO public.assets (
    user_id, category, sub_type, name, platform,
    token_name, token_symbol, quantity, current_value, purchase_value,
    airdrop_status, airdrop_expected_date,
    notes
) VALUES
-- 2025년 7월
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', '스케이트', '야핑', 'SKATE', 'SKATE', 216, 0, 28000, 'claimed', '2025-07-09', '청산 완료 - 19.58 USDT, 환율 1430'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', '뉴턴', '야핑', 'NEWT', 'NEWT', 1927, 0, 1802719, 'claimed', '2025-07-24', '청산 완료 - 1260.64 USDT, 환율 1430'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', '스케이트 2차', '야핑', 'SKATE', 'SKATE', 678, 0, 18984, 'claimed', '2025-07-01', '청산 완료 - 13.09 USDT, 환율 1450'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'MEMEX', '야핑', 'USDT', 'USDT', 800, 0, 1120000, 'claimed', '2025-07-31', '청산 완료 - 800 USDT, 환율 1400'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'ZYGO', '야핑', 'USDC', 'USDC', 100, 0, 140000, 'claimed', '2025-07-01', '청산 완료 - 100 USDC, 환율 1400'),

-- 2025년 8월
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Sidekick 1차', '야핑', 'K', 'K', 8156, 0, 2283680, 'claimed', '2025-08-11', '청산 완료 - 1631.20 USDT, 환율 1400'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Sidekick 2차', '야핑', 'K', 'K', 2091, 0, 585480, 'claimed', '2025-08-11', '청산 완료 - 418.20 USDT, 환율 1400'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Sidekick 3차', '야핑', 'K', 'K', 3000, 0, 840000, 'claimed', '2025-08-11', '청산 완료 - 600 USDT, 환율 1400'),

-- 2025년 9월
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Portal 1차', '야핑', 'PTB', 'PTB', 7817, 0, 273601, 'claimed', '2025-09-26', '12달/3회 베스팅, 186.12 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', '바이오메이', '야핑', 'ABURABI', 'ABURABI', 361, 0, 303240, 'claimed', '2025-09-26', '청산 완료 - 206.29 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', '미라', '야핑', 'MIRA', 'MIRA', 779, 0, 3504253, 'claimed', '2025-09-25', '청산 완료 - 2383.85 USDT, 환율 1470'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', '하나 1차', '야핑', 'HANA', 'HANA', 301, 0, 29715, 'claimed', '2025-09-26', '12달/12회 베스팅, 20.21 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Overtake 2차', '야핑', 'TAKE', 'TAKE', 10000, 0, 2800000, 'claimed', '2025-09-25', '청산 완료 - 1904.76 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Overtake 1차', '야핑', 'TAKE', 'TAKE', 3333, 0, 933240, 'claimed', '2025-09-25', '청산 완료 - 634.86 USDT'),

-- 2025년 10월
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'TAC', '야핑', 'KAITO', 'KAITO', 50, 0, 105000, 'claimed', '2025-10-01', '2025.11.14 청산 - 71.43 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Infinit', '야핑', 'IN', 'IN', 2420, 0, 478203, 'claimed', '2025-10-01', '2025.11.14 청산 - 325.31 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'River 1차', '야핑', 'RIVER', 'RIVER', 24, 0, 92235, 'claimed', '2025-10-01', '2025.11.14 청산 - 62.32 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Sonic 1차', '야핑', 'SONIC', 'S', 2515, 0, 615000, 'claimed', '2025-10-10', '2025.11.14 청산 - 410 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'SURF 1차', '야핑', 'CYBER', 'CYBER', 100, 0, 163118, 'claimed', '2025-10-14', '2025.11.14 청산 - 108.75 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Recall', '야핑', 'RECALL', 'RECALL', 665, 0, 689670, 'claimed', '2025-10-16', '청산 완료 - 459.78 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Portal 2차', '야핑', 'PTB', 'PTB', 25012, 0, 1312500, 'claimed', '2025-10-17', '청산 완료 - 875 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Overtake 3차', '야핑', 'TAKE', 'TAKE', 10000, 0, 4185818, 'claimed', '2025-10-25', '2025.11.14 청산 - 2790.55 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Overtake 2차 추가', '야핑', 'TAKE', 'TAKE', 3333, 0, 1395133, 'claimed', '2025-10-25', '2025.11.14 청산 - 930.09 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Overtake 1차 추가', '야핑', 'TAKE', 'TAKE', 3333, 0, 1395133, 'claimed', '2025-10-25', '2025.11.14 청산 - 930.09 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', '하나 2차', '야핑', 'HANA', 'HANA', 301, 0, 22238, 'claimed', '2025-09-28', '2025.11.14 청산 - 14.95 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Vultisig', 'WL', 'VSTG', 'VSTG', 7724, 0, 2740541, 'claimed', '2025-10-27', '청산 완료 - 1843 USDT'),

-- 2025년 11월
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'MMT 런치패드', '런치패드', 'MMT', 'MMT', 453, 0, 263000, 'claimed', '2025-11-04', '투자금 118, 청산 완료 - 176.87 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Sonic 야핑', '야핑', 'SONIC', 'S', 947, 0, 222735, 'claimed', '2025-11-07', '청산 완료 - 148.59 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'MMT NFT', 'NFT', 'MMT', 'MMT', 210, 0, 103950, 'claimed', '2025-11-09', '청산 완료 - 69.30 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Allora', '야핑', 'ALLO', 'ALLO', 1250, 0, 1281400, 'claimed', '2025-11-12', '청산 완료 - 860 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'SURF 2차', '야핑', 'CYBER', 'CYBER', 200, 0, 290800, 'claimed', '2025-11-10', '2025.11.17 청산 - 193.87 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'AIXBET', '야핑', 'KAITO', 'KAITO', 56, 0, 64492, 'claimed', '2025-11-15', '2025.11.17 청산 - 42.71 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Imbue', '야핑', 'USDC', 'USDC', 51, 0, 77478, 'claimed', '2025-11-16', '2025.11.17 청산 - 51.31 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'GOAT NETWORK', '야핑', 'GOAT', 'GOAT', 244, 0, 0, 'claimed', '2025-11-17', '2025.11.18 청산 - 24.60 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Beldex 1차', '야핑', 'USDC', 'USDC', 500, 0, 377500, 'claimed', '2025-11-22', '2025.11.22 청산 - 250$ 인출'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'MONAD', '야핑', 'MON', 'MON', 41389, 0, 1677483, 'claimed', '2025-11-24', '청산 완료 - 1117.58 USDT, 200 USDT 남김'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Overtake 지영', '야핑', 'TAKE', 'TAKE', 3333, 0, 1419858, 'claimed', '2025-11-25', '판매 완료 - 지영이 전액 전달'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Overtake 청산', '야핑', 'TAKE', 'TAKE', 3333, 0, 1419858, 'claimed', '2025-11-25', '2025.11.25 청산 - 945.94 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Irys', '야핑', 'IRYS', 'IRYS', 20060, 0, 329953, 'claimed', '2025-11-25', '2025.11.27 청산 - 221 USDT'),

-- 2025년 12월
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Predict', '야핑', 'USDC', 'USDC', 50, 0, 74700, 'claimed', '2025-12-01', '2025.12.1 청산 - 50 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Anichess 1차', '야핑', 'ANICHESS', 'ANI', 5000, 0, 64989, 'claimed', '2025-12-02', '2025.12.8 청산 - 43.50 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Portal 3차', '야핑', 'PTB', 'PTB', 7817, 0, 30567, 'claimed', '2025-12-04', '2025.12.8 청산 - 20.46 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'PlayAI', '야핑', 'PLAI', 'PLAI', 4892, 0, 15426, 'claimed', '2025-12-05', '2025.12.8 청산 - 10.33 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'GAIB', '스토리텔러', 'GAIB', 'GAIB', 150, 0, 7888, 'claimed', '2025-12-06', '2025.12.15 청산 - 5.28 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Beldex 2차', '야핑', 'USDC', 'USDC', 250, 0, 371750, 'claimed', '2025-12-10', '2025.12.14 청산 - 250 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Cysic 1차', '야핑', 'CYS', 'CYS', 290, 0, 97726, 'claimed', '2025-12-11', '2025.12.14 청산 - 65.50 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Talus 1차', '야핑', 'US', 'US', 16435, 0, 483990, 'claimed', '2025-12-11', '2025.12.14 청산 - 324.39 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'SURF 3차', '야핑', 'CYBER', 'CYBER', 100, 0, 121584, 'claimed', '2025-12-12', '2025.12.14 청산 - 81.71 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'RAVE', '텔레그램', 'RAVE', 'RAVE', 250, 0, 93193, 'claimed', '2025-12-12', '2025.12.14 청산 - 62.63 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'KAITO 야핑', '야핑', 'KAITO', 'KAITO', 50, 0, 43954, 'claimed', '2025-12-13', '2025.12.15 청산 - 29.46 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'TheroiqAI 1차', '야핑', 'THQ', 'THQ', 2958, 0, 382308, 'claimed', '2025-12-17', '2025.12.17 청산 - 257.10 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Cysic 2차', '야핑', 'CYS', 'CYS', 490, 0, 200744, 'claimed', '2025-12-19', '판매 출금 - 135.09 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Infinit 2차', '야핑', 'IN', 'IN', 1517, 0, 163900, 'claimed', '2025-12-19', '판매 출금 - 110 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Multibank', '야핑', 'USDC', 'USDC', 400, 0, 586400, 'claimed', '2025-12-24', '판매 출금 - 400 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Cysic 3차', '야핑', 'CYS', 'CYS', 1276, 0, 439375, 'claimed', '2025-12-24', '판매 출금 - 299.71 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Injective 행사', '행사', 'USDT', 'USDT', 50, 0, 73300, 'claimed', '2025-12-25', '판매 출금 - 50 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'TheroiqAI 2차', '야핑', 'THQ', 'THQ', 1756, 0, 135444, 'claimed', '2025-12-25', '판매 출금 - 92.39 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Overtake 출금', '야핑', 'TAKE', 'TAKE', 3333, 0, 1499718, 'claimed', '2025-12-25', '판매 출금 - 1023 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'HANA 3차', '야핑', 'HANA', 'HANA', 300, 0, 5702, 'claimed', '2025-12-28', '판매 - 3.93 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'River 2차', '야핑', 'RIVERPTS', 'RIVER', 29308, 0, 51598, 'claimed', '2025-12-29', '판매 - 35.56 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'edgeX', '야핑', 'MARU', 'MARU', 1388, 0, 72600, 'claimed', '2025-12-31', '2025.12.31 청산 - 50 USDT'),

-- 2026년 1월
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Anichess 2차', '야핑', 'CHECK', 'CHECK', 1500, 0, 123843, 'claimed', '2026-01-02', '판매 - 85.35 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Brevis', '야핑', 'BREV', 'BREV', 3500, 0, 2960148, 'claimed', '2026-01-06', '판매 - 2040.07 USDT, 150만원 출금'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Talus 2차', '야핑', 'US', 'US', 10640, 0, 93851, 'claimed', '2026-01-07', '판매 - 64.68 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Fogo', '야핑', 'FOGO', 'FOGO', 9999, 0, 772206, 'claimed', '2026-01-16', '판매 - 525.31 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Portal 4차', '야핑', 'PTB', 'PTB', 25012, 0, 63857, 'claimed', '2026-01-18', '12달/3회 베스팅 2차, 43.47 USDT'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'airdrop', 'Sentient', '야핑', 'SENT', 'SENT', 29640, 0, 1081826, 'claimed', '2026-01-22', '판매 - 730.47 USDT');

-- ============================================================
-- 3. 런치패드 투자
-- ============================================================

INSERT INTO public.assets (
    user_id, category, sub_type, name, platform,
    token_name, token_symbol, quantity, current_value, purchase_value,
    ico_project_name, ico_invest_date,
    notes
) VALUES
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'ico', 'Limitless', 'Launch Pad', 'LIMIT', 'LIMIT', 302, 340330, 2960000, 'Limitless', '2025-01-01', '투자 2000 USDC, 환불 1928, 할당 72, 배정 302, 정산 230, 손익 +230'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'ico', 'Novastro', 'Launch Pad', 'NOVA', 'NOVA', 9040, 72206, 740000, 'Novastro', '2025-01-01', '투자 500 USDC, 환불 452, 할당 48, 손익 -403.184'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'ico', 'Anichess', 'Launch Pad', 'ANI', 'ANI', 2857, 71884, 1480000, 'Anichess', '2025-01-01', '투자 1000 USDC, 환불 100, 할당 900, 손익 -51.431'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'ico', 'zkPass', 'Launch Pad', 'ZKPASS', 'ZKPASS', 3265, 581419, 4385544, 'zkPass', '2025-01-01', '투자 2964 USDC, 환불 603, 할당 2361, 정산 393, 손익 -210'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'ico', 'Momentum', 'Launch Pad', 'MOM', 'MOM', 453, 389027, 4440000, 'Momentum', '2025-01-01', '투자 3000 USD1, 환불 118, 할당 2882, 정산 263, 손익 +145'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'ico', 'Scroll 예치', '예치작', 'SCR', 'SCR', 0, 0, 740000, 'Scroll', '2025-01-01', '투자 500 USDC'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'ico', 'MegaETH', 'Launch Pad', 'MEGA', 'MEGA', 0, 0, 4435522, 'MegaETH', '2025-01-01', '투자 2999 USDC, 환불 0, 할당 2999, 아직 미배정'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'ico', 'AIRA', 'Launch Pad', 'AIRA', 'AIRA', 2181, 272866, 1478521, 'AIRA', '2025-01-01', '투자 999 USD1, 환불 137, 할당 862, 정산 184.41, 손익 +47.41');

-- ============================================================
-- 4. NFT 보유
-- ============================================================

INSERT INTO public.assets (
    user_id, category, sub_type, name, platform,
    quantity, current_value, purchase_value,
    nft_collection,
    notes
) VALUES
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'nft', 'Mythics NFT', 'OpenSea', 1, 1045353, 2331608, 'Mythics', 'ETH 기반, 구매가 0.3320 ETH ($1,576), 현재가 0.2250 ETH ($707), -55.16%'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'nft', 'Supermkas NFT', 'OpenSea', 1, 0, 74000, 'Supermkas', 'POL 기반, 구매가 $50, 현재 -100%'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'nft', 'Snoozie NFT', 'OpenSea', 1, 0, 221850, 'Snoozie', 'ETH 기반, 구매가 0.0025 ETH ($150), 현재 -100%'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'nft', 'Billions Genesis', 'OpenSea', 1, 0, 148000, 'Billions Genesis', 'ETH 기반, 구매가 $100, 현재 -100%');

-- ============================================================
-- 5. 선물거래 손익 (통합)
-- ============================================================

INSERT INTO public.assets (
    user_id, category, sub_type, name, platform,
    current_value, purchase_value,
    notes
) VALUES
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'defi', '선물거래 총 손실', 'OKX Futures', 0, 114151681, '2025년 6월~12월 선물거래 누적 손실: -77,179 USDT (환율 1479 기준)');

-- ============================================================
-- 6. 야핑 수익 요약 자산
-- ============================================================

INSERT INTO public.assets (
    user_id, category, sub_type, name, platform,
    current_value, purchase_value,
    notes
) VALUES
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'other', '야핑 총 수익', '야핑/에어드랍', 45498595, 0, '총 야핑 수익 45,498,595원, 청산 35,754,226원, 247일 운영, 일당 184,205원'),
('78341ee9-eda9-4f12-babf-7b9ec0c62f16', 'crypto', 'other', '야핑 실 손익', '계산', 0, 34911336, '야핑 실제 수익 (원금 제외): -29,010.78 USDT = -34,911,336원');

-- ============================================================
-- 완료!
-- ============================================================
--
-- 데이터 요약:
-- - 스테이킹: 2건 (Mitosis D-24, Overtake D-64)
-- - 야핑/에어드랍: 70+건 (2025.07 ~ 2026.01)
-- - 런치패드/ICO: 8건
-- - NFT: 4건
-- - 선물 손실: -77,179 USDT
-- - 야핑 총 수익: 45,498,595원
-- - 야핑 실 손익: -34,911,336원 (원금 제외)
--
-- 실행 방법: Supabase SQL Editor에서 실행
-- ============================================================
