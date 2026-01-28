// LocalStorage 키
const STORAGE_KEYS = {
    TRANSACTIONS: 'web3Transactions',
    RPG_DATA: 'web3_rpg_data',
    RECURRING_ITEMS: 'web3_recurring_items'
};

// Transactions
export function getTransactions() {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
}

export function saveTransactions(transactions) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function addTransaction(transaction) {
    const transactions = getTransactions();
    transactions.push(transaction);
    saveTransactions(transactions);
    return transaction;
}

export function updateTransaction(id, updatedData) {
    const transactions = getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updatedData };
        saveTransactions(transactions);
        return transactions[index];
    }
    return null;
}

export function deleteTransaction(id) {
    const transactions = getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    saveTransactions(filtered);
    return filtered;
}

// RPG Data
export function getRPGData() {
    const data = localStorage.getItem(STORAGE_KEYS.RPG_DATA);
    return data ? JSON.parse(data) : {
        futuresAbstinence: {
            currentStreak: 0,
            maxStreak: 0,
            lastCheckDate: new Date().toISOString().split('T')[0]
        },
        debts: {
            bankLoan: { total: 410000000, paid: 0, monthly: 2100000 },
            parentLoan: { total: 150000000, paid: 0, monthly: 800000 }
        },
        dailyQuests: {
            date: new Date().toISOString().split('T')[0],
            completed: {
                noFutures: true,
                vibeCoding: false,
                xPosting: false,
                mentalCheck: false
            }
        },
        stats: {
            level: 1,
            familyPower: 0,
            mentalDefense: 0,
            techPower: 0
        }
    };
}

export function saveRPGData(rpgData) {
    localStorage.setItem(STORAGE_KEYS.RPG_DATA, JSON.stringify(rpgData));
}

export function updateRPGData(updates) {
    const rpgData = getRPGData();
    const updated = { ...rpgData, ...updates };
    saveRPGData(updated);
    return updated;
}

// Recurring Items
export function getRecurringItems() {
    const data = localStorage.getItem(STORAGE_KEYS.RECURRING_ITEMS);
    return data ? JSON.parse(data) : [];
}

export function saveRecurringItems(items) {
    localStorage.setItem(STORAGE_KEYS.RECURRING_ITEMS, JSON.stringify(items));
}

export function addRecurringItem(item) {
    const items = getRecurringItems();
    items.push(item);
    saveRecurringItems(items);
    return item;
}

export function updateRecurringItem(id, updatedData) {
    const items = getRecurringItems();
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
        items[index] = { ...items[index], ...updatedData };
        saveRecurringItems(items);
        return items[index];
    }
    return null;
}

export function deleteRecurringItem(id) {
    const items = getRecurringItems();
    const filtered = items.filter(i => i.id !== id);
    saveRecurringItems(filtered);
    return filtered;
}

// 데이터 내보내기/가져오기
export function exportAllData() {
    return {
        transactions: getTransactions(),
        rpgData: getRPGData(),
        recurringItems: getRecurringItems(),
        exportedAt: new Date().toISOString()
    };
}

export function importAllData(data) {
    if (data.transactions) saveTransactions(data.transactions);
    if (data.rpgData) saveRPGData(data.rpgData);
    if (data.recurringItems) saveRecurringItems(data.recurringItems);
}

export function clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.RPG_DATA);
    localStorage.removeItem(STORAGE_KEYS.RECURRING_ITEMS);
}
