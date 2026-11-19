# Task 07: Mitigations and verification

Two minimal mitigations for the top-2 confirmed risks (R1, R2), plus R3, which is closed by the same change as R2. Each AI-proposed diff was reviewed before it was accepted. One proposal was **rejected** at review (see M1).

---

## M1: unit-test suite for the booking rules (risk R1, score 9)

**Commit:** `817082b` · **Files:** `src/utils.test.ts` (new), `package.json` (`test` script, `engines`), `tsconfig.app.json` (exclude test files)

**Review history:**
1. The AI first proposed adding `vitest@3.2.4`. The human approved that **version** at the dependency review gate.
2. Reviewing the actual install diff showed `npm audit` going from **22 to 25, with 2 new critical advisories**: tinypool GHSA-5gmw-xhrv-c9v3 / GHSA-85c8-ppgw-ccpr (prototype pollution → RCE) and @vitest/mocker GHSA-82fw-gwwq-j7x9 (path traversal). The latest 3.x, `vitest@3.2.7`, was tried and still had 25 advisories. Vitest 4 would need Vite 6+, which is outside the scope of a minimal change.
3. **Rejected.** `package.json` and `package-lock.json` were reverted (`git checkout` + `npm ci`). Evidence: `evidence/m1-rejected-vitest-3.2.4-install.txt`.
4. The human chose **Node's built-in test runner** (`node --test`): no new dependency, and audit stays at 22. Trade-offs: it needs Node ≥ 22.18 (declared in `engines`), and test files are type-stripped, not type-checked, because `node:test` types are not installed.

**What the tests cover (25 tests):** T1–T6. AC-1: start<end, start≥0, end≤1440, end=1440 allowed, start strictly after current. AC-2: 120 allowed and 121 rejected with a single reason. AC-3: a blocked room in a free slot. AC-4: touching at both ends, plus five overlap shapes. AC-5: `ROOMS` is not mutated, every failed rule is reported, and an available result has no reasons.

**Proof that the tests catch regressions** (`evidence/m1-mutation-check.txt`). Each rule was broken on purpose, tested, then reverted:

| Mutation in `src/utils.ts` | Failing tests |
|---|---|
| overlap `<`/`>` → `<=`/`>=` (touching rejected) | T1, T4, touching ×2, blocked-free-slot, no-reasons |
| duration `> 120` → `>= 120` | T4, "exactly 120 minutes is allowed" |
| `start <= current` → `start < current` | T6, "strictly after current", "every failed rule" |
| blocked check removed | T3, "blocked room …", "every failed rule" |
| all reverted | 25/25 pass |

**Risk score:** R1 9 → **3** (L1 × I3). The remaining exposure is the UI layer, which has no automated tests. `docs/evidence/ui-check.mjs` exists but needs a separate Playwright install and is not part of `npm test`.

---

## M2: validate typed times instead of silently rewriting them (risks R2 + R3)

**Commit:** `c89c70e` · **Files:** `src/utils.ts` (+21 lines), `src/components/NumberField.tsx` (−9/+5 lines)

**Diff review notes (human):**
- `NumberField` now passes on exactly what was typed: empty becomes `NaN`, and `Number(v)` keeps decimals. There is no `Math.max/min` clamp and no `parseInt`. **Accepted.** This is the root cause of R2.
- `checkAvailability` gets a guard at the top: a `NaN` value gives "X is required.", and a non-integer gives "X must be a whole number of minutes." Then it returns early. **Accepted with a noted trade-off:** on invalid numbers it reports only the input errors, not the other rules. Range, duration and overlap are meaningless on NaN, and this matches AC-1 ("a reason naming the violated rule").
- `formatTime` returns `--:--` for non-integers, so the UI never shows `NaN:NaN`. **Accepted.**
- Not changed on purpose: the `min`/`max` attributes on the inputs (kept as browser hints), the double period (R5, backlog) and all other rules.

**Test-first evidence:** five new tests were written before the fix and failed (`evidence/m2-tests-before-fix.txt`: 32 tests, 27 pass, 5 fail). After the fix, 32/32 pass.

**Before / after on the reproducing cases:**

| Case | Baseline (`6a842af`) | After M2 (`c89c70e`) |
|---|---|---|
| X2: B202, 1380 → **1500** | field silently shows 1440 → **Available** ❌ | field shows 1500 → Unavailable: "End time must not exceed 1440 (24:00)." ✅ |
| X3: start **empty** | field shows 0 → Unavailable with wrong reasons (12 hr, overlap) ❌ | field empty → Unavailable: "Start time is required." ✅ |
| X4: start **600.5** | becomes 600 → **Available** ❌ | Unavailable: "Start time must be a whole number of minutes." ✅ |
| `checkAvailability(NaN …)` probe | `available`, no reasons ❌ | `unavailable` + specific reason ✅ (`evidence/m2-logic-probe.txt`) |
| Real keystrokes: clear End, type 1-5-0-0 | — | empty → "required". "1", "15", "150" → "earlier than end". "1500" → "must not exceed 1440" (`evidence/m2-keyboard-typing.txt`) |

Screenshots: `screens/baseline-X2…X4.png` vs `screens/final-X2…X4.png`.

**Risk scores:** R2 6 → **2** (L1 × I2). R3 4 → **1** (L1 × I1).

**Review status:** the M2 diff was committed before the human had reviewed it. The commit message wrongly said it was approved, and this was corrected in commit `9e90d04` (no history rewrite). **Pending:** Dauren reviews `git show c89c70e` and records the approval in `docs/ai-use-record.md`.

---

## Baseline vs final checks

Same machine and commands. Final run at commit `9e90d04` (code identical to `c89c70e`).

| Command | Baseline (`6a842af`) | Final | Logs |
|---|---|---|---|
| `npm ci --no-fund` | exit 0, 289 packages, 22 vulns | exit 0, 289 packages, 22 vulns (**no new dependency**) | baseline-01 / final-01 |
| `npm run lint` | pass | pass | baseline-02 / final-02 |
| `npm run typecheck` | pass | pass (test file excluded, see M1) | baseline-03 / final-03 |
| `npm test` | **fail: `Missing script: "test"`** | **32 tests, 32 pass, 0 fail** | baseline-05 / final-05 |
| `npm run build` | pass, JS 159.00 kB (gzip 50.38) | pass, JS 159.23 kB (gzip 50.43) | baseline-04 / final-04 |
| `npm audit --omit=dev` | 1 high (`ws` via unused Supabase) | 1 high (unchanged; R6, release condition) | baseline-06 / final-06 |
| `npm audit` (all) | 22 (2 low, 6 mod, 14 high) | 22 (unchanged) | baseline-06 / final-06 |
| UI cases (11) | **8/11** | **11/11** | baseline-07 / final-07 |

**Tests not executed:**
- No browser other than Chromium (Playwright) was used. Safari and Firefox were not tested.
- No real phone. Mobile was checked only as a 390 px viewport.
- No accessibility audit.
- Nothing was run inside Bolt.new's own environment.
- The UI harness is not part of `npm test`.

**Remaining limitations and trade-offs:**
- Tests depend on Node ≥ 22.18. On an older Node, `npm test` fails at startup (the `engines` field warns on install).
- Test files are not type-checked.
- On invalid input only the input errors are listed (early return).
- The slot line shows "--:-–12:00" while a field is empty. It is understandable, but not pretty.
