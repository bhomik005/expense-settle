import { NextResponse } from 'next/server'
import { getGroupById, listExpenses, listMembers } from '@/db/groups'
import { computeBalances } from '@/lib/balances'
import { settleUp } from '@/lib/settle'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const groupId = Number(id)

  const group = getGroupById(groupId)
  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  }

  const memberIds = listMembers(groupId).map((member) => member.id)
  const expenses = listExpenses(groupId).map((expense) => ({
    paidByMemberId: expense.paidByMemberId,
    amountCents: expense.amountCents,
  }))

  const balances = computeBalances(memberIds, expenses)
  const payments = settleUp(balances)

  return NextResponse.json({ payments })
}
