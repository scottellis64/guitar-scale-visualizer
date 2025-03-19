import { Note, PatternPosition, PatternShape } from 'types';

export const CAGED_SHAPES: Record<string, PatternShape> = {
  C: {
    root: [{ string: 5, fret: 3 }, { string: 2, fret: 1 }],
    pattern: [
      { string: 6, fret: 0 }, { string: 5, fret: 3 },
      { string: 4, fret: 2 }, { string: 3, fret: 0 },
      { string: 2, fret: 1 }, { string: 1, fret: 0 }
    ]
  },
  A: {
    root: [{ string: 4, fret: 0 }],
    pattern: [
      { string: 5, fret: 0 }, { string: 4, fret: 0 },
      { string: 3, fret: 2 }, { string: 2, fret: 2 },
      { string: 1, fret: 0 }
    ]
  },
  G: {
    root: [{ string: 6, fret: 3 }, { string: 1, fret: 3 }],
    pattern: [
      { string: 6, fret: 3 }, { string: 5, fret: 2 },
      { string: 4, fret: 0 }, { string: 3, fret: 0 },
      { string: 2, fret: 0 }, { string: 1, fret: 3 }
    ]
  },
  E: {
    root: [{ string: 6, fret: 0 }, { string: 4, fret: 2 }],
    pattern: [
      { string: 6, fret: 0 }, { string: 5, fret: 2 },
      { string: 4, fret: 2 }, { string: 3, fret: 1 },
      { string: 2, fret: 0 }, { string: 1, fret: 0 }
    ]
  },
  D: {
    root: [{ string: 4, fret: 5 }],
    pattern: [
      { string: 4, fret: 5 }, { string: 3, fret: 4 },
      { string: 2, fret: 3 }, { string: 1, fret: 5 }
    ]
  }
};

export const getCagedPattern = (_rootNote: Note, pattern: string, startFret: number = 0): PatternPosition[] => {
  const shape = CAGED_SHAPES[pattern];
  if (!shape) return [];

  return shape.pattern.map(pos => ({
    string: pos.string,
    fret: pos.fret + startFret
  }));
}; 