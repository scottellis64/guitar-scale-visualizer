import React from 'react';
import { Box, styled } from '@mui/material';
import { Note, ScaleType, ArpeggioType, ALL_NOTES } from 'types';
import { calculateScale, calculateArpeggio, isNoteInScale, getNashvilleNumber } from '../../utils/scaleUtils';
import './Fretboard.css';
import { GuitarTheme } from 'themes';
import { Fret, String } from 'components';

interface FretboardProps {
  rootNote: Note;
  type: ScaleType | ArpeggioType;
  frets: number;
  useNashville?: boolean;
  isArpeggio?: boolean;
  orientation?: 'horizontal' | 'vertical';
  showTriads?: boolean;
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
  showTriads = false
}) => {
  const notes = isArpeggio 
    ? calculateArpeggio(rootNote, type as ArpeggioType)
    : showTriads 
      ? getTriadNotes(rootNote, type as ScaleType)
      : calculateScale(rootNote, type as ScaleType);
  
  const getNoteAtFret = (stringNote: Note, fret: number): Note => {
    const startIndex = ALL_NOTES.indexOf(stringNote);
    const noteIndex = (startIndex + fret) % 12;
    return ALL_NOTES[noteIndex];
  };

  const getDisplayValue = (note: Note): string => {
    if (!isNoteInScale(note, notes)) return '';
    return useNashville ? getNashvilleNumber(note, rootNote, type, isArpeggio) : note;
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
              
              return (
                <Fret 
                  key={fret}
                  fret={fret}
                  isInScale={isInScale}
                  isArpeggio={isArpeggio}
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