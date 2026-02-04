import { getCurrentUser, onAuthStateChange } from './services/supabase.js';
import { autoSignUpAndLogin, getAutoLoginInfo, signOut, clearAutoLoginInfo } from './services/auth.js';
import { createAuthComponent, initAuthComponent } from './components/AuthComponent.js';
import { createHomeTab, initHomeTab } from './components/HomeTab.js';
import { createCashflowTab, initCashflowTab } from './components/CashflowTab.js';
import { createAssetManagementTab, initAssetManagementTab } from './components/AssetManagementTab.js';
import { createDashboardTab, initDashboardTab, editTransaction } from './components/DashboardTab.js';
import { createTransactionsTab, initTransactionsTab, refreshTransactions } from './components/TransactionsTab.js';
import { createToolsTab, initToolsTab } from './components/ToolsTab.js';
import { loadCustomCategories } from './utils/constants.js';

class App {
    constructor() {
        this.currentUser = null;
        this.currentTab = 'home';
        this.isAutoLoginEnabled = false; // 실제 이메일 로그인 사용
        this.init();
    }

    async init() {
        // 자동 로그인 시도
        if (this.isAutoLoginEnabled) {
            await this.tryAutoLogin();
        }

        // 인증 상태 확인
        await this.checkAuth();

        // 인증 상태 변경 리스너
        onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session);
            this.handleAuthChange(session);
        });
    }

    async tryAutoLogin() {
        try {
            console.log('🔄 자동 로그인 시도 중...');

            const currentUser = await getCurrentUser();
            if (currentUser) {
                console.log('✅ 이미 로그인됨:', currentUser.email);
                return;
            }

            const autoLoginInfo = getAutoLoginInfo();
            if (autoLoginInfo) {
                console.log('📝 저장된 계정 정보 발견:', autoLoginInfo.email);
            } else {
                console.log('📝 첫 방문: 임시 계정 생성 필요');
            }

            const result = await autoSignUpAndLogin();

            if (result.success) {
                console.log('✅ 자동 로그인 성공!');
            } else {
                console.error('❌ 자동 로그인 실패:', result.error);
            }

        } catch (error) {
            console.error('자동 로그인 에러:', error);
        }
    }

    async checkAuth() {
        const user = await getCurrentUser();

        if (user) {
            this.currentUser = user;
            this.renderApp();
        } else {
            this.renderAuth();
        }
    }

    handleAuthChange(session) {
        if (session) {
            this.currentUser = session.user;
            this.renderApp();
        } else {
            this.currentUser = null;
            this.renderAuth();
        }
    }

    renderAuth() {
        const appContent = document.getElementById('app-content');
        const container = document.querySelector('.container');

        // 헤더와 탭 네비게이션 숨기기
        container.querySelector('h1').style.display = 'none';
        container.querySelector('.subtitle').style.display = 'none';
        container.querySelector('.tab-navigation').style.display = 'none';

        // 인증 컴포넌트 렌더링
        appContent.innerHTML = createAuthComponent();

        // 이벤트 리스너 초기화
        initAuthComponent();
    }

    async renderApp() {
        const container = document.querySelector('.container');

        // 헤더와 탭 네비게이션 표시
        container.querySelector('h1').style.display = 'block';
        container.querySelector('.subtitle').style.display = 'block';
        container.querySelector('.tab-navigation').style.display = 'flex';

        // 사용자 정보 표시 (옵션)
        this.addUserInfo();

        // 탭 네비게이션 이벤트
        this.initTabNavigation();

        // DB에서 커스텀 카테고리 로드 (탭 렌더링 전)
        await loadCustomCategories();

        // 기본 탭 렌더링
        this.switchTab('home');
    }

    addUserInfo() {
        // 기존 사용자 정보 제거
        const existingInfo = document.querySelector('.user-info-bar');
        if (existingInfo) existingInfo.remove();

        const autoLoginInfo = getAutoLoginInfo();
        const isAutoAccount = autoLoginInfo && this.currentUser.email === autoLoginInfo.email;

        const userInfoBar = document.createElement('div');
        userInfoBar.className = 'user-info-bar';
        userInfoBar.innerHTML = `
            <span class="user-email">👤 ${this.currentUser.email}</span>
            ${isAutoAccount ? '<span class="auto-login-badge">자동 로그인</span>' : ''}
            <div class="user-actions">
                ${isAutoAccount ? '<button class="btn-switch-account">계정 전환</button>' : ''}
                <button class="btn-logout">로그아웃</button>
            </div>
        `;

        // 탭 네비게이션 아래에 추가
        const tabNav = document.querySelector('.tab-navigation');
        tabNav.insertAdjacentElement('afterend', userInfoBar);

        // 이벤트 리스너
        const switchBtn = userInfoBar.querySelector('.btn-switch-account');
        if (switchBtn) {
            switchBtn.addEventListener('click', async () => {
                clearAutoLoginInfo();
                await signOut();
                alert('자동 로그인이 해제되었습니다.');
            });
        }

        userInfoBar.querySelector('.btn-logout').addEventListener('click', async () => {
            await signOut();
        });
    }

    initTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    async switchTab(tabName, subtab = null) {
        this.currentTab = tabName;

        // 탭 버튼 활성화
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        // 탭 컨텐츠 렌더링
        const appContent = document.getElementById('app-content');

        switch (tabName) {
            case 'home':
                appContent.innerHTML = createHomeTab();
                await initHomeTab((tab, sub) => this.switchTab(tab, sub));
                break;

            case 'cashflow':
                // 현금흐름은 이제 거래 탭의 서브탭으로 통합됨
                this.switchTab('transactions', 'cashflow');
                return;

            case 'assets':
                appContent.innerHTML = createAssetManagementTab();
                await initAssetManagementTab();
                break;

            case 'transactions':
                // subtab: 'input' (기본) | 'cashflow'
                const transactionSubtab = subtab || 'input';
                appContent.innerHTML = createDashboardTab(transactionSubtab);
                await initDashboardTab(() => {
                    // 홈 탭 새로고침이 필요할 수 있음
                }, transactionSubtab);
                // 거래 탭 버튼 활성화 (현금흐름에서 리다이렉트된 경우)
                document.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.tab === 'transactions') {
                        btn.classList.add('active');
                    }
                });
                break;

            case 'tools':
                appContent.innerHTML = createToolsTab();
                await initToolsTab(subtab || 'budget');
                break;

            default:
                appContent.innerHTML = `
                    <div style="padding: 40px; text-align: center;">
                        <h2>알 수 없는 탭</h2>
                    </div>
                `;
        }
    }
}

export default App;
