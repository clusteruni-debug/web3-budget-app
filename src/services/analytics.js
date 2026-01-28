import { filterByDate } from '../utils/helpers.js';

// 총 수입 계산
export function calculateTotalIncome(transactions, dateFilter = 'all') {
    const filtered = filterByDate(transactions, dateFilter);
    return filtered
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
}

// 총 지출 계산
export function calculateTotalExpense(transactions, dateFilter = 'all') {
    const filtered = filterByDate(transactions, dateFilter);
    return filtered
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
}

// 순수익 계산
export function calculateNetIncome(transactions, dateFilter = 'all') {
    const income = calculateTotalIncome(transactions, dateFilter);
    const expense = calculateTotalExpense(transactions, dateFilter);
    return income - expense;
}

// 카테고리별 집계
export function aggregateByCategory(transactions, type, dateFilter = 'all') {
    const filtered = filterByDate(transactions, dateFilter)
        .filter(t => t.type === type);
    
    const categoryMap = {};
    
    filtered.forEach(t => {
        const category = t.category || '기타';
        if (!categoryMap[category]) {
            categoryMap[category] = 0;
        }
        categoryMap[category] += t.amount;
    });
    
    return Object.entries(categoryMap)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);
}

// 계정별 잔액 계산
export function calculateAccountBalances(transactions) {
    const balances = {
        web3: 0,
        investment: 0,
        bank: 0,
        family: 0
    };
    
    transactions.forEach(t => {
        if (t.type === 'income' && t.accountTo) {
            balances[t.accountTo] = (balances[t.accountTo] || 0) + t.amount;
        } else if (t.type === 'expense' && t.accountFrom) {
            balances[t.accountFrom] = (balances[t.accountFrom] || 0) - t.amount;
        } else if (t.type === 'transfer') {
            if (t.accountFrom) {
                balances[t.accountFrom] = (balances[t.accountFrom] || 0) - t.amount;
            }
            if (t.accountTo) {
                balances[t.accountTo] = (balances[t.accountTo] || 0) + t.amount;
            }
        }
    });
    
    return balances;
}

// 총 자산 계산
export function calculateTotalAssets(transactions) {
    const balances = calculateAccountBalances(transactions);
    return Object.values(balances).reduce((sum, balance) => sum + balance, 0);
}

// 월별 트렌드 계산
export function calculateMonthlyTrend(transactions, months = 6) {
    const now = new Date();
    const monthlyData = [];
    
    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= monthStart && tDate <= monthEnd;
        });
        
        const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        monthlyData.push({
            month: `${date.getMonth() + 1}월`,
            income,
            expense,
            net: income - expense
        });
    }
    
    return monthlyData;
}

// Top N 계산
export function getTopItems(transactions, type, n = 5, dateFilter = 'all') {
    const aggregated = aggregateByCategory(transactions, type, dateFilter);
    return aggregated.slice(0, n);
}

// 거래 건수
export function countTransactions(transactions, dateFilter = 'all') {
    return filterByDate(transactions, dateFilter).length;
}

// 평균 수입
export function calculateAverageIncome(transactions, dateFilter = 'all') {
    const filtered = filterByDate(transactions, dateFilter)
        .filter(t => t.type === 'income');
    
    if (filtered.length === 0) return 0;
    
    const total = filtered.reduce((sum, t) => sum + t.amount, 0);
    return Math.round(total / filtered.length);
}

// 최근 거래일
export function getLastTransactionDate(transactions) {
    if (transactions.length === 0) return null;
    
    const sorted = [...transactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    return sorted[0].date;
}

// 자금 흐름 분석 (인사이트)
export function analyzeMoneyFlow(transactions, dateFilter = 'all') {
    const topIncome = getTopItems(transactions, 'income', 5, dateFilter);
    const topExpense = getTopItems(transactions, 'expense', 5, dateFilter);
    
    const totalIncome = calculateTotalIncome(transactions, dateFilter);
    const totalExpense = calculateTotalExpense(transactions, dateFilter);
    
    const insights = [];
    
    // 주요 수입원
    if (topIncome.length > 0) {
        const mainSource = topIncome[0];
        const percentage = ((mainSource.amount / totalIncome) * 100).toFixed(1);
        insights.push(`${mainSource.category}이(가) 전체 수입의 ${percentage}%를 차지합니다.`);
    }
    
    // 주요 지출처
    if (topExpense.length > 0) {
        const mainExpense = topExpense[0];
        const percentage = ((mainExpense.amount / totalExpense) * 100).toFixed(1);
        insights.push(`${mainExpense.category}이(가) 전체 지출의 ${percentage}%를 차지합니다.`);
    }
    
    // 저축률
    const savingsRate = ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1);
    if (!isNaN(savingsRate) && isFinite(savingsRate)) {
        insights.push(`저축률: ${savingsRate}%`);
    }
    
    return insights;
}
