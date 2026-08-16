import { describe, it, expect } from 'vitest'
import { settleUp } from './settle'

describe('settleUp', () => {
  it('returns no payments when everyone is already settled', () => {
    expect(
      settleUp([
        { memberId: 1, amountCents: 0 },
        { memberId: 2, amountCents: 0 },
      ])
    ).toEqual([])
  })

  it('produces payments that net every balance back to zero', () => {
    const balances = [
      { memberId: 1, amountCents: 600 },
      { memberId: 2, amountCents: -300 },
      { memberId: 3, amountCents: -300 },
    ]

    const payments = settleUp(balances)

    const net = new Map(balances.map((b) => [b.memberId, 0]))
    for (const payment of payments) {
      net.set(payment.fromMemberId, (net.get(payment.fromMemberId) ?? 0) - payment.amountCents)
      net.set(payment.toMemberId, (net.get(payment.toMemberId) ?? 0) + payment.amountCents)
    }

    for (const balance of balances) {
      expect(net.get(balance.memberId)).toBe(balance.amountCents)
    }
  })
})
