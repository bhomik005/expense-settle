import { describe, it, expect } from 'vitest'
import { formatCents, splitEvenly } from './money'

describe('formatCents', () => {
  it('formats whole and partial amounts', () => {
    expect(formatCents(1234)).toBe('$12.34')
    expect(formatCents(500)).toBe('$5.00')
    expect(formatCents(-250)).toBe('-$2.50')
  })
})

describe('splitEvenly', () => {
  it('splits evenly when there is no remainder', () => {
    expect(splitEvenly(1000, 4)).toEqual([250, 250, 250, 250])
  })

  it('distributes the remainder to the earliest members', () => {
    expect(splitEvenly(1000, 3)).toEqual([334, 333, 333])
  })

  it('handles a remainder smaller than the member count', () => {
    expect(splitEvenly(1, 3)).toEqual([1, 0, 0])
  })

  it('always sums to the input total', () => {
    for (let total = 0; total <= 200; total++) {
      for (let count = 1; count <= 7; count++) {
        const shares = splitEvenly(total, count)
        expect(shares).toHaveLength(count)
        expect(shares.reduce((sum, share) => sum + share, 0)).toBe(total)
      }
    }
  })

  it('throws a RangeError when memberCount is less than 1', () => {
    expect(() => splitEvenly(100, 0)).toThrow(RangeError)
  })

  it('throws a RangeError when totalCents is not an integer', () => {
    expect(() => splitEvenly(100.5, 3)).toThrow(RangeError)
  })
})