import { describe, it, expect, beforeEach } from 'vitest'
import { getDb, resetDbForTests } from '@/db/client'
import { groups, members, expenses } from '@/db/schema'
import { GET } from './route'

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) }
}

beforeEach(() => {
  process.env.DATABASE_URL = ':memory:'
  resetDbForTests()
})

describe('GET /api/groups/[id]/settlement', () => {
  it('returns payments that settle every member to zero', async () => {
    const db = getDb()
    const group = db.insert(groups).values({ name: 'Trip' }).returning().get()
    const groupId = group.id

    const alice = db
      .insert(members)
      .values({ groupId, name: 'Alice' })
      .returning()
      .get()
    const bob = db
      .insert(members)
      .values({ groupId, name: 'Bob' })
      .returning()
      .get()
    const carol = db
      .insert(members)
      .values({ groupId, name: 'Carol' })
      .returning()
      .get()

    db.insert(expenses)
      .values({
        groupId,
        description: 'Dinner',
        amountCents: 900,
        paidByMemberId: alice.id,
      })
      .run()
    db.insert(expenses)
      .values({
        groupId,
        description: 'Taxi',
        amountCents: 300,
        paidByMemberId: bob.id,
      })
      .run()

    const response = await GET(new Request('http://localhost'), makeParams(String(groupId)))
    expect(response.status).toBe(200)

    const body = (await response.json()) as {
      payments: { fromMemberId: number; toMemberId: number; amountCents: number }[]
    }

    const net = new Map<number, number>([
      [alice.id, 0],
      [bob.id, 0],
      [carol.id, 0],
    ])
    net.set(alice.id, (net.get(alice.id) ?? 0) + 900)
    net.set(bob.id, (net.get(bob.id) ?? 0) + 300)
    // everyone owes an equal share of both expenses (1200 / 3 = 400 each)
    for (const memberId of [alice.id, bob.id, carol.id]) {
      net.set(memberId, (net.get(memberId) ?? 0) - 400)
    }

    for (const payment of body.payments) {
      net.set(payment.fromMemberId, (net.get(payment.fromMemberId) ?? 0) + payment.amountCents)
      net.set(payment.toMemberId, (net.get(payment.toMemberId) ?? 0) - payment.amountCents)
    }

    for (const balance of net.values()) {
      expect(balance).toBe(0)
    }
  })

  it('returns 404 when the group does not exist', async () => {
    const response = await GET(new Request('http://localhost'), makeParams('999'))
    expect(response.status).toBe(404)
  })

  it('returns an empty payments list for a group with no expenses', async () => {
    const db = getDb()
    const group = db.insert(groups).values({ name: 'Empty' }).returning().get()
    db.insert(members).values({ groupId: group.id, name: 'Solo' }).run()

    const response = await GET(new Request('http://localhost'), makeParams(String(group.id)))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ payments: [] })
  })
})
