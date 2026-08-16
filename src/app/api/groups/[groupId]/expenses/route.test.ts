import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/db/client'
import { groups, members } from '@/db/schema'
import { POST } from './route'

function jsonRequest(body: unknown): Request {
  return new Request('http://localhost/api/groups/1/expenses', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/groups/[groupId]/expenses', () => {
  let groupId: number
  let memberIds: number[]

  beforeEach(() => {
    const group = db.insert(groups).values({ name: 'Trip' }).returning().get()
    groupId = group.id
    memberIds = ['Dee', 'Eve'].map(
      (name) => db.insert(members).values({ groupId, name }).returning().get().id
    )
  })

  it('creates an expense and returns 201', async () => {
    const response = await POST(
      jsonRequest({
        description: 'Taxi',
        amountCents: 1000,
        paidByMemberId: memberIds[0],
      }),
      { params: Promise.resolve({ groupId: String(groupId) }) }
    )

    expect(response.status).toBe(201)
    const payload = await response.json()
    expect(payload.description).toBe('Taxi')
    expect(payload.splits).toHaveLength(2)
  })

  it('returns 400 for an invalid body', async () => {
    const response = await POST(jsonRequest({ description: '' }), {
      params: Promise.resolve({ groupId: String(groupId) }),
    })
    expect(response.status).toBe(400)
  })

  it('returns 404 for an unknown group', async () => {
    const response = await POST(
      jsonRequest({
        description: 'Taxi',
        amountCents: 1000,
        paidByMemberId: memberIds[0],
      }),
      { params: Promise.resolve({ groupId: String(groupId + 999) }) }
    )
    expect(response.status).toBe(404)
  })

  it('returns 400 when the payer is not a group member', async () => {
    const response = await POST(
      jsonRequest({
        description: 'Taxi',
        amountCents: 1000,
        paidByMemberId: 999999,
      }),
      { params: Promise.resolve({ groupId: String(groupId) }) }
    )
    expect(response.status).toBe(400)
  })
})
