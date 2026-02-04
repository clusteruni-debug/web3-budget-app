// 도구 탭: 예산, 캘린더, 고정지출, 소비분석, 대출계산기, 투자손익, 설정
import { getDebts, getRecurringItems, createRecurringItem, updateRecurringItem, deleteRecurringItem, getStakingOverview, getAirdropOverview, getTransactions, getBudgets, createBudget, updateBudget, deleteBudget, getBudgetVsActual, getSubscriptions, createSubscription, updateSubscription, deleteSubscription, getGoals, createGoal, updateGoal, deleteGoal, getFiatFlows, createFiatFlow, deleteFiatFlow, calculateFiatProfit } from '../services/database.js';
import { formatAmount, formatAmountShort, createEmptyState, EMPTY_STATES, loadNotificationSettings, saveNotificationSettings, requestNotificationPermission, getNotificationPermission, showToast } from '../utils/helpers.js';
import { updatePassword } from '../services/auth.js';
import { getCurrentUser } from '../services/supabase.js';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, saveCategories, resetCategories, getDefaultCategories, loadCustomCategories } from '../utils/constants.js';

let currentTool = 'budget';
let debts = [];
let recurringItems = [];
let stakingList = [];
let airdropList = [];
let transactions = [];
let budgets = [];
let budgetData = null;
let subscriptions = [];
let goals = [];
let fiatFlows = [];
let fiatProfitData = null;

export function createToolsTab() {
    return `
        <div class="tools-container">
            <!-- 도구 선택 탭 -->
            <div class="tool-tabs">
                <button class="tool-tab-btn active" data-tool="budget">💰 월 예산</button>
                <button class="tool-tab-btn" data-tool="goals">🎯 저축 목표</button>
                <button class="tool-tab-btn" data-tool="subscriptions">📺 구독 서비스</button>
                <button class="tool-tab-btn" data-tool="calendar">📅 결제 일정</button>
                <button class="tool-tab-btn" data-tool="recurring">💳 고정 지출</button>
                <button class="tool-tab-btn" data-tool="spending">📊 소비 분석</button>
                <button class="tool-tab-btn" data-tool="report">📋 월간 리포트</button>
                <button class="tool-tab-btn" data-tool="fiat-profit">💹 투자 손익</button>
                <button class="tool-tab-btn" data-tool="debt-calc">🧮 대출 계산</button>
                <button class="tool-tab-btn" data-tool="account">⚙️ 설정</button>
            </div>

            <!-- 도구 컨텐츠 영역 -->
            <div class="tool-content" id="toolContent">
                <!-- 동적으로 채워짐 -->
            </div>
        </div>
    `;
}

export async function initToolsTab(initialTool = 'budget') {
    // 초기 도구 탭 설정
    currentTool = initialTool;

    // 데이터 로드
    await loadToolsData();

    // 도구 탭 버튼 활성화 상태 업데이트
    document.querySelectorAll('.tool-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tool === currentTool) {
            btn.classList.add('active');
        }
    });

    // 도구 탭 이벤트
    document.querySelectorAll('.tool-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTool = btn.dataset.tool;
            renderCurrentTool();
        });
    });

    // 기본 도구 렌더링
    renderCurrentTool();
}

async function loadToolsData() {
    const [debtsRes, recurringRes, stakingRes, airdropRes, transactionsRes, budgetsRes, budgetVsActualRes, subscriptionsRes, goalsRes] = await Promise.all([
        getDebts(),
        getRecurringItems(),
        getStakingOverview(),
        getAirdropOverview(),
        getTransactions(),
        getBudgets(),
        getBudgetVsActual(),
        getSubscriptions(),
        getGoals()
    ]);

    debts = debtsRes.data || [];
    recurringItems = recurringRes.data || [];
    stakingList = stakingRes.data || [];
    airdropList = airdropRes.data || [];
    transactions = transactionsRes.data || [];
    budgets = budgetsRes.data || [];
    budgetData = budgetVsActualRes.success ? budgetVsActualRes.data : null;
    subscriptions = subscriptionsRes.data || [];
    goals = goalsRes.data || [];

    // 투자 손익 데이터 로드
    const [fiatFlowsRes, fiatProfitRes] = await Promise.all([
        getFiatFlows(),
        calculateFiatProfit()
    ]);
    fiatFlows = fiatFlowsRes.data || [];
    fiatProfitData = fiatProfitRes.success ? fiatProfitRes.data : null;
}

function renderCurrentTool() {
    const content = document.getElementById('toolContent');

    switch (currentTool) {
        case 'budget':
            content.innerHTML = renderBudgetManager();
            initBudgetManager();
            break;
        case 'goals':
            content.innerHTML = renderGoals();
            initGoals();
            break;
        case 'subscriptions':
            content.innerHTML = renderSubscriptions();
            initSubscriptions();
            break;
        case 'calendar':
            content.innerHTML = renderCalendar();
            initCalendar();
            break;
        case 'recurring':
            content.innerHTML = renderRecurringExpenses();
            initRecurringExpenses();
            break;
        case 'spending':
            content.innerHTML = renderSpendingAnalysis();
            initSpendingAnalysis();
            break;
        case 'report':
            content.innerHTML = renderMonthlyReport();
            initMonthlyReport();
            break;
        case 'fiat-profit':
            content.innerHTML = renderFiatProfit();
            initFiatProfit();
            break;
        case 'futures':
            content.innerHTML = renderFuturesLoss();
            initFuturesLoss();
            break;
        case 'debt-calc':
            content.innerHTML = renderDebtCalculator();
            initDebtCalculator();
            break;
        case 'account':
            content.innerHTML = renderAccountSettings();
            initAccountSettings();
            break;
    }
}

// ============================================
// 예산 관리
// ============================================

let editingBudget = null;

function renderBudgetManager() {
    const now = new Date();
    const monthName = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;

    // budgetData가 없어도 모달은 렌더링 (예산 추가 가능하도록)
    const budgetItems = budgetData?.budgets || [];
    const totalBudget = budgetData?.totalBudget || 0;
    const totalSpent = budgetData?.totalSpent || 0;
    const daysRemaining = budgetData?.daysRemaining || 0;

    if (!budgetData || budgetItems.length === 0) {
        return `
            <div class="budget-container">
                <div class="budget-header">
                    <h3>💰 ${monthName} 월 예산</h3>
                    <button class="btn btn-primary" id="addBudgetBtn">+ 예산 추가</button>
                </div>
                <div class="empty-state">
                    <p>설정된 예산이 없습니다</p>
                    <p class="hint">위의 '+ 예산 추가' 버튼을 눌러 분류별 예산을 설정하세요</p>
                </div>
            </div>

            <!-- 예산 추가/수정 모달 -->
            ${renderBudgetModal()}
        `;
    }

    const remainingBudget = totalBudget - totalSpent;
    const overallPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    const dailyAvailable = daysRemaining > 0 ? Math.round(remainingBudget / daysRemaining) : 0;

    return `
        <div class="budget-container">
            <div class="budget-header">
                <h3>💰 ${monthName} 월 예산</h3>
                <button class="btn btn-primary" id="addBudgetBtn">+ 예산 추가</button>
            </div>

            <!-- 전체 예산 요약 -->
            <div class="budget-overview">
                <div class="budget-overview-main">
                    <div class="budget-progress-ring">
                        <svg viewBox="0 0 100 100">
                            <circle class="progress-bg" cx="50" cy="50" r="45"/>
                            <circle class="progress-fill ${overallPercent > 100 ? 'over' : ''}"
                                    cx="50" cy="50" r="45"
                                    stroke-dasharray="${Math.min(overallPercent, 100) * 2.83} 283"/>
                        </svg>
                        <div class="progress-text">
                            <span class="progress-percent">${overallPercent}%</span>
                            <span class="progress-label">사용</span>
                        </div>
                    </div>
                    <div class="budget-overview-details">
                        <div class="overview-item">
                            <span class="overview-label">총 예산</span>
                            <span class="overview-value">${formatAmountShort(totalBudget)}</span>
                        </div>
                        <div class="overview-item">
                            <span class="overview-label">사용</span>
                            <span class="overview-value spent">${formatAmountShort(totalSpent)}</span>
                        </div>
                        <div class="overview-item">
                            <span class="overview-label">남은 예산</span>
                            <span class="overview-value ${remainingBudget < 0 ? 'over' : 'remaining'}">${formatAmountShort(remainingBudget)}</span>
                        </div>
                    </div>
                </div>
                <div class="budget-daily-hint">
                    <span class="hint-icon">💡</span>
                    <span>남은 ${daysRemaining}일 동안 하루 <strong>${formatAmountShort(Math.max(0, dailyAvailable))}</strong> 사용 가능</span>
                </div>
            </div>

            <!-- 분류별 예산 -->
            <div class="budget-categories">
                <h4>분류별 예산</h4>
                <div class="budget-list">
                    ${budgetItems.map(b => renderBudgetItem(b)).join('')}
                </div>
            </div>
        </div>

        <!-- 예산 추가/수정 모달 -->
        ${renderBudgetModal()}
    `;
}

function renderBudgetItem(budget) {
    const { category, name, monthly_amount, spent, remaining, percent, isOver, sub_items } = budget;
    const displayName = name || category; // 예산명이 있으면 사용, 없으면 카테고리
    const progressClass = isOver ? 'over' : percent > 80 ? 'warning' : 'normal';
    const subItems = sub_items || [];
    const hasSubItems = subItems.length > 0;

    return `
        <div class="budget-item ${isOver ? 'over-budget' : ''}" data-budget-id="${budget.id}">
            <div class="budget-item-header">
                <div class="budget-category-wrap">
                    ${hasSubItems ? `<button class="btn-icon toggle-subitems-btn" data-id="${budget.id}">▶</button>` : ''}
                    <span class="budget-category">${displayName}</span>
                    ${name ? `<span class="subitem-count">[${category}]</span>` : ''}
                    ${hasSubItems ? `<span class="subitem-count">(${subItems.length})</span>` : ''}
                </div>
                <div class="budget-item-actions">
                    <button class="btn-icon edit-budget-btn" data-id="${budget.id}" title="수정">✏️</button>
                    <button class="btn-icon delete-budget-btn" data-id="${budget.id}" title="삭제">🗑️</button>
                </div>
            </div>
            <div class="budget-item-progress">
                <div class="budget-bar">
                    <div class="budget-bar-fill ${progressClass}" style="width: ${Math.min(percent, 100)}%"></div>
                    ${isOver ? `<div class="budget-bar-over" style="width: ${Math.min(percent - 100, 50)}%"></div>` : ''}
                </div>
            </div>
            <div class="budget-item-details">
                <span class="budget-spent">${formatAmountShort(spent)} 사용</span>
                <span class="budget-separator">/</span>
                <span class="budget-total">${formatAmountShort(monthly_amount)}</span>
                <span class="budget-remaining ${isOver ? 'over' : ''}">
                    (${isOver ? '초과 ' : '남은 '}${formatAmountShort(Math.abs(remaining))})
                </span>
            </div>
            ${isOver ? `<div class="budget-warning">⚠️ 예산 초과!</div>` : ''}
            ${hasSubItems ? `
                <div class="budget-subitems collapsed" id="subitems-${budget.id}">
                    ${subItems.map((item, idx) => `
                        <div class="budget-subitem">
                            <span class="subitem-name">${item.name}</span>
                            <span class="subitem-amount">${formatAmountShort(item.amount)}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

function renderBudgetModal() {
    return `
        <div id="budgetModal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="budgetModalTitle">예산 추가</h3>
                    <button class="close-btn" id="closeBudgetModalBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>분류 (직접 입력 가능)</label>
                        <input type="text" id="budgetCategory" list="categoryList" placeholder="분류를 선택하거나 직접 입력">
                        <datalist id="categoryList">
                            ${EXPENSE_CATEGORIES.map(c => `<option value="${c}">`).join('')}
                        </datalist>
                    </div>
                    <div class="form-group">
                        <label>표시 이름 (선택, 비워두면 분류명 사용)</label>
                        <input type="text" id="budgetName" placeholder="예: 2월 생활비, 여행 예산 등">
                    </div>
                    <div class="form-group">
                        <label>월 예산 금액 (총액)</label>
                        <input type="number" id="budgetAmount" placeholder="0">
                    </div>
                    <div class="budget-preset-amounts">
                        <span class="preset-label">빠른 선택:</span>
                        <button class="preset-btn" data-amount="100000">10만</button>
                        <button class="preset-btn" data-amount="200000">20만</button>
                        <button class="preset-btn" data-amount="300000">30만</button>
                        <button class="preset-btn" data-amount="500000">50만</button>
                        <button class="preset-btn" data-amount="1000000">100만</button>
                    </div>

                    <!-- 세부 내역 섹션 -->
                    <div class="budget-subitems-section">
                        <div class="subitems-header">
                            <label>세부 내역 (선택)</label>
                            <button type="button" class="btn btn-sm" id="addSubItemBtn">+ 추가</button>
                        </div>
                        <div class="subitems-list" id="subItemsList">
                            <!-- 동적으로 채워짐 -->
                        </div>
                        <p class="subitems-hint">예: 생활비 안에 식비, 교통비, 유틸리티 등</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelBudgetBtn">취소</button>
                    <button class="btn btn-primary" id="saveBudgetBtn">저장</button>
                </div>
            </div>
        </div>
    `;
}

// 세부 내역 입력 필드 렌더링
function renderSubItemInput(name = '', amount = '', index) {
    return `
        <div class="subitem-input-row" data-index="${index}">
            <input type="text" class="subitem-name-input" placeholder="항목명" value="${name}">
            <input type="number" class="subitem-amount-input" placeholder="금액" value="${amount}">
            <button type="button" class="btn-icon remove-subitem-btn" data-index="${index}">🗑️</button>
        </div>
    `;
}

let tempSubItems = []; // 모달에서 임시로 관리하는 세부 내역

function initBudgetManager() {
    // 예산 추가 버튼
    document.getElementById('addBudgetBtn')?.addEventListener('click', () => openBudgetModal());

    // 모달 버튼
    document.getElementById('closeBudgetModalBtn')?.addEventListener('click', closeBudgetModal);
    document.getElementById('cancelBudgetBtn')?.addEventListener('click', closeBudgetModal);
    document.getElementById('saveBudgetBtn')?.addEventListener('click', saveBudgetItem);

    // 빠른 금액 선택
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('budgetAmount').value = btn.dataset.amount;
        });
    });

    // 세부 내역 추가 버튼
    document.getElementById('addSubItemBtn')?.addEventListener('click', addSubItemInput);

    // 예산 항목 이벤트
    attachBudgetItemEvents();
}

function addSubItemInput() {
    const list = document.getElementById('subItemsList');
    const index = list.children.length;
    const html = renderSubItemInput('', '', index);
    list.insertAdjacentHTML('beforeend', html);
    attachSubItemEvents();
}

function attachSubItemEvents() {
    document.querySelectorAll('.remove-subitem-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.target.closest('.subitem-input-row').remove();
        };
    });
}

function getSubItemsFromForm() {
    const rows = document.querySelectorAll('.subitem-input-row');
    const items = [];
    rows.forEach(row => {
        const name = row.querySelector('.subitem-name-input').value.trim();
        const amount = parseInt(row.querySelector('.subitem-amount-input').value) || 0;
        if (name && amount > 0) {
            items.push({ name, amount });
        }
    });
    return items;
}

function attachBudgetItemEvents() {
    // 세부 내역 토글
    document.querySelectorAll('.toggle-subitems-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const subitemsEl = document.getElementById(`subitems-${id}`);
            if (subitemsEl) {
                const isCollapsed = subitemsEl.classList.toggle('collapsed');
                btn.textContent = isCollapsed ? '▶' : '▼';
            }
        });
    });

    document.querySelectorAll('.edit-budget-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const budget = budgets.find(b => b.id === id);
            if (budget) openBudgetModal(budget);
        });
    });

    document.querySelectorAll('.delete-budget-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (confirm('이 예산을 삭제하시겠습니까?')) {
                const result = await deleteBudget(id);
                if (result.success) {
                    await loadToolsData();
                    renderCurrentTool();
                } else {
                    alert('삭제 실패: ' + result.error);
                }
            }
        });
    });
}

function openBudgetModal(budget = null) {
    editingBudget = budget;
    document.getElementById('budgetModal').style.display = 'flex';
    document.getElementById('budgetModalTitle').textContent = budget ? '예산 수정' : '예산 추가';

    const categorySelect = document.getElementById('budgetCategory');
    const budgetNameInput = document.getElementById('budgetName');
    const subItemsList = document.getElementById('subItemsList');

    // 세부 내역 초기화
    subItemsList.innerHTML = '';

    if (budget) {
        categorySelect.value = budget.category;
        // 수정 시에도 카테고리 변경 가능
        budgetNameInput.value = budget.name || '';
        document.getElementById('budgetAmount').value = budget.monthly_amount;

        // 기존 세부 내역 로드
        const subItems = budget.sub_items || [];
        subItems.forEach((item, idx) => {
            subItemsList.insertAdjacentHTML('beforeend', renderSubItemInput(item.name, item.amount, idx));
        });
        attachSubItemEvents();
    } else {
        // 새 예산 추가 - 입력 필드 초기화
        categorySelect.value = '';
        budgetNameInput.value = '';
        document.getElementById('budgetAmount').value = '';
    }
}

function closeBudgetModal() {
    document.getElementById('budgetModal').style.display = 'none';
    editingBudget = null;
}

async function saveBudgetItem() {
    const category = document.getElementById('budgetCategory').value;
    const budgetName = document.getElementById('budgetName').value.trim();
    const amount = parseInt(document.getElementById('budgetAmount').value) || 0;
    const subItems = getSubItemsFromForm();

    if (!category) {
        alert('분류를 입력해주세요.');
        return;
    }
    if (amount <= 0) {
        alert('예산 금액을 입력해주세요.');
        return;
    }

    // 세부 내역 합계가 총액을 초과하는지 확인
    const subItemsTotal = subItems.reduce((sum, item) => sum + item.amount, 0);
    if (subItemsTotal > amount) {
        alert(`세부 내역 합계(${formatAmountShort(subItemsTotal)})가 총 예산(${formatAmountShort(amount)})을 초과합니다.`);
        return;
    }

    const data = {
        category,
        name: budgetName || null, // 비어있으면 null
        monthly_amount: amount,
        sub_items: subItems
    };

    let result;
    if (editingBudget) {
        result = await updateBudget(editingBudget.id, data);
    } else {
        result = await createBudget(data);
    }

    if (result.success) {
        closeBudgetModal();
        await loadToolsData();
        renderCurrentTool();
    } else {
        alert('저장 실패: ' + result.error);
    }
}

// ============================================
// 구독 관리
// ============================================

const SUBSCRIPTION_CATEGORIES = ['영상', '음악', '소프트웨어', '게임', '뉴스/매거진', '클라우드', '기타'];

let editingSubscription = null;

function renderSubscriptions() {
    const activeSubscriptions = subscriptions.filter(s => s.is_active);
    const inactiveSubscriptions = subscriptions.filter(s => !s.is_active);

    const totalMonthly = activeSubscriptions.reduce((sum, s) => {
        if (s.billing_cycle === 'yearly') return sum + Math.round(s.amount / 12);
        if (s.billing_cycle === 'weekly') return sum + (s.amount * 4);
        return sum + s.amount;
    }, 0);

    const totalYearly = totalMonthly * 12;

    // 다가오는 결제
    const today = new Date();
    const upcomingPayments = activeSubscriptions
        .filter(s => s.next_billing_date)
        .sort((a, b) => new Date(a.next_billing_date) - new Date(b.next_billing_date))
        .slice(0, 5);

    return `
        <div class="subscriptions-container">
            <div class="subscriptions-header">
                <h3>📺 구독 서비스</h3>
                <button class="btn btn-primary" id="addSubscriptionBtn">+ 구독 추가</button>
            </div>

            <!-- 구독 요약 -->
            <div class="subscription-summary">
                <div class="summary-card">
                    <div class="summary-icon">💳</div>
                    <div class="summary-info">
                        <div class="summary-value">${formatAmountShort(totalMonthly)}</div>
                        <div class="summary-label">월 구독료</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">📅</div>
                    <div class="summary-info">
                        <div class="summary-value">${formatAmountShort(totalYearly)}</div>
                        <div class="summary-label">연간 예상</div>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">📊</div>
                    <div class="summary-info">
                        <div class="summary-value">${activeSubscriptions.length}개</div>
                        <div class="summary-label">활성 구독</div>
                    </div>
                </div>
            </div>

            <!-- 다가오는 결제 -->
            ${upcomingPayments.length > 0 ? `
                <div class="upcoming-payments">
                    <h4>📆 다가오는 결제</h4>
                    <div class="upcoming-list">
                        ${upcomingPayments.map(s => {
                            const daysUntil = Math.ceil((new Date(s.next_billing_date) - today) / (1000 * 60 * 60 * 24));
                            const isUrgent = daysUntil <= 3;
                            return `
                                <div class="upcoming-item ${isUrgent ? 'urgent' : ''}">
                                    <span class="upcoming-name">${s.name}</span>
                                    <span class="upcoming-date">${isUrgent ? `D-${daysUntil}` : s.next_billing_date}</span>
                                    <span class="upcoming-amount">${formatAmountShort(s.amount)}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- 구독 목록 -->
            <div class="subscription-list">
                <h4>활성 구독 (${activeSubscriptions.length})</h4>
                ${activeSubscriptions.length === 0 ? `
                    <div class="empty-state">
                        <p>등록된 구독이 없습니다</p>
                        <p class="hint">위의 '+ 구독 추가' 버튼으로 구독 서비스를 등록하세요</p>
                    </div>
                ` : `
                    <div class="subscriptions-grid">
                        ${activeSubscriptions.map(s => renderSubscriptionCard(s)).join('')}
                    </div>
                `}

                ${inactiveSubscriptions.length > 0 ? `
                    <h4 style="margin-top: var(--space-5);">비활성 구독 (${inactiveSubscriptions.length})</h4>
                    <div class="subscriptions-grid inactive">
                        ${inactiveSubscriptions.map(s => renderSubscriptionCard(s)).join('')}
                    </div>
                ` : ''}
            </div>
        </div>

        <!-- 구독 추가/수정 모달 -->
        ${renderSubscriptionModal()}
    `;
}

function renderSubscriptionCard(sub) {
    const billingText = sub.billing_cycle === 'yearly' ? '연간' : sub.billing_cycle === 'weekly' ? '주간' : '월간';

    return `
        <div class="subscription-card ${sub.is_active ? '' : 'inactive'}">
            <div class="subscription-card-header">
                <span class="subscription-name">${sub.name}</span>
                <span class="subscription-category">${sub.category || '기타'}</span>
            </div>
            <div class="subscription-card-body">
                <div class="subscription-amount">${formatAmountShort(sub.amount)}<span class="billing-cycle">/${billingText}</span></div>
                ${sub.next_billing_date ? `<div class="subscription-next">다음 결제: ${sub.next_billing_date}</div>` : ''}
            </div>
            <div class="subscription-card-actions">
                <button class="btn-icon edit-subscription-btn" data-id="${sub.id}" title="수정">✏️</button>
                <button class="btn-icon toggle-subscription-btn" data-id="${sub.id}" data-active="${sub.is_active}" title="${sub.is_active ? '비활성화' : '활성화'}">
                    ${sub.is_active ? '⏸️' : '▶️'}
                </button>
                <button class="btn-icon delete-subscription-btn" data-id="${sub.id}" title="삭제">🗑️</button>
            </div>
        </div>
    `;
}

function renderSubscriptionModal() {
    return `
        <div id="subscriptionModal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="subscriptionModalTitle">구독 추가</h3>
                    <button class="close-btn" id="closeSubscriptionModalBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>서비스명 *</label>
                        <input type="text" id="subName" placeholder="예: Netflix, YouTube Premium">
                    </div>
                    <div class="form-group">
                        <label>분류</label>
                        <select id="subCategory">
                            ${SUBSCRIPTION_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>구독료 *</label>
                            <input type="number" id="subAmount" placeholder="0">
                        </div>
                        <div class="form-group">
                            <label>결제 주기</label>
                            <select id="subBillingCycle">
                                <option value="monthly">월간</option>
                                <option value="yearly">연간</option>
                                <option value="weekly">주간</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>결제일</label>
                            <select id="subBillingDay">
                                ${Array.from({length: 31}, (_, i) => `<option value="${i+1}">${i+1}일</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>다음 결제일</label>
                            <input type="date" id="subNextBilling">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>메모</label>
                        <input type="text" id="subNotes" placeholder="메모, 공유 여부 등">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelSubscriptionBtn">취소</button>
                    <button class="btn btn-primary" id="saveSubscriptionBtn">저장</button>
                </div>
            </div>
        </div>
    `;
}

function initSubscriptions() {
    // 추가 버튼
    document.getElementById('addSubscriptionBtn')?.addEventListener('click', () => openSubscriptionModal());

    // 모달 버튼
    document.getElementById('closeSubscriptionModalBtn')?.addEventListener('click', closeSubscriptionModal);
    document.getElementById('cancelSubscriptionBtn')?.addEventListener('click', closeSubscriptionModal);
    document.getElementById('saveSubscriptionBtn')?.addEventListener('click', saveSubscriptionItem);

    // 구독 카드 이벤트
    attachSubscriptionEvents();
}

function attachSubscriptionEvents() {
    document.querySelectorAll('.edit-subscription-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sub = subscriptions.find(s => s.id === btn.dataset.id);
            if (sub) openSubscriptionModal(sub);
        });
    });

    document.querySelectorAll('.toggle-subscription-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const isActive = btn.dataset.active === 'true';
            const result = await updateSubscription(id, { is_active: !isActive });
            if (result.success) {
                await loadToolsData();
                renderCurrentTool();
            }
        });
    });

    document.querySelectorAll('.delete-subscription-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('이 구독을 삭제하시겠습니까?')) {
                const result = await deleteSubscription(btn.dataset.id);
                if (result.success) {
                    await loadToolsData();
                    renderCurrentTool();
                } else {
                    alert('삭제 실패: ' + result.error);
                }
            }
        });
    });
}

function openSubscriptionModal(sub = null) {
    editingSubscription = sub;
    document.getElementById('subscriptionModal').style.display = 'flex';
    document.getElementById('subscriptionModalTitle').textContent = sub ? '구독 수정' : '구독 추가';

    if (sub) {
        document.getElementById('subName').value = sub.name || '';
        document.getElementById('subCategory').value = sub.category || '기타';
        document.getElementById('subAmount').value = sub.amount || '';
        document.getElementById('subBillingCycle').value = sub.billing_cycle || 'monthly';
        document.getElementById('subBillingDay').value = sub.billing_day || 1;
        document.getElementById('subNextBilling').value = sub.next_billing_date || '';
        document.getElementById('subNotes').value = sub.notes || '';
    } else {
        document.getElementById('subName').value = '';
        document.getElementById('subCategory').value = '영상';
        document.getElementById('subAmount').value = '';
        document.getElementById('subBillingCycle').value = 'monthly';
        document.getElementById('subBillingDay').value = 1;
        document.getElementById('subNextBilling').value = '';
        document.getElementById('subNotes').value = '';
    }
}

function closeSubscriptionModal() {
    document.getElementById('subscriptionModal').style.display = 'none';
    editingSubscription = null;
}

async function saveSubscriptionItem() {
    const name = document.getElementById('subName').value.trim();
    const amount = parseInt(document.getElementById('subAmount').value) || 0;

    if (!name) {
        alert('서비스명을 입력해주세요.');
        return;
    }
    if (amount <= 0) {
        alert('구독료를 입력해주세요.');
        return;
    }

    const data = {
        name,
        category: document.getElementById('subCategory').value,
        amount,
        billing_cycle: document.getElementById('subBillingCycle').value,
        billing_day: parseInt(document.getElementById('subBillingDay').value) || 1,
        next_billing_date: document.getElementById('subNextBilling').value || null,
        notes: document.getElementById('subNotes').value.trim() || null
    };

    let result;
    if (editingSubscription) {
        result = await updateSubscription(editingSubscription.id, data);
    } else {
        result = await createSubscription(data);
    }

    if (result.success) {
        closeSubscriptionModal();
        await loadToolsData();
        renderCurrentTool();
    } else {
        alert('저장 실패: ' + result.error);
    }
}

// ============================================
// 목표 관리
// ============================================

const GOAL_CATEGORIES = ['저축', '투자', '부채상환', '구매', '여행', '교육', '기타'];
const GOAL_ICONS = ['🎯', '💰', '📈', '🏠', '🚗', '✈️', '📚', '💎', '🎓', '💪'];
const GOAL_COLORS = ['#667eea', '#4ade80', '#f59e0b', '#f87171', '#a78bfa', '#22d3d8', '#fb923c', '#ec4899'];

let editingGoal = null;

function renderGoals() {
    const activeGoals = goals.filter(g => g.is_active && !g.is_completed);
    const completedGoals = goals.filter(g => g.is_completed);

    // 전체 진행률 계산
    const totalTarget = activeGoals.reduce((sum, g) => sum + (g.target_amount || 0), 0);
    const totalCurrent = activeGoals.reduce((sum, g) => sum + (g.current_amount || 0), 0);
    const overallPercent = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

    return `
        <div class="goals-container">
            <div class="goals-header">
                <h3>🎯 저축 목표</h3>
                <button class="btn btn-primary" id="addGoalBtn">+ 목표 추가</button>
            </div>

            <!-- 전체 요약 -->
            <div class="goals-overview">
                <div class="goals-progress-main">
                    <div class="goals-progress-ring">
                        <svg viewBox="0 0 100 100">
                            <circle class="progress-bg" cx="50" cy="50" r="45"/>
                            <circle class="progress-fill" cx="50" cy="50" r="45"
                                    stroke-dasharray="${Math.min(overallPercent, 100) * 2.83} 283"/>
                        </svg>
                        <div class="progress-text">
                            <span class="progress-percent">${overallPercent}%</span>
                            <span class="progress-label">달성</span>
                        </div>
                    </div>
                    <div class="goals-stats">
                        <div class="stat-item">
                            <span class="stat-value">${activeGoals.length}</span>
                            <span class="stat-label">진행중</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${completedGoals.length}</span>
                            <span class="stat-label">완료</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${formatAmountShort(totalCurrent)}</span>
                            <span class="stat-label">모은 금액</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 진행 중인 목표 -->
            <div class="goals-section">
                <h4>진행 중인 목표 (${activeGoals.length})</h4>
                ${activeGoals.length === 0 ? `
                    <div class="empty-state">
                        <p>설정된 목표가 없습니다</p>
                        <p class="hint">위의 '+ 목표 추가' 버튼으로 새로운 목표를 설정하세요</p>
                    </div>
                ` : `
                    <div class="goals-list">
                        ${activeGoals.map(g => renderGoalCard(g)).join('')}
                    </div>
                `}
            </div>

            <!-- 완료된 목표 -->
            ${completedGoals.length > 0 ? `
                <div class="goals-section completed-section">
                    <h4>🎉 완료된 목표 (${completedGoals.length})</h4>
                    <div class="goals-list completed">
                        ${completedGoals.map(g => renderGoalCard(g, true)).join('')}
                    </div>
                </div>
            ` : ''}
        </div>

        <!-- 목표 추가/수정 모달 -->
        ${renderGoalModal()}
    `;
}

function renderGoalCard(goal, isCompleted = false) {
    const percent = goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0;
    const remaining = goal.target_amount - goal.current_amount;
    const color = goal.color || '#667eea';
    const icon = goal.icon || '🎯';

    // 남은 기간 계산
    let daysRemaining = '';
    if (goal.target_date) {
        const targetDate = new Date(goal.target_date);
        const today = new Date();
        const diffDays = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
            daysRemaining = `D-${diffDays}`;
        } else if (diffDays === 0) {
            daysRemaining = 'D-Day';
        } else {
            daysRemaining = `D+${Math.abs(diffDays)}`;
        }
    }

    return `
        <div class="goal-card ${isCompleted ? 'completed' : ''}" data-id="${goal.id}" style="--goal-color: ${color}">
            <div class="goal-card-header">
                <div class="goal-icon-wrap" style="background: ${color}20; border-color: ${color}">
                    <span class="goal-icon">${icon}</span>
                </div>
                <div class="goal-title-wrap">
                    <span class="goal-name">${goal.name}</span>
                    ${goal.category ? `<span class="goal-category">${goal.category}</span>` : ''}
                </div>
                ${daysRemaining ? `<span class="goal-deadline ${daysRemaining.startsWith('D+') ? 'overdue' : ''}">${daysRemaining}</span>` : ''}
            </div>

            <div class="goal-card-body">
                <div class="goal-progress-bar">
                    <div class="goal-progress-fill" style="width: ${Math.min(percent, 100)}%; background: ${color}"></div>
                </div>
                <div class="goal-amounts">
                    <span class="goal-current">${formatAmountShort(goal.current_amount)}</span>
                    <span class="goal-target">/ ${formatAmountShort(goal.target_amount)}</span>
                    <span class="goal-percent">${percent}%</span>
                </div>
                ${!isCompleted && remaining > 0 ? `
                    <div class="goal-remaining">
                        남은 금액: <strong>${formatAmountShort(remaining)}</strong>
                    </div>
                ` : ''}
            </div>

            <div class="goal-card-actions">
                ${!isCompleted ? `
                    <button class="btn-icon add-amount-btn" data-id="${goal.id}" title="금액 추가">💵</button>
                ` : ''}
                <button class="btn-icon edit-goal-btn" data-id="${goal.id}" title="수정">✏️</button>
                ${!isCompleted ? `
                    <button class="btn-icon complete-goal-btn" data-id="${goal.id}" title="완료">✅</button>
                ` : ''}
                <button class="btn-icon delete-goal-btn" data-id="${goal.id}" title="삭제">🗑️</button>
            </div>
        </div>
    `;
}

function renderGoalModal() {
    return `
        <div id="goalModal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="goalModalTitle">목표 추가</h3>
                    <button class="close-btn" id="closeGoalModalBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>목표명 *</label>
                        <input type="text" id="goalName" placeholder="예: 비상금 모으기, 해외여행">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>분류</label>
                            <select id="goalCategory">
                                ${GOAL_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>목표일</label>
                            <input type="date" id="goalTargetDate">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>목표 금액 *</label>
                            <input type="number" id="goalTargetAmount" placeholder="0">
                        </div>
                        <div class="form-group">
                            <label>현재 금액</label>
                            <input type="number" id="goalCurrentAmount" placeholder="0" value="0">
                        </div>
                    </div>
                    <div class="goal-preset-amounts">
                        <span class="preset-label">빠른 선택:</span>
                        <button class="preset-btn" data-amount="1000000">100만</button>
                        <button class="preset-btn" data-amount="3000000">300만</button>
                        <button class="preset-btn" data-amount="5000000">500만</button>
                        <button class="preset-btn" data-amount="10000000">1000만</button>
                    </div>
                    <div class="form-group">
                        <label>아이콘</label>
                        <div class="goal-icon-picker" id="goalIconPicker">
                            ${GOAL_ICONS.map((icon, idx) => `
                                <button type="button" class="icon-option ${idx === 0 ? 'selected' : ''}" data-icon="${icon}">${icon}</button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>색상</label>
                        <div class="goal-color-picker" id="goalColorPicker">
                            ${GOAL_COLORS.map((color, idx) => `
                                <button type="button" class="color-option ${idx === 0 ? 'selected' : ''}" data-color="${color}" style="background: ${color}"></button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>메모</label>
                        <input type="text" id="goalNotes" placeholder="목표에 대한 메모">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelGoalBtn">취소</button>
                    <button class="btn btn-primary" id="saveGoalBtn">저장</button>
                </div>
            </div>
        </div>

        <!-- 금액 추가 모달 -->
        <div id="addAmountModal" class="modal" style="display: none;">
            <div class="modal-content modal-small">
                <div class="modal-header">
                    <h3>금액 추가</h3>
                    <button class="close-btn" id="closeAddAmountModalBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>추가할 금액</label>
                        <input type="number" id="addAmountValue" placeholder="0">
                    </div>
                    <div class="goal-preset-amounts">
                        <button class="preset-btn" data-amount="10000">1만</button>
                        <button class="preset-btn" data-amount="50000">5만</button>
                        <button class="preset-btn" data-amount="100000">10만</button>
                        <button class="preset-btn" data-amount="500000">50만</button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelAddAmountBtn">취소</button>
                    <button class="btn btn-primary" id="confirmAddAmountBtn">추가</button>
                </div>
            </div>
        </div>
    `;
}

let currentGoalForAmount = null;

function initGoals() {
    // 목표 추가 버튼
    document.getElementById('addGoalBtn')?.addEventListener('click', () => openGoalModal());

    // 목표 모달 버튼
    document.getElementById('closeGoalModalBtn')?.addEventListener('click', closeGoalModal);
    document.getElementById('cancelGoalBtn')?.addEventListener('click', closeGoalModal);
    document.getElementById('saveGoalBtn')?.addEventListener('click', saveGoal);

    // 금액 추가 모달 버튼
    document.getElementById('closeAddAmountModalBtn')?.addEventListener('click', closeAddAmountModal);
    document.getElementById('cancelAddAmountBtn')?.addEventListener('click', closeAddAmountModal);
    document.getElementById('confirmAddAmountBtn')?.addEventListener('click', confirmAddAmount);

    // 빠른 금액 선택 (목표 모달)
    document.querySelectorAll('.goal-preset-amounts .preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal.id === 'goalModal') {
                document.getElementById('goalTargetAmount').value = btn.dataset.amount;
            } else if (modal.id === 'addAmountModal') {
                document.getElementById('addAmountValue').value = btn.dataset.amount;
            }
        });
    });

    // 아이콘 선택
    document.querySelectorAll('#goalIconPicker .icon-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#goalIconPicker .icon-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    // 색상 선택
    document.querySelectorAll('#goalColorPicker .color-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#goalColorPicker .color-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    // 목표 카드 이벤트
    attachGoalCardEvents();
}

function attachGoalCardEvents() {
    // 금액 추가
    document.querySelectorAll('.add-amount-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const goal = goals.find(g => g.id === btn.dataset.id);
            if (goal) openAddAmountModal(goal);
        });
    });

    // 수정
    document.querySelectorAll('.edit-goal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const goal = goals.find(g => g.id === btn.dataset.id);
            if (goal) openGoalModal(goal);
        });
    });

    // 완료 처리
    document.querySelectorAll('.complete-goal-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm('이 목표를 완료로 표시하시겠습니까?')) {
                const result = await updateGoal(btn.dataset.id, { is_completed: true });
                if (result.success) {
                    await loadToolsData();
                    renderCurrentTool();
                } else {
                    alert('완료 처리 실패: ' + result.error);
                }
            }
        });
    });

    // 삭제
    document.querySelectorAll('.delete-goal-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm('이 목표를 삭제하시겠습니까?')) {
                const result = await deleteGoal(btn.dataset.id);
                if (result.success) {
                    await loadToolsData();
                    renderCurrentTool();
                } else {
                    alert('삭제 실패: ' + result.error);
                }
            }
        });
    });
}

function openGoalModal(goal = null) {
    editingGoal = goal;
    document.getElementById('goalModal').style.display = 'flex';
    document.getElementById('goalModalTitle').textContent = goal ? '목표 수정' : '목표 추가';

    if (goal) {
        document.getElementById('goalName').value = goal.name || '';
        document.getElementById('goalCategory').value = goal.category || '저축';
        document.getElementById('goalTargetDate').value = goal.target_date || '';
        document.getElementById('goalTargetAmount').value = goal.target_amount || '';
        document.getElementById('goalCurrentAmount').value = goal.current_amount || 0;
        document.getElementById('goalNotes').value = goal.notes || '';

        // 아이콘 선택
        const iconBtn = document.querySelector(`#goalIconPicker .icon-option[data-icon="${goal.icon || '🎯'}"]`);
        document.querySelectorAll('#goalIconPicker .icon-option').forEach(b => b.classList.remove('selected'));
        if (iconBtn) iconBtn.classList.add('selected');

        // 색상 선택
        const colorBtn = document.querySelector(`#goalColorPicker .color-option[data-color="${goal.color || '#667eea'}"]`);
        document.querySelectorAll('#goalColorPicker .color-option').forEach(b => b.classList.remove('selected'));
        if (colorBtn) colorBtn.classList.add('selected');
    } else {
        document.getElementById('goalName').value = '';
        document.getElementById('goalCategory').value = '저축';
        document.getElementById('goalTargetDate').value = '';
        document.getElementById('goalTargetAmount').value = '';
        document.getElementById('goalCurrentAmount').value = 0;
        document.getElementById('goalNotes').value = '';

        // 첫 번째 아이콘/색상 선택
        document.querySelectorAll('#goalIconPicker .icon-option').forEach((b, i) => b.classList.toggle('selected', i === 0));
        document.querySelectorAll('#goalColorPicker .color-option').forEach((b, i) => b.classList.toggle('selected', i === 0));
    }
}

function closeGoalModal() {
    document.getElementById('goalModal').style.display = 'none';
    editingGoal = null;
}

async function saveGoal() {
    const name = document.getElementById('goalName').value.trim();
    const targetAmount = parseInt(document.getElementById('goalTargetAmount').value) || 0;

    if (!name) {
        alert('목표명을 입력해주세요.');
        return;
    }
    if (targetAmount <= 0) {
        alert('목표 금액을 입력해주세요.');
        return;
    }

    const selectedIcon = document.querySelector('#goalIconPicker .icon-option.selected')?.dataset.icon || '🎯';
    const selectedColor = document.querySelector('#goalColorPicker .color-option.selected')?.dataset.color || '#667eea';

    const data = {
        name,
        category: document.getElementById('goalCategory').value,
        target_amount: targetAmount,
        current_amount: parseInt(document.getElementById('goalCurrentAmount').value) || 0,
        target_date: document.getElementById('goalTargetDate').value || null,
        icon: selectedIcon,
        color: selectedColor,
        notes: document.getElementById('goalNotes').value.trim() || null
    };

    let result;
    if (editingGoal) {
        result = await updateGoal(editingGoal.id, data);
    } else {
        result = await createGoal(data);
    }

    if (result.success) {
        closeGoalModal();
        await loadToolsData();
        renderCurrentTool();
    } else {
        alert('저장 실패: ' + result.error);
    }
}

function openAddAmountModal(goal) {
    currentGoalForAmount = goal;
    document.getElementById('addAmountModal').style.display = 'flex';
    document.getElementById('addAmountValue').value = '';
}

function closeAddAmountModal() {
    document.getElementById('addAmountModal').style.display = 'none';
    currentGoalForAmount = null;
}

async function confirmAddAmount() {
    if (!currentGoalForAmount) return;

    const addAmount = parseInt(document.getElementById('addAmountValue').value) || 0;
    if (addAmount <= 0) {
        alert('추가할 금액을 입력해주세요.');
        return;
    }

    const newAmount = (currentGoalForAmount.current_amount || 0) + addAmount;
    const result = await updateGoal(currentGoalForAmount.id, { current_amount: newAmount });

    if (result.success) {
        closeAddAmountModal();
        await loadToolsData();
        renderCurrentTool();

        // 목표 달성 시 알림
        if (newAmount >= currentGoalForAmount.target_amount) {
            alert(`🎉 축하합니다! "${currentGoalForAmount.name}" 목표를 달성했습니다!`);
        }
    } else {
        alert('금액 추가 실패: ' + result.error);
    }
}

// ============================================
// 캘린더 뷰
// ============================================

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function renderCalendar() {
    return `
        <div class="calendar-container">
            <!-- 이번 주 결제 하이라이트 -->
            <div class="weekly-payments-highlight" id="weeklyPayments">
                <!-- 동적으로 채워짐 -->
            </div>

            <div class="calendar-header">
                <button class="cal-nav-btn" id="prevMonth">◀</button>
                <h3 class="cal-title" id="calTitle">${currentYear}년 ${currentMonth + 1}월</h3>
                <button class="cal-nav-btn" id="nextMonth">▶</button>
            </div>

            <div class="calendar-grid">
                <div class="cal-weekday">일</div>
                <div class="cal-weekday">월</div>
                <div class="cal-weekday">화</div>
                <div class="cal-weekday">수</div>
                <div class="cal-weekday">목</div>
                <div class="cal-weekday">금</div>
                <div class="cal-weekday">토</div>
                <div id="calendarDays"></div>
            </div>

            <div class="calendar-legend">
                <span class="legend-item"><span class="legend-dot recurring"></span> 고정지출</span>
                <span class="legend-item"><span class="legend-dot staking"></span> 스테이킹 언락</span>
                <span class="legend-item"><span class="legend-dot airdrop"></span> 에어드랍</span>
                <span class="legend-item"><span class="legend-dot debt"></span> 대출 상환</span>
            </div>

            <div class="calendar-events" id="calendarEvents">
                <h4>이번 달 일정</h4>
                <div class="events-list" id="eventsList">
                    <!-- 동적으로 채워짐 -->
                </div>
            </div>
        </div>
    `;
}

function initCalendar() {
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateCalendar();
    });

    updateCalendar();
}

function updateCalendar() {
    document.getElementById('calTitle').textContent = `${currentYear}년 ${currentMonth + 1}월`;

    const daysContainer = document.getElementById('calendarDays');
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();

    // 이번 달 이벤트 수집
    const events = collectMonthEvents(currentYear, currentMonth);

    // 이번 주 결제 하이라이트 업데이트
    updateWeeklyPaymentsHighlight();

    let html = '';

    // 빈 칸 채우기
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="cal-day empty"></div>';
    }

    // 날짜 채우기
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = events.filter(e => e.date === dateStr);
        const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;

        let eventDots = '';
        if (dayEvents.length > 0) {
            const types = [...new Set(dayEvents.map(e => e.type))];
            eventDots = types.map(t => `<span class="event-dot ${t}"></span>`).join('');
        }

        html += `
            <div class="cal-day ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}" data-date="${dateStr}">
                <span class="day-number">${day}</span>
                <div class="day-dots">${eventDots}</div>
            </div>
        `;
    }

    daysContainer.innerHTML = html;

    // 이벤트 목록 업데이트
    updateEventsList(events);

    // 날짜 클릭 이벤트
    document.querySelectorAll('.cal-day:not(.empty)').forEach(dayEl => {
        dayEl.addEventListener('click', () => {
            const date = dayEl.dataset.date;
            const dayEvents = events.filter(e => e.date === date);
            if (dayEvents.length > 0) {
                showDayEvents(date, dayEvents);
            }
        });
    });
}

// 이번 주 결제 하이라이트
function updateWeeklyPaymentsHighlight() {
    const container = document.getElementById('weeklyPayments');
    if (!container) return;

    const today = new Date();
    const weekLater = new Date(today);
    weekLater.setDate(weekLater.getDate() + 7);

    // 다음 7일간의 이벤트 수집
    const upcomingEvents = [];

    // 이번 달과 다음 달 이벤트 확인
    const thisMonthEvents = collectMonthEvents(today.getFullYear(), today.getMonth());
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const nextMonthEvents = collectMonthEvents(nextMonth.getFullYear(), nextMonth.getMonth());

    [...thisMonthEvents, ...nextMonthEvents].forEach(event => {
        const eventDate = new Date(event.date);
        if (eventDate >= today && eventDate <= weekLater) {
            const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
            upcomingEvents.push({ ...event, daysUntil });
        }
    });

    // 날짜순 정렬
    upcomingEvents.sort((a, b) => a.daysUntil - b.daysUntil);

    // 지출 이벤트만 필터링 (recurring, debt)
    const paymentEvents = upcomingEvents.filter(e => e.type === 'recurring' || e.type === 'debt');
    const totalAmount = paymentEvents.reduce((sum, e) => sum + (e.amount || 0), 0);

    if (paymentEvents.length === 0) {
        container.innerHTML = `
            <div class="weekly-highlight-content no-payments">
                <span class="highlight-icon">✨</span>
                <span class="highlight-text">이번 주 예정된 결제가 없습니다</span>
            </div>
        `;
        return;
    }

    const urgentPayments = paymentEvents.filter(e => e.daysUntil <= 3);
    const isUrgent = urgentPayments.length > 0;

    container.innerHTML = `
        <div class="weekly-highlight-header ${isUrgent ? 'urgent' : ''}">
            <span class="highlight-icon">${isUrgent ? '🔔' : '📅'}</span>
            <span class="highlight-title">이번 주 결제 예정</span>
            <span class="highlight-total">${formatAmountShort(totalAmount)}</span>
        </div>
        <div class="weekly-highlight-items">
            ${paymentEvents.slice(0, 4).map(event => {
                const dayLabel = event.daysUntil === 0 ? '오늘' :
                                 event.daysUntil === 1 ? '내일' :
                                 `D-${event.daysUntil}`;
                const urgentClass = event.daysUntil <= 2 ? 'urgent' : '';
                return `
                    <div class="weekly-item ${urgentClass}">
                        <span class="weekly-item-day ${urgentClass}">${dayLabel}</span>
                        <span class="weekly-item-title">${event.title}</span>
                        <span class="weekly-item-amount">${formatAmountShort(event.amount)}</span>
                    </div>
                `;
            }).join('')}
            ${paymentEvents.length > 4 ? `<div class="weekly-more">외 ${paymentEvents.length - 4}건</div>` : ''}
        </div>
    `;
}

function collectMonthEvents(year, month) {
    const events = [];
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

    // 고정지출 (매월 반복)
    recurringItems.forEach(item => {
        if (item.type === 'expense' && item.day_of_month) {
            const date = `${monthStr}-${String(item.day_of_month).padStart(2, '0')}`;
            events.push({
                date,
                type: 'recurring',
                title: item.description || item.category,
                amount: item.amount,
                icon: '💸'
            });
        }
    });

    // 대출 상환일
    debts.forEach(debt => {
        if (debt.payment_day) {
            const date = `${monthStr}-${String(debt.payment_day).padStart(2, '0')}`;
            events.push({
                date,
                type: 'debt',
                title: `${debt.name} 상환`,
                amount: debt.monthly_payment,
                icon: '💳'
            });
        }
    });

    // 스테이킹 언락
    stakingList.forEach(item => {
        if (item.staking_unlock_date && item.staking_unlock_date.startsWith(monthStr)) {
            events.push({
                date: item.staking_unlock_date,
                type: 'staking',
                title: `${item.name} 언락`,
                amount: item.current_value,
                icon: '🔓'
            });
        }
    });

    // 에어드랍 (예정일이 있는 경우)
    airdropList.forEach(item => {
        if (item.airdrop_date && item.airdrop_date.startsWith(monthStr)) {
            events.push({
                date: item.airdrop_date,
                type: 'airdrop',
                title: item.name,
                amount: item.airdrop_expected_value,
                icon: '🎁'
            });
        }
    });

    return events.sort((a, b) => a.date.localeCompare(b.date));
}

function updateEventsList(events) {
    const list = document.getElementById('eventsList');

    if (events.length === 0) {
        list.innerHTML = '<div class="empty-events">이번 달 예정된 일정이 없습니다</div>';
        return;
    }

    list.innerHTML = events.map(e => `
        <div class="event-item ${e.type}">
            <span class="event-icon">${e.icon}</span>
            <div class="event-info">
                <div class="event-title">${e.title}</div>
                <div class="event-date">${e.date.split('-').slice(1).join('/')}</div>
            </div>
            <div class="event-amount">${e.amount ? formatAmountShort(e.amount) : ''}</div>
        </div>
    `).join('');
}

function showDayEvents(date, events) {
    const [year, month, day] = date.split('-');
    alert(`${month}/${day} 일정:\n\n${events.map(e => `${e.icon} ${e.title}: ${e.amount ? formatAmount(e.amount) : ''}`).join('\n')}`);
}

// ============================================
// 고정 지출 관리
// ============================================

let editingRecurring = null;

function renderRecurringExpenses() {
    const expenseItems = recurringItems.filter(i => i.type === 'expense');
    const incomeItems = recurringItems.filter(i => i.type === 'income');

    const totalMonthlyExpense = expenseItems.reduce((sum, i) => sum + (i.amount || 0), 0);
    const totalMonthlyIncome = incomeItems.reduce((sum, i) => sum + (i.amount || 0), 0);

    return `
        <div class="recurring-container">
            <div class="recurring-header">
                <h3>💳 고정 수입/지출</h3>
                <button class="btn btn-primary" id="addRecurringBtn">+ 추가</button>
            </div>

            <div class="recurring-summary">
                <div class="recurring-summary-card income">
                    <div class="summary-label">월 고정 수입</div>
                    <div class="summary-value positive">${formatAmountShort(totalMonthlyIncome)}</div>
                    <div class="summary-count">${incomeItems.length}건</div>
                </div>
                <div class="recurring-summary-card expense">
                    <div class="summary-label">월 고정 지출</div>
                    <div class="summary-value negative">${formatAmountShort(totalMonthlyExpense)}</div>
                    <div class="summary-count">${expenseItems.length}건</div>
                </div>
                <div class="recurring-summary-card net">
                    <div class="summary-label">월 순수익</div>
                    <div class="summary-value ${totalMonthlyIncome - totalMonthlyExpense >= 0 ? 'positive' : 'negative'}">${formatAmountShort(totalMonthlyIncome - totalMonthlyExpense)}</div>
                </div>
            </div>

            <div class="recurring-tabs">
                <button class="recurring-tab active" data-type="expense">💸 지출 (${expenseItems.length})</button>
                <button class="recurring-tab" data-type="income">💰 수입 (${incomeItems.length})</button>
            </div>

            <div class="recurring-list" id="recurringList">
                ${renderRecurringList(expenseItems, 'expense')}
            </div>
        </div>

        <!-- 고정항목 추가/수정 모달 -->
        <div id="recurringModal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="recurringModalTitle">고정 항목 추가</h3>
                    <button class="close-btn" id="closeRecurringModalBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>유형</label>
                        <select id="recurringType">
                            <option value="expense">지출</option>
                            <option value="income">수입</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>분류</label>
                        <select id="recurringCategory">
                            ${EXPENSE_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>설명</label>
                        <input type="text" id="recurringDescription" placeholder="예: 휴대폰 요금, 월세">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>금액</label>
                            <input type="number" id="recurringAmount" placeholder="0">
                        </div>
                        <div class="form-group">
                            <label>결제일 (매월)</label>
                            <select id="recurringDay">
                                ${Array.from({length: 31}, (_, i) => `<option value="${i+1}">${i+1}일</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>소유자</label>
                            <select id="recurringOwner">
                                <option value="본인">본인</option>
                                <option value="어머니">어머니</option>
                                <option value="공동">공동</option>
                                <option value="기타">기타</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="recurringActive" checked>
                                활성화
                            </label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelRecurringBtn">취소</button>
                    <button class="btn btn-primary" id="saveRecurringBtn">저장</button>
                </div>
            </div>
        </div>
    `;
}

function renderRecurringList(items, type) {
    if (items.length === 0) {
        return `<div class="empty-state">등록된 ${type === 'expense' ? '고정 지출' : '고정 수입'}이 없습니다</div>`;
    }

    return items.map(item => {
        const ownerBadge = item.owner && item.owner !== '본인'
            ? `<span class="owner-badge">${item.owner}</span>`
            : '';
        return `
            <div class="recurring-item ${type}" data-id="${item.id}">
                <div class="recurring-item-info">
                    <div class="recurring-item-name">${item.description || item.category} ${ownerBadge}</div>
                    <div class="recurring-item-detail">${item.category} · 매월 ${item.day_of_month || '-'}일</div>
                </div>
                <div class="recurring-item-amount ${type === 'expense' ? 'negative' : 'positive'}">
                    ${formatAmount(item.amount)}
                </div>
                <div class="recurring-item-status">
                    ${item.is_active ? '<span class="status-active">활성</span>' : '<span class="status-inactive">비활성</span>'}
                </div>
                <div class="recurring-item-actions">
                    <button class="btn-icon edit-recurring-btn" data-id="${item.id}" title="수정">✏️</button>
                    <button class="btn-icon delete-recurring-btn" data-id="${item.id}" title="삭제">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function initRecurringExpenses() {
    // 탭 전환
    document.querySelectorAll('.recurring-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.recurring-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const type = tab.dataset.type;
            const items = recurringItems.filter(i => i.type === type);
            document.getElementById('recurringList').innerHTML = renderRecurringList(items, type);
            attachRecurringItemEvents();
        });
    });

    // 추가 버튼
    document.getElementById('addRecurringBtn').addEventListener('click', () => openRecurringModal());

    // 모달 버튼
    document.getElementById('closeRecurringModalBtn').addEventListener('click', closeRecurringModal);
    document.getElementById('cancelRecurringBtn').addEventListener('click', closeRecurringModal);
    document.getElementById('saveRecurringBtn').addEventListener('click', saveRecurringItem);

    // 유형 변경 시 카테고리 업데이트
    document.getElementById('recurringType').addEventListener('change', updateRecurringCategories);

    attachRecurringItemEvents();
}

function attachRecurringItemEvents() {
    document.querySelectorAll('.edit-recurring-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const item = recurringItems.find(i => i.id === id);
            if (item) openRecurringModal(item);
        });
    });

    document.querySelectorAll('.delete-recurring-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (confirm('정말 삭제하시겠습니까?')) {
                const result = await deleteRecurringItem(id);
                if (result.success) {
                    await loadToolsData();
                    renderCurrentTool();
                } else {
                    alert('삭제 실패: ' + result.error);
                }
            }
        });
    });
}

function updateRecurringCategories() {
    const type = document.getElementById('recurringType').value;
    const categorySelect = document.getElementById('recurringCategory');
    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    categorySelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
}

function openRecurringModal(item = null) {
    editingRecurring = item;
    document.getElementById('recurringModal').style.display = 'flex';
    document.getElementById('recurringModalTitle').textContent = item ? '고정 항목 수정' : '고정 항목 추가';

    if (item) {
        document.getElementById('recurringType').value = item.type || 'expense';
        updateRecurringCategories();
        document.getElementById('recurringCategory').value = item.category || '';
        document.getElementById('recurringDescription').value = item.description || '';
        document.getElementById('recurringAmount').value = item.amount || '';
        document.getElementById('recurringDay').value = item.day_of_month || 1;
        document.getElementById('recurringOwner').value = item.owner || '본인';
        document.getElementById('recurringActive').checked = item.is_active !== false;
    } else {
        document.getElementById('recurringType').value = 'expense';
        updateRecurringCategories();
        document.getElementById('recurringDescription').value = '';
        document.getElementById('recurringAmount').value = '';
        document.getElementById('recurringDay').value = 1;
        document.getElementById('recurringOwner').value = '본인';
        document.getElementById('recurringActive').checked = true;
    }
}

function closeRecurringModal() {
    document.getElementById('recurringModal').style.display = 'none';
    editingRecurring = null;
}

async function saveRecurringItem() {
    const type = document.getElementById('recurringType').value;
    const category = document.getElementById('recurringCategory').value;
    const description = document.getElementById('recurringDescription').value.trim();
    const amount = parseInt(document.getElementById('recurringAmount').value) || 0;
    const dayOfMonth = parseInt(document.getElementById('recurringDay').value) || 1;
    const owner = document.getElementById('recurringOwner').value;
    const isActive = document.getElementById('recurringActive').checked;

    if (amount <= 0) {
        alert('금액을 입력해주세요.');
        return;
    }

    const data = {
        type,
        category,
        description: description || null,
        amount,
        day_of_month: dayOfMonth,
        owner: owner || '본인',
        is_active: isActive,
        frequency: 'monthly'
    };

    let result;
    if (editingRecurring) {
        result = await updateRecurringItem(editingRecurring.id, data);
    } else {
        result = await createRecurringItem(data);
    }

    if (result.success) {
        closeRecurringModal();
        await loadToolsData();
        renderCurrentTool();
    } else {
        alert('저장 실패: ' + result.error);
    }
}

// ============================================
// 소비 분석
// ============================================

function renderSpendingAnalysis() {
    return `
        <div class="spending-container">
            <div class="spending-period">
                <button class="period-btn active" data-period="thisMonth">이번 달</button>
                <button class="period-btn" data-period="lastMonth">지난 달</button>
                <button class="period-btn" data-period="3months">3개월</button>
                <button class="period-btn" data-period="year">올해</button>
            </div>

            <div class="spending-summary" id="spendingSummary">
                <!-- 동적으로 채워짐 -->
            </div>

            <div class="spending-chart-container">
                <canvas id="spendingChart"></canvas>
            </div>

            <div class="category-breakdown" id="categoryBreakdown">
                <!-- 동적으로 채워짐 -->
            </div>

            <div class="spending-insights" id="spendingInsights">
                <!-- 동적으로 채워짐 -->
            </div>
        </div>
    `;
}

let spendingChart = null;

function initSpendingAnalysis() {
    document.querySelectorAll('.spending-container .period-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.spending-container .period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateSpendingAnalysis(btn.dataset.period);
        });
    });

    updateSpendingAnalysis('thisMonth');
}

function updateSpendingAnalysis(period) {
    const filtered = filterTransactionsByPeriod(transactions, period);
    const expenses = filtered.filter(t => t.type === 'expense');
    const income = filtered.filter(t => t.type === 'income');

    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

    // 요약
    document.getElementById('spendingSummary').innerHTML = `
        <div class="summary-card income-card">
            <div class="summary-label">총 수입</div>
            <div class="summary-value positive">${formatAmountShort(totalIncome)}</div>
        </div>
        <div class="summary-card expense-card">
            <div class="summary-label">총 지출</div>
            <div class="summary-value negative">${formatAmountShort(totalExpense)}</div>
        </div>
        <div class="summary-card net-card">
            <div class="summary-label">순수익</div>
            <div class="summary-value ${totalIncome - totalExpense >= 0 ? 'positive' : 'negative'}">${formatAmountShort(totalIncome - totalExpense)}</div>
        </div>
    `;

    // 카테고리별 분석
    const categoryData = {};
    expenses.forEach(t => {
        const cat = t.category || '기타';
        categoryData[cat] = (categoryData[cat] || 0) + t.amount;
    });

    const sortedCategories = Object.entries(categoryData).sort((a, b) => b[1] - a[1]);

    // 차트 업데이트
    updateSpendingChart(sortedCategories);

    // 분류 목록
    document.getElementById('categoryBreakdown').innerHTML = `
        <h4>분류별 지출</h4>
        ${sortedCategories.map(([cat, amount]) => {
            const percent = totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : 0;
            return `
                <div class="category-item">
                    <div class="category-info">
                        <span class="category-name">${cat}</span>
                        <span class="category-percent">${percent}%</span>
                    </div>
                    <div class="category-bar">
                        <div class="category-fill" style="width: ${percent}%"></div>
                    </div>
                    <div class="category-amount">${formatAmountShort(amount)}</div>
                </div>
            `;
        }).join('')}
    `;

    // 인사이트
    updateSpendingInsights(sortedCategories, totalExpense, totalIncome);
}

function updateSpendingChart(categoryData) {
    const canvas = document.getElementById('spendingChart');
    if (!canvas) return;

    if (spendingChart) {
        spendingChart.destroy();
    }

    const colors = [
        '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399',
        '#22d3d8', '#60a5fa', '#a78bfa', '#f472b6', '#94a3b8'
    ];

    const ctx = canvas.getContext('2d');
    spendingChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categoryData.map(([cat]) => cat),
            datasets: [{
                data: categoryData.map(([, amount]) => amount),
                backgroundColor: colors.slice(0, categoryData.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        padding: 10
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${formatAmountShort(context.raw)}`;
                        }
                    }
                }
            }
        }
    });
}

function updateSpendingInsights(categoryData, totalExpense, totalIncome) {
    const insights = [];
    const warnings = [];
    const tips = [];

    // 1. 가장 많이 쓴 카테고리
    if (categoryData.length > 0) {
        const topCategory = categoryData[0];
        const topPercent = totalExpense > 0 ? ((topCategory[1] / totalExpense) * 100).toFixed(0) : 0;
        insights.push({
            icon: '📊',
            text: `가장 많이 쓴 분류: <strong>${topCategory[0]}</strong> (${formatAmountShort(topCategory[1])}, ${topPercent}%)`
        });
    }

    // 2. 저축률 분석
    if (totalIncome > 0) {
        const savingRate = ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1);
        if (savingRate >= 20) {
            insights.push({ icon: '🎉', text: `저축률 <strong>${savingRate}%</strong> - 훌륭합니다!` });
        } else if (savingRate >= 10) {
            insights.push({ icon: '💰', text: `저축률 <strong>${savingRate}%</strong> - 양호합니다` });
        } else if (savingRate > 0) {
            warnings.push({ icon: '⚠️', text: `저축률 <strong>${savingRate}%</strong>로 낮습니다. 10% 이상을 목표로!` });
        } else {
            warnings.push({ icon: '🚨', text: `지출이 수입보다 <strong>${formatAmountShort(totalExpense - totalIncome)}</strong> 많습니다!` });
        }
    }

    // 3. 전월 대비 분석
    const lastMonthData = getLastMonthComparison();
    if (lastMonthData) {
        const { lastMonthTotal, changePercent, changedCategories } = lastMonthData;

        if (changePercent > 20) {
            warnings.push({
                icon: '📈',
                text: `전월 대비 지출 <strong>${changePercent.toFixed(0)}% 증가</strong> (${formatAmountShort(lastMonthTotal)} → ${formatAmountShort(totalExpense)})`
            });
        } else if (changePercent < -10) {
            insights.push({
                icon: '📉',
                text: `전월 대비 지출 <strong>${Math.abs(changePercent).toFixed(0)}% 감소</strong> - 잘하고 있어요!`
            });
        }

        // 급증한 카테고리 찾기
        changedCategories.forEach(cat => {
            if (cat.changePercent > 50 && cat.amount > 50000) {
                warnings.push({
                    icon: '⚡',
                    text: `<strong>${cat.name}</strong> 지출이 전월 대비 ${cat.changePercent.toFixed(0)}% 증가`
                });
            }
        });
    }

    // 4. 일 평균 지출
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysPassed = now.getDate();
    const avgDaily = totalExpense / daysPassed;
    const projectedMonthly = avgDaily * daysInMonth;

    insights.push({
        icon: '📅',
        text: `일 평균 지출: <strong>${formatAmountShort(avgDaily)}</strong> (이 추세면 월 ${formatAmountShort(projectedMonthly)})`
    });

    // 5. 예산 대비 분석 (AI 인사이트)
    if (budgets && budgets.length > 0) {
        const overBudgetCategories = [];
        const nearBudgetCategories = [];

        categoryData.forEach(([cat, amount]) => {
            const budget = budgets.find(b => b.category === cat);
            if (budget) {
                const percent = (amount / budget.monthly_amount) * 100;
                if (percent >= 100) {
                    overBudgetCategories.push({ name: cat, percent: percent.toFixed(0), over: amount - budget.monthly_amount });
                } else if (percent >= 80) {
                    nearBudgetCategories.push({ name: cat, percent: percent.toFixed(0), remaining: budget.monthly_amount - amount });
                }
            }
        });

        if (overBudgetCategories.length > 0) {
            overBudgetCategories.forEach(cat => {
                warnings.push({
                    icon: '🚫',
                    text: `<strong>${cat.name}</strong> 예산 초과! (${cat.percent}%, ${formatAmountShort(cat.over)} 초과)`
                });
            });
        }

        if (nearBudgetCategories.length > 0) {
            nearBudgetCategories.forEach(cat => {
                warnings.push({
                    icon: '⏰',
                    text: `<strong>${cat.name}</strong> 예산 ${cat.percent}% 소진 (${formatAmountShort(cat.remaining)} 남음)`
                });
            });
        }
    }

    // 6. 맞춤 AI 메시지 생성
    generatePersonalizedInsights(categoryData, totalExpense, totalIncome, insights, tips);

    // 7. 절약 팁 생성
    generateSavingTips(categoryData, tips);

    // 8. 고정지출 vs 변동지출 분석
    const fixedCategories = ['주거', '통신', '보험', '구독'];
    const fixedExpense = categoryData
        .filter(([cat]) => fixedCategories.some(fc => cat.includes(fc)))
        .reduce((sum, [, amount]) => sum + amount, 0);
    const variableExpense = totalExpense - fixedExpense;

    if (fixedExpense > 0 && variableExpense > 0) {
        const fixedPercent = ((fixedExpense / totalExpense) * 100).toFixed(0);
        insights.push({
            icon: '🔒',
            text: `고정비 ${fixedPercent}% (${formatAmountShort(fixedExpense)}) / 변동비 ${100 - fixedPercent}% (${formatAmountShort(variableExpense)})`
        });
    }

    // HTML 생성
    let html = '<div class="insights-container">';

    if (warnings.length > 0) {
        html += `
            <div class="insights-section warnings">
                <h4>⚠️ 주의</h4>
                <ul class="insights-list">
                    ${warnings.map(w => `<li><span class="insight-icon">${w.icon}</span>${w.text}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    if (insights.length > 0) {
        html += `
            <div class="insights-section">
                <h4>📊 분석</h4>
                <ul class="insights-list">
                    ${insights.map(i => `<li><span class="insight-icon">${i.icon}</span>${i.text}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    if (tips.length > 0) {
        html += `
            <div class="insights-section tips">
                <h4>💡 절약 팁</h4>
                <ul class="insights-list">
                    ${tips.map(t => `<li><span class="insight-icon">${t.icon}</span>${t.text}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    html += '</div>';
    document.getElementById('spendingInsights').innerHTML = html;
}

// 전월 대비 분석 데이터 가져오기
function getLastMonthComparison() {
    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const lastMonthTxs = transactions.filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && d >= lastMonthStart && d <= lastMonthEnd;
    });

    const thisMonthTxs = transactions.filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && d >= thisMonthStart;
    });

    if (lastMonthTxs.length === 0) return null;

    const lastMonthTotal = lastMonthTxs.reduce((sum, t) => sum + t.amount, 0);
    const thisMonthTotal = thisMonthTxs.reduce((sum, t) => sum + t.amount, 0);

    // 카테고리별 변화
    const lastByCategory = {};
    const thisByCategory = {};

    lastMonthTxs.forEach(t => {
        const cat = t.category || '기타';
        lastByCategory[cat] = (lastByCategory[cat] || 0) + t.amount;
    });

    thisMonthTxs.forEach(t => {
        const cat = t.category || '기타';
        thisByCategory[cat] = (thisByCategory[cat] || 0) + t.amount;
    });

    const changedCategories = Object.keys(thisByCategory).map(cat => {
        const lastAmount = lastByCategory[cat] || 0;
        const thisAmount = thisByCategory[cat];
        const changePercent = lastAmount > 0 ? ((thisAmount - lastAmount) / lastAmount) * 100 : 100;
        return { name: cat, amount: thisAmount, lastAmount, changePercent };
    }).filter(c => c.changePercent > 30); // 30% 이상 증가한 것만

    return {
        lastMonthTotal,
        thisMonthTotal,
        changePercent: lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0,
        changedCategories
    };
}

// 절약 팁 생성
function generateSavingTips(categoryData, tips) {
    const categoryTips = {
        '외식': { threshold: 200000, tip: '외식비를 줄이고 집밥 비율을 늘려보세요. 주 2회 외식 → 1회로 줄이면 월 10만원 이상 절약!' },
        '식비': { threshold: 400000, tip: '장보기 전 냉장고 확인하고 식단 계획을 세워보세요. 식재료 낭비를 줄일 수 있어요.' },
        '쇼핑': { threshold: 150000, tip: '충동구매를 줄이세요. 장바구니에 담고 24시간 후에 결제하는 습관을!' },
        '유흥': { threshold: 100000, tip: '유흥비가 높습니다. 집에서 즐길 수 있는 대안을 찾아보세요.' },
        '교통': { threshold: 150000, tip: '대중교통이나 자전거 이용을 늘려보세요. 건강과 지갑 모두 좋아집니다.' },
        '구독': { threshold: 50000, tip: '사용하지 않는 구독 서비스가 있는지 확인하세요. 연간으로 결제하면 할인받을 수 있어요.' },
        '커피': { threshold: 50000, tip: '커피 지출이 높습니다. 텀블러를 들고 다니거나 사무실 커피를 활용해보세요.' }
    };

    categoryData.forEach(([cat, amount]) => {
        Object.entries(categoryTips).forEach(([keyword, info]) => {
            if (cat.includes(keyword) && amount > info.threshold) {
                tips.push({ icon: '💡', text: info.tip });
            }
        });
    });

    // 기본 팁 (팁이 없을 경우)
    if (tips.length === 0 && categoryData.length > 0) {
        tips.push({ icon: '💡', text: '지출 내역을 정기적으로 확인하는 것만으로도 소비 습관이 개선됩니다!' });
    }
}

// 맞춤 AI 인사이트 생성
function generatePersonalizedInsights(categoryData, totalExpense, totalIncome, insights, tips) {
    const now = new Date();
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthProgress = (dayOfMonth / daysInMonth) * 100;

    // 1. 월 진행 대비 지출 분석
    if (totalIncome > 0) {
        const expectedSpendingRate = monthProgress;
        const actualSpendingRate = (totalExpense / totalIncome) * 100;

        if (actualSpendingRate < expectedSpendingRate * 0.7) {
            insights.push({
                icon: '🌟',
                text: `이번 달 지출 속도가 <strong>느립니다</strong>. 목표 저축액을 달성할 가능성이 높아요!`
            });
        } else if (actualSpendingRate > expectedSpendingRate * 1.3) {
            tips.push({
                icon: '🐢',
                text: `지출 속도가 월 진행률보다 빠릅니다. 남은 ${daysInMonth - dayOfMonth}일간 소비를 조절해보세요.`
            });
        }
    }

    // 2. 요일별 패턴 분석
    const weekendCategories = ['외식', '유흥', '쇼핑', '레저'];
    const weekendSpending = categoryData
        .filter(([cat]) => weekendCategories.some(wc => cat.includes(wc)))
        .reduce((sum, [, amount]) => sum + amount, 0);

    if (weekendSpending > totalExpense * 0.4 && totalExpense > 0) {
        insights.push({
            icon: '🎭',
            text: `주말/여가 관련 지출이 <strong>전체의 ${((weekendSpending / totalExpense) * 100).toFixed(0)}%</strong>를 차지합니다.`
        });
    }

    // 3. 분류 다양성 분석
    if (categoryData.length <= 3 && totalExpense > 500000) {
        insights.push({
            icon: '🎯',
            text: `소비가 <strong>${categoryData.length}개 분류</strong>에 집중되어 있어요. 특정 분야 지출을 점검해보세요.`
        });
    }

    // 4. 작은 지출 경고 (500원~5000원 소비 횟수가 많을 경우)
    const smallExpenses = transactions.filter(t =>
        t.type === 'expense' &&
        t.amount >= 500 &&
        t.amount <= 5000 &&
        new Date(t.date).getMonth() === now.getMonth()
    );

    if (smallExpenses.length > 20) {
        const smallTotal = smallExpenses.reduce((sum, t) => sum + t.amount, 0);
        tips.push({
            icon: '🔍',
            text: `5천원 이하 소액 지출이 <strong>${smallExpenses.length}건</strong> (총 ${formatAmountShort(smallTotal)}). 라떼팩터를 주의하세요!`
        });
    }

    // 5. 긍정적 피드백 (저축 중인 목표가 있는 경우)
    if (goals && goals.length > 0) {
        const activeGoals = goals.filter(g => !g.is_completed);
        if (activeGoals.length > 0 && totalIncome > totalExpense) {
            const monthlySaving = totalIncome - totalExpense;
            const fastestGoal = activeGoals.reduce((min, g) => {
                const remaining = g.target_amount - g.current_amount;
                const monthsToComplete = remaining / monthlySaving;
                return monthsToComplete < min.months ? { goal: g, months: monthsToComplete } : min;
            }, { goal: null, months: Infinity });

            if (fastestGoal.goal && fastestGoal.months < 12) {
                insights.push({
                    icon: '🎯',
                    text: `이 저축률을 유지하면 <strong>"${fastestGoal.goal.name}"</strong> 목표를 약 ${Math.ceil(fastestGoal.months)}개월 후 달성해요!`
                });
            }
        }
    }
}

function filterTransactionsByPeriod(txs, period) {
    const now = new Date();
    let startDate;

    switch (period) {
        case 'thisMonth':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'lastMonth':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            return txs.filter(t => {
                const d = new Date(t.date);
                return d >= startDate && d <= endDate;
            });
        case '3months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return txs.filter(t => new Date(t.date) >= startDate);
}

// ============================================
// 대출 상환 계산기
// ============================================

function renderDebtCalculator() {
    return `
        <div class="debt-calc-container">
            <h3>🧮 대출 계산기</h3>

            <div class="debt-select">
                <label>대출 선택</label>
                <select id="debtSelect">
                    <option value="">직접 입력</option>
                    ${debts.map(d => `<option value="${d.id}" data-principal="${d.principal_amount}" data-remaining="${d.remaining_amount}" data-rate="${d.interest_rate}" data-monthly="${d.monthly_payment}">${d.name} (잔액: ${formatAmountShort(d.remaining_amount)})</option>`).join('')}
                </select>
            </div>

            <div class="calc-inputs">
                <div class="input-group">
                    <label>대출 잔액</label>
                    <input type="number" id="calcRemaining" placeholder="남은 대출금">
                </div>
                <div class="input-group">
                    <label>연 이자율 (%)</label>
                    <input type="number" id="calcRate" step="0.1" placeholder="예: 4.5">
                </div>
                <div class="input-group">
                    <label>현재 월 상환액</label>
                    <input type="number" id="calcMonthly" placeholder="매월 상환 금액">
                </div>
                <div class="input-group">
                    <label>추가 상환액 (선택)</label>
                    <input type="number" id="calcExtra" placeholder="추가로 상환할 금액" value="0">
                </div>
            </div>

            <button class="calc-btn" id="calculateBtn">계산하기</button>

            <div class="calc-results" id="calcResults">
                <!-- 동적으로 채워짐 -->
            </div>
        </div>
    `;
}

function initDebtCalculator() {
    const debtSelect = document.getElementById('debtSelect');

    debtSelect.addEventListener('change', () => {
        const option = debtSelect.options[debtSelect.selectedIndex];
        if (option.value) {
            document.getElementById('calcRemaining').value = option.dataset.remaining || '';
            document.getElementById('calcRate').value = option.dataset.rate || '';
            document.getElementById('calcMonthly').value = option.dataset.monthly || '';
        }
    });

    document.getElementById('calculateBtn').addEventListener('click', calculateDebtPayoff);
}

function calculateDebtPayoff() {
    const remaining = parseFloat(document.getElementById('calcRemaining').value) || 0;
    const annualRate = parseFloat(document.getElementById('calcRate').value) || 0;
    const monthly = parseFloat(document.getElementById('calcMonthly').value) || 0;
    const extra = parseFloat(document.getElementById('calcExtra').value) || 0;

    if (remaining <= 0 || monthly <= 0) {
        alert('대출 잔액과 월 상환액을 입력해주세요.');
        return;
    }

    const monthlyRate = annualRate / 100 / 12;
    const totalMonthly = monthly + extra;

    // 현재 상환 계획
    const currentPlan = simulatePayoff(remaining, monthlyRate, monthly);

    // 추가 상환 시 계획
    const newPlan = extra > 0 ? simulatePayoff(remaining, monthlyRate, totalMonthly) : null;

    let html = `
        <div class="result-section">
            <h4>📊 현재 상환 계획</h4>
            <div class="result-grid">
                <div class="result-item">
                    <span class="result-label">완납까지</span>
                    <span class="result-value">${currentPlan.months}개월 (${(currentPlan.months / 12).toFixed(1)}년)</span>
                </div>
                <div class="result-item">
                    <span class="result-label">총 이자</span>
                    <span class="result-value negative">${formatAmountShort(currentPlan.totalInterest)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">총 상환액</span>
                    <span class="result-value">${formatAmountShort(currentPlan.totalPaid)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">완납 예정일</span>
                    <span class="result-value">${currentPlan.endDate}</span>
                </div>
            </div>
        </div>
    `;

    if (newPlan && extra > 0) {
        const savedMonths = currentPlan.months - newPlan.months;
        const savedInterest = currentPlan.totalInterest - newPlan.totalInterest;

        html += `
            <div class="result-section highlight">
                <h4>🚀 추가 상환 시 (월 +${formatAmountShort(extra)})</h4>
                <div class="result-grid">
                    <div class="result-item">
                        <span class="result-label">완납까지</span>
                        <span class="result-value">${newPlan.months}개월 (${(newPlan.months / 12).toFixed(1)}년)</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">총 이자</span>
                        <span class="result-value negative">${formatAmountShort(newPlan.totalInterest)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">완납 예정일</span>
                        <span class="result-value">${newPlan.endDate}</span>
                    </div>
                </div>
                <div class="savings-highlight">
                    <div class="saving-item">
                        <span>⏱️ 단축 기간</span>
                        <strong>${savedMonths}개월</strong>
                    </div>
                    <div class="saving-item">
                        <span>💰 절약 이자</span>
                        <strong class="positive">${formatAmountShort(savedInterest)}</strong>
                    </div>
                </div>
            </div>
        `;
    }

    document.getElementById('calcResults').innerHTML = html;
}

function simulatePayoff(principal, monthlyRate, monthlyPayment) {
    let balance = principal;
    let months = 0;
    let totalInterest = 0;
    const maxMonths = 600; // 50년 제한

    while (balance > 0 && months < maxMonths) {
        const interest = balance * monthlyRate;
        totalInterest += interest;

        const principalPayment = Math.min(monthlyPayment - interest, balance);
        balance -= principalPayment;
        months++;

        if (monthlyPayment <= interest) {
            // 이자보다 상환액이 적으면 영원히 못 갚음
            return { months: Infinity, totalInterest: Infinity, totalPaid: Infinity, endDate: '상환 불가' };
        }
    }

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);
    const endDateStr = `${endDate.getFullYear()}년 ${endDate.getMonth() + 1}월`;

    return {
        months,
        totalInterest: Math.round(totalInterest),
        totalPaid: Math.round(principal + totalInterest),
        endDate: endDateStr
    };
}

// ============================================
// 선물 손실 추적
// ============================================

function renderFuturesLoss() {
    // 선물거래 카테고리 손실 계산
    const futuresLosses = transactions.filter(t =>
        t.type === 'expense' && t.category === '선물거래'
    );
    const totalLoss = futuresLosses.reduce((sum, t) => sum + t.amount, 0);

    // 월별 손실 집계
    const monthlyLosses = {};
    futuresLosses.forEach(t => {
        const month = t.date.substring(0, 7); // YYYY-MM
        monthlyLosses[month] = (monthlyLosses[month] || 0) + t.amount;
    });

    const sortedMonths = Object.entries(monthlyLosses).sort((a, b) => b[0].localeCompare(a[0]));

    return `
        <div class="futures-loss-container">
            <h3>📉 선물 손실 현황</h3>

            <div class="futures-warning">
                <span class="warning-icon">⚠️</span>
                <span>선물 거래는 원금 손실 위험이 매우 높습니다!</span>
            </div>

            <div class="futures-summary">
                <div class="futures-total-card">
                    <div class="futures-label">총 선물 손실</div>
                    <div class="futures-value negative">${formatAmountShort(totalLoss)}</div>
                    <div class="futures-count">${futuresLosses.length}건의 거래</div>
                </div>
            </div>

            <div class="futures-message">
                <p>💪 ${totalLoss > 0 ? `${formatAmountShort(totalLoss)}을 선물로 잃었지만, 다시 선물을 안 하면 됩니다!` : '선물 거래 손실이 없습니다. 이대로 유지하세요!'}</p>
            </div>

            <div class="futures-monthly">
                <h4>월별 손실 내역</h4>
                ${sortedMonths.length > 0 ? `
                    <div class="monthly-loss-list">
                        ${sortedMonths.map(([month, amount]) => `
                            <div class="monthly-loss-item">
                                <span class="month-label">${month.replace('-', '년 ')}월</span>
                                <span class="month-value negative">${formatAmountShort(amount)}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="empty-state">선물 손실 기록이 없습니다</div>'}
            </div>

            <div class="futures-record">
                <h4>손실 기록하기</h4>
                <p class="hint">선물 손실을 기록하려면 거래 탭에서 "지출 > 선물거래" 분류로 추가하세요.</p>
            </div>
        </div>
    `;
}

function initFuturesLoss() {
    // 현재는 별도 초기화 필요 없음
}

// ============================================
// 설정
// ============================================

function renderAccountSettings() {
    return `
        <div class="account-settings-container">
            <h3>⚙️ 설정</h3>

            <div class="account-info-section">
                <h4>👤 내 정보</h4>
                <div class="account-info-card">
                    <div class="info-row">
                        <span class="info-label">이메일</span>
                        <span class="info-value" id="currentEmail">로딩 중...</span>
                    </div>
                </div>
            </div>

            <div class="password-section">
                <h4>🔐 비밀번호 변경</h4>
                <div class="password-form">
                    <div class="form-group">
                        <label>새 비밀번호</label>
                        <input type="password" id="newPassword" placeholder="새 비밀번호 (최소 6자)">
                    </div>
                    <div class="form-group">
                        <label>비밀번호 확인</label>
                        <input type="password" id="confirmPassword" placeholder="새 비밀번호 다시 입력">
                    </div>
                    <button class="btn btn-primary" id="changePasswordBtn">비밀번호 변경</button>
                    <p class="password-hint">💡 가족과 공유하려면 서로 아는 비밀번호로 변경하세요</p>
                </div>
            </div>

            <div class="password-result" id="passwordResult"></div>

            <div class="notification-section">
                <h4>🔔 알림 설정</h4>
                <div class="notification-settings-card">
                    <div class="setting-row main-toggle">
                        <div class="setting-info">
                            <span class="setting-label">브라우저 알림</span>
                            <span class="setting-description">중요한 알림을 브라우저로 받습니다</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="notificationEnabled">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="setting-group" id="notificationOptions">
                        <div class="setting-row">
                            <div class="setting-info">
                                <span class="setting-label">예산 경고</span>
                                <span class="setting-description">예산 80% 이상 사용 시</span>
                            </div>
                            <label class="toggle-switch small">
                                <input type="checkbox" id="budgetWarning" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="setting-row">
                            <div class="setting-info">
                                <span class="setting-label">예산 초과</span>
                                <span class="setting-description">예산 100% 초과 시</span>
                            </div>
                            <label class="toggle-switch small">
                                <input type="checkbox" id="budgetExceeded" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="setting-row">
                            <div class="setting-info">
                                <span class="setting-label">결제일 알림</span>
                                <span class="setting-description">결제일 D-3 알림</span>
                            </div>
                            <label class="toggle-switch small">
                                <input type="checkbox" id="paymentDue" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="setting-row">
                            <div class="setting-info">
                                <span class="setting-label">스테이킹 언락</span>
                                <span class="setting-description">언락 D-7 알림</span>
                            </div>
                            <label class="toggle-switch small">
                                <input type="checkbox" id="stakingUnlock" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="setting-row">
                            <div class="setting-info">
                                <span class="setting-label">에어드랍 클레임</span>
                                <span class="setting-description">클레임 가능 시 알림</span>
                            </div>
                            <label class="toggle-switch small">
                                <input type="checkbox" id="airdropClaimable" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="setting-row">
                            <div class="setting-info">
                                <span class="setting-label">목표 달성</span>
                                <span class="setting-description">저축 목표 달성 시</span>
                            </div>
                            <label class="toggle-switch small">
                                <input type="checkbox" id="goalAchieved" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <div class="notification-status" id="notificationStatus"></div>
                </div>
            </div>

            <div class="category-management-section">
                <h4>📂 분류 관리</h4>
                <p class="setting-description" style="margin-bottom: var(--space-4);">수입/지출 거래의 분류를 커스터마이즈합니다</p>
                <div id="categoryManagerContent">
                    ${renderCategoryManager()}
                </div>
            </div>
        </div>
    `;
}

async function initAccountSettings() {
    // 현재 사용자 정보 로드
    const user = await getCurrentUser();
    if (user) {
        document.getElementById('currentEmail').textContent = user.email;
    }

    // 비밀번호 변경 버튼
    document.getElementById('changePasswordBtn').addEventListener('click', handlePasswordChange);

    // Enter 키로 제출
    document.getElementById('confirmPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handlePasswordChange();
        }
    });

    // 알림 설정 초기화
    initNotificationSettings();

    // 분류 관리 초기화 (DB에서 최신 데이터 로드 후 UI 갱신)
    await loadCustomCategories();
    refreshCategoryManager();
    initCategoryManager();
}

// ============================================
// 분류 관리 (카테고리 커스터마이즈)
// ============================================

// 분류 관리 전체 HTML 생성
function renderCategoryManager() {
    return `
        ${renderCategoryGroup('income', '수입 분류', '💰', INCOME_CATEGORIES)}
        ${renderCategoryGroup('expense', '지출 분류', '💸', EXPENSE_CATEGORIES)}
    `;
}

// 개별 그룹 HTML 생성
function renderCategoryGroup(type, title, icon, categories) {
    const maxCategories = 20;
    const canAdd = categories.length < maxCategories;

    return `
        <div class="category-group" data-type="${type}">
            <div class="category-group-header">
                <span class="category-group-title">${icon} ${title}</span>
                <div class="category-group-actions">
                    <button class="btn-category-reset" data-type="${type}" title="기본값 복원">초기화</button>
                    <button class="btn-category-add" data-type="${type}" ${!canAdd ? 'disabled' : ''} title="${canAdd ? '새 분류 추가' : '최대 ' + maxCategories + '개'}">+ 추가</button>
                </div>
            </div>
            <div class="category-list" id="categoryList-${type}">
                ${categories.map((name, index) => renderCategoryItem(type, index, name)).join('')}
            </div>
            <div class="category-count">${categories.length} / ${maxCategories}</div>
        </div>
    `;
}

// 개별 카테고리 아이템 HTML
function renderCategoryItem(type, index, name) {
    return `
        <div class="category-item" data-type="${type}" data-index="${index}">
            <span class="category-item-name">${name}</span>
            <div class="category-item-actions">
                <button class="btn-category-edit" data-type="${type}" data-index="${index}" title="수정">✏️</button>
                <button class="btn-category-delete" data-type="${type}" data-index="${index}" title="삭제">🗑️</button>
            </div>
        </div>
    `;
}

// 이벤트 바인딩
function initCategoryManager() {
    const container = document.getElementById('categoryManagerContent');
    if (!container) return;

    // 이벤트 위임 (추가/수정/삭제/초기화 모두 처리)
    container.addEventListener('click', async (e) => {
        const target = e.target;

        // 추가 버튼
        if (target.classList.contains('btn-category-add') && !target.disabled) {
            await handleAddCategory(target.dataset.type);
            return;
        }

        // 수정 버튼
        if (target.classList.contains('btn-category-edit')) {
            handleEditCategory(target.dataset.type, parseInt(target.dataset.index));
            return;
        }

        // 삭제 버튼
        if (target.classList.contains('btn-category-delete')) {
            await handleDeleteCategory(target.dataset.type, parseInt(target.dataset.index));
            return;
        }

        // 초기화 버튼
        if (target.classList.contains('btn-category-reset')) {
            await handleResetCategories(target.dataset.type);
            return;
        }

        // 인라인 편집 저장 버튼
        if (target.classList.contains('btn-category-save')) {
            const input = target.parentElement.querySelector('.category-edit-input');
            if (input) {
                await handleSaveEdit(target.dataset.type, parseInt(target.dataset.index), input.value);
            }
            return;
        }

        // 인라인 편집 취소 버튼
        if (target.classList.contains('btn-category-cancel')) {
            refreshCategoryManager();
            return;
        }
    });

    // Enter/Escape 키 이벤트 위임
    container.addEventListener('keydown', async (e) => {
        if (e.target.classList.contains('category-edit-input')) {
            if (e.key === 'Enter') {
                const type = e.target.dataset.type;
                const index = parseInt(e.target.dataset.index);
                await handleSaveEdit(type, index, e.target.value);
            } else if (e.key === 'Escape') {
                refreshCategoryManager();
            }
        }
    });
}

// 새 분류 추가
async function handleAddCategory(type) {
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    if (categories.length >= 20) {
        showToast('최대 20개까지 추가할 수 있습니다', 'error');
        return;
    }

    // "새 분류" 추가 후 즉시 편집 모드
    const newName = '새 분류';
    categories.push(newName);
    refreshCategoryManager();

    // 방금 추가된 아이템을 편집 모드로 전환
    const newIndex = categories.length - 1;
    handleEditCategory(type, newIndex);
}

// 인라인 편집 모드로 전환
function handleEditCategory(type, index) {
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const currentName = categories[index];
    const list = document.getElementById(`categoryList-${type}`);
    if (!list) return;

    const items = list.querySelectorAll('.category-item');
    const item = items[index];
    if (!item) return;

    // 이미 편집 중이면 무시
    if (item.querySelector('.category-edit-input')) return;

    item.innerHTML = `
        <input type="text" class="category-edit-input" data-type="${type}" data-index="${index}"
               value="${currentName}" maxlength="50" placeholder="분류명 입력">
        <div class="category-item-actions">
            <button class="btn-category-save" data-type="${type}" data-index="${index}" title="저장">✅</button>
            <button class="btn-category-cancel" title="취소">❌</button>
        </div>
    `;

    // input에 포커스 + 전체 선택
    const input = item.querySelector('.category-edit-input');
    if (input) {
        input.focus();
        input.select();
    }
}

// 편집 내용 저장 (검증 + 배열 수정 + DB 저장)
async function handleSaveEdit(type, index, newName) {
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const trimmedName = newName.trim();

    // 검증: 빈 이름
    if (!trimmedName) {
        showToast('분류명을 입력해주세요', 'error');
        return;
    }

    // 검증: 중복 (자기 자신 제외)
    const isDuplicate = categories.some((name, i) => i !== index && name === trimmedName);
    if (isDuplicate) {
        showToast('이미 존재하는 분류명입니다', 'error');
        return;
    }

    // 배열 수정
    const oldName = categories[index];
    categories[index] = trimmedName;

    // DB 저장
    const result = await saveCategories(type);
    if (!result.success) {
        // 실패 시 원복
        categories[index] = oldName;
        showToast('저장 실패: ' + (result.error || '알 수 없는 오류'), 'error');
    } else {
        showToast('분류가 저장되었습니다', 'success');
    }

    refreshCategoryManager();
}

// 카테고리 삭제
async function handleDeleteCategory(type, index) {
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    // 최소 1개 유지
    if (categories.length <= 1) {
        showToast('최소 1개의 분류는 유지해야 합니다', 'error');
        return;
    }

    const name = categories[index];
    if (!confirm(`"${name}" 분류를 삭제하시겠습니까?\n\n기존 거래에는 영향이 없습니다.`)) {
        return;
    }

    // 배열에서 삭제
    const backup = [...categories];
    categories.splice(index, 1);

    // DB 저장
    const result = await saveCategories(type);
    if (!result.success) {
        // 실패 시 원복
        categories.length = 0;
        categories.push(...backup);
        showToast('삭제 실패: ' + (result.error || '알 수 없는 오류'), 'error');
    } else {
        showToast(`"${name}" 분류가 삭제되었습니다`, 'success');
    }

    refreshCategoryManager();
}

// 기본값 복원
async function handleResetCategories(type) {
    const typeName = type === 'income' ? '수입' : '지출';
    const defaults = getDefaultCategories(type);
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    // 이미 기본값이면 스킵
    if (JSON.stringify([...categories]) === JSON.stringify(defaults)) {
        showToast('이미 기본값입니다', 'info');
        return;
    }

    if (!confirm(`${typeName} 분류를 기본값으로 초기화하시겠습니까?\n\n현재 커스텀 분류가 모두 삭제됩니다.\n기존 거래에는 영향이 없습니다.`)) {
        return;
    }

    const backup = [...categories];
    const result = await resetCategories(type);

    if (!result.success) {
        // 실패 시 원복
        categories.length = 0;
        categories.push(...backup);
        showToast('초기화 실패: ' + (result.error || '알 수 없는 오류'), 'error');
    } else {
        showToast(`${typeName} 분류가 기본값으로 복원되었습니다`, 'success');
    }

    refreshCategoryManager();
}

// DOM 업데이트 (전체 리렌더)
function refreshCategoryManager() {
    const container = document.getElementById('categoryManagerContent');
    if (!container) return;
    container.innerHTML = renderCategoryManager();
}

/**
 * 알림 설정 초기화
 */
function initNotificationSettings() {
    const settings = loadNotificationSettings();
    const statusEl = document.getElementById('notificationStatus');
    const optionsEl = document.getElementById('notificationOptions');

    // 알림 권한 상태 표시
    const permission = getNotificationPermission();
    if (permission === 'unsupported') {
        statusEl.innerHTML = '<span class="status-warning">이 브라우저는 알림을 지원하지 않습니다.</span>';
    } else if (permission === 'denied') {
        statusEl.innerHTML = '<span class="status-error">알림이 차단되어 있습니다. 브라우저 설정에서 허용해주세요.</span>';
    }

    // 체크박스 상태 설정
    document.getElementById('notificationEnabled').checked = settings.enabled;
    document.getElementById('budgetWarning').checked = settings.budgetWarning;
    document.getElementById('budgetExceeded').checked = settings.budgetExceeded;
    document.getElementById('paymentDue').checked = settings.paymentDue;
    document.getElementById('stakingUnlock').checked = settings.stakingUnlock;
    document.getElementById('airdropClaimable').checked = settings.airdropClaimable;
    document.getElementById('goalAchieved').checked = settings.goalAchieved;

    // 알림 비활성화 시 옵션 숨김
    optionsEl.style.display = settings.enabled ? 'block' : 'none';

    // 메인 토글 이벤트
    document.getElementById('notificationEnabled').addEventListener('change', async (e) => {
        const enabled = e.target.checked;

        if (enabled) {
            // 알림 권한 요청
            const granted = await requestNotificationPermission();
            if (!granted) {
                e.target.checked = false;
                return;
            }
        }

        settings.enabled = enabled;
        saveNotificationSettings(settings);
        optionsEl.style.display = enabled ? 'block' : 'none';

        if (enabled) {
            statusEl.innerHTML = '<span class="status-success">알림이 활성화되었습니다!</span>';
        } else {
            statusEl.innerHTML = '';
        }
    });

    // 개별 옵션 이벤트
    const optionIds = ['budgetWarning', 'budgetExceeded', 'paymentDue', 'stakingUnlock', 'airdropClaimable', 'goalAchieved'];
    optionIds.forEach(id => {
        document.getElementById(id).addEventListener('change', (e) => {
            settings[id] = e.target.checked;
            saveNotificationSettings(settings);
        });
    });
}

async function handlePasswordChange() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const resultDiv = document.getElementById('passwordResult');

    // 유효성 검사
    if (!newPassword || !confirmPassword) {
        resultDiv.innerHTML = '<div class="result-error">⚠️ 모든 필드를 입력해주세요.</div>';
        return;
    }

    if (newPassword.length < 6) {
        resultDiv.innerHTML = '<div class="result-error">⚠️ 비밀번호는 최소 6자 이상이어야 합니다.</div>';
        return;
    }

    if (newPassword !== confirmPassword) {
        resultDiv.innerHTML = '<div class="result-error">⚠️ 비밀번호가 일치하지 않습니다.</div>';
        return;
    }

    // 버튼 비활성화
    const btn = document.getElementById('changePasswordBtn');
    btn.disabled = true;
    btn.textContent = '변경 중...';

    try {
        const result = await updatePassword(newPassword);

        if (result.success) {
            resultDiv.innerHTML = '<div class="result-success">✅ 비밀번호가 성공적으로 변경되었습니다!</div>';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } else {
            resultDiv.innerHTML = `<div class="result-error">❌ 오류: ${result.error}</div>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="result-error">❌ 오류: ${error.message}</div>`;
    } finally {
        btn.disabled = false;
        btn.textContent = '비밀번호 변경';
    }
}

// ============================================
// 투자 손익 (원화 입출금 기준)
// ============================================

const PLATFORM_PRESETS = {
    crypto: ['업비트', 'OKX', '빗썸', '바이낸스', '코인원', 'MEXC', '기타 거래소'],
    stock: ['한국투자증권', '삼성증권', '키움증권', 'NH투자증권', '미래에셋증권', '기타 증권사'],
    other: ['기타']
};

function renderFiatProfit() {
    const data = fiatProfitData || {
        totalDeposit: 0,
        totalWithdraw: 0,
        netInvestment: 0,
        currentBalance: 0,
        cryptoBalance: 0,
        stockBalance: 0,
        totalProfit: 0,
        profitPercent: 0,
        flowsCount: 0
    };

    const profitClass = data.totalProfit >= 0 ? 'positive' : 'negative';
    const profitSign = data.totalProfit >= 0 ? '+' : '';

    return `
        <div class="fiat-profit-container">
            <div class="fiat-profit-header">
                <h3>💹 투자 손익</h3>
                <button class="btn btn-primary" id="addFiatFlowBtn">+ 입출금 기록</button>
            </div>

            <!-- 손익 요약 카드 -->
            <div class="fiat-profit-summary">
                <div class="fiat-summary-main">
                    <div class="fiat-profit-card ${profitClass}">
                        <div class="fiat-profit-label">진짜 손익</div>
                        <div class="fiat-profit-value ${profitClass}">${profitSign}${formatAmountShort(data.totalProfit)}</div>
                        <div class="fiat-profit-percent">${profitSign}${data.profitPercent}%</div>
                    </div>
                </div>

                <div class="fiat-summary-grid">
                    <div class="fiat-summary-item deposit">
                        <div class="fiat-item-icon">📥</div>
                        <div class="fiat-item-info">
                            <div class="fiat-item-label">총 입금</div>
                            <div class="fiat-item-value">${formatAmountShort(data.totalDeposit)}</div>
                        </div>
                    </div>
                    <div class="fiat-summary-item withdraw">
                        <div class="fiat-item-icon">📤</div>
                        <div class="fiat-item-info">
                            <div class="fiat-item-label">총 출금</div>
                            <div class="fiat-item-value">${formatAmountShort(data.totalWithdraw)}</div>
                        </div>
                    </div>
                    <div class="fiat-summary-item net">
                        <div class="fiat-item-icon">💵</div>
                        <div class="fiat-item-info">
                            <div class="fiat-item-label">순 투입금</div>
                            <div class="fiat-item-value">${formatAmountShort(data.netInvestment)}</div>
                        </div>
                    </div>
                    <div class="fiat-summary-item balance">
                        <div class="fiat-item-icon">💰</div>
                        <div class="fiat-item-info">
                            <div class="fiat-item-label">현재 잔고</div>
                            <div class="fiat-item-value">${formatAmountShort(data.currentBalance)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 계산 설명 -->
            <div class="fiat-formula-box">
                <div class="formula-title">📐 손익 계산 공식</div>
                <div class="formula-content">
                    <code>진짜 손익 = 현재 잔고 - (입금 - 출금)</code>
                    <p class="formula-desc">은행에서 투자처로 넣은 돈 vs 지금 가진 돈의 차이</p>
                </div>
            </div>

            <!-- 잔고 내역 -->
            <div class="fiat-balance-breakdown">
                <h4>💼 현재 투자 잔고</h4>
                <div class="balance-items">
                    <div class="balance-item">
                        <span class="balance-label">🪙 크립토</span>
                        <span class="balance-value">${formatAmountShort(data.cryptoBalance)}</span>
                    </div>
                    <div class="balance-item">
                        <span class="balance-label">📈 주식</span>
                        <span class="balance-value">${formatAmountShort(data.stockBalance)}</span>
                    </div>
                </div>
            </div>

            <!-- 입출금 내역 -->
            <div class="fiat-flows-section">
                <h4>📜 입출금 내역 (${fiatFlows.length}건)</h4>
                <div class="fiat-flows-list" id="fiatFlowsList">
                    ${renderFiatFlowsList()}
                </div>
            </div>
        </div>

        <!-- 입출금 추가 모달 -->
        ${renderFiatFlowModal()}
    `;
}

function renderFiatFlowsList() {
    if (fiatFlows.length === 0) {
        return `
            <div class="empty-state">
                <p>입출금 기록이 없습니다</p>
                <p class="hint">위의 '+ 입출금 기록' 버튼으로 추가하세요</p>
            </div>
        `;
    }

    return fiatFlows.map(flow => {
        const isDeposit = flow.type === 'deposit';
        const typeIcon = isDeposit ? '📥' : '📤';
        const typeLabel = isDeposit ? '입금' : '출금';
        const typeClass = isDeposit ? 'deposit' : 'withdraw';

        return `
            <div class="fiat-flow-item ${typeClass}" data-id="${flow.id}">
                <div class="flow-icon">${typeIcon}</div>
                <div class="flow-info">
                    <div class="flow-platform">${flow.platform || '미지정'}</div>
                    <div class="flow-meta">${flow.date} · ${typeLabel}</div>
                    ${flow.notes ? `<div class="flow-notes">${flow.notes}</div>` : ''}
                </div>
                <div class="flow-amount ${typeClass}">${isDeposit ? '+' : '-'}${formatAmountShort(flow.amount)}</div>
                <button class="btn-icon delete-flow-btn" data-id="${flow.id}" title="삭제">🗑️</button>
            </div>
        `;
    }).join('');
}

function renderFiatFlowModal() {
    return `
        <div id="fiatFlowModal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>입출금 기록</h3>
                    <button class="close-btn" id="closeFiatFlowModalBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-row">
                        <div class="form-group">
                            <label>유형</label>
                            <select id="fiatFlowType">
                                <option value="deposit">📥 입금 (은행→투자처)</option>
                                <option value="withdraw">📤 출금 (투자처→은행)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>투자처 종류</label>
                            <select id="fiatPlatformType">
                                <option value="crypto">🪙 크립토 거래소</option>
                                <option value="stock">📈 증권사</option>
                                <option value="other">📦 기타</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>거래소/증권사</label>
                        <select id="fiatPlatform">
                            ${PLATFORM_PRESETS.crypto.map(p => `<option value="${p}">${p}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>금액 (원)</label>
                        <input type="number" id="fiatAmount" placeholder="0">
                    </div>
                    <div class="fiat-preset-amounts">
                        <span class="preset-label">빠른 선택:</span>
                        <button class="preset-btn" data-amount="100000">10만</button>
                        <button class="preset-btn" data-amount="500000">50만</button>
                        <button class="preset-btn" data-amount="1000000">100만</button>
                        <button class="preset-btn" data-amount="5000000">500만</button>
                    </div>
                    <div class="form-group">
                        <label>날짜</label>
                        <input type="date" id="fiatDate" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label>메모 (선택)</label>
                        <input type="text" id="fiatNotes" placeholder="예: 비트코인 구매용">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelFiatFlowBtn">취소</button>
                    <button class="btn btn-primary" id="saveFiatFlowBtn">저장</button>
                </div>
            </div>
        </div>
    `;
}

function initFiatProfit() {
    // 입출금 추가 버튼
    document.getElementById('addFiatFlowBtn')?.addEventListener('click', () => openFiatFlowModal());

    // 모달 버튼
    document.getElementById('closeFiatFlowModalBtn')?.addEventListener('click', closeFiatFlowModal);
    document.getElementById('cancelFiatFlowBtn')?.addEventListener('click', closeFiatFlowModal);
    document.getElementById('saveFiatFlowBtn')?.addEventListener('click', saveFiatFlowItem);

    // 투자처 종류 변경 시 플랫폼 목록 업데이트
    document.getElementById('fiatPlatformType')?.addEventListener('change', updatePlatformOptions);

    // 빠른 금액 선택
    document.querySelectorAll('.fiat-preset-amounts .preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('fiatAmount').value = btn.dataset.amount;
        });
    });

    // 삭제 버튼 이벤트
    attachFiatFlowEvents();
}

function updatePlatformOptions() {
    const type = document.getElementById('fiatPlatformType').value;
    const platformSelect = document.getElementById('fiatPlatform');
    const presets = PLATFORM_PRESETS[type] || PLATFORM_PRESETS.other;
    platformSelect.innerHTML = presets.map(p => `<option value="${p}">${p}</option>`).join('');
}

function attachFiatFlowEvents() {
    document.querySelectorAll('.delete-flow-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (confirm('이 기록을 삭제하시겠습니까?')) {
                const result = await deleteFiatFlow(id);
                if (result.success) {
                    await loadToolsData();
                    renderCurrentTool();
                } else {
                    alert('삭제 실패: ' + result.error);
                }
            }
        });
    });
}

function openFiatFlowModal() {
    document.getElementById('fiatFlowModal').style.display = 'flex';
    document.getElementById('fiatFlowType').value = 'deposit';
    document.getElementById('fiatPlatformType').value = 'crypto';
    updatePlatformOptions();
    document.getElementById('fiatAmount').value = '';
    document.getElementById('fiatDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('fiatNotes').value = '';
}

function closeFiatFlowModal() {
    document.getElementById('fiatFlowModal').style.display = 'none';
}

async function saveFiatFlowItem() {
    const type = document.getElementById('fiatFlowType').value;
    const platformType = document.getElementById('fiatPlatformType').value;
    const platform = document.getElementById('fiatPlatform').value;
    const amount = parseInt(document.getElementById('fiatAmount').value) || 0;
    const date = document.getElementById('fiatDate').value;
    const notes = document.getElementById('fiatNotes').value.trim();

    if (amount <= 0) {
        alert('금액을 입력해주세요.');
        return;
    }

    if (!date) {
        alert('날짜를 선택해주세요.');
        return;
    }

    const data = {
        type,
        platform_type: platformType,
        platform,
        amount,
        date,
        notes: notes || null
    };

    const result = await createFiatFlow(data);

    if (result.success) {
        closeFiatFlowModal();
        await loadToolsData();
        renderCurrentTool();
    } else {
        alert('저장 실패: ' + result.error);
    }
}

// ============================================
// 월간 리포트
// ============================================

function renderMonthlyReport() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 이번 달 거래 필터링
    const thisMonthTx = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    // 지난 달 거래 필터링
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthTx = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate.getMonth() === lastMonth && txDate.getFullYear() === lastMonthYear;
    });

    // 수입/지출 계산
    const thisIncome = thisMonthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const thisExpense = thisMonthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const lastIncome = lastMonthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const lastExpense = lastMonthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    // 증감률 계산
    const incomeChange = lastIncome > 0 ? ((thisIncome - lastIncome) / lastIncome * 100).toFixed(1) : 0;
    const expenseChange = lastExpense > 0 ? ((thisExpense - lastExpense) / lastExpense * 100).toFixed(1) : 0;

    // 카테고리별 지출 분석
    const categoryExpenses = {};
    thisMonthTx.filter(t => t.type === 'expense').forEach(t => {
        const cat = t.category || '기타';
        categoryExpenses[cat] = (categoryExpenses[cat] || 0) + t.amount;
    });

    // 정렬 (지출 많은 순)
    const sortedCategories = Object.entries(categoryExpenses)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

    return `
        <div class="report-container">
            <div class="report-header">
                <h2>📋 ${currentYear}년 ${monthNames[currentMonth]} 리포트</h2>
                <p class="report-period">${currentYear}.${String(currentMonth + 1).padStart(2, '0')}.01 ~ ${currentYear}.${String(currentMonth + 1).padStart(2, '0')}.${new Date(currentYear, currentMonth + 1, 0).getDate()}</p>
            </div>

            <!-- 요약 카드 -->
            <div class="report-summary">
                <div class="report-card income">
                    <div class="report-card-label">총 수입</div>
                    <div class="report-card-value">${formatAmountShort(thisIncome)}</div>
                    <div class="report-card-change ${incomeChange >= 0 ? 'positive' : 'negative'}">
                        ${incomeChange >= 0 ? '▲' : '▼'} ${Math.abs(incomeChange)}% vs 지난달
                    </div>
                </div>
                <div class="report-card expense">
                    <div class="report-card-label">총 지출</div>
                    <div class="report-card-value">${formatAmountShort(thisExpense)}</div>
                    <div class="report-card-change ${expenseChange <= 0 ? 'positive' : 'negative'}">
                        ${expenseChange >= 0 ? '▲' : '▼'} ${Math.abs(expenseChange)}% vs 지난달
                    </div>
                </div>
                <div class="report-card savings">
                    <div class="report-card-label">순 저축</div>
                    <div class="report-card-value ${thisIncome - thisExpense >= 0 ? 'positive' : 'negative'}">${formatAmountShort(thisIncome - thisExpense)}</div>
                    <div class="report-card-change">저축률 ${thisIncome > 0 ? ((thisIncome - thisExpense) / thisIncome * 100).toFixed(0) : 0}%</div>
                </div>
            </div>

            <!-- 카테고리별 지출 -->
            <div class="report-section">
                <h3>💸 지출 TOP 5</h3>
                ${sortedCategories.length > 0 ? `
                    <div class="category-ranking">
                        ${sortedCategories.map(([cat, amount], idx) => `
                            <div class="ranking-item">
                                <span class="ranking-number">${idx + 1}</span>
                                <span class="ranking-category">${cat}</span>
                                <span class="ranking-amount">${formatAmountShort(amount)}</span>
                                <span class="ranking-percent">${(amount / thisExpense * 100).toFixed(0)}%</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<div class="empty-state-v2 compact"><div class="empty-icon">📊</div><div class="empty-title">이번 달 지출 내역이 없습니다</div></div>'}
            </div>

            <!-- 인사이트 -->
            <div class="report-section">
                <h3>💡 인사이트</h3>
                <div class="report-insights">
                    ${generateReportInsights(thisIncome, thisExpense, lastIncome, lastExpense, sortedCategories)}
                </div>
            </div>

            <!-- 지난달 비교 -->
            <div class="report-section">
                <h3>📊 지난달 비교</h3>
                <div class="comparison-grid">
                    <div class="comparison-item">
                        <span class="comp-label">지난달 수입</span>
                        <span class="comp-value">${formatAmountShort(lastIncome)}</span>
                    </div>
                    <div class="comparison-item">
                        <span class="comp-label">이번달 수입</span>
                        <span class="comp-value">${formatAmountShort(thisIncome)}</span>
                    </div>
                    <div class="comparison-item">
                        <span class="comp-label">지난달 지출</span>
                        <span class="comp-value">${formatAmountShort(lastExpense)}</span>
                    </div>
                    <div class="comparison-item">
                        <span class="comp-label">이번달 지출</span>
                        <span class="comp-value">${formatAmountShort(thisExpense)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateReportInsights(thisIncome, thisExpense, lastIncome, lastExpense, topCategories) {
    const insights = [];
    const savings = thisIncome - thisExpense;
    const savingsRate = thisIncome > 0 ? (savings / thisIncome * 100) : 0;

    // 저축률 인사이트
    if (savingsRate >= 30) {
        insights.push({ icon: '🎉', text: `저축률 ${savingsRate.toFixed(0)}%! 훌륭한 자금 관리입니다.`, type: 'positive' });
    } else if (savingsRate >= 10) {
        insights.push({ icon: '👍', text: `저축률 ${savingsRate.toFixed(0)}%. 꾸준히 저축하고 있어요.`, type: 'normal' });
    } else if (savingsRate < 0) {
        insights.push({ icon: '⚠️', text: '이번 달 지출이 수입을 초과했어요. 지출 점검이 필요합니다.', type: 'warning' });
    }

    // 지출 변화 인사이트
    if (lastExpense > 0) {
        const expenseChange = ((thisExpense - lastExpense) / lastExpense * 100);
        if (expenseChange > 20) {
            insights.push({ icon: '📈', text: `지출이 지난달 대비 ${expenseChange.toFixed(0)}% 증가했어요.`, type: 'warning' });
        } else if (expenseChange < -20) {
            insights.push({ icon: '📉', text: `지출이 지난달 대비 ${Math.abs(expenseChange).toFixed(0)}% 감소했어요!`, type: 'positive' });
        }
    }

    // 최대 지출 카테고리
    if (topCategories.length > 0) {
        const [topCat, topAmount] = topCategories[0];
        const topPercent = thisExpense > 0 ? (topAmount / thisExpense * 100) : 0;
        if (topPercent > 40) {
            insights.push({ icon: '🔍', text: `'${topCat}' 지출이 전체의 ${topPercent.toFixed(0)}%를 차지해요.`, type: 'normal' });
        }
    }

    if (insights.length === 0) {
        insights.push({ icon: '📊', text: '데이터가 더 쌓이면 자세한 분석을 볼 수 있어요.', type: 'normal' });
    }

    return insights.map(i => `
        <div class="insight-item ${i.type}">
            <span class="insight-icon">${i.icon}</span>
            <span class="insight-text">${i.text}</span>
        </div>
    `).join('');
}

function initMonthlyReport() {
    // 특별한 초기화 필요 없음
}
