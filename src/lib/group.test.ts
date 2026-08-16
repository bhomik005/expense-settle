import { describe, it, expect } from 'vitest'
import { isGroupDraftValid, normalizeMembers, validateGroupDraft } from './group'

describe('validateGroupDraft', () => {
  it('accepts a valid draft', () => {
    const errors = validateGroupDraft('Trip to Goa', ['Alice', 'Bob'])
    expect(errors).toEqual({})
    expect(isGroupDraftValid(errors)).toBe(true)
  })

  it('requires a group name', () => {
    const errors = validateGroupDraft('   ', ['Alice', 'Bob'])
    expect(errors.name).toBe('Group name is required.')
  })

  it('rejects overly long group names', () => {
    const errors = validateGroupDraft('x'.repeat(61), ['Alice', 'Bob'])
    expect(errors.name).toMatch(/60 characters/)
  })

  it('requires at least two members after trimming blanks', () => {
    const errors = validateGroupDraft('Trip', ['Alice', '  ', ''])
    expect(errors.members).toBe('Add at least 2 members.')
  })

  it('rejects overly long member names', () => {
    const errors = validateGroupDraft('Trip', ['Alice', 'y'.repeat(41)])
    expect(errors.members).toMatch(/40 characters/)
  })

  it('rejects duplicate member names case-insensitively', () => {
    const errors = validateGroupDraft('Trip', ['Alice', 'alice'])
    expect(errors.members).toMatch(/Duplicate member name/)
  })

  it('is valid regardless of blank slots as long as enough named members remain', () => {
    const errors = validateGroupDraft('Trip', ['Alice', '', 'Bob'])
    expect(isGroupDraftValid(errors)).toBe(true)
  })
})

describe('normalizeMembers', () => {
  it('trims and drops blank entries', () => {
    expect(normalizeMembers([' Alice ', '', '  ', 'Bob'])).toEqual(['Alice', 'Bob'])
  })
})
