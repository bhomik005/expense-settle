import { db } from '@/db/client'
import { GroupNotFoundError, recordExpense, UnknownMemberError } from '@/db/expenses'
import { parseRecordExpenseInput } from '@/lib/expenses'

export async function POST(request: Request, ctx: RouteContext<'/api/groups/[groupId]/expenses'>) {
  const { groupId: groupIdParam } = await ctx.params
  const groupId = Number(groupIdParam)
  if (!Number.isInteger(groupId)) {
    return Response.json({ error: 'groupId must be an integer' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Request body must be valid JSON' }, { status: 400 })
  }

  const parsed = parseRecordExpenseInput(body)
  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 })
  }

  try {
    const expense = recordExpense(db, groupId, parsed.value)
    return Response.json(expense, { status: 201 })
  } catch (error) {
    if (error instanceof GroupNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    if (error instanceof UnknownMemberError) {
      return Response.json({ error: error.message }, { status: 400 })
    }
    throw error
  }
}
