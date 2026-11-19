# Smart Campus Room Availability Checker

A single-page prototype that checks whether a campus room is free for a requested time slot. It was generated with Bolt.new (Practice #06) and audited and hardened in Assignment #05.

- Pick one of four fictional rooms.
- Enter the **current time**, **start** and **end** in minutes from midnight (0–1440). The page shows HH:MM next to each field.
- The page answers **Available** or **Unavailable** and lists every rule that failed: invalid interval, longer than 120 minutes, room blocked, or overlap with an existing booking.

It is read-only. Nothing is saved, confirmed or sent anywhere, and all data is fictional (`src/data.ts`).

## Quick start
Requires Node.js 20+ (developed on Node 22) and npm.
```bash
npm ci
npm run dev        # open the printed localhost URL
```

## Scripts
| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type check (`tsc --noEmit`) |
| `npm run build` | production build into `dist/` |
| `npm run preview` | serve the built `dist/` locally |

## Project structure
```
src/utils.ts   booking rules: checkAvailability() (pure function) + time formatting
src/data.ts    fictional rooms and bookings
src/types.ts   shared types
src/App.tsx    page container (state + layout)
src/components/  presentational components (Card, NumberField, ResultBanner, Timeline)
```

## Rules (acceptance criteria)
See [`docs/acceptance-criteria.md`](docs/acceptance-criteria.md). In short: `0 ≤ start < end ≤ 1440`, start after the current time, at most 120 minutes, room not blocked, no overlap (touching is fine).

## For coding agents
Read [`AGENTS.md`](AGENTS.md) first.

## Assignment #05 documents
All reports are in [`docs/`](docs/). Raw command output and screenshots are in [`docs/evidence/`](docs/evidence/).
