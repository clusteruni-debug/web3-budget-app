// V2: 통합 자산 관리 탭
import { getAssets, createAsset, updateAsset, deleteAsset, getDebts, createDebt, updateDebt, deleteDebt } from '../services/database.js';
import { formatAmount, getToday } from '../utils/helpers.js';
import { ASSET_CATEGORY_INFO, CRYPTO_TYPE_INFO, STAKING_STATUS_INFO, AIRDROP_STATUS_INFO, DEBT_TYPE_INFO } from '../utils/constants.js';

// 상수 별칭
const STAKING_STATUS = STAKING_STATUS_INFO;
const AIRDROP_STATUS = AIRDROP_STATUS_INFO;
const DEBT_TYPES = DEBT_TYPE_INFO;

let assets = [];
let debts = [];
let currentView = 'assets'; // 'assets' | 'staking' | 'airdrop' | 'debts'
let editingAsset = null;
let editingDebt = null;

export function createAssetManagementTab() {
    return `
        <div class="asset-management-container v2">
            <!-- 서브 탭 -->
            <div class="sub-tabs">
                <button class="sub-tab active" data-view="assets">💰 자산</button>
                <button class="sub-tab" data-view="staking">🔒 스테이킹</button>
                <button class="sub-tab" data-view="airdrop">🎯 에어드랍</button>
                <button class="sub-tab" data-view="debts">💳 부채</button>
            </div>

            <!-- 자산 뷰 -->
            <div id="assetsView" class="view-content">
                <div class="section-header">
                    <h2>자산 목록</h2>
                    <button class="btn btn-primary" id="addAssetBtn">+ 자산 추가</button>
                </div>

                <!-- 카테고리별 필터 -->
                <div class="filter-tabs" id="assetFilterTabs">
                    <button class="filter-tab active" data-filter="all">전체</button>
                    ${ASSET_CATEGORY_INFO.map(cat =>
                        `<button class="filter-tab" data-filter="${cat.id}">${cat.icon} ${cat.name}</button>`
                    ).join('')}
                </div>

                <!-- 자산 목록 -->
                <div class="asset-list" id="assetList">
                    <div class="loading">로딩 중...</div>
                </div>
            </div>

            <!-- 스테이킹 뷰 -->
            <div id="stakingView" class="view-content" style="display: none;">
                <div class="section-header">
                    <h2>스테이킹 현황</h2>
                    <button class="btn btn-primary" id="addStakingBtn">+ 스테이킹 추가</button>
                </div>

                <!-- 스테이킹 요약 -->
                <div class="staking-summary-grid">
                    <div class="summary-card">
                        <div class="summary-label">총 스테이킹 금액</div>
                        <div class="summary-value" id="totalStakingValue">0원</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">이번 달 언락 예정</div>
                        <div class="summary-value warning" id="unlockingSoon">0원</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">평균 APY</div>
                        <div class="summary-value" id="avgApy">0%</div>
                    </div>
                </div>

                <!-- 스테이킹 목록 -->
                <div class="staking-list-full" id="stakingListFull">
                    <div class="empty-state">스테이킹 자산이 없습니다</div>
                </div>
            </div>

            <!-- 에어드랍 뷰 -->
            <div id="airdropView" class="view-content" style="display: none;">
                <div class="section-header">
                    <h2>에어드랍 현황</h2>
                    <button class="btn btn-primary" id="addAirdropBtn">+ 에어드랍 추가</button>
                </div>

                <!-- 에어드랍 요약 -->
                <div class="airdrop-summary-grid">
                    <div class="summary-card">
                        <div class="summary-label">총 예상 가치</div>
                        <div class="summary-value" id="totalAirdropValue">0원</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">클레임 가능</div>
                        <div class="summary-value highlight" id="claimableCount">0개</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">확정됨</div>
                        <div class="summary-value" id="confirmedCount">0개</div>
                    </div>
                </div>

                <!-- 상태별 필터 -->
                <div class="filter-tabs" id="airdropFilterTabs">
                    <button class="filter-tab active" data-filter="all">전체</button>
                    ${AIRDROP_STATUS.map(s =>
                        `<button class="filter-tab" data-filter="${s.id}">${s.icon} ${s.name}</button>`
                    ).join('')}
                </div>

                <!-- 에어드랍 목록 -->
                <div class="airdrop-list-full" id="airdropListFull">
                    <div class="empty-state">등록된 에어드랍이 없습니다</div>
                </div>
            </div>

            <!-- 부채 뷰 -->
            <div id="debtsView" class="view-content" style="display: none;">
                <div class="section-header">
                    <h2>부채 관리</h2>
                    <button class="btn btn-primary" id="addDebtBtn">+ 부채 추가</button>
                </div>

                <!-- 부채 요약 -->
                <div class="debt-summary-grid">
                    <div class="summary-card danger">
                        <div class="summary-label">총 부채</div>
                        <div class="summary-value" id="totalDebtValue">0원</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">월 상환액</div>
                        <div class="summary-value" id="monthlyPaymentTotal">0원</div>
                    </div>
                    <div class="summary-card success">
                        <div class="summary-label">상환 완료</div>
                        <div class="summary-value" id="paidTotal">0원</div>
                    </div>
                </div>

                <!-- 부채 목록 -->
                <div class="debt-list-full" id="debtListFull">
                    <div class="empty-state">등록된 부채가 없습니다</div>
                </div>
            </div>
        </div>

        <!-- 자산 추가/수정 모달 -->
        <div id="assetModal" class="modal" style="display: none;">
            <div class="modal-content modal-lg">
                <div class="modal-header">
                    <h3 id="assetModalTitle">자산 추가</h3>
                    <button class="close-btn" id="closeAssetModalBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-row">
                        <div class="form-group">
                            <label>카테고리 *</label>
                            <select id="assetCategory" required>
                                ${ASSET_CATEGORY_INFO.map(cat =>
                                    `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>세부 유형</label>
                            <select id="assetSubType">
                                <option value="">선택 안함</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>자산명 *</label>
                            <input type="text" id="assetName" placeholder="예: 비트코인, 삼성전자, 신한은행 예금" required>
                        </div>
                        <div class="form-group">
                            <label>플랫폼/기관</label>
                            <input type="text" id="assetPlatform" placeholder="예: 업비트, 신한투자증권">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>현재 가치 (원) *</label>
                            <input type="number" id="assetCurrentValue" placeholder="0" required>
                        </div>
                        <div class="form-group">
                            <label>매입 금액 (원)</label>
                            <input type="number" id="assetPurchaseValue" placeholder="0">
                        </div>
                    </div>

                    <!-- 크립토 전용 필드 -->
                    <div id="cryptoFields" class="conditional-fields" style="display: none;">
                        <h4>크립토 정보</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>토큰명</label>
                                <input type="text" id="tokenName" placeholder="예: BTC, ETH">
                            </div>
                            <div class="form-group">
                                <label>수량</label>
                                <input type="number" id="tokenQuantity" step="0.00000001" placeholder="0">
                            </div>
                        </div>
                    </div>

                    <!-- 스테이킹 전용 필드 -->
                    <div id="stakingFields" class="conditional-fields" style="display: none;">
                        <h4>스테이킹 정보</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>스테이킹 상태</label>
                                <select id="stakingStatus">
                                    ${STAKING_STATUS.map(s =>
                                        `<option value="${s.id}">${s.icon} ${s.name}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>APY (%)</label>
                                <input type="number" id="stakingApy" step="0.01" placeholder="0">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>시작일</label>
                                <input type="date" id="stakingStartDate">
                            </div>
                            <div class="form-group">
                                <label>언락 예정일</label>
                                <input type="date" id="stakingUnlockDate">
                            </div>
                        </div>
                    </div>

                    <!-- 에어드랍 전용 필드 -->
                    <div id="airdropFields" class="conditional-fields" style="display: none;">
                        <h4>에어드랍 정보</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>에어드랍 상태</label>
                                <select id="airdropStatus">
                                    ${AIRDROP_STATUS.map(s =>
                                        `<option value="${s.id}">${s.icon} ${s.name}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>예상 가치 (원)</label>
                                <input type="number" id="airdropExpectedValue" placeholder="0">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>예상 에어드랍 날짜</label>
                            <input type="date" id="airdropExpectedDate">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>메모</label>
                        <textarea id="assetNotes" rows="2" placeholder="추가 메모"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelAssetBtn">취소</button>
                    <button class="btn btn-primary" id="saveAssetBtn">저장</button>
                </div>
            </div>
        </div>

        <!-- 부채 추가/수정 모달 -->
        <div id="debtModal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="debtModalTitle">부채 추가</h3>
                    <button class="close-btn" id="closeDebtModalBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-row">
                        <div class="form-group">
                            <label>부채명 *</label>
                            <input type="text" id="debtName" placeholder="예: 주택담보대출" required>
                        </div>
                        <div class="form-group">
                            <label>부채 유형</label>
                            <select id="debtType">
                                ${DEBT_TYPES.map(t =>
                                    `<option value="${t.id}">${t.icon} ${t.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>채권자</label>
                        <input type="text" id="debtCreditor" placeholder="예: 신한은행, 어머니">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>총 부채액 (원) *</label>
                            <input type="number" id="debtTotalAmount" placeholder="0" required>
                        </div>
                        <div class="form-group">
                            <label>남은 금액 (원) *</label>
                            <input type="number" id="debtRemainingAmount" placeholder="0" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>이자율 (%)</label>
                            <input type="number" id="debtInterestRate" step="0.01" placeholder="0">
                        </div>
                        <div class="form-group">
                            <label>월 상환액 (원)</label>
                            <input type="number" id="debtMonthlyPayment" placeholder="0">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>설명</label>
                        <textarea id="debtDescription" rows="2" placeholder="추가 설명"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelDebtBtn">취소</button>
                    <button class="btn btn-primary" id="saveDebtBtn">저장</button>
                </div>
            </div>
        </div>
    `;
}

export async function initAssetManagementTab() {
    await loadData();
    initEventListeners();
}

async function loadData() {
    try {
        const [assetsResult, debtsResult] = await Promise.all([
            getAssets(),
            getDebts()
        ]);

        if (assetsResult.success) {
            assets = assetsResult.data || [];
        }
        if (debtsResult.success) {
            debts = debtsResult.data || [];
        }

        updateCurrentView();
    } catch (error) {
        console.error('데이터 로드 에러:', error);
    }
}

function initEventListeners() {
    // 서브 탭 전환
    document.querySelectorAll('.sub-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentView = tab.dataset.view;
            updateCurrentView();
        });
    });

    // 자산 필터
    document.querySelectorAll('#assetFilterTabs .filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('#assetFilterTabs .filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderAssetList(tab.dataset.filter);
        });
    });

    // 에어드랍 필터
    document.querySelectorAll('#airdropFilterTabs .filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('#airdropFilterTabs .filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderAirdropList(tab.dataset.filter);
        });
    });

    // 자산 모달
    document.getElementById('addAssetBtn').addEventListener('click', () => openAssetModal());
    document.getElementById('addStakingBtn').addEventListener('click', () => openAssetModal('staking'));
    document.getElementById('addAirdropBtn').addEventListener('click', () => openAssetModal('airdrop'));
    document.getElementById('closeAssetModalBtn').addEventListener('click', closeAssetModal);
    document.getElementById('cancelAssetBtn').addEventListener('click', closeAssetModal);
    document.getElementById('saveAssetBtn').addEventListener('click', saveAsset);

    // 부채 모달
    document.getElementById('addDebtBtn').addEventListener('click', () => openDebtModal());
    document.getElementById('closeDebtModalBtn').addEventListener('click', closeDebtModal);
    document.getElementById('cancelDebtBtn').addEventListener('click', closeDebtModal);
    document.getElementById('saveDebtBtn').addEventListener('click', saveDebt);

    // 카테고리 변경 시 필드 표시/숨김
    document.getElementById('assetCategory').addEventListener('change', handleCategoryChange);
    document.getElementById('assetSubType').addEventListener('change', handleSubTypeChange);
}

function updateCurrentView() {
    // 모든 뷰 숨기기
    document.getElementById('assetsView').style.display = 'none';
    document.getElementById('stakingView').style.display = 'none';
    document.getElementById('airdropView').style.display = 'none';
    document.getElementById('debtsView').style.display = 'none';

    // 현재 뷰 표시
    switch (currentView) {
        case 'assets':
            document.getElementById('assetsView').style.display = '';
            renderAssetList('all');
            break;
        case 'staking':
            document.getElementById('stakingView').style.display = '';
            renderStakingList();
            break;
        case 'airdrop':
            document.getElementById('airdropView').style.display = '';
            renderAirdropList('all');
            break;
        case 'debts':
            document.getElementById('debtsView').style.display = '';
            renderDebtList();
            break;
    }
}

function renderAssetList(filter = 'all') {
    const list = document.getElementById('assetList');
    let filteredAssets = assets.filter(a => a.sub_type !== 'staking' && a.sub_type !== 'airdrop');

    if (filter !== 'all') {
        filteredAssets = filteredAssets.filter(a => a.category === filter);
    }

    if (filteredAssets.length === 0) {
        list.innerHTML = '<div class="empty-state">등록된 자산이 없습니다</div>';
        return;
    }

    // 카테고리별 그룹화
    const grouped = {};
    filteredAssets.forEach(asset => {
        if (!grouped[asset.category]) {
            grouped[asset.category] = [];
        }
        grouped[asset.category].push(asset);
    });

    let html = '';
    for (const [category, categoryAssets] of Object.entries(grouped)) {
        const catInfo = ASSET_CATEGORY_INFO.find(c => c.id === category) || { icon: '📦', name: category, color: '#888' };
        const totalValue = categoryAssets.reduce((sum, a) => sum + (a.current_value || 0), 0);

        html += `
            <div class="asset-category-section">
                <div class="category-header-bar" style="border-left-color: ${catInfo.color}">
                    <span>${catInfo.icon} ${catInfo.name}</span>
                    <span class="category-total">${formatAmount(totalValue)}</span>
                </div>
                <div class="asset-items">
                    ${categoryAssets.map(asset => createAssetItem(asset)).join('')}
                </div>
            </div>
        `;
    }

    list.innerHTML = html;
    attachAssetItemEvents();
}

function createAssetItem(asset) {
    const profit = (asset.current_value || 0) - (asset.purchase_value || 0);
    const profitPercent = asset.purchase_value > 0
        ? ((profit / asset.purchase_value) * 100).toFixed(2)
        : 0;
    const profitClass = profit >= 0 ? 'positive' : 'negative';

    return `
        <div class="asset-item" data-id="${asset.id}">
            <div class="asset-main-info">
                <div class="asset-name">${asset.name}</div>
                <div class="asset-platform">${asset.platform || ''} ${asset.token_name || ''}</div>
            </div>
            <div class="asset-value-info">
                <div class="asset-current-value">${formatAmount(asset.current_value)}</div>
                <div class="asset-profit ${profitClass}">
                    ${profit >= 0 ? '+' : ''}${formatAmount(profit)} (${profitPercent}%)
                </div>
            </div>
            <div class="asset-actions">
                <button class="btn-icon edit-asset-btn" data-id="${asset.id}" title="수정">✏️</button>
                <button class="btn-icon delete-asset-btn" data-id="${asset.id}" title="삭제">🗑️</button>
            </div>
        </div>
    `;
}

function renderStakingList() {
    const list = document.getElementById('stakingListFull');
    const stakingAssets = assets.filter(a => a.sub_type === 'staking');

    // 요약 계산
    const totalValue = stakingAssets.reduce((sum, a) => sum + (a.current_value || 0), 0);
    const today = new Date();
    const thisMonth = stakingAssets.filter(a => {
        if (!a.staking_unlock_date) return false;
        const unlockDate = new Date(a.staking_unlock_date);
        return unlockDate.getMonth() === today.getMonth() && unlockDate.getFullYear() === today.getFullYear();
    });
    const unlockingSoonValue = thisMonth.reduce((sum, a) => sum + (a.current_value || 0), 0);
    const avgApy = stakingAssets.length > 0
        ? (stakingAssets.reduce((sum, a) => sum + (a.staking_apy || 0), 0) / stakingAssets.length).toFixed(2)
        : 0;

    document.getElementById('totalStakingValue').textContent = formatAmount(totalValue);
    document.getElementById('unlockingSoon').textContent = formatAmount(unlockingSoonValue);
    document.getElementById('avgApy').textContent = `${avgApy}%`;

    if (stakingAssets.length === 0) {
        list.innerHTML = '<div class="empty-state">스테이킹 자산이 없습니다</div>';
        return;
    }

    // 언락일 기준 정렬
    stakingAssets.sort((a, b) => {
        if (!a.staking_unlock_date) return 1;
        if (!b.staking_unlock_date) return -1;
        return new Date(a.staking_unlock_date) - new Date(b.staking_unlock_date);
    });

    list.innerHTML = stakingAssets.map(asset => {
        const daysUntilUnlock = asset.staking_unlock_date
            ? Math.ceil((new Date(asset.staking_unlock_date) - today) / (1000 * 60 * 60 * 24))
            : null;
        const urgencyClass = daysUntilUnlock !== null && daysUntilUnlock <= 7 ? 'urgent' : '';
        const statusInfo = STAKING_STATUS.find(s => s.id === asset.staking_status) || { icon: '🔒', name: '활성' };

        return `
            <div class="staking-item-full ${urgencyClass}" data-id="${asset.id}">
                <div class="staking-status-badge">${statusInfo.icon}</div>
                <div class="staking-main-info">
                    <div class="staking-name">${asset.name}</div>
                    <div class="staking-platform">${asset.platform || ''} | ${asset.token_name || ''}</div>
                </div>
                <div class="staking-details">
                    <div class="staking-value">${formatAmount(asset.current_value)}</div>
                    <div class="staking-apy">${asset.staking_apy || 0}% APY</div>
                </div>
                <div class="staking-unlock">
                    ${daysUntilUnlock !== null
                        ? `<span class="days-badge ${urgencyClass}">D-${daysUntilUnlock}</span>`
                        : '<span class="days-badge">무기한</span>'}
                    <div class="unlock-date">${asset.staking_unlock_date || ''}</div>
                </div>
                <div class="asset-actions">
                    <button class="btn-icon edit-asset-btn" data-id="${asset.id}" title="수정">✏️</button>
                    <button class="btn-icon delete-asset-btn" data-id="${asset.id}" title="삭제">🗑️</button>
                </div>
            </div>
        `;
    }).join('');

    attachAssetItemEvents();
}

function renderAirdropList(filter = 'all') {
    const list = document.getElementById('airdropListFull');
    let airdropAssets = assets.filter(a => a.sub_type === 'airdrop');

    if (filter !== 'all') {
        airdropAssets = airdropAssets.filter(a => a.airdrop_status === filter);
    }

    // 요약 계산
    const allAirdrops = assets.filter(a => a.sub_type === 'airdrop');
    const totalValue = allAirdrops.reduce((sum, a) => sum + (a.airdrop_expected_value || 0), 0);
    const claimable = allAirdrops.filter(a => a.airdrop_status === 'claimable').length;
    const confirmed = allAirdrops.filter(a => a.airdrop_status === 'confirmed').length;

    document.getElementById('totalAirdropValue').textContent = formatAmount(totalValue);
    document.getElementById('claimableCount').textContent = `${claimable}개`;
    document.getElementById('confirmedCount').textContent = `${confirmed}개`;

    if (airdropAssets.length === 0) {
        list.innerHTML = '<div class="empty-state">등록된 에어드랍이 없습니다</div>';
        return;
    }

    list.innerHTML = airdropAssets.map(asset => {
        const statusInfo = AIRDROP_STATUS.find(s => s.id === asset.airdrop_status) || { icon: '⏳', name: '대기중', color: '#888' };

        return `
            <div class="airdrop-item-full" data-id="${asset.id}">
                <div class="airdrop-status-badge" style="background: ${statusInfo.color}">${statusInfo.icon}</div>
                <div class="airdrop-main-info">
                    <div class="airdrop-name">${asset.name}</div>
                    <div class="airdrop-status-text">${statusInfo.name}</div>
                </div>
                <div class="airdrop-expected">
                    <div class="expected-value">${asset.airdrop_expected_value ? formatAmount(asset.airdrop_expected_value) : '-'}</div>
                    <div class="expected-date">${asset.airdrop_expected_date || '미정'}</div>
                </div>
                <div class="asset-actions">
                    <button class="btn-icon edit-asset-btn" data-id="${asset.id}" title="수정">✏️</button>
                    <button class="btn-icon delete-asset-btn" data-id="${asset.id}" title="삭제">🗑️</button>
                </div>
            </div>
        `;
    }).join('');

    attachAssetItemEvents();
}

function renderDebtList() {
    const list = document.getElementById('debtListFull');

    // 요약 계산
    const totalDebt = debts.reduce((sum, d) => sum + (d.remaining_amount || 0), 0);
    const monthlyTotal = debts.reduce((sum, d) => sum + (d.monthly_payment || 0), 0);
    const paidTotal = debts.reduce((sum, d) => sum + (d.paid_amount || 0), 0);

    document.getElementById('totalDebtValue').textContent = formatAmount(totalDebt);
    document.getElementById('monthlyPaymentTotal').textContent = formatAmount(monthlyTotal);
    document.getElementById('paidTotal').textContent = formatAmount(paidTotal);

    if (debts.length === 0) {
        list.innerHTML = '<div class="empty-state">등록된 부채가 없습니다</div>';
        return;
    }

    list.innerHTML = debts.map(debt => {
        const percent = debt.total_amount > 0
            ? ((debt.paid_amount / debt.total_amount) * 100).toFixed(1)
            : 0;
        const typeInfo = DEBT_TYPES.find(t => t.id === debt.debt_type) || { icon: '💳', name: '기타' };

        return `
            <div class="debt-item-full" data-id="${debt.id}">
                <div class="debt-type-badge">${typeInfo.icon}</div>
                <div class="debt-main-info">
                    <div class="debt-name">${debt.name}</div>
                    <div class="debt-creditor">${debt.creditor || ''} | ${debt.interest_rate || 0}%</div>
                </div>
                <div class="debt-amounts">
                    <div class="debt-remaining">${formatAmount(debt.remaining_amount)}</div>
                    <div class="debt-monthly">월 ${formatAmount(debt.monthly_payment)}</div>
                </div>
                <div class="debt-progress-section">
                    <div class="debt-progress-bar-full">
                        <div class="debt-progress-fill-full" style="width: ${percent}%"></div>
                    </div>
                    <div class="debt-progress-text">${percent}% 상환</div>
                </div>
                <div class="asset-actions">
                    <button class="btn-icon edit-debt-btn" data-id="${debt.id}" title="수정">✏️</button>
                    <button class="btn-icon delete-debt-btn" data-id="${debt.id}" title="삭제">🗑️</button>
                </div>
            </div>
        `;
    }).join('');

    attachDebtItemEvents();
}

function attachAssetItemEvents() {
    document.querySelectorAll('.edit-asset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const assetId = e.target.dataset.id;
            const asset = assets.find(a => a.id === assetId);
            if (asset) openAssetModal(null, asset);
        });
    });

    document.querySelectorAll('.delete-asset-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const assetId = e.target.dataset.id;
            if (confirm('정말 삭제하시겠습니까?')) {
                const result = await deleteAsset(assetId);
                if (result.success) {
                    await loadData();
                } else {
                    alert('삭제 실패: ' + result.error);
                }
            }
        });
    });
}

function attachDebtItemEvents() {
    document.querySelectorAll('.edit-debt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const debtId = e.target.dataset.id;
            const debt = debts.find(d => d.id === debtId);
            if (debt) openDebtModal(debt);
        });
    });

    document.querySelectorAll('.delete-debt-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const debtId = e.target.dataset.id;
            if (confirm('정말 삭제하시겠습니까?')) {
                const result = await deleteDebt(debtId);
                if (result.success) {
                    await loadData();
                } else {
                    alert('삭제 실패: ' + result.error);
                }
            }
        });
    });
}

function handleCategoryChange() {
    const category = document.getElementById('assetCategory').value;
    const subTypeSelect = document.getElementById('assetSubType');

    // 세부 유형 옵션 업데이트
    if (category === 'crypto') {
        subTypeSelect.innerHTML = `
            <option value="">선택 안함</option>
            ${CRYPTO_TYPE_INFO.map(t => `<option value="${t.id}">${t.icon} ${t.name}</option>`).join('')}
        `;
        document.getElementById('cryptoFields').style.display = '';
    } else {
        subTypeSelect.innerHTML = '<option value="">선택 안함</option>';
        document.getElementById('cryptoFields').style.display = 'none';
    }

    document.getElementById('stakingFields').style.display = 'none';
    document.getElementById('airdropFields').style.display = 'none';
}

function handleSubTypeChange() {
    const subType = document.getElementById('assetSubType').value;

    document.getElementById('stakingFields').style.display = subType === 'staking' ? '' : 'none';
    document.getElementById('airdropFields').style.display = subType === 'airdrop' ? '' : 'none';
}

function openAssetModal(defaultSubType = null, asset = null) {
    editingAsset = asset;
    document.getElementById('assetModal').style.display = 'flex';
    document.getElementById('assetModalTitle').textContent = asset ? '자산 수정' : '자산 추가';

    // 폼 초기화
    if (asset) {
        document.getElementById('assetCategory').value = asset.category || 'cash';
        handleCategoryChange();
        document.getElementById('assetSubType').value = asset.sub_type || '';
        handleSubTypeChange();
        document.getElementById('assetName').value = asset.name || '';
        document.getElementById('assetPlatform').value = asset.platform || '';
        document.getElementById('assetCurrentValue').value = asset.current_value || 0;
        document.getElementById('assetPurchaseValue').value = asset.purchase_value || 0;
        document.getElementById('tokenName').value = asset.token_name || '';
        document.getElementById('tokenQuantity').value = asset.quantity || '';
        document.getElementById('stakingStatus').value = asset.staking_status || 'active';
        document.getElementById('stakingApy').value = asset.staking_apy || '';
        document.getElementById('stakingStartDate').value = asset.staking_start_date || '';
        document.getElementById('stakingUnlockDate').value = asset.staking_unlock_date || '';
        document.getElementById('airdropStatus').value = asset.airdrop_status || 'pending';
        document.getElementById('airdropExpectedValue').value = asset.airdrop_expected_value || '';
        document.getElementById('airdropExpectedDate').value = asset.airdrop_expected_date || '';
        document.getElementById('assetNotes').value = asset.notes || '';
    } else {
        document.getElementById('assetCategory').value = defaultSubType === 'staking' || defaultSubType === 'airdrop' ? 'crypto' : 'cash';
        handleCategoryChange();
        if (defaultSubType) {
            document.getElementById('assetSubType').value = defaultSubType;
            handleSubTypeChange();
        }
        document.getElementById('assetName').value = '';
        document.getElementById('assetPlatform').value = '';
        document.getElementById('assetCurrentValue').value = '';
        document.getElementById('assetPurchaseValue').value = '';
        document.getElementById('tokenName').value = '';
        document.getElementById('tokenQuantity').value = '';
        document.getElementById('stakingStatus').value = 'active';
        document.getElementById('stakingApy').value = '';
        document.getElementById('stakingStartDate').value = '';
        document.getElementById('stakingUnlockDate').value = '';
        document.getElementById('airdropStatus').value = 'pending';
        document.getElementById('airdropExpectedValue').value = '';
        document.getElementById('airdropExpectedDate').value = '';
        document.getElementById('assetNotes').value = '';
    }
}

function closeAssetModal() {
    document.getElementById('assetModal').style.display = 'none';
    editingAsset = null;
}

async function saveAsset() {
    const category = document.getElementById('assetCategory').value;
    const subType = document.getElementById('assetSubType').value;
    const name = document.getElementById('assetName').value.trim();
    const platform = document.getElementById('assetPlatform').value.trim();
    const currentValue = parseInt(document.getElementById('assetCurrentValue').value) || 0;
    const purchaseValue = parseInt(document.getElementById('assetPurchaseValue').value) || 0;

    if (!name) {
        alert('자산명을 입력해주세요.');
        return;
    }

    const assetData = {
        category,
        sub_type: subType || null,
        name,
        platform: platform || null,
        current_value: currentValue,
        purchase_value: purchaseValue,
        notes: document.getElementById('assetNotes').value.trim() || null
    };

    // 크립토 필드
    if (category === 'crypto') {
        assetData.token_name = document.getElementById('tokenName').value.trim() || null;
        assetData.quantity = parseFloat(document.getElementById('tokenQuantity').value) || null;
    }

    // 스테이킹 필드
    if (subType === 'staking') {
        assetData.staking_status = document.getElementById('stakingStatus').value;
        assetData.staking_apy = parseFloat(document.getElementById('stakingApy').value) || null;
        assetData.staking_start_date = document.getElementById('stakingStartDate').value || null;
        assetData.staking_unlock_date = document.getElementById('stakingUnlockDate').value || null;
    }

    // 에어드랍 필드
    if (subType === 'airdrop') {
        assetData.airdrop_status = document.getElementById('airdropStatus').value;
        assetData.airdrop_expected_value = parseInt(document.getElementById('airdropExpectedValue').value) || null;
        assetData.airdrop_expected_date = document.getElementById('airdropExpectedDate').value || null;
    }

    let result;
    if (editingAsset) {
        result = await updateAsset(editingAsset.id, assetData);
    } else {
        result = await createAsset(assetData);
    }

    if (result.success) {
        closeAssetModal();
        await loadData();
    } else {
        alert('저장 실패: ' + result.error);
    }
}

function openDebtModal(debt = null) {
    editingDebt = debt;
    document.getElementById('debtModal').style.display = 'flex';
    document.getElementById('debtModalTitle').textContent = debt ? '부채 수정' : '부채 추가';

    if (debt) {
        document.getElementById('debtName').value = debt.name || '';
        document.getElementById('debtType').value = debt.debt_type || 'bank_loan';
        document.getElementById('debtCreditor').value = debt.creditor || '';
        document.getElementById('debtTotalAmount').value = debt.total_amount || 0;
        document.getElementById('debtRemainingAmount').value = debt.remaining_amount || 0;
        document.getElementById('debtInterestRate').value = debt.interest_rate || '';
        document.getElementById('debtMonthlyPayment').value = debt.monthly_payment || '';
        document.getElementById('debtDescription').value = debt.description || '';
    } else {
        document.getElementById('debtName').value = '';
        document.getElementById('debtType').value = 'bank_loan';
        document.getElementById('debtCreditor').value = '';
        document.getElementById('debtTotalAmount').value = '';
        document.getElementById('debtRemainingAmount').value = '';
        document.getElementById('debtInterestRate').value = '';
        document.getElementById('debtMonthlyPayment').value = '';
        document.getElementById('debtDescription').value = '';
    }
}

function closeDebtModal() {
    document.getElementById('debtModal').style.display = 'none';
    editingDebt = null;
}

async function saveDebt() {
    const name = document.getElementById('debtName').value.trim();
    const totalAmount = parseInt(document.getElementById('debtTotalAmount').value) || 0;
    const remainingAmount = parseInt(document.getElementById('debtRemainingAmount').value) || 0;

    if (!name) {
        alert('부채명을 입력해주세요.');
        return;
    }
    if (totalAmount <= 0) {
        alert('총 부채액을 입력해주세요.');
        return;
    }

    const debtData = {
        name,
        debt_type: document.getElementById('debtType').value,
        creditor: document.getElementById('debtCreditor').value.trim() || null,
        total_amount: totalAmount,
        remaining_amount: remainingAmount,
        paid_amount: totalAmount - remainingAmount,
        interest_rate: parseFloat(document.getElementById('debtInterestRate').value) || null,
        monthly_payment: parseInt(document.getElementById('debtMonthlyPayment').value) || null,
        description: document.getElementById('debtDescription').value.trim() || null
    };

    let result;
    if (editingDebt) {
        result = await updateDebt(editingDebt.id, debtData);
    } else {
        result = await createDebt(debtData);
    }

    if (result.success) {
        closeDebtModal();
        await loadData();
    } else {
        alert('저장 실패: ' + result.error);
    }
}
