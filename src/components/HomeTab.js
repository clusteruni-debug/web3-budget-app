// V2: 통합 자산 관리 홈 대시보드
import { getTransactions, calculateNetWorth, getAssets, getDebts, getStakingOverview, getAirdropOverview, saveNetWorthSnapshot, getNetWorthHistory, getBudgetVsActual, getRecurringItems, createTransaction } from '../services/database.js';
import { calculateTotalIncome, calculateTotalExpense } from '../services/analytics.js';
import { formatAmount, formatAmountShort, exportAssetsToCSV, exportDebtsToCSV, exportTransactionsToCSV, exportNetWorthHistoryToCSV, exportAllDataToJSON, showToast, parseTransactionText, loadNotificationSettings, notifyBudgetExceeded, notifyPaymentDue, notifyStakingUnlock, notifyAirdropClaimable, getNotificationPermission } from '../utils/helpers.js';
import { ASSET_CATEGORY_INFO, CRYPTO_TYPE_INFO, GOALS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants.js';

let netWorthData = null;
let assets = [];
let debts = [];
let stakingList = [];
let airdropList = [];
let netWorthChart = null;
let budgetData = null;
let recurringItems = [];
let switchTabCallbackRef = null; // 탭 전환 콜백 저장
let netWorthHistory = []; // 순자산 히스토리
let transactions = []; // 거래 내역

export function createHomeTab() {
    return `
        <div class="home-container v2">
            <!-- 긴급 알림 배너 -->
            <div class="alert-banners" id="alertBanners">
                <!-- 동적으로 채워짐 -->
            </div>

            <!-- 순자산 히어로 섹션 (개선) -->
            <div class="net-worth-hero">
                <div class="net-worth-label">💰 총 순자산</div>
                <div class="net-worth-value" id="netWorthValue">0원</div>
                <div class="net-worth-change" id="netWorthChange">
                    <span class="change-icon">-</span>
                    <span class="change-value">0원</span>
                    <span class="change-percent">(0%)</span>
                    <span class="change-period">지난달 대비</span>
                </div>
                <div class="net-worth-breakdown">
                    <span class="assets-total">자산 <span id="totalAssetsValue">0원</span></span>
                    <span class="separator">-</span>
                    <span class="debts-total">부채 <span id="totalDebtsValue">0원</span></span>
                </div>
            </div>

            <!-- 월간 요약 카드 (수입/지출/저축) -->
            <div class="monthly-summary-cards">
                <div class="summary-card income">
                    <div class="summary-icon">📈</div>
                    <div class="summary-info">
                        <div class="summary-label">이번 달 수입</div>
                        <div class="summary-value" id="monthlyIncome">0원</div>
                    </div>
                </div>
                <div class="summary-card expense">
                    <div class="summary-icon">📉</div>
                    <div class="summary-info">
                        <div class="summary-label">이번 달 지출</div>
                        <div class="summary-value" id="monthlyExpense">0원</div>
                    </div>
                </div>
                <div class="summary-card savings">
                    <div class="summary-icon">💵</div>
                    <div class="summary-info">
                        <div class="summary-label">순 저축</div>
                        <div class="summary-value" id="monthlySavings">0원</div>
                    </div>
                </div>
            </div>

            <!-- 인사이트 카드 -->
            <div class="insight-cards" id="insightCards">
                <!-- 동적으로 채워짐 -->
            </div>

            <!-- 목표 진행률 -->
            <div class="goal-progress-card">
                <div class="goal-header">
                    <span class="goal-icon">🎯</span>
                    <span class="goal-title">목표: ${formatAmount(GOALS.MAIN_QUEST)}</span>
                    <span class="goal-percent" id="goalPercent">0%</span>
                </div>
                <div class="goal-progress-bar">
                    <div class="goal-progress-fill" id="goalProgressFill" style="width: 0%"></div>
                </div>
                <div class="goal-remaining" id="goalRemaining">목표까지 0원 남음</div>
            </div>

            <!-- 핵심 액션: 거래 추가 -->
            <button class="cta-add-transaction" id="ctaAddTransaction">
                <span class="cta-icon">💸</span>
                <span class="cta-text">거래 추가하기</span>
            </button>

            <!-- 바로가기 (네비게이션) -->
            <div class="shortcut-cards">
                <div class="shortcut-card" data-action="view-assets">
                    <span class="shortcut-icon">💰</span>
                    <span class="shortcut-label">자산 관리</span>
                </div>
                <div class="shortcut-card" data-action="view-transactions">
                    <span class="shortcut-icon">📋</span>
                    <span class="shortcut-label">거래 내역</span>
                </div>
                <div class="shortcut-card" data-action="view-budget">
                    <span class="shortcut-icon">📊</span>
                    <span class="shortcut-label">예산</span>
                </div>
                <div class="shortcut-card" data-action="view-cashflow">
                    <span class="shortcut-icon">📈</span>
                    <span class="shortcut-label">현금 흐름</span>
                </div>
            </div>

            <!-- 고정 수입/지출 요약 (간단히) -->
            <div class="fixed-summary-card" id="fixedSummaryCard">
                <!-- 동적으로 채워짐 -->
            </div>

            <!-- 플로팅 액션 버튼 (FAB) -->
            <button class="fab" id="fabAddTransaction" title="거래 추가">
                <span class="fab-icon">+</span>
            </button>

            <!-- 빠른 거래 추가 모달 (바텀 시트) -->
            <div class="quick-add-modal" id="quickAddModal" style="display: none;">
                <div class="quick-add-overlay"></div>
                <div class="quick-add-content">
                    <div class="quick-add-header">
                        <h3>빠른 거래 추가</h3>
                        <button class="btn-close-modal" id="quickAddClose">&times;</button>
                    </div>

                    <!-- 스마트 입력 필드 -->
                    <div class="smart-input-group">
                        <label>✨ 스마트 입력</label>
                        <input type="text" id="smartInput" placeholder="예: 커피 4500원, 점심 12000">
                        <div class="smart-input-hint" id="smartInputHint">금액과 내용을 함께 입력하면 자동으로 분류합니다</div>
                    </div>

                    <div class="smart-input-divider">
                        <span>또는 직접 입력</span>
                    </div>

                    <!-- 거래 유형 선택 -->
                    <div class="quick-add-type-tabs">
                        <button class="type-tab active" data-type="expense">💸 지출</button>
                        <button class="type-tab" data-type="income">💰 수입</button>
                    </div>

                    <!-- 금액 입력 -->
                    <div class="amount-input-group">
                        <label>금액</label>
                        <div class="amount-input-wrapper">
                            <span class="currency-symbol">₩</span>
                            <input type="number" id="quickAddAmount" placeholder="0">
                        </div>
                    </div>

                    <!-- 분류 선택 -->
                    <div class="category-select-group">
                        <label>분류</label>
                        <div class="recent-categories" id="recentCategories">
                            <!-- 최근 사용 분류 동적 생성 -->
                        </div>
                        <button class="btn-more-categories" id="btnMoreCategories">더보기 +</button>
                        <div class="all-categories" id="allCategories">
                            <!-- 전체 분류 동적 생성 -->
                        </div>
                    </div>

                    <!-- 설명 입력 -->
                    <div class="description-input-group">
                        <label>설명 (선택)</label>
                        <input type="text" id="quickAddDescription" placeholder="예: 스타벅스 아메리카노">
                    </div>

                    <!-- 저장 버튼 -->
                    <button class="btn-quick-save" id="quickAddSubmit">저장하기</button>
                </div>
            </div>

            <!-- 토스트 컨테이너 -->
            <div class="toast-container" id="toastContainer"></div>
        </div>
    `;
}

export async function initHomeTab(switchTabCallback) {
    switchTabCallbackRef = switchTabCallback; // 콜백 저장
    await loadHomeData();

    // CTA 거래 추가 버튼
    document.getElementById('ctaAddTransaction')?.addEventListener('click', () => {
        openQuickAddModal();
    });

    // 바로가기 카드 이벤트 (네비게이션)
    document.querySelectorAll('.shortcut-card').forEach(card => {
        card.addEventListener('click', () => {
            const action = card.dataset.action;
            switch (action) {
                case 'view-assets':
                    switchTabCallbackRef?.('assets');
                    break;
                case 'view-budget':
                    switchTabCallbackRef?.('tools', 'budget');
                    break;
                case 'view-transactions':
                    switchTabCallbackRef?.('transactions');
                    break;
                case 'view-cashflow':
                    switchTabCallbackRef?.('cashflow');
                    break;
            }
        });
    });

    // FAB (플로팅 액션 버튼) 이벤트
    const fab = document.getElementById('fabAddTransaction');
    const quickAddModal = document.getElementById('quickAddModal');
    const quickAddClose = document.getElementById('quickAddClose');
    const quickAddOverlay = quickAddModal?.querySelector('.quick-add-overlay');

    fab?.addEventListener('click', () => {
        openQuickAddModal();
    });

    quickAddClose?.addEventListener('click', () => {
        closeQuickAddModal();
    });

    quickAddOverlay?.addEventListener('click', () => {
        closeQuickAddModal();
    });

    // 빠른 거래 추가 - 유형 토글
    document.querySelectorAll('.type-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.type-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateQuickAddCategories(btn.dataset.type);
        });
    });

    // 더보기 버튼
    document.getElementById('btnMoreCategories')?.addEventListener('click', () => {
        const allCats = document.getElementById('allCategories');
        if (allCats) {
            allCats.classList.toggle('show');
        }
    });

    // 스마트 입력 - 자연어 파싱
    const smartInput = document.getElementById('smartInput');
    const smartInputHint = document.getElementById('smartInputHint');

    smartInput?.addEventListener('input', (e) => {
        const text = e.target.value;
        if (!text.trim()) {
            smartInputHint.textContent = '금액과 내용을 함께 입력하면 자동으로 분류합니다';
            smartInputHint.classList.remove('parsed');
            return;
        }

        const parsed = parseTransactionText(text);

        // 파싱 결과 미리보기
        const parts = [];
        if (parsed.title) parts.push(parsed.title);
        if (parsed.amount > 0) parts.push(formatAmountShort(parsed.amount));
        if (parsed.category) parts.push(`→ ${parsed.category}`);
        if (parsed.type === 'income') parts.push('(수입)');

        if (parts.length > 0) {
            smartInputHint.textContent = parts.join(' ');
            smartInputHint.classList.add('parsed');
        } else {
            smartInputHint.textContent = '금액과 내용을 함께 입력하면 자동으로 분류합니다';
            smartInputHint.classList.remove('parsed');
        }

        // 자동으로 필드 채우기
        if (parsed.amount > 0) {
            document.getElementById('quickAddAmount').value = parsed.amount;
        }
        if (parsed.title) {
            document.getElementById('quickAddDescription').value = parsed.title;
        }
        if (parsed.type) {
            document.querySelectorAll('.type-tab').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.type === parsed.type);
            });
            updateQuickAddCategories(parsed.type);
        }
        if (parsed.category) {
            // 분류 자동 선택
            setTimeout(() => {
                selectCategoryByName(parsed.category);
            }, 50);
        }
    });

    // Enter 키로 저장
    smartInput?.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            await handleQuickAddSubmit();
        }
    });

    // 빠른 거래 추가 - 저장
    document.getElementById('quickAddSubmit')?.addEventListener('click', async () => {
        await handleQuickAddSubmit();
    });

    // 인사이트 카드 제한 (최대 2개만 표시)
    limitInsightCards(2);

    // 고정 수입/지출 요약 표시
    updateFixedSummary();

    // 알림 체크 (비동기)
    checkAndSendNotifications();
}

// ============================================
// 빠른 거래 추가 (FAB) 관련 함수
// ============================================

let selectedCategory = null;

function openQuickAddModal() {
    const modal = document.getElementById('quickAddModal');
    if (modal) {
        modal.style.display = 'flex';
        // 스마트 입력 필드에 포커스
        const smartInput = document.getElementById('smartInput');
        smartInput?.focus();
        updateQuickAddCategories('expense');
    }
}

function closeQuickAddModal() {
    const modal = document.getElementById('quickAddModal');
    if (modal) {
        modal.style.display = 'none';
        // 폼 초기화
        const smartInput = document.getElementById('smartInput');
        const smartInputHint = document.getElementById('smartInputHint');
        const amountInput = document.getElementById('quickAddAmount');
        const descInput = document.getElementById('quickAddDescription');
        if (smartInput) smartInput.value = '';
        if (smartInputHint) {
            smartInputHint.textContent = '금액과 내용을 함께 입력하면 자동으로 분류합니다';
            smartInputHint.classList.remove('parsed');
        }
        if (amountInput) amountInput.value = '';
        if (descInput) descInput.value = '';
        selectedCategory = null;
        // 분류 선택 초기화
        document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('selected'));
        document.getElementById('allCategories')?.classList.remove('show');
    }
}

function updateQuickAddCategories(type) {
    const recentContainer = document.getElementById('recentCategories');
    const allContainer = document.getElementById('allCategories');
    if (!recentContainer || !allContainer) return;

    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    // 상위 4개만 최근 분류로 표시
    const recentCategories = categories.slice(0, 4);

    // 최근 사용 분류 (상위 4개)
    recentContainer.innerHTML = recentCategories.map(cat => `
        <button class="category-chip" data-category="${cat}">${cat}</button>
    `).join('');

    // 전체 분류 (더보기 클릭 시 표시)
    allContainer.innerHTML = categories.map(cat => `
        <button class="category-chip" data-category="${cat}">${cat}</button>
    `).join('');

    // 분류 버튼 이벤트 (최근 + 전체 모두)
    document.querySelectorAll('.category-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-chip').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedCategory = btn.dataset.category;
        });
    });

    selectedCategory = null;
}

/**
 * 분류명으로 카테고리 칩 선택
 * @param {string} categoryName - 분류명
 */
function selectCategoryByName(categoryName) {
    const chips = document.querySelectorAll('.category-chip');
    let found = false;

    chips.forEach(chip => {
        const chipCategory = chip.dataset.category;
        // 부분 매칭 지원 (예: "식비" → "식비" 선택)
        if (chipCategory === categoryName || chipCategory.includes(categoryName) || categoryName.includes(chipCategory)) {
            chip.classList.add('selected');
            selectedCategory = chipCategory;
            found = true;
        } else {
            chip.classList.remove('selected');
        }
    });

    // 전체 분류에서 찾기 (더보기 영역)
    if (!found) {
        const allCats = document.getElementById('allCategories');
        if (allCats && !allCats.classList.contains('show')) {
            allCats.classList.add('show');
            // 다시 검색
            chips.forEach(chip => {
                if (chip.dataset.category === categoryName) {
                    chip.classList.add('selected');
                    selectedCategory = chip.dataset.category;
                }
            });
        }
    }
}

async function handleQuickAddSubmit() {
    const amount = parseInt(document.getElementById('quickAddAmount')?.value) || 0;
    const description = document.getElementById('quickAddDescription')?.value || '';
    const type = document.querySelector('.type-tab.active')?.dataset.type || 'expense';

    if (amount <= 0) {
        showToast('금액을 입력해주세요', 'error');
        return;
    }

    if (!selectedCategory) {
        showToast('분류를 선택해주세요', 'error');
        return;
    }

    try {
        const result = await createTransaction({
            type,
            category: selectedCategory,
            amount,
            title: selectedCategory,
            description: description,
            date: new Date().toISOString().split('T')[0]
        });

        if (result.success) {
            showToast('거래가 저장되었습니다', 'success');
            closeQuickAddModal();
            // 데이터 새로고침
            await loadHomeData();
        } else {
            showToast('저장에 실패했습니다', 'error');
        }
    } catch (error) {
        console.error('거래 저장 오류:', error);
        showToast('저장 중 오류가 발생했습니다', 'error');
    }
}

// showToast는 helpers.js에서 import

// 인사이트 카드 개수 제한
function limitInsightCards(maxCount) {
    const container = document.getElementById('insightCards');
    if (!container) return;

    const cards = container.querySelectorAll('.insight-card');
    cards.forEach((card, index) => {
        if (index >= maxCount) {
            card.style.display = 'none';
        }
    });
}

// 고정 수입/지출 요약 표시
function updateFixedSummary() {
    const container = document.getElementById('fixedSummaryCard');
    if (!container || !recurringItems.length) {
        if (container) container.style.display = 'none';
        return;
    }

    const incomeItems = recurringItems.filter(item => item.type === 'income');
    const expenseItems = recurringItems.filter(item => item.type === 'expense');

    const totalIncome = incomeItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalExpense = expenseItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const netFixed = totalIncome - totalExpense;

    container.style.display = 'block';
    container.innerHTML = `
        <div class="fixed-summary-header">
            <span class="fixed-icon">📅</span>
            <span class="fixed-title">월 고정 수입/지출</span>
        </div>
        <div class="fixed-summary-content">
            <div class="fixed-item income">
                <span class="fixed-label">고정 수입</span>
                <span class="fixed-value">+${formatAmountShort(totalIncome)}</span>
            </div>
            <div class="fixed-item expense">
                <span class="fixed-label">고정 지출</span>
                <span class="fixed-value">-${formatAmountShort(totalExpense)}</span>
            </div>
            <div class="fixed-item net ${netFixed >= 0 ? 'positive' : 'negative'}">
                <span class="fixed-label">순 고정</span>
                <span class="fixed-value">${netFixed >= 0 ? '+' : ''}${formatAmountShort(netFixed)}</span>
            </div>
        </div>
    `;
}

async function handleExport(type) {
    try {
        switch (type) {
            case 'assets':
                exportAssetsToCSV(assets);
                break;
            case 'debts':
                exportDebtsToCSV(debts);
                break;
            case 'transactions':
                const txResult = await getTransactions();
                if (txResult.success) {
                    exportTransactionsToCSV(txResult.data);
                }
                break;
            case 'networth':
                const nwResult = await getNetWorthHistory(12);
                if (nwResult.success) {
                    exportNetWorthHistoryToCSV(nwResult.data);
                }
                break;
            case 'backup':
                const [assetsRes, debtsRes, txRes, nwRes] = await Promise.all([
                    getAssets(),
                    getDebts(),
                    getTransactions(),
                    getNetWorthHistory(12)
                ]);
                exportAllDataToJSON({
                    exportDate: new Date().toISOString(),
                    assets: assetsRes.data || [],
                    debts: debtsRes.data || [],
                    transactions: txRes.data || [],
                    netWorthHistory: nwRes.data || []
                });
                break;
        }
    } catch (error) {
        console.error('데이터 내보내기 오류:', error);
        alert('내보내기 중 오류가 발생했습니다.');
    }
}

async function loadHomeData() {
    try {
        // 병렬로 모든 데이터 로드
        const [netWorthResult, assetsResult, debtsResult, stakingResult, airdropResult, transactionsResult, budgetResult, recurringResult, historyResult] = await Promise.all([
            calculateNetWorth(),
            getAssets(),
            getDebts(),
            getStakingOverview(),
            getAirdropOverview(),
            getTransactions(),
            getBudgetVsActual(),
            getRecurringItems(),
            getNetWorthHistory(2) // 지난달 대비를 위해 2개월
        ]);

        // 순자산 히스토리 저장
        if (historyResult.success) {
            netWorthHistory = historyResult.data || [];
        }

        if (netWorthResult.success) {
            netWorthData = netWorthResult.data;
            updateNetWorthDisplay();
            updateNetWorthChange(); // 변동률 업데이트
        }

        if (assetsResult.success) {
            assets = assetsResult.data || [];
            updateAssetCategories();
            updateAssetList();
            updateCryptoDetails();
        }

        if (debtsResult.success) {
            debts = debtsResult.data || [];
            updateDebtDisplay();
        }

        if (stakingResult.success) {
            stakingList = stakingResult.data || [];
            updateStakingDisplay();
        }

        if (airdropResult.success) {
            airdropList = airdropResult.data || [];
            updateAirdropDisplay();
            updateAirdropStats();
        }

        // 긴급 알림 업데이트
        updateAlertBanners();

        if (transactionsResult.success) {
            transactions = transactionsResult.data || [];
            updateCashflowDisplay(transactions);
            updateMonthlySummary(transactions); // 월간 요약 업데이트
        }

        // 예산 현황 업데이트
        if (budgetResult.success) {
            budgetData = budgetResult.data;
            updateBudgetHomeDisplay();
        }

        // 고정 수입/지출 업데이트
        if (recurringResult.success) {
            recurringItems = recurringResult.data || [];
            updateCashflowFixedSummary();
        }

        // 인사이트 카드 업데이트
        updateInsightCards();

        // 순자산 스냅샷 저장 (하루 1회)
        await saveNetWorthSnapshot();

        // 순자산 추이 차트 로드
        await loadNetWorthTrendChart(3);

    } catch (error) {
        console.error('홈 데이터 로드 에러:', error);
    }
}

function updateNetWorthDisplay() {
    if (!netWorthData) return;

    const { totalAssets, totalDebts, netWorth } = netWorthData;

    // 메인 숫자는 축약형으로
    document.getElementById('netWorthValue').textContent = formatAmountShort(netWorth);
    document.getElementById('totalAssetsValue').textContent = formatAmountShort(totalAssets);
    document.getElementById('totalDebtsValue').textContent = formatAmountShort(totalDebts);

    // 목표 진행률
    const goalPercent = Math.min((netWorth / GOALS.MAIN_QUEST) * 100, 100);
    const remaining = GOALS.MAIN_QUEST - netWorth;

    document.getElementById('goalPercent').textContent = `${goalPercent.toFixed(2)}%`;
    document.getElementById('goalProgressFill').style.width = `${goalPercent}%`;
    document.getElementById('goalRemaining').textContent = `목표까지 ${formatAmountShort(remaining)} 남음`;
}

// 순자산 변동률 업데이트
function updateNetWorthChange() {
    const changeEl = document.getElementById('netWorthChange');
    if (!changeEl || !netWorthData || netWorthHistory.length < 2) {
        if (changeEl) changeEl.style.display = 'none';
        return;
    }

    const currentNetWorth = netWorthData.netWorth;
    const lastMonth = netWorthHistory[1]; // 지난달 데이터
    const lastNetWorth = lastMonth?.net_worth || currentNetWorth;

    const change = currentNetWorth - lastNetWorth;
    const changePercent = lastNetWorth !== 0 ? (change / Math.abs(lastNetWorth)) * 100 : 0;

    const isPositive = change >= 0;
    const iconEl = changeEl.querySelector('.change-icon');
    const valueEl = changeEl.querySelector('.change-value');
    const percentEl = changeEl.querySelector('.change-percent');

    changeEl.className = `net-worth-change ${isPositive ? 'positive' : 'negative'}`;
    iconEl.textContent = isPositive ? '▲' : '▼';
    valueEl.textContent = formatAmountShort(Math.abs(change));
    percentEl.textContent = `(${isPositive ? '+' : ''}${changePercent.toFixed(1)}%)`;

    changeEl.style.display = 'flex';
}

// 월간 수입/지출/저축 요약 업데이트
function updateMonthlySummary(transactionList) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 이번 달 거래만 필터
    const thisMonthTx = transactionList.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    const income = thisMonthTx.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const expense = thisMonthTx.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const savings = income - expense;

    document.getElementById('monthlyIncome').textContent = formatAmountShort(income);
    document.getElementById('monthlyExpense').textContent = formatAmountShort(expense);

    const savingsEl = document.getElementById('monthlySavings');
    savingsEl.textContent = formatAmountShort(savings);
    savingsEl.className = `summary-value ${savings >= 0 ? 'positive' : 'negative'}`;
}

// 인사이트 카드 업데이트
function updateInsightCards() {
    const container = document.getElementById('insightCards');
    if (!container) return;

    const insights = [];

    // 1. 예산 진행률 인사이트
    if (budgetData && budgetData.totalBudget > 0) {
        const budgetPercent = Math.round((budgetData.totalSpent / budgetData.totalBudget) * 100);
        const remaining = budgetData.totalBudget - budgetData.totalSpent;
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        const today = new Date().getDate();
        const expectedPercent = Math.round((today / daysInMonth) * 100);

        let status = 'normal';
        let message = '';
        if (budgetPercent > expectedPercent + 20) {
            status = 'warning';
            message = `예산 ${budgetPercent}% 사용 (예상보다 빠름!)`;
        } else if (budgetPercent < expectedPercent - 10) {
            status = 'good';
            message = `예산 ${budgetPercent}% 사용 (절약 중!)`;
        } else {
            message = `예산 ${budgetPercent}% 사용 중`;
        }

        insights.push({
            icon: '💰',
            title: '이번 달 예산',
            message: message,
            sub: `남은 예산: ${formatAmountShort(remaining)}`,
            status: status
        });
    }

    // 2. 다음 결제일 인사이트
    const upcomingPayments = recurringItems
        .filter(item => item.type === 'expense' && item.is_active)
        .sort((a, b) => new Date(a.next_date) - new Date(b.next_date))
        .slice(0, 3);

    if (upcomingPayments.length > 0) {
        const next = upcomingPayments[0];
        const nextDate = new Date(next.next_date);
        const today = new Date();
        const diffDays = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));

        insights.push({
            icon: '📅',
            title: '다음 결제',
            message: `${next.title}`,
            sub: diffDays <= 0 ? '오늘 결제일!' : `D-${diffDays} (${formatAmountShort(next.amount)})`,
            status: diffDays <= 3 ? 'warning' : 'normal'
        });
    }

    // 3. 순자산 변동 인사이트
    if (netWorthHistory.length >= 2 && netWorthData) {
        const currentNetWorth = netWorthData.netWorth;
        const lastMonth = netWorthHistory[1];
        const change = currentNetWorth - (lastMonth?.net_worth || 0);
        const isPositive = change >= 0;

        insights.push({
            icon: isPositive ? '📈' : '📉',
            title: '순자산 변동',
            message: isPositive ? '지난달보다 증가' : '지난달보다 감소',
            sub: `${isPositive ? '+' : ''}${formatAmountShort(change)}`,
            status: isPositive ? 'good' : 'warning'
        });
    }

    // 4. 에어드랍 인사이트
    const claimableAirdrops = airdropList.filter(a => a.airdrop_status === 'claimable');
    if (claimableAirdrops.length > 0) {
        const totalValue = claimableAirdrops.reduce((sum, a) => sum + (a.expected_value || 0), 0);
        insights.push({
            icon: '🎁',
            title: '클레임 가능',
            message: `${claimableAirdrops.length}개 에어드랍`,
            sub: `예상 가치: ${formatAmountShort(totalValue)}`,
            status: 'good'
        });
    }

    // HTML 생성
    if (insights.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = insights.map(insight => `
        <div class="insight-card ${insight.status}">
            <div class="insight-icon">${insight.icon}</div>
            <div class="insight-content">
                <div class="insight-title">${insight.title}</div>
                <div class="insight-message">${insight.message}</div>
                <div class="insight-sub">${insight.sub}</div>
            </div>
        </div>
    `).join('');
}

let assetPieChart = null;

function updateAssetCategories() {
    const grid = document.getElementById('assetCategoryGrid');
    if (!grid || !netWorthData) return;

    const { byCategory, totalAssets } = netWorthData;

    const html = ASSET_CATEGORY_INFO.map(cat => {
        const value = byCategory[cat.id] || 0;
        const percent = totalAssets > 0 ? ((value / totalAssets) * 100).toFixed(1) : 0;

        return `
            <div class="asset-category-item" style="border-left: 4px solid ${cat.color}">
                <div class="category-header">
                    <span class="category-icon">${cat.icon}</span>
                    <span class="category-name">${cat.name}</span>
                </div>
                <div class="category-value">${formatAmountShort(value)}</div>
                <div class="category-percent">${percent}%</div>
            </div>
        `;
    }).join('');

    grid.innerHTML = html || '<div class="empty-state">자산 데이터가 없습니다</div>';

    // 파이 차트 렌더링
    renderAssetPieChart();
}

function renderAssetPieChart() {
    const canvas = document.getElementById('assetPieChart');
    if (!canvas || !netWorthData) return;

    const ctx = canvas.getContext('2d');
    const { byCategory, totalAssets } = netWorthData;

    // 기존 차트 파괴
    if (assetPieChart) {
        assetPieChart.destroy();
    }

    // 데이터가 없으면 빈 차트
    if (totalAssets <= 0) {
        assetPieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['데이터 없음'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['rgba(255, 255, 255, 0.1)'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });
        return;
    }

    // 카테고리별 데이터 (0보다 큰 것만)
    const categories = ASSET_CATEGORY_INFO.filter(cat => (byCategory[cat.id] || 0) > 0);
    const labels = categories.map(cat => cat.name);
    const data = categories.map(cat => byCategory[cat.id] || 0);
    const colors = categories.map(cat => cat.color);

    assetPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: 'rgba(30, 30, 46, 0.8)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '60%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percent = ((value / totalAssets) * 100).toFixed(1);
                            return `${context.label}: ${formatAmount(value)} (${percent}%)`;
                        }
                    },
                    backgroundColor: 'rgba(30, 30, 46, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1
                }
            }
        }
    });
}

// 자산 목록을 카테고리별로 접기/펼치기 가능하게 표시
function updateAssetList() {
    const container = document.getElementById('assetListContainer');
    if (!container) return;

    if (assets.length === 0) {
        container.innerHTML = '<div class="empty-state">등록된 자산이 없습니다</div>';
        return;
    }

    // 카테고리별로 자산 그룹화
    const assetsByCategory = {};
    assets.forEach(asset => {
        const cat = asset.category || 'other';
        if (!assetsByCategory[cat]) {
            assetsByCategory[cat] = [];
        }
        assetsByCategory[cat].push(asset);
    });

    // 카테고리 정보 매핑
    const catInfoMap = {};
    ASSET_CATEGORY_INFO.forEach(cat => {
        catInfoMap[cat.id] = cat;
    });

    // 카테고리별로 HTML 생성 (금액 높은 순 정렬)
    const sortedCategories = Object.entries(assetsByCategory)
        .map(([catId, items]) => ({
            catId,
            catInfo: catInfoMap[catId] || { name: catId, icon: '📦', color: '#9E9E9E' },
            items: items.sort((a, b) => (b.current_value || 0) - (a.current_value || 0)),
            total: items.reduce((sum, a) => sum + (a.current_value || 0), 0)
        }))
        .sort((a, b) => b.total - a.total);

    // 업데이트 필요한 자산 수 계산 (7일 이상 지난 것)
    const staleAssets = assets.filter(a => {
        if (!a.updated_at) return true;
        const diffDays = Math.floor((new Date() - new Date(a.updated_at)) / (1000 * 60 * 60 * 24));
        return diffDays >= 7;
    });

    let updateAlertHtml = '';
    if (staleAssets.length > 0) {
        updateAlertHtml = `
            <div class="asset-update-alert">
                <span class="update-alert-icon">⚠️</span>
                <span class="update-alert-text">
                    <strong>${staleAssets.length}개</strong> 자산이 7일 이상 업데이트되지 않았습니다
                </span>
                <span class="update-alert-hint">자산 탭에서 금액을 업데이트하세요</span>
            </div>
        `;
    }

    const html = updateAlertHtml + sortedCategories.map(({ catId, catInfo, items, total }) => `
        <div class="asset-category-group" data-category="${catId}">
            <div class="asset-category-header" data-toggle-category="${catId}">
                <div class="category-header-left">
                    <span class="category-icon" style="color: ${catInfo.color}">${catInfo.icon}</span>
                    <span class="category-name">${catInfo.name}</span>
                    <span class="category-count">(${items.length})</span>
                </div>
                <div class="category-header-right">
                    <span class="category-total">${formatAmountShort(total)}</span>
                    <span class="category-toggle-icon">▶</span>
                </div>
            </div>
            <div class="asset-category-items collapsed" id="assetItems-${catId}">
                ${items.map(asset => {
                    const updateInfo = getUpdateStatus(asset.updated_at);
                    return `
                        <div class="asset-list-item ${updateInfo.isStale ? 'needs-update' : ''}">
                            <div class="asset-item-info">
                                <span class="asset-item-name">${asset.name}</span>
                                <div class="asset-item-meta">
                                    ${asset.platform ? `<span class="asset-item-platform">${asset.platform}</span>` : ''}
                                    <span class="asset-item-updated ${updateInfo.class}" title="${updateInfo.fullDate}">
                                        ${updateInfo.icon} ${updateInfo.text}
                                    </span>
                                </div>
                            </div>
                            <div class="asset-item-value">${formatAmount(asset.current_value || 0)}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `).join('');

    container.innerHTML = html;

    // 카테고리 접기/펼치기 이벤트 추가
    container.querySelectorAll('.asset-category-header').forEach(header => {
        header.addEventListener('click', () => {
            const catId = header.dataset.toggleCategory;
            const itemsContainer = document.getElementById(`assetItems-${catId}`);
            const icon = header.querySelector('.category-toggle-icon');

            if (itemsContainer) {
                const isCollapsed = itemsContainer.classList.toggle('collapsed');
                icon.textContent = isCollapsed ? '▶' : '▼';
            }
        });
    });
}

// 자산 업데이트 상태 확인
function getUpdateStatus(updatedAt) {
    if (!updatedAt) {
        return { text: '업데이트 필요', icon: '⚠️', class: 'stale', isStale: true, fullDate: '업데이트 기록 없음' };
    }

    const now = new Date();
    const updated = new Date(updatedAt);
    const diffMs = now - updated;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    const fullDate = updated.toLocaleDateString('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    if (diffDays >= 30) {
        return { text: `${diffDays}일 전`, icon: '🔴', class: 'very-stale', isStale: true, fullDate };
    } else if (diffDays >= 7) {
        return { text: `${diffDays}일 전`, icon: '🟡', class: 'stale', isStale: true, fullDate };
    } else if (diffDays >= 1) {
        return { text: `${diffDays}일 전`, icon: '🟢', class: 'recent', isStale: false, fullDate };
    } else if (diffHours >= 1) {
        return { text: `${diffHours}시간 전`, icon: '🟢', class: 'recent', isStale: false, fullDate };
    } else {
        return { text: '방금 전', icon: '✅', class: 'fresh', isStale: false, fullDate };
    }
}

function updateCryptoDetails() {
    const grid = document.getElementById('cryptoDetailGrid');
    if (!grid) return;

    // 크립토 자산만 필터링하고 sub_type별로 그룹화
    const cryptoAssets = assets.filter(a => a.category === 'crypto');

    const bySubType = {};
    cryptoAssets.forEach(asset => {
        const subType = asset.sub_type || 'other';
        if (!bySubType[subType]) {
            bySubType[subType] = { count: 0, value: 0 };
        }
        bySubType[subType].count++;
        bySubType[subType].value += asset.current_value || 0;
    });

    const html = CRYPTO_TYPE_INFO.map(type => {
        const data = bySubType[type.id] || { count: 0, value: 0 };

        return `
            <div class="crypto-type-item">
                <div class="crypto-type-icon">${type.icon}</div>
                <div class="crypto-type-info">
                    <div class="crypto-type-name">${type.name}</div>
                    <div class="crypto-type-count">${data.count}개</div>
                </div>
                <div class="crypto-type-value">${formatAmount(data.value)}</div>
            </div>
        `;
    }).join('');

    grid.innerHTML = html;
}

function updateStakingDisplay() {
    const list = document.getElementById('stakingList');
    if (!list) return;

    if (stakingList.length === 0) {
        list.innerHTML = '<div class="empty-state">스테이킹 자산이 없습니다</div>';
        return;
    }

    const html = stakingList.slice(0, 5).map(item => {
        const daysText = item.days_until_unlock !== null
            ? `D-${item.days_until_unlock}`
            : '무기한';

        return `
            <div class="staking-item">
                <div class="staking-info">
                    <div class="staking-name">${item.name}</div>
                    <div class="staking-platform">${item.platform || ''} ${item.token_name || ''}</div>
                </div>
                <div class="staking-details">
                    <div class="staking-value">${formatAmount(item.current_value)}</div>
                    <div class="staking-unlock ${item.days_until_unlock <= 7 ? 'soon' : ''}">${daysText}</div>
                </div>
            </div>
        `;
    }).join('');

    list.innerHTML = html;
}

function updateAirdropDisplay() {
    const list = document.getElementById('airdropList');
    if (!list) return;

    if (airdropList.length === 0) {
        list.innerHTML = '<div class="empty-state">등록된 에어드랍이 없습니다</div>';
        return;
    }

    const html = airdropList.slice(0, 5).map(item => {
        const statusColors = {
            pending: '#FF9800',
            confirmed: '#4CAF50',
            claimable: '#2196F3',
            claimed: '#9E9E9E',
            missed: '#F44336'
        };

        return `
            <div class="airdrop-item">
                <div class="airdrop-status" style="background: ${statusColors[item.airdrop_status] || '#9E9E9E'}"></div>
                <div class="airdrop-info">
                    <div class="airdrop-name">${item.name}</div>
                    <div class="airdrop-expected">${item.airdrop_expected_value ? formatAmount(item.airdrop_expected_value) + ' 예상' : ''}</div>
                </div>
            </div>
        `;
    }).join('');

    list.innerHTML = html;
}

function updateDebtDisplay() {
    const list = document.getElementById('debtList');
    const totalDisplay = document.getElementById('totalDebtDisplay');
    if (!list) return;

    const totalDebt = debts.reduce((sum, d) => sum + (d.remaining_amount || 0), 0);
    if (totalDisplay) {
        totalDisplay.textContent = formatAmount(totalDebt);
    }

    if (debts.length === 0) {
        list.innerHTML = '<div class="empty-state">등록된 부채가 없습니다</div>';
        return;
    }

    const html = debts.map(debt => {
        const percent = debt.total_amount > 0
            ? ((debt.paid_amount / debt.total_amount) * 100).toFixed(1)
            : 0;

        return `
            <div class="debt-item">
                <div class="debt-info">
                    <div class="debt-name">${debt.name}</div>
                    <div class="debt-creditor">${debt.creditor || ''}</div>
                </div>
                <div class="debt-progress">
                    <div class="debt-progress-bar">
                        <div class="debt-progress-fill" style="width: ${percent}%"></div>
                    </div>
                    <div class="debt-progress-text">${percent}% 상환</div>
                </div>
                <div class="debt-remaining">${formatAmount(debt.remaining_amount)}</div>
            </div>
        `;
    }).join('');

    list.innerHTML = html;
}

function updateCashflowDisplay(transactions) {
    const thisMonthIncome = calculateTotalIncome(transactions, 'thisMonth');
    const thisMonthExpense = calculateTotalExpense(transactions, 'thisMonth');
    const netCashflow = thisMonthIncome - thisMonthExpense;

    document.getElementById('monthlyIncome').textContent = formatAmount(thisMonthIncome);
    document.getElementById('monthlyExpense').textContent = formatAmount(thisMonthExpense);

    const netEl = document.getElementById('monthlyNet');
    netEl.textContent = formatAmount(netCashflow);
    netEl.className = `cashflow-value ${netCashflow >= 0 ? 'positive' : 'negative'}`;
}

function updateCashflowFixedSummary() {
    const container = document.getElementById('cashflowFixedSummary');
    if (!container) return;

    const activeItems = recurringItems.filter(i => i.is_active !== false);
    const incomeItems = activeItems.filter(i => i.type === 'income');
    const expenseItems = activeItems.filter(i => i.type === 'expense');

    const totalFixedIncome = incomeItems.reduce((sum, i) => sum + (i.amount || 0), 0);
    const totalFixedExpense = expenseItems.reduce((sum, i) => sum + (i.amount || 0), 0);

    if (activeItems.length === 0) {
        container.innerHTML = `
            <div class="cashflow-fixed-empty">
                <p>등록된 고정 수입/지출이 없습니다</p>
                <button class="btn-link" data-action="manage-recurring">+ 고정 수입/지출 등록하기</button>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="cashflow-fixed-info">
                <div class="fixed-summary-row">
                    <span class="fixed-label">월 고정 수입</span>
                    <span class="fixed-value positive">+${formatAmountShort(totalFixedIncome)}</span>
                </div>
                <div class="fixed-summary-row">
                    <span class="fixed-label">월 고정 지출</span>
                    <span class="fixed-value negative">-${formatAmountShort(totalFixedExpense)}</span>
                </div>
                <div class="fixed-summary-row highlight">
                    <span class="fixed-label">고정 순수익</span>
                    <span class="fixed-value ${totalFixedIncome - totalFixedExpense >= 0 ? 'positive' : 'negative'}">
                        ${formatAmountShort(totalFixedIncome - totalFixedExpense)}
                    </span>
                </div>
            </div>
            <button class="btn-manage-fixed" data-action="manage-recurring">
                💳 고정 수입/지출 관리
            </button>
        `;
    }

    // 고정 수입/지출 관리 버튼 이벤트
    container.querySelectorAll('[data-action="manage-recurring"]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (switchTabCallbackRef) {
                switchTabCallbackRef('tools', 'recurring');
            }
        });
    });
}

function updateBudgetHomeDisplay() {
    const container = document.getElementById('budgetHomeSummary');
    if (!container || !budgetData) return;

    const { budgets, totalBudget, totalSpent, daysRemaining } = budgetData;

    if (budgets.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>설정된 예산이 없습니다</p>
                <p class="hint">도구 탭에서 예산을 설정하세요</p>
            </div>
        `;
        return;
    }

    const overBudgetItems = budgets.filter(b => b.isOver);
    const warningItems = budgets.filter(b => !b.isOver && b.percent >= 80);
    const overallPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    let html = `
        <div class="budget-home-overview">
            <div class="budget-home-progress">
                <div class="budget-home-bar">
                    <div class="budget-home-fill ${overallPercent > 100 ? 'over' : overallPercent > 80 ? 'warning' : ''}"
                         style="width: ${Math.min(overallPercent, 100)}%"></div>
                </div>
                <div class="budget-home-stats">
                    <span class="budget-home-spent">${formatAmountShort(totalSpent)}</span>
                    <span class="budget-home-separator">/</span>
                    <span class="budget-home-total">${formatAmountShort(totalBudget)}</span>
                    <span class="budget-home-percent">(${overallPercent}%)</span>
                </div>
            </div>
            <div class="budget-home-info">
                남은 ${daysRemaining}일
            </div>
        </div>
    `;

    // 초과/경고 카테고리 표시
    if (overBudgetItems.length > 0) {
        html += `
            <div class="budget-home-alerts">
                <div class="budget-alert over">
                    <span class="alert-icon">⚠️</span>
                    <span class="alert-text">예산 초과: ${overBudgetItems.map(b => b.category).join(', ')}</span>
                </div>
            </div>
        `;
    } else if (warningItems.length > 0) {
        html += `
            <div class="budget-home-alerts">
                <div class="budget-alert warning">
                    <span class="alert-icon">💡</span>
                    <span class="alert-text">80% 이상 사용: ${warningItems.map(b => b.category).join(', ')}</span>
                </div>
            </div>
        `;
    }

    // 주요 카테고리 간략 표시 (상위 3개)
    const topBudgets = [...budgets].sort((a, b) => b.percent - a.percent).slice(0, 3);
    html += `
        <div class="budget-home-categories">
            ${topBudgets.map(b => `
                <div class="budget-home-category ${b.isOver ? 'over' : ''}">
                    <span class="cat-name">${b.category}</span>
                    <span class="cat-progress">${b.percent}%</span>
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = html;
}

function updateAlertBanners() {
    const container = document.getElementById('alertBanners');
    if (!container) return;

    const alerts = [];

    // 1. 예산 초과 알림
    if (budgetData && budgetData.budgets) {
        budgetData.budgets.forEach(budget => {
            const spent = budget.spent || 0;
            const limit = budget.amount || 0;
            const percent = limit > 0 ? (spent / limit * 100) : 0;

            if (percent >= 100) {
                alerts.push({
                    type: 'budget-over',
                    icon: '🚨',
                    title: `${budget.category} 예산 초과!`,
                    message: `${formatAmountShort(spent)} / ${formatAmountShort(limit)} (${percent.toFixed(0)}%)`,
                    urgent: true
                });
            } else if (percent >= 80) {
                alerts.push({
                    type: 'budget-warning',
                    icon: '⚠️',
                    title: `${budget.category} 예산 80% 도달`,
                    message: `남은 예산: ${formatAmountShort(limit - spent)}`,
                    urgent: false
                });
            }
        });
    }

    // 2. 결제일 알림 (D-3 이내)
    const today = new Date();
    const currentDay = today.getDate();
    recurringItems.filter(item => item.type === 'expense').forEach(item => {
        if (item.payment_day) {
            let daysUntil = item.payment_day - currentDay;
            if (daysUntil < 0) daysUntil += 30; // 다음 달 결제일

            if (daysUntil <= 3 && daysUntil >= 0) {
                alerts.push({
                    type: 'payment',
                    icon: '💳',
                    title: `${item.name} 결제 예정`,
                    message: daysUntil === 0 ? '오늘 결제일!' : `D-${daysUntil} (매월 ${item.payment_day}일)`,
                    urgent: daysUntil === 0
                });
            }
        }
    });

    // 3. 스테이킹 D-7 이내 알림
    stakingList.forEach(item => {
        if (item.days_until_unlock !== null && item.days_until_unlock <= 7 && item.days_until_unlock >= 0) {
            alerts.push({
                type: 'staking',
                icon: '🔓',
                title: `${item.name} 언락 임박!`,
                message: `D-${item.days_until_unlock} (${item.staking_unlock_date})`,
                urgent: item.days_until_unlock <= 3
            });
        }
    });

    // 4. 클레임 가능한 에어드랍 알림
    airdropList.forEach(item => {
        if (item.airdrop_status === 'claimable') {
            alerts.push({
                type: 'airdrop',
                icon: '🎁',
                title: `${item.name} 클레임 가능!`,
                message: item.airdrop_expected_value ? `예상 가치: ${formatAmount(item.airdrop_expected_value)}` : '지금 클레임하세요',
                urgent: true
            });
        }
    });

    if (alerts.length === 0) {
        container.innerHTML = '';
        return;
    }

    const html = alerts.map(alert => `
        <div class="alert-banner ${alert.type} ${alert.urgent ? 'urgent' : ''}">
            <span class="alert-icon">${alert.icon}</span>
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-message">${alert.message}</div>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

function updateAirdropStats() {
    const container = document.getElementById('airdropStats');
    if (!container) return;

    // 에어드랍 통계 계산
    let totalClaimedValue = 0;  // 청산 완료된 에어드랍의 원화 가치
    let totalPending = 0;
    let claimedCount = 0;
    let pendingCount = 0;
    let claimableCount = 0;

    airdropList.forEach(item => {
        switch (item.airdrop_status) {
            case 'claimed':
                // 청산 완료: purchase_value가 청산 당시 원화 가치
                totalClaimedValue += item.purchase_value || 0;
                claimedCount++;
                break;
            case 'pending':
            case 'confirmed':
                totalPending += item.airdrop_expected_value || 0;
                pendingCount++;
                break;
            case 'claimable':
                totalPending += item.airdrop_expected_value || 0;
                claimableCount++;
                break;
        }
    });

    const html = `
        <div class="airdrop-stats-grid">
            <div class="stat-item total-earned">
                <div class="stat-value">${formatAmountShort(totalClaimedValue)}</div>
                <div class="stat-label">총 에어드랍 수익 (${claimedCount}건)</div>
            </div>
            <div class="stat-item pending">
                <div class="stat-value">${formatAmountShort(totalPending)}</div>
                <div class="stat-label">대기 중 (${pendingCount + claimableCount}건)</div>
            </div>
            ${claimableCount > 0 ? `
            <div class="stat-item claimable">
                <div class="stat-value">${claimableCount}건</div>
                <div class="stat-label">지금 클레임 가능!</div>
            </div>
            ` : ''}
        </div>
    `;

    container.innerHTML = html;
}

function handleQuickAction(action, switchTabCallback) {
    switch (action) {
        case 'add-asset':
        case 'add-staking':
        case 'add-airdrop':
            if (switchTabCallback) switchTabCallback('assets');
            break;
        case 'add-transaction':
            if (switchTabCallback) switchTabCallback('transactions');
            break;
        case 'view-budget':
            if (switchTabCallback) switchTabCallback('tools', 'budget');
            break;
        case 'manage-fixed':
            if (switchTabCallback) switchTabCallback('tools', 'recurring');
            break;
        default:
            break;
    }
}

// 순자산 추이 차트
async function loadNetWorthTrendChart(months = 3) {
    const canvas = document.getElementById('netWorthTrendChart');
    const summaryEl = document.getElementById('trendSummary');
    if (!canvas) return;

    try {
        const result = await getNetWorthHistory(months);
        if (!result.success || !result.data.length) {
            // 데이터가 없으면 안내 메시지
            if (summaryEl) {
                summaryEl.innerHTML = `
                    <div class="trend-empty">
                        <p>📊 아직 기록된 데이터가 없습니다.</p>
                        <p class="trend-empty-hint">매일 앱을 방문하면 순자산 변화가 기록됩니다.</p>
                    </div>
                `;
            }
            return;
        }

        const data = result.data;
        const labels = data.map(d => {
            const date = new Date(d.recorded_at);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        });
        const netWorthValues = data.map(d => d.net_worth);
        const assetValues = data.map(d => d.total_assets);
        const debtValues = data.map(d => d.total_debts);

        // 기존 차트 파괴
        if (netWorthChart) {
            netWorthChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        netWorthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '순자산',
                        data: netWorthValues,
                        borderColor: '#a78bfa',
                        backgroundColor: 'rgba(167, 139, 250, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 4,
                        pointBackgroundColor: '#a78bfa'
                    },
                    {
                        label: '총자산',
                        data: assetValues,
                        borderColor: '#4ade80',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: '총부채',
                        data: debtValues,
                        borderColor: '#f87171',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.4,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${formatAmountShort(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)',
                            callback: function(value) {
                                return formatAmountShort(value);
                            }
                        }
                    }
                }
            }
        });

        // 요약 정보 업데이트
        if (summaryEl && data.length >= 2) {
            const firstValue = data[0].net_worth;
            const lastValue = data[data.length - 1].net_worth;
            const change = lastValue - firstValue;
            const changePercent = firstValue !== 0 ? ((change / Math.abs(firstValue)) * 100).toFixed(1) : 0;
            const isPositive = change >= 0;

            summaryEl.innerHTML = `
                <div class="trend-summary-item">
                    <span class="trend-label">기간 시작</span>
                    <span class="trend-value">${formatAmountShort(firstValue)}</span>
                </div>
                <div class="trend-summary-item">
                    <span class="trend-label">현재</span>
                    <span class="trend-value">${formatAmountShort(lastValue)}</span>
                </div>
                <div class="trend-summary-item highlight ${isPositive ? 'positive' : 'negative'}">
                    <span class="trend-label">변화</span>
                    <span class="trend-value">${isPositive ? '+' : ''}${formatAmountShort(change)} (${isPositive ? '+' : ''}${changePercent}%)</span>
                </div>
            `;
        }

    } catch (error) {
        console.error('순자산 추이 차트 로드 에러:', error);
    }
}

// ============================================
// 알림 체크 및 발송
// ============================================

/**
 * 앱 시작 시 알림 조건 체크 및 발송
 */
async function checkAndSendNotifications() {
    const settings = loadNotificationSettings();

    // 알림이 비활성화되어 있으면 중단
    if (!settings.enabled) return;

    // 알림 권한 확인
    const permission = getNotificationPermission();
    if (permission !== 'granted') return;

    // 오늘 이미 알림을 보냈는지 확인 (하루 1회 제한)
    const today = new Date().toDateString();
    const lastNotificationDate = localStorage.getItem('lastNotificationDate');
    if (lastNotificationDate === today) return;

    try {
        // 1. 예산 체크
        if (settings.budgetWarning || settings.budgetExceeded) {
            await checkBudgetNotifications(settings);
        }

        // 2. 결제일 체크
        if (settings.paymentDue && recurringItems.length > 0) {
            checkPaymentNotifications();
        }

        // 3. 스테이킹 언락 체크
        if (settings.stakingUnlock && stakingList.length > 0) {
            checkStakingNotifications();
        }

        // 4. 에어드랍 클레임 체크
        if (settings.airdropClaimable && airdropList.length > 0) {
            checkAirdropNotifications();
        }

        // 알림 발송 날짜 저장
        localStorage.setItem('lastNotificationDate', today);

    } catch (error) {
        console.error('알림 체크 에러:', error);
    }
}

/**
 * 예산 알림 체크
 */
async function checkBudgetNotifications(settings) {
    if (!budgetData || !budgetData.byCategory) return;

    for (const item of budgetData.byCategory) {
        if (item.budget <= 0) continue;

        const percentage = Math.round((item.spent / item.budget) * 100);

        if (percentage >= 100 && settings.budgetExceeded) {
            notifyBudgetExceeded(item.category, item.spent, item.budget, percentage);
        } else if (percentage >= 80 && percentage < 100 && settings.budgetWarning) {
            notifyBudgetExceeded(item.category, item.spent, item.budget, percentage);
        }
    }
}

/**
 * 결제일 알림 체크
 */
function checkPaymentNotifications() {
    const today = new Date();

    for (const item of recurringItems) {
        if (item.type !== 'expense') continue;

        // 결제일 계산 (이번 달 기준)
        const paymentDay = item.day_of_month || 1;
        const paymentDate = new Date(today.getFullYear(), today.getMonth(), paymentDay);

        // 결제일이 지났으면 다음 달로
        if (paymentDate < today) {
            paymentDate.setMonth(paymentDate.getMonth() + 1);
        }

        // 남은 일수 계산
        const diffTime = paymentDate - today;
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // D-3 이내면 알림
        if (daysLeft <= 3 && daysLeft >= 0) {
            notifyPaymentDue(item.name, item.amount, daysLeft);
        }
    }
}

/**
 * 스테이킹 언락 알림 체크
 */
function checkStakingNotifications() {
    const today = new Date();

    for (const staking of stakingList) {
        if (!staking.unlock_date) continue;

        const unlockDate = new Date(staking.unlock_date);
        const diffTime = unlockDate - today;
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // D-7 이내면 알림
        if (daysLeft <= 7 && daysLeft >= 0) {
            notifyStakingUnlock(staking.token_name, staking.amount, daysLeft);
        }
    }
}

/**
 * 에어드랍 클레임 알림 체크
 */
function checkAirdropNotifications() {
    for (const airdrop of airdropList) {
        // 클레임 가능 상태인 에어드랍만
        if (airdrop.status === 'claimable') {
            notifyAirdropClaimable(airdrop.project_name);
        }
    }
}
