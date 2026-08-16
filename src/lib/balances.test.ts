import { describe, it, expect } from 'vitest'
import { computeBalances, splitEqually } from './balances'

describe('splitEqually', () => {
  it('splits evenly when the amount divides cleanly', () => {
    expect(splitEqually(900, 3)).toEqual([300, 300, 300])
  })

  it('distributes the remainder starting from the first share', () => {
    expect(splitEqually(1000, 3)).toEqual([334, 333, 333])
  })
})

describe('computeBalances', () => {
  it('nets a single expense out across the group', () => {
    const balances = computeBalances(
      [1, 2, 3],
      [{ paidByMemberId: 1, amountCents: 900 }]
    )
    expect(balances).toEqual([
      { memberId: 1, amountCents: 600 },
      { memberId: 2, amountCents: -300 },
      { memberId: 3, amountCents: -300 },
    ])
  })

  it('returns zero balances when there are no expenses', () => {
    expect(computeBalances([1, 2], [])).toEqual([
      { memberId: 1, amountCents: 0 },
      { memberId: 2, amountCents: 0 },
    ])
  })
})
