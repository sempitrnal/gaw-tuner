"use client";

import { MicStatus } from "@/hooks/useTuner";

interface MicButtonProps {
  isListening: boolean;
  micStatus: MicStatus;
  onStart: () => void;
  onStop: () => void;
}

export default function MicButton({
  isListening,
  micStatus,
  onStart,
  onStop,
}: MicButtonProps) {
  const isRequesting = micStatus === "requesting";

  return (
    <button
      onClick={isListening ? onStop : onStart}
      disabled={isRequesting}
      className={`
        relative flex items-center justify-center gap-2
        px-8 py-4 rounded-2xl font-bold text-base tracking-wide
        transition-all duration-200 select-none
        disabled:opacity-60 disabled:cursor-not-allowed
        ${
          isListening
            ? "bg-red-500/20 border-2 border-red-500/60 text-red-400 hover:bg-red-500/30 hover:border-red-400"
            : "bg-emerald-500/20 border-2 border-emerald-500/60 text-emerald-400 hover:bg-emerald-500/30 hover:border-emerald-400"
        }
      `}
    >
      {/* Icon */}
      <MicIcon active={isListening} />

      {isRequesting
        ? "e allow access gawwwww..."
        : isListening
          ? "husto na gaw"
          : "tune ta gaw"}
    </button>
  );
}

function MicIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {active ? (
        <>
          <rect
            x="9"
            y="9"
            width="6"
            height="6"
            rx="1"
            fill="currentColor"
            stroke="none"
          />
        </>
      ) : (
        <>
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="8" y1="22" x2="16" y2="22" />
        </>
      )}
    </svg>
  );
}
