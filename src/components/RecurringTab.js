import { getRecurringItems, createRecurringItem, updateRecurringItem, deleteRecurringItem } from '../services/database.js';
import { formatAmount } from '../utils/helpers.js';

let recurringItems = [];
let editingItemId = null;

// D-day 계산 함수
function calculateDday(day, frequency = 'monthly') {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    if (frequency === 'daily') {
        return { days: 0, text: '매일', isToday: true };
    }

    if (frequency === 'weekly') {
        const todayDayOfWeek = today.getDay(); // 0=일, 1=월, ...
        const targetDay = day % 7; // 1-7을 0-6으로 변환
        let daysUntil = (targetDay - todayDayOfWeek + 7) % 7;
        if (daysUntil === 0) {
            return { days: 0, text: 'D-Day', isToday: true };
        }
        return { days: daysUntil, text: `D-${daysUntil}`, isToday: false };
    }

    // Monthly
    let nextPaymentDate;
    if (currentDay <= day) {
        // 이번 달에 아직 결제일 안 지남
        nextPaymentDate = new Date(currentYear, currentMonth, day);
    } else {
        // 다음 달
        nextPaymentDate = new Date(currentYear, currentMonth + 1, day);
    }

    // 해당 월의 마지막 날 확인 (31일 설정 시 월말 처리)
    const lastDayOfMonth = new Date(nextPaymentDate.getFullYear(), nextPaymentDate.getMonth() + 1, 0).getDate();
    if (day > lastDayOfMonth) {
        nextPaymentDate.setDate(lastDayOfMonth);
    }

    const diffTime = nextPaymentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return { days: 0, text: 'D-Day', isToday: true };
    } else if (diffDays < 0) {
        return { days: diffDays, text: `D+${Math.abs(diffDays)}`, isToday: false };
    } else {
        return { days: diffDays, text: `D-${diffDays}`, isToday: false };
    }
}

export function createRecurringTab() {
    return `
        <div class="recurring-container">
            <div class="recurring-header">
                <h1 style="font-size: var(--text-3xl); font-weight: var(--font-bold); color: var(--gray-800);">
                    💼 고정 항목 관리
                </h1>
                <div class="recurring-actions">
                    <button class="btn-add income" id="addRecurringIncomeBtn">
                        ➕ 고정 수입 추가
                    </button>
                    <button class="btn-add expense" id="addRecurringExpenseBtn">
                        ➕ 고정 지출 추가
                    </button>
                </div>
            </div>

            <!-- 고정 수입 -->
            <div class="recurring-section">
                <div class="recurring-section-header">
                    <div class="recurring-section-title">
                        📥 고정 수입
                    </div>
                    <div class="recurring-total income" id="totalRecurringIncome">월 0원</div>
                </div>
                <div id="recurringIncomeList"></div>
            </div>

            <!-- 고정 지출 -->
            <div class="recurring-section">
                <div class="recurring-section-header">
                    <div class="recurring-section-title">
                        📤 고정 지출
                    </div>
                    <div class="recurring-total expense" id="totalRecurringExpense">월 0원</div>
                </div>
                <div id="recurringExpenseList"></div>
            </div>

            <!-- 요약 -->
            <div class="recurring-summary">
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-item-label">총 고정 수입</div>
                        <div class="summary-item-value" id="summaryIncome">월 0원</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-item-label">총 고정 지출</div>
                        <div class="summary-item-value" id="summaryExpense">월 0원</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-item-label">예상 월 순수익</div>
                        <div class="summary-item-value" id="summaryProfit">+0원</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 고정 항목 추가/수정 모달 -->
        <div class="modal-overlay" id="recurringModal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title" id="recurringModalTitle">고정 항목 추가</h2>
                    <button class="modal-close" id="closeModalBtn">&times;</button>
                </div>
                <form class="modal-form" id="recurringForm">
                    <input type="hidden" id="recurringEditId">
                    <input type="hidden" id="recurringType">

                    <div class="form-group-modal">
                        <label for="recurringCategory">카테고리 *</label>
                        <input type="text" id="recurringCategory" required placeholder="예: 본업 급여, 대출 상환">
                    </div>

                    <div class="form-group-modal">
                        <label for="recurringAmount">금액 (원) *</label>
                        <input type="number" id="recurringAmount" required placeholder="0" step="1000">
                    </div>

                    <div class="form-group-modal">
                        <label for="recurringFrequency">반복 주기 *</label>
                        <select id="recurringFrequency" required>
                            <option value="monthly">매월</option>
                            <option value="weekly">매주</option>
                            <option value="daily">매일</option>
                        </select>
                    </div>

                    <div class="form-group-modal">
                        <label for="recurringDay">반복일 *</label>
                        <input type="number" id="recurringDay" required placeholder="1-31" min="1" max="31">
                        <small style="color: var(--gray-500);">매월 X일 (예: 5일, 25일)</small>
                    </div>

                    <div class="form-group-modal">
                        <label for="recurringDescription">설명</label>
                        <input type="text" id="recurringDescription" placeholder="추가 설명 (선택사항)">
                    </div>

                    <button type="submit" class="btn-submit">저장</button>
                </form>
            </div>
        </div>
    `;
}

export async function initRecurringTab() {
    // 데이터 로드
    await loadRecurringData();

    // 고정 수입 추가 버튼
    document.getElementById('addRecurringIncomeBtn').addEventListener('click', () => {
        openModal('income');
    });

    // 고정 지출 추가 버튼
    document.getElementById('addRecurringExpenseBtn').addEventListener('click', () => {
        openModal('expense');
    });

    // 모달 닫기
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('recurringModal').addEventListener('click', (e) => {
        if (e.target.id === 'recurringModal') {
            closeModal();
        }
    });

    // 폼 제출
    document.getElementById('recurringForm').addEventListener('submit', handleFormSubmit);
}

async function loadRecurringData() {
    try {
        const result = await getRecurringItems();
        if (!result.success) {
            console.error('고정 항목 로드 실패:', result.error);
            return;
        }
        recurringItems = result.data || [];
        updateRecurringDisplay();
    } catch (error) {
        console.error('고정 항목 로드 에러:', error);
    }
}

function updateRecurringDisplay() {
    const incomeItems = recurringItems.filter(item => item.type === 'income');
    const expenseItems = recurringItems.filter(item => item.type === 'expense');

    // 고정 수입 목록
    const incomeListEl = document.getElementById('recurringIncomeList');
    incomeListEl.innerHTML = incomeItems.length > 0
        ? incomeItems.map(item => createRecurringItemHTML(item)).join('')
        : '<div class="recurring-empty">고정 수입이 없습니다</div>';

    // 고정 지출 목록
    const expenseListEl = document.getElementById('recurringExpenseList');
    expenseListEl.innerHTML = expenseItems.length > 0
        ? expenseItems.map(item => createRecurringItemHTML(item)).join('')
        : '<div class="recurring-empty">고정 지출이 없습니다</div>';

    // 총합 계산
    const totalIncome = calculateMonthlyTotal(incomeItems);
    const totalExpense = calculateMonthlyTotal(expenseItems);
    const netProfit = totalIncome - totalExpense;

    document.getElementById('totalRecurringIncome').textContent = `월 ${formatAmount(totalIncome)}`;
    document.getElementById('totalRecurringExpense').textContent = `월 ${formatAmount(totalExpense)}`;
    document.getElementById('summaryIncome').textContent = `월 ${formatAmount(totalIncome)}`;
    document.getElementById('summaryExpense').textContent = `월 ${formatAmount(totalExpense)}`;

    const profitEl = document.getElementById('summaryProfit');
    profitEl.textContent = `${netProfit >= 0 ? '+' : ''}${formatAmount(netProfit)}`;
    profitEl.style.color = netProfit >= 0 ? 'var(--income)' : 'var(--expense)';

    // 항목 버튼 이벤트 리스너 추가
    addItemEventListeners();
}

function createRecurringItemHTML(item) {
    const frequencyText = {
        monthly: '매월',
        weekly: '매주',
        daily: '매일'
    };

    const dday = calculateDday(item.day || 1, item.frequency || 'monthly');
    const ddayClass = dday.isToday ? 'dday-today' : (dday.days <= 3 ? 'dday-soon' : 'dday-normal');

    return `
        <div class="recurring-item ${item.type}" data-id="${item.id}">
            <div class="recurring-item-dday ${ddayClass}">
                ${dday.text}
            </div>
            <div class="recurring-item-info">
                <div class="recurring-item-category">${item.category}</div>
                <div class="recurring-item-detail">
                    ${frequencyText[item.frequency] || '매월'} ${item.day || 1}일
                    ${item.description ? ` • ${item.description}` : ''}
                </div>
            </div>
            <div class="recurring-item-amount ${item.type}">
                ${item.type === 'income' ? '+' : '-'}${formatAmount(item.amount)}
            </div>
            <div class="recurring-item-actions">
                <button class="recurring-edit-btn" data-id="${item.id}">✏️</button>
                <button class="recurring-delete-btn" data-id="${item.id}">🗑️</button>
            </div>
        </div>
    `;
}

function calculateMonthlyTotal(items) {
    return items.reduce((sum, item) => {
        let monthlyAmount = item.amount;
        if (item.frequency === 'weekly') {
            monthlyAmount = item.amount * 4;
        } else if (item.frequency === 'daily') {
            monthlyAmount = item.amount * 30;
        }
        return sum + monthlyAmount;
    }, 0);
}

function addItemEventListeners() {
    // 수정 버튼
    document.querySelectorAll('.recurring-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const item = recurringItems.find(i => i.id === id);
            if (item) {
                openModal(item.type, item);
            }
        });
    });

    // 삭제 버튼
    document.querySelectorAll('.recurring-delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            if (confirm('정말 삭제하시겠습니까?')) {
                const result = await deleteRecurringItem(id);
                if (result.success) {
                    await loadRecurringData();
                } else {
                    alert('삭제에 실패했습니다.');
                }
            }
        });
    });
}

function openModal(type, item = null) {
    const modal = document.getElementById('recurringModal');
    const titleEl = document.getElementById('recurringModalTitle');

    editingItemId = item ? item.id : null;

    if (item) {
        titleEl.textContent = `고정 ${type === 'income' ? '수입' : '지출'} 수정`;
        document.getElementById('recurringCategory').value = item.category;
        document.getElementById('recurringAmount').value = item.amount;
        document.getElementById('recurringFrequency').value = item.frequency || 'monthly';
        document.getElementById('recurringDay').value = item.day || 1;
        document.getElementById('recurringDescription').value = item.description || '';
    } else {
        titleEl.textContent = `고정 ${type === 'income' ? '수입' : '지출'} 추가`;
        document.getElementById('recurringForm').reset();
    }

    document.getElementById('recurringType').value = type;
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('recurringModal').style.display = 'none';
    editingItemId = null;
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const type = document.getElementById('recurringType').value;
    const category = document.getElementById('recurringCategory').value;
    const amount = parseInt(document.getElementById('recurringAmount').value) || 0;
    const frequency = document.getElementById('recurringFrequency').value;
    const day = parseInt(document.getElementById('recurringDay').value) || 1;
    const description = document.getElementById('recurringDescription').value;

    if (!category || amount <= 0) {
        alert('카테고리와 금액을 입력해주세요.');
        return;
    }

    const itemData = {
        type,
        category,
        amount,
        frequency,
        day,
        description
    };

    try {
        let result;
        if (editingItemId) {
            result = await updateRecurringItem(editingItemId, itemData);
        } else {
            result = await createRecurringItem(itemData);
        }

        if (result.success) {
            closeModal();
            await loadRecurringData();
        } else {
            alert(`오류: ${result.error}`);
        }
    } catch (error) {
        console.error('고정 항목 저장 에러:', error);
        alert('저장에 실패했습니다.');
    }
}
