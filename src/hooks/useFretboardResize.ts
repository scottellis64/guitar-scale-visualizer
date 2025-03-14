import { RefObject, useCallback, useEffect, useState, useRef } from 'react';
import { debounce } from 'lodash';
import { useFretboardDispatch } from 'hooks';

interface UseFretboardResizeProps {
    fretboardId: string;
}

interface UseFretboardResizeReturn {
    fretWidths: number[];
    fretboardLength: number;
    neckRef: RefObject<HTMLDivElement>;
}

export const useFretboardResize = ({ fretboardId }: UseFretboardResizeProps): UseFretboardResizeReturn => {
    const [actualLength, setActualLength] = useState<number>(800);
    const [fretWidths, setFretWidths] = useState<number[]>([]);
    const { frets, fretWidth } = useFretboardDispatch({ id: fretboardId });

    const neckRef = useRef<HTMLDivElement>(null);

    const debouncedMeasure = useCallback(
        debounce(() => {
            if (neckRef.current) {
                const width = neckRef.current.offsetWidth;
                if (width > 0) {
                    setActualLength(width);
                }
            }
        }, 250),
        [neckRef]
    );

    useEffect(() => {
       debouncedMeasure();
        window.addEventListener('resize', debouncedMeasure);
        return () => {
            window.removeEventListener('resize', debouncedMeasure);
            debouncedMeasure.cancel();
        };
    }, [debouncedMeasure]);

    useEffect(() => {
        const availableLength = actualLength;
        const fretDistances = Array.from({ length: frets }, (_, fretIndex) => 
            availableLength - (availableLength / Math.pow(2, (fretIndex + 1) / 12))
        );
    
        const totalWidth = fretDistances[frets - 1] + fretWidth * (frets - 1);
        const fretWidthPadding = (availableLength - totalWidth) / frets;
    
        const newFretWidths = Array.from({ length: frets }, (_, fretIndex) => {   
            const width = fretIndex === 0 
                ? fretDistances[fretIndex] 
                : fretDistances[fretIndex] - fretDistances[fretIndex - 1]
            return width + fretWidthPadding;
        });

        setFretWidths(() => newFretWidths);
    }, [frets, fretWidth, actualLength]);    

    return {
        fretWidths,
        fretboardLength: actualLength,
        neckRef
    };
}