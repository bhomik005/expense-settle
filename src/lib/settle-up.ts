export interface Payment {
  from: string
  to: string
  amount: number
}

// balances: member id -> net cents (positive = owed, negative = owes)
export function settleUp(balances: Record<string, number>): Payment[] {
  const creditors: { id: string; amount: number }[] = []
  const debtors: { id: string; amount: number }[] = []

  for (const [id, balance] of Object.entries(balances)) {
    if (balance > 0) creditors.push({ id, amount: balance })
    else if (balance < 0) debtors.push({ id, amount: -balance })
  }

  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const payments: Payment[] = []

  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[debtors.length - 1]!
    const creditor = creditors[creditors.length - 1]!
    const amount = Math.min(debtor.amount, creditor.amount)

    payments.push({ from: debtor.id, to: creditor.id, amount })

    debtor.amount -= amount
    creditor.amount -= amount

    if (debtor.amount === 0) debtors.pop()
    if (creditor.amount === 0) creditors.pop()
  }

  return payments
}
