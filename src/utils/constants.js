// ============================================
// V2: 통합 자산 관리 상수
// ============================================

import { getCustomCategories, saveCustomCategories, resetCustomCategories } from '../services/database.js';

// 기본 카테고리 (변경 불가, 초기화 시 복원용)
const DEFAULT_INCOME_CATEGORIES = [
    '에어드랍', 'Kaito Yapping', '텔레그램 야핑', '포인트 판매',
    '프로젝트', 'X 스폰서', 'X 게임', '알바', '급여', '투자수익', '기타 수입'
];

const DEFAULT_EXPENSE_CATEGORIES = [
    '생활비', '식비', '교통비', '통신비', '쇼핑',
    '선물거래', '학습/도서', '건강', '여가', '투자', '기타 지출'
];

// 기존 export 배열 (참조 유지, 값은 뮤테이션 가능)
export const INCOME_CATEGORIES = [...DEFAULT_INCOME_CATEGORIES];
export const EXPENSE_CATEGORIES = [...DEFAULT_EXPENSE_CATEGORIES];

// DB에서 커스텀 카테고리 로드 → 배열 in-place 뮤테이션
export async function loadCustomCategories() {
    try {
        const { success, data } = await getCustomCategories();
        if (!success || !data || data.length === 0) return; // 커스텀 없으면 기본값 유지

        const income = data
            .filter(c => c.type === 'income')
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(c => c.name);

        const expense = data
            .filter(c => c.type === 'expense')
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(c => c.name);

        if (income.length > 0) {
            INCOME_CATEGORIES.length = 0;
            INCOME_CATEGORIES.push(...income);
        }
        if (expense.length > 0) {
            EXPENSE_CATEGORIES.length = 0;
            EXPENSE_CATEGORIES.push(...expense);
        }
    } catch (error) {
        console.warn('커스텀 카테고리 로드 실패 (기본값 유지):', error);
    }
}

// 현재 배열 → DB 저장
export async function saveCategories(type) {
    const names = type === 'income' ? [...INCOME_CATEGORIES] : [...EXPENSE_CATEGORIES];
    return await saveCustomCategories(type, names);
}

// 기본값 복원 (배열 뮤테이션 + DB에서 삭제)
export async function resetCategories(type) {
    const defaults = type === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
    const arr = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    arr.length = 0;
    arr.push(...defaults);
    return await resetCustomCategories(type);
}

// 기본값 getter (UI에서 비교용)
export function getDefaultCategories(type) {
    return type === 'income' ? [...DEFAULT_INCOME_CATEGORIES] : [...DEFAULT_EXPENSE_CATEGORIES];
}

// ============================================
// 자산 대분류 (Asset Categories)
// ============================================
export const ASSET_CATEGORIES = {
    CRYPTO: 'crypto',       // 크립토 자산
    STOCK: 'stock',         // 주식
    CASH: 'cash',           // 현금/예금
    REAL_ESTATE: 'real_estate', // 부동산
    OTHER: 'other'          // 기타 자산
};

export const ASSET_CATEGORY_INFO = [
    { id: 'crypto', name: '크립토', icon: '🪙', color: '#F7931A' },
    { id: 'stock', name: '주식', icon: '📈', color: '#4CAF50' },
    { id: 'cash', name: '현금/예금', icon: '💵', color: '#2196F3' },
    { id: 'real_estate', name: '부동산', icon: '🏠', color: '#9C27B0' },
    { id: 'other', name: '기타', icon: '📦', color: '#607D8B' }
];

// ============================================
// 현금/예금 세부 유형 (Cash Sub-types)
// ============================================
export const CASH_TYPES = {
    BANK: 'bank',               // 은행 예금
    CMA: 'cma',                 // CMA
    CASH: 'cash',               // 현금
    LIVING: 'living',           // 생활비 계좌
    EMERGENCY: 'emergency',     // 비상금
    FAMILY: 'family_account'    // 가족 공동 계좌
};

export const CASH_TYPE_INFO = [
    { id: 'bank', name: '은행 예금', icon: '🏦', description: '일반 은행 예금' },
    { id: 'cma', name: 'CMA', icon: '💰', description: 'CMA 계좌' },
    { id: 'cash', name: '현금', icon: '💵', description: '보유 현금' },
    { id: 'living', name: '생활비', icon: '🏠', description: '생활비 계좌' },
    { id: 'emergency', name: '비상금', icon: '🆘', description: '비상금 계좌' },
    { id: 'family_account', name: '가족 공동', icon: '👨‍👩‍👧', description: '가족 공동 계좌' }
];

// ============================================
// 크립토 자산 유형 (Crypto Sub-types)
// ============================================
export const CRYPTO_TYPES = {
    EXCHANGE: 'exchange',       // 거래소
    WALLET: 'wallet',           // 지갑
    STAKING: 'staking',         // 스테이킹
    NFT: 'nft',                 // NFT
    AIRDROP: 'airdrop',         // 에어드랍 예정
    ICO: 'ico',                 // ICO/투자
    DEFI: 'defi'                // DeFi (LP 등)
};

export const CRYPTO_TYPE_INFO = [
    { id: 'exchange', name: '거래소', icon: '💱', description: '중앙화 거래소 보유 자산' },
    { id: 'wallet', name: '지갑', icon: '👛', description: '개인 지갑 보유 자산' },
    { id: 'staking', name: '스테이킹', icon: '🔒', description: '스테이킹/락업 중인 자산' },
    { id: 'nft', name: 'NFT', icon: '🖼️', description: 'NFT 컬렉션' },
    { id: 'airdrop', name: '에어드랍', icon: '🎯', description: '받을 예정인 에어드랍' },
    { id: 'ico', name: 'ICO/투자', icon: '💎', description: '시드/프라이빗 세일 투자' },
    { id: 'defi', name: 'DeFi', icon: '🌊', description: 'LP, 이자농사 등' }
];

// ============================================
// 거래소 목록
// ============================================
export const EXCHANGES = [
    { id: 'binance', name: '바이낸스', icon: '🟡' },
    { id: 'upbit', name: '업비트', icon: '🔵' },
    { id: 'bithumb', name: '빗썸', icon: '🟠' },
    { id: 'coinone', name: '코인원', icon: '🔷' },
    { id: 'bybit', name: '바이비트', icon: '⚫' },
    { id: 'okx', name: 'OKX', icon: '⚪' },
    { id: 'gate', name: 'Gate.io', icon: '🟢' },
    { id: 'mexc', name: 'MEXC', icon: '🔵' },
    { id: 'htx', name: 'HTX', icon: '🔷' },
    { id: 'kraken', name: '크라켄', icon: '🐙' },
    { id: 'coinbase', name: '코인베이스', icon: '🔵' },
    { id: 'other_exchange', name: '기타 거래소', icon: '📊' }
];

// ============================================
// 지갑 목록
// ============================================
export const WALLETS = [
    { id: 'metamask', name: '메타마스크', icon: '🦊', chains: ['ethereum', 'polygon', 'arbitrum'] },
    { id: 'phantom', name: '팬텀', icon: '👻', chains: ['solana'] },
    { id: 'kaikas', name: '카이카스', icon: '🟤', chains: ['klaytn'] },
    { id: 'rabby', name: 'Rabby', icon: '🐰', chains: ['ethereum', 'multi'] },
    { id: 'ledger', name: '렛저', icon: '🔐', chains: ['multi'] },
    { id: 'trezor', name: '트레저', icon: '🛡️', chains: ['multi'] },
    { id: 'trust', name: '트러스트월렛', icon: '🛡️', chains: ['multi'] },
    { id: 'okx_wallet', name: 'OKX 월렛', icon: '⚪', chains: ['multi'] },
    { id: 'keplr', name: 'Keplr', icon: '⚛️', chains: ['cosmos'] },
    { id: 'other_wallet', name: '기타 지갑', icon: '👛', chains: ['other'] }
];

// ============================================
// 스테이킹 상태
// ============================================
export const STAKING_STATUS = {
    ACTIVE: 'active',           // 스테이킹 중
    UNLOCKING: 'unlocking',     // 언락 대기 중
    CLAIMABLE: 'claimable',     // 클레임 가능
    COMPLETED: 'completed'      // 완료
};

export const STAKING_STATUS_INFO = [
    { id: 'active', name: '스테이킹 중', icon: '🔒', color: '#4CAF50' },
    { id: 'unlocking', name: '언락 대기', icon: '⏳', color: '#FF9800' },
    { id: 'claimable', name: '클레임 가능', icon: '✅', color: '#2196F3' },
    { id: 'completed', name: '완료', icon: '✔️', color: '#9E9E9E' }
];

// ============================================
// 에어드랍 상태
// ============================================
export const AIRDROP_STATUS = {
    PENDING: 'pending',         // 대기 중 (파밍 중)
    CONFIRMED: 'confirmed',     // 확정
    CLAIMABLE: 'claimable',     // 클레임 가능
    CLAIMED: 'claimed',         // 수령 완료
    MISSED: 'missed'            // 놓침
};

export const AIRDROP_STATUS_INFO = [
    { id: 'pending', name: '파밍 중', icon: '🌱', color: '#FF9800' },
    { id: 'confirmed', name: '확정', icon: '✅', color: '#4CAF50' },
    { id: 'claimable', name: '클레임 가능', icon: '🎁', color: '#2196F3' },
    { id: 'claimed', name: '수령 완료', icon: '✔️', color: '#9E9E9E' },
    { id: 'missed', name: '놓침', icon: '❌', color: '#F44336' }
];

// ============================================
// 인기 에어드랍 프로젝트 (예시)
// ============================================
export const POPULAR_AIRDROPS = [
    { id: 'monad', name: 'Monad', icon: '🟣', status: 'pending' },
    { id: 'berachain', name: 'Berachain', icon: '🐻', status: 'pending' },
    { id: 'linea', name: 'Linea', icon: '🔷', status: 'pending' },
    { id: 'scroll', name: 'Scroll', icon: '📜', status: 'pending' },
    { id: 'zksync', name: 'zkSync', icon: '🔮', status: 'confirmed' },
    { id: 'layerzero', name: 'LayerZero', icon: '0️⃣', status: 'pending' },
    { id: 'eigenlayer', name: 'EigenLayer', icon: '🔷', status: 'pending' },
    { id: 'other', name: '기타', icon: '🎯', status: 'pending' }
];

// ============================================
// 부채 유형
// ============================================
export const DEBT_TYPES = {
    BANK_LOAN: 'bank_loan',         // 은행 대출
    FAMILY_LOAN: 'family_loan',     // 가족 대출
    CREDIT_CARD: 'credit_card',     // 카드 대금
    OTHER_DEBT: 'other_debt'        // 기타 부채
};

export const DEBT_TYPE_INFO = [
    { id: 'bank_loan', name: '은행 대출', icon: '🏦' },
    { id: 'family_loan', name: '가족 대출', icon: '👨‍👩‍👧' },
    { id: 'credit_card', name: '카드 대금', icon: '💳' },
    { id: 'other_debt', name: '기타 부채', icon: '📋' }
];

// ============================================
// 기존 호환용 (레거시)
// ============================================
export const ACCOUNT_TYPES = {
    WEB3: 'web3',
    INVESTMENT: 'investment',
    BANK: 'bank',
    FAMILY: 'family',
    EXCHANGE: 'exchange',
    WALLET: 'wallet',
    // V2 추가
    STAKING: 'staking',
    NFT: 'nft',
    AIRDROP: 'airdrop',
    ICO: 'ico',
    STOCK: 'stock',
    CASH: 'cash',
    REAL_ESTATE: 'real_estate'
};

// 차익거래 태그
export const ARBITRAGE_TAGS = ['차익거래', '김프', '역프', '재정거래'];

// 거래 유형
export const TRANSACTION_TYPES = {
    INCOME: 'income',
    EXPENSE: 'expense',
    TRANSFER: 'transfer'
};

// 반복 주기
export const FREQUENCY_OPTIONS = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly'
};

// 날짜 필터
export const DATE_FILTERS = {
    ALL: 'all',
    THIS_WEEK: 'thisWeek',
    THIS_MONTH: 'thisMonth',
    LAST_MONTH: 'lastMonth'
};

// RPG 퀘스트
export const DAILY_QUESTS = {
    NO_FUTURES: 'noFutures',
    VIBE_CODING: 'vibeCoding',
    X_POSTING: 'xPosting',
    MENTAL_CHECK: 'mentalCheck'
};

// 목표
export const GOALS = {
    MAIN_QUEST: 50000000000, // 500억
    BANK_LOAN: 410000000,    // 4.1억
    PARENT_LOAN: 150000000   // 1.5억
};
