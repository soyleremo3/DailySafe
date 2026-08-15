import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL, SCHEMA_VERSION, SEED_SETTINGS_SQL } from './schema';

const DB_NAME = 'dailysafe.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  if (currentVersion < SCHEMA_VERSION) {
    await db.execAsync(CREATE_TABLES_SQL);
    await db.execAsync(SEED_SETTINGS_SQL);
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  }
}

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync('PRAGMA journal_mode = WAL;');
      await db.execAsync('PRAGMA foreign_keys = ON;');
      await migrate(db);
      return db;
    })();
  }
  return dbPromise;
}

/** Test/dev only: drops the cached connection so a fresh in-memory db can be opened. */
export function resetDbCache(): void {
  dbPromise = null;
}

/** Wipes every table and restores default settings. Used by the Settings "reset all data" action. */
export async function resetAllData(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    DELETE FROM transactions;
    DELETE FROM bills;
    DELETE FROM goals;
    DELETE FROM income_sources;
    UPDATE settings SET
      currency = 'USD',
      current_balance = 0,
      savings_target_type = 'none',
      savings_target_amount = 0,
      onboarding_complete = 0,
      theme_mode = 'system',
      week_starts_on = 0,
      is_pro_dev = 0
    WHERE id = 1;
  `);
}
