import { describe, it, expect } from 'vitest'
import { settleUp } from './settle-up'

function netOf(payments: { from: string; to: string; amount: number }[]): Record<string, number> {
  const net: Record<string, number> = {}
  for (const { from, to, amount } of payments) {
    net[from] = (net[from] ?? 0) - amount
    net[to] = (net[to] ?? 0) + amount
  }
  return net
}

describe('settleUp', () => {
  it('returns no payments when everyone is settled', () => {
    expect(settleUp({ alice: 0, bob: 0 })).toEqual([])
  })

  it('settles a simple two-person debt', () => {
    expect(settleUp({ alice: 500, bob: -500 })).toEqual([
      { from: 'bob', to: 'alice', amount: 500 },
    ])
  })

  it('ignores members with a zero balance', () => {
    expect(settleUp({ alice: 500, bob: -500, carol: 0 })).toEqual([
      { from: 'bob', to: 'alice', amount: 500 },
    ])
  })

  it('minimizes the number of payments for a three-person group', () => {
    // alice paid 300, split three ways (100 each): bob and carol owe alice 100
    const payments = settleUp({ alice: 200, bob: -100, carol: -100 })
    expect(payments).toHaveLength(2)
    expect(netOf(payments)).toEqual({ alice: 200, bob: -100, carol: -100 })
  })

  it('squares up a mixed group with the minimum transactions', () => {
    const balances = { alice: 1000, bob: 500, carol: -700, dave: -800 }
    const payments = settleUp(balances)

    expect(payments.length).toBeLessThanOrEqual(3)
    expect(netOf(payments)).toEqual(balances)
    for (const payment of payments) {
      expect(payment.amount).toBeGreaterThan(0)
    }
  })

  it('settles as much as possible when balances do not sum to zero', () => {
    const payments = settleUp({ alice: 500, bob: -300 })
    expect(payments).toEqual([{ from: 'bob', to: 'alice', amount: 300 }])
  })
})
