import { describe, expect, it } from 'vitest'
import { computeEqualSplit, parseRecordExpenseInput } from './expenses'

describe('computeEqualSplit', () => {
  it('splits evenly when the amount divides cleanly', () => {
    expect(computeEqualSplit(300, 3)).toEqual([100, 100, 100])
  })

  it('distributes the remainder one cent at a time to the first participants', () => {
    expect(computeEqualSplit(100, 3)).toEqual([34, 33, 33])
  })

  it('always sums back to the original amount', () => {
    expect(computeEqualSplit(1001, 7).reduce((a, b) => a + b, 0)).toBe(1001)
  })

  it('rejects a non-positive amount', () => {
    expect(() => computeEqualSplit(0, 2)).toThrow()
    expect(() => computeEqualSplit(-100, 2)).toThrow()
  })

  it('rejects a non-positive participant count', () => {
    expect(() => computeEqualSplit(100, 0)).toThrow()
  })
})

describe('parseRecordExpenseInput', () => {
  it('accepts a minimal valid body', () => {
    const result = parseRecordExpenseInput({
      description: 'Dinner',
      amountCents: 2500,
      paidByMemberId: 1,
    })
    expect(result).toEqual({
      ok: true,
      value: {
        description: 'Dinner',
        amountCents: 2500,
        paidByMemberId: 1,
        splitBetweenMemberIds: [],
      },
    })
  })

  it('accepts an explicit split list', () => {
    const result = parseRecordExpenseInput({
      description: 'Dinner',
      amountCents: 2500,
      paidByMemberId: 1,
      splitBetweenMemberIds: [1, 2, 3],
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.splitBetweenMemberIds).toEqual([1, 2, 3])
    }
  })

  it('rejects a non-object body', () => {
    expect(parseRecordExpenseInput(null).ok).toBe(false)
    expect(parseRecordExpenseInput('nope').ok).toBe(false)
  })

  it('rejects an empty description', () => {
    const result = parseRecordExpenseInput({
      description: '   ',
      amountCents: 100,
      paidByMemberId: 1,
    })
    expect(result.ok).toBe(false)
  })

  it('rejects a non-positive or non-integer amountCents', () => {
    expect(
      parseRecordExpenseInput({ description: 'x', amountCents: 0, paidByMemberId: 1 }).ok
    ).toBe(false)
    expect(
      parseRecordExpenseInput({ description: 'x', amountCents: 10.5, paidByMemberId: 1 }).ok
    ).toBe(false)
  })

  it('rejects a non-integer paidByMemberId', () => {
    const result = parseRecordExpenseInput({
      description: 'x',
      amountCents: 100,
      paidByMemberId: 1.5,
    })
    expect(result.ok).toBe(false)
  })

  it('rejects an empty or duplicate splitBetweenMemberIds', () => {
    expect(
      parseRecordExpenseInput({
        description: 'x',
        amountCents: 100,
        paidByMemberId: 1,
        splitBetweenMemberIds: [],
      }).ok
    ).toBe(false)
    expect(
      parseRecordExpenseInput({
        description: 'x',
        amountCents: 100,
        paidByMemberId: 1,
        splitBetweenMemberIds: [1, 1],
      }).ok
    ).toBe(false)
  })
})
