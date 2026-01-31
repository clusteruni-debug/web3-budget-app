// 현금흐름도 (Sankey Diagram) 탭
import { getTransactions, getDebts } from '../services/database.js';
import { formatAmount } from '../utils/helpers.js';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/constants.js';

let transactions = [];
let debts = [];
let selectedPeriod = 'thisMonth';

export function createCashflowTab() {
    return `
        <div class="cashflow-container v2">
            <div class="section-header">
                <h2>💹 현금 흐름도</h2>
                <p class="section-desc">돈이 어디서 와서 어디로 가는지 한눈에 파악하세요</p>
            </div>

            <!-- 기간 선택 -->
            <div class="period-selector">
                <button class="period-btn active" data-period="thisMonth">이번 달</button>
                <button class="period-btn" data-period="lastMonth">지난 달</button>
                <button class="period-btn" data-period="last3Months">최근 3개월</button>
                <button class="period-btn" data-period="thisYear">올해</button>
                <button class="period-btn" data-period="all">전체</button>
            </div>

            <!-- 요약 카드 -->
            <div class="cashflow-summary-cards">
                <div class="summary-card income-card">
                    <div class="summary-icon">📥</div>
                    <div class="summary-info">
                        <div class="summary-label">총 수입</div>
                        <div class="summary-value" id="totalIncomeValue">0원</div>
                    </div>
                </div>
                <div class="summary-card expense-card">
                    <div class="summary-icon">📤</div>
                    <div class="summary-info">
                        <div class="summary-label">총 지출</div>
                        <div class="summary-value" id="totalExpenseValue">0원</div>
                    </div>
                </div>
                <div class="summary-card net-card">
                    <div class="summary-icon">💰</div>
                    <div class="summary-info">
                        <div class="summary-label">순 현금흐름</div>
                        <div class="summary-value" id="netCashflowValue">0원</div>
                    </div>
                </div>
            </div>

            <!-- Sankey Diagram -->
            <div class="sankey-section">
                <h3>🔄 돈의 흐름</h3>
                <div id="sankeyChart" class="sankey-chart">
                    <div class="loading">차트 로딩 중...</div>
                </div>
            </div>

            <!-- 수입원 상세 -->
            <div class="flow-details-grid">
                <div class="flow-detail-card income-detail">
                    <h3>📥 수입원 상세</h3>
                    <div class="flow-list" id="incomeFlowList">
                        <div class="empty-state">데이터 없음</div>
                    </div>
                </div>

                <!-- 지출처 상세 -->
                <div class="flow-detail-card expense-detail">
                    <h3>📤 지출처 상세</h3>
                    <div class="flow-list" id="expenseFlowList">
                        <div class="empty-state">데이터 없음</div>
                    </div>
                </div>
            </div>

            <!-- 고정 지출 (내 대출 이자) -->
            <div class="fixed-expense-section">
                <h3>🔒 내 월 고정 지출 (대출 이자)</h3>
                <div class="fixed-expense-grid" id="fixedExpenseGrid">
                    <div class="empty-state">등록된 부채가 없습니다</div>
                </div>
            </div>

            <!-- 어머니 부채 현황 (참고용) -->
            <div class="family-debt-section">
                <h3>👨‍👩‍👧 가족 부채 현황 (참고용)</h3>
                <div class="family-debt-grid" id="familyDebtGrid">
                    <div class="empty-state">등록된 가족 부채가 없습니다</div>
                </div>
            </div>
        </div>
    `;
}

export async function initCashflowTab() {
    // Google Charts 로드
    if (typeof google !== 'undefined') {
        google.charts.load('current', { 'packages': ['sankey'] });
        google.charts.setOnLoadCallback(async () => {
            await loadData();
        });
    } else {
        await loadData();
    }

    // 기간 선택 이벤트
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedPeriod = btn.dataset.period;
            await loadData();
        });
    });
}

async function loadData() {
    try {
        const [transactionsResult, debtsResult] = await Promise.all([
            getTransactions(),
            getDebts()
        ]);

        if (transactionsResult.success) {
            transactions = filterByPeriod(transactionsResult.data || []);
        }

        if (debtsResult.success) {
            debts = debtsResult.data || [];
        }

        updateSummary();
        updateSankeyChart();
        updateFlowDetails();
        updateFixedExpenses();
    } catch (error) {
        console.error('데이터 로드 에러:', error);
    }
}

function filterByPeriod(data) {
    const today = new Date();
    let startDate = null;

    switch (selectedPeriod) {
        case 'thisMonth':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
        case 'lastMonth':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            return data.filter(t => {
                const tDate = new Date(t.date);
                return tDate >= startDate && tDate <= endOfLastMonth;
            });
        case 'last3Months':
            startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
            break;
        case 'thisYear':
            startDate = new Date(today.getFullYear(), 0, 1);
            break;
        case 'all':
        default:
            return data;
    }

    return data.filter(t => new Date(t.date) >= startDate);
}

function updateSummary() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const netCashflow = totalIncome - totalExpense;

    document.getElementById('totalIncomeValue').textContent = formatAmount(totalIncome);
    document.getElementById('totalExpenseValue').textContent = formatAmount(totalExpense);

    const netEl = document.getElementById('netCashflowValue');
    netEl.textContent = (netCashflow >= 0 ? '+' : '') + formatAmount(netCashflow);
    netEl.className = `summary-value ${netCashflow >= 0 ? 'positive' : 'negative'}`;
}

function updateSankeyChart() {
    const container = document.getElementById('sankeyChart');

    if (typeof google === 'undefined' || !google.visualization) {
        container.innerHTML = '<div class="chart-fallback">Sankey 차트를 로드할 수 없습니다.</div>';
        renderFallbackChart();
        return;
    }

    // 데이터 준비
    const incomeByCategory = {};
    const expenseByCategory = {};

    transactions.forEach(t => {
        if (t.type === 'income') {
            incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
        } else if (t.type === 'expense') {
            expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
        }
    });

    // Sankey 데이터 배열 생성
    const rows = [];

    // 수입원 → 총수입
    Object.entries(incomeByCategory).forEach(([category, amount]) => {
        if (amount > 0) {
            rows.push([category, '💰 총수입', amount]);
        }
    });

    // 총수입 → 지출처
    Object.entries(expenseByCategory).forEach(([category, amount]) => {
        if (amount > 0) {
            rows.push(['💰 총수입', category, amount]);
        }
    });

    // 순저축 계산
    const totalIncome = Object.values(incomeByCategory).reduce((a, b) => a + b, 0);
    const totalExpense = Object.values(expenseByCategory).reduce((a, b) => a + b, 0);
    const savings = totalIncome - totalExpense;

    if (savings > 0) {
        rows.push(['💰 총수입', '💎 저축/잔액', savings]);
    }

    if (rows.length === 0) {
        container.innerHTML = `
            <div class="empty-chart">
                <div class="empty-icon">📊</div>
                <div class="empty-text">거래 데이터가 없습니다</div>
                <div class="empty-hint">거래 탭에서 수입/지출을 입력하세요</div>
            </div>
        `;
        return;
    }

    // Sankey 차트 그리기
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'From');
    data.addColumn('string', 'To');
    data.addColumn('number', 'Amount');
    data.addRows(rows);

    const options = {
        width: '100%',
        height: 400,
        sankey: {
            node: {
                colors: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#8BC34A', '#FF5722', '#607D8B'],
                label: {
                    fontName: 'Pretendard, sans-serif',
                    fontSize: 12,
                    color: '#fff',
                    bold: true
                },
                nodePadding: 30,
                width: 20
            },
            link: {
                colorMode: 'gradient',
                colors: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336']
            }
        },
        tooltip: {
            textStyle: {
                fontName: 'Pretendard, sans-serif'
            }
        }
    };

    const chart = new google.visualization.Sankey(container);
    chart.draw(data, options);
}

function renderFallbackChart() {
    // Google Charts 로드 실패 시 대체 시각화
    const container = document.getElementById('sankeyChart');

    const incomeByCategory = {};
    const expenseByCategory = {};

    transactions.forEach(t => {
        if (t.type === 'income') {
            incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
        } else if (t.type === 'expense') {
            expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
        }
    });

    const totalIncome = Object.values(incomeByCategory).reduce((a, b) => a + b, 0);
    const totalExpense = Object.values(expenseByCategory).reduce((a, b) => a + b, 0);

    container.innerHTML = `
        <div class="fallback-flow">
            <div class="flow-column income-column">
                <h4>📥 수입원</h4>
                ${Object.entries(incomeByCategory)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, amount]) => `
                        <div class="flow-bar income">
                            <span class="flow-label">${cat}</span>
                            <div class="flow-bar-fill" style="width: ${(amount / totalIncome * 100).toFixed(1)}%"></div>
                            <span class="flow-amount">${formatAmount(amount)}</span>
                        </div>
                    `).join('')}
            </div>
            <div class="flow-center">
                <div class="flow-arrow">→</div>
                <div class="flow-total">${formatAmount(totalIncome)}</div>
                <div class="flow-arrow">→</div>
            </div>
            <div class="flow-column expense-column">
                <h4>📤 지출처</h4>
                ${Object.entries(expenseByCategory)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, amount]) => `
                        <div class="flow-bar expense">
                            <span class="flow-label">${cat}</span>
                            <div class="flow-bar-fill" style="width: ${(amount / totalExpense * 100).toFixed(1)}%"></div>
                            <span class="flow-amount">${formatAmount(amount)}</span>
                        </div>
                    `).join('')}
            </div>
        </div>
    `;
}

function updateFlowDetails() {
    // 수입 상세
    const incomeByCategory = {};
    transactions
        .filter(t => t.type === 'income')
        .forEach(t => {
            incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
        });

    const totalIncome = Object.values(incomeByCategory).reduce((a, b) => a + b, 0);

    const incomeList = document.getElementById('incomeFlowList');
    if (Object.keys(incomeByCategory).length === 0) {
        incomeList.innerHTML = '<div class="empty-state">수입 내역이 없습니다</div>';
    } else {
        incomeList.innerHTML = Object.entries(incomeByCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount]) => {
                const percent = totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(1) : 0;
                return `
                    <div class="flow-item">
                        <div class="flow-item-info">
                            <span class="flow-item-name">${category}</span>
                            <span class="flow-item-percent">${percent}%</span>
                        </div>
                        <div class="flow-item-bar">
                            <div class="flow-item-fill income" style="width: ${percent}%"></div>
                        </div>
                        <div class="flow-item-amount">${formatAmount(amount)}</div>
                    </div>
                `;
            }).join('');
    }

    // 지출 상세
    const expenseByCategory = {};
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
        });

    const totalExpense = Object.values(expenseByCategory).reduce((a, b) => a + b, 0);

    const expenseList = document.getElementById('expenseFlowList');
    if (Object.keys(expenseByCategory).length === 0) {
        expenseList.innerHTML = '<div class="empty-state">지출 내역이 없습니다</div>';
    } else {
        expenseList.innerHTML = Object.entries(expenseByCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount]) => {
                const percent = totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : 0;
                return `
                    <div class="flow-item">
                        <div class="flow-item-info">
                            <span class="flow-item-name">${category}</span>
                            <span class="flow-item-percent">${percent}%</span>
                        </div>
                        <div class="flow-item-bar">
                            <div class="flow-item-fill expense" style="width: ${percent}%"></div>
                        </div>
                        <div class="flow-item-amount">${formatAmount(amount)}</div>
                    </div>
                `;
            }).join('');
    }
}

function updateFixedExpenses() {
    const myDebtGrid = document.getElementById('fixedExpenseGrid');
    const familyDebtGrid = document.getElementById('familyDebtGrid');

    // [본인] 대출과 [어머니] 대출 분리
    const myDebts = debts.filter(d =>
        (d.description && d.description.includes('[본인]')) ||
        (!d.description?.includes('[어머니]') && !d.name?.includes('어머니'))
    );
    const familyDebts = debts.filter(d =>
        (d.description && d.description.includes('[어머니]')) ||
        (d.name && d.name.includes('어머니'))
    );

    // 내 대출 (실제 현금흐름)
    if (myDebts.length === 0) {
        myDebtGrid.innerHTML = '<div class="empty-state">등록된 부채가 없습니다</div>';
    } else {
        const myTotalMonthly = myDebts.reduce((sum, d) => sum + (d.monthly_payment || 0), 0);

        myDebtGrid.innerHTML = `
            <div class="fixed-expense-total">
                <span>내 월 이자 지출</span>
                <span class="total-value">${formatAmount(myTotalMonthly)}</span>
            </div>
            <div class="fixed-expense-list">
                ${myDebts.map(debt => `
                    <div class="fixed-expense-item">
                        <div class="expense-info">
                            <div class="expense-name">${debt.name}</div>
                            <div class="expense-creditor">${debt.creditor || ''}</div>
                        </div>
                        <div class="expense-amount">${formatAmount(debt.monthly_payment || 0)}/월</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // 가족 부채 (참고용)
    if (familyDebts.length === 0) {
        familyDebtGrid.innerHTML = '<div class="empty-state">등록된 가족 부채가 없습니다</div>';
    } else {
        const familyTotalDebt = familyDebts.reduce((sum, d) => sum + (d.remaining_amount || 0), 0);
        const familyTotalMonthly = familyDebts.reduce((sum, d) => sum + (d.monthly_payment || 0), 0);

        familyDebtGrid.innerHTML = `
            <div class="family-debt-summary">
                <div class="family-stat">
                    <span class="stat-label">총 부채</span>
                    <span class="stat-value">${formatAmount(familyTotalDebt)}</span>
                </div>
                <div class="family-stat">
                    <span class="stat-label">월 이자</span>
                    <span class="stat-value">${formatAmount(familyTotalMonthly)}</span>
                </div>
            </div>
            <div class="family-debt-list">
                ${familyDebts.map(debt => `
                    <div class="family-debt-item">
                        <div class="debt-info">
                            <div class="debt-name">${debt.name}</div>
                            <div class="debt-detail">${debt.creditor || ''} | ${debt.interest_rate || 0}%</div>
                        </div>
                        <div class="debt-amounts">
                            <div class="debt-principal">${formatAmount(debt.remaining_amount)}</div>
                            <div class="debt-monthly">${formatAmount(debt.monthly_payment || 0)}/월</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}
