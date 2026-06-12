"use client";

interface NoteDisplayProps {
  note: string;
  octave: number;
  frequency: number;
  cents: number;
  closestStringNote: string;
  closestStringName: string;
  isActive: boolean;
}

export default function NoteDisplay({
  note,
  octave,
  frequency,
  cents,
  closestStringNote,
  closestStringName,
  isActive,
}: NoteDisplayProps) {
  const hasSignal = isActive && note !== "-";
  const inTune = hasSignal && Math.abs(cents) <= 5;

  const noteColor = !hasSignal
    ? "text-zinc-600"
    : inTune
    ? "text-emerald-400"
    : Math.abs(cents) <= 15
    ? "text-yellow-400"
    : "text-red-400";

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Closest string badge */}
      <div className="text-xs font-semibold tracking-widest uppercase text-zinc-500 h-5">
        {hasSignal ? closestStringName : ""}
      </div>

      {/* Main note */}
      <div className="relative flex items-start justify-center">
        <span
          className={`font-mono font-black tracking-tight transition-colors duration-150 ${noteColor}`}
          style={{ fontSize: "clamp(7rem, 20vw, 10rem)", lineHeight: 1 }}
        >
          {note}
        </span>
        {hasSignal && octave > 0 && (
          <span
            className={`font-mono font-bold mt-4 transition-colors duration-150 ${noteColor} opacity-60`}
            style={{ fontSize: "clamp(2rem, 6vw, 3rem)" }}
          >
            {octave}
          </span>
        )}
      </div>

      {/* Frequency & cents */}
      <div className="flex gap-6 text-sm">
        <div className="flex flex-col items-center">
          <span className="text-zinc-500 text-xs uppercase tracking-widest">Freq</span>
          <span className="font-mono font-semibold text-zinc-200">
            {hasSignal ? `${frequency.toFixed(1)} Hz` : "— Hz"}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-zinc-500 text-xs uppercase tracking-widest">Cents</span>
          <span className={`font-mono font-semibold ${noteColor}`}>
            {hasSignal ? (cents >= 0 ? `+${cents}` : `${cents}`) : "±0"}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-zinc-500 text-xs uppercase tracking-widest">Target</span>
          <span className="font-mono font-semibold text-zinc-200">
            {hasSignal ? closestStringNote : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
