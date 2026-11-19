export function NumberField({
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
        value={Number.isNaN(value) ? "" : value}
        min={min}
        max={max}
        onChange={(e) => {
          // Pass on exactly what the user typed. Empty becomes NaN, and nothing is
          // clamped or rounded. checkAvailability() decides validity and explains it.
          const v = e.target.value;
          onChange(v === "" ? NaN : Number(v));
        }}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
      />
      <span className="mt-1 block text-xs text-slate-400">
        {hint} · {min}–{max}
      </span>
    </label>
  );
}
