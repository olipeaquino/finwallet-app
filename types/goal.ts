export interface Goal {
    id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    deadline: string;
    icon: string;
    color: string;
    is_completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateGoalDTO {
    name: string;
    target_amount: number;
    deadline: string;
    icon?: string;
    color?: string;
}

export interface GoalDeposit {
    id: string;
    goal_id: string;
    amount: number;
    date: string;
    note?: string;
    created_at: string;
}

export interface CreateGoalDepositDTO {
    goal_id: string;
    amount: number;
    date: string;
    note?: string;
}
