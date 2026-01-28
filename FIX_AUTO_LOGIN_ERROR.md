# 🚨 긴급 수정 필요: 자동 로그인 에러 해결

## 문제 상황
- 회원가입 시 "Database error saving new user" 에러 발생
- Supabase 트리거가 auth.users 테이블에 접근 불가 (권한 문제)
- 자동 로그인이 작동하지 않음

---

## 해결 방법

### 1단계: Supabase 트리거 제거

SQL Editor에서 실행:
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_default_accounts();
```

### 2단계: 클라이언트에서 계정 생성하도록 수정

---

## 📝 수정할 파일들

### 1. `src/services/database.js` 수정

**추가할 함수:**

```javascript
// 기본 계정 4개 생성
export async function createDefaultAccounts() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const accounts = [
            { user_id: user.id, name: 'Web3 지갑', type: 'web3', balance: 0 },
            { user_id: user.id, name: '투자 계정', type: 'investment', balance: 0 },
            { user_id: user.id, name: '은행 계정', type: 'bank', balance: 0 },
            { user_id: user.id, name: '가족 대출', type: 'family', balance: 0 }
        ];

        const { data, error } = await supabase
            .from('accounts')
            .insert(accounts)
            .select();

        if (error) throw error;

        console.log('✅ 기본 계정 4개 생성 완료');
        return { success: true, data };
    } catch (error) {
        console.error('기본 계정 생성 실패:', error);
        return { success: false, error: error.message };
    }
}

// RPG 데이터 초기화
export async function createDefaultRPGData() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const rpgData = {
            user_id: user.id,
            futures_current_streak: 0,
            futures_max_streak: 0,
            futures_last_check_date: new Date().toISOString().split('T')[0],
            bank_loan_total: 410000000,
            bank_loan_paid: 0,
            bank_loan_monthly: 2100000,
            parent_loan_total: 150000000,
            parent_loan_paid: 0,
            parent_loan_monthly: 800000,
            daily_quest_date: new Date().toISOString().split('T')[0],
            daily_quest_no_futures: true,
            daily_quest_vibe_coding: false,
            daily_quest_x_posting: false,
            daily_quest_mental_check: false,
            level: 1,
            exp: 0
        };

        const { data, error } = await supabase
            .from('rpg_data')
            .insert(rpgData)
            .select();

        if (error) throw error;

        console.log('✅ RPG 데이터 초기화 완료');
        return { success: true, data };
    } catch (error) {
        console.error('RPG 데이터 생성 실패:', error);
        return { success: false, error: error.message };
    }
}
```

---

### 2. `src/services/auth.js` 수정

**signUp 함수를 다음과 같이 수정:**

```javascript
// 회원가입
export async function signUp(email, password, userData = {}) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });

        if (error) throw error;

        // 회원가입 성공 후 기본 데이터 생성
        if (data.user) {
            console.log('✅ 회원가입 성공, 기본 데이터 생성 중...');
            
            // database.js에서 함수 import
            const { createDefaultAccounts, createDefaultRPGData } = await import('./database.js');
            
            // 기본 계정 생성
            await createDefaultAccounts();
            
            // RPG 데이터 생성
            await createDefaultRPGData();
            
            console.log('✅ 모든 초기 데이터 생성 완료');
        }

        return { success: true, data };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
    }
}
```

**autoSignUpAndLogin 함수도 수정:**

```javascript
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

        // 회원가입 (이제 기본 데이터도 자동 생성됨)
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
```

---

## ✅ 테스트 방법

1. 파일 수정 후 저장
2. 브라우저에서 localStorage 삭제:
   - F12 → Application → Local Storage → localhost:5173 → 우클릭 → Clear
3. 페이지 새로고침
4. 콘솔 확인:
   ```
   🔄 임시 계정 생성 중...
   ✅ 회원가입 성공, 기본 데이터 생성 중...
   ✅ 기본 계정 4개 생성 완료
   ✅ RPG 데이터 초기화 완료
   ✅ 모든 초기 데이터 생성 완료
   ✅ 임시 계정 생성 완료: user_xxx@web3budget.local
   ✅ 자동 로그인 완료
   ```

---

## 🎯 작업 순서

1. Supabase SQL Editor에서 트리거 삭제
2. database.js에 함수 2개 추가
3. auth.js의 signUp 함수 수정
4. auth.js의 autoSignUpAndLogin 함수 수정
5. 테스트

---

## 📌 중요 사항

- 기존 Supabase 트리거는 완전히 제거
- 모든 초기 데이터 생성은 클라이언트에서 처리
- 회원가입 성공 후 자동으로 계정과 RPG 데이터 생성
- 에러 발생 시 콘솔에서 상세 로그 확인
