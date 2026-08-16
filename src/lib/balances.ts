export type Expense = {
  paidByMemberId: number
  amountCents: number
}

export type Balance = {
  memberId: number
  amountCents: number
}

/**
 * Computes each member's net balance for a set of expenses that are split
 * equally among all given members. Positive balance = owed to that member;
 * negative = that member owes the group.
 */
export function computeBalances(
  memberIds: number[],
  expenses: Expense[]
): Balance[] {
  const balanceByMemberId = new Map<number, number>(
    memberIds.map((memberId) => [memberId, 0])
  )

  for (const expense of expenses) {
    const shares = splitEqually(expense.amountCents, memberIds.length)
    memberIds.forEach((memberId, index) => {
      balanceByMemberId.set(
        memberId,
        (balanceByMemberId.get(memberId) ?? 0) - (shares[index] ?? 0)
      )
    })
    balanceByMemberId.set(
      expense.paidByMemberId,
      (balanceByMemberId.get(expense.paidByMemberId) ?? 0) +
        expense.amountCents
    )
  }

  return memberIds.map((memberId) => ({
    memberId,
    amountCents: balanceByMemberId.get(memberId) ?? 0,
  }))
}

/**
 * Splits an integer cent amount into `n` integer shares that sum back to the
 * original amount, distributing the remainder one cent at a time starting
 * from the first share.
 */
export function splitEqually(amountCents: number, n: number): number[] {
  const base = Math.floor(amountCents / n)
  const remainder = amountCents - base * n
  return Array.from({ length: n }, (_, index) =>
    index < remainder ? base + 1 : base
  )
}
