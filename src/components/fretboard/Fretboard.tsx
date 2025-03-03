import React from 'react';
import { Box, styled } from '@mui/material';
import { Note, ScaleType, ArpeggioType, ERelativePatternMapped, ERelativePattern, PatternPosition } from 'types';
import { calculateScale, calculateArpeggio, isNoteInScale, getNashvilleNumber, getNoteAtFret } from 'utils';
import './Fretboard.css';
import { GuitarTheme } from 'themes';
import { Fret, String } from 'components';
import { getCagedPattern, getSelectedERelativeShape } from 'patterns';

interface FretboardProps {
  rootNote: Note;
  type: ScaleType | ArpeggioType;
  frets: number;
  useNashville?: boolean;
  isArpeggio?: boolean;
  orientation?: 'horizontal' | 'vertical';
  showTriads?: boolean;
  cagedPattern?: string | null;
  eRelativePattern?: ERelativePattern;
}

const STANDARD_TUNING: Note[] = ['E', 'B', 'G', 'D', 'A', 'E'];

// Styled components
const FretboardContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(2.5),
  background: (theme as GuitarTheme).fretboard.wood,
  borderRadius: theme.shape.borderRadius,
}));

const FretboardWrapper = styled(Box)<{ orientation?: 'horizontal' | 'vertical' }>(({ orientation = 'horizontal' }) => ({
  display: 'flex',
  flexDirection: orientation === 'vertical' ? 'row' : 'column',
  gap: 2,
}));

// Add function to calculate triad notes
const getTriadNotes = (rootNote: Note, scaleType: ScaleType): Note[] => {
  const scale = calculateScale(rootNote, scaleType);
  // Return root, third, and fifth of the scale
  return [scale[0], scale[2], scale[4]];
};

export const Fretboard: React.FC<FretboardProps> = ({ 
  rootNote, 
  type,
  frets = 15,
  useNashville = false,
  isArpeggio = false,
  orientation = 'horizontal',
  showTriads = false,
  cagedPattern = null,
  eRelativePattern = null
}) => {
  const notes = isArpeggio 
    ? calculateArpeggio(rootNote, type as ArpeggioType)
    : showTriads 
      ? getTriadNotes(rootNote, type as ScaleType)
      : calculateScale(rootNote, type as ScaleType);
  

  const getDisplayValue = (note: Note): string => {
    if (!isNoteInScale(note, notes)) return '';
    return useNashville ? getNashvilleNumber(note, rootNote, type, isArpeggio) : note;
  };

  const cagedPositions = cagedPattern ? getCagedPattern(rootNote, cagedPattern) : [];
  
  const isInCagedPattern = (stringNum: number, fretNum: number) => {
    return cagedPositions.some(pos => 
      pos.string === stringNum && pos.fret === fretNum
    );
  };
  
  const isInERelativePattern = (stringNum: number, fretNum: number) => {
    if (!eRelativePattern) return false;

    const selectedERelativeShape: ERelativePatternMapped = getSelectedERelativeShape(rootNote, 'major' as ScaleType, eRelativePattern);

    return selectedERelativeShape.fretPositions.some((pos: PatternPosition) => {
      return pos.string === stringNum && pos.fret === fretNum;
    });
  };

  return (
    <FretboardContainer>
      <FretboardWrapper orientation={orientation}>
        {STANDARD_TUNING.map((stringNote, stringIndex) => (
          <String key={stringIndex} orientation={orientation}>
            {Array.from({ length: frets + 1 }).map((_, fret) => {
              const note = getNoteAtFret(stringNote, fret);
              const isInScale = isNoteInScale(note, notes);
              const displayValue = getDisplayValue(note);
              const isCagedPattern = cagedPattern ? isInCagedPattern(stringIndex + 1, fret) : false;
              const isERelativePattern = eRelativePattern ? isInERelativePattern(stringIndex + 1, fret) : false;
              return (
                <Fret 
                  key={fret}
                  fret={fret}
                  isInScale={isInScale}
                  isArpeggio={isArpeggio}
                  isCagedPattern={isCagedPattern}
                  isERelativePattern={isERelativePattern}
                  displayValue={displayValue}
                  showFretNumber={stringIndex === 0}
                  showMarkers={stringIndex === 2}
                />
              );
            })}
          </String>
        ))}
      </FretboardWrapper>
    </FretboardContainer>
  );
}; 