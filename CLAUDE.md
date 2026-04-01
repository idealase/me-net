# me-net

## Quick Reference
- **Build**: `npm run build` (`tsc && vite build`)
- **Test**: `npm test` (Vitest with coverage — 80% threshold enforced)
- **Test watch**: `npm run test:watch`
- **Lint**: `npm run lint` (ESLint, strict 0-warnings policy)
- **Format**: `npm run format` (Prettier)
- **Typecheck**: `npm run typecheck` (`tsc --noEmit`)
- **Dev server**: `npm run dev` → http://localhost:5173
- **Deploy**: `npm run deploy` (gh-pages -d dist)

## Architecture
Means-Ends Network — maps Behaviours → Outcomes → Values as a directed graph.

```
/src/
  /types/               → Domain types: Behaviour, Outcome, Value, Link, Network
  /components/          → UI components (planned/in-progress)
  /data/                → Persistence layer (localStorage)
  /metrics/             → Leverage, fragility, conflict analysis computations
  /validation/          → Network validation rules
  /utils/               → Pure utilities (ID generation, timestamps)
  /styles/              → CSS styles
  /test/setup.ts        → Vitest globals + localStorage mock
  /main.ts              → Entry point (TypeScript, not TSX)
```

## Key Conventions
- **Branch**: `master` (not `main`) — note copilot-instructions mention both
- **Three-layer model**: Behaviour → Outcome → Value (never skip layers)
- **ID prefixes**: `b-` Behaviours, `o-` Outcomes, `v-` Values, `l-` Links, `w-` Warnings
- **Labels unique**: Within each entity type, case-insensitive
- **Cascade deletes**: Deleting a node must delete its incident links
- **Link valence**: Every link has positive or negative valence
- **D3.js**: Force-directed graph visualization
- **localStorage**: All persistence — offline-capable, no backend
- **Pre-commit hooks**: Husky + lint-staged run lint/format automatically
- **Co-located tests**: `foo.ts` → `foo.test.ts` in same directory
- **Entry point**: `main.ts` (not `main.tsx`) — pure TypeScript

## Metric Computations
Non-obvious numeric mappings (see `docs/metrics-and-insights.md`):
- Reliability: always=1.0, usually=0.75, sometimes=0.5, rarely=0.25
- Strength: strong=1.0, moderate=0.6, weak=0.3
- Cost divisor: trivial=1, low=2, medium=4, high=8, very-high=16

## Deployment
- **No CI/CD workflows** — manual deploy via `npm run deploy` (gh-pages)
- **Node**: ≥20.0.0 required (engines field in package.json)

## Common Pitfalls
- Coverage threshold is 80% — tests will fail if coverage drops below this
- ESLint max-warnings is 0 — any warning is a build failure
- Vitest globals enabled — no need to import describe/it/expect
- localStorage mocked in `src/test/setup.ts` — tests don't touch real storage

## Existing Agent Guidance
See `.github/copilot-instructions.md` for data model rules, metric formulas, and testing conventions.

## Sensitive Files
Do not read, log, or commit: any `.env` files, credentials, secrets.
