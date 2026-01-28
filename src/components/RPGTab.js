import { getRPGData, updateRPGData, getTransactions } from '../services/database.js';
import { calculateTotalAssets } from '../services/analytics.js';
import { formatAmount, formatCurrency, formatFullDate } from '../utils/helpers.js';
import { GOALS } from '../utils/constants.js';

let rpgData = null;

// 마일스톤 정의
const MILESTONES = [
    { days: 7, badge: '🥉', label: '1주일', reward: '첫 발걸음!' },
    { days: 30, badge: '🥈', label: '1개월', reward: '습관 형성 중!' },
    { days: 100, badge: '🥇', label: '100일', reward: '대단해요!' },
    { days: 365, badge: '💎', label: '1년', reward: '전설이 되었다!' }
];

// 선물거래 평균 손실 (월 기준, 예시)
const AVG_MONTHLY_LOSS = 500000; // 50만원

// 레벨 시스템 정의
const LEVEL_CONFIG = {
    expPerLevel: 100, // 레벨당 필요 경험치
    expMultiplier: 1.2, // 레벨업 경험치 증가율
    maxLevel: 100
};

const EXP_REWARDS = {
    addTransaction: 10,      // 거래 추가
    dailyQuest: 20,          // 일일 퀘스트 완료
    futuresDay: 5,           // 선물 중단 1일
    milestone: 50,           // 마일스톤 달성
    loanPayment: 30,         // 대출 상환
    achievementUnlock: 100   // 업적 달성
};

// 업적 시스템 정의
const ACHIEVEMENTS = [
    { id: 'first_transaction', name: '첫 발자국', desc: '첫 번째 거래 기록', icon: '👣', condition: (data, stats) => stats.totalTransactions >= 1 },
    { id: 'transaction_10', name: '꾸준한 기록', desc: '거래 10건 기록', icon: '📝', condition: (data, stats) => stats.totalTransactions >= 10 },
    { id: 'transaction_100', name: '기록의 달인', desc: '거래 100건 기록', icon: '📚', condition: (data, stats) => stats.totalTransactions >= 100 },
    { id: 'income_1m', name: '첫 수입', desc: '총 수입 100만원 달성', icon: '💵', condition: (data, stats) => stats.totalIncome >= 1000000 },
    { id: 'income_10m', name: '수입 성장', desc: '총 수입 1,000만원 달성', icon: '💰', condition: (data, stats) => stats.totalIncome >= 10000000 },
    { id: 'income_100m', name: '억대 수입', desc: '총 수입 1억원 달성', icon: '🏆', condition: (data, stats) => stats.totalIncome >= 100000000 },
    { id: 'futures_7', name: '1주일 클린', desc: '선물 7일 연속 중단', icon: '🌱', condition: (data) => (data.futures_streak || 0) >= 7 },
    { id: 'futures_30', name: '한 달 클린', desc: '선물 30일 연속 중단', icon: '🌿', condition: (data) => (data.futures_streak || 0) >= 30 },
    { id: 'futures_100', name: '100일 클린', desc: '선물 100일 연속 중단', icon: '🌳', condition: (data) => (data.futures_streak || 0) >= 100 },
    { id: 'futures_365', name: '1년 클린', desc: '선물 365일 연속 중단', icon: '🏔️', condition: (data) => (data.futures_streak || 0) >= 365 },
    { id: 'daily_quest_streak_7', name: '일주일 도전', desc: '7일 연속 모든 일일퀘스트 완료', icon: '⭐', condition: (data) => (data.daily_quest_streak || 0) >= 7 },
    { id: 'daily_quest_streak_30', name: '한 달 도전', desc: '30일 연속 모든 일일퀘스트 완료', icon: '🌟', condition: (data) => (data.daily_quest_streak || 0) >= 30 },
    { id: 'level_10', name: '레벨 10', desc: '레벨 10 달성', icon: '🔟', condition: (data) => (data.level || 1) >= 10 },
    { id: 'level_25', name: '레벨 25', desc: '레벨 25 달성', icon: '2️⃣5️⃣', condition: (data) => (data.level || 1) >= 25 },
    { id: 'level_50', name: '레벨 50', desc: '레벨 50 달성', icon: '5️⃣0️⃣', condition: (data) => (data.level || 1) >= 50 },
    { id: 'bank_loan_50', name: '절반 상환', desc: '은행 대출 50% 상환', icon: '🏦', condition: (data) => (data.bank_loan_paid || 0) >= GOALS.BANK_LOAN * 0.5 },
    { id: 'bank_loan_100', name: '대출 청산', desc: '은행 대출 100% 상환', icon: '🎊', condition: (data) => (data.bank_loan_paid || 0) >= GOALS.BANK_LOAN }
];

export function createRPGTab() {
    return `
        <div class="rpg-container">
            <!-- 레벨 & 경험치 섹션 -->
            <div class="level-section">
                <div class="level-display">
                    <div class="level-badge" id="levelBadge">
                        <span class="level-number" id="levelNumber">1</span>
                        <span class="level-label">LV</span>
                    </div>
                    <div class="level-info">
                        <div class="level-title">재테크 마스터</div>
                        <div class="exp-bar-container">
                            <div class="exp-bar">
                                <div class="exp-bar-fill" id="expBarFill" style="width: 0%"></div>
                            </div>
                            <span class="exp-text" id="expText">0 / 100 EXP</span>
                        </div>
                    </div>
                    <div class="level-stats">
                        <div class="stat-item">
                            <span class="stat-icon">📊</span>
                            <span class="stat-value" id="totalExpStat">0</span>
                            <span class="stat-label">총 경험치</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">🏅</span>
                            <span class="stat-value" id="achievementCount">0/17</span>
                            <span class="stat-label">업적</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Quest -->
            <div class="main-quest">
                <h2>🎯 Main Quest: 500억 자산 달성</h2>
                <div class="main-quest-progress">
                    <div class="main-quest-fill" id="mainQuestProgress" style="width: 0.1%">
                        0.1%
                    </div>
                </div>
                <div class="main-quest-stats">
                    <span>현재: <span id="currentAssets">0원</span></span>
                    <span>목표: 500억원</span>
                </div>
            </div>

            <!-- 선물 중독 보스 (개선됨) -->
            <div class="boss-card futures">
                <div class="boss-header">
                    <div class="boss-title danger">🔥 선물 중독 보스</div>
                </div>

                <!-- 시작 날짜 표시 -->
                <div class="futures-start-info" id="futuresStartInfo">
                    <span class="start-date-label">🗓️ 시작일:</span>
                    <span class="start-date-value" id="futuresStartDate">-</span>
                </div>

                <div class="streak-display">
                    <div class="streak-number" id="streakNumber">0</div>
                    <div class="streak-label">연속 중단 일수</div>
                    <div class="max-streak">
                        🏆 최장 기록: <span id="maxStreak">0</span>일
                    </div>
                </div>

                <!-- 목표 설정 -->
                <div class="goal-section">
                    <div class="goal-header">
                        <span>🎯 목표:</span>
                        <select id="futuresGoalSelect" class="goal-select">
                            <option value="7">7일</option>
                            <option value="30" selected>30일</option>
                            <option value="100">100일</option>
                            <option value="365">365일</option>
                        </select>
                    </div>
                    <div class="goal-progress">
                        <div class="goal-bar">
                            <div class="goal-bar-fill" id="goalProgressBar" style="width: 0%"></div>
                        </div>
                        <span class="goal-percent" id="goalPercent">0%</span>
                    </div>
                </div>

                <!-- 마일스톤 뱃지 -->
                <div class="milestone-section">
                    <div class="milestone-title">🏅 마일스톤</div>
                    <div class="milestone-badges" id="milestoneBadges">
                        ${MILESTONES.map(m => `
                            <div class="milestone-badge locked" data-days="${m.days}" title="${m.label}: ${m.reward}">
                                <span class="badge-icon">${m.badge}</span>
                                <span class="badge-days">${m.days}일</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- 절약 예상 금액 -->
                <div class="savings-section">
                    <div class="savings-title">💰 절약 예상 금액</div>
                    <div class="savings-amount" id="savingsAmount">0원</div>
                    <div class="savings-detail">선물거래 중단으로 아낀 금액 (월 평균 손실 기준)</div>
                </div>

                <!-- 리셋 히스토리 -->
                <div class="history-section">
                    <div class="history-header">
                        <span class="history-title">📜 리셋 히스토리</span>
                        <button class="history-toggle" id="historyToggle">펼치기</button>
                    </div>
                    <div class="history-list" id="historyList" style="display: none;">
                        <div class="history-empty">기록이 없습니다</div>
                    </div>
                </div>

                <button class="reset-button" id="resetStreakBtn">
                    ⚠️ 리셋 (선물 매매 시)
                </button>
            </div>

            <!-- 은행 대출 보스 -->
            <div class="boss-card debt">
                <div class="boss-header">
                    <div class="boss-title">🏦 은행 대출 보스</div>
                </div>

                <div class="hp-bar-container">
                    <div class="hp-bar-label">
                        <span>현재 HP (잔액)</span>
                        <span id="bankLoanRemaining">4.1억원</span>
                    </div>
                    <div class="hp-bar">
                        <div class="hp-bar-fill" id="bankLoanBar" style="width: 100%">
                            100%
                        </div>
                    </div>
                </div>

                <div class="debt-info">
                    <div class="debt-stat">
                        <div class="debt-stat-label">총 대출금</div>
                        <div class="debt-stat-value">${formatCurrency(GOALS.BANK_LOAN)}원</div>
                    </div>
                    <div class="debt-stat">
                        <div class="debt-stat-label">월 데미지</div>
                        <div class="debt-stat-value" style="color: #dc3545;">-210만원</div>
                    </div>
                    <div class="debt-stat">
                        <div class="debt-stat-label">상환 완료</div>
                        <div class="debt-stat-value" id="bankLoanPaid">0원</div>
                    </div>
                </div>

                <div class="debt-actions">
                    <button class="debt-action-btn" id="payBankLoanBtn">💰 대출 상환</button>
                </div>
            </div>

            <!-- 부모님 대출 보스 -->
            <div class="boss-card debt">
                <div class="boss-header">
                    <div class="boss-title">👨‍👩‍👧 부모님 대출 보스</div>
                </div>

                <div class="hp-bar-container">
                    <div class="hp-bar-label">
                        <span>현재 HP (잔액)</span>
                        <span id="parentLoanRemaining">1.5억원</span>
                    </div>
                    <div class="hp-bar">
                        <div class="hp-bar-fill" id="parentLoanBar" style="width: 100%">
                            100%
                        </div>
                    </div>
                </div>

                <div class="debt-info">
                    <div class="debt-stat">
                        <div class="debt-stat-label">총 대출금</div>
                        <div class="debt-stat-value">${formatCurrency(GOALS.PARENT_LOAN)}원</div>
                    </div>
                    <div class="debt-stat">
                        <div class="debt-stat-label">월 데미지</div>
                        <div class="debt-stat-value" style="color: #dc3545;">-80만원</div>
                    </div>
                    <div class="debt-stat">
                        <div class="debt-stat-label">상환 완료</div>
                        <div class="debt-stat-value" id="parentLoanPaid">0원</div>
                    </div>
                </div>

                <div class="debt-actions">
                    <button class="debt-action-btn" id="payParentLoanBtn">💰 대출 상환</button>
                </div>
            </div>

            <!-- Daily Quest -->
            <div class="daily-quests">
                <h2>📝 Daily Quest</h2>
                <div class="quest-item" id="quest-noFutures">
                    <div class="quest-checkbox"></div>
                    <div class="quest-text">선물 매매 0회 유지</div>
                    <div class="quest-exp">+${EXP_REWARDS.dailyQuest} EXP</div>
                </div>
                <div class="quest-item" id="quest-vibeCoding">
                    <div class="quest-checkbox"></div>
                    <div class="quest-text">바이브 코딩 1.5시간</div>
                    <div class="quest-exp">+${EXP_REWARDS.dailyQuest} EXP</div>
                </div>
                <div class="quest-item" id="quest-xPosting">
                    <div class="quest-checkbox"></div>
                    <div class="quest-text">X 포스팅 1회</div>
                    <div class="quest-exp">+${EXP_REWARDS.dailyQuest} EXP</div>
                </div>
                <div class="quest-item" id="quest-mentalCheck">
                    <div class="quest-checkbox"></div>
                    <div class="quest-text">멘탈 체크 완료</div>
                    <div class="quest-exp">+${EXP_REWARDS.dailyQuest} EXP</div>
                </div>
                <div class="quest-streak-display">
                    <span class="streak-icon">🔥</span>
                    <span>일일퀘스트 연속 달성:</span>
                    <span class="streak-count" id="dailyQuestStreak">0</span>
                    <span>일</span>
                </div>
            </div>

            <!-- 업적 -->
            <div class="achievements-section">
                <div class="achievements-header">
                    <h2>🏆 업적</h2>
                    <div class="achievements-progress" id="achievementsProgress">0 / ${ACHIEVEMENTS.length}</div>
                </div>
                <div class="achievements-grid" id="achievementsGrid">
                    ${ACHIEVEMENTS.map(a => `
                        <div class="achievement-item locked" id="achievement-${a.id}" title="${a.desc}">
                            <div class="achievement-icon">${a.icon}</div>
                            <div class="achievement-info">
                                <div class="achievement-name">${a.name}</div>
                                <div class="achievement-desc">${a.desc}</div>
                            </div>
                            <div class="achievement-badge">
                                <span class="lock-icon">🔒</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

export async function initRPGTab() {
    // 데이터 로드
    await loadRPGData();

    // 매일 업데이트 체크
    checkDailyUpdate();

    // 선물 중독 리셋 버튼
    document.getElementById('resetStreakBtn').addEventListener('click', resetFuturesStreak);

    // 목표 설정 변경
    document.getElementById('futuresGoalSelect').addEventListener('change', handleGoalChange);

    // 히스토리 토글
    document.getElementById('historyToggle').addEventListener('click', toggleHistory);

    // 대출 상환 버튼
    document.getElementById('payBankLoanBtn').addEventListener('click', () => payLoan('bank'));
    document.getElementById('payParentLoanBtn').addEventListener('click', () => payLoan('parent'));

    // Daily Quest 토글
    document.querySelectorAll('.quest-item').forEach(item => {
        item.addEventListener('click', () => {
            const questName = item.id.replace('quest-', '');
            toggleQuest(questName);
        });
    });
}

async function loadRPGData() {
    try {
        // RPG 데이터 로드
        const rpgResult = await getRPGData();
        if (rpgResult.success && rpgResult.data) {
            rpgData = rpgResult.data;
        } else {
            // 기본값 설정
            rpgData = getDefaultRPGData();
        }

        // LocalStorage에서 추가 데이터 로드 (Supabase 스키마에 없는 필드들)
        loadLocalRPGExtras();

        // 총 자산 로드
        const txResult = await getTransactions();
        let totalAssets = 0;
        if (txResult.success && txResult.data) {
            totalAssets = calculateTotalAssets(txResult.data);
        }

        updateRPGDisplay(totalAssets);
    } catch (error) {
        console.error('RPG 데이터 로드 에러:', error);
    }
}

function getDefaultRPGData() {
    return {
        futures_streak: 0,
        futures_max_streak: 0,
        futures_last_date: new Date().toISOString().split('T')[0],
        futures_start_date: null,
        futures_goal_days: 30,
        futures_reset_history: [],
        bank_loan_paid: 0,
        parent_loan_paid: 0,
        daily_quests: {
            date: new Date().toISOString().split('T')[0],
            noFutures: true,
            vibeCoding: false,
            xPosting: false,
            mentalCheck: false
        },
        // 레벨 시스템
        level: 1,
        exp: 0,
        total_exp: 0,
        // 업적
        unlocked_achievements: [],
        // 일일퀘스트 연속 달성
        daily_quest_streak: 0
    };
}

function loadLocalRPGExtras() {
    // Supabase에 없는 추가 필드들을 LocalStorage에서 로드
    const extras = JSON.parse(localStorage.getItem('rpg_extras') || '{}');

    if (!rpgData.futures_start_date) {
        rpgData.futures_start_date = extras.futures_start_date || null;
    }
    if (!rpgData.futures_goal_days) {
        rpgData.futures_goal_days = extras.futures_goal_days || 30;
    }
    if (!rpgData.futures_reset_history) {
        rpgData.futures_reset_history = extras.futures_reset_history || [];
    }
    // 레벨/업적 데이터
    if (!rpgData.level) {
        rpgData.level = extras.level || 1;
    }
    if (!rpgData.exp) {
        rpgData.exp = extras.exp || 0;
    }
    if (!rpgData.total_exp) {
        rpgData.total_exp = extras.total_exp || 0;
    }
    if (!rpgData.unlocked_achievements) {
        rpgData.unlocked_achievements = extras.unlocked_achievements || [];
    }
    if (!rpgData.daily_quest_streak) {
        rpgData.daily_quest_streak = extras.daily_quest_streak || 0;
    }
}

function saveLocalRPGExtras() {
    // 추가 필드들을 LocalStorage에 저장
    const extras = {
        futures_start_date: rpgData.futures_start_date,
        futures_goal_days: rpgData.futures_goal_days,
        futures_reset_history: rpgData.futures_reset_history,
        // 레벨/업적 데이터
        level: rpgData.level,
        exp: rpgData.exp,
        total_exp: rpgData.total_exp,
        unlocked_achievements: rpgData.unlocked_achievements,
        daily_quest_streak: rpgData.daily_quest_streak
    };
    localStorage.setItem('rpg_extras', JSON.stringify(extras));
}

function updateRPGDisplay(totalAssets = 0) {
    if (!rpgData) return;

    // Main Quest 진행률
    const progressPercent = Math.min((totalAssets / GOALS.MAIN_QUEST) * 100, 100);
    const progressEl = document.getElementById('mainQuestProgress');
    progressEl.style.width = `${Math.max(progressPercent, 0.1)}%`;
    progressEl.textContent = `${progressPercent.toFixed(2)}%`;
    document.getElementById('currentAssets').textContent = formatAmount(totalAssets);

    // 선물 중독 보스
    const streak = rpgData.futures_streak || 0;
    document.getElementById('streakNumber').textContent = streak;
    document.getElementById('maxStreak').textContent = rpgData.futures_max_streak || 0;

    // 시작 날짜
    const startDateEl = document.getElementById('futuresStartDate');
    if (rpgData.futures_start_date) {
        startDateEl.textContent = formatStartDate(rpgData.futures_start_date);
    } else if (streak > 0) {
        // 시작 날짜가 없으면 현재 스트릭 기반으로 계산
        const estimatedStart = new Date();
        estimatedStart.setDate(estimatedStart.getDate() - streak);
        rpgData.futures_start_date = estimatedStart.toISOString().split('T')[0];
        startDateEl.textContent = formatStartDate(rpgData.futures_start_date);
        saveLocalRPGExtras();
    } else {
        startDateEl.textContent = '아직 시작 안 함';
    }

    // 목표 진행률
    const goalDays = rpgData.futures_goal_days || 30;
    document.getElementById('futuresGoalSelect').value = goalDays;
    const goalPercent = Math.min((streak / goalDays) * 100, 100);
    document.getElementById('goalProgressBar').style.width = `${goalPercent}%`;
    document.getElementById('goalPercent').textContent = `${goalPercent.toFixed(0)}%`;

    // 마일스톤 뱃지 업데이트
    updateMilestones(streak);

    // 절약 예상 금액
    const savedAmount = Math.floor((streak / 30) * AVG_MONTHLY_LOSS);
    document.getElementById('savingsAmount').textContent = formatAmount(savedAmount);

    // 리셋 히스토리
    updateResetHistory();

    // 은행 대출
    const bankPaid = rpgData.bank_loan_paid || 0;
    const bankRemaining = GOALS.BANK_LOAN - bankPaid;
    const bankPercent = (bankRemaining / GOALS.BANK_LOAN) * 100;
    document.getElementById('bankLoanRemaining').textContent = `${formatCurrency(bankRemaining)}원`;
    document.getElementById('bankLoanBar').style.width = `${bankPercent}%`;
    document.getElementById('bankLoanBar').textContent = `${bankPercent.toFixed(1)}%`;
    document.getElementById('bankLoanPaid').textContent = formatAmount(bankPaid);

    // 부모님 대출
    const parentPaid = rpgData.parent_loan_paid || 0;
    const parentRemaining = GOALS.PARENT_LOAN - parentPaid;
    const parentPercent = (parentRemaining / GOALS.PARENT_LOAN) * 100;
    document.getElementById('parentLoanRemaining').textContent = `${formatCurrency(parentRemaining)}원`;
    document.getElementById('parentLoanBar').style.width = `${parentPercent}%`;
    document.getElementById('parentLoanBar').textContent = `${parentPercent.toFixed(1)}%`;
    document.getElementById('parentLoanPaid').textContent = formatAmount(parentPaid);

    // Daily Quest
    const quests = rpgData.daily_quests || {};
    updateQuestDisplay('noFutures', quests.noFutures);
    updateQuestDisplay('vibeCoding', quests.vibeCoding);
    updateQuestDisplay('xPosting', quests.xPosting);
    updateQuestDisplay('mentalCheck', quests.mentalCheck);

    // 일일퀘스트 연속 달성
    document.getElementById('dailyQuestStreak').textContent = rpgData.daily_quest_streak || 0;

    // 레벨 시스템
    updateLevelDisplay();

    // 업적 시스템 (비동기로 실행)
    updateAchievements();
}

function updateLevelDisplay() {
    const level = rpgData.level || 1;
    const exp = rpgData.exp || 0;
    const totalExp = rpgData.total_exp || 0;
    const expNeeded = calculateExpForLevel(level);

    document.getElementById('levelNumber').textContent = level;
    document.getElementById('expText').textContent = `${exp} / ${expNeeded} EXP`;
    document.getElementById('totalExpStat').textContent = totalExp.toLocaleString();

    const expPercent = (exp / expNeeded) * 100;
    document.getElementById('expBarFill').style.width = `${expPercent}%`;

    // 업적 개수
    const unlockedCount = (rpgData.unlocked_achievements || []).length;
    document.getElementById('achievementCount').textContent = `${unlockedCount}/${ACHIEVEMENTS.length}`;
}

function calculateExpForLevel(level) {
    // 레벨에 따라 필요 경험치 증가
    return Math.floor(LEVEL_CONFIG.expPerLevel * Math.pow(LEVEL_CONFIG.expMultiplier, level - 1));
}

async function gainExp(amount, reason = '') {
    if (!rpgData) return;

    rpgData.exp = (rpgData.exp || 0) + amount;
    rpgData.total_exp = (rpgData.total_exp || 0) + amount;

    // 레벨업 체크
    let leveledUp = false;
    while (rpgData.exp >= calculateExpForLevel(rpgData.level) && rpgData.level < LEVEL_CONFIG.maxLevel) {
        rpgData.exp -= calculateExpForLevel(rpgData.level);
        rpgData.level += 1;
        leveledUp = true;
    }

    saveLocalRPGExtras();
    updateLevelDisplay();

    if (leveledUp) {
        // 레벨업 알림
        showLevelUpNotification(rpgData.level);
        // 레벨 업적 체크
        updateAchievements();
    }

    if (reason) {
        showExpGainNotification(amount, reason);
    }
}

function showExpGainNotification(amount, reason) {
    // 간단한 EXP 획득 알림
    const notification = document.createElement('div');
    notification.className = 'exp-notification';
    notification.innerHTML = `+${amount} EXP <span class="exp-reason">${reason}</span>`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function showLevelUpNotification(level) {
    const notification = document.createElement('div');
    notification.className = 'levelup-notification';
    notification.innerHTML = `
        <div class="levelup-icon">🎉</div>
        <div class="levelup-text">LEVEL UP!</div>
        <div class="levelup-level">Lv. ${level}</div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

async function updateAchievements() {
    if (!rpgData) return;

    // 통계 데이터 가져오기
    let stats = { totalTransactions: 0, totalIncome: 0, totalExpense: 0 };
    try {
        const txResult = await getTransactions();
        if (txResult.success && txResult.data) {
            const transactions = txResult.data;
            stats.totalTransactions = transactions.length;
            stats.totalIncome = transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
            stats.totalExpense = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
        }
    } catch (error) {
        console.error('통계 데이터 로드 에러:', error);
    }

    // 업적 체크
    const unlockedIds = rpgData.unlocked_achievements || [];
    let newUnlocks = [];

    ACHIEVEMENTS.forEach(achievement => {
        const achievementEl = document.getElementById(`achievement-${achievement.id}`);
        if (!achievementEl) return;

        if (unlockedIds.includes(achievement.id)) {
            // 이미 해제됨
            achievementEl.classList.remove('locked');
            achievementEl.classList.add('unlocked');
            achievementEl.querySelector('.lock-icon').textContent = '✅';
        } else if (achievement.condition(rpgData, stats)) {
            // 새로 해제!
            achievementEl.classList.remove('locked');
            achievementEl.classList.add('unlocked');
            achievementEl.querySelector('.lock-icon').textContent = '✅';
            newUnlocks.push(achievement);
            unlockedIds.push(achievement.id);
        }
    });

    // 새 업적 해제 알림 및 경험치
    if (newUnlocks.length > 0) {
        rpgData.unlocked_achievements = unlockedIds;
        saveLocalRPGExtras();

        for (const achievement of newUnlocks) {
            showAchievementNotification(achievement);
            await gainExp(EXP_REWARDS.achievementUnlock, `업적: ${achievement.name}`);
        }

        updateLevelDisplay();
    }

    // 업적 진행률 업데이트
    document.getElementById('achievementsProgress').textContent =
        `${unlockedIds.length} / ${ACHIEVEMENTS.length}`;
}

function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-unlock-icon">${achievement.icon}</div>
        <div class="achievement-unlock-text">
            <div class="achievement-unlock-title">업적 달성!</div>
            <div class="achievement-unlock-name">${achievement.name}</div>
        </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function formatStartDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
}

function updateMilestones(streak) {
    MILESTONES.forEach(milestone => {
        const badgeEl = document.querySelector(`.milestone-badge[data-days="${milestone.days}"]`);
        if (badgeEl) {
            if (streak >= milestone.days) {
                badgeEl.classList.remove('locked');
                badgeEl.classList.add('unlocked');
            } else {
                badgeEl.classList.remove('unlocked');
                badgeEl.classList.add('locked');
            }
        }
    });
}

function updateResetHistory() {
    const historyList = document.getElementById('historyList');
    const history = rpgData.futures_reset_history || [];

    if (history.length === 0) {
        historyList.innerHTML = '<div class="history-empty">기록이 없습니다 (좋은 거예요!)</div>';
    } else {
        historyList.innerHTML = history
            .slice(-5) // 최근 5개만 표시
            .reverse()
            .map((item, index) => `
                <div class="history-item">
                    <span class="history-date">${formatStartDate(item.date)}</span>
                    <span class="history-streak">${item.streak}일 연속 후 리셋</span>
                </div>
            `).join('');
    }
}

function toggleHistory() {
    const historyList = document.getElementById('historyList');
    const toggleBtn = document.getElementById('historyToggle');

    if (historyList.style.display === 'none') {
        historyList.style.display = 'block';
        toggleBtn.textContent = '접기';
    } else {
        historyList.style.display = 'none';
        toggleBtn.textContent = '펼치기';
    }
}

function handleGoalChange(e) {
    rpgData.futures_goal_days = parseInt(e.target.value);
    saveLocalRPGExtras();
    updateRPGDisplay();
}

function updateQuestDisplay(questName, completed) {
    const questEl = document.getElementById(`quest-${questName}`);
    if (questEl) {
        if (completed) {
            questEl.classList.add('completed');
        } else {
            questEl.classList.remove('completed');
        }
    }
}

async function checkDailyUpdate() {
    if (!rpgData) return;

    const today = new Date().toISOString().split('T')[0];
    const lastDate = rpgData.futures_last_date || rpgData.daily_quests?.date;

    if (today !== lastDate) {
        // 날짜 바뀜 → 연속 일수 +1
        rpgData.futures_streak = (rpgData.futures_streak || 0) + 1;
        rpgData.futures_last_date = today;

        // 시작 날짜가 없으면 설정
        if (!rpgData.futures_start_date) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - rpgData.futures_streak + 1);
            rpgData.futures_start_date = startDate.toISOString().split('T')[0];
        }

        // 최장 기록 갱신
        if (rpgData.futures_streak > (rpgData.futures_max_streak || 0)) {
            rpgData.futures_max_streak = rpgData.futures_streak;
        }

        // Daily Quest 리셋
        rpgData.daily_quests = {
            date: today,
            noFutures: true,
            vibeCoding: false,
            xPosting: false,
            mentalCheck: false
        };

        await saveRPGData();
        saveLocalRPGExtras();
        updateRPGDisplay();
    }
}

async function resetFuturesStreak() {
    if (!rpgData) return;

    const currentStreak = rpgData.futures_streak || 0;

    if (currentStreak === 0) {
        alert('이미 0일입니다.');
        return;
    }

    const confirmed = confirm(`⚠️ 경고!\n\n${currentStreak}일간의 기록이 사라집니다.\n정말로 리셋하시겠습니까?`);

    if (confirmed) {
        // 히스토리에 추가
        if (!rpgData.futures_reset_history) {
            rpgData.futures_reset_history = [];
        }
        rpgData.futures_reset_history.push({
            date: new Date().toISOString().split('T')[0],
            streak: currentStreak
        });

        // 리셋
        rpgData.futures_streak = 0;
        rpgData.futures_start_date = null;
        if (rpgData.daily_quests) {
            rpgData.daily_quests.noFutures = false;
        }

        await saveRPGData();
        saveLocalRPGExtras();
        updateRPGDisplay();
        alert('리셋되었습니다. 다시 시작하세요! 💪');
    }
}

async function toggleQuest(questName) {
    if (!rpgData) return;

    if (!rpgData.daily_quests) {
        rpgData.daily_quests = {
            date: new Date().toISOString().split('T')[0],
            noFutures: true,
            vibeCoding: false,
            xPosting: false,
            mentalCheck: false
        };
    }

    const wasCompleted = rpgData.daily_quests[questName];
    rpgData.daily_quests[questName] = !wasCompleted;

    // 퀘스트 완료 시 경험치 지급
    if (!wasCompleted) {
        const questNames = {
            noFutures: '선물 중단',
            vibeCoding: '바이브 코딩',
            xPosting: 'X 포스팅',
            mentalCheck: '멘탈 체크'
        };
        await gainExp(EXP_REWARDS.dailyQuest, questNames[questName] || '일일퀘스트');
    }

    // 모든 일일퀘스트 완료 체크
    const allCompleted = ['noFutures', 'vibeCoding', 'xPosting', 'mentalCheck']
        .every(q => rpgData.daily_quests[q]);

    if (allCompleted && !rpgData.daily_quests.allCompletedToday) {
        rpgData.daily_quests.allCompletedToday = true;
        rpgData.daily_quest_streak = (rpgData.daily_quest_streak || 0) + 1;
        await gainExp(EXP_REWARDS.dailyQuest * 2, '일일퀘스트 올클리어');
    }

    await saveRPGData();
    saveLocalRPGExtras();
    updateRPGDisplay();
}

async function payLoan(loanType) {
    const amount = prompt('상환 금액을 입력하세요 (원):');
    if (!amount) return;

    const payAmount = parseInt(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
        alert('올바른 금액을 입력해주세요.');
        return;
    }

    if (loanType === 'bank') {
        rpgData.bank_loan_paid = (rpgData.bank_loan_paid || 0) + payAmount;
        if (rpgData.bank_loan_paid > GOALS.BANK_LOAN) {
            rpgData.bank_loan_paid = GOALS.BANK_LOAN;
        }
    } else if (loanType === 'parent') {
        rpgData.parent_loan_paid = (rpgData.parent_loan_paid || 0) + payAmount;
        if (rpgData.parent_loan_paid > GOALS.PARENT_LOAN) {
            rpgData.parent_loan_paid = GOALS.PARENT_LOAN;
        }
    }

    await saveRPGData();
    updateRPGDisplay();
    alert(`${formatAmount(payAmount)} 상환 완료! 🎉`);
}

async function saveRPGData() {
    try {
        await updateRPGData(rpgData);
    } catch (error) {
        console.error('RPG 데이터 저장 에러:', error);
    }
}
