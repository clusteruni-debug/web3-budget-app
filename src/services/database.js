import { supabase } from './supabase.js';

// ============================================
// 기본 데이터 초기화 (신규 사용자용)
// ============================================

// 기본 계정 4개 생성
export async function createDefaultAccounts(userId) {
    try {
        const { error } = await supabase
            .from('accounts')
            .insert([
                { user_id: userId, name: 'Web3 지갑', type: 'web3', balance: 0 },
                { user_id: userId, name: '투자', type: 'investment', balance: 0 },
                { user_id: userId, name: '은행', type: 'bank', balance: 0 },
                { user_id: userId, name: '가족 대출', type: 'family', balance: 0 }
            ]);

        if (error) {
            console.warn('기본 계정 생성 실패:', error);
            return { success: false, error: error.message };
        }

        console.log('✅ 기본 계정 4개 생성 완료');
        return { success: true };
    } catch (error) {
        console.error('createDefaultAccounts error:', error);
        return { success: false, error: error.message };
    }
}

// 기본 RPG 데이터 생성
export async function createDefaultRPGData(userId) {
    try {
        const { error } = await supabase
            .from('rpg_data')
            .insert([{ user_id: userId }]);

        if (error) {
            console.warn('RPG 데이터 초기화 실패:', error);
            return { success: false, error: error.message };
        }

        console.log('✅ RPG 데이터 초기화 완료');
        return { success: true };
    } catch (error) {
        console.error('createDefaultRPGData error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// TRANSACTIONS (거래)
// ============================================

export async function getTransactions(filters = {}) {
    try {
        let query = supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

        // 필터 적용
        if (filters.type) {
            query = query.eq('type', filters.type);
        }
        if (filters.category) {
            query = query.eq('category', filters.category);
        }
        if (filters.dateFrom) {
            query = query.gte('date', filters.dateFrom);
        }
        if (filters.dateTo) {
            query = query.lte('date', filters.dateTo);
        }
        if (filters.search) {
            query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Get transactions error:', error);
        return { success: false, error: error.message };
    }
}

export async function getTransaction(id) {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Get transaction error:', error);
        return { success: false, error: error.message };
    }
}

export async function createTransaction(transaction) {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .insert(transaction)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Create transaction error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateTransaction(id, updates) {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Update transaction error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteTransaction(id) {
    try {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Delete transaction error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// ACCOUNTS (계정)
// ============================================

export async function getAccounts() {
    try {
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('is_active', true)
            .order('type');

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Get accounts error:', error);
        return { success: false, error: error.message };
    }
}

export async function getAccount(id) {
    try {
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Get account error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateAccountBalance(id, newBalance) {
    try {
        const { data, error } = await supabase
            .from('accounts')
            .update({ balance: newBalance })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Update account balance error:', error);
        return { success: false, error: error.message };
    }
}

// 계정 생성 (거래소/지갑 추가용)
export async function createAccount(account) {
    try {
        const { data, error } = await supabase
            .from('accounts')
            .insert(account)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Create account error:', error);
        return { success: false, error: error.message };
    }
}

// 계정 수정
export async function updateAccount(id, updates) {
    try {
        const { data, error } = await supabase
            .from('accounts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Update account error:', error);
        return { success: false, error: error.message };
    }
}

// 계정 삭제 (비활성화)
export async function deleteAccount(id) {
    try {
        const { error } = await supabase
            .from('accounts')
            .update({ is_active: false })
            .eq('id', id);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Delete account error:', error);
        return { success: false, error: error.message };
    }
}

// 차익거래 기록 생성
export async function createArbitrageTransaction(data) {
    try {
        const transaction = {
            type: 'transfer',
            category: '차익거래',
            title: data.title,
            description: data.description,
            date: data.date,
            amount: data.amount,
            account_from: data.fromAccountId,
            account_to: data.toAccountId,
            is_arbitrage: true,
            arbitrage_profit: data.profit,
            departure_amount: data.departureAmount,
            arrival_amount: data.arrivalAmount,
            token_name: data.tokenName,
            token_quantity: data.tokenQuantity,
            tags: ['차익거래', data.profitType || '김프']
        };

        const { data: result, error } = await supabase
            .from('transactions')
            .insert(transaction)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data: result };
    } catch (error) {
        console.error('Create arbitrage transaction error:', error);
        return { success: false, error: error.message };
    }
}

// 차익거래 이력 조회
export async function getArbitrageTransactions() {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('is_arbitrage', true)
            .order('date', { ascending: false });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Get arbitrage transactions error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// RECURRING ITEMS (고정 항목)
// ============================================

export async function getRecurringItems(filters = {}) {
    try {
        let query = supabase
            .from('recurring_items')
            .select('*')
            .order('next_date');

        if (filters.type) {
            query = query.eq('type', filters.type);
        }
        if (filters.isActive !== undefined) {
            query = query.eq('is_active', filters.isActive);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Get recurring items error:', error);
        return { success: false, error: error.message };
    }
}

export async function createRecurringItem(item) {
    try {
        const { data, error } = await supabase
            .from('recurring_items')
            .insert(item)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Create recurring item error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateRecurringItem(id, updates) {
    try {
        const { data, error } = await supabase
            .from('recurring_items')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Update recurring item error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteRecurringItem(id) {
    try {
        const { error } = await supabase
            .from('recurring_items')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Delete recurring item error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// RPG DATA
// ============================================

export async function getRPGData() {
    try {
        const { data, error } = await supabase
            .from('rpg_data')
            .select('*')
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Get RPG data error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateRPGData(updates) {
    try {
        // 먼저 현재 사용자의 RPG 데이터가 있는지 확인
        const { data: existing } = await supabase
            .from('rpg_data')
            .select('id')
            .single();

        let result;
        if (existing) {
            // 업데이트
            result = await supabase
                .from('rpg_data')
                .update(updates)
                .eq('id', existing.id)
                .select()
                .single();
        } else {
            // 생성
            result = await supabase
                .from('rpg_data')
                .insert(updates)
                .select()
                .single();
        }

        const { data, error } = result;

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Update RPG data error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// STATISTICS (통계)
// ============================================

export async function getMonthlyStats(year, month) {
    try {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];

        const { data, error } = await supabase
            .rpc('get_monthly_stats', {
                start_date: startDate,
                end_date: endDate
            });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Get monthly stats error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

export function subscribeToTransactions(callback) {
    return supabase
        .channel('transactions_changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'transactions'
            },
            callback
        )
        .subscribe();
}

export function subscribeToRPGData(callback) {
    return supabase
        .channel('rpg_data_changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'rpg_data'
            },
            callback
        )
        .subscribe();
}

// ============================================
// V2: ASSETS (통합 자산)
// ============================================

export async function getAssets(filters = {}) {
    try {
        let query = supabase
            .from('assets')
            .select('*')
            .eq('is_active', true)
            .order('current_value', { ascending: false });

        if (filters.category) {
            query = query.eq('category', filters.category);
        }
        if (filters.sub_type) {
            query = query.eq('sub_type', filters.sub_type);
        }

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Get assets error:', error);
        return { success: false, error: error.message };
    }
}

export async function getAsset(id) {
    try {
        const { data, error } = await supabase
            .from('assets')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Get asset error:', error);
        return { success: false, error: error.message };
    }
}

export async function createAsset(asset) {
    try {
        const { data, error } = await supabase
            .from('assets')
            .insert(asset)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Create asset error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateAsset(id, updates) {
    try {
        const { data, error } = await supabase
            .from('assets')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // 자산 가치 변경 시 히스토리 자동 저장
        if (data && data.current_value) {
            saveAssetHistory(id, data.current_value).catch(err =>
                console.warn('히스토리 저장 실패 (무시):', err)
            );
        }

        return { success: true, data };
    } catch (error) {
        console.error('Update asset error:', error);
        return { success: false, error: error.message };
    }
}

// 자산 히스토리 저장 (오늘 날짜 기준, 중복 시 업데이트)
export async function saveAssetHistory(assetId, value) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('asset_history')
            .upsert({
                asset_id: assetId,
                recorded_date: today,
                value: value
            }, {
                onConflict: 'asset_id,recorded_date'
            });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        // 테이블이 없을 수도 있으므로 경고만
        console.warn('Asset history save error:', error.message);
        return { success: false, error: error.message };
    }
}

// 자산 히스토리 조회 (최근 N일)
export async function getAssetHistory(assetId, days = 30) {
    try {
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - days);
        const sinceDateStr = sinceDate.toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('asset_history')
            .select('*')
            .eq('asset_id', assetId)
            .gte('recorded_date', sinceDateStr)
            .order('recorded_date', { ascending: true });

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        console.warn('Asset history fetch error:', error.message);
        return { success: false, data: [], error: error.message };
    }
}

export async function deleteAsset(id) {
    try {
        const { error } = await supabase
            .from('assets')
            .update({ is_active: false })
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Delete asset error:', error);
        return { success: false, error: error.message };
    }
}

// 스테이킹 현황 조회
export async function getStakingOverview() {
    try {
        const { data, error } = await supabase
            .from('staking_overview')
            .select('*');

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Get staking overview error:', error);
        return { success: false, error: error.message };
    }
}

// 에어드랍 현황 조회
export async function getAirdropOverview() {
    try {
        const { data, error } = await supabase
            .from('airdrop_overview')
            .select('*');

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Get airdrop overview error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// V2: DEBTS (부채)
// ============================================

export async function getDebts() {
    try {
        const { data, error } = await supabase
            .from('debts')
            .select('*')
            .eq('is_active', true)
            .order('remaining_amount', { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Get debts error:', error);
        return { success: false, error: error.message };
    }
}

export async function createDebt(debt) {
    try {
        const { data, error } = await supabase
            .from('debts')
            .insert(debt)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Create debt error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateDebt(id, updates) {
    try {
        const { data, error } = await supabase
            .from('debts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Update debt error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteDebt(id) {
    try {
        const { error } = await supabase
            .from('debts')
            .update({ is_active: false })
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Delete debt error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// V2: NET WORTH (순자산 계산)
// ============================================

export async function calculateNetWorth() {
    try {
        const [assetsResult, debtsResult] = await Promise.all([
            getAssets(),
            getDebts()
        ]);

        if (!assetsResult.success || !debtsResult.success) {
            throw new Error('Failed to fetch data');
        }

        const assets = assetsResult.data || [];
        const debts = debtsResult.data || [];

        // 카테고리별 합계
        const totalByCategory = {
            crypto: 0,
            stock: 0,
            cash: 0,
            real_estate: 0,
            other: 0
        };

        assets.forEach(asset => {
            const category = asset.category || 'other';
            totalByCategory[category] = (totalByCategory[category] || 0) + (asset.current_value || 0);
        });

        const totalAssets = Object.values(totalByCategory).reduce((a, b) => a + b, 0);
        const totalDebts = debts.reduce((sum, d) => sum + (d.remaining_amount || 0), 0);
        const netWorth = totalAssets - totalDebts;

        return {
            success: true,
            data: {
                totalAssets,
                totalDebts,
                netWorth,
                byCategory: totalByCategory,
                assetsCount: assets.length,
                debtsCount: debts.length
            }
        };
    } catch (error) {
        console.error('Calculate net worth error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// 순자산 스냅샷 (Net Worth Snapshots)
// ============================================

export async function saveNetWorthSnapshot() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // 현재 순자산 계산
        const netWorthResult = await calculateNetWorth();
        if (!netWorthResult.success) throw new Error('Failed to calculate net worth');

        const { totalAssets, totalDebts, netWorth, byCategory } = netWorthResult.data;

        // 오늘 날짜로 이미 스냅샷이 있는지 확인
        const today = new Date().toISOString().split('T')[0];
        const { data: existing } = await supabase
            .from('net_worth_snapshots')
            .select('id')
            .eq('user_id', user.id)
            .eq('recorded_at', today)
            .single();

        if (existing) {
            // 오늘 스냅샷이 이미 있으면 업데이트
            const { error } = await supabase
                .from('net_worth_snapshots')
                .update({
                    total_assets: totalAssets,
                    total_crypto: byCategory.crypto || 0,
                    total_stock: byCategory.stock || 0,
                    total_cash: byCategory.cash || 0,
                    total_real_estate: byCategory.real_estate || 0,
                    total_other: byCategory.other || 0,
                    total_debts: totalDebts,
                    net_worth: netWorth
                })
                .eq('id', existing.id);

            if (error) throw error;
            return { success: true, action: 'updated' };
        } else {
            // 새 스냅샷 생성
            const { error } = await supabase
                .from('net_worth_snapshots')
                .insert({
                    user_id: user.id,
                    total_assets: totalAssets,
                    total_crypto: byCategory.crypto || 0,
                    total_stock: byCategory.stock || 0,
                    total_cash: byCategory.cash || 0,
                    total_real_estate: byCategory.real_estate || 0,
                    total_other: byCategory.other || 0,
                    total_debts: totalDebts,
                    net_worth: netWorth,
                    recorded_at: today
                });

            if (error) throw error;
            return { success: true, action: 'created' };
        }
    } catch (error) {
        console.error('Save net worth snapshot error:', error);
        return { success: false, error: error.message };
    }
}

export async function getNetWorthHistory(months = 12) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // 지정된 개월 수만큼의 데이터 조회
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const { data, error } = await supabase
            .from('net_worth_snapshots')
            .select('*')
            .eq('user_id', user.id)
            .gte('recorded_at', startDate.toISOString().split('T')[0])
            .order('recorded_at', { ascending: true });

        if (error) throw error;

        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Get net worth history error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// BUDGETS (예산 관리)
// ============================================

export async function getBudgets() {
    try {
        const { data, error } = await supabase
            .from('budgets')
            .select('*')
            .eq('is_active', true)
            .order('category');

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Get budgets error:', error);
        return { success: false, error: error.message };
    }
}

export async function createBudget(budget) {
    try {
        const { data, error } = await supabase
            .from('budgets')
            .insert(budget)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Create budget error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateBudget(id, updates) {
    try {
        const { data, error } = await supabase
            .from('budgets')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Update budget error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteBudget(id) {
    try {
        const { error } = await supabase
            .from('budgets')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Delete budget error:', error);
        return { success: false, error: error.message };
    }
}

// 예산 vs 실제 지출 비교 (이번 달)
export async function getBudgetVsActual() {
    try {
        const [budgetsResult, transactionsResult] = await Promise.all([
            getBudgets(),
            getTransactions()
        ]);

        if (!budgetsResult.success) throw new Error('Failed to fetch budgets');
        if (!transactionsResult.success) throw new Error('Failed to fetch transactions');

        const budgets = budgetsResult.data || [];
        const transactions = transactionsResult.data || [];

        // 이번 달 시작/끝
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // 이번 달 지출 필터
        const thisMonthExpenses = transactions.filter(t => {
            const txDate = new Date(t.date);
            return t.type === 'expense' &&
                   txDate >= monthStart &&
                   txDate <= monthEnd;
        });

        // 카테고리별 지출 집계
        const spentByCategory = {};
        thisMonthExpenses.forEach(t => {
            const cat = t.category || '기타';
            spentByCategory[cat] = (spentByCategory[cat] || 0) + t.amount;
        });

        // 예산과 실제 지출 비교
        const budgetComparison = budgets.map(budget => {
            const spent = spentByCategory[budget.category] || 0;
            const remaining = budget.monthly_amount - spent;
            const percent = budget.monthly_amount > 0
                ? Math.round((spent / budget.monthly_amount) * 100)
                : 0;

            return {
                ...budget,
                spent,
                remaining,
                percent,
                isOver: spent > budget.monthly_amount
            };
        });

        // 예산 없는 카테고리 지출도 포함 (옵션)
        const budgetCategories = budgets.map(b => b.category);
        const unbdgetedSpending = Object.entries(spentByCategory)
            .filter(([cat]) => !budgetCategories.includes(cat))
            .map(([category, spent]) => ({
                category,
                monthly_amount: 0,
                spent,
                remaining: -spent,
                percent: 100,
                isOver: true,
                isUnbudgeted: true
            }));

        return {
            success: true,
            data: {
                budgets: budgetComparison,
                unbudgeted: unbdgetedSpending,
                totalBudget: budgets.reduce((sum, b) => sum + b.monthly_amount, 0),
                totalSpent: thisMonthExpenses.reduce((sum, t) => sum + t.amount, 0),
                daysRemaining: monthEnd.getDate() - now.getDate()
            }
        };
    } catch (error) {
        console.error('Get budget vs actual error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// SUBSCRIPTIONS (구독 관리)
// ============================================

export async function getSubscriptions() {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .order('next_billing_date', { ascending: true });

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Get subscriptions error:', error);
        return { success: false, error: error.message, data: [] };
    }
}

export async function createSubscription(subscription) {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .insert(subscription)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Create subscription error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateSubscription(id, updates) {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Update subscription error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteSubscription(id) {
    try {
        const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Delete subscription error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// GOALS (목표 관리)
// ============================================

export async function getGoals() {
    try {
        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Get goals error:', error);
        return { success: false, error: error.message, data: [] };
    }
}

export async function createGoal(goal) {
    try {
        const { data, error } = await supabase
            .from('goals')
            .insert(goal)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Create goal error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateGoal(id, updates) {
    try {
        const { data, error } = await supabase
            .from('goals')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Update goal error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteGoal(id) {
    try {
        const { error } = await supabase
            .from('goals')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Delete goal error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// FIAT FLOWS (원화 입출금 - 투자 손익 계산용)
// ============================================

export async function getFiatFlows(filters = {}) {
    try {
        let query = supabase
            .from('fiat_flows')
            .select('*')
            .order('date', { ascending: false });

        if (filters.type) {
            query = query.eq('type', filters.type);
        }
        if (filters.platform_type) {
            query = query.eq('platform_type', filters.platform_type);
        }
        if (filters.dateFrom) {
            query = query.gte('date', filters.dateFrom);
        }
        if (filters.dateTo) {
            query = query.lte('date', filters.dateTo);
        }

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Get fiat flows error:', error);
        return { success: false, error: error.message, data: [] };
    }
}

export async function createFiatFlow(flow) {
    try {
        const { data, error } = await supabase
            .from('fiat_flows')
            .insert(flow)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Create fiat flow error:', error);
        return { success: false, error: error.message };
    }
}

export async function updateFiatFlow(id, updates) {
    try {
        const { data, error } = await supabase
            .from('fiat_flows')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Update fiat flow error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteFiatFlow(id) {
    try {
        const { error } = await supabase
            .from('fiat_flows')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Delete fiat flow error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// ASSET DISPOSALS (자산 정리 이력)
// ============================================

export async function getAssetDisposals() {
    try {
        const { data, error } = await supabase
            .from('asset_disposals')
            .select('*')
            .order('disposal_date', { ascending: false });

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Get asset disposals error:', error);
        return { success: false, error: error.message, data: [] };
    }
}

export async function createAssetDisposal(disposal) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const disposalData = {
            ...disposal,
            user_id: user.id
        };

        const { data, error } = await supabase
            .from('asset_disposals')
            .insert(disposalData)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Create asset disposal error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteAssetDisposal(id) {
    try {
        const { error } = await supabase
            .from('asset_disposals')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Delete asset disposal error:', error);
        return { success: false, error: error.message };
    }
}

// 자산 정리 + 비활성화 (트랜잭션)
export async function disposeAsset(assetId, disposalData) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // 1. 정리 기록 생성
        const { data: disposal, error: disposalError } = await supabase
            .from('asset_disposals')
            .insert({
                ...disposalData,
                user_id: user.id,
                asset_id: assetId
            })
            .select()
            .single();

        if (disposalError) throw disposalError;

        // 2. 자산 비활성화
        const { error: assetError } = await supabase
            .from('assets')
            .update({ is_active: false })
            .eq('id', assetId);

        if (assetError) throw assetError;

        return { success: true, data: disposal };
    } catch (error) {
        console.error('Dispose asset error:', error);
        return { success: false, error: error.message };
    }
}

// 투자 손익 계산
// 진짜 손익 = 현재 투자 잔고 - (총 입금 - 총 출금)
// 즉, 현재 잔고 - 순 투입금
export async function calculateFiatProfit() {
    try {
        const [flowsResult, assetsResult] = await Promise.all([
            getFiatFlows(),
            getAssets()
        ]);

        if (!flowsResult.success) throw new Error('Failed to fetch fiat flows');
        if (!assetsResult.success) throw new Error('Failed to fetch assets');

        const flows = flowsResult.data || [];
        const assets = assetsResult.data || [];

        // 입출금 집계
        let totalDeposit = 0;
        let totalWithdraw = 0;
        const depositsByType = { crypto: 0, stock: 0, other: 0 };
        const withdrawsByType = { crypto: 0, stock: 0, other: 0 };

        flows.forEach(flow => {
            const platformType = flow.platform_type || 'other';
            if (flow.type === 'deposit') {
                totalDeposit += flow.amount;
                depositsByType[platformType] = (depositsByType[platformType] || 0) + flow.amount;
            } else if (flow.type === 'withdraw') {
                totalWithdraw += flow.amount;
                withdrawsByType[platformType] = (withdrawsByType[platformType] || 0) + flow.amount;
            }
        });

        // 현재 투자 잔고 (크립토 + 주식)
        const cryptoBalance = assets
            .filter(a => a.category === 'crypto')
            .reduce((sum, a) => sum + (a.current_value || 0), 0);

        const stockBalance = assets
            .filter(a => a.category === 'stock')
            .reduce((sum, a) => sum + (a.current_value || 0), 0);

        const currentBalance = cryptoBalance + stockBalance;

        // 순 투입금 = 입금 - 출금
        const netInvestment = totalDeposit - totalWithdraw;

        // 진짜 손익 = 현재 잔고 - 순 투입금
        const totalProfit = currentBalance - netInvestment;

        // 수익률 계산
        const profitPercent = netInvestment > 0
            ? ((totalProfit / netInvestment) * 100).toFixed(2)
            : 0;

        return {
            success: true,
            data: {
                totalDeposit,
                totalWithdraw,
                netInvestment,
                currentBalance,
                cryptoBalance,
                stockBalance,
                totalProfit,
                profitPercent,
                depositsByType,
                withdrawsByType,
                flowsCount: flows.length
            }
        };
    } catch (error) {
        console.error('Calculate fiat profit error:', error);
        return { success: false, error: error.message };
    }
}

// ICO/런치패드 투자 손익 계산
export async function calculateIcoProfit() {
    try {
        const assetsResult = await getAssets();
        if (!assetsResult.success) throw new Error('Failed to fetch assets');

        const assets = assetsResult.data || [];

        // ICO 타입 자산만 필터
        const icoAssets = assets.filter(a => a.sub_type === 'ico');

        if (icoAssets.length === 0) {
            return {
                success: true,
                data: {
                    totalInvested: 0,
                    currentValue: 0,
                    totalProfit: 0,
                    profitPercent: 0,
                    projects: []
                }
            };
        }

        // 총 투자금 (매입가)
        const totalInvested = icoAssets.reduce((sum, a) => sum + (a.purchase_value || 0), 0);

        // 현재 평가액
        const currentValue = icoAssets.reduce((sum, a) => sum + (a.current_value || 0), 0);

        // 손익
        const totalProfit = currentValue - totalInvested;

        // 수익률
        const profitPercent = totalInvested > 0
            ? ((totalProfit / totalInvested) * 100).toFixed(2)
            : 0;

        // 개별 프로젝트 손익
        const projects = icoAssets.map(a => {
            const invested = a.purchase_value || 0;
            const current = a.current_value || 0;
            const profit = current - invested;
            const rate = invested > 0 ? ((profit / invested) * 100).toFixed(2) : 0;

            return {
                id: a.id,
                name: a.name,
                platform: a.platform,
                invested,
                current,
                profit,
                profitRate: parseFloat(rate)
            };
        }).sort((a, b) => b.profit - a.profit);

        return {
            success: true,
            data: {
                totalInvested,
                currentValue,
                totalProfit,
                profitPercent: parseFloat(profitPercent),
                projectCount: icoAssets.length,
                projects
            }
        };
    } catch (error) {
        console.error('Calculate ICO profit error:', error);
        return { success: false, error: error.message };
    }
}
