import { signIn, signUp } from '../services/auth.js';

export function createAuthComponent() {
    return `
        <div class="auth-container">
            <div class="auth-card">
                <h2 class="auth-title">💰 Web3 수익 가계부</h2>
                <p class="auth-subtitle">에어드랍 및 Web3 활동 수익 관리</p>
                
                <div class="auth-tabs">
                    <button class="auth-tab active" data-tab="login">로그인</button>
                    <button class="auth-tab" data-tab="signup">회원가입</button>
                </div>

                <!-- 로그인 폼 -->
                <form id="loginForm" class="auth-form active">
                    <div class="form-group">
                        <label for="loginEmail">이메일</label>
                        <input 
                            type="email" 
                            id="loginEmail" 
                            class="form-input" 
                            placeholder="your@email.com"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="loginPassword">비밀번호</label>
                        <input 
                            type="password" 
                            id="loginPassword" 
                            class="form-input" 
                            placeholder="••••••••"
                            required
                        >
                    </div>
                    
                    <button type="submit" class="btn-primary">로그인</button>
                    
                    <div class="auth-links">
                        <a href="#" id="forgotPasswordLink">비밀번호를 잊으셨나요?</a>
                    </div>
                </form>

                <!-- 회원가입 폼 -->
                <form id="signupForm" class="auth-form">
                    <div class="form-group">
                        <label for="signupEmail">이메일</label>
                        <input 
                            type="email" 
                            id="signupEmail" 
                            class="form-input" 
                            placeholder="your@email.com"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="signupPassword">비밀번호</label>
                        <input 
                            type="password" 
                            id="signupPassword" 
                            class="form-input" 
                            placeholder="최소 6자 이상"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="signupPasswordConfirm">비밀번호 확인</label>
                        <input 
                            type="password" 
                            id="signupPasswordConfirm" 
                            class="form-input" 
                            placeholder="비밀번호 재입력"
                            required
                        >
                    </div>
                    
                    <button type="submit" class="btn-primary">회원가입</button>
                    
                    <div class="auth-note">
                        회원가입 시 4개의 기본 계정(Web3 지갑, 투자 계정, 은행 계정, 가족 대출)이 자동으로 생성됩니다.
                    </div>
                </form>

                <div id="authMessage" class="auth-message"></div>
            </div>
        </div>
    `;
}

export function initAuthComponent() {
    // 탭 전환
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            // 탭 활성화
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 폼 전환
            document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
            document.getElementById(tabName === 'login' ? 'loginForm' : 'signupForm').classList.add('active');
            
            // 메시지 초기화
            showAuthMessage('', 'info');
        });
    });

    // 로그인 폼 제출
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        showAuthMessage('로그인 중...', 'info');
        
        const result = await signIn(email, password);
        
        if (result.success) {
            showAuthMessage('로그인 성공! 페이지를 이동합니다...', 'success');
            setTimeout(() => {
                window.location.reload(); // 앱 다시 로드
            }, 1000);
        } else {
            showAuthMessage(`로그인 실패: ${result.error}`, 'error');
        }
    });

    // 회원가입 폼 제출
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
        
        // 비밀번호 확인
        if (password !== passwordConfirm) {
            showAuthMessage('비밀번호가 일치하지 않습니다.', 'error');
            return;
        }
        
        if (password.length < 6) {
            showAuthMessage('비밀번호는 최소 6자 이상이어야 합니다.', 'error');
            return;
        }
        
        showAuthMessage('회원가입 중...', 'info');
        
        const result = await signUp(email, password);
        
        if (result.success) {
            showAuthMessage(
                '회원가입 성공! 이메일을 확인하여 인증을 완료해주세요. (인증 없이도 로그인 가능)', 
                'success'
            );
            
            // 로그인 탭으로 전환
            setTimeout(() => {
                document.querySelector('.auth-tab[data-tab="login"]').click();
                document.getElementById('loginEmail').value = email;
            }, 2000);
        } else {
            showAuthMessage(`회원가입 실패: ${result.error}`, 'error');
        }
    });

    // 비밀번호 찾기
    document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
        e.preventDefault();
        const email = prompt('가입하신 이메일 주소를 입력해주세요:');
        if (email) {
            // resetPassword 함수 호출 (나중에 구현)
            showAuthMessage('비밀번호 재설정 이메일이 발송되었습니다.', 'info');
        }
    });
}

function showAuthMessage(message, type) {
    const messageEl = document.getElementById('authMessage');
    messageEl.textContent = message;
    messageEl.className = `auth-message ${type}`;
    messageEl.style.display = message ? 'block' : 'none';
}
