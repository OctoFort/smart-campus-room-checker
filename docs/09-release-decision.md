# Task 09: Release decision

**Reviewed version:** branch `assignment-05` (merged into `main`, https://github.com/OctoFort/smart-campus-room-checker). The code is final at `c89c70e`, and later commits only add docs.
**Decision: CONDITIONAL GO.** The version can be released as the campus prototype (Bolt publish) once the conditions below are met. Each condition has an owner.

## Evidence for releasing
| Gate | Result | Source |
|---|---|---|
| Lint, typecheck, build | all pass | `evidence/final-02…04` |
| Unit tests on the booking rules | **32/32 pass**; 4 deliberate rule breaks are all caught | `evidence/final-05-test.txt`, `m1-mutation-check.txt` |
| Acceptance criteria AC-1 to AC-5 | **11/11** reference cases pass in the browser (baseline was 8/11) | `evidence/final-07-ui-cases.txt` |
| Top-2 risks | R1 9 → 3, R2 6 → 2 (and R3 4 → 1) | `05-risk-register.md`, `07-mitigations.md` |
| Shipped code security | no secrets; no network or storage calls; no unsafe HTML; the only production advisory (`ws`) is not in the bundle | `evidence/final-08-security-logging-scan.txt`, `04-risk-review.md` |
| Readiness | Level 2 (Documented) | `06-readiness-audit.md` |

## Why not plain GO
- The M2 diff, which changes the booking-rule file `src/utils.ts`, was committed **before** human review. AGENTS.md requires human approval for that file.
- A confirmed dependency risk is still open. The unused Supabase package carries the only production advisory (R6).
- Readiness is Level 2, not 3: no CI, and no automated UI tests.

## Why not NO-GO
- No critical check fails.
- No remaining risk can give a user a wrong availability answer. The only one that did (R2) is fixed and covered by tests.
- The open risks affect developer machines or install-time surface, not what users of the built page receive.
- Every open risk has a control and an owner (below).

## Conditions (must be met before publishing)
| # | Condition | Control | Owner | Status |
|---|---|---|---|---|
| 1 | Human review of the M2 diff (`git show c89c70e`) | Dauren reads the diff, re-runs `npm test` and checks X2–X4 in the browser, then records the approval in `ai-use-record.md` | Omarov Dauren | ☑ behaviour verified by Dauren in Bolt (X2–X4, `evidence/screens/human-bolt-*.png`); ☑ `npm test` 32/32 run by Dauren in the Bolt terminal; ☐ reading the diff not recorded |
| 2 | Remove unused `@supabase/supabase-js` (R6) | Reviewed dependency change, following the plan in `08-background-agent.md`; `npm audit --omit=dev` must show 0 | Omarov Dauren | ☐ open |
| 3 | Dev-server advisories (R4) | Until Vite is upgraded: run `npm run dev` on localhost only (never `--host`) and stop it when not in use | Omarov Dauren | ☐ standing control |
| 4 | Known limitations are accepted and documented | UI has no automated tests; tests need Node ≥ 22.18; only the first overlapping booking is listed (R10); "scheduled.." typo (R5) | Omarov Dauren | ☑ documented |

If condition 1 finds a problem in M2, the decision becomes **NO-GO** until it is fixed and re-tested.
