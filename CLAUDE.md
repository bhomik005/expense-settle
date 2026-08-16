@AGENTS.md

# expense-settle

Shared expense tracker. Groups, members, expenses, and a settle-up
algorithm that computes the minimum set of payments to square everyone up.

## Stack
Next.js App Router, TypeScript strict, Vitest, SQLite via Drizzle.
Node 22.

## Conventions
- Money is integer cents. Never floats, never `number` meaning dollars.
- Pure logic lives in `src/lib/`. Keep it free of I/O and React.
- Tests sit next to source: `foo.ts` and `foo.test.ts`.
- Prefer explicit return types on exported functions.

## Before you finish
Run and pass all three:
    npm run typecheck
    npm run lint
    npm test

## Environment gotchas
- `next typegen` must run before `tsc`. The `typecheck` script does this.
- If typecheck passes locally but fails in CI, run `rm -rf .next` and retry.
- CI uses `npm ci`. If you add a dependency, commit the updated lockfile.

## Out of scope
No auth, no external APIs, no payment processing. Don't add them.