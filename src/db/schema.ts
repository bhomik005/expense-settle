import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

export const groups = sqliteTable('groups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
})

export const members = sqliteTable('members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: integer('group_id')
    .notNull()
    .references(() => groups.id),
  name: text('name').notNull(),
})

export const expenses = sqliteTable('expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: integer('group_id')
    .notNull()
    .references(() => groups.id),
  description: text('description').notNull(),
  amountCents: integer('amount_cents').notNull(),
  paidByMemberId: integer('paid_by_member_id')
    .notNull()
    .references(() => members.id),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})

export const expenseSplits = sqliteTable('expense_splits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  expenseId: integer('expense_id')
    .notNull()
    .references(() => expenses.id),
  memberId: integer('member_id')
    .notNull()
    .references(() => members.id),
  amountCents: integer('amount_cents').notNull(),
})
