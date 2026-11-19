# Task 08: Background agent safeguards (hypothetical design)

No paid background-agent service was used. This is a design for how I would hand one task to an asynchronous coding agent (e.g. a cloud agent that works alone and reports back).

## The task
> **Remove the unused `@supabase/supabase-js` dependency (risk R6) and confirm nothing breaks.**

This task was chosen because it is small, has a clear success test (`npm audit --omit=dev` shows 0) and touches the dependency review gate, so the safeguards matter.

## Isolation
- **Branch / worktree:** the agent works in a fresh git worktree on branch `agent/remove-supabase`, created from `assignment-05`. It never touches `main` or my working copy.
  `git worktree add ../scrc-agent -b agent/remove-supabase assignment-05`
- **Environment:** a disposable container with Node 22.18+. It gets **no secrets**: no git push token with write access to `main`, no deploy keys, no `.env`. Network access is limited to the npm registry.

## Allowed files
| May change | May read | Must not touch |
|---|---|---|
| `package.json`, `package-lock.json` | everything in the repo | `src/utils.ts`, `src/data.ts`, `src/components/**`, `AGENTS.md`, `docs/evidence/**`, `.bolt/**`, `tsconfig*.json`, `eslint.config.js`, `vite.config.ts` |
| `docs/agent-runs/remove-supabase.md` (its report) | | anything outside the worktree |

## Allowed commands
`npm uninstall @supabase/supabase-js` (the one approved dependency change for this task), `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm audit`, `npm ls`, `grep`, `git status`, `git diff`, `git add`, `git commit` (on its branch only).

## Prohibited operations
`npm install <anything>`, `npm audit fix`, `npm update`, editing source code, `git push` to any branch other than `agent/remove-supabase`, `git push --force`, `git rebase`, `git reset --hard`, deleting files outside `node_modules/` and `dist/`, Bolt "Publish" or any deploy, opening or merging pull requests into `main`, reading or creating `.env` or credentials. Everything in AGENTS.md "Forbidden actions" also applies.

## Limits
- **Time:** 20 minutes wall clock. **Budget:** at most 30 tool calls or commands.
- **Scope stop rule:** if any check fails after the uninstall, or the change would need edits outside the allowed files, the agent **stops and reports**. It does not try to fix code.
- **Size limit:** a diff in `package.json` larger than removing that one line, or any `src/` change, means the run is invalid.

## Required artifacts (in `docs/agent-runs/remove-supabase.md` + the branch)
1. **Change summary:** what was removed and why, in 3–5 lines.
2. **Diff:** `git diff assignment-05 -- package.json` and `git diff --stat assignment-05` (the lockfile diff summarised).
3. **Test logs:** full output of `npm run lint`, `npm run typecheck`, `npm test` (with the pass/fail totals) and `npm run build`.
4. **Build result:** bundle sizes before and after. They should be identical, since Supabase is not bundled.
5. **Risk notes:** `npm audit --omit=dev` and `npm audit` counts before and after, and anything unexpected. Any claim not backed by a log must be labelled "unverified".

## Human review and approval
- The agent may only **propose** the change, as a pull request from `agent/remove-supabase` → `assignment-05`.
- I (Dauren) review the diff line by line and **re-run the four checks myself** on the branch. I do not trust the pasted logs alone. Then I approve and merge.
- Deployment (Bolt Publish) is a separate, manual step, done only after the merge and a final browser check of T1–T6.

## Failure and rollback
- **The agent fails or times out:** delete the worktree and branch (`git worktree remove ../scrc-agent && git branch -D agent/remove-supabase`). Nothing else was touched, so there is nothing to roll back.
- **A check fails in review:** reject the PR, record the failure in the risk register (R6 stays open), and do not merge.
- **A problem is found after merge:** `git revert <merge-commit>` on `assignment-05` (a new commit, no history rewrite), then `npm ci`, re-run all checks, and record the incident.
- **Deployed by mistake:** re-publish the previous Bolt version from Bolt's version history, then investigate why the gate was bypassed.
