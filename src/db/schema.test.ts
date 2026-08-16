import { getTableConfig } from 'drizzle-orm/sqlite-core'
import { describe, expect, it } from 'vitest'

import { expenses, expenseSplits, groups, members } from './schema'

describe('schema', () => {
  it('names each table after its entity', () => {
    expect(getTableConfig(groups).name).toBe('groups')
    expect(getTableConfig(members).name).toBe('members')
    expect(getTableConfig(expenses).name).toBe('expenses')
    expect(getTableConfig(expenseSplits).name).toBe('expense_splits')
  })

  it('links members and expenses back to their group', () => {
    const memberColumns = getTableConfig(members).columns.map((c) => c.name)
    const expenseColumns = getTableConfig(expenses).columns.map((c) => c.name)
    expect(memberColumns).toContain('group_id')
    expect(expenseColumns).toContain('group_id')
  })

  it('stores money as integer cents, never floats', () => {
    const amountCents = getTableConfig(expenses).columns.find((c) => c.name === 'amount_cents')
    const shareCents = getTableConfig(expenseSplits).columns.find((c) => c.name === 'share_cents')
    expect(amountCents?.dataType).toBe('number')
    expect(amountCents?.columnType).toBe('SQLiteInteger')
    expect(shareCents?.dataType).toBe('number')
    expect(shareCents?.columnType).toBe('SQLiteInteger')
  })

  it('records who paid an expense and who owes a share of it', () => {
    const expenseColumns = getTableConfig(expenses).columns.map((c) => c.name)
    const splitColumns = getTableConfig(expenseSplits).columns.map((c) => c.name)
    expect(expenseColumns).toContain('paid_by_member_id')
    expect(splitColumns).toEqual(
      expect.arrayContaining(['expense_id', 'member_id', 'share_cents']),
    )
  })
})
