# Task 06: Agent-readiness audit

Two versions were audited: the **baseline** (`6a842af`) and the **final reviewed version** (branch `assignment-05`, code as of `c89c70e`). Ratings: ✅ meets, ⚠️ partial, ❌ missing.

| Area | Baseline | Final | Evidence / notes |
|---|---|---|---|
| Readable structure | ⚠️ 514-line `App.tsx` with 6 components | ✅ `utils.ts` (rules) / `components/` (UI) / `App.tsx` (state) | `03-pattern-decision.md`; `wc -l` |
| README accuracy | ❌ no README | ✅ purpose, setup, scripts, structure and rules match the code | `README.md`; scripts cross-checked with `package.json` |
| Reproducible setup | ⚠️ lockfile exists, but Node version not declared | ✅ `npm ci` from lockfile; `engines.node >=22.18`; clean `npm ci` gives 289 packages, exit 0 | `final-01-npm-ci.txt` |
| Pinned dependencies | ⚠️ caret ranges, but the lockfile pins exact versions; RC plugin; unused Supabase | ⚠️ unchanged. No new dependencies were added (vitest rejected). Supabase removal is still open (R6). | `package.json`, `final-06-npm-audit.txt` |
| Tests | ❌ none, `npm test` missing | ✅ 32 unit tests on the rules, mutation-checked; ⚠️ no automated UI tests | `final-05-test.txt`, `m1-mutation-check.txt` |
| Lint / type checks | ✅ `lint`, `typecheck` pass | ✅ pass; ⚠️ test files not type-checked; `typecheck` does not cover `vite.config.ts` | `final-02`, `final-03` |
| Build command | ✅ `npm run build` | ✅ unchanged | `final-04-build.txt` |
| CI enforcement | ❌ none | ❌ none. Checks are run manually or by the agent, not enforced. | no `.github/` |
| Logging / observability | n/a: client-only page, no `console` calls, no error boundary | same; no runtime logging needed for a static prototype. ⚠️ No error boundary, so a render crash would give a white page (R9). | `final-08-security-logging-scan.txt` |
| Security safeguards | ⚠️ no secrets found, `.env` git-ignored, no network/storage calls; but 1 prod advisory via an unused dependency | same, plus AGENTS.md forbids secrets, deploys and dependency changes | `final-08-security-logging-scan.txt`, `04-risk-review.md` C4/C8 |
| AGENTS.md: purpose, architecture, setup | ❌ none (only Bolt's `.bolt/prompt`) | ✅ | `AGENTS.md` |
| AGENTS.md: safe commands / permissions | ❌ | ✅ table of allowed commands | `AGENTS.md` "Safe commands" |
| AGENTS.md: prohibited actions | ❌ | ✅ secrets, deploys, destructive git/rm, dependency changes, scope creep, weakening checks | `AGENTS.md` "Forbidden actions" |
| AGENTS.md: review gates | ❌ | ✅ merge to main, rule/data changes, dependency/config changes, deploys | `AGENTS.md` "Review gates" |
| Agent loading | — | ⚠️ `CLAUDE.md` imports `@AGENTS.md` for Claude Code. In this session's tool the `@` import was **not** expanded automatically, so the assistant read AGENTS.md explicitly (disclosed in `ai-use-record.md`). | `CLAUDE.md` |

## Readiness level

**Baseline: Level 1 (Baseline).** The code runs and builds, but there is no README, no tests and no agent instructions, and the only agent guidance (`.bolt/prompt`) pushes toward scope creep.

**Final: Level 2 (Documented).** It is not yet Level 3 (Agent-ready).
- **Why Level 2:** an agent can read what the project is, how to set it up, which commands are safe, what it must never do and when a human must approve. Every one of these was exercised in this assignment: the dependency gate stopped vitest, and the history-rewrite rule shaped how a wrong commit message was corrected. The core rules have an automated, mutation-checked test suite that an agent can run in under a second.
- **Missing evidence for Level 3:**
  1. No CI. Nothing forces lint, typecheck, test and build to pass before a merge. Today it depends on whoever runs them.
  2. No automated UI tests. The input-handling bug (R2) lived in the UI, and only the out-of-band Playwright harness catches that class of bug.
  3. Dependency hygiene is open: 22 dev advisories, 1 prod advisory via the unused Supabase package, and an RC lint plugin.
  4. Test files are not type-checked.
  5. AGENTS.md has not been tested with an agent that auto-loads it (e.g. Codex or Claude Code in a terminal), so its effect on an unsupervised agent is assumed, not observed.

**Steps to reach Level 3:** a GitHub Actions workflow running `npm ci && npm run lint && npm run typecheck && npm test && npm run build`; remove `@supabase/supabase-js`; upgrade Vite/ESLint on a reviewed branch; one smoke UI test in CI.
