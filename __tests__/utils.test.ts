describe('Utils', () => {
    describe('Amount Formatting', () => {
        const formatAmount = (cents: number): string => {
            return (cents / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            });
        };

        it('should format cents to currency', () => {
            expect(formatAmount(150000)).toContain('1.500,00');
        });

        it('should format zero', () => {
            expect(formatAmount(0)).toContain('0,00');
        });

        it('should format small amounts', () => {
            expect(formatAmount(50)).toContain('0,50');
        });

        it('should format large amounts', () => {
            expect(formatAmount(10000000)).toContain('100.000,00');
        });
    });

    describe('Parse Amount Input', () => {
        const parseAmountInput = (text: string): number => {
            const cleaned = text.replace(/[^\d]/g, '');
            return parseInt(cleaned) || 0;
        };

        it('should parse numeric input', () => {
            expect(parseAmountInput('15000')).toBe(15000);
        });

        it('should remove non-numeric characters', () => {
            expect(parseAmountInput('R$ 1.500,00')).toBe(150000);
        });

        it('should return 0 for empty input', () => {
            expect(parseAmountInput('')).toBe(0);
        });

        it('should return 0 for non-numeric input', () => {
            expect(parseAmountInput('abc')).toBe(0);
        });
    });

    describe('Date Formatting', () => {
        const formatDate = (date: Date): string => {
            return date.toLocaleDateString('pt-BR');
        };

        const formatDateLong = (date: Date): string => {
            return date.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        };

        it('should format date in short format', () => {
            const date = new Date('2026-01-11');
            expect(formatDate(date)).toMatch(/\d{2}\/\d{2}\/\d{4}/);
        });

        it('should format date in long format', () => {
            const date = new Date('2026-01-11');
            const formatted = formatDateLong(date);
            expect(formatted).toContain('2026');
        });
    });

    describe('UUID Generation', () => {
        const generateId = (): string => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };

        it('should generate valid UUID format', () => {
            const uuid = generateId();
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            expect(uuid).toMatch(uuidRegex);
        });

        it('should generate unique UUIDs', () => {
            const uuid1 = generateId();
            const uuid2 = generateId();
            expect(uuid1).not.toBe(uuid2);
        });
    });

    describe('Adaptive Font Size', () => {
        const getAdaptiveFontSize = (amount: number, baseSize: number): number => {
            const absAmount = Math.abs(amount / 100);

            if (absAmount >= 10000000) return baseSize * 0.5;
            if (absAmount >= 1000000) return baseSize * 0.6;
            if (absAmount >= 100000) return baseSize * 0.7;
            if (absAmount >= 10000) return baseSize * 0.85;
            return baseSize;
        };

        it('should return base size for small amounts', () => {
            expect(getAdaptiveFontSize(500000, 20)).toBe(20);
        });

        it('should reduce size for 10K+ amounts', () => {
            expect(getAdaptiveFontSize(1000000, 20)).toBe(17);
        });

        it('should reduce more for 100K+ amounts', () => {
            expect(getAdaptiveFontSize(10000000, 20)).toBe(14);
        });

        it('should reduce significantly for 1M+ amounts', () => {
            expect(getAdaptiveFontSize(100000000, 20)).toBe(12);
        });

        it('should reduce to half for 10M+ amounts', () => {
            expect(getAdaptiveFontSize(1000000000, 20)).toBe(10);
        });
    });
});
