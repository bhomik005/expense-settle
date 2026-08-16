import { beforeEach, describe, expect, it } from 'vitest'
import { createDb, type AppDatabase } from './client'
import { GroupNotFoundError, recordExpense, UnknownMemberError } from './expenses'
import { groups, members } from './schema'

describe('recordExpense', () => {
  let db: AppDatabase
  let groupId: number
  let memberIds: number[]

  beforeEach(() => {
    db = createDb(':memory:')
    const group = db.insert(groups).values({ name: 'Roommates' }).returning().get()
    groupId = group.id
    memberIds = ['Alice', 'Bob', 'Carol'].map(
      (name) => db.insert(members).values({ groupId, name }).returning().get().id
    )
  })

  it('records an expense split equally across all group members by default', () => {
    const expense = recordExpense(db, groupId, {
      description: 'Groceries',
      amountCents: 1000,
      paidByMemberId: memberIds[0]!,
      splitBetweenMemberIds: [],
    })

    expect(expense.groupId).toBe(groupId)
    expect(expense.amountCents).toBe(1000)
    expect(expense.splits).toHaveLength(3)
    expect(expense.splits.reduce((sum, s) => sum + s.amountCents, 0)).toBe(1000)
    expect(expense.splits.map((s) => s.memberId).sort()).toEqual([...memberIds].sort())
  })

  it('records an expense split across an explicit subset of members', () => {
    const expense = recordExpense(db, groupId, {
      description: 'Coffee',
      amountCents: 500,
      paidByMemberId: memberIds[0]!,
      splitBetweenMemberIds: [memberIds[0]!, memberIds[1]!],
    })

    expect(expense.splits).toEqual([
      { memberId: memberIds[0], amountCents: 250 },
      { memberId: memberIds[1], amountCents: 250 },
    ])
  })

  it('throws GroupNotFoundError for an unknown group', () => {
    expect(() =>
      recordExpense(db, groupId + 999, {
        description: 'Groceries',
        amountCents: 1000,
        paidByMemberId: memberIds[0]!,
        splitBetweenMemberIds: [],
      })
    ).toThrow(GroupNotFoundError)
  })

  it('throws UnknownMemberError when the payer is not in the group', () => {
    expect(() =>
      recordExpense(db, groupId, {
        description: 'Groceries',
        amountCents: 1000,
        paidByMemberId: 999999,
        splitBetweenMemberIds: [],
      })
    ).toThrow(UnknownMemberError)
  })

  it('throws UnknownMemberError when a split participant is not in the group', () => {
    expect(() =>
      recordExpense(db, groupId, {
        description: 'Groceries',
        amountCents: 1000,
        paidByMemberId: memberIds[0]!,
        splitBetweenMemberIds: [memberIds[0]!, 999999],
      })
    ).toThrow(UnknownMemberError)
  })
})
