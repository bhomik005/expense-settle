export interface Balance {
  member: string
  cents: number
}

export interface Payment {
  from: string
  to: string
  cents: number
}

/**
 * Computes the minimum set of payments that settles a group's balances.
 *
 * `balances` maps each member to their net position in cents: positive
 * means the group owes them money, negative means they owe the group.
 * Balances are expected to sum to zero.
 *
 * Uses a greedy largest-debtor-to-largest-creditor match, which keeps the
 * number of payments small without needing an exhaustive search.
 */
export function settleUp(balances: Record<string, number>): Payment[] {
  const debtors: Balance[] = []
  const creditors: Balance[] = []

  for (const [member, cents] of Object.entries(balances)) {
    if (cents < 0) {
      debtors.push({ member, cents: -cents })
    } else if (cents > 0) {
      creditors.push({ member, cents })
    }
  }

  debtors.sort((a, b) => b.cents - a.cents)
  creditors.sort((a, b) => b.cents - a.cents)

  const payments: Payment[] = []
  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const debtor: Balance = debtors[i]!
    const creditor: Balance = creditors[j]!
    const amount = Math.min(debtor.cents, creditor.cents)

    payments.push({ from: debtor.member, to: creditor.member, cents: amount })

    debtor.cents -= amount
    creditor.cents -= amount

    if (debtor.cents === 0) i++
    if (creditor.cents === 0) j++
  }

  return payments
}
