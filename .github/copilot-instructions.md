# M-E Net — Copilot Instructions

## Project Overview

M-E Net is a browser-based personal tool for mapping **Behaviours** (means) → **Outcomes** (intermediate effects) → **Values** (terminal ends) as a directed graph. The goal is to surface leverage (efficient actions), fragility (weakly supported values), and conflict (trade-off actions).

**Tech Stack:** TypeScript, Vite, D3.js (visualization), Vitest, localStorage persistence

## Architecture

```
src/
├── types/          # Domain types (see index.ts for Network, Node, Link types)
├── utils/          # Pure utility functions (id generation, timestamps)
├── components/     # UI components (planned)
├── data/           # Persistence layer (planned)
└── test/setup.ts   # Vitest globals, localStorage mock
```

**Key types in** [src/types/index.ts](src/types/index.ts):
- `Behaviour`, `Outcome`, `Value` — three node types with discriminated `type` field
- `BehaviourOutcomeLink`, `OutcomeValueLink` — two edge types with `valence` (positive/negative)
- `Network` — the root aggregate containing all nodes and links

## Path Aliases

Use `@/` aliases for imports (configured in `tsconfig.json`):
```typescript
import { Behaviour } from '@/types';
import { generateId } from '@/utils/id';
```

## ID Generation Pattern

All entities use prefixed IDs generated via `generateId()`:
- `b-` for Behaviours, `o-` for Outcomes, `v-` for Values, `l-` for Links, `w-` for Warnings

```typescript
import { generateId, now } from '@/utils/id';
const behaviour: Behaviour = {
  id: generateId('b'),
  createdAt: now(),
  updatedAt: now(),
  // ...
};
```

## Developer Workflow

```bash
npm run dev          # Start Vite dev server
npm run build        # TypeScript + Vite build
npm test             # Vitest with coverage (80% threshold)
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint (strict, 0 warnings allowed)
npm run format       # Prettier
```

**Pre-commit hooks** (Husky + lint-staged) run lint/format automatically.

## Testing Conventions

- Co-locate tests: `foo.ts` → `foo.test.ts` in same directory
- Use Vitest globals (`describe`, `it`, `expect`, `vi`) — no imports needed
- localStorage is mocked in [src/test/setup.ts](src/test/setup.ts)
- Use `vi.useFakeTimers()` for time-dependent tests

## Data Model Rules

1. **Labels must be unique** within each entity type (case-insensitive)
2. **Deleting a node** must cascade-delete its incident links
3. **Link direction:** Behaviour→Outcome or Outcome→Value only (never skip layers)
4. **Valence:** Every link has `positive` or `negative` valence

## Metric Computations

See [docs/metrics-and-insights.md](docs/metrics-and-insights.md) for numeric mappings:
- Reliability: always=1.0, usually=0.75, sometimes=0.5, rarely=0.25
- Strength: strong=1.0, moderate=0.6, weak=0.3
- Cost (divisor): trivial=1, low=2, medium=4, high=8, very-high=16

## Branch Strategy

- `main` — production (protected)
- `master` — staging (protected)
- Feature branches: `feature/description` or `fix/description`
