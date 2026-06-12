"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { detectPitch } from "@/lib/pitchDetection";
import { frequencyToNote, findClosestString, Tuning } from "@/lib/tunings";

export type MicStatus = "idle" | "requesting" | "active" | "error" | "denied";

export interface TunerState {
  frequency: number;
  note: string;
  octave: number;
  cents: number;
  closestStringNote: string;
  closestStringName: string;
  micStatus: MicStatus;
  isListening: boolean;
  errorMessage: string;
}

const BUFFER_SIZE = 4096;
const HISTORY_SIZE = 7;
const CLARITY_THRESHOLD = 0.75;
const CONTINUITY_CENTS = 200;
const EMA_ALPHA = 0.35;
const HOLD_MS = 400;

export function useTuner(tuning: Tuning) {
  const [state, setState] = useState<TunerState>({
    frequency: 0,
    note: "-",
    octave: 0,
    cents: 0,
    closestStringNote: "-",
    closestStringName: "-",
    micStatus: "idle",
    isListening: false,
    errorMessage: "",
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const bufferRef = useRef<Float32Array>(new Float32Array(BUFFER_SIZE));
  const tuningRef = useRef<Tuning>(tuning);
  const lastValidAtRef = useRef<number>(0);
  const lastValidDataRef = useRef<{
    frequency: number;
    note: string;
    octave: number;
    cents: number;
    closestStringNote: string;
    closestStringName: string;
  } | null>(null);

  const freqHistoryRef = useRef<Float32Array>(new Float32Array(HISTORY_SIZE));
  const histIndexRef = useRef<number>(0);
  const histCountRef = useRef<number>(0);
  const smoothedCentsRef = useRef<number>(0);
  const lastAcceptedFreqRef = useRef<number>(0);

  useEffect(() => {
    tuningRef.current = tuning;
  }, [tuning]);

  const processAudio = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    analyser.getFloatTimeDomainData(
      bufferRef.current as Float32Array<ArrayBuffer>,
    );
    const sampleRate = audioContextRef.current?.sampleRate ?? 44100;
    const result = detectPitch(bufferRef.current, sampleRate);

    if (result.frequency > 0 && result.clarity > CLARITY_THRESHOLD) {
      // Push into median-filter ring buffer
      const idx = histIndexRef.current % HISTORY_SIZE;
      freqHistoryRef.current[idx] = result.frequency;
      histIndexRef.current++;
      histCountRef.current = Math.min(histCountRef.current + 1, HISTORY_SIZE);

      // Need a few samples before we trust the median
      if (histCountRef.current < 3) {
        rafRef.current = requestAnimationFrame(processAudio);
        return;
      }

      const activeSlice = freqHistoryRef.current.slice(0, histCountRef.current);
      const sorted = Array.from(activeSlice).sort((a, b) => a - b);
      const medianFreq = sorted[Math.floor(sorted.length / 2)];

      // Continuity: reject wild jumps (e.g. harmonic locking)
      if (lastAcceptedFreqRef.current > 0) {
        const jumpCents = Math.abs(
          1200 * Math.log2(medianFreq / lastAcceptedFreqRef.current),
        );
        if (jumpCents > CONTINUITY_CENTS) {
          // Reset history on a big jump
          histCountRef.current = 0;
          histIndexRef.current = 0;
          lastAcceptedFreqRef.current = 0;
          smoothedCentsRef.current = 0;
          rafRef.current = requestAnimationFrame(processAudio);
          return;
        }
      }

      lastAcceptedFreqRef.current = medianFreq;

      const { note, octave } = frequencyToNote(medianFreq);
      const closest = findClosestString(medianFreq, tuningRef.current);
      const rawCents = closest ? closest.cents : 0;

      // EMA smoothing on cents for silky needle
      if (smoothedCentsRef.current === 0) {
        smoothedCentsRef.current = rawCents;
      } else {
        smoothedCentsRef.current =
          smoothedCentsRef.current * (1 - EMA_ALPHA) + rawCents * EMA_ALPHA;
      }
      const smoothedCents = Math.round(smoothedCentsRef.current);

      const data = {
        frequency: Math.round(medianFreq * 10) / 10,
        note,
        octave,
        cents: smoothedCents,
        closestStringNote: closest
          ? `${closest.string.note}${closest.string.octave}`
          : "-",
        closestStringName: closest ? `String ${closest.string.name}` : "-",
      };

      lastValidAtRef.current = performance.now();
      lastValidDataRef.current = data;

      setState((prev) => ({ ...prev, ...data }));
    } else {
      // Hold the last valid reading for a short time to avoid flicker.
      const now = performance.now();
      const elapsed = now - lastValidAtRef.current;
      if (elapsed < HOLD_MS && lastValidDataRef.current) {
        // Keep showing last valid data (do nothing).
      } else {
        setState((prev) => ({
          ...prev,
          frequency: 0,
          note: "-",
          octave: 0,
          cents: 0,
          closestStringNote: "-",
          closestStringName: "-",
        }));
      }
    }

    rafRef.current = requestAnimationFrame(processAudio);
  }, []);

  const start = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      micStatus: "requesting",
      errorMessage: "",
    }));
    try {
      // Add a 10s timeout so getUserMedia can't hang forever.
      const getMic = navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      const stream = await Promise.race([
        getMic,
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new DOMException(
                  "Microphone request timed out. Please check your browser permissions.",
                  "TimeoutError",
                ),
              ),
            10000,
          ),
        ),
      ]);

      streamRef.current = stream;

      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx)
        throw new DOMException(
          "Web Audio API not supported",
          "NotSupportedError",
        );

      const ctx = new Ctx();
      audioContextRef.current = ctx;

      // iOS Safari suspends AudioContext until a user gesture; resume it explicitly.
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 8192;
      analyser.smoothingTimeConstant = 0;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      bufferRef.current = new Float32Array(BUFFER_SIZE);

      setState((prev) => ({
        ...prev,
        micStatus: "active",
        isListening: true,
      }));

      rafRef.current = requestAnimationFrame(processAudio);
    } catch (err) {
      const isDenied =
        err instanceof DOMException &&
        (err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError");

      setState((prev) => ({
        ...prev,
        micStatus: isDenied ? "denied" : "error",
        isListening: false,
        errorMessage: isDenied
          ? "Microphone access was denied. Please allow microphone access in your browser settings."
          : "Could not access microphone. Please check your device settings.",
      }));
    }
  }, [processAudio]);

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    lastValidAtRef.current = 0;
    lastValidDataRef.current = null;
    histCountRef.current = 0;
    histIndexRef.current = 0;
    smoothedCentsRef.current = 0;
    lastAcceptedFreqRef.current = 0;

    setState((prev) => ({
      ...prev,
      micStatus: "idle",
      isListening: false,
      frequency: 0,
      note: "-",
      octave: 0,
      cents: 0,
      closestStringNote: "-",
      closestStringName: "-",
    }));
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioContextRef.current?.close();
    };
  }, []);

  return { state, start, stop };
}
