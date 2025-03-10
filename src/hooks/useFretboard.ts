import { useMemo, useCallback } from 'react';
import { Note, ScaleType, ArpeggioType, ERelativePatternMapped, ERelativePattern, PatternPosition } from 'types';
import { calculateScale, calculateArpeggio, isNoteInScale, getNashvilleNumber, getNoteAtFret } from 'utils';
import { getCagedPattern, getSelectedERelativeShape } from 'patterns';

export const STANDARD_TUNING: Note[] = ['E', 'B', 'G', 'D', 'A', 'E'];

interface UseFretboardProps {
  rootNote: Note;
  type: ScaleType | ArpeggioType;
  frets: number;
  useNashville?: boolean;
  isArpeggio?: boolean;
  showTriads?: boolean;
  cagedPattern?: string | null;
  eRelativePattern?: ERelativePattern;
}

interface UseFretboardReturn {
  notes: Note[];
  getDisplayValue: (note: Note) => string;
  isInCagedPattern: (stringNum: number, fretNum: number) => boolean;
  isInERelativePattern: (stringNum: number, fretNum: number) => boolean;
  getNoteAtFret: (stringNote: Note, fret: number) => Note;
}

// Helper function to calculate triad notes
const getTriadNotes = (rootNote: Note, scaleType: ScaleType): Note[] => {
  const scale = calculateScale(rootNote, scaleType);
  return [scale[0], scale[2], scale[4]];
};

export const useFretboard = ({
  rootNote,
  type,
  useNashville = false,
  isArpeggio = false,
  showTriads = false,
  cagedPattern = null,
  eRelativePattern = null
}: UseFretboardProps): UseFretboardReturn => {
  // Calculate notes based on type
  const notes = useMemo(() => {
    if (isArpeggio) {
      return calculateArpeggio(rootNote, type as ArpeggioType);
    }
    if (showTriads) {
      return getTriadNotes(rootNote, type as ScaleType);
    }
    return calculateScale(rootNote, type as ScaleType);
  }, [rootNote, type, isArpeggio, showTriads]);

  // Calculate CAGED positions
  const cagedPositions = useMemo(() => 
    cagedPattern ? getCagedPattern(rootNote, cagedPattern) : [],
    [rootNote, cagedPattern]
  );

  // Calculate E-relative pattern positions
  const eRelativePositions = useMemo(() => {
    if (!eRelativePattern) return [];
    return getSelectedERelativeShape(rootNote, 'major' as ScaleType, eRelativePattern);
  }, [rootNote, eRelativePattern]);

  // Get display value for a note
  const getDisplayValue = useCallback((note: Note): string => {
    if (!isNoteInScale(note, notes)) return '';
    return useNashville ? getNashvilleNumber(note, rootNote, type, isArpeggio) : note;
  }, [notes, rootNote, type, isArpeggio, useNashville]);

  // Check if a position is in CAGED pattern
  const isInCagedPattern = useCallback((stringNum: number, fretNum: number) => {
    return cagedPositions.some(pos => 
      pos.string === stringNum && pos.fret === fretNum
    );
  }, [cagedPositions]);

  // Check if a position is in E-relative pattern
  const isInERelativePattern = useCallback((stringNum: number, fretNum: number) => {
    if (!eRelativePattern) return false;
    return eRelativePositions.some((selectedERelativeShape: ERelativePatternMapped) => {
      return selectedERelativeShape.fretPositions.some((pos: PatternPosition) => {
        return pos.string === stringNum && pos.fret === fretNum;
      });
    });
  }, [eRelativePattern, eRelativePositions]);

  return {
    notes,
    getDisplayValue,
    isInCagedPattern,
    isInERelativePattern,
    getNoteAtFret
  };
}; 