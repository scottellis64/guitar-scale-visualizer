import React from 'react';
import { Box, Paper } from '@mui/material';
import { DisplayTypeSelect, ERelativePatternSelect, Fretboard, RootNoteSelect, ScaleTypeSelect, ArpeggioTypeSelect, NotationToggle, CagedPatternSelect } from 'components';
import { useFretboardDispatch } from 'hooks';

interface FretboardInstanceProps {
  id: string;
}

export const FretboardInstance: React.FC<FretboardInstanceProps> = ({ id }) => {
  const { 
    rootNote,
    displayType,
    scaleType,
    useNashville,
    cagedPattern,
    eRelativePattern,
    handleRootNoteChange,
    handleDisplayTypeChange,
    handleScaleTypeChange,
    handleUseNashvilleChange,
    handleCagedPatternChange,
    handleERelativePatternChange
   } = useFretboardDispatch({ id });

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <RootNoteSelect 
            value={rootNote}
            onChange={handleRootNoteChange}
          />
          <DisplayTypeSelect 
            value={displayType}
            onChange={handleDisplayTypeChange}
          />
          <ScaleTypeSelect 
            value={scaleType}
            onChange={handleScaleTypeChange}
          />
          <NotationToggle 
            value={useNashville}
            onChange={handleUseNashvilleChange}
          />
          <CagedPatternSelect 
            value={cagedPattern}
            onChange={handleCagedPatternChange}
          />
          <ERelativePatternSelect 
            value={eRelativePattern}
            onChange={handleERelativePatternChange}
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Fretboard 
          id={id}
          rootNote={rootNote} 
          type={displayType === 'scale' ? scaleType : 'arpeggio'}
          frets={16} 
          useNashville={useNashville}
          isArpeggio={displayType === 'arpeggio'}
          cagedPattern={cagedPattern}
          eRelativePattern={eRelativePattern}
          showTriads={displayType === 'triad'}  
        />
      </Paper>
    </Box>
  );
};
