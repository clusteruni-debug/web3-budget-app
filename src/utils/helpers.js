// 숫자 포맷팅
export function formatNumber(num) {
    return new Intl.NumberFormat('ko-KR').format(num);
}

export function formatCurrency(num) {
    if (num >= 100000000) {
        return `${(num / 100000000).toFixed(1)}억`;
    } else if (num >= 10000) {
        return `${(num / 10000).toFixed(0)}만`;
    }
    return formatNumber(num);
}

export function formatAmount(num) {
    return `${formatNumber(num)}원`;
}

// 축약형 금액 표시 (억/만원 단위)
export function formatAmountShort(num) {
    const absNum = Math.abs(num);
    const sign = num < 0 ? '-' : '';

    if (absNum >= 100000000) {
        // 1억 이상: "5.6억원" 또는 "56억원"
        const billions = absNum / 100000000;
        if (billions >= 10) {
            return `${sign}${Math.round(billions)}억원`;
        }
        return `${sign}${billions.toFixed(1)}억원`;
    } else if (absNum >= 10000000) {
        // 1000만 이상: "5,600만원"
        return `${sign}${formatNumber(Math.round(absNum / 10000))}만원`;
    } else if (absNum >= 10000) {
        // 1만 이상: "500만원"
        return `${sign}${Math.round(absNum / 10000)}만원`;
    }
    return `${sign}${formatNumber(absNum)}원`;
}

// 날짜 포맷팅
export function formatDate(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
}

export function formatFullDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getToday() {
    return new Date().toISOString().split('T')[0];
}

// 날짜 필터 적용
export function filterByDate(transactions, filter) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
        case 'thisWeek':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return transactions.filter(t => new Date(t.date) >= weekStart);
            
        case 'thisMonth':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            return transactions.filter(t => new Date(t.date) >= monthStart);
            
        case 'lastMonth':
            const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
            return transactions.filter(t => {
                const date = new Date(t.date);
                return date >= lastMonthStart && date <= lastMonthEnd;
            });
            
        default: // 'all'
            return transactions;
    }
}

// 퍼센트 계산
export function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
}

// 변화율 계산
export function calculateChangeRate(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return (((current - previous) / previous) * 100).toFixed(1);
}

// 다음 날짜 계산 (반복 항목용)
export function calculateNextDate(currentDate, frequency) {
    const date = new Date(currentDate);
    
    switch (frequency) {
        case 'daily':
            date.setDate(date.getDate() + 1);
            break;
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
    }
    
    return date.toISOString().split('T')[0];
}

// 색상 가져오기 (계정별, 카테고리별)
export function getAccountColor(accountType) {
    const colors = {
        web3: 'var(--web3)',
        investment: 'var(--investment)',
        bank: 'var(--bank)',
        family: 'var(--family)'
    };
    return colors[accountType] || 'var(--primary)';
}

export function getTransactionColor(type) {
    const colors = {
        income: 'var(--income)',
        expense: 'var(--expense)',
        transfer: 'var(--transfer)'
    };
    return colors[type] || 'var(--gray-500)';
}

// ============================================
// 데이터 내보내기 (CSV)
// ============================================

// CSV 문자열 생성 (특수문자 이스케이프 처리)
function escapeCsvValue(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

// 자산 데이터 CSV 내보내기
export function exportAssetsToCSV(assets) {
    const headers = ['이름', '분류', '세부유형', '현재가치', '매입가/청산가', '수량', '토큰명', '플랫폼', '상태', '예상일', '메모', '생성일'];
    const rows = assets.map(a => {
        // 에어드랍은 purchase_value가 청산 금액
        const valueOrClaimed = a.sub_type === 'airdrop' && a.airdrop_status === 'claimed'
            ? a.purchase_value
            : a.purchase_value;
        const status = a.sub_type === 'airdrop' ? a.airdrop_status
            : a.sub_type === 'staking' ? a.staking_status
            : '';
        const expectedDate = a.sub_type === 'airdrop' ? a.airdrop_expected_date
            : a.sub_type === 'staking' ? a.staking_unlock_date
            : '';

        return [
            a.name,
            a.category,
            a.sub_type || '',
            a.current_value,
            valueOrClaimed || '',
            a.quantity || '',
            a.token_name || '',
            a.platform || '',
            status,
            expectedDate || '',
            a.notes || '',
            a.created_at?.split('T')[0] || ''
        ];
    });

    return generateAndDownloadCSV(headers, rows, '자산목록');
}

// 부채 데이터 CSV 내보내기
export function exportDebtsToCSV(debts) {
    const headers = ['이름', '채권자', '원금', '잔액', '이자율', '월상환액', '시작일', '만기일', '메모'];
    const rows = debts.map(d => [
        d.name,
        d.creditor || '',
        d.principal_amount,
        d.remaining_amount,
        d.interest_rate || '',
        d.monthly_payment || '',
        d.start_date || '',
        d.end_date || '',
        d.description || ''
    ]);

    return generateAndDownloadCSV(headers, rows, '부채목록');
}

// 거래 데이터 CSV 내보내기
export function exportTransactionsToCSV(transactions) {
    const headers = ['날짜', '유형', '분류', '금액', '설명', '보관처'];
    const rows = transactions.map(t => [
        t.date,
        t.type === 'income' ? '수입' : t.type === 'expense' ? '지출' : '이체',
        t.category || '',
        t.amount,
        t.description || '',
        t.account_name || ''
    ]);

    return generateAndDownloadCSV(headers, rows, '거래내역');
}

// 순자산 스냅샷 CSV 내보내기
export function exportNetWorthHistoryToCSV(snapshots) {
    const headers = ['날짜', '순자산', '총자산', '총부채', '크립토', '주식', '현금', '부동산', '기타'];
    const rows = snapshots.map(s => [
        s.recorded_at,
        s.net_worth,
        s.total_assets,
        s.total_debts,
        s.total_crypto || 0,
        s.total_stock || 0,
        s.total_cash || 0,
        s.total_real_estate || 0,
        s.total_other || 0
    ]);

    return generateAndDownloadCSV(headers, rows, '순자산추이');
}

// CSV 생성 및 다운로드
function generateAndDownloadCSV(headers, rows, filename) {
    // BOM 추가 (Excel 한글 호환)
    const BOM = '\uFEFF';
    const csvContent = BOM + [
        headers.map(escapeCsvValue).join(','),
        ...rows.map(row => row.map(escapeCsvValue).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${getToday()}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    return true;
}

// 전체 데이터 백업 (JSON)
export function exportAllDataToJSON(data) {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `자산관리_백업_${getToday()}.json`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    return true;
}

// ============================================
// 토스트 알림 시스템
// ============================================

let toastContainer = null;

function ensureToastContainer() {
    if (!toastContainer || !document.body.contains(toastContainer)) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    return toastContainer;
}

/**
 * 토스트 알림 표시
 * @param {string} message - 표시할 메시지
 * @param {string} type - 'success' | 'error' | 'warning' | 'info'
 * @param {number} duration - 표시 시간 (ms), 기본 3000
 */
export function showToast(message, type = 'info', duration = 3000) {
    const container = ensureToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // 애니메이션을 위해 약간의 딜레이 후 show 클래스 추가
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // 자동 제거
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

// 편의 함수들
export const toast = {
    success: (msg, duration) => showToast(msg, 'success', duration),
    error: (msg, duration) => showToast(msg, 'error', duration),
    warning: (msg, duration) => showToast(msg, 'warning', duration),
    info: (msg, duration) => showToast(msg, 'info', duration)
};

// ============================================
// 스켈레톤 로딩
// ============================================

/**
 * 스켈레톤 로딩 HTML 생성
 * @param {string} type - 'card' | 'list' | 'text' | 'circle'
 * @param {number} count - 반복 횟수
 */
export function createSkeleton(type, count = 1) {
    const skeletons = {
        card: `
            <div class="skeleton-loading skeleton-card">
                <div class="skeleton-loading skeleton-text large"></div>
                <div class="skeleton-loading skeleton-text medium"></div>
                <div class="skeleton-loading skeleton-text small"></div>
            </div>
        `,
        list: `
            <div style="display: flex; gap: 12px; align-items: center; padding: 12px 0;">
                <div class="skeleton-loading skeleton-circle" style="width: 40px; height: 40px;"></div>
                <div style="flex: 1;">
                    <div class="skeleton-loading skeleton-text medium"></div>
                    <div class="skeleton-loading skeleton-text small" style="margin-top: 8px;"></div>
                </div>
                <div class="skeleton-loading skeleton-text" style="width: 80px;"></div>
            </div>
        `,
        text: `<div class="skeleton-loading skeleton-text medium"></div>`,
        circle: `<div class="skeleton-loading skeleton-circle" style="width: 48px; height: 48px;"></div>`
    };

    const template = skeletons[type] || skeletons.text;
    return Array(count).fill(template).join('');
}

/**
 * 요소에 스켈레톤 로딩 표시
 * @param {HTMLElement|string} element - 요소 또는 선택자
 * @param {string} type - 스켈레톤 타입
 * @param {number} count - 반복 횟수
 */
export function showSkeleton(element, type = 'list', count = 3) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) {
        el.innerHTML = createSkeleton(type, count);
    }
}

// ============================================
// 로딩 오버레이
// ============================================

let loadingOverlay = null;

function ensureLoadingOverlay() {
    if (!loadingOverlay || !document.body.contains(loadingOverlay)) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner large"></div>
                <p class="loading-text">로딩 중...</p>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    }
    return loadingOverlay;
}

/**
 * 로딩 오버레이 표시
 * @param {string} text - 로딩 텍스트 (선택)
 */
export function showLoading(text = '로딩 중...') {
    const overlay = ensureLoadingOverlay();
    const textEl = overlay.querySelector('.loading-text');
    if (textEl) textEl.textContent = text;
    document.body.classList.add('no-scroll');
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });
}

/**
 * 로딩 오버레이 숨기기
 */
export function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
}

// ============================================
// 숫자 카운트업 애니메이션
// ============================================

/**
 * 숫자 카운트업 애니메이션
 * @param {HTMLElement} element - 타겟 요소
 * @param {number} start - 시작 값
 * @param {number} end - 종료 값
 * @param {number} duration - 애니메이션 시간 (ms)
 * @param {function} formatter - 포맷팅 함수
 */
export function animateCountUp(element, start, end, duration = 1000, formatter = formatAmountShort) {
    const startTime = performance.now();
    const diff = end - start;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // easeOutQuart 이징
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = start + diff * eased;

        element.textContent = formatter(Math.round(current));

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ============================================
// 디바운스 & 스로틀
// ============================================

/**
 * 디바운스 함수
 * @param {function} func - 실행할 함수
 * @param {number} wait - 대기 시간 (ms)
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 스로틀 함수
 * @param {function} func - 실행할 함수
 * @param {number} limit - 제한 시간 (ms)
 */
export function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// 로딩 스피너
// ============================================

/**
 * 로딩 스피너 HTML 생성
 * @param {string} text - 로딩 텍스트 (선택)
 * @returns {string} HTML 문자열
 */
export function createLoadingSpinner(text = '로딩 중...') {
    return `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <div class="loading-text">${text}</div>
        </div>
    `;
}

// ============================================
// 빈 상태 (Empty State) 컴포넌트
// ============================================

/**
 * 빈 상태 HTML 생성
 * @param {Object} options
 * @param {string} options.icon - 이모지 아이콘
 * @param {string} options.title - 제목
 * @param {string} options.description - 설명 (선택)
 * @param {string} options.actionText - 버튼 텍스트 (선택)
 * @param {string} options.actionId - 버튼 ID (선택)
 * @returns {string} HTML 문자열
 */
export function createEmptyState({ icon = '📭', title, description = '', actionText = '', actionId = '' }) {
    return `
        <div class="empty-state-v2">
            <div class="empty-icon">${icon}</div>
            <div class="empty-title">${title}</div>
            ${description ? `<div class="empty-description">${description}</div>` : ''}
            ${actionText ? `<button class="empty-action" ${actionId ? `id="${actionId}"` : ''}>${actionText}</button>` : ''}
        </div>
    `;
}

// ============================================
// 토스트 알림
// ============================================

// 자주 쓰는 빈 상태 프리셋
export const EMPTY_STATES = {
    assets: {
        icon: '💰',
        title: '등록된 자산이 없습니다',
        description: '자산을 추가해서 순자산을 관리해보세요',
        actionText: '+ 자산 추가'
    },
    transactions: {
        icon: '💸',
        title: '거래 내역이 없습니다',
        description: '수입이나 지출을 기록해보세요',
        actionText: '+ 거래 추가'
    },
    budget: {
        icon: '📊',
        title: '설정된 예산이 없습니다',
        description: '월 예산을 설정해서 지출을 관리해보세요',
        actionText: '+ 예산 설정'
    },
    goals: {
        icon: '🎯',
        title: '저축 목표가 없습니다',
        description: '목표를 설정하고 달성률을 확인해보세요',
        actionText: '+ 목표 추가'
    },
    subscriptions: {
        icon: '📺',
        title: '구독 서비스가 없습니다',
        description: '정기 구독을 등록해서 관리해보세요',
        actionText: '+ 구독 추가'
    },
    staking: {
        icon: '🔒',
        title: '스테이킹 자산이 없습니다',
        description: '스테이킹 중인 자산을 등록해보세요'
    },
    airdrops: {
        icon: '🎁',
        title: '등록된 에어드랍이 없습니다',
        description: '참여 중인 에어드랍을 추가해보세요'
    },
    debts: {
        icon: '💳',
        title: '등록된 부채가 없습니다',
        description: '부채가 없다니 대단해요!'
    },
    recurring: {
        icon: '📅',
        title: '고정 수입/지출이 없습니다',
        description: '매월 반복되는 항목을 등록해보세요'
    }
};
