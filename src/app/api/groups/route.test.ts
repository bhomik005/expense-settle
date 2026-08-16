import { existsSync, unlinkSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const dbPath = path.join(os.tmpdir(), `expense-settle-groups-route-${process.pid}.db`)

beforeAll(() => {
  process.env.DATABASE_URL = dbPath
})

afterAll(() => {
  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    const file = `${dbPath}${suffix}`
    if (existsSync(file)) unlinkSync(file)
  }
})

async function loadRoute() {
  const { sqlite } = await import('@/db/client')
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `)
  return import('./route')
}

describe('POST /api/groups', () => {
  it('creates a group with its members and returns 201', async () => {
    const { POST } = await loadRoute()
    const request = new Request('http://localhost/api/groups', {
      method: 'POST',
      body: JSON.stringify({ name: 'Ski Trip', members: ['Alice', 'Bob'] }),
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({
      id: expect.any(Number),
      name: 'Ski Trip',
      members: [
        { id: expect.any(Number), name: 'Alice' },
        { id: expect.any(Number), name: 'Bob' },
      ],
    })
  })

  it('returns 400 when name is empty', async () => {
    const { POST } = await loadRoute()
    const request = new Request('http://localhost/api/groups', {
      method: 'POST',
      body: JSON.stringify({ name: '   ', members: ['Alice', 'Bob'] }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: expect.any(String) })
  })

  it('returns 400 when fewer than 2 members are given', async () => {
    const { POST } = await loadRoute()
    const request = new Request('http://localhost/api/groups', {
      method: 'POST',
      body: JSON.stringify({ name: 'Solo Trip', members: ['Alice'] }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: expect.any(String) })
  })

  it('returns 400 on malformed JSON instead of throwing', async () => {
    const { POST } = await loadRoute()
    const request = new Request('http://localhost/api/groups', {
      method: 'POST',
      body: '{ this is not valid json',
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: expect.any(String) })
  })
})
