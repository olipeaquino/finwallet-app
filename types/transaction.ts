export type TransactionType = 'income' | 'expense';

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    description: string;
    category_id: string;
    date: string;
    is_recurring: boolean;
    recurring_day?: number;
    attachment_uri?: string;
    created_at: string;
    updated_at: string;
    category_name?: string;
    category_icon?: string;
    category_color?: string;
}

export interface CreateTransactionDTO {
    type: TransactionType;
    amount: number;
    description: string;
    category_id: string;
    date: string;
    is_recurring?: boolean;
    recurring_day?: number;
    attachment_uri?: string;
}

export interface TransactionFilters {
    type?: TransactionType;
    category_id?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    limit?: number;
    offset?: number;
}
