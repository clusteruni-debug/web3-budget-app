// 카테고리 정의
export const INCOME_CATEGORIES = [
    '에어드랍', 'Kaito Yapping', '텔레그램 야핑', '포인트 판매',
    '프로젝트', 'X 스폰서', 'X 게임', '알바', '기타 수입'
];

export const EXPENSE_CATEGORIES = [
    '생활비', '식비', '교통비', '통신비', '쇼핑',
    '선물거래', '학습/도서', '건강', '여가', '기타 지출'
];

// 계정 유형
export const ACCOUNT_TYPES = {
    WEB3: 'web3',
    INVESTMENT: 'investment',
    BANK: 'bank',
    FAMILY: 'family',
    EXCHANGE: 'exchange',
    WALLET: 'wallet'
};

// 거래소 목록
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
    { id: 'other_exchange', name: '기타 거래소', icon: '📊' }
];

// 지갑 목록
export const WALLETS = [
    { id: 'metamask', name: '메타마스크', icon: '🦊' },
    { id: 'phantom', name: '팬텀', icon: '👻' },
    { id: 'kaikas', name: '카이카스', icon: '🟤' },
    { id: 'rabby', name: 'Rabby', icon: '🐰' },
    { id: 'ledger', name: '렛저', icon: '🔐' },
    { id: 'trezor', name: '트레저', icon: '🛡️' },
    { id: 'trust', name: '트러스트월렛', icon: '🛡️' },
    { id: 'okx_wallet', name: 'OKX 월렛', icon: '⚪' },
    { id: 'other_wallet', name: '기타 지갑', icon: '👛' }
];

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
