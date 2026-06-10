export type CategoryType = 'income' | 'expense' | 'both';

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: CategoryType;
    is_custom: boolean;
    is_active: boolean;
    created_at: string;
}

export interface CreateCategoryDTO {
    name: string;
    icon: string;
    color: string;
    type: CategoryType;
}
