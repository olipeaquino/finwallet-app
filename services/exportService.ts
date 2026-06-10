// @ts-nocheck
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { transactionService } from './transactionService';
import { goalService } from './goalService';
import { getDatabase } from '@/db';

export const exportService = {
    async exportTransactionsToCSV(): Promise<string> {
        const transactions = await transactionService.getAll({});

        const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor (R$)'];

        const rows = transactions.map((t: any) => [
            new Date(t.date).toLocaleDateString('pt-BR'),
            `"${t.description.replace(/"/g, '""')}"`,
            `"${t.category_name || 'Sem categoria'}"`,
            t.type === 'income' ? 'Receita' : 'Despesa',
            (t.amount / 100).toFixed(2).replace('.', ','),
        ]);

        const csvContent = [
            headers.join(';'),
            ...rows.map((row: string[]) => row.join(';'))
        ].join('\n');

        const bom = '\ufeff';

        const fileName = `finwallet_transacoes_${new Date().toISOString().split('T')[0]}.csv`;
        const filePath = `${FileSystem.documentDirectory}${fileName}`;

        await FileSystem.writeAsStringAsync(filePath, bom + csvContent);

        return filePath;
    },

    async exportGoalsToCSV(): Promise<string> {
        const goals = await goalService.getAll(true);

        const headers = ['Nome', 'Meta (R$)', 'Acumulado (R$)', 'Progresso (%)', 'Prazo', 'Status'];

        const rows = goals.map((g: any) => {
            const progress = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
            return [
                `"${g.name.replace(/"/g, '""')}"`,
                (g.target_amount / 100).toFixed(2).replace('.', ','),
                (g.current_amount / 100).toFixed(2).replace('.', ','),
                progress.toFixed(1).replace('.', ','),
                new Date(g.deadline).toLocaleDateString('pt-BR'),
                g.is_completed ? 'Concluída' : 'Em andamento',
            ];
        });

        const csvContent = [
            headers.join(';'),
            ...rows.map((row: string[]) => row.join(';'))
        ].join('\n');

        const bom = '\ufeff';

        const fileName = `finwallet_metas_${new Date().toISOString().split('T')[0]}.csv`;
        const filePath = `${FileSystem.documentDirectory}${fileName}`;

        await FileSystem.writeAsStringAsync(filePath, bom + csvContent);

        return filePath;
    },

    async exportBackup(): Promise<string> {
        const db = await getDatabase();

        const transactions = await db.getAllAsync('SELECT * FROM transactions');
        const categories = await db.getAllAsync('SELECT * FROM categories');
        const goals = await db.getAllAsync('SELECT * FROM goals');
        const goalDeposits = await db.getAllAsync('SELECT * FROM goal_deposits');

        const backup = {
            version: 1,
            exportedAt: new Date().toISOString(),
            data: {
                transactions,
                categories,
                goals,
                goalDeposits,
            },
        };

        const fileName = `finwallet_backup_${new Date().toISOString().split('T')[0]}.json`;
        const filePath = `${FileSystem.documentDirectory}${fileName}`;

        await FileSystem.writeAsStringAsync(filePath, JSON.stringify(backup, null, 2));

        return filePath;
    },

    async importBackup(filePath: string): Promise<{ success: boolean; message: string }> {
        try {
            const content = await FileSystem.readAsStringAsync(filePath);

            const backup = JSON.parse(content);

            if (!backup.version || !backup.data) {
                return { success: false, message: 'Arquivo de backup inválido' };
            }

            const db = await getDatabase();

            await db.runAsync('DELETE FROM goal_deposits');
            await db.runAsync('DELETE FROM goals');
            await db.runAsync('DELETE FROM transactions');
            await db.runAsync('DELETE FROM categories');

            for (const cat of backup.data.categories) {
                await db.runAsync(
                    `INSERT INTO categories (id, name, type, icon, color, is_default, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [cat.id, cat.name, cat.type, cat.icon, cat.color, cat.is_default, cat.created_at]
                );
            }

            for (const t of backup.data.transactions) {
                await db.runAsync(
                    `INSERT INTO transactions (id, description, amount, type, category_id, date, note, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [t.id, t.description, t.amount, t.type, t.category_id, t.date, t.note, t.created_at, t.updated_at]
                );
            }

            for (const g of backup.data.goals) {
                await db.runAsync(
                    `INSERT INTO goals (id, name, target_amount, current_amount, deadline, icon, color, is_completed, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [g.id, g.name, g.target_amount, g.current_amount, g.deadline, g.icon, g.color, g.is_completed, g.created_at, g.updated_at]
                );
            }

            for (const d of backup.data.goalDeposits) {
                await db.runAsync(
                    `INSERT INTO goal_deposits (id, goal_id, amount, date, note, created_at)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [d.id, d.goal_id, d.amount, d.date, d.note, d.created_at]
                );
            }

            return { success: true, message: 'Backup restaurado com sucesso!' };
        } catch (error) {
            console.error('Import error:', error);
            return { success: false, message: 'Erro ao restaurar backup' };
        }
    },

    async shareFile(filePath: string): Promise<boolean> {
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(filePath, {
                mimeType: filePath.endsWith('.csv') ? 'text/csv' : 'application/json',
                dialogTitle: 'Compartilhar arquivo',
            });
            return true;
        }
        return false;
    },
};
