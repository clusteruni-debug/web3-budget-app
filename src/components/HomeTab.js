import { getTransactions, getAccounts } from '../services/database.js';
import {
    calculateTotalIncome,
    calculateTotalExpense,
    calculateNetIncome,
    calculateAccountBalances,
    calculateTotalAssets,
    calculateMonthlyTrend,
    getTopItems,
    analyzeMoneyFlow
} from '../services/analytics.js';
import { formatAmount, formatNumber, calculatePercentage, calculateChangeRate } from '../utils/helpers.js';

let monthlyTrendChart = null;
let yearlyComparisonChart = null;

export function createHomeTab() {
    return `
        <div class="home-container">
            <div class="home-grid">
                <!-- 총 자산 카드 -->
                <div class="total-assets-card">
                    <div class="total-assets-label">💰 총 자산</div>
                    <div class="total-assets-value" id="homePageTotalAssets">0원</div>
                    <div class="total-assets-change">
                        <span class="change-positive" id="homePageAssetChange">↑ 0원</span>
                        <span class="change-rate" id="homePageChangeRate">(0%)</span>
                        <span style="opacity: 0.8;">vs 전월</span>
                    </div>
                </div>

                <!-- 수입/지출/순수익 -->
                <div class="metrics-grid">
                    <div class="metric-card income">
                        <div class="metric-header">
                            <span class="metric-icon">💚</span>
                            <span class="metric-label">이번 달 수입</span>
                        </div>
                        <div class="metric-value income-color" id="homeMonthIncome">0원</div>
                        <div class="metric-detail">
                            <span id="homeIncomeCount">0건</span>
                            <span class="metric-change" id="homeIncomeChange"></span>
                        </div>
                        <div class="metric-action">
                            <a href="#" class="metric-link" data-tab="dashboard">상세보기 →</a>
                        </div>
                    </div>

                    <div class="metric-card expense">
                        <div class="metric-header">
                            <span class="metric-icon">💸</span>
                            <span class="metric-label">이번 달 지출</span>
                        </div>
                        <div class="metric-value expense-color" id="homeMonthExpense">0원</div>
                        <div class="metric-detail">
                            <span id="homeExpenseCount">0건</span>
                            <span class="metric-change" id="homeExpenseChange"></span>
                        </div>
                        <div class="metric-action">
                            <a href="#" class="metric-link" data-tab="dashboard">상세보기 →</a>
                        </div>
                    </div>

                    <div class="metric-card profit">
                        <div class="metric-header">
                            <span class="metric-icon">💰</span>
                            <span class="metric-label">순수익</span>
                        </div>
                        <div class="metric-value profit-color" id="homeMonthProfit">0원</div>
                        <div class="metric-detail">수입 - 지출</div>
                        <div class="metric-action">
                            <a href="#" class="metric-link" data-tab="rpg">RPG 보기 →</a>
                        </div>
                    </div>
                </div>

                <!-- 자산 분포 -->
                <div class="asset-distribution-card">
                    <h2 class="card-title">📊 자산 분포</h2>

                    <div class="asset-item">
                        <div class="asset-icon web3">💎</div>
                        <div class="asset-info">
                            <div class="asset-name">Web3 지갑</div>
                            <div class="asset-bar-container">
                                <div class="asset-bar">
                                    <div class="asset-bar-fill web3" id="web3Bar" style="width: 0%"></div>
                                </div>
                                <div class="asset-percent" id="web3Percent">0%</div>
                            </div>
                        </div>
                        <div class="asset-amount" id="web3Amount">0원</div>
                    </div>

                    <div class="asset-item">
                        <div class="asset-icon investment">📈</div>
                        <div class="asset-info">
                            <div class="asset-name">투자 계정</div>
                            <div class="asset-bar-container">
                                <div class="asset-bar">
                                    <div class="asset-bar-fill investment" id="investmentBar" style="width: 0%"></div>
                                </div>
                                <div class="asset-percent" id="investmentPercent">0%</div>
                            </div>
                        </div>
                        <div class="asset-amount" id="investmentAmount">0원</div>
                    </div>

                    <div class="asset-item">
                        <div class="asset-icon bank">🏦</div>
                        <div class="asset-info">
                            <div class="asset-name">은행 계정</div>
                            <div class="asset-bar-container">
                                <div class="asset-bar">
                                    <div class="asset-bar-fill bank" id="bankBar" style="width: 0%"></div>
                                </div>
                                <div class="asset-percent" id="bankPercent">0%</div>
                            </div>
                        </div>
                        <div class="asset-amount" id="bankAmount">0원</div>
                    </div>

                    <div class="asset-item">
                        <div class="asset-icon family">👨‍👩‍👧</div>
                        <div class="asset-info">
                            <div class="asset-name">가족 대출</div>
                            <div class="asset-bar-container">
                                <div class="asset-bar">
                                    <div class="asset-bar-fill family" id="familyBar" style="width: 0%"></div>
                                </div>
                                <div class="asset-percent" id="familyPercent">0%</div>
                            </div>
                        </div>
                        <div class="asset-amount" id="familyAmount">0원</div>
                    </div>
                </div>

                <!-- 자금 흐름 -->
                <div class="cashflow-card">
                    <h2 class="card-title">💧 이번 달 자금 흐름</h2>

                    <!-- 수입원 -->
                    <div class="cashflow-section">
                        <div class="cashflow-section-title">
                            📥 주요 수입원
                        </div>
                        <div id="topIncomeList"></div>
                        <div class="cashflow-summary">
                            <span class="summary-label">총 수입</span>
                            <span class="summary-value positive" id="totalIncomeFlow">0원</span>
                        </div>
                    </div>

                    <!-- 지출처 -->
                    <div class="cashflow-section">
                        <div class="cashflow-section-title">
                            📤 주요 지출처
                        </div>
                        <div id="topExpenseList"></div>
                        <div class="cashflow-summary">
                            <span class="summary-label">총 지출</span>
                            <span class="summary-value negative" id="totalExpenseFlow">0원</span>
                        </div>
                    </div>

                    <!-- 인사이트 -->
                    <div class="insights-section">
                        <div class="cashflow-section-title">
                            💡 자동 인사이트
                        </div>
                        <div id="cashflowInsights"></div>
                    </div>
                </div>

                <!-- 차트 그리드 -->
                <div class="charts-grid">
                    <!-- 월별 트렌드 차트 -->
                    <div class="chart-card">
                        <h2 class="card-title">📈 월별 수입/지출 트렌드</h2>
                        <div class="chart-container">
                            <canvas id="monthlyTrendChart"></canvas>
                        </div>
                    </div>

                    <!-- 연도별 비교 차트 -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <h2 class="card-title">📊 연도별 비교</h2>
                            <select id="yearlyChartType" class="chart-type-select">
                                <option value="income">수입</option>
                                <option value="expense">지출</option>
                                <option value="net">순수익</option>
                            </select>
                        </div>
                        <div class="chart-container">
                            <canvas id="yearlyComparisonChart"></canvas>
                        </div>
                        <div class="yearly-summary" id="yearlySummary">
                            <!-- 연도별 요약이 여기에 표시됩니다 -->
                        </div>
                    </div>
                </div>

                <!-- 빠른 액션 -->
                <div class="quick-actions-card">
                    <h2 class="card-title">🔥 빠른 액션</h2>
                    <div class="quick-actions-grid">
                        <button class="quick-action-btn" data-tab="dashboard" data-action="income">
                            <span class="quick-action-icon">➕</span>
                            <span class="quick-action-label">수입 추가</span>
                        </button>
                        <button class="quick-action-btn" data-tab="dashboard" data-action="expense">
                            <span class="quick-action-icon">➖</span>
                            <span class="quick-action-label">지출 추가</span>
                        </button>
                        <button class="quick-action-btn" data-tab="rpg">
                            <span class="quick-action-icon">🏦</span>
                            <span class="quick-action-label">대출 상환</span>
                        </button>
                        <button class="quick-action-btn" data-tab="transactions">
                            <span class="quick-action-icon">📊</span>
                            <span class="quick-action-label">거래 내역</span>
                        </button>
                        <button class="quick-action-btn" id="exportCSVBtn">
                            <span class="quick-action-icon">📥</span>
                            <span class="quick-action-label">CSV 내보내기</span>
                        </button>
                        <button class="quick-action-btn" data-tab="rpg">
                            <span class="quick-action-icon">🎮</span>
                            <span class="quick-action-label">RPG 모드</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export async function initHomeTab(switchTabCallback) {
    // 데이터 로드
    await loadHomeData();

    // 이벤트 리스너 - 탭 이동 링크
    document.querySelectorAll('.metric-link, .quick-action-btn[data-tab]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = el.dataset.tab;
            if (tab && switchTabCallback) {
                switchTabCallback(tab);
            }
        });
    });

    // CSV 내보내기
    const exportBtn = document.getElementById('exportCSVBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }

    // 연도별 차트 타입 변경
    const yearlyChartTypeEl = document.getElementById('yearlyChartType');
    if (yearlyChartTypeEl) {
        yearlyChartTypeEl.addEventListener('change', async () => {
            const result = await getTransactions();
            if (result.success && result.data) {
                updateYearlyComparisonChart(result.data);
            }
        });
    }
}

async function loadHomeData() {
    try {
        const result = await getTransactions();
        if (!result.success) {
            console.error('거래 데이터 로드 실패:', result.error);
            return;
        }

        const transactions = result.data || [];

        // 이번 달 데이터
        const thisMonthIncome = calculateTotalIncome(transactions, 'thisMonth');
        const thisMonthExpense = calculateTotalExpense(transactions, 'thisMonth');
        const thisMonthNet = calculateNetIncome(transactions, 'thisMonth');

        // 지난 달 데이터 (비교용)
        const lastMonthIncome = calculateTotalIncome(transactions, 'lastMonth');
        const lastMonthExpense = calculateTotalExpense(transactions, 'lastMonth');
        const lastMonthNet = calculateNetIncome(transactions, 'lastMonth');

        // 총 자산
        const totalAssets = calculateTotalAssets(transactions);
        const accountBalances = calculateAccountBalances(transactions);

        // 거래 건수 (이번 달)
        const thisMonthTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });
        const incomeCount = thisMonthTransactions.filter(t => t.type === 'income').length;
        const expenseCount = thisMonthTransactions.filter(t => t.type === 'expense').length;

        // UI 업데이트 - 총 자산
        document.getElementById('homePageTotalAssets').textContent = formatAmount(totalAssets);

        // 이번 달 vs 전월 변화
        const changeEl = document.getElementById('homePageAssetChange');
        const changeRateEl = document.getElementById('homePageChangeRate');
        const netChange = thisMonthNet - lastMonthNet;
        const changeRate = lastMonthNet !== 0 ? calculateChangeRate(thisMonthNet, lastMonthNet) : 0;

        if (thisMonthNet >= 0) {
            changeEl.textContent = `↑ ${formatAmount(thisMonthNet)}`;
            changeEl.className = 'change-positive';
        } else {
            changeEl.textContent = `↓ ${formatAmount(Math.abs(thisMonthNet))}`;
            changeEl.className = 'change-negative';
        }

        if (changeRate > 0) {
            changeRateEl.textContent = `(+${changeRate}%)`;
            changeRateEl.className = 'change-rate positive';
        } else if (changeRate < 0) {
            changeRateEl.textContent = `(${changeRate}%)`;
            changeRateEl.className = 'change-rate negative';
        } else {
            changeRateEl.textContent = '(0%)';
            changeRateEl.className = 'change-rate';
        }

        // 수입/지출/순수익
        document.getElementById('homeMonthIncome').textContent = formatAmount(thisMonthIncome);
        document.getElementById('homeMonthExpense').textContent = formatAmount(thisMonthExpense);
        document.getElementById('homeMonthProfit').textContent = formatAmount(thisMonthNet);
        document.getElementById('homeIncomeCount').textContent = `${incomeCount}건`;
        document.getElementById('homeExpenseCount').textContent = `${expenseCount}건`;

        // 수입 변화율
        const incomeChangeEl = document.getElementById('homeIncomeChange');
        if (lastMonthIncome > 0) {
            const incomeChangeRate = calculateChangeRate(thisMonthIncome, lastMonthIncome);
            incomeChangeEl.textContent = incomeChangeRate >= 0 ? `+${incomeChangeRate}%` : `${incomeChangeRate}%`;
            incomeChangeEl.className = `metric-change ${incomeChangeRate >= 0 ? 'positive' : 'negative'}`;
        }

        // 지출 변화율
        const expenseChangeEl = document.getElementById('homeExpenseChange');
        if (lastMonthExpense > 0) {
            const expenseChangeRate = calculateChangeRate(thisMonthExpense, lastMonthExpense);
            expenseChangeEl.textContent = expenseChangeRate >= 0 ? `+${expenseChangeRate}%` : `${expenseChangeRate}%`;
            // 지출은 줄어들면 좋은 것
            expenseChangeEl.className = `metric-change ${expenseChangeRate <= 0 ? 'positive' : 'negative'}`;
        }

        // 자산 분포 (가족 대출 포함)
        updateAssetDistribution(accountBalances, totalAssets);

        // 자금 흐름
        updateCashflow(transactions);

        // 차트
        updateMonthlyTrendChart(transactions);
        updateYearlyComparisonChart(transactions);

    } catch (error) {
        console.error('홈 데이터 로드 에러:', error);
    }
}

function updateAssetDistribution(balances, total) {
    const accounts = ['web3', 'investment', 'bank', 'family'];

    // 총 자산 계산 (음수 제외)
    const positiveTotal = accounts.reduce((sum, acc) => {
        const amount = balances[acc] || 0;
        return sum + (amount > 0 ? amount : 0);
    }, 0);

    accounts.forEach(account => {
        const amount = balances[account] || 0;
        const percent = positiveTotal > 0 ? calculatePercentage(Math.abs(amount), positiveTotal) : 0;

        const barEl = document.getElementById(`${account}Bar`);
        const percentEl = document.getElementById(`${account}Percent`);
        const amountEl = document.getElementById(`${account}Amount`);

        if (barEl) barEl.style.width = `${Math.min(percent, 100)}%`;
        if (percentEl) percentEl.textContent = `${percent}%`;
        if (amountEl) {
            amountEl.textContent = formatAmount(amount);
            // 음수면 빨간색으로 표시
            if (amount < 0) {
                amountEl.style.color = 'var(--expense)';
            } else {
                amountEl.style.color = '';
            }
        }
    });
}

function updateCashflow(transactions) {
    const topIncome = getTopItems(transactions, 'income', 3, 'thisMonth');
    const topExpense = getTopItems(transactions, 'expense', 3, 'thisMonth');
    const totalIncome = calculateTotalIncome(transactions, 'thisMonth');
    const totalExpense = calculateTotalExpense(transactions, 'thisMonth');
    const insights = analyzeMoneyFlow(transactions, 'thisMonth');

    // 수입 리스트
    const incomeListEl = document.getElementById('topIncomeList');
    if (incomeListEl) {
        incomeListEl.innerHTML = topIncome.length > 0
            ? topIncome.map(item => `
                <div class="cashflow-item">
                    <span class="cashflow-category">${item.category}</span>
                    <span class="cashflow-amount positive">${formatAmount(item.amount)}</span>
                </div>
            `).join('')
            : '<div class="cashflow-empty">이번 달 수입이 없습니다</div>';
    }

    // 지출 리스트
    const expenseListEl = document.getElementById('topExpenseList');
    if (expenseListEl) {
        expenseListEl.innerHTML = topExpense.length > 0
            ? topExpense.map(item => `
                <div class="cashflow-item">
                    <span class="cashflow-category">${item.category}</span>
                    <span class="cashflow-amount negative">${formatAmount(item.amount)}</span>
                </div>
            `).join('')
            : '<div class="cashflow-empty">이번 달 지출이 없습니다</div>';
    }

    // 총합
    document.getElementById('totalIncomeFlow').textContent = formatAmount(totalIncome);
    document.getElementById('totalExpenseFlow').textContent = formatAmount(totalExpense);

    // 인사이트
    const insightsEl = document.getElementById('cashflowInsights');
    if (insightsEl) {
        insightsEl.innerHTML = insights.length > 0
            ? insights.map(insight => `
                <div class="insight-item">💡 ${insight}</div>
            `).join('')
            : '<div class="cashflow-empty">데이터가 더 쌓이면 인사이트가 표시됩니다</div>';
    }
}

function updateMonthlyTrendChart(transactions) {
    const ctx = document.getElementById('monthlyTrendChart');
    if (!ctx) return;

    const trendData = calculateMonthlyTrend(transactions, 6);

    // 기존 차트 제거
    if (monthlyTrendChart) {
        monthlyTrendChart.destroy();
    }

    monthlyTrendChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: trendData.map(d => d.month),
            datasets: [
                {
                    label: '수입',
                    data: trendData.map(d => d.income),
                    backgroundColor: 'rgba(72, 187, 120, 0.8)',
                    borderRadius: 4
                },
                {
                    label: '지출',
                    data: trendData.map(d => d.expense),
                    backgroundColor: 'rgba(245, 101, 101, 0.8)',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => formatAmount(value)
                    }
                }
            }
        }
    });
}

function updateYearlyComparisonChart(transactions) {
    const ctx = document.getElementById('yearlyComparisonChart');
    if (!ctx) return;

    const chartType = document.getElementById('yearlyChartType')?.value || 'income';

    // 연도별 데이터 계산
    const yearlyData = calculateYearlyData(transactions);

    // 기존 차트 제거
    if (yearlyComparisonChart) {
        yearlyComparisonChart.destroy();
    }

    // 차트 데이터 준비
    let datasets = [];
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

    const colors = [
        { bg: 'rgba(102, 126, 234, 0.8)', border: 'rgb(102, 126, 234)' },
        { bg: 'rgba(118, 75, 162, 0.8)', border: 'rgb(118, 75, 162)' },
        { bg: 'rgba(52, 211, 153, 0.8)', border: 'rgb(52, 211, 153)' }
    ];

    Object.keys(yearlyData).sort().forEach((year, index) => {
        const data = yearlyData[year];
        let values;

        switch (chartType) {
            case 'income':
                values = data.income;
                break;
            case 'expense':
                values = data.expense;
                break;
            case 'net':
                values = data.income.map((inc, i) => inc - data.expense[i]);
                break;
            default:
                values = data.income;
        }

        datasets.push({
            label: `${year}년`,
            data: values,
            backgroundColor: colors[index % colors.length].bg,
            borderColor: colors[index % colors.length].border,
            borderWidth: 2,
            tension: 0.3,
            fill: false
        });
    });

    yearlyComparisonChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${formatAmount(context.raw)}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => formatAmount(value)
                    }
                }
            }
        }
    });

    // 연도별 요약 업데이트
    updateYearlySummary(yearlyData, chartType);
}

function calculateYearlyData(transactions) {
    const yearlyData = {};
    const currentYear = new Date().getFullYear();

    // 최근 3년만 표시
    for (let year = currentYear - 2; year <= currentYear; year++) {
        yearlyData[year] = {
            income: new Array(12).fill(0),
            expense: new Array(12).fill(0)
        };
    }

    transactions.forEach(t => {
        const date = new Date(t.date);
        const year = date.getFullYear();
        const month = date.getMonth();

        if (yearlyData[year]) {
            if (t.type === 'income') {
                yearlyData[year].income[month] += t.amount;
            } else if (t.type === 'expense') {
                yearlyData[year].expense[month] += t.amount;
            }
        }
    });

    return yearlyData;
}

function updateYearlySummary(yearlyData, chartType) {
    const summaryEl = document.getElementById('yearlySummary');
    if (!summaryEl) return;

    const years = Object.keys(yearlyData).sort().reverse();
    const typeLabels = {
        income: '수입',
        expense: '지출',
        net: '순수익'
    };

    let summaryHTML = `<div class="yearly-summary-title">${typeLabels[chartType]} 연도별 합계</div>`;
    summaryHTML += '<div class="yearly-summary-grid">';

    years.forEach((year, index) => {
        const data = yearlyData[year];
        let total;

        switch (chartType) {
            case 'income':
                total = data.income.reduce((sum, v) => sum + v, 0);
                break;
            case 'expense':
                total = data.expense.reduce((sum, v) => sum + v, 0);
                break;
            case 'net':
                total = data.income.reduce((sum, v) => sum + v, 0) - data.expense.reduce((sum, v) => sum + v, 0);
                break;
        }

        // 전년 대비 변화율
        let changeRate = null;
        if (index < years.length - 1) {
            const prevYear = years[index + 1];
            const prevData = yearlyData[prevYear];
            let prevTotal;

            switch (chartType) {
                case 'income':
                    prevTotal = prevData.income.reduce((sum, v) => sum + v, 0);
                    break;
                case 'expense':
                    prevTotal = prevData.expense.reduce((sum, v) => sum + v, 0);
                    break;
                case 'net':
                    prevTotal = prevData.income.reduce((sum, v) => sum + v, 0) - prevData.expense.reduce((sum, v) => sum + v, 0);
                    break;
            }

            if (prevTotal !== 0) {
                changeRate = ((total - prevTotal) / Math.abs(prevTotal) * 100).toFixed(1);
            }
        }

        const isPositive = chartType === 'expense' ? changeRate <= 0 : changeRate >= 0;

        summaryHTML += `
            <div class="yearly-summary-item">
                <div class="year-label">${year}년</div>
                <div class="year-total ${total >= 0 ? 'positive' : 'negative'}">${formatAmount(total)}</div>
                ${changeRate !== null ? `
                    <div class="year-change ${isPositive ? 'up' : 'down'}">
                        ${changeRate >= 0 ? '+' : ''}${changeRate}% vs 전년
                    </div>
                ` : '<div class="year-change">기준 연도</div>'}
            </div>
        `;
    });

    summaryHTML += '</div>';
    summaryEl.innerHTML = summaryHTML;
}

async function exportToCSV() {
    try {
        const result = await getTransactions();
        if (!result.success || !result.data.length) {
            alert('내보낼 데이터가 없습니다.');
            return;
        }

        const transactions = result.data;
        const headers = ['날짜', '유형', '카테고리', '금액', '제목', '설명'];
        const rows = transactions.map(t => [
            t.date,
            t.type === 'income' ? '수입' : '지출',
            t.category,
            t.amount,
            t.title || '',
            t.description || ''
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `web3-budget-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

    } catch (error) {
        console.error('CSV 내보내기 실패:', error);
        alert('CSV 내보내기에 실패했습니다.');
    }
}
