import type { JSX } from 'react'
import { ExpenseList } from '@/components/ExpenseList'
import type { Expense } from '@/lib/types'

// Placeholder until group data is fetched from storage.
const expenses: Expense[] = [
  { id: '1', description: 'Groceries', amountCents: 4599, paidBy: 'Alice', date: '2026-08-01' },
  { id: '2', description: 'Dinner', amountCents: 12000, paidBy: 'Bob', date: '2026-08-10' },
  { id: '3', description: 'Movie tickets', amountCents: 2500, paidBy: 'Carol', date: '2026-08-05' },
]

export default function GroupPage(): JSX.Element {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-6 py-16 px-6">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Expenses</h1>
        <ExpenseList expenses={expenses} />
      </main>
    </div>
  )
}
