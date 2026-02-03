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

// ============================================
// 자동 계산 함수들
// ============================================

/**
 * 대출 월상환액 계산 (원리금균등상환)
 * @param {number} principal - 대출 원금
 * @param {number} annualRate - 연이율 (예: 5.5 = 5.5%)
 * @param {number} termMonths - 상환 기간 (개월)
 * @returns {number} 월상환액
 */
export function calculateLoanMonthlyPayment(principal, annualRate, termMonths) {
    if (!principal || !annualRate || !termMonths) return 0;
    if (termMonths <= 0) return 0;

    const monthlyRate = annualRate / 100 / 12;

    if (monthlyRate === 0) {
        // 무이자 대출
        return Math.round(principal / termMonths);
    }

    // 원리금균등상환 공식: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    const factor = Math.pow(1 + monthlyRate, termMonths);
    const payment = principal * (monthlyRate * factor) / (factor - 1);

    return Math.round(payment);
}

/**
 * 적금 만기액 계산 (정기적금, 월 복리)
 * @param {number} monthlyDeposit - 월 납입액
 * @param {number} annualRate - 연이율 (예: 4.0 = 4%)
 * @param {number} termMonths - 적금 기간 (개월)
 * @returns {{ maturityAmount: number, totalDeposit: number, interest: number }}
 */
export function calculateSavingsMaturity(monthlyDeposit, annualRate, termMonths) {
    if (!monthlyDeposit || !termMonths) {
        return { maturityAmount: 0, totalDeposit: 0, interest: 0 };
    }

    const totalDeposit = monthlyDeposit * termMonths;

    if (!annualRate || annualRate === 0) {
        return { maturityAmount: totalDeposit, totalDeposit, interest: 0 };
    }

    // 단리 계산 (일반 적금)
    // 이자 = 월납입액 × (기간×(기간+1)/2) × (연이율/12/100)
    const interest = monthlyDeposit * (termMonths * (termMonths + 1) / 2) * (annualRate / 12 / 100);
    const maturityAmount = Math.round(totalDeposit + interest);

    return {
        maturityAmount,
        totalDeposit,
        interest: Math.round(interest)
    };
}

/**
 * 투자 수익률 계산
 * @param {number} purchaseValue - 매입 금액
 * @param {number} currentValue - 현재 평가금
 * @returns {{ profit: number, profitRate: number }}
 */
export function calculateInvestmentReturn(purchaseValue, currentValue) {
    if (!purchaseValue) {
        return { profit: 0, profitRate: 0 };
    }

    const profit = currentValue - purchaseValue;
    const profitRate = (profit / purchaseValue) * 100;

    return {
        profit,
        profitRate: parseFloat(profitRate.toFixed(2))
    };
}

/**
 * 대출 잔여 상환 기간 계산
 * @param {number} remainingAmount - 잔여 원금
 * @param {number} monthlyPayment - 월상환액
 * @returns {number} 남은 개월 수
 */
export function calculateRemainingTerm(remainingAmount, monthlyPayment) {
    if (!monthlyPayment || monthlyPayment <= 0) return 0;
    return Math.ceil(remainingAmount / monthlyPayment);
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

// ============================================
// 자연어 거래 입력 파싱
// ============================================

/**
 * 키워드 → 분류 매핑
 * 자주 쓰는 키워드를 기반으로 자동 분류
 */
const KEYWORD_CATEGORY_MAP = {
    // 식비
    '커피': '식비', '카페': '식비', '스타벅스': '식비', '이디야': '식비',
    '점심': '식비', '저녁': '식비', '아침': '식비', '식사': '식비',
    '배달': '식비', '배민': '식비', '쿠팡이츠': '식비', '요기요': '식비',
    '편의점': '식비', 'CU': '식비', 'GS25': '식비', '세븐': '식비',
    '치킨': '식비', '피자': '식비', '햄버거': '식비', '맥도날드': '식비',
    '라면': '식비', '김밥': '식비', '떡볶이': '식비', '분식': '식비',
    '마트': '식비', '장보기': '식비', '식료품': '식비',

    // 교통비
    '택시': '교통비', '카카오택시': '교통비', '타다': '교통비',
    '버스': '교통비', '지하철': '교통비', '전철': '교통비',
    '기차': '교통비', 'KTX': '교통비', 'SRT': '교통비',
    '주유': '교통비', '기름': '교통비', '주차': '교통비',
    '톨비': '교통비', '하이패스': '교통비',
    '따릉이': '교통비', '킥보드': '교통비',

    // 쇼핑
    '쇼핑': '쇼핑', '옷': '쇼핑', '신발': '쇼핑', '가방': '쇼핑',
    '쿠팡': '쇼핑', '네이버쇼핑': '쇼핑', '11번가': '쇼핑',
    '무신사': '쇼핑', '올리브영': '쇼핑', '다이소': '쇼핑',

    // 문화/여가
    '영화': '문화/여가', 'CGV': '문화/여가', '메가박스': '문화/여가', '롯데시네마': '문화/여가',
    '넷플릭스': '문화/여가', '유튜브': '문화/여가', '왓챠': '문화/여가', '디즈니': '문화/여가',
    '게임': '문화/여가', '스팀': '문화/여가', '닌텐도': '문화/여가',
    '헬스': '문화/여가', '피트니스': '문화/여가', '수영': '문화/여가',
    '여행': '문화/여가', '호텔': '문화/여가', '숙소': '문화/여가', '에어비앤비': '문화/여가',
    '콘서트': '문화/여가', '공연': '문화/여가', '전시': '문화/여가',
    '책': '문화/여가', '교보문고': '문화/여가', '알라딘': '문화/여가',

    // 의료/건강
    '병원': '의료/건강', '약국': '의료/건강', '약': '의료/건강',
    '치과': '의료/건강', '안과': '의료/건강', '피부과': '의료/건강',
    '한의원': '의료/건강', '정형외과': '의료/건강',

    // 통신비
    '휴대폰': '통신비', '핸드폰': '통신비', '통신': '통신비',
    'KT': '통신비', 'SKT': '통신비', 'LG': '통신비',
    '인터넷': '통신비', '와이파이': '통신비',

    // 주거/관리비
    '월세': '주거비', '관리비': '주거비', '전기': '주거비',
    '가스': '주거비', '수도': '주거비', '난방': '주거비',

    // 교육
    '학원': '교육', '강의': '교육', '수업': '교육', '과외': '교육',
    '인강': '교육', '클래스101': '교육', '유데미': '교육',

    // 보험
    '보험': '보험', '실비': '보험', '자동차보험': '보험',

    // 경조사
    '축의금': '경조사', '부조금': '경조사', '선물': '경조사', '생일': '경조사',

    // 반려동물
    '강아지': '반려동물', '고양이': '반려동물', '사료': '반려동물', '펫': '반려동물',

    // 수입 관련
    '월급': '급여', '급여': '급여', '보너스': '급여', '상여금': '급여',
    '용돈': '용돈', '이자': '이자수입', '배당': '배당수입',
    '환급': '환급', '리워드': '리워드', '캐시백': '리워드',
    '판매': '판매수입', '중고': '판매수입', '당근': '판매수입'
};

/**
 * 자연어 텍스트에서 거래 정보 파싱
 * @param {string} text - 입력 텍스트 (예: "커피 4500원", "점심 12000")
 * @returns {Object} { amount, category, title, type }
 */
export function parseTransactionText(text) {
    if (!text || typeof text !== 'string') {
        return { amount: 0, category: null, title: '', type: 'expense' };
    }

    const trimmed = text.trim();

    // 금액 추출 (다양한 형식 지원)
    // "4500원", "4,500원", "4500", "45000"
    const amountMatch = trimmed.match(/([0-9,]+)\s*원?/);
    let amount = 0;
    if (amountMatch) {
        amount = parseInt(amountMatch[1].replace(/,/g, ''), 10) || 0;
    }

    // 금액 부분 제거하고 나머지를 제목으로
    let title = trimmed
        .replace(/[0-9,]+\s*원?/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    // 분류 추출 (키워드 매칭)
    let category = null;
    let type = 'expense'; // 기본값: 지출

    const lowerTitle = title.toLowerCase();

    for (const [keyword, cat] of Object.entries(KEYWORD_CATEGORY_MAP)) {
        if (lowerTitle.includes(keyword.toLowerCase())) {
            category = cat;

            // 수입 관련 분류인지 확인
            if (['급여', '용돈', '이자수입', '배당수입', '환급', '리워드', '판매수입'].includes(cat)) {
                type = 'income';
            }
            break;
        }
    }

    return { amount, category, title, type };
}

/**
 * 파싱 결과 미리보기 텍스트 생성
 * @param {Object} parsed - parseTransactionText 결과
 * @returns {string} 미리보기 텍스트
 */
export function formatParsedTransaction(parsed) {
    const parts = [];

    if (parsed.title) {
        parts.push(parsed.title);
    }

    if (parsed.amount > 0) {
        parts.push(formatAmountShort(parsed.amount));
    }

    if (parsed.category) {
        parts.push(`(${parsed.category})`);
    }

    return parts.join(' ') || '입력해주세요';
}

// ============================================
// 브라우저 Push 알림
// ============================================

/**
 * 알림 권한 상태 확인
 * @returns {'granted' | 'denied' | 'default' | 'unsupported'}
 */
export function getNotificationPermission() {
    if (!('Notification' in window)) {
        return 'unsupported';
    }
    return Notification.permission;
}

/**
 * 알림 권한 요청
 * @returns {Promise<boolean>} 권한 허용 여부
 */
export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.warn('이 브라우저는 알림을 지원하지 않습니다.');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission === 'denied') {
        showToast('알림이 차단되어 있습니다. 브라우저 설정에서 허용해주세요.', 'warning');
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            showToast('알림이 활성화되었습니다!', 'success');
            return true;
        }
        return false;
    } catch (error) {
        console.error('알림 권한 요청 실패:', error);
        return false;
    }
}

/**
 * 브라우저 Push 알림 표시
 * @param {string} title - 알림 제목
 * @param {Object} options - 알림 옵션
 * @param {string} options.body - 알림 본문
 * @param {string} options.icon - 아이콘 URL
 * @param {string} options.tag - 알림 태그 (중복 방지)
 * @param {Function} options.onClick - 클릭 시 콜백
 */
export function showPushNotification(title, options = {}) {
    if (!('Notification' in window)) {
        console.warn('이 브라우저는 알림을 지원하지 않습니다.');
        // 대체: 토스트 메시지
        showToast(`${title}: ${options.body || ''}`, 'info');
        return;
    }

    if (Notification.permission !== 'granted') {
        // 대체: 토스트 메시지
        showToast(`${title}: ${options.body || ''}`, 'info');
        return;
    }

    const notification = new Notification(title, {
        body: options.body || '',
        icon: options.icon || '/favicon.ico',
        tag: options.tag || 'budget-app',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        requireInteraction: false,
        ...options
    });

    // 클릭 시 창 포커스
    notification.onclick = () => {
        window.focus();
        notification.close();
        if (options.onClick) {
            options.onClick();
        }
    };

    // 5초 후 자동 닫기
    setTimeout(() => {
        notification.close();
    }, 5000);

    return notification;
}

// ============================================
// 알림 유형별 함수
// ============================================

/**
 * 예산 초과 알림
 * @param {string} category - 분류명
 * @param {number} spent - 사용 금액
 * @param {number} budget - 예산 금액
 * @param {number} percentage - 사용 비율
 */
export function notifyBudgetExceeded(category, spent, budget, percentage) {
    const isExceeded = percentage >= 100;
    const title = isExceeded ? '⚠️ 예산 초과!' : '⚠️ 예산 경고';
    const body = isExceeded
        ? `${category} 예산을 초과했습니다. (${formatAmountShort(spent)} / ${formatAmountShort(budget)})`
        : `${category} 예산의 ${percentage}%를 사용했습니다.`;

    showPushNotification(title, {
        body,
        tag: `budget-${category}`,
        icon: '/favicon.ico'
    });
}

/**
 * 결제일 알림
 * @param {string} name - 항목명
 * @param {number} amount - 금액
 * @param {number} daysLeft - 남은 일수
 */
export function notifyPaymentDue(name, amount, daysLeft) {
    const title = daysLeft === 0 ? '💳 오늘 결제일!' : `💳 결제일 D-${daysLeft}`;
    const body = `${name}: ${formatAmountShort(amount)}`;

    showPushNotification(title, {
        body,
        tag: `payment-${name}`,
        icon: '/favicon.ico'
    });
}

/**
 * 스테이킹 언락 알림
 * @param {string} tokenName - 토큰명
 * @param {number} amount - 수량
 * @param {number} daysLeft - 남은 일수
 */
export function notifyStakingUnlock(tokenName, amount, daysLeft) {
    const title = daysLeft === 0 ? '🔓 스테이킹 언락!' : `🔓 언락 D-${daysLeft}`;
    const body = `${tokenName}: ${amount}개 언락 예정`;

    showPushNotification(title, {
        body,
        tag: `staking-${tokenName}`,
        icon: '/favicon.ico'
    });
}

/**
 * 에어드랍 클레임 알림
 * @param {string} projectName - 프로젝트명
 */
export function notifyAirdropClaimable(projectName) {
    showPushNotification('🎁 에어드랍 클레임 가능!', {
        body: `${projectName} 에어드랍을 클레임할 수 있습니다.`,
        tag: `airdrop-${projectName}`,
        icon: '/favicon.ico'
    });
}

/**
 * 목표 달성 알림
 * @param {string} goalName - 목표명
 * @param {number} targetAmount - 목표 금액
 */
export function notifyGoalAchieved(goalName, targetAmount) {
    showPushNotification('🎉 목표 달성!', {
        body: `"${goalName}" 목표(${formatAmountShort(targetAmount)})를 달성했습니다!`,
        tag: `goal-${goalName}`,
        icon: '/favicon.ico'
    });
}

/**
 * 알림 설정 저장
 * @param {Object} settings - 알림 설정
 */
export function saveNotificationSettings(settings) {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
}

/**
 * 알림 설정 불러오기
 * @returns {Object} 알림 설정
 */
export function loadNotificationSettings() {
    const defaultSettings = {
        enabled: false,
        budgetWarning: true,    // 예산 80% 경고
        budgetExceeded: true,   // 예산 초과 알림
        paymentDue: true,       // 결제일 D-3 알림
        stakingUnlock: true,    // 스테이킹 언락 D-7 알림
        airdropClaimable: true, // 에어드랍 클레임 알림
        goalAchieved: true      // 목표 달성 알림
    };

    try {
        const saved = localStorage.getItem('notificationSettings');
        if (saved) {
            return { ...defaultSettings, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.error('알림 설정 로드 실패:', e);
    }

    return defaultSettings;
}
