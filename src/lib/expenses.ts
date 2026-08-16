export interface RecordExpenseInput {
  description: string
  amountCents: number
  paidByMemberId: number
  splitBetweenMemberIds: number[]
}

export type RecordExpenseParseResult =
  | { ok: true; value: RecordExpenseInput }
  | { ok: false; error: string }

/**
 * Parses and validates the raw JSON body of a "record an expense" request.
 * Pure — does not check that referenced members or the group actually exist.
 */
export function parseRecordExpenseInput(body: unknown): RecordExpenseParseResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Request body must be a JSON object' }
  }

  const { description, amountCents, paidByMemberId, splitBetweenMemberIds } =
    body as Record<string, unknown>

  if (typeof description !== 'string' || description.trim().length === 0) {
    return { ok: false, error: 'description must be a non-empty string' }
  }

  if (
    typeof amountCents !== 'number' ||
    !Number.isInteger(amountCents) ||
    amountCents <= 0
  ) {
    return { ok: false, error: 'amountCents must be a positive integer' }
  }

  if (typeof paidByMemberId !== 'number' || !Number.isInteger(paidByMemberId)) {
    return { ok: false, error: 'paidByMemberId must be an integer' }
  }

  if (splitBetweenMemberIds !== undefined) {
    if (
      !Array.isArray(splitBetweenMemberIds) ||
      splitBetweenMemberIds.length === 0 ||
      !splitBetweenMemberIds.every(
        (id): id is number => typeof id === 'number' && Number.isInteger(id)
      )
    ) {
      return {
        ok: false,
        error: 'splitBetweenMemberIds must be a non-empty array of integers',
      }
    }
    if (new Set(splitBetweenMemberIds).size !== splitBetweenMemberIds.length) {
      return { ok: false, error: 'splitBetweenMemberIds must not contain duplicates' }
    }
  }

  return {
    ok: true,
    value: {
      description: description.trim(),
      amountCents,
      paidByMemberId,
      splitBetweenMemberIds: splitBetweenMemberIds ?? [],
    },
  }
}

/**
 * Splits amountCents evenly across participants, in cents. Any remainder
 * (amountCents is not evenly divisible) is distributed one cent at a time to
 * the first participants, so the shares always sum to exactly amountCents.
 */
export function computeEqualSplit(amountCents: number, participantCount: number): number[] {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error('amountCents must be a positive integer')
  }
  if (!Number.isInteger(participantCount) || participantCount <= 0) {
    throw new Error('participantCount must be a positive integer')
  }

  const baseShare = Math.floor(amountCents / participantCount)
  const remainder = amountCents - baseShare * participantCount

  return Array.from({ length: participantCount }, (_, index) =>
    index < remainder ? baseShare + 1 : baseShare
  )
}
