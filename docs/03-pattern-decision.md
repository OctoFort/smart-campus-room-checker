# Task 03: Focused pattern decision

## Maintainability problem
`src/App.tsx` was **514 lines** (baseline commit `6a842af`). It held the page container (state, `useMemo`, layout) and five presentational components: `Card`, `CardTitle`, `NumberField`, `ResultBanner` and `Timeline`. `Timeline` alone was 145 lines of positioning maths (percent offsets, clamping) mixed with markup.

The consequence is that any change to one widget means editing, and having an agent read, the whole page file. That raises diff noise and the chance of an accidental edit to unrelated UI. It also hides an important fact: **the input-normalisation rules in `NumberField` (empty → 0, clamp, truncate) live inside a UI component**, which is the cause of weakness W2.

The booking rules themselves are **not** mixed in. `checkAvailability()` in `src/utils.ts` is already a separate pure function.

## Patterns evaluated

| Option | What it would look like | Benefit here | Cost here | Verdict |
|---|---|---|---|---|
| **Strategy** for booking rules | `interface Rule { check(req): string \| null }` plus an array of 7 rule objects that `checkAvailability` iterates | Rules become individually pluggable and testable. Ordering is explicit. | 7 fixed rules in one 50-line pure function, no runtime variation, and no second rule set. Adds an interface, a registry and indirection, so reading one rule means jumping across files. The rules are already testable through the single function. | **Rejected (YAGNI).** Reconsider if rule sets must differ per room type or be configured at runtime. |
| **Adapter** for the data source | `RoomRepository` interface with an in-memory adapter for `ROOMS` | Would ease a future switch to an API or database | There is no second source, and a backend is explicitly out of scope (Practice #06, AGENTS.md). The `@supabase/supabase-js` dependency is unused (W4), so an adapter would build on something we plan to remove. | **Rejected.** No concrete coupling problem exists today. |
| **Container / presentational split** (structural refactoring, not a GoF pattern) | `App.tsx` keeps state and composition. Each widget moves to `src/components/`. | Directly addresses the observed problem: smaller files and focused diffs, and agents can be told "UI goes in components, rules in utils". | Five files instead of one, plus four import lines | **Accepted.** One mechanical move with no logic change. |

**Decision:** no design pattern is warranted. The domain logic is already isolated, and Strategy or Adapter would add abstraction without solving a present problem. I implemented **one** focused refactoring: extract the presentational components (commit `bfea826`).

## Before / after structure

```
BEFORE (6a842af)                       AFTER (bfea826)
src/App.tsx            514 lines        src/App.tsx                    240 lines  (state + layout only)
  App, Card, CardTitle,                 src/components/Card.tsx         26 lines  (Card, CardTitle)
  NumberField, ResultBanner,            src/components/NumberField.tsx  45 lines
  Timeline                              src/components/ResultBanner.tsx 58 lines
src/utils.ts  (unchanged)               src/components/Timeline.tsx    149 lines
                                        src/utils.ts                    unchanged
```

Dependency direction after the change: `App → components → utils/types`. Components import nothing from `App`, and `utils.ts` imports no UI.

## Proof that the acceptance criteria still hold

| Check | Baseline | After refactoring | Evidence |
|---|---|---|---|
| `npm run lint` | pass | pass | `evidence/refactor-lint.txt` |
| `npm run typecheck` | pass | pass | `evidence/refactor-typecheck.txt` |
| `npm run build` | pass, JS 159.00 kB | pass, JS 159.00 kB | `evidence/refactor-build.txt` |
| Component code moved verbatim | — | `diff` of the old component code vs the new files (imports and `export` removed) is **empty** | `evidence/refactor-verbatim-diff.txt` |
| `src/utils.ts` and `src/data.ts` changed? | — | no (`git diff baseline -- src/utils.ts src/data.ts` is empty) | git |
| UI cases T1–T6, X1–X4, M1 | 8/11 | **8/11, same cases, same results** | `evidence/refactor-ui-cases.txt` |
| Screenshots | — | 9 of 11 byte-identical. The other 2 differ by 12 px in a CSS-transition spot (timing noise). | `evidence/refactor-screenshot-compare.txt` |

AC-2 to AC-5 still hold, and T1–T6 are unchanged. AC-1 still fails for X2–X4 exactly as at baseline. That is expected, because this refactoring must not change behaviour. It is fixed separately as mitigation M2 (`07-mitigations.md`).
