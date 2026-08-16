export function formatCents(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  return `${sign}$${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`
}

export function splitEvenly(totalCents: number, memberCount: number): number[] {
  if (memberCount < 1) {
    throw new RangeError('memberCount must be at least 1')
  }
  if (!Number.isInteger(totalCents)) {
    throw new RangeError('totalCents must be an integer')
  }

  const base = Math.floor(totalCents / memberCount)
  const remainder = totalCents - base * memberCount

  return Array.from({ length: memberCount }, (_, i) => base + (i < remainder ? 1 : 0))
}