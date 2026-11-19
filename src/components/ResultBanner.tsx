import { CheckCircle2, XCircle } from "lucide-react";
import type { AvailabilityResult } from "../types";

export function ResultBanner({ result }: { result: AvailabilityResult }) {
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
