import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const groups = sqliteTable('groups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const members = sqliteTable('members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: integer('group_id')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const expenses = sqliteTable('expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: integer('group_id')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  // Total amount of the expense, in integer cents.
  amountCents: integer('amount_cents').notNull(),
  paidByMemberId: integer('paid_by_member_id')
    .notNull()
    .references(() => members.id),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
})

// One row per member per expense: how much of that expense they owe.
export const expenseSplits = sqliteTable('expense_splits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  expenseId: integer('expense_id')
    .notNull()
    .references(() => expenses.id, { onDelete: 'cascade' }),
  memberId: integer('member_id')
    .notNull()
    .references(() => members.id, { onDelete: 'cascade' }),
  // This member's share of the expense, in integer cents.
  shareCents: integer('share_cents').notNull(),
})

export const groupsRelations = relations(groups, ({ many }) => ({
  members: many(members),
  expenses: many(expenses),
}))

export const membersRelations = relations(members, ({ one, many }) => ({
  group: one(groups, { fields: [members.groupId], references: [groups.id] }),
  expensesPaid: many(expenses),
  splits: many(expenseSplits),
}))

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  group: one(groups, { fields: [expenses.groupId], references: [groups.id] }),
  paidBy: one(members, { fields: [expenses.paidByMemberId], references: [members.id] }),
  splits: many(expenseSplits),
}))

export const expenseSplitsRelations = relations(expenseSplits, ({ one }) => ({
  expense: one(expenses, { fields: [expenseSplits.expenseId], references: [expenses.id] }),
  member: one(members, { fields: [expenseSplits.memberId], references: [members.id] }),
}))

export type Group = typeof groups.$inferSelect
export type NewGroup = typeof groups.$inferInsert

export type Member = typeof members.$inferSelect
export type NewMember = typeof members.$inferInsert

export type Expense = typeof expenses.$inferSelect
export type NewExpense = typeof expenses.$inferInsert

export type ExpenseSplit = typeof expenseSplits.$inferSelect
export type NewExpenseSplit = typeof expenseSplits.$inferInsert
