import { getDatabase } from '@/db';
import { Category, CreateCategoryDTO } from '@/types';
import { generateUUID } from '@/utils';

export const categoryService = {
    async getAll(type?: 'income' | 'expense'): Promise<Category[]> {
        const db = await getDatabase();

        let query = `SELECT * FROM categories WHERE is_active = 1`;
        const params: any[] = [];

        if (type) {
            query += ` AND (type = ? OR type = 'both')`;
            params.push(type);
        }

        query += ` ORDER BY is_custom ASC, name ASC`;

        const result = await db.getAllAsync<Category>(query, params);
        return result.map(row => ({
            ...row,
            is_custom: Boolean(row.is_custom),
            is_active: Boolean(row.is_active),
        }));
    },

    async getById(id: string): Promise<Category | null> {
        const db = await getDatabase();
        const result = await db.getFirstAsync<Category>(
            `SELECT * FROM categories WHERE id = ?`,
            [id]
        );

        if (!result) return null;

        return {
            ...result,
            is_custom: Boolean(result.is_custom),
            is_active: Boolean(result.is_active),
        };
    },

    async create(data: CreateCategoryDTO): Promise<Category> {
        const db = await getDatabase();
        const id = generateUUID();
        const now = new Date().toISOString();

        await db.runAsync(
            `INSERT INTO categories (id, name, icon, color, type, is_custom, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, 1, 1, ?)`,
            [id, data.name, data.icon, data.color, data.type, now]
        );

        return this.getById(id) as Promise<Category>;
    },

    async update(id: string, data: Partial<CreateCategoryDTO>): Promise<Category> {
        const db = await getDatabase();

        const updates: string[] = [];
        const params: any[] = [];

        if (data.name) {
            updates.push('name = ?');
            params.push(data.name);
        }
        if (data.icon) {
            updates.push('icon = ?');
            params.push(data.icon);
        }
        if (data.color) {
            updates.push('color = ?');
            params.push(data.color);
        }

        if (updates.length > 0) {
            params.push(id);
            await db.runAsync(
                `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
                params
            );
        }

        return this.getById(id) as Promise<Category>;
    },

    async deactivate(id: string): Promise<void> {
        const db = await getDatabase();
        await db.runAsync(
            `UPDATE categories SET is_active = 0 WHERE id = ? AND is_custom = 1`,
            [id]
        );
    },

    async reactivate(id: string): Promise<void> {
        const db = await getDatabase();
        await db.runAsync(
            `UPDATE categories SET is_active = 1 WHERE id = ?`,
            [id]
        );
    },
};
