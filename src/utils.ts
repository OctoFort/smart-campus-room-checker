import type { AvailabilityResult, Room } from "./types";

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function durationLabel(minutes: number): string {
  if (minutes <= 0) return "0 min";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

export function checkAvailability(
  room: Room,
  current: number,
  start: number,
  end: number
): AvailabilityResult {
  const reasons: string[] = [];

  if (start < 0) {
    reasons.push("Start time must be at least 0 (00:00).");
  }
  if (end > 1440) {
    reasons.push("End time must not exceed 1440 (24:00).");
  }
  if (start >= end) {
    reasons.push("Start time must be earlier than end time.");
  }
  if (start <= current) {
    reasons.push(
      `Start time must be after the current time (${formatTime(current)}).`
    );
  }

  const duration = end - start;
  if (duration > 120) {
    reasons.push(
      `Booking duration is ${durationLabel(duration)}, which exceeds the 120-minute limit.`
    );
  }

  if (room.blocked) {
    reasons.push(
      `${room.name} is blocked${room.blockedReason ? `: ${room.blockedReason}` : ""}.`
    );
  }

  for (const b of room.bookings) {
    if (start < b.end && end > b.start) {
      reasons.push(
        `Overlaps existing booking "${b.label}" (${formatTime(b.start)}–${formatTime(b.end)}).`
      );
      break;
    }
  }

  return {
    decision: reasons.length === 0 ? "available" : "unavailable",
    reasons,
  };
}
