import React from 'react';
import { Box, Paper } from '@mui/material';
import { DisplayTypeSelect, ERelativePatternSelect, Fretboard, RootNoteSelect, ScaleTypeSelect, ArpeggioTypeSelect, NotationToggle, CagedPatternSelect } from 'components';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'store';
import { setRootNote, setDisplayType, setScaleType, setArpeggioType, setUseNashville, setCagedPattern, setERelativePattern } from 'store/guitar-slice';

interface FretboardInstanceProps {
  id: string;
}

export const FretboardInstance: React.FC<FretboardInstanceProps> = ({ id }) => {
  const dispatch = useDispatch();
  const instance = useSelector((state: RootState) => state.guitar.instances[id]);
  
  if (!instance) {
    return null;
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <RootNoteSelect 
            value={instance.rootNote}
            onChange={(note) => dispatch(setRootNote({ id, note }))}
          />
          <DisplayTypeSelect 
            value={instance.displayType}
            onChange={(type) => dispatch(setDisplayType({ id, type }))}
          />
          {instance.displayType === 'scale' ? (
            <ScaleTypeSelect 
              value={instance.scaleType}
              onChange={(type) => dispatch(setScaleType({ id, type }))}
            />
          ) : (
            <ArpeggioTypeSelect 
              value={instance.arpeggioType}
              onChange={(type) => dispatch(setArpeggioType({ id, type }))}
            />
          )}
          <NotationToggle 
            value={instance.useNashville}
            onChange={(useNashville) => dispatch(setUseNashville({ id, useNashville }))}
          />
          <CagedPatternSelect 
            value={instance.cagedPattern}
            onChange={(pattern) => dispatch(setCagedPattern({ id, pattern }))}
          />
          <ERelativePatternSelect 
            value={instance.eRelativePattern}
            onChange={(pattern) => dispatch(setERelativePattern({ id, pattern }))}
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Fretboard 
          rootNote={instance.rootNote} 
          type={instance.displayType === 'scale' ? instance.scaleType : instance.arpeggioType}
          frets={16} 
          useNashville={instance.useNashville}
          isArpeggio={instance.displayType === 'arpeggio'}
          cagedPattern={instance.cagedPattern}
          eRelativePattern={instance.eRelativePattern}
          showTriads={instance.displayType === 'triad'}  
        />
      </Paper>
    </Box>
  );
};
