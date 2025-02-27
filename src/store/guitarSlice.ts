import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Note, ScaleType, ArpeggioType, DisplayType } from 'types';

interface GuitarState {
  rootNote: Note;
  displayType: DisplayType;
  scaleType: ScaleType;
  arpeggioType: ArpeggioType;
  useNashville: boolean;
  isDarkMode: boolean;
}

const initialState: GuitarState = {
  rootNote: 'A',
  displayType: 'scale',
  scaleType: 'major',
  arpeggioType: 'major',
  useNashville: false,
  isDarkMode: false,
};

export const guitarSlice = createSlice({
  name: 'guitar',
  initialState,
  reducers: {
    setRootNote: (state, action: PayloadAction<Note>) => {
      state.rootNote = action.payload;
    },
    setDisplayType: (state, action: PayloadAction<DisplayType>) => {
      state.displayType = action.payload;
    },
    setScaleType: (state, action: PayloadAction<ScaleType>) => {
      state.scaleType = action.payload;
    },
    setArpeggioType: (state, action: PayloadAction<ArpeggioType>) => {
      state.arpeggioType = action.payload;
    },
    setUseNashville: (state, action: PayloadAction<boolean>) => {
      state.useNashville = action.payload;
    },
    setIsDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
  },
});

export const { 
  setRootNote, 
  setDisplayType, 
  setScaleType, 
  setArpeggioType, 
  setUseNashville,
  setIsDarkMode,
} = guitarSlice.actions; 