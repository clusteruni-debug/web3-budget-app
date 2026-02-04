// V2: 통합 자산 관리 탭
import { getAssets, createAsset, updateAsset, deleteAsset, getDebts, createDebt, updateDebt, deleteDebt, getAssetDisposals, disposeAsset, deleteAssetDisposal, calculateIcoProfit } from '../services/database.js';
import { formatAmount, getToday, createEmptyState, EMPTY_STATES, showToast, calculateLoanMonthlyPayment, calculateInvestmentReturn } from '../utils/helpers.js';
import { ASSET_CATEGORY_INFO, CRYPTO_TYPE_INFO, CASH_TYPE_INFO, STAKING_STATUS_INFO, AIRDROP_STATUS_INFO, DEBT_TYPE_INFO } from '../utils/constants.js';

// 상수 별칭
const STAKING_STATUS = STAKING_STATUS_INFO;
const AIRDROP_STATUS = AIRDROP_STATUS_INFO;
const DEBT_TYPES = DEBT_TYPE_INFO;

// 정리 유형 정보
const DISPOSAL_TYPES = [
    { id: 'cash_out', icon: '💵', name: '현금화', description: '은행/거래소 출금' },
    { id: 'convert', icon: '🔄', name: '자산 전환', description: '다른 자산으로 전환' },
    { id: 'loss', icon: '📉', name: '손실 처리', description: '손절/폐기' },
    { id: 'other', icon: '📦', name: '기타', description: '기타 사유' }
];

const DESTINATION_TYPES = [
    { id: 'bank', icon: '🏦', name: '은행' },
    { id: 'exchange', icon: '💱', name: '거래소 원화' },
    { id: 'asset', icon: '💎', name: '다른 자산' }
];

let assets = [];
let debts = [];
let disposals = [];
let currentView = 'assets'; // 'assets' | 'staking' | 'airdrop' | 'debts'
let editingAsset = null;
let editingDebt = null;
let disposingAsset = null;

// 업데이트 상태 계산 함수
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

                <!-- ICO/런치패드 투자 요약 -->
                <div class="ico-summary-section" id="icoSummarySection" style="display: none;">
                    <div class="section-header-collapsible" data-toggle="icoSummary">
                        <h3>💎 ICO/런치패드 투자</h3>
                        <span class="toggle-arrow">▼</span>
                    </div>
                    <div class="ico-summary-content" id="icoSummaryContent">
                        <div class="ico-summary-grid">
                            <div class="summary-card">
                                <div class="summary-label">총 투자금</div>
                                <div class="summary-value" id="icoTotalInvested">0원</div>
                            </div>
                            <div class="summary-card">
                                <div class="summary-label">현재 평가액</div>
                                <div class="summary-value" id="icoCurrentValue">0원</div>
                            </div>
                            <div class="summary-card">
                                <div class="summary-label">손익</div>
                                <div class="summary-value" id="icoTotalProfit">0원</div>
                            </div>
                            <div class="summary-card">
                                <div class="summary-label">수익률</div>
                                <div class="summary-value" id="icoProfitRate">0%</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 정리 이력 섹션 -->
                <div class="disposal-history-section">
                    <div class="section-header-collapsible" data-toggle="disposalHistory">
                        <h3>📜 정리 이력</h3>
                        <span class="toggle-arrow">▼</span>
                    </div>
                    <div class="disposal-list" id="disposalList">
                        <div class="empty-state">정리 이력이 없습니다</div>
                    </div>
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
                    <div class="summary-card success">
                        <div class="summary-label">총 에어드랍 수익</div>
                        <div class="summary-value" id="totalAirdropValue">0원</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">대기 중</div>
                        <div class="summary-value" id="pendingCount">0개</div>
                    </div>
                    <div class="summary-card highlight">
                        <div class="summary-label">클레임 가능</div>
                        <div class="summary-value" id="claimableCount">0개</div>
                    </div>
                </div>

                <!-- 상태별 필터 + 정렬 -->
                <div class="filter-row">
                    <div class="filter-tabs" id="airdropFilterTabs">
                        <button class="filter-tab active" data-filter="all">전체</button>
                        ${AIRDROP_STATUS.map(s =>
                            `<button class="filter-tab" data-filter="${s.id}">${s.icon} ${s.name}</button>`
                        ).join('')}
                    </div>
                    <select class="sort-select" id="airdropSort">
                        <option value="date-desc">최신순</option>
                        <option value="date-asc">오래된순</option>
                        <option value="value-desc">금액 높은순</option>
                        <option value="value-asc">금액 낮은순</option>
                    </select>
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
                            <label>분류 *</label>
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

        <!-- 자산 정리 모달 -->
        <div id="disposeModal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>자산 정리</h3>
                    <button class="close-btn" id="closeDisposeModalBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <!-- 자산 정보 표시 -->
                    <div class="dispose-asset-info" id="disposeAssetInfo">
                        <div class="dispose-asset-name"></div>
                        <div class="dispose-asset-value"></div>
                    </div>

                    <!-- 정리 유형 선택 -->
                    <div class="form-group">
                        <label>정리 유형 *</label>
                        <select id="disposeType">
                            ${DISPOSAL_TYPES.map(t =>
                                `<option value="${t.id}">${t.icon} ${t.name} - ${t.description}</option>`
                            ).join('')}
                        </select>
                    </div>

                    <!-- 목적지 (조건부) -->
                    <div id="destinationFields">
                        <div class="form-group">
                            <label>목적지 유형</label>
                            <select id="destinationType">
                                ${DESTINATION_TYPES.map(t =>
                                    `<option value="${t.id}">${t.icon} ${t.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>목적지 이름</label>
                            <input type="text" id="destinationName" placeholder="예: 신한은행, 업비트, 이더리움">
                        </div>
                    </div>

                    <!-- 금액 -->
                    <div class="form-group">
                        <label>정리 금액 (원) *</label>
                        <input type="number" id="disposeAmount" placeholder="0">
                    </div>

                    <!-- 날짜 -->
                    <div class="form-group">
                        <label>정리 날짜</label>
                        <input type="date" id="disposeDate">
                    </div>

                    <!-- 메모 -->
                    <div class="form-group">
                        <label>메모</label>
                        <textarea id="disposeNotes" rows="2" placeholder="정리 사유나 메모"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelDisposeBtn">취소</button>
                    <button class="btn btn-primary" id="saveDisposeBtn">정리 완료</button>
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
                            <label>상환 기간 (개월)</label>
                            <input type="number" id="debtTermMonths" placeholder="예: 360">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>월 상환액 (원)</label>
                            <div class="input-with-button">
                                <input type="number" id="debtMonthlyPayment" placeholder="0">
                                <button type="button" class="btn btn-sm btn-secondary" id="calcMonthlyPaymentBtn" title="자동 계산">🔢 계산</button>
                            </div>
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

        <!-- 에어드랍 빠른 추가 모달 -->
        <div id="quickAirdropModal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="quickAirdropModalTitle">🎯 에어드랍 빠른 추가</h3>
                    <button class="close-btn" id="closeQuickAirdropBtn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>프로젝트명 *</label>
                        <input type="text" id="quickAirdropName" placeholder="예: Arbitrum, Starknet" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>상태</label>
                            <select id="quickAirdropStatus">
                                ${AIRDROP_STATUS.map(s =>
                                    `<option value="${s.id}">${s.icon} ${s.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>예상 가치 (원)</label>
                            <input type="number" id="quickAirdropValue" placeholder="0">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>예상 에어드랍 날짜</label>
                        <input type="date" id="quickAirdropDate">
                    </div>
                    <div class="form-group">
                        <label>메모 (선택)</label>
                        <input type="text" id="quickAirdropNotes" placeholder="참여 조건, 작업 내용 등">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelQuickAirdropBtn">취소</button>
                    <button class="btn btn-primary" id="saveQuickAirdropBtn">저장</button>
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
        const [assetsResult, debtsResult, disposalsResult] = await Promise.all([
            getAssets(),
            getDebts(),
            getAssetDisposals()
        ]);

        if (assetsResult.success) {
            assets = assetsResult.data || [];
        }
        if (debtsResult.success) {
            debts = debtsResult.data || [];
        }
        if (disposalsResult.success) {
            disposals = disposalsResult.data || [];
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
            const sortValue = document.getElementById('airdropSort')?.value || 'date-desc';
            renderAirdropList(tab.dataset.filter, sortValue);
        });
    });

    // 에어드랍 정렬
    const airdropSort = document.getElementById('airdropSort');
    if (airdropSort) {
        airdropSort.addEventListener('change', () => {
            const activeFilter = document.querySelector('#airdropFilterTabs .filter-tab.active')?.dataset.filter || 'all';
            renderAirdropList(activeFilter, airdropSort.value);
        });
    }

    // 자산 모달
    document.getElementById('addAssetBtn').addEventListener('click', () => openAssetModal());
    document.getElementById('addStakingBtn').addEventListener('click', () => openAssetModal('staking'));
    document.getElementById('addAirdropBtn').addEventListener('click', () => openQuickAirdropModal());
    document.getElementById('closeAssetModalBtn').addEventListener('click', closeAssetModal);
    document.getElementById('cancelAssetBtn').addEventListener('click', closeAssetModal);
    document.getElementById('saveAssetBtn').addEventListener('click', saveAsset);

    // 에어드랍 빠른 추가 모달
    document.getElementById('closeQuickAirdropBtn').addEventListener('click', closeQuickAirdropModal);
    document.getElementById('cancelQuickAirdropBtn').addEventListener('click', closeQuickAirdropModal);
    document.getElementById('saveQuickAirdropBtn').addEventListener('click', saveQuickAirdrop);

    // 부채 모달
    document.getElementById('addDebtBtn').addEventListener('click', () => openDebtModal());
    document.getElementById('closeDebtModalBtn').addEventListener('click', closeDebtModal);
    document.getElementById('cancelDebtBtn').addEventListener('click', closeDebtModal);
    document.getElementById('saveDebtBtn').addEventListener('click', saveDebt);

    // 월상환액 자동 계산 버튼
    document.getElementById('calcMonthlyPaymentBtn').addEventListener('click', () => {
        const principal = parseInt(document.getElementById('debtTotalAmount').value) || 0;
        const rate = parseFloat(document.getElementById('debtInterestRate').value) || 0;
        const termMonths = parseInt(document.getElementById('debtTermMonths').value) || 0;

        if (!principal) {
            showToast('총 부채액을 입력해주세요.', 'warning');
            return;
        }
        if (!termMonths) {
            showToast('상환 기간(개월)을 입력해주세요.', 'warning');
            return;
        }

        const monthlyPayment = calculateLoanMonthlyPayment(principal, rate, termMonths);
        document.getElementById('debtMonthlyPayment').value = monthlyPayment;
        showToast(`월상환액: ${formatAmount(monthlyPayment)}`, 'success');
    });

    // 정리 모달
    document.getElementById('closeDisposeModalBtn').addEventListener('click', closeDisposeModal);
    document.getElementById('cancelDisposeBtn').addEventListener('click', closeDisposeModal);
    document.getElementById('saveDisposeBtn').addEventListener('click', saveDisposal);
    document.getElementById('disposeType').addEventListener('change', handleDisposeTypeChange);

    // 정리 이력 섹션 토글
    const disposalToggle = document.querySelector('[data-toggle="disposalHistory"]');
    if (disposalToggle) {
        disposalToggle.addEventListener('click', () => {
            const list = document.getElementById('disposalList');
            const arrow = disposalToggle.querySelector('.toggle-arrow');
            if (list) {
                list.classList.toggle('collapsed');
                if (arrow) {
                    arrow.textContent = list.classList.contains('collapsed') ? '▶' : '▼';
                }
            }
        });
    }

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
            renderDisposalList();
            updateIcoSummary();
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
    // 에어드랍만 제외 (투자 자산 + 스테이킹만 표시)
    let filteredAssets = assets.filter(a => a.sub_type !== 'airdrop');

    if (filter !== 'all') {
        filteredAssets = filteredAssets.filter(a => a.category === filter);
    }

    if (filteredAssets.length === 0) {
        list.innerHTML = createEmptyState({
            ...EMPTY_STATES.assets,
            actionId: 'emptyAddAsset'
        });
        document.getElementById('emptyAddAsset')?.addEventListener('click', () => {
            document.getElementById('addAssetBtn')?.click();
        });
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

    let html = `
        <div class="asset-list-controls">
            <button class="btn-expand-all" id="expandAllCategories">📂 모두 펼치기</button>
            <button class="btn-collapse-all" id="collapseAllCategories">📁 모두 접기</button>
        </div>
    `;

    for (const [category, categoryAssets] of Object.entries(grouped)) {
        const catInfo = ASSET_CATEGORY_INFO.find(c => c.id === category) || { icon: '📦', name: category, color: '#888' };
        const totalValue = categoryAssets.reduce((sum, a) => sum + (a.current_value || 0), 0);
        const totalPurchase = categoryAssets.reduce((sum, a) => sum + (a.purchase_value || 0), 0);
        const assetCount = categoryAssets.length;

        // 카테고리 전체 수익률
        const catProfit = totalValue - totalPurchase;
        const catProfitPercent = totalPurchase > 0 ? ((catProfit / totalPurchase) * 100).toFixed(1) : 0;
        const catIsPositive = catProfit >= 0;

        // 카테고리에서 가장 오래된 업데이트 상태
        const oldestAsset = categoryAssets.reduce((oldest, a) => {
            if (!a.updated_at) return oldest || a;
            if (!oldest || !oldest.updated_at) return oldest;
            return new Date(a.updated_at) < new Date(oldest.updated_at) ? a : oldest;
        }, null);
        const catUpdateStatus = oldestAsset ? getUpdateStatus(oldestAsset.updated_at) : null;

        html += `
            <div class="asset-category-section" data-category="${category}">
                <div class="category-header-bar collapsible" style="border-left-color: ${catInfo.color}" data-toggle-category="${category}">
                    <div class="category-header-left">
                        <span class="toggle-icon">▶</span>
                        <span>${catInfo.icon} ${catInfo.name}</span>
                        <span class="category-count">(${assetCount})</span>
                        ${catUpdateStatus && catUpdateStatus.isStale ? `<span class="cat-update-icon" title="업데이트 필요한 자산 있음">${catUpdateStatus.icon}</span>` : ''}
                    </div>
                    <div class="category-header-right">
                        <span class="category-change ${catIsPositive ? 'up' : 'down'}">${catIsPositive ? '▲' : '▼'} ${Math.abs(catProfitPercent)}%</span>
                        <span class="category-total">${formatAmount(totalValue)}</span>
                    </div>
                </div>
                <div class="asset-items collapsed" id="assetItems-${category}">
                    ${categoryAssets.map(asset => createAssetItem(asset)).join('')}
                </div>
            </div>
        `;
    }

    list.innerHTML = html;
    attachAssetItemEvents();
    attachCategoryToggleEvents();
}

async function updateIcoSummary() {
    const section = document.getElementById('icoSummarySection');
    if (!section) return;

    const result = await calculateIcoProfit();
    if (!result.success || result.data.projectCount === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = '';
    const data = result.data;

    document.getElementById('icoTotalInvested').textContent = formatAmount(data.totalInvested);
    document.getElementById('icoCurrentValue').textContent = formatAmount(data.currentValue);

    const profitEl = document.getElementById('icoTotalProfit');
    profitEl.textContent = `${data.totalProfit >= 0 ? '+' : ''}${formatAmount(data.totalProfit)}`;
    profitEl.className = `summary-value ${data.totalProfit >= 0 ? 'positive' : 'negative'}`;

    const rateEl = document.getElementById('icoProfitRate');
    rateEl.textContent = `${data.profitPercent >= 0 ? '+' : ''}${data.profitPercent}%`;
    rateEl.className = `summary-value ${data.profitPercent >= 0 ? 'positive' : 'negative'}`;
}

function createAssetItem(asset) {
    const profit = (asset.current_value || 0) - (asset.purchase_value || 0);
    const profitPercent = asset.purchase_value > 0
        ? ((profit / asset.purchase_value) * 100).toFixed(1)
        : 0;
    const isPositive = profit >= 0;
    const profitClass = isPositive ? 'positive' : 'negative';

    // 카테고리 색상 매핑
    const categoryColors = {
        cash: '#3b82f6',
        stock: '#22c55e',
        crypto: '#f59e0b',
        real_estate: '#8b5cf6',
        other: '#6b7280'
    };
    const accentColor = categoryColors[asset.category] || '#6b7280';

    // 부동산인 경우 추가 정보
    const isRealEstate = asset.category === 'real_estate';
    const realEstateNote = isRealEstate && asset.notes ? `<div class="asset-note">${asset.notes}</div>` : '';

    // 업데이트 상태
    const updateInfo = getUpdateStatus(asset.updated_at);

    return `
        <div class="asset-item enhanced" data-id="${asset.id}" style="--accent-color: ${accentColor}">
            <div class="asset-card-header">
                <div class="asset-main-info">
                    <div class="asset-name">${asset.name}</div>
                    <div class="asset-platform">
                        ${asset.platform || ''} ${asset.token_name || ''}
                        <span class="update-status ${updateInfo.class}" title="${updateInfo.fullDate}">
                            ${updateInfo.icon} ${updateInfo.text}
                        </span>
                    </div>
                </div>
                <div class="profit-badge ${profitClass}">
                    <span class="profit-icon">${isPositive ? '▲' : '▼'}</span>
                    <span class="profit-percent">${isPositive ? '+' : ''}${profitPercent}%</span>
                </div>
            </div>
            <div class="asset-card-body">
                <div class="asset-value-row">
                    <div class="value-item">
                        <span class="value-label">현재가치</span>
                        <span class="value-amount current">${formatAmount(asset.current_value)}</span>
                    </div>
                    <div class="value-item">
                        <span class="value-label">매입가</span>
                        <span class="value-amount purchase">${formatAmount(asset.purchase_value)}</span>
                    </div>
                    <div class="value-item">
                        <span class="value-label">손익</span>
                        <span class="value-amount ${profitClass}">${isPositive ? '+' : ''}${formatAmount(profit)}</span>
                    </div>
                </div>
                ${realEstateNote}
            </div>
            <div class="asset-card-footer">
                <button class="btn-action edit-asset-btn" data-id="${asset.id}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    수정
                </button>
                <button class="btn-action dispose dispose-asset-btn" data-id="${asset.id}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    정리
                </button>
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
        list.innerHTML = createEmptyState(EMPTY_STATES.staking);
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
                    <button class="btn-icon edit-asset-btn" data-id="${asset.id}" title="수정"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    <button class="btn-icon dispose-asset-btn" data-id="${asset.id}" title="정리"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></button>
                </div>
            </div>
        `;
    }).join('');

    attachAssetItemEvents();
}

function renderAirdropList(filter = 'all', sort = 'date-desc') {
    const list = document.getElementById('airdropListFull');
    let airdropAssets = assets.filter(a => a.sub_type === 'airdrop');

    if (filter !== 'all') {
        airdropAssets = airdropAssets.filter(a => a.airdrop_status === filter);
    }

    // 정렬
    airdropAssets.sort((a, b) => {
        const aValue = a.airdrop_status === 'claimed' ? (a.purchase_value || 0) : (a.airdrop_expected_value || 0);
        const bValue = b.airdrop_status === 'claimed' ? (b.purchase_value || 0) : (b.airdrop_expected_value || 0);
        const aDate = a.airdrop_expected_date || a.created_at || '';
        const bDate = b.airdrop_expected_date || b.created_at || '';

        switch (sort) {
            case 'date-desc':
                return bDate.localeCompare(aDate);
            case 'date-asc':
                return aDate.localeCompare(bDate);
            case 'value-desc':
                return bValue - aValue;
            case 'value-asc':
                return aValue - bValue;
            default:
                return bDate.localeCompare(aDate);
        }
    });

    // 요약 계산
    const allAirdrops = assets.filter(a => a.sub_type === 'airdrop');
    // claimed는 purchase_value, 나머지는 expected_value
    const totalValue = allAirdrops.reduce((sum, a) => {
        if (a.airdrop_status === 'claimed') {
            return sum + (a.purchase_value || 0);
        }
        return sum + (a.airdrop_expected_value || 0);
    }, 0);
    const claimable = allAirdrops.filter(a => a.airdrop_status === 'claimable').length;
    const confirmed = allAirdrops.filter(a => a.airdrop_status === 'confirmed').length;

    document.getElementById('totalAirdropValue').textContent = formatAmount(totalValue);
    document.getElementById('pendingCount').textContent = `${allAirdrops.filter(a => a.airdrop_status === 'pending' || a.airdrop_status === 'confirmed').length}개`;
    document.getElementById('claimableCount').textContent = `${claimable}개`;

    if (airdropAssets.length === 0) {
        list.innerHTML = createEmptyState(EMPTY_STATES.airdrops);
        return;
    }

    list.innerHTML = airdropAssets.map(asset => {
        const statusInfo = AIRDROP_STATUS.find(s => s.id === asset.airdrop_status) || { icon: '⏳', name: '대기중', color: '#888' };
        // claimed 상태면 purchase_value(청산 금액) 표시, 아니면 expected_value
        const displayValue = asset.airdrop_status === 'claimed'
            ? asset.purchase_value
            : asset.airdrop_expected_value;

        return `
            <div class="airdrop-item-full" data-id="${asset.id}">
                <div class="airdrop-status-badge" style="background: ${statusInfo.color}">${statusInfo.icon}</div>
                <div class="airdrop-main-info">
                    <div class="airdrop-name">${asset.name}</div>
                    <div class="airdrop-status-text">${statusInfo.name}</div>
                </div>
                <div class="airdrop-expected">
                    <div class="expected-value">${displayValue ? formatAmount(displayValue) : '-'}</div>
                    <div class="expected-date">${asset.airdrop_expected_date || '미정'}</div>
                </div>
                <div class="asset-actions">
                    <button class="btn-icon edit-asset-btn" data-id="${asset.id}" title="수정"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    <button class="btn-icon dispose-asset-btn" data-id="${asset.id}" title="정리"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></button>
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
        list.innerHTML = createEmptyState(EMPTY_STATES.debts);
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
                    <button class="btn-icon edit-debt-btn" data-id="${debt.id}" title="수정"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    <button class="btn-icon delete-debt-btn" data-id="${debt.id}" title="삭제"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
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
            const assetId = btn.closest('[data-id]')?.dataset.id || btn.dataset.id;
            const asset = assets.find(a => a.id === assetId);
            if (asset) openAssetModal(null, asset);
        });
    });

    document.querySelectorAll('.dispose-asset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const assetId = btn.closest('[data-id]')?.dataset.id || btn.dataset.id;
            const asset = assets.find(a => a.id === assetId);
            if (asset) openDisposeModal(asset);
        });
    });

    // 스테이킹/에어드랍 뷰에서 사용하는 기존 삭제 버튼
    document.querySelectorAll('.delete-asset-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const assetId = btn.closest('[data-id]')?.dataset.id || btn.dataset.id;
            if (confirm('정말 삭제하시겠습니까?')) {
                const result = await deleteAsset(assetId);
                if (result.success) {
                    await loadData();
                } else {
                    showToast('삭제에 실패했습니다', 'error');
                }
            }
        });
    });
}

// 카테고리별 접기/펼치기 이벤트
function attachCategoryToggleEvents() {
    // 각 카테고리 헤더 클릭 시 토글
    document.querySelectorAll('.category-header-bar.collapsible').forEach(header => {
        header.addEventListener('click', () => {
            const category = header.dataset.toggleCategory;
            const itemsContainer = document.getElementById(`assetItems-${category}`);
            const toggleIcon = header.querySelector('.toggle-icon');

            if (itemsContainer) {
                itemsContainer.classList.toggle('collapsed');
                header.classList.toggle('collapsed');
                if (toggleIcon) {
                    toggleIcon.textContent = itemsContainer.classList.contains('collapsed') ? '▶' : '▼';
                }
            }
        });
    });

    // 모두 펼치기 버튼
    const expandAllBtn = document.getElementById('expandAllCategories');
    if (expandAllBtn) {
        expandAllBtn.addEventListener('click', () => {
            document.querySelectorAll('.asset-items').forEach(el => {
                el.classList.remove('collapsed');
            });
            document.querySelectorAll('.category-header-bar.collapsible').forEach(header => {
                header.classList.remove('collapsed');
                const icon = header.querySelector('.toggle-icon');
                if (icon) icon.textContent = '▼';
            });
        });
    }

    // 모두 접기 버튼
    const collapseAllBtn = document.getElementById('collapseAllCategories');
    if (collapseAllBtn) {
        collapseAllBtn.addEventListener('click', () => {
            document.querySelectorAll('.asset-items').forEach(el => {
                el.classList.add('collapsed');
            });
            document.querySelectorAll('.category-header-bar.collapsible').forEach(header => {
                header.classList.add('collapsed');
                const icon = header.querySelector('.toggle-icon');
                if (icon) icon.textContent = '▶';
            });
        });
    }
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
                    showToast('삭제에 실패했습니다', 'error');
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
    } else if (category === 'cash') {
        subTypeSelect.innerHTML = `
            <option value="">선택 안함</option>
            ${CASH_TYPE_INFO.map(t => `<option value="${t.id}">${t.icon} ${t.name}</option>`).join('')}
        `;
        document.getElementById('cryptoFields').style.display = 'none';
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

// ============================================
// 에어드랍 빠른 추가
// ============================================

function openQuickAirdropModal() {
    document.getElementById('quickAirdropModal').style.display = 'flex';
    document.getElementById('quickAirdropName').value = '';
    document.getElementById('quickAirdropStatus').value = 'pending';
    document.getElementById('quickAirdropValue').value = '';
    document.getElementById('quickAirdropDate').value = '';
    document.getElementById('quickAirdropNotes').value = '';
    document.getElementById('quickAirdropName').focus();
}

function closeQuickAirdropModal() {
    document.getElementById('quickAirdropModal').style.display = 'none';
}

async function saveQuickAirdrop() {
    const name = document.getElementById('quickAirdropName').value.trim();
    const status = document.getElementById('quickAirdropStatus').value;
    const expectedValue = parseInt(document.getElementById('quickAirdropValue').value) || 0;
    const expectedDate = document.getElementById('quickAirdropDate').value || null;
    const notes = document.getElementById('quickAirdropNotes').value.trim();

    if (!name) {
        showToast('프로젝트명을 입력해주세요.', 'warning');
        return;
    }

    const assetData = {
        category: 'crypto',
        sub_type: 'airdrop',
        name,
        current_value: status === 'claimed' ? expectedValue : 0,
        purchase_value: status === 'claimed' ? expectedValue : 0,
        airdrop_status: status,
        airdrop_expected_value: expectedValue,
        airdrop_expected_date: expectedDate,
        notes: notes || null
    };

    const result = await createAsset(assetData);

    if (result.success) {
        closeQuickAirdropModal();
        await loadData();
        updateCurrentView();
        showToast('에어드랍이 추가되었습니다.', 'success');
    } else {
        showToast('저장 실패: ' + result.error, 'error');
    }
}

// ============================================
// 자산 정리 기능
// ============================================

function openDisposeModal(asset) {
    disposingAsset = asset;
    document.getElementById('disposeModal').style.display = 'flex';

    // 자산 정보 표시
    const infoEl = document.getElementById('disposeAssetInfo');
    infoEl.innerHTML = `
        <div class="dispose-asset-name">${asset.name}</div>
        <div class="dispose-asset-details">${asset.platform || ''} ${asset.token_name ? '| ' + asset.token_name : ''}</div>
        <div class="dispose-asset-value">${formatAmount(asset.current_value)}</div>
    `;

    // 폼 초기화
    document.getElementById('disposeType').value = 'cash_out';
    handleDisposeTypeChange();
    document.getElementById('destinationType').value = 'bank';
    document.getElementById('destinationName').value = '';
    document.getElementById('disposeAmount').value = asset.current_value || 0;
    document.getElementById('disposeDate').value = getToday();
    document.getElementById('disposeNotes').value = '';
}

function closeDisposeModal() {
    document.getElementById('disposeModal').style.display = 'none';
    disposingAsset = null;
}

function handleDisposeTypeChange() {
    const type = document.getElementById('disposeType').value;
    const destFields = document.getElementById('destinationFields');

    // 손실 처리나 기타는 목적지 숨김
    if (type === 'loss' || type === 'other') {
        destFields.style.display = 'none';
    } else {
        destFields.style.display = '';
        // 자산 전환이면 목적지 유형을 'asset'으로
        if (type === 'convert') {
            document.getElementById('destinationType').value = 'asset';
        } else {
            document.getElementById('destinationType').value = 'bank';
        }
    }
}

async function saveDisposal() {
    if (!disposingAsset) return;

    const type = document.getElementById('disposeType').value;
    const amount = parseInt(document.getElementById('disposeAmount').value) || 0;

    if (amount <= 0) {
        alert('정리 금액을 입력해주세요.');
        return;
    }

    const disposalData = {
        asset_name: disposingAsset.name,
        asset_category: disposingAsset.category,
        asset_platform: disposingAsset.platform,
        disposal_type: type,
        amount: amount,
        disposal_date: document.getElementById('disposeDate').value || getToday(),
        notes: document.getElementById('disposeNotes').value.trim() || null
    };

    // 목적지 정보 (현금화/전환 시)
    if (type === 'cash_out' || type === 'convert') {
        disposalData.destination_type = document.getElementById('destinationType').value;
        disposalData.destination = document.getElementById('destinationName').value.trim() || null;
    }

    const result = await disposeAsset(disposingAsset.id, disposalData);

    if (result.success) {
        closeDisposeModal();
        await loadData();
    } else {
        alert('정리 실패: ' + result.error);
    }
}

function renderDisposalList() {
    const list = document.getElementById('disposalList');
    if (!list) return;

    if (disposals.length === 0) {
        list.innerHTML = '<div class="empty-state">정리 이력이 없습니다</div>';
        return;
    }

    list.innerHTML = disposals.map(d => {
        const typeInfo = DISPOSAL_TYPES.find(t => t.id === d.disposal_type) || { icon: '📦', name: '기타' };
        const destInfo = d.destination_type ? DESTINATION_TYPES.find(t => t.id === d.destination_type) : null;

        let destText = '';
        if (d.destination) {
            destText = d.destination;
            if (destInfo) {
                destText = `${destInfo.icon} ${destText}`;
            }
        }

        return `
            <div class="disposal-item" data-id="${d.id}">
                <div class="disposal-icon">${typeInfo.icon}</div>
                <div class="disposal-main">
                    <div class="disposal-header">
                        <span class="disposal-asset-name">${d.asset_name}</span>
                        ${destText ? `<span class="disposal-arrow">→</span><span class="disposal-dest">${destText}</span>` : ''}
                    </div>
                    <div class="disposal-meta">
                        <span class="disposal-type">${typeInfo.name}</span>
                        <span class="disposal-date">${d.disposal_date}</span>
                    </div>
                    ${d.notes ? `<div class="disposal-notes">${d.notes}</div>` : ''}
                </div>
                <div class="disposal-amount">${formatAmount(d.amount)}</div>
                <button class="btn-icon delete-disposal-btn" data-id="${d.id}" title="삭제">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </div>
        `;
    }).join('');

    // 삭제 버튼 이벤트
    list.querySelectorAll('.delete-disposal-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (confirm('정리 이력을 삭제하시겠습니까?\n(자산은 복원되지 않습니다)')) {
                const result = await deleteAssetDisposal(id);
                if (result.success) {
                    await loadData();
                } else {
                    showToast('삭제에 실패했습니다', 'error');
                }
            }
        });
    });
}
