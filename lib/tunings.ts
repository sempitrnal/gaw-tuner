export interface GuitarString {
  name: string;
  note: string;
  octave: number;
  frequency: number;
}

export interface Tuning {
  id: string;
  name: string;
  strings: GuitarString[];
}

export const TUNINGS: Tuning[] = [
  {
    id: "standard",
    name: "Standard (EADGBe)",
    strings: [
      { name: "6", note: "E", octave: 2, frequency: 82.41 },
      { name: "5", note: "A", octave: 2, frequency: 110.0 },
      { name: "4", note: "D", octave: 3, frequency: 146.83 },
      { name: "3", note: "G", octave: 3, frequency: 196.0 },
      { name: "2", note: "B", octave: 3, frequency: 246.94 },
      { name: "1", note: "E", octave: 4, frequency: 329.63 },
    ],
  },
  {
    id: "drop-d",
    name: "Drop D (DADGBe)",
    strings: [
      { name: "6", note: "D", octave: 2, frequency: 73.42 },
      { name: "5", note: "A", octave: 2, frequency: 110.0 },
      { name: "4", note: "D", octave: 3, frequency: 146.83 },
      { name: "3", note: "G", octave: 3, frequency: 196.0 },
      { name: "2", note: "B", octave: 3, frequency: 246.94 },
      { name: "1", note: "E", octave: 4, frequency: 329.63 },
    ],
  },
  {
    id: "d-standard",
    name: "D Standard (DGCFAd)",
    strings: [
      { name: "6", note: "D", octave: 2, frequency: 73.42 },
      { name: "5", note: "G", octave: 2, frequency: 98.0 },
      { name: "4", note: "C", octave: 3, frequency: 130.81 },
      { name: "3", note: "F", octave: 3, frequency: 174.61 },
      { name: "2", note: "A", octave: 3, frequency: 220.0 },
      { name: "1", note: "D", octave: 4, frequency: 293.66 },
    ],
  },
  {
    id: "open-g",
    name: "Open G (DGDGBd)",
    strings: [
      { name: "6", note: "D", octave: 2, frequency: 73.42 },
      { name: "5", note: "G", octave: 2, frequency: 98.0 },
      { name: "4", note: "D", octave: 3, frequency: 146.83 },
      { name: "3", note: "G", octave: 3, frequency: 196.0 },
      { name: "2", note: "B", octave: 3, frequency: 246.94 },
      { name: "1", note: "D", octave: 4, frequency: 293.66 },
    ],
  },
  {
    id: "drop-c",
    name: "Drop C (CGCFAd)",
    strings: [
      { name: "6", note: "C", octave: 2, frequency: 65.41 },
      { name: "5", note: "G", octave: 2, frequency: 98.0 },
      { name: "4", note: "C", octave: 3, frequency: 130.81 },
      { name: "3", note: "F", octave: 3, frequency: 174.61 },
      { name: "2", note: "A", octave: 3, frequency: 220.0 },
      { name: "1", note: "D", octave: 4, frequency: 293.66 },
    ],
  },
  {
    id: "drop-c-sharp",
    name: "Drop C# (C#G#C#F#A#D#)",
    strings: [
      { name: "6", note: "C#", octave: 2, frequency: 69.3 },
      { name: "5", note: "G#", octave: 2, frequency: 103.83 },
      { name: "4", note: "C#", octave: 3, frequency: 138.59 },
      { name: "3", note: "F#", octave: 3, frequency: 185.0 },
      { name: "2", note: "A#", octave: 3, frequency: 233.08 },
      { name: "1", note: "D#", octave: 4, frequency: 311.13 },
    ],
  },
];

export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export function frequencyToNote(frequency: number): {
  note: string;
  octave: number;
  cents: number;
  closestFrequency: number;
} {
  if (frequency <= 0) {
    return { note: "-", octave: 0, cents: 0, closestFrequency: 0 };
  }

  // A4 = 440 Hz, MIDI note 69
  const midiNote = 12 * Math.log2(frequency / 440) + 69;
  const roundedMidi = Math.round(midiNote);
  const cents = Math.round((midiNote - roundedMidi) * 100);

  const noteIndex = ((roundedMidi % 12) + 12) % 12;
  const octave = Math.floor(roundedMidi / 12) - 1;
  const note = NOTE_NAMES[noteIndex];

  const closestFrequency = 440 * Math.pow(2, (roundedMidi - 69) / 12);

  return { note, octave, cents, closestFrequency };
}

export function findClosestString(
  frequency: number,
  tuning: Tuning,
): { string: GuitarString; cents: number } | null {
  if (frequency <= 0) return null;

  let closest: GuitarString | null = null;
  let minCentsDiff = Infinity;

  for (const s of tuning.strings) {
    const centsDiff = 1200 * Math.log2(frequency / s.frequency);
    if (Math.abs(centsDiff) < Math.abs(minCentsDiff)) {
      minCentsDiff = centsDiff;
      closest = s;
    }
  }

  if (!closest) return null;
  return { string: closest, cents: Math.round(minCentsDiff) };
}
