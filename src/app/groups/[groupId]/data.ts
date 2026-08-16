export interface Group {
  id: string
  name: string
  members: string[]
  /** Net balance per member, in cents. Positive: owed to them. Negative: they owe. */
  balances: Record<string, number>
}

// Sample data until groups/members/expenses are backed by real persistence.
const GROUPS: Record<string, Group> = {
  'weekend-trip': {
    id: 'weekend-trip',
    name: 'Weekend Trip',
    members: ['Alice', 'Bob', 'Carol', 'Dave'],
    balances: { Alice: 4500, Bob: -1500, Carol: -1000, Dave: -2000 },
  },
  roommates: {
    id: 'roommates',
    name: 'Roommates',
    members: ['Alice', 'Bob'],
    balances: { Alice: 0, Bob: 0 },
  },
}

export function getGroup(groupId: string): Group | undefined {
  return GROUPS[groupId]
}
