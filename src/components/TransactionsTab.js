import { getTransactions, deleteTransaction, createTransaction } from '../services/database.js';
import { formatAmount, formatDate, createEmptyState, EMPTY_STATES, showToast } from '../utils/helpers.js';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/constants.js';

let transactions = [];
let filteredTransactions = [];

// 페이지네이션 상태
const ITEMS_PER_PAGE = 20;
let currentPage = 1;

export function createTransactionsTab() {
    const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

    // 날짜 기본값 설정 (이번 달)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = today.toISOString().split('T')[0];

    return `
        <div class="transactions">
            <h2>거래 내역</h2>

            <div class="action-buttons">
                <button class="btn btn-primary" id="importNavigatorBtn">📤 Navigator 수익 가져오기</button>
                <button class="btn btn-secondary" id="exportCSVBtn">📥 CSV로 내보내기</button>
                <button class="btn btn-secondary" id="clearAllDataBtn">🗑️ 전체 데이터 삭제</button>
            </div>

            <!-- 날짜 범위 필터 -->
            <div class="date-range-filter">
                <div class="date-range-presets">
                    <button class="date-preset-btn active" data-preset="all">전체</button>
                    <button class="date-preset-btn" data-preset="today">오늘</button>
                    <button class="date-preset-btn" data-preset="week">최근 7일</button>
                    <button class="date-preset-btn" data-preset="month">이번 달</button>
                    <button class="date-preset-btn" data-preset="lastMonth">지난 달</button>
                    <button class="date-preset-btn" data-preset="custom">직접 선택</button>
                </div>
                <div class="date-range-custom" id="customDateRange" style="display: none;">
                    <input type="date" id="filterDateStart" value="${firstDay}">
                    <span>~</span>
                    <input type="date" id="filterDateEnd" value="${lastDay}">
                    <button class="btn btn-secondary" id="applyDateRange">적용</button>
                </div>
            </div>

            <div class="filter-section">
                <div class="filter-row">
                    <div class="filter-group">
                        <label>유형</label>
                        <select id="filterType">
                            <option value="all">전체</option>
                            <option value="income">수입만</option>
                            <option value="expense">지출만</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>분류</label>
                        <select id="filterCategory">
                            <option value="all">모든 분류</option>
                            ${allCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                        </select>
                    </div>
                    <div class="filter-group search-group">
                        <label>검색</label>
                        <input type="text" id="searchInput" placeholder="🔍 제목, 설명 검색...">
                    </div>
                </div>
                <div class="filter-row">
                    <div class="filter-group amount-range">
                        <label>금액 범위</label>
                        <div class="amount-inputs">
                            <input type="number" id="filterAmountMin" placeholder="최소">
                            <span class="range-separator">~</span>
                            <input type="number" id="filterAmountMax" placeholder="최대">
                        </div>
                    </div>
                    <div class="filter-group">
                        <button class="btn btn-secondary btn-sm" id="resetFiltersBtn">🔄 필터 초기화</button>
                    </div>
                </div>
            </div>

            <!-- 결과 요약 -->
            <div class="filter-summary" id="filterSummary">
                총 0건 | 수입: 0원 | 지출: 0원 | 순수익: 0원
            </div>

            <div class="transaction-list" id="transactionList">
                <div class="loading">거래 내역을 불러오는 중...</div>
            </div>

            <!-- 페이지네이션 -->
            <div class="pagination" id="pagination"></div>
        </div>
    `;
}

export async function initTransactionsTab(switchTabCallback, editTransactionCallback) {
    // 데이터 로드
    await loadTransactionsData();

    // 필터 이벤트
    document.getElementById('filterType').addEventListener('change', () => {
        currentPage = 1;
        filterTransactions();
    });
    document.getElementById('filterCategory').addEventListener('change', () => {
        currentPage = 1;
        filterTransactions();
    });
    document.getElementById('searchInput').addEventListener('input', () => {
        currentPage = 1;
        filterTransactions();
    });

    // 금액 범위 필터
    document.getElementById('filterAmountMin').addEventListener('change', () => {
        currentPage = 1;
        filterTransactions();
    });
    document.getElementById('filterAmountMax').addEventListener('change', () => {
        currentPage = 1;
        filterTransactions();
    });

    // 필터 초기화
    document.getElementById('resetFiltersBtn').addEventListener('click', resetFilters);

    // 날짜 범위 프리셋 버튼
    document.querySelectorAll('.date-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.date-preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const preset = btn.dataset.preset;
            const customRange = document.getElementById('customDateRange');

            if (preset === 'custom') {
                customRange.style.display = 'flex';
            } else {
                customRange.style.display = 'none';
                applyDatePreset(preset);
            }
        });
    });

    // 직접 선택 날짜 적용
    document.getElementById('applyDateRange').addEventListener('click', () => {
        currentPage = 1;
        filterTransactions();
    });

    // Navigator 수익 가져오기
    document.getElementById('importNavigatorBtn').addEventListener('click', importNavigatorData);

    // CSV 내보내기
    document.getElementById('exportCSVBtn').addEventListener('click', exportToCSV);

    // 전체 삭제
    document.getElementById('clearAllDataBtn').addEventListener('click', clearAllData);

    // 콜백 저장
    window._transactionsSwitchTab = switchTabCallback;
    window._transactionsEditCallback = editTransactionCallback;
}

function applyDatePreset(preset) {
    const today = new Date();
    let startDate = null;
    let endDate = new Date(today);

    switch (preset) {
        case 'today':
            startDate = new Date(today);
            break;
        case 'week':
            startDate = new Date(today);
            startDate.setDate(startDate.getDate() - 7);
            break;
        case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
        case 'lastMonth':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
        default: // 'all'
            startDate = null;
            endDate = null;
    }

    if (startDate) {
        document.getElementById('filterDateStart').value = startDate.toISOString().split('T')[0];
    }
    if (endDate) {
        document.getElementById('filterDateEnd').value = endDate.toISOString().split('T')[0];
    }

    window._currentDatePreset = preset;
    currentPage = 1;
    filterTransactions();
}

async function loadTransactionsData() {
    try {
        const result = await getTransactions();
        if (!result.success) {
            console.error('거래 데이터 로드 실패:', result.error);
            document.getElementById('transactionList').innerHTML =
                '<div class="error-state">데이터를 불러올 수 없습니다.</div>';
            return;
        }
        transactions = result.data || [];
        filteredTransactions = [...transactions];
        renderTransactionList();
    } catch (error) {
        console.error('거래 데이터 로드 에러:', error);
    }
}

function resetFilters() {
    // 모든 필터 초기화
    document.getElementById('filterType').value = 'all';
    document.getElementById('filterCategory').value = 'all';
    document.getElementById('searchInput').value = '';
    document.getElementById('filterAmountMin').value = '';
    document.getElementById('filterAmountMax').value = '';

    // 날짜 프리셋 초기화
    document.querySelectorAll('.date-preset-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.preset === 'all') btn.classList.add('active');
    });
    document.getElementById('customDateRange').style.display = 'none';
    window._currentDatePreset = 'all';

    currentPage = 1;
    filterTransactions();
}

function filterTransactions() {
    const typeFilter = document.getElementById('filterType').value;
    const categoryFilter = document.getElementById('filterCategory').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const datePreset = window._currentDatePreset || 'all';
    const amountMin = parseInt(document.getElementById('filterAmountMin').value) || 0;
    const amountMax = parseInt(document.getElementById('filterAmountMax').value) || Infinity;

    // 날짜 범위
    let startDate = null;
    let endDate = null;

    if (datePreset !== 'all') {
        startDate = document.getElementById('filterDateStart').value;
        endDate = document.getElementById('filterDateEnd').value;
    }

    filteredTransactions = transactions.filter(t => {
        // 유형 필터
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;

        // 카테고리 필터
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

        // 날짜 범위 필터
        if (startDate && t.date < startDate) return false;
        if (endDate && t.date > endDate) return false;

        // 금액 범위 필터
        if (t.amount < amountMin) return false;
        if (t.amount > amountMax) return false;

        // 검색어 필터
        if (searchQuery) {
            const titleMatch = (t.title || '').toLowerCase().includes(searchQuery);
            const descMatch = (t.description || '').toLowerCase().includes(searchQuery);
            const categoryMatch = (t.category || '').toLowerCase().includes(searchQuery);
            if (!titleMatch && !descMatch && !categoryMatch) return false;
        }

        return true;
    });

    // 필터 요약 업데이트
    updateFilterSummary();

    renderTransactionList();
}

function updateFilterSummary() {
    const summaryEl = document.getElementById('filterSummary');
    const totalCount = filteredTransactions.length;
    const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpense;

    summaryEl.innerHTML = `
        총 <strong>${totalCount}건</strong> |
        수입: <span class="income-color">${formatAmount(totalIncome)}</span> |
        지출: <span class="expense-color">${formatAmount(totalExpense)}</span> |
        순수익: <span class="${netProfit >= 0 ? 'income-color' : 'expense-color'}">${netProfit >= 0 ? '+' : ''}${formatAmount(netProfit)}</span>
    `;
}

function renderTransactionList() {
    const listEl = document.getElementById('transactionList');
    const paginationEl = document.getElementById('pagination');

    if (filteredTransactions.length === 0) {
        listEl.innerHTML = createEmptyState({
            ...EMPTY_STATES.transactions,
            actionId: 'emptyAddTransaction'
        });
        paginationEl.innerHTML = '';
        // 빈 상태 버튼 이벤트
        document.getElementById('emptyAddTransaction')?.addEventListener('click', () => {
            document.getElementById('addTransactionBtn')?.click();
        });
        return;
    }

    // 페이지네이션 계산
    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageTransactions = filteredTransactions.slice(startIndex, endIndex);

    // 날짜별 그룹화
    const groupedByDate = {};
    pageTransactions.forEach(t => {
        const date = t.date;
        if (!groupedByDate[date]) {
            groupedByDate[date] = [];
        }
        groupedByDate[date].push(t);
    });

    // 날짜순 정렬 (최신순)
    const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));

    listEl.innerHTML = sortedDates.map(date => `
        <div class="transaction-date-group">
            <div class="transaction-date-header">${formatDate(date)}</div>
            ${groupedByDate[date].map(t => createTransactionItemHTML(t)).join('')}
        </div>
    `).join('');

    // 페이지네이션 렌더링
    renderPagination(totalPages);

    // 이벤트 리스너 추가
    addTransactionEventListeners();
}

function renderPagination(totalPages) {
    const paginationEl = document.getElementById('pagination');

    if (totalPages <= 1) {
        paginationEl.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // 이전 버튼
    paginationHTML += `
        <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}"
                data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
            ◀ 이전
        </button>
    `;

    // 페이지 번호
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" data-page="1">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`;
    }

    // 다음 버튼
    paginationHTML += `
        <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}"
                data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
            다음 ▶
        </button>
    `;

    paginationEl.innerHTML = paginationHTML;

    // 페이지네이션 버튼 이벤트
    paginationEl.querySelectorAll('.pagination-btn:not(.disabled)').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = parseInt(btn.dataset.page);
            if (page >= 1 && page <= totalPages) {
                currentPage = page;
                renderTransactionList();
                // 스크롤 위로
                document.getElementById('transactionList').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function createTransactionItemHTML(transaction) {
    const isIncome = transaction.type === 'income';

    return `
        <div class="transaction-item" data-id="${transaction.id}">
            <div class="transaction-icon ${isIncome ? 'income' : 'expense'}">
                ${isIncome ? '💰' : '💸'}
            </div>
            <div class="transaction-info">
                <div class="transaction-title">${transaction.title || transaction.category}</div>
                <div class="transaction-category">${transaction.category}</div>
                ${transaction.description ? `<div class="transaction-desc">${transaction.description}</div>` : ''}
            </div>
            <div class="transaction-amount ${isIncome ? 'income' : 'expense'}">
                ${isIncome ? '+' : '-'}${formatAmount(transaction.amount)}
            </div>
            <div class="transaction-actions">
                <button class="transaction-edit-btn" data-id="${transaction.id}" title="수정">✏️</button>
                <button class="transaction-delete-btn" data-id="${transaction.id}" title="삭제">🗑️</button>
            </div>
        </div>
    `;
}

function addTransactionEventListeners() {
    // 수정 버튼
    document.querySelectorAll('.transaction-edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const transaction = transactions.find(t => t.id === id);
            if (transaction && window._transactionsEditCallback) {
                // 대시보드 탭으로 이동하면서 수정 모드
                if (window._transactionsSwitchTab) {
                    window._transactionsSwitchTab('dashboard');
                }
                setTimeout(() => {
                    window._transactionsEditCallback(transaction);
                }, 100);
            }
        });
    });

    // 삭제 버튼
    document.querySelectorAll('.transaction-delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (confirm('정말 삭제하시겠습니까?')) {
                const result = await deleteTransaction(id);
                if (result.success) {
                    showToast('거래가 삭제되었습니다', 'success');
                    await loadTransactionsData();
                } else {
                    showToast('삭제에 실패했습니다', 'error');
                }
            }
        });
    });
}

async function exportToCSV() {
    if (transactions.length === 0) {
        alert('내보낼 데이터가 없습니다.');
        return;
    }

    const headers = ['날짜', '유형', '분류', '금액', '제목', '설명'];
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
}

async function clearAllData() {
    if (!confirm('정말로 모든 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
        return;
    }

    if (!confirm('마지막 확인: 정말 삭제하시겠습니까?')) {
        return;
    }

    try {
        // 모든 거래 삭제
        for (const t of transactions) {
            await deleteTransaction(t.id);
        }

        alert('모든 데이터가 삭제되었습니다.');
        await loadTransactionsData();
    } catch (error) {
        console.error('데이터 삭제 에러:', error);
        alert('데이터 삭제 중 오류가 발생했습니다.');
    }
}

/**
 * Navigator 수익 데이터 가져오기
 * 클립보드에서 JSON 데이터를 읽어 거래로 추가
 */
async function importNavigatorData() {
    try {
        // 클립보드에서 읽기
        const clipboardText = await navigator.clipboard.readText();

        if (!clipboardText) {
            showToast('클립보드가 비어있습니다.\nNavigator에서 "자산관리로 내보내기" 버튼을 먼저 클릭하세요.', 'warning');
            return;
        }

        let importData;
        try {
            importData = JSON.parse(clipboardText);
        } catch {
            showToast('클립보드 데이터가 올바른 형식이 아닙니다.', 'error');
            return;
        }

        // Navigator 데이터인지 확인
        if (importData.source !== 'navigator' || !importData.transactions) {
            showToast('Navigator 수익 데이터가 아닙니다.', 'error');
            return;
        }

        const importTransactions = importData.transactions;

        if (importTransactions.length === 0) {
            showToast('가져올 수익 데이터가 없습니다.', 'warning');
            return;
        }

        // 확인 대화상자
        const confirmMsg = `Navigator에서 ${importTransactions.length}개의 수익 데이터를 가져옵니다.\n` +
            `총 금액: ${importData.summary.totalRevenue.toLocaleString()}원\n\n` +
            `계속하시겠습니까?`;

        if (!confirm(confirmMsg)) {
            return;
        }

        // 거래 추가
        let successCount = 0;
        let failCount = 0;

        for (const t of importTransactions) {
            const transactionData = {
                type: t.type || 'income',
                category: t.category || '기타수입',
                amount: t.amount,
                title: t.title,
                description: t.description || '',
                date: t.date,
                tags: t.tags || []
            };

            const result = await createTransaction(transactionData);
            if (result.success) {
                successCount++;
            } else {
                failCount++;
            }
        }

        if (successCount > 0) {
            showToast(`${successCount}개 수익이 추가되었습니다.` +
                (failCount > 0 ? ` (${failCount}개 실패)` : ''), 'success');
            await loadTransactionsData();
        } else {
            showToast('수익 추가에 실패했습니다.', 'error');
        }

    } catch (error) {
        console.error('Navigator 데이터 가져오기 에러:', error);

        if (error.name === 'NotAllowedError') {
            showToast('클립보드 접근이 거부되었습니다.\n브라우저 설정에서 권한을 허용해주세요.', 'error');
        } else {
            showToast('데이터 가져오기 중 오류가 발생했습니다.', 'error');
        }
    }
}

// 외부에서 데이터 새로고침 시 사용
export async function refreshTransactions() {
    await loadTransactionsData();
}
