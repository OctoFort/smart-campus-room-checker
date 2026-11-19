# Assignment #05: Software Engineering · Omarov Dauren

AI-assisted repository customization, agent readiness and software risk governance, applied to the **Smart Campus Room Availability Checker** (Bolt.new app from Practice #06).

**Baseline:** tag `baseline` (commit `6a842af`) · **Final:** branch `assignment-05` · code final at `c89c70e`
**Release decision:** **CONDITIONAL GO** · **Readiness:** Level 1 → **Level 2 (Documented)**
**Tests:** `npm test` missing → **32/32 pass** · **UI reference cases:** 8/11 → **11/11**

| Task | Document |
|---|---|
| 01 Baseline and context | [01-baseline.md](01-baseline.md) |
| 02 Agent instructions | [../AGENTS.md](../AGENTS.md), [../CLAUDE.md](../CLAUDE.md), [acceptance-criteria.md](acceptance-criteria.md), [../README.md](../README.md) |
| 03 Pattern decision | [03-pattern-decision.md](03-pattern-decision.md) |
| 04 Read-only risk review | [04-risk-review.md](04-risk-review.md) |
| 05 Risk register | [05-risk-register.md](05-risk-register.md) |
| 06 Agent-readiness audit | [06-readiness-audit.md](06-readiness-audit.md) |
| 07 Mitigations and verification | [07-mitigations.md](07-mitigations.md) |
| 08 Background agent safeguards | [08-background-agent.md](08-background-agent.md) |
| 09 Release decision | [09-release-decision.md](09-release-decision.md) |
| 10 AI reflection | [10-ai-reflection.md](10-ai-reflection.md) |
| AI-use record / evidence appendix | [ai-use-record.md](ai-use-record.md) |
| Raw command output and screenshots | [evidence/](evidence/) |

## Commit history
```
6a842af (tag: baseline) Baseline: Bolt.new export (project-bolt-sb1-mv1prh99), unchanged
7062ca6 docs: baseline repository map, check results and weaknesses
9e7738f (main) docs: add README, AGENTS.md, CLAUDE.md pointer and acceptance criteria
bfea826 refactor: extract presentational components from App.tsx
588e31a docs: pattern decision, post-refactor check logs, update architecture notes
f719a6d docs: read-only AI risk review (12 findings) and risk register
cdd41ba docs: fix line references in risk register
817082b test: add unit tests for booking rules with Node's built-in runner (M1, risk R1)
c89c70e fix: validate typed times instead of silently clamping them (M2, risks R2+R3)
9e90d04 chore: correct commit c89c70e message (approval line was premature)
f4debff docs: final check logs, mitigation records, updated risk scores
ae51c64 (HEAD -> assignment-05) docs: readiness audit, background-agent design, release decision, reflection draft, AI-use record
(+ this index commit)
```

## Reproduce
```bash
npm ci
npm run lint && npm run typecheck && npm test && npm run build
git checkout baseline && npm ci && npm test   # -> Missing script: "test"
```
