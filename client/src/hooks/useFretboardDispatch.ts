import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, setRootNote, setDisplayType, setScaleType, setUseNashville, setCagedPattern, setERelativePattern, setFrets, setFretWidth } from 'store';
import { Note, ScaleType, DisplayType, CagedPattern, ERelativePattern, ERelativePatternMapped, PatternPosition, ArpeggioType } from 'types';
import { getSelectedERelativeShape } from 'patterns';
import { calculateScale, calculateArpeggio, isNoteInScale, getNashvilleNumber, getTriadNotes, getCagedPattern } from 'utils';

interface UseFretboardDispatchProps {
  id: string;
}

export interface UseFretboardDispatchReturn {
  id: string;
  rootNote: Note;
  scaleType: ScaleType;
  displayType: DisplayType;
  useNashville: boolean;
  isArpeggio: boolean;
  cagedPattern: CagedPattern | null;
  eRelativePattern: ERelativePattern | null;
  showTriads: boolean;
  frets: number;
  fretWidth: number;
  notes: Note[];
  handleArpeggioChange: (arpeggio: boolean) => void;
  handleRootNoteChange: (note: Note) => void;
  handleScaleTypeChange: (type: ScaleType) => void;
  handleDisplayTypeChange: (type: DisplayType) => void;
  handleUseNashvilleChange: (useNashville: boolean) => void;
  handleCagedPatternChange: (pattern: CagedPattern | null) => void;
  handleERelativePatternChange: (pattern: ERelativePattern | null) => void;
  handleFretsChange: (frets: number) => void;
  handleFretWidthChange: (fretWidth: number) => void;
  isInCagedPattern: (stringNum: number, fretNum: number) => boolean;
  isInERelativePattern: (stringNum: number, fretNum: number) => boolean;
  getDisplayValue: (note: Note) => string;
}

const defaultInstance = {
  rootNote: 'C' as Note,
  displayType: 'scale' as DisplayType,
  scaleType: 'major' as ScaleType,
  useNashville: true,
  showTriads: false,
  isArpeggio: false,
  cagedPattern: null as CagedPattern | null,
  eRelativePattern: null as ERelativePattern | null,
  frets: 16,
  fretWidth: 2,
};

export const useFretboardDispatch = ({ id }: UseFretboardDispatchProps): UseFretboardDispatchReturn => {
  const dispatch = useDispatch();

  const instance = useSelector((state: RootState) => {
    try {
      return state.guitar?.instances?.[id] || defaultInstance;
    } catch (e) {
      return defaultInstance;
    }
  });

  const {
    rootNote,
    scaleType,
    displayType,
    useNashville,
    isArpeggio,
    cagedPattern,
    eRelativePattern,
    showTriads,
    frets,
    fretWidth,
  } = instance;

  const handleRootNoteChange = useCallback((note: Note) => {
    dispatch(setRootNote({ id, note }));
  }, [dispatch, id]);

  const handleScaleTypeChange = useCallback((type: ScaleType) => {
    dispatch(setScaleType({ id, type }));
  }, [dispatch, id]);

  const handleDisplayTypeChange = useCallback((type: DisplayType) => {
    dispatch(setDisplayType({ id, type }));
  }, [dispatch, id]);

  const handleUseNashvilleChange = useCallback((useNashville: boolean) => {
    dispatch(setUseNashville({ id, useNashville }));
  }, [dispatch, id]);

  const handleCagedPatternChange = useCallback((pattern: CagedPattern | null) => {
    dispatch(setCagedPattern({ id, pattern }));
  }, [dispatch, id]);

  const handleERelativePatternChange = useCallback((pattern: ERelativePattern | null) => {
    dispatch(setERelativePattern({ id, pattern }));
  }, [dispatch, id]);

  const handleArpeggioChange = useCallback((arpeggio: boolean) => {
    dispatch(setDisplayType({ id, type: arpeggio ? 'arpeggio' : 'scale' }));
  }, [dispatch, id]);

  const handleFretsChange = useCallback((frets: number) => {
    dispatch(setFrets({ id, frets }));
  }, [dispatch, id]);

  const handleFretWidthChange = useCallback((fretWidth: number) => {
    dispatch(setFretWidth({ id, fretWidth }));
  }, [dispatch, id]);

  const eRelativePositions = useMemo(() => {
    if (!eRelativePattern) return [];
    return getSelectedERelativeShape(rootNote, scaleType, eRelativePattern);
  }, [rootNote, eRelativePattern, scaleType]);

  const isInERelativePattern = useCallback((stringNum: number, fretNum: number) => {
    if (!eRelativePattern) return false;
    return eRelativePositions.some((selectedERelativeShape: ERelativePatternMapped) => {
      return selectedERelativeShape.fretPositions.some((pos: PatternPosition) => {
        return pos.string === stringNum && pos.fret === fretNum;
      });
    });
  }, [eRelativePattern, eRelativePositions]);

  const notes = useMemo(() => {
    if (isArpeggio) {
      return calculateArpeggio(rootNote, scaleType as ArpeggioType);
    }
    if (showTriads) {
      return getTriadNotes(rootNote, scaleType as ScaleType);
    }
    return calculateScale(rootNote, scaleType as ScaleType);
  }, [rootNote, scaleType, isArpeggio, showTriads]);

  // Calculate CAGED positions
  const cagedPositions = useMemo(() => 
    cagedPattern ? getCagedPattern(rootNote, cagedPattern) : [],
    [rootNote, cagedPattern]
  );

  // Get display value for a note
  const getDisplayValue = useCallback((note: Note): string => {
    if (!isNoteInScale(note, notes)) return '';
    return useNashville ? getNashvilleNumber(note, rootNote, scaleType, isArpeggio) : note;
  }, [notes, rootNote, scaleType, isArpeggio, useNashville]);

  // Check if a position is in CAGED pattern
  const isInCagedPattern = useCallback((stringNum: number, fretNum: number) => {
    return cagedPositions.some(pos => 
      pos.string === stringNum && pos.fret === fretNum
    );
  }, [cagedPositions]);

  return {
    id,
    rootNote,
    scaleType,
    displayType,
    useNashville,
    isArpeggio,
    cagedPattern,
    eRelativePattern,
    showTriads,
    frets,
    fretWidth,
    notes,
    handleRootNoteChange,
    handleScaleTypeChange,
    handleDisplayTypeChange,
    handleUseNashvilleChange,
    handleCagedPatternChange,
    handleERelativePatternChange,
    handleArpeggioChange,
    handleFretsChange,
    handleFretWidthChange,
    isInERelativePattern,
    getDisplayValue,
    isInCagedPattern
  };
}; 