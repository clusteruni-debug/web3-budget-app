import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../services/database.js';
import {
    calculateTotalIncome,
    calculateTotalExpense,
    calculateNetIncome,
    aggregateByCategory,
    countTransactions,
    calculateAverageIncome,
    getLastTransactionDate
} from '../services/analytics.js';
import { formatAmount, formatDate, getToday } from '../utils/helpers.js';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/constants.js';
import { createCashflowTab, initCashflowTab } from './CashflowTab.js';
import { createTransactionsTab, initTransactionsTab } from './TransactionsTab.js';

let transactions = [];
let currentDateFilter = 'all';
let editingTransactionId = null;
let incomePieChart = null;
let expensePieChart = null;
let currentSubTab = 'input'; // 'input' | 'list' | 'cashflow'

export function createDashboardTab(subtab = 'input') {
    currentSubTab = subtab;
    return `
        <div class="transactions-container">
            <!-- 서브탭 네비게이션 -->
            <div class="subtab-navigation">
                <button class="subtab-btn ${subtab === 'input' ? 'active' : ''}" data-subtab="input">
                    📝 거래 입력
                </button>
                <button class="subtab-btn ${subtab === 'list' ? 'active' : ''}" data-subtab="list">
                    📋 거래 내역
                </button>
                <button class="subtab-btn ${subtab === 'cashflow' ? 'active' : ''}" data-subtab="cashflow">
                    💹 현금흐름
                </button>
            </div>

            <!-- 서브탭 컨텐츠 -->
            <div class="subtab-content" id="transactionsSubtabContent">
                ${subtab === 'cashflow' ? createCashflowTab() : subtab === 'list' ? createTransactionsTab() : createInputTab()}
            </div>
        </div>
    `;
}

function createInputTab() {
    return `
        <div class="date-filter">
            <label>기간:</label>
            <button class="date-filter-btn active" data-filter="all">전체</button>
            <button class="date-filter-btn" data-filter="thisWeek">이번 주</button>
            <button class="date-filter-btn" data-filter="thisMonth">이번 달</button>
            <button class="date-filter-btn" data-filter="lastMonth">지난 달</button>
        </div>

        <div class="summary">
            <div class="summary-card income">
                <h3>총 수입</h3>
                <div class="amount" id="totalIncome">0원</div>
            </div>
            <div class="summary-card expense">
                <h3>총 지출</h3>
                <div class="amount" id="totalExpense">0원</div>
            </div>
            <div class="summary-card">
                <h3>순수익</h3>
                <div class="amount" id="netProfit">0원</div>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <h4>📊 총 거래 건수</h4>
                <div class="stat-value" id="totalTransactions">0</div>
            </div>
            <div class="stat-card">
                <h4>💰 평균 수입</h4>
                <div class="stat-value" id="avgIncome">0원</div>
            </div>
            <div class="stat-card">
                <h4>🎯 최고 수익 분류</h4>
                <div class="stat-value" id="topCategory" style="font-size:1.1em;">-</div>
            </div>
            <div class="stat-card">
                <h4>📅 최근 거래일</h4>
                <div class="stat-value" id="lastTransactionDate" style="font-size:1em;">-</div>
            </div>
        </div>

        <!-- 기간별 지출 요약 -->
        <div class="period-summary">
            <h3 class="period-summary-title">📊 기간별 지출</h3>
            <div class="period-cards">
                <div class="period-card">
                    <div class="period-label">오늘</div>
                    <div class="period-amount" id="periodToday">0원</div>
                    <div class="period-count" id="periodTodayCount">0건</div>
                </div>
                <div class="period-card">
                    <div class="period-label">이번 주</div>
                    <div class="period-amount" id="periodWeek">0원</div>
                    <div class="period-count" id="periodWeekCount">0건</div>
                </div>
                <div class="period-card">
                    <div class="period-label">이번 달</div>
                    <div class="period-amount" id="periodMonth">0원</div>
                    <div class="period-count" id="periodMonthCount">0건</div>
                </div>
            </div>
        </div>

        <!-- 최근 거래 5건 -->
        <div class="recent-transactions-widget">
            <h3>🕐 최근 거래</h3>
            <div id="recentTransactionsList" class="recent-list"></div>
        </div>

        <div class="input-section">
            <div class="edit-mode-banner" id="editModeBanner" style="display: none;">
                ✏️ 수정 모드 - 거래를 수정하고 있습니다
                <button class="btn btn-secondary" id="cancelEditBtn" style="margin-left:15px;">취소</button>
            </div>

            <h2 id="formTitle">거래 추가</h2>
            <div class="form-group">
                <div>
                    <label>유형</label>
                    <select id="type">
                        <option value="income">수입</option>
                        <option value="expense">지출</option>
                    </select>
                </div>
                <div>
                    <label>분류</label>
                    <select id="category">
                        <optgroup label="수입" id="incomeCategoryGroup">
                            ${INCOME_CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                        </optgroup>
                        <optgroup label="지출" id="expenseCategoryGroup">
                            ${EXPENSE_CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                        </optgroup>
                    </select>
                </div>
                <div>
                    <label>날짜</label>
                    <input type="date" id="date" value="${getToday()}">
                </div>
            </div>

            <div class="form-group">
                <div>
                    <label>금액 (원)</label>
                    <input type="number" id="amount" placeholder="0" step="1000">
                </div>
                <div>
                    <label>보관처</label>
                    <select id="account">
                        <option value="web3">Web3 지갑</option>
                        <option value="investment">투자</option>
                        <option value="bank">은행</option>
                        <option value="family">가족 대출</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <div style="grid-column: 1 / -1;">
                    <label>제목 (핵심 타이틀)</label>
                    <input type="text" id="title" placeholder="예: Arbitrum 에어드랍">
                </div>
            </div>
            <div class="form-group">
                <div style="grid-column: 1 / -1;">
                    <label>상세 설명</label>
                    <input type="text" id="description" placeholder="상세한 내용을 입력하세요 (선택사항)">
                </div>
            </div>
            <button class="btn" id="submitBtn">거래 추가</button>
        </div>

        <div class="category-breakdown">
            <h2>📊 분류별 수입 분석</h2>
            <div class="category-grid" id="categoryBreakdown"></div>
        </div>

        <!-- 차트 섹션 -->
        <div class="charts-grid">
            <div class="chart-card">
                <h2 class="card-title">📊 수입 분류 분포</h2>
                <div class="chart-container small">
                    <canvas id="incomePieChart"></canvas>
                </div>
            </div>

            <div class="chart-card">
                <h2 class="card-title">💸 지출 분류 분포</h2>
                <div class="chart-container small">
                    <canvas id="expensePieChart"></canvas>
                </div>
            </div>
        </div>
    `;
}

export async function initDashboardTab(refreshCallback, subtab = 'input') {
    // 서브탭 전환 이벤트
    document.querySelectorAll('.subtab-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const newSubtab = btn.dataset.subtab;
            if (newSubtab === currentSubTab) return;

            // 버튼 활성화 상태 변경
            document.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 서브탭 컨텐츠 교체
            const contentContainer = document.getElementById('transactionsSubtabContent');
            if (contentContainer) {
                currentSubTab = newSubtab;
                if (newSubtab === 'cashflow') {
                    contentContainer.innerHTML = createCashflowTab();
                    await initCashflowTab();
                } else if (newSubtab === 'list') {
                    contentContainer.innerHTML = createTransactionsTab();
                    await initTransactionsTab(null, (transaction) => {
                        // 수정 클릭 → 입력 서브탭으로 전환 후 폼 채우기
                        switchToInputSubtab(transaction);
                    });
                } else {
                    contentContainer.innerHTML = createInputTab();
                    await initInputTab(refreshCallback);
                }
            }
        });
    });

    // 현재 서브탭 초기화
    if (subtab === 'cashflow' || currentSubTab === 'cashflow') {
        await initCashflowTab();
    } else if (subtab === 'list' || currentSubTab === 'list') {
        await initTransactionsTab(null, (transaction) => {
            switchToInputSubtab(transaction);
        });
    } else {
        await initInputTab(refreshCallback);
    }

    // 저장된 refreshCallback
    window._dashboardRefreshCallback = refreshCallback;
}

async function initInputTab(refreshCallback) {
    // 데이터 로드
    await loadDashboardData();

    // 날짜 필터 버튼
    document.querySelectorAll('.date-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.date-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDateFilter = btn.dataset.filter;
            updateDashboardDisplay();
        });
    });

    // 유형 변경 시 카테고리 필터링
    const typeSelect = document.getElementById('type');
    if (typeSelect) {
        typeSelect.addEventListener('change', updateCategoryOptions);
    }

    // 거래 추가/수정 폼 제출
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmit);
    }

    // 수정 취소
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelEdit);
    }
}

async function loadDashboardData() {
    try {
        const result = await getTransactions();
        if (!result.success) {
            console.error('거래 데이터 로드 실패:', result.error);
            return;
        }
        transactions = result.data || [];
        updateDashboardDisplay();
    } catch (error) {
        console.error('대시보드 데이터 로드 에러:', error);
    }
}

function updateDashboardDisplay() {
    // 요약 통계
    const totalIncome = calculateTotalIncome(transactions, currentDateFilter);
    const totalExpense = calculateTotalExpense(transactions, currentDateFilter);
    const netProfit = calculateNetIncome(transactions, currentDateFilter);
    const totalCount = countTransactions(transactions, currentDateFilter);
    const avgIncome = calculateAverageIncome(transactions, currentDateFilter);
    const lastDate = getLastTransactionDate(transactions);
    const topCategories = aggregateByCategory(transactions, 'income', currentDateFilter);

    document.getElementById('totalIncome').textContent = formatAmount(totalIncome);
    document.getElementById('totalExpense').textContent = formatAmount(totalExpense);
    document.getElementById('netProfit').textContent = formatAmount(netProfit);
    document.getElementById('totalTransactions').textContent = totalCount;
    document.getElementById('avgIncome').textContent = formatAmount(avgIncome);
    document.getElementById('lastTransactionDate').textContent = lastDate ? formatDate(lastDate) : '-';
    document.getElementById('topCategory').textContent = topCategories.length > 0 ? topCategories[0].category : '-';

    // 기간별 지출 요약
    updatePeriodSummary();

    // 최근 거래 5건
    updateRecentTransactions();

    // 카테고리 분석
    updateCategoryBreakdown();

    // 차트 업데이트
    updatePieCharts();
}

function updatePeriodSummary() {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const weekStr = startOfWeek.toISOString().split('T')[0];
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // 지출만 필터링
    const expenses = transactions.filter(t => t.type === 'expense');

    const todayExpenses = expenses.filter(t => t.date === todayStr);
    const weekExpenses = expenses.filter(t => t.date >= weekStr);
    const monthExpenses = expenses.filter(t => t.date && t.date.startsWith(monthStr));

    const todaySum = todayExpenses.reduce((s, t) => s + (t.amount || 0), 0);
    const weekSum = weekExpenses.reduce((s, t) => s + (t.amount || 0), 0);
    const monthSum = monthExpenses.reduce((s, t) => s + (t.amount || 0), 0);

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('periodToday', formatAmount(todaySum));
    setEl('periodTodayCount', `${todayExpenses.length}건`);
    setEl('periodWeek', formatAmount(weekSum));
    setEl('periodWeekCount', `${weekExpenses.length}건`);
    setEl('periodMonth', formatAmount(monthSum));
    setEl('periodMonthCount', `${monthExpenses.length}건`);
}

function updateRecentTransactions() {
    const list = document.getElementById('recentTransactionsList');
    if (!list) return;

    // 최근 5건 (날짜 내림차순)
    const sorted = [...transactions].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const recent = sorted.slice(0, 5);

    if (recent.length === 0) {
        list.innerHTML = '<div class="empty-state">거래 내역이 없습니다</div>';
        return;
    }

    list.innerHTML = recent.map(t => {
        const isIncome = t.type === 'income';
        const sign = isIncome ? '+' : '-';
        const cls = isIncome ? 'positive' : 'negative';
        return `
            <div class="recent-tx-item">
                <div class="recent-tx-left">
                    <span class="recent-tx-category">${t.category || ''}</span>
                    <span class="recent-tx-title">${t.title || ''}</span>
                </div>
                <div class="recent-tx-right">
                    <span class="recent-tx-amount ${cls}">${sign}${formatAmount(t.amount)}</span>
                    <span class="recent-tx-date">${t.date || ''}</span>
                </div>
                <div class="recent-tx-actions">
                    <button class="recent-tx-edit-btn" data-id="${t.id}" title="수정">✏️</button>
                    <button class="recent-tx-delete-btn" data-id="${t.id}" title="삭제">🗑️</button>
                </div>
            </div>
        `;
    }).join('');

    // 최근 거래 수정/삭제 이벤트
    addRecentTxEventListeners();
}

// 최근 거래 위젯의 수정/삭제 이벤트 리스너
function addRecentTxEventListeners() {
    // 수정 버튼
    document.querySelectorAll('.recent-tx-edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const tx = transactions.find(t => t.id === id);
            if (tx) {
                editTransaction(tx);
            }
        });
    });

    // 삭제 버튼
    document.querySelectorAll('.recent-tx-delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (confirm('정말 삭제하시겠습니까?')) {
                const result = await deleteTransaction(id);
                if (result.success) {
                    alert('거래가 삭제되었습니다.');
                    await loadDashboardData();
                    if (window._dashboardRefreshCallback) {
                        window._dashboardRefreshCallback();
                    }
                } else {
                    alert(`삭제 실패: ${result.error}`);
                }
            }
        });
    });
}

function updateCategoryBreakdown() {
    const incomeByCategory = aggregateByCategory(transactions, 'income', currentDateFilter);
    const totalIncome = calculateTotalIncome(transactions, currentDateFilter);

    const breakdownEl = document.getElementById('categoryBreakdown');
    if (!breakdownEl) return;

    breakdownEl.innerHTML = incomeByCategory.length > 0
        ? incomeByCategory.map(item => {
            const percent = totalIncome > 0 ? ((item.amount / totalIncome) * 100).toFixed(1) : 0;
            return `
                <div class="category-item">
                    <div class="category-name">${item.category}</div>
                    <div class="category-amount">${formatAmount(item.amount)}</div>
                    <div class="category-bar">
                        <div class="category-bar-fill" style="width: ${percent}%"></div>
                    </div>
                    <div class="category-percent">${percent}%</div>
                </div>
            `;
        }).join('')
        : '<div class="empty-state">수입 데이터가 없습니다</div>';
}

function updatePieCharts() {
    const incomeData = aggregateByCategory(transactions, 'income', currentDateFilter);
    const expenseData = aggregateByCategory(transactions, 'expense', currentDateFilter);

    // 수입 파이 차트
    const incomeCtx = document.getElementById('incomePieChart');
    if (incomeCtx) {
        if (incomePieChart) incomePieChart.destroy();

        incomePieChart = new Chart(incomeCtx, {
            type: 'doughnut',
            data: {
                labels: incomeData.map(d => d.category),
                datasets: [{
                    data: incomeData.map(d => d.amount),
                    backgroundColor: [
                        '#48BB78', '#38A169', '#2F855A', '#276749',
                        '#68D391', '#9AE6B4', '#C6F6D5', '#F0FFF4'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: 'rgba(255, 255, 255, 0.8)' }
                    }
                }
            }
        });
    }

    // 지출 파이 차트
    const expenseCtx = document.getElementById('expensePieChart');
    if (expenseCtx) {
        if (expensePieChart) expensePieChart.destroy();

        expensePieChart = new Chart(expenseCtx, {
            type: 'doughnut',
            data: {
                labels: expenseData.map(d => d.category),
                datasets: [{
                    data: expenseData.map(d => d.amount),
                    backgroundColor: [
                        '#F56565', '#E53E3E', '#C53030', '#9B2C2C',
                        '#FC8181', '#FEB2B2', '#FED7D7', '#FFF5F5'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: 'rgba(255, 255, 255, 0.8)' }
                    }
                }
            }
        });
    }
}

function updateCategoryOptions() {
    const type = document.getElementById('type').value;
    const categorySelect = document.getElementById('category');
    const incomeGroup = document.getElementById('incomeCategoryGroup');
    const expenseGroup = document.getElementById('expenseCategoryGroup');

    if (type === 'income') {
        incomeGroup.style.display = '';
        expenseGroup.style.display = 'none';
        categorySelect.value = INCOME_CATEGORIES[0];
    } else {
        incomeGroup.style.display = 'none';
        expenseGroup.style.display = '';
        categorySelect.value = EXPENSE_CATEGORIES[0];
    }
}

async function handleSubmit() {
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const amount = parseInt(document.getElementById('amount').value) || 0;
    const account = document.getElementById('account').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;

    if (!amount || amount <= 0) {
        alert('금액을 입력해주세요.');
        return;
    }

    if (!title) {
        alert('제목을 입력해주세요.');
        return;
    }

    // 보관처 라벨 매핑 (UUID 오류 방지 - description에 추가)
    const accountLabels = {
        'web3': 'Web3 지갑', 'investment': '투자',
        'bank': '은행', 'family': '가족 대출'
    };
    const accountLabel = accountLabels[account] || account;

    const transactionData = {
        type,
        category,
        date,
        amount,
        title,
        description: description
            ? `${description} [${accountLabel}]`
            : `[${accountLabel}]`
    };

    try {
        let result;
        if (editingTransactionId) {
            result = await updateTransaction(editingTransactionId, transactionData);
            if (result.success) {
                alert('거래가 수정되었습니다.');
                cancelEdit();
            }
        } else {
            result = await createTransaction(transactionData);
            if (result.success) {
                alert('거래가 추가되었습니다.');
                clearForm();
            }
        }

        if (result.success) {
            await loadDashboardData();
            if (window._dashboardRefreshCallback) {
                window._dashboardRefreshCallback();
            }
        } else {
            alert(`오류: ${result.error}`);
        }
    } catch (error) {
        console.error('거래 저장 에러:', error);
        alert('거래 저장에 실패했습니다.');
    }
}

function clearForm() {
    document.getElementById('type').value = 'income';
    document.getElementById('category').value = INCOME_CATEGORIES[0];
    document.getElementById('date').value = getToday();
    document.getElementById('amount').value = '';
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('account').value = 'web3';
    updateCategoryOptions();
}

function cancelEdit() {
    editingTransactionId = null;
    document.getElementById('editModeBanner').style.display = 'none';
    document.getElementById('formTitle').textContent = '거래 추가';
    document.getElementById('submitBtn').textContent = '거래 추가';
    clearForm();
}

// 거래 내역 서브탭에서 수정 클릭 → 입력 서브탭으로 전환
async function switchToInputSubtab(transactionToEdit) {
    const contentContainer = document.getElementById('transactionsSubtabContent');
    if (!contentContainer) return;

    // 서브탭 버튼 상태 변경
    currentSubTab = 'input';
    document.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
    const inputBtn = document.querySelector('[data-subtab="input"]');
    if (inputBtn) inputBtn.classList.add('active');

    // 입력 탭 렌더링 후 수정 모드 활성화
    contentContainer.innerHTML = createInputTab();
    await initInputTab(window._dashboardRefreshCallback);
    editTransaction(transactionToEdit);
}

// 외부에서 수정 모드로 진입할 때 사용
export function editTransaction(transaction) {
    editingTransactionId = transaction.id;
    document.getElementById('editModeBanner').style.display = 'flex';
    document.getElementById('formTitle').textContent = '거래 수정';
    document.getElementById('submitBtn').textContent = '저장';

    document.getElementById('type').value = transaction.type;
    updateCategoryOptions();
    document.getElementById('category').value = transaction.category;
    document.getElementById('date').value = transaction.date;
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('title').value = transaction.title || '';
    document.getElementById('description').value = transaction.description || '';
    document.getElementById('account').value = transaction.account_from || transaction.account_to || 'web3';

    // 폼으로 스크롤
    document.querySelector('.input-section').scrollIntoView({ behavior: 'smooth' });
}
