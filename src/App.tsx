import { useMemo, useState } from "react";
import {
  Clock,
  DoorOpen,
  CheckCircle2,
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
import { Card, CardTitle } from "./components/Card";
import { NumberField } from "./components/NumberField";
import { ResultBanner } from "./components/ResultBanner";
import { Timeline } from "./components/Timeline";

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
