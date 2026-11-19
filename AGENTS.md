# AGENTS.md: instructions for coding agents

Read this file before making any change. It overrides `.bolt/prompt`, which is Bolt.new's own template prompt and is kept only for Bolt. Other agents should ignore that file.

## Purpose
Smart Campus Room Availability Checker is a single-page prototype. A student picks a room and enters a current time and a start/end time in minutes from midnight (0–1440). The page shows **Available / Unavailable** with reasons. It is **read-only**: it never saves, confirms, sends or stores bookings. All data is fictional and lives in `src/data.ts`.

## Architecture
- `src/utils.ts` holds the domain logic: `checkAvailability(room, current, start, end)`, a **pure** function that returns `{ decision, reasons[] }`. All booking rules live here and only here.
- `src/data.ts` holds the fictional sample data (`ROOMS`). It is read-only at runtime.
- `src/types.ts` holds the shared types.
- `src/App.tsx` is the page container: state, layout and composition.
- `src/components/` holds the presentational components (`Card`, `NumberField`, `ResultBanner`, `Timeline`). They display data and contain **no booking rules**.
- Stack: Vite 5, React 18, TypeScript (strict), Tailwind CSS 3, lucide-react icons. There is no backend, network calls, storage or auth.

## Setup
```bash
npm ci            # install exactly what package-lock.json pins (Node >= 22.18, see "engines")
npm run dev       # local dev server
```

## Safe commands (allowed without asking)
| Command | Purpose |
|---|---|
| `npm ci` | install from the lockfile (never `npm install <pkg>`) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | unit tests (`node --test`, Node's built-in runner, no extra dependency) |
| `npm run build` | production build into `dist/` |
| `npm run dev` / `npm run preview` | local servers only |
| `git status`, `git diff`, `git log`, `git add`, `git commit` on your own branch | version control |

## Coding conventions
- TypeScript strict. Avoid `any` and non-null assertions (`!`) in new code.
- Keep booking rules in `src/utils.ts`. Components may format and display, but must not decide availability.
- A new rule needs a matching reason string and a unit test in `src/utils.test.ts`.
- Use Tailwind utility classes and existing components. Do not add UI or icon libraries.
- Keep changes small and focused: one concern per commit, with a message that says *why*.
- Match the existing style: double quotes and 2-space indent in `src/`.

## Test expectations
Before handing back any change, run all four and report the actual output, including pass/fail totals:
```bash
npm run lint && npm run typecheck && npm test && npm run build
```
- All four must pass. If one fails, say so; never hide or fabricate results.
- Any behavior change in `checkAvailability` needs a unit test in `src/utils.test.ts`. Write the test first and show it failing.
- Test files are type-stripped by Node, not type-checked by `tsc` (they are excluded in `tsconfig.app.json`). Keep them simple.
- UI behavior has no automated tests. For UI changes, check T1–T6 in the browser (`npm run dev`) and say that you did.
- The acceptance criteria in `docs/acceptance-criteria.md` (AC-1 to AC-5) must still hold. Reference cases T1–T6 must keep their expected results.

## Forbidden actions
- **No secrets.** Do not create, read, print or commit `.env` files, API keys, tokens or credentials. Do not add real personal data. Sample data stays fictional.
- **No deployments.** Do not run Bolt "Publish", `netlify`, `vercel`, `gh release` or any deploy or publish command, and do not push to `main`.
- **No destructive commands.** No `rm -rf` outside `dist/` and `node_modules/`, and no `git push --force`, `git reset --hard`, `git clean -fdx` or history rewriting. Do not delete or edit `docs/evidence/`.
- **No unreviewed dependency changes.** Do not run `npm install <pkg>`, `npm uninstall`, `npm update` or `npm audit fix`, and do not hand-edit `package-lock.json`. Propose the change and wait for human approval.
- **No scope creep.** No backend, database, auth, analytics, external APIs, or saving and confirming bookings.
- **No weakening of checks.** Do not disable lint rules, add `// @ts-ignore`, or skip or delete tests to make a check pass.

## Review gates (human approval required)
A human must review the diff and the check output before any of the following:
1. Merging into `main`.
2. Any change to `src/utils.ts` (booking rules) or `src/data.ts`.
3. Any change to `package.json`, `package-lock.json`, or tool config (`eslint.config.js`, `tsconfig*.json`, `vite.config.ts`).
4. Any deployment or publish.

## If unsure
Stop and ask. Do not guess at requirements. The acceptance criteria are the source of truth.
