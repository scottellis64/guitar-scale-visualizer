import { Note, ScaleType, ArpeggioType, SCALES, ARPEGGIOS, ALL_NOTES } from 'types';

export const STRING_NOTES = ['E2', 'B', 'G', 'D', 'A', 'E1'];

export const calculateScale = (rootNote: Note, scaleType: ScaleType): Note[] => {
  if (! rootNote || ! scaleType) {
    return [];
  }

  const rootIndex = ALL_NOTES.indexOf(rootNote);
  const intervals = SCALES[scaleType].intervals;
  
  return intervals.map((interval: number) => {
    const noteIndex = (rootIndex + interval) % 12;
    return ALL_NOTES[noteIndex];
  });
};

export const getTriadNotes = (rootNote: Note, scaleType: ScaleType): Note[] => {
  const scale = calculateScale(rootNote, scaleType);
  return [scale[0], scale[2], scale[4]];
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

export const getNoteAtFret = (stringNote: Note, fret: number): Note => {
  const startIndex = ALL_NOTES.indexOf(stringNote);
  const noteIndex = (startIndex + fret) % 12;
  return ALL_NOTES[noteIndex];
};
