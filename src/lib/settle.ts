import type { Balance } from './balances'

export type Payment = {
  fromMemberId: number
  toMemberId: number
  amountCents: number
}

/**
 * Given each member's net balance (positive = owed money, negative = owes
 * money), computes the minimum set of payments that settles everyone to
 * zero. Greedily matches the largest debtor against the largest creditor.
 */
export function settleUp(balances: Balance[]): Payment[] {
  const debtors = balances
    .filter((b) => b.amountCents < 0)
    .map((b) => ({ memberId: b.memberId, amountCents: -b.amountCents }))
    .sort((a, b) => b.amountCents - a.amountCents)

  const creditors = balances
    .filter((b) => b.amountCents > 0)
    .map((b) => ({ memberId: b.memberId, amountCents: b.amountCents }))
    .sort((a, b) => b.amountCents - a.amountCents)

  const payments: Payment[] = []
  let debtorIndex = 0
  let creditorIndex = 0

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex]!
    const creditor = creditors[creditorIndex]!
    const amountCents = Math.min(debtor.amountCents, creditor.amountCents)

    if (amountCents > 0) {
      payments.push({
        fromMemberId: debtor.memberId,
        toMemberId: creditor.memberId,
        amountCents,
      })
    }

    debtor.amountCents -= amountCents
    creditor.amountCents -= amountCents

    if (debtor.amountCents === 0) debtorIndex++
    if (creditor.amountCents === 0) creditorIndex++
  }

  return payments
}
