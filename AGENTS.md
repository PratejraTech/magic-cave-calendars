# Repository Guidelines

## Project Structure & Module Organization
Runtime code lives in `src/`: feature flows (village, houses, confetti) stay in `src/features/advent`, shared widgets sit in `src/components`, and integrations belong to `src/lib` (Supabase client, animation helpers). Tests mirror component names in `src/__tests__`. Global styles live in `src/index.css`; static art or audio is served from `public/`. Supabase DDL resides in `supabase/migrations`—reference the migration ID whenever schema changes ship. Tooling config (`vite.config.ts`, `tailwind.config.js`, `eslint.config.js`) sits at the repo root; edit it only for cross-cutting updates.

## Build, Test, and Development Commands
Install dependencies with `npm install`. `npm run dev` starts the hot-reloading Vite server, `npm run build` emits the production bundle, and `npm run preview` serves that output for smoke tests. Quality gates are `npm run lint`, `npm run typecheck`, and `npm run test`; run them together before pushing to catch regressions early.

## Coding Style & Naming Conventions
We ship typed React 18 components with Tailwind utilities. Maintain two-space indentation, PascalCase filenames (`VillageScene.tsx`), and `use*` prefixes for custom hooks so ESLint can enforce hook contracts. Prefer named exports from shared modules and keep stateful logic close to its component. Use Tailwind before writing custom CSS; if overrides are required, scope them and document globals. Fix lint issues via `npm run lint -- --fix` and treat type errors as blockers.

## Testing Guidelines
Vitest and Testing Library handle automated coverage. Place UI-focused tests next to their component (`VillageScene.test.tsx`) and describe scenarios in plain English (“opens door after December 1”). Mock Supabase via `vi.mock('src/lib/supabase')` to keep suites deterministic. Add at least one happy-path and one guard test for every change that touches unlocking logic, animation timing, or persistence.

## Commit & Pull Request Guidelines
Keep commit messages short, imperative, and descriptive (e.g., “Add aurora unlock animation”), and avoid mixing unrelated work. Each PR should include a summary, linked issues, screenshots or recordings for UI changes, and confirmation that lint, tests, and typecheck passed. Call out Supabase migration IDs or new environment variables, and request another reviewer whenever motion, accessibility, or production data changes.

## Environment & Secrets
Create `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; the app throws early if either is missing. Never commit secrets—use `.env.example` to document variables instead. Update the README and deployment notes whenever a new key or service is required.
