import { describe, it, expect } from 'vitest'
import { formatCents } from './money'

describe('formatCents', () => {
  it('formats whole and partial amounts', () => {
    expect(formatCents(1234)).toBe('$12.34')
    expect(formatCents(500)).toBe('$5.00')
    expect(formatCents(-250)).toBe('-$2.50')
  })
})