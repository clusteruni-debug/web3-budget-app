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
                { user_id: userId, name: '투자 계정', type: 'investment', balance: 0 },
                { user_id: userId, name: '은행 계정', type: 'bank', balance: 0 },
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
        return { success: true, data };
    } catch (error) {
        console.error('Update asset error:', error);
        return { success: false, error: error.message };
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
