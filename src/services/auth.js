import { supabase } from './supabase.js';
import { createDefaultAccounts, createDefaultRPGData, getAccounts, getRPGData } from './database.js';

// 기본 데이터 존재 확인 및 생성
async function ensureDefaultDataExists(userId) {
    try {
        // 계정 확인
        const accountsResult = await getAccounts();
        if (!accountsResult.success || !accountsResult.data || accountsResult.data.length === 0) {
            console.log('🔄 기본 계정이 없어서 생성합니다...');
            await createDefaultAccounts(userId);
        }

        // RPG 데이터 확인
        const rpgResult = await getRPGData();
        if (!rpgResult.success || !rpgResult.data) {
            console.log('🔄 RPG 데이터가 없어서 생성합니다...');
            await createDefaultRPGData(userId);
        }
    } catch (error) {
        console.warn('기본 데이터 확인 중 오류:', error);
    }
}

// ============================================
// 자동 로그인 (Auto Login)
// ============================================

const AUTO_LOGIN_KEY = 'web3_budget_auto_login';

// 자동 로그인 정보 저장
function saveAutoLoginInfo(email, password) {
    const autoLoginData = {
        email,
        password,
        createdAt: new Date().toISOString()
    };
    localStorage.setItem(AUTO_LOGIN_KEY, JSON.stringify(autoLoginData));
}

// 자동 로그인 정보 가져오기
export function getAutoLoginInfo() {
    const data = localStorage.getItem(AUTO_LOGIN_KEY);
    return data ? JSON.parse(data) : null;
}

// 자동 로그인 정보 삭제
export function clearAutoLoginInfo() {
    localStorage.removeItem(AUTO_LOGIN_KEY);
}

// 임시 계정 자동 생성 및 로그인
export async function autoSignUpAndLogin() {
    try {
        // 이미 자동 로그인 정보가 있는지 확인
        const existingInfo = getAutoLoginInfo();

        if (existingInfo) {
            // 기존 계정으로 로그인 시도
            const result = await signIn(existingInfo.email, existingInfo.password);
            if (result.success) {
                console.log('✅ 자동 로그인 성공:', existingInfo.email);

                // 기존 계정이라도 기본 데이터가 없을 수 있으므로 확인 후 생성
                const userId = result.data?.user?.id;
                if (userId) {
                    await ensureDefaultDataExists(userId);
                }

                return result;
            } else {
                console.log('⚠️ 기존 계정 로그인 실패, 새 계정 생성');
                clearAutoLoginInfo();
            }
        }

        // 임시 계정 생성
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const tempEmail = `user_${timestamp}_${randomId}@web3budget.local`;
        const tempPassword = `temp_${timestamp}_${randomId}`;

        console.log('🔄 임시 계정 생성 중...');

        // 회원가입 (signUp에서 기본 계정/RPG 데이터 생성)
        const signUpResult = await signUp(tempEmail, tempPassword, {
            display_name: '사용자',
            is_auto_created: true
        });

        if (!signUpResult.success) {
            throw new Error(signUpResult.error);
        }

        console.log('✅ 임시 계정 생성 완료:', tempEmail);

        // 자동 로그인 정보 저장
        saveAutoLoginInfo(tempEmail, tempPassword);

        // 자동 로그인
        const signInResult = await signIn(tempEmail, tempPassword);

        if (signInResult.success) {
            console.log('✅ 자동 로그인 완료');
        }

        return signInResult;

    } catch (error) {
        console.error('자동 로그인 실패:', error);
        return { success: false, error: error.message };
    }
}

// 회원가입
export async function signUp(email, password, userData = {}) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData // 추가 사용자 정보
            }
        });

        if (error) throw error;

        // 사용자 생성 성공 시 기본 데이터 생성 (트리거 대신 클라이언트에서 처리)
        if (data?.user?.id) {
            const userId = data.user.id;

            // 기본 계정 생성
            await createDefaultAccounts(userId);

            // RPG 데이터 초기화
            await createDefaultRPGData(userId);
        }

        return { success: true, data };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
    }
}

// 로그인
export async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
    }
}

// 로그아웃
export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
    }
}

// 비밀번호 재설정 요청
export async function resetPassword(email) {
    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Reset password error:', error);
        return { success: false, error: error.message };
    }
}

// 비밀번호 업데이트
export async function updatePassword(newPassword) {
    try {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Update password error:', error);
        return { success: false, error: error.message };
    }
}

// 사용자 프로필 업데이트
export async function updateProfile(updates) {
    try {
        const { data, error } = await supabase.auth.updateUser({
            data: updates
        });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Update profile error:', error);
        return { success: false, error: error.message };
    }
}

// 이메일 인증 상태 확인
export async function checkEmailVerification() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return user?.email_confirmed_at !== null;
    } catch (error) {
        console.error('Check email verification error:', error);
        return false;
    }
}

// 인증 확인 이메일 재전송
export async function resendVerificationEmail(email) {
    try {
        const { data, error } = await supabase.auth.resend({
            type: 'signup',
            email: email
        });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Resend verification email error:', error);
        return { success: false, error: error.message };
    }
}
