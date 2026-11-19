import { useMemo, useState } from "react";
import {
  Clock,
  DoorOpen,
  CheckCircle2,
  XCircle,
  CalendarClock,
  Ban,
  Info,
  Timer,
  MapPin,
  Users,
} from "lucide-react";
import { ROOMS } from "./data";
import type { AvailabilityResult } from "./types";
import {
  checkAvailability,
  durationLabel,
  formatTime,
} from "./utils";

export default function App() {
  const [roomId, setRoomId] = useState(ROOMS[0].id);
  const [current, setCurrent] = useState(540);
  const [start, setStart] = useState(660);
  const [end, setEnd] = useState(720);

  const room = useMemo(
    () => ROOMS.find((r) => r.id === roomId)!,
    [roomId]
  );

  const result: AvailabilityResult = useMemo(
    () => checkAvailability(room, current, start, end),
    [room, current, start, end]
  );

  const candidateDuration = end - start;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
              <DoorOpen size={22} />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Smart Campus Room Availability
              </h1>
              <p className="text-sm text-slate-500">
                Check whether a room is free for your desired time slot.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left: Inputs */}
          <section className="lg:col-span-3 space-y-5">
            {/* Room selector */}
            <Card>
              <CardTitle icon={<MapPin size={16} />}>Select a room</CardTitle>
              <div className="grid gap-3 sm:grid-cols-2">
                {ROOMS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRoomId(r.id)}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      r.id === roomId
                        ? "border-teal-600 bg-teal-50 ring-1 ring-teal-600"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">
                        {r.name}
                      </span>
                      {r.blocked ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          <Ban size={11} /> Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          <CheckCircle2 size={11} /> Open
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={11} /> {r.building}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users size={11} /> {r.capacity}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Time inputs */}
            <Card>
              <CardTitle icon={<Clock size={16} />}>Booking time</CardTitle>
              <div className="grid gap-4 sm:grid-cols-3">
                <NumberField
                  label="Current time"
                  value={current}
                  onChange={setCurrent}
                  min={0}
                  max={1440}
                  hint={formatTime(current)}
                />
                <NumberField
                  label="Start time"
                  value={start}
                  onChange={setStart}
                  min={0}
                  max={1440}
                  hint={formatTime(start)}
                />
                <NumberField
                  label="End time"
                  value={end}
                  onChange={setEnd}
                  min={0}
                  max={1440}
                  hint={formatTime(end)}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Timer size={12} /> Duration:{" "}
                  {candidateDuration > 0
                    ? durationLabel(candidateDuration)
                    : "—"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarClock size={12} /> Slot:{" "}
                  {formatTime(start)}–{formatTime(end)}
                </span>
              </div>
            </Card>

            {/* Result */}
            <ResultBanner result={result} />
          </section>

          {/* Right: Room details */}
          <aside className="lg:col-span-2 space-y-5">
            <Card>
              <CardTitle icon={<Info size={16} />}>Room details</CardTitle>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Room</dt>
                  <dd className="font-medium text-slate-900">{room.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Building</dt>
                  <dd className="font-medium text-slate-900">
                    {room.building}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Capacity</dt>
                  <dd className="font-medium text-slate-900">
                    {room.capacity} seats
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Status</dt>
                  <dd>
                    {room.blocked ? (
                      <span className="font-medium text-red-600">
                        Blocked
                      </span>
                    ) : (
                      <span className="font-medium text-emerald-600">
                        Not blocked
                      </span>
                    )}
                  </dd>
                </div>
                {room.blocked && room.blockedReason && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                    {room.blockedReason}
                  </p>
                )}
              </dl>
            </Card>

            <Card>
              <CardTitle icon={<CalendarClock size={16} />}>
                Existing bookings
              </CardTitle>
              {room.bookings.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No existing bookings for this room.
                </p>
              ) : (
                <ul className="space-y-2">
                  {room.bookings.map((b, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                    >
                      <span className="text-sm font-medium text-slate-700">
                        {b.label}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {formatTime(b.start)}–{formatTime(b.end)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Timeline */}
            <Timeline
              bookings={room.bookings}
              start={start}
              end={end}
              available={result.decision === "available"}
            />
          </aside>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-400">
          Prototype only — no bookings are saved or confirmed.
        </footer>
      </div>
    </div>
  );
}

/* ---------- small UI helpers ---------- */

function Card({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {children}
    </div>
  );
}

function CardTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
      <span className="text-teal-600">{icon}</span>
      {children}
    </h2>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  hint: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") {
            onChange(min);
          } else {
            const n = Number.parseInt(v, 10);
            if (!Number.isNaN(n)) {
              onChange(Math.max(min, Math.min(max, n)));
            }
          }
        }}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
      />
      <span className="mt-1 block text-xs text-slate-400">
        {hint} · {min}–{max}
      </span>
    </label>
  );
}

function ResultBanner({ result }: { result: AvailabilityResult }) {
  const available = result.decision === "available";
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition-all ${
        available
          ? "border-emerald-200 bg-emerald-50"
          : "border-red-200 bg-red-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            available
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {available ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
        </div>
        <div>
          <p
            className={`text-lg font-semibold ${
              available ? "text-emerald-800" : "text-red-800"
            }`}
          >
            {available ? "Available" : "Unavailable"}
          </p>
          <p
            className={`text-sm ${
              available ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {available
              ? "This time slot can be booked."
              : "This time slot cannot be booked."}
          </p>
        </div>
      </div>
      {!available && result.reasons.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t border-red-200/60 pt-3">
          {result.reasons.map((r, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-red-700"
            >
              <XCircle size={14} className="mt-0.5 shrink-0" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Timeline({
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
