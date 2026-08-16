import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExpenseList } from './ExpenseList'
import type { Expense } from '@/lib/types'

const expenses: Expense[] = [
  { id: '1', description: 'Groceries', amountCents: 4599, paidBy: 'Alice', date: '2026-08-01' },
  { id: '2', description: 'Dinner', amountCents: 12000, paidBy: 'Bob', date: '2026-08-10' },
  { id: '3', description: 'Movie tickets', amountCents: 2500, paidBy: 'Carol', date: '2026-08-05' },
]

describe('ExpenseList', () => {
  it('renders expenses newest first with description, payer, and formatted amount', () => {
    render(<ExpenseList expenses={expenses} />)

    const rows = screen.getAllByRole('listitem')
    expect(rows).toHaveLength(3)
    expect(rows[0]).toHaveTextContent('Dinner')
    expect(rows[1]).toHaveTextContent('Movie tickets')
    expect(rows[2]).toHaveTextContent('Groceries')

    expect(rows[0]).toHaveTextContent('Bob')
    expect(rows[0]).toHaveTextContent('$120.00')
    expect(rows[1]).toHaveTextContent('$25.00')
    expect(rows[2]).toHaveTextContent('$45.99')
  })

  it('renders an empty state when there are no expenses', () => {
    render(<ExpenseList expenses={[]} />)

    expect(screen.getByText(/no expenses/i)).toBeInTheDocument()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})
