"use client";

import { useState } from "react";
import { TUNINGS } from "@/lib/tunings";
import { useTuner } from "@/hooks/useTuner";
import TuningMeter from "@/components/TuningMeter";
import NoteDisplay from "@/components/NoteDisplay";
import StringGuide from "@/components/StringGuide";
import TuningSelector from "@/components/TuningSelector";
import MicButton from "@/components/MicButton";

export default function GuitarTuner() {
  const [selectedTuningId, setSelectedTuningId] = useState("standard");
  const selectedTuning =
    TUNINGS.find((t) => t.id === selectedTuningId) ?? TUNINGS[0];

  const { state, start, stop } = useTuner(selectedTuning);
  const {
    frequency,
    note,
    octave,
    cents,
    closestStringNote,
    closestStringName,
    micStatus,
    isListening,
    errorMessage,
  } = state;

  const handleTuningChange = (id: string) => {
    if (isListening) stop();
    setSelectedTuningId(id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="flex items-center justify-between flex-wrap gap-y-2 gap-x-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-800/60 backdrop-blur-sm sticky top-0 z-20 bg-zinc-950/80">
        <div className="flex items-center gap-2.5 shrink-0">
          <GuitarIcon />
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-zinc-100 leading-tight">
              GawTuner
            </h1>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 leading-tight">
              tuner para sa mga gaw
            </p>
          </div>
        </div>

        <TuningSelector
          tunings={TUNINGS}
          selectedId={selectedTuningId}
          onChange={handleTuningChange}
          disabled={isListening}
        />
      </header>

      {/* Main */}
      <main className="flex flex-col items-center gap-8 flex-1 px-4 py-8 max-w-xl mx-auto w-full">
        {/* Mic status bar */}
        <MicStatusBadge micStatus={micStatus} />

        {/* Note display */}
        <NoteDisplay
          note={note}
          octave={octave}
          frequency={frequency}
          cents={cents}
          closestStringNote={closestStringNote}
          closestStringName={closestStringName}
          isActive={isListening}
        />

        {/* Tuning meter */}
        <TuningMeter cents={cents} isActive={isListening && note !== "-"} />

        {/* CTA button */}
        <MicButton
          isListening={isListening}
          micStatus={micStatus}
          onStart={start}
          onStop={stop}
        />

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-start gap-3 w-full max-w-md bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            <span className="text-red-400 mt-0.5 shrink-0">⚠</span>
            <p className="text-sm text-red-300">{errorMessage}</p>
          </div>
        )}

        {/* Divider */}
        <div className="w-full border-t border-zinc-800/60" />

        {/* String guide */}
        <StringGuide
          strings={selectedTuning.strings}
          activeStringName={closestStringName}
        />
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-zinc-700 border-t border-zinc-800/40">
        Play a string and it will be detected automatically
      </footer>
    </div>
  );
}

function GuitarIcon() {
  return (
    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18.5 1.5a1.5 1.5 0 0 1 2.1 2.1L8 16.2a4 4 0 0 1-5.7-5.7Z" />
        <path d="m16 8 1.5-1.5" />
        <circle cx="7" cy="17" r="3" />
      </svg>
    </div>
  );
}

type MicStatus = "idle" | "requesting" | "active" | "error" | "denied";

function MicStatusBadge({ micStatus }: { micStatus: MicStatus }) {
  const configs: Record<
    MicStatus,
    { color: string; dot: string; label: string }
  > = {
    idle: {
      color: "text-zinc-500 bg-zinc-800/50 border-zinc-700/50",
      dot: "bg-zinc-500",
      label: "Microphone Off",
    },
    requesting: {
      color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
      dot: "bg-yellow-400 animate-pulse",
      label: "Requesting Access...",
    },
    active: {
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      dot: "bg-emerald-400 animate-pulse",
      label: "Microphone Active",
    },
    error: {
      color: "text-red-400 bg-red-500/10 border-red-500/30",
      dot: "bg-red-400",
      label: "Microphone Error",
    },
    denied: {
      color: "text-red-400 bg-red-500/10 border-red-500/30",
      dot: "bg-red-400",
      label: "Access Denied",
    },
  };
  const { color, dot, label } = configs[micStatus];

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold tracking-wide ${color}`}
    >
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {label}
    </div>
  );
}
