// 도구 탭: 캘린더, 고정지출, 소비분석, 대출계산기, 계정설정
import { getDebts, getRecurringItems, createRecurringItem, updateRecurringItem, deleteRecurringItem, getStakingOverview, getAirdropOverview, getTransactions } from '../services/database.js';
import { formatAmount, formatAmountShort } from '../utils/helpers.js';
import { updatePassword } from '../services/auth.js';
import { getCurrentUser } from '../services/supabase.js';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants.js';

let currentTool = 'calendar';
let debts = [];
let recurringItems = [];
let stakingList = [];
let airdropList = [];
let transactions = [];

export function createToolsTab() {
    return `
        <div class="tools-container">
            <!-- 도구 선택 탭 -->
            <div class="tool-tabs">
                <button class="tool-tab-btn active" data-tool="calendar">📅 캘린더</button>
                <button class="tool-tab-btn" data-tool="recurring">🔄 고정지출</button>
                <button class="tool-tab-btn" data-tool="spending">📊 소비분석</button>
                <button class="tool-tab-btn" data-tool="futures">📉 선물손실</button>
                <button class="tool-tab-btn" data-tool="debt-calc">🧮 계산기</button>
                <button class="tool-tab-btn" data-tool="account">⚙️ 계정</button>
            </div>

            <!-- 도구 컨텐츠 영역 -->
            <div class="tool-content" id="toolContent">
                <!-- 동적으로 채워짐 -->
            </div>
        </div>
    `;
}

export async function initToolsTab() {
    // 데이터 로드
    await loadToolsData();

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
    const [debtsRes, recurringRes, stakingRes, airdropRes, transactionsRes] = await Promise.all([
        getDebts(),
        getRecurringItems(),
        getStakingOverview(),
        getAirdropOverview(),
        getTransactions()
    ]);

    debts = debtsRes.data || [];
    recurringItems = recurringRes.data || [];
    stakingList = stakingRes.data || [];
    airdropList = airdropRes.data || [];
    transactions = transactionsRes.data || [];
}

function renderCurrentTool() {
    const content = document.getElementById('toolContent');

    switch (currentTool) {
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
// 캘린더 뷰
// ============================================

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function renderCalendar() {
    return `
        <div class="calendar-container">
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
                <h3>🔄 고정 수입/지출 관리</h3>
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
                        <label>카테고리</label>
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
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="recurringActive" checked>
                            활성화
                        </label>
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

    return items.map(item => `
        <div class="recurring-item ${type}" data-id="${item.id}">
            <div class="recurring-item-info">
                <div class="recurring-item-name">${item.description || item.category}</div>
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
    `).join('');
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
        document.getElementById('recurringActive').checked = item.is_active !== false;
    } else {
        document.getElementById('recurringType').value = 'expense';
        updateRecurringCategories();
        document.getElementById('recurringDescription').value = '';
        document.getElementById('recurringAmount').value = '';
        document.getElementById('recurringDay').value = 1;
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

    // 카테고리 목록
    document.getElementById('categoryBreakdown').innerHTML = `
        <h4>카테고리별 지출</h4>
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

    if (categoryData.length > 0) {
        const topCategory = categoryData[0];
        insights.push(`💡 가장 많이 쓴 카테고리: <strong>${topCategory[0]}</strong> (${formatAmountShort(topCategory[1])})`);
    }

    if (totalIncome > 0) {
        const savingRate = ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1);
        if (savingRate > 0) {
            insights.push(`💰 저축률: <strong>${savingRate}%</strong>`);
        } else {
            insights.push(`⚠️ 지출이 수입보다 많습니다!`);
        }
    }

    const avgDaily = totalExpense / 30;
    insights.push(`📊 일 평균 지출: <strong>${formatAmountShort(avgDaily)}</strong>`);

    document.getElementById('spendingInsights').innerHTML = `
        <h4>💡 인사이트</h4>
        <ul class="insights-list">
            ${insights.map(i => `<li>${i}</li>`).join('')}
        </ul>
    `;
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
            <h3>🧮 대출 상환 시뮬레이션</h3>

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
                <p class="hint">선물 손실을 기록하려면 거래 탭에서 "지출 > 선물거래" 카테고리로 추가하세요.</p>
            </div>
        </div>
    `;
}

function initFuturesLoss() {
    // 현재는 별도 초기화 필요 없음
}

// ============================================
// 계정 설정
// ============================================

function renderAccountSettings() {
    return `
        <div class="account-settings-container">
            <h3>⚙️ 계정 설정</h3>

            <div class="account-info-section">
                <h4>👤 계정 정보</h4>
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
