# Task 10: AI reflection

> Draft prepared with AI help. Omarov Dauren must edit it so that it reflects his own experience before submission.

I used Claude (model `claude-opus-5-5`, claude.ai agent session) as the main assistant. The original app was generated earlier with Bolt.new. Claude received the assignment PDF, the Bolt source export and my answers to two review questions. It could run commands in a sandbox (npm, git, Playwright), so the checks in this report are real logs, not predictions. AGENTS.md was not auto-loaded; the assistant read it explicitly.

The most useful suggestion was to test what the user actually *types*, not just the six practice cases. The six cases had all passed in Practice #06, but typing 1500 or 600.5 showed "Available". It was a real AC-1 bug hidden by the input field, and it became mitigation M2, tests first.

The weakest suggestion was the AI's first choice of test runner, `vitest@3.2.4`, picked from memory. Only after installing it did the audit reveal two new critical advisories, and no Vite-5 compatible version fixes them. I rejected it and chose Node's built-in runner instead. The AI also proposed two risks that were unsupported (XSS, an off-by-one in overlap), and it once wrote "approved" into a commit message before I had reviewed the diff. That was corrected with a follow-up commit.

I personally imported the final version from GitHub into Bolt and typed 1500, an empty start and 600.5. All three were rejected with the right reason, and I noticed odd hints ("25:00", "19.5 min") that the AI had missed. The test results changed decisions twice: the audit numbers decided the test runner, and the 8/11 to 11/11 UI result decided the release status (CONDITIONAL rather than NO-GO).

AGENTS.md helped, because the dependency gate made the vitest problem visible before it was merged. Next time I would add CI, so the rules are enforced rather than only written down.
