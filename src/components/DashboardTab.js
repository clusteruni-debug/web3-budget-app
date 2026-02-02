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

let transactions = [];
let currentDateFilter = 'all';
let editingTransactionId = null;
let incomePieChart = null;
let expensePieChart = null;

export function createDashboardTab() {
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

export async function initDashboardTab(refreshCallback) {
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
    document.getElementById('type').addEventListener('change', updateCategoryOptions);

    // 거래 추가/수정 폼 제출
    document.getElementById('submitBtn').addEventListener('click', handleSubmit);

    // 수정 취소
    document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);

    // 저장된 refreshCallback
    window._dashboardRefreshCallback = refreshCallback;
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

    // 카테고리 분석
    updateCategoryBreakdown();

    // 차트 업데이트
    updatePieCharts();
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
                    legend: { position: 'bottom' }
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
                    legend: { position: 'bottom' }
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

    const transactionData = {
        type,
        category,
        date,
        amount,
        title,
        description,
        account_from: type === 'expense' ? account : null,
        account_to: type === 'income' ? account : null
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
