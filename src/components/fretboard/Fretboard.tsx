import React from 'react';
import { Box, styled } from '@mui/material';
import { Note, ScaleType, ArpeggioType, ERelativePattern } from 'types';
import './Fretboard.css';
import { GuitarTheme } from 'themes';
import { Fret, String } from 'components';
import { useFretboard, STANDARD_TUNING } from 'hooks';

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
  const {
    getDisplayValue,
    isInCagedPattern,
    isInERelativePattern,
    getNoteAtFret
  } = useFretboard({
    rootNote,
    type,
    frets,
    useNashville,
    isArpeggio,
    showTriads,
    cagedPattern,
    eRelativePattern
  });

  return (
    <FretboardContainer>
      <FretboardWrapper orientation={orientation}>
        {STANDARD_TUNING.map((stringNote, stringIndex) => (
          <String key={stringIndex} orientation={orientation}>
            {Array.from({ length: frets + 1 }).map((_, fret) => {
              const note = getNoteAtFret(stringNote, fret);
              const displayValue = getDisplayValue(note);
              const isCagedPattern = cagedPattern ? isInCagedPattern(stringIndex + 1, fret) : false;
              const isERelativePattern = eRelativePattern ? isInERelativePattern(stringIndex + 1, fret) : false;
              return (
                <Fret 
                  key={fret}
                  fret={fret}
                  isInScale={!!displayValue}
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