import { Box, styled } from '@mui/material';
import { Marker } from '../marker';

const FretMarkersContainer = styled(Box, {
    shouldForwardProp: prop => prop !== 'isDouble'
  })<{ isDouble?: boolean }>(({ isDouble }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    gap: isDouble ? 10 : 20,
    zIndex: 1,
    flexDirection: isDouble ? 'column' : 'row',
  }));
  
  interface FretMarkersProps {
    fret: number;
  }
  
  const FRET_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
  const DOUBLE_MARKERS = [12, 24];
  
  export const FretMarkers: React.FC<FretMarkersProps> = ({ fret }) => {
    if (!FRET_MARKERS.includes(fret)) return null;
    
    const isDouble = DOUBLE_MARKERS.includes(fret);
    
    return (
      <FretMarkersContainer isDouble={isDouble}>
        <Marker />
        {isDouble && <Marker />}
      </FretMarkersContainer>
    );
  }; 