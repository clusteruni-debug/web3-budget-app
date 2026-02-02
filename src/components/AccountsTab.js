import { getAccounts, createAccount, updateAccount, deleteAccount, createArbitrageTransaction, getArbitrageTransactions } from '../services/database.js';
import { EXCHANGES, WALLETS, ARBITRAGE_TAGS } from '../utils/constants.js';
import { formatAmount, getToday } from '../utils/helpers.js';

let accounts = [];
let arbitrageHistory = [];
let currentView = 'accounts'; // 'accounts' | 'arbitrage'

export function createAccountsTab() {
    return `
        <div class="accounts-container">
            <!-- 탭 전환 -->
            <div class="sub-tabs">
                <button class="sub-tab active" data-view="accounts">💼 거래소/은행 관리</button>
                <button class="sub-tab" data-view="arbitrage">📊 차익거래</button>
            </div>

            <!-- 계정 관리 뷰 -->
            <div id="accountsView" class="view-content">
                <div class="section-header">
                    <h2>거래소 & 지갑 관리</h2>
                    <button class="btn" id="addAccountBtn">+ 추가</button>
                </div>

                <!-- 거래소 섹션 -->
                <div class="account-section">
                    <h3>🏦 거래소</h3>
                    <div class="accounts-grid" id="exchangesList"></div>
                </div>

                <!-- 지갑 섹션 -->
                <div class="account-section">
                    <h3>👛 지갑</h3>
                    <div class="accounts-grid" id="walletsList"></div>
                </div>

                <!-- 기타 섹션 -->
                <div class="account-section">
                    <h3>📁 기타</h3>
                    <div class="accounts-grid" id="otherAccountsList"></div>
                </div>
            </div>

            <!-- 차익거래 뷰 -->
            <div id="arbitrageView" class="view-content" style="display: none;">
                <div class="section-header">
                    <h2>차익거래 기록</h2>
                </div>

                <!-- 차익거래 입력 폼 -->
                <div class="input-section arbitrage-form">
                    <h3>새 차익거래 기록</h3>
                    <div class="form-group">
                        <div>
                            <label>출발 거래소/지갑</label>
                            <select id="arbFromAccount"></select>
                        </div>
                        <div>
                            <label>도착 거래소/지갑</label>
                            <select id="arbToAccount"></select>
                        </div>
                        <div>
                            <label>날짜</label>
                            <input type="date" id="arbDate" value="${getToday()}">
                        </div>
                    </div>
                    <div class="form-group">
                        <div>
                            <label>토큰명</label>
                            <input type="text" id="arbToken" placeholder="BTC, ETH...">
                        </div>
                        <div>
                            <label>수량</label>
                            <input type="number" id="arbQuantity" placeholder="0.00" step="0.0001">
                        </div>
                        <div>
                            <label>거래 유형</label>
                            <select id="arbType">
                                <option value="김프">김프 (한→해외)</option>
                                <option value="역프">역프 (해외→한)</option>
                                <option value="재정거래">재정거래</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <div>
                            <label>출발 금액 (원)</label>
                            <input type="number" id="arbDepartureAmount" placeholder="보낸 금액">
                        </div>
                        <div>
                            <label>도착 금액 (원)</label>
                            <input type="number" id="arbArrivalAmount" placeholder="받은 금액">
                        </div>
                        <div>
                            <label>순수익</label>
                            <div class="profit-display" id="arbProfitDisplay">0원</div>
                        </div>
                    </div>
                    <div class="form-group">
                        <div style="grid-column: 1 / -1;">
                            <label>메모</label>
                            <input type="text" id="arbDescription" placeholder="차익거래 상세 내용">
                        </div>
                    </div>
                    <button class="btn" id="submitArbitrageBtn">차익거래 기록</button>
                </div>

                <!-- 차익거래 통계 -->
                <div class="arbitrage-stats">
                    <div class="stat-card">
                        <h4>📊 총 거래 횟수</h4>
                        <div class="stat-value" id="arbTotalCount">0</div>
                    </div>
                    <div class="stat-card">
                        <h4>💰 총 수익</h4>
                        <div class="stat-value" id="arbTotalProfit">0원</div>
                    </div>
                    <div class="stat-card">
                        <h4>✅ 성공</h4>
                        <div class="stat-value" id="arbSuccessCount">0</div>
                    </div>
                    <div class="stat-card">
                        <h4>❌ 손실</h4>
                        <div class="stat-value" id="arbLossCount">0</div>
                    </div>
                </div>

                <!-- 차익거래 이력 -->
                <div class="arbitrage-history">
                    <h3>거래 이력</h3>
                    <div class="history-list" id="arbitrageHistoryList"></div>
                </div>
            </div>
        </div>

        <!-- 계정 추가 모달 -->
        <div id="accountModal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>거래소/지갑 추가</h3>
                    <button class="close-btn" id="closeModalBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>유형</label>
                        <select id="modalAccountType">
                            <option value="exchange">거래소</option>
                            <option value="wallet">지갑</option>
                        </select>
                    </div>
                    <div class="form-group" id="exchangeSelectGroup">
                        <label>거래소 선택</label>
                        <select id="modalExchangeSelect">
                            ${EXCHANGES.map(e => `<option value="${e.id}">${e.icon} ${e.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" id="walletSelectGroup" style="display: none;">
                        <label>지갑 선택</label>
                        <select id="modalWalletSelect">
                            ${WALLETS.map(w => `<option value="${w.id}">${w.icon} ${w.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>표시 이름 (선택)</label>
                        <input type="text" id="modalAccountName" placeholder="예: 바이낸스 메인">
                    </div>
                    <div class="form-group">
                        <label>현재 잔액 (원)</label>
                        <input type="number" id="modalAccountBalance" placeholder="0" value="0">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelModalBtn">취소</button>
                    <button class="btn" id="saveAccountBtn">저장</button>
                </div>
            </div>
        </div>
    `;
}

export async function initAccountsTab() {
    await loadAccountsData();

    // 탭 전환
    document.querySelectorAll('.sub-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentView = tab.dataset.view;
            updateView();
        });
    });

    // 계정 추가 모달
    document.getElementById('addAccountBtn').addEventListener('click', openModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
    document.getElementById('saveAccountBtn').addEventListener('click', saveAccount);

    // 계정 유형 변경
    document.getElementById('modalAccountType').addEventListener('change', (e) => {
        const isExchange = e.target.value === 'exchange';
        document.getElementById('exchangeSelectGroup').style.display = isExchange ? '' : 'none';
        document.getElementById('walletSelectGroup').style.display = isExchange ? 'none' : '';
    });

    // 차익거래 폼
    document.getElementById('submitArbitrageBtn').addEventListener('click', submitArbitrage);

    // 수익 자동 계산
    document.getElementById('arbDepartureAmount').addEventListener('input', calculateProfit);
    document.getElementById('arbArrivalAmount').addEventListener('input', calculateProfit);
}

async function loadAccountsData() {
    try {
        const [accountsResult, arbResult] = await Promise.all([
            getAccounts(),
            getArbitrageTransactions()
        ]);

        if (accountsResult.success) {
            accounts = accountsResult.data || [];
        }
        if (arbResult.success) {
            arbitrageHistory = arbResult.data || [];
        }

        updateView();
    } catch (error) {
        console.error('계정 데이터 로드 에러:', error);
    }
}

function updateView() {
    document.getElementById('accountsView').style.display = currentView === 'accounts' ? '' : 'none';
    document.getElementById('arbitrageView').style.display = currentView === 'arbitrage' ? '' : 'none';

    if (currentView === 'accounts') {
        renderAccounts();
    } else {
        renderArbitrage();
    }
}

function renderAccounts() {
    // 거래소
    const exchanges = accounts.filter(a => a.type === 'exchange');
    document.getElementById('exchangesList').innerHTML = exchanges.length > 0
        ? exchanges.map(a => createAccountCard(a)).join('')
        : '<div class="empty-state">등록된 거래소가 없습니다</div>';

    // 지갑
    const wallets = accounts.filter(a => a.type === 'wallet');
    document.getElementById('walletsList').innerHTML = wallets.length > 0
        ? wallets.map(a => createAccountCard(a)).join('')
        : '<div class="empty-state">등록된 지갑이 없습니다</div>';

    // 기타 (web3, investment, bank, family)
    const others = accounts.filter(a => !['exchange', 'wallet'].includes(a.type));
    document.getElementById('otherAccountsList').innerHTML = others.length > 0
        ? others.map(a => createAccountCard(a)).join('')
        : '<div class="empty-state">기타 항목이 없습니다</div>';

    // 잔액 수정 이벤트
    document.querySelectorAll('.edit-balance-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const accountId = e.target.dataset.id;
            editBalance(accountId);
        });
    });

    // 계정 삭제 이벤트
    document.querySelectorAll('.delete-account-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const accountId = e.target.dataset.id;
            if (confirm('정말 삭제하시겠습니까?')) {
                await deleteAccount(accountId);
                await loadAccountsData();
            }
        });
    });
}

function createAccountCard(account) {
    const icon = getAccountIcon(account);
    return `
        <div class="account-card">
            <div class="account-icon">${icon}</div>
            <div class="account-info">
                <div class="account-name">${account.name}</div>
                <div class="account-balance">${formatAmount(account.balance)}</div>
            </div>
            <div class="account-actions">
                <button class="btn-icon edit-balance-btn" data-id="${account.id}" title="잔액 수정">✏️</button>
                <button class="btn-icon delete-account-btn" data-id="${account.id}" title="삭제">🗑️</button>
            </div>
        </div>
    `;
}

function getAccountIcon(account) {
    if (account.type === 'exchange') {
        const ex = EXCHANGES.find(e => e.id === account.sub_type);
        return ex ? ex.icon : '🏦';
    } else if (account.type === 'wallet') {
        const w = WALLETS.find(w => w.id === account.sub_type);
        return w ? w.icon : '👛';
    }
    // 기존 계정 타입
    const icons = { web3: '🌐', investment: '📈', bank: '🏦', family: '👨‍👩‍👧‍👦' };
    return icons[account.type] || '💰';
}

function renderArbitrage() {
    // 계정 셀렉트 업데이트
    const accountOptions = accounts.map(a =>
        `<option value="${a.id}">${getAccountIcon(a)} ${a.name}</option>`
    ).join('');

    document.getElementById('arbFromAccount').innerHTML = accountOptions;
    document.getElementById('arbToAccount').innerHTML = accountOptions;

    // 통계
    const totalProfit = arbitrageHistory.reduce((sum, t) => sum + (t.arbitrage_profit || 0), 0);
    const successCount = arbitrageHistory.filter(t => t.arbitrage_profit > 0).length;
    const lossCount = arbitrageHistory.filter(t => t.arbitrage_profit < 0).length;

    document.getElementById('arbTotalCount').textContent = arbitrageHistory.length;
    document.getElementById('arbTotalProfit').textContent = formatAmount(totalProfit);
    document.getElementById('arbSuccessCount').textContent = successCount;
    document.getElementById('arbLossCount').textContent = lossCount;

    // 이력 목록
    document.getElementById('arbitrageHistoryList').innerHTML = arbitrageHistory.length > 0
        ? arbitrageHistory.map(t => createArbitrageHistoryItem(t)).join('')
        : '<div class="empty-state">차익거래 기록이 없습니다</div>';
}

function createArbitrageHistoryItem(transaction) {
    const profitClass = transaction.arbitrage_profit >= 0 ? 'profit' : 'loss';
    const profitSign = transaction.arbitrage_profit >= 0 ? '+' : '';

    return `
        <div class="history-item">
            <div class="history-date">${transaction.date}</div>
            <div class="history-info">
                <div class="history-title">${transaction.title || transaction.token_name || '차익거래'}</div>
                <div class="history-detail">${transaction.description || ''}</div>
            </div>
            <div class="history-amounts">
                <div class="amount-row">
                    <span>출발:</span> ${formatAmount(transaction.departure_amount)}
                </div>
                <div class="amount-row">
                    <span>도착:</span> ${formatAmount(transaction.arrival_amount)}
                </div>
            </div>
            <div class="history-profit ${profitClass}">
                ${profitSign}${formatAmount(transaction.arbitrage_profit)}
            </div>
        </div>
    `;
}

function calculateProfit() {
    const departure = parseInt(document.getElementById('arbDepartureAmount').value) || 0;
    const arrival = parseInt(document.getElementById('arbArrivalAmount').value) || 0;
    const profit = arrival - departure;

    const display = document.getElementById('arbProfitDisplay');
    display.textContent = formatAmount(profit);
    display.className = 'profit-display ' + (profit >= 0 ? 'positive' : 'negative');
}

async function submitArbitrage() {
    const fromAccountId = document.getElementById('arbFromAccount').value;
    const toAccountId = document.getElementById('arbToAccount').value;
    const date = document.getElementById('arbDate').value;
    const tokenName = document.getElementById('arbToken').value;
    const tokenQuantity = parseFloat(document.getElementById('arbQuantity').value) || 0;
    const profitType = document.getElementById('arbType').value;
    const departureAmount = parseInt(document.getElementById('arbDepartureAmount').value) || 0;
    const arrivalAmount = parseInt(document.getElementById('arbArrivalAmount').value) || 0;
    const description = document.getElementById('arbDescription').value;

    if (!fromAccountId || !toAccountId) {
        alert('출발/도착 보관처를 선택해주세요.');
        return;
    }

    if (departureAmount <= 0) {
        alert('출발 금액을 입력해주세요.');
        return;
    }

    const fromAccount = accounts.find(a => a.id === fromAccountId);
    const toAccount = accounts.find(a => a.id === toAccountId);

    const result = await createArbitrageTransaction({
        title: `${profitType}: ${fromAccount?.name} → ${toAccount?.name}`,
        description,
        date,
        amount: arrivalAmount,
        fromAccountId,
        toAccountId,
        profit: arrivalAmount - departureAmount,
        departureAmount,
        arrivalAmount,
        tokenName,
        tokenQuantity,
        profitType
    });

    if (result.success) {
        alert('차익거래가 기록되었습니다.');
        clearArbitrageForm();
        await loadAccountsData();
    } else {
        alert(`오류: ${result.error}`);
    }
}

function clearArbitrageForm() {
    document.getElementById('arbToken').value = '';
    document.getElementById('arbQuantity').value = '';
    document.getElementById('arbDepartureAmount').value = '';
    document.getElementById('arbArrivalAmount').value = '';
    document.getElementById('arbDescription').value = '';
    document.getElementById('arbProfitDisplay').textContent = '0원';
}

function openModal() {
    document.getElementById('accountModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('accountModal').style.display = 'none';
    // 폼 초기화
    document.getElementById('modalAccountType').value = 'exchange';
    document.getElementById('modalExchangeSelect').value = EXCHANGES[0].id;
    document.getElementById('modalAccountName').value = '';
    document.getElementById('modalAccountBalance').value = '0';
    document.getElementById('exchangeSelectGroup').style.display = '';
    document.getElementById('walletSelectGroup').style.display = 'none';
}

async function saveAccount() {
    const accountType = document.getElementById('modalAccountType').value;
    const isExchange = accountType === 'exchange';
    const subType = isExchange
        ? document.getElementById('modalExchangeSelect').value
        : document.getElementById('modalWalletSelect').value;

    const selectedItem = isExchange
        ? EXCHANGES.find(e => e.id === subType)
        : WALLETS.find(w => w.id === subType);

    const customName = document.getElementById('modalAccountName').value;
    const balance = parseInt(document.getElementById('modalAccountBalance').value) || 0;

    const name = customName || selectedItem.name;

    const result = await createAccount({
        name,
        type: accountType,
        sub_type: subType,
        balance
    });

    if (result.success) {
        alert('보관처가 추가되었습니다.');
        closeModal();
        await loadAccountsData();
    } else {
        alert(`오류: ${result.error}`);
    }
}

async function editBalance(accountId) {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;

    const newBalance = prompt(`${account.name}의 새 잔액을 입력하세요:`, account.balance);
    if (newBalance === null) return;

    const result = await updateAccount(accountId, { balance: parseInt(newBalance) || 0 });
    if (result.success) {
        await loadAccountsData();
    } else {
        alert(`오류: ${result.error}`);
    }
}
