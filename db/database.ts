import * as SQLite from 'expo-sqlite';
import { SCHEMA_STATEMENTS, SCHEMA_VERSION } from './schema';
import { DEFAULT_CATEGORIES } from '@/constants';
import { generateUUID } from '@/utils/uuid';

const DATABASE_NAME = 'finwallet.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (db) return db;

    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    return db;
}

export async function initializeDatabase(): Promise<void> {
    const database = await getDatabase();

    await database.execAsync('PRAGMA foreign_keys = ON;');

    for (const statement of SCHEMA_STATEMENTS) {
        await database.execAsync(statement);
    }

    await seedDefaultCategories(database);

    console.log('Database initialized successfully');
}

async function seedDefaultCategories(database: SQLite.SQLiteDatabase): Promise<void> {
    const result = await database.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM categories'
    );

    if (result && result.count > 0) {
        return;
    }

    console.log('Seeding default categories...');

    for (const category of DEFAULT_CATEGORIES) {
        const id = generateUUID();
        await database.runAsync(
            `INSERT INTO categories (id, name, icon, color, type, is_custom, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, category.name, category.icon, category.color, category.type, category.is_custom ? 1 : 0, category.is_active ? 1 : 0]
        );
    }

    console.log(`Seeded ${DEFAULT_CATEGORIES.length} default categories`);
}

export async function closeDatabase(): Promise<void> {
    if (db) {
        await db.closeAsync();
        db = null;
    }
}

export async function resetDatabase(): Promise<void> {
    const database = await getDatabase();

    await database.execAsync(`
    DROP TABLE IF EXISTS budgets;
    DROP TABLE IF EXISTS goal_deposits;
    DROP TABLE IF EXISTS goals;
    DROP TABLE IF EXISTS transactions;
    DROP TABLE IF EXISTS categories;
  `);

    await initializeDatabase();
}

export async function clearAllData(): Promise<void> {
    const database = await getDatabase();

    await database.execAsync(`
    DELETE FROM budgets;
    DELETE FROM goal_deposits;
    DELETE FROM goals;
    DELETE FROM transactions;
  `);

    console.log('All user data cleared');
}
