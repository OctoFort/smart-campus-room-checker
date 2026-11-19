# Acceptance criteria

These must stay true after every change: refactoring, mitigations, agent work. They come from Practice #06 (AC1–AC6), merged into five checkable statements. Times are whole minutes from midnight (0–1440).

| ID | Criterion | How it is verified |
|---|---|---|
| **AC-1** Valid interval | The result is **Available** only when `current`, `start` and `end` are whole numbers, `0 ≤ start < end ≤ 1440`, and `start > current`. Otherwise the result is **Unavailable**, with a reason naming the violated rule. The app must not silently change what the user typed. | Cases T6, X1, X2, X3, X4; unit tests |
| **AC-2** Max duration | `end − start = 120` is allowed and `121` is rejected. | Cases T4, T5; unit tests |
| **AC-3** Blocked room | A request for a room with `blocked: true` is always **Unavailable**. | Case T3; unit tests |
| **AC-4** Overlap | A request that overlaps an existing booking is **Unavailable**. Touching endpoints (e.g. 600–660 and 660–720) are allowed. | Cases T1, T2; unit tests |
| **AC-5** Read-only, clear feedback | Every check shows Available / Unavailable plus every failed rule as a reason. It never modifies `ROOMS` and never saves, sends or stores anything. The page has no horizontal scroll at 390 px width. | Case M1; unit test "does not mutate room data"; code review (no fetch/storage calls) |

## Reference cases

Sample data: Room A101 has bookings 600–660 and 840–900. Lab B202 has bookings 510–570 and 780–870. Room C305 is blocked. Unless stated otherwise, `current = 540`.

| ID | Room | start–end | Expected |
|---|---|---|---|
| T1 touching | A101 | 660–720 | Available |
| T2 overlap | A101 | 630–690 | Unavailable (overlap) |
| T3 blocked | C305 | 660–720 | Unavailable (blocked) |
| T4 exactly 2 h | A101 | 720–840 | Available |
| T5 over 2 h | B202 | 600–721 | Unavailable (duration). B202 is used so that no overlap muddies the result. |
| T6 starts now | A101 | 540–570 | Unavailable (start after current) |
| X1 end before start | B202 | 700–650 | Unavailable |
| X2 end > 1440 | B202 | 1380–1500 | Unavailable ("must not exceed 1440") |
| X3 empty start | B202 | (empty)–720 | Unavailable ("required") |
| X4 decimal | B202 | 600.5–700 | Unavailable ("whole number") |
| M1 mobile | — | 390 px viewport | no horizontal overflow |

**Baseline status:** AC-2, AC-3, AC-4 and AC-5 hold. **AC-1 fails** for X2 and X4, and X3 gives misleading feedback (see `01-baseline.md`).
