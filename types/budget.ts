export interface Budget {
    id: string;
    category_id: string;
    category_name?: string;
    category_color?: string;
    category_icon?: string;
    amount: number;
    spent: number;
    month: number;
    year: number;
    created_at: string;
    updated_at: string;
}

export interface CreateBudgetDTO {
    category_id: string;
    amount: number;
    month: number;
    year: number;
}

export interface UpdateBudgetDTO {
    amount?: number;
}

export interface BudgetSummary {
    totalBudget: number;
    totalSpent: number;
    budgetsCount: number;
    overLimitCount: number;
    nearLimitCount: number;
}
