// Unit tests for the booking rules (AC-1 to AC-5 in docs/acceptance-criteria.md).
// Run with: npm test  (Node's built-in test runner, Node >= 22.18 for TypeScript type stripping)
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { checkAvailability } from "./utils.ts";
import { ROOMS } from "./data.ts";
import type { Room } from "./types.ts";

function room(id: string): Room {
  const r = ROOMS.find((x) => x.id === id);
  if (!r) throw new Error(`unknown room ${id}`);
  return r;
}
const A101 = room("a101"); // bookings 600–660, 840–900
const B202 = room("b202"); // bookings 510–570, 780–870
const C305 = room("c305"); // blocked, booking 720–780
const D110 = room("d110"); // bookings 900–1020, 1140–1200

describe("reference cases T1–T6 (Practice #06)", () => {
  const cases: [string, Room, number, number, number, "available" | "unavailable"][] = [
    ["T1 touching", A101, 540, 660, 720, "available"],
    ["T2 overlap", A101, 540, 630, 690, "unavailable"],
    ["T3 blocked", C305, 540, 660, 720, "unavailable"],
    ["T4 exactly 2h", A101, 540, 720, 840, "available"],
    ["T5 over 2h", B202, 540, 600, 721, "unavailable"],
    ["T6 starts now", A101, 540, 540, 570, "unavailable"],
  ];
  for (const [name, r, now, start, end, expected] of cases) {
    test(name, () => {
      assert.equal(checkAvailability(r, now, start, end).decision, expected);
    });
  }
});

describe("AC-1 valid interval", () => {
  test("start must be earlier than end", () => {
    const res = checkAvailability(B202, 540, 700, 650);
    assert.equal(res.decision, "unavailable");
    assert.ok(res.reasons.some((r) => r.includes("earlier than end")));
  });
  test("start equal to end is rejected", () => {
    assert.equal(checkAvailability(B202, 540, 700, 700).decision, "unavailable");
  });
  test("start below 0 is rejected", () => {
    const res = checkAvailability(B202, -100, -10, 60);
    assert.equal(res.decision, "unavailable");
    assert.ok(res.reasons.some((r) => r.includes("at least 0")));
  });
  test("end above 1440 is rejected", () => {
    const res = checkAvailability(D110, 540, 1380, 1441);
    assert.equal(res.decision, "unavailable");
    assert.ok(res.reasons.some((r) => r.includes("1440")));
  });
  test("end exactly 1440 is allowed", () => {
    assert.equal(checkAvailability(D110, 540, 1380, 1440).decision, "available");
  });
  test("start must be strictly after current time", () => {
    assert.equal(checkAvailability(B202, 600, 600, 660).decision, "unavailable");
    assert.equal(checkAvailability(B202, 599, 600, 660).decision, "available");
  });
});

describe("AC-2 maximum duration 120 minutes", () => {
  test("exactly 120 minutes is allowed", () => {
    assert.equal(checkAvailability(B202, 540, 600, 720).decision, "available");
  });
  test("121 minutes is rejected with a duration reason only", () => {
    const res = checkAvailability(B202, 540, 600, 721);
    assert.equal(res.decision, "unavailable");
    assert.equal(res.reasons.length, 1);
    assert.match(res.reasons[0], /exceeds the 120-minute limit/);
  });
});

describe("AC-3 blocked room", () => {
  test("blocked room is unavailable even for a free slot", () => {
    const res = checkAvailability(C305, 540, 660, 720); // touches 720–780, otherwise free
    assert.equal(res.decision, "unavailable");
    assert.equal(res.reasons.length, 1);
    assert.match(res.reasons[0], /is blocked/);
  });
});

describe("AC-4 overlap, touching allowed", () => {
  test("touching the end of a booking is allowed", () => {
    assert.equal(checkAvailability(A101, 540, 660, 720).decision, "available");
  });
  test("touching the start of a booking is allowed", () => {
    assert.equal(checkAvailability(A101, 0, 540, 600).decision, "available");
  });
  const overlapping: [string, number, number][] = [
    ["partial overlap at the end", 630, 690],
    ["partial overlap at the start", 570, 630],
    ["request inside booking", 610, 650],
    ["request contains booking", 590, 670],
    ["identical interval", 600, 660],
  ];
  for (const [name, start, end] of overlapping) {
    test(`${name} (${start}–${end}) is rejected`, () => {
      const res = checkAvailability(A101, 0, start, end);
      assert.equal(res.decision, "unavailable");
      assert.ok(res.reasons.some((r) => r.includes("Intro to Linguistics")));
    });
  }
});

describe("AC-5 read-only and complete feedback", () => {
  test("checking never modifies the sample data", () => {
    const before = JSON.stringify(ROOMS);
    for (const r of ROOMS) {
      for (const [now, s, e] of [[540, 660, 720], [540, 630, 690], [0, -5, 2000]]) {
        checkAvailability(r, now, s, e);
      }
    }
    assert.equal(JSON.stringify(ROOMS), before);
  });
  test("every failed rule is reported", () => {
    // starts at current time, 3 h long, blocked room, overlaps the 720–780 seminar
    const res = checkAvailability(C305, 540, 540, 720 + 60);
    assert.equal(res.decision, "unavailable");
    assert.equal(res.reasons.length, 4);
  });
  test("an available result has no reasons", () => {
    assert.deepEqual(checkAvailability(A101, 540, 660, 720).reasons, []);
  });
});
