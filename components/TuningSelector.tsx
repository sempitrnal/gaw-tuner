"use client";

import { Tuning } from "@/lib/tunings";

interface TuningSelectorProps {
  tunings: Tuning[];
  selectedId: string;
  onChange: (id: string) => void;
  disabled: boolean;
}

export default function TuningSelector({
  tunings,
  selectedId,
  onChange,
  disabled,
}: TuningSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="hidden sm:inline text-xs text-zinc-400 font-semibold tracking-widest uppercase whitespace-nowrap">
        Tuning
      </label>
      <select
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="
          bg-zinc-800 text-zinc-200 text-sm rounded-lg border border-zinc-700
          px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500
          disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
          transition-colors hover:border-zinc-600
        "
      >
        {tunings.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}
