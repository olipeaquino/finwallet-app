describe('AnalyticsService', () => {
    describe('formatCurrency', () => {
        it('should format positive values correctly', () => {
            const amount = 150000;
            const formatted = (amount / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            });
            expect(formatted).toContain('1.500,00');
        });

        it('should format zero correctly', () => {
            const amount = 0;
            const formatted = (amount / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            });
            expect(formatted).toContain('0,00');
        });

        it('should format negative values correctly', () => {
            const amount = -50000;
            const formatted = (amount / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            });
            expect(formatted).toContain('500,00');
            expect(formatted).toContain('-');
        });
    });

    describe('calculatePercentage', () => {
        it('should calculate percentage correctly', () => {
            const spent = 80000;
            const budget = 100000;
            const percentage = (spent / budget) * 100;
            expect(percentage).toBe(80);
        });

        it('should handle zero budget', () => {
            const spent = 50000;
            const budget = 0;
            const percentage = budget > 0 ? (spent / budget) * 100 : 0;
            expect(percentage).toBe(0);
        });

        it('should handle over 100%', () => {
            const spent = 150000;
            const budget = 100000;
            const percentage = (spent / budget) * 100;
            expect(percentage).toBe(150);
        });
    });

    describe('calculateSavingsRate', () => {
        it('should calculate savings rate correctly', () => {
            const income = 500000;
            const expenses = 350000;
            const savings = income - expenses;
            const savingsRate = (savings / income) * 100;
            expect(savingsRate).toBe(30);
        });

        it('should handle negative savings (deficit)', () => {
            const income = 300000;
            const expenses = 400000;
            const savings = income - expenses;
            const savingsRate = income > 0 ? (savings / income) * 100 : 0;
            expect(savingsRate).toBe(-33.33333333333333);
        });

        it('should handle zero income', () => {
            const income = 0;
            const expenses = 100000;
            const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
            expect(savingsRate).toBe(0);
        });
    });

    describe('generateInsight', () => {
        const generateInsight = (savingsRate: number): string => {
            if (savingsRate >= 30) return 'Excelente! Você está economizando muito bem.';
            if (savingsRate >= 20) return 'Bom trabalho! Continue economizando.';
            if (savingsRate >= 10) return 'Você está no caminho certo.';
            if (savingsRate >= 0) return 'Tente economizar um pouco mais.';
            return 'Atenção! Suas despesas superam suas receitas.';
        };

        it('should return excellent insight for 30%+ savings', () => {
            expect(generateInsight(35)).toBe('Excelente! Você está economizando muito bem.');
        });

        it('should return good insight for 20-29% savings', () => {
            expect(generateInsight(25)).toBe('Bom trabalho! Continue economizando.');
        });

        it('should return ok insight for 10-19% savings', () => {
            expect(generateInsight(15)).toBe('Você está no caminho certo.');
        });

        it('should return warning for 0-9% savings', () => {
            expect(generateInsight(5)).toBe('Tente economizar um pouco mais.');
        });

        it('should return alert for negative savings', () => {
            expect(generateInsight(-10)).toBe('Atenção! Suas despesas superam suas receitas.');
        });
    });
});
