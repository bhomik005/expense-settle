import { NextResponse } from 'next/server'

import { db } from '@/db/client'
import { groups, members } from '@/db/schema'

interface CreateGroupBody {
  name: string
  members: string[]
}

function isCreateGroupBody(body: unknown): body is CreateGroupBody {
  if (typeof body !== 'object' || body === null) return false
  const { name, members: memberNames } = body as Record<string, unknown>
  return (
    typeof name === 'string' &&
    Array.isArray(memberNames) &&
    memberNames.every((member) => typeof member === 'string')
  )
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 })
  }

  if (!isCreateGroupBody(body)) {
    return NextResponse.json(
      { error: 'Expected { name: string, members: string[] }' },
      { status: 400 },
    )
  }

  const name = body.name.trim()
  const memberNames = body.members.map((member) => member.trim()).filter((member) => member.length > 0)

  if (name.length === 0) {
    return NextResponse.json({ error: 'name must not be empty' }, { status: 400 })
  }
  if (memberNames.length < 2) {
    return NextResponse.json({ error: 'members must include at least 2 entries' }, { status: 400 })
  }

  const created = db.transaction((tx) => {
    const [group] = tx.insert(groups).values({ name }).returning().all()
    if (!group) {
      throw new Error('Failed to create group')
    }
    const insertedMembers = tx
      .insert(members)
      .values(memberNames.map((memberName) => ({ groupId: group.id, name: memberName })))
      .returning()
      .all()
    return { group, members: insertedMembers }
  })

  return NextResponse.json(
    {
      id: created.group.id,
      name: created.group.name,
      members: created.members.map((member) => ({ id: member.id, name: member.name })),
    },
    { status: 201 },
  )
}
