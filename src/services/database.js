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
