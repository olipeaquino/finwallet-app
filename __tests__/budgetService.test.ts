describe('BudgetService', () => {
    describe('Budget Status Calculation', () => {
        const getBudgetStatus = (spent: number, amount: number) => {
            const percentage = amount > 0 ? (spent / amount) * 100 : 0;
            if (percentage >= 100) return 'exceeded';
            if (percentage >= 80) return 'warning';
            return 'ok';
        };

        it('should return OK status when under 80%', () => {
            const spent = 50000;
            const budget = 100000;
            expect(getBudgetStatus(spent, budget)).toBe('ok');
        });

        it('should return WARNING status at exactly 80%', () => {
            const spent = 80000;
            const budget = 100000;
            expect(getBudgetStatus(spent, budget)).toBe('warning');
        });

        it('should return WARNING status between 80-99%', () => {
            const spent = 90000;
            const budget = 100000;
            expect(getBudgetStatus(spent, budget)).toBe('warning');
        });

        it('should return EXCEEDED status at exactly 100%', () => {
            const spent = 100000;
            const budget = 100000;
            expect(getBudgetStatus(spent, budget)).toBe('exceeded');
        });

        it('should return EXCEEDED status over 100%', () => {
            const spent = 150000;
            const budget = 100000;
            expect(getBudgetStatus(spent, budget)).toBe('exceeded');
        });

        it('should return OK for zero budget', () => {
            const spent = 50000;
            const budget = 0;
            expect(getBudgetStatus(spent, budget)).toBe('ok');
        });
    });

    describe('Budget Alert Detection', () => {
        const shouldAlert = (spent: number, amount: number): boolean => {
            const percentage = amount > 0 ? (spent / amount) * 100 : 0;
            return percentage >= 80;
        };

        it('should not alert when under 80%', () => {
            expect(shouldAlert(70000, 100000)).toBe(false);
        });

        it('should alert at 80%', () => {
            expect(shouldAlert(80000, 100000)).toBe(true);
        });

        it('should alert at 100%', () => {
            expect(shouldAlert(100000, 100000)).toBe(true);
        });

        it('should alert over 100%', () => {
            expect(shouldAlert(120000, 100000)).toBe(true);
        });
    });

    describe('Budget Summary Calculation', () => {
        interface Budget {
            amount: number;
            spent: number;
        }

        const calculateSummary = (budgets: Budget[]) => {
            const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
            const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
            const overLimitCount = budgets.filter(b => b.amount > 0 && b.spent >= b.amount).length;
            const nearLimitCount = budgets.filter(b => {
                const pct = b.amount > 0 ? (b.spent / b.amount) * 100 : 0;
                return pct >= 80 && pct < 100;
            }).length;

            return { totalBudget, totalSpent, overLimitCount, nearLimitCount };
        };

        it('should calculate totals correctly', () => {
            const budgets = [
                { amount: 100000, spent: 50000 },
                { amount: 200000, spent: 150000 },
            ];
            const summary = calculateSummary(budgets);
            expect(summary.totalBudget).toBe(300000);
            expect(summary.totalSpent).toBe(200000);
        });

        it('should count over limit budgets', () => {
            const budgets = [
                { amount: 100000, spent: 120000 },
                { amount: 100000, spent: 50000 },
            ];
            const summary = calculateSummary(budgets);
            expect(summary.overLimitCount).toBe(1);
        });

        it('should count near limit budgets', () => {
            const budgets = [
                { amount: 100000, spent: 85000 },
                { amount: 100000, spent: 50000 },
                { amount: 100000, spent: 100000 },
            ];
            const summary = calculateSummary(budgets);
            expect(summary.nearLimitCount).toBe(1);
        });
    });
});
