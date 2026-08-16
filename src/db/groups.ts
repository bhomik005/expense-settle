import { eq } from 'drizzle-orm'
import { getDb } from './client'
import { groups, members, expenses } from './schema'

export function getGroupById(id: number) {
  return getDb().select().from(groups).where(eq(groups.id, id)).get()
}

export function listMembers(groupId: number) {
  return getDb().select().from(members).where(eq(members.groupId, groupId)).all()
}

export function listExpenses(groupId: number) {
  return getDb().select().from(expenses).where(eq(expenses.groupId, groupId)).all()
}
