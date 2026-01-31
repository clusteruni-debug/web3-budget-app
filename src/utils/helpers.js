// 숫자 포맷팅
export function formatNumber(num) {
    return new Intl.NumberFormat('ko-KR').format(num);
}

export function formatCurrency(num) {
    if (num >= 100000000) {
        return `${(num / 100000000).toFixed(1)}억`;
    } else if (num >= 10000) {
        return `${(num / 10000).toFixed(0)}만`;
    }
    return formatNumber(num);
}

export function formatAmount(num) {
    return `${formatNumber(num)}원`;
}

// 축약형 금액 표시 (억/만원 단위)
export function formatAmountShort(num) {
    const absNum = Math.abs(num);
    const sign = num < 0 ? '-' : '';

    if (absNum >= 100000000) {
        // 1억 이상: "5.6억원" 또는 "56억원"
        const billions = absNum / 100000000;
        if (billions >= 10) {
            return `${sign}${Math.round(billions)}억원`;
        }
        return `${sign}${billions.toFixed(1)}억원`;
    } else if (absNum >= 10000000) {
        // 1000만 이상: "5,600만원"
        return `${sign}${formatNumber(Math.round(absNum / 10000))}만원`;
    } else if (absNum >= 10000) {
        // 1만 이상: "500만원"
        return `${sign}${Math.round(absNum / 10000)}만원`;
    }
    return `${sign}${formatNumber(absNum)}원`;
}

// 날짜 포맷팅
export function formatDate(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
}

export function formatFullDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getToday() {
    return new Date().toISOString().split('T')[0];
}

// 날짜 필터 적용
export function filterByDate(transactions, filter) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
        case 'thisWeek':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return transactions.filter(t => new Date(t.date) >= weekStart);
            
        case 'thisMonth':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            return transactions.filter(t => new Date(t.date) >= monthStart);
            
        case 'lastMonth':
            const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
            return transactions.filter(t => {
                const date = new Date(t.date);
                return date >= lastMonthStart && date <= lastMonthEnd;
            });
            
        default: // 'all'
            return transactions;
    }
}

// 퍼센트 계산
export function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
}

// 변화율 계산
export function calculateChangeRate(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return (((current - previous) / previous) * 100).toFixed(1);
}

// 다음 날짜 계산 (반복 항목용)
export function calculateNextDate(currentDate, frequency) {
    const date = new Date(currentDate);
    
    switch (frequency) {
        case 'daily':
            date.setDate(date.getDate() + 1);
            break;
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
    }
    
    return date.toISOString().split('T')[0];
}

// 색상 가져오기 (계정별, 카테고리별)
export function getAccountColor(accountType) {
    const colors = {
        web3: 'var(--web3)',
        investment: 'var(--investment)',
        bank: 'var(--bank)',
        family: 'var(--family)'
    };
    return colors[accountType] || 'var(--primary)';
}

export function getTransactionColor(type) {
    const colors = {
        income: 'var(--income)',
        expense: 'var(--expense)',
        transfer: 'var(--transfer)'
    };
    return colors[type] || 'var(--gray-500)';
}
