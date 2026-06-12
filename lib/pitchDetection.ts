/**
 * YIN pitch detection algorithm.
 * Based on: "YIN, a fundamental frequency estimator for speech and music"
 * de Cheveigné & Kawahara, 2002.
 */

const YIN_THRESHOLD = 0.1;

function differenceFunction(
  buffer: Float32Array,
  bufferSize: number,
  maxPeriod: number,
): Float32Array {
  const result = new Float32Array(maxPeriod);
  for (let tau = 0; tau < maxPeriod; tau++) {
    let sum = 0;
    for (let i = 0; i < bufferSize - maxPeriod; i++) {
      const delta = buffer[i] - buffer[i + tau];
      sum += delta * delta;
    }
    result[tau] = sum;
  }
  return result;
}

function cumulativeMeanNormalizedDifference(df: Float32Array): Float32Array {
  const result = new Float32Array(df.length);
  result[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau < df.length; tau++) {
    runningSum += df[tau];
    result[tau] = runningSum === 0 ? 0 : (df[tau] * tau) / runningSum;
  }
  return result;
}

function absoluteThreshold(cmndf: Float32Array, minPeriod: number): number {
  for (let tau = Math.max(2, minPeriod); tau < cmndf.length; tau++) {
    if (cmndf[tau] < YIN_THRESHOLD) {
      while (tau + 1 < cmndf.length && cmndf[tau + 1] < cmndf[tau]) {
        tau++;
      }
      return tau;
    }
  }
  return -1;
}

function parabolicInterpolation(
  cmndf: Float32Array,
  tauEstimate: number,
): number {
  if (tauEstimate <= 0 || tauEstimate >= cmndf.length - 1) return tauEstimate;
  const x0 = tauEstimate - 1;
  const x2 = tauEstimate + 1;
  const s0 = cmndf[x0];
  const s1 = cmndf[tauEstimate];
  const s2 = cmndf[x2];
  const denom = s0 - 2 * s1 + s2;
  if (denom === 0) return tauEstimate;
  return tauEstimate + (s0 - s2) / (2 * denom);
}

export interface PitchResult {
  frequency: number;
  clarity: number;
}

export function detectPitch(
  buffer: Float32Array,
  sampleRate: number,
): PitchResult {
  const bufferSize = buffer.length;
  const maxPeriod = Math.floor(bufferSize / 2);
  const minPeriod = 20; // ~2205 Hz ceiling, prevents locking on ultra-high harmonics/noise

  // Check if there's enough signal (RMS > threshold to avoid noise)
  let rms = 0;
  for (let i = 0; i < bufferSize; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / bufferSize);
  if (rms < 0.003) return { frequency: -1, clarity: 0 };

  const df = differenceFunction(buffer, bufferSize, maxPeriod);
  const cmndf = cumulativeMeanNormalizedDifference(df);
  const tauEstimate = absoluteThreshold(cmndf, minPeriod);

  if (tauEstimate === -1) return { frequency: -1, clarity: 0 };

  const refinedTau = parabolicInterpolation(cmndf, tauEstimate);
  if (refinedTau === 0 || refinedTau < minPeriod)
    return { frequency: -1, clarity: 0 };

  const frequency = sampleRate / refinedTau;

  // Guitar range: E1 (~41 Hz) to E6 (~1319 Hz)
  if (frequency < 40 || frequency > 1400) return { frequency: -1, clarity: 0 };

  // Clarity: how deep the CMNDF dip is. Lower CMNDF = clearer pitch.
  const clarity = Math.max(0, Math.min(1, 1 - cmndf[tauEstimate]));

  return { frequency, clarity };
}
