import Database from 'better-sqlite3'
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL REFERENCES groups(id),
    name TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL REFERENCES groups(id),
    description TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    paid_by_member_id INTEGER NOT NULL REFERENCES members(id)
  );
`

let cachedDb: BetterSQLite3Database<typeof schema> | null = null

/** Returns the shared app database, creating it (and its tables) on first use. */
export function getDb(): BetterSQLite3Database<typeof schema> {
  if (!cachedDb) {
    const sqlite = new Database(process.env.DATABASE_URL ?? 'sqlite.db')
    sqlite.pragma('journal_mode = WAL')
    sqlite.exec(CREATE_TABLES_SQL)
    cachedDb = drizzle(sqlite, { schema })
  }
  return cachedDb
}

/** Test-only: drops the cached connection so the next getDb() call opens a fresh one. */
export function resetDbForTests(): void {
  cachedDb = null
}
