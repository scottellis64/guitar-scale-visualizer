import { Note, ScaleType, ArpeggioType, SCALES, ARPEGGIOS, ALL_NOTES } from 'types';

export const calculateScale = (rootNote: Note, scaleType: ScaleType): Note[] => {
  const rootIndex = ALL_NOTES.indexOf(rootNote);
  const intervals = SCALES[scaleType].intervals;
  
  return intervals.map((interval: number) => {
    const noteIndex = (rootIndex + interval) % 12;
    return ALL_NOTES[noteIndex];
  });
};

export const calculateArpeggio = (rootNote: Note, arpeggioType: ArpeggioType): Note[] => {
  const rootIndex = ALL_NOTES.indexOf(rootNote);
  const intervals = ARPEGGIOS[arpeggioType].intervals;
  
  return intervals.map((interval: number) => {
    const noteIndex = (rootIndex + interval) % 12;
    return ALL_NOTES[noteIndex];
  });
};

export const isNoteInScale = (note: Note, scale: Note[]): boolean => {
  return scale.includes(note);
};

export const getNashvilleNumber = (
  note: Note, 
  rootNote: Note, 
  type: ScaleType | ArpeggioType, 
  isArpeggio: boolean
): string => {
  const collection = isArpeggio ? calculateArpeggio(rootNote, type as ArpeggioType) : calculateScale(rootNote, type as ScaleType);
  const noteIndex = collection.indexOf(note);
  if (noteIndex === -1) return '';
  
  const definition = isArpeggio ? ARPEGGIOS[type as ArpeggioType] : SCALES[type as ScaleType];
  return definition.nashvilleNumbers[noteIndex];
}; 