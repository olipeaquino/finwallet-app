import { create } from 'zustand';
import { Transaction, CreateTransactionDTO, TransactionFilters, Category } from '@/types';
import { transactionService, categoryService } from '@/services';

interface TransactionState {
    transactions: Transaction[];
    categories: Category[];

    totalIncome: number;
    totalExpense: number;
    balance: number;

    categoryDistribution: Array<{
        category_id: string;
        category_name: string;
        category_color: string;
        total: number;
        percentage: number;
    }>;

    monthlyEvolution: Array<{
        month: string;
        year: number;
        income: number;
        expense: number;
    }>;

    isLoading: boolean;
    error: string | null;
    filters: TransactionFilters;

    fetchTransactions: (filters?: TransactionFilters) => Promise<void>;
    fetchCategories: (type?: 'income' | 'expense') => Promise<void>;
    fetchSummary: (year?: number, month?: number) => Promise<void>;
    fetchCategoryDistribution: (year?: number, month?: number) => Promise<void>;
    fetchMonthlyEvolution: () => Promise<void>;
    addTransaction: (data: CreateTransactionDTO) => Promise<Transaction>;
    updateTransaction: (id: string, data: Partial<CreateTransactionDTO>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    setFilters: (filters: Partial<TransactionFilters>) => void;
    clearFilters: () => void;
    refreshAll: () => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
    transactions: [],
    categories: [],
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    categoryDistribution: [],
    monthlyEvolution: [],
    isLoading: false,
    error: null,
    filters: {},

    fetchTransactions: async (filters?: TransactionFilters) => {
        set({ isLoading: true, error: null });
        try {
            const mergedFilters = { ...get().filters, ...filters };
            const transactions = await transactionService.getAll(mergedFilters);
            set({ transactions, filters: mergedFilters, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    fetchCategories: async (type?: 'income' | 'expense') => {
        try {
            const categories = await categoryService.getAll(type);
            set({ categories });
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    },

    fetchSummary: async (year?: number, month?: number) => {
        try {
            let summary;
            if (year && month) {
                summary = await transactionService.getMonthlySummary(year, month);
            } else {
                summary = await transactionService.getTotalBalance();
            }
            set({
                totalIncome: summary.income,
                totalExpense: summary.expense,
                balance: summary.balance,
            });
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    },

    fetchCategoryDistribution: async (year?: number, month?: number) => {
        try {
            const now = new Date();
            const y = year || now.getFullYear();
            const m = month || now.getMonth() + 1;

            const distribution = await transactionService.getCategoryDistribution(y, m);
            set({ categoryDistribution: distribution });
        } catch (error) {
            console.error('Error fetching category distribution:', error);
        }
    },

    fetchMonthlyEvolution: async () => {
        try {
            const evolution = await transactionService.getMonthlyEvolution(6);
            set({ monthlyEvolution: evolution });
        } catch (error) {
            console.error('Error fetching monthly evolution:', error);
        }
    },

    addTransaction: async (data: CreateTransactionDTO) => {
        set({ isLoading: true, error: null });
        try {
            const transaction = await transactionService.create(data);

            // Solta o loading assim que o INSERT termina e atualiza os agregados em
            // segundo plano — assim o modal fecha na hora em vez de travar esperando
            // as 5 queries do refreshAll().
            set({ isLoading: false });
            void get().refreshAll();
            return transaction;
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
        }
    },

    updateTransaction: async (id: string, data: Partial<CreateTransactionDTO>) => {
        set({ isLoading: true, error: null });
        try {
            await transactionService.update(id, data);
            set({ isLoading: false });
            void get().refreshAll();
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
        }
    },

    deleteTransaction: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await transactionService.delete(id);
            set({ isLoading: false });
            void get().refreshAll();
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
        }
    },

    setFilters: (filters: Partial<TransactionFilters>) => {
        const newFilters = { ...get().filters, ...filters };
        set({ filters: newFilters });
        get().fetchTransactions();
    },

    clearFilters: () => {
        set({ filters: {} });
        get().fetchTransactions();
    },

    refreshAll: async () => {
        const { fetchTransactions, fetchSummary, fetchCategoryDistribution, fetchCategories, fetchMonthlyEvolution } = get();
        await Promise.all([
            fetchTransactions(),
            fetchSummary(),
            fetchCategoryDistribution(),
            fetchCategories(),
            fetchMonthlyEvolution(),
        ]);
    },
}));
