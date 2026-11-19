# Task 04: Read-only AI risk review

**Assistant:** Claude (model `claude-opus-5-5`) in a claude.ai agent session, 2026-11-19.
**Reviewed version:** branch `assignment-05`, commit `588e31a` (baseline + docs + component extraction; `src/utils.ts` identical to baseline).
**Read-only control:** the review used only read commands (file reads, grep, npm ls/audit, UI checks against a build). After it, no source, dependency or config file differed from `588e31a` (shown at the bottom). The assistant produced the candidate list first. Each item was then checked separately against files, commands or reproducible behaviour.

## Prompt used
> Review the repository `smart-campus-room-checker` at the current commit. **This is a read-only review: do not create, modify or delete any file, do not install, update or remove packages, and do not run `npm audit fix`.** You may read files and run read-only commands (`npm run lint`, `npm run typecheck`, `npm run build`, `npm audit`, `npm ls`, `grep`, `git log/diff`). Propose candidate risks in these categories: correctness, maintainability, security, dependency, agent operations. For each, give the claim, the location, why it matters and how a human could verify it. State your confidence (high/medium/low). Do not claim you executed anything you did not execute. Acceptance criteria are in `docs/acceptance-criteria.md`, and agent rules are in `AGENTS.md`.

## AI output (candidate findings, unedited list)

| # | Category | Claim (as proposed by the AI) | AI confidence |
|---|---|---|---|
| C1 | Correctness | `NumberField` clamps input to 0–1440, truncates decimals with `parseInt`, and turns an empty field into `min`. The user's real input is never validated: typing end = 1500 evaluates 1440 and can return Available. | high |
| C2 | Correctness | `checkAvailability` has no guard for `NaN` or non-integers. All comparisons with `NaN` are false, so it returns "available". | high |
| C3 | Maintainability | No automated tests or `test` script. AC1–AC4 are guarded only by manual clicking, so a refactor or agent edit can silently break the overlap or 120-minute rule. | high |
| C4 | Dependency / Security | `@supabase/supabase-js` is declared as a runtime dependency but never imported. It pulls in `ws`, which has a high-severity advisory. | high |
| C5 | Dependency | Dev toolchain: 21 further advisories, including esbuild/vite (dev server can be read by any website, GHSA-67mh-4wv8-2f99). `eslint-plugin-react-hooks` is locked to a release candidate. | medium |
| C6 | Agent operations | `.bolt/prompt` tells agents to build "production-worthy, fully featured" pages and to use `@/` imports. That conflicts with the project scope and the existing code, and could cause scope creep. | medium |
| C7 | Agent operations | No Node version pin (`engines`, `.nvmrc`) and no CI, so "works on my machine" results cannot be reproduced by an agent. | medium |
| C8 | Security | Booking labels and `blockedReason` are rendered into the DOM, which could allow XSS. | low |
| C9 | Correctness | The overlap check may be off by one and reject touching intervals (600–660 vs 660–720). | low |
| C10 | Correctness | The overlap loop `break`s after the first conflict, so a request that overlaps two bookings reports only one. | medium |
| C11 | Maintainability | `ROOMS.find(...)!` in `App.tsx` uses a non-null assertion. An unknown `roomId` would crash the page. | low |
| C12 | Correctness (UX) | The blocked reason shows a double period ("…scheduled.."). | high |

## Human verification and classification

Classes: **Confirmed** means reproduced or seen in code or command output. **Plausible / unverified** means the mechanism exists but the harm was not reproduced or is not reachable now. **Unsupported** means the evidence contradicts the claim.

| # | Verification performed | Result | Class |
|---|---|---|---|
| C1 | UI cases X2–X4 in Chromium. Read `src/components/NumberField.tsx` lines 27–37 (`if (v === "") onChange(min)`, `parseInt`, `Math.max(min, Math.min(max, n))`). | X2: typed 1380–**1500**, field shows 1440, result **Available**. X3: empty start shows 0 with misleading reasons. X4: 600.5 becomes 600, **Available**. (`evidence/baseline-07-ui-cases.txt`, `screens/baseline-X2…X4.png`) | **Confirmed** |
| C2 | `node docs/evidence/logic-probe.mts` (direct calls) | `NaN` start, end or current and `660.5` all return `{"decision":"available","reasons":[]}` (`evidence/baseline-08-logic-probe.txt`). Not reachable from today's UI because C1 converts input first. | **Confirmed** (function level) |
| C3 | `npm test`; `find . -name "*.test.*" -not -path "./node_modules/*"` | `Missing script: "test"`, no test files (`evidence/baseline-05-test.txt`) | **Confirmed** |
| C4 | `grep -rn supabase src index.html vite.config.ts`; `npm ls ws`; `npm audit --omit=dev`; `grep -c supabase dist/assets/*.js` | No import anywhere. `ws@8.18.3` comes only via `@supabase/supabase-js > @supabase/realtime-js`. It is the only production advisory (1 high). The built bundle contains 0 matches, so the code is not shipped to users. (`evidence/baseline-06-npm-audit.txt`) | **Confirmed** (exposure limited to install time and future use) |
| C5 | `npm audit` (full); `package-lock.json` line 2149 | 22 total (2 low, 6 moderate, 14 high). esbuild ≤0.24.2 advisory GHSA-67mh-4wv8-2f99 via vite 5.4.8. Plugin version `5.1.0-rc-fb9a90fa48-20240614`. All affect developer machines only (`npm run dev`), not the built site. | **Confirmed** |
| C6 | Read `.bolt/prompt`; compared with `src/App.tsx` imports | The file exists and says what is claimed. Code uses `./utils`, not `@/utils`. Whether an agent would actually follow it was **not tested**. | **Plausible / unverified** (the effect on agents) |
| C7 | `package.json` (no `engines`), no `.nvmrc`, no `.github/` | Facts confirmed. Harm not reproduced: install works on Node 22 here, and Bolt runs its own Node. | **Confirmed** (missing control), low impact |
| C8 | `grep -rn "dangerouslySetInnerHTML\|innerHTML\|eval(" src` → no matches. React escapes text children. Data is static and in the repo, with no user-supplied strings. | No injection path exists. | **Unsupported** |
| C9 | UI case T1 (A101, 660–720) → Available. Code: `start < b.end && end > b.start` (strict). | Touching is allowed, as AC-4 requires. | **Unsupported** |
| C10 | Read `src/utils.ts` line 59 (`break;`) | True, but the decision is still correct (Unavailable), and only the reason list is shorter. The sample data has no slot that overlaps two bookings within 120 min. | **Confirmed**, very low impact |
| C11 | `roomId` is set only from `ROOMS.map(r => setRoomId(r.id))` buttons, and the initial state is `ROOMS[0].id`. | Not reachable through the UI today. It would matter if room IDs came from a URL or API. | **Plausible / unverified** |
| C12 | UI case T3 reason text; `src/utils.ts` line 50 appends "." after `data.ts` line 32 already ends with "." | "Room C305 is blocked: Floor maintenance scheduled.." | **Confirmed** (cosmetic) |

**Summary:** 12 candidates in 5 categories → **8 confirmed, 2 plausible/unverified, 2 unsupported**. The AI's high-confidence claims all held. Both unsupported claims (C8 XSS, C9 off-by-one) were low-confidence guesses that a single grep and a single UI case disproved. That is why each item is checked rather than accepted.

## Read-only proof
Actual output after the review (`evidence/risk-review-readonly-check.txt`):
```
$ git status --porcelain
?? docs/04-risk-review.md
?? docs/evidence/risk-review-readonly-check.txt
$ git diff --stat 588e31a -- src package.json package-lock.json index.html
(no output: no code, dependency or config change)
```
The only new files are this report and its evidence log, written after the review. They are committed separately from any code change.
