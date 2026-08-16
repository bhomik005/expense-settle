import { eq } from 'drizzle-orm'
import { computeEqualSplit, type RecordExpenseInput } from '@/lib/expenses'
import type { AppDatabase } from './client'
import { expenses, expenseSplits, groups, members } from './schema'

export class GroupNotFoundError extends Error {
  constructor(groupId: number) {
    super(`Group ${groupId} not found`)
    this.name = 'GroupNotFoundError'
  }
}

export class UnknownMemberError extends Error {
  constructor(memberIds: number[]) {
    super(`Member(s) not found in group: ${memberIds.join(', ')}`)
    this.name = 'UnknownMemberError'
  }
}

export interface RecordedExpense {
  id: number
  groupId: number
  description: string
  amountCents: number
  paidByMemberId: number
  createdAt: Date
  splits: Array<{ memberId: number; amountCents: number }>
}

export function recordExpense(
  db: AppDatabase,
  groupId: number,
  input: RecordExpenseInput
): RecordedExpense {
  const group = db.select().from(groups).where(eq(groups.id, groupId)).get()
  if (!group) {
    throw new GroupNotFoundError(groupId)
  }

  const groupMembers = db.select().from(members).where(eq(members.groupId, groupId)).all()
  const groupMemberIds = new Set(groupMembers.map((member) => member.id))

  const splitMemberIds =
    input.splitBetweenMemberIds.length > 0
      ? input.splitBetweenMemberIds
      : groupMembers.map((member) => member.id)

  const unknownMemberIds = [...new Set([input.paidByMemberId, ...splitMemberIds])].filter(
    (id) => !groupMemberIds.has(id)
  )
  if (unknownMemberIds.length > 0) {
    throw new UnknownMemberError(unknownMemberIds)
  }

  const shares = computeEqualSplit(input.amountCents, splitMemberIds.length)
  const createdAt = new Date()

  return db.transaction((tx) => {
    const expense = tx
      .insert(expenses)
      .values({
        groupId,
        description: input.description,
        amountCents: input.amountCents,
        paidByMemberId: input.paidByMemberId,
        createdAt,
      })
      .returning()
      .get()

    const splitRows = splitMemberIds.map((memberId, index) => ({
      expenseId: expense.id,
      memberId,
      amountCents: shares[index] ?? 0,
    }))

    tx.insert(expenseSplits).values(splitRows).run()

    return {
      id: expense.id,
      groupId: expense.groupId,
      description: expense.description,
      amountCents: expense.amountCents,
      paidByMemberId: expense.paidByMemberId,
      createdAt: expense.createdAt,
      splits: splitRows.map(({ memberId, amountCents }) => ({ memberId, amountCents })),
    }
  })
}
