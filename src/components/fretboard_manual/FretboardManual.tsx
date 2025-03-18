import React, { useState, useEffect } from 'react';
import { Box, styled, IconButton, Typography, FormControl } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';

import { getNashvilleNumber, getNoteAtFret } from 'utils';
import { PearlIcon } from './icons/PearlIcon';
import { useFretboardDispatch, useFretboardResize } from 'hooks';
import { STANDARD_TUNING, Note, ScaleType, ERelativePattern } from 'types';
import { ERelativePatternSelect, NoteTooltip, RootNoteSelect, ScaleTypeSelect, NotationToggle } from 'components';

interface FretboardManualProps {
    id: string;
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
    minWidth: '667px',
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
    const fretMarkerRelativeIndex = (fretIndex - 1) % 12;
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

const Header = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #e0e0e0',
    marginBottom: '8px',
    borderRadius: '4px 4px 0 0',
});

const ConfigButton = styled(IconButton)({
    color: '#666',
    '&:hover': {
        color: '#000',
    },
});

const ConfigContainer = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    paddingTop: '4px',
    gap: '16px',
    flex: 1,
    marginRight: '16px',
});

const ConfigItem = styled(FormControl)({
    minWidth: '120px',
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

export function FretboardManual({ id, height = 150, fretWidth = 2, guitarNutWidth = 10 }: FretboardManualProps) {
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [isMeasuring, setIsMeasuring] = useState(true);
    const { 
        rootNote,
        scaleType,
        useNashville,
        getDisplayValue,
        isArpeggio,
        eRelativePattern,
        isInERelativePattern,
        handleRootNoteChange,
        handleScaleTypeChange,
        handleUseNashvilleChange,
        handleERelativePatternChange
    } = useFretboardDispatch({ id });

    const {
        fretWidths,
        neckRef
    } = useFretboardResize({ fretboardId: id });

    // Set measuring to false once we have fret widths
    useEffect(() => {
        if (fretWidths.length > 0) {
            setIsMeasuring(false);
        }
    }, [fretWidths]);

    const getScaleDisplay = () => {
        if (!rootNote || !scaleType) return 'No scale selected';
        const scaleName = scaleType.charAt(0).toUpperCase() + scaleType.slice(1);
        return `${rootNote} ${scaleName} Scale`;
    };

    const getPatternDisplay = () => {
        if (eRelativePattern) {
            return `E-Relative: ${eRelativePattern}`;
        }
        return null;
    };

    return (
        <Box 
            sx={{ 
                position: 'relative',
                width: '100%',
                visibility: isMeasuring ? 'hidden' : 'visible',
                '&::before': isMeasuring ? {
                    content: '""',
                    display: 'block',
                    width: '100%',
                    paddingTop: `${(height / 667) * 100}%`,
                } : {},
            }}
        >
            <Header>
                {isConfigOpen ? (
                    <ConfigContainer>
                        <ConfigItem size="small">
                            <RootNoteSelect 
                                value={rootNote}
                                onChange={handleRootNoteChange}
                            />
                        </ConfigItem>
                        <ConfigItem size="small">
                            <ScaleTypeSelect 
                                value={scaleType}
                                onChange={handleScaleTypeChange}
                            />
                        </ConfigItem>
                        <ConfigItem size="small">
                            <ERelativePatternSelect 
                                value={eRelativePattern}
                                onChange={handleERelativePatternChange}
                            />
                        </ConfigItem>
                        <ConfigItem size="small">
                            <NotationToggle 
                                value={useNashville}
                                onChange={handleUseNashvilleChange}
                            />
                        </ConfigItem>
                    </ConfigContainer>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {getScaleDisplay()}
                        </Typography>
                        {getPatternDisplay() && (
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {getPatternDisplay()}
                            </Typography>
                        )}
                    </Box>
                )}
                <ConfigButton
                    onClick={() => setIsConfigOpen(!isConfigOpen)}
                    size="small"
                    aria-label={isConfigOpen ? "close configuration" : "open configuration"}
                >
                    {isConfigOpen ? <CloseIcon /> : <SettingsIcon />}
                </ConfigButton>
            </Header>
            <FretboardBox height={height}>
                <OpenNotes fretboardId={id} />
                <GuitarNut width={guitarNutWidth} />
                <GuitarNeckBox ref={neckRef}>
                    {fretWidths.map((width, index) => (
                        <React.Fragment key={`fret-${index}`}>
                            <FretSection
                                fretboardId={id}
                                fretWidth={width}
                                fretIndex={index + 1}
                                notes={STANDARD_TUNING}
                                getDisplayValue={getDisplayValue}
                                getNoteAtFret={getNoteAtFret}
                                rootNote={rootNote}
                                scaleType={scaleType}
                                isArpeggio={isArpeggio}
                                useNashville={useNashville}
                                eRelativePattern={eRelativePattern}
                                isInERelativePattern={isInERelativePattern}
                            />
                            <FretContainerBox width={fretWidth} />
                        </React.Fragment>
                    ))}
                </GuitarNeckBox>
            </FretboardBox>
        </Box>
    );
}
