import { CalendarClock } from "lucide-react";
import { formatTime } from "../utils";
import { Card, CardTitle } from "./Card";

export function Timeline({
  bookings,
  start,
  end,
  available,
}: {
  bookings: { start: number; end: number; label: string }[];
  start: number;
  end: number;
  available: boolean;
}) {
  const axisTicks = [0, 180, 360, 540, 720, 900, 1080, 1260, 1440];
  const mobileTicks = [0, 360, 720, 1080, 1440];
  const candidateLeft = (Math.max(0, start) / 1440) * 100;
  const candidateWidth = (Math.max(0, end - start) / 1440) * 100;
  const slotColor = available ? "bg-emerald-500" : "bg-red-500";

  return (
    <Card>
      <CardTitle icon={<CalendarClock size={16} />}>
        Today's timeline (00:00–24:00)
      </CardTitle>

      {/* Timeline track */}
      <div className="relative h-16 rounded-lg border border-slate-200 bg-slate-50">
        <div className="relative mx-5 h-full overflow-visible">
          {/* gridlines at all 3-hour ticks */}
          {axisTicks.map((m) => (
            <div
              key={m}
              className="absolute top-0 bottom-0 border-l border-slate-300/60"
              style={{ left: `${(m / 1440) * 100}%` }}
            />
          ))}

          {/* existing bookings */}
          {bookings.map((b, i) => (
            <div
              key={i}
              className="absolute top-1.5 h-6 rounded bg-slate-400"
              style={{
                left: `${(b.start / 1440) * 100}%`,
                width: `${((b.end - b.start) / 1440) * 100}%`,
              }}
              title={`${b.label} (${formatTime(b.start)}–${formatTime(b.end)})`}
            />
          ))}

          {/* candidate slot */}
          {candidateWidth > 0 && (
            <div
              className={`absolute bottom-1.5 h-6 rounded ${slotColor}`}
              style={{
                left: `${candidateLeft}%`,
                width: `${Math.min(candidateWidth, 100 - candidateLeft)}%`,
              }}
              title={`Your slot: ${formatTime(start)}–${formatTime(end)}`}
            />
          )}
        </div>
      </div>

      {/* Hour axis labels — every 3h on desktop, every 6h on mobile */}
      <div className="relative mt-1 h-5">
        <div className="mx-5 h-full">
          {/* mobile: every 6 hours */}
          <div className="relative h-full sm:hidden">
            {mobileTicks.map((m) => (
              <span
                key={m}
                className="absolute whitespace-nowrap text-[10px] text-slate-400"
                style={{
                  left: `${(m / 1440) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              >
                {formatTime(m)}
              </span>
            ))}
          </div>
          {/* desktop: every 3 hours */}
          <div className="relative hidden h-full sm:block">
            {axisTicks.map((m) => (
              <span
                key={m}
                className="absolute whitespace-nowrap text-[10px] text-slate-400"
                style={{
                  left: `${(m / 1440) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              >
                {formatTime(m)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Booking list with full labels */}
      {bookings.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {bookings.map((b, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-xs text-slate-600"
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded bg-slate-400" />
              <span className="font-medium text-slate-700">{b.label}</span>
              <span className="text-slate-400">
                {formatTime(b.start)}–{formatTime(b.end)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Candidate slot info */}
      {candidateWidth > 0 && (
        <div
          className={`mt-2 flex items-center gap-2 text-xs ${
            available ? "text-emerald-700" : "text-red-700"
          }`}
        >
          <span className={`h-2.5 w-2.5 shrink-0 rounded ${slotColor}`} />
          <span className="font-medium">
            Your slot: {formatTime(start)}–{formatTime(end)}
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-slate-400" /> Existing booking
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className={`h-3 w-3 rounded ${available ? "bg-emerald-500" : "bg-red-500"}`}
          />
          Your slot {available ? "(available)" : "(conflict)"}
        </span>
      </div>
    </Card>
  );
}
