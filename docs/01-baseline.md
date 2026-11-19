# Task 01: Baseline and context

**Project:** Smart Campus Room Availability Checker. It is a single-page React + TypeScript app generated with Bolt.new during Practice #06. The user picks a room and enters a current time and a start/end time in minutes from midnight. The app reports **Available / Unavailable** with reasons and never saves anything.

**Baseline:** git commit `6a842af`, tag `baseline`. The commit is the Bolt.new source export `project-bolt-sb1-mv1prh99.zip`, downloaded 2026-11-19, with no changes. The export also contained a `dist/` folder. The existing `.gitignore` excludes `dist/`, so it is not committed. Rebuilding produced byte-identical JS/CSS assets, so the exported build was not stale. The only extra file in the export was Bolt's `_redirects`.

## 1. Repository map

```
index.html                 entry HTML, loads /src/main.tsx
src/main.tsx               React entry: renders <App/> in StrictMode
src/App.tsx      (514 ln)  page + 5 presentational components:
                           Card, CardTitle, NumberField, ResultBanner, Timeline
src/utils.ts     (67 ln)   domain logic (pure): checkAvailability(), formatTime(), durationLabel()
src/data.ts      (48 ln)   fictional sample data: ROOMS (4 rooms, bookings, blocked flag)
src/types.ts     (20 ln)   Booking, Room, AvailabilityResult
src/index.css              Tailwind directives
vite.config.ts             Vite + React plugin, "@/" alias -> src/
tsconfig*.json             strict TS; typecheck script checks tsconfig.app.json only
eslint.config.js           ESLint 9 flat config (typescript-eslint, react-hooks, react-refresh)
tailwind.config.js, postcss.config.js
.bolt/config.json, .bolt/prompt   Bolt.new template metadata + Bolt's own agent prompt
package.json, package-lock.json   npm, lockfileVersion 3
```

| Item | Value |
|---|---|
| Entry points | `index.html` → `src/main.tsx` → `src/App.tsx` |
| Business logic | `src/utils.ts` → `checkAvailability(room, current, start, end)` |
| Runtime deps (resolved) | react 18.3.1, react-dom 18.3.1, lucide-react 0.446.0, @supabase/supabase-js 2.57.4 |
| Dev deps (resolved) | vite 5.4.8, typescript 5.6.3, eslint 9.12.0, typescript-eslint 8.8.1, tailwindcss 3.4.17, eslint-plugin-react-hooks 5.1.0-rc |
| Scripts | `dev`, `build`, `lint`, `preview`, `typecheck` (no `test`) |
| Tests | **none** |
| CI | **none** |
| README | **none** |
| Data flow | ROOMS (static, in memory) → App state (roomId, current, start, end) → `checkAvailability` → ResultBanner + Timeline. No network, storage or backend. |

## 2. Baseline checks (exact commands, actual results)

Environment: Linux container, Node v22.23.5, npm 10.9.9, run 2026-11-19. Full logs are in `docs/evidence/baseline-*.txt`.

| # | Command | Result | Log |
|---|---|---|---|
| 1 | `npm ci --no-fund` | exit 0, 289 packages, **22 vulnerabilities (2 low, 6 moderate, 14 high)** | baseline-01-npm-ci.txt |
| 2 | `npm run lint` | exit 0, no warnings | baseline-02-lint.txt |
| 3 | `npm run typecheck` | exit 0 | baseline-03-typecheck.txt |
| 4 | `npm run build` | exit 0, JS 159.00 kB (gzip 50.38 kB), warning "caniuse-lite is outdated" | baseline-04-build.txt |
| 5 | `npm test` | **exit 1: `Missing script: "test"`** | baseline-05-test.txt |
| 6 | `npm audit --omit=dev` | exit 1: **1 high** (`ws` 8.18.3, reached only via `@supabase/supabase-js`) | baseline-06-npm-audit.txt |
| 7 | UI check, 11 cases in Chromium (Playwright) against `vite preview` | **8/11 as expected**: the 6 required cases + end<start + mobile pass; 3 input cases fail | baseline-07-ui-cases.txt, `screens/baseline-*.png` |
| 8 | Direct calls to `checkAvailability` with NaN / fractional values | NaN and 660.5 return **"available"** | baseline-08-logic-probe.txt |

UI check details. The harness is `docs/evidence/ui-check.mjs`. It is evidence tooling, not part of the build, and needs a Playwright install.

| Case | Typed (now, start, end) | Field shows | Result | Expected |
|---|---|---|---|---|
| T1 touching (A101) | 540, 660, 720 | same | Available | Available ✅ |
| T2 overlap (A101) | 540, 630, 690 | same | Unavailable: overlaps "Intro to Linguistics" | ✅ |
| T3 blocked (C305) | 540, 660, 720 | same | Unavailable: blocked | ✅ |
| T4 exactly 2h (A101) | 540, 720, 840 | same | Available | ✅ |
| T5 over 2h (B202) | 540, 600, 721 | same | Unavailable: exceeds 120 min | ✅ |
| T6 starts now (A101) | 540, 540, 570 | same | Unavailable: start after current | ✅ |
| X1 end before start | 540, 700, 650 | same | Unavailable: start < end | ✅ |
| **X2 end > 1440** | 540, 1380, **1500** | 540, 1380, **1440** | **Available** | Unavailable ("must not exceed 1440") ❌ |
| **X3 empty start** | 540, **(empty)**, 720 | 540, **0**, 720 | Unavailable but with misleading reasons (12 hr, overlap) | "Start time is required" ❌ |
| **X4 decimal** | 540, **600.5**, 700 | 540, **600**, 700 | **Available** | Unavailable ("whole number") ❌ |
| M1 mobile 390 px | — | — | no horizontal overflow | ✅ |

## 3. Weaknesses / missing checks (with evidence)

| ID | Weakness | Evidence | Type |
|---|---|---|---|
| W1 | No automated tests and no `test` script. The core rules (AC1–AC4) are protected only by manual clicking. | `npm test` → `Missing script: "test"`; `find . -name "*.test.*" -not -path "./node_modules/*"` → nothing | Fact |
| W2 | The UI silently rewrites invalid input: it clamps to 0–1440, truncates decimals, and turns empty into 0. A request the user never typed gets evaluated, and 1380–1500 is shown as **Available**. | `src/App.tsx` lines 294–304 (`NumberField` onChange); UI cases X2–X4 | Fact (reproduced) |
| W3 | `checkAvailability` treats NaN and non-integers as valid (`NaN` comparisons are always false). | `src/utils.ts` lines 18–67; baseline-08-logic-probe.txt | Fact at function level. Not reachable through the current UI (W2 hides it). |
| W4 | `@supabase/supabase-js` is a runtime dependency but is never imported. It is the **only** source of the production `npm audit` finding (`ws`, high). | `grep -rn supabase src` → nothing; `npm ls ws` → `@supabase/supabase-js > @supabase/realtime-js > ws@8.18.3`; bundle contains 0 matches for "supabase" | Fact |
| W5 | No README. The package is still named `vite-react-typescript-starter@0.0.0`. No instructions for setup or tests. | `ls`; `package.json` | Fact |
| W6 | Dev toolchain has 21 more advisories. `eslint-plugin-react-hooks` is locked to a **release candidate** (`5.1.0-rc-fb9a90fa48-20240614`). Browserslist data is outdated. | `npm audit`; `package-lock.json` line 2149; build warning | Fact |
| W7 | Node version is not declared (no `engines`, no `.nvmrc`), so setup is reproducible only by luck. | `package.json` | Fact |
| W8 | `.bolt/prompt` holds conflicting agent instructions ("production-worthy", "use the `@/` alias"), but the code uses relative imports. An agent may follow it and make unrelated changes. | `.bolt/prompt`; `src/App.tsx` lines 14–20 | Fact (the file exists). The effect on agents is an assumption. |
| W9 | `index.html` links `/vite.svg`, which does not exist (favicon 404), and an external `og:image` on bolt.new. | `index.html` line 5; no `public/` dir | Fact |
| W10 | Blocked reason renders with a double period: "Floor maintenance scheduled..". | UI case T3; `utils.ts` line 50 + `data.ts` line 32 | Fact (cosmetic) |
| W11 | `App.tsx` is 514 lines with 6 components in one file. | `wc -l src/App.tsx` | Fact. That it hurts maintainability is a judgement. |

## 4. Facts vs assumptions vs unverified AI suggestions

- **Observed facts:** everything in the tables above that cites a command, file or line. I ran it, or opened the file, myself.
- **Assumptions:**
  - Bolt.new uses a different Node version than the local Node 22.
  - Real users would type values outside 0–1440 or clear a field. That is likely with `type=number` inputs, but not measured.
  - The `ws` vulnerability is not exploitable in the deployed app, because the bundle contains no Supabase code. This is based on a grep of the built JS, not a security analysis.
- **Unverified AI suggestions:** none at this stage. AI-proposed risks are handled separately in `04-risk-review.md` and classified there.
