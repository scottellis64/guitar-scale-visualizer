import React, { useState, useEffect } from 'react';
import { Box, styled, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useDispatch } from 'react-redux';

import { getNashvilleNumber, getNoteAtFret } from 'utils';
import { PearlIcon } from './icons/PearlIcon';
import { useFretboardDispatch, useFretboardResize } from 'hooks';
import { STANDARD_TUNING, Note, ScaleType, ERelativePattern } from 'types';
import { FretboardConfigPanel, NoteTooltip } from 'components';
import { addInstance, removeInstance } from 'store';

interface FretboardManualProps {
    id: string;
    frets?: number;
    height?: number;
    fretWidth?: number;
    guitarNutWidth?: number;
}

interface FretboardBoxProps {
    height: number;
}

const FretboardBox = styled(Box)<FretboardBoxProps>(({ height = 300 }) => ({
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: `${height}px`,
    width: "100%",
}));

const GuitarNut = styled(Box)<{ width: number }>(({ width = 10 }) => ({
    backgroundColor: "#B9C0C6",
    width: `${width}px`,
    height: "100%",
    position: "relative",
    zIndex: 2
}));

interface GuitarNeckBoxProps {
    width?: number;
}

const GuitarNeckBox = styled(Box)<GuitarNeckBoxProps>(({ width = 100 }) => ({
    display: 'flex',
    width: `${width}%`,
    minWidth: '500px',
    height: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3E4349"
}));

interface FretboardSectionContainerProps {
    width: number;
}

const FretboardSectionContainer = styled(Box)<FretboardSectionContainerProps>(({ width = 100 }) => ({
    display: 'flex',
    width: `${width}px`,
    zIndex: 1,
    height: "100%",
    flexDirection: "column",
    flexWrap: "wrap",
    justifyContent: "space-between",
    position: "relative"
}));

enum MarkerType {
    NONE = 0,
    SINGLE,
    DOUBLE
}

interface GuitarStringBoxProps {
    height: number;
}

const GuitarStringBox = styled(Box)<GuitarStringBoxProps>(({ height = 3 }) => ({
    marginTop: "3px",
    marginBottom: "3px",
    height: `${height}px`,
    width: "100%",
    backgroundColor: "#EDEDEE",
    zIndex: 2,
    position: "relative"
}));

interface GuitarStringProps {
    stringIndex: number;
}

const stringHeights = [1, 1.25, 1.5, 2, 2.5, 3];

const GuitarString: React.FC<GuitarStringProps> = ({ stringIndex }) => {
    return (
        <GuitarStringBox height={stringHeights[stringIndex]} />
    );
};

interface FretContainerBoxProps {
    width: number;
}

const FretContainerBox = styled(Box)<FretContainerBoxProps>(({ width = 100 }) => ({
    width: `${width}px`,
    height: "100%",
    zIndex: 1,
    backgroundColor: "#B9C0C6"
}));

const getFretMarkerType = (fretIndex: number): MarkerType => {
    const fretMarkerRelativeIndex = fretIndex % 12;
    if (fretMarkerRelativeIndex === 2 || fretMarkerRelativeIndex === 4 || fretMarkerRelativeIndex === 7) {
        return MarkerType.SINGLE;
    }

    if (fretMarkerRelativeIndex === 11) {
        return MarkerType.DOUBLE;
    }

    return MarkerType.NONE;
}

interface FretMarkerProps {
    markerType: MarkerType;
    fretWidth: number;
}

interface FretMarkerBoxProps {
}

const FretMarkerBox = styled(Box)<FretMarkerBoxProps>(({}) => ({
    width: "100%",
    height: "100%",
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
}));

const FretMarker: React.FC<FretMarkerProps> = ({markerType, fretWidth}) => {
    const iconSize = Math.min(fretWidth * 0.4, 24); // Scale with fret width but cap at 24px
    return (
        <FretMarkerBox>
            <PearlIcon sx={{margin: "auto", opacity: "30%", fontSize: `${iconSize}px`}}/>
            { markerType === MarkerType.DOUBLE && <PearlIcon sx={{margin: "auto", opacity: "30%", fontSize: `${iconSize}px`}}/> }
        </FretMarkerBox>
    )
}

interface FretSectionProps {
    fretboardId: string;
    fretWidth: number;  
    fretIndex: number;
    notes: Note[];
    getDisplayValue: (note: Note) => string;
    getNoteAtFret: (stringNote: Note, fret: number) => Note;
    rootNote: Note;
    scaleType: ScaleType;
    isArpeggio: boolean;
    isCagedPattern?: boolean;
    isInERelativePattern: (stringNum: number, fretNum: number) => boolean;
    eRelativePattern?: ERelativePattern;
    useNashville?: boolean;
}

const FretSection: React.FC<FretSectionProps> = ({ 
    fretboardId,
    fretWidth, 
    fretIndex, 
    getDisplayValue,
    getNoteAtFret,
    rootNote,
    scaleType,
    useNashville
}) => {
    const markerType: MarkerType = getFretMarkerType(fretIndex);
    const shouldDisplayNotes = Boolean(rootNote && scaleType);

    return (
        <FretboardSectionContainer width={fretWidth}>
            {Array.from({ length: 6 }, (_, index) => {
                const stringNote = STANDARD_TUNING[index] as Note;
                const note = getNoteAtFret(stringNote, fretIndex);
                const displayValue = shouldDisplayNotes ? (useNashville ? getNashvilleNumber(note, rootNote, scaleType, false) : getDisplayValue(note)) : '';

                return (
                    <Box key={`F${fretIndex}-S${stringNote}-${index}`} sx={{ position: 'relative' }}>
                        <GuitarString stringIndex={index}/>
                        {displayValue && (<NoteTooltip fretboardId={fretboardId} stringIndex={index} fretIndex={fretIndex} />)}
                    </Box>
                );
            })}
            { markerType !== MarkerType.NONE && <FretMarker markerType={markerType} fretWidth={fretWidth} /> }
        </FretboardSectionContainer>
    );
};

const ConfigButton = styled(IconButton)({
    position: 'absolute',
    top: '-40px',
    right: '8px',
    zIndex: 4,
    color: '#666',
    '&:hover': {
        color: '#000',
    },
});

const OpenNotesContainer = styled(Box)({
    position: 'relative',
    height: '100%',
    width: '30px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: "antiquewhite",
    zIndex: 3,
});

interface OpenNotesProps {
    fretboardId: string;
}

const OpenNotes: React.FC<OpenNotesProps> = ({ fretboardId }) => {
    const { 
        rootNote,
        scaleType,
        useNashville,
        getDisplayValue
    } = useFretboardDispatch({ id: fretboardId });
    
    const shouldDisplayNotes = Boolean(rootNote && scaleType);

    return (
        <OpenNotesContainer>
            {Array.from({ length: 6 }, (_, index) => {
                const stringNote = STANDARD_TUNING[index] as Note;
                const note = getNoteAtFret(stringNote, 0);
                const displayValue = shouldDisplayNotes ? (useNashville ? getNashvilleNumber(note, rootNote, scaleType, false) : getDisplayValue(note)) : '';

                return (
                    <Box 
                        key={`open-${index}`} 
                        sx={{ 
                            position: 'relative',
                            height: stringHeights[index] + 6, // Add 6px to account for the 3px margin top and bottom
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {displayValue && (<NoteTooltip fretboardId={fretboardId} stringIndex={index} fretIndex={0} />)}
                    </Box>
                );
            })}
        </OpenNotesContainer>
    );
};

const FretboardManual: React.FC<FretboardManualProps> = ({ 
    id,
    frets = 16, 
    height = 100, 
    fretWidth = 2,
    guitarNutWidth = 10,
}) => {
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(addInstance(id));
        return () => {
            dispatch(removeInstance(id));
        };
    }, [id, dispatch]);

    const {
        rootNote,
        scaleType,
        useNashville,
        isArpeggio,
        eRelativePattern,
        notes,
        getDisplayValue,
        isInERelativePattern
    } = useFretboardDispatch({ id });

    const { fretWidths, neckRef } = useFretboardResize({ fretboardId: id });

    const handleConfigOpen = () => setIsConfigOpen(true);
    const handleConfigClose = () => setIsConfigOpen(false);

    return (
        <Box sx={{ position: 'relative' }}>
            <ConfigButton onClick={handleConfigOpen}>
                <SettingsIcon />
            </ConfigButton>
            <FretboardBox height={height}>
                <OpenNotes fretboardId={id} />

                <GuitarNut width={guitarNutWidth} />
                <GuitarNeckBox ref={neckRef}>
                    {Array.from({ length: frets }, (_, fretIndex) => (
                        <React.Fragment key={`FRAG${fretIndex}`}>
                            <FretSection 
                                fretboardId={id}
                                fretWidth={fretWidths[fretIndex]} 
                                fretIndex={fretIndex+1}
                                notes={notes}
                                getDisplayValue={getDisplayValue}
                                getNoteAtFret={getNoteAtFret}
                                rootNote={rootNote}
                                scaleType={scaleType}
                                eRelativePattern={eRelativePattern}
                                isInERelativePattern={isInERelativePattern}
                                isArpeggio={isArpeggio}
                                useNashville={useNashville}
                                key={`FRETSECTION${fretIndex+1}`}
                            />   
                            {fretIndex !== frets - 1 && (
                                <FretContainerBox 
                                    width={fretWidth} 
                                    key={`FRET${fretIndex+1}`} 
                                />
                            )}
                        </React.Fragment>
                    ))}
                </GuitarNeckBox>
            </FretboardBox>
            <FretboardConfigPanel
                id={id}
                open={isConfigOpen}
                onClose={handleConfigClose}
            />
        </Box>
    );
};

export default FretboardManual;
