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
    FAMILY: 'family'
};

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
