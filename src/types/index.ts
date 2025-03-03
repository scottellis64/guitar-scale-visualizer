export type Note = 'A' | 'A#' | 'B' | 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#';

export type ScaleType = 'major' | 'minor' | 'pentatonic' | 'blues';
export type ArpeggioType = 'major' | 'minor' | 'diminished' | 'augmented' | 'dominant7';
export type DisplayType = 'scale' | 'arpeggio' | 'triad';

export interface ScaleDefinition {
  intervals: number[];
  intervalSteps: number[]
  name: string;
  nashvilleNumbers: string[];
}

export interface ArpeggioDefinition {
  intervals: number[];
  name: string;
  nashvilleNumbers: string[];
}

export type NashvilleNumber = '1' | '2' | '3' | '4' | '5' | '6' | '7';

export interface DisplayOptions {
  useNashville: boolean;
}

export const SCALES: Record<ScaleType, ScaleDefinition> = {
  major: {
    intervals: [0, 2, 4, 5, 7, 9, 11],
    intervalSteps: [2, 2, 1, 2, 2, 2, 1],
    name: 'Major Scale',
    nashvilleNumbers: ['1', '2', '3', '4', '5', '6', '7']
  },
  minor: {
    intervals: [0, 2, 3, 5, 7, 8, 10],
    intervalSteps: [2, 1, 2, 2, 1, 2, 2],
    name: 'Minor Scale',
    nashvilleNumbers: ['1', '2', '♭3', '4', '5', '♭6', '♭7']
  },
  pentatonic: {
    intervals: [0, 2, 4, 7, 9],
    intervalSteps: [2, 2, 1, 2, 2],
    name: 'Pentatonic Scale',
    nashvilleNumbers: ['1', '2', '3', '5', '6']
  },
  blues: {
    intervals: [0, 3, 5, 6, 7, 10],
    intervalSteps: [3, 2, 1, 1, 2, 3],
    name: 'Blues Scale',
    nashvilleNumbers: ['1', '♭3', '4', '♭5', '5', '♭7']
  }
};

export const ARPEGGIOS: Record<ArpeggioType, ArpeggioDefinition> = {
  major: {
    intervals: [0, 4, 7],
    name: 'Major Triad',
    nashvilleNumbers: ['1', '3', '5']
  },
  minor: {
    intervals: [0, 3, 7],
    name: 'Minor Triad',
    nashvilleNumbers: ['1', '♭3', '5']
  },
  diminished: {
    intervals: [0, 3, 6],
    name: 'Diminished Triad',
    nashvilleNumbers: ['1', '♭3', '♭5']
  },
  augmented: {
    intervals: [0, 4, 8],
    name: 'Augmented Triad',
    nashvilleNumbers: ['1', '3', '#5']
  },
  dominant7: {
    intervals: [0, 4, 7, 10],
    name: 'Dominant 7th',
    nashvilleNumbers: ['1', '3', '5', '♭7']
  }
};

export const ALL_NOTES: Note[] = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']; 

export type CagedPattern = 'C' | 'A' | 'G' | 'E' | 'D' | null;

export interface GuitarState {
  rootNote: Note;
  displayType: DisplayType;
  scaleType: ScaleType;
  arpeggioType: ArpeggioType;
  useNashville: boolean;
  isDarkMode: boolean;
  cagedPattern: CagedPattern;
} 

export interface PatternPosition {
  string: number;
  fret: number;
}

export interface PatternShape {
  root: PatternPosition[];
  pattern: PatternPosition[];
}

export type ERelativePattern = '1E' | '7F' | '6G' | '5A' | '4B' | '3C' | '2D' | null;

export interface ERelativeShape {
  root: number;
  name: string;
  pattern: PatternPosition[];
}

export interface ERelativePatternMapped {
  name: string;
  epos: number;
  closed: boolean;
  fretPositions: PatternPosition[];
}