"use client";

import { GuitarString } from "@/lib/tunings";

interface StringGuideProps {
  strings: GuitarString[];
  activeStringName: string;
}

export default function StringGuide({ strings, activeStringName }: StringGuideProps) {
  return (
    <div className="w-full max-w-md">
      <h2 className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-3 text-center">
        String Reference
      </h2>
      <div className="grid grid-cols-6 gap-2">
        {strings.map((s) => {
          const isActive = activeStringName === `String ${s.name}`;
          return (
            <div
              key={s.name}
              className={`
                flex flex-col items-center gap-1 rounded-xl p-2 transition-all duration-200
                ${isActive
                  ? "bg-emerald-500/20 border border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                  : "bg-zinc-800/50 border border-zinc-700/50"
                }
              `}
            >
              <div
                className={`text-xs font-bold tracking-wide ${
                  isActive ? "text-emerald-400" : "text-zinc-400"
                }`}
              >
                {s.note}
                <span className="text-[9px] opacity-60">{s.octave}</span>
              </div>
              <div
                className={`w-full rounded-full transition-all duration-200 ${
                  isActive ? "bg-emerald-400" : "bg-zinc-600"
                }`}
                style={{
                  height: `${Math.max(1, 4 - parseInt(s.name))}px`,
                  minHeight: "1px",
                }}
              />
              <div className="text-[10px] text-zinc-500 font-mono">
                {s.frequency < 100
                  ? s.frequency.toFixed(1)
                  : Math.round(s.frequency)}
                <span className="text-[8px]"> Hz</span>
              </div>
              <div
                className={`text-[10px] font-bold ${
                  isActive ? "text-emerald-400" : "text-zinc-600"
                }`}
              >
                #{s.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
