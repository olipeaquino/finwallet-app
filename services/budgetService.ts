// @ts-nocheck
import { getDatabase } from '@/db';
import { Budget, CreateBudgetDTO, UpdateBudgetDTO, BudgetSummary } from '@/types';

const generateId = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const budgetService = {
    async getAll(month: number, year: number): Promise<Budget[]> {
        const db = await getDatabase();

        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = month === 12
            ? `${year + 1}-01-01`
            : `${year}-${String(month + 1).padStart(2, '0')}-01`;

        const budgets = await db.getAllAsync<Budget>(
            `SELECT 
                b.*,
                c.name as category_name,
                c.color as category_color,
                c.icon as category_icon,
                COALESCE(
                    (SELECT SUM(t.amount) 
                     FROM transactions t 
                     WHERE t.category_id = b.category_id 
                       AND t.type = 'expense'
                       AND t.date >= ? AND t.date < ?),
                    0
                ) as spent
             FROM budgets b
             LEFT JOIN categories c ON b.category_id = c.id
             WHERE b.month = ? AND b.year = ?
             ORDER BY spent DESC`,
            [startDate, endDate, month, year]
        );

        return budgets;
    },

    async getById(id: string): Promise<Budget | null> {
        const db = await getDatabase();

        const budgetBasic = await db.getFirstAsync<Budget>(
            'SELECT * FROM budgets WHERE id = ?',
            [id]
        );

        if (!budgetBasic) return null;

        const startDate = `${budgetBasic.year}-${String(budgetBasic.month).padStart(2, '0')}-01`;
        const endDate = budgetBasic.month === 12
            ? `${budgetBasic.year + 1}-01-01`
            : `${budgetBasic.year}-${String(budgetBasic.month + 1).padStart(2, '0')}-01`;

        const budget = await db.getFirstAsync<Budget>(
            `SELECT 
                b.*,
                c.name as category_name,
                c.color as category_color,
                c.icon as category_icon,
                COALESCE(
                    (SELECT SUM(t.amount) 
                     FROM transactions t 
                     WHERE t.category_id = b.category_id 
                       AND t.type = 'expense'
                       AND t.date >= ? AND t.date < ?),
                    0
                ) as spent
             FROM budgets b
             LEFT JOIN categories c ON b.category_id = c.id
             WHERE b.id = ?`,
            [startDate, endDate, id]
        );

        return budget || null;
    },

    async create(data: CreateBudgetDTO): Promise<Budget> {
        const db = await getDatabase();
        const id = generateId();
        const now = new Date().toISOString();

        await db.runAsync(
            `INSERT INTO budgets (id, category_id, amount, month, year, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, data.category_id, data.amount, data.month, data.year, now, now]
        );

        return this.getById(id) as Promise<Budget>;
    },

    async update(id: string, data: UpdateBudgetDTO): Promise<Budget | null> {
        const db = await getDatabase();
        const now = new Date().toISOString();

        await db.runAsync(
            `UPDATE budgets SET amount = ?, updated_at = ? WHERE id = ?`,
            [data.amount, now, id]
        );

        return this.getById(id);
    },

    async delete(id: string): Promise<void> {
        const db = await getDatabase();
        await db.runAsync('DELETE FROM budgets WHERE id = ?', [id]);
    },

    async getSummary(month: number, year: number): Promise<BudgetSummary> {
        const budgets = await this.getAll(month, year);

        const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
        const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);

        const overLimitCount = budgets.filter(b => b.spent > b.amount).length;
        const nearLimitCount = budgets.filter(b => {
            const percentage = (b.spent / b.amount) * 100;
            return percentage >= 80 && percentage < 100;
        }).length;

        return {
            totalBudget,
            totalSpent,
            budgetsCount: budgets.length,
            overLimitCount,
            nearLimitCount,
        };
    },

    async getAlerts(month: number, year: number): Promise<Budget[]> {
        const budgets = await this.getAll(month, year);

        return budgets.filter(b => {
            const percentage = b.amount > 0 ? (b.spent / b.amount) * 100 : 0;
            return percentage >= 80;
        });
    },

    async existsForCategory(categoryId: string, month: number, year: number): Promise<boolean> {
        const db = await getDatabase();
        const result = await db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM budgets WHERE category_id = ? AND month = ? AND year = ?',
            [categoryId, month, year]
        );
        return (result?.count || 0) > 0;
    },

    async copyFromPreviousMonth(month: number, year: number): Promise<number> {
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;

        const db = await getDatabase();
        const previousBudgets = await db.getAllAsync<Budget>(
            'SELECT * FROM budgets WHERE month = ? AND year = ?',
            [prevMonth, prevYear]
        );

        let copiedCount = 0;
        const now = new Date().toISOString();

        for (const budget of previousBudgets) {
            const exists = await this.existsForCategory(budget.category_id, month, year);
            if (!exists) {
                const id = generateId();
                await db.runAsync(
                    `INSERT INTO budgets (id, category_id, amount, month, year, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [id, budget.category_id, budget.amount, month, year, now, now]
                );
                copiedCount++;
            }
        }

        return copiedCount;
    },
};
