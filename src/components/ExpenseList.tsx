import type { JSX } from 'react'
import { formatCents } from '@/lib/money'
import type { Expense } from '@/lib/types'

export function ExpenseList({ expenses }: { expenses: Expense[] }): JSX.Element {
  if (expenses.length === 0) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">No expenses yet.</p>
  }

  const sorted = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
      {sorted.map((expense) => (
        <li key={expense.id} className="flex items-center justify-between gap-4 py-3">
          <div className="flex flex-col">
            <span className="font-medium text-black dark:text-zinc-50">
              {expense.description}
            </span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Paid by {expense.paidBy}
            </span>
          </div>
          <span className="font-medium text-black dark:text-zinc-50">
            {formatCents(expense.amountCents)}
          </span>
        </li>
      ))}
    </ul>
  )
}
