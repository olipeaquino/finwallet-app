import { getDatabase } from '@/db';
import { Transaction, CreateTransactionDTO, TransactionFilters } from '@/types';
import { generateUUID } from '@/utils';

export const transactionService = {
    async create(data: CreateTransactionDTO): Promise<Transaction> {
        const db = await getDatabase();
        const id = generateUUID();
        const now = new Date().toISOString();

        await db.runAsync(
            `INSERT INTO transactions (id, type, amount, description, category_id, date, is_recurring, recurring_day, attachment_uri, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                data.type,
                data.amount,
                data.description,
                data.category_id,
                data.date,
                data.is_recurring ? 1 : 0,
                data.recurring_day || null,
                data.attachment_uri || null,
                now,
                now,
            ]
        );

        return this.getById(id) as Promise<Transaction>;
    },

    async getAll(filters?: TransactionFilters): Promise<Transaction[]> {
        const db = await getDatabase();

        let query = `
      SELECT 
        t.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE 1=1
    `;
        const params: any[] = [];

        if (filters?.type) {
            query += ` AND t.type = ?`;
            params.push(filters.type);
        }

        if (filters?.category_id) {
            query += ` AND t.category_id = ?`;
            params.push(filters.category_id);
        }

        if (filters?.startDate) {
            query += ` AND t.date >= ?`;
            params.push(filters.startDate);
        }

        if (filters?.endDate) {
            query += ` AND t.date <= ?`;
            params.push(filters.endDate);
        }

        if (filters?.search) {
            query += ` AND t.description LIKE ?`;
            params.push(`%${filters.search}%`);
        }

        query += ` ORDER BY t.date DESC, t.created_at DESC`;

        if (filters?.limit) {
            query += ` LIMIT ?`;
            params.push(filters.limit);

            if (filters?.offset) {
                query += ` OFFSET ?`;
                params.push(filters.offset);
            }
        }

        const result = await db.getAllAsync<Transaction>(query, params);
        return result.map(row => ({
            ...row,
            is_recurring: Boolean(row.is_recurring),
        }));
    },

    async getById(id: string): Promise<Transaction | null> {
        const db = await getDatabase();
        const result = await db.getFirstAsync<Transaction>(
            `SELECT 
        t.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
            [id]
        );

        if (!result) return null;

        return {
            ...result,
            is_recurring: Boolean(result.is_recurring),
        };
    },

    async update(id: string, data: Partial<CreateTransactionDTO>): Promise<Transaction> {
        const db = await getDatabase();
        const now = new Date().toISOString();

        const updates: string[] = ['updated_at = ?'];
        const params: any[] = [now];

        if (data.type) {
            updates.push('type = ?');
            params.push(data.type);
        }
        if (data.amount !== undefined) {
            updates.push('amount = ?');
            params.push(data.amount);
        }
        if (data.description) {
            updates.push('description = ?');
            params.push(data.description);
        }
        if (data.category_id) {
            updates.push('category_id = ?');
            params.push(data.category_id);
        }
        if (data.date) {
            updates.push('date = ?');
            params.push(data.date);
        }
        if (data.is_recurring !== undefined) {
            updates.push('is_recurring = ?');
            params.push(data.is_recurring ? 1 : 0);
        }
        if (data.recurring_day !== undefined) {
            updates.push('recurring_day = ?');
            params.push(data.recurring_day);
        }

        params.push(id);
        await db.runAsync(
            `UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        return this.getById(id) as Promise<Transaction>;
    },

    async delete(id: string): Promise<void> {
        const db = await getDatabase();
        await db.runAsync(`DELETE FROM transactions WHERE id = ?`, [id]);
    },

    async getMonthlySummary(year: number, month: number): Promise<{
        income: number;
        expense: number;
        balance: number;
    }> {
        const db = await getDatabase();
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

        const result = await db.getFirstAsync<{ income: number; expense: number }>(
            `SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
       FROM transactions 
       WHERE date BETWEEN ? AND ?`,
            [startDate, endDate]
        );

        const income = result?.income || 0;
        const expense = result?.expense || 0;

        return {
            income,
            expense,
            balance: income - expense,
        };
    },

    async getTotalBalance(): Promise<{
        income: number;
        expense: number;
        balance: number;
    }> {
        const db = await getDatabase();

        const result = await db.getFirstAsync<{ income: number; expense: number }>(
            `SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
       FROM transactions`
        );

        const income = result?.income || 0;
        const expense = result?.expense || 0;

        return {
            income,
            expense,
            balance: income - expense,
        };
    },

    async getCategoryDistribution(year: number, month: number): Promise<Array<{
        category_id: string;
        category_name: string;
        category_color: string;
        total: number;
        percentage: number;
    }>> {
        const db = await getDatabase();
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

        const result = await db.getAllAsync<{
            category_id: string;
            category_name: string;
            category_color: string;
            total: number;
        }>(
            `SELECT 
        t.category_id,
        c.name as category_name,
        c.color as category_color,
        SUM(t.amount) as total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.type = 'expense' AND t.date BETWEEN ? AND ?
       GROUP BY t.category_id
       ORDER BY total DESC`,
            [startDate, endDate]
        );

        const totalExpense = result.reduce((sum, item) => sum + item.total, 0);

        return result.map(item => ({
            ...item,
            percentage: totalExpense > 0 ? (item.total / totalExpense) * 100 : 0,
        }));
    },

    async getMonthlyEvolution(months: number = 6): Promise<Array<{
        month: string;
        year: number;
        income: number;
        expense: number;
    }>> {
        const db = await getDatabase();

        const result = await db.getAllAsync<{
            month: string;
            year: string;
            income: number;
            expense: number;
        }>(
            `SELECT 
        strftime('%m', date) as month,
        strftime('%Y', date) as year,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
       FROM transactions
       WHERE date >= date('now', '-${months} months')
       GROUP BY strftime('%Y-%m', date)
       ORDER BY year ASC, month ASC`
        );

        return result.map(item => ({
            month: item.month,
            year: parseInt(item.year),
            income: item.income,
            expense: item.expense,
        }));
    },
};
