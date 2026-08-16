export type GroupFormErrors = {
  name?: string
  members?: string
}

const MAX_NAME_LENGTH = 60
const MAX_MEMBER_NAME_LENGTH = 40
const MIN_MEMBERS = 2

export function normalizeMembers(members: string[]): string[] {
  return members.map((member) => member.trim()).filter((member) => member.length > 0)
}

export function validateGroupDraft(name: string, members: string[]): GroupFormErrors {
  const errors: GroupFormErrors = {}

  const trimmedName = name.trim()
  if (!trimmedName) {
    errors.name = 'Group name is required.'
  } else if (trimmedName.length > MAX_NAME_LENGTH) {
    errors.name = `Group name must be ${MAX_NAME_LENGTH} characters or fewer.`
  }

  const trimmedMembers = normalizeMembers(members)
  if (trimmedMembers.length < MIN_MEMBERS) {
    errors.members = `Add at least ${MIN_MEMBERS} members.`
  } else if (trimmedMembers.some((member) => member.length > MAX_MEMBER_NAME_LENGTH)) {
    errors.members = `Member names must be ${MAX_MEMBER_NAME_LENGTH} characters or fewer.`
  } else {
    const seen = new Set<string>()
    for (const member of trimmedMembers) {
      const key = member.toLowerCase()
      if (seen.has(key)) {
        errors.members = `Duplicate member name: "${member}".`
        break
      }
      seen.add(key)
    }
  }

  return errors
}

export function isGroupDraftValid(errors: GroupFormErrors): boolean {
  return Object.keys(errors).length === 0
}
