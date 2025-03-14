import React from 'react';
import { Box, styled, IconButton, Tooltip } from '@mui/material';

import { STANDARD_TUNING, Note } from 'types';
import { getNashvilleNumber, getNoteAtFret } from 'utils';
import { useFretboardDispatch } from 'hooks';

interface NoteButtonProps {
    isERelativePattern?: boolean;
}

const NoteButton = styled(IconButton, {
    shouldForwardProp: prop => prop !== 'isERelativePattern'
})<NoteButtonProps>(({ isERelativePattern }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '24px',
    height: '24px',
    backgroundColor: isERelativePattern ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    border: '1px solid #ccc',
    '&:hover': {
        backgroundColor: isERelativePattern ? 'rgba(76, 175, 80, 1)' : 'rgba(255, 255, 255, 1)',
    },
    zIndex: 3,
    padding: 0,
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#000',
}));

interface NoteTooltipProps {
    // Id of the fretboard that this tooltip is used with
    fretboardId: string;
    // 0-based string index from high to low e (eg, standard tuning, 0=e, 1=b, 2=g, 3=d, 4=a, 5=e)
    stringIndex: number;
    // 0-based fret index, 0=open position behind nut, 1=first fret of the board and onward to the right
    fretIndex: number;
}

export const NoteTooltip: React.FC<NoteTooltipProps> = ({ 
    fretboardId,
    stringIndex,
    fretIndex
}) => {
    const stringNote = STANDARD_TUNING[stringIndex] as Note;
    const note: Note = getNoteAtFret(stringNote, fretIndex);

    const { scaleType, rootNote, eRelativePattern, useNashville, isInERelativePattern } = useFretboardDispatch({ id: fretboardId });

    const shouldDisplayNotes = Boolean(rootNote && scaleType);
    const nashvilleNumber = shouldDisplayNotes ? getNashvilleNumber(note, rootNote, scaleType, false) : '';
    const isERelativePattern = eRelativePattern ? isInERelativePattern(stringIndex + 1, fretIndex) : false;

    return (
        <Tooltip 
            title={
                <Box sx={{ p: 1 }}>
                    <div>Note: {note}</div>
                    <div>String: {stringNote}</div>
                    <div>Nashville: {nashvilleNumber}</div>
                </Box>
            }
            arrow
        >
            <NoteButton size="small" isERelativePattern={isERelativePattern}>
                {useNashville ? nashvilleNumber : note}
            </NoteButton>
        </Tooltip>        
    );
};
