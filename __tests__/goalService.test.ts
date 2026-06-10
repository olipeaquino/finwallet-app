describe('GoalService', () => {
    describe('Goal Progress Calculation', () => {
        const calculateProgress = (currentAmount: number, targetAmount: number): number => {
            if (targetAmount <= 0) return 0;
            return Math.min((currentAmount / targetAmount) * 100, 100);
        };

        it('should calculate 0% for zero current amount', () => {
            expect(calculateProgress(0, 100000)).toBe(0);
        });

        it('should calculate 50% correctly', () => {
            expect(calculateProgress(50000, 100000)).toBe(50);
        });

        it('should cap at 100% when exceeded', () => {
            expect(calculateProgress(120000, 100000)).toBe(100);
        });

        it('should return 0 for zero target', () => {
            expect(calculateProgress(50000, 0)).toBe(0);
        });
    });

    describe('Days Remaining Calculation', () => {
        const calculateDaysRemaining = (deadline: Date): number => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const deadlineDate = new Date(deadline);
            deadlineDate.setHours(0, 0, 0, 0);
            const diffTime = deadlineDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return Math.max(0, diffDays);
        };

        it('should return 0 for past dates', () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 10);
            expect(calculateDaysRemaining(pastDate)).toBe(0);
        });

        it('should return 30 for date 30 days ahead', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 30);
            expect(calculateDaysRemaining(futureDate)).toBe(30);
        });

        it('should return 0 for today', () => {
            const today = new Date();
            expect(calculateDaysRemaining(today)).toBe(0);
        });
    });

    describe('Goal Status', () => {
        interface Goal {
            currentAmount: number;
            targetAmount: number;
            deadline: Date;
        }

        const getGoalStatus = (goal: Goal): 'completed' | 'on_track' | 'behind' | 'expired' => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const today = new Date();

            if (progress >= 100) return 'completed';
            if (goal.deadline < today) return 'expired';

            const startDate = new Date(goal.deadline);
            startDate.setMonth(startDate.getMonth() - 1);
            const totalDays = (goal.deadline.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
            const daysElapsed = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
            const expectedProgress = (daysElapsed / totalDays) * 100;

            return progress >= expectedProgress * 0.8 ? 'on_track' : 'behind';
        };

        it('should return completed when 100% reached', () => {
            const goal: Goal = {
                currentAmount: 100000,
                targetAmount: 100000,
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            };
            expect(getGoalStatus(goal)).toBe('completed');
        });

        it('should return expired for past deadline with incomplete goal', () => {
            const goal: Goal = {
                currentAmount: 50000,
                targetAmount: 100000,
                deadline: new Date(Date.now() - 1000),
            };
            expect(getGoalStatus(goal)).toBe('expired');
        });
    });

    describe('Monthly Deposit Suggestion', () => {
        const suggestMonthlyDeposit = (remaining: number, monthsLeft: number): number => {
            if (monthsLeft <= 0) return remaining;
            return Math.ceil(remaining / monthsLeft);
        };

        it('should divide evenly across months', () => {
            const remaining = 120000;
            const months = 4;
            expect(suggestMonthlyDeposit(remaining, months)).toBe(30000);
        });

        it('should round up to nearest cent', () => {
            const remaining = 100000;
            const months = 3;
            expect(suggestMonthlyDeposit(remaining, months)).toBe(33334);
        });

        it('should return full amount for 0 months left', () => {
            const remaining = 50000;
            expect(suggestMonthlyDeposit(remaining, 0)).toBe(50000);
        });
    });
});
