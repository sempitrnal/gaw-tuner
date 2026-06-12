"use client";

import { useMemo } from "react";

interface TuningMeterProps {
  cents: number;
  isActive: boolean;
}

const CLAMP = 50;

export default function TuningMeter({ cents, isActive }: TuningMeterProps) {
  const clamped = Math.max(-CLAMP, Math.min(CLAMP, cents));
  const percent = ((clamped + CLAMP) / (CLAMP * 2)) * 100;

  const inTune = isActive && Math.abs(cents) <= 5;
  const flat = isActive && cents < -5;
  const sharp = isActive && cents > 5;

  const color = useMemo(() => {
    if (!isActive) return "bg-zinc-600";
    if (inTune) return "bg-emerald-400";
    if (Math.abs(cents) <= 15) return "bg-yellow-400";
    return "bg-red-400";
  }, [isActive, inTune, cents]);

  const ticks = [-40, -30, -20, -10, 0, 10, 20, 30, 40];

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {/* Flat / In Tune / Sharp labels */}
      <div className="flex justify-between w-full px-2 text-xs font-semibold tracking-widest uppercase">
        <span className={flat ? "text-red-400" : "text-zinc-500"}>♭ Flat</span>
        <span className={inTune ? "text-emerald-400" : "text-zinc-500"}>
          In Tune
        </span>
        <span className={sharp ? "text-red-400" : "text-zinc-500"}>
          Sharp ♯
        </span>
      </div>

      {/* Meter track */}
      <div className="relative w-full h-6 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
        {/* Center marker */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-zinc-500 z-10 -translate-x-px" />

        {/* Indicator needle */}
        <div
          className={`absolute top-1 bottom-1 w-1.5 rounded-full transition-all duration-75 ${color} shadow-lg`}
          style={{
            left: `calc(${percent}% - 3px)`,
          }}
        />
      </div>

      {/* Tick marks */}
      <div className="relative w-full flex justify-between px-0">
        {ticks.map((tick) => {
          const pos = ((tick + CLAMP) / (CLAMP * 2)) * 100;
          return (
            <div
              key={tick}
              className="flex flex-col items-center"
              style={{ width: "1px" }}
            >
              <div
                className={`w-px h-2 ${tick === 0 ? "bg-zinc-400" : "bg-zinc-600"}`}
              />
              <span className="text-[10px] text-zinc-500 mt-0.5">
                {tick > 0 ? `+${tick}` : tick}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
