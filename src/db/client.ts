import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

const SCHEMA_SQL = `
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
  paid_by_member_id INTEGER NOT NULL REFERENCES members(id),
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS expense_splits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  expense_id INTEGER NOT NULL REFERENCES expenses(id),
  member_id INTEGER NOT NULL REFERENCES members(id),
  amount_cents INTEGER NOT NULL
);
`

export type AppDatabase = BetterSQLite3Database<typeof schema>

export function createDb(path = ':memory:'): AppDatabase {
  if (path !== ':memory:') {
    mkdirSync(dirname(path), { recursive: true })
  }
  const sqlite = new Database(path)
  sqlite.pragma('journal_mode = WAL')
  sqlite.exec(SCHEMA_SQL)
  return drizzle(sqlite, { schema })
}

const globalForDb = globalThis as unknown as { db?: AppDatabase }

export const db =
  globalForDb.db ?? createDb(process.env.DATABASE_PATH ?? 'data/expense-settle.db')

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db
}
