import { describe, it, expect } from 'vitest'
import { settleUp } from './settle'

function totalOwedBy(payments: ReturnType<typeof settleUp>, member: string): number {
  return payments.filter((p) => p.from === member).reduce((sum, p) => sum + p.cents, 0)
}

function totalOwedTo(payments: ReturnType<typeof settleUp>, member: string): number {
  return payments.filter((p) => p.to === member).reduce((sum, p) => sum + p.cents, 0)
}

describe('settleUp', () => {
  it('returns no payments when everyone is settled', () => {
    expect(settleUp({ alice: 0, bob: 0 })).toEqual([])
  })

  it('settles a simple two-person debt', () => {
    expect(settleUp({ alice: -1000, bob: 1000 })).toEqual([
      { from: 'alice', to: 'bob', cents: 1000 },
    ])
  })

  it('ignores members who are already settled', () => {
    expect(settleUp({ alice: -500, bob: 500, carol: 0 })).toEqual([
      { from: 'alice', to: 'bob', cents: 500 },
    ])
  })

  it('minimizes payments for a three-person group', () => {
    // alice paid for everyone; bob and carol each owe a share.
    const payments = settleUp({ alice: 2000, bob: -1000, carol: -1000 })
    expect(payments).toHaveLength(2)
    expect(totalOwedTo(payments, 'alice')).toBe(2000)
  })

  it('produces payments that reconcile every balance', () => {
    const balances = { alice: 1500, bob: -700, carol: -300, dave: -500 }
    const payments = settleUp(balances)

    for (const [member, cents] of Object.entries(balances)) {
      if (cents > 0) {
        expect(totalOwedTo(payments, member)).toBe(cents)
      } else if (cents < 0) {
        expect(totalOwedBy(payments, member)).toBe(-cents)
      }
    }
  })

  it('never produces a zero-amount payment', () => {
    const payments = settleUp({ alice: 300, bob: -100, carol: -200 })
    expect(payments.every((p) => p.cents > 0)).toBe(true)
  })
})
