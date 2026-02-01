// V2: 통합 자산 관리 홈 대시보드
import { getTransactions, calculateNetWorth, getAssets, getDebts, getStakingOverview, getAirdropOverview, saveNetWorthSnapshot, getNetWorthHistory, getBudgetVsActual } from '../services/database.js';
import { calculateTotalIncome, calculateTotalExpense } from '../services/analytics.js';
import { formatAmount, formatAmountShort, exportAssetsToCSV, exportDebtsToCSV, exportTransactionsToCSV, exportNetWorthHistoryToCSV, exportAllDataToJSON } from '../utils/helpers.js';
import { ASSET_CATEGORY_INFO, CRYPTO_TYPE_INFO, GOALS } from '../utils/constants.js';

let netWorthData = null;
let assets = [];
let debts = [];
let stakingList = [];
let airdropList = [];
let netWorthChart = null;
let budgetData = null;

export function createHomeTab() {
    return `
        <div class="home-container v2">
            <!-- 긴급 알림 배너 -->
            <div class="alert-banners" id="alertBanners">
                <!-- 동적으로 채워짐 -->
            </div>

            <!-- 순자산 히어로 섹션 -->
            <div class="net-worth-hero">
                <div class="net-worth-label">💰 총 순자산</div>
                <div class="net-worth-value" id="netWorthValue">0원</div>
                <div class="net-worth-breakdown">
                    <span class="assets-total">자산 <span id="totalAssetsValue">0원</span></span>
                    <span class="separator">-</span>
                    <span class="debts-total">부채 <span id="totalDebtsValue">0원</span></span>
                </div>
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

            <!-- 빠른 액션 (상단 배치) -->
            <div class="quick-actions-bar">
                <button class="quick-action-btn" data-action="add-transaction">
                    <span class="quick-action-icon">💸</span>
                    <span class="quick-action-label">거래 추가</span>
                </button>
                <button class="quick-action-btn" data-action="add-asset">
                    <span class="quick-action-icon">➕</span>
                    <span class="quick-action-label">자산 추가</span>
                </button>
            </div>

            <!-- 순자산 추이 차트 -->
            <div class="section-card collapsible">
                <h2 class="section-title" data-toggle="netWorthTrend">
                    📈 순자산 추이
                    <span class="toggle-icon">▼</span>
                </h2>
                <div class="section-content" id="netWorthTrendContent">
                    <div class="trend-period-selector">
                        <button class="trend-period-btn active" data-months="3">3개월</button>
                        <button class="trend-period-btn" data-months="6">6개월</button>
                        <button class="trend-period-btn" data-months="12">1년</button>
                    </div>
                    <div class="trend-chart-container">
                        <canvas id="netWorthTrendChart"></canvas>
                    </div>
                    <div class="trend-summary" id="trendSummary">
                        <!-- 동적으로 채워짐 -->
                    </div>
                </div>
            </div>

            <!-- 자산 구성 차트 -->
            <div class="section-card collapsible" id="assetCompositionSection">
                <h2 class="section-title" data-toggle="assetComposition">
                    📊 자산 구성
                    <span class="toggle-icon">▼</span>
                </h2>
                <div class="section-content" id="assetCompositionContent">
                    <div class="chart-and-legend">
                        <div class="chart-wrapper">
                            <canvas id="assetPieChart" width="200" height="200"></canvas>
                        </div>
                        <div class="asset-category-grid" id="assetCategoryGrid">
                            <!-- 동적으로 채워짐 -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- 크립토 세부 -->
            <div class="section-card collapsible" id="cryptoDetailSection">
                <h2 class="section-title" data-toggle="cryptoDetail">
                    🪙 크립토 자산 상세
                    <span class="toggle-icon">▼</span>
                </h2>
                <div class="section-content" id="cryptoDetailContent">
                    <div class="crypto-detail-grid" id="cryptoDetailGrid">
                        <!-- 동적으로 채워짐 -->
                    </div>
                </div>
            </div>

            <!-- 스테이킹 & 에어드랍 -->
            <div class="two-column-grid">
                <!-- 스테이킹 현황 -->
                <div class="section-card collapsible">
                    <h2 class="section-title" data-toggle="staking">
                        🔒 스테이킹 현황
                        <span class="toggle-icon">▼</span>
                    </h2>
                    <div class="section-content" id="stakingContent">
                        <div class="staking-list" id="stakingList">
                            <div class="empty-state">스테이킹 자산이 없습니다</div>
                        </div>
                    </div>
                </div>

                <!-- 에어드랍 현황 -->
                <div class="section-card collapsible">
                    <h2 class="section-title" data-toggle="airdrop">
                        🎯 에어드랍 현황
                        <span class="toggle-icon">▼</span>
                    </h2>
                    <div class="section-content" id="airdropContent">
                        <div class="airdrop-stats" id="airdropStats">
                            <!-- 에어드랍 통계 -->
                        </div>
                        <div class="airdrop-list" id="airdropList">
                            <div class="empty-state">등록된 에어드랍이 없습니다</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 부채 현황 -->
            <div class="section-card debt-section collapsible">
                <h2 class="section-title" data-toggle="debt">
                    💳 부채 현황
                    <span class="toggle-icon">▼</span>
                </h2>
                <div class="section-content" id="debtContent">
                    <div class="debt-summary">
                        <div class="debt-total">
                            <span class="debt-label">총 부채</span>
                            <span class="debt-value" id="totalDebtDisplay">0원</span>
                        </div>
                    </div>
                    <div class="debt-list" id="debtList">
                        <div class="empty-state">등록된 부채가 없습니다</div>
                    </div>
                </div>
            </div>

            <!-- 이번 달 현금 흐름 -->
            <div class="section-card">
                <h2 class="section-title">💸 이번 달 현금 흐름</h2>
                <div class="cashflow-summary-grid">
                    <div class="cashflow-item income">
                        <div class="cashflow-label">수입</div>
                        <div class="cashflow-value" id="monthlyIncome">0원</div>
                    </div>
                    <div class="cashflow-item expense">
                        <div class="cashflow-label">지출</div>
                        <div class="cashflow-value" id="monthlyExpense">0원</div>
                    </div>
                    <div class="cashflow-item net">
                        <div class="cashflow-label">순수익</div>
                        <div class="cashflow-value" id="monthlyNet">0원</div>
                    </div>
                </div>
            </div>

            <!-- 예산 현황 (간략) -->
            <div class="section-card collapsible" id="budgetSection">
                <h2 class="section-title" data-toggle="budgetStatus">
                    💰 이번 달 예산 현황
                    <span class="toggle-icon">▼</span>
                </h2>
                <div class="section-content" id="budgetStatusContent">
                    <div class="budget-home-summary" id="budgetHomeSummary">
                        <!-- 동적으로 채워짐 -->
                    </div>
                </div>
            </div>

            <!-- 데이터 내보내기 -->
            <div class="section-card collapsible">
                <h2 class="section-title" data-toggle="dataExport">
                    💾 데이터 내보내기
                    <span class="toggle-icon">▼</span>
                </h2>
                <div class="section-content" id="dataExportContent">
                    <div class="export-grid">
                        <button class="export-btn" data-export="assets">
                            <span class="export-icon">📊</span>
                            <span class="export-label">자산 (CSV)</span>
                        </button>
                        <button class="export-btn" data-export="debts">
                            <span class="export-icon">💳</span>
                            <span class="export-label">부채 (CSV)</span>
                        </button>
                        <button class="export-btn" data-export="transactions">
                            <span class="export-icon">💸</span>
                            <span class="export-label">거래내역 (CSV)</span>
                        </button>
                        <button class="export-btn" data-export="networth">
                            <span class="export-icon">📈</span>
                            <span class="export-label">순자산추이 (CSV)</span>
                        </button>
                        <button class="export-btn primary" data-export="backup">
                            <span class="export-icon">🔐</span>
                            <span class="export-label">전체 백업 (JSON)</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- RPG 위젯 (간소화) -->
            <div class="rpg-widget">
                <div class="rpg-level">
                    <span class="rpg-icon">🎮</span>
                    <span class="rpg-text">Lv. <span id="rpgLevel">1</span></span>
                </div>
                <div class="rpg-streak">
                    <span class="rpg-icon">🔥</span>
                    <span class="rpg-text"><span id="rpgStreak">0</span>일 연속</span>
                </div>
            </div>
        </div>
    `;
}

export async function initHomeTab(switchTabCallback) {
    await loadHomeData();

    // 기본적으로 상세 섹션들 접기 (심플 뷰)
    const sectionsToCollapse = [
        'netWorthTrend',
        'assetComposition',
        'cryptoDetail',
        'staking',
        'airdrop',
        'debt',
        'budgetStatus',
        'dataExport'
    ];

    sectionsToCollapse.forEach(toggleId => {
        const title = document.querySelector(`[data-toggle="${toggleId}"]`);
        if (title) {
            const sectionCard = title.closest('.section-card');
            const content = sectionCard.querySelector('.section-content');
            const icon = title.querySelector('.toggle-icon');

            if (content) {
                content.classList.add('collapsed');
                icon.textContent = '▶';
                sectionCard.classList.add('is-collapsed');
            }
        }
    });

    // 섹션 접기/펼치기 이벤트
    document.querySelectorAll('.section-title[data-toggle]').forEach(title => {
        title.addEventListener('click', () => {
            const sectionCard = title.closest('.section-card');
            const content = sectionCard.querySelector('.section-content');
            const icon = title.querySelector('.toggle-icon');

            if (content) {
                const isCollapsed = content.classList.toggle('collapsed');
                icon.textContent = isCollapsed ? '▶' : '▼';
                sectionCard.classList.toggle('is-collapsed', isCollapsed);
            }
        });
    });

    // 빠른 액션 버튼 이벤트
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            handleQuickAction(action, switchTabCallback);
        });
    });

    // 순자산 추이 기간 선택 버튼
    document.querySelectorAll('.trend-period-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            document.querySelectorAll('.trend-period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const months = parseInt(btn.dataset.months);
            await loadNetWorthTrendChart(months);
        });
    });

    // 데이터 내보내기 버튼
    document.querySelectorAll('.export-btn').forEach(btn => {
        btn.addEventListener('click', () => handleExport(btn.dataset.export));
    });
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
        const [netWorthResult, assetsResult, debtsResult, stakingResult, airdropResult, transactionsResult, budgetResult] = await Promise.all([
            calculateNetWorth(),
            getAssets(),
            getDebts(),
            getStakingOverview(),
            getAirdropOverview(),
            getTransactions(),
            getBudgetVsActual()
        ]);

        if (netWorthResult.success) {
            netWorthData = netWorthResult.data;
            updateNetWorthDisplay();
        }

        if (assetsResult.success) {
            assets = assetsResult.data || [];
            updateAssetCategories();
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
            updateCashflowDisplay(transactionsResult.data || []);
        }

        // 예산 현황 업데이트
        if (budgetResult.success) {
            budgetData = budgetResult.data;
            updateBudgetHomeDisplay();
        }

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

    // 스테이킹 D-7 이내 알림
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

    // 클레임 가능한 에어드랍 알림
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
