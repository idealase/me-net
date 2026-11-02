# Contributing to M-E Net

## Development Workflow

### Branch Strategy

- **`master`** — The only long-lived branch. Requires PR with passing CI; merges deploy to GitHub Pages.
- **Feature branches** — Create from `master`, name as `feature/description` or `fix/description`.

### Getting Started

```bash
# Clone the repository
git clone https://github.com/idealase/me-net.git
cd me-net

# Install dependencies
npm install

# Start development server
npm run dev
```

### Before Pushing

1. **Run linting**: `npm run lint`
2. **Run type check**: `npm run typecheck`
3. **Run tests**: `npm test`
4. **Format code**: `npm run format`

Or let the pre-commit hooks handle it automatically.

### CI Pipeline

Every push to a non-protected branch and every PR triggers:

1. **Lint** — ESLint checks and Prettier format check
2. **Type Check** — TypeScript compiler
3. **Test** — Vitest with coverage
4. **Build** — Vite production build

All checks must pass before merging to `master`.

## Code Style

- **TypeScript** with strict mode enabled
- **ESLint** for code quality
- **Prettier** for formatting
- **Path aliases** (`@/`, `@/types/`, etc.) for clean imports

## Testing

- Use **Vitest** for unit and integration tests
- Place tests next to source files: `foo.ts` → `foo.test.ts`
- Aim for **80%+ coverage** on new code
- Mock localStorage using the provided setup

## Commit Messages

Follow conventional commits:

```
feat: add behaviour CRUD operations
fix: resolve duplicate label validation
docs: update data model specification
test: add coverage for leverage calculation
refactor: extract persistence layer
```
