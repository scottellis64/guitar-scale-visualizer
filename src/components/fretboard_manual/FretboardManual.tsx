import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, styled } from '@mui/material';
import debounce from 'lodash/debounce';

import { STRING_NOTES } from 'utils';
import { PearlIcon } from './icons/PearlIcon';

interface FretboardManualProps {
    frets: number;
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

interface FretSectionProps {
    fretWidth: number;  
    fretIndex: number;
}

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
            <PearlIcon sx={{margin: "auto", opacity: "50%", fontSize: `${iconSize}px`}}/>
            { markerType === MarkerType.DOUBLE && <PearlIcon sx={{margin: "auto", opacity: "50%", fontSize: `${iconSize}px`}}/> }
        </FretMarkerBox>
    )
}

const FretSection: React.FC<FretSectionProps> = ({ fretWidth, fretIndex }) => {
    const markerType: MarkerType = getFretMarkerType(fretIndex);

    return (
        <FretboardSectionContainer width={fretWidth}>
            {Array.from({ length: 6 }, (_, index) => (
                <GuitarString key={`F${fretIndex+1}-S${STRING_NOTES[index]}`} stringIndex={index}/>
            ))}
            { markerType !== MarkerType.NONE && <FretMarker markerType={markerType} fretWidth={fretWidth} /> }
        </FretboardSectionContainer>
    );
};

const FretboardManual: React.FC<FretboardManualProps> = ({ 
    frets = 16, 
    height = 100, 
    fretWidth = 2,
    guitarNutWidth = 10 
}) => {
    const [actualLength, setActualLength] = useState<number>(800);
    const [fretWidths, setFretWidths] = useState<number[]>([]);

    const neckRef = useRef<HTMLDivElement>(null);

    const measureNeckLength = useCallback(() => {
        if (neckRef.current) {
            const width = neckRef.current.offsetWidth;
            if (width > 0) {
                setActualLength(width);
            }
        }
    }, []);

    const debouncedMeasure = useCallback(
        debounce(measureNeckLength, 250),
        [measureNeckLength]
    );

    useEffect(() => {
        measureNeckLength();

        window.addEventListener('resize', debouncedMeasure);
        
        return () => {
            window.removeEventListener('resize', debouncedMeasure);
            debouncedMeasure.cancel();
        };
    }, [debouncedMeasure, measureNeckLength]);

    useEffect(() => {
        const availableLength = actualLength;
        const fretDistances = Array.from({ length: frets }, (_, fretIndex) => 
            availableLength - (availableLength / Math.pow(2, (fretIndex + 1) / 12))
        );
    
        const totalWidth = fretDistances[frets - 1] + fretWidth * (frets - 1);
        const fretWidthPadding = (availableLength - totalWidth) / frets;
    
        // Array of widths for each fret section in pixels
        const newFretWidths = Array.from({ length: frets }, (_, fretIndex) => {   
            const width = fretIndex === 0 
                ? fretDistances[fretIndex] 
                : fretDistances[fretIndex] - fretDistances[fretIndex - 1]
            return width + fretWidthPadding;
        });

        setFretWidths(() => newFretWidths);
    }, [frets, fretWidth, actualLength]);

    return (
        <FretboardBox height={height}>
            <GuitarNut width={guitarNutWidth} />
            <GuitarNeckBox ref={neckRef}>
                {Array.from({ length: frets }, (_, fretIndex) => (
                    <React.Fragment key={`FRAG${fretIndex}`}>
                        <FretSection 
                            fretWidth={fretWidths[fretIndex]} 
                            fretIndex={fretIndex} 
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
    );
};

export default FretboardManual;
