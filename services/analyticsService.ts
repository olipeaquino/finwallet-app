// @ts-nocheck
import { getDatabase } from '@/db';

interface MonthlyReport {
    month: number;
    year: number;
    totalIncome: number;
    totalExpense: number;
    balance: number;
    topCategories: Array<{
        category_id: string;
        category_name: string;
        category_color: string;
        total: number;
        percentage: number;
    }>;
    transactionCount: number;
}

interface MonthComparison {
    currentMonth: MonthlyReport;
    previousMonth: MonthlyReport | null;
    incomeChange: number;
    expenseChange: number;
    balanceChange: number;
}

interface Insight {
    type: 'warning' | 'success' | 'info';
    icon: string;
    title: string;
    description: string;
}

export const analyticsService = {
    async getMonthlyReport(month: number, year: number): Promise<MonthlyReport> {
        const db = await getDatabase();

        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = month === 12
            ? `${year + 1}-01-01`
            : `${year}-${String(month + 1).padStart(2, '0')}-01`;

        const incomeResult = await db.getFirstAsync<{ total: number }>(
            `SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
       WHERE type = 'income' AND date >= ? AND date < ?`,
            [startDate, endDate]
        );

        const expenseResult = await db.getFirstAsync<{ total: number }>(
            `SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
       WHERE type = 'expense' AND date >= ? AND date < ?`,
            [startDate, endDate]
        );

        const countResult = await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM transactions 
       WHERE date >= ? AND date < ?`,
            [startDate, endDate]
        );

        const totalIncome = incomeResult?.total || 0;
        const totalExpense = expenseResult?.total || 0;

        const categories = await db.getAllAsync<{
            category_id: string;
            category_name: string;
            category_color: string;
            total: number;
        }>(
            `SELECT 
        c.id as category_id,
        c.name as category_name,
        c.color as category_color,
        COALESCE(SUM(t.amount), 0) as total
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.type = 'expense' AND t.date >= ? AND t.date < ?
       GROUP BY c.id
       ORDER BY total DESC
       LIMIT 5`,
            [startDate, endDate]
        );

        const topCategories = categories.map(cat => ({
            ...cat,
            percentage: totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0,
        }));

        return {
            month,
            year,
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
            topCategories,
            transactionCount: countResult?.count || 0,
        };
    },

    async getMonthComparison(month: number, year: number): Promise<MonthComparison> {
        const currentMonth = await this.getMonthlyReport(month, year);

        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        const previousMonth = await this.getMonthlyReport(prevMonth, prevYear);

        const calcChange = (current: number, previous: number): number => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        return {
            currentMonth,
            previousMonth: previousMonth.transactionCount > 0 ? previousMonth : null,
            incomeChange: calcChange(currentMonth.totalIncome, previousMonth.totalIncome),
            expenseChange: calcChange(currentMonth.totalExpense, previousMonth.totalExpense),
            balanceChange: calcChange(currentMonth.balance, previousMonth.balance),
        };
    },

    async generateInsights(month: number, year: number): Promise<Insight[]> {
        const comparison = await this.getMonthComparison(month, year);
        const insights: Insight[] = [];

        const { currentMonth, previousMonth, incomeChange, expenseChange } = comparison;

        if (expenseChange > 20 && previousMonth) {
            insights.push({
                type: 'warning',
                icon: 'TrendingUp',
                title: 'Gastos aumentaram',
                description: `Você gastou ${Math.abs(expenseChange).toFixed(0)}% mais que no mês passado.`,
            });
        }

        if (expenseChange < -10 && previousMonth) {
            insights.push({
                type: 'success',
                icon: 'TrendingDown',
                title: 'Ótimo trabalho!',
                description: `Você economizou ${Math.abs(expenseChange).toFixed(0)}% comparado ao mês passado.`,
            });
        }

        if (incomeChange > 10 && previousMonth) {
            insights.push({
                type: 'success',
                icon: 'Wallet',
                title: 'Renda em alta',
                description: `Sua renda aumentou ${incomeChange.toFixed(0)}% este mês!`,
            });
        }

        if (currentMonth.topCategories.length > 0) {
            const top = currentMonth.topCategories[0];
            if (top.percentage > 40) {
                insights.push({
                    type: 'info',
                    icon: 'Target',
                    title: `${top.category_name} domina seus gastos`,
                    description: `${top.percentage.toFixed(0)}% do total de despesas foi em ${top.category_name}.`,
                });
            }
        }

        if (currentMonth.balance > 0) {
            const savingsRate = (currentMonth.balance / currentMonth.totalIncome) * 100;
            if (savingsRate > 20) {
                insights.push({
                    type: 'success',
                    icon: 'PartyPopper',
                    title: 'Excelente taxa de economia!',
                    description: `Você está guardando ${savingsRate.toFixed(0)}% da sua renda.`,
                });
            }
        }

        if (currentMonth.balance < 0) {
            insights.push({
                type: 'warning',
                icon: 'AlertTriangle',
                title: 'Atenção: Saldo negativo',
                description: `Você gastou R$ ${(Math.abs(currentMonth.balance) / 100).toFixed(2)} a mais do que ganhou.`,
            });
        }

        if (currentMonth.transactionCount === 0) {
            insights.push({
                type: 'info',
                icon: 'FileText',
                title: 'Sem registros este mês',
                description: 'Comece a registrar suas transações para ver insights!',
            });
        }

        return insights;
    },

    async getLast6MonthsSummary(): Promise<Array<{ month: string; income: number; expense: number }>> {
        const results: Array<{ month: string; income: number; expense: number }> = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();

            const report = await this.getMonthlyReport(month, year);

            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

            results.push({
                month: monthNames[month - 1],
                income: report.totalIncome,
                expense: report.totalExpense,
            });
        }

        return results;
    },
};
