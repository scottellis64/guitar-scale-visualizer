import { Box, styled } from '@mui/material';
import { GuitarTheme } from 'themes';
import { FretMarkers } from 'components';

const FretContainer = styled(Box, {
  shouldForwardProp: (prop) => !['isInScale', 'isArpeggio', 'isCagedPattern', 'isERelativePattern', 'showFretNumber', 'showMarkers'].includes(prop as string)
})<{
  isInScale?: boolean;
  isArpeggio?: boolean;
  isCagedPattern?: boolean;
  isERelativePattern?: boolean;
}>(({ theme, isInScale, isArpeggio, isCagedPattern, isERelativePattern }) => ({
  width: 60,
  borderRight: `2px solid ${(theme as GuitarTheme).fretboard.fret}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  '&:first-of-type': {
    borderRight: `4px solid ${(theme as GuitarTheme).fretboard.nut}`,
  },
  '.note': {
    width: 30,
    height: 30,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: 14,
    zIndex: 2,
    ...(isInScale && {
      background: isArpeggio 
        ? (theme as GuitarTheme).fretboard.noteArpeggio 
        : (theme as GuitarTheme).fretboard.noteScale,
      color: (theme as GuitarTheme).fretboard.noteText,
    }),
    ...(isCagedPattern && {
      border: `4px solid ${(theme as GuitarTheme).fretboard.cagedPattern}`,
    }),
    ...(isERelativePattern && {
      border: `4px solid ${(theme as GuitarTheme).fretboard.eRelativePattern}`,
    }),
  },
}));

interface FretProps {
  fret: number;
  isInScale: boolean;
  isArpeggio: boolean;
  isCagedPattern?: boolean;
  isERelativePattern?: boolean;
  displayValue: string;
  showFretNumber?: boolean;
  showMarkers?: boolean;
}

export const Fret: React.FC<FretProps> = ({
  fret,
  isInScale,
  isArpeggio,
  isCagedPattern = false,
  isERelativePattern = false,
  displayValue,
  showFretNumber,
  showMarkers
}) => (
  <FretContainer 
    isInScale={isInScale} 
    isArpeggio={isArpeggio}
    isCagedPattern={isCagedPattern}
    isERelativePattern={isERelativePattern}
  >
    <div className="note">{displayValue}</div>
    {showFretNumber && <FretNumber>{fret}</FretNumber>}
    {showMarkers && <FretMarkers fret={fret} />}
  </FretContainer>
);

const FretNumber = styled(Box)({
  position: 'absolute',
  top: -20,
  width: '100%',
  textAlign: 'center',
  fontSize: 12,
  color: '#666',
}); 